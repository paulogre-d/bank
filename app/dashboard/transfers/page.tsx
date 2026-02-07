"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import TransferSuccessModal from "@/app/components/TransferSuccessModal";
import { getAuthHeader } from "@/lib/auth/client";
import { useAccounts, useInvalidateDashboard, useInvalidateAccounts } from "@/lib/api/hooks";
import { TRANSACTION_CATEGORIES } from "@/lib/constants/transactions";
import { TransfersSkeleton } from "@/components/skeletons/TransfersSkeleton";
import { InlineError } from "@/components/InlineError";

type AccountOption = { id: string; name: string; lastFour: string; balance: string };

function AccountSelect({
  accounts,
  value,
  onChange,
  label,
  fromAccount,
  bgGray = false,
}: {
  accounts: AccountOption[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  fromAccount?: string;
  bgGray?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = accounts.find((a) => a.id === value) ?? accounts[0];
  const options = fromAccount ? accounts.filter((a) => a.id !== fromAccount) : accounts;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative flex flex-col gap-4">
      <label className="text-sm font-normal text-[#314158]">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-4 rounded-[14px] border border-[#E2E8F0] px-4 py-3 text-left transition ${
          bgGray ? "bg-[#F8FAFC]" : "bg-white shadow-sm"
        }`}
      >
        <div>
          <p className="text-base font-normal text-[#0F172B]">{selected.name}</p>
          <p className="text-xs font-normal text-[#62748E]">•••• {selected.lastFour}</p>
        </div>
        <p className="text-base font-bold text-[#0F172B]">{selected.balance}</p>
        <svg className="h-4 w-4 shrink-0 text-[#62748E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-auto rounded-[14px] border border-[#E2E8F0] bg-white shadow-lg">
          {options.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => {
                onChange(acc.id);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-4 border-b border-[#F1F5F9] px-4 py-3 text-left last:border-0 hover:bg-[#F8FAFC]"
            >
              <div>
                <p className="text-base font-normal text-[#0F172B]">{acc.name}</p>
                <p className="text-xs font-normal text-[#62748E]">•••• {acc.lastFour}</p>
              </div>
              <p className="text-base font-bold text-[#0F172B]">{acc.balance}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBalance(value: number): string {
  return value < 0
    ? `-$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TRANSFER_TYPES = [
  { id: "internal", label: "Internal Transfer", subtitle: "Between your accounts", icon: "/images/transfers/internal-transfer.svg" },
  { id: "person", label: "Send to Person", subtitle: "To friends & family", icon: "/images/transfers/send-to-person.svg" },
  { id: "wire", label: "Wire Transfer", subtitle: "To other banks", icon: "/images/transfers/wire-transfer.svg" },
];

const FREQUENCY_OPTIONS = ["One-time Transfer", "Weekly", "Monthly"];

const BANKS = ["Lead Bank", "Chase", "Bank of America", "Wells Fargo", "Citibank"];

export default function TransfersPage() {
  const invalidateDashboard = useInvalidateDashboard();
  const invalidateAccounts = useInvalidateAccounts();

  const { data: accountsData, isLoading: accountsLoading, isError: accountsError, error: accountsErr, refetch: refetchAccounts } = useAccounts();
  const accounts: AccountOption[] = (accountsData ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    lastFour: a.lastFour ?? a.accountNumber?.slice(-4) ?? "",
    balance: formatBalance(a.balance),
  }));

  const [transferType, setTransferType] = useState("internal");
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("One-time Transfer");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("Transfer");
  const [toAccountNumber, setToAccountNumber] = useState("");
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryValidating, setBeneficiaryValidating] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);

  const [destinationBank, setDestinationBank] = useState("Lead Bank");
  const [routingNumber, setRoutingNumber] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastReferenceId, setLastReferenceId] = useState("");
  const [lastTransferAmount, setLastTransferAmount] = useState("");
  const [lastTransferDate, setLastTransferDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  const internalAccounts = accounts.filter((a) => {
    const id = a.id.toLowerCase();
    return !id.includes("credit") && !id.includes("visa");
  });
  const fromAcc = accounts.find((a) => a.id === fromAccount) ?? internalAccounts[0];
  const toAcc = accounts.find((a) => a.id === toAccount) ?? internalAccounts[1];

  useEffect(() => {
    if (accountsData && accountsData.length > 0 && !fromAccount) {
      const list = accountsData;
      const checking = list.find((a) => a.name.toLowerCase().includes("checking")) ?? list[0];
      const savings = list.find((a) => a.name.toLowerCase().includes("savings")) ?? list[1];
      setFromAccount(checking.id);
      setToAccount(savings.id === checking.id ? list.find((a) => a.id !== checking.id)?.id ?? list[0].id : savings.id);
    }
  }, [accountsData, fromAccount]);

  const validateBeneficiary = useCallback(async (accountNumber: string) => {
    if (accountNumber.length !== 12) {
      setBeneficiaryName("");
      setBeneficiaryError(null);
      return;
    }
    setBeneficiaryValidating(true);
    setBeneficiaryError(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/transfers/validate-beneficiary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ accountNumber }),
      });
      const json = await res.json();
      if (json.success && json.data?.isValid) {
        setBeneficiaryName(json.data.beneficiaryName ?? "");
        setBeneficiaryError(null);
      } else {
        setBeneficiaryName("");
        setBeneficiaryError(json.error || "Account not found");
      }
    } catch (e: unknown) {
      setBeneficiaryName("");
      setBeneficiaryError(e instanceof Error ? e.message : "Validation failed");
    } finally {
      setBeneficiaryValidating(false);
    }
  }, []);

  useEffect(() => {
    const num = toAccountNumber.replace(/\D/g, "");
    if (num.length === 12) validateBeneficiary(num);
    else {
      setBeneficiaryName("");
      setBeneficiaryError(null);
    }
  }, [toAccountNumber, validateBeneficiary]);

  const handleFromChange = (id: string) => {
    setFromAccount(id);
    if (id === toAccount) {
      const other = internalAccounts.find((a) => a.id !== id);
      setToAccount(other?.id ?? internalAccounts[0]?.id ?? "");
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(val);
  };

  const formatAmount = () => {
    if (!amount || amount === ".") return "$0.00";
    const num = parseFloat(amount);
    if (isNaN(num)) return "$0.00";
    return "$" + num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatReviewDate = () => {
    if (!date) return new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
  };

  const getToLabel = () => {
    if (transferType === "internal") return toAcc ? `${toAcc.name} (${toAcc.lastFour})` : "—";
    if (transferType === "person") return beneficiaryName || (toAccountNumber ? `•••• ${toAccountNumber.slice(-4)}` : "—");
    if (transferType === "wire") return toAccountNumber ? `•••• ${toAccountNumber.slice(-4)}` : "—";
    return "—";
  };

  const amountNum = parseFloat(amount) || 0;
  const canReviewInternal = transferType === "internal" && fromAccount && toAccount && fromAccount !== toAccount && amountNum > 0;
  const canReviewPerson = transferType === "person" && fromAccount && toAccountNumber.replace(/\D/g, "").length === 12 && beneficiaryName && amountNum > 0;
  const canReview = (transferType === "internal" && canReviewInternal) || (transferType === "person" && canReviewPerson);

  const handleReviewTransfer = () => {
    setTransferError(null);
    if (canReview) setShowReview(true);
  };
  const handleBack = () => {
    setShowReview(false);
    setTransferError(null);
  };

  const handleConfirmTransfer = async () => {
    setTransferError(null);
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      const scheduledDate = date ? new Date(date).toISOString().split("T")[0] : null;

      if (transferType === "internal") {
        const res = await fetch("/api/transfers/internal", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            fromAccountId: fromAccount,
            toAccountId: toAccount,
            amount: amountNum,
            frequency,
            scheduledDate,
            category: category || undefined,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          setTransferError(json.error || "Transfer failed");
          return;
        }
        const refId = json.data?.referenceId ?? json.data?.transactionId ?? "unknown";
        setLastReferenceId(refId.startsWith("TRX-") ? refId : `TRX-${refId}`);
      } else if (transferType === "person") {
        const num = toAccountNumber.replace(/\D/g, "");
        const res = await fetch("/api/transfers/send-to-person", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            fromAccountId: fromAccount,
            toAccountNumber: num,
            amount: amountNum,
            frequency,
            scheduledDate,
            category: category || undefined,
          }),
        });
        const json = await res.json();
        if (!json.success) {
          setTransferError(json.error || "Transfer failed");
          return;
        }
        const refId = json.data?.referenceId ?? json.data?.transactionId ?? "unknown";
        setLastReferenceId(refId.startsWith("TRX-") ? refId : `TRX-${refId}`);
      } else {
        setTransferError("Wire transfer is not available yet.");
        return;
      }

      setLastTransferAmount(
        "$" + amountNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      );
      setLastTransferDate(
        date
          ? new Date(date).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
          : new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
      );
      setShowReview(false);
      setShowSuccessModal(true);
      setAmount("");
      invalidateDashboard();
      invalidateAccounts();
    } catch (e: unknown) {
      setTransferError(e instanceof Error ? e.message : "Transfer failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const handleMakeAnotherTransfer = () => {
    setShowSuccessModal(false);
    setAmount("");
  };

  const hasAccounts = (accountsData?.length ?? 0) > 0;
  if (accountsLoading && !hasAccounts) {
    return (
      <div className="flex flex-col gap-8 px-0 pt-0 md:px-0 md:pt-0">
        <h1 className="text-2xl font-bold text-[#0F172B]">Move Money</h1>
        <TransfersSkeleton />
      </div>
    );
  }

  if (accountsError && !hasAccounts) {
    return (
      <div className="flex flex-col gap-8 px-0 pt-0 md:px-0 md:pt-0">
        <h1 className="text-2xl font-bold text-[#0F172B]">Move Money</h1>
        <InlineError
          message={accountsErr?.message ?? "Failed to load accounts"}
          onRetry={() => refetchAccounts()}
        />
        <TransfersSkeleton />
      </div>
    );
  }

  if (!accountsLoading && accounts.length === 0) {
    return (
      <div className="flex flex-col gap-8 px-0 pt-0 md:px-0 md:pt-0">
        <h1 className="text-2xl font-bold text-[#0F172B]">Move Money</h1>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 text-center">
          <p className="text-[#62748E]">Add an account to make transfers.</p>
          <Link
            href="/dashboard/accounts"
            className="mt-4 inline-block rounded-lg bg-[#155DFC] px-4 py-2 text-sm font-medium text-white"
          >
            Go to Accounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 px-0 pt-0 md:px-0 md:pt-0">
      <h1 className="text-2xl font-bold text-[#0F172B]">Move Money</h1>

      {/* Transfer type cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {TRANSFER_TYPES.map((type) => {
          const isSelected = transferType === type.id;
          const isInternal = type.id === "internal";
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setTransferType(type.id);
                setShowReview(false);
              }}
              className={`flex h-[150px] flex-col items-start rounded-2xl border p-6 text-left transition ${
                isSelected
                  ? "border-[#155DFC] bg-[#155DFC] shadow-[0px_4px_6px_-4px_rgba(21,93,252,0.2),0px_10px_15px_-3px_rgba(21,93,252,0.2)]"
                  : "border-[#E2E8F0] bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] hover:border-[#CBD5E1]"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  !isSelected && isInternal ? "bg-[#DBEAFE]" : !isSelected ? "bg-[#F1F5F9]" : ""
                }`}
              >
                <Image
                  src={type.icon}
                  alt=""
                  width={32}
                  height={32}
                  className={isSelected ? "brightness-0 invert" : ""}
                />
              </div>
              <p
                className={`mt-5 text-lg font-bold ${
                  isSelected ? "text-white" : "text-[#45556C]"
                }`}
              >
                {type.label}
              </p>
              <p
                className={`mt-1 text-sm font-normal ${
                  isSelected ? "text-[#DBEAFE]" : "text-[#62748E]"
                }`}
              >
                {type.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Review Transaction card - shows when Review Transfer clicked */}
      {showReview && (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white px-8 py-0 shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)] md:px-16">
          <div className="flex flex-col gap-6 py-8">
            <h2 className="text-center text-xl font-bold text-[#0F172B]">Review Transaction</h2>
            <div className="rounded-2xl bg-[#F8FAFC] p-6">
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                  <span className="text-base font-normal text-[#62748E]">Amount</span>
                  <span className="text-2xl font-bold text-[#0F172B]">{formatAmount()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-normal text-[#62748E]">From</span>
                  <span className="text-base font-normal text-[#0F172B]">{fromAcc.name} ({fromAcc.lastFour})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-normal text-[#62748E]">To</span>
                  <span className="text-base font-normal text-[#0F172B]">{getToLabel()}</span>
                </div>
                {transferType === "wire" && (destinationBank || routingNumber) && (
                  <>
                    {destinationBank && (
                      <div className="flex items-center justify-between">
                        <span className="text-base font-normal text-[#62748E]">Destination Bank</span>
                        <span className="text-base font-normal text-[#0F172B]">{destinationBank}</span>
                      </div>
                    )}
                    {routingNumber && (
                      <div className="flex items-center justify-between">
                        <span className="text-base font-normal text-[#62748E]">Routing/SWIFT</span>
                        <span className="text-base font-normal text-[#0F172B]">••••{routingNumber.slice(-4)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-base font-normal text-[#62748E]">Date</span>
                  <span className="text-base font-normal text-[#0F172B]">{formatReviewDate()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-normal text-[#62748E]">Fee</span>
                  <span className="text-base font-normal text-[#00A63E]">$0.00</span>
                </div>
              </div>
            </div>
            {transferError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {transferError}
              </div>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="h-12 flex-1 rounded-[14px] bg-transparent text-base font-normal text-[#45556C] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={submitting}
                className="h-12 flex-1 rounded-[14px] bg-[#0F172B] text-base font-bold text-white transition hover:bg-[#1E293B] disabled:opacity-50"
              >
                {submitting ? "Processing…" : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form card - Internal Transfer */}
      {transferType === "internal" && !showReview && (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-8 p-8">
            {/* From / To Account row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AccountSelect
                accounts={internalAccounts}
                value={fromAccount}
                onChange={handleFromChange}
                label="From Account"
                bgGray
              />
              <AccountSelect
                accounts={internalAccounts}
                value={toAccount}
                onChange={(id) => setToAccount(id)}
                label="To Account"
                fromAccount={fromAccount}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-[#F1F5F9]" />

            {/* Amount, Frequency, Date */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-center text-sm font-normal text-[#314158]">
                  Amount to Transfer
                </label>
                <div className="relative flex h-[74px] items-center">
                  <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
                    <Image
                      src="/images/transfers/amount-dollar.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="opacity-60"
                    />
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="h-full w-full rounded-2xl border border-[#E2E8F0] bg-white pl-14 pr-4 text-center text-[36px] font-bold leading-tight text-[#0F172B] placeholder:text-[#E2E8F0] outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="h-12 rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-sm font-normal text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Date</label>
                  <div className="relative flex h-12 items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-full w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 pr-10 text-sm text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#90A1B9]">
                      <Image
                        src="/images/transfers/calendar.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Category (optional)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-12 rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-sm font-normal text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                  >
                    {TRANSACTION_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReviewTransfer}
                disabled={!canReviewInternal}
                className="h-14 w-full rounded-[14px] bg-[#155DFC] text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(21,93,252,0.2),0px_10px_15px_-3px_rgba(21,93,252,0.2)] transition hover:bg-[#1247d4] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form card - Send to Person */}
      {transferType === "person" && !showReview && (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-8 p-8">
            {/* From Account / To Account row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AccountSelect
                accounts={internalAccounts}
                value={fromAccount}
                onChange={handleFromChange}
                label="From Account"
                bgGray
              />
              <div className="flex flex-col gap-4">
                <label className="text-sm font-normal text-[#314158]">To Account Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="12-digit account number"
                  className="h-14 w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-base font-normal text-[#0F172B] outline-none placeholder:text-[#45556C]/50 focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                />
                {beneficiaryValidating && (
                  <p className="text-xs text-[#62748E]">Checking account...</p>
                )}
                {beneficiaryName && !beneficiaryValidating && (
                  <p className="text-sm font-medium text-[#0F172B]">{beneficiaryName}</p>
                )}
                {beneficiaryError && !beneficiaryValidating && (
                  <p className="text-sm text-red-600">{beneficiaryError}</p>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F1F5F9]" />

            {/* Amount, Frequency, Date */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-center text-sm font-normal text-[#314158]">
                  Amount to Transfer
                </label>
                <div className="relative flex h-[74px] items-center">
                  <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
                    <Image
                      src="/images/transfers/amount-dollar.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="opacity-60"
                    />
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="h-full w-full rounded-2xl border border-[#E2E8F0] bg-white pl-14 pr-4 text-center text-[36px] font-bold leading-tight text-[#0F172B] placeholder:text-[#E2E8F0] outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="h-12 rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-sm font-normal text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Date</label>
                  <div className="relative flex h-12 items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-full w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 pr-10 text-sm text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#90A1B9]">
                      <Image
                        src="/images/transfers/calendar.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Category (optional)</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-12 rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-sm font-normal text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                  >
                    {TRANSACTION_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReviewTransfer}
                disabled={!canReviewPerson}
                className="h-14 w-full rounded-[14px] bg-[#155DFC] text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(21,93,252,0.2),0px_10px_15px_-3px_rgba(21,93,252,0.2)] transition hover:bg-[#1247d4] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form card - Wire Transfer */}
      {transferType === "wire" && !showReview && (
        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-8 p-8">
            {/* Row 1: From Account | To Account */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <AccountSelect
                accounts={internalAccounts}
                value={fromAccount}
                onChange={handleFromChange}
                label="From Account"
                bgGray
              />
              <div className="flex flex-col gap-4">
                <label className="text-sm font-normal text-[#314158]">To Account</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 18))}
                  placeholder="Account number"
                  className="h-14 w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-base font-normal text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                />
              </div>
            </div>

            {/* Row 2: Destination Bank | Routing Number/SWIFT */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-normal text-[#314158]">Destination Bank</label>
                <div className="relative">
                  <select
                    value={destinationBank}
                    onChange={(e) => setDestinationBank(e.target.value)}
                    className="h-14 w-full appearance-none rounded-[14px] border border-[#E2E8F0] bg-white px-4 pr-12 text-base font-normal text-[#0F172B] outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  >
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-6 w-6 -translate-y-1/2 text-[#141B34]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-sm font-normal text-[#314158]">Routing Number/SWIFT</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="Routing or SWIFT code"
                  className="h-14 w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-base font-normal text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#F1F5F9]" />

            {/* Amount, Frequency, Date */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-center text-sm font-normal text-[#314158]">
                  Amount to Transfer
                </label>
                <div className="relative flex h-[74px] items-center">
                  <span className="absolute left-4 top-1/2 z-10 -translate-y-1/2">
                    <Image
                      src="/images/transfers/amount-dollar.svg"
                      alt=""
                      width={32}
                      height={32}
                      className="opacity-60"
                    />
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="h-full w-full rounded-2xl border border-[#E2E8F0] bg-white pl-14 pr-4 text-center text-[36px] font-bold leading-tight text-[#0F172B] placeholder:text-[#E2E8F0] outline-none focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="h-12 rounded-[14px] border border-[#E2E8F0] bg-white px-4 text-sm font-normal text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                  >
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-normal uppercase text-[#62748E]">Date</label>
                  <div className="relative flex h-12 items-center">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-full w-full rounded-[14px] border border-[#E2E8F0] bg-white px-4 pr-10 text-sm text-[#45556C] shadow-sm outline-none focus:border-[#155DFC]"
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#90A1B9]">
                      <Image
                        src="/images/transfers/calendar.svg"
                        alt=""
                        width={16}
                        height={16}
                      />
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReviewTransfer}
                className="h-14 w-full rounded-[14px] bg-[#155DFC] text-base font-bold text-white shadow-[0px_4px_6px_-4px_rgba(21,93,252,0.2),0px_10px_15px_-3px_rgba(21,93,252,0.2)] transition hover:bg-[#1247d4]"
              >
                Review Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      <TransferSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        amount={lastTransferAmount}
        date={lastTransferDate}
        referenceId={lastReferenceId}
        transferType={transferType as "internal" | "person" | "wire"}
        fromAccount={fromAcc ? { name: fromAcc.name, lastFour: fromAcc.lastFour } : undefined}
        toAccount={
          transferType === "internal"
            ? toAcc
              ? { name: toAcc.name, lastFour: toAcc.lastFour }
              : undefined
            : transferType === "person"
              ? { name: beneficiaryName, accountNumber: toAccountNumber.replace(/\D/g, "") }
              : undefined
        }
        beneficiaryName={transferType === "person" ? beneficiaryName : undefined}
        onMakeAnother={handleMakeAnotherTransfer}
      />
    </div>
  );
}
