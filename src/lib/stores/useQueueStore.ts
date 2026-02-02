import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelProvider } from "./useGenerationStore";

export type QueueItemStatus = "pending" | "processing" | "completed" | "failed";
export type QueueItemType = "image" | "video";

export interface QueueItem {
  id: string;
  type: QueueItemType;
  status: QueueItemStatus;
  prompt: string;
  model: ModelProvider;
  aspectRatio: string;
  progress: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  resultUrl?: string;
  resultBase64?: string;

  // Video-specific
  duration?: number;
  resolution?: string;
  requestId?: string;

  // Image-specific
  sourceImage?: string;
}

interface QueueState {
  items: QueueItem[];
  activeItemId: string | null;
  pollingIntervalMs: number;

  // Actions
  addItem: (item: Omit<QueueItem, "id" | "createdAt" | "status" | "progress">) => string;
  updateItem: (id: string, updates: Partial<QueueItem>) => void;
  removeItem: (id: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;
  getItem: (id: string) => QueueItem | undefined;
  getPendingItems: () => QueueItem[];
  getProcessingItems: () => QueueItem[];
  getCompletedItems: () => QueueItem[];
  getFailedItems: () => QueueItem[];
  setActiveItem: (id: string | null) => void;
  retryItem: (id: string) => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useQueueStore = create<QueueState>()(
  persist(
    (set, get) => ({
      items: [],
      activeItemId: null,
      pollingIntervalMs: 5000,

      addItem: (item) => {
        const id = generateId();
        const newItem: QueueItem = {
          ...item,
          id,
          createdAt: Date.now(),
          status: "pending",
          progress: 0,
        };
        set((state) => ({ items: [...state.items, newItem] }));
        return id;
      },

      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        activeItemId: state.activeItemId === id ? null : state.activeItemId,
      })),

      clearCompleted: () => set((state) => ({
        items: state.items.filter((item) => item.status !== "completed"),
      })),

      clearFailed: () => set((state) => ({
        items: state.items.filter((item) => item.status !== "failed"),
      })),

      clearAll: () => set({ items: [], activeItemId: null }),

      getItem: (id) => get().items.find((item) => item.id === id),

      getPendingItems: () => get().items.filter((item) => item.status === "pending"),

      getProcessingItems: () => get().items.filter((item) => item.status === "processing"),

      getCompletedItems: () => get().items.filter((item) => item.status === "completed"),

      getFailedItems: () => get().items.filter((item) => item.status === "failed"),

      setActiveItem: (id) => set({ activeItemId: id }),

      retryItem: (id) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, status: "pending" as const, progress: 0, error: undefined }
            : item
        ),
      })),
    }),
    {
      name: "genstudio-queue",
      partialize: (state) => ({
        items: state.items.filter(
          (item) => item.status === "pending" || item.status === "processing"
        ),
      }),
    }
  )
);
