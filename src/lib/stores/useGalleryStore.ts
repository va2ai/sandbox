import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GeneratedMedia } from "./useGenerationStore";

interface GalleryItem extends GeneratedMedia {
  favorite: boolean;
  tags: string[];
}

interface GalleryState {
  items: GalleryItem[];
  selectedItems: string[];
  sortBy: "date" | "type" | "model";
  sortOrder: "asc" | "desc";
  filterType: "all" | "image" | "video";
  filterModel: "all" | "grok" | "gemini-flash" | "gemini-pro" | "gemini-imagen";
  searchQuery: string;

  // Actions
  addItem: (item: GeneratedMedia) => void;
  removeItem: (id: string) => void;
  removeItems: (ids: string[]) => void;
  toggleFavorite: (id: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  selectItem: (id: string) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  setSortBy: (sortBy: GalleryState["sortBy"]) => void;
  setSortOrder: (order: GalleryState["sortOrder"]) => void;
  setFilterType: (type: GalleryState["filterType"]) => void;
  setFilterModel: (model: GalleryState["filterModel"]) => void;
  setSearchQuery: (query: string) => void;
  getFilteredItems: () => GalleryItem[];
  clearGallery: () => void;
}

export const useGalleryStore = create<GalleryState>()(
  persist(
    (set, get) => ({
      items: [],
      selectedItems: [],
      sortBy: "date",
      sortOrder: "desc",
      filterType: "all",
      filterModel: "all",
      searchQuery: "",

      addItem: (item) => set((state) => ({
        items: [
          {
            ...item,
            favorite: false,
            tags: [],
          },
          ...state.items,
        ],
      })),

      removeItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
      })),

      removeItems: (ids) => set((state) => ({
        items: state.items.filter((item) => !ids.includes(item.id)),
        selectedItems: state.selectedItems.filter((itemId) => !ids.includes(itemId)),
      })),

      toggleFavorite: (id) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, favorite: !item.favorite } : item
        ),
      })),

      addTag: (id, tag) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id && !item.tags.includes(tag)
            ? { ...item, tags: [...item.tags, tag] }
            : item
        ),
      })),

      removeTag: (id, tag) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, tags: item.tags.filter((t) => t !== tag) }
            : item
        ),
      })),

      selectItem: (id) => set((state) => ({
        selectedItems: state.selectedItems.includes(id)
          ? state.selectedItems
          : [...state.selectedItems, id],
      })),

      deselectItem: (id) => set((state) => ({
        selectedItems: state.selectedItems.filter((itemId) => itemId !== id),
      })),

      clearSelection: () => set({ selectedItems: [] }),

      selectAll: () => set((state) => ({
        selectedItems: get().getFilteredItems().map((item) => item.id),
      })),

      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setFilterType: (type) => set({ filterType: type }),
      setFilterModel: (model) => set({ filterModel: model }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      getFilteredItems: () => {
        const state = get();
        let filtered = [...state.items];

        // Filter by type
        if (state.filterType !== "all") {
          filtered = filtered.filter((item) => item.type === state.filterType);
        }

        // Filter by model
        if (state.filterModel !== "all") {
          filtered = filtered.filter((item) => item.model === state.filterModel);
        }

        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.prompt.toLowerCase().includes(query) ||
              item.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        // Sort
        filtered.sort((a, b) => {
          let comparison = 0;
          switch (state.sortBy) {
            case "date":
              comparison = a.createdAt - b.createdAt;
              break;
            case "type":
              comparison = a.type.localeCompare(b.type);
              break;
            case "model":
              comparison = a.model.localeCompare(b.model);
              break;
          }
          return state.sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
      },

      clearGallery: () => set({ items: [], selectedItems: [] }),
    }),
    {
      name: "genstudio-gallery",
    }
  )
);
