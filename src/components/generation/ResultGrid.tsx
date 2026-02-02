"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Download, Share2, Heart, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGenerationStore, useGalleryStore, GeneratedMedia } from "@/lib/stores";
import { cn } from "@/lib/utils";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

interface ResultGridProps {
  className?: string;
}

export function ResultGrid({ className }: ResultGridProps) {
  const { results } = useGenerationStore();
  const { addItem } = useGalleryStore();
  const [selectedMedia, setSelectedMedia] = useState<GeneratedMedia | null>(null);

  const handleSave = async (media: GeneratedMedia) => {
    addItem(media);
    // Trigger haptic feedback if supported
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleDownload = async (media: GeneratedMedia) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `genstudio-${media.id}.${media.type === "video" ? "mp4" : "png"}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const handleShare = async (media: GeneratedMedia) => {
    if (navigator.share) {
      try {
        const response = await fetch(media.url);
        const blob = await response.blob();
        const file = new File(
          [blob],
          `genstudio-${media.id}.${media.type === "video" ? "mp4" : "png"}`,
          { type: blob.type }
        );

        await navigator.share({
          files: [file],
          title: "GenStudio AI Creation",
          text: media.prompt,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log("Share cancelled or failed");
      }
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-400">Results</h3>
          <span className="text-xs text-zinc-600">{results.length} items</span>
        </div>

        <div
          className={cn(
            "grid gap-2",
            results.length === 1
              ? "grid-cols-1"
              : results.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          <AnimatePresence mode="popLayout">
            {results.map((media, index) => (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 cursor-pointer group"
                onClick={() => setSelectedMedia(media)}
              >
                {media.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-10 h-10 text-white" />
                    </div>
                  </div>
                ) : (
                  <Image
                    src={media.url}
                    alt={media.prompt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 bg-black/50 hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSave(media);
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(media);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(media);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Full-screen preview dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-0">
          <VisuallyHidden.Root>
            <DialogTitle>Media Preview</DialogTitle>
          </VisuallyHidden.Root>
          {selectedMedia && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
                onClick={() => setSelectedMedia(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.url}
                  className="w-full max-h-[85vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative w-full aspect-square max-h-[85vh]">
                  <Image
                    src={selectedMedia.url}
                    alt={selectedMedia.prompt}
                    fill
                    className="object-contain"
                    sizes="95vw"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                <p className="text-sm text-zinc-300 line-clamp-2 mb-3">
                  {selectedMedia.prompt}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleSave(selectedMedia)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => handleDownload(selectedMedia)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  {typeof navigator !== "undefined" && "share" in navigator && (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleShare(selectedMedia)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
