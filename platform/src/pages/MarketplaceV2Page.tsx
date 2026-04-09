import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, ProofStripItem, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { supabase } from "@/integrations/supabase/client";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { TourModeBanner } from "@/components/wildfire/TourModeBanner";
import { TOUR_STOREFRONT } from "@/data/tourMockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, DollarSign, Store } from "lucide-react";
import {
  CostPlusTrustStrip,
  FeaturedCollectionsRail,
  FilterDrawer,
  FilterRail,
  MarketplaceFilters,
  MarketplaceMode,
  MarketplaceSearchBar,
  ModeSwitchTabs,
  StorefrontHighlightsBand,
  UnifiedListing,
  UnifiedResultsGrid,
} from "@/components/v2/marketplace";

const PROOF_ITEMS: ProofStripItem[] = [
  "4 storefront types",
  "6 templates",
  "external aggregation",
  "Crew Call built in",
];

const DEFAULT_FILTERS: MarketplaceFilters = {
  listingTypes: ["product", "storefront", "service", "crew"],
  storefrontTypes: ["food", "crafts", "services", "digital"],
  priceRange: "any",
  fulfillment: ["shipping", "pickup", "service", "digital"],
  availability: "all",
  adaptThreshold: "any",
  newestOnly: false,
  featuredOnly: false,
  localOnly: false,
  externalOnly: false,
  productionLinkedOnly: false,
};

const PAGE_SIZE = 12;

function mapStorefrontType(raw: string | null | undefined): "food" | "crafts" | "services" | "digital" | "other" {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("food")) return "food";
  if (value.includes("craft")) return "crafts";
  if (value.includes("service")) return "services";
  if (value.includes("digital")) return "digital";
  return "other";
}

function isPriceInRange(price: number | null, range: MarketplaceFilters["priceRange"]) {
  if (range === "any") return true;
  if (price === null) return false;
  if (range === "0-100") return price >= 0 && price <= 100;
  if (range === "101-500") return price >= 101 && price <= 500;
  return price >= 501;
}

export default function MarketplaceV2Page() {
  const tourTarget = useTourTarget("marketplace");
  const { isTourMode } = useWildfireRun();
  const tourNavigate = useNavigate();
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<MarketplaceMode>("all");
  const [filters, setFilters] = useState<MarketplaceFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["marketplace-v2-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,description,base_price,status,user_id,created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  const storefrontsQuery = useQuery({
    queryKey: ["marketplace-v2-storefronts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("storefronts")
        .select("id,name,slug,description,tagline,category,is_open,owner_name,member_since,status,production_linked,created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  const serviceProvidersQuery = useQuery({
    queryKey: ["marketplace-v2-service-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("id,provider_name,description,primary_category,hourly_rate,availability_status,average_rating,service_area,created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  const crewCallQuery = useQuery({
    queryKey: ["marketplace-v2-crew-call"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_call_roles")
        .select("id,role_name,description,category,commitment_tier,claimed_by,created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return data ?? [];
    },
  });

  const listings: UnifiedListing[] = useMemo(() => {
    const products: UnifiedListing[] = (productsQuery.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      creator: row.user_id ?? "Creator",
      description: row.description ?? "Product listing",
      type: "product",
      mode: "products",
      storefrontType: "other",
      priceCredits: row.base_price ? Number(row.base_price) : null,
      fulfillment: "shipping",
      availability: (row.status ?? "active") !== "archived",
      adaptScore: null,
      rating: null,
      featured: false,
      isExternal: false,
      productionLinked: true,
      local: true,
      createdAt: row.created_at ?? new Date(0).toISOString(),
      href: `/products/${row.id}`,
    }));

    const storefronts: UnifiedListing[] = (storefrontsQuery.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      creator: row.owner_name,
      description: row.description ?? "Storefront listing",
      type: "storefront",
      mode: "storefronts",
      storefrontType: mapStorefrontType(row.category),
      priceCredits: null,
      fulfillment: "pickup",
      availability: row.is_open ?? true,
      adaptScore: null,
      rating: null,
      featured: false,
      isExternal: false,
      productionLinked: false,
      local: true,
      createdAt: row.created_at ?? new Date(0).toISOString(),
      href: `/storefront/${row.id}`,
    }));

    const services: UnifiedListing[] = (serviceProvidersQuery.data ?? []).map((row) => ({
      id: row.id,
      name: row.provider_name,
      creator: row.provider_name,
      description: row.description ?? "Service provider listing",
      type: "service",
      mode: "all",
      storefrontType: "services",
      priceCredits: row.hourly_rate ? Number(row.hourly_rate) : null,
      fulfillment: "service",
      availability: (row.availability_status ?? "available") !== "offline",
      adaptScore: row.average_rating ? Math.round(Number(row.average_rating) * 20) : null,
      rating: row.average_rating ? Number(row.average_rating) : null,
      featured: false,
      isExternal: false,
      productionLinked: false,
      local: !!row.service_area,
      createdAt: row.created_at ?? new Date(0).toISOString(),
      href: "/marketplace/services",
    }));

    const crew: UnifiedListing[] = (crewCallQuery.data ?? []).map((row) => ({
      id: row.id,
      name: row.role_name,
      creator: row.claimed_by ?? "Open role",
      description: row.description ?? "Crew Call role listing",
      type: "crew",
      mode: "crew-call",
      storefrontType: "services",
      priceCredits: null,
      fulfillment: "service",
      availability: !row.claimed_by,
      adaptScore: row.commitment_tier === "high" ? 90 : row.commitment_tier === "medium" ? 75 : 60,
      rating: null,
      featured: false,
      isExternal: false,
      productionLinked: true,
      local: true,
      createdAt: row.created_at ?? new Date(0).toISOString(),
      href: "/help-wanted",
    }));

    return [...products, ...storefronts, ...services, ...crew];
  }, [crewCallQuery.data, productsQuery.data, serviceProvidersQuery.data, storefrontsQuery.data]);

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    let rows = listings.filter((item) => {
      const modePass =
        mode === "all" ||
        (mode === "products" && item.type === "product") ||
        (mode === "storefronts" && item.type === "storefront") ||
        (mode === "crew-call" && (item.type === "crew" || item.type === "service"));
      if (!modePass) return false;

      if (searchValue.length > 0) {
        const blob = `${item.name} ${item.creator} ${item.description}`.toLowerCase();
        if (!blob.includes(searchValue)) return false;
      }

      if (!filters.listingTypes.includes(item.type)) return false;
      if (item.storefrontType !== "other" && !filters.storefrontTypes.includes(item.storefrontType)) return false;
      if (!filters.fulfillment.includes(item.fulfillment)) return false;
      if (!isPriceInRange(item.priceCredits, filters.priceRange)) return false;

      if (filters.availability === "available" && !item.availability) return false;
      if (filters.availability === "unavailable" && item.availability) return false;

      if (filters.adaptThreshold === "70+" && (item.adaptScore ?? 0) < 70) return false;
      if (filters.adaptThreshold === "85+" && (item.adaptScore ?? 0) < 85) return false;
      if (filters.featuredOnly && !item.featured) return false;
      if (filters.localOnly && !item.local) return false;
      if (filters.externalOnly && !item.isExternal) return false;
      if (filters.productionLinkedOnly && !item.productionLinked) return false;
      return true;
    });

    rows = rows.sort((a, b) => {
      if (filters.newestOnly) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });

    return rows;
  }, [filters, listings, mode, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const normalizedPage = Math.min(page, pageCount);
  const pagedResults = filtered.slice((normalizedPage - 1) * PAGE_SIZE, normalizedPage * PAGE_SIZE);

  const storefrontHighlights = useMemo(() => {
    const all = storefrontsQuery.data ?? [];
    const active = all.filter((r: any) => r.status === "active");
    const demo = all.filter((r: any) => r.status === "demonstration");
    const pending = all.filter((r: any) => r.status === "pending_claim");
    const prioritized = [...active, ...demo, ...pending].slice(0, 3);
    return prioritized.map((row: any) => ({
      id: row.id,
      name: row.name,
      owner: row.owner_name,
      category: row.category,
      status: row.status,
      tagline: row.tagline,
      production_linked: row.production_linked,
    }));
  }, [storefrontsQuery.data]);

  const loading =
    productsQuery.isLoading ||
    storefrontsQuery.isLoading ||
    serviceProvidersQuery.isLoading ||
    crewCallQuery.isLoading;

  const stickyLabelByMode: Record<MarketplaceMode, string> = {
    all: "Browse all",
    products: "Browse products",
    storefronts: "Browse storefronts",
    "crew-call": "Browse Crew Call",
  };

  return (
    <AppShell
      xrayBase="marketplace"
      pageTitle="Marketplace"
      breadcrumbs="Marketplace"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Marketplace"
            headline="Browse the whole economy without switching worlds."
            body="Explore food, crafts, services, digital goods, and Crew Call listings in one marketplace shaped by the Cost+20% floor and the 83.3% creator keep model."
            primaryCTA={{ label: "Browse all listings", href: "#marketplace-results" }}
            secondaryCTA={{ label: "Explore storefronts", href: "#storefront-highlights" }}
            proofStrip={PROOF_ITEMS}
          />
          <MarketplaceSearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <TourModeBanner pageName="marketplace" />

        {isTourMode && (
          <div className="space-y-6 mb-4">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-orange-500" />
                  <CardTitle>{TOUR_STOREFRONT.name}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{TOUR_STOREFRONT.tagline}</p>
              </CardHeader>
              <CardContent>
                <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4 text-center">
                  <p className="text-sm font-semibold text-orange-800 dark:text-orange-200">This is YOUR storefront</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Creator keeps 83.3% of every sale. Platform takes Cost+20% — no hidden fees, no ad tax.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {TOUR_STOREFRONT.products.map((prod) => (
                    <Card key={prod.id} className="hover:border-orange-300 transition-colors">
                      <CardContent className="pt-4 space-y-2">
                        <Badge variant="outline" className="text-[10px] capitalize">{prod.category}</Badge>
                        <h4 className="font-semibold text-sm">{prod.name}</h4>
                        <p className="text-xs text-muted-foreground">{prod.description}</p>
                        <div className="space-y-1 pt-2 border-t">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Base cost:</span>
                            <span>${prod.baseCost.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Cost+20%:</span>
                            <span className="font-medium">${prod.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-green-600 font-semibold">
                            <span>You keep (83.3%):</span>
                            <span>${(prod.price * 0.833).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                  onClick={() => tourNavigate("/membership")}
                >
                  Join for $5/year to open your shop <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="sticky top-[4.1rem] z-10 border-b bg-background/95 py-2 backdrop-blur md:hidden">
          <MarketplaceSearchBar
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <ModeSwitchTabs
            value={mode}
            onValueChange={(next) => {
              setMode(next);
              setPage(1);
            }}
          />
          <FilterDrawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen} filters={filters} onChange={setFilters} />
        </div>

        <FeaturedCollectionsRail
          onSelectMode={(nextMode) => {
            setMode(nextMode);
            setPage(1);
          }}
        />

        <div id="marketplace-results" className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <FilterRail filters={filters} onChange={setFilters} />
          <UnifiedResultsGrid
            listings={pagedResults}
            currentPage={normalizedPage}
            pageCount={pageCount}
            loading={loading}
            onPageChange={setPage}
            tourTargetProps={tourTarget}
          />
        </div>

        <CostPlusTrustStrip />

        <div id="storefront-highlights">
          <StorefrontHighlightsBand highlights={storefrontHighlights} />
        </div>

        <StickyMobileCTA primary={{ label: stickyLabelByMode[mode], href: "#marketplace-results" }} />
      </div>
    </AppShell>
  );
}
