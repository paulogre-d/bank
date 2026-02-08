"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

// --- Animation variants (matching Dashboard) ---
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

const LOAN_TYPES = [
  { id: "personal", label: "Personal Loan", rate: "5.99%", rateLabel: "Rates as low as 5.99%" },
  { id: "auto", label: "Auto Loan", rate: "4.49%", rateLabel: "Rates as low as 4.49%" },
  { id: "mortgage", label: "Mortgage", rate: "6.50%", rateLabel: "Rates as low as 6.50%" },
  { id: "small-business", label: "Small Business", rate: "7.25%", rateLabel: "Rates as low as 7.25%" },
] as const;

const TERM_OPTIONS = [
  { value: 12, label: "12 months" },
  { value: 24, label: "24 months" },
  { value: 36, label: "36 months" },
  { value: 48, label: "48 months" },
  { value: 60, label: "60 months" },
];

function LoanTypeIcon({ type, selected }: { type: string; selected: boolean }) {
  const cn = "h-5 w-5 shrink-0";
  const stroke = selected ? "#ffffff" : "#64748B";
  switch (type) {
    case "personal":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case "auto":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14v-4H5v4zM5 12l2-4h10l2 4" />
          <circle cx="7.5" cy="17" r="1.5" />
          <circle cx="16.5" cy="17" r="1.5" />
        </svg>
      );
    case "mortgage":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
          <path d="M9 22V12h6v10" />
        </svg>
      );
    case "small-business":
      return (
        <svg className={cn} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    default:
      return (
        <svg className={cn} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth={1.67} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 6.67h15M2.5 10h15m-10 3.33H2.5m5 2.5h3.33" />
        </svg>
      );
  }
}

function estimatedMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (months <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

type Step = 1 | 2 | 3;

export default function LoansPage() {
  const [step, setStep] = useState<Step>(1);
  const [loanTypeId, setLoanTypeId] = useState<string>("personal");
  const [amount, setAmount] = useState<string>("10000");
  const [termMonths, setTermMonths] = useState<number>(36);
  const [employmentStatus, setEmploymentStatus] = useState("");
  const [annualIncome, setAnnualIncome] = useState("50000");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const loanType = LOAN_TYPES.find((t) => t.id === loanTypeId) ?? LOAN_TYPES[0];
  const principal = Math.min(500000, Math.max(1000, parseInt(amount.replace(/\D/g, "") || "0", 10)));
  const rateNum = parseFloat(loanType.rate.replace("%", ""));
  const monthlyPayment = estimatedMonthlyPayment(principal, rateNum, termMonths);

  const displayAmount = principal.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const displayPayment = monthlyPayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        className="flex flex-col gap-8"
        initial="initial"
        animate="animate"
        variants={stagger}
      >
        <motion.h1 className="text-2xl font-bold text-[#0F172B]" variants={fadeUp} transition={fadeUpTransition}>
          Application Submitted
        </motion.h1>
        <motion.div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm" variants={fadeUp} transition={fadeUpTransition}>
          <p className="text-[#62748E]">
            Thank you for your application. A specialist will contact you within 1–2 business days.
          </p>
          <Link
            href="/dashboard/loans"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-[14px] bg-[#155DFC] px-4 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
          >
            Start New Application
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-5 sm:gap-8"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.div variants={fadeUp} transition={fadeUpTransition}>
        <h1 className="text-xl font-bold text-[#0F172B] sm:text-2xl">Apply for a Loan</h1>
        <p className="mt-0.5 text-sm text-[#62748E] sm:mt-1 sm:text-base">
          Fast decisions, competitive rates, and no hidden fees.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        {/* Main form card */}
        <motion.div
          className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
          variants={fadeUp}
          transition={fadeUpTransition}
          whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
        >
          <div className="flex h-2 w-full overflow-hidden rounded-t-2xl border-b border-[#F1F5F9]">
            <div
              className="bg-[#155DFC] transition-all duration-200"
              style={{ width: step === 1 ? "33.33%" : step === 2 ? "66.66%" : "100%" }}
            />
            <div className="flex-1 bg-[#F1F5F9]" />
          </div>

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Step 1: Select Loan Type */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <h2 className="text-lg font-bold text-[#0F172B]">Select Loan Type</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {LOAN_TYPES.map((type) => {
                    const selected = loanTypeId === type.id;
                    return (
                      <motion.button
                        key={type.id}
                        type="button"
                        onClick={() => setLoanTypeId(type.id)}
                        whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex min-h-[139px] items-start gap-3 rounded-[14px] border p-4 text-left transition-all ${
                          selected
                            ? "border-2 border-[#155DFC] bg-[rgba(239,246,255,0.5)] shadow-sm"
                            : "border border-[#E2E8F0] bg-white shadow-sm hover:border-[#CBD5E1] hover:shadow-md"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${
                            selected ? "bg-[#155DFC]" : "bg-[#F1F5F9]"
                          }`}
                        >
                          <LoanTypeIcon type={type.id} selected={selected} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-[#0F172B]">{type.label}</p>
                          <p className="mt-1 text-sm text-[#62748E]">{type.rateLabel}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex justify-end pt-2">
                  <motion.button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Next Step
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 2: Customize loan — exact Figma layout */}
            {step === 2 && (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-lg font-bold text-[#0F172B]">Customize loan</h2>
                  <p className="mt-1 text-sm text-[#62748E]">
                    Choose your loan amount and repayment term.
                  </p>
                </div>

                {/* Loan amount — full width, prominent */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="loan-amount" className="text-sm font-medium text-[#0F172B]">
                    Loan amount
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-[#64748B]">
                      $
                    </span>
                    <input
                      id="loan-amount"
                      type="text"
                      inputMode="numeric"
                      value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 7))}
                      className="h-14 w-full rounded-xl border border-[#E2E8F0] bg-white py-4 pl-9 pr-4 text-lg font-medium text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-xs text-[#64748B]">Min $1,000 – Max $500,000</p>
                </div>

                {/* Term — selectable option cards */}
                <div className="flex flex-col gap-3">
                  <label className="text-sm font-medium text-[#0F172B]">Term</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {TERM_OPTIONS.map((opt) => {
                      const selected = termMonths === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          type="button"
                          onClick={() => setTermMonths(opt.value)}
                          whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 20 } }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex min-h-[56px] items-center justify-center rounded-xl border px-4 py-3 text-center text-sm font-medium transition-all ${
                            selected
                              ? "border-2 border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                              : "border border-[#E2E8F0] bg-white text-[#475569] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                          }`}
                        >
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F1F5F9] pt-6">
                  <motion.button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex h-11 min-w-[100px] items-center justify-center rounded-xl border border-[#E2E8F0] bg-white px-5 text-sm font-semibold text-[#334155] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Back
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex h-11 min-w-[120px] items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Next Step
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <h2 className="text-lg font-bold text-[#0F172B]">Personal Information</h2>
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="employment-status" className="text-sm font-medium text-[#0F172B]">
                      Employment Status
                    </label>
                    <input
                      id="employment-status"
                      type="text"
                      value={employmentStatus}
                      onChange={(e) => setEmploymentStatus(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-base text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                      placeholder="e.g. Employed, Self-employed, Retired"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="annual-income" className="text-sm font-medium text-[#0F172B]">
                      Annual Income
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-[#64748B]">
                        $
                      </span>
                      <input
                        id="annual-income"
                        type="text"
                        inputMode="numeric"
                        value={annualIncome.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        onChange={(e) => setAnnualIncome(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-9 pr-4 text-base text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="loan-purpose" className="text-sm font-medium text-[#0F172B]">
                      Loan Purpose
                    </label>
                    <input
                      id="loan-purpose"
                      type="text"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white py-3 px-4 text-base text-[#0F172B] outline-none placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:ring-2 focus:ring-[#155DFC]/20"
                      placeholder="e.g. Home Renovation, Debt Consolidation"
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-[#FEFCE8] p-4 text-sm text-[#854D0E]">
                  By clicking submit, you authorize NexoBank to perform a credit check. This may affect your credit score.
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F1F5F9] pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm font-medium text-[#155DFC] hover:underline"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    className="inline-flex h-11 min-w-[160px] items-center justify-center rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition hover:bg-[#1247d4]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Submit Application
                  </motion.button>
                </div>
              </form>
            )}
          </div>
        </motion.div>

        {/* Summary sidebar */}
        <motion.div className="flex flex-col gap-5 sm:gap-6 lg:w-[340px]" variants={stagger}>
          <motion.div
            className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172B] shadow-md"
            variants={fadeUp}
            transition={fadeUpTransition}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.15)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <div className="border-b border-[#334155] px-4 py-4 sm:px-6 sm:py-5">
              <h3 className="text-base font-bold text-white sm:text-lg">Summary</h3>
            </div>
            <dl className="px-4 sm:px-6">
              <div className="flex items-center justify-between gap-4 border-b border-[#334155] py-4">
                <dt className="text-sm font-normal text-[#94A3B8]">Type</dt>
                <dd className="text-sm font-medium text-white">{loanType.label}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#334155] py-4">
                <dt className="text-sm font-normal text-[#94A3B8]">Amount</dt>
                <dd className="text-sm font-medium text-white">${displayAmount}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#334155] py-4">
                <dt className="text-sm font-normal text-[#94A3B8]">Term</dt>
                <dd className="text-sm font-medium text-white">{termMonths} months</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#334155] py-4">
                <dt className="text-sm font-normal text-[#94A3B8]">Interest Rate</dt>
                <dd className="text-sm font-medium text-white">{loanType.rate}</dd>
              </div>
              <div className="flex flex-col gap-2 py-5">
                <dt className="text-sm font-normal text-[#94A3B8]">Est. Monthly Payment</dt>
                <dd className="text-2xl font-bold text-white">${displayPayment}</dd>
              </div>
            </dl>
          </motion.div>
          <motion.div
            className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm sm:p-6"
            variants={fadeUp}
            transition={{ ...fadeUpTransition, delay: 0.1 }}
            whileHover={{ y: -4, boxShadow: "0 8px 30px rgba(0,0,0,0.08)", transition: { type: "spring", stiffness: 300, damping: 20 } }}
          >
            <h3 className="text-base font-semibold text-[#0F172B]">Need Help?</h3>
            <p className="mt-2 text-sm text-[#62748E]">
              Our loan specialists are available to answer your questions.
            </p>
            <motion.button
              type="button"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[10px] border border-[#E2E8F0] bg-white text-sm font-semibold text-[#155DFC] transition hover:bg-[#F8FAFC]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Chat with a Specialist
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
