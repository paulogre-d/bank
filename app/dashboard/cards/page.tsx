"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CardItem = {
  id: string;
  name: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  balance: string;
  limit: string;
  onlineUsed: number;
  onlineLimit: number;
  atmUsed: number;
  atmLimit: number;
};

const CARDS: CardItem[] = [
  {
    id: "visa-1",
    name: "Visa Infinite",
    cardNumber: "4885 6789 8960 9876",
    cardHolder: "David Vwaire",
    expiry: "12/28",
    balance: "$1,250",
    limit: "$25,000",
    onlineUsed: 3200,
    onlineLimit: 5000,
    atmUsed: 180,
    atmLimit: 500,
  },
  {
    id: "visa-2",
    name: "Premium Debit",
    cardNumber: "4885 6789 8960 4589",
    cardHolder: "David Vwaire",
    expiry: "08/27",
    balance: "$12,450",
    limit: "$15,000",
    onlineUsed: 1200,
    onlineLimit: 5000,
    atmUsed: 200,
    atmLimit: 500,
  },
];

export default function CardsPage() {
  const [selectedId, setSelectedId] = useState(CARDS[0].id);
  const [frozenIds, setFrozenIds] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  const selected = CARDS.find((c) => c.id === selectedId) ?? CARDS[0];
  const selectedIndex = CARDS.findIndex((c) => c.id === selectedId);
  const isFrozen = (id: string) => frozenIds.has(id);

  const CARD_WIDTH = 380;
  const GAP = 24;

  const scrollToIndex = useCallback((index: number) => {
    const idx = Math.max(0, Math.min(index, CARDS.length - 1));
    setSelectedId(CARDS[idx].id);
    const el = carouselRef.current;
    if (el) {
      el.scrollTo({ left: idx * (CARD_WIDTH + GAP), behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / (CARD_WIDTH + GAP));
      const clamped = Math.max(0, Math.min(idx, CARDS.length - 1));
      setSelectedId((prev) => (CARDS[clamped].id !== prev ? CARDS[clamped].id : prev));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const toggleFrozen = (id: string) => {
    setFrozenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyNumber = () => {
    navigator.clipboard.writeText(selected.cardNumber.replace(/\s/g, ""));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">Cards Management</h1>
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1247d4]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Virtual Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column: Card carousel + Card Controls */}
        <div className="flex flex-col gap-6">
          {/* Virtual Card Carousel */}
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth scrollbar-hide"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {CARDS.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => scrollToIndex(index)}
                  className="relative min-w-[340px] shrink-0 snap-center overflow-hidden rounded-2xl sm:min-w-[380px]"
                  style={{ scrollSnapAlign: "center" }}
                >
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
              {CARDS.map((card, index) => (
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
          </div>

          {/* Card Controls */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#0F172B]">Card Controls</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => toggleFrozen(selected.id)}
                className="flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:bg-[#F8FAFC]"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    isFrozen(selected.id) ? "bg-[#FEE2E2]" : "bg-[#FEE2E2]"
                  }`}
                >
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
                  {isFrozen(selected.id) ? "Unfreeze Card" : "Freeze Card"}
                </span>
              </button>
              <button
                type="button"
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
          </div>
        </div>

        {/* Right column: Card Details + Spending Limits + Alert */}
        <div className="flex flex-col gap-6">
          {/* Card Details */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#0F172B]">Card Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-normal text-[#62748E]">Current Balance</p>
                <p className="mt-1 text-xl font-bold text-[#0F172B]">{selected.balance}</p>
              </div>
              <div>
                <p className="text-xs font-normal text-[#62748E]">Credit Limit</p>
                <p className="mt-1 text-base font-medium text-[#0F172B]">{selected.limit}</p>
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
                  {isFrozen(selected.id) ? "Frozen" : "Active"}
                </span>
              </div>
            </div>
          </div>

          {/* Spending Limits */}
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
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
                    ${selected.onlineUsed.toLocaleString()} / month
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#155DFC]"
                    style={{
                      width: `${Math.min(100, (selected.onlineUsed / selected.onlineLimit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-[#62748E]">ATM Withdrawals</span>
                  <span className="font-medium text-[#0F172B]">
                    ${selected.atmUsed} / day
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                  <div
                    className="h-full rounded-full bg-[#155DFC]"
                    style={{
                      width: `${Math.min(100, (selected.atmUsed / selected.atmLimit) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lost or Stolen Card Alert */}
          <div className="rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] p-6">
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
          </div>
        </div>
      </div>
    </div>
  );
}
