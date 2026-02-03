"use client";

import ContentLoader from "react-content-loader";

const SKELETON_BG = "#E2E8F0";
const SKELETON_FG = "#F1F5F9";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8" data-testid="dashboard-skeleton">
      {/* Header + Add Account */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <ContentLoader
            speed={1.2}
            width={280}
            height={32}
            backgroundColor={SKELETON_BG}
            foregroundColor={SKELETON_FG}
          >
            <rect x="0" y="0" rx="6" ry="6" width="220" height="28" />
            <rect x="0" y="36" rx="4" ry="4" width="180" height="16" />
          </ContentLoader>
        </div>
        <ContentLoader speed={1.2} width={140} height={40} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
          <rect x="0" y="0" rx="10" ry="10" width="140" height="40" />
        </ContentLoader>
      </div>

      {/* Account cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ContentLoader
            key={i}
            speed={1.2}
            width={380}
            height={160}
            backgroundColor={SKELETON_BG}
            foregroundColor={SKELETON_FG}
          >
            <rect x="0" y="0" rx="16" ry="16" width="100%" height="160" />
            <rect x="24" y="24" rx="4" ry="4" width="120" height="14" />
            <rect x="24" y="48" rx="4" ry="4" width="160" height="28" />
            <rect x="24" y="120" rx="4" ry="4" width="80" height="12" />
          </ContentLoader>
        ))}
      </div>

      {/* Quick Actions + Chart | Transactions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="flex flex-col gap-8">
          <div>
            <ContentLoader speed={1.2} width={140} height={24} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
              <rect x="0" y="0" rx="4" ry="4" width="140" height="24" />
            </ContentLoader>
            <div className="mt-4 flex gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5].map((i) => (
                <ContentLoader
                  key={i}
                  speed={1.2}
                  width={142}
                  height={110}
                  backgroundColor={SKELETON_BG}
                  foregroundColor={SKELETON_FG}
                >
                  <rect x="0" y="0" rx="18" ry="18" width="142" height="110" />
                </ContentLoader>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
            <ContentLoader speed={1.2} width={200} height={24} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
              <rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
            </ContentLoader>
            <div className="mt-6 flex h-40 items-end gap-2">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t bg-[#E2E8F0]"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <ContentLoader speed={1.2} width={180} height={24} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
            <rect x="0" y="0" rx="4" ry="4" width="180" height="24" />
          </ContentLoader>
          <ul className="mt-4 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ContentLoader
                key={i}
                speed={1.2}
                width={360}
                height={56}
                backgroundColor={SKELETON_BG}
                foregroundColor={SKELETON_FG}
              >
                <rect x="0" y="8" rx="8" ry="8" width="40" height="40" />
                <rect x="56" y="14" rx="4" ry="4" width="140" height="14" />
                <rect x="56" y="34" rx="4" ry="4" width="80" height="10" />
                <rect x="300" y="18" rx="4" ry="4" width="60" height="16" />
              </ContentLoader>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
