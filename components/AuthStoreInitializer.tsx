'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/auth';

/**
 * Subscribes to Firebase auth state and syncs with the auth store.
 * Mount once in root layout so protected routes and dashboard can rely on the store.
 */
export function AuthStoreInitializer() {
  const setUser = useAuthStore((s) => s.setUser);
  const setFirebaseUser = useAuthStore((s) => s.setFirebaseUser);
  const setLoading = useAuthStore((s) => s.setLoading);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('firebaseIdToken', token);
          }
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          if (json.success && json.data) {
            setUser(json.data);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('[AuthStoreInitializer] Failed to fetch user:', err);
          setUser(null);
        }
      } else {
        setUser(null);
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('firebaseIdToken');
        }
      }

      setLoading(false);
      setHydrated(true);
    });

    return () => unsubscribe();
  }, [setUser, setFirebaseUser, setLoading, setHydrated]);

  return null;
}
