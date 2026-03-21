/**
 * AMBASSADOR DASHBOARD — Your 10 recruits, progress, Marks earned (Session 5 V1).
 * SEC-safe: Marks are effort-debt, not commissions. data-xray-id: ambassador-dashboard
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AmbassadorLevelBadge } from "@/components/ambassador/AmbassadorLevelBadge";
import { RecruitStatusCard } from "@/components/ambassador/RecruitStatusCard";
import { AmbassadorMenteeGrid } from "@/components/ambassador/AmbassadorMenteeGrid";
import type { MenteeSlot } from "@/components/ambassador/AmbassadorMenteeGrid";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

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
  const [addRecruitSlot, setAddRecruitSlot] = useState<number | null>(null);
  const [addName, setAddName] = useState("");
  const [addContact, setAddContact] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [menteeSlots, setMenteeSlots] = useState<MenteeSlot[]>([]);

  const fetchAmbassadorAndRecruits = useCallback(async () => {
    if (!user?.id) return;
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

      if (amb.level >= 2) {
        const { data: mentorships } = await supabase
          .from("ambassador_mentorships")
          .select("id, mentee_id, slot_number, status")
          .eq("mentor_id", amb.id)
          .order("slot_number");
        if (mentorships?.length) {
          const menteeIds = [...new Set(mentorships.map((m) => m.mentee_id))];
          const { data: mentees } = await supabase
            .from("ambassadors")
            .select("id, display_name, level, level_title")
            .in("id", menteeIds);
          const menteeMap = new Map((mentees ?? []).map((m) => [m.id, m]));
          const completedCounts: Record<string, number> = {};
          for (const mid of menteeIds) {
            const { count } = await supabase
              .from("ambassador_recruits")
              .select("id", { count: "exact", head: true })
              .eq("ambassador_id", mid)
              .eq("status", "completed");
            completedCounts[mid] = count ?? 0;
          }
          const slots: MenteeSlot[] = mentorships.map((m) => {
            const mentee = menteeMap.get(m.mentee_id);
            return {
              id: m.mentee_id,
              mentee_display_name: mentee?.display_name ?? "—",
              mentee_level: mentee?.level ?? 1,
              mentee_level_title: mentee?.level_title ?? null,
              slot_number: m.slot_number,
              status: m.status,
              onboarded_count: completedCounts[m.mentee_id],
              last_active: null,
            };
          });
          setMenteeSlots(slots);
        } else {
          setMenteeSlots([]);
        }
      } else {
        setMenteeSlots([]);
      }
    } else {
      setRecruits([]);
      setMenteeSlots([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchAmbassadorAndRecruits().finally(() => setLoading(false));
  }, [user?.id, fetchAmbassadorAndRecruits]);

  const completedCount = recruits.filter((r) => r.status === "completed").length;
  const progressPct = 10 ? (completedCount / 10) * 100 : 0;
  const slotsByNumber = Array.from({ length: 10 }, (_, i) => recruits.find((r) => r.slot_number === i + 1));

  const handleAddRecruit = (slot: number) => setAddRecruitSlot(slot);
  const handleAddSubmit = async () => {
    if (!ambassador?.id || addRecruitSlot == null) return;
    setAddLoading(true);
    try {
      await supabase.from("ambassador_recruits").insert({
        ambassador_id: ambassador.id,
        slot_number: addRecruitSlot,
        recruit_name: addName.trim() || null,
        recruit_contact: addContact.trim() || null,
        notes: addNotes.trim() || null,
        status: "invited",
      });
      setAddRecruitSlot(null);
      setAddName("");
      setAddContact("");
      setAddNotes("");
      await fetchAmbassadorAndRecruits();
    } finally {
      setAddLoading(false);
    }
  };
  const handleStartWalkthrough = (recruitId: string) => navigate(`/ambassador/walkthrough?recruit=${recruitId}`);
  const handleViewStatus = (recruitId: string) => navigate(`/ambassador/walkthrough?recruit=${recruitId}`);

  if (loading) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="ambassador-dashboard">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </PortalPageLayout>
    );
  }

  if (!ambassador) {
    return (
      <PortalPageLayout maxWidth="md" xrayId="ambassador-dashboard">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">You&apos;re not registered as an Ambassador yet.</p>
          <Button onClick={() => navigate("/ambassador/register")}>Register as Ambassador</Button>
          <Button variant="outline" onClick={() => navigate("/portal")}>Back to Portal</Button>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="md" xrayId="ambassador-dashboard">
      <div className="space-y-6">
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
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/ambassador/chain")}>
            View Ambassador chain
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate(`/ambassador/portfolio/${ambassador.id}`)}>
            My portfolio
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/ambassador/certify")}>
            Certify
          </Button>
        </div>

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
                <RecruitStatusCard
                  key={slot}
                  slotNumber={slot}
                  recruitName={r?.recruit_name ?? null}
                  recruitContact={r?.recruit_contact ?? null}
                  status={r?.status ?? "invited"}
                  notes={r?.notes ?? null}
                  recruitId={r?.id ?? null}
                  onAddRecruit={handleAddRecruit}
                  onStartWalkthrough={handleStartWalkthrough}
                  onViewStatus={handleViewStatus}
                />
              );
            })}
          </ul>
        </div>

        <Dialog open={addRecruitSlot != null} onOpenChange={(open) => !open && setAddRecruitSlot(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add recruit — Slot {addRecruitSlot}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="recruit-name">Name</Label>
                <Input id="recruit-name" value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Recruit name" />
              </div>
              <div>
                <Label htmlFor="recruit-contact">Contact (phone or email)</Label>
                <Input id="recruit-contact" value={addContact} onChange={(e) => setAddContact(e.target.value)} placeholder="For reach-out" />
              </div>
              <div>
                <Label htmlFor="recruit-notes">Notes (optional)</Label>
                <Textarea id="recruit-notes" value={addNotes} onChange={(e) => setAddNotes(e.target.value)} placeholder="Private notes" className="min-h-[60px] resize-none" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddRecruitSlot(null)}>Cancel</Button>
              <Button onClick={handleAddSubmit} disabled={addLoading}>{addLoading ? "Adding…" : "Add recruit"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {ambassador.level >= 2 && (
          <AmbassadorMenteeGrid
            level={ambassador.level}
            slots={menteeSlots}
            onViewDashboard={(menteeId) => navigate(`/ambassador/portfolio/${menteeId}`)}
            onAssignMentee={() => {}}
          />
        )}

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
    </PortalPageLayout>
  );
}
