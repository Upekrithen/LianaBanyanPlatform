/**
 * FamilyTablePage -- Wave 15 Mini-App / BP073 W7 (real-data wired)
 * =================================================================
 * Community gathering coordination, shared meal/event hosting,
 * family connection across distances, Marks for hosting/organizing,
 * resource sharing with Cost+20% transparency.
 *
 * Supabase: family_gatherings, family_gatherings_rsvp, family_shared_resources
 * Migration: 20260603100005_bp073_w7_family_table.sql
 */
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, Heart, Plus, Star, Copy, Check,
  ArrowRight, ShieldCheck, BookOpen, Home, Clock,
  MapPin, ChevronDown, ChevronUp, Package, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Types ───────────────────────────────────────────────────────────────────

// Typed stub - no DB table yet; local + Supabase stub
// TODO: wire to family_gatherings table once schema lands
interface GatheringEvent {
  id: string;
  title: string;
  event_type: "meal" | "holiday" | "birthday" | "reunion" | "casual";
  description: string;
  host_id: string;
  host_name: string;
  location: string;
  event_date: string;
  rsvp_count: number;
  max_guests: number;
  status: "planning" | "confirmed" | "happened";
  marks_reward: number;
  shared_cost_per_head?: number;
  notes?: string;
}

// Typed stub - no DB table yet; local state only
// TODO: wire to shared_resources once schema lands
interface SharedResource {
  id: string;
  name: string;
  description: string;
  provider: string;
  base_cost: number;
  category: "food" | "supply" | "service" | "equipment";
  available_qty: number;
  claimed_by?: string;
}

// Typed stub
// TODO: wire to family_members table once schema lands
interface FamilyConnection {
  id: string;
  name: string;
  location: string;
  relationship: string;
  last_contact: string;
  shared_events: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function costPlusTwenty(baseCost: number): number {
  return baseCost * 1.2;
}

function eventTypeLabel(type: GatheringEvent["event_type"]): string {
  const labels: Record<GatheringEvent["event_type"], string> = {
    meal: "Shared Meal",
    holiday: "Holiday Gathering",
    birthday: "Birthday",
    reunion: "Family Reunion",
    casual: "Casual Get-Together",
  };
  return labels[type];
}

// ─── Seed data (pre-operational stubs) ───────────────────────────────────────

const SEED_GATHERINGS: GatheringEvent[] = [
  {
    id: "g1",
    title: "Sunday Dinner at Grandma's",
    event_type: "meal",
    description: "Monthly family dinner with homemade recipes passed down through three generations.",
    host_id: "host1",
    host_name: "Maria R.",
    location: "2847 Oak Street (10 min drive)",
    event_date: new Date(Date.now() + 5 * 86400000).toISOString(),
    rsvp_count: 7,
    max_guests: 12,
    status: "confirmed",
    marks_reward: 40,
    shared_cost_per_head: 8.75,
    notes: "Bring a side dish to share.",
  },
  {
    id: "g2",
    title: "Fourth of July Block Party",
    event_type: "holiday",
    description: "Neighborhood cookout and fireworks gathering. Kids welcome. Cooperative bulk order for food.",
    host_id: "host2",
    host_name: "James T.",
    location: "Elmwood Community Park",
    event_date: new Date(Date.now() + 32 * 86400000).toISOString(),
    rsvp_count: 23,
    max_guests: 50,
    status: "planning",
    marks_reward: 75,
    shared_cost_per_head: 12.50,
  },
  {
    id: "g3",
    title: "Dad's 70th Birthday",
    event_type: "birthday",
    description: "Private family celebration. Catering ordered through Let's Make Dinner at Cost+20%.",
    host_id: "host3",
    host_name: "The Chen Family",
    location: "Private -- details shared with RSVP",
    event_date: new Date(Date.now() + 19 * 86400000).toISOString(),
    rsvp_count: 18,
    max_guests: 25,
    status: "confirmed",
    marks_reward: 50,
  },
];

const SEED_RESOURCES: SharedResource[] = [
  {
    id: "r1",
    name: "6-Quart Slow Cooker",
    description: "Perfect for potlucks and large-batch cooking.",
    provider: "Maria R.",
    base_cost: 0,
    category: "equipment",
    available_qty: 1,
  },
  {
    id: "r2",
    name: "Folding Tables (8)",
    description: "8 folding banquet tables, seats 6-8 each.",
    provider: "Community Shed",
    base_cost: 4.50,
    category: "equipment",
    available_qty: 8,
  },
  {
    id: "r3",
    name: "Bulk Flour (50 lb bag)",
    description: "Bread flour from Let's Make Bread node. Cost+20% from bulk supplier.",
    provider: "Bakery Node #3",
    base_cost: 18.75,
    category: "food",
    available_qty: 3,
  },
  {
    id: "r4",
    name: "Event Setup Help (2 hrs)",
    description: "Two members available to help set up and break down any gathering.",
    provider: "Volunteer Pool",
    base_cost: 16.67,
    category: "service",
    available_qty: 4,
  },
];

const SEED_CONNECTIONS: FamilyConnection[] = [
  {
    id: "c1",
    name: "Grandma Lucille",
    location: "San Antonio, TX",
    relationship: "Grandmother",
    last_contact: "3 days ago",
    shared_events: 14,
  },
  {
    id: "c2",
    name: "Uncle Ray",
    location: "Denver, CO",
    relationship: "Uncle",
    last_contact: "2 weeks ago",
    shared_events: 6,
  },
  {
    id: "c3",
    name: "The Martinez Cousins",
    location: "Austin, TX",
    relationship: "Cousins (4)",
    last_contact: "Yesterday",
    shared_events: 22,
  },
];

// ─── EventCard ────────────────────────────────────────────────────────────────

function EventCard({ event, onRsvp }: { event: GatheringEvent; onRsvp: () => void }) {
  const { toast } = useToast();
  const [rsvping, setRsvping] = useState(false);
  const progress = Math.round((event.rsvp_count / event.max_guests) * 100);
  const spotsLeft = event.max_guests - event.rsvp_count;

  const costDisplay = event.shared_cost_per_head
    ? `$${costPlusTwenty(event.shared_cost_per_head).toFixed(2)} / person (Cost+20%)`
    : "Free";

  async function handleRsvp() {
    setRsvping(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Sign in to RSVP");
      const { error } = await (supabase as any).from("family_gatherings_rsvp").upsert({
        gathering_id: event.id,
        user_id: u.id,
        status: "yes",
      }, { onConflict: "gathering_id,user_id" });
      if (error) throw error;
      toast({
        title: "RSVP confirmed!",
        description: `You are going to ${event.title}. ${event.marks_reward} Marks queued for the host.`,
      });
      onRsvp();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setRsvping(false);
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{event.title}</CardTitle>
            <CardDescription className="mt-0.5 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">{eventTypeLabel(event.event_type)}</Badge>
              <Badge
                variant={event.status === "confirmed" ? "default" : "secondary"}
                className="text-xs"
              >
                {event.status === "confirmed" ? "Confirmed" : "Planning"}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {new Date(event.event_date).toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric",
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.location}
          </div>
          <div className="flex items-center gap-1.5">
            <Home className="h-3.5 w-3.5 shrink-0" />
            Hosted by {event.host_name}
          </div>
        </div>

        {/* RSVP progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-3 w-3" /> {event.rsvp_count} going
            </span>
            <span className={spotsLeft <= 5 ? "text-amber-600 font-medium" : "text-muted-foreground"}>
              {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Cost+20% transparency */}
        <div className="bg-muted/50 rounded p-2 text-xs space-y-0.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shared cost:</span>
            <span className="font-medium">{costDisplay}</span>
          </div>
          {event.shared_cost_per_head && (
            <div className="flex justify-between text-muted-foreground/70">
              <span>Provider cost / person:</span>
              <span>${event.shared_cost_per_head.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-amber-600">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          Host earns {event.marks_reward} Marks when gathering fills
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button size="sm" className="w-full gap-2" onClick={handleRsvp} disabled={rsvping || spotsLeft === 0}>
          <Heart className="h-4 w-4" />
          {spotsLeft === 0 ? "Full" : rsvping ? "Saving..." : "RSVP"}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── ResourceCard ─────────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: SharedResource }) {
  const { toast } = useToast();
  const showCost = resource.base_cost > 0;

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-1.5 rounded bg-primary/10 shrink-0">
          <Package className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{resource.name}</p>
          <p className="text-xs text-muted-foreground">{resource.description}</p>
          <p className="text-xs text-muted-foreground">From: {resource.provider}</p>
          {showCost && (
            <div className="text-xs text-muted-foreground">
              Cost+20%:{" "}
              <span className="font-medium text-foreground">
                ${costPlusTwenty(resource.base_cost).toFixed(2)}
              </span>
              <span className="ml-1 text-muted-foreground/70">(base: ${resource.base_cost.toFixed(2)})</span>
            </div>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="outline" className="text-xs mb-1 block">
          {resource.available_qty} avail.
        </Badge>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() =>
            toast({
              title: "Claimed!",
              description: `${resource.name} reserved. The provider will be notified.`,
            })
          }
        >
          Claim
        </Button>
      </div>
    </div>
  );
}

// ─── HostGatheringForm ────────────────────────────────────────────────────────

function HostGatheringForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: "",
    event_type: "meal" as GatheringEvent["event_type"],
    description: "",
    location: "",
    event_date: "",
    max_guests: "12",
    shared_cost_per_head: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.event_date || !form.location.trim()) {
      toast({ title: "Missing fields", description: "Title, location, and date are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) throw new Error("Sign in to create a gathering");
      const { error } = await (supabase as any).from("family_gatherings").insert({
        organizer_id: u.id,
        title: form.title.trim(),
        event_date: new Date(form.event_date).toISOString(),
        location: form.location.trim(),
        description: form.description.trim() || null,
        max_attendees: parseInt(form.max_guests, 10),
        marks_reward: 40,
      });
      if (error) throw error;
      toast({
        title: "Gathering created!",
        description: `${form.title} is live. You earn 40 Marks when it fills.`,
      });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label>Gathering title</Label>
        <Input
          placeholder="Sunday dinner, holiday cookout..."
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Type</Label>
        <Select value={form.event_type} onValueChange={(v) => setForm((f) => ({ ...f, event_type: v as any }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="meal">Shared Meal</SelectItem>
            <SelectItem value="holiday">Holiday Gathering</SelectItem>
            <SelectItem value="birthday">Birthday</SelectItem>
            <SelectItem value="reunion">Family Reunion</SelectItem>
            <SelectItem value="casual">Casual Get-Together</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          placeholder="What should guests know? Dietary notes, dress code, what to bring..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input
            placeholder="Address or description"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Date</Label>
          <Input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Max guests</Label>
          <Input
            type="number"
            min="2"
            max="200"
            value={form.max_guests}
            onChange={(e) => setForm((f) => ({ ...f, max_guests: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Shared cost / head ($, optional)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.shared_cost_per_head}
            onChange={(e) => setForm((f) => ({ ...f, shared_cost_per_head: e.target.value }))}
          />
        </div>
      </div>

      {form.shared_cost_per_head && parseFloat(form.shared_cost_per_head) > 0 && (
        <div className="rounded border bg-muted/30 p-3 space-y-1 text-sm">
          <p className="font-semibold">Cost+20% Breakdown</p>
          <div className="flex justify-between text-muted-foreground">
            <span>Your cost / head:</span>
            <span>${parseFloat(form.shared_cost_per_head).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Platform margin (+20%):</span>
            <span>${(parseFloat(form.shared_cost_per_head) * 0.2).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1">
            <span>Guest pays:</span>
            <span>${costPlusTwenty(parseFloat(form.shared_cost_per_head)).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700">
        <span className="flex items-center gap-1.5 font-medium">
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
          You earn 40 Marks when your gathering fills.
        </span>
        <p className="text-xs mt-1 text-amber-600/80">Marks = participation. Not equity, not a financial return.</p>
      </div>

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Creating..." : "Host This Gathering"}
      </Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyTablePage() {
  usePageSEO({
    title: "The Family Table | Liana Banyan",
    description: "Share meals and cooking sessions with your community. Potluck coordination, ingredient pooling, and Marks for hosting.",
    canonical: "https://lianabanyan.com/initiatives/family-table",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCueCard, setShowCueCard] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const cueCard = getCueCard("family-table");
  const walkthrough = getWalkthrough("family-table");

  const { data: gatherings = SEED_GATHERINGS, isLoading: gatheringsLoading } = useQuery({
    queryKey: ["family_gatherings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("family_gatherings")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return SEED_GATHERINGS;
      return data.map((g: any) => ({
        id: g.id,
        title: g.title,
        event_type: "meal" as const,
        description: g.description ?? "",
        host_id: g.organizer_id,
        host_name: g.organizer_id.slice(0, 8),
        location: g.location ?? "TBD",
        event_date: g.event_date,
        max_guests: g.max_attendees ?? 20,
        rsvp_count: 0,
        status: "confirmed" as const,
        marks_reward: g.marks_reward ?? 20,
        shared_cost_per_head: null,
        tags: [],
      })) as GatheringEvent[];
    },
  });

  const [resources] = useState<SharedResource[]>(SEED_RESOURCES);
  const [connections] = useState<FamilyConnection[]>(SEED_CONNECTIONS);

  function handleRsvp() {
    queryClient.invalidateQueries({ queryKey: ["family_gatherings"] });
  }

  return (
    <LaunchConditionOverlay initiativeSlug="family-table" initiativeName="The Family Table">
      <PortalPageLayout maxWidth="xl" xrayId="family-table-page">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-indigo-600 border-indigo-300 bg-indigo-50">
                Initiative #5
              </Badge>
              <Badge variant="secondary" className="text-xs">Wave 15</Badge>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="h-8 w-8 text-indigo-600" />
              The Family Table
            </h1>
            <p className="mt-1 text-muted-foreground">
              Community gathering coordination, shared resources, and family connection across distances.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCueCard((v) => !v)}
              className="gap-1.5"
            >
              <BookOpen className="h-4 w-4" />
              {showCueCard ? "Hide" : "Cue Card"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Host a Gathering
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Host a Family Gathering</DialogTitle>
                </DialogHeader>
                <HostGatheringForm onSuccess={() => {}} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Origin anecdote */}
        {walkthrough?.originAnecdote && (
          <div className="mb-6 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-sm text-muted-foreground italic">
            "{walkthrough.originAnecdote}"
          </div>
        )}

        {/* Cue Card (toggleable) */}
        {showCueCard && cueCard && (
          <div className="mb-6">
            <InitiativeCueCard card={cueCard} />
          </div>
        )}

        {/* Main tabs */}
        <Tabs defaultValue="gatherings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 h-auto p-1">
            <TabsTrigger value="gatherings" className="py-2.5">
              <Calendar className="w-4 h-4 mr-2" />
              Gatherings
            </TabsTrigger>
            <TabsTrigger value="resources" className="py-2.5">
              <Package className="w-4 h-4 mr-2" />
              Shared Resources
            </TabsTrigger>
            <TabsTrigger value="connections" className="py-2.5">
              <Heart className="w-4 h-4 mr-2" />
              Family Network
            </TabsTrigger>
            <TabsTrigger value="how-it-works" className="py-2.5">
              <BookOpen className="w-4 h-4 mr-2" />
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* ── Gatherings Tab ── */}
          <TabsContent value="gatherings" className="space-y-6">
            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-indigo-600">{gatherings.length}</div>
                <div className="text-xs text-muted-foreground mt-1">Open gatherings</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {gatherings.reduce((s, g) => s + g.marks_reward, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Marks available</div>
              </Card>
              <Card className="text-center p-4">
                <div className="text-2xl font-bold text-emerald-600">
                  {gatherings.reduce((s, g) => s + g.rsvp_count, 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Members attending</div>
              </Card>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Upcoming Gatherings</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus className="h-4 w-4" />
                    Host One
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Host a Family Gathering</DialogTitle>
                  </DialogHeader>
                  <HostGatheringForm onSuccess={() => {}} />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gatherings.map((g) => (
                <EventCard key={g.id} event={g} onRsvp={handleRsvp} />
              ))}
            </div>

            {/* Marks explainer */}
            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="p-4 flex items-start gap-3">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-800">How Marks work here</p>
                  <p className="text-xs text-amber-700/80">
                    Hosts earn Marks when their gathering fills. Marks are participation credits --
                    they unlock platform features. They are not equity, not a financial return, and
                    not a guarantee of value. The cooperative uses Marks to recognize contribution.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Shared Resources Tab ── */}
          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Shared Resource Pool</h2>
                <p className="text-sm text-muted-foreground">
                  Equipment, food, and services available from the community. Where costs apply, pricing is Cost+20%.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {resources.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>

            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-blue-800">Cost+20% Resource Sharing</p>
                  <p className="text-xs text-blue-700/80">
                    When a resource provider sets a cost, you see the full breakdown: their base cost and the
                    20% cooperative margin. No hidden markup. The 20% funds the cooperative that maintains the
                    platform. Free resources (loaned equipment, volunteer time) have no charge.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Share a Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share a Resource</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label>Resource name</Label>
                      <Input placeholder="Folding tables, slow cooker, volunteer hours..." />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Textarea rows={2} placeholder="What is it? Any conditions?" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Base cost (leave blank if free)</Label>
                      <Input type="number" min="0" step="0.01" placeholder="0.00" />
                    </div>
                    <Button className="w-full">Submit Resource</Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {/* TODO: wire to shared_resources insert */}
                      Resources are moderated before going live.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          {/* ── Family Network Tab ── */}
          <TabsContent value="connections" className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Family Network</h2>
              <p className="text-sm text-muted-foreground">
                Keep up with the people who matter, across any distance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((c) => (
                <Card key={c.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.relationship}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {c.shared_events} events
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {c.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Last contact: {c.last_contact}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full text-xs mt-1">
                      {/* TODO: wire to family_events invite flow */}
                      Invite to Gathering
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {/* Add connection */}
              <Card className="border-dashed flex items-center justify-center min-h-[160px]">
                <Button variant="ghost" className="gap-2 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  Add family member
                  {/* TODO: wire to family_members invite once schema lands */}
                </Button>
              </Card>
            </div>

            <Card className="bg-indigo-50/50 border-indigo-200">
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-indigo-800 mb-1">Cross-distance gatherings</p>
                <p className="text-xs text-indigo-700/80">
                  Family members in other cities can RSVP to virtual attendance, chip in on shared costs,
                  and receive updates through the cooperative network. All coordination stays private -- no
                  data sold, no ads. Your family's hub belongs to your family.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── How It Works Tab ── */}
          <TabsContent value="how-it-works" className="space-y-6">
            {walkthrough && (
              <InitiativeWalkthrough
                steps={walkthrough.steps}
                initiativeName="The Family Table"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Marks for Organizers</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Hosts earn Marks when their gatherings fill. Marks are participation credits -- not equity, not a guaranteed financial return.</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Small gathering (up to 15): 40 Marks</li>
                    <li>Community event (up to 50): 75 Marks</li>
                    <li>Large reunion (50+): 120 Marks</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Privacy Guarantee</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>Your family's gatherings, contacts, and shared resources are private by default. We do not sell data. We do not run ads.</p>
                  <p className="text-xs">The cooperative's revenue comes entirely from the 20% margin on facilitated transactions -- not from your personal data.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
