import { NextRequest, NextResponse } from "next/server";
import { generateImage, editImage } from "@/lib/api/xai";
import { generateGeminiImage, editGeminiImage, type GeminiModel } from "@/lib/api/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      provider,
      apiKey,
      prompt,
      model,
      aspectRatio,
      imageCount,
      sourceImage,
      sourceImageMimeType,
    } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    let results: Array<{ url?: string; base64?: string }> = [];

    if (provider === "xai") {
      // xAI Grok generation
      if (sourceImage) {
        // Image-to-image editing
        const response = await editImage(apiKey, {
          prompt,
          image: sourceImage,
          n: imageCount || 1,
        });
        results = response.data.map((item) => ({
          url: item.url,
          base64: item.b64_json,
        }));
      } else {
        // Text-to-image generation
        const response = await generateImage(apiKey, {
          prompt,
          n: imageCount || 1,
          aspectRatio: aspectRatio || "1:1",
        });
        results = response.data.map((item) => ({
          url: item.url,
          base64: item.b64_json,
        }));
      }
    } else if (provider === "gemini") {
      // Gemini generation
      const geminiModel: GeminiModel =
        model === "gemini-imagen"
          ? "imagen-4.0-generate-001"
          : model === "gemini-pro"
            ? "gemini-3-pro-image-preview"
            : "gemini-2.5-flash-image";

      if (sourceImage) {
        // Image editing with Gemini
        const base64Data = sourceImage.includes(",")
          ? sourceImage.split(",")[1]
          : sourceImage;

        const response = await editGeminiImage(apiKey, {
          model: geminiModel,
          prompt,
          imageBase64: base64Data,
          mimeType: sourceImageMimeType || "image/png",
        });

        // Extract images from Gemini response
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              results.push({
                base64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              });
            }
          }
        }
      } else {
        // Text-to-image with Gemini
        const response = await generateGeminiImage(apiKey, {
          model: geminiModel,
          prompt,
          aspectRatio,
          numberOfImages: imageCount,
        });

        // Handle Imagen 3 response format
        if (response.images) {
          results = response.images.map((img) => ({
            base64: `data:${img.mimeType};base64,${img.bytesBase64Encoded}`,
          }));
        }
        // Handle Gemini Flash response format
        else if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              results.push({
                base64: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
              });
            }
          }
        }
      }
    } else {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
