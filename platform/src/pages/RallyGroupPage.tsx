/**
 * RallyGroupPage -- Community Organizing & Mutual Aid Coordination / BP073 W8
 * ============================================================================
 * Route: /initiatives/rally-group
 *
 * The "battle-buddy" concept at neighborhood scale.
 * Know before the crisis: who can do what, where the supplies are,
 * who needs help. Preparation is the force multiplier.
 *
 * Switzerland Policy: Strictly non-political. Non-religious.
 * Practical mutual aid only -- available to all members equally.
 *
 * Marks = participation credits ONLY (not equity, not financial return).
 * Rate schedule: HELD FOR FOUNDER.
 *
 * Supabase: rally_alerts (real table, RLS enabled)
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Users, HeartHandshake, Map, ShieldAlert, ArrowRight, HandHeart,
  MessageSquare, AlertTriangle, CheckCircle, BookOpen, Flame,
  Info, Star, Siren, Package, UserCheck, Bell, Heart,
  ClipboardList, Truck, Home
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { AnonymousVolumeExplainer } from "@/components/AnonymousVolumeExplainer";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { getWalkthrough, getCueCard } from "@/data/initiativeWalkthroughs";
import {
  RALLY_DEMO_RESPONDER,
  RALLY_DEMO_ALERTS,
  RALLY_DEMO_CHALKBOARD_STATS,
  RALLY_DEMO_CHALKBOARD,
  RALLY_DEMO_MARKS_EVENTS,
} from "@/lib/rally/rallyService";
import type {
  ResponderProfile,
  RallyAlert,
  ChalkboardEntry,
  ChalkboardStats,
  RallyMarksEvent,
} from "@/lib/rally/rallyTypes";
import { RALLY_DISCLAIMER_NEUTRAL, RALLY_DISCLAIMER_MARKS } from "@/lib/rally/rallyTypes";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urgencyColor(urgency: RallyAlert["urgency"]): string {
  if (urgency === "critical") return "bg-red-100 text-red-800 border-red-200";
  if (urgency === "urgent") return "bg-amber-100 text-amber-800 border-amber-200";
  return "bg-blue-50 text-blue-800 border-blue-200";
}

function urgencyBorderColor(urgency: RallyAlert["urgency"]): string {
  if (urgency === "critical") return "border-l-red-500";
  if (urgency === "urgent") return "border-l-amber-500";
  return "border-l-blue-400";
}

function alertTypeIcon(type: RallyAlert["type"]) {
  switch (type) {
    case "displacement": return <Home className="w-4 h-4" />;
    case "medical": return <Heart className="w-4 h-4" />;
    case "supply": return <Package className="w-4 h-4" />;
    case "weather": return <AlertTriangle className="w-4 h-4" />;
    default: return <Bell className="w-4 h-4" />;
  }
}

function stageLabel(stage: ChalkboardStats["stage"]): { label: string; color: string; progress: number } {
  switch (stage) {
    case "spark": return { label: "Spark", color: "text-amber-600", progress: 50 };
    case "ember": return { label: "Ember", color: "text-orange-600", progress: 75 };
    case "wildfire": return { label: "Wildfire", color: "text-red-600", progress: 100 };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SwitzerlandNote() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded p-3 mt-2">
      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{RALLY_DISCLAIMER_NEUTRAL}</span>
    </div>
  );
}

function MarksNote() {
  return (
    <div className="text-xs text-muted-foreground italic mt-1">
      {RALLY_DISCLAIMER_MARKS}
    </div>
  );
}

interface AlertCardProps {
  alert: RallyAlert;
  onRespond?: (alertId: string) => void;
}

function AlertCard({ alert, onRespond }: AlertCardProps) {
  const daysLeft = Math.ceil(
    (new Date(alert.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={`border-l-4 ${urgencyBorderColor(alert.urgency)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs border ${urgencyColor(alert.urgency)}`}>
              {alertTypeIcon(alert.type)}
              <span className="ml-1 capitalize">{alert.urgency}</span>
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {alert.type.replace("_", " ")}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{daysLeft}d left</span>
        </div>
        <h4 className="font-semibold text-foreground text-sm mb-1">{alert.title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{alert.description}</p>
        <div className="bg-muted/50 rounded p-2 mb-3 text-xs">
          <span className="font-semibold">Requested: </span>{alert.requested_action}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-purple-700 font-medium">
            <Star className="w-3 h-3 inline mr-1" />
            {alert.marks_on_response} Marks on response
            <span className="text-xs text-muted-foreground ml-1 font-normal">(participation credits)</span>
          </div>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onRespond?.(alert.id)}
          >
            Respond
            {/* TODO: wire to alert_response mutation + Marks allocation */}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ChalkboardCardProps {
  entry: ChalkboardEntry;
}

function ChalkboardCard({ entry }: ChalkboardCardProps) {
  return (
    <div className={`p-3 rounded-lg border text-sm ${
      entry.type === "have"
        ? "bg-emerald-50 border-emerald-200"
        : "bg-blue-50 border-blue-200"
    }`}>
      <div className="flex items-center justify-between mb-1">
        <Badge
          className={`text-xs ${entry.type === "have" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}
        >
          {entry.type === "have" ? "HAVE" : "WANT"}
        </Badge>
        <span className="text-xs text-muted-foreground capitalize">{entry.category}</span>
      </div>
      <p className="text-foreground">{entry.description}</p>
      <p className="text-xs text-muted-foreground mt-1">{entry.area}</p>
    </div>
  );
}

interface MarksHistoryItemProps {
  event: RallyMarksEvent;
}

function MarksHistoryItem({ event }: MarksHistoryItemProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{event.description}</p>
        <p className="text-xs text-muted-foreground capitalize">
          {event.reason.replace(/_/g, " ")} &middot; {new Date(event.triggered_at).toLocaleDateString()}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-purple-700">+{event.marks_units}</p>
        <p className="text-xs text-muted-foreground">Marks</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RallyGroupPage() {
  usePageSEO({
    title: "Rally Group | Liana Banyan",
    description: "Organize cooperative group actions in your community. No ads, no algorithms -- just neighbors coordinating.",
    canonical: "https://lianabanyan.com/initiatives/rally-group",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isTour, setIsTour] = useState(false);
  const [orientationStarted, setOrientationStarted] = useState(false);

  // In tour mode, display demo data. Live: load from rally_alerts table.
  const { data: liveAlerts = [] } = useQuery({
    queryKey: ["rally_alerts", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rally_alerts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isTour,
  });

  const responder: ResponderProfile | null = isTour ? RALLY_DEMO_RESPONDER : null;
  const alerts: RallyAlert[] = isTour ? RALLY_DEMO_ALERTS : (liveAlerts.length > 0 ? liveAlerts as RallyAlert[] : []);
  const chalkboardStats: ChalkboardStats | null = isTour ? RALLY_DEMO_CHALKBOARD_STATS : null;
  const chalkboardEntries: ChalkboardEntry[] = isTour ? RALLY_DEMO_CHALKBOARD : [];
  const marksEvents: RallyMarksEvent[] = isTour ? RALLY_DEMO_MARKS_EVENTS : [];

  const walkthrough = getWalkthrough("rally-group");
  const cueCard = getCueCard("rally-group");

  return (
    <LaunchConditionOverlay initiativeSlug="rally-group" initiativeName="Rally Group">
      <PortalPageLayout maxWidth="xl" xrayId="rally-group-page">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div className="text-center md:text-left">
            <Badge variant="outline" className="mb-4 text-purple-600 border-purple-600">
              Initiative #8
            </Badge>
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3 justify-center md:justify-start">
              <Users className="h-10 w-10 text-purple-600" />
              Rally Group
            </h1>
            <p className="mt-4 text-xl text-muted-foreground max-w-3xl">
              Community action, mutual aid, crisis response, and the battle-buddy model at
              neighborhood scale. Know before the crisis who can do what and where the supplies are.
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-end shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">WildFire Tour Mode:</span>
              <button
                onClick={() => setIsTour(!isTour)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTour ? "bg-orange-500" : "bg-muted"}`}
                aria-label="Toggle WildFire tour mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTour ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Battle-Buddy Banner */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 rounded-lg shrink-0">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 mb-1">The Battle-Buddy Model</h3>
              <p className="text-sm text-purple-800 max-w-3xl">
                In the military, you are never alone in a crisis because someone is assigned to
                know exactly where you are and what you can do. The Rally Group brings this
                concept to civilian life: know before the crisis who can help, what resources
                exist, and who needs support. Preparation is the force multiplier.
              </p>
              <SwitzerlandNote />
            </div>
          </div>
        </div>

        {/* Responder Status Card (when registered) */}
        {responder && (
          <Card className="mb-8 border-t-4 border-t-purple-500 bg-white shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-lg">Active Responder</span>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {responder.status === "active" ? "Active" : responder.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {responder.capabilities.map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs capitalize">
                        {cap.replace(/_/g, " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-700">{responder.marks_earned}</div>
                  <div className="text-xs text-muted-foreground">Marks earned</div>
                  <MarksNote />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6 mb-8 h-auto p-1 bg-muted/50">
            <TabsTrigger value="dashboard" className="py-3 text-base data-[state=active]:bg-background">
              <Siren className="w-4 h-4 mr-2" /> Live Alerts
            </TabsTrigger>
            <TabsTrigger value="chalkboard" className="py-3 text-base data-[state=active]:bg-background">
              <MessageSquare className="w-4 h-4 mr-2" /> Chalkboard
            </TabsTrigger>
            <TabsTrigger value="swoop" className="py-3 text-base data-[state=active]:bg-background">
              <HeartHandshake className="w-4 h-4 mr-2" /> The Swoop
            </TabsTrigger>
            <TabsTrigger value="railroad" className="py-3 text-base data-[state=active]:bg-background">
              <ShieldAlert className="w-4 h-4 mr-2" /> Safe Harbor
            </TabsTrigger>
            <TabsTrigger value="marks" className="py-3 text-base data-[state=active]:bg-background">
              <Star className="w-4 h-4 mr-2" /> My Marks
            </TabsTrigger>
            {walkthrough && (
              <TabsTrigger value="walkthrough" className="py-3 text-base data-[state=active]:bg-background">
                <BookOpen className="w-4 h-4 mr-2" /> How It Works
              </TabsTrigger>
            )}
          </TabsList>

          {/* ── Live Alerts Tab ─────────────────────────────────────────────────── */}
          <TabsContent value="dashboard" className="space-y-6">

            {/* Registration CTA (not yet registered) */}
            {!responder && (
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Register as a Rally Group Responder
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    Tell the network what you can offer before the crisis. Can you host guests?
                    Drive supplies? Cook for 20 people? The network needs to know now.
                  </p>
                  {!orientationStarted ? (
                    <div className="flex justify-center gap-3">
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setOrientationStarted(true)}
                      >
                        <UserCheck className="w-4 h-4 mr-2" /> Register + Start Orientation
                        {/* TODO: wire to registerResponder() + orientation flow */}
                      </Button>
                      <Button variant="outline" onClick={() => setIsTour(true)}>
                        Preview with Demo Data
                      </Button>
                    </div>
                  ) : (
                    <div className="max-w-md mx-auto">
                      <div className="bg-white rounded-lg border p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span className="font-semibold">30-Minute Orientation</span>
                          <Badge className="bg-purple-100 text-purple-800 text-xs">5 Marks on completion</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Learn Rally Group protocols: how alerts go out, how you respond, how
                          resources are coordinated. Earns 5 Marks and activates your responder status.
                        </p>
                        <MarksNote />
                      </div>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                        Begin Orientation
                        {/* TODO: wire to orientation flow + completeOrientation() service call */}
                      </Button>
                    </div>
                  )}
                  <SwitzerlandNote />
                </CardContent>
              </Card>
            )}

            {/* Active Alerts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Hyper-Local Alerts
                </h2>
                {alerts.length > 0 && (
                  <Badge className="bg-amber-100 text-amber-800">{alerts.length} open</Badge>
                )}
              </div>

              {alerts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">No active alerts in your area.</p>
                    <p className="text-xs mt-1">Enable WildFire Tour to preview examples.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {alerts.map((alert) => (
                    <AlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              )}
            </div>

            {/* Orientation CTA for active members */}
            {!responder && !orientationStarted && (
              <Card className="bg-slate-50 border border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-full shrink-0">
                      <ClipboardList className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        Complete the 30-minute orientation to activate your responder status
                        and earn 5 Marks.
                      </p>
                      <MarksNote />
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white shrink-0"
                    >
                      Start Orientation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── Chalkboard Tab ──────────────────────────────────────────────────── */}
          <TabsContent value="chalkboard" className="space-y-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-amber-100 rounded-lg shrink-0">
                <MessageSquare className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">The Community Chalkboard</h2>
                <p className="text-muted-foreground mt-1">
                  Neighbors list Haves and Wants. No forced transactions -- just open coordination.
                  Hit 50 active entries and the neighborhood unlocks Block Swap mode.
                </p>
              </div>
            </div>

            {/* Stage Progress */}
            {chalkboardStats ? (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-amber-900">
                        Stage: {stageLabel(chalkboardStats.stage).label}
                        <span className={`ml-2 text-base font-normal ${stageLabel(chalkboardStats.stage).color}`}>
                          <Flame className="w-4 h-4 inline mr-1" />
                        </span>
                      </h3>
                      <p className="text-sm text-amber-700 mt-0.5">
                        {chalkboardStats.active_haves + chalkboardStats.active_wants} active entries
                        &middot; {chalkboardStats.fulfilled_this_month} fulfilled this month
                      </p>
                    </div>
                    <Badge className="bg-amber-200 text-amber-900">
                      {chalkboardStats.active_haves + chalkboardStats.active_wants} / {chalkboardStats.spark_threshold} to next stage
                    </Badge>
                  </div>
                  <Progress
                    value={Math.min(
                      ((chalkboardStats.active_haves + chalkboardStats.active_wants) / chalkboardStats.spark_threshold) * 100,
                      100
                    )}
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-amber-600 mt-1">
                    <span>Spark (50)</span>
                    <span>Ember (Block Swap)</span>
                    <span>Wildfire (Continuous)</span>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Spark / Ember / Wildfire explanation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-amber-400">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Badge className="bg-amber-100 text-amber-800">Spark</Badge>
                    Digital Chalkboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Neighbors list "Haves" and "Wants" -- no forced transactions. A pickup truck,
                  extra lemons, a lawnmower for Saturday. Once a neighborhood hits 50 active
                  entries, the Spark is lit.
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Badge className="bg-orange-100 text-orange-800">Ember</Badge>
                    The Block Swap
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  A local Captain organizes a physical weekend event -- a neighborhood Garage Sale,
                  Tool Swap, and Potluck. Neighbors meet face-to-face to fulfill the Haves/Wants
                  they saw on the digital chalkboard.
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-600">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Badge className="bg-red-100 text-red-800">Wildfire</Badge>
                    Continuous Local Larder
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  The exchange becomes a self-sustaining continuous marketplace. The Captain acts
                  as local escrow. Need to lend a tool? Drop it at the Captain's porch for
                  asynchronous pickup.
                </CardContent>
              </Card>
            </div>

            {/* Live Chalkboard Entries */}
            {chalkboardEntries.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Active Haves & Wants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {chalkboardEntries.map((entry) => (
                    <ChalkboardCard key={entry.id} entry={entry} />
                  ))}
                </div>
                <div className="mt-4 flex gap-3">
                  <Button
                    variant="outline"
                    className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    Post a Have
                    {/* TODO: wire to chalkboard entry creation + Marks for fulfillment */}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-blue-700 border-blue-200 hover:bg-blue-50"
                  >
                    Post a Want
                    {/* TODO: wire to chalkboard entry creation */}
                  </Button>
                </div>
              </div>
            )}

            {chalkboardEntries.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No chalkboard entries yet in your area.</p>
                  <Button variant="link" className="text-amber-600 mt-1 h-auto p-0">
                    Be the first to post
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ── The Swoop Tab ───────────────────────────────────────────────────── */}
          <TabsContent value="swoop" className="space-y-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-pink-100 rounded-lg shrink-0">
                <HeartHandshake className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">The Swoop</h2>
                <p className="text-muted-foreground mt-1">
                  How a community rallies around a family in need. New baby, medical emergency,
                  sudden loss -- the Swoop organizes support with dignity preserved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-lg text-foreground mb-4">
                  The Swoop is crisis-and-life-event mutual aid. Communities coordinate what they
                  can give -- meals, services, time, resources -- without the receiving family
                  having to manage the logistics of accepting help.
                </p>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <HandHeart className="h-5 w-5 text-pink-500 shrink-0" />
                    Meal trains integrated with local prep coordination.
                  </li>
                  <li className="flex items-center gap-2">
                    <HandHeart className="h-5 w-5 text-pink-500 shrink-0" />
                    Financial pooling without platform extraction fees.
                  </li>
                  <li className="flex items-center gap-2">
                    <HandHeart className="h-5 w-5 text-pink-500 shrink-0" />
                    Service donations: lawn care, childcare, errands, transport.
                  </li>
                  <li className="flex items-center gap-2">
                    <HandHeart className="h-5 w-5 text-pink-500 shrink-0" />
                    Recipients manage incoming support through the Family Table dashboard.
                  </li>
                </ul>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="text-pink-700 border-pink-200 hover:bg-pink-50"
                  >
                    Initiate a Swoop
                    {/* TODO: wire to swoop request creation flow */}
                  </Button>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">
                  Integration with the Family Table
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  While the Swoop is organized by the community through Rally Group, the receiving
                  family manages incoming support privately through their <strong>Family Table</strong> dashboard.
                  They are never overwhelmed by the logistics of accepting help.
                </p>
                <Button
                  variant="outline"
                  className="text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                  onClick={() => navigate("/initiatives/family-table")}
                >
                  Go to Family Table
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <AnonymousVolumeExplainer variant="card" showComparison={false} />
            </div>

            <SwitzerlandNote />
          </TabsContent>

          {/* ── Safe Harbor / Underground Railroad Tab ─────────────────────────── */}
          <TabsContent value="railroad" className="space-y-6">
            <div className="bg-slate-900 text-slate-300 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-800 rounded-lg shrink-0">
                  <ShieldAlert className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Safe Harbor Network</h2>
                  <p className="text-slate-400">Emergency extraction and verified safe-house coordination.</p>
                </div>
              </div>

              <p className="text-lg mb-6">
                For situations requiring immediate, discreet support -- domestic violence, sudden
                displacement, or severe crisis. The Safe Harbor network uses verified Captains
                and safe nodes to connect people with safety.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-6">
                <div className="bg-slate-800 p-4 rounded-md">
                  <Home className="w-6 h-6 text-white mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">Verified Safe Nodes</div>
                  <div className="text-sm text-slate-400">
                    Vetted community members offering temporary shelter.
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-md">
                  <Truck className="w-6 h-6 text-white mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">Transport Relays</div>
                  <div className="text-sm text-slate-400">
                    Coordinated movement across geographic areas.
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-md">
                  <ShieldAlert className="w-6 h-6 text-white mx-auto mb-2" />
                  <div className="font-bold text-white mb-1">Discrete Coordination</div>
                  <div className="text-sm text-slate-400">
                    Privacy-first communication channels for safe extraction.
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 text-sm text-slate-400">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Switzerland Policy</p>
                {RALLY_DISCLAIMER_NEUTRAL}
              </div>
            </div>
          </TabsContent>

          {/* ── My Marks Tab ────────────────────────────────────────────────────── */}
          <TabsContent value="marks" className="space-y-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg shrink-0">
                <Star className="w-6 h-6 text-purple-700" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Marks for Organizing & Showing Up</h2>
                <p className="text-muted-foreground mt-1">
                  Marks are cooperative participation credits earned for organizing, responding,
                  and contributing to the community.
                </p>
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  <span className="font-bold">IMPORTANT: </span>{RALLY_DISCLAIMER_MARKS}
                </div>
              </div>
            </div>

            {/* Earning opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to Earn Marks in Rally Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { action: "Complete 30-min orientation", marks: 5, reason: "orientation_completion" },
                    { action: "Respond to a displacement alert", marks: 3, reason: "alert_response" },
                    { action: "Fulfill a Chalkboard Want", marks: 1, reason: "chalkboard_entry" },
                    { action: "Contribute to a Swoop", marks: 2, reason: "swoop_contribution" },
                    { action: "Maintain a Supply Node", marks: 2, reason: "supply_node_maintenance" },
                    { action: "Host a Block Swap event", marks: 5, reason: "block_swap_hosting" },
                  ].map(({ action, marks, reason }) => (
                    <div
                      key={reason}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                    >
                      <div>
                        <p className="text-sm font-medium">{action}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {reason.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-purple-700">+{marks}</span>
                        <p className="text-xs text-muted-foreground">Marks</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Rate schedule held for Founder approval. Actual units may differ from preview.
                </div>
              </CardContent>
            </Card>

            {/* Marks history */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">My Marks History (Rally Group)</CardTitle>
              </CardHeader>
              <CardContent>
                {marksEvents.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Star className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No Marks earned yet. Complete orientation to start.</p>
                  </div>
                ) : (
                  <div>
                    {marksEvents.map((event, i) => (
                      <MarksHistoryItem key={i} event={event} />
                    ))}
                    <div className="mt-4 flex items-center justify-between pt-3 border-t">
                      <span className="font-semibold">Total Marks (Rally Group)</span>
                      <span className="text-xl font-bold text-purple-700">
                        {marksEvents.reduce((sum, e) => sum + e.marks_units, 0)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Walkthrough + Cue Card ─────────────────────────────────────────── */}
          {walkthrough && (
            <TabsContent value="walkthrough" className="space-y-8">
              {cueCard && (
                <div className="max-w-md">
                  <h3 className="text-lg font-semibold mb-3">Rally Group Cue Card</h3>
                  <InitiativeCueCard card={cueCard} />
                </div>
              )}
              <div>
                <InitiativeWalkthrough
                  steps={walkthrough.steps}
                  initiativeName="Rally Group"
                />
              </div>
              {walkthrough.originAnecdote && (
                <Card className="border-l-4 border-l-purple-300 bg-muted/30">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Origin Story
                    </p>
                    <p className="text-foreground italic leading-relaxed">
                      "{walkthrough.originAnecdote}"
                    </p>
                  </CardContent>
                </Card>
              )}
              <SwitzerlandNote />
            </TabsContent>
          )}
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
