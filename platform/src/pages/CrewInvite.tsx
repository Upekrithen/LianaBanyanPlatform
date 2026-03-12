/**
 * CREW INVITE — Public shareable page (no login required)
 * Join flow: redirect to auth if not logged in → mini-intake (offer + commitment) → confirm + share.
 */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { CrewProgressBar } from "@/components/crew/CrewProgressBar";
import { CrewMemberCard } from "@/components/crew/CrewMemberCard";
import { CrewInviteShare } from "@/components/crew/CrewInviteShare";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CrewRow {
  id: string;
  name: string | null;
  focus: string;
  city: string | null;
  state: string | null;
  status: string;
  min_members: number;
  max_members: number;
}

interface MemberRow {
  id: string;
  user_id: string | null;
  offer_title: string;
  offer_description: string | null;
  offer_price: number | null;
  status: string;
}

type InviteStep = "view" | "joining" | "joined";

export default function CrewInvite() {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crew, setCrew] = useState<CrewRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<InviteStep>("view");
  const [joinForm, setJoinForm] = useState({ offerTitle: "", offerDescription: "", offerPrice: "", committed: false });
  const [joinSubmitting, setJoinSubmitting] = useState(false);

  const inviteUrl = typeof window !== "undefined" && crewId ? `${window.location.origin}/crew/${crewId}/invite` : "";
  const remainingSpots = crew ? Math.max(0, crew.max_members - members.length) : 0;
  const isFull = crew != null && members.length >= crew.max_members;
  const isAlreadyMember = user && members.some((m) => m.user_id === user.id);

  const loadCrew = async () => {
    if (!crewId) return;
    const { data: crewData } = await supabase
      .from("crews")
      .select("id, name, focus, city, state, status, min_members, max_members")
      .eq("id", crewId)
      .single();
    setCrew(crewData ?? null);
    const { data: membersData } = await supabase
      .from("crew_members")
      .select("id, user_id, offer_title, offer_description, offer_price, status")
      .eq("crew_id", crewId);
    setMembers(membersData ?? []);
  };

  useEffect(() => {
    loadCrew().finally(() => setLoading(false));
  }, [crewId]);

  const handleJoinClick = () => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(`/crew/${crewId}/invite`)}`);
      return;
    }
    if (isAlreadyMember) {
      navigate(`/crew/${crewId}`);
      return;
    }
    if (isFull) return;
    setStep("joining");
  };

  const handleJoinSubmit = async () => {
    if (!user || !crewId || !joinForm.offerTitle.trim() || !joinForm.committed) return;
    const price = joinForm.offerPrice ? parseFloat(joinForm.offerPrice.replace(/[^0-9.]/g, "")) : null;
    setJoinSubmitting(true);
    try {
      const { error } = await supabase.from("crew_members").insert({
        crew_id: crewId,
        user_id: user.id,
        offer_title: joinForm.offerTitle.trim(),
        offer_description: joinForm.offerDescription.trim() || null,
        offer_price: price,
        role: "member",
        status: "joined",
      });
      if (error) {
        toast.error(error.message);
        setJoinSubmitting(false);
        return;
      }
      await loadCrew();
      if (crew && members.length + 1 >= crew.min_members) {
        await supabase.from("crews").update({ status: "active" }).eq("id", crewId);
      }
      setStep("joined");
      toast.success("You're in! Share the invite to fill your Crew.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setJoinSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!crew) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">Crew not found.</p>
        <Button variant="outline" onClick={() => navigate("/portal")}>Back to Portal</Button>
      </div>
    );
  }

  const focusLabel = { dinner: "Let's Make Dinner", grocery: "Let's Get Groceries", skill: "Skill Sessions", product: "Product Launch", mixed: "Mixed / Open" }[crew.focus] ?? crew.focus;
  const location = [crew.city, crew.state].filter(Boolean).join(", ");

  if (step === "joined") {
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="crew-invite-page">
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">{crew.name}</h1>
          <p className="text-lg text-green-600 dark:text-green-400 font-medium">
            You&apos;re member #{members.length}. {remainingSpots} spot{remainingSpots !== 1 ? "s" : ""} left.
          </p>
          <CrewProgressBar currentCount={members.length} minMembers={crew.min_members} maxMembers={crew.max_members} />
          <CrewInviteShare
            inviteUrl={inviteUrl}
            crewName={crew.name ?? undefined}
            city={crew.city}
            remainingSpots={remainingSpots}
          />
          <Button variant="outline" onClick={() => navigate(`/crew/${crewId}`)}>
            Go to Crew dashboard →
          </Button>
        </div>
      </div>
    );
  }

  if (step === "joining") {
    const canSubmit = joinForm.offerTitle.trim().length > 0 && joinForm.committed;
    return (
      <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="crew-invite-join-form">
        <div className="max-w-xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold">Join {crew.name}</h1>
          <p className="text-muted-foreground">What will you offer in this first run?</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="join-offer-title">Offer title</Label>
              <Input
                id="join-offer-title"
                value={joinForm.offerTitle}
                onChange={(e) => setJoinForm((f) => ({ ...f, offerTitle: e.target.value }))}
                placeholder="e.g. 12-pack homemade tortillas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join-offer-desc">Short description (optional)</Label>
              <Textarea
                id="join-offer-desc"
                value={joinForm.offerDescription}
                onChange={(e) => setJoinForm((f) => ({ ...f, offerDescription: e.target.value }))}
                placeholder="2 lines is enough"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="join-offer-price">Price ($15–$20 guideline)</Label>
              <Input
                id="join-offer-price"
                value={joinForm.offerPrice}
                onChange={(e) => setJoinForm((f) => ({ ...f, offerPrice: e.target.value }))}
                placeholder="18"
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="join-commit"
                checked={joinForm.committed}
                onCheckedChange={(c) => setJoinForm((f) => ({ ...f, committed: c === true }))}
              />
              <label htmlFor="join-commit" className="text-sm cursor-pointer">
                I&apos;ll back one other Crew member&apos;s offer and deliver my own when backed. 4-week window.
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("view")}>Back</Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleJoinSubmit} disabled={!canSubmit || joinSubmitting}>
              {joinSubmitting ? "Joining…" : "Join this Crew"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="crew-invite-page">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">{crew.name}</h1>
        <p className="inline-block px-3 py-1 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 text-sm font-medium">
          {focusLabel}
        </p>
        {location && <p className="text-muted-foreground">{location}</p>}

        <CrewProgressBar currentCount={members.length} minMembers={crew.min_members} maxMembers={crew.max_members} />

        {members.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold">Crew members</h2>
            <ul className="space-y-2">
              {members.map((m) => (
                <CrewMemberCard
                  key={m.id}
                  offerTitle={m.offer_title}
                  offerDescription={m.offer_description}
                  offerPrice={m.offer_price}
                  status={m.status as "joined" | "backed" | "fulfilled" | "dropped"}
                />
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground space-y-2">
          <p>• Back 1 other Crew member&apos;s offer ($15–$20)</p>
          <p>• Deliver your own offer when backed</p>
          <p>• 4-week window to complete</p>
          <p>• We&apos;ll help you meet your Crew and track progress</p>
        </div>

        {isAlreadyMember ? (
          <Button className="w-full" variant="secondary" onClick={() => navigate(`/crew/${crewId}`)}>
            You&apos;re already in this Crew — go to dashboard →
          </Button>
        ) : isFull ? (
          <p className="text-center text-muted-foreground">This Crew is full (12 members).</p>
        ) : (
          <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={handleJoinClick} data-xray-id="crew-invite-join-btn">
            JOIN THIS CREW
          </Button>
        )}

        <p className="text-center text-sm text-muted-foreground">
          <button type="button" className="underline hover:no-underline" onClick={() => navigate("/launch")}>
            See other Crews near me →
          </button>
        </p>
      </div>
    </div>
  );
}
