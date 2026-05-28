import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface SelectedStoreState {
  selectedStoreId: number | null;
  setSelectedStoreId: (id: number) => void;
  clearSelectedStore: () => void;
}

export const useSelectedStore = create<SelectedStoreState>()(
  persist(
    (set) => ({
      selectedStoreId: null,
      setSelectedStoreId: (id) => set({ selectedStoreId: id }),
      clearSelectedStore: () => set({ selectedStoreId: null }),
    }),
    {
      name: "laundry-lane-selected-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
