/**
 * AMBASSADOR CERTIFICATION — Level-up assessment at /ambassador/certify (V2).
 * Gated by level-up requirements. 80% pass threshold.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbassadorLevelBadge } from "@/components/ambassador/AmbassadorLevelBadge";
import { AmbassadorCertificationQuiz } from "@/components/ambassador/AmbassadorCertificationQuiz";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

const LEVEL_UP_REQUIREMENTS: Record<number, { label: string; required: string }> = {
  1: { label: "Level 1 → 2", required: "10 completed onboardings" },
  2: { label: "Level 2 → 3", required: "10 Torch Bearers graduated to Level 2" },
  3: { label: "Level 3 → 4", required: "10 Lamplighters graduated to Level 3" },
  4: { label: "Level 4 → 5", required: "10 Beacon Keepers graduated to Level 4" },
};

export default function AmbassadorCertification() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ambassador, setAmbassador] = useState<{ id: string; level: number; level_title: string | null; slots_filled: number } | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showQuiz, setShowQuiz] = useState(false);
  const [failMessage, setFailMessage] = useState<{ scorePct: number; message: string } | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user?.id) return;
    const { data: amb } = await supabase
      .from("ambassadors")
      .select("id, level, level_title, slots_filled")
      .eq("user_id", user.id)
      .single();
    setAmbassador(amb ?? null);
    if (amb?.id) {
      const { count } = await supabase
        .from("ambassador_recruits")
        .select("id", { count: "exact", head: true })
        .eq("ambassador_id", amb.id)
        .eq("status", "completed");
      setCompletedCount(count ?? 0);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchProgress().finally(() => setLoading(false));
  }, [user?.id, fetchProgress]);

  const canLevelUp = ambassador && ambassador.level < 5 && ambassador.level === 1 && completedCount >= 10;
  const nextLevel = ambassador ? ambassador.level + 1 : 0;
  const requirement = nextLevel <= 4 ? LEVEL_UP_REQUIREMENTS[ambassador?.level ?? 0] : null;

  if (loading) {
    return (
      <PortalPageLayout maxWidth="sm" xrayId="ambassador-certification">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </PortalPageLayout>
    );
  }

  if (!ambassador) {
    return (
      <PortalPageLayout maxWidth="sm" xrayId="ambassador-certification">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">You&apos;re not an Ambassador.</p>
          <Button variant="outline" onClick={() => navigate("/ambassador/register")}>Register</Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="sm" xrayId="ambassador-certification">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/ambassador/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Level-up certification</h1>
          <AmbassadorLevelBadge level={ambassador.level} levelTitle={ambassador.level_title} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">Completed onboardings: {completedCount}</p>
            {requirement && (
              <p className="text-sm text-muted-foreground">
                To certify for {requirement.label}: {requirement.required}
              </p>
            )}
          </CardContent>
        </Card>
        {canLevelUp && !showQuiz && !failMessage && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm mb-3">Assessment for Level {nextLevel} includes scenario questions, process knowledge, and platform knowledge. Pass threshold: 80%. On pass you advance to Lamplighter and earn 25 Marks.</p>
              <Button onClick={() => setShowQuiz(true)}>Start assessment</Button>
            </CardContent>
          </Card>
        )}
        {canLevelUp && showQuiz && (
          <AmbassadorCertificationQuiz
            ambassadorId={ambassador.id}
            fromLevel={ambassador.level}
            toLevel={nextLevel}
            onPass={() => { setShowQuiz(false); setFailMessage(null); fetchProgress(); }}
            onFail={(scorePct, message) => { setShowQuiz(false); setFailMessage({ scorePct, message }); }}
          />
        )}
        {failMessage && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm font-medium">Score: {failMessage.scorePct}%</p>
              <p className="text-sm text-muted-foreground mt-1">{failMessage.message}</p>
              <Button variant="outline" className="mt-3" onClick={() => setFailMessage(null)}>Back to progress</Button>
            </CardContent>
          </Card>
        )}
        {!canLevelUp && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {ambassador.level >= 5
                  ? "You're at the highest level — Harbormaster."
                  : "Complete the requirements above to unlock the next level assessment."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
