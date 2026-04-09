import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  ActiveBookingStatusBar,
  CategoryFilterBar,
  CostPlusTransparencyPanel,
  CrewCard,
  CrewCategory,
  CrewFilters,
  CrewMemberCardData,
  FeaturedCrewRail,
  SecondaryFilterRow,
} from "@/components/v2/crew-call";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const WILDFIRE_CREW: CrewMemberCardData[] = [
  { id: "wf-1", name: "Jordan R.", title: "Handyman", description: "General repairs, furniture assembly, minor electrical. 4.8 avg rating from 12 cooperative jobs.", category: "Handyman", adaptScore: 82, radiusMiles: 5, availability: "available", rateLabel: "Typical range: Cost + 20% for standard service scope", isFeatured: true },
  { id: "wf-2", name: "Priya M.", title: "Math & Science Tutor", description: "K-12 math and science. Former teacher, now cooperative tutor. Flexible scheduling.", category: "Tutoring", adaptScore: 91, radiusMiles: 10, availability: "available", rateLabel: "Typical range: Cost + 20% for advanced service scope", isFeatured: true },
  { id: "wf-3", name: "Carlos T.", title: "Grocery & Package Delivery", description: "Same-day delivery within 10 miles. Electric vehicle, insured.", category: "Delivery", adaptScore: 74, radiusMiles: 10, availability: "booked", rateLabel: "Typical range: Cost + 20% for flexible service scope", isFeatured: false },
  { id: "wf-4", name: "Mei L.", title: "Pet Sitting & Dog Walking", description: "Available weekdays. Experienced with dogs, cats, and small animals.", category: "Pet Care", adaptScore: 68, radiusMiles: 5, availability: "available", rateLabel: "Typical range: Cost + 20% for standard service scope", isFeatured: false },
  { id: "wf-5", name: "Open Position", title: "Social Media Manager", description: "Neighborhood crew seeking a social media coordinator for weekly content.", category: "Creative", adaptScore: null, radiusMiles: 25, availability: "available", rateLabel: "Typical range: Cost + 20% for flexible service scope", isFeatured: false },
  { id: "wf-6", name: "Open Position", title: "Photographer", description: "Product and event photography for local storefronts. Portfolio required.", category: "Creative", adaptScore: null, radiusMiles: 25, availability: "available", rateLabel: "Typical range: Cost + 20% for flexible service scope", isFeatured: false },
];

const DEFAULT_FILTERS: CrewFilters = {
  radius: "any",
  availability: "any",
  adaptMin: "0",
  sort: "recommended",
};

function toCanonicalCategory(raw: string | null | undefined): Exclude<CrewCategory, "All"> {
  const value = (raw ?? "").toLowerCase();
  if (value.includes("hand")) return "Handyman";
  if (value.includes("tutor") || value.includes("teach")) return "Tutoring";
  if (value.includes("deliver") || value.includes("route")) return "Delivery";
  if (value.includes("pet")) return "Pet Care";
  if (value.includes("tech") || value.includes("it") || value.includes("support")) return "Tech Support";
  return "Creative";
}

function radiusForCommitment(commitment: string | null | undefined): number {
  const value = (commitment ?? "").toLowerCase();
  if (value.includes("high")) return 5;
  if (value.includes("medium")) return 10;
  return 25;
}

function priceLabel(commitment: string | null | undefined) {
  const value = (commitment ?? "").toLowerCase();
  if (value.includes("high")) return "Typical range: Cost + 20% for advanced service scope";
  if (value.includes("medium")) return "Typical range: Cost + 20% for standard service scope";
  return "Typical range: Cost + 20% for flexible service scope";
}

export default function CrewCallBoardV2Page() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tourTarget = useTourTarget("crew-call");
  const { isRunning: isWildfireTour } = useWildfireRun();

  const [category, setCategory] = useState<CrewCategory>("All");
  const [filters, setFilters] = useState<CrewFilters>(DEFAULT_FILTERS);

  const rolesQuery = useQuery({
    queryKey: ["crew-call-v2-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crew_call_roles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        role_name: string;
        description: string | null;
        category: string;
        commitment_tier: string;
        claimed_by: string | null;
      }>;
    },
    enabled: !isWildfireTour,
  });

  const claimedUserIds = useMemo(
    () => Array.from(new Set((rolesQuery.data ?? []).map((row) => row.claimed_by).filter(Boolean))) as string[],
    [rolesQuery.data],
  );

  const profilesQuery = useQuery({
    queryKey: ["crew-call-v2-profiles", claimedUserIds],
    queryFn: async () => {
      if (claimedUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id,display_name,full_name")
        .in("user_id", claimedUserIds);
      if (error) throw error;
      return (data ?? []) as Array<{ user_id: string | null; display_name: string | null; full_name: string | null }>;
    },
    enabled: claimedUserIds.length > 0,
  });

  const adaptQuery = useQuery({
    queryKey: ["crew-call-v2-adapt", claimedUserIds],
    queryFn: async () => {
      if (claimedUserIds.length === 0) return new Map<string, number>();
      const { data, error } = await supabase
        .from("adapt_scores" as never)
        .select("system_id,score,measured_at")
        .in("system_id", claimedUserIds)
        .order("measured_at", { ascending: false }) as {
        data: Array<{ system_id: string; score: number; measured_at: string }> | null;
        error: unknown;
      };
      if (error) throw error;
      const bucket = new Map<string, number[]>();
      for (const row of data ?? []) {
        const list = bucket.get(row.system_id) ?? [];
        if (list.length < 6) {
          list.push(Number(row.score ?? 0));
          bucket.set(row.system_id, list);
        }
      }
      const out = new Map<string, number>();
      for (const [systemId, scores] of bucket.entries()) {
        if (scores.length > 0) {
          out.set(systemId, Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length));
        }
      }
      return out;
    },
    enabled: claimedUserIds.length > 0,
  });

  const bookingQuery = useQuery({
    queryKey: ["crew-call-v2-active-bookings", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from("crew_call_assignments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active");
      if (error) return 0;
      return (data ?? []).length;
    },
    enabled: !!user?.id,
  });

  const crewRows = useMemo(() => {
    if (isWildfireTour) return WILDFIRE_CREW;

    const profileNameByUser = new Map<string, string>();
    for (const row of profilesQuery.data ?? []) {
      if (!row.user_id) continue;
      profileNameByUser.set(row.user_id, row.display_name || row.full_name || "Crew member");
    }

    return (rolesQuery.data ?? []).map((row): CrewMemberCardData => {
      const crewName = row.claimed_by ? profileNameByUser.get(row.claimed_by) ?? "Crew member" : "Open crew slot";
      const canonicalCategory = toCanonicalCategory(row.category || row.role_name);
      const radiusMiles = radiusForCommitment(row.commitment_tier);
      const adaptScore = row.claimed_by ? adaptQuery.data?.get(row.claimed_by) ?? null : null;
      return {
        id: row.id,
        name: crewName,
        title: row.role_name,
        description: row.description ?? "Local cooperative service member.",
        category: canonicalCategory,
        adaptScore,
        radiusMiles,
        availability: row.claimed_by ? "booked" : "available",
        rateLabel: priceLabel(row.commitment_tier),
        isFeatured: adaptScore !== null && adaptScore >= 75,
      };
    });
  }, [adaptQuery.data, isWildfireTour, profilesQuery.data, rolesQuery.data]);

  const hasAnyFilterActive =
    category !== "All" || filters.radius !== "any" || filters.availability !== "any" || filters.adaptMin !== "0";

  const filteredRows = useMemo(() => {
    let rows = crewRows.filter((row) => {
      if (category !== "All" && row.category !== category) return false;
      if (filters.radius !== "any" && row.radiusMiles !== null && row.radiusMiles > Number(filters.radius)) return false;
      if (filters.availability === "available" && row.availability !== "available") return false;
      if (filters.availability === "booked" && row.availability !== "booked") return false;
      if (Number(filters.adaptMin) > 0 && (row.adaptScore === null || row.adaptScore < Number(filters.adaptMin))) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      if (filters.sort === "adapt") return (b.adaptScore ?? -1) - (a.adaptScore ?? -1);
      if (filters.sort === "availability") return a.availability.localeCompare(b.availability);
      const aScore = (a.adaptScore ?? 0) + (a.availability === "available" ? 8 : 0);
      const bScore = (b.adaptScore ?? 0) + (b.availability === "available" ? 8 : 0);
      return bScore - aScore;
    });

    return rows;
  }, [category, crewRows, filters]);

  const featuredRows = useMemo(
    () =>
      [...crewRows]
        .filter((row) => row.adaptScore !== null)
        .sort((a, b) => (b.adaptScore ?? 0) - (a.adaptScore ?? 0))
        .slice(0, 6),
    [crewRows],
  );

  return (
    <AppShell
      xrayBase="crew-call"
      pageTitle="Crew Call"
      breadcrumbs="Member workspace / Crew Call"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="Crew Call"
            headline="Hire the neighbor who already does it well."
            body="Browse crew members offering handyman, tutoring, delivery, pet care, tech support, and creative services — cooperative pricing, ADAPT-reviewed, visible."
            primaryCTA={{ label: "Browse all crew", href: "#crew-call-grid" }}
            secondaryCTA={{ label: "Offer my skills", href: "/crew/new" }}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {["6 categories", "ADAPT-reviewed", "Cost+20%"].map((item, index) => (
              <span key={item} className="inline-flex items-center gap-2">
                {index > 0 ? <span aria-hidden>&middot;</span> : null}
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />

        <CategoryFilterBar value={category} onChange={setCategory} />
        <SecondaryFilterRow filters={filters} onChange={setFilters} />

        <CostPlusTransparencyPanel />

        <ActiveBookingStatusBar bookingCount={bookingQuery.data ?? 0} />

        {!hasAnyFilterActive ? <FeaturedCrewRail items={featuredRows} /> : null}

        <section id="crew-call-grid">
          {rolesQuery.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-xl border bg-muted/30" />
              ))}
            </div>
          ) : filteredRows.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredRows.map((crew) => (
                <CrewCard key={crew.id} crew={crew} onBook={(row) => navigate(`/crew-call/legacy?role=${row.id}`)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No crew matched these filters yet.</p>
              <Button variant="outline" className="mt-3" onClick={() => { setCategory("All"); setFilters(DEFAULT_FILTERS); }}>
                Reset filters
              </Button>
            </div>
          )}
        </section>

        <StickyMobileCTA primary={{ label: "Browse all crew", href: "#crew-call-grid" }} />
      </div>
    </AppShell>
  );
}
