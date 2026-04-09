export type CueCardLinkTarget = "profile" | "storefront" | "guild";

export type ShareMethod = "link" | "email";

export interface CueCardTemplate {
  id: string;
  name: string;
  headline: string;
  body: string;
  cta: string;
  recommendedFor: string;
  accent: string;
}

export interface CueCardDraft {
  templateId: string;
  headline: string;
  body: string;
  cta: string;
  linkTarget: CueCardLinkTarget;
  linkValue: string;
  contactInfo: string;
  accentColor: string;
  fontStyle: "clean" | "serif" | "strong";
  imageUrl: string;
  shareMethod: ShareMethod;
  recipientName: string;
  recipientEmail: string;
}
