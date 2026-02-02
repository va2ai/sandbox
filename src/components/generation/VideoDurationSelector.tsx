"use client";

import { cn } from "@/lib/utils";
import { useGenerationStore } from "@/lib/stores";
import { Slider } from "@/components/ui/slider";

interface VideoDurationSelectorProps {
  className?: string;
}

export function VideoDurationSelector({ className }: VideoDurationSelectorProps) {
  const { videoDuration, setVideoDuration, videoResolution, setVideoResolution } =
    useGenerationStore();

  const resolutionOptions = [
    { value: "480p" as const, label: "480p" },
    { value: "720p" as const, label: "720p" },
    { value: "1080p" as const, label: "1080p" },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Duration slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-400">Duration</label>
          <span className="text-sm font-medium text-white">{videoDuration}s</span>
        </div>
        <Slider
          value={[videoDuration]}
          onValueChange={([value]) => setVideoDuration(value)}
          min={1}
          max={15}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>1s</span>
          <span>15s</span>
        </div>
      </div>

      {/* Resolution selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-400">Resolution</label>
        <div className="flex gap-2">
          {resolutionOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setVideoResolution(option.value)}
              className={cn(
                "flex-1 py-2 px-4 rounded-xl border text-sm font-medium transition-all touch-target",
                videoResolution === option.value
                  ? "border-white bg-white/10 text-white"
                  : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
