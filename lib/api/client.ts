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
    spendingAnalytics: {
      thisWeek: number;
      lastMonth: number;
      byDay: Array<{ label: string; value: number }>;
      byWeek: Array<{ label: string; value: number }>;
      byMonth: Array<{ label: string; value: number }>;
    };
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

export type CardItem = {
  id: string;
  name: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  status: string;
  balance: number;
  limit: number;
  onlineUsed: number;
  onlineLimit: number;
  atmUsed: number;
  atmLimit: number;
};

export async function getCards() {
  const json = await fetchApi<{ cards: CardItem[] }>("/api/cards");
  if (!json.success) throw new Error(json.error || "Failed to load cards");
  return json.data?.cards ?? [];
}

export async function updateCard(
  cardId: string,
  body: { status?: "active" | "frozen"; pinSet?: boolean }
) {
  const json = await fetchApi<{ id: string; status?: string; pinSet?: boolean }>(
    `/api/cards/${cardId}`,
    { method: "PATCH", body: JSON.stringify(body) }
  );
  if (!json.success) throw new Error(json.error || "Failed to update card");
  return json.data!;
}

export async function fundCard(cardId: string, accountId: string, amount: number) {
  const json = await fetchApi<{ newAccountBalance: number; newCardBalance: number }>(
    `/api/cards/${cardId}/fund`,
    { method: "POST", body: JSON.stringify({ accountId, amount }) }
  );
  if (!json.success) throw new Error(json.error || "Failed to fund card");
  return json.data!;
}
