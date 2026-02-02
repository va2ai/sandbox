"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePromptHistoryStore } from "@/lib/stores/usePromptHistoryStore";
import { useGenerationStore, GenerationMode } from "@/lib/stores";
import { History, X, Clock, Trash2, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PromptHistoryProps {
  className?: string;
}

export function PromptHistory({ className }: PromptHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const { history, removePrompt, clearHistory, searchPrompts, getPromptsByMode } =
    usePromptHistoryStore();
  const { mode, setPrompt } = useGenerationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter prompts by search query or mode
  const filteredPrompts = searchQuery
    ? searchPrompts(searchQuery)
    : getPromptsByMode(mode);

  const allPrompts = searchQuery ? searchPrompts(searchQuery) : history;

  const handleSelectPrompt = (prompt: string) => {
    setPrompt(prompt);
    setIsOpen(false);
    setSearchQuery("");
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Don't render anything before mount to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  const hasHistory = history.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors",
            hasHistory
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              : "bg-zinc-900 text-zinc-600 cursor-not-allowed",
            className
          )}
          disabled={!hasHistory}
        >
          <History className="w-4 h-4" />
          <span>History</span>
          {hasHistory && (
            <span className="text-xs text-zinc-500">({history.length})</span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="bg-zinc-900 h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Prompt History</span>
            {hasHistory && (
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-red-400"
                onClick={() => {
                  clearHistory();
                  setIsOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mode filter tabs */}
          {!searchQuery && (
            <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSearchQuery("")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
                  "bg-white text-black"
                )}
              >
                Current Mode ({filteredPrompts.length})
              </button>
              <button
                onClick={() => setSearchQuery(" ")} // Hack to show all
                className="px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              >
                All ({history.length})
              </button>
            </div>
          )}

          {/* Prompt list */}
          <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-2">
            <AnimatePresence mode="popLayout">
              {(searchQuery ? allPrompts : filteredPrompts).length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-zinc-500"
                >
                  {searchQuery
                    ? "No prompts match your search"
                    : `No prompts for ${mode.toUpperCase()} mode yet`}
                </motion.div>
              ) : (
                (searchQuery ? allPrompts : filteredPrompts).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative p-3 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <button
                      onClick={() => handleSelectPrompt(item.prompt)}
                      className="w-full text-left"
                    >
                      <p className="text-sm text-zinc-200 line-clamp-2 pr-8">
                        {item.prompt}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                        <span className="text-zinc-700">|</span>
                        <span className="uppercase">{item.mode}</span>
                        <span className="text-zinc-700">|</span>
                        <span>{item.model}</span>
                        {item.usageCount > 1 && (
                          <>
                            <span className="text-zinc-700">|</span>
                            <span>Used {item.usageCount}x</span>
                          </>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePrompt(item.id);
                      }}
                      className="absolute top-3 right-3 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-800 transition-all"
                    >
                      <X className="w-4 h-4 text-zinc-500 hover:text-red-400" />
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
