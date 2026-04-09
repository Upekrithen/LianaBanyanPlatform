export type Coalition = {
  id: string;
  name: string;
  status: "active" | "forming" | "paused";
  memberCount: number;
  summary: string;
};

export type CoalitionDiscount = {
  id: string;
  title: string;
  percent: number;
  appliesTo: string;
};

export type PromotionItem = {
  id: string;
  channel: string;
  message: string;
};

export type PurchasingNeed = {
  id: string;
  item: string;
  quantity: string;
  note?: string;
};
