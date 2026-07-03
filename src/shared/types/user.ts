export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  initialized: boolean;
}
