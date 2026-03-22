import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Flag, Scale, Shield, ArrowRight, CheckCircle2, FileSignature, Users,
  Vote, Search, MapPin, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle, XCircle,
  Eye, Building2, FileText, Star, Timer, Flame, Award, BookOpen, Mic,
  Zap, VolumeX, Play, Pause, RotateCcw, Gavel, Send, Target,
  CalendarDays, BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — No Supabase wiring this session
// ═══════════════════════════════════════════════════════════════

const SAMPLE_DISTRICT = {
  name: "District 7",
  city: "Boise",
  state: "ID",
  population: 219_425,
  registeredVoters: 142_800,
  communityPriorities: 8,
};

const SAMPLE_REPS = [
  {
    id: "rep-001",
    name: "Sarah Mitchell",
    title: "US Representative",
    district: "Idaho District 1",
    party: "Independent",
    voteScore: 78,
    keyVotes: { withConstituents: 45, againstConstituents: 12, abstained: 3 },
    recentVotes: [
      { bill: "HR 1234 - Infrastructure Act", vote: "YES", aligned: true },
      { bill: "HR 5678 - Tax Reform", vote: "NO", aligned: true },
      { bill: "HR 9012 - Healthcare Access", vote: "YES", aligned: false },
    ],
    contactInfo: { phone: "202-555-0123", email: "rep.mitchell@house.gov", office: "123 Capitol St, Boise, ID" },
  },
  {
    id: "rep-002",
    name: "James Chen",
    title: "US Senator",
    district: "Idaho",
    party: "Independent",
    voteScore: 65,
    keyVotes: { withConstituents: 38, againstConstituents: 20, abstained: 2 },
    recentVotes: [
      { bill: "S 456 - Climate Action", vote: "YES", aligned: true },
      { bill: "S 789 - Defense Budget", vote: "YES", aligned: false },
      { bill: "S 101 - Education Funding", vote: "YES", aligned: true },
    ],
    contactInfo: { phone: "202-555-0456", email: "sen.chen@senate.gov", office: "456 Senate Ave, Boise, ID" },
  },
];

type LegislationStatus = "Introduced" | "In Committee" | "Floor Vote" | "Passed" | "Signed" | "Vetoed";

const STATUS_ORDER: LegislationStatus[] = ["Introduced", "In Committee", "Floor Vote", "Passed", "Signed"];

const STATUS_COLORS: Record<LegislationStatus, string> = {
  Introduced: "bg-slate-500 text-white",
  "In Committee": "bg-amber-600 text-white",
  "Floor Vote": "bg-blue-600 text-white",
  Passed: "bg-emerald-600 text-white",
  Signed: "bg-green-700 text-white",
  Vetoed: "bg-red-700 text-white",
};

interface LegislationItem {
  id: string;
  number: string;
  title: string;
  status: LegislationStatus;
  relevance: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  sponsors: number;
  cosponsors: number;
  communityImpact: string;
  watching: boolean;
  lastAction: string;
  chamber: "House" | "Senate";
}

const TRACKED_LEGISLATION: LegislationItem[] = [
  {
    id: "bill-001", number: "HR 2024", title: "Worker Ownership Incentive Act",
    status: "In Committee", relevance: "HIGH",
    description: "Tax incentives for companies that transition to worker ownership models.",
    sponsors: 12, cosponsors: 45,
    communityImpact: "Could reduce cooperative formation costs by 30% in the first year.",
    watching: true, lastAction: "Referred to Ways & Means — March 5, 2026", chamber: "House",
  },
  {
    id: "bill-002", number: "S 2025", title: "Cooperative Commerce Enhancement Act",
    status: "Floor Vote", relevance: "HIGH",
    description: "Reduces regulatory burden for cooperative business structures.",
    sponsors: 8, cosponsors: 23,
    communityImpact: "Simplifies annual reporting for co-ops with <1,000 members.",
    watching: true, lastAction: "Floor vote scheduled — March 22, 2026", chamber: "Senate",
  },
  {
    id: "bill-003", number: "HR 3030", title: "Community Food Security Act",
    status: "Passed", relevance: "MEDIUM",
    description: "Supports local food systems and neighborhood meal sharing programs.",
    sponsors: 5, cosponsors: 89,
    communityImpact: "Enables cottage food licenses in all 50 states.",
    watching: false, lastAction: "Passed House 278-145 — March 1, 2026", chamber: "House",
  },
  {
    id: "bill-004", number: "S 1890", title: "Small Business Zoning Reform Act",
    status: "Introduced", relevance: "MEDIUM",
    description: "Allows mixed-use home-based manufacturing in residential zones for businesses under $100K revenue.",
    sponsors: 3, cosponsors: 11,
    communityImpact: "Would let LMB operators run 3D print nodes from home legally.",
    watching: false, lastAction: "Introduced — February 28, 2026", chamber: "Senate",
  },
  {
    id: "bill-005", number: "HR 4101", title: "Cooperative Tax Credit Extension",
    status: "In Committee", relevance: "HIGH",
    description: "Extends and expands Section 1042 tax-free rollovers for sales to worker cooperatives.",
    sponsors: 15, cosponsors: 67,
    communityImpact: "Makes employee buyouts 40% more affordable for retiring business owners.",
    watching: true, lastAction: "Hearing scheduled — March 18, 2026", chamber: "House",
  },
];

const SAMPLE_CIVIC_SCORECARD = {
  totalXP: 2_450,
  level: 7,
  nextLevelXP: 3_000,
  streakDays: 12,
  longestStreak: 28,
  actions: [
    { id: "a1", type: "vote" as const, label: "Senate Votes Cast", count: 23, xp: 460 },
    { id: "a2", type: "meeting" as const, label: "Town Halls Attended", count: 4, xp: 400 },
    { id: "a3", type: "letter" as const, label: "Letters to Reps", count: 7, xp: 350 },
    { id: "a4", type: "petition" as const, label: "Petitions Signed", count: 15, xp: 300 },
    { id: "a5", type: "education" as const, label: "Civic Courses Completed", count: 3, xp: 450 },
  ],
  badges: [
    { name: "First Vote", icon: "🗳️", earned: true },
    { name: "Town Crier", icon: "📯", earned: true },
    { name: "Pen Pal", icon: "✉️", earned: true },
    { name: "Week Warrior", icon: "🔥", earned: true },
    { name: "Month Maven", icon: "⭐", earned: false },
    { name: "Century Club", icon: "💯", earned: false },
  ],
};

const SAMPLE_COVERAGE = {
  earned: 180,
  spent: 47,
  remaining: 133,
  cap: 180,
  expiresInDays: 72,
  chunkMinutes: 3,
};

// ═══════════════════════════════════════════════════════════════
// CIVIC LEVEL TIERS
// ═══════════════════════════════════════════════════════════════

const CIVIC_LEVELS = [
  { level: 1, name: "Observer", minXP: 0 },
  { level: 2, name: "Informed", minXP: 200 },
  { level: 3, name: "Engaged", minXP: 500 },
  { level: 4, name: "Active", minXP: 1_000 },
  { level: 5, name: "Advocate", minXP: 1_500 },
  { level: 6, name: "Champion", minXP: 2_000 },
  { level: 7, name: "Statesman", minXP: 2_500 },
  { level: 8, name: "Patriot", minXP: 3_000 },
  { level: 9, name: "Founding Voice", minXP: 5_000 },
  { level: 10, name: "Keeper of the Republic", minXP: 10_000 },
];

function getCivicLevel(xp: number) {
  return CIVIC_LEVELS.reduce((best, l) => (xp >= l.minXP ? l : best), CIVIC_LEVELS[0]);
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

type TabKey = "dashboard" | "reps" | "legislation" | "scorecard" | "minutes";

export default function PowerToThePeoplePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchList, setWatchList] = useState<Set<string>>(
    new Set(TRACKED_LEGISLATION.filter((b) => b.watching).map((b) => b.id))
  );

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(SAMPLE_COVERAGE.chunkMinutes * 60);
  const [timerPaused, setTimerPaused] = useState(false);

  useEffect(() => {
    if (!timerActive || timerPaused) return;
    if (timerSeconds <= 0) { setTimerActive(false); return; }
    const id = setInterval(() => setTimerSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timerPaused, timerSeconds]);

  const toggleWatch = useCallback((billId: string) => {
    setWatchList((prev) => {
      const next = new Set(prev);
      if (next.has(billId)) next.delete(billId); else next.add(billId);
      return next;
    });
  }, []);

  const resetTimer = () => {
    setTimerSeconds(SAMPLE_COVERAGE.chunkMinutes * 60);
    setTimerActive(false);
    setTimerPaused(false);
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const civicLevel = getCivicLevel(SAMPLE_CIVIC_SCORECARD.totalXP);
  const xpProgress =
    ((SAMPLE_CIVIC_SCORECARD.totalXP - civicLevel.minXP) /
      (SAMPLE_CIVIC_SCORECARD.nextLevelXP - civicLevel.minXP)) *
    100;

  const TAB_ITEMS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <BarChart3 className="h-4 w-4" /> },
    { key: "reps", label: "Representatives", icon: <Users className="h-4 w-4" /> },
    { key: "legislation", label: "Legislation", icon: <Gavel className="h-4 w-4" /> },
    { key: "scorecard", label: "Scorecard", icon: <Award className="h-4 w-4" /> },
    { key: "minutes", label: "Coverage Minutes", icon: <Timer className="h-4 w-4" /> },
  ];

  return (
    <LaunchConditionOverlay initiativeSlug="power-to-the-people" initiativeName="Power to the People">
      <PortalPageLayout maxWidth="xl" xrayId="political-expedition-hub">
        {/* ═══ HEADER ═══ */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-600 rounded-full text-white">
            <Flag className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground">
              Power to the People
            </h1>
            <p className="text-lg text-muted-foreground">
              The Political Expedition — civic engagement infrastructure, not partisan messaging
            </p>
          </div>
          <Badge
            variant="outline"
            className="ml-auto text-amber-600 border-amber-400 dark:text-amber-400"
          >
            Sample Data
          </Badge>
        </div>

        {/* ═══ SWITZERLAND PROTOCOL BANNER ═══ */}
        <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 mb-8 max-w-3xl">
          <h3 className="text-amber-400 font-semibold flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" /> The Switzerland Protocol
          </h3>
          <p className="text-sm text-slate-300">
            This arena exists <em>outside</em> the cooperative's economic mission. No party
            names. No endorsements. No culture wars. We track what elected officials{" "}
            <strong>do</strong> — not what they say. "Vote FOR people who vote for you."
          </p>
        </div>

        {/* ═══ DASHBOARD STAT STRIP ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="pt-4 pb-3 text-center">
              <MapPin className="h-6 w-6 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {SAMPLE_DISTRICT.name}
              </p>
              <p className="text-xs text-muted-foreground/70">
                {SAMPLE_DISTRICT.city}, {SAMPLE_DISTRICT.state}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-4 pb-3 text-center">
              <Users className="h-6 w-6 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {SAMPLE_REPS.length}
              </p>
              <p className="text-xs text-muted-foreground/70">Your Representatives</p>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4 pb-3 text-center">
              <FileText className="h-6 w-6 mx-auto text-amber-500 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {TRACKED_LEGISLATION.length}
              </p>
              <p className="text-xs text-muted-foreground/70">Active Legislation</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-4 pb-3 text-center">
              <Target className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
              <p className="text-lg font-bold text-foreground">
                {SAMPLE_DISTRICT.communityPriorities}
              </p>
              <p className="text-xs text-muted-foreground/70">Community Priorities</p>
            </CardContent>
          </Card>
        </div>

        {/* ═══ TAB NAVIGATION ═══ */}
        <div className="flex flex-wrap gap-2 border-b border-border pb-4 mb-6">
          {TAB_ITEMS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key ? "bg-purple-600 hover:bg-purple-700 text-white" : ""
              }
            >
              {tab.icon}
              <span className="ml-1.5">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════
            DASHBOARD TAB
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Philosophy Column */}
              <div className="lg:col-span-2">
                <Card className="border-2 border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/10">
                  <CardHeader>
                    <Badge
                      variant="outline"
                      className="w-fit bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 mb-2"
                    >
                      Patriotic Interdependentalism
                    </Badge>
                    <CardTitle className="text-2xl text-purple-900 dark:text-purple-400">
                      Helping Each Other Help Ourselves
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-2">
                      Liana Banyan is neutral ground. If you want to argue politics, you go
                      "Outside the Gates." Inside, we agree on 16 initiatives that prioritize
                      localism, worker participation, and family independence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4 items-start bg-card p-4 rounded-xl border shadow-sm">
                      <Scale className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-foreground">
                          Different Tribes, Shared Infrastructure
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Outside the gates, people can argue and campaign as they wish. Inside,
                          our job is quieter: keep the lights on and make sure community-built
                          value stays with communities.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start bg-card p-4 rounded-xl border shadow-sm">
                      <FileSignature className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-foreground">
                          Petitions & Vote Tracking
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          We don't tell you what to believe. We simply remember — in public — who
                          did what, when.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start bg-card p-4 rounded-xl border shadow-sm">
                      <Shield className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-foreground">
                          Protecting the Keep
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          We do not allow the platform to be weaponized. If a policy helps
                          families get groceries, make dinner, or afford medicine — we support it.
                          That's the line.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Expedition Map + Know Your Government */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Expedition Map</CardTitle>
                    <CardDescription>Civic engagement pathways</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => setActiveTab("reps")}>
                      <Users className="h-4 w-4 text-blue-500" /> Know Your Representatives
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => setActiveTab("legislation")}>
                      <Gavel className="h-4 w-4 text-amber-500" /> Track Legislation
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => setActiveTab("scorecard")}>
                      <Award className="h-4 w-4 text-emerald-500" /> Your Civic Scorecard
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => setActiveTab("minutes")}>
                      <Timer className="h-4 w-4 text-purple-500" /> Coverage Minutes
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/senate")}>
                      <Vote className="h-4 w-4 text-indigo-500" /> Senate (Cooperative Governance)
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/petitions")}>
                      <FileSignature className="h-4 w-4 text-rose-500" /> Petitions (Pnyx)
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Know Your Government</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="font-semibold text-foreground">Local</p>
                      <p>City Council, Mayor, County Commissioners, School Board</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="font-semibold text-foreground">State</p>
                      <p>State Legislature, Governor, Attorney General</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg border">
                      <p className="font-semibold text-foreground">Federal</p>
                      <p>US House, US Senate, President, Supreme Court</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="p-6 bg-slate-900/50 border border-border rounded-xl max-w-3xl mx-auto">
              <p className="text-slate-300 italic text-base leading-relaxed text-center">
                "'Tis the set of the sails and not the gales,
                <br />
                that tells the way we go."
              </p>
              <p className="text-purple-400 text-sm mt-3 font-medium text-center">
                — Ella Wheeler Wilcox
              </p>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            REPRESENTATIVES TAB
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "reps" && (
          <div className="space-y-6">
            <div className="flex gap-4 max-w-xl">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                <Input
                  placeholder="Enter your ZIP code to find representatives"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="bg-blue-600 hover:bg-blue-500">
                <Search className="h-4 w-4 mr-2" />
                Find Reps
              </Button>
            </div>

            <h3 className="text-xl font-semibold text-foreground">
              Your Representatives — {SAMPLE_DISTRICT.city}, {SAMPLE_DISTRICT.state}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {SAMPLE_REPS.map((rep) => (
                <Card key={rep.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                          <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">{rep.name}</CardTitle>
                          <CardDescription>{rep.title}</CardDescription>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{rep.party}</Badge>
                            <span className="text-xs text-muted-foreground/70">{rep.district}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${rep.voteScore >= 70 ? "text-green-500" : rep.voteScore >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                          {rep.voteScore}%
                        </div>
                        <p className="text-xs text-muted-foreground/70">Alignment Score</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded">
                        <ThumbsUp className="h-4 w-4 mx-auto text-green-500 mb-1" />
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{rep.keyVotes.withConstituents}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">With You</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 dark:bg-red-900/30 rounded">
                        <ThumbsDown className="h-4 w-4 mx-auto text-red-500 mb-1" />
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{rep.keyVotes.againstConstituents}</p>
                        <p className="text-xs text-red-700 dark:text-red-300">Against You</p>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <AlertCircle className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
                        <p className="text-lg font-bold text-muted-foreground">{rep.keyVotes.abstained}</p>
                        <p className="text-xs text-muted-foreground/70">Abstained</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Recent Votes</p>
                      {rep.recentVotes.map((v, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                          <span className="text-muted-foreground truncate flex-1">{v.bill}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={v.vote === "YES" ? "bg-green-600 text-white" : "bg-red-600 text-white"}>{v.vote}</Badge>
                            {v.aligned ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" /> Full Record
                      </Button>
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white">
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            LEGISLATION TRACKER TAB
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "legislation" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Legislation Tracker</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Bills relevant to cooperative commerce, worker ownership, and community empowerment.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">{watchList.size} Watching</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => (
                <Badge key={s} className={`${STATUS_COLORS[s]} text-xs`}>{s}</Badge>
              ))}
              <Badge className={`${STATUS_COLORS.Vetoed} text-xs`}>Vetoed</Badge>
            </div>

            <div className="space-y-4">
              {TRACKED_LEGISLATION.map((bill) => {
                const billIdx = STATUS_ORDER.indexOf(bill.status);
                return (
                  <Card key={bill.id} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge className="bg-blue-600 text-white">{bill.number}</Badge>
                            <Badge className={STATUS_COLORS[bill.status]}>{bill.status}</Badge>
                            <Badge variant="outline" className="text-xs">{bill.chamber}</Badge>
                            <Badge className={bill.relevance === "HIGH" ? "bg-red-600/80 text-white" : bill.relevance === "MEDIUM" ? "bg-yellow-600/80 text-white" : "bg-slate-600 text-white"}>
                              {bill.relevance}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">{bill.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{bill.description}</p>
                        </div>
                      </div>

                      {/* Status Progression Bar */}
                      <div className="flex items-center gap-1 my-4">
                        {STATUS_ORDER.map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full ${i <= billIdx ? "bg-purple-500" : "bg-muted"}`}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground/70 -mt-2 mb-3 px-1">
                        {STATUS_ORDER.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Target className="h-3 w-3" /> Community Impact
                        </p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200 mt-1">{bill.communityImpact}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                        <div className="flex items-center gap-4 text-muted-foreground/70">
                          <span>{bill.sponsors} Sponsors</span>
                          <span>{bill.cosponsors} Cosponsors</span>
                          <span className="text-xs italic hidden sm:inline">{bill.lastAction}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={watchList.has(bill.id) ? "default" : "outline"}
                          className={watchList.has(bill.id) ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                          onClick={() => toggleWatch(bill.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          {watchList.has(bill.id) ? "Watching" : "Watch This Bill"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            CIVIC ENGAGEMENT SCORECARD TAB
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "scorecard" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground">
              Civic Engagement Scorecard
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="md:col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {civicLevel.level}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-foreground">{civicLevel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {SAMPLE_CIVIC_SCORECARD.totalXP.toLocaleString()} XP — Next level at{" "}
                        {SAMPLE_CIVIC_SCORECARD.nextLevelXP.toLocaleString()} XP
                      </p>
                      <Progress value={xpProgress} className="mt-2 h-3" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
                <CardContent className="pt-6 text-center">
                  <Flame className="h-10 w-10 mx-auto text-orange-500 mb-2" />
                  <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {SAMPLE_CIVIC_SCORECARD.streakDays}
                  </p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Longest: {SAMPLE_CIVIC_SCORECARD.longestStreak} days
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Civic Actions</CardTitle>
                <CardDescription>Your participation across engagement types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {SAMPLE_CIVIC_SCORECARD.actions.map((action) => {
                  const icons: Record<string, React.ReactNode> = {
                    vote: <Vote className="h-5 w-5 text-blue-500" />,
                    meeting: <Building2 className="h-5 w-5 text-emerald-500" />,
                    letter: <Send className="h-5 w-5 text-purple-500" />,
                    petition: <FileSignature className="h-5 w-5 text-amber-500" />,
                    education: <BookOpen className="h-5 w-5 text-indigo-500" />,
                  };
                  return (
                    <div key={action.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      {icons[action.type]}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground/70">{action.count} completed</p>
                      </div>
                      <Badge variant="outline" className="text-purple-600 border-purple-300">
                        +{action.xp} XP
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Civic Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {SAMPLE_CIVIC_SCORECARD.badges.map((badge) => (
                    <div
                      key={badge.name}
                      className={`text-center p-3 rounded-lg border ${
                        badge.earned
                          ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700"
                          : "bg-muted border-border opacity-50"
                      }`}
                    >
                      <span className="text-2xl">{badge.icon}</span>
                      <p className="text-xs font-medium mt-1 text-muted-foreground">
                        {badge.name}
                      </p>
                      {!badge.earned && <p className="text-[10px] text-muted-foreground mt-0.5">Locked</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            COVERAGE MINUTES TAB
            ═══════════════════════════════════════════════════════ */}
        {activeTab === "minutes" && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Timer className="h-6 w-6 text-purple-500" /> Coverage Minutes
            </h3>

            {/* Muffled Rule */}
            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <VolumeX className="h-8 w-8 text-amber-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1">
                      The Muffled Rule
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Before you can speak on political topics, you must first{" "}
                      <strong>listen</strong>. Coverage Minutes are earned by reading, watching,
                      and engaging with civic content. Speaking is gated by listening —{" "}
                      {SAMPLE_COVERAGE.chunkMinutes}-minute chunks, {SAMPLE_COVERAGE.cap}-minute
                      cap, {SAMPLE_COVERAGE.expiresInDays}-day expiry.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Balance Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <BookOpen className="h-6 w-6 mx-auto text-emerald-500 mb-1" />
                  <p className="text-2xl font-bold text-emerald-600">{SAMPLE_COVERAGE.earned}</p>
                  <p className="text-xs text-muted-foreground/70">Minutes Earned</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <Mic className="h-6 w-6 mx-auto text-blue-500 mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{SAMPLE_COVERAGE.spent}</p>
                  <p className="text-xs text-muted-foreground/70">Minutes Spent</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-purple-300 dark:border-purple-700">
                <CardContent className="pt-4 pb-3 text-center">
                  <Timer className="h-6 w-6 mx-auto text-purple-500 mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{SAMPLE_COVERAGE.remaining}</p>
                  <p className="text-xs text-muted-foreground/70">Remaining</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <CalendarDays className="h-6 w-6 mx-auto text-amber-500 mb-1" />
                  <p className="text-2xl font-bold text-amber-600">{SAMPLE_COVERAGE.expiresInDays}d</p>
                  <p className="text-xs text-muted-foreground/70">Until Expiry</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Coverage Balance</span>
                <span>{SAMPLE_COVERAGE.remaining} / {SAMPLE_COVERAGE.cap} min</span>
              </div>
              <Progress value={(SAMPLE_COVERAGE.remaining / SAMPLE_COVERAGE.cap) * 100} className="h-4" />
            </div>

            {/* 3-Minute Debate Chunk Timer */}
            <Card className="bg-slate-900 text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-purple-400" />
                  {SAMPLE_COVERAGE.chunkMinutes}-Minute Debate Chunk Timer
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Speaking in the Political Expedition is limited to{" "}
                  {SAMPLE_COVERAGE.chunkMinutes}-minute chunks. Start the timer when you begin
                  speaking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="text-5xl font-mono font-bold text-center min-w-[140px]">
                    <span className={timerSeconds <= 30 && timerActive && !timerPaused ? "text-red-400 animate-pulse" : "text-purple-400"}>
                      {fmtTime(timerSeconds)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!timerActive ? (
                      <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => { setTimerActive(true); setTimerPaused(false); }}>
                        <Play className="h-4 w-4 mr-1" /> Start
                      </Button>
                    ) : (
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={() => setTimerPaused((p) => !p)}>
                        {timerPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                        {timerPaused ? "Resume" : "Pause"}
                      </Button>
                    )}
                    <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800" onClick={resetTimer}>
                      <RotateCcw className="h-4 w-4 mr-1" /> Reset
                    </Button>
                  </div>
                </div>
                {timerSeconds === 0 && (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-center">
                    <p className="text-red-300 font-semibold">Time's up! Your chunk has ended.</p>
                    <p className="text-red-400 text-sm mt-1">Reset the timer or yield the floor.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* How to Earn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Earn Coverage Minutes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <BookOpen className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="flex-1">Read civic articles and legislation summaries</span>
                  <Badge variant="outline">+3 min</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <Eye className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="flex-1">Watch committee hearings or town halls</span>
                  <Badge variant="outline">+5 min</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <Award className="h-5 w-5 text-purple-500 shrink-0" />
                  <span className="flex-1">Complete a civic education module</span>
                  <Badge variant="outline">+10 min</Badge>
                </div>
                <div className="flex items-center gap-3 p-2 bg-muted rounded">
                  <FileSignature className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="flex-1">Submit a petition with sourced evidence</span>
                  <Badge variant="outline">+15 min</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ═══ FOOTER ═══ */}
        <div className="mt-12 text-center border-t border-border pt-8">
          <p className="text-muted-foreground text-sm">
            <strong className="text-foreground">Power to the People</strong> —
            Initiative #15
          </p>
          <p className="text-xs mt-2 text-muted-foreground/70">
            "Not left or right. Forward." — Help Each Other Help Ourselves
          </p>
        </div>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
