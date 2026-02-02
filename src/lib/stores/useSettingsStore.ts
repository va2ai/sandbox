import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  // API Keys (stored in localStorage - user responsibility)
  xaiApiKey: string;
  geminiApiKey: string;

  // UI Preferences
  theme: "dark" | "light" | "system";
  defaultModel: "grok" | "gemini-flash" | "gemini-imagen";
  defaultAspectRatio: string;
  autoSaveToGallery: boolean;
  showPromptSuggestions: boolean;
  hapticFeedback: boolean;

  // Actions
  setXaiApiKey: (key: string) => void;
  setGeminiApiKey: (key: string) => void;
  setTheme: (theme: SettingsState["theme"]) => void;
  setDefaultModel: (model: SettingsState["defaultModel"]) => void;
  setDefaultAspectRatio: (ratio: string) => void;
  setAutoSaveToGallery: (enabled: boolean) => void;
  setShowPromptSuggestions: (enabled: boolean) => void;
  setHapticFeedback: (enabled: boolean) => void;
  clearApiKeys: () => void;
  hasApiKey: (provider: "xai" | "gemini") => boolean;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // API Keys
      xaiApiKey: "",
      geminiApiKey: "",

      // UI Preferences
      theme: "dark",
      defaultModel: "grok",
      defaultAspectRatio: "1:1",
      autoSaveToGallery: true,
      showPromptSuggestions: true,
      hapticFeedback: true,

      // Actions
      setXaiApiKey: (key) => set({ xaiApiKey: key }),
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setTheme: (theme) => set({ theme }),
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultAspectRatio: (ratio) => set({ defaultAspectRatio: ratio }),
      setAutoSaveToGallery: (enabled) => set({ autoSaveToGallery: enabled }),
      setShowPromptSuggestions: (enabled) => set({ showPromptSuggestions: enabled }),
      setHapticFeedback: (enabled) => set({ hapticFeedback: enabled }),
      clearApiKeys: () => set({ xaiApiKey: "", geminiApiKey: "" }),
      hasApiKey: (provider) => {
        const state = get();
        return provider === "xai" ? !!state.xaiApiKey : !!state.geminiApiKey;
      },
    }),
    {
      name: "genstudio-settings",
      partialize: (state) => ({
        xaiApiKey: state.xaiApiKey,
        geminiApiKey: state.geminiApiKey,
        theme: state.theme,
        defaultModel: state.defaultModel,
        defaultAspectRatio: state.defaultAspectRatio,
        autoSaveToGallery: state.autoSaveToGallery,
        showPromptSuggestions: state.showPromptSuggestions,
        hapticFeedback: state.hapticFeedback,
      }),
    }
  )
);
