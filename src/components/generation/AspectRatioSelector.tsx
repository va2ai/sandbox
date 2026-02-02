"use client";

import { cn } from "@/lib/utils";
import { useGenerationStore, GenerationMode } from "@/lib/stores";

interface AspectRatioOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const imageAspectRatios: AspectRatioOption[] = [
  {
    value: "1:1",
    label: "Square",
    icon: <div className="w-4 h-4 border-2 border-current rounded-sm" />,
  },
  {
    value: "16:9",
    label: "Wide",
    icon: <div className="w-5 h-3 border-2 border-current rounded-sm" />,
  },
  {
    value: "9:16",
    label: "Portrait",
    icon: <div className="w-3 h-5 border-2 border-current rounded-sm" />,
  },
  {
    value: "4:3",
    label: "Standard",
    icon: <div className="w-4 h-3 border-2 border-current rounded-sm" />,
  },
  {
    value: "3:4",
    label: "Portrait",
    icon: <div className="w-3 h-4 border-2 border-current rounded-sm" />,
  },
];

const videoAspectRatios: AspectRatioOption[] = [
  {
    value: "16:9",
    label: "Wide",
    icon: <div className="w-5 h-3 border-2 border-current rounded-sm" />,
  },
  {
    value: "9:16",
    label: "Portrait",
    icon: <div className="w-3 h-5 border-2 border-current rounded-sm" />,
  },
  {
    value: "1:1",
    label: "Square",
    icon: <div className="w-4 h-4 border-2 border-current rounded-sm" />,
  },
];

interface AspectRatioSelectorProps {
  mode?: GenerationMode;
  className?: string;
}

export function AspectRatioSelector({ mode, className }: AspectRatioSelectorProps) {
  const { aspectRatio, setAspectRatio, mode: storeMode } = useGenerationStore();
  const currentMode = mode || storeMode;
  const isVideo = currentMode === "t2v" || currentMode === "i2v";
  const options = isVideo ? videoAspectRatios : imageAspectRatios;

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-zinc-400">Aspect Ratio</label>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setAspectRatio(option.value)}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 px-4 py-3 rounded-xl border transition-all min-w-[72px] touch-target",
              aspectRatio === option.value
                ? "border-white bg-white/10 text-white"
                : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            )}
          >
            {option.icon}
            <span className="text-xs font-medium">{option.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
