"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAccounts, useTransferHistory } from "@/lib/api/hooks";
import { AccountsSkeleton } from "@/components/skeletons/AccountsSkeleton";
import { InlineError } from "@/components/InlineError";

// --- Animation variants (matching Dashboard) ---
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

type Account = {
  id: string;
  name: string;
  balance: number;
  lastFour: string;
  accountNumber: string;
  routingNumber: string | null;
  interestRate: number | null;
  openedDate: string | null;
  accountType: string;
  ownership: string;
  monthlyFee: number;
  overdraftLimit: number | null;
  dailyTransferLimit: number | null;
  status: string;
};

type Transaction = {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  category: string;
};

function formatBalance(value: number): string {
  return value < 0
    ? `-$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "+";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateString;
  }
}

function formatInterestRate(rate: number | null): string {
  if (rate === null) return "—";
  return `${rate.toFixed(2)}% APY`;
}

const CATEGORY_ICON_BG: Record<string, string> = {
  food: "#FFEDD4",
  coffee: "#FEF3C7",
  income: "#F1F5F9",
  transport: "#EDE9FE",
  utilities: "#D1FAE5",
  transfer: "#F1F5F9",
  shopping: "#E0F2FE",
};

function getIconBg(category: string): string {
  return CATEGORY_ICON_BG[category.toLowerCase()] ?? "#F1F5F9";
}

function getCategoryIcon(category: string): string {
  const cat = category.toLowerCase();
  if (cat === "food") return "food";
  if (cat === "coffee") return "coffee";
  if (cat === "income") return "income";
  if (cat === "transport") return "transport";
  if (cat === "utilities" || cat === "bill") return "bill";
  if (cat === "shopping") return "shopping";
  return "transfer";
}

function TransactionIcon({ type, bg }: { type: string; bg: string }) {
  const cn = "h-10 w-10 shrink-0 rounded-full flex items-center justify-center";
  switch (type) {
    case "food":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-[#F54900]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 8c0-3-2-4-6-4S6 5 6 8" />
            <path d="M6 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
          </svg>
        </div>
      );
    case "coffee":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
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
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
      );
    case "transport":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 17h14v-4H5v4zM5 12l2-4h10l2 4" />
            <circle cx="7.5" cy="17" r="1.5" />
            <circle cx="16.5" cy="17" r="1.5" />
          </svg>
        </div>
      );
    case "bill":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>
      );
    case "shopping":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
      );
    case "transfer":
      return (
        <div className={`${cn}`} style={{ backgroundColor: bg }}>
          <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M7 17L17 7M17 7H7V17" />
          </svg>
        </div>
      );
    default:
      return <div className={`${cn} bg-slate-100`} style={{ backgroundColor: bg || "#F1F5F9" }} />;
  }
}

function mapApiAccountToAccount(a: {
  id: string;
  name: string;
  balance: number;
  lastFour?: string;
  accountNumber?: string;
  routingNumber: string | null;
  interestRate: number | null;
  openedDate: string | null;
  accountType: string;
  ownership?: string;
  monthlyFee: number;
  overdraftLimit: number | null;
  dailyTransferLimit: number | null;
  status: string;
}): Account {
  return {
    id: a.id,
    name: a.name,
    balance: a.balance || 0,
    lastFour: a.lastFour ?? a.accountNumber?.slice(-4) ?? "",
    accountNumber: a.accountNumber ?? "",
    routingNumber: a.routingNumber,
    interestRate: a.interestRate,
    openedDate: a.openedDate,
    accountType: a.accountType,
    ownership: a.ownership || "Individual",
    monthlyFee: a.monthlyFee || 0,
    overdraftLimit: a.overdraftLimit,
    dailyTransferLimit: a.dailyTransferLimit,
    status: a.status || "active",
  };
}

export default function AccountsPage() {
  const [selectedId, setSelectedId] = useState<string>("");
  const [tab, setTab] = useState<"transactions" | "details">("transactions");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: accountsData, isLoading: accountsLoading, isError: accountsError, error: accountsErr, refetch: refetchAccounts } = useAccounts();
  const accounts = (accountsData ?? []).map(mapApiAccountToAccount);

  const effectiveSelectedId =
    (selectedId && accounts.some((a) => a.id === selectedId)) ? selectedId : (accounts[0]?.id ?? "");
  const { data: txData, isLoading: transactionsLoading, isError: transactionsError, error: transactionsErr, refetch: refetchTransactions } = useTransferHistory(effectiveSelectedId || undefined, 50);
  const transactions: Transaction[] = (txData?.transactions ?? []).map((tx) => ({
    id: tx.id,
    merchant: tx.merchant || "Transfer",
    date: tx.timestamp
      ? new Date(tx.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—",
    amount: tx.amount,
    category: tx.category || "transfer",
  }));

  const selected = accounts.find((a) => a.id === effectiveSelectedId);
  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (accountsLoading && !accountsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">Accounts</h1>
        <AccountsSkeleton />
      </div>
    );
  }

  if (accountsError && !accountsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">Accounts</h1>
        <InlineError
          message={accountsErr?.message ?? "Failed to load accounts"}
          onRetry={() => refetchAccounts()}
        />
        <AccountsSkeleton />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">Accounts</h1>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center">
          <p className="text-[#62748E]">You don&apos;t have any accounts yet.</p>
          <Link
            href="/dashboard/accounts"
            className="mt-4 inline-block rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-5 sm:space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.h1
        className="text-xl font-bold text-[#0F172B] sm:text-2xl"
        variants={fadeUp}
        transition={fadeUpTransition}
      >
        Accounts
      </motion.h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,383px)_1fr] lg:gap-6">
        {/* Left: Account cards - horizontal scroll on mobile, vertical on lg */}
        <motion.div variants={stagger}>
          {/* Mobile: horizontal carousel */}
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 scrollbar-hide lg:hidden" style={{ scrollSnapType: "x mandatory" }}>
            {accounts.map((acc) => {
              const isSelected = effectiveSelectedId === acc.id;
              const isDark = isSelected;
              return (
                <motion.button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedId(acc.id)}
                  variants={fadeUp}
                  transition={fadeUpTransition}
                  className={`flex w-full shrink-0 snap-center flex-col gap-3 rounded-2xl border p-4 text-left shadow-sm transition ${
                    isDark
                      ? "border-[#0F172B] bg-[#0F172B] shadow-md"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isDark ? "bg-white/10" : "bg-[#F1F5F9]"
                      }`}
                    >
                      <svg
                        className={`h-4 w-4 ${isDark ? "text-white" : "text-[#45556C]"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                        <path d="M9 22V12h6v10" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-normal ${isDark ? "text-white" : "text-[#45556C]"}`}>{acc.name}</p>
                      <p className={`text-[11px] font-normal ${isDark ? "text-white/60" : "text-[#90A1B9]"}`}>
                        •••• {acc.lastFour}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#45556C]"}`}>
                    {formatBalance(acc.balance)}
                  </p>
                </motion.button>
              );
            })}
          </div>
          {/* Desktop: vertical stack */}
          <div className="hidden flex-col gap-4 lg:flex">
            {accounts.map((acc) => {
              const isSelected = effectiveSelectedId === acc.id;
              const isDark = isSelected;
              return (
                <motion.button
                  key={acc.id}
                  type="button"
                  onClick={() => setSelectedId(acc.id)}
                  variants={fadeUp}
                  transition={fadeUpTransition}
                  whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
                  className={`flex flex-col gap-4 rounded-2xl border p-5 text-left shadow-sm transition ${
                    isDark
                      ? "border-[#0F172B] bg-[#0F172B] shadow-md"
                      : "border-[#E2E8F0] bg-white hover:border-[#CBD5E1]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                        isDark ? "bg-white/10" : "bg-[#F1F5F9]"
                      }`}
                    >
                      <svg
                        className={`h-5 w-5 ${isDark ? "text-white" : "text-[#45556C]"}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                        <path d="M9 22V12h6v10" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-base font-normal ${isDark ? "text-white" : "text-[#45556C]"}`}>{acc.name}</p>
                      <p className={`text-xs font-normal ${isDark ? "text-white/60" : "text-[#90A1B9]"}`}>
                        •••• {acc.lastFour}
                      </p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#45556C]"}`}>
                    {formatBalance(acc.balance)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Right: Detail panel */}
        <motion.div className="flex flex-col gap-6" variants={stagger}>
          {/* Balance card */}
          <motion.div
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6 lg:p-8"
            variants={fadeUp}
            transition={fadeUpTransition}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <div className="mb-4 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-normal uppercase tracking-wider text-[#62748E] sm:text-sm">Current Balance</p>
                <p className="mt-1 text-2xl font-bold leading-tight text-[#0F172B] sm:mt-2 sm:text-[36px]">
                  {selected ? formatBalance(selected.balance) : "$0.00"}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-[#62748E]">
                  <span>Available Balance:</span>
                  <span className="font-medium text-[#314158]">
                    {selected ? formatBalance(selected.balance) : "$0.00"}
                  </span>
                </p>
              </div>
              <div className="mt-3 flex gap-2 sm:mt-0">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href="/dashboard/transfers"
                    className="inline-flex h-[38px] items-center justify-center rounded-[10px] bg-[#155DFC] px-4 text-sm font-medium text-white transition hover:bg-[#1247d4]"
                  >
                    Transfer Funds
                  </Link>
                </motion.div>
                <motion.button
                  type="button"
                  className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#314158] transition hover:bg-[#F8FAFC]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Pay Bills
                </motion.button>
              </div>
            </div>

            {/* Account details row */}
            {selected && (
              <div className="flex flex-wrap gap-4 border-t border-[#F1F5F9] pt-4 sm:gap-6 sm:pt-6">
                <div>
                  <p className="text-xs font-normal text-[#90A1B9]">Account Number</p>
                  <p className="mt-1 font-mono text-sm text-[#314158]">{selected.accountNumber}</p>
                </div>
                {selected.routingNumber && (
                  <div>
                    <p className="text-xs font-normal text-[#90A1B9]">Routing Number</p>
                    <p className="mt-1 font-mono text-sm text-[#314158]">{selected.routingNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-normal text-[#90A1B9]">Status</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded px-2 py-0.5 text-xs font-normal ${
                      selected.status === "active"
                        ? "bg-[#DCFCE7] text-[#016630]"
                        : selected.status === "closed"
                          ? "bg-[#F1F5F9] text-[#62748E]"
                          : "bg-[#FEF3C7] text-[#92400E]"
                    }`}
                  >
                    {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                  </span>
                </div>
                {selected.interestRate !== null && (
                  <div>
                    <p className="text-xs font-normal text-[#90A1B9]">Interest Rate</p>
                    <p className="mt-1 text-sm font-medium text-[#314158]">
                      {formatInterestRate(selected.interestRate)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Tabs + Transactions / Details */}
          <motion.div
            className="flex-1 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
            variants={fadeUp}
            transition={{ ...fadeUpTransition, delay: 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <div className="flex border-b border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setTab("transactions")}
                className={`px-4 py-3 text-sm font-medium transition sm:px-6 sm:py-4 ${
                  tab === "transactions"
                    ? "border-b-2 border-[#155DFC] text-[#155DFC]"
                    : "text-[#62748E] hover:text-[#0F172B]"
                }`}
              >
                Transactions
              </button>
              <button
                type="button"
                onClick={() => setTab("details")}
                className={`px-4 py-3 text-sm font-medium transition sm:px-6 sm:py-4 ${
                  tab === "details"
                    ? "border-b-2 border-[#155DFC] text-[#155DFC]"
                    : "text-[#62748E] hover:text-[#0F172B]"
                }`}
              >
                Details
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {tab === "transactions" && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1">
                      <span className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#90A1B9]">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-[38px] w-full rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] py-2 pl-10 pr-4 text-sm text-[#0F172B] placeholder:text-[#45556C]/50 outline-none focus:border-[#155DFC]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        type="button"
                        className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#45556C] transition hover:bg-[#F8FAFC]"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                        </svg>
                        Filter
                      </motion.button>
                      <motion.button
                        type="button"
                        className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#45556C] transition hover:bg-[#F8FAFC]"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                        </svg>
                        Export
                      </motion.button>
                    </div>
                  </div>

                  {transactionsLoading ? (
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-5">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.85, 1, 0.85] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Image
                          src="/Container.svg"
                          alt="Loading"
                          width={48}
                          height={48}
                          className="h-12 w-12"
                          priority
                        />
                      </motion.div>
                      <motion.div
                        className="h-1 w-24 overflow-hidden rounded-full bg-[#E2E8F0]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        <motion.div
                          className="h-full w-1/3 rounded-full bg-[#155DFC]"
                          animate={{ x: ["0%", "200%"] }}
                          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </motion.div>
                    </div>
                  ) : transactionsError ? (
                    <InlineError
                      message={transactionsErr?.message ?? "Failed to load transactions"}
                      onRetry={() => refetchTransactions()}
                    />
                  ) : filteredTransactions.length === 0 ? (
                    <div className="py-12 text-center text-sm text-[#62748E]">
                      {searchQuery ? "No transactions match your search." : "No transactions yet."}
                    </div>
                  ) : (
                    <ul className="space-y-1">
                      {filteredTransactions.map((tx, i) => (
                        <motion.li
                          key={tx.id}
                          className="flex items-center justify-between gap-3 rounded-[14px] border border-transparent px-2 py-2.5 transition sm:gap-4 sm:px-4 sm:py-3"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ backgroundColor: "rgba(248,250,252,1)", x: 4, transition: { duration: 0.15 } }}
                        >
                          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <TransactionIcon
                              type={getCategoryIcon(tx.category)}
                              bg={getIconBg(tx.category)}
                            />
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
                            <p className="text-[11px] font-normal uppercase text-[#90A1B9] sm:text-xs">{tx.category}</p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === "details" && selected && (
                <div className="flex flex-col gap-8">
                  <div>
                    <h3 className="mb-4 text-base font-semibold text-[#0F172B]">Account Information</h3>
                    <dl className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-normal text-[#62748E]">Opened Date</dt>
                        <dd className="text-sm font-normal text-[#0F172B]">
                          {formatDate(selected.openedDate)}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-normal text-[#62748E]">Account Type</dt>
                        <dd className="text-sm font-medium text-[#0F172B]">
                          {selected.accountType.charAt(0).toUpperCase() + selected.accountType.slice(1)}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-normal text-[#62748E]">Ownership</dt>
                        <dd className="text-sm font-normal text-[#0F172B]">{selected.ownership}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="mb-4 text-base font-semibold text-[#0F172B]">Fees & Limits</h3>
                    <dl className="space-y-4">
                      <div className="flex flex-col gap-1">
                        <dt className="text-sm font-normal text-[#62748E]">Monthly Fee</dt>
                        <dd className="text-sm font-normal text-[#0F172B]">
                          {formatBalance(selected.monthlyFee)}
                        </dd>
                      </div>
                      {selected.overdraftLimit !== null && (
                        <div className="flex flex-col gap-1">
                          <dt className="text-sm font-normal text-[#62748E]">Overdraft Limit</dt>
                          <dd className="text-sm font-normal text-[#0F172B]">
                            {formatBalance(selected.overdraftLimit)}
                          </dd>
                        </div>
                      )}
                      {selected.dailyTransferLimit !== null && (
                        <div className="flex flex-col gap-1">
                          <dt className="text-sm font-normal text-[#62748E]">Daily Transfer Limit</dt>
                          <dd className="text-sm font-normal text-[#0F172B]">
                            {formatBalance(selected.dailyTransferLimit)}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
