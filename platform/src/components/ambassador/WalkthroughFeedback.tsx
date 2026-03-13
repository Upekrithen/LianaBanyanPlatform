/**
 * WALKTHROUGH FEEDBACK — Inline form when Ambassador flags a step.
 * Submits to walkthrough_feedback. data-xray-id: walkthrough-feedback
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const FEEDBACK_TYPES = [
  { value: "confusing", label: "Confusing — recruit didn't understand" },
  { value: "too_slow", label: "Too slow — this step drags" },
  { value: "too_fast", label: "Too fast — needs more explanation" },
  { value: "wrong_screen", label: "Wrong screen — what they saw didn't match" },
  { value: "great", label: "Great! — this step worked perfectly" },
  { value: "suggestion", label: "Suggestion — I'd reword this" },
] as const;

export interface WalkthroughFeedbackProps {
  stepId: string;
  ambassadorId: string;
  recruitId: string | null;
  onSubmitted: () => void;
  onCancel: () => void;
  className?: string;
}

export function WalkthroughFeedback({
  stepId,
  ambassadorId,
  recruitId,
  onSubmitted,
  onCancel,
  className,
}: WalkthroughFeedbackProps) {
  const [feedbackType, setFeedbackType] = useState<string>("confusing");
  const [details, setDetails] = useState("");
  const [suggestedReword, setSuggestedReword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from("walkthrough_feedback").insert({
          step_id: stepId,
          ambassador_id: ambassadorId,
          recruit_id: recruitId,
          feedback_type: feedbackType,
          details: details.trim() || null,
          suggested_reword: feedbackType === "suggestion" ? suggestedReword.trim() || null : null,
        });
      if (error) throw error;
      onSubmitted();
    } catch {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("border-2 border-amber-500/30", className)} data-xray-id="walkthrough-feedback">
      <CardContent className="p-4 space-y-4">
        <p className="text-sm font-medium">What happened at this step?</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            {FEEDBACK_TYPES.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="feedbackType"
                  value={opt.value}
                  checked={feedbackType === opt.value}
                  onChange={() => setFeedbackType(opt.value)}
                  className="rounded-full"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <div>
            <Label htmlFor="details">Details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Anything else that would help?"
              className="mt-1 min-h-[60px] resize-none"
            />
          </div>
          {feedbackType === "suggestion" && (
            <div>
              <Label htmlFor="suggestedReword">Suggested rewording</Label>
              <Textarea
                id="suggestedReword"
                value={suggestedReword}
                onChange={(e) => setSuggestedReword(e.target.value)}
                placeholder="How would you reword it?"
                className="mt-1 min-h-[60px] resize-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Submitting…" : "Submit feedback"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
