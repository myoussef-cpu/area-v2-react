import { create } from 'zustand';
import type { AppUser, AuthState } from '../types';

interface AuthActions {
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  loading: false,
  initialized: false,
};

export const useAuthStore = create<AuthStore>()((set) => ({
  ...initialState,
  setUser: (user) => set({ user, initialized: true }),
  setLoading: (loading) => set({ loading }),
  setInitialized: (initialized) => set({ initialized }),
  reset: () => set(initialState),
}));
