import { useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useResultsStore } from '../store/results-store';
import { useAuthStore } from '../store/auth-store';
import type { CalculationData, CalculationResult } from '../types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function useResults() {
  const results = useResultsStore((s) => s.results);
  const addResult = useResultsStore((s) => s.addResult);
  const removeResult = useResultsStore((s) => s.removeResult);
  const clearAll = useResultsStore((s) => s.clearAll);
  const syncFromCloud = useResultsStore((s) => s.syncFromCloud);
  const user = useAuthStore((s) => s.user);

  const saveResult = useCallback(
    async (data: CalculationData) => {
      const result: CalculationResult = {
        id: generateId(),
        toolId: data.toolId,
        toolName: data.toolName,
        inputs: data.inputs,
        result: data.result,
        details: data.details,
        unit: data.unit,
        timestamp: data.timestamp || Date.now(),
        image: data.image,
        synced: false,
      };

      addResult(result);

      if (user?.uid) {
        try {
          const docRef = await addDoc(collection(db, 'users', user.uid, 'results'), {
            ...result,
            cloudId: undefined,
            synced: undefined,
          });
          const syncedResult = { ...result, cloudId: docRef.id, synced: true };
          removeResult(result.id);
          addResult(syncedResult);
        } catch {
          // Firebase unavailable — result stays local
        }
      }
    },
    [addResult, removeResult, user]
  );

  const deleteResult = useCallback(
    async (id: string) => {
      const existing = results.find((r) => r.id === id);
      removeResult(id);

      if (existing?.cloudId && user?.uid) {
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'results', existing.cloudId));
        } catch {
          // Firebase unavailable
        }
      }
    },
    [removeResult, results, user]
  );

  return { results, saveResult, deleteResult, clearAll, syncFromCloud };
}
