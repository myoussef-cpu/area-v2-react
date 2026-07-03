import { useEffect, type ReactNode } from 'react';
import { useAppStore } from '../shared/store/app-store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../shared/lib/firebase';
import { useAuthStore } from '../shared/store/auth-store';

export function Providers({ children }: { children: ReactNode }) {
  const darkMode = useAppStore((s) => s.darkMode);
  const { setUser } = useAuthStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, [setUser]);

  return <>{children}</>;
}
