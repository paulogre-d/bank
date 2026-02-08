"use client";

import { useAuthStore } from "@/store/auth";

interface TopNavProps {
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0).toUpperCase() || "";
  const last = lastName?.charAt(0).toUpperCase() || "";
  return first + last || "U";
}

export default function TopNav({ onMenuClick, sidebarCollapsed = true }: TopNavProps) {
  const user = useAuthStore((s) => s.user);

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "User";
  const initials = getInitials(user?.firstName, user?.lastName);
  const accountDisplay = user?.accountNumber
    ? `•••• ${user.accountNumber.slice(-4)}`
    : "Account";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#F1F5F9] bg-white px-4 lg:px-8">
      {/* Hamburger - always on mobile, only when collapsed on desktop */}
      <button
        type="button"
        onClick={onMenuClick}
        className={`flex h-10 w-10 items-center justify-center rounded-lg text-[#45556C] transition hover:bg-slate-100 hover:text-[#0F172B] ${
          sidebarCollapsed ? "" : "lg:hidden"
        }`}
        aria-label="Toggle sidebar"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div className="flex flex-1 items-center justify-end gap-2">
        {/* Search */}
        <div className="hidden items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2 md:flex">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#90A1B9" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search..."
            className="ml-2 w-48 border-none bg-transparent text-sm text-[#0F172B] placeholder:text-[#90A1B9] focus:outline-none focus:ring-0"
          />
        </div>
        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#45556C] transition hover:bg-slate-100 hover:text-[#0F172B]"
          aria-label="Notifications"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        {/* User avatar - compact on mobile, full on desktop */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#155DFC] text-xs font-bold text-white lg:hidden">
          {initials}
        </div>
        <div className="hidden items-center gap-3 rounded-xl border border-[#E2E8F0] px-3 py-2 lg:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#155DFC] text-xs font-bold text-white">
            {initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-[#0F172B]">{displayName}</p>
            <p className="text-xs text-[#45556C]">{accountDisplay}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
