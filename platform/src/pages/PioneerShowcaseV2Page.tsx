import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { supabase } from "@/integrations/supabase/client";
import {
  BadgesRow,
  ContributionPaths,
  MemberStoriesCarousel,
  PioneerFilter,
  PioneerFiltersBar,
  PioneerGrid,
  PioneerHero,
  PioneerPerson,
  PioneerProfileDrawer,
  RewardLadder,
} from "@/components/v2/pioneers";

function mapRoleToCategory(role: string): Exclude<PioneerFilter, "all"> {
  const normalized = role.toLowerCase();
  if (normalized.includes("captain") || normalized.includes("teacher")) return "governance";
  if (normalized.includes("pearl") || normalized.includes("hexisle")) return "hexisle";
  return "marketplace";
}

function phaseFromNumber(pioneerNumber: number) {
  if (pioneerNumber <= 10) return "Phase I";
  if (pioneerNumber <= 100) return "Phase II";
  if (pioneerNumber <= 500) return "Phase III";
  return "Phase IV";
}

export default function PioneerShowcaseV2Page() {
  const tourTarget = useTourTarget("pioneers");
  const [filter, setFilter] = useState<PioneerFilter>("all");
  const [sortBy, setSortBy] = useState<"phase" | "name">("phase");
  const [drawerPerson, setDrawerPerson] = useState<PioneerPerson | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pioneersQuery = useQuery({
    queryKey: ["pioneers-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pioneers" as never)
        .select("id,cue_card_role,pioneer_number,tier,showcase_story,opted_in_showcase")
        .order("pioneer_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        cue_card_role: string;
        pioneer_number: number;
        tier: string;
        showcase_story: string | null;
        opted_in_showcase: boolean;
      }>;
    },
  });

  const pioneerPeople = useMemo<PioneerPerson[]>(
    () =>
      (pioneersQuery.data ?? []).map((pioneer) => {
        const phase = phaseFromNumber(pioneer.pioneer_number);
        const roleLabel = pioneer.cue_card_role.replace(/_/g, " ");
        return {
          id: pioneer.id,
          roleKey: pioneer.cue_card_role,
          category: mapRoleToCategory(pioneer.cue_card_role),
          displayName: `Member ${String(pioneer.pioneer_number).padStart(3, "0")}`,
          tagline: roleLabel,
          phaseLabel: phase,
          story:
            pioneer.showcase_story ||
            "Entered early, tested uncertain ground, and helped shape the path that later cohorts now extend.",
          contributions: [
            `${roleLabel} path activation`,
            "Validated contribution chapter in active cohort",
            "Shared practical learnings with incoming members",
          ],
          isPioneer: true,
          badges: [{ id: pioneer.tier, label: pioneer.tier.replace(/_/g, " "), meaning: "Cohort recognition marker" }],
        };
      }),
    [pioneersQuery.data],
  );

  const nonPioneerStories = useMemo<PioneerPerson[]>(
    () => [
      {
        id: "member-story-1",
        roleKey: "member",
        category: "marketplace",
        displayName: "New Cohort Builder",
        tagline: "Marketplace contributor",
        phaseLabel: "Current chapter",
        story: "Joined after the earliest cohorts and still shipped meaningful contributions in the same cooperative narrative.",
        contributions: ["Participated in member onboarding", "Completed first production support chapter"],
        isPioneer: false,
        badges: [],
      },
      {
        id: "member-story-2",
        roleKey: "member",
        category: "governance",
        displayName: "Governance Contributor",
        tagline: "Decision support participant",
        phaseLabel: "Current chapter",
        story: "Contributed steady governance work that strengthened continuity between early and current members.",
        contributions: ["Joined coverage-minute governance session", "Recorded decision rationale summaries"],
        isPioneer: false,
        badges: [],
      },
    ],
    [],
  );

  const allPeople = useMemo(() => [...pioneerPeople, ...nonPioneerStories], [pioneerPeople, nonPioneerStories]);

  const filtered = useMemo(() => {
    const base = filter === "all" ? pioneerPeople : pioneerPeople.filter((person) => person.category === filter);
    return [...base].sort((a, b) => {
      if (sortBy === "name") return a.displayName.localeCompare(b.displayName);
      return a.phaseLabel.localeCompare(b.phaseLabel);
    });
  }, [filter, pioneerPeople, sortBy]);

  const foundersOpenSlots = useMemo(() => {
    const foundersCount = (pioneersQuery.data ?? []).filter((person) => person.pioneer_number <= 10).length;
    return Math.max(0, 10 - foundersCount);
  }, [pioneersQuery.data]);

  return (
    <AppShell
      xrayBase="pioneers"
      pageTitle="Pioneer Showcase"
      breadcrumbs="Member workspace / Cohort story"
      hero={
        <Hero
          variant="app"
          eyebrow="Pioneers"
          headline="Pioneers Opened the Gate. Everyone Builds What Comes Next."
          body="Early cohorts took on more risk and recognition reflects that. New members join a living story still being written."
          primaryCTA={{ label: "Browse Pioneers", href: "#pioneers-grid-anchor" }}
          secondaryCTA={{ label: "See current contribution paths", href: "#pioneers-contribution-paths-anchor" }}
          proofStrip={["Marketplace", "HexIsle", "Governance"]}
        />
      }
    >
      <div className="space-y-6 pb-24">
        <div {...tourTarget} />
        <PioneerHero />
        <PioneerFiltersBar filter={filter} onFilterChange={setFilter} sortBy={sortBy} onSortChange={setSortBy} />

        <div id="pioneers-grid-anchor">
          <PioneerGrid
            people={filtered}
            onOpenProfile={(person) => {
              setDrawerPerson(person);
              setDrawerOpen(true);
            }}
          />
        </div>

        <RewardLadder />

        <div id="pioneers-contribution-paths-anchor">
          <ContributionPaths windowOpen={foundersOpenSlots > 0} onExplore={() => (window.location.href = "/dashboard/cue-cards")} />
        </div>

        <BadgesRow />
        <MemberStoriesCarousel stories={allPeople} />

        <StickyMobileCTA primary={{ label: "Browse Pioneers", href: "#pioneers-grid-anchor" }} />
      </div>

      <PioneerProfileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} person={drawerPerson} />
    </AppShell>
  );
}
