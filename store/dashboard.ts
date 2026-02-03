import { create } from 'zustand';
import { getAuthHeader } from '@/lib/auth/client';

export interface DashboardAccount {
  id: string;
  name: string;
  balance: number;
  lastFour: string;
  accountNumber: string;
  accountType: string;
}

export interface DashboardTransaction {
  id: string;
  merchant: string;
  date: string;
  amount: number;
  category: string;
  accountId: string;
}

export interface SpendingAnalytics {
  thisWeek: number;
  lastMonth: number;
}

interface DashboardState {
  totalBalance: number;
  accounts: DashboardAccount[];
  recentTransactions: DashboardTransaction[];
  spendingAnalytics: SpendingAnalytics;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;

  setOverview: (data: {
    totalBalance: number;
    accounts: DashboardAccount[];
    recentTransactions: DashboardTransaction[];
    spendingAnalytics: SpendingAnalytics;
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  fetchOverview: () => Promise<void>;
}

const initialState = {
  totalBalance: 0,
  accounts: [],
  recentTransactions: [],
  spendingAnalytics: { thisWeek: 0, lastMonth: 0 },
  loading: false,
  error: null as string | null,
  lastFetched: null as number | null,
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...initialState,

  setOverview: (data) =>
    set({
      ...data,
      error: null,
      lastFetched: Date.now(),
    }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),

  fetchOverview: async () => {
    const { setOverview, setLoading, setError } = get();
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/dashboard/overview', {
        headers: { ...headers },
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error || 'Failed to load dashboard');
        return;
      }
      setOverview({
        totalBalance: json.data.totalBalance ?? 0,
        accounts: json.data.accounts ?? [],
        recentTransactions: json.data.recentTransactions ?? [],
        spendingAnalytics: json.data.spendingAnalytics ?? { thisWeek: 0, lastMonth: 0 },
      });
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      set({ loading: false });
    }
  },
}));

/** Selectors */
export const selectTotalBalance = (s: DashboardState) => s.totalBalance;
export const selectAccounts = (s: DashboardState) => s.accounts;
export const selectRecentTransactions = (s: DashboardState) => s.recentTransactions;
export const selectSpendingAnalytics = (s: DashboardState) => s.spendingAnalytics;
export const selectDashboardLoading = (s: DashboardState) => s.loading;
export const selectDashboardError = (s: DashboardState) => s.error;
