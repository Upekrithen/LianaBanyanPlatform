import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CheckCircle, XCircle, Eye, GitBranch, Clock, Send, Rocket,
  FileCode, Code2, Shield, Loader2,
} from "lucide-react";

type ReviewAction = "start_review" | "approve" | "reject" | "deploy";

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  submitted: { label: "Submitted", icon: Send, color: "text-blue-600 bg-blue-500/10" },
  under_review: { label: "Under Review", icon: Eye, color: "text-amber-600 bg-amber-500/10" },
  approved: { label: "Approved", icon: CheckCircle, color: "text-emerald-600 bg-emerald-500/10" },
  rejected: { label: "Rejected", icon: XCircle, color: "text-red-600 bg-red-500/10" },
  deployed: { label: "Deployed", icon: Rocket, color: "text-primary bg-primary/10" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.submitted;
  const Icon = cfg.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </Badge>
  );
}

function ReviewCard({
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

  return (
    <Card className={`border-l-4 ${submission.status === "under_review" ? "border-l-amber-500" : "border-l-blue-500"}`}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{submission.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span className="text-xs flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                Neighborhood: <code className="text-xs">{submission.neighborhood_id.slice(0, 8)}...</code>
              </span>
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(submission.created_at).toLocaleDateString()}
              </span>
              <span className="text-xs">
                By: <code className="text-xs">{submission.submitted_by.slice(0, 8)}...</code>
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

          <div className="space-y-2 border-t pt-3">
            <label className="text-sm font-medium">Reviewer Notes</label>
            <Textarea
              placeholder="Add review notes, feedback, or conditions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

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
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-500"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReview(submission.id, "reject", notes || undefined)}
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
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function TrunkMirrorReviewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "approved" | "history">("pending");

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["trunk-mirror-review-queue"],
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
      queryClient.invalidateQueries({ queryKey: ["trunk-mirror-review-queue"] });
      const labels: Record<string, string> = {
        start_review: "Review claimed",
        approve: "Submission approved",
        reject: "Submission rejected",
        deploy: "Changes deployed to neighborhood",
      };
      toast.success(labels[variables.action] ?? "Review updated");
    },
    onError: (err: any) => toast.error(`Review failed: ${err.message}`),
  });

  const handleReview = (id: string, action: ReviewAction, notes?: string) => {
    reviewMutation.mutate({ id, action, notes });
  };

  const pending = submissions.filter((s) => ["submitted", "under_review"].includes(s.status));
  const approved = submissions.filter((s) => s.status === "approved");
  const history = submissions.filter((s) => ["rejected", "deployed"].includes(s.status));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Harper Guild — Trunk Mirror Review</h1>
          <p className="text-muted-foreground">
            Review, approve, or reject neighborhood customizations submitted via Trunk Mirror.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cursor-pointer" onClick={() => setTab("pending")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{pending.length}</div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setTab("approved")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-2xl font-bold">{approved.length}</div>
                <p className="text-sm text-muted-foreground">Ready to Deploy</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer" onClick={() => setTab("history")}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Queue */}
      {tab === "pending" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Send className="h-5 w-5" /> Pending Review ({pending.length})
          </h2>
          {pending.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No submissions awaiting review</p>
              </CardContent>
            </Card>
          ) : (
            pending.map((s) => (
              <ReviewCard
                key={s.id}
                submission={s}
                onReview={handleReview}
                isPending={reviewMutation.isPending}
              />
            ))
          )}
        </div>
      )}

      {tab === "approved" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" /> Ready to Deploy ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No approved submissions awaiting deployment</p>
              </CardContent>
            </Card>
          ) : (
            approved.map((s) => (
              <ReviewCard
                key={s.id}
                submission={s}
                onReview={handleReview}
                isPending={reviewMutation.isPending}
              />
            ))
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" /> Completed ({history.length})
          </h2>
          {history.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <p>No completed reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            history.map((s) => (
              <ReviewCard
                key={s.id}
                submission={s}
                onReview={handleReview}
                isPending={reviewMutation.isPending}
              />
            ))
          )}
        </div>
      )}

      {/* Protocol reminder */}
      <Card className="bg-muted/30">
        <CardContent className="py-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Harper Guild Review Standards
          </p>
          <ol className="list-decimal ml-4 space-y-1">
            <li>Core protocol must be preserved — Cost+20%, governance, currency rules cannot be altered</li>
            <li>No !important overrides, no body/html selectors, no external resources in CSS</li>
            <li>LB ecosystem currency compatibility must be maintained</li>
            <li>Typical review turnaround: 24-72 hours</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
