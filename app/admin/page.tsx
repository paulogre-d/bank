"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminAuthHeader } from "@/lib/auth/admin";

type Stats = {
  totalUsers: number;
  totalAccounts: number;
  totalBalance: number;
  transactionsToday: number;
};

type User = {
  uid: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
};

type Transaction = {
  id: string;
  referenceId: string;
  type: string;
  amount: number;
  merchant: string | null;
  timestamp: string;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = await getAdminAuthHeader();
        
        // Fetch stats
        const statsRes = await fetch("/api/admin/stats", { headers });
        const statsJson = await statsRes.json();
        if (statsJson.success) {
          setStats(statsJson.data);
        }

        // Fetch recent users
        const usersRes = await fetch("/api/admin/users?limit=5", { headers });
        const usersJson = await usersRes.json();
        if (usersJson.success) {
          setRecentUsers(usersJson.data.users);
        }

        // Fetch recent transactions
        const txRes = await fetch("/api/admin/transactions?limit=5", { headers });
        const txJson = await txRes.json();
        if (txJson.success) {
          setRecentTransactions(txJson.data.transactions);
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-sm text-[#62748E]">Loading...</div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers.toString(), href: "/admin/users", color: "bg-[#155DFC]" },
    { label: "Total Accounts", value: stats.totalAccounts.toString(), href: "/admin/users", color: "bg-[#0F172B]" },
    { label: "Total Balance", value: `$${stats.totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, href: "/admin/users", color: "bg-[#00A63E]" },
    { label: "Transactions Today", value: stats.transactionsToday.toString(), href: "/admin/transactions", color: "bg-[#E17100]" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-[#0F172B]">Admin Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:border-[#CBD5E1] hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}>
                <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-[#62748E]">{stat.label}</p>
                <p className="text-xl font-bold text-[#0F172B]">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] p-6">
            <h2 className="text-lg font-semibold text-[#0F172B]">Recent Users</h2>
            <p className="text-sm text-[#62748E]">Latest registered users</p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentUsers.map((user) => (
              <Link
                key={user.uid}
                href={`/admin/users?uid=${user.uid}`}
                className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[#F8FAFC]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <span className="text-sm font-semibold text-[#64748B]">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172B]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[#62748E]">{user.email}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-[#94A3B8]">{user.accountNumber}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] p-6">
            <h2 className="text-lg font-semibold text-[#0F172B]">Recent Transactions</h2>
            <p className="text-sm text-[#62748E]">Latest activity</p>
          </div>
          <div className="divide-y divide-[#F1F5F9]">
            {recentTransactions.length === 0 ? (
              <div className="px-6 py-4 text-sm text-[#62748E]">No recent transactions</div>
            ) : (
              recentTransactions.map((tx) => (
                <Link
                  key={tx.id}
                  href="/admin/transactions"
                  className="flex items-center justify-between gap-4 px-6 py-4 transition hover:bg-[#F8FAFC]"
                >
                  <div>
                    <p className="text-sm font-medium text-[#0F172B]">{tx.merchant ?? tx.referenceId}</p>
                    <p className="text-xs text-[#62748E]">
                      {tx.timestamp ? (typeof tx.timestamp === 'string' ? tx.timestamp.slice(0, 10) : new Date(tx.timestamp).toISOString().slice(0, 10)) : 'N/A'} · {tx.type}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.amount > 0 ? "text-[#00A63E]" : "text-[#DC2626]"
                    }`}
                  >
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
