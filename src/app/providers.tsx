import { useEffect, useRef, type ReactNode } from 'react';
import { useAppStore } from '../shared/store/app-store';
import { useResultsStore } from '../shared/store/results-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../shared/lib/firebase';
import { syncToCloud } from '../shared/lib/cloud-sync';
import { useAuthStore } from '../shared/store/auth-store';

export function Providers({ children }: { children: ReactNode }) {
  const darkMode = useAppStore((s) => s.darkMode);
  const { setUser } = useAuthStore();
  const syncingRef = useRef(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
        if (!syncingRef.current) {
          syncingRef.current = true;
          try {
            const local = useResultsStore.getState().results;
            const merged = await syncToCloud(firebaseUser.uid, local);
            useResultsStore.getState().syncFromCloud(merged);
          } catch { /* offline */ } finally { syncingRef.current = false; }
        }
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, [setUser]);

  return <>{children}</>;
}
