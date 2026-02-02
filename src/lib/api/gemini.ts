const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

// Updated model names for Gemini image generation (January 2026)
export type GeminiModel = "gemini-2.5-flash-image" | "gemini-3-pro-image-preview" | "imagen-4.0-generate-001";

export interface GeminiImageGenerationParams {
  model: GeminiModel;
  prompt: string;
  aspectRatio?: string;
  numberOfImages?: number;
  negativePrompt?: string;
  personGeneration?: "dont_allow" | "allow_adult" | "allow_all";
}

export interface GeminiChatParams {
  model: GeminiModel;
  messages: Array<{
    role: "user" | "model";
    parts: Array<{
      text?: string;
      inlineData?: {
        mimeType: string;
        data: string;
      };
    }>;
  }>;
}

export interface GeminiImageResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
  images?: Array<{
    bytesBase64Encoded: string;
    mimeType: string;
  }>;
  predictions?: Array<{
    bytesBase64Encoded: string;
    mimeType?: string;
  }>;
  error?: {
    message: string;
    code: number;
  };
}

// Generate images using Gemini 2.0 Flash (native image generation)
export async function generateGeminiImage(
  apiKey: string,
  params: GeminiImageGenerationParams
): Promise<GeminiImageResponse> {
  const isImagen = params.model.startsWith("imagen-");
  const endpoint = isImagen
    ? `${GEMINI_BASE_URL}/models/${params.model}:predict`
    : `${GEMINI_BASE_URL}/models/${params.model}:generateContent`;

  // Imagen 4.0 uses a different API format
  if (isImagen) {
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: params.prompt }],
        parameters: {
          sampleCount: params.numberOfImages || 1,
          aspectRatio: params.aspectRatio || "1:1",
          negativePrompt: params.negativePrompt,
          personGeneration: params.personGeneration || "allow_adult",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    // Transform Imagen response to match our interface
    return {
      predictions: data.predictions,
      images: data.predictions?.map((p: { bytesBase64Encoded: string; mimeType: string }) => ({
        bytesBase64Encoded: p.bytesBase64Encoded,
        mimeType: p.mimeType || "image/png",
      })),
    };
  }

  // Gemini 2.0 Flash native image generation
  const response = await fetch(`${endpoint}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: params.prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Multi-turn chat with image editing capabilities
export async function chatWithGemini(
  apiKey: string,
  params: GeminiChatParams
): Promise<GeminiImageResponse> {
  const response = await fetch(
    `${GEMINI_BASE_URL}/models/${params.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: params.messages,
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Edit an existing image using Gemini's multi-turn capabilities
export async function editGeminiImage(
  apiKey: string,
  params: {
    model: GeminiModel;
    prompt: string;
    imageBase64: string;
    mimeType: string;
  }
): Promise<GeminiImageResponse> {
  return chatWithGemini(apiKey, {
    model: params.model,
    messages: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: params.mimeType,
              data: params.imageBase64,
            },
          },
          { text: params.prompt },
        ],
      },
    ],
  });
}
