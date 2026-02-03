import { getAuthHeader } from "@/lib/auth/client";

export async function fetchApi<T>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: string }> {
  const headers = await getAuthHeader();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
      ...options?.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    return { success: false, error: json.error || "Request failed" };
  }
  return json;
}

export async function getAccounts() {
  const json = await fetchApi<Array<{
    id: string;
    name: string;
    balance: number;
    lastFour?: string;
    accountNumber?: string;
    routingNumber: string | null;
    interestRate: number | null;
    openedDate: string | null;
    accountType: string;
    ownership?: string;
    monthlyFee: number;
    overdraftLimit: number | null;
    dailyTransferLimit: number | null;
    status: string;
  }>>("/api/accounts");
  if (!json.success) throw new Error(json.error || "Failed to load accounts");
  return json.data ?? [];
}

export async function getDashboardOverview() {
  const json = await fetchApi<{
    totalBalance: number;
    accounts: Array<{
      id: string;
      name: string;
      balance: number;
      lastFour: string;
      accountNumber: string;
      accountType: string;
    }>;
    recentTransactions: Array<{
      id: string;
      merchant: string;
      date: string;
      amount: number;
      category: string;
      accountId: string;
    }>;
    spendingAnalytics: { thisWeek: number; lastMonth: number };
  }>("/api/dashboard/overview");
  if (!json.success) throw new Error(json.error || "Failed to load dashboard");
  return json.data!;
}

export async function getTransferHistory(accountId?: string, limit = 50) {
  const params = new URLSearchParams();
  if (accountId) params.set("accountId", accountId);
  params.set("limit", String(limit));
  const json = await fetchApi<{
    transactions: Array<{
      id: string;
      merchant?: string;
      timestamp?: string;
      amount: number;
      category?: string;
    }>;
    total: number;
  }>(`/api/transfers/history?${params}`);
  if (!json.success) throw new Error(json.error || "Failed to load transactions");
  return json.data!;
}
