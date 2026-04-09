import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  AdaptPillar,
  AdaptPillarKey,
  FivePillarBreakdown,
  ImpactExplanation,
  ImprovementSuggestionsRail,
  OverallScoreCard,
  PercentileContextPanel,
  SevenDayTrendSparklines,
} from "@/components/v2/adapt";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type AdaptScoreRow = {
  system_id: string;
  dimension: string;
  score: number;
  measured_at: string;
};

const PILLARS: Array<{ key: AdaptPillarKey; label: string; icon: string; driver: string; roomToGrow: string }> = [
  {
    key: "adaptability",
    label: "Adaptability",
    icon: "Compass",
    driver: "Driven by how quickly you integrate updates and apply feedback in active workflows.",
    roomToGrow: "Test one new pattern this week and close one learning loop quickly.",
  },
  {
    key: "durability",
    label: "Durability",
    icon: "Shield",
    driver: "Reflects consistency across sustained contribution windows and reliable follow-through.",
    roomToGrow: "Protect one repeatable rhythm for the next seven days.",
  },
  {
    key: "alignment",
    label: "Alignment",
    icon: "Scale",
    driver: "Measures how well your actions map to cooperative standards and shared operating agreements.",
    roomToGrow: "Anchor your next action to one explicit shared standard.",
  },
  {
    key: "participation",
    label: "Participation",
    icon: "Users",
    driver: "Captures cooperative participation depth across tasks, responses, and collaborative signals.",
    roomToGrow: "Join one additional collaborative thread and close it fully.",
  },
  {
    key: "transmission",
    label: "Transmission",
    icon: "Send",
    driver: "Tracks how clearly your work transfers to others through documentation and handoff quality.",
    roomToGrow: "Publish one cleaner handoff note to improve shared continuity.",
  },
];

function scoreFor(rows: AdaptScoreRow[], key: AdaptPillarKey): number {
  const latest = rows
    .filter((row) => row.dimension === key)
    .sort((a, b) => +new Date(b.measured_at) - +new Date(a.measured_at))[0];
  return Number(latest?.score ?? 0);
}

function sevenDayTrend(rows: AdaptScoreRow[], key: AdaptPillarKey): number[] {
  const now = new Date();
  const series = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const byDate = new Map<string, number[]>();
  rows
    .filter((row) => row.dimension === key)
    .forEach((row) => {
      const day = new Date(row.measured_at).toISOString().slice(0, 10);
      const list = byDate.get(day) ?? [];
      list.push(Number(row.score ?? 0));
      byDate.set(day, list);
    });
  return series.map((day) => {
    const list = byDate.get(day) ?? [];
    if (list.length === 0) return 0;
    return Math.round(list.reduce((sum, value) => sum + value, 0) / list.length);
  });
}

function composite(pillars: AdaptPillar[]): number {
  if (!pillars.length) return 0;
  return pillars.reduce((sum, pillar) => sum + pillar.score, 0) / pillars.length;
}

function topPercentile(current: number, allComposite: number[]): number {
  const valid = allComposite.filter((value) => Number.isFinite(value));
  if (!valid.length) return 100;
  const aboveOrEqual = valid.filter((value) => value >= current).length;
  return Math.max(1, Math.min(100, Math.round((aboveOrEqual / valid.length) * 100)));
}

export default function AdaptScoreV2Page() {
  const { user } = useAuth();
  const tourTarget = useTourTarget("adapt");

  const scoresQuery = useQuery({
    queryKey: ["adapt-v2-member-scores", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const mine = await supabase
        .from("adapt_scores" as any)
        .select("system_id,dimension,score,measured_at")
        .eq("system_id", user!.id)
        .order("measured_at", { ascending: false })
        .limit(240);

      if (!mine.error && (mine.data ?? []).length > 0) {
        return (mine.data ?? []) as AdaptScoreRow[];
      }

      const fallback = await supabase
        .from("adapt_scores" as any)
        .select("system_id,dimension,score,measured_at")
        .order("measured_at", { ascending: false })
        .limit(500);

      if (fallback.error) throw fallback.error;
      return (fallback.data ?? []) as AdaptScoreRow[];
    },
  });

  const percentileQuery = useQuery({
    queryKey: ["adapt-v2-percentile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("adapt_scores" as any)
        .select("system_id,dimension,score,measured_at")
        .order("measured_at", { ascending: false })
        .limit(1200);
      if (error) return [] as number[];
      const rows = (data ?? []) as AdaptScoreRow[];
      const bySystem = new Map<string, AdaptScoreRow[]>();
      for (const row of rows) {
        const list = bySystem.get(row.system_id) ?? [];
        list.push(row);
        bySystem.set(row.system_id, list);
      }
      return Array.from(bySystem.values()).map((systemRows) => {
        const pillarScores = PILLARS.map((pillar) => scoreFor(systemRows, pillar.key));
        return pillarScores.reduce((sum, value) => sum + value, 0) / Math.max(1, pillarScores.length);
      });
    },
  });

  const pillars = useMemo<AdaptPillar[]>(() => {
    const rows = scoresQuery.data ?? [];
    return PILLARS.map((pillar) => ({
      key: pillar.key,
      label: pillar.label,
      icon: pillar.icon,
      score: scoreFor(rows, pillar.key),
      trend: sevenDayTrend(rows, pillar.key),
      driver: pillar.driver,
      roomToGrow: pillar.roomToGrow,
    }));
  }, [scoresQuery.data]);

  const overall = useMemo(() => composite(pillars), [pillars]);
  const percentile = useMemo(
    () => topPercentile(overall, percentileQuery.data ?? []),
    [overall, percentileQuery.data],
  );

  const suggestions = useMemo(() => {
    const sorted = [...pillars].sort((a, b) => a.score - b.score).slice(0, 3);
    return sorted.map((pillar) => `${pillar.label}: ${pillar.roomToGrow}`);
  }, [pillars]);

  return (
    <AppShell
      xrayBase="adapt"
      pageTitle="ADAPT Score"
      breadcrumbs="Member workspace / ADAPT"
      hero={
        <div className="space-y-4">
          <Hero
            variant="app"
            eyebrow="ADAPT Score"
            headline="See how your contributions are shaping your standing."
            body="Five pillars, seven-day trends, and forward-looking nudges so you always know where you are and where to grow next."
            primaryCTA={{ label: "View my full breakdown", href: "#adapt-five-pillar-breakdown" }}
            secondaryCTA={{ label: "How ADAPT works", href: "#adapt-impact-explanation" }}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {["5 pillars", "7-day trends", "Room to grow"].map((item, index) => (
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
        <div {...tourTarget} data-xray-id="adapt-tour-anchor" />

        <OverallScoreCard score={overall} percentileTop={percentile} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section id="adapt-five-pillar-breakdown">
            <FivePillarBreakdown pillars={pillars} />
          </section>
          <section id="adapt-seven-day-trends">
            <SevenDayTrendSparklines pillars={pillars} />
          </section>
        </div>

        <PercentileContextPanel percentileTop={percentile} />
        <section id="adapt-impact-explanation">
          <ImpactExplanation />
        </section>
        <ImprovementSuggestionsRail suggestions={suggestions} />

        <div data-xray-id="adapt-mobile-cta">
          <StickyMobileCTA primary={{ label: "View my full breakdown", href: "#adapt-five-pillar-breakdown" }} />
        </div>
      </div>
    </AppShell>
  );
}
