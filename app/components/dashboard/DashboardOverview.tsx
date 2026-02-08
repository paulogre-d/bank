"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconAdd,
  IconMore,
  IconChartUp,
  IconEye,
  IconEyeOff,
} from "./icons";
import { useAuthStore } from "@/store/auth";
import type { DashboardAccount } from "@/store/dashboard";
import { useDashboardOverview } from "@/lib/api/hooks";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { InlineError } from "@/components/InlineError";

type AnalyticsPeriod = "thisWeek" | "lastMonth" | "thisYear";

// --- Animation variants ---
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

const cardHover = {
  y: -4,
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

const quickActions = [
  { label: "Transfer", href: "/dashboard/transfers", iconSrc: "/images/quick-actions/transfer.svg", iconColor: "#155DFC" },
  { label: "Pay Bills", href: "/dashboard/accounts", iconSrc: "/images/quick-actions/pay-bills.svg", iconColor: "#E17100" },
  { label: "Loan", href: "/dashboard/loans", iconSrc: "/images/quick-actions/loan.svg", iconColor: "#009966" },
  { label: "Scan QR", href: "/dashboard", iconSrc: "/images/quick-actions/scan-qr.svg", iconColor: "#9810FA" },
  { label: "Statement", href: "/dashboard/accounts", iconSrc: "/images/quick-actions/statement.svg", iconColor: "#4F39F6" },
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
  const cn = "h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-full flex items-center justify-center";
  switch (type) {
    case "food":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-[#F54900] sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8c0-3-2-4-6-4S6 5 6 8" />
            <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
          </svg>
        </div>
      );
    case "coffee":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-amber-700 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
          <svg className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "transport":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-violet-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 17h14v-4H5v4zM5 12l2-4h10l2 4" />
            <circle cx="7.5" cy="17" r="1.5" />
            <circle cx="16.5" cy="17" r="1.5" />
          </svg>
        </div>
      );
    case "bill":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      );
    case "utilities":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-amber-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 2v4l4-2-4-2zM9 8L3 6v12l6-2V8zm4 2v8l6 2V6l-6 4z" />
          </svg>
        </div>
      );
    case "shopping":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-sky-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      );
    case "transfer":
      return (
        <div className={cn} style={{ backgroundColor: bg }}>
          <svg className="h-4 w-4 text-slate-600 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
  balanceVisible,
  onToggleBalance,
}: {
  account: DashboardAccount;
  variant: "blue" | "white" | "dark";
  href: string;
  balanceVisible: boolean;
  onToggleBalance: () => void;
}) {
  const isDark = variant === "dark";
  const isBlue = variant === "blue";
  const balanceStr = formatBalance(account.balance);

  const cardClass =
    variant === "blue"
      ? "overflow-hidden rounded-2xl bg-[linear-gradient(135deg,rgba(21,93,252,1)_0%,rgba(20,71,230,1)_100%)] p-4 shadow-lg transition hover:opacity-95 sm:p-6"
      : variant === "dark"
        ? "overflow-hidden rounded-2xl bg-[#0F172B] p-4 shadow-lg transition hover:opacity-95 sm:p-6"
        : "overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm transition hover:border-[#155DFC]/30 sm:p-6";

  const textPrimary = isDark || isBlue ? "text-white" : "text-[#1D293D]";
  const textSecondary = isDark || isBlue ? "text-white/80" : "text-[#62748E]";
  const textMuted = isDark || isBlue ? "text-white/60" : "text-[#62748E]/60";

  return (
    <motion.div className="h-full" variants={fadeUp} transition={fadeUpTransition} whileHover={cardHover}>
      <Link href={href} className={`block h-full ${cardClass}`}>
        <div className="mb-4 flex items-start justify-between sm:mb-8">
          <div>
            <p className={`text-xs font-normal sm:text-sm ${textSecondary}`}>{account.name}</p>
            <p className={`text-xl font-bold tracking-tight sm:text-2xl ${textPrimary}`}>
              {balanceVisible ? balanceStr : "••••••"}
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleBalance();
              }}
              className={`rounded-full p-1.5 ${isDark || isBlue ? "text-white/80 hover:bg-white/10" : "text-[#62748E] hover:bg-slate-100"}`}
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? (
                <IconEye className={isDark || isBlue ? "text-white" : "text-[#62748E]"} />
              ) : (
                <IconEyeOff className={isDark || isBlue ? "text-white" : "text-[#62748E]"} />
              )}
            </button>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className={`rounded-full p-1.5 ${isDark || isBlue ? "text-white/80 hover:bg-white/10" : "text-[#62748E] hover:bg-slate-100"}`}
              aria-label="More options"
            >
              <IconMore className={isDark || isBlue ? "text-white" : "text-[#62748E]"} />
            </button>
          </div>
        </div>
        <div className="flex items-end justify-between">
          <p className={`text-sm ${textMuted}`}>{balanceVisible ? `•••• ${account.lastFour}` : "•••• ••••"}</p>
          {account.accountType !== "credit" && account.balance >= 0 && (
            <div className="flex items-center gap-2 rounded-full bg-[rgba(0,201,80,0.2)] px-3 py-1">
              <IconChartUp className="text-[#00C950]" />
              <span className="text-sm font-semibold text-[#00C950]">—</span>
            </div>
          )}
          {account.accountType === "credit" && <div className="rounded-full bg-white/10 px-3 py-1 shadow-sm" />}
        </div>
      </Link>
    </motion.div>
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

  // Banner carousel state
  const banners = ["/banner1.jpg", "/banner2.jpg", "/banner3.jpg"];
  const [bannerIndex, setBannerIndex] = useState(0);
  const [bannerDirection, setBannerDirection] = useState(1);

  const goToBanner = useCallback((idx: number) => {
    setBannerDirection(idx > bannerIndex ? 1 : -1);
    setBannerIndex(idx);
  }, [bannerIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBannerDirection(1);
      setBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>("thisWeek");
  const [balanceVisible, setBalanceVisible] = useState(true);
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

  // Mobile carousel state for account cards (must be before early returns)
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const accountCount = Math.min(accounts.length, 3);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const cardWidth = el.scrollWidth / Math.max(accountCount, 1);
      const idx = Math.round(el.scrollLeft / cardWidth);
      setActiveCardIndex(Math.max(0, Math.min(idx, accountCount - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [accountCount]);

  const scrollToCard = useCallback((idx: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / Math.max(accountCount, 1);
    el.scrollTo({ left: idx * cardWidth, behavior: "smooth" });
  }, [accountCount]);

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
  const visibleAccounts = accounts.slice(0, 3);

  return (
    <motion.div
      className="min-w-0 space-y-5 sm:space-y-8"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      {/* Greeting header */}
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        variants={fadeUp}
        transition={fadeUpTransition}
      >
        <div>
          <h1 className="text-xl font-bold text-[#0F172B] sm:text-2xl">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-0.5 text-sm text-[#62748E] sm:mt-1 sm:text-base">
            Here&apos;s what&apos;s happening with your money today.
          </p>
        </div>
        <motion.div className="hidden sm:block" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/dashboard/accounts"
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#0F172B] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1a2744] sm:w-auto sm:text-base"
          >
            <IconAdd className="text-white" />
            Add Account
          </Link>
        </motion.div>
      </motion.div>

      {/* Account cards - carousel on mobile, grid on sm+ */}
      {visibleAccounts.length > 0 ? (
        <motion.div variants={fadeUp} transition={fadeUpTransition}>
          {/* Mobile carousel (hidden on sm+) */}
          <div className="sm:hidden">
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {visibleAccounts.map((acc, i) => (
                <div key={acc.id} className="w-full shrink-0 snap-center">
                  <AccountCard
                    account={acc}
                    variant={cardVariants[i % 3]}
                    href={acc.accountType === "credit" ? "/dashboard/cards" : "/dashboard/accounts"}
                    balanceVisible={balanceVisible}
                    onToggleBalance={() => setBalanceVisible((v) => !v)}
                  />
                </div>
              ))}
            </div>
            {/* Dot indicators */}
            {visibleAccounts.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {visibleAccounts.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToCard(i)}
                    aria-label={`Go to card ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeCardIndex ? "w-6 bg-[#155DFC]" : "w-2 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Desktop grid (hidden on mobile) */}
          <motion.div
            className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3"
            variants={stagger}
          >
            {visibleAccounts.map((acc, i) => (
              <AccountCard
                key={acc.id}
                account={acc}
                variant={cardVariants[i % 3]}
                href={acc.accountType === "credit" ? "/dashboard/cards" : "/dashboard/accounts"}
                balanceVisible={balanceVisible}
                onToggleBalance={() => setBalanceVisible((v) => !v)}
              />
            ))}
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          transition={fadeUpTransition}
          whileHover={{ y: -4, scale: 1.01, transition: { type: "spring", stiffness: 300, damping: 20 } }}
        >
          <Link
            href="/dashboard/accounts"
            className="flex min-h-[160px] items-center justify-center rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-[#62748E] transition hover:border-[#155DFC]/50"
          >
            Add your first account
          </Link>
        </motion.div>
      )}

      {/* Two-column: Quick Actions + Analytics | Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[minmax(0,800px)_1fr]">
        <div className="flex flex-col gap-5 sm:gap-8">
          {/* Quick Actions */}
          <motion.section variants={fadeUp} transition={fadeUpTransition}>
            <h2 className="mb-3 text-base font-bold text-[#0F172B] sm:mb-4 sm:text-lg">Quick Actions</h2>
            <motion.div
              className="flex flex-nowrap gap-3 overflow-x-auto pb-1 scrollbar-hide sm:gap-6"
              variants={stagger}
            >
              {quickActions.map((action) => (
                <motion.div
                  key={action.label}
                  className="shrink-0"
                  variants={fadeUp}
                  transition={fadeUpTransition}
                  whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href={action.href}
                    className="flex shrink-0 flex-col items-center justify-center gap-2 rounded-[18px] border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm transition hover:border-[#155DFC]/30 hover:shadow-md min-h-[90px] min-w-[100px] sm:min-h-[110px] sm:min-w-[142px] sm:px-5 sm:py-4"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] sm:h-12 sm:w-12 sm:rounded-[18px]"
                    
                    >
                      <Image
                        src={action.iconSrc}
                        alt=""
                        width={24}
                        height={24}
                        className="h-5 w-5 sm:h-6 sm:w-6"
                      />
                    </div>
                    <span className="text-center text-[11px] font-normal text-[#45556C] sm:text-xs">
                      {action.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>

          {/* Spending Analytics */}
          <motion.section
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
            variants={fadeUp}
            transition={{ ...fadeUpTransition, delay: 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h2 className="text-base font-bold text-[#0F172B] sm:text-lg">Spending Analytics</h2>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value as AnalyticsPeriod)}
                className="h-9 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-xs font-medium text-[#45556C] focus:border-[#155DFC] focus:outline-none focus:ring-1 focus:ring-[#155DFC] sm:h-10 sm:px-4 sm:text-sm"
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
                <div className="flex h-32 items-end gap-1 sm:h-40">
                  {chartData.map((d, i) => {
                    const barHeight = maxValue > 0 ? Math.min((d.value / maxValue) * 160, 160) : 0;
                    return (
                      <div
                        key={`${d.label}-${i}`}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <motion.div
                          className="w-full cursor-pointer rounded-t bg-[linear-gradient(180deg,rgba(21,93,252,0.3)_0%,rgba(21,93,252,0.05)_100%)]"
                          initial={{ height: 0 }}
                          animate={{ height: `${barHeight}px` }}
                          transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                          style={{ minHeight: "4px" }}
                          whileHover={{ background: "linear-gradient(180deg, rgba(21,93,252,0.6) 0%, rgba(21,93,252,0.15) 100%)", scaleX: 1.08, transition: { duration: 0.2 } }}
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
          </motion.section>
        </div>

        {/* Right column: Banner + Transactions */}
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Ad Banner Carousel */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
            variants={fadeUp}
            transition={fadeUpTransition}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <div className="relative aspect-[16/5] w-full sm:aspect-[25/5]">
              <AnimatePresence mode="wait" custom={bannerDirection}>
                <motion.div
                  key={bannerIndex}
                  className="absolute inset-0"
                  custom={bannerDirection}
                  variants={{
                    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={banners[bannerIndex]}
                    alt={`Promo banner ${bannerIndex + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 400px"
                    priority={bannerIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 ">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToBanner(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === bannerIndex
                      ? "w-6 bg-[#155DFC]"
                      : "w-2 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </motion.div>

        {/* Recent Transactions */}
        <motion.section
          className="flex flex-col overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
          variants={fadeUp}
          transition={{ ...fadeUpTransition, delay: 0.15 }}
          whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
        >
          <div className="mb-3 flex items-center justify-between sm:mb-4">
            <h2 className="text-base font-bold text-[#0F172B] sm:text-lg">Recent Transactions</h2>
            <motion.div whileHover={{ x: 3, transition: { duration: 0.15 } }}>
              <Link
                href="/dashboard/accounts"
                className="flex items-center gap-1 text-sm font-semibold text-[#155DFC] transition hover:underline"
              >
                View All
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
          </div>
          <ul className="max-h-[350px] space-y-1 overflow-y-auto sm:max-h-[500px] sm:space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.slice(0, 10).map((tx, i) => (
                <motion.li
                  key={tx.id}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-transparent px-2 py-2.5 transition sm:gap-4 sm:px-4 sm:py-3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ backgroundColor: "rgba(248,250,252,1)", x: 4, transition: { duration: 0.15 } }}
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <TransactionIcon type={tx.category.toLowerCase()} bg={getIconBg(tx.category)} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#0F172B] sm:text-base">{tx.merchant}</p>
                      <p className="text-[11px] text-[#62748E] sm:text-xs">{tx.date}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold sm:text-base ${tx.amount >= 0 ? "text-[#00C950]" : "text-[#0F172B]"}`}
                    >
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className="text-[11px] font-normal text-[#90A1B9] sm:text-xs">{tx.category}</p>
                  </div>
                </motion.li>
              ))
            ) : (
              <li className="py-8 text-center text-sm text-[#62748E]">No recent transactions</li>
            )}
          </ul>
        </motion.section>
        </div>
      </div>
    </motion.div>
  );
}
