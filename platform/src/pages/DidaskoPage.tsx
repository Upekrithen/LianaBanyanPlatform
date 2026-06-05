/**
 * DidaskoPage -- Wave 19 / BP073 W9 (real-data wired)
 * =====================================================
 * Peer-to-peer learning platform mini-app.
 * Teachers earn Marks for teaching. Learners earn Marks for completing + reviewing.
 * Curriculum bounties. MnemosyneC learning path memory. IP-Ledger for authorship.
 * Depth levels: Skipping Stones / Wading In / Deep Dive (from explainerCorpus).
 *
 * Supabase: didasko_skills
 * Migration: 20260603120003_bp073_w9_didasko_skills.sql
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen, GraduationCap, BrainCircuit, Award, Users, PenLine,
  Target, Layers, Search, Star, Clock, CheckCircle2, ArrowRight,
  Coins, FileText, Lock, Sparkles, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LaunchConditionOverlay from "@/components/LaunchConditionOverlay";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InitiativeCueCard } from "@/components/initiatives/InitiativeCueCard";
import { InitiativeWalkthrough } from "@/components/initiatives/InitiativeWalkthrough";
import { getCueCard, getWalkthrough } from "@/data/initiativeWalkthroughs";
import { COST_PLUS_CONSTANTS } from "@/lib/costPlusService";
import type { DepthLayer } from "@/data/explainerCorpus";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Typed stubs (TODO: wire to Supabase tables) ─────────────────────────────

export type LearningDepth = DepthLayer;

export interface DidaskoSkill {
  id: string;
  title: string;
  instructorHandle: string;
  depth: LearningDepth;
  category: string;
  costCredits: number;
  marksOnCompletion: number;
  marksOnReview: number;
  durationMinutes: number;
  enrolledCount: number;
  rating: number;
  /** IP-Ledger entry hash -- TODO: wire to ip_ledger table */
  ipLedgerRef?: string;
}

export interface CurriculumBounty {
  id: string;
  title: string;
  description: string;
  category: string;
  depth: LearningDepth;
  marksReward: number;
  creditsReward: number;
  claimDeadline: string;
  status: "open" | "claimed" | "completed";
  claimedBy?: string;
}

export interface LearningPathEntry {
  skillId: string;
  skillTitle: string;
  completedAt: string;
  depth: LearningDepth;
  marksEarned: number;
  /** MnemosyneC vector tag -- TODO: sync with mnemosynec.ai learning graph */
  mnemosynecTag?: string;
}

export interface IPLedgerCurriculumEntry {
  id: string;
  sequenceNumber: number;
  authorId: string;
  skillTitle: string;
  pearlHash: string;
  createdAt: string;
  royaltiesEarned: number;
}

// ─── Static stub data (TODO: replace with Supabase queries) ──────────────────

const DEPTH_META: Record<LearningDepth, { label: string; color: string; icon: string }> = {
  "skipping-stones": { label: "Skipping Stones", color: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/40 dark:text-sky-300", icon: "💧" },
  "wading-in":       { label: "Wading In",       color: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300", icon: "🌊" },
  "deep-dive":       { label: "Deep Dive",        color: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300", icon: "🤿" },
};

const DIDASKO_SKILLS: DidaskoSkill[] = [
  {
    id: "sk-001", title: "Introduction to Hydraulics for Kids",
    instructorHandle: "hexisle_edu", depth: "skipping-stones",
    category: "STEAM / HexIsle", costCredits: 12, marksOnCompletion: 25, marksOnReview: 10,
    durationMinutes: 45, enrolledCount: 134, rating: 4.9,
    ipLedgerRef: "0xABCD1234", // TODO: ip_ledger sequence ref
  },
  {
    id: "sk-002", title: "Fluid Mechanics and Gear Ratios (Middle School)",
    instructorHandle: "steam_guild", depth: "wading-in",
    category: "STEAM / HexIsle", costCredits: 18, marksOnCompletion: 40, marksOnReview: 15,
    durationMinutes: 90, enrolledCount: 67, rating: 4.7,
    ipLedgerRef: "0xEFGH5678",
  },
  {
    id: "sk-003", title: "Cooperative Economics: Cost+20% Explained",
    instructorHandle: "banyan_core", depth: "skipping-stones",
    category: "Cooperative Finance", costCredits: 8, marksOnCompletion: 20, marksOnReview: 8,
    durationMinutes: 30, enrolledCount: 289, rating: 4.8,
  },
  {
    id: "sk-004", title: "The Three-Currency System: Credits, Marks, Joules",
    instructorHandle: "banyan_core", depth: "wading-in",
    category: "Cooperative Finance", costCredits: 15, marksOnCompletion: 35, marksOnReview: 12,
    durationMinutes: 60, enrolledCount: 178, rating: 4.6,
  },
  {
    id: "sk-005", title: "Home Plumbing Fundamentals",
    instructorHandle: "guild_master_torres", depth: "skipping-stones",
    category: "Skilled Trades", costCredits: 10, marksOnCompletion: 30, marksOnReview: 12,
    durationMinutes: 50, enrolledCount: 95, rating: 4.8,
  },
  {
    id: "sk-006", title: "Distributed Ledger and IP Authorship",
    instructorHandle: "banyan_legal", depth: "deep-dive",
    category: "Governance & IP", costCredits: 25, marksOnCompletion: 60, marksOnReview: 20,
    durationMinutes: 120, enrolledCount: 42, rating: 4.9,
    ipLedgerRef: "0xIPLEDGER",
  },
];

const CURRICULUM_BOUNTIES: CurriculumBounty[] = [
  {
    id: "cb-001", title: "K-12 Module: Introduction to Cooperative Business",
    description: "Create a Skipping Stones lesson for ages 8-12 explaining what a cooperative is and how members earn together.",
    category: "Cooperative Finance", depth: "skipping-stones",
    marksReward: 150, creditsReward: 30, claimDeadline: "2026-08-01", status: "open",
  },
  {
    id: "cb-002", title: "Wading In: Marks and Reputation Systems",
    description: "An interactive module explaining how Marks accumulate, what Mark levels mean, and how voting multipliers work.",
    category: "Governance & IP", depth: "wading-in",
    marksReward: 200, creditsReward: 45, claimDeadline: "2026-07-15", status: "claimed",
    claimedBy: "edu_member_42",
  },
  {
    id: "cb-003", title: "Deep Dive: IP-Ledger Authorship and Pearl Hashing",
    description: "Advanced module on how curriculum entries are stamped to the IP-Ledger, royalty flows, and sequencing.",
    category: "Governance & IP", depth: "deep-dive",
    marksReward: 300, creditsReward: 60, claimDeadline: "2026-09-01", status: "open",
  },
  {
    id: "cb-004", title: "Brass Tacks Skills: 3D Printing Basics",
    description: "A Skipping Stones intro to SLA/FDM printing for Brass Tacks micro-factory nodes. Pairs with the Brass Tacks initiative.",
    category: "Skilled Trades", depth: "skipping-stones",
    marksReward: 120, creditsReward: 25, claimDeadline: "2026-08-15", status: "open",
  },
];

// Stub learning path (TODO: fetch from MnemosyneC sync API)
const STUB_LEARNING_PATH: LearningPathEntry[] = [
  {
    skillId: "sk-003", skillTitle: "Cooperative Economics: Cost+20% Explained",
    completedAt: "2026-05-12", depth: "skipping-stones", marksEarned: 20,
    mnemosynecTag: "econ::cost-plus::intro", // TODO: MnemosyneC vector tag
  },
  {
    skillId: "sk-005", skillTitle: "Home Plumbing Fundamentals",
    completedAt: "2026-05-28", depth: "skipping-stones", marksEarned: 30,
    mnemosynecTag: "trades::plumbing::l1",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DepthBadge({ depth }: { depth: LearningDepth }) {
  const meta = DEPTH_META[depth];
  return (
    <Badge variant="outline" className={`text-xs ${meta.color}`}>
      {meta.icon} {meta.label}
    </Badge>
  );
}

function SkillCard({ skill }: { skill: DidaskoSkill }) {
  const creatorEarns = Math.round(skill.costCredits * COST_PLUS_CONSTANTS.CREATOR_CUT);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-snug">{skill.title}</CardTitle>
          <DepthBadge depth={skill.depth} />
        </div>
        <CardDescription className="text-xs">
          by @{skill.instructorHandle} · {skill.category}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {skill.durationMinutes}m</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {skill.enrolledCount}</span>
          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {skill.rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono font-bold text-foreground">{skill.costCredits}</span> Credits
            <span className="mx-1 text-muted-foreground/50">·</span>
            instructor keeps <span className="font-bold text-emerald-600">{creatorEarns}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
            <Award className="h-3 w-3" />
            <span>+{skill.marksOnCompletion} Marks</span>
          </div>
        </div>
        {skill.ipLedgerRef && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <FileText className="h-3 w-3" />
            <span>IP-Ledger: <code className="font-mono text-xs">{skill.ipLedgerRef}</code></span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3 flex gap-2">
        <Button size="sm" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
          Enroll
        </Button>
        <Button size="sm" variant="outline" className="text-xs">Preview</Button>
      </CardFooter>
    </Card>
  );
}

function BountyCard({ bounty }: { bounty: CurriculumBounty }) {
  const statusColors = {
    open: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/40 dark:text-green-300",
    claimed: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300",
    completed: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400",
  };
  return (
    <Card className={bounty.status === "open" ? "border-green-200 dark:border-green-900/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-snug">{bounty.title}</CardTitle>
          <Badge variant="outline" className={`text-xs shrink-0 ${statusColors[bounty.status]}`}>
            {bounty.status}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <DepthBadge depth={bounty.depth} />
          <span className="text-xs text-muted-foreground">{bounty.category}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <p className="text-xs text-muted-foreground leading-relaxed">{bounty.description}</p>
        <div className="flex items-center gap-4 pt-1">
          <div className="flex items-center gap-1 text-xs">
            <Award className="h-3.5 w-3.5 text-indigo-500" />
            <span className="font-bold">{bounty.marksReward}</span>
            <span className="text-muted-foreground">Marks</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-bold">{bounty.creditsReward}</span>
            <span className="text-muted-foreground">Credits</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Due {bounty.claimDeadline}
          </div>
        </div>
        {bounty.claimedBy && (
          <p className="text-xs text-muted-foreground/70">Claimed by @{bounty.claimedBy}</p>
        )}
      </CardContent>
      {bounty.status === "open" && (
        <CardFooter className="pt-0 pb-3">
          <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            <Target className="h-3.5 w-3.5 mr-1" /> Claim This Bounty
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DidaskoPage() {
  usePageSEO({
    title: "Didasko | Liana Banyan",
    description: "Cooperative learning and tutoring marketplace. Educators keep 83.3%. Community-governed education, not EdTech extraction.",
    canonical: "https://lianabanyan.com/initiatives/didasko",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [depthFilter, setDepthFilter] = useState<LearningDepth | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const cueCard = getCueCard("didasko");
  const walkthrough = getWalkthrough("didasko");

  const { data: liveSkills = [] } = useQuery({
    queryKey: ["didasko_skills", "published"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("didasko_skills")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const allSkills = liveSkills.length > 0
    ? liveSkills.map((s: any) => ({
        id: s.id,
        title: s.title,
        instructorHandle: s.instructor_id.slice(0, 8),
        depth: "wading-in" as LearningDepth,
        category: s.category,
        costCredits: 10,
        marksOnCompletion: s.marks_reward,
        marksOnReview: 10,
        durationMinutes: 60,
        enrolledCount: 0,
        rating: null,
        ipLedgerRef: s.ip_ledger_ref,
        mnemosynecTag: s.mnemosynec_tag,
      })) as DidaskoSkill[]
    : DIDASKO_SKILLS;

  const filteredSkills = allSkills.filter((s) => {
    const matchDepth = depthFilter === "all" || s.depth === depthFilter;
    const matchSearch = searchQuery === "" ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructorHandle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDepth && matchSearch;
  });

  const openBounties = CURRICULUM_BOUNTIES.filter((b) => b.status === "open").length;
  const totalMarksAvailable = CURRICULUM_BOUNTIES
    .filter((b) => b.status === "open")
    .reduce((sum, b) => sum + b.marksReward, 0);

  return (
    <LaunchConditionOverlay initiativeSlug="didasko" initiativeName="Didasko">
      <PortalPageLayout maxWidth="xl" xrayId="didasko-page">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-indigo-600 rounded-full text-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-foreground dark:text-white">Didasko</h1>
            <p className="text-lg text-muted-foreground dark:text-slate-400">
              Peer-to-peer learning. The people who teach keep 83.3%.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Creator Keep", value: "83.3%", sub: "of every session fee", color: "text-emerald-600" },
            { label: "Platform Margin", value: "C+20%", sub: "locked by doctrine", color: "text-indigo-600" },
            { label: "Open Bounties", value: String(openBounties), sub: `${totalMarksAvailable} Marks available`, color: "text-amber-600" },
            { label: "Depth Levels", value: "3", sub: "Stones / Wading / Dive", color: "text-blue-600" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center p-3">
              <p className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-medium text-foreground">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="courses" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="courses" className="text-xs">
              <BookOpen className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Courses
            </TabsTrigger>
            <TabsTrigger value="teach" className="text-xs">
              <GraduationCap className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Teach
            </TabsTrigger>
            <TabsTrigger value="bounties" className="text-xs">
              <Target className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> Bounties
            </TabsTrigger>
            <TabsTrigger value="my-path" className="text-xs">
              <BrainCircuit className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> My Path
            </TabsTrigger>
            <TabsTrigger value="about" className="text-xs">
              <Layers className="h-3.5 w-3.5 mr-1 hidden sm:inline" /> About
            </TabsTrigger>
          </TabsList>

          {/* COURSES TAB */}
          <TabsContent value="courses" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex gap-1">
                {(["all", "skipping-stones", "wading-in", "deep-dive"] as const).map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={depthFilter === d ? "default" : "outline"}
                    onClick={() => setDepthFilter(d)}
                    className="text-xs"
                  >
                    {d === "all" ? "All" : DEPTH_META[d].icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Depth legend */}
            <div className="flex flex-wrap gap-2">
              {(Object.entries(DEPTH_META) as [LearningDepth, typeof DEPTH_META[LearningDepth]][]).map(([key, meta]) => (
                <div key={key} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>{meta.icon}</span>
                  <span className="font-medium">{meta.label}</span>
                  <span>-- {key === "skipping-stones" ? "intro, accessible" : key === "wading-in" ? "intermediate" : "advanced"}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
              {filteredSkills.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
                  No courses match your filters. Try adjusting the depth or search.
                </div>
              )}
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground mb-2">
                Showing {filteredSkills.length} of {allSkills.length} courses
                {liveSkills.length > 0 ? " (live from database)" : " (sample data)"}
              </p>
              <Button variant="outline" size="sm">Load More Courses</Button>
            </div>
          </TabsContent>

          {/* TEACH TAB */}
          <TabsContent value="teach" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Post a tutoring session */}
              <Card className="border-2 border-indigo-200 dark:border-indigo-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-500" /> Post a Live Session
                  </CardTitle>
                  <CardDescription>
                    Offer 1:1 or group tutoring. You set the rate; platform enforces Cost+20%.
                    You keep {Math.round(COST_PLUS_CONSTANTS.CREATOR_CUT * 100)}%.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    {[
                      "Choose your skill from the catalog or add a new one",
                      "Set your hourly cost (platform shows cost + 20% to learner)",
                      "Schedule availability or post as on-demand",
                      "Learner books, platform holds payment in escrow",
                      "Session complete: 83.3% releases to you immediately",
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-center font-bold">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <PenLine className="h-4 w-4 mr-2" /> Post a Teaching Session
                  </Button>
                </CardFooter>
              </Card>

              {/* Publish a course */}
              <Card className="border-2 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" /> Publish a Course
                  </CardTitle>
                  <CardDescription>
                    Build it once, earn from every enrollment forever. Curriculum is stamped
                    to the IP-Ledger under your authorship.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Earnings calculator */}
                  <div className="p-3 bg-muted dark:bg-slate-800 rounded-lg text-sm space-y-1">
                    <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Earnings Example</p>
                    <p>Course priced at 20 Credits</p>
                    <p>
                      Your cut (83.3%):{" "}
                      <span className="font-bold text-emerald-600">
                        {Math.round(20 * COST_PLUS_CONSTANTS.CREATOR_CUT)} Credits
                      </span>
                    </p>
                    <p>100 enrollments = <span className="font-bold text-emerald-600">{Math.round(20 * COST_PLUS_CONSTANTS.CREATOR_CUT * 100)} Credits</span> for you</p>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-400" />
                    <span>
                      Every published course receives an IP-Ledger entry with your pearl hash.
                      {/* TODO: connect to ip_ledger Supabase table on publish */}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5 text-indigo-400" />
                    <span>
                      Reviewers earn Marks for quality reviews. You earn Marks when your
                      course gets 5-star reviews.
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Layers className="h-4 w-4 mr-2" /> Start Building a Course
                  </Button>
                </CardFooter>
              </Card>

              {/* Marks for teaching */}
              <Card className="lg:col-span-2 bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-5 w-5 text-indigo-500" /> How You Earn Marks as a Teacher
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { action: "Session completed by learner", marks: "+25 Marks", note: "Per session, verified completion" },
                      { action: "Course review (5-star)", marks: "+15 Marks", note: "Per verified review" },
                      { action: "Curriculum bounty delivered", marks: "+150-300 Marks", note: "Bounty tier dependent" },
                    ].map((item) => (
                      <div key={item.action} className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-sm">
                        <p className="font-semibold text-indigo-700 dark:text-indigo-300">{item.marks}</p>
                        <p className="font-medium text-foreground mt-0.5">{item.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">{item.note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BOUNTIES TAB */}
          <TabsContent value="bounties" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Curriculum Contribution Bounties</h2>
                <p className="text-sm text-muted-foreground">
                  The platform needs these courses built. Claim a bounty, create the curriculum,
                  get paid in Marks + Credits and earn an IP-Ledger stamp.
                </p>
              </div>
              <Badge className="bg-green-600 text-white">
                {openBounties} Open
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CURRICULUM_BOUNTIES.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </div>

            <Card className="bg-muted/30 border-dashed">
              <CardContent className="py-4 text-center text-sm text-muted-foreground">
                <p className="font-medium mb-1">Suggest a Curriculum Gap</p>
                <p className="text-xs mb-3">
                  Know a topic that should be taught cooperatively? Submit a suggestion.
                  If approved by the Stewards Guild, a bounty will be posted.
                </p>
                <Button variant="outline" size="sm">
                  <PenLine className="h-3.5 w-3.5 mr-1" /> Suggest a Topic
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MY PATH TAB */}
          <TabsContent value="my-path" className="space-y-4">
            {/* MnemosyneC integration banner */}
            <Card className="border-2 border-sky-200 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BrainCircuit className="h-5 w-5 text-sky-500" /> MnemosyneC Learning Graph
                </CardTitle>
                <CardDescription>
                  Your local MnemosyneC instance remembers your learning path. Skills you complete
                  here are tagged with vector embeddings so your AI remembers context between sessions.
                  {/* TODO: integrate with mnemosynec.ai sync API when OIDC is live */}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg border text-sm">
                  <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    MnemosyneC sync requires a local installation.{" "}
                    <a href="/mnemosyne" className="text-sky-600 underline">Download MnemosyneC</a>{" "}
                    to enable cross-session learning memory.
                    {/* TODO: wire to /mnemosyne download page */}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Completed courses */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Your Completed Courses</h3>
              {STUB_LEARNING_PATH.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-6 text-center text-muted-foreground text-sm">
                    No completed courses yet. Enroll in a course to start building your path.
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {STUB_LEARNING_PATH.map((entry) => (
                    <Card key={entry.skillId} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium">{entry.skillTitle}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <DepthBadge depth={entry.depth} />
                              <span className="text-xs text-muted-foreground">
                                Completed {entry.completedAt}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 shrink-0">
                          <Award className="h-3.5 w-3.5" />
                          <span>+{entry.marksEarned} Marks</span>
                        </div>
                      </div>
                      {entry.mnemosynecTag && (
                        <div className="ml-6 mt-1 text-xs text-muted-foreground/60 font-mono">
                          MnemosyneC: {entry.mnemosynecTag}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Depth progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Depth Progress</CardTitle>
                <CardDescription className="text-xs">
                  Learning across all three depth levels earns you Guild-backed certifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(DEPTH_META) as [LearningDepth, typeof DEPTH_META[LearningDepth]][]).map(([key, meta]) => {
                  const completed = STUB_LEARNING_PATH.filter((e) => e.depth === key).length;
                  const total = DIDASKO_SKILLS.filter((s) => s.depth === key).length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <span>{meta.icon}</span>
                          <span className="font-medium">{meta.label}</span>
                        </span>
                        <span className="text-muted-foreground">{completed}/{total} completed</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">

                {/* Origin anecdote */}
                {walkthrough?.originAnecdote && (
                  <Card className="border-indigo-200 dark:border-indigo-900">
                    <CardHeader>
                      <CardTitle className="text-base">Why Didasko Exists</CardTitle>
                      <CardDescription>Founder voice</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{walkthrough.originAnecdote}"
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Crown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Crown: Chancellor</CardTitle>
                    <CardDescription>Target: Sal Khan</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      We have written to Sal Khan (Khan Academy). He spent two decades proving that
                      world-class education can be free. We spent nine years building the economic
                      infrastructure to make it sustainable.
                    </p>
                    <p>He solved access. We are solving ownership.</p>
                    <div className="p-2 bg-muted dark:bg-slate-800 rounded-lg border text-xs">
                      <strong>Status:</strong> Letter Sent. Awaiting Response.
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full gap-2 text-sm">
                      Read the Crown Letter <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                {/* Walkthrough */}
                {walkthrough && (
                  <InitiativeWalkthrough
                    steps={walkthrough.steps}
                    initiativeName="Didasko"
                  />
                )}
              </div>

              <div className="space-y-4">
                {cueCard && <InitiativeCueCard card={cueCard} />}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">College of Hard Knocks</CardTitle>
                    <CardDescription className="text-xs">Real-world consensus tutorials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white justify-start gap-2 text-sm"
                      onClick={() => navigate("/hard-knocks")}
                    >
                      <BookOpen className="h-4 w-4" /> Enter the College
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">IP-Ledger Authorship</CardTitle>
                    <CardDescription className="text-xs">Your curriculum contributions on-ledger</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p>
                      Every course published through Didasko receives a permanent IP-Ledger entry.
                      Your pearl hash ties future royalty flows back to your authorship.
                    </p>
                    <div className="p-2 bg-muted rounded text-xs font-mono">
                      {/* TODO: fetch from ip_ledger table for current member */}
                      Pearl hash assigned at publish time
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-3.5 w-3.5 mr-1" /> View My IP-Ledger Entries
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PortalPageLayout>
    </LaunchConditionOverlay>
  );
}
