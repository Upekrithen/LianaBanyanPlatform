/**
 * REVIEWER DASHBOARD — My queue, available queue, history
 * Route: /reviewer/dashboard. data-xray-id: reviewer-dashboard
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ReviewerBadge, type ReviewerTier } from "@/components/reviewer/ReviewerBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PortalPageLayout } from '@/components/PortalPageLayout';

type QueueItem = {
  id: string;
  content_type: string;
  submitted_at: string;
  status: string;
  sec_flag_count: number;
};

type HistoryEntry = {
  id: string;
  action: string;
  created_at: string;
  queue_item_id: string;
};

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviewer, setReviewer] = useState<{ id: string; tier: ReviewerTier; reviews_completed: number; accuracy_rate: number } | null>(null);
  const [myQueue, setMyQueue] = useState<QueueItem[]>([]);
  const [availableQueue, setAvailableQueue] = useState<QueueItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: rev } = await supabase
        .from("reviewers")
        .select("id, tier, reviews_completed, accuracy_rate")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!rev) {
        setLoading(false);
        navigate("/reviewer/apply", { replace: true });
        return;
      }
      setReviewer(rev as { id: string; tier: ReviewerTier; reviews_completed: number; accuracy_rate: number });

      const { data: assigned } = await supabase
        .from("review_queue")
        .select("id, content_type, submitted_at, status, sec_flag_count")
        .eq("assigned_to", rev.id)
        .eq("status", "assigned")
        .order("assigned_at", { ascending: false });
      setMyQueue((assigned ?? []) as QueueItem[]);

      const { data: pending } = await supabase
        .from("review_queue")
        .select("id, content_type, submitted_at, status, sec_flag_count")
        .eq("status", "pending")
        .order("submitted_at", { ascending: true })
        .limit(20);
      setAvailableQueue((pending ?? []) as QueueItem[]);

      const { data: hist } = await supabase
        .from("review_history")
        .select("id, action, created_at, queue_item_id")
        .eq("reviewer_id", rev.id)
        .order("created_at", { ascending: false })
        .limit(15);
      setHistory((hist ?? []) as HistoryEntry[]);

      setLoading(false);
    })();
  }, [user?.id, navigate]);

  if (loading) {
    return (
      <PortalPageLayout>
        <p className="text-muted-foreground">Loading…</p>
      </PortalPageLayout>
    );
  }

  if (!reviewer) return null;

  const contentReviewsForStat = 50;
  const canApplyStat = reviewer.tier === "content" && reviewer.reviews_completed >= contentReviewsForStat;
  const promotionEligibility =
    reviewer.tier === "content"
      ? canApplyStat
        ? "Eligible for Stat Reviewer (Harper nomination required)."
        : `${contentReviewsForStat - reviewer.reviews_completed} more content reviews to qualify for Stat.`
      : reviewer.tier === "stat"
        ? "Harper promotion is by Guild nomination."
        : null;

  const handleClaim = async (queueId: string) => {
    if (!reviewer?.id || !user?.id) return;
    await supabase
      .from("review_queue")
      .update({ assigned_to: reviewer.id, assigned_at: new Date().toISOString(), status: "assigned" })
      .eq("id", queueId);
    await supabase.from("review_history").insert({
      queue_item_id: queueId,
      reviewer_id: reviewer.id,
      action: "claimed",
    });
    setAvailableQueue((q) => q.filter((i) => i.id !== queueId));
    setMyQueue((q) => {
      const item = availableQueue.find((i) => i.id === queueId);
      return item ? [{ ...item, status: "assigned" }, ...q] : q;
    });
  };

  return (
    <PortalPageLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ReviewerBadge tier={reviewer.tier} />
          <span className="text-sm text-muted-foreground">
            {reviewer.reviews_completed} reviews · {Number(reviewer.accuracy_rate).toFixed(0)}% accuracy
          </span>
        </div>
      </div>
      {promotionEligibility && (
        <p className="text-sm text-muted-foreground mb-4">{promotionEligibility}</p>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My queue</CardTitle>
          <p className="text-sm text-muted-foreground">Items assigned to you</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {myQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No items assigned.</p>
          ) : (
            myQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <span className="font-medium">{item.content_type}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </span>
                  {item.sec_flag_count > 0 && (
                    <span className="ml-2 text-red-600 text-sm" title="SEC flags">
                      {item.sec_flag_count} flag(s)
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/reviewer/queue/${item.id}`}>Review</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Available queue</CardTitle>
          <p className="text-sm text-muted-foreground">Claim an item to review</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableQueue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending items.</p>
          ) : (
            availableQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <div>
                  <span className="font-medium">{item.content_type}</span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {new Date(item.submitted_at).toLocaleDateString()}
                  </span>
                  {item.sec_flag_count > 0 && (
                    <span className="ml-2 text-red-600 text-sm">{item.sec_flag_count} flag(s)</span>
                  )}
                </div>
                <Button size="sm" onClick={() => handleClaim(item.id)}>
                  Claim
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My history</CardTitle>
          <p className="text-sm text-muted-foreground">Recent review actions</p>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No actions yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex items-center gap-2">
                  <span className="font-medium">{h.action}</span>
                  <span className="text-muted-foreground">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                  <Link to={`/reviewer/queue/${h.queue_item_id}`} className="text-primary underline">
                    View item
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}
