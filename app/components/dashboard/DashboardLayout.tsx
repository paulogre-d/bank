"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <div
        className={`fixed left-0 top-0 z-20 h-screen w-64 shrink-0 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          onMenuClick={() => setSidebarOpen((o) => !o)}
          onLinkClick={() => setSidebarOpen(false)}
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
        className={`flex min-h-screen flex-1 flex-col transition-all duration-200 ${
          sidebarOpen ? "lg:ml-64" : ""
        }`}
      >
        <TopNav
          onMenuClick={() => setSidebarOpen((o) => !o)}
          sidebarCollapsed={!sidebarOpen}
        />
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
