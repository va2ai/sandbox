"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  styleCategories,
  getPresetsByCategory,
  getCategoriesForMode,
  type StyleCategory,
  type StylePreset,
} from "@/lib/constants/stylePresets";
import {
  Camera,
  Film,
  Sparkles,
  Pencil,
  Palette,
  Box,
  X,
  ChevronDown,
  Wand2,
  SlidersHorizontal,
  Brush,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const categoryIcons: Record<StyleCategory, typeof Camera> = {
  // Generation categories
  photography: Camera,
  cinematic: Film,
  anime: Sparkles,
  illustration: Pencil,
  art: Palette,
  "3d": Box,
  // Editing categories
  transform: Wand2,
  enhance: SlidersHorizontal,
  artistic: Brush,
};

interface StylePresetsProps {
  selectedPreset: StylePreset | null;
  onSelectPreset: (preset: StylePreset | null) => void;
  isEditing?: boolean;
  className?: string;
}

export function StylePresets({
  selectedPreset,
  onSelectPreset,
  isEditing = false,
  className,
}: StylePresetsProps) {
  const presetMode = isEditing ? "editing" : "generation";
  const [isOpen, setIsOpen] = useState(false);
  const defaultCategory = isEditing ? "transform" : "photography";
  const [activeCategory, setActiveCategory] = useState<StyleCategory>(defaultCategory);

  // Get categories available for current mode
  const categories = getCategoriesForMode(presetMode);
  const currentCategoryPresets = getPresetsByCategory(activeCategory, presetMode);

  // Reset category when mode changes
  useEffect(() => {
    setActiveCategory(isEditing ? "transform" : "photography");
  }, [isEditing]);

  const handleSelectPreset = (preset: StylePreset) => {
    onSelectPreset(preset);
    setIsOpen(false);
  };

  const handleClearPreset = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectPreset(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-zinc-400">Style Preset</label>
      <div className="flex items-center gap-2">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex-1 flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                selectedPreset
                  ? "border-white bg-white/10"
                  : "border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-2">
                {selectedPreset ? (
                  <>
                    {(() => {
                      const Icon = categoryIcons[selectedPreset.category];
                      return <Icon className="w-4 h-4 text-zinc-400" />;
                    })()}
                    <span className="text-sm font-medium text-white">
                      {selectedPreset.name}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({styleCategories[selectedPreset.category].label})
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">None selected</span>
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-zinc-900 h-[70vh]">
          <SheetHeader>
            <SheetTitle>Choose a Style</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full pt-4">
            {/* Category Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
              {categories.map((category) => {
                const Icon = categoryIcons[category];
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors",
                      isActive
                        ? "bg-white text-black"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {styleCategories[category].label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Preset Grid */}
            <div className="flex-1 overflow-y-auto -mx-4 px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 gap-2 pb-4"
                >
                  {currentCategoryPresets.map((preset) => {
                    const isSelected = selectedPreset?.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={cn(
                          "flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left",
                          isSelected
                            ? "border-white bg-white/10"
                            : "border-white/10 hover:border-white/20 active:bg-white/5"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-medium",
                            isSelected ? "text-white" : "text-zinc-300"
                          )}
                        >
                          {preset.name}
                        </span>
                        <span className="text-xs text-zinc-500 line-clamp-2">
                          {preset.keywords.split(",").slice(0, 3).join(", ")}...
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Preview of selected preset keywords */}
            {selectedPreset && (
              <div className="pt-3 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">Style keywords:</p>
                <p className="text-xs text-zinc-400 line-clamp-2">
                  {selectedPreset.keywords}
                </p>
              </div>
            )}
          </div>
          </SheetContent>
        </Sheet>
        {selectedPreset && (
          <button
            onClick={handleClearPreset}
            className="p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            aria-label="Clear style preset"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>
    </div>
  );
}
