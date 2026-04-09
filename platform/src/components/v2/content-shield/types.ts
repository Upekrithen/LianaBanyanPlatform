export type CaseStatus =
  | "submitted"
  | "automated_review"
  | "community_flags"
  | "steward_review"
  | "founder_override"
  | "resolved";

export type ContentShieldCase = {
  id: string;
  category: string;
  summary: string;
  createdAt: string;
  status: CaseStatus;
  visibilityNote: string;
};

export type CommunityFlag = {
  id: string;
  target: string;
  reason: string;
  flaggedAt: string;
  flagCount: number;
};
