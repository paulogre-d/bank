/**
 * Transaction categories used for display and filtering.
 * Values match DashboardOverview TransactionIcon cases (lowercase in APIs).
 */
export const TRANSACTION_CATEGORIES = [
  { value: "Transfer", label: "Transfer" },
  { value: "Food", label: "Food" },
  { value: "Coffee", label: "Coffee" },
  { value: "Income", label: "Income" },
  { value: "Transport", label: "Transport" },
  { value: "Bill", label: "Bill" },
  { value: "Utilities", label: "Utilities" },
  { value: "Shopping", label: "Shopping" },
] as const;

export type TransactionCategoryValue = (typeof TRANSACTION_CATEGORIES)[number]["value"];
