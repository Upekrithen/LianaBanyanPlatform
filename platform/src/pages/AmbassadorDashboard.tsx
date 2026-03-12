/**
 * AMBASSADOR DASHBOARD — Your 10 recruits, progress, Marks earned (Session 5 V1).
 * SEC-safe: Marks are effort-debt, not commissions. data-xray-id: ambassador-dashboard
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AmbassadorLevelBadge } from "@/components/ambassador/AmbassadorLevelBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, UserPlus } from "lucide-react";

interface AmbassadorRow {
  id: string;
  display_name: string;
  ambassador_number: number | null;
  generation: number;
  city: string | null;
  status: string;
  slots_filled: number;
  marks_earned: number;
  level: number;
  level_title: string | null;
}

interface RecruitRow {
  id: string;
  slot_number: number;
  recruit_name: string | null;
  recruit_contact: string | null;
  status: string;
  notes: string | null;
}

export default function AmbassadorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ambassador, setAmbassador] = useState<AmbassadorRow | null>(null);
  const [recruits, setRecruits] = useState<RecruitRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: amb } = await supabase
        .from("ambassadors")
        .select("id, display_name, ambassador_number, generation, city, status, slots_filled, marks_earned, level, level_title")
        .eq("user_id", user.id)
        .single();
      setAmbassador(amb ?? null);
      if (amb?.id) {
        const { data: rec } = await supabase
          .from("ambassador_recruits")
          .select("id, slot_number, recruit_name, recruit_contact, status, notes")
          .eq("ambassador_id", amb.id)
          .order("slot_number");
        setRecruits(rec ?? []);
      } else {
        setRecruits([]);
      }
    })().finally(() => setLoading(false));
  }, [user?.id]);

  const completedCount = recruits.filter((r) => r.status === "completed").length;
  const progressPct = 10 ? (completedCount / 10) * 100 : 0;
  const slotsByNumber = Array.from({ length: 10 }, (_, i) => recruits.find((r) => r.slot_number === i + 1));

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!ambassador) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">You&apos;re not registered as an Ambassador yet.</p>
        <Button onClick={() => navigate("/ambassador/register")}>Register as Ambassador</Button>
        <Button variant="outline" onClick={() => navigate("/portal")}>Back to Portal</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="ambassador-dashboard">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/portal")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Portal
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">
            Ambassador #{ambassador.ambassador_number ?? "—"} — {ambassador.display_name}
          </h1>
          <AmbassadorLevelBadge level={ambassador.level} levelTitle={ambassador.level_title} />
        </div>
        <p className="text-sm text-muted-foreground">
          Generation {ambassador.generation} | {ambassador.city ?? "—"} | {ambassador.slots_filled} of 10 onboarded
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Onboarding progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPct} className="h-3 mb-2" />
            <p className="text-sm text-muted-foreground">{completedCount} of 10 completed</p>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <h2 className="font-semibold">Your 10 slots</h2>
          <ul className="space-y-2">
            {slotsByNumber.map((recruit, idx) => {
              const slot = idx + 1;
              const r = recruit;
              return (
                <Card key={slot}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium">Slot {slot}: </span>
                      {r ? (
                        <>
                          <span>{r.recruit_name || "Unnamed"}</span>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                            {r.status.replace(/_/g, " ")}
                          </span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Open</span>
                      )}
                    </div>
                    {r ? (
                      <Button variant="outline" size="sm">View status</Button>
                    ) : (
                      <Button size="sm" data-xray-id="ambassador-add-recruit-btn">
                        <UserPlus className="w-4 h-4 mr-1" /> Add recruit
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </ul>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marks earned from onboarding</CardTitle>
            <p className="text-xs text-muted-foreground">
              10 Marks per completed onboarding. 25 Marks per recruit who becomes an Ambassador. Effort-debt, not commissions.
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Completed onboardings: {completedCount} × 10 Marks = {completedCount * 10} Marks
            </p>
            <p className="text-sm font-medium mt-1">Total: {ambassador.marks_earned} Marks</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
