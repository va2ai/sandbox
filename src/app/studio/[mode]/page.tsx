"use client";

import { useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PromptInput,
  AspectRatioSelector,
  ModelSelector,
  ImageCountSelector,
  VideoDurationSelector,
  GenerateButton,
  ResultGrid,
  ImageUploader,
  StylePresets,
  PromptHistory,
  PromptEnhancer,
} from "@/components/generation";
import {
  useGenerationStore,
  useSettingsStore,
  useQueueStore,
  usePromptHistoryStore,
  GenerationMode,
} from "@/lib/stores";

const modeLabels: Record<GenerationMode, string> = {
  t2i: "Text to Image",
  i2i: "Image to Image",
  t2v: "Text to Video",
  i2v: "Image to Video",
};

interface StudioPageProps {
  params: Promise<{ mode: string }>;
}

export default function StudioPage({ params }: StudioPageProps) {
  const { mode: modeParam } = use(params);
  const router = useRouter();
  const mode = modeParam as GenerationMode;

  const {
    prompt,
    model,
    aspectRatio,
    imageCount,
    videoDuration,
    videoResolution,
    sourceImage,
    sourceImageMimeType,
    stylePreset,
    isGenerating,
    error,
    setMode,
    setIsGenerating,
    setProgress,
    addResult,
    setError,
    clearResults,
    setStylePreset,
    getFullPrompt,
  } = useGenerationStore();

  const { xaiApiKey, geminiApiKey } = useSettingsStore();
  const { addItem: addQueueItem, updateItem: updateQueueItem } = useQueueStore();
  const { addPrompt: addPromptToHistory } = usePromptHistoryStore();

  // Validate mode
  useEffect(() => {
    if (!["t2i", "i2i", "t2v", "i2v"].includes(mode)) {
      router.replace("/");
      return;
    }
    // Keep source image if entering i2i/i2v (may be coming from gallery)
    const needsImage = mode === "i2i" || mode === "i2v";
    setMode(mode, needsImage);
    clearResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, router]);

  const isVideo = mode === "t2v" || mode === "i2v";
  const needsImage = mode === "i2i" || mode === "i2v";

  const handleGenerate = useCallback(async () => {
    const provider = model === "grok" ? "xai" : "gemini";
    const apiKey = provider === "xai" ? xaiApiKey : geminiApiKey;
    const fullPrompt = getFullPrompt();

    if (!apiKey || !prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      if (isVideo) {
        // Video generation with queue
        const queueId = addQueueItem({
          type: "video",
          prompt: fullPrompt,
          model,
          aspectRatio,
          duration: videoDuration,
          resolution: videoResolution,
          sourceImage: needsImage ? sourceImage || undefined : undefined,
        });

        const response = await fetch("/api/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey,
            prompt: fullPrompt,
            duration: videoDuration,
            aspectRatio,
            resolution: videoResolution,
            imageUrl: needsImage && sourceImage ? sourceImage : undefined,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Update queue item with request ID
        updateQueueItem(queueId, {
          requestId: data.requestId,
          status: "processing",
          startedAt: Date.now(),
        });

        // Start polling for video status
        pollVideoStatus(apiKey, data.requestId, queueId, fullPrompt);
      } else {
        // Image generation
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            apiKey,
            prompt: fullPrompt,
            model,
            aspectRatio,
            imageCount,
            sourceImage: needsImage ? sourceImage : undefined,
            sourceImageMimeType: needsImage ? sourceImageMimeType : undefined,
          }),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Add results
        for (const result of data.results) {
          const mediaUrl = result.url || result.base64;
          if (mediaUrl) {
            addResult({
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: "image",
              url: mediaUrl,
              prompt: fullPrompt,
              model,
              aspectRatio,
              createdAt: Date.now(),
              sourceImage: needsImage ? sourceImage || undefined : undefined,
            });
          }
        }

        // Save prompt to history
        addPromptToHistory({
          prompt,
          mode,
          model,
          stylePresetId: stylePreset?.id,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Generation failed";
      setError(message);
    } finally {
      if (!isVideo) {
        setIsGenerating(false);
      }
    }
  }, [
    model,
    xaiApiKey,
    geminiApiKey,
    prompt,
    aspectRatio,
    imageCount,
    videoDuration,
    videoResolution,
    sourceImage,
    sourceImageMimeType,
    isVideo,
    needsImage,
    setIsGenerating,
    setError,
    setProgress,
    addResult,
    addQueueItem,
    updateQueueItem,
    getFullPrompt,
    addPromptToHistory,
    stylePreset,
    mode,
  ]);

  const pollVideoStatus = async (
    apiKey: string,
    requestId: string,
    queueId: string,
    videoPrompt: string
  ) => {
    const poll = async () => {
      try {
        const response = await fetch(
          `/api/video?requestId=${requestId}`,
          {
            headers: { "x-api-key": apiKey },
          }
        );

        const data = await response.json();

        if (data.status === "completed" && data.videoUrl) {
          addResult({
            id: queueId,
            type: "video",
            url: data.videoUrl,
            prompt: videoPrompt,
            model,
            aspectRatio,
            createdAt: Date.now(),
          });
          updateQueueItem(queueId, {
            status: "completed",
            completedAt: Date.now(),
            resultUrl: data.videoUrl,
          });
          setIsGenerating(false);
          setProgress(100);
        } else if (data.status === "failed") {
          throw new Error(data.error || "Video generation failed");
        } else {
          // Still processing, continue polling
          setProgress((prev) => Math.min(prev + 5, 90));
          setTimeout(poll, 5000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Video polling failed";
        setError(message);
        updateQueueItem(queueId, {
          status: "failed",
          error: message,
        });
        setIsGenerating(false);
      }
    };

    poll();
  };

  return (
    <div className="min-h-screen pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header
        className="sticky top-0 z-40 bg-black/90 backdrop-blur-lg border-b border-white/10"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-3 h-14 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 -ml-2"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{modeLabels[mode]}</h1>
        </div>
      </header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6"
      >
        {/* Image uploader for I2I and I2V modes */}
        {needsImage && <ImageUploader />}

        {/* Prompt input with history and enhancer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-400">Prompt</label>
            <div className="flex items-center gap-2">
              <PromptEnhancer />
              <PromptHistory />
            </div>
          </div>
          <PromptInput
            placeholder={
              needsImage
                ? "Describe how to transform the image..."
                : isVideo
                ? "Describe the video you want to create..."
                : "Describe the image you want to create..."
            }
          />
        </div>

        {/* Model selector */}
        <ModelSelector />

        {/* Style presets (for image modes only) */}
        {!isVideo && (
          <StylePresets
            selectedPreset={stylePreset}
            onSelectPreset={setStylePreset}
            isEditing={needsImage}
          />
        )}

        {/* Aspect ratio selector */}
        <AspectRatioSelector mode={mode} />

        {/* Image count (for image modes) */}
        {!isVideo && <ImageCountSelector />}

        {/* Video settings (for video modes) */}
        {isVideo && <VideoDurationSelector />}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        {/* Generate button */}
        <GenerateButton onGenerate={handleGenerate} />

        {/* Results */}
        <ResultGrid />
      </motion.div>
    </div>
  );
}
