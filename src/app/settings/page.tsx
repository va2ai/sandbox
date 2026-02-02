"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Key,
  Trash2,
  ExternalLink,
  Palette,
  Bell,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout";
import { useSettingsStore } from "@/lib/stores";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    xaiApiKey,
    geminiApiKey,
    theme,
    autoSaveToGallery,
    hapticFeedback,
    setXaiApiKey,
    setGeminiApiKey,
    setTheme,
    setAutoSaveToGallery,
    setHapticFeedback,
    clearApiKeys,
  } = useSettingsStore();

  const [showXaiKey, setShowXaiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [tempXaiKey, setTempXaiKey] = useState(xaiApiKey);
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiApiKey);

  const handleSaveKeys = () => {
    setXaiApiKey(tempXaiKey);
    setGeminiApiKey(tempGeminiKey);
    // Trigger haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const hasChanges =
    tempXaiKey !== xaiApiKey || tempGeminiKey !== geminiApiKey;

  return (
    <div className="min-h-screen pb-24">
      <Header title="Settings" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 space-y-6"
      >
        {/* API Keys */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="w-4 h-4" />
              API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* xAI API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">xAI (Grok)</label>
                <a
                  href="https://x.ai/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showXaiKey ? "text" : "password"}
                  value={tempXaiKey}
                  onChange={(e) => setTempXaiKey(e.target.value)}
                  placeholder="xai-..."
                  className="pr-10 bg-black border-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowXaiKey(!showXaiKey)}
                >
                  {showXaiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {xaiApiKey && (
                <p className="text-xs text-green-500">Key configured</p>
              )}
            </div>

            {/* Gemini API Key */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Google Gemini</label>
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                >
                  Get API Key
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative">
                <Input
                  type={showGeminiKey ? "text" : "password"}
                  value={tempGeminiKey}
                  onChange={(e) => setTempGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10 bg-black border-white/10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {geminiApiKey && (
                <p className="text-xs text-green-500">Key configured</p>
              )}
            </div>

            {/* Save/Clear buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveKeys}
                disabled={!hasChanges}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Keys
              </Button>
              {(xaiApiKey || geminiApiKey) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    clearApiKeys();
                    setTempXaiKey("");
                    setTempGeminiKey("");
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <p className="text-xs text-zinc-500">
              API keys are stored locally in your browser and never sent to our
              servers.
            </p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="w-4 h-4" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Theme</label>
              <div className="flex gap-2">
                {(["dark", "light", "system"] as const).map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme(t)}
                    className="flex-1"
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card className="bg-zinc-900 border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto-save toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-save to Gallery</p>
                <p className="text-xs text-zinc-500">
                  Automatically save generated images
                </p>
              </div>
              <button
                onClick={() => setAutoSaveToGallery(!autoSaveToGallery)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors",
                  autoSaveToGallery ? "bg-white" : "bg-zinc-700"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-black transition-transform",
                    autoSaveToGallery ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>

            {/* Haptic feedback toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Haptic Feedback</p>
                <p className="text-xs text-zinc-500">
                  Vibration on button presses
                </p>
              </div>
              <button
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors",
                  hapticFeedback ? "bg-white" : "bg-zinc-700"
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full bg-black transition-transform",
                    hapticFeedback ? "translate-x-5" : "translate-x-0.5"
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="bg-zinc-900 border-white/10">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold">GenStudio AI</h3>
              <p className="text-xs text-zinc-500">Version 1.0.0</p>
              <p className="text-xs text-zinc-600">
                Powered by xAI Grok and Google Gemini
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
