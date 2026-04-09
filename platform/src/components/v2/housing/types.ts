export type HousingTabKey = "properties" | "my-housing" | "contribute" | "housing-fund" | "roommate";

export type HousingPriorityTier = {
  tierLabel: string;
  priorityScore: number;
  nextTierLabel: string;
  pointsToNextTier: number;
};

export type HousingStoryAction = {
  id: string;
  label: string;
  happenedAt: string;
};

export type HousingStoryCardData = {
  tier: HousingPriorityTier;
  lastActions: HousingStoryAction[];
  nextMove: string;
};

export type HousingPropertyListing = {
  id: string;
  title: string;
  city: string;
  state: string | null;
  propertyType: string;
  status: string;
  acquisitionCost: number | null;
  monthlyRevenue: number | null;
  monthlyExpenses: number | null;
  waterwheel: {
    airbnbShare: number;
    tenantSubsidy: number;
    maintenanceFund: number;
    cooperativeFund: number;
    multiplierEffect: number | null;
  };
};

export type HousingTimelineEvent = {
  id: string;
  occurredAt: string;
  title: string;
  narrative: string;
  priorityDelta: number;
};

export type HousingMission = {
  id: string;
  name: string;
  whyItMatters: string;
  timeEstimate: string;
  impactLabel: string;
};

export type RoommateStampEvent = {
  id: string;
  category: string;
  status: string;
  incidentDate: string;
  narrative: string;
};
