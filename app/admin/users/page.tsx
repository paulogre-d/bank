"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Modal from "@/app/components/Modal";
import {
  MOCK_ACCOUNTS,
  MOCK_CARDS,
  MOCK_USERS,
  getAccountsForUser,
  getUserById,
  type MockAccount,
  type MockCard,
} from "@/lib/admin-mock-data";
import CardVisual from "@/components/CardVisual";

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

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const uidParam = searchParams.get("uid");
  const [selectedUid, setSelectedUid] = useState<string | null>(uidParam);
  const [search, setSearch] = useState("");
  const [editBalanceAccount, setEditBalanceAccount] = useState<MockAccount | null>(null);
  const [editBalanceValue, setEditBalanceValue] = useState("");
  const [createCardUser, setCreateCardUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addAccountType, setAddAccountType] = useState<MockAccount["accountType"]>("checking");
  const [addAccountName, setAddAccountName] = useState("");
  const [accounts, setAccounts] = useState<MockAccount[]>(MOCK_ACCOUNTS);
  const [cards, setCards] = useState<MockCard[]>(MOCK_CARDS);
  const [viewCard, setViewCard] = useState<MockCard | null>(null);

  const user = selectedUid ? getUserById(selectedUid) : null;
  const userAccounts = user ? accounts.filter((a) => a.userId === user.uid) : [];
  const userCards = user ? cards.filter((c) => c.userId === user.uid) : [];

  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.accountNumber.includes(search)
  );

  const handleSaveBalance = () => {
    if (editBalanceAccount && editBalanceValue) {
      const num = parseFloat(editBalanceValue);
      if (!isNaN(num)) {
        setAccounts((prev) =>
          prev.map((a) => (a.id === editBalanceAccount.id ? { ...a, balance: num } : a))
        );
        setEditBalanceAccount(null);
        setEditBalanceValue("");
      }
    }
  };

  const handleAddAccount = () => {
    if (!user) return;
    const accountNum = generateAccountNumber();
    const lastFour = accountNum.slice(-4);
    const name =
      addAccountName.trim() ||
      (addAccountType === "checking"
        ? "Checking"
        : addAccountType === "savings"
          ? "Savings"
          : "Credit Card");
    const newAccount: MockAccount = {
      id: `acc-${Date.now()}`,
      userId: user.uid,
      accountNumber: accountNum,
      name,
      accountType: addAccountType,
      balance: addAccountType === "credit" ? 0 : 0,
      routingNumber: "123456789",
      status: "active",
      lastFour,
      interestRate: addAccountType === "savings" ? 4.0 : addAccountType === "checking" ? 0.05 : undefined,
    };
    setAccounts((prev) => [...prev, newAccount]);
    setAddAccountOpen(false);
    setAddAccountName("");
    setAddAccountType("checking");
  };

  const handleCreateCard = () => {
    if (!createCardUser) return;
    const cardHolder = `${createCardUser.firstName} ${createCardUser.lastName}`;
    const newCard: MockCard = {
      id: `card-${Date.now()}`,
      userId: createCardUser.uid,
      name: "Visa Infinite",
      cardNumber: generateCardNumber(),
      cardHolder,
      expiry: generateExpiryThreeYears(),
      cvv: generateCvv(),
      status: "active",
    };
    setCards((prev) => [...prev, newCard]);
    setViewCard(newCard);
    setCreateCardUser(null);
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
              {filteredUsers.map((u) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* User details */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
          {user ? (
            <>
              <div className="border-b border-[#F1F5F9] p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9]">
                    <span className="text-lg font-semibold text-[#64748B]">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#0F172B]">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm text-[#62748E]">{user.email}</p>
                    <p className="font-mono text-xs text-[#94A3B8]">{user.accountNumber}</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAddAccountOpen(true)}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white text-sm font-medium text-[#314158] transition hover:bg-[#F8FAFC]"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateCardUser(user)}
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#155DFC] bg-white text-sm font-medium text-[#155DFC] transition hover:bg-[#EFF6FF]"
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
                  {userAccounts.map((acc) => (
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
                  ))}
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
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white"
                >
                  Save
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
          {user && (
            <>
              <p className="mt-2 text-sm text-[#62748E]">
                {user.firstName} {user.lastName} · {user.accountNumber}
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#314158]">Account Type</label>
                  <select
                    value={addAccountType}
                    onChange={(e) => setAddAccountType(e.target.value as MockAccount["accountType"])}
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
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white"
                >
                  Add Account
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
                  className="h-11 flex-1 rounded-xl bg-[#155DFC] text-sm font-semibold text-white"
                >
                  Create Card
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
