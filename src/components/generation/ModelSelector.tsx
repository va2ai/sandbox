"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useGenerationStore, useSettingsStore, ModelProvider } from "@/lib/stores";
import { Lock } from "lucide-react";

interface ModelOption {
  value: ModelProvider;
  label: string;
  description: string;
  provider: "xai" | "gemini";
  supportsVideo?: boolean;
}

const models: ModelOption[] = [
  {
    value: "grok",
    label: "Grok",
    description: "Image & video",
    provider: "xai",
    supportsVideo: true,
  },
  {
    value: "gemini-flash",
    label: "Gemini Flash",
    description: "Fast image gen",
    provider: "gemini",
  },
  {
    value: "gemini-pro",
    label: "Gemini 3 Pro",
    description: "Highest quality",
    provider: "gemini",
  },
  {
    value: "gemini-imagen",
    label: "Imagen 4",
    description: "Google Imagen",
    provider: "gemini",
  },
];

interface ModelSelectorProps {
  className?: string;
}

export function ModelSelector({ className }: ModelSelectorProps) {
  const { model, setModel, mode } = useGenerationStore();
  const { hasApiKey } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  const isVideo = mode === "t2v" || mode === "i2v";

  // Filter models based on mode
  const availableModels = isVideo
    ? models.filter((m) => m.supportsVideo)
    : models;

  // Avoid hydration mismatch by only checking localStorage after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select Grok if current model doesn't support video
  useEffect(() => {
    if (isVideo && model !== "grok") {
      setModel("grok");
    }
  }, [isVideo, model, setModel]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-zinc-400">Model</label>
      <div className={cn(
        "grid gap-2",
        availableModels.length === 1 ? "grid-cols-1" : "grid-cols-2"
      )}>
        {availableModels.map((option) => {
          // Before mount, assume all keys are available to match SSR
          const hasKey = mounted ? hasApiKey(option.provider) : true;

          return (
            <button
              key={option.value}
              onClick={() => hasKey && setModel(option.value)}
              disabled={!hasKey}
              className={cn(
                "relative flex flex-col items-start gap-0.5 p-3 rounded-xl border transition-all text-left touch-target",
                model === option.value
                  ? "border-white bg-white/10"
                  : hasKey
                  ? "border-white/10 hover:border-white/20"
                  : "border-white/5 opacity-50 cursor-not-allowed"
              )}
            >
              {mounted && !hasKey && (
                <Lock className="absolute top-2 right-2 w-3 h-3 text-zinc-600" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  model === option.value ? "text-white" : "text-zinc-300"
                )}
              >
                {option.label}
              </span>
              <span className="text-xs text-zinc-500 line-clamp-1">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
