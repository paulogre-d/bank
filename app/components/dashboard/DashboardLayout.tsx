"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Start closed; open on desktop after hydration
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Open sidebar by default only on desktop
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#F8FAFC]">
      <div
        className={`fixed left-0 top-0 z-20 h-screen w-64 shrink-0 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          onMenuClick={() => setSidebarOpen((o) => !o)}
          onLinkClick={() => {
            // Only close sidebar on mobile; keep open on desktop
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
        />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          tabIndex={-1}
        />
      )}

      <div
        className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-200 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        <TopNav
          onMenuClick={() => setSidebarOpen((o) => !o)}
          sidebarCollapsed={!sidebarOpen}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
