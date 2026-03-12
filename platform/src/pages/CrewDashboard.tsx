/**
 * CREW DASHBOARD — Member view of their Crew
 * Progress bar, your offer card, invite link, member grid. "Choose someone to back" (Session 3).
 */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CrewProgressBar } from "@/components/crew/CrewProgressBar";
import { CrewMemberCard } from "@/components/crew/CrewMemberCard";
import { CrewInviteShare } from "@/components/crew/CrewInviteShare";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

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
}

export default function CrewDashboard() {
  const { crewId } = useParams<{ crewId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [crew, setCrew] = useState<CrewRow | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!crewId || !user) return;
    (async () => {
      const { data: crewData } = await supabase.from("crews").select("id, name, focus, city, state, status, max_members").eq("id", crewId).single();
      setCrew(crewData ?? null);
      const { data: membersData } = await supabase.from("crew_members").select("id, user_id, offer_title, offer_description, offer_price, status").eq("crew_id", crewId);
      setMembers(membersData ?? []);
    })().finally(() => setLoading(false));
  }, [crewId, user]);

  const isMember = user && members.some((m) => m.user_id === user.id);
  const inviteUrl = typeof window !== "undefined" && crewId ? `${window.location.origin}/crew/${crewId}/invite` : "";
  const maxMembers = crew?.max_members ?? 12;
  const remainingSpots = crew ? Math.max(0, maxMembers - members.length) : 0;

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
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12" data-xray-id="crew-dashboard">
      <div className="max-w-3xl mx-auto space-y-8">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate("/portal")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Portal
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-3xl font-bold">{crew.name}</h1>
          <span className="px-2 py-0.5 rounded bg-muted text-sm">{statusLabel}</span>
          <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-600 dark:text-green-400 text-sm">{focusLabel}</span>
        </div>

        <CrewProgressBar currentCount={members.length} minMembers={8} maxMembers={maxMembers} />

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

        {isActive && (
          <Button className="w-full" data-xray-id="crew-choose-to-back" disabled>
            Choose someone to back → (Session 3)
          </Button>
        )}
      </div>
    </div>
  );
}
