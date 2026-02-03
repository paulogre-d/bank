'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#155DFC] border-r-transparent" />
          <p className="text-[#45556C]">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
