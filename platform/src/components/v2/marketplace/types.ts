export type MarketplaceMode = "all" | "products" | "storefronts" | "crew-call";

export type ListingType = "product" | "storefront" | "service" | "crew";

export type FulfillmentType = "shipping" | "pickup" | "service" | "digital";

export type UnifiedListing = {
  id: string;
  name: string;
  creator: string;
  description: string;
  type: ListingType;
  mode: MarketplaceMode;
  storefrontType: "food" | "crafts" | "services" | "digital" | "other";
  priceCredits: number | null;
  fulfillment: FulfillmentType;
  availability: boolean;
  adaptScore: number | null;
  rating: number | null;
  featured: boolean;
  isExternal: boolean;
  productionLinked: boolean;
  local: boolean;
  createdAt: string;
  imageUrl?: string | null;
  href: string;
};

export type MarketplaceFilters = {
  listingTypes: ListingType[];
  storefrontTypes: Array<"food" | "crafts" | "services" | "digital">;
  priceRange: "any" | "0-100" | "101-500" | "501+";
  fulfillment: Array<FulfillmentType>;
  availability: "all" | "available" | "unavailable";
  adaptThreshold: "any" | "70+" | "85+";
  newestOnly: boolean;
  featuredOnly: boolean;
  localOnly: boolean;
  externalOnly: boolean;
  productionLinkedOnly: boolean;
};
