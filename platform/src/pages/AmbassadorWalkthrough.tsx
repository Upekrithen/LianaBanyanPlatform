/**
 * AMBASSADOR WALKTHROUGH PAGE — /ambassador/walkthrough?recruit=[id]
 * Loads sequence steps and recruit, marks walkthrough started, renders WalkthroughSequence.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { WalkthroughSequence } from "@/components/ambassador/WalkthroughSequence";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import type { WalkthroughStepRow } from "@/components/ambassador/WalkthroughCard";

export default function AmbassadorWalkthrough() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const recruitId = searchParams.get("recruit");
  const [ambassadorId, setAmbassadorId] = useState<string | null>(null);
  const [steps, setSteps] = useState<WalkthroughStepRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !recruitId) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: amb } = await supabase
        .from("ambassadors")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (!amb?.id) {
        setLoading(false);
        return;
      }
      setAmbassadorId(amb.id);
      await supabase
        .from("ambassador_recruits")
        .update({
          status: "walkthrough_started",
          walkthrough_started_at: new Date().toISOString(),
        })
        .eq("id", recruitId)
        .eq("ambassador_id", amb.id);
      const { data: seq } = await supabase
        .from("walkthrough_sequences")
        .select("id")
        .eq("sequence_key", "default")
        .single();
      if (seq?.id) {
        const { data: stepsData } = await supabase
          .from("walkthrough_steps")
          .select("id, step_number, title, instruction, screen_hint, tip, common_questions, estimated_seconds, requires_action, action_label")
          .eq("sequence_id", seq.id)
          .order("step_number");
        setSteps((stepsData ?? []) as WalkthroughStepRow[]);
      }
    })().finally(() => setLoading(false));
  }, [user?.id, recruitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading walkthrough…</p>
      </div>
    );
  }

  if (!recruitId || !ambassadorId) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Missing recruit or you&apos;re not an Ambassador.</p>
        <Button variant="outline" onClick={() => navigate("/ambassador/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-xl mx-auto space-y-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/ambassador/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <WalkthroughSequence
          steps={steps}
          ambassadorId={ambassadorId}
          recruitId={recruitId}
          onComplete={() => navigate("/ambassador/dashboard")}
        />
      </div>
    </div>
  );
}
