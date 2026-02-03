'use client';

import React, { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/auth';
import type { AuthUser, RegisterData, LoginData } from '@/lib/auth/client';

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: ReturnType<typeof useAuthStore.getState>['firebaseUser'];
  loading: boolean;
  register: (data: RegisterData) => Promise<{ accountNumber: string; email: string }>;
  login: (data: LoginData) => Promise<AuthUser>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const getIdToken = useAuthStore((s) => s.getIdToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        register,
        login,
        logout,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
