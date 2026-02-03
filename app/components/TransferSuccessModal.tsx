"use client";

import Modal from "./Modal";

interface TransferSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  date: string;
  referenceId: string;
  transferType?: "internal" | "person" | "wire";
  fromAccount?: { name: string; lastFour: string };
  toAccount?: { name?: string; lastFour?: string; accountNumber?: string };
  beneficiaryName?: string;
  onMakeAnother?: () => void;
}

function generateReceipt({
  amount,
  date,
  referenceId,
  transferType,
  fromAccount,
  toAccount,
  beneficiaryName,
}: {
  amount: string;
  date: string;
  referenceId: string;
  transferType?: "internal" | "person" | "wire";
  fromAccount?: { name: string; lastFour: string };
  toAccount?: { name?: string; lastFour?: string; accountNumber?: string };
  beneficiaryName?: string;
}) {
  const transferTypeLabel =
    transferType === "internal"
      ? "Internal Transfer"
      : transferType === "person"
        ? "Send to Person"
        : transferType === "wire"
          ? "Wire Transfer"
          : "Transfer";

  const toAccountDisplay =
    transferType === "internal"
      ? toAccount
        ? `${toAccount.name} (•••• ${toAccount.lastFour})`
        : "—"
      : transferType === "person"
        ? beneficiaryName || (toAccount?.accountNumber ? `•••• ${toAccount.accountNumber.slice(-4)}` : "—")
        : toAccount?.accountNumber
          ? `•••• ${toAccount.accountNumber.slice(-4)}`
          : "—";

  const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Transfer Receipt - ${referenceId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0F172B;
      background: white;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .receipt-container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #E2E8F0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #155DFC;
      margin-bottom: 8px;
    }
    .receipt-title {
      font-size: 28px;
      font-weight: bold;
      color: #0F172B;
      margin-bottom: 8px;
    }
    .success-badge {
      display: inline-block;
      padding: 6px 12px;
      background: #DCFCE7;
      color: #00A63E;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 8px;
    }
    .details-section {
      margin-bottom: 30px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #F1F5F9;
    }
    .detail-label {
      color: #62748E;
      font-size: 14px;
    }
    .detail-value {
      color: #0F172B;
      font-weight: 500;
      text-align: right;
    }
    .amount-row {
      background: #F8FAFC;
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .amount-label {
      color: #62748E;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .amount-value {
      color: #0F172B;
      font-size: 32px;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #E2E8F0;
      text-align: center;
      color: #62748E;
      font-size: 12px;
    }
    .reference-id {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      color: #0F172B;
      background: #F8FAFC;
      padding: 8px 12px;
      border-radius: 6px;
      display: inline-block;
      margin-top: 8px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="logo">VyrBank</div>
      <div class="receipt-title">Transfer Receipt</div>
      <div class="success-badge">✓ Transaction Successful</div>
    </div>

    <div class="details-section">
      <div class="amount-row">
        <div class="amount-label">Transfer Amount</div>
        <div class="amount-value">${amount}</div>
      </div>

      <div class="detail-row">
        <span class="detail-label">Transfer Type</span>
        <span class="detail-value">${transferTypeLabel}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">${date}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">From Account</span>
        <span class="detail-value">${fromAccount ? `${fromAccount.name} (•••• ${fromAccount.lastFour})` : "—"}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">To Account</span>
        <span class="detail-value">${toAccountDisplay}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Reference ID</span>
        <span class="detail-value reference-id">${referenceId}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value" style="color: #00A63E; font-weight: 600;">Completed</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Fee</span>
        <span class="detail-value" style="color: #00A63E;">$0.00</span>
      </div>
    </div>

    <div class="footer">
      <p>This is an electronic receipt for your records.</p>
      <p style="margin-top: 8px;">VyrBank, N.A. Member FDIC. Equal Housing Lender.</p>
      <p style="margin-top: 4px;">Generated on ${new Date().toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" })}</p>
    </div>
  </div>
</body>
</html>
  `;

  return receiptHTML;
}

function downloadReceipt(receiptHTML: string, referenceId: string) {
  const blob = new Blob([receiptHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `transfer-receipt-${referenceId}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function TransferSuccessModal({
  isOpen,
  onClose,
  amount,
  date,
  referenceId,
  transferType,
  fromAccount,
  toAccount,
  beneficiaryName,
  onMakeAnother,
}: TransferSuccessModalProps) {
  const handleMakeAnother = () => {
    onMakeAnother?.();
    onClose();
  };

  const handleDownloadReceipt = () => {
    const receiptHTML = generateReceipt({
      amount,
      date,
      referenceId,
      transferType,
      fromAccount,
      toAccount,
      beneficiaryName,
    });
    downloadReceipt(receiptHTML, referenceId);
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

          <div className="flex w-full max-w-[384px] flex-col gap-3">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[#E2E8F0] bg-white px-6 text-base font-normal text-[#0F172B] transition hover:bg-[#F8FAFC]"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download Receipt
            </button>
            <button
              type="button"
              onClick={handleMakeAnother}
              className="h-12 rounded-[14px] bg-[#0F172B] px-10 text-base font-normal text-white transition hover:bg-[#1E293B]"
            >
              Make Another Transfer
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
