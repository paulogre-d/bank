import { create } from 'zustand';
import { User } from 'firebase/auth';
import type { AuthUser, LoginData, RegisterData } from '@/lib/auth/client';
import { loginUser, logoutUser, registerUser, getIdToken as getClientIdToken } from '@/lib/auth/client';

interface AuthState {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  hydrated: boolean;

  setUser: (user: AuthUser | null) => void;
  setFirebaseUser: (firebaseUser: User | null) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;

  reset: () => void;

  login: (data: LoginData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ accountNumber: string; email: string }>;
  getIdToken: () => Promise<string | null>;
}

const initialState = {
  user: null as AuthUser | null,
  firebaseUser: null as User | null,
  loading: true,
  hydrated: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,

  setUser: (user) => set({ user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
  setLoading: (loading) => set({ loading }),
  setHydrated: (hydrated) => set({ hydrated }),

  reset: () => set(initialState),

  login: async (data) => {
    const user = await loginUser(data);
    set({ user });
    return user;
  },

  logout: async () => {
    await logoutUser();
    set({ user: null, firebaseUser: null });
  },

  register: async (data) => {
    return registerUser(data);
  },

  getIdToken: async () => getClientIdToken(),
}));

/** Selectors */
export const selectUser = (s: AuthState) => s.user;
export const selectIsAuthenticated = (s: AuthState) => !!s.user;
export const selectAuthLoading = (s: AuthState) => s.loading;
export const selectAuthHydrated = (s: AuthState) => s.hydrated;
