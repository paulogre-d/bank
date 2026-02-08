"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { adminLogout } from "@/lib/auth/admin";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/transactions", label: "Transactions" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside
        className={`fixed left-0 top-0 z-20 h-screen w-64 border-r border-[#E2E8F0] bg-white transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-[#F1F5F9] px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#45556C] hover:bg-[#F1F5F9]"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link href="/admin" className="text-lg font-bold text-[#0F172B]">
            Vertex Premium Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-12 items-center rounded-lg px-4 text-sm font-medium transition ${
                  isActive ? "bg-[#EFF6FF] text-[#155DFC]" : "text-[#62748E] hover:bg-[#F8FAFC] hover:text-[#314158]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#F1F5F9] p-4">
          <button
            type="button"
            onClick={async () => {
              await adminLogout();
              router.push("/admin/login");
            }}
            className="flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm text-[#62748E] hover:bg-[#F8FAFC]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
          <Link
            href="/dashboard"
            className="mt-2 flex h-12 w-full items-center gap-3 rounded-lg px-4 text-left text-sm text-[#62748E] hover:bg-[#F8FAFC]"
          >
            View Customer Dashboard →
          </Link>
        </div>
      </aside>
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-black/20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`flex min-h-screen flex-1 flex-col transition-all ${sidebarOpen ? "lg:ml-64" : ""}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[#F1F5F9] bg-white px-4 lg:px-8">
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#45556C] hover:bg-[#F1F5F9] lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex flex-1 justify-end">
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#155DFC]">
              Admin
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
