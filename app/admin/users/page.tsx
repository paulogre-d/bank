"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import { getAdminAuthHeader } from "@/lib/auth/admin";
import CardVisual from "@/components/CardVisual";

type User = {
  uid: string;
  email: string;
  accountNumber: string;
  firstName: string;
  lastName: string;
};

type Account = {
  id: string;
  name: string;
  balance: number;
  lastFour: string;
  accountNumber: string;
  accountType: "checking" | "savings" | "credit";
  status: string;
};

type Card = {
  id: string;
  name: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  status: string;
};

function generateAccountNumber(): string {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
}

function generateCardNumber(): string {
  const digits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
  return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)} ${digits.slice(12, 16)}`;
}

function generateExpiryThreeYears(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

function generateCvv(): string {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join("");
}

function formatCurrency(v: number) {
  return v >= 0
    ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : `-$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function AdminUsersContent() {
  const searchParams = useSearchParams();
  const uidParam = searchParams.get("uid");
  const [selectedUid, setSelectedUid] = useState<string | null>(uidParam);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userAccounts, setUserAccounts] = useState<Account[]>([]);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [editBalanceAccount, setEditBalanceAccount] = useState<Account | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState("");
  const [createCardUser, setCreateCardUser] = useState<User | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addAccountType, setAddAccountType] = useState<"checking" | "savings" | "credit">("checking");
  const [addAccountName, setAddAccountName] = useState("");
  const [viewCard, setViewCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const headers = await getAdminAuthHeader();
        const res = await fetch("/api/admin/users?limit=100", { headers });
        const json = await res.json();
        if (json.success) {
          setUsers(json.data.users);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch user details when selected
  useEffect(() => {
    if (!selectedUid) {
      setSelectedUser(null);
      setUserAccounts([]);
      setUserCards([]);
      return;
    }

    const fetchUserData = async () => {
      try {
        const headers = await getAdminAuthHeader();
        const user = users.find((u) => u.uid === selectedUid);
        if (user) {
          setSelectedUser(user);
        }

        // Fetch accounts
        const accountsRes = await fetch(`/api/admin/users/${selectedUid}/accounts`, { headers });
        const accountsJson = await accountsRes.json();
        if (accountsJson.success) {
          setUserAccounts(accountsJson.data.accounts);
        }

        // Fetch cards
        const cardsRes = await fetch(`/api/admin/users/${selectedUid}/cards`, { headers });
        const cardsJson = await cardsRes.json();
        if (cardsJson.success) {
          setUserCards(cardsJson.data.cards);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    if (users.length > 0) {
      fetchUserData();
    }
  }, [selectedUid, users]);

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.accountNumber.includes(search)
  );

  const handleSaveBalance = async () => {
    if (!editBalanceAccount || !editBalanceValue) return;
    const num = parseFloat(editBalanceValue);
    if (isNaN(num)) return;

    setSaving(true);
    try {
      const headers = await getAdminAuthHeader();
      const res = await fetch(`/api/admin/accounts/${editBalanceAccount.id}/balance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({ balance: num }),
      });
      const json = await res.json();
      if (json.success) {
        setUserAccounts((prev) =>
          prev.map((a) => (a.id === editBalanceAccount.id ? { ...a, balance: num } : a))
        );
        setEditBalanceAccount(null);
        setEditBalanceValue("");
      } else {
        alert(json.error || "Failed to update balance");
      }
    } catch (error) {
      alert("Failed to update balance");
    } finally {
      setSaving(false);
    }
  };

  const handleAddAccount = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const headers = await getAdminAuthHeader();
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          userId: selectedUser.uid,
          accountType: addAccountType,
          name: addAccountName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        // Refresh accounts
        const accountsRes = await fetch(`/api/admin/users/${selectedUser.uid}/accounts`, { headers });
        const accountsJson = await accountsRes.json();
        if (accountsJson.success) {
          setUserAccounts(accountsJson.data.accounts);
        }
        setAddAccountOpen(false);
        setAddAccountName("");
        setAddAccountType("checking");
      } else {
        alert(json.error || "Failed to create account");
      }
    } catch (error) {
      alert("Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCard = async () => {
    if (!createCardUser) return;
    setSaving(true);
    try {
      const headers = await getAdminAuthHeader();
      const res = await fetch("/api/admin/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify({
          userId: createCardUser.uid,
          name: "Visa Infinite",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setViewCard({
          id: json.data.id,
          name: json.data.name,
          cardNumber: json.data.cardNumber,
          cardHolder: json.data.cardHolder,
          expiry: json.data.expiry,
          cvv: json.data.cvv,
          status: json.data.status,
        });
        // Refresh cards
        const cardsRes = await fetch(`/api/admin/users/${createCardUser.uid}/cards`, { headers });
        const cardsJson = await cardsRes.json();
        if (cardsJson.success) {
          setUserCards(cardsJson.data.cards);
        }
        setCreateCardUser(null);
      } else {
        alert(json.error || "Failed to create card");
      }
    } catch (error) {
      alert("Failed to create card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#0F172B]">User Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* User list */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#F1F5F9] p-4">
              <input
                type="text"
                placeholder="Search by name, email, account number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
              />
            </div>
            <div className="max-h-[500px] overflow-auto">
              {loading ? (
                <div className="px-6 py-4 text-sm text-[#62748E]">Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className="px-6 py-4 text-sm text-[#62748E]">No users found</div>
              ) : (
                filteredUsers.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => setSelectedUid(u.uid)}
                  className={`flex w-full items-center justify-between gap-4 border-b border-[#F1F5F9] px-6 py-4 text-left transition last:border-0 hover:bg-[#F8FAFC] ${
                    selectedUid === u.uid ? "bg-[#EFF6FF]" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                      <span className="text-sm font-semibold text-[#64748B]">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172B]">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-[#62748E]">{u.email}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-[#94A3B8]">{u.accountNumber}</span>
                </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          {selectedUser ? (
            <>
              <div className="border-b border-[#F1F5F9] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <span className="text-lg font-semibold text-[#64748B]">
                      {selectedUser.firstName[0]}
                      {selectedUser.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172B]">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h2>
                    <p className="text-sm text-[#62748E]">{selectedUser.email}</p>
                    <p className="font-mono text-xs text-[#94A3B8]">{selectedUser.accountNumber}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddAccountOpen(true)}
                    disabled={saving}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158] transition hover:bg-[#F8FAFC] disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateCardUser(selectedUser)}
                    disabled={saving}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#155DFC] bg-white text-sm font-medium text-[#155DFC] transition hover:bg-[#EFF6FF] disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Create Card
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="mb-4 text-sm font-semibold text-[#0F172B]">Accounts</h3>
                <div className="space-y-4">
                  {userAccounts.length === 0 ? (
                    <p className="text-sm text-[#62748E]">No accounts yet</p>
                  ) : (
                    userAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-[#0F172B]">{acc.name}</p>
                          <p className="font-mono text-xs text-[#62748E]">
                            •••• {acc.lastFour} · {acc.accountType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${acc.balance >= 0 ? "text-[#0F172B]" : "text-[#DC2626]"}`}>
                            {formatCurrency(acc.balance)}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setEditBalanceAccount(acc);
                              setEditBalanceValue(String(acc.balance));
                            }}
                            className="text-xs font-medium text-[#155DFC] hover:underline"
                          >
                            Edit Balance
                          </button>
                        </div>
                      </div>
                    </div>
                    ))
                  )}
                </div>
                <h3 className="mb-4 mt-6 text-sm font-semibold text-[#0F172B]">Cards</h3>
                <div className="space-y-4">
                  {userCards.length === 0 ? (
                    <p className="text-sm text-[#62748E]">No cards yet</p>
                  ) : (
                    userCards.map((card) => (
                      <button
                        key={card.id}
                        type="button"
                        onClick={() => setViewCard(card)}
                        className="w-full overflow-hidden rounded-xl border border-[#E2E8F0] p-0 text-left transition hover:border-[#155DFC]/40 hover:shadow-sm"
                      >
                        <CardVisual
                          cardNumber={card.cardNumber}
                          cardHolder={card.cardHolder}
                          expiry={card.expiry}
                          cvv={card.cvv}
                          showCvv={false}
                        />
                        <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2">
                          <p className="text-xs font-medium text-[#62748E]">
                            {card.name} · Click to view CVV
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-sm text-[#62748E]">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Balance Modal */}
      <Modal
        isOpen={!!editBalanceAccount}
        onClose={() => {
          setEditBalanceAccount(null);
          setEditBalanceValue("");
        }}
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Edit Account Balance</h2>
          {editBalanceAccount && (
            <>
              <p className="mt-2 text-sm text-[#62748E]">
                {editBalanceAccount.name} · •••• {editBalanceAccount.lastFour}
              </p>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-[#314158]">New Balance</label>
                <input
                  type="number"
                  value={editBalanceValue}
                  onChange={(e) => setEditBalanceValue(e.target.value)}
                  step="0.01"
                  className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
                />
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditBalanceAccount(null);
                    setEditBalanceValue("");
                  }}
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveBalance}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        isOpen={addAccountOpen}
        onClose={() => {
          setAddAccountOpen(false);
          setAddAccountName("");
          setAddAccountType("checking");
        }}
      >
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Add Account</h2>
          {selectedUser && (
            <>
              <p className="mt-2 text-sm text-[#62748E]">
                {selectedUser.firstName} {selectedUser.lastName} · {selectedUser.accountNumber}
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Account Type</label>
                  <select
                    value={addAccountType}
                    onChange={(e) => setAddAccountType(e.target.value as "checking" | "savings" | "credit")}
                    className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] focus:border-[#155DFC] focus:outline-none"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Account Name</label>
                  <input
                    type="text"
                    value={addAccountName}
                    onChange={(e) => setAddAccountName(e.target.value)}
                    placeholder={
                      addAccountType === "checking"
                        ? "e.g. Premium Checking"
                        : addAccountType === "savings"
                          ? "e.g. High Yield Savings"
                          : "e.g. Visa Infinite"
                    }
                    className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172B] placeholder:text-[#94A3B8] focus:border-[#155DFC] focus:outline-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddAccountOpen(false);
                    setAddAccountName("");
                  }}
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddAccount}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Add Account"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create Card Modal */}
      <Modal isOpen={!!createCardUser} onClose={() => setCreateCardUser(null)}>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Create Card for User</h2>
          {createCardUser && (
            <>
              <p className="mt-2 text-sm text-[#62748E]">
                {createCardUser.firstName} {createCardUser.lastName} · {createCardUser.accountNumber}
              </p>
              <p className="mt-4 text-sm text-[#62748E]">
                Creates a new card with random 16-digit number, expiry 3 years from today, and CVV.
              </p>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCreateCardUser(null)}
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCard}
                  disabled={saving}
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? "Creating…" : "Create Card"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* View Card Modal */}
      <Modal isOpen={!!viewCard} onClose={() => setViewCard(null)}>
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#0F172B]">Card Details</h2>
          {viewCard && (
            <>
              <p className="mt-2 text-sm text-[#62748E]">{viewCard.name}</p>
              <div className="mt-4 flex justify-center">
                <div className="min-w-[320px] max-w-[380px]">
                  <CardVisual
                    cardNumber={viewCard.cardNumber}
                    cardHolder={viewCard.cardHolder}
                    expiry={viewCard.expiry}
                    cvv={viewCard.cvv}
                    showCvv
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(viewCard.cardNumber.replace(/\s/g, ""));
                  }}
                  className="h-11 flex-1 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158] hover:bg-[#F8FAFC]"
                >
                  Copy Number
                </button>
                <button
                  type="button"
                  onClick={() => setViewCard(null)}
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white"
                >
                  Done
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[400px] items-center justify-center text-[#62748E]">Loading…</div>}>
      <AdminUsersContent />
    </Suspense>
  );
}
