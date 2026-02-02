"use client";

import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/lib/stores";
import { Slider } from "@/components/ui/slider";

interface ImageCountSelectorProps {
  className?: string;
}

export function ImageCountSelector({ className }: ImageCountSelectorProps) {
  const { imageCount, setImageCount } = useGenerationStore();

  const maxImages = 10;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-400">
          Number of Images
        </label>
        <span className="text-sm font-medium text-white">{imageCount}</span>
      </div>
      <Slider
        value={[imageCount]}
        onValueChange={([value]) => setImageCount(value)}
        min={1}
        max={maxImages}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>1</span>
        <span>{maxImages}</span>
      </div>
    </div>
  );
}
