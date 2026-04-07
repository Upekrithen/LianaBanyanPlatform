import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/shells";
import { Hero } from "@/components/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentShieldBanner } from "@/components/neighborhoods/ContentShieldBanner";
import { useContentShield, type ContentShieldViolation } from "@/hooks/useContentShield";
import {
  Shield, Eye, CheckCircle2, XCircle, Send, Rocket, Clock,
  GitBranch, Code2, FileCode, Loader2, AlertTriangle, Scale
} from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: string;
  neighborhood_id: string;
  submitted_by: string;
  title: string;
  description: string | null;
  diff_summary: string | null;
  theme_config_draft: Record<string, unknown>;
  custom_css_draft: string | null;
  status: string;
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface ShieldLogEntry {
  id: string;
  neighborhood_id: string | null;
  submission_id: string | null;
  field_name: string;
  category: string;
  severity: string;
  blocked: boolean;
  created_at: string;
}

type ReviewAction = "start_review" | "approve" | "reject" | "deploy";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  submitted: { label: "Submitted", icon: Send, color: "text-blue-600 bg-blue-500/10" },
  under_review: { label: "Under Review", icon: Eye, color: "text-amber-600 bg-amber-500/10" },
  approved: { label: "Approved", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-500/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-500/10" },
  deployed: { label: "Deployed", icon: Rocket, color: "text-primary bg-primary/10" },
};

const COMPLIANCE_CHECKLIST = [
  "No advertising or affiliate links",
  "No external tracking/analytics",
  "No platform bypass (embedding external checkout to skip LB economic rails — linking to Etsy/Shopify via Plugs is FINE)",
  "Cost+20% floor preserved",
  "Creator keeps 83.3% not hidden",
  "No misleading financial claims",
  "CSS is sandboxed (no external resources)",
  "No impersonation of LB official status",
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </Badge>
  );
}

function ReviewPanel({
  submission,
  onReview,
  isPending,
}: {
  submission: Submission;
  onReview: (id: string, action: ReviewAction, notes?: string) => void;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState(submission.reviewer_notes ?? "");
  const [expanded, setExpanded] = useState(false);
  const [checklist, setChecklist] = useState<boolean[]>(new Array(COMPLIANCE_CHECKLIST.length).fill(false));
  const { validate, violations, validating } = useContentShield();

  const allChecked = checklist.every(Boolean);

  const runScan = async () => {
    await validate({
      description: submission.description ?? undefined,
      custom_css: submission.custom_css_draft ?? undefined,
      theme_config: submission.theme_config_draft ?? undefined,
    });
  };

  return (
    <Card className={`border-l-4 ${
      submission.status === "under_review" ? "border-l-amber-500" : "border-l-blue-500"
    }`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{submission.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span className="text-xs flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {submission.neighborhood_id.slice(0, 8)}...
              </span>
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(submission.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs">
                By: {submission.submitted_by.slice(0, 8)}...
              </span>
            </CardDescription>
          </div>
          <StatusBadge status={submission.status} />
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {submission.description && (
            <p className="text-sm">{submission.description}</p>
          )}
          {submission.diff_summary && (
            <div className="bg-muted/50 rounded-md p-2 text-xs font-mono text-muted-foreground">
              <span className="font-medium text-foreground">Change summary:</span> {submission.diff_summary}
            </div>
          )}
          {submission.custom_css_draft && (
            <details className="text-xs" open>
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Code2 className="h-3 w-3" /> CSS Changes
              </summary>
              <pre className="mt-1 bg-muted/50 rounded-md p-2 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                {submission.custom_css_draft}
              </pre>
            </details>
          )}
          {submission.theme_config_draft && Object.keys(submission.theme_config_draft).length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center gap-1">
                <FileCode className="h-3 w-3" /> Theme Config
              </summary>
              <pre className="mt-1 bg-muted/50 rounded-md p-2 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                {JSON.stringify(submission.theme_config_draft, null, 2)}
              </pre>
            </details>
          )}

          {/* Auto Content Shield Scan */}
          <div className="space-y-2 border-t pt-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" /> Content Shield Scan
              </p>
              <Button size="sm" variant="outline" onClick={runScan} disabled={validating} className="gap-1">
                {validating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                Run Scan
              </Button>
            </div>
            <ContentShieldBanner violations={violations} validating={validating} />
            {!validating && violations.length === 0 && (
              <p className="text-xs text-emerald-600">No automated violations detected.</p>
            )}
          </div>

          {/* Compliance Checklist */}
          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Scale className="w-4 h-4" /> Compliance Checklist
            </p>
            <p className="text-xs text-muted-foreground">All items must be checked before approving.</p>
            <div className="space-y-2">
              {COMPLIANCE_CHECKLIST.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Checkbox
                    id={`check-${submission.id}-${i}`}
                    checked={checklist[i]}
                    onCheckedChange={(v) => {
                      const next = [...checklist];
                      next[i] = !!v;
                      setChecklist(next);
                    }}
                  />
                  <Label
                    htmlFor={`check-${submission.id}-${i}`}
                    className="text-sm leading-snug cursor-pointer"
                  >
                    {item}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 border-t pt-3">
            <label className="text-sm font-medium">Reviewer Notes</label>
            <Textarea
              placeholder="Add review notes, feedback, or conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {submission.status === "submitted" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview(submission.id, "start_review", notes || undefined)}
                disabled={isPending}
              >
                <Eye className="h-4 w-4 mr-1" /> Claim Review
              </Button>
            )}
            {["submitted", "under_review"].includes(submission.status) && (
              <>
                <Button
                  size="sm"
                  onClick={() => onReview(submission.id, "approve", notes || undefined)}
                  disabled={isPending || !allChecked}
                  className="bg-emerald-600 hover:bg-emerald-500"
                  title={!allChecked ? "Complete all checklist items first" : ""}
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (!notes.trim()) {
                      toast.error("Rejection requires notes explaining what needs to change");
                      return;
                    }
                    onReview(submission.id, "reject", notes);
                  }}
                  disabled={isPending}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            {submission.status === "approved" && (
              <Button
                size="sm"
                onClick={() => onReview(submission.id, "deploy", notes || undefined)}
                disabled={isPending}
              >
                <Rocket className="h-4 w-4 mr-1" /> Deploy to Neighborhood
              </Button>
            )}
            {!allChecked && ["submitted", "under_review"].includes(submission.status) && (
              <p className="text-xs text-muted-foreground self-center">
                Complete all checklist items to enable approval
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function HarperReviewDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["harper-review-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trunk_mirror_submissions" as never)
        .select("*")
        .in("status", ["submitted", "under_review", "approved", "rejected", "deployed"])
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Submission[];
    },
    enabled: !!user,
  });

  const { data: nonCompliant = [] } = useQuery({
    queryKey: ["non-compliant-neighborhoods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhoods" as never)
        .select("id, slug, name, city, star_chamber_compliant, harper_score, status")
        .eq("star_chamber_compliant", false)
        .limit(25);
      if (error) throw error;
      return (data ?? []) as { id: string; slug: string; name: string; city: string; harper_score: number; status: string }[];
    },
    enabled: !!user,
  });

  const { data: recentLogs = [] } = useQuery({
    queryKey: ["content-shield-recent-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighborhood_content_shield_log" as never)
        .select("id, neighborhood_id, submission_id, field_name, category, severity, blocked, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as unknown as ShieldLogEntry[];
    },
    enabled: !!user,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: ReviewAction; notes?: string }) => {
      const { error } = await supabase.rpc("review_trunk_mirror_submission" as never, {
        p_submission_id: id,
        p_action: action,
        p_notes: notes ?? null,
      } as never);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["harper-review-dashboard"] });
      const labels: Record<string, string> = {
        start_review: "Review claimed",
        approve: "Submission approved",
        reject: "Submission rejected — submitter notified",
        deploy: "Changes deployed to neighborhood",
      };
      toast.success(labels[variables.action] ?? "Review updated");
    },
    onError: (err: any) => toast.error(`Review failed: ${err.message}`),
  });

  const pending = submissions.filter((s) => ["submitted", "under_review"].includes(s.status));
  const approved = submissions.filter((s) => s.status === "approved");
  const history = submissions.filter((s) => ["rejected", "deployed"].includes(s.status));
  const blockedLogs = recentLogs.filter((l) => l.blocked);
  const flaggedLogs = recentLogs.filter((l) => !l.blocked);

  return (
    <AppShell
      xrayBase="harper-review-dashboard"
      pageTitle="Harper Review Dashboard"
      breadcrumbs="Governance / Harper Review"
      hero={
        <Hero
          variant="app"
          eyebrow="Harper Guild"
          headline="Neighborhood Content Review"
          body="Review Trunk Mirror submissions, monitor non-compliant neighborhoods, and track Content Shield audit activity. Every approval requires the full compliance checklist."
          proofStrip={[
            `${pending.length} pending`,
            `${approved.length} ready to deploy`,
            `${nonCompliant.length} non-compliant`,
            `${blockedLogs.length} recent blocks`,
          ]}
        />
      }
    >
      <div className="space-y-6 pb-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold">{pending.length}</div>
                  <p className="text-xs text-muted-foreground">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="text-2xl font-bold">{approved.length}</div>
                  <p className="text-xs text-muted-foreground">Ready to Deploy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold">{nonCompliant.length}</div>
                  <p className="text-xs text-muted-foreground">Non-Compliant</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold">{blockedLogs.length}</div>
                  <p className="text-xs text-muted-foreground">Recent Blocks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Review Queue ({pending.length})</TabsTrigger>
            <TabsTrigger value="deploy">Ready to Deploy ({approved.length})</TabsTrigger>
            <TabsTrigger value="non-compliant">Non-Compliant ({nonCompliant.length})</TabsTrigger>
            <TabsTrigger value="shield-log">Shield Log ({recentLogs.length})</TabsTrigger>
            <TabsTrigger value="history">History ({history.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="space-y-3 mt-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : pending.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No submissions awaiting review</p>
                </CardContent>
              </Card>
            ) : (
              pending.map((s) => (
                <ReviewPanel
                  key={s.id}
                  submission={s}
                  onReview={(id, action, notes) => reviewMutation.mutate({ id, action, notes })}
                  isPending={reviewMutation.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="deploy" className="space-y-3 mt-4">
            {approved.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No approved submissions awaiting deployment</p>
                </CardContent>
              </Card>
            ) : (
              approved.map((s) => (
                <ReviewPanel
                  key={s.id}
                  submission={s}
                  onReview={(id, action, notes) => reviewMutation.mutate({ id, action, notes })}
                  isPending={reviewMutation.isPending}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="non-compliant" className="space-y-3 mt-4">
            {nonCompliant.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>All neighborhoods are Star Chamber compliant</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {nonCompliant.map((n) => (
                  <Card key={n.id} className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{n.name}</CardTitle>
                      <CardDescription>{n.city} — {n.status}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-amber-600 bg-amber-500/10">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Non-Compliant
                      </Badge>
                      <Badge variant="secondary">
                        Harper: {typeof n.harper_score === "number" ? n.harper_score.toFixed(1) : "N/A"}
                      </Badge>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" variant="outline" asChild>
                        <a href={`/neighborhoods/${n.slug}`}>View Neighborhood</a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shield-log" className="space-y-3 mt-4">
            {recentLogs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No shield activity recorded</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`flex items-start gap-3 text-sm p-2 rounded-md ${
                          log.blocked ? "bg-red-500/5" : "bg-amber-500/5"
                        }`}
                      >
                        {log.blocked ? (
                          <Shield className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">{log.category}</Badge>
                            <Badge variant={log.blocked ? "destructive" : "secondary"} className="text-xs">
                              {log.blocked ? "Blocked" : "Flagged"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.field_name}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(log.created_at).toLocaleString()}
                            {log.neighborhood_id && ` — hood: ${log.neighborhood_id.slice(0, 8)}...`}
                            {log.submission_id && ` — sub: ${log.submission_id.slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            {history.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <p>No completed reviews yet</p>
                </CardContent>
              </Card>
            ) : (
              history.map((s) => (
                <ReviewPanel
                  key={s.id}
                  submission={s}
                  onReview={(id, action, notes) => reviewMutation.mutate({ id, action, notes })}
                  isPending={reviewMutation.isPending}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Review standards */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Harper Guild Review Standards
            </p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>All checklist items must be verified before approval</li>
              <li>Rejections require reviewer notes explaining what to fix</li>
              <li>Content Shield auto-scan supplements but does not replace human review</li>
              <li>Core protocol must be preserved — Cost+20%, governance, currency rules cannot be altered</li>
              <li>Linking to your own Etsy/Shopify via Plugs is fine — embedding external checkout to skip LB rails is not</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
