export type LbCardTransaction = {
  id: string;
  merchant: string;
  amountCents: number;
  occurredAt: string;
  category: string;
  status: "pending" | "completed" | "reversed";
  isMemberBusiness: boolean;
  details?: string;
};

export type LbCategorySpend = {
  category: string;
  amountCents: number;
};

export type VirtualCardSnapshot = {
  pan: string;
  cvv: string;
  expiry: string;
};
