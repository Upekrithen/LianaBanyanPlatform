import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Activity, RefreshCw } from "lucide-react";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

type WorkerStatus = {
  worker_name: string;
  last_run_at: string | null;
  last_success_at: string | null;
  last_error_at: string | null;
  error_count: number;
  last_error_message: string | null;
  last_stats: Record<string, unknown> | null;
};

type HourlyRate = {
  platform: string;
  hour_bucket: string;
  rows_inserted: number;
  events_recorded: number;
};

type CoverageGap = {
  platform: string;
  platform_post_id: string;
  chapter_id: string;
  episode_number: number | null;
  posted_at: string;
  engagement_rows: number;
  engagement_total: number;
  last_event_at: string | null;
};

const POLL_WORKERS = [
  "poll-x-engagement",
  "poll-threads-engagement",
  "poll-linkedin-engagement",
  "poll-meta-engagement",
] as const;

export default function EngagementIngestionMonitor() {
  const queryClient = useQueryClient();

  const workerQuery = useQuery({
    queryKey: ["engagement-ingestion-workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_ingestion_worker_status" as never)
        .select("worker_name, last_run_at, last_success_at, last_error_at, error_count, last_error_message, last_stats")
        .order("worker_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WorkerStatus[];
    },
  });

  const rateQuery = useQuery({
    queryKey: ["engagement-events-per-hour"],
    queryFn: async () => {
      const fromIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("engagement_events_per_platform_hour" as never)
        .select("platform, hour_bucket, rows_inserted, events_recorded")
        .gte("hour_bucket", fromIso)
        .order("hour_bucket", { ascending: false })
        .limit(120);
      if (error) throw error;
      return (data ?? []) as HourlyRate[];
    },
  });

  const gapQuery = useQuery({
    queryKey: ["engagement-ingestion-gaps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_ingestion_coverage_gaps" as never)
        .select("platform, platform_post_id, chapter_id, episode_number, posted_at, engagement_rows, engagement_total, last_event_at")
        .order("posted_at", { ascending: false })
        .limit(40);
      if (error) throw error;
      return (data ?? []) as CoverageGap[];
    },
  });

  const repollMutation = useMutation({
    mutationFn: async () => {
      const results: Array<{ worker: string; ok: boolean; message: string }> = [];
      for (const worker of POLL_WORKERS) {
        const { data, error } = await supabase.functions.invoke(worker, { body: {} });
        if (error) {
          results.push({ worker, ok: false, message: error.message });
        } else {
          const message =
            typeof data?.rows_inserted === "number"
              ? `${data.rows_inserted} rows inserted`
              : "triggered";
          results.push({ worker, ok: true, message });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const failed = results.filter((row) => !row.ok);
      const success = results.filter((row) => row.ok);
      if (failed.length > 0) {
        toast.error(`Re-poll finished with ${failed.length} failures.`);
      } else {
        toast.success(`Re-poll complete. ${success.length} workers finished.`);
      }
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["engagement-ingestion-workers"] }),
        queryClient.invalidateQueries({ queryKey: ["engagement-events-per-hour"] }),
        queryClient.invalidateQueries({ queryKey: ["engagement-ingestion-gaps"] }),
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Re-poll failed.");
    },
  });

  const eventsByPlatform = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of rateQuery.data ?? []) {
      totals.set(row.platform, (totals.get(row.platform) ?? 0) + (row.events_recorded ?? 0));
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }, [rateQuery.data]);

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-engagement-ingestion-monitor">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <StaffPageHeader
                title={
                  <span className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Engagement Ingestion Monitor
                  </span>
                }
                description="Observe webhook/polling health and trigger manual re-poll for vote-gate event ingestion."
                actions={(
                  <Button onClick={() => repollMutation.mutate()} disabled={repollMutation.isPending}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {repollMutation.isPending ? "Running..." : "Manual Re-poll"}
                  </Button>
                )}
              />
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline">{(workerQuery.data ?? []).length} workers tracked</Badge>
              <Badge variant="outline">{(gapQuery.data ?? []).length} coverage gaps (72h)</Badge>
              <Badge variant="outline">{eventsByPlatform.length} active platforms (24h)</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Worker Status</CardTitle>
              <CardDescription>Last run, success/error timestamps, and error counts by ingestion worker.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Worker</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Last Success</TableHead>
                    <TableHead>Last Error</TableHead>
                    <TableHead>Errors</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(workerQuery.data ?? []).map((row) => (
                    <TableRow key={row.worker_name}>
                      <TableCell className="font-medium">{row.worker_name}</TableCell>
                      <TableCell>{formatDateTime(row.last_run_at)}</TableCell>
                      <TableCell>{formatDateTime(row.last_success_at)}</TableCell>
                      <TableCell>{formatDateTime(row.last_error_at)}</TableCell>
                      <TableCell>
                        <Badge variant={row.error_count > 0 ? "destructive" : "secondary"}>{row.error_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Events Per Platform (24h)</CardTitle>
                <CardDescription>Aggregated event_count over hourly ingestion buckets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {eventsByPlatform.map(([platform, total]) => (
                  <div key={platform} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                    <span className="capitalize">{platform}</span>
                    <span>{total.toLocaleString()} events</span>
                  </div>
                ))}
                {eventsByPlatform.length === 0 && (
                  <p className="text-sm text-muted-foreground">No ingestion activity in the last 24 hours.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Gaps</CardTitle>
                <CardDescription>Posts mapped in last 72h with zero engagement events recorded.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {(gapQuery.data ?? []).slice(0, 10).map((gap) => (
                  <div key={`${gap.platform}-${gap.platform_post_id}`} className="rounded border p-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium capitalize">{gap.platform}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(gap.posted_at)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Chapter: {gap.chapter_id} | Episode: {gap.episode_number ?? "-"}
                    </div>
                  </div>
                ))}
                {(gapQuery.data ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No gaps detected in the last 72 hours.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}
