import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Signal, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ReadAlongButton } from "@/components/ReadAlongButton";

type CueCardInterestSignalProps = {
  memberId: string;
  className?: string;
};

type ReadingBeacon = {
  id: string;
  reading_paper_key: string | null;
  reading_depth: number | null;
  reading_position: number | null;
  reading_ref_code: string | null;
};

const titleFromPaperKey = (paperKey: string | null) => {
  if (!paperKey) return "Unknown Paper";
  return paperKey
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const depthDots = (depth: number | null) => {
  const d = Math.max(1, Math.min(4, Number(depth ?? 1)));
  return Array.from({ length: 4 }).map((_, idx) => idx < d);
};

export function CueCardInterestSignal({ memberId, className }: CueCardInterestSignalProps) {
  const { user } = useAuth();
  const [cohortOverrides, setCohortOverrides] = useState<Record<string, number>>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cue-card-interest-signal", memberId],
    enabled: Boolean(memberId),
    queryFn: async () => {
      let sharedBeaconIds: string[] = [];

      const byMember = await supabase
        .from("cue_cards" as never)
        .select("shared_beacons")
        .eq("member_id", memberId)
        .maybeSingle() as { data: { shared_beacons?: string[] } | null; error: unknown };

      if (!byMember.error) {
        sharedBeaconIds = Array.isArray(byMember.data?.shared_beacons) ? byMember.data.shared_beacons : [];
      } else {
        const byUser = await supabase
          .from("cue_cards" as never)
          .select("shared_beacons")
          .eq("user_id", memberId)
          .maybeSingle() as { data: { shared_beacons?: string[] } | null };
        sharedBeaconIds = Array.isArray(byUser.data?.shared_beacons) ? byUser.data.shared_beacons : [];
      }

      if (!sharedBeaconIds.length) {
        return {
          beacons: [] as ReadingBeacon[],
          progressByPaper: {} as Record<string, number>,
          cohortCounts: {} as Record<string, number>,
        };
      }

      const { data: beaconsRaw } = await supabase
        .from("beacons" as never)
        .select("id, reading_paper_key, reading_depth, reading_position, reading_ref_code")
        .in("id", sharedBeaconIds) as { data: ReadingBeacon[] | null };

      const beacons = (beaconsRaw ?? []).filter((row) => row.reading_paper_key);
      const paperKeys = [...new Set(beacons.map((row) => row.reading_paper_key).filter(Boolean) as string[])];

      const { data: progressRows } = await supabase
        .from("reading_progress" as never)
        .select("content_id, percent_complete")
        .eq("member_id", memberId)
        .in("content_id", paperKeys) as { data: Array<{ content_id: string; percent_complete: number | null }> | null };

      const progressByPaper = (progressRows ?? []).reduce<Record<string, number>>((acc, row) => {
        acc[row.content_id] = Number(row.percent_complete ?? 0);
        return acc;
      }, {});

      const { data: cohortRows } = await supabase
        .from("reading_cohorts" as never)
        .select("paper_key")
        .in("paper_key", paperKeys) as { data: Array<{ paper_key: string }> | null };

      const cohortCounts = (cohortRows ?? []).reduce<Record<string, number>>((acc, row) => {
        acc[row.paper_key] = (acc[row.paper_key] ?? 0) + 1;
        return acc;
      }, {});

      return { beacons, progressByPaper, cohortCounts };
    },
  });

  const signals = useMemo(() => data?.beacons ?? [], [data?.beacons]);
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-4 w-4" />
            Reading Interest Signals
          </CardTitle>
          <CardDescription>Loading shared reading beacons...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !signals.length) return null;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Signal className="h-4 w-4" />
          Reading Interest Signals
        </CardTitle>
        <CardDescription>Shared reading beacons from this member's Cue Card.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {signals.map((signal) => {
          const paperKey = signal.reading_paper_key ?? "";
          const title = titleFromPaperKey(paperKey);
          const progress = data?.progressByPaper[paperKey] ?? 0;
          const cohortCount = cohortOverrides[paperKey] ?? data?.cohortCounts[paperKey] ?? 0;
          const showReadAlong = Boolean(user?.id) && user?.id !== memberId;

          return (
            <div key={signal.id} className="rounded-lg border border-border/70 p-3 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {title}
                  </div>
                  <div className="flex items-center gap-1">
                    {depthDots(signal.reading_depth).map((active, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      Depth {Math.max(1, Math.min(4, Number(signal.reading_depth ?? 1)))}/4
                    </span>
                  </div>
                </div>
                {showReadAlong ? (
                  <ReadAlongButton
                    sourceMemberId={memberId}
                    paperKey={paperKey}
                    paperTitle={title}
                    onSuccess={(payload) => {
                      if (typeof payload.cohort_size === "number") {
                        setCohortOverrides((prev) => ({ ...prev, [paperKey]: payload.cohort_size ?? 0 }));
                      }
                    }}
                  />
                ) : (
                  <Badge variant="secondary">Shared</Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress: {Math.round(progress)}%</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {cohortCount} {cohortCount === 1 ? "person" : "people"} reading this
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
