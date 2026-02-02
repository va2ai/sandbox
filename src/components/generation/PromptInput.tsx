"use client";

import { useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { useGenerationStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface PromptInputProps {
  placeholder?: string;
  className?: string;
}

export function PromptInput({
  placeholder = "Describe what you want to create...",
  className,
}: PromptInputProps) {
  const { prompt, setPrompt, isGenerating } = useGenerationStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Handle iOS keyboard
  useEffect(() => {
    const handleResize = () => {
      if (document.activeElement === textareaRef.current) {
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    };

    window.visualViewport?.addEventListener("resize", handleResize);
    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex items-start gap-2 bg-zinc-900 rounded-2xl border border-white/10 p-3 focus-within:border-white/20 transition-colors">
        <Sparkles className="w-5 h-5 text-zinc-500 mt-0.5 flex-shrink-0" />
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          disabled={isGenerating}
          className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 text-base placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
          rows={1}
        />
        {prompt && !isGenerating && (
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 -mr-1 text-zinc-500 hover:text-white"
            onClick={() => setPrompt("")}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Character count */}
      {prompt.length > 0 && (
        <div className="absolute -bottom-5 right-0 text-xs text-zinc-600">
          {prompt.length} / 2000
        </div>
      )}
    </div>
  );
}
