import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import type { CalculationResult } from '../types';

export async function syncToCloud(
  userId: string,
  local: CalculationResult[],
): Promise<CalculationResult[]> {
  const colRef = collection(db, 'users', userId, 'results');

  const unsynced = local.filter((r) => !r.cloudId);
  for (const r of unsynced) {
    try {
      const docRef = await addDoc(colRef, {
        id: r.id, toolId: r.toolId, toolName: r.toolName,
        inputs: r.inputs, result: r.result, details: r.details,
        unit: r.unit, timestamp: r.timestamp,
      });
      r.cloudId = docRef.id;
      r.synced = true;
    } catch { /* offline */ }
  }

  const localIds = new Set(local.map((r) => r.id));
  const merged = [...local];

  try {
    const snapshot = await getDocs(colRef);
    snapshot.forEach((d) => {
      const data = d.data();
      if (!localIds.has(data.id)) {
        merged.push({
          id: data.id, toolId: data.toolId, toolName: data.toolName,
          inputs: data.inputs, result: data.result, details: data.details,
          unit: data.unit, timestamp: data.timestamp,
          cloudId: d.id, synced: true,
        });
      }
    });
  } catch { /* offline */ }

  return merged;
}

export async function deleteFromCloud(userId: string, cloudId: string) {
  try {
    await deleteDoc(doc(db, 'users', userId, 'results', cloudId));
  } catch { /* offline */ }
}
