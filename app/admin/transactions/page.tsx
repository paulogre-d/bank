"use client";

import { useState, useEffect, useCallback } from "react";
import Modal from "@/app/components/Modal";
import { getAdminAuthHeader } from "@/lib/auth/admin";
import { TRANSACTION_CATEGORIES } from "@/lib/constants/transactions";

type User = {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
};

type Account = {
  id: string;
  name: string;
  balance: number;
  lastFour: string;
  accountNumber?: string;
  accountType: string;
  status: string;
};

type Transaction = {
  id: string;
  referenceId: string;
  type: string;
  fromAccountId: string | null;
  toAccountId: string | null;
  amount: number;
  status: string;
  merchant: string | null;
  category: string;
  timestamp: string;
};

function formatCurrency(v: number) {
  const sign = v >= 0 ? "+" : "-";
  return `${sign}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatTransactionType(type: string): string {
  const labels: Record<string, string> = {
    internal: "Internal",
    "send-to-person": "Send to Person",
    "bill-payment": "Bill Payment",
    "wire-transfer": "Wire Transfer",
  };
  return labels[type] ?? type;
}

const CATEGORY_BG: Record<string, string> = {
  Food: "#FFEDD4",
  Coffee: "#FEF3C7",
  Income: "#D1FAE5",
  Transport: "#EDE9FE",
  Transfer: "#F1F5F9",
  Shopping: "#E0F2FE",
};

function generateReferenceId() {
  return `TRX-${Math.floor(1000 + Math.random() * 9000)}-${String(new Date().getFullYear()).slice(-2)}`;
}

export default function AdminTransactionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editModalTx, setEditModalTx] = useState<Transaction | null>(null);

  const [createForm, setCreateForm] = useState({
    accountId: "",
    date: new Date().toISOString().slice(0, 16),
    referenceId: "",
    type: "internal" as "internal" | "send-to-person" | "bill-payment" | "wire-transfer",
    category: "Transfer",
    description: "",
    amount: "",
    debitCredit: "debit" as "debit" | "credit",
    status: "completed" as "completed" | "pending" | "failed",
  });

  const [editForm, setEditForm] = useState({
    amount: "",
    debitCredit: "debit" as "debit" | "credit",
    description: "",
    status: "completed" as "completed" | "pending" | "failed",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = await getAdminAuthHeader();
        const res = await fetch("/api/admin/users?limit=100", { headers });
        const json = await res.json();
        if (json.success) setUsers(json.data.users ?? []);
      } catch (e) {
        console.error("Failed to fetch users:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setUserAccounts([]);
      return;
    }
    const fetchAccounts = async () => {
      try {
        const headers = await getAdminAuthHeader();
        const res = await fetch(`/api/admin/users/${selectedUserId}/accounts`, { headers });
        const json = await res.json();
        if (json.success) setUserAccounts(json.data.accounts ?? []);
      } catch (e) {
        console.error("Failed to fetch accounts:", e);
        setUserAccounts([]);
      }
    };
    fetchAccounts();
  }, [selectedUserId]);

  const fetchTransactions = useCallback(async (accountId: string | null) => {
    if (!accountId) {
      setTransactions([]);
      return;
    }
    setTransactionsLoading(true);
    try {
      const headers = await getAdminAuthHeader();
      const res = await fetch(`/api/admin/transactions?accountId=${accountId}&limit=100`, { headers });
      const json = await res.json();
      if (json.success) setTransactions(json.data.transactions ?? []);
      else setTransactions([]);
    } catch (e) {
      console.error("Failed to fetch transactions:", e);
      setTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(selectedAccountId);
  }, [selectedAccountId, fetchTransactions]);

  const filteredTx = transactions;
  const selectedAccount = selectedAccountId ? userAccounts.find((a) => a.id === selectedAccountId) ?? null : null;
  const selectedUser = selectedUserId ? users.find((u) => u.uid === selectedUserId) ?? null : null;

  const handleUserSelect = (uid: string | null) => {
    setSelectedUserId(uid);
    setSelectedAccountId(null);
  };

  const handleAccountSelect = (accountId: string | null) => {
    setSelectedAccountId(accountId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">Transactions</h1>
        <button
          type="button"
          onClick={() => {
            setCreateForm((f) => ({
              ...f,
              accountId: selectedAccountId ?? "",
            }));
            setCreateModalOpen(true);
          }}
          disabled={!selectedAccountId}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#155DFC] px-5 text-sm font-semibold text-white transition hover:bg-[#1247d4] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Users & Accounts panel */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          <div className="border-b border-[#F1F5F9] p-4">
            <h2 className="text-sm font-semibold text-[#0F172B]">Users & Accounts</h2>
            <p className="mt-1 text-xs text-[#62748E]">Select a user, then an account to view transactions</p>
          </div>
          <div className="max-h-[400px] overflow-auto p-2">
            {loading ? (
              <div className="py-8 text-center text-sm text-[#62748E]">Loading users…</div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-sm text-[#62748E]">No users found</div>
            ) : (
            users.map((u) => {
              const isUserSelected = selectedUserId === u.uid;
              const displayAccounts = isUserSelected ? userAccounts : [];
              return (
                <div key={u.uid} className="mb-2">
                  <button
                    type="button"
                    onClick={() => handleUserSelect(isUserSelected ? null : u.uid)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                      isUserSelected ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                      <span className="text-xs font-semibold text-[#64748B]">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172B]">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="truncate text-xs text-[#62748E]">{u.email}</p>
                    </div>
                    <svg
                      className={`h-4 w-4 shrink-0 text-[#94A3B8] transition ${isUserSelected ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isUserSelected && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#E2E8F0] pl-3">
                      {displayAccounts.map((acc) => {
                        const isAccSelected = selectedAccountId === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => handleAccountSelect(isAccSelected ? null : acc.id)}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                              isAccSelected ? "bg-[#EFF6FF]" : "hover:bg-[#F8FAFC]"
                            }`}
                          >
                            <span className="text-sm text-[#0F172B]">{acc.name}</span>
                            <span className="font-mono text-xs text-[#94A3B8]">•••• {acc.lastFour}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="flex flex-col gap-4">
          {selectedAccount && selectedUser && (
            <p className="text-sm text-[#62748E]">
              Transactions for <span className="font-medium text-[#0F172B]">{selectedUser.firstName} {selectedUser.lastName}</span> · {selectedAccount.name} (•••• {selectedAccount.lastFour})
            </p>
          )}

          {/* Transactions table */}
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            {!selectedAccountId ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-[#62748E]">Select a user, then an account to view transactions</p>
                <p className="mt-1 text-xs text-[#94A3B8]">Use the panel on the left to browse users and their accounts</p>
              </div>
            ) : transactionsLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-[#62748E]">Loading transactions…</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#62748E]">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#62748E]">Reference</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#62748E]">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#62748E]">Description</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-[#62748E]">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-[#62748E]">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-[#62748E]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="transition hover:bg-[#F8FAFC]">
                  <td className="px-6 py-4 text-sm text-[#0F172B]">{formatDate(tx.timestamp)}</td>
                  <td className="px-6 py-4 font-mono text-sm text-[#62748E]">{tx.referenceId}</td>
                  <td className="px-6 py-4">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: CATEGORY_BG[tx.category ?? "Transfer"] ?? "#F1F5F9",
                        color: "#0F172B",
                      }}
                    >
                      {formatTransactionType(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#0F172B]">{tx.merchant ?? tx.referenceId}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold">
                    <span className={tx.amount > 0 ? "text-[#00A63E]" : "text-[#DC2626]"}>
                      {formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#DCFCE7] px-2 py-1 text-xs font-medium text-[#016630]">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditModalTx(tx);
                        setEditForm({
                          amount: String(Math.abs(tx.amount)),
                          debitCredit: tx.amount >= 0 ? "credit" : "debit",
                          description: tx.merchant ?? "",
                          status: (tx.status === "completed" || tx.status === "pending" || tx.status === "failed" ? tx.status : "completed") as "completed" | "pending" | "failed",
                        });
                      }}
                      className="text-sm font-medium text-[#155DFC] hover:underline"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            )}
      </div>
        </div>
      </div>

      {/* Create Transaction Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateError(null);
          setCreateForm({
            accountId: "",
            date: new Date().toISOString().slice(0, 16),
            referenceId: "",
            type: "internal",
            category: "Transfer",
            description: "",
            amount: "",
            debitCredit: "debit",
            status: "completed",
          });
        }}
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Create Transaction</h2>
          <p className="mt-2 text-sm text-[#62748E]">
            Add a manual transaction for an account with date, time, type, and amount.
          </p>
          {createError && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{createError}</p>
          )}
            <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Debit / Credit</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreateForm((f) => ({ ...f, debitCredit: "debit" }))}
                  className={`h-11 flex-1 rounded-xl border text-sm font-medium transition ${
                    createForm.debitCredit === "debit"
                      ? "border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                      : "border-[#E2E8F0] bg-white text-[#62748E] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Debit
                </button>
                <button
                  type="button"
                  onClick={() => setCreateForm((f) => ({ ...f, debitCredit: "credit" }))}
                  className={`h-11 flex-1 rounded-xl border text-sm font-medium transition ${
                    createForm.debitCredit === "credit"
                      ? "border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                      : "border-[#E2E8F0] bg-white text-[#62748E] hover:bg-[#F8FAFC]"
                  }`}
                >
                  Credit
                </button>
              </div>
              <p className="mt-1 text-xs text-[#94A3B8]">
                {createForm.debitCredit === "debit" ? "Money out" : "Money in"}
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Account</label>
              <select
                value={createForm.accountId}
                onChange={(e) => setCreateForm((f) => ({ ...f, accountId: e.target.value }))}
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              >
                <option value="">Select account</option>
                {userAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {selectedUser?.firstName} {selectedUser?.lastName} · {acc.name} (•••• {acc.lastFour})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Date</label>
              <input
                type="datetime-local"
                value={createForm.date}
                onChange={(e) => setCreateForm((f) => ({ ...f, date: e.target.value }))}
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Reference ID</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createForm.referenceId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, referenceId: e.target.value }))}
                  placeholder="TRX-1234-24"
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 font-mono text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCreateForm((f) => ({ ...f, referenceId: generateReferenceId() }))}
                  className="h-11 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-[#62748E] hover:bg-[#F8FAFC]"
                >
                  Generate
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Type</label>
              <select
                value={createForm.type}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    type: e.target.value as "internal" | "send-to-person" | "bill-payment" | "wire-transfer",
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              >
                <option value="internal">Internal</option>
                <option value="send-to-person">Send to Person</option>
                <option value="bill-payment">Bill Payment</option>
                <option value="wire-transfer">Wire Transfer</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Category (optional)</label>
              <select
                value={createForm.category}
                onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              >
                {TRANSACTION_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Description</label>
              <input
                type="text"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Whole Foods Market, Salary Deposit"
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Amount</label>
              <input
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                step="0.01"
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#314158]">Status</label>
              <select
                value={createForm.status}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    status: e.target.value as "completed" | "pending" | "failed",
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setCreateForm({
                  accountId: "",
                  date: new Date().toISOString().slice(0, 16),
                  referenceId: "",
                  type: "internal",
                  category: "Transfer",
                  description: "",
                  amount: "",
                  debitCredit: "debit",
                  status: "completed",
                });
              }}
              className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={createSubmitting || !createForm.accountId || !createForm.amount?.trim()}
              onClick={async () => {
                const rawAmount = parseFloat(createForm.amount);
                if (!createForm.accountId || isNaN(rawAmount) || rawAmount <= 0) {
                  setCreateError("Please enter a valid amount.");
                  return;
                }
                const amount = createForm.debitCredit === "debit" ? -Math.abs(rawAmount) : Math.abs(rawAmount);
                setCreateSubmitting(true);
                setCreateError(null);
                try {
                  const headers = await getAdminAuthHeader();
                  const res = await fetch("/api/admin/transactions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", ...headers },
                    body: JSON.stringify({
                      accountId: createForm.accountId,
                      amount,
                      timestamp: new Date(createForm.date).toISOString(),
                      type: createForm.type,
                      merchant: createForm.description.trim() || undefined,
                      category: createForm.category,
                      referenceId: createForm.referenceId.trim() || undefined,
                      status: createForm.status,
                    }),
                  });
                  const json = await res.json();
                  if (!json.success) {
                    setCreateError(json.error || "Failed to create transaction");
                    return;
                  }
                  setCreateModalOpen(false);
                  setCreateForm({
                    accountId: "",
                    date: new Date().toISOString().slice(0, 16),
                    referenceId: "",
                    type: "internal",
                    category: "Transfer",
                    description: "",
                    amount: "",
                    debitCredit: "debit",
                    status: "completed",
                  });
                  fetchTransactions(selectedAccountId);
                } catch (e: any) {
                  setCreateError(e?.message || "Failed to create transaction");
                } finally {
                  setCreateSubmitting(false);
                }
              }}
              className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createSubmitting ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Transaction Modal */}
      <Modal
        isOpen={!!editModalTx}
        onClose={() => {
          setEditModalTx(null);
          setEditForm({ amount: "", debitCredit: "debit", description: "", status: "completed" });
        }}
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Edit Transaction</h2>
          {editModalTx && (
            <>
              <p className="mt-2 font-mono text-sm text-[#62748E]">{editModalTx.referenceId}</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Debit / Credit</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, debitCredit: "debit" }))}
                      className={`h-11 flex-1 rounded-xl border text-sm font-medium transition ${
                        editForm.debitCredit === "debit"
                          ? "border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                          : "border-[#E2E8F0] bg-white text-[#62748E] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      Debit
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm((f) => ({ ...f, debitCredit: "credit" }))}
                      className={`h-11 flex-1 rounded-xl border text-sm font-medium transition ${
                        editForm.debitCredit === "credit"
                          ? "border-[#155DFC] bg-[#EFF6FF] text-[#155DFC]"
                          : "border-[#E2E8F0] bg-white text-[#62748E] hover:bg-[#F8FAFC]"
                      }`}
                    >
                      Credit
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Amount</label>
                  <input
                    type="number"
                    value={editForm.amount}
                    onChange={(e) => setEditForm((f) => ({ ...f, amount: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Description</label>
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Whole Foods Market"
                    className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        status: e.target.value as "completed" | "pending" | "failed",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalTx(null);
                    setEditForm({ amount: "", debitCredit: "debit", description: "", status: "completed" });
                  }}
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const rawAmount = parseFloat(editForm.amount);
                    if (!isNaN(rawAmount)) {
                      const amount = editForm.debitCredit === "debit" ? -Math.abs(rawAmount) : Math.abs(rawAmount);
                      setTransactions((prev) =>
                        prev.map((t) =>
                          t.id === editModalTx.id
                            ? {
                                ...t,
                                amount,
                                merchant: editForm.description || null,
                                status: editForm.status,
                              }
                            : t
                        )
                      );
                    }
                    setEditModalTx(null);
                    setEditForm({ amount: "", debitCredit: "debit", description: "", status: "completed" });
                  }}
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white"
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
