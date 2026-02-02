import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StylePreset } from "@/lib/constants/stylePresets";

export type GenerationMode = "t2i" | "i2i" | "t2v" | "i2v";
export type ModelProvider = "grok" | "gemini-flash" | "gemini-pro" | "gemini-imagen";

export interface GeneratedMedia {
  id: string;
  type: "image" | "video";
  url: string;
  base64?: string;
  prompt: string;
  revisedPrompt?: string;
  model: ModelProvider;
  aspectRatio: string;
  createdAt: number;
  sourceImage?: string;
}

interface GenerationState {
  // Current generation settings
  mode: GenerationMode;
  prompt: string;
  model: ModelProvider;
  aspectRatio: string;
  imageCount: number;
  videoDuration: number;
  videoResolution: "480p" | "720p" | "1080p";
  sourceImage: string | null;
  sourceImageMimeType: string | null;
  stylePreset: StylePreset | null;

  // Generation state
  isGenerating: boolean;
  progress: number;
  results: GeneratedMedia[];
  error: string | null;

  // Chat history for multi-turn editing
  chatHistory: Array<{
    role: "user" | "assistant";
    content: string;
    image?: string;
  }>;

  // Actions
  setMode: (mode: GenerationMode, keepSourceImage?: boolean) => void;
  setPrompt: (prompt: string) => void;
  setModel: (model: ModelProvider) => void;
  setAspectRatio: (ratio: string) => void;
  setImageCount: (count: number) => void;
  setVideoDuration: (duration: number) => void;
  setVideoResolution: (resolution: "480p" | "720p" | "1080p") => void;
  setSourceImage: (image: string | null, mimeType?: string) => void;
  setIsGenerating: (generating: boolean) => void;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  addResult: (result: GeneratedMedia) => void;
  setResults: (results: GeneratedMedia[]) => void;
  setError: (error: string | null) => void;
  addChatMessage: (message: { role: "user" | "assistant"; content: string; image?: string }) => void;
  clearChatHistory: () => void;
  setStylePreset: (preset: StylePreset | null) => void;
  getFullPrompt: () => string;
  reset: () => void;
  clearResults: () => void;
}

const initialState = {
  mode: "t2i" as GenerationMode,
  prompt: "",
  model: "grok" as ModelProvider,
  aspectRatio: "1:1",
  imageCount: 1,
  videoDuration: 5,
  videoResolution: "720p" as const,
  sourceImage: null,
  sourceImageMimeType: null,
  stylePreset: null as StylePreset | null,
  isGenerating: false,
  progress: 0,
  results: [] as GeneratedMedia[],
  error: null as string | null,
  chatHistory: [] as Array<{ role: "user" | "assistant"; content: string; image?: string }>,
};

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      ...initialState,

      setMode: (mode, keepSourceImage?: boolean) => set((state) => ({
        mode,
        sourceImage: keepSourceImage ? state.sourceImage : null,
        sourceImageMimeType: keepSourceImage ? state.sourceImageMimeType : null,
        chatHistory: [],
      })),
      setPrompt: (prompt) => set({ prompt }),
      setModel: (model) => set({ model }),
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
      setImageCount: (count) => set({ imageCount: Math.min(Math.max(1, count), 10) }),
      setVideoDuration: (duration) => set({ videoDuration: Math.min(Math.max(1, duration), 15) }),
      setVideoResolution: (resolution) => set({ videoResolution: resolution }),
      setSourceImage: (image, mimeType) =>
        set({ sourceImage: image, sourceImageMimeType: mimeType || null }),
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      setProgress: (progress) =>
        set((state) => ({
          progress: typeof progress === "function" ? progress(state.progress) : progress,
        })),
      addResult: (result) => set((state) => ({ results: [result, ...state.results] })),
      setResults: (results) => set({ results }),
      setError: (error) => set({ error }),
      addChatMessage: (message) =>
        set((state) => ({ chatHistory: [...state.chatHistory, message] })),
      clearChatHistory: () => set({ chatHistory: [] }),
      setStylePreset: (preset) => set({ stylePreset: preset }),
      getFullPrompt: () => {
        const state = useGenerationStore.getState();
        if (state.stylePreset && state.prompt) {
          return `${state.prompt}, ${state.stylePreset.keywords}`;
        }
        return state.prompt;
      },
      reset: () => set({ ...initialState }),
      clearResults: () => set({ results: [], error: null }),
    }),
    {
      name: "genstudio-generation",
      partialize: (state) => ({
        model: state.model,
        aspectRatio: state.aspectRatio,
        imageCount: state.imageCount,
        videoDuration: state.videoDuration,
        videoResolution: state.videoResolution,
      }),
    }
  )
);
