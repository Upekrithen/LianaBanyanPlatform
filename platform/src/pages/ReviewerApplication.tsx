/**
 * REVIEWER APPLICATION — Apply to become a Content or Stat Reviewer
 * Route: /reviewer/apply. data-xray-id: reviewer-application
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SAMPLE_PIECE = `Our platform lets you invest in creator projects. You get equity in the project and can expect ROI as the project grows. Shareholders receive dividend payments.`;

export default function ReviewerApplication() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasReviewer, setHasReviewer] = useState(false);
  const [pendingApp, setPendingApp] = useState<{ tier: string } | null>(null);
  const [tier, setTier] = useState<"content" | "stat">("content");
  const [motivation, setMotivation] = useState("");
  const [experience, setExperience] = useState("");
  const [sampleReview, setSampleReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: reviewer } = await supabase
        .from("reviewers")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (reviewer) {
        setHasReviewer(true);
        setLoading(false);
        return;
      }
      const { data: app } = await supabase
        .from("reviewer_applications")
        .select("tier")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .maybeSingle();
      if (app) setPendingApp(app);
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (hasReviewer) {
    navigate("/reviewer/dashboard", { replace: true });
    return null;
  }

  if (pendingApp) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto" data-xray-id="reviewer-application">
        <Card>
          <CardHeader>
            <CardTitle>Application pending</CardTitle>
            <p className="text-sm text-muted-foreground">
              A Harper will review your application. You&apos;ll be notified when it&apos;s decided.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen p-6 max-w-lg mx-auto" data-xray-id="reviewer-application">
        <Card>
          <CardHeader>
            <CardTitle>Application submitted</CardTitle>
            <p className="text-sm text-muted-foreground">
              A Harper will review your application. You&apos;ll be notified when it&apos;s decided.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || motivation.length < 50 || motivation.length > 500) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviewer_applications").insert({
      user_id: user.id,
      tier,
      motivation: motivation.trim(),
      relevant_experience: experience.trim() || null,
      sample_review: sampleReview.trim() || null,
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  };

  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto" data-xray-id="reviewer-application">
      <Card>
        <CardHeader>
          <CardTitle>Become a Reviewer</CardTitle>
          <p className="text-sm text-muted-foreground">
            Content Reviewers check spelling, formatting, and basic SEC language. Stat Reviewers need 50+ content reviews and Harper nomination.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tier</Label>
              <Select value={tier} onValueChange={(v) => setTier(v as "content" | "stat")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="content">Content Reviewer</SelectItem>
                  <SelectItem value="stat">Stat Reviewer (requires 50+ content reviews)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Why do you want to review? (50–500 characters)</Label>
              <Textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                minLength={50}
                maxLength={500}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">{motivation.length}/500</p>
            </div>
            <div>
              <Label>Relevant experience (optional)</Label>
              <Textarea
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Sample review — review this piece for SEC language and clarity:</Label>
              <div className="rounded border p-3 text-sm bg-muted/30 mb-2">{SAMPLE_PIECE}</div>
              <Textarea
                value={sampleReview}
                onChange={(e) => setSampleReview(e.target.value)}
                placeholder="Your review and suggested changes…"
                rows={4}
              />
            </div>
            <Button type="submit" disabled={submitting || motivation.length < 50}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
