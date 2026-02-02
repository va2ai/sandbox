import { NextRequest, NextResponse } from "next/server";
import { startVideoGeneration, getVideoStatus } from "@/lib/api/xai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, prompt, duration, aspectRatio, resolution, imageUrl } = body;

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

    const response = await startVideoGeneration(apiKey, {
      prompt,
      duration: duration || 5,
      aspectRatio: aspectRatio || "16:9",
      resolution: resolution || "720p",
      imageUrl,
    });

    return NextResponse.json({
      requestId: response.request_id,
      status: "pending",
    });
  } catch (error) {
    console.error("Video generation error:", error);
    const message = error instanceof Error ? error.message : "Video generation failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const apiKey = request.headers.get("x-api-key");

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    const response = await getVideoStatus(apiKey, requestId);

    return NextResponse.json({
      requestId: response.request_id,
      status: response.status,
      videoUrl: response.video_url,
      error: response.error,
    });
  } catch (error) {
    console.error("Video status error:", error);
    const message = error instanceof Error ? error.message : "Failed to get video status";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
