export type PioneerFilter = "all" | "marketplace" | "hexisle" | "governance";

export type PioneerBadgeItem = {
  id: string;
  label: string;
  meaning: string;
};

export type PioneerPerson = {
  id: string;
  roleKey: string;
  category: Exclude<PioneerFilter, "all">;
  displayName: string;
  tagline: string;
  phaseLabel: string;
  story: string;
  contributions: string[];
  isPioneer: boolean;
  badges: PioneerBadgeItem[];
};
