import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelProvider, GenerationMode } from "./useGenerationStore";

export interface PromptHistoryItem {
  id: string;
  prompt: string;
  mode: GenerationMode;
  model: ModelProvider;
  stylePresetId?: string;
  createdAt: number;
  usageCount: number;
}

interface PromptHistoryState {
  history: PromptHistoryItem[];
  maxItems: number;

  // Actions
  addPrompt: (item: Omit<PromptHistoryItem, "id" | "createdAt" | "usageCount">) => void;
  removePrompt: (id: string) => void;
  clearHistory: () => void;
  incrementUsage: (id: string) => void;
  getRecentPrompts: (limit?: number) => PromptHistoryItem[];
  getPromptsByMode: (mode: GenerationMode) => PromptHistoryItem[];
  searchPrompts: (query: string) => PromptHistoryItem[];
}

export const usePromptHistoryStore = create<PromptHistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      maxItems: 50,

      addPrompt: (item) => {
        const state = get();
        const trimmedPrompt = item.prompt.trim();

        // Check if prompt already exists
        const existingIndex = state.history.findIndex(
          (h) => h.prompt.toLowerCase() === trimmedPrompt.toLowerCase()
        );

        if (existingIndex !== -1) {
          // Update existing prompt's usage count and timestamp
          const updatedHistory = [...state.history];
          const existing = updatedHistory[existingIndex];
          updatedHistory[existingIndex] = {
            ...existing,
            usageCount: existing.usageCount + 1,
            createdAt: Date.now(),
            model: item.model,
            mode: item.mode,
            stylePresetId: item.stylePresetId,
          };
          // Move to front
          const [moved] = updatedHistory.splice(existingIndex, 1);
          updatedHistory.unshift(moved);
          set({ history: updatedHistory });
        } else {
          // Add new prompt
          const newItem: PromptHistoryItem = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            prompt: trimmedPrompt,
            mode: item.mode,
            model: item.model,
            stylePresetId: item.stylePresetId,
            createdAt: Date.now(),
            usageCount: 1,
          };

          // Remove oldest if at max
          const newHistory = [newItem, ...state.history].slice(0, state.maxItems);
          set({ history: newHistory });
        }
      },

      removePrompt: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),

      clearHistory: () => set({ history: [] }),

      incrementUsage: (id) =>
        set((state) => ({
          history: state.history.map((h) =>
            h.id === id ? { ...h, usageCount: h.usageCount + 1 } : h
          ),
        })),

      getRecentPrompts: (limit = 10) => {
        const state = get();
        return state.history.slice(0, limit);
      },

      getPromptsByMode: (mode) => {
        const state = get();
        return state.history.filter((h) => h.mode === mode);
      },

      searchPrompts: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.history.filter((h) =>
          h.prompt.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: "genstudio-prompt-history",
    }
  )
);
