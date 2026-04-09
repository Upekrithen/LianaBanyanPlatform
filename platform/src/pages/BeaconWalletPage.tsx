import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Bookmark, CheckCircle2, Clock3, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type WalletEntry = {
  beacon_id?: string;
  reading_paper_key: string | null;
  reading_ref_code: string | null;
  reading_position: number | null;
  reading_depth: number | null;
  reading_completed_at: string | null;
  last_read_at: string | null;
  coverage_minutes: number | null;
  golden_keys: number | null;
  percent_complete: number | null;
};

type WalletResponse = {
  success: boolean;
  stats: {
    total_beacons: number;
    papers_started: number;
    papers_completed: number;
    coverage_minutes: number;
  };
  active_reads: WalletEntry[];
  completed_reads: WalletEntry[];
};

const titleFromPaperKey = (paperKey: string | null) => {
  if (!paperKey) return "Unknown Paper";
  return paperKey
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const depthToProgress = (depth: number | null) => {
  const d = Math.max(1, Math.min(4, Number(depth ?? 1)));
  return (d / 4) * 100;
};

export default function BeaconWalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleShareInterestSignal = async (beaconId?: string) => {
    if (!beaconId) {
      toast.error("Missing beacon ID for this read.");
      return;
    }
    try {
      const { error } = await supabase.functions.invoke("share-interest-signal", {
        body: { beacon_id: beaconId },
      });
      if (error) throw error;
      toast.success("Shared to Cue Card interest signals.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to share to Cue Card.");
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["beacon-wallet", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: response, error: fnError } = await supabase.functions.invoke("get-beacon-wallet");
      if (fnError) throw fnError;
      return (response ?? {
        success: true,
        stats: { total_beacons: 0, papers_started: 0, papers_completed: 0, coverage_minutes: 0 },
        active_reads: [],
        completed_reads: [],
      }) as WalletResponse;
    },
  });

  const stats = useMemo(
    () =>
      data?.stats ?? {
        total_beacons: 0,
        papers_started: 0,
        papers_completed: 0,
        coverage_minutes: 0,
      },
    [data],
  );

  if (!user) {
    return (
      <PortalPageLayout>
        <Card>
          <CardHeader>
            <CardTitle>Beacon Wallet</CardTitle>
            <CardDescription>Sign in to access your reading beacons.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/join")}>Join / Sign In</Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bookmark className="h-7 w-7" />
              Beacon Wallet
            </h1>
            <p className="text-muted-foreground mt-1">
              Track reading depth across Skipping Stones, pudding layers, and full papers.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/the-helm")}>
            Back to Helm
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs uppercase text-muted-foreground">Total Beacons</p>
              <p className="text-2xl font-semibold">{stats.total_beacons}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs uppercase text-muted-foreground">Papers Started</p>
              <p className="text-2xl font-semibold">{stats.papers_started}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs uppercase text-muted-foreground">Papers Completed</p>
              <p className="text-2xl font-semibold">{stats.papers_completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-xs uppercase text-muted-foreground">Coverage Minutes</p>
              <p className="text-2xl font-semibold">{Math.round(stats.coverage_minutes)}</p>
            </CardContent>
          </Card>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-amber-500" />
            <h2 className="text-xl font-semibold">Active Reads</h2>
          </div>
          {isLoading ? (
            <Card><CardContent className="pt-6 text-sm text-muted-foreground">Loading beacon wallet...</CardContent></Card>
          ) : error ? (
            <Card><CardContent className="pt-6 text-sm text-destructive">Unable to load beacon wallet.</CardContent></Card>
          ) : data?.active_reads?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.active_reads.map((entry, idx) => (
                <Card key={`${entry.reading_ref_code}-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {titleFromPaperKey(entry.reading_paper_key)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <Badge variant="secondary">{entry.reading_ref_code ?? "Pending Ref"}</Badge>
                      <span>Depth {entry.reading_depth ?? 1} of 4</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Depth Progress</span>
                        <span>{Math.round(depthToProgress(entry.reading_depth))}%</span>
                      </div>
                      <Progress value={depthToProgress(entry.reading_depth)} className="h-2" />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: {entry.reading_position ?? 0} | Last read:{" "}
                      {entry.last_read_at ? new Date(entry.last_read_at).toLocaleDateString() : "n/a"}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() =>
                        navigate(`/cephas/${entry.reading_paper_key ?? ""}?position=${entry.reading_position ?? 0}`)
                      }
                    >
                      Continue Reading
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                No active reads yet.
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-xl font-semibold">Completed Reads</h2>
          </div>
          {data?.completed_reads?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.completed_reads.map((entry, idx) => (
                <Card key={`${entry.reading_ref_code}-${idx}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{titleFromPaperKey(entry.reading_paper_key)}</CardTitle>
                    <CardDescription>
                      <Badge>{entry.reading_ref_code ?? "Reading Beacon"}</Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      Completed:{" "}
                      {entry.reading_completed_at
                        ? new Date(entry.reading_completed_at).toLocaleDateString()
                        : "Completed"}
                    </p>
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <KeyRound className="w-4 h-4" />
                      Golden keys: {entry.golden_keys ?? 0}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleShareInterestSignal(entry.beacon_id)}
                    >
                      Share on Cue Card
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Completed reads will appear here after depth 4 completion.
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </PortalPageLayout>
  );
}
