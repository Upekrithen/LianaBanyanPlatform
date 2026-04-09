export type StorefrontType = "food" | "crafts" | "services" | "digital";

export type PreviewMode = "desktop" | "mobile";

export type ImportSource = "start_fresh" | "etsy" | "shopify";

export interface TemplateOption {
  id: string;
  name: string;
  type: StorefrontType;
  recommendedFor: string;
  description: string;
}

export interface ProductDraft {
  id: string;
  name: string;
  sku: string;
  cost: number;
  quantity: number;
  source: ImportSource;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}
