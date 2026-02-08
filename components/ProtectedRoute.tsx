'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const LOGIN_PATH = '/#login';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!loading && !user) {
      router.push(LOGIN_PATH);
    }
  }, [user, loading, hydrated, router]);

  if (!hydrated || loading) {
    return <LoadingOverlay />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
