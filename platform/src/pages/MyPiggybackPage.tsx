import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubmissions, TIER_LABELS, IMPROVEMENT_TYPE_LABELS, type PiggybackSubmission } from "@/hooks/usePiggyback";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, Plus, ChevronDown, ChevronUp, Award, BarChart3, TrendingUp, Clock } from "lucide-react";

type TierSlug = 'tereno_certified' | 'tereno_approved' | 'hexisle_official' | 'hexisle_compatible' | 'hexisle_adaptable' | 'hexisle_inspired';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  under_review: { label: "Under Review", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  approved: { label: "Approved", color: "bg-green-500/20 text-green-400 border-green-500/30" },
  rejected: { label: "Rejected", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  revision_requested: { label: "Revision Requested", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  promoted: { label: "Promoted", color: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30" },
};

function SubmissionCard({ sub }: { sub: PiggybackSubmission }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const statusCfg = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.submitted;
  const canEdit = sub.status === "submitted" || sub.status === "revision_requested";

  return (
    <Card className={`transition-all ${sub.status === "promoted" ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
      <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-medium truncate">{sub.title}</CardTitle>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {IMPROVEMENT_TYPE_LABELS[sub.improvement_type as keyof typeof IMPROVEMENT_TYPE_LABELS] ?? sub.improvement_type}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(sub.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <p className="text-sm text-muted-foreground">{sub.description}</p>

          {sub.test_results && (
            <div className="p-2 rounded bg-muted/50 text-xs">
              <strong>Test Results:</strong> {sub.test_results}
            </div>
          )}

          {/* Tier info */}
          <div className="flex flex-wrap gap-2 text-xs">
            {sub.proposed_tier && (
              <span className="px-2 py-0.5 rounded bg-muted">
                Proposed: {TIER_LABELS[sub.proposed_tier as TierSlug]}
              </span>
            )}
            {sub.assigned_tier && (
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Assigned: {TIER_LABELS[sub.assigned_tier as TierSlug]}
              </span>
            )}
          </div>

          {/* Reviewer feedback */}
          {sub.reviewer_notes && (
            <div className="p-2 rounded border border-amber-500/30 bg-amber-500/5 text-xs">
              <strong>Reviewer Notes:</strong> {sub.reviewer_notes}
            </div>
          )}

          {/* Marks */}
          {sub.marks_awarded > 0 && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
              <Award className="h-4 w-4" /> {sub.marks_awarded} Marks Earned
              {sub.is_process_pioneer && (
                <Badge className="bg-amber-400/20 text-amber-300 ml-2">Process Pioneer</Badge>
              )}
            </div>
          )}

          {/* Print details */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {sub.printer_used && <span>Printer: {sub.printer_used}</span>}
            {sub.material_used && <span>Material: {sub.material_used}</span>}
            {sub.print_settings && <span>Settings: {sub.print_settings}</span>}
          </div>

          {canEdit && (
            <Button size="sm" variant="outline" onClick={() => navigate(`/piggyback?edit=${sub.id}`)}>
              Edit Submission
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default function MyPiggybackPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mySubmissions } = useSubmissions();
  const items = mySubmissions.data ?? [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Sign in to view your improvements</p>
            <Button onClick={() => navigate("/auth")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stats
  const total = items.length;
  const approved = items.filter(i => i.status === "approved" || i.status === "promoted").length;
  const totalMarks = items.reduce((sum, i) => sum + (i.marks_awarded ?? 0), 0);
  const tiers = new Set(items.filter(i => i.assigned_tier).map(i => i.assigned_tier));
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/10 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wrench className="h-6 w-6 text-amber-500" /> My Improvements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Piggyback Protocol submissions</p>
          </div>
          <Button onClick={() => navigate("/piggyback")} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" /> Submit Improvement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1 text-blue-400" />
              <p className="text-2xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total Submissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-green-400" />
              <p className="text-2xl font-bold">{approvalRate}%</p>
              <p className="text-xs text-muted-foreground">Approval Rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-amber-400" />
              <p className="text-2xl font-bold">{totalMarks}</p>
              <p className="text-xs text-muted-foreground">Marks Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-purple-400" />
              <p className="text-2xl font-bold">{tiers.size}</p>
              <p className="text-xs text-muted-foreground">Tiers Achieved</p>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No improvements yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Download a piece, print it, improve it, and submit your changes.
              </p>
              <Button onClick={() => navigate("/piggyback")} className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" /> Submit Your First Improvement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((sub) => (
              <SubmissionCard key={sub.id} sub={sub} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
