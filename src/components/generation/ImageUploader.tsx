"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGenerationStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  className?: string;
}

export function ImageUploader({ className }: ImageUploaderProps) {
  const { sourceImage, setSourceImage, isGenerating } = useGenerationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be less than 10MB");
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSourceImage(base64, file.type);
      };
      reader.readAsDataURL(file);

      // Reset input
      e.target.value = "";
    },
    [setSourceImage]
  );

  const handleRemove = useCallback(() => {
    setSourceImage(null);
  }, [setSourceImage]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-zinc-400">Source Image</label>

      <AnimatePresence mode="wait">
        {sourceImage ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sourceImage}
              alt="Source"
              className="w-full h-full object-contain"
            />
            {!isGenerating && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 gap-2"
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isGenerating}
              className={cn(
                "flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all touch-target",
                isGenerating
                  ? "border-zinc-800 text-zinc-700"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 active:bg-zinc-900"
              )}
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm font-medium">Upload</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              disabled={isGenerating}
              className={cn(
                "flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all touch-target",
                isGenerating
                  ? "border-zinc-800 text-zinc-700"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 active:bg-zinc-900"
              )}
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm font-medium">Camera</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
