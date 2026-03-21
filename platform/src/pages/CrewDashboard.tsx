/**
 * CREW DASHBOARD — Member view of their Crew
 * Progress bar, your offer card, invite link, member grid. CrewOfferGrid + CrewBackingFlow (Session 3).
 */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrewProgressBar } from "@/components/crew/CrewProgressBar";
import { CrewMemberCard } from "@/components/crew/CrewMemberCard";
import { CrewInviteShare } from "@/components/crew/CrewInviteShare";
import { CrewOfferGrid } from "@/components/crew/CrewOfferGrid";
import { CrewBackingFlow } from "@/components/crew/CrewBackingFlow";
import { CrewFulfillmentSeller, CrewFulfillmentBacker } from "@/components/crew/CrewFulfillment";
import { CrewCompletionCard } from "@/components/crew/CrewCompletionCard";
import { CrewBadge } from "@/components/crew/CrewBadge";
import { Progress } from "@/components/ui/progress";
import type { CrewOfferMember } from "@/components/crew/CrewOfferGrid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";

interface CrewRow {
  id: string;
  name: string;
  focus: string;
  city: string | null;
  state: string | null;
  status: string;
  max_members?: number;
}

interface MemberRow {
  id: string;
  user_id: string | null;
  offer_title: string;
  offer_description: string | null;
  offer_price: number | null;
  status: string;
  backed_by: string | null;
  backed_amount: number | null;
  fulfilled_at: string | null;
}

export default function CrewDashboard() {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crew, setCrew] = useState<CrewRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemberForBacking, setSelectedMemberForBacking] = useState<CrewOfferMember | null>(null);
  const [testimonials, setTestimonials] = useState<{ from_user_id: string; to_user_id: string; content: string }[]>([]);
  const [crewMarkedCompleted, setCrewMarkedCompleted] = useState(false);

  const fetchCrewAndMembers = useCallback(async () => {
    if (!crewId) return;
    const { data: crewData } = await supabase.from("crews").select("id, name, focus, city, state, status, max_members").eq("id", crewId).single();
    setCrew(crewData ?? null);
    const { data: membersData } = await supabase.from("crew_members").select("id, user_id, offer_title, offer_description, offer_price, status, backed_by, backed_amount, fulfilled_at").eq("crew_id", crewId);
    setMembers(membersData ?? []);
    try {
      const { data: testimonialData } = await supabase.from("crew_testimonials").select("from_user_id, to_user_id, content").eq("crew_id", crewId);
      setTestimonials(testimonialData ?? []);
    } catch {
      setTestimonials([]);
    }
  }, [crewId]);

  useEffect(() => {
    if (!crewId || !user) return;
    fetchCrewAndMembers().finally(() => setLoading(false));
  }, [crewId, user, fetchCrewAndMembers]);

  useEffect(() => {
    if (!crewId || !crew || crew.status === "completed" || crewMarkedCompleted) return;
    const fulfilled = members.filter((m) => m.status === "fulfilled").length;
    if (fulfilled >= 10) {
      setCrewMarkedCompleted(true);
      supabase.from("crews").update({ status: "completed" }).eq("id", crewId).then(() => {
        void fetchCrewAndMembers();
      });
    }
  }, [crewId, crew?.id, crew?.status, crewMarkedCompleted, members]);

  const isMember = user && members.some((m) => m.user_id === user.id);
  const inviteUrl = typeof window !== "undefined" && crewId ? `${window.location.origin}/crew/${crewId}/invite` : "";
  const maxMembers = crew?.max_members ?? 12;
  const remainingSpots = crew ? Math.max(0, maxMembers - members.length) : 0;
  const myCrewMemberId = members.find((m) => m.user_id === user?.id)?.id;
  const backedMemberId = myCrewMemberId ? (members.find((m) => m.backed_by === myCrewMemberId)?.id ?? null) : null;
  const offerGridMembers: CrewOfferMember[] = members.map((m) => ({
    id: m.id,
    user_id: m.user_id,
    offer_title: m.offer_title,
    offer_description: m.offer_description,
    offer_price: m.offer_price,
    status: m.status,
    backed_by: m.backed_by,
  }));

  const handleConfirmBacking = async () => {
    if (!selectedMemberForBacking || !myCrewMemberId || !crewId) return;
    const price = selectedMemberForBacking.offer_price ?? 0;
    await supabase
      .from("crew_members")
      .update({ backed_by: myCrewMemberId, backed_amount: price, status: "backed" })
      .eq("id", selectedMemberForBacking.id);
    await fetchCrewAndMembers();
    setSelectedMemberForBacking(null);
  };

  const backingsCommitted = members.filter((m) => m.backed_by != null).length;
  const ordersFulfilled = members.filter((m) => m.status === "fulfilled").length;
  const totalMoved = members
    .filter((m) => m.status === "fulfilled" && m.backed_amount != null)
    .reduce((sum, m) => sum + Number(m.backed_amount), 0);
  const myRow = members.find((m) => m.user_id === user?.id);
  const memberIBacked = myCrewMemberId ? members.find((m) => m.backed_by === myCrewMemberId) : null;
  const hasTestimonialFromMeToBacked = memberIBacked
    ? testimonials.some((t) => t.from_user_id === user?.id && t.to_user_id === memberIBacked.user_id)
    : false;
  const showBackerFulfillment =
    memberIBacked?.status === "fulfilled" && !hasTestimonialFromMeToBacked;
  const showSellerFulfillment = myRow?.status === "backed";
  const completionTestimonials = testimonials.map((t) => ({
    content: t.content,
    displayName: null as string | null,
  }));
  const isRunComplete = ordersFulfilled >= 10 || crew?.status === "completed";

  const handleMarkDelivered = async () => {
    if (!myRow?.id) return;
    await supabase
      .from("crew_members")
      .update({ status: "fulfilled", fulfilled_at: new Date().toISOString() })
      .eq("id", myRow.id);
    await fetchCrewAndMembers();
  };

  const handleConfirmReceipt = async (
    testimonial?: { content: string; rating: number | null }
  ) => {
    if (!memberIBacked || !user?.id || !crewId) return;
    if (testimonial?.content) {
      await supabase.from("crew_testimonials").insert({
        crew_id: crewId,
        from_user_id: user.id,
        to_user_id: memberIBacked.user_id,
        content: testimonial.content.slice(0, 280),
        rating: testimonial.rating ?? null,
      });
    }
    await fetchCrewAndMembers();
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

  const statusLabel = crew.status === "forming" ? "Forming" : crew.status === "active" ? "Active" : crew.status;
  const focusLabel = { dinner: "Let's Make Dinner", grocery: "Let's Get Groceries", skill: "Skill Sessions", product: "Product Launch", mixed: "Mixed / Open" }[crew.focus] ?? crew.focus;
  const isActive = crew.status === "active";

  return (
    <PortalPageLayout maxWidth="md" xrayId="crew-dashboard">
      <div className="space-y-8">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/portal")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Portal
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">{crew.name}</h1>
          <span className="px-2 py-0.5 rounded bg-muted text-sm">{statusLabel}</span>
          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 text-sm">{focusLabel}</span>
        </div>

        <CrewProgressBar currentCount={members.length} minMembers={8} maxMembers={maxMembers} />

        {(isActive || crew.status === "completed") && (
          <div className="space-y-3" data-xray-id="crew-run1-progress">
            <h3 className="font-semibold">Crew Run #1 Progress</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm mb-1">Backings: {backingsCommitted} of {maxMembers} committed</p>
                <Progress value={maxMembers ? (backingsCommitted / maxMembers) * 100 : 0} className="h-2" />
              </div>
              <div>
                <p className="text-sm mb-1">Deliveries: {ordersFulfilled} of {maxMembers} fulfilled</p>
                <Progress value={maxMembers ? (ordersFulfilled / maxMembers) * 100 : 0} className="h-2" />
              </div>
            </div>
          </div>
        )}

        <Card data-xray-id="crew-your-offer">
          <CardHeader>
            <CardTitle>Your offer</CardTitle>
            <p className="text-sm text-muted-foreground">Editable until someone backs you.</p>
          </CardHeader>
          <CardContent>
            {members.find((m) => m.user_id === user?.id) ? (
              <p className="text-muted-foreground">
                {members.find((m) => m.user_id === user?.id)?.offer_title} — $
                {members.find((m) => m.user_id === user?.id)?.offer_price ?? "—"}
              </p>
            ) : (
              <p className="text-muted-foreground">You are not a member of this crew.</p>
            )}
          </CardContent>
        </Card>

        <CrewInviteShare
          inviteUrl={inviteUrl}
          crewName={crew.name}
          city={crew.city}
          remainingSpots={remainingSpots}
        />

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

        {isActive && !selectedMemberForBacking && (
          <CrewOfferGrid
            members={offerGridMembers}
            currentUserId={user?.id}
            myCrewMemberId={myCrewMemberId}
            backedMemberId={backedMemberId}
            onBackOffer={(member) => setSelectedMemberForBacking(member)}
          />
        )}
        {isActive && selectedMemberForBacking && (
          <div className="space-y-2">
            <CrewBackingFlow
              member={selectedMemberForBacking}
              onConfirm={handleConfirmBacking}
              onCancel={() => setSelectedMemberForBacking(null)}
            />
          </div>
        )}

        {showSellerFulfillment && myRow && (
          <CrewFulfillmentSeller
            member={{
              id: myRow.id,
              offer_title: myRow.offer_title,
              offer_price: myRow.offer_price,
              status: myRow.status,
              backed_amount: myRow.backed_amount,
            }}
            onMarkDelivered={handleMarkDelivered}
          />
        )}

        {showBackerFulfillment && memberIBacked && (
          <CrewFulfillmentBacker
            member={{
              id: memberIBacked.id,
              offer_title: memberIBacked.offer_title,
              offer_price: memberIBacked.offer_price,
              status: memberIBacked.status,
              backed_amount: memberIBacked.backed_amount,
            }}
            onConfirmReceipt={handleConfirmReceipt}
          />
        )}

        {isRunComplete && crew && (
          <>
            <CrewCompletionCard
              crewName={crew.name}
              city={crew.city}
              state={crew.state}
              focusLabel={focusLabel}
              memberCount={members.length}
              ordersFulfilled={ordersFulfilled}
              totalMoved={totalMoved}
              testimonials={completionTestimonials}
              onShare={() => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/crew/${crewId}`;
                void navigator.clipboard?.writeText(url);
              }}
            />
            <p className="flex items-center gap-2">
              <CrewBadge />
              <span className="text-sm text-muted-foreground">You&apos;re a Founding Crew member.</span>
            </p>
          </>
        )}
      </div>
    </PortalPageLayout>
  );
}
