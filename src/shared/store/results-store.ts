import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculationResult } from '../types';

interface ResultsState {
  results: CalculationResult[];
  addResult: (result: CalculationResult) => void;
  removeResult: (id: string) => void;
  clearAll: () => void;
  syncFromCloud: (cloudResults: CalculationResult[]) => void;
}

export const useResultsStore = create<ResultsState>()(
  persist(
    (set) => ({
      results: [],
      addResult: (result) =>
        set((s) => ({ results: [result, ...s.results] })),
      removeResult: (id) =>
        set((s) => ({ results: s.results.filter((r) => r.id !== id) })),
      clearAll: () => set({ results: [] }),
      syncFromCloud: (cloudResults) =>
        set((s) => {
          const localIds = new Set(s.results.map((r) => r.id));
          const newOnes = cloudResults.filter((r) => !localIds.has(r.id));
          return { results: [...newOnes, ...s.results] };
        }),
    }),
    { name: 'saved-results' }
  )
);
