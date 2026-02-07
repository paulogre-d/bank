"use client";

import { useEffect } from "react";

export type ToastProps = {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
};

export function Toast({ message, visible, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible || !message) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [visible, message, duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl border border-[#E2E8F0] bg-[#0F172B] px-5 py-3 text-sm font-medium text-white shadow-lg"
    >
      {message}
    </div>
  );
}
