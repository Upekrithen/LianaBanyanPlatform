import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useReviewQueue, TIER_LABELS, TIER_MARKS, IMPROVEMENT_TYPE_LABELS, type PiggybackSubmission } from "@/hooks/usePiggyback";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, RotateCcw, ArrowUpCircle, Tag, Clock, Wrench, ExternalLink } from "lucide-react";

type TierSlug = 'tereno_certified' | 'tereno_approved' | 'hexisle_official' | 'hexisle_compatible' | 'hexisle_adaptable' | 'hexisle_inspired';
type ReviewAction = 'approve' | 'reject' | 'request_revision' | 'promote' | 'assign_tier';

function ReviewCard({ submission, onReview }: {
  submission: PiggybackSubmission;
  onReview: (id: string, action: ReviewAction, tier?: TierSlug, notes?: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [selectedTier, setSelectedTier] = useState<TierSlug | "">(submission.proposed_tier ?? "");
  const [expanded, setExpanded] = useState(false);

  const handleAction = (action: ReviewAction) => {
    const tier = selectedTier || undefined;
    onReview(submission.id, action, tier as TierSlug | undefined, notes || undefined);
  };

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{submission.title}</CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {IMPROVEMENT_TYPE_LABELS[submission.improvement_type as keyof typeof IMPROVEMENT_TYPE_LABELS] ?? submission.improvement_type}
              </Badge>
              {submission.proposed_tier && (
                <Badge variant="secondary" className="text-xs">
                  Proposed: {TIER_LABELS[submission.proposed_tier as TierSlug]}
                </Badge>
              )}
              <span className="text-xs flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(submission.created_at).toLocaleDateString()}
              </span>
            </CardDescription>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">{submission.status}</Badge>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Details */}
          <div className="space-y-2 text-sm">
            <p>{submission.description}</p>
            {submission.test_results && (
              <div className="p-2 rounded bg-muted/50">
                <strong>Test Results:</strong> {submission.test_results}
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {submission.printer_used && <span>Printer: {submission.printer_used}</span>}
              {submission.material_used && <span>Material: {submission.material_used}</span>}
              {submission.print_settings && <span>Settings: {submission.print_settings}</span>}
            </div>
            {submission.stl_url && (
              <a href={submission.stl_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> View STL
              </a>
            )}
            {submission.photo_urls && submission.photo_urls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {submission.photo_urls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="h-16 w-16 rounded border bg-muted flex items-center justify-center text-xs hover:border-primary">
                    Photo {i + 1}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Tier assignment */}
          <div className="space-y-2">
            <label className="text-xs font-medium">Assign Tier</label>
            <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as TierSlug)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select tier..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TIER_LABELS) as [TierSlug, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label} ({TIER_MARKS[key]} Marks)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reviewer notes */}
          <Textarea
            placeholder="Reviewer feedback (visible to submitter)..."
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm"
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => handleAction("approve")} className="bg-green-600 hover:bg-green-700 gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" onClick={() => handleAction("promote")} className="bg-amber-600 hover:bg-amber-700 gap-1">
              <ArrowUpCircle className="h-3.5 w-3.5" /> Promote to Production
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction("assign_tier")} className="gap-1">
              <Tag className="h-3.5 w-3.5" /> Assign Tier Only
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAction("request_revision")} className="gap-1 text-orange-400">
              <RotateCcw className="h-3.5 w-3.5" /> Request Revision
            </Button>
            <Button size="sm" variant="destructive" onClick={() => handleAction("reject")} className="gap-1">
              <XCircle className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function PiggybackReviewPage() {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pendingReviews, allReviewable, reviewSubmission } = useReviewQueue();
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Admin access required</p>
            <Button variant="outline" onClick={() => navigate("/")} className="mt-4">Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = filter === "pending"
    ? (pendingReviews.data ?? [])
    : (allReviewable.data ?? []);

  const handleReview = async (id: string, action: ReviewAction, tier?: TierSlug, notes?: string) => {
    try {
      await reviewSubmission.mutateAsync({ submissionId: id, action, tier, notes });
      toast({
        title: `Submission ${action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "promote" ? "promoted" : action === "request_revision" ? "sent back for revision" : "updated"}`,
        description: tier ? `Tier: ${TIER_LABELS[tier]} (${TIER_MARKS[tier]} Marks)` : undefined,
      });
    } catch {
      toast({ title: "Review failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-amber-950/10 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Wrench className="h-6 w-6 text-amber-500" /> Piggyback Review Queue
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} submission{items.length !== 1 ? "s" : ""} awaiting review
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All Reviewable
            </Button>
          </div>
        </div>

        {/* Queue */}
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500/50" />
              <p className="font-medium">Queue is clear</p>
              <p className="text-sm">No submissions awaiting review right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((sub) => (
              <ReviewCard key={sub.id} submission={sub} onReview={handleReview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
