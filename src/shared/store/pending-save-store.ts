import { create } from 'zustand';
import type { CalculationData } from '../types';

interface PendingSaveState {
  data: CalculationData | null;
  set: (data: CalculationData) => void;
  clear: () => void;
}

export const usePendingSave = create<PendingSaveState>((set) => ({
  data: null,
  set: (data) => set({ data }),
  clear: () => set({ data: null }),
}));
