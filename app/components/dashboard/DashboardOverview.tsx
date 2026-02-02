"use client";

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

const chartData = [
  { day: "Mon", value: 40 },
  { day: "Tue", value: 65 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 80 },
  { day: "Fri", value: 55 },
  { day: "Sat", value: 90 },
  { day: "Sun", value: 70 },
];

const RECENT_TRANSACTIONS = [
  { id: 1, merchant: "Whole Foods Market", date: "Jan 28, 2024", amount: "-$124.50", category: "Food", iconBg: "#FFEDD4" },
  { id: 2, merchant: "Starbucks Coffee", date: "Jan 28, 2024", amount: "-$5.40", category: "Coffee", iconBg: "#FEF3C7" },
  { id: 3, merchant: "Salary Deposit", date: "Jan 25, 2024", amount: "+$4,200.00", category: "Income", iconBg: "#F1F5F9" },
  { id: 4, merchant: "Uber Ride", date: "Jan 24, 2024", amount: "-$24.00", category: "Transport", iconBg: "#EDE9FE" },
  { id: 5, merchant: "Electric Bill", date: "Jan 20, 2024", amount: "-$145.20", category: "Utilities", iconBg: "#D1FAE5" },
];

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
    default:
      return <div className={cn} style={{ backgroundColor: bg || "#F1F5F9" }} />;
  }
}

export default function DashboardOverview() {
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div className="space-y-8">
      {/* Header - exactly per Figma */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172B]">
            {getGreeting()}, David
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

      {/* Account Cards - exact Figma layout */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Premium Checking - gradient blue card */}
        <Link
          href="/dashboard/accounts"
          className="overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(21,93,252,1)_0%,rgba(20,71,230,1)_100%)] p-6 shadow-lg transition hover:opacity-95"
        >
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-sm font-normal text-white/80">Premium Checking</p>
              <p className="text-2xl font-bold tracking-tight text-white">$12,450.00</p>
            </div>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/10"
              aria-label="More options"
            >
              <IconMore className="text-white" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-white/60">•••• 4589</p>
            <div className="flex items-center gap-2 rounded-full bg-[rgba(0,201,80,0.2)] px-3 py-1">
              <IconChartUp className="text-[#00C950]" />
              <span className="text-sm font-semibold text-[#00C950]">12%</span>
            </div>
          </div>
        </Link>

        {/* High Yield Savings - white card */}
        <Link
          href="/dashboard/accounts"
          className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition hover:border-[#155DFC]/30"
        >
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-sm font-normal text-[#62748E]">High Yield Savings</p>
              <p className="text-2xl font-bold tracking-tight text-[#1D293D]">$45,200.50</p>
            </div>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-[#62748E] hover:bg-slate-100"
              aria-label="More options"
            >
              <IconMore className="text-[#62748E]" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-[#62748E]/60">•••• 9012</p>
            <div className="flex items-center gap-2 rounded-full bg-[rgba(0,201,80,0.2)] px-3 py-1">
              <IconChartUp className="text-[#00C950]" />
              <span className="text-sm font-semibold text-[#00C950]">5%</span>
            </div>
          </div>
        </Link>

        {/* Visa Infinite - dark card */}
        <Link
          href="/dashboard/cards"
          className="overflow-hidden rounded-2xl bg-[#0F172B] p-6 shadow-lg transition hover:opacity-95"
        >
          <div className="mb-8 flex items-start justify-between">
            <div>
              <p className="text-sm font-normal text-white/80">Visa Infinite</p>
              <p className="text-2xl font-bold tracking-tight text-white">-$1,250.00</p>
            </div>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="rounded-full p-1.5 text-white/80 hover:bg-white/10"
              aria-label="More options"
            >
              <IconMore className="text-white" />
            </button>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-sm text-white/60">•••• 3456</p>
            <div className="rounded-full bg-white/10 px-3 py-1 shadow-sm" />
          </div>
        </Link>
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
              <select className="h-10 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm font-medium text-[#45556C] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC]">
                <option>This Week</option>
                <option>Last Month</option>
                <option>This Year</option>
              </select>
            </div>
            {/* Area chart with Y-axis labels */}
            <div className="flex gap-4">
              <div className="flex flex-col justify-between py-1 text-right text-xs text-[#94A3B8]">
                {[600, 450, 300, 150, 0].map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex h-52 flex-1 items-end gap-1">
                  {chartData.map((d) => (
                    <div
                      key={d.day}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t bg-[linear-gradient(180deg,rgba(21,93,252,0.3)_0%,rgba(21,93,252,0.05)_100%)] transition-all"
                        style={{ height: `${(d.value / maxValue) * 180}px` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-around gap-1 pt-2 text-xs text-[#94A3B8]">
                  {chartData.map((d) => (
                    <span key={d.day}>{d.day}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
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
          <ul className="space-y-2">
            {RECENT_TRANSACTIONS.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 rounded-[14px] border border-transparent px-4 py-3 transition hover:bg-[#F8FAFC]"
              >
                <div className="flex items-center gap-4">
                  <TransactionIcon type={tx.category.toLowerCase()} bg={tx.iconBg} />
                  <div>
                    <p className="font-medium text-[#0F172B]">{tx.merchant}</p>
                    <p className="text-xs text-[#62748E]">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${tx.amount.startsWith("+") ? "text-[#00C950]" : "text-[#0F172B]"}`}
                  >
                    {tx.amount}
                  </p>
                  <p className="text-xs font-normal text-[#90A1B9]">{tx.category}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
