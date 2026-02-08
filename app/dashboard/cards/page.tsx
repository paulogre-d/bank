"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCards, useInvalidateCards, useAccounts, useInvalidateAccounts } from "@/lib/api/hooks";
import { updateCard, fundCard, type CardItem as ApiCard } from "@/lib/api/client";
import { InlineError } from "@/components/InlineError";
import { Toast } from "@/components/Toast";
import Modal from "@/app/components/Modal";

// --- Animation variants (matching Dashboard) ---
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CardsPage() {
  const { data: cards = [], isLoading, isError, error } = useCards();
  const { data: accounts = [] } = useAccounts();
  const invalidateCards = useInvalidateCards();
  const invalidateAccounts = useInvalidateAccounts();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinSubmitting, setPinSubmitting] = useState(false);
  const [fundAccountId, setFundAccountId] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundSubmitting, setFundSubmitting] = useState(false);
  const [freezeSubmitting, setFreezeSubmitting] = useState(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cards.length > 0 && !selectedId) setSelectedId(cards[0].id);
    if (cards.length === 0) setSelectedId(null);
  }, [cards, selectedId]);

  const selected = cards.find((c) => c.id === selectedId) ?? cards[0];
  const selectedIndex = selected ? cards.findIndex((c) => c.id === selected.id) : 0;
  const isFrozen = (id: string) => cards.find((c) => c.id === id)?.status === "frozen";

  const CARD_WIDTH = 380;
  const GAP = 24;

  const scrollToIndex = useCallback(
    (index: number) => {
      if (cards.length === 0) return;
      const idx = Math.max(0, Math.min(index, cards.length - 1));
      setSelectedId(cards[idx].id);
      const el = carouselRef.current;
      if (el) el.scrollTo({ left: idx * (CARD_WIDTH + GAP), behavior: "smooth" });
    },
    [cards]
  );

  useEffect(() => {
    const el = carouselRef.current;
    if (!el || cards.length === 0) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / (CARD_WIDTH + GAP));
      const clamped = Math.max(0, Math.min(idx, cards.length - 1));
      const nextId = cards[clamped].id;
      setSelectedId((prev) => (nextId !== prev ? nextId : prev));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [cards]);

  const toggleFrozen = async (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setFreezeSubmitting(true);
    try {
      await updateCard(id, { status: isFrozen(id) ? "active" : "frozen" });
      await invalidateCards();
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : "Failed to update card");
      setToastVisible(true);
    } finally {
      setFreezeSubmitting(false);
    }
  };

  const copyNumber = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.cardNumber.replace(/\s/g, ""));
      setToastMessage("Card number copied to clipboard");
      setToastVisible(true);
    }
  };

  const handleSetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || pinValue.length < 4 || pinValue !== pinConfirm) return;
    setPinSubmitting(true);
    try {
      await updateCard(selected.id, { pinSet: true });
      setToastMessage("PIN set successfully");
      setToastVisible(true);
      setPinValue("");
      setPinConfirm("");
      setSettingsModalOpen(false);
      await invalidateCards();
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : "Failed to set PIN");
      setToastVisible(true);
    } finally {
      setPinSubmitting(false);
    }
  };

  const handleFundCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !fundAccountId) return;
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      setToastMessage("Enter a valid amount");
      setToastVisible(true);
      return;
    }
    setFundSubmitting(true);
    try {
      await fundCard(selected.id, fundAccountId, amount);
      setToastMessage(`Card funded with ${formatCurrency(amount)}`);
      setToastVisible(true);
      setFundAmount("");
      setFundAccountId("");
      setSettingsModalOpen(false);
      await invalidateCards();
      invalidateAccounts();
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : "Failed to fund card");
      setToastVisible(true);
    } finally {
      setFundSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#155DFC] border-t-transparent" />
        <p className="mt-4 text-sm text-[#62748E]">Loading cards…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">Cards Management</h1>
        <InlineError message={error?.message ?? "Failed to load cards"} />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#0F172B]">Cards Management</h1>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#E2E8F0] bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F5F9]">
            <svg
              className="h-7 w-7 text-[#94A3B8]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="2" y="4" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <p className="mt-4 text-base font-medium text-[#0F172B]">No cards yet</p>
          <p className="mt-1 text-sm text-[#62748E]">
            Cards are created by your bank. Contact support or check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        variants={fadeUp}
        transition={fadeUpTransition}
      >
        <h1 className="text-xl font-bold text-[#0F172B] sm:text-2xl">Cards Management</h1>
        <button
          type="button"
          disabled
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#E2E8F0] px-5 text-sm font-medium text-[#94A3B8] cursor-not-allowed"
          title="New cards are issued by your bank"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Virtual Card
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
        <motion.div className="flex flex-col gap-6" variants={stagger}>
          <motion.div className="relative" variants={fadeUp} transition={fadeUpTransition}>
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {cards.map((card: ApiCard, index: number) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className={`relative min-w-[280px] shrink-0 snap-center overflow-hidden rounded-2xl sm:min-w-[380px] ${
                    cards.length > 1 && selectedId === card.id
                      ? "ring-2 ring-[#155DFC] ring-offset-2"
                      : ""
                  }`}
                  style={{ scrollSnapAlign: "center" }}
                >
                  {cards.length > 1 && selectedId === card.id && (
                    <span className="absolute top-3 right-3 z-10 rounded-full bg-[#155DFC] px-2.5 py-1 text-xs font-medium text-white">
                      Selected
                    </span>
                  )}
                  {isFrozen(card.id) && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/90 backdrop-blur-sm">
                      <span className="rounded-lg bg-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#62748E]">
                        Card Frozen
                      </span>
                    </div>
                  )}
                  <div className="relative overflow-hidden rounded-2xl bg-[#0F172B] p-6 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-md bg-gradient-to-br from-amber-400 to-amber-600" />
                        <svg
                          className="h-6 w-6 text-white/90"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <path d="M6 12c0-4 2-6 6-6s6 2 6 6" />
                          <path d="M8 12c0-2.5 1.5-4 4-4s4 1.5 4 4" />
                          <path d="M10 12a2 2 0 1 1 4 0" />
                        </svg>
                      </div>
                      <span className="text-lg font-bold tracking-wide text-white">VISA</span>
                    </div>
                    <p className="mt-10 font-mono text-lg tracking-[0.2em] text-white">
                      {card.cardNumber}
                    </p>
                    <div className="mt-6 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-white/60">Card Holder</p>
                        <p className="text-sm font-medium text-white">{card.cardHolder}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">Expires</p>
                        <p className="font-mono text-sm text-white">{card.expiry}</p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {cards.map((card: ApiCard, index: number) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  aria-label={`Go to card ${index + 1}`}
                  className={`h-2 rounded-full transition ${
                    selectedId === card.id
                      ? "w-6 bg-[#0F172B]"
                      : "w-2 border border-[#E2E8F0] bg-white"
                  }`}
                />
              ))}
            </div>
          </motion.div>

          {selected && (
            <motion.div
              className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
              variants={fadeUp}
              transition={{ ...fadeUpTransition, delay: 0.1 }}
            >
              <h2 className="mb-3 text-sm font-semibold text-[#0F172B] sm:mb-4 sm:text-base">Card Controls</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                <button
                  type="button"
                  onClick={() => toggleFrozen(selected.id)}
                  disabled={freezeSubmitting}
                  className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:bg-[#F8FAFC] disabled:opacity-50"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEE2E2]">
                    <svg
                      className="h-6 w-6 text-[#DC2626]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <span className="text-center text-sm font-medium text-[#314158]">
                    {freezeSubmitting ? "Updating…" : isFrozen(selected.id) ? "Unfreeze Card" : "Freeze Card"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(true)}
                  className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF]">
                    <svg
                      className="h-6 w-6 text-[#155DFC]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <span className="text-center text-sm font-medium text-[#314158]">Card Settings</span>
                </button>
                <button
                  type="button"
                  className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5F9]">
                    <svg
                      className="h-6 w-6 text-[#64748B]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="text-center text-sm font-medium text-[#314158]">View PIN</span>
                </button>
                <button
                  type="button"
                  onClick={copyNumber}
                  className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:bg-[#F8FAFC]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1F5F9]">
                    <svg
                      className="h-6 w-6 text-[#64748B]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </div>
                  <span className="text-center text-sm font-medium text-[#314158]">Copy Number</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>


        {selected && (
          <motion.div className="flex flex-col gap-4 sm:gap-6" variants={stagger}>
            <motion.div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6" variants={fadeUp} transition={fadeUpTransition}>
              <h2 className="mb-3 text-sm font-semibold text-[#0F172B] sm:mb-4 sm:text-base">Card Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-normal text-[#62748E]">Current Balance</p>
                  <p className="mt-1 text-xl font-bold text-[#0F172B]">{formatCurrency(selected.balance)}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#62748E]">Credit Limit</p>
                  <p className="mt-1 text-base font-medium text-[#0F172B]">{formatCurrency(selected.limit)}</p>
                </div>
                <div>
                  <p className="text-xs font-normal text-[#62748E]">Status</p>
                  <span
                    className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                      isFrozen(selected.id)
                        ? "bg-[#FEF3C7] text-[#92400E]"
                        : "bg-[#DCFCE7] text-[#016630]"
                    }`}
                  >
                    {isFrozen(selected.id) ? "Frozen" : selected.status === "active" ? "Active" : selected.status}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6" variants={fadeUp} transition={{ ...fadeUpTransition, delay: 0.05 }}>
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <svg
                  className="h-5 w-5 text-[#155DFC]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h2 className="text-base font-semibold text-[#0F172B]">Spending Limits</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#62748E]">Online Transactions</span>
                    <span className="font-medium text-[#0F172B]">
                      {formatCurrency(selected.onlineUsed)} / month
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#155DFC]"
                      style={{
                        width: `${Math.min(100, selected.onlineLimit ? (selected.onlineUsed / selected.onlineLimit) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-[#62748E]">ATM Withdrawals</span>
                    <span className="font-medium text-[#0F172B]">
                      {formatCurrency(selected.atmUsed)} / day
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#155DFC]"
                      style={{
                        width: `${Math.min(100, selected.atmLimit ? (selected.atmUsed / selected.atmLimit) * 100 : 0)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-4 sm:p-6" variants={fadeUp} transition={{ ...fadeUpTransition, delay: 0.1 }}>
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FED7AA]">
                  <svg
                    className="h-5 w-5 text-[#C2410C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0F172B]">Lost or Stolen Card?</h3>
                  <p className="mt-2 text-sm text-[#62748E]">
                    If your card is lost or stolen, lock it immediately to prevent unauthorized access.
                  </p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#155DFC] hover:underline"
                  >
                    Report an Issue
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      <Modal
        isOpen={settingsModalOpen}
        onClose={() => {
          setSettingsModalOpen(false);
          setPinValue("");
          setPinConfirm("");
          setFundAmount("");
          setFundAccountId("");
        }}
        contentClassName="max-w-md"
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-[#0F172B]">Card Settings</h2>
          <p className="mt-1 text-sm text-[#62748E]">Set PIN or add funds to your card</p>

          <form onSubmit={handleSetPin} className="mt-6 border-b border-[#F1F5F9] pb-6">
            <h3 className="text-sm font-semibold text-[#0F172B]">Set PIN</h3>
            <p className="mt-1 text-xs text-[#62748E]">Use a 4-digit PIN for ATM and in-store use</p>
            <div className="mt-3 flex gap-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="PIN"
                value={pinValue}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Confirm"
                value={pinConfirm}
                onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              />
            </div>
            <button
              type="submit"
              disabled={pinValue.length < 4 || pinValue !== pinConfirm || pinSubmitting}
              className="mt-3 h-10 rounded-xl bg-[#155DFC] px-4 text-sm font-medium text-white transition hover:bg-[#1247d4] disabled:opacity-50"
            >
              {pinSubmitting ? "Setting…" : "Set PIN"}
            </button>
          </form>

          <form onSubmit={handleFundCard} className="mt-6">
            <h3 className="text-sm font-semibold text-[#0F172B]">Fund Card</h3>
            <p className="mt-1 text-xs text-[#62748E]">Transfer from an account to this card balance</p>
            <div className="mt-3 space-y-3">
              <select
                value={fundAccountId}
                onChange={(e) => setFundAccountId(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} · •••• {acc.lastFour} — {formatCurrency(acc.balance)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none focus:ring-2 focus:ring-[#155DFC]/20"
              />
            </div>
            <button
              type="submit"
              disabled={!fundAccountId || !fundAmount || fundSubmitting}
              className="mt-3 h-10 rounded-xl bg-[#155DFC] px-4 text-sm font-medium text-white transition hover:bg-[#1247d4] disabled:opacity-50"
            >
              {fundSubmitting ? "Adding…" : "Add Funds"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            className="mt-4 w-full rounded-xl border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-[#314158] hover:bg-[#F8FAFC]"
          >
            Close
          </button>
        </div>
      </Modal>

      <Toast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </motion.div>
  );
}
