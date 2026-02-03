"use client";

import ContentLoader from "react-content-loader";

const SKELETON_BG = "#E2E8F0";
const SKELETON_FG = "#F1F5F9";

export function TransfersSkeleton() {
  return (
    <div className="flex flex-col gap-8" data-testid="transfers-skeleton">
      <ContentLoader speed={1.2} width={200} height={32} backgroundColor={SKELETON_BG} foregroundColor={SKELETON_FG}>
        <rect x="0" y="0" rx="4" ry="4" width="200" height="32" />
      </ContentLoader>

      {/* Transfer type cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <ContentLoader
            key={i}
            speed={1.2}
            width={200}
            height={150}
            backgroundColor={SKELETON_BG}
            foregroundColor={SKELETON_FG}
          >
            <rect x="0" y="0" rx="16" ry="16" width="100%" height="150" />
            <rect x="24" y="24" rx="8" ry="8" width="32" height="32" />
            <rect x="24" y="72" rx="4" ry="4" width="120" height="20" />
            <rect x="24" y="100" rx="4" ry="4" width="160" height="14" />
          </ContentLoader>
        ))}
      </div>

      {/* Form card */}
      <ContentLoader
        speed={1.2}
        width={800}
        height={400}
        backgroundColor={SKELETON_BG}
        foregroundColor={SKELETON_FG}
      >
        <rect x="0" y="0" rx="16" ry="16" width="100%" height="400" />
        <rect x="32" y="32" rx="4" ry="4" width="120" height="14" />
        <rect x="32" y="56" rx="10" ry="10" width="320" height="56" />
        <rect x="400" y="32" rx="4" ry="4" width="100" height="14" />
        <rect x="400" y="56" rx="10" ry="10" width="320" height="56" />
        <rect x="32" y="140" rx="4" ry="4" width="200" height="14" />
        <rect x="32" y="168" rx="14" ry="14" width="100%" height="74" />
        <rect x="32" y="280" rx="4" ry="4" width="100" height="14" />
        <rect x="32" y="308" rx="10" ry="10" width="200" height="48" />
        <rect x="32" y="340" rx="14" ry="14" width="200" height="48" />
      </ContentLoader>
    </div>
  );
}
