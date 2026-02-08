"use client";

import Image from "next/image";
import Link from "next/link";
import Modal from "./Modal";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  /** Primary action. If href provided, renders as Link; otherwise as button */
  actionLabel?: string;
  actionHref?: string;
  onActionClick?: () => void;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = "Account Created!",
  message = "Your Vertex Premium account has been successfully created. You can now sign in to access your account.",
  actionLabel = "Continue to Sign In",
  actionHref,
  onActionClick,
}: SuccessModalProps) {
  const handleAction = () => {
    onActionClick?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl sm:p-10">
        <div className="flex flex-col items-center text-center">
          {/* Success icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#00C950]/10">
            <Image
              src="/images/icon-check.svg"
              alt=""
              width={40}
              height={40}
              className="shrink-0"
            />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-[#0F172B]">{title}</h2>
          <p className="mb-8 text-base text-[#45556C]">{message}</p>
          {actionHref ? (
            <Link
              href={actionHref}
              onClick={handleAction}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4]"
            >
              {actionLabel}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAction}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#155DFC] font-bold text-white shadow-sm transition hover:bg-[#1248d4]"
            >
              {actionLabel}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
