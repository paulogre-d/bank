"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";
import { getAccounts, getCards, getDashboardOverview, getTransferHistory } from "./client";

export const queryKeys = {
  accounts: ["accounts"] as const,
  dashboard: ["dashboard", "overview"] as const,
  transferHistory: (accountId?: string) => ["transferHistory", accountId ?? "all"] as const,
  cards: ["cards"] as const,
};

export function useAccounts() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: getAccounts,
    enabled: !!user,
  });
}

export function useDashboardOverview() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardOverview,
    enabled: !!user,
  });
}

export function useTransferHistory(accountId?: string, limit = 50) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.transferHistory(accountId),
    queryFn: () => getTransferHistory(accountId, limit),
    enabled: !!user,
  });
}

export function useCards() {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: queryKeys.cards,
    queryFn: getCards,
    enabled: !!user,
  });
}

export function useInvalidateAccounts() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
}

export function useInvalidateDashboard() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
}

export function useInvalidateTransferHistory() {
  const queryClient = useQueryClient();
  return (accountId?: string) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.transferHistory(accountId) });
}

export function useInvalidateCards() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.cards });
}
