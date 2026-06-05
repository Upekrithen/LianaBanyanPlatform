/**
 * GOVERNANCE — The 300 + DNA Lock + Bylaws + Board + 7-Crown Council + Switzerland Protocol
 * ===========================================================================================
 * Wave 20
 * Backend: proposals, votes, votable_items, vote_allocations,
 * structural_bylaws, crown_positions, star_chamber_verifications
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Users, Scale, Crown, FileText, Vote, Eye,
  CheckCircle, XCircle, Clock, Star, Lock, BookOpen,
  Dna, ArrowRight, Link2, Flag, AlertTriangle, Gavel,
  Landmark, Newspaper, BookMarked, Swords, Globe,
} from "lucide-react";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ---------------------------------------------------------------------------
// 7-Crown Council types
// ---------------------------------------------------------------------------

const SEVEN_COUNCILS = [
  {
    id: "stewards-guild",
    name: "Stewards Guild Council",
    abbr: "SGC",
    boardSeats: 2,
    term: "1 year",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    purpose: "Platform integrity, content standards, and bylaw review. Stewards are the operational conscience of the cooperative.",
    eligibility: "Active Stewards in good standing with 3+ months service.",
    electionPath: "/stewards-guild",
    crown: "Steward Crown",
  },
  {
    id: "harper-guild",
    name: "Harper Guild Council",
    abbr: "HGC",
    boardSeats: 2,
    term: "1 year",
    icon: Newspaper,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    purpose: "Journalism standards, content quality review, and truth protocols. The Harper Guild keeps the record honest.",
    eligibility: "Active Harper Guild reviewers with 10+ published reviews.",
    electionPath: "/initiatives/harper-guild",
    crown: "Harper Crown",
  },
  {
    id: "areopagus",
    name: "Areopagus Council",
    abbr: "ARC",
    boardSeats: 1,
    term: "1 year",
    icon: BookMarked,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
    purpose: "Doctrine, canon, and philosophical direction. The Areopagus holds the cooperative's founding principles against drift.",
    eligibility: "Doctrine-level contributors with canon contributions on record.",
    electionPath: "/governance/pedestal",
    crown: "Areopagus Crown",
  },
  {
    id: "initiative-captains",
    name: "Initiative Captains Council",
    abbr: "ICC",
    boardSeats: 2,
    term: "1 year",
    icon: Landmark,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    purpose: "The 16 Sweet Sixteen initiatives plus spinout oversight. Captains translate member needs into board-level decisions.",
    eligibility: "Elected by active initiative leads across all 16 initiatives.",
    electionPath: "/initiatives",
    crown: "Initiative Crown",
  },
  {
    id: "member-at-large",
    name: "Member-at-Large Council",
    abbr: "MAL",
    boardSeats: 1,
    term: "1 year",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    purpose: "Direct member representation. The Member-at-Large seat is the people's seat -- elected by the full membership.",
    eligibility: "Any member in good standing with an active $5/year membership.",
    electionPath: "/governance/voting",
    crown: "Member Crown",
  },
  {
    id: "community-safety",
    name: "Community Safety Council",
    abbr: "CSC",
    boardSeats: 1,
    term: "1 year",
    icon: Swords,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    purpose: "Defense Klaus oversight, neighborhood watch coordination, and emergency network governance. No law enforcement advocacy.",
    eligibility: "Active Defense Klaus contributors with verified community safety marks.",
    electionPath: "/initiatives/defense-klaus",
    crown: "Safety Crown",
  },
  {
    id: "switzerland-protocol",
    name: "Switzerland Protocol Council",
    abbr: "SPC",
    boardSeats: 1,
    term: "1 year",
    icon: Globe,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    purpose: "Neutrality enforcement: political and religious content flagging, Star Chamber escalations, and arena governance.",
    eligibility: "Elected from members with documented neutrality enforcement contributions.",
    electionPath: "/governance/star-chamber",
    crown: "Neutrality Crown",
  },
] as const;

// ---------------------------------------------------------------------------
// Switzerland Protocol flagging rules
// ---------------------------------------------------------------------------

const SWITZERLAND_FLAGS = [
  {
    trigger: "Party name or partisan label",
    examples: "Democrat, Republican, MAGA, Progressive, Conservative Party",
    action: "Auto-flag for Star Chamber review",
    severity: "high",
  },
  {
    trigger: "Electoral endorsement",
    examples: "Vote for X, support candidate Y, elect Z",
    action: "Auto-flag + 24-hour posting hold",
    severity: "high",
  },
  {
    trigger: "Religious doctrine assertion",
    examples: "Scripture citations used as platform policy argument, theological mandates",
    action: "Auto-flag for Star Chamber review",
    severity: "high",
  },
  {
    trigger: "Culture-war framing",
    examples: "Woke, anti-woke, based, red-pilled, groomer, fascist (as slur)",
    action: "Warning + content edit required",
    severity: "medium",
  },
  {
    trigger: "Law enforcement advocacy",
    examples: "Call to defund police, back the blue as policy advocacy (not safety coordination)",
    action: "Auto-flag + Switzerland Protocol Council review",
    severity: "medium",
  },
  {
    trigger: "Policy stance beyond cooperative scope",
    examples: "Immigration policy, abortion policy, gun control rhetoric",
    action: "Redirect to Outside the Gates arena",
    severity: "low",
  },
];

export default function Governance() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Crown positions
  const { data: crowns } = useQuery({
    queryKey: ["crown-positions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("crown_positions")
        .select("*")
        .order("initiative");
      return data || [];
    },
  });

  // Active proposals
  const { data: proposals } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data } = await supabase
        .from("proposals")
        .select("*, profiles:provider_id(full_name)")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Structural bylaws
  const { data: bylaws } = useQuery({
    queryKey: ["structural-bylaws"],
    queryFn: async () => {
      const { data } = await supabase
        .from("structural_bylaws")
        .select("*")
        .order("category");
      return data || [];
    },
  });

  // Star Chamber verifications
  const { data: verifications } = useQuery({
    queryKey: ["star-chamber"],
    queryFn: async () => {
      const { data } = await supabase
        .from("star_chamber_verifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  // Votable items
  const { data: votableItems } = useQuery({
    queryKey: ["votable-items"],
    queryFn: async () => {
      const { data } = await supabase
        .from("votable_items")
        .select("*")
        .eq("status", "open")
        .order("total_credits", { ascending: false });
      return data || [];
    },
  });

  const statusColors: Record<string, string> = {
    open: "bg-green-500/10 text-green-600",
    offered: "bg-blue-500/10 text-blue-600",
    accepted: "bg-primary/10 text-primary",
    vacant: "bg-amber-500/10 text-amber-600",
    pending: "bg-yellow-500/10 text-yellow-600",
    pass: "bg-green-500/10 text-green-600",
    fail: "bg-red-500/10 text-red-600",
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance">
      <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Governance</h1>
          <p className="text-muted-foreground">
            The 300 — AI-Human hybrid governance. Proposals, voting, and constitutional bylaws.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <Crown className="w-6 h-6 mx-auto mb-1 text-amber-500" />
            <div className="text-2xl font-bold">{crowns?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Crown Positions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Vote className="w-6 h-6 mx-auto mb-1 text-blue-500" />
            <div className="text-2xl font-bold">{votableItems?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Active Votes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <FileText className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-2xl font-bold">{bylaws?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Structural Bylaws</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Eye className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <div className="text-2xl font-bold">{verifications?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Star Chamber Reviews</div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-page navigation */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Member Voting", desc: "Open proposals + council elections", href: "/governance/voting", icon: Vote, color: "text-blue-500" },
          { label: "Star Chamber", desc: "Appeal flow + 4-judge panel", href: "/governance/star-chamber", icon: Star, color: "text-violet-500" },
          { label: "Pedestals", desc: "IP-Ledger ties + letter ratification", href: "/governance/pedestal", icon: Crown, color: "text-amber-500" },
          { label: "Audit Trail", desc: "Immutable governance log", href: "/governance/audit", icon: Lock, color: "text-primary" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate(item.href)}>
              <CardContent className="py-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="councils" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="councils">Councils</TabsTrigger>
          <TabsTrigger value="switzerland">Switzerland</TabsTrigger>
          <TabsTrigger value="crowns">Crowns</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="bylaws">Bylaws</TabsTrigger>
          <TabsTrigger value="star-chamber">Star Chamber</TabsTrigger>
          <TabsTrigger value="the-300">The 300</TabsTrigger>
        </TabsList>

        {/* 7-CROWN COUNCILS */}
        <TabsContent value="councils" className="space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-foreground">The 7-Crown Council Structure</h2>
              <p className="text-sm text-muted-foreground mt-1">
                The Board is composed of representatives elected by each of the 7 councils.
                No seat is appointed. Every crown is earned through community election.
              </p>
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              {SEVEN_COUNCILS.reduce((sum, c) => sum + c.boardSeats, 0)} Total Board Seats
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SEVEN_COUNCILS.map((council) => {
              const Icon = council.icon;
              return (
                <Card key={council.id} className={`border ${council.border}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${council.bg}`}>
                          <Icon className={`w-5 h-5 ${council.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base leading-tight">{council.name}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono">{council.abbr}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className={`${council.color} text-xs`}>
                          {council.boardSeats} seat{council.boardSeats > 1 ? "s" : ""}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{council.term}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{council.purpose}</p>
                    <div className={`text-xs p-2 rounded-md ${council.bg}`}>
                      <span className="font-medium text-foreground">Eligibility: </span>
                      <span className="text-muted-foreground">{council.eligibility}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => navigate(council.electionPath)}
                    >
                      <Crown className="w-3 h-3" />
                      {council.crown}
                      <ArrowRight className="w-3 h-3 ml-0.5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-3">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="text-2xl font-bold text-foreground">7</p>
                  <p className="text-xs text-muted-foreground">Councils</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {SEVEN_COUNCILS.reduce((sum, c) => sum + c.boardSeats, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Board Seats</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">1yr</p>
                  <p className="text-xs text-muted-foreground">Term Length</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SWITZERLAND PROTOCOL */}
        <TabsContent value="switzerland" className="space-y-6">
          <Card className="border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Globe className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <CardTitle className="text-xl">Switzerland Protocol -- LIVE</CardTitle>
                  <CardDescription>
                    No Politics. No Religion. Automated enforcement with Star Chamber escalation.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Liana Banyan is neutral ground. The Switzerland Protocol is the enforcement
                mechanism that keeps it that way. It is not a courtesy -- it is a structural
                rule enforced automatically and without exception. Violations are flagged,
                reviewed, and escalated. Repeat offenders lose posting privileges in governed
                spaces.
              </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Automated Flag Triggers
            </h3>
            <div className="space-y-2">
              {SWITZERLAND_FLAGS.map((flag, idx) => (
                <Card key={idx} className={
                  flag.severity === "high"
                    ? "border-red-500/20 bg-red-500/5"
                    : flag.severity === "medium"
                    ? "border-amber-500/20 bg-amber-500/5"
                    : "border-slate-500/20 bg-slate-500/5"
                }>
                  <CardContent className="py-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={
                            flag.severity === "high"
                              ? "bg-red-500/10 text-red-600 border-red-500/20 text-xs"
                              : flag.severity === "medium"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                              : "bg-slate-500/10 text-slate-500 border-slate-500/20 text-xs"
                          }>
                            {flag.severity.toUpperCase()}
                          </Badge>
                          <p className="text-sm font-medium text-foreground">{flag.trigger}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Examples: {flag.examples}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-foreground">{flag.action}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="border-violet-500/30 bg-violet-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-500" />
                Star Chamber Escalation Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">1</div>
                <div>
                  <p className="font-medium text-foreground">Automated Flag</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Content matching Switzerland Protocol triggers is auto-flagged and placed on a 24-hour review hold.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">2</div>
                <div>
                  <p className="font-medium text-foreground">Dual AI Verification</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Two independent AI agents (Oracle + Red Queen) evaluate the flagged content. Agreement above 80% triggers immediate action.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">3</div>
                <div>
                  <p className="font-medium text-foreground">Human Judge Review</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Contested cases go to the Star Chamber 4-judge panel (Morpheus, Dredd, Oracle, Red Queen). Human reviewer makes final call.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-violet-600">4</div>
                <div>
                  <p className="font-medium text-foreground">Switzerland Protocol Council Oversight</p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    The Switzerland Protocol Council (SPC) reviews systemic patterns and proposes arena policy updates to the full Board.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 mt-1"
                onClick={() => navigate("/governance/star-chamber")}
              >
                <Gavel className="w-3.5 h-3.5" />
                Open Star Chamber
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-500/20 bg-slate-500/5">
            <CardContent className="pt-4 pb-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Outside the Gates</p>
              <p>
                Political discussion is not forbidden -- it is <em>separated</em>. The
                "Outside the Gates" arena exists for members who want to engage politically.
                It operates on its own rules, outside the cooperative's core economic mission.
                Bring politics there. Keep the main platform focused on the 16 initiatives
                that improve daily life.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CROWNS */}
        <TabsContent value="crowns" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {crowns?.map((crown) => (
              <Card key={crown.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{crown.title}</h3>
                      <p className="text-sm text-muted-foreground">{crown.initiative}</p>
                      {crown.holder_name && (
                        <p className="text-sm font-medium text-primary mt-1">{crown.holder_name}</p>
                      )}
                      {crown.target_candidate && !crown.holder_name && (
                        <p className="text-sm text-amber-600 mt-1">Target: {crown.target_candidate}</p>
                      )}
                    </div>
                    <Badge className={statusColors[crown.status || "vacant"]}>
                      {crown.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* VOTING */}
        <TabsContent value="voting" className="space-y-4">
          {votableItems && votableItems.length > 0 ? (
            votableItems.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/governance/proposals/${item.id}`)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <Badge>{item.item_type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>{item.total_credits || 0} credits pledged</span>
                    <span>Level {item.production_level || 1}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No active votes. Proposals are submitted by The 300.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BYLAWS */}
        <TabsContent value="bylaws" className="space-y-4">
          {bylaws?.map((bylaw) => (
            <Card key={bylaw.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <h3 className="font-bold">{bylaw.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{bylaw.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{bylaw.category}</Badge>
                    <Badge className={bylaw.protection_level === "structural" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}>
                      {bylaw.protection_level}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Amendment: {bylaw.amendment_requirement}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* STAR CHAMBER */}
        <TabsContent value="star-chamber" className="space-y-4">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Star Chamber — Dual AI Verification
              </CardTitle>
              <CardDescription>
                Two independent AI agents verify content. Human reviewer makes final call.
              </CardDescription>
            </CardHeader>
          </Card>

          {verifications?.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{v.content_type}: {v.content_id}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>AI1: {v.ai1_agent}</span>
                      <span>AI2: {v.ai2_agent}</span>
                      {v.agreement_percentage && (
                        <span>Agreement: {Number(v.agreement_percentage).toFixed(0)}%</span>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[v.final_decision || v.status || "pending"]}>
                    {v.final_decision || v.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* THE 300 */}
        <TabsContent value="the-300" className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle>The 300 Governance Framework</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4" /> The Pledged (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  AI Agents. Permanent. 24/7 monitoring, fraud detection, proposal scoring, compliance checking.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> The Committed (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  Human Members. Elected, 1-year terms. Represent member interests. Vote on proposals.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Scale className="w-4 h-4" /> The Covenant (100 seats)
                </h3>
                <p className="text-muted-foreground">
                  Mixed AI-Human. Domain experts, technical specialists, emergency response.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voting Mechanics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span>Standard Proposal</span>
                  <span className="font-medium">51% majority, AI vote 1x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-muted/50">
                  <span>Bylaw Change</span>
                  <span className="font-medium">67% majority, AI vote 0.5x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-amber-500/5">
                  <span>Structural Bylaw</span>
                  <span className="font-medium">80% + Founder veto, AI vote 0x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-red-500/5">
                  <span>Emergency</span>
                  <span className="font-medium">51% expedited, AI vote 2x</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DNA Lock */}
          <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dna className="w-5 h-5 text-red-500" />
                DNA Lock -- Encoded Operating Principles
              </CardTitle>
              <CardDescription>
                The following principles are encoded into the cooperative operating agreement.
                They cannot be overridden by any vote, election, or Board action short of
                an 80% supermajority of The 300 plus Founder ratification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Membership Fee", value: "$5/year flat -- no tiers, no upgrades, no premium class", locked: true },
                { label: "5% Participation Cap", value: "No member or coordinated group may exceed 5% of votes on any item", locked: true },
                { label: "Marks = Participation Only", value: "Marks are cooperative participation records. They confer no equity, ownership, or financial interest.", locked: true },
                { label: "Securities-Clean Language", value: "No governance action may be described in terms that constitute a securities offering or solicitation", locked: true },
                { label: "Founder Ratification Requirement", value: "Star Chamber overrides, DNA Lock amendments, and shield-gated letter dispatches require explicit Founder ratification", locked: true },
                { label: "IP Ledger Immutability", value: "IP Ledger entries are append-only. No record may be modified or deleted after creation.", locked: true },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-2 rounded bg-muted/30">
                  <Lock className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Board Composition */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-primary" />
                Board Composition -- Council-Elected Representatives
              </CardTitle>
              <CardDescription>
                The cooperative Board is composed of representatives elected by each council.
                No Board seat is appointed by the Founder or staff. Councils nominate and vote;
                the member with the most support votes earns the seat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { council: "Stewards Guild Council", seats: 2, term: "1 year", notes: "Elected from active Stewards in good standing" },
                { council: "Harper Guild Council", seats: 2, term: "1 year", notes: "Elected from active Harper Guild reviewers" },
                { council: "Areopagus Council", seats: 1, term: "1 year", notes: "Elected from doctrine-level contributors" },
                { council: "Initiative Captains Council", seats: 2, term: "1 year", notes: "Elected by active initiative leads" },
                { council: "Member-at-Large", seats: 1, term: "1 year", notes: "Elected by full membership vote" },
              ].map((row) => (
                <div key={row.council} className="flex items-start justify-between gap-3 p-2 rounded bg-muted/30">
                  <div>
                    <p className="font-medium">{row.council}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{row.notes}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium">{row.seats} seat{row.seats > 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground">{row.term}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => navigate("/stewards-guild")}>
                <Link2 className="w-3.5 h-3.5" />
                Stewards Guild
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </PortalPageLayout>
  );
}
