"use client";

import ContentLoader from "react-content-loader";

const SKELETON_BG = "#E2E8F0";
const SKELETON_FG = "#F1F5F9";

export function AccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,383px)_1fr]" data-testid="accounts-skeleton">
      {/* Left: account cards */}
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <ContentLoader
            key={i}
            speed={1.2}
            width={383}
            height={120}
            backgroundColor={SKELETON_BG}
            foregroundColor={SKELETON_FG}
          >
            <rect x="0" y="0" rx="16" ry="16" width="100%" height="120" />
            <rect x="20" y="20" rx="8" ry="8" width="36" height="36" />
            <rect x="68" y="24" rx="4" ry="4" width="140" height="14" />
            <rect x="68" y="44" rx="4" ry="4" width="80" height="10" />
            <rect x="20" y="88" rx="4" ry="4" width="120" height="24" />
          </ContentLoader>
        ))}
      </div>

      {/* Right: balance card + tabs */}
      <div className="flex flex-col gap-6">
        <ContentLoader
          speed={1.2}
          width={600}
          height={200}
          backgroundColor={SKELETON_BG}
          foregroundColor={SKELETON_FG}
        >
          <rect x="0" y="0" rx="16" ry="16" width="100%" height="200" />
          <rect x="32" y="32" rx="4" ry="4" width="140" height="12" />
          <rect x="32" y="56" rx="4" ry="4" width="220" height="40" />
          <rect x="32" y="108" rx="4" ry="4" width="160" height="14" />
          <rect x="32" y="140" rx="4" ry="4" width="120" height="12" />
          <rect x="32" y="160" rx="4" ry="4" width="100" height="12" />
        </ContentLoader>

        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <div className="flex border-b border-[#E2E8F0] px-6">
            <ContentLoader speed={1.2} width={120} height={48} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
              <rect x="0" y="12" rx="4" ry="4" width="100" height="20" />
            </ContentLoader>
            <ContentLoader speed={1.2} width={80} height={48} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
              <rect x="0" y="12" rx="4" ry="4" width="60" height="20" />
            </ContentLoader>
          </div>
          <div className="p-6">
            <div className="flex gap-4 pb-4">
              <ContentLoader speed={1.2} width={280} height={38} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
                <rect x="0" y="0" rx="10" ry="10" width="100%" height="38" />
              </ContentLoader>
            </div>
            <ul className="space-y-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <ContentLoader
                  key={i}
                  speed={1.2}
                  width={560}
                  height={56}
                  backgroundColor={SKELETON_BG}
                  foregroundColor={SKELETON_FG}
                >
                  <rect x="0" y="8" rx="8" ry="8" width="40" height="40" />
                  <rect x="52" y="14" rx="4" ry="4" width="140" height="14" />
                  <rect x="52" y="34" rx="4" ry="4" width="80" height="10" />
                  <rect x="480" y="18" rx="4" ry="4" width="80" height="16" />
                </ContentLoader>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
