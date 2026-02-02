const XAI_BASE_URL = "https://api.x.ai/v1";

export interface XAIImageGenerationParams {
  prompt: string;
  n?: number;
  aspectRatio?: string;
  responseFormat?: "url" | "b64_json";
}

export interface XAIImageResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
  created: number;
}

export interface XAIVideoGenerationParams {
  prompt: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  imageUrl?: string;
}

export interface XAIVideoResponse {
  request_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  video_url?: string;
  error?: string;
}

export async function generateImage(
  apiKey: string,
  params: XAIImageGenerationParams
): Promise<XAIImageResponse> {
  const response = await fetch(`${XAI_BASE_URL}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-image",
      prompt: params.prompt,
      n: params.n || 1,
      aspect_ratio: params.aspectRatio || "1:1",
      response_format: params.responseFormat || "url",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

// Response API interface for image understanding
export interface XAIResponsesAPIResponse {
  id: string;
  output: Array<{
    type: string;
    content: Array<{
      type: string;
      text?: string;
    }>;
  }>;
}

// Edit image using the Responses API with image understanding
export async function editImage(
  apiKey: string,
  params: {
    prompt: string;
    image: string; // base64 data URL or URL
    n?: number;
    mimeType?: string;
  }
): Promise<XAIImageResponse> {
  // Determine if image is base64 or URL
  const isBase64 = params.image.startsWith("data:");

  // Build content array with image and text
  const content: Array<Record<string, unknown>> = [
    {
      type: "input_image",
      image_url: isBase64 ? params.image : params.image,
      detail: "high",
    },
    {
      type: "input_text",
      text: params.prompt,
    },
  ];

  // Use Responses API for image understanding
  // Note: store: false is recommended when sending images
  const response = await fetch(`${XAI_BASE_URL}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-vision",
      store: false, // Don't store when sending images
      input: [
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  const data: XAIResponsesAPIResponse = await response.json();

  // Transform Responses API response to match XAIImageResponse format
  // Extract text response and use it to generate image
  const textContent = data.output?.[0]?.content?.find(c => c.type === "text")?.text;

  // After getting the response, generate the edited image
  // For now, use the traditional image generation with the enhanced prompt
  if (textContent) {
    return generateImage(apiKey, {
      prompt: `${params.prompt}. ${textContent}`,
      n: params.n || 1,
    });
  }

  // Fallback to traditional image edit endpoint
  const editResponse = await fetch(`${XAI_BASE_URL}/images/edits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-2-image",
      prompt: params.prompt,
      image: params.image,
      n: params.n || 1,
    }),
  });

  if (!editResponse.ok) {
    const error = await editResponse.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${editResponse.status}`);
  }

  return editResponse.json();
}

export async function startVideoGeneration(
  apiKey: string,
  params: XAIVideoGenerationParams
): Promise<{ request_id: string }> {
  const body: Record<string, unknown> = {
    prompt: params.prompt,
    duration: params.duration,
    aspect_ratio: params.aspectRatio,
    resolution: params.resolution,
  };

  if (params.imageUrl) {
    body.image = { url: params.imageUrl };
  }

  const response = await fetch(`${XAI_BASE_URL}/videos/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}

export async function getVideoStatus(
  apiKey: string,
  requestId: string
): Promise<XAIVideoResponse> {
  const response = await fetch(`${XAI_BASE_URL}/videos/${requestId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${response.status}`);
  }

  return response.json();
}
