"use client";

type CardVisualProps = {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv?: string;
  showCvv?: boolean;
};

export default function CardVisual({ cardNumber, cardHolder, expiry, cvv, showCvv }: CardVisualProps) {
  return (
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
      <p className="mt-10 font-mono text-lg tracking-[0.2em] text-white">{cardNumber}</p>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-white/60">Card Holder</p>
          <p className="text-sm font-medium text-white">{cardHolder}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/60">Expires</p>
          <p className="font-mono text-sm text-white">{expiry}</p>
        </div>
        {showCvv && cvv && (
          <div className="text-right">
            <p className="text-xs text-white/60">CVV</p>
            <p className="font-mono text-sm text-white">{cvv}</p>
          </div>
        )}
      </div>
    </div>
  );
}
