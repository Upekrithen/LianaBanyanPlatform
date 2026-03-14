/**
 * REVIEW QUEUE ITEM — View content, SEC flags, approve/reject/needs revision
 * Route: /reviewer/queue/:id. data-xray-id: review-queue-item
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SECLanguageHighlighter } from "@/components/reviewer/SECLanguageHighlighter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

type QueueRow = {
  id: string;
  content_type: string;
  content_snapshot: Record<string, unknown>;
  status: string;
  sec_flags: { term: string; suggestion: string; severity: string }[] | null;
  sec_flag_count: number;
  assigned_to: string | null;
};

export default function ReviewQueueItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<QueueRow | null>(null);
  const [reviewerId, setReviewerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [revisionInstructions, setRevisionInstructions] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!id || !user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: rev } = await supabase
        .from("reviewers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (rev) setReviewerId(rev.id);

      const { data, error } = await supabase
        .from("review_queue")
        .select("id, content_type, content_snapshot, status, sec_flags, sec_flag_count, assigned_to")
        .eq("id", id)
        .single();
      if (!error && data) setItem(data as QueueRow);
      setLoading(false);
    })();
  }, [id, user?.id]);

  const handleAction = async (action: "approved" | "rejected" | "needs_revision") => {
    if (!id || !reviewerId) return;
    if (action === "rejected" && !rejectionReason.trim()) return;
    if (action === "needs_revision" && !revisionInstructions.trim()) return;
    setActionLoading(true);
    await supabase
      .from("review_queue")
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        rejection_reason: action === "rejected" ? rejectionReason : null,
        revision_instructions: action === "needs_revision" ? revisionInstructions : null,
      })
      .eq("id", id);
    await supabase.from("review_history").insert({
      queue_item_id: id,
      reviewer_id: reviewerId,
      action,
      notes: action === "rejected" ? rejectionReason : action === "needs_revision" ? revisionInstructions : null,
    });
    setActionLoading(false);
    navigate("/reviewer/dashboard");
  };

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">{item ? "Loading…" : "Not found."}</p>
      </div>
    );
  }

  const snapshot = item.content_snapshot ?? {};
  const textContent = typeof snapshot.body === "string" ? snapshot.body : typeof snapshot.description === "string" ? snapshot.description : JSON.stringify(snapshot);

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto" data-xray-id="review-queue-item">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/reviewer/dashboard">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
        </Link>
      </Button>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <p className="text-sm text-muted-foreground">{item.content_type}</p>
        </CardHeader>
        <CardContent>
          <div className="rounded border p-3 bg-muted/20">
            <SECLanguageHighlighter text={textContent} />
          </div>
        </CardContent>
      </Card>

      {item.sec_flags && item.sec_flags.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>SEC flags ({item.sec_flag_count})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.sec_flags.map((f, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{f.term}</span> → {f.suggestion}
                  {f.severity === "critical" && <span className="text-red-600 ml-1">(critical)</span>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {item.assigned_to === reviewerId && item.status === "assigned" && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Rejection reason (if rejecting)</Label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Required if you reject"
                rows={2}
              />
            </div>
            <div>
              <Label>Revision instructions (if needs revision)</Label>
              <Textarea
                value={revisionInstructions}
                onChange={(e) => setRevisionInstructions(e.target.value)}
                placeholder="Required if sending back for revision"
                rows={2}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => handleAction("approved")} disabled={actionLoading}>
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("rejected")}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleAction("needs_revision")}
                disabled={actionLoading || !revisionInstructions.trim()}
              >
                Needs revision
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
