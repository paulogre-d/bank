/**
 * Mock data for admin dashboard - aligns with API docs data models
 * users, accounts, transactions collections
 */

export type MockUser = {
  uid: string;
  accountNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  phone?: string;
  createdAt?: string;
};

export type MockAccount = {
  id: string;
  userId: string;
  accountNumber: string;
  name: string;
  accountType: "checking" | "savings" | "credit";
  balance: number;
  routingNumber: string;
  interestRate?: number;
  status: "active" | "closed";
  lastFour: string;
  openedDate?: string;
};

export type MockCard = {
  id: string;
  userId: string;
  name: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  status: "active" | "frozen";
};

export type MockTransaction = {
  id: string;
  referenceId: string;
  type: "internal" | "send-to-person" | "bill-payment" | "wire-transfer";
  fromAccountId: string;
  toAccountId?: string;
  toAccountNumber?: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  merchant?: string;
  category?: string;
};

export const MOCK_USERS: MockUser[] = [
  { uid: "u1", accountNumber: "458900004589", email: "david.vwaire@email.com", firstName: "David", lastName: "Vwaire", dateOfBirth: "1990-03-15", phone: "+1 (555) 123-4567" },
  { uid: "u2", accountNumber: "901200004589", email: "jane.smith@email.com", firstName: "Jane", lastName: "Smith", dateOfBirth: "1985-07-22", phone: "+1 (555) 987-6543" },
  { uid: "u3", accountNumber: "345600004589", email: "john.doe@email.com", firstName: "John", lastName: "Doe", dateOfBirth: "1992-11-08", phone: "+1 (555) 456-7890" },
  { uid: "u4", accountNumber: "789100004589", email: "sarah.wilson@email.com", firstName: "Sarah", lastName: "Wilson", dateOfBirth: "1988-01-30", phone: "+1 (555) 321-6549" },
];

export const MOCK_CARDS: MockCard[] = [
  { id: "card1", userId: "u1", name: "Visa Infinite", cardNumber: "4885 6789 8960 9876", cardHolder: "David Vwaire", expiry: "12/28", cvv: "123", status: "active" },
  { id: "card2", userId: "u1", name: "Premium Debit", cardNumber: "4885 6789 8960 4589", cardHolder: "David Vwaire", expiry: "08/27", cvv: "456", status: "active" },
];

export const MOCK_ACCOUNTS: MockAccount[] = [
  { id: "acc1", userId: "u1", accountNumber: "458900004589", name: "Premium Checking", accountType: "checking", balance: 12450, routingNumber: "123456789", status: "active", lastFour: "4589", interestRate: 0.05 },
  { id: "acc2", userId: "u1", accountNumber: "901200004589", name: "High Yield Savings", accountType: "savings", balance: 45200.5, routingNumber: "123456789", status: "active", lastFour: "9012", interestRate: 4.25 },
  { id: "acc3", userId: "u1", accountNumber: "345600004589", name: "Visa Infinite", accountType: "credit", balance: -1250, routingNumber: "123456789", status: "active", lastFour: "3456" },
  { id: "acc4", userId: "u2", accountNumber: "901200004590", name: "Premium Checking", accountType: "checking", balance: 8500, routingNumber: "123456789", status: "active", lastFour: "0590" },
  { id: "acc5", userId: "u2", accountNumber: "789100004590", name: "Savings", accountType: "savings", balance: 22000, routingNumber: "123456789", status: "active", lastFour: "4590", interestRate: 4.0 },
  { id: "acc6", userId: "u3", accountNumber: "458900004591", name: "Checking", accountType: "checking", balance: 3200, routingNumber: "123456789", status: "active", lastFour: "4591" },
  { id: "acc7", userId: "u4", accountNumber: "901200004592", name: "Premium Checking", accountType: "checking", balance: 18500, routingNumber: "123456789", status: "active", lastFour: "4592" },
];

export const MOCK_TRANSACTIONS: MockTransaction[] = [
  { id: "tx1", referenceId: "TRX-8829-23", type: "internal", fromAccountId: "acc1", toAccountId: "acc2", amount: 500, status: "completed", timestamp: "2024-01-28T10:30:00Z", merchant: "Internal Transfer", category: "Transfer" },
  { id: "tx2", referenceId: "TRX-8830-23", type: "send-to-person", fromAccountId: "acc1", toAccountNumber: "901200004590", amount: -124.5, status: "completed", timestamp: "2024-01-28T09:15:00Z", merchant: "Whole Foods Market", category: "Food" },
  { id: "tx3", referenceId: "TRX-8831-23", type: "send-to-person", fromAccountId: "acc1", toAccountNumber: "789100004590", amount: -5.4, status: "completed", timestamp: "2024-01-28T08:00:00Z", merchant: "Starbucks Coffee", category: "Coffee" },
  { id: "tx4", referenceId: "TRX-8832-23", type: "internal", fromAccountId: "acc2", toAccountId: "acc1", amount: 4200, status: "completed", timestamp: "2024-01-25T14:00:00Z", merchant: "Salary Deposit", category: "Income" },
  { id: "tx5", referenceId: "TRX-8833-23", type: "send-to-person", fromAccountId: "acc1", toAccountNumber: "458900004591", amount: -24, status: "completed", timestamp: "2024-01-24T12:30:00Z", merchant: "Uber Ride", category: "Transport" },
  { id: "tx6", referenceId: "TRX-8834-23", type: "send-to-person", fromAccountId: "acc4", toAccountNumber: "458900004589", amount: 250, status: "completed", timestamp: "2024-01-23T16:00:00Z", merchant: "Send to Person", category: "Transfer" },
];

export function getAccountsForUser(userId: string): MockAccount[] {
  return MOCK_ACCOUNTS.filter((a) => a.userId === userId);
}

export function getCardsForUser(userId: string): MockCard[] {
  return MOCK_CARDS.filter((c) => c.userId === userId);
}

export function getTransactionsForAccount(accountId: string): MockTransaction[] {
  return MOCK_TRANSACTIONS.filter((t) => t.fromAccountId === accountId || t.toAccountId === accountId);
}

export function getUserById(uid: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.uid === uid);
}

export function getAccountById(id: string): MockAccount | undefined {
  return MOCK_ACCOUNTS.find((a) => a.id === id);
}
