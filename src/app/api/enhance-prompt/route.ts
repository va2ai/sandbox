import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert AI image generation prompt engineer. Your task is to enhance user prompts to produce better, more detailed results.

Guidelines:
1. Expand vague descriptions into specific, vivid details
2. Add relevant artistic style keywords (lighting, composition, atmosphere)
3. Include technical quality terms (8K, detailed, professional)
4. Maintain the user's original intent and core concept
5. Keep the enhanced prompt concise but comprehensive (under 200 words)
6. Don't add negative prompts or instructions - just the positive description
7. Don't use markdown or formatting - just plain text

Example:
Original: "a cat sitting on a window"
Enhanced: "A fluffy orange tabby cat sitting gracefully on a sun-drenched windowsill, soft afternoon light streaming through sheer curtains, creating warm golden highlights on its fur, cozy interior setting with potted plants visible, shallow depth of field, professional photography, 8K resolution"`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, apiKey } = await request.json();

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

    let enhancedPrompt: string;

    if (provider === "xai") {
      // Use xAI Grok for enhancement
      const response = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `Enhance this image generation prompt:\n\n"${prompt}"`,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || "Failed to enhance prompt");
      }

      const data = await response.json();
      enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || prompt;
    } else {
      // Use Gemini for enhancement
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${SYSTEM_PROMPT}\n\nEnhance this image generation prompt:\n\n"${prompt}"`,
                  },
                ],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || "Failed to enhance prompt");
      }

      const data = await response.json();
      enhancedPrompt =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || prompt;
    }

    // Clean up the response - remove any quotes or prefixes
    enhancedPrompt = enhancedPrompt
      .replace(/^["']|["']$/g, "")
      .replace(/^Enhanced prompt:\s*/i, "")
      .replace(/^Here's the enhanced prompt:\s*/i, "")
      .trim();

    return NextResponse.json({ enhancedPrompt });
  } catch (error) {
    console.error("Prompt enhancement error:", error);
    const message =
      error instanceof Error ? error.message : "Enhancement failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
