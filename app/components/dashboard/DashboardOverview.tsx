"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  IconAdd,
  IconMore,
  IconChartUp,
  IconTransfer,
  IconPayBills,
  IconLoan,
  IconScan,
  IconStatements,
} from "./icons";
import { useAuthStore } from "@/store/auth";
import type { DashboardAccount } from "@/store/dashboard";
import { useDashboardOverview } from "@/lib/api/hooks";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { InlineError } from "@/components/InlineError";

type AnalyticsPeriod = "thisWeek" | "lastMonth" | "thisYear";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const quickActions = [
  { label: "Transfer", href: "/dashboard/transfers", icon: IconTransfer, iconColor: "#155DFC" },
  { label: "Pay Bills", href: "/dashboard/accounts", icon: IconPayBills, iconColor: "#E17100" },
  { label: "Loan", href: "/dashboard/loans", icon: IconLoan, iconColor: "#009966" },
  { label: "Scan QR", href: "/dashboard", icon: IconScan, iconColor: "#9810FA" },
  { label: "Statement", href: "/dashboard/accounts", icon: IconStatements, iconColor: "#4F39F6" },
];

const CATEGORY_ICON_BG: Record<string, string> = {
  food: "#FFEDD4",
  coffee: "#FEF3C7",
  income: "#F1F5F9",
  transport: "#EDE9FE",
  utilities: "#D1FAE5",
  transfer: "#F1F5F9",
};
function getIconBg(category: string) {
  return CATEGORY_ICON_BG[category.toLowerCase()] ?? "#F1F5F9";
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "+";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBalance(value: number): string {
  return value < 0
    ? `-$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function TransactionIcon({ type, bg }: { type: string; bg: string }) {
  const cn = "h-10 w-10 shrink-0 rounded-full flex items-center justify-center";
  switch (type) {
    case "food":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-[#F54900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8c0-3-2-4-6-4S6 5 6 8" />
            <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
          </svg>
        </div>
      );
    case "coffee":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        </div>
      );
    case "income":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "transport":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 17h14v-4H5v4zM5 12l2-4h10l2 4" />
            <circle cx="7.5" cy="17" r="1.5" />
            <circle cx="16.5" cy="17" r="1.5" />
          </svg>
        </div>
      );
    case "bill":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      );
    case "utilities":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 2v4l4-2-4-2zM9 8L3 6v12l6-2V8zm4 2v8l6 2V6l-6 4z" />
          </svg>
        </div>
      );
    case "shopping":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      );
    case "transfer":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 17L17 7M17 7h-6M17 7v6" />
            <path d="M17 17L7 7M7 7h6M7 7v6" />
          </svg>
        </div>
      );
    default:
      return <div className={cn} style={{ backgroundColor: bg || "#F1F5F9" }} />;
  }
}

function AccountCard({
  account,
  variant,
  href,
}: {
  account: DashboardAccount;
  variant: "blue" | "white" | "dark";
  href: string;
}) {
  const isDark = variant === "dark";
  const isBlue = variant === "blue";
  const balanceStr = formatBalance(account.balance);

  const cardClass =
    variant === "blue"
      ? "overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(21,93,252,1)_0%,rgba(20,71,230,1)_100%)] p-6 shadow-lg transition hover:opacity-95"
      : variant === "dark"
        ? "overflow-hidden rounded-2xl bg-[#0F172B] p-6 shadow-lg transition hover:opacity-95"
        : "overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:border-[#155DFC]/30";

  const textPrimary = isDark || isBlue ? "text-white" : "text-[#1D293D]";
  const textSecondary = isDark || isBlue ? "text-white/80" : "text-[#62748E]";
  const textMuted = isDark || isBlue ? "text-white/60" : "text-[#62748E]/60";

  return (
    <Link href={href} className={cardClass}>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className={`text-sm font-normal ${textSecondary}`}>{account.name}</p>
          <p className={`text-2xl font-bold tracking-tight ${textPrimary}`}>{balanceStr}</p>
        </div>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className={`rounded-full p-1.5 ${isDark || isBlue ? "text-white/80 hover:bg-white/10" : "text-[#62748E] hover:bg-slate-100"}`}
          aria-label="More options"
        >
          <IconMore className={isDark || isBlue ? "text-white" : "text-[#62748E]"} />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <p className={`text-sm ${textMuted}`}>•••• {account.lastFour}</p>
        {account.accountType !== "credit" && account.balance >= 0 && (
          <div className="flex items-center gap-2 rounded-full bg-[rgba(0,201,80,0.2)] px-3 py-1">
            <IconChartUp className="text-[#00C950]" />
            <span className="text-sm font-semibold text-[#00C950]">—</span>
          </div>
        )}
        {account.accountType === "credit" && <div className="rounded-full bg-white/10 px-3 py-1 shadow-sm" />}
      </div>
    </Link>
  );
}

export default function DashboardOverview() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useDashboardOverview();

  const accounts = data?.accounts ?? [];
  const recentTransactions = data?.recentTransactions ?? [];
  const spendingAnalytics = data?.spendingAnalytics ?? {
    thisWeek: 0,
    lastMonth: 0,
    byDay: [],
    byWeek: [],
    byMonth: [],
  };
  const firstName = user?.firstName ?? "";

  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("thisWeek");
  const chartData = useMemo(() => {
    if (analyticsPeriod === "thisWeek") return spendingAnalytics.byDay ?? [];
    if (analyticsPeriod === "lastMonth") return spendingAnalytics.byWeek ?? [];
    return spendingAnalytics.byMonth ?? [];
  }, [analyticsPeriod, spendingAnalytics.byDay, spendingAnalytics.byWeek, spendingAnalytics.byMonth]);
  const maxValue = useMemo(
    () => Math.max(...chartData.map((d) => d.value), 1),
    [chartData]
  );
  const yAxisTicks = useMemo(() => {
    if (maxValue <= 0) return [0];
    const step = maxValue <= 1 ? 1 : Math.ceil(maxValue / 4);
    const ticks: number[] = [];
    for (let v = 0; v <= maxValue; v += step) ticks.push(Math.round(v));
    if (ticks[ticks.length - 1] !== maxValue) ticks.push(Math.ceil(maxValue));
    return [...new Set(ticks)].sort((a, b) => a - b);
  }, [maxValue]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError && !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">
          {getGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <InlineError
          message={error?.message ?? "Failed to load dashboard"}
          onRetry={() => refetch()}
        />
        <div className="min-h-[200px] rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]" />
      </div>
    );
  }

  const cardVariants: ("blue" | "white" | "dark")[] = ["blue", "white", "dark"];
  const accountCards = accounts.slice(0, 3).map((acc, i) => (
    <AccountCard
      key={acc.id}
      account={acc}
      variant={cardVariants[i % 3]}
      href={acc.accountType === "credit" ? "/dashboard/cards" : "/dashboard/accounts"}
    />
  ));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-base text-[#62748E]">
            Here&apos;s what&apos;s happening with your money today.
          </p>
        </div>
        <Link
          href="/dashboard/accounts"
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#0F172B] px-4 font-semibold text-white shadow-sm transition hover:bg-[#1a2744]"
        >
          <IconAdd className="text-white" />
          Add Account
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accountCards.length > 0 ? accountCards : (
          <Link
            href="/dashboard/accounts"
            className="flex min-h-[160px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-[#62748E] transition hover:border-[#155DFC]/50"
          >
            Add your first account
          </Link>
        )}
      </div>

      {/* Two-column: Quick Actions + Analytics | Recent Transactions */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[minmax(0,800px)_1fr]">
        <div className="flex flex-col gap-8">
          {/* Quick Actions */}
          <section>
            <h2 className="mb-4 text-lg font-bold text-[#0F172B]">Quick Actions</h2>
            <div className="flex flex-nowrap gap-6 overflow-x-auto pb-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-sm transition hover:border-[#155DFC]/30 hover:shadow-md min-h-[110px] min-w-[142px]"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-[18px] [&_svg]:h-6 [&_svg]:w-6"
                      style={{ backgroundColor: `${action.iconColor}15`, color: action.iconColor }}
                    >
                      <Icon />
                    </div>
                    <span className="text-center text-xs font-normal text-[#45556C]">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Spending Analytics */}
          <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-[#0F172B]">Spending Analytics</h2>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value as AnalyticsPeriod)}
                className="h-10 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-medium text-[#45556C] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC]"
              >
                <option value="thisWeek">This Week</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col justify-between py-1 text-right text-xs text-[#94A3B8]">
                {yAxisTicks.slice().reverse().map((n) => (
                  <span key={n}>${n}</span>
                ))}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex h-40 items-end gap-1">
                  {chartData.map((d, i) => {
                    const barHeight = maxValue > 0 ? Math.min((d.value / maxValue) * 160, 160) : 0;
                    return (
                      <div
                        key={`${d.label}-${i}`}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="w-full rounded-t bg-[linear-gradient(180deg,rgba(21,93,252,0.3)_0%,rgba(21,93,252,0.05)_100%)] transition-all"
                          style={{ height: `${barHeight}px`, minHeight: "4px" }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-around gap-1 pt-2 text-xs text-[#94A3B8]">
                  {chartData.map((d, i) => (
                    <span key={`${d.label}-${i}`}>{d.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <section className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0F172B]">Recent Transactions</h2>
            <Link
              href="/dashboard/accounts"
              className="flex items-center gap-1 text-sm font-semibold text-[#155DFC] transition hover:underline"
            >
              View All
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <ul className="max-h-[500px] space-y-2 overflow-y-auto">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 10).map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between gap-4 rounded-[14px] border border-transparent px-4 py-3 transition hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-center gap-4">
                    <TransactionIcon type={tx.category.toLowerCase()} bg={getIconBg(tx.category)} />
                    <div>
                      <p className="font-medium text-[#0F172B]">{tx.merchant}</p>
                      <p className="text-xs text-[#62748E]">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${tx.amount >= 0 ? "text-[#00C950]" : "text-[#0F172B]"}`}
                    >
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-xs font-normal text-[#90A1B9]">{tx.category}</p>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-8 text-center text-sm text-[#62748E]">No recent transactions</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
