import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, CheckCircle2, Clock, Zap, Skull,
  RefreshCw, Send, Twitter, Linkedin, Instagram, Globe,
} from "lucide-react";

type QueueStatus = "scheduled" | "posting" | "posted" | "failed" | "cancelled" | "suspended" | "dead_letter";

type QueueRow = {
  id: string;
  platform: string;
  status: string;
  scheduled_for: string;
  content: string | null;
  dispatch_mode: string | null;
  retry_count: number | null;
  error_message: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  user_id: string;
  batch_id: string;
  dispatch_mode: string;
  platform_count: number;
  platforms: string[];
  base_content: string | null;
  created_at: string;
};

type DeadLetterRow = {
  id: string;
  original_post_id: string | null;
  source_table: string;
  platform: string;
  error_message: string | null;
  attempt_count: number;
  first_failed_at: string | null;
  last_failed_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

const CRON_JOBS = [
  { name: "process-scheduled-posts", schedule: "Every 15 min", cron: "*/15 * * * *" },
  { name: "dispatch-crewman-episode", schedule: "Hourly", cron: "0 * * * *" },
  { name: "crewman-distribution-analytics-daily", schedule: "2:15 AM UTC", cron: "15 2 * * *" },
];

const PLATFORMS = ["twitter", "linkedin", "instagram", "bluesky"] as const;

function platformIcon(platform: string) {
  switch (platform) {
    case "twitter": case "x": return <Twitter className="h-4 w-4" />;
    case "linkedin": return <Linkedin className="h-4 w-4" />;
    case "instagram": return <Instagram className="h-4 w-4" />;
    default: return <Globe className="h-4 w-4" />;
  }
}

function statusBadge(status: string) {
  const variant = status === "posted" ? "default"
    : status === "scheduled" ? "secondary"
    : status === "failed" || status === "dead_letter" ? "destructive"
    : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DispatchHealthPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("queue");
  const [auditPlatformFilter, setAuditPlatformFilter] = useState<string>("all");
  const [resolveNotes, setResolveNotes] = useState("");

  // ─── Queue Inspector ──────────────────────────────────────────────

  const memberQueueQuery = useQuery({
    queryKey: ["dispatch-health-member-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_scheduled_posts" as never)
        .select("id,platform,status,scheduled_for,content,dispatch_mode,retry_count,error_message,created_at")
        .order("scheduled_for", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as QueueRow[];
    },
  });

  const legacyQueueQuery = useQuery({
    queryKey: ["dispatch-health-legacy-queue"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_posts" as never)
        .select("id,platform,status,scheduled_for,post_text,retry_count,error_message,created_at")
        .order("scheduled_for", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []).map((r: any) => ({ ...r, content: r.post_text, dispatch_mode: "legacy" })) as QueueRow[];
    },
  });

  const allQueue = useMemo(() => {
    return [...(memberQueueQuery.data ?? []), ...(legacyQueueQuery.data ?? [])].sort(
      (a, b) => new Date(b.scheduled_for).getTime() - new Date(a.scheduled_for).getTime()
    );
  }, [memberQueueQuery.data, legacyQueueQuery.data]);

  const queueCounts = useMemo(() => {
    const counts: Record<string, number> = { scheduled: 0, posting: 0, posted: 0, failed: 0, cancelled: 0, suspended: 0, dead_letter: 0 };
    for (const row of allQueue) counts[row.status] = (counts[row.status] || 0) + 1;
    return counts;
  }, [allQueue]);

  // ─── Audit Log ────────────────────────────────────────────────────

  const auditQuery = useQuery({
    queryKey: ["dispatch-health-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_audit_log" as never)
        .select("id,user_id,batch_id,dispatch_mode,platform_count,platforms,base_content,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as AuditRow[];
    },
  });

  const filteredAudit = useMemo(() => {
    if (auditPlatformFilter === "all") return auditQuery.data ?? [];
    return (auditQuery.data ?? []).filter((r) => r.platforms.includes(auditPlatformFilter));
  }, [auditQuery.data, auditPlatformFilter]);

  // ─── Dead Letters ─────────────────────────────────────────────────

  const deadLetterQuery = useQuery({
    queryKey: ["dispatch-health-dead-letters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dispatch_dead_letters" as never)
        .select("*")
        .order("last_failed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as DeadLetterRow[];
    },
  });

  const unresolvedDeadLetters = useMemo(
    () => (deadLetterQuery.data ?? []).filter((d) => !d.resolved_at),
    [deadLetterQuery.data],
  );

  const resolveDeadLetterMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: "retry" | "dismiss"; notes: string }) => {
      const { error } = await supabase.rpc("resolve_dead_letter" as never, {
        p_dead_letter_id: id,
        p_action: action,
        p_notes: notes || action,
      } as never);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      toast.success(vars.action === "retry" ? "Post re-queued." : "Dead letter dismissed.");
      queryClient.invalidateQueries({ queryKey: ["dispatch-health-dead-letters"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-health-member-queue"] });
      setResolveNotes("");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed."),
  });

  // ─── Platform Status ──────────────────────────────────────────────

  const platformStats = useMemo(() => {
    return PLATFORMS.map((p) => {
      const posts = allQueue.filter((r) => r.platform === p || (p === "twitter" && r.platform === "x"));
      const lastSuccess = posts.find((r) => r.status === "posted");
      const queued = posts.filter((r) => r.status === "scheduled").length;
      const failed = posts.filter((r) => r.status === "failed" || r.status === "dead_letter").length;
      const total = posts.length;
      return {
        platform: p,
        connected: total > 0,
        lastSuccess: lastSuccess?.scheduled_for ?? null,
        queued,
        failed,
        errorRate: total > 0 ? ((failed / total) * 100).toFixed(1) : "0",
      };
    });
  }, [allQueue]);

  // ─── Test Fire ────────────────────────────────────────────────────

  const testFireMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-scheduled-posts`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test_mode: true }),
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(`Test fire complete. Processed: ${data.processed}, Success: ${data.success}, Failed: ${data.failed}`);
      queryClient.invalidateQueries({ queryKey: ["dispatch-health-member-queue"] });
      queryClient.invalidateQueries({ queryKey: ["dispatch-health-legacy-queue"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Test fire failed."),
  });

  return (
    <AppShell
      xrayBase="dispatch-health"
      pageTitle="Dispatch Health"
      breadcrumbs="Ops / Battery Dispatch"
    >
      <div className="space-y-6 pb-24">
        {/* ─── Summary Strip ─── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <div><p className="text-2xl font-bold">{queueCounts.scheduled}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Send className="h-5 w-5 text-amber-500" />
              <div><p className="text-2xl font-bold">{queueCounts.posting}</p><p className="text-xs text-muted-foreground">Processing</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <div><p className="text-2xl font-bold">{queueCounts.posted}</p><p className="text-xs text-muted-foreground">Sent</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div><p className="text-2xl font-bold">{queueCounts.failed}</p><p className="text-xs text-muted-foreground">Failed</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Skull className="h-5 w-5 text-red-700" />
              <div><p className="text-2xl font-bold">{unresolvedDeadLetters.length}</p><p className="text-xs text-muted-foreground">Dead Letters</p></div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Platform Status Cards ─── */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {platformStats.map((ps) => (
            <Card key={ps.platform}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {platformIcon(ps.platform)}
                  <CardTitle className="text-sm capitalize">{ps.platform === "twitter" ? "Twitter / X" : ps.platform}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={ps.connected ? "default" : "outline"}>{ps.connected ? "Active" : "No posts"}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Queued:</span><span>{ps.queued}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error rate:</span><span>{ps.errorRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last success:</span>
                  <span className="text-xs">{formatDate(ps.lastSuccess)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Cron Status Panel ─── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Cron Schedule</CardTitle>
              <CardDescription>Expected pg_cron entries for dispatch pipeline.</CardDescription>
            </div>
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => testFireMutation.mutate()}
                disabled={testFireMutation.isPending}
              >
                <Zap className="mr-1 h-4 w-4" />
                {testFireMutation.isPending ? "Firing..." : "Test Fire"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Cron Expression</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {CRON_JOBS.map((job) => (
                  <TableRow key={job.name}>
                    <TableCell className="font-mono text-sm">{job.name}</TableCell>
                    <TableCell>{job.schedule}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{job.cron}</TableCell>
                    <TableCell><Badge variant="default">Configured</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ─── Tabs: Queue / Audit / Dead Letters ─── */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="queue">Queue Inspector</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
            <TabsTrigger value="dead-letters" className="gap-1">
              Dead Letters
              {unresolvedDeadLetters.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">{unresolvedDeadLetters.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Queue Inspector */}
          <TabsContent value="queue" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Scheduled Posts Queue</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => { queryClient.invalidateQueries({ queryKey: ["dispatch-health-member-queue"] }); queryClient.invalidateQueries({ queryKey: ["dispatch-health-legacy-queue"] }); }}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Scheduled For</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead>Content</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allQueue.slice(0, 50).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="capitalize flex items-center gap-1">{platformIcon(row.platform)} {row.platform}</TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                        <TableCell className="text-xs">{formatDate(row.scheduled_for)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{row.dispatch_mode || "—"}</Badge></TableCell>
                        <TableCell>{row.retry_count ?? 0}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{row.content?.slice(0, 80) || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {allQueue.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No posts in queue.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Log */}
          <TabsContent value="audit" className="mt-4 space-y-3">
            <div className="flex gap-1 flex-wrap">
              <Badge variant={auditPlatformFilter === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setAuditPlatformFilter("all")}>All</Badge>
              {PLATFORMS.map((p) => (
                <Badge key={p} variant={auditPlatformFilter === p ? "default" : "outline"} className="cursor-pointer capitalize" onClick={() => setAuditPlatformFilter(p)}>{p}</Badge>
              ))}
            </div>
            <Card>
              <CardContent className="overflow-x-auto py-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Platforms</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Content</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAudit.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-xs">{formatDate(row.created_at)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{row.dispatch_mode}</Badge></TableCell>
                        <TableCell className="flex gap-1">{row.platforms.map((p) => <span key={p} className="capitalize">{platformIcon(p)}</span>)}</TableCell>
                        <TableCell>{row.platform_count}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{row.base_content?.slice(0, 80) || "—"}</TableCell>
                      </TableRow>
                    ))}
                    {filteredAudit.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No audit entries.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dead Letters */}
          <TabsContent value="dead-letters" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Skull className="h-5 w-5 text-red-700" />
                  Dead Letter Queue
                </CardTitle>
                <CardDescription>Posts that failed 3+ times. Admin action required — no auto-retry.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(deadLetterQuery.data ?? []).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No dead letters. Pipeline is healthy.</p>
                ) : (
                  (deadLetterQuery.data ?? []).map((dl) => (
                    <Card key={dl.id} className={dl.resolved_at ? "opacity-60" : "border-red-200"}>
                      <CardContent className="py-4 space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {platformIcon(dl.platform)}
                            <span className="font-medium capitalize">{dl.platform}</span>
                            <Badge variant="destructive">{dl.attempt_count} attempts</Badge>
                            <Badge variant="outline" className="text-xs">{dl.source_table}</Badge>
                          </div>
                          {dl.resolved_at ? (
                            <Badge variant="default">Resolved {formatDate(dl.resolved_at)}</Badge>
                          ) : (
                            <Badge variant="destructive">Unresolved</Badge>
                          )}
                        </div>
                        <p className="text-sm text-destructive">{dl.error_message || "Unknown error"}</p>
                        <div className="text-xs text-muted-foreground">
                          First failed: {formatDate(dl.first_failed_at)} · Last: {formatDate(dl.last_failed_at)}
                        </div>
                        {dl.payload && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground">Payload</summary>
                            <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">{JSON.stringify(dl.payload, null, 2)}</pre>
                          </details>
                        )}
                        {!dl.resolved_at && isAdmin && (
                          <div className="flex items-center gap-2 mt-2">
                            <Input
                              placeholder="Resolution notes..."
                              value={resolveNotes}
                              onChange={(e) => setResolveNotes(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => resolveDeadLetterMutation.mutate({ id: dl.id, action: "retry", notes: resolveNotes })}
                              disabled={resolveDeadLetterMutation.isPending}
                            >
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveDeadLetterMutation.mutate({ id: dl.id, action: "dismiss", notes: resolveNotes })}
                              disabled={resolveDeadLetterMutation.isPending}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                        {dl.resolution_notes && (
                          <p className="text-xs text-muted-foreground italic">Notes: {dl.resolution_notes}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
