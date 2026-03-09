/**
 * HEXISLE REAL ESTATE
 * ===================
 * Digital real estate system for rentable hex plots, storefronts,
 * inns (with real-world Airbnb bridge), NPC realtors, and
 * undercover Harper agents (Defense Klaus / Underground Railroad).
 *
 * Each island has rentable plots. Verdana (Port City) is the starter market.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type PlotSize = "small" | "medium" | "large";
export type PlotType = "storefront" | "workshop" | "warehouse" | "guild_outpost" | "inn";
export type LeaseTerms = "weekly" | "monthly" | "seasonal" | "permanent";
export type HarperSpecialty = "analyze" | "assess" | "advise";

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface RentalPlot {
  id: string;
  name: string;
  plotSize: PlotSize;
  plotType: PlotType;
  hexPositions: Array<{ q: number; r: number }>;
  districtId: string;
  islandId: number;
  rentalCost: number;           // Credits per lease period
  leaseTerms: LeaseTerms;
  currentTenant?: string;       // member ID if occupied
  signage?: string;             // custom shop name
  description: string;
}

export interface InnRoom {
  id: string;
  innId: string;
  roomType: "bunk" | "private" | "suite";
  nightlyCost: number;          // Credits per night
  amenities: string[];
  realWorldBridge?: {
    provider: string;
    listingUrl?: string;
  };
}

export interface InnDef {
  id: string;
  name: string;
  hexPositions: Array<{ q: number; r: number }>;
  districtId: string;
  islandId: number;
  rooms: InnRoom[];
  innKeeperId: string;
  description: string;
}

export interface RealtorNPC {
  id: string;
  name: string;
  title: string;
  location: string;             // district ID
  hexPosition: { q: number; r: number };
  availablePlots: string[];     // rental plot IDs
  greeting: string;
}

export interface HarperAgent {
  id: string;
  name: string;
  coverIdentity: string;        // "Inn-Keeper", "Merchant", "Bard", etc.
  stationedAt: string;          // building/venue ID
  districtId: string;
  islandId: number;
  guildBadgeVisible: boolean;   // subtle badge appears on hover
  specialty: HarperSpecialty;
  loreBlurb: string;
}

// ─── Verdana Port City Real Estate ──────────────────────────────────────────

export const VERDANA_RENTAL_PLOTS: RentalPlot[] = [
  // Market Square storefronts
  {
    id: "market-shop-1", name: "Market Stall A", plotSize: "small", plotType: "storefront",
    hexPositions: [{ q: 3, r: 4 }], districtId: "market-square", islandId: 1,
    rentalCost: 5, leaseTerms: "weekly", description: "Prime market location. High foot traffic.",
  },
  {
    id: "market-shop-2", name: "Market Stall B", plotSize: "small", plotType: "storefront",
    hexPositions: [{ q: 4, r: 3 }], districtId: "market-square", islandId: 1,
    rentalCost: 5, leaseTerms: "weekly", description: "Corner stall near the Merchant's Tower.",
  },
  {
    id: "market-shop-3", name: "Market Stall C", plotSize: "small", plotType: "storefront",
    hexPositions: [{ q: 2, r: 4 }], districtId: "market-square", islandId: 1,
    rentalCost: 4, leaseTerms: "weekly", description: "Quiet stall on the market edge.",
  },
  // Forge Corner workshop
  {
    id: "forge-workshop", name: "Forge Workshop", plotSize: "medium", plotType: "workshop",
    hexPositions: [{ q: 5, r: 2 }, { q: 5, r: 3 }], districtId: "forge-corner", islandId: 1,
    rentalCost: 15, leaseTerms: "monthly", description: "Equipped workshop near the forge. Anvil included.",
  },
  // Harbor warehouse
  {
    id: "harbor-warehouse", name: "Harbor Warehouse", plotSize: "large", plotType: "warehouse",
    hexPositions: [{ q: 6, r: -1 }, { q: 6, r: 0 }, { q: 6, r: 1 }, { q: 7, r: 0 }],
    districtId: "harbor-district", islandId: 1,
    rentalCost: 30, leaseTerms: "monthly", description: "Large storage near the docks. Direct ship access.",
  },
  // Canal Quarter premium storefronts
  {
    id: "canal-shop-1", name: "Canal-Side Boutique", plotSize: "small", plotType: "storefront",
    hexPositions: [{ q: -4, r: -1 }], districtId: "canal-quarter", islandId: 1,
    rentalCost: 8, leaseTerms: "weekly", description: "Premium canal-side location. Gondola traffic views.",
  },
  {
    id: "canal-shop-2", name: "Waterfront Gallery Space", plotSize: "small", plotType: "storefront",
    hexPositions: [{ q: -2, r: 2 }], districtId: "canal-quarter", islandId: 1,
    rentalCost: 8, leaseTerms: "weekly", description: "Artist-friendly space overlooking the canal.",
  },
];

// ─── The Inn ────────────────────────────────────────────────────────────────

export const VERDANA_INN: InnDef = {
  id: "verdana-inn",
  name: "The Wayward Rest",
  hexPositions: [{ q: 0, r: 4 }, { q: 0, r: 5 }],
  districtId: "tavern-district",
  islandId: 1,
  innKeeperId: "harper-innkeeper",
  description: "A warm inn near The Tavern. Chimney smoke and candlelight. Rest here to save your progress and browse real-world accommodations.",
  rooms: [
    { id: "bunk-1", innId: "verdana-inn", roomType: "bunk", nightlyCost: 1, amenities: ["bed", "chest"] },
    { id: "bunk-2", innId: "verdana-inn", roomType: "bunk", nightlyCost: 1, amenities: ["bed", "chest"] },
    { id: "private-1", innId: "verdana-inn", roomType: "private", nightlyCost: 3, amenities: ["bed", "desk", "chest", "window"] },
    { id: "suite-1", innId: "verdana-inn", roomType: "suite", nightlyCost: 8, amenities: ["bed", "desk", "chest", "window", "fireplace", "balcony"],
      realWorldBridge: { provider: "airbnb", listingUrl: undefined },
    },
  ],
};

// ─── Realtor NPCs ───────────────────────────────────────────────────────────

export const VERDANA_REALTORS: RealtorNPC[] = [
  {
    id: "realtor-market", name: "Thaddeus Cork", title: "Market District Realtor",
    location: "market-square", hexPosition: { q: 3, r: 1 },
    availablePlots: ["market-shop-1", "market-shop-2", "market-shop-3"],
    greeting: "Looking for a prime spot in the market? I have just the stall for you.",
  },
  {
    id: "realtor-harbor", name: "Marina Voss", title: "Harbor & Industrial Realtor",
    location: "harbor-district", hexPosition: { q: 5, r: 1 },
    availablePlots: ["forge-workshop", "harbor-warehouse", "canal-shop-1", "canal-shop-2"],
    greeting: "Warehouses, workshops, canal-side gems — what are you building?",
  },
];

// ─── Undercover Harpers ─────────────────────────────────────────────────────

/** Harper's Guild = Ethics checkers, truth-tellers. LB's elite taskforce.
 *  "Analyze, Assess, Advise" — They observe, report, and intervene.
 *  Appear as regular NPCs but have a subtle guild badge on hover.
 *  Part of Defense Klaus & Underground Railroad. */
export const VERDANA_HARPERS: HarperAgent[] = [
  {
    id: "harper-innkeeper", name: "Old Barley", coverIdentity: "Inn-Keeper",
    stationedAt: "verdana-inn", districtId: "tavern-district", islandId: 1,
    guildBadgeVisible: false, specialty: "analyze",
    loreBlurb: "The Inn-Keeper sees all who pass through. A warm smile hides sharp eyes.",
  },
  {
    id: "harper-bard", name: "Lyric", coverIdentity: "Canal Bard",
    stationedAt: "canal-theater", districtId: "canal-quarter", islandId: 1,
    guildBadgeVisible: false, specialty: "assess",
    loreBlurb: "The Bard's songs carry more than melody. Every verse is a report.",
  },
  {
    id: "harper-merchant", name: "Quiet Tam", coverIdentity: "Spice Merchant",
    stationedAt: "tavern-station", districtId: "tavern-district", islandId: 1,
    guildBadgeVisible: false, specialty: "advise",
    loreBlurb: "The Spice Merchant's advice costs nothing but attention. Listen carefully.",
  },
];

// ─── Utility Functions ──────────────────────────────────────────────────────

/** Get all rental plots for an island */
export function getRentalPlots(islandId: number): RentalPlot[] {
  if (islandId === 1) return VERDANA_RENTAL_PLOTS;
  return [];
}

/** Get available (unoccupied) plots for an island */
export function getAvailablePlots(islandId: number): RentalPlot[] {
  return getRentalPlots(islandId).filter(p => !p.currentTenant);
}

/** Get inn for an island */
export function getInn(islandId: number): InnDef | null {
  if (islandId === 1) return VERDANA_INN;
  return null;
}

/** Get realtors for an island */
export function getRealtors(islandId: number): RealtorNPC[] {
  if (islandId === 1) return VERDANA_REALTORS;
  return [];
}

/** Get harpers for an island (even though they're undercover, the system needs to know) */
export function getHarpers(islandId: number): HarperAgent[] {
  if (islandId === 1) return VERDANA_HARPERS;
  return [];
}

/** Check if a hex position is a rental plot */
export function isRentalPlotAt(q: number, r: number, islandId: number): RentalPlot | null {
  const plots = getRentalPlots(islandId);
  for (const plot of plots) {
    for (const pos of plot.hexPositions) {
      if (pos.q === q && pos.r === r) return plot;
    }
  }
  return null;
}
