import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FeatureState {
  voyageEnabled: boolean;
  setVoyageEnabled: (enabled: boolean) => void;
}

export const useFeatureStore = create<FeatureState>()(
  persist(
    (set) => ({
      voyageEnabled: false,
      setVoyageEnabled: (enabled) => set({ voyageEnabled: enabled }),
    }),
    {
      name: 'feature-storage', // unique name for localStorage key
      getStorage: () => localStorage, // use localStorage instead of sessionStorage
    }
  )
);
