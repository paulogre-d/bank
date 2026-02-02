"use client";

import Modal from "./Modal";

interface TransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  date: string;
  referenceId: string;
  onMakeAnother?: () => void;
}

export default function TransferSuccessModal({
  isOpen,
  onClose,
  amount,
  date,
  referenceId,
  onMakeAnother,
}: TransferSuccessModalProps) {
  const handleMakeAnother = () => {
    onMakeAnother?.();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-[608px]">
      <div className="w-full max-w-[608px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_-1px_rgba(0,0,0,0.1),0px_1px_3px_0px_rgba(0,0,0,0.1)]">
        <div className="flex flex-col items-center px-12 pt-12 pb-10">
          {/* Success icon - 80x80 circle, green checkmark */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#DCFCE7]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              stroke="#00A63E"
              strokeWidth="3.33"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6.67 20l9.33 9.33L33.33 12.67" />
            </svg>
          </div>

          <h2 className="mb-3 text-center text-[30px] font-bold leading-tight text-[#0F172B]">
            Transfer Successful
          </h2>
          <p className="mb-8 text-center text-base font-normal text-[#62748E]">
            Your transaction has been processed successfully.
          </p>

          {/* Details box */}
          <div className="mb-10 w-full max-w-[384px] rounded-[14px] bg-[#F8FAFC] p-6">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-normal text-[#62748E]">Amount</span>
                <span className="text-base font-bold text-[#0F172B]">{amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-normal text-[#62748E]">Date</span>
                <span className="text-base font-normal text-[#0F172B]">{date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-normal text-[#62748E]">Reference ID</span>
                <span className="font-mono text-xs font-normal text-[#0F172B]">{referenceId}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleMakeAnother}
            className="h-12 rounded-[14px] bg-[#0F172B] px-10 text-base font-normal text-white transition hover:bg-[#1E293B]"
          >
            Make Another Transfer
          </button>
        </div>
      </div>
    </Modal>
  );
}
