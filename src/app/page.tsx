"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Image, Film, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/lib/stores";

const modes = [
  {
    id: "t2i",
    label: "Text to Image",
    description: "Generate images from text prompts",
    icon: Image,
    href: "/studio/t2i",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "i2i",
    label: "Image to Image",
    description: "Edit and transform existing images",
    icon: Wand2,
    href: "/studio/i2i",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "t2v",
    label: "Text to Video",
    description: "Create videos from text prompts",
    icon: Film,
    href: "/studio/t2v",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    id: "i2v",
    label: "Image to Video",
    description: "Animate images with motion",
    icon: Sparkles,
    href: "/studio/i2v",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { xaiApiKey, geminiApiKey } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only check API keys after mount to avoid hydration mismatch
  const hasApiKey = mounted ? (xaiApiKey || geminiApiKey) : true;

  return (
    <div className="min-h-screen p-4 pt-safe">
      {/* Header */}
      <header className="pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">GenStudio AI</h1>
            <p className="text-sm text-zinc-500">Create with AI</p>
          </div>
        </motion.div>
      </header>

      {/* API Key Warning - only show after mount */}
      {mounted && !hasApiKey && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <p className="text-sm text-amber-200">
            Add your API keys in Settings to start generating
          </p>
          <Button
            variant="link"
            className="p-0 h-auto mt-1 text-amber-400"
            onClick={() => router.push("/settings")}
          >
            Go to Settings
          </Button>
        </motion.div>
      )}

      {/* Mode Selection */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-zinc-400 px-1">
          Choose a mode
        </h2>
        <div className="grid gap-3">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(mode.href)}
                className="relative overflow-hidden flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-zinc-900/50 text-left transition-all active:scale-[0.98] hover:border-white/20"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${mode.color} opacity-0 hover:opacity-100 transition-opacity`}
                />
                <div className="relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="relative z-10 flex-1">
                  <h3 className="font-semibold">{mode.label}</h3>
                  <p className="text-sm text-zinc-500">{mode.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Quick Tips */}
      <section className="mt-8 space-y-3">
        <h2 className="text-sm font-medium text-zinc-400 px-1">Tips</h2>
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-white/5">
          <ul className="text-sm text-zinc-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-white">1.</span>
              <span>Be specific in your prompts for better results</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white">2.</span>
              <span>Use aspect ratios that match your intended use</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-white">3.</span>
              <span>Save your favorites to the gallery for easy access</span>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
