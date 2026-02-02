"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useGenerationStore, useSettingsStore } from "@/lib/stores";
import { Wand2, Check, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PromptEnhancerProps {
  className?: string;
}

export function PromptEnhancer({ className }: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const { prompt, setPrompt, isGenerating } = useGenerationStore();
  const { xaiApiKey, geminiApiKey } = useSettingsStore();

  const hasApiKey = xaiApiKey || geminiApiKey;
  const canEnhance = prompt.trim().length >= 3 && hasApiKey && !isGenerating;

  const handleEnhance = async () => {
    if (!canEnhance) return;

    setIsEnhancing(true);
    setError(null);
    setEnhancedPrompt(null);

    try {
      const provider = xaiApiKey ? "xai" : "gemini";
      const apiKey = xaiApiKey || geminiApiKey;

      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, provider, apiKey }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEnhancedPrompt(data.enhancedPrompt);
      setShowDialog(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enhance prompt");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleAccept = () => {
    if (enhancedPrompt) {
      setPrompt(enhancedPrompt);
    }
    setShowDialog(false);
    setEnhancedPrompt(null);
  };

  const handleReject = () => {
    setShowDialog(false);
    setEnhancedPrompt(null);
  };

  return (
    <>
      <button
        onClick={handleEnhance}
        disabled={!canEnhance || isEnhancing}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
          canEnhance && !isEnhancing
            ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30"
            : "bg-zinc-900 text-zinc-600 cursor-not-allowed",
          className
        )}
        title={
          !hasApiKey
            ? "Add API key in settings"
            : prompt.trim().length < 3
            ? "Enter at least 3 characters"
            : "Enhance prompt with AI"
        }
      >
        {isEnhancing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        <span>{isEnhancing ? "Enhancing..." : "Enhance"}</span>
      </button>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-50 p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-sm text-red-200"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="absolute top-2 right-2 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhancement preview dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Enhanced Prompt
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Original prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Original
              </label>
              <p className="text-sm text-zinc-400 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                {prompt}
              </p>
            </div>

            {/* Enhanced prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-purple-400 uppercase tracking-wider">
                Enhanced
              </label>
              <p className="text-sm text-zinc-200 p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
                {enhancedPrompt}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700"
                onClick={handleReject}
              >
                <X className="w-4 h-4 mr-2" />
                Keep Original
              </Button>
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={handleAccept}
              >
                <Check className="w-4 h-4 mr-2" />
                Use Enhanced
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
