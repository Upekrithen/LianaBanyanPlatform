export type WalletCurrency = "credits" | "marks" | "joules";

export type WalletActivityTab = "all" | WalletCurrency;

export type WalletActivityItem = {
  id: string;
  currency: WalletCurrency;
  amount: number;
  description: string;
  createdAt: string;
  direction: "in" | "out" | "neutral";
  source: "credit_transactions" | "marks_transactions" | "joules_transactions";
};

export type CurrencySummary = {
  balance: number;
  roleLabel: string;
  lastTransaction?: string;
};
