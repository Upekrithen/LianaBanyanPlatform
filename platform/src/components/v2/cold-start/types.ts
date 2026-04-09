import { LucideIcon } from "lucide-react";

export type ColdStartPathwayId =
  | "food"
  | "manufacturing"
  | "service"
  | "local-business"
  | "guild"
  | "tribe";

export type ColdStartPathway = {
  id: ColdStartPathwayId;
  name: string;
  icon: LucideIcon;
  purpose: string;
  bestFor: string;
  capabilities: string[];
  setupHref: string;
};

