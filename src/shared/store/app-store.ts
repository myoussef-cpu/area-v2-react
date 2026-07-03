import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  darkMode: boolean;
  areaUnit: string;
  volumeUnit: string;
  toggleDarkMode: () => void;
  setAreaUnit: (unit: string) => void;
  setVolumeUnit: (unit: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      darkMode: false,
      areaUnit: 'm2',
      volumeUnit: 'm3',
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setAreaUnit: (unit) => set({ areaUnit: unit }),
      setVolumeUnit: (unit) => set({ volumeUnit: unit }),
    }),
    { name: 'app-settings' }
  )
);
