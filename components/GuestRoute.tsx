'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { LoadingOverlay } from '@/components/LoadingOverlay';

const DASHBOARD_PATH = '/dashboard';

/**
 * Wraps public routes (e.g. login, register). Redirects to dashboard if user is already authenticated.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const hydrated = useAuthStore((s) => s.hydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated || loading) return;
    if (user) {
      router.replace(DASHBOARD_PATH);
    }
  }, [user, loading, hydrated, router]);

  if (!hydrated || loading) {
    return <LoadingOverlay />;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
