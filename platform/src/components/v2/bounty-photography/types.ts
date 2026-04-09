export type BountyItem = {
  id: string;
  title: string;
  merchant: string;
  city: string;
  distanceMiles: number;
  payoutUsd: number;
  status: "open" | "claimed" | "submitted" | "verified";
};

export type Assignment = {
  id: string;
  bountyTitle: string;
  merchant: string;
  dueAt: string;
  status: "claimed" | "proof_submitted" | "merchant_confirmed";
};

export type EarningsEntry = {
  id: string;
  title: string;
  amountUsd: number;
  paidAt: string;
};
