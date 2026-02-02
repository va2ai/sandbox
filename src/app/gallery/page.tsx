"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Trash2,
  Heart,
  Download,
  Filter,
  X,
  Play,
  Check,
  Wand2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Header } from "@/components/layout";
import { useGalleryStore, useGenerationStore } from "@/lib/stores";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

export default function GalleryPage() {
  const router = useRouter();
  const {
    items,
    selectedItems,
    filterType,
    filterModel,
    selectItem,
    deselectItem,
    clearSelection,
    removeItems,
    toggleFavorite,
    setFilterType,
    setFilterModel,
    getFilteredItems,
  } = useGalleryStore();
  const { setSourceImage, setMode } = useGenerationStore();

  const [isSelecting, setIsSelecting] = useState(false);
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);

  // Get the preview item from the store so it stays in sync
  const previewItem = previewItemId ? items.find((item) => item.id === previewItemId) ?? null : null;

  const handleEditImage = (url: string) => {
    setSourceImage(url, "image/png");
    setMode("i2i", true); // Keep the source image
    router.push("/studio/i2i");
  };

  const handleAnimateImage = (url: string) => {
    setSourceImage(url, "image/png");
    setMode("i2v", true); // Keep the source image
    router.push("/studio/i2v");
  };

  const filteredItems = getFilteredItems();
  const hasItems = items.length > 0;

  const handleToggleSelect = (id: string) => {
    if (selectedItems.includes(id)) {
      deselectItem(id);
    } else {
      selectItem(id);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      removeItems(selectedItems);
      setIsSelecting(false);
    }
  };

  const handleDownload = async (url: string, id: string, type: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `genstudio-${id}.${type === "video" ? "mp4" : "png"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header
        title="Gallery"
        actions={
          hasItems && (
            <div className="flex items-center gap-2">
              {isSelecting ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearSelection();
                      setIsSelecting(false);
                    }}
                  >
                    Cancel
                  </Button>
                  {selectedItems.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteSelected}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {selectedItems.length}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Filter className="w-5 h-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="bg-zinc-900">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-400">
                            Type
                          </label>
                          <div className="flex gap-2">
                            {(["all", "image", "video"] as const).map((type) => (
                              <Button
                                key={type}
                                variant={filterType === type ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterType(type)}
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-zinc-400">
                            Model
                          </label>
                          <div className="flex gap-2 flex-wrap">
                            {(
                              [
                                { value: "all", label: "All" },
                                { value: "grok", label: "Grok" },
                                { value: "gemini-flash", label: "Gemini Flash" },
                                { value: "gemini-pro", label: "Gemini Pro" },
                                { value: "gemini-imagen", label: "Imagen 4" },
                              ] as const
                            ).map((model) => (
                              <Button
                                key={model.value}
                                variant={filterModel === model.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilterModel(model.value)}
                              >
                                {model.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSelecting(true)}
                  >
                    Select
                  </Button>
                </>
              )}
            </div>
          )
        }
      />

      <div className="p-4">
        {!hasItems ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-zinc-600" />
            </div>
            <h2 className="text-lg font-semibold mb-1">No saved items</h2>
            <p className="text-sm text-zinc-500">
              Your saved creations will appear here
            </p>
          </motion.div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <p className="text-zinc-500">No items match your filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden bg-zinc-900 cursor-pointer group",
                    isSelecting &&
                      selectedItems.includes(item.id) &&
                      "ring-2 ring-white"
                  )}
                  onClick={() =>
                    isSelecting
                      ? handleToggleSelect(item.id)
                      : setPreviewItemId(item.id)
                  }
                >
                  {item.type === "video" ? (
                    <div className="relative w-full h-full">
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.url}
                      alt={item.prompt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  )}

                  {/* Selection indicator */}
                  {isSelecting && (
                    <div
                      className={cn(
                        "absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center",
                        selectedItems.includes(item.id)
                          ? "bg-white border-white"
                          : "border-white/50 bg-black/50"
                      )}
                    >
                      {selectedItems.includes(item.id) && (
                        <Check className="w-4 h-4 text-black" />
                      )}
                    </div>
                  )}

                  {/* Favorite indicator */}
                  {item.favorite && !isSelecting && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItemId(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          <VisuallyHidden.Root>
            <DialogTitle>Media Preview</DialogTitle>
          </VisuallyHidden.Root>
          {previewItem && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
                onClick={() => setPreviewItemId(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              {previewItem.type === "video" ? (
                <video
                  src={previewItem.url}
                  className="w-full max-h-[80vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative w-full aspect-square max-h-[80vh]">
                  <Image
                    src={previewItem.url}
                    alt={previewItem.prompt}
                    fill
                    className="object-contain"
                    sizes="95vw"
                  />
                </div>
              )}

              <div className="p-4 space-y-3">
                <p className="text-sm text-zinc-300 line-clamp-2">
                  {previewItem.prompt}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span>{previewItem.model}</span>
                  <span>-</span>
                  <span>{previewItem.aspectRatio}</span>
                  <span>-</span>
                  <span>
                    {new Date(previewItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => toggleFavorite(previewItem.id)}
                  >
                    <Heart
                      className={cn(
                        "w-4 h-4 mr-2",
                        previewItem.favorite && "fill-current text-red-500"
                      )}
                    />
                    {previewItem.favorite ? "Saved" : "Save"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() =>
                      handleDownload(
                        previewItem.url,
                        previewItem.id,
                        previewItem.type
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
                {/* Edit/Animate buttons */}
                {previewItem.type === "image" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-zinc-700"
                      onClick={() => {
                        handleEditImage(previewItem.url);
                        setPreviewItemId(null);
                      }}
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-zinc-700"
                      onClick={() => {
                        handleAnimateImage(previewItem.url);
                        setPreviewItemId(null);
                      }}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Animate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
