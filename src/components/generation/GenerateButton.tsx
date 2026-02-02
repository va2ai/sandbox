"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerationStore, useSettingsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onGenerate: () => void;
  className?: string;
}

export function GenerateButton({ onGenerate, className }: GenerateButtonProps) {
  const { prompt, isGenerating, progress, model, mode } = useGenerationStore();
  const { hasApiKey } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const provider = model === "grok" ? "xai" : "gemini";
  // Before mount, assume key exists to match SSR
  const hasKey = mounted ? hasApiKey(provider) : true;
  const canGenerate = prompt.trim().length > 0 && hasKey && !isGenerating;

  const isVideo = mode === "t2v" || mode === "i2v";

  return (
    <motion.div
      className={cn("relative", className)}
      whileTap={canGenerate ? { scale: 0.98 } : undefined}
    >
      <Button
        onClick={onGenerate}
        disabled={!canGenerate}
        className={cn(
          "w-full h-14 text-base font-semibold rounded-2xl transition-all",
          canGenerate
            ? "bg-white text-black hover:bg-zinc-200"
            : "bg-zinc-800 text-zinc-500"
        )}
      >
        {isGenerating ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {isVideo
                ? `Processing${progress > 0 ? ` ${progress}%` : "..."}`
                : "Generating..."}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Generate</span>
          </div>
        )}
      </Button>

      {/* Progress bar for video generation */}
      {isGenerating && isVideo && progress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800 rounded-b-2xl overflow-hidden">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* No API key warning - only show after mount */}
      {mounted && !hasKey && prompt.trim().length > 0 && (
        <p className="absolute -bottom-6 left-0 right-0 text-center text-xs text-zinc-500">
          Add your {provider === "xai" ? "xAI" : "Gemini"} API key in Settings
        </p>
      )}
    </motion.div>
  );
}
