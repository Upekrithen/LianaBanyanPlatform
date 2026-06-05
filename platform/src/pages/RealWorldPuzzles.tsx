/**
 * REAL WORLD PUZZLES -- Golden Key Challenge Creator & Browser
 * ==============================================================
 * Members create puzzles using the Golden Key system:
 *   - Allowed: Library, publications, emails, external sites
 *   - LB Islands: Paid + Shirley Temple Policy required
 *   - One Golden Key per plane (never multiple per location)
 *   - Reading/completing puzzles earns Coverage Minutes
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  KeyRound, Map, Search, BookOpen, Globe,
  Mail, Library, Star, Plus, Eye,
  Compass, Award, Timer, Shield, Lock,
  Target, Sparkles, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  type RealWorldPuzzle,
  type PuzzleLocation,
  type PuzzleDifficulty,
  COVERAGE_MINUTES_PER_COMPLETION,
  ISLAND_PLACEMENT_FEE,
  MAX_KEYS_PER_CHAIN,
  getPuzzleStats,
} from "@/lib/discourse/realWorldPuzzles";
import { PortalPageLayout } from '@/components/PortalPageLayout';

// ── Mock Data ──────────────────────────────────────────────────────────────

// TODO (BP072-W9-C5): Replace MOCK_PUZZLES with Supabase query from `real_world_puzzles`
// table when schema is wired. Typed stub preserved.
const MOCK_PUZZLES: RealWorldPuzzle[] = [
  {
    id: "rwp-1",
    name: "The Cooperative Economy Trail",
    description: "Follow the breadcrumbs through five articles about cooperative business models. Each Golden Key unlocks deeper insights.",
    creatorMemberId: "creator-1",
    location: "library" as PuzzleLocation,
    status: "active",
    difficulty: "intermediate" as PuzzleDifficulty,
    goldenKeyChain: [
      { id: "gk-1", puzzleId: "rwp-1", sequenceNumber: 1, planeId: "plane-1", discoveryMethod: "reading_completion", contentId: "art-101", engagementThreshold: 120, canBecomePhaseBasis: false },
      { id: "gk-2", puzzleId: "rwp-1", sequenceNumber: 2, planeId: "plane-2", discoveryMethod: "cross_reference", contentId: "art-102", engagementThreshold: 180, canBecomePhaseBasis: false },
      { id: "gk-3", puzzleId: "rwp-1", sequenceNumber: 3, planeId: "plane-3", discoveryMethod: "interaction_required", contentId: "art-103", engagementThreshold: 90, canBecomePhaseBasis: true },
    ],
    keyCount: 3,
    coverageMinutesReward: COVERAGE_MINUTES_PER_COMPLETION,
    contentReference: { contentId: "art-101", contentType: "library" as PuzzleLocation, title: "Cooperative Economics 101" },
    attemptCount: 42,
    completionCount: 18,
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    ledgerEntryId: "ledger-rwp-1",
  },
  {
    id: "rwp-2",
    name: "Veteran Business Launch Puzzle",
    description: "Navigate through real-world entrepreneurship resources. Find the Golden Key in each resource to prove you've read and understood.",
    creatorMemberId: "creator-2",
    location: "external_site" as PuzzleLocation,
    status: "active",
    difficulty: "beginner" as PuzzleDifficulty,
    goldenKeyChain: [
      { id: "gk-4", puzzleId: "rwp-2", sequenceNumber: 1, planeId: "plane-4", discoveryMethod: "reading_completion", contentId: "ext-1", engagementThreshold: 60, canBecomePhaseBasis: false },
      { id: "gk-5", puzzleId: "rwp-2", sequenceNumber: 2, planeId: "plane-5", discoveryMethod: "time_based", contentId: "ext-2", engagementThreshold: 90, canBecomePhaseBasis: false },
    ],
    keyCount: 2,
    coverageMinutesReward: COVERAGE_MINUTES_PER_COMPLETION,
    contentReference: { contentId: "ext-1", contentType: "external_site" as PuzzleLocation, title: "SBA.gov Veteran Resources" },
    attemptCount: 67,
    completionCount: 31,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    ledgerEntryId: "ledger-rwp-2",
  },
  {
    id: "rwp-3",
    name: "Island Treasure Hunt",
    description: "A premium puzzle placed on Harvest Island. Find the Golden Key hidden among the hexes.",
    creatorMemberId: "creator-3",
    location: "lb_island" as PuzzleLocation,
    status: "active",
    difficulty: "expert" as PuzzleDifficulty,
    goldenKeyChain: [
      { id: "gk-6", puzzleId: "rwp-3", sequenceNumber: 1, planeId: "plane-6", discoveryMethod: "interaction_required", contentId: "hex-harvest-12", engagementThreshold: 300, canBecomePhaseBasis: true },
    ],
    keyCount: 1,
    coverageMinutesReward: COVERAGE_MINUTES_PER_COMPLETION,
    islandPlacement: {
      feePaid: ISLAND_PLACEMENT_FEE,
      shirleyTempleReview: { id: "str-1", puzzleId: "rwp-3", status: "approved", violations: [] },
      islandId: 1,
      hexPosition: { q: 5, r: 3 },
    },
    contentReference: { contentId: "hex-harvest-12", contentType: "lb_island" as PuzzleLocation, title: "Harvest Island Hex 5,3", islandId: 1, hexPosition: { q: 5, r: 3 } },
    attemptCount: 12,
    completionCount: 2,
    createdAt: "2026-03-05T00:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
    ledgerEntryId: "ledger-rwp-3",
  },
];

// ── Difficulty Colors ──────────────────────────────────────────────────────

function getDifficultyStyle(d: PuzzleDifficulty) {
  switch (d) {
    case "beginner": return { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500" };
    case "intermediate": return { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500" };
    case "advanced": return { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500" };
    case "expert": return { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500" };
    default: return { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500" };
  }
}

function getLocationIcon(loc: PuzzleLocation) {
  switch (loc) {
    case "library": return <Library className="w-3.5 h-3.5" />;
    case "publication": return <BookOpen className="w-3.5 h-3.5" />;
    case "email": return <Mail className="w-3.5 h-3.5" />;
    case "external_site": return <Globe className="w-3.5 h-3.5" />;
    case "cephas_article": return <BookOpen className="w-3.5 h-3.5" />;
    case "lb_island": return <Map className="w-3.5 h-3.5" />;
    default: return <Compass className="w-3.5 h-3.5" />;
  }
}

export default function RealWorldPuzzles() {
  const { user } = useAuth();

  const [puzzles] = useState<RealWorldPuzzle[]>(MOCK_PUZZLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredPuzzles = puzzles.filter(
    p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         p.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleStartPuzzle = (puzzle: RealWorldPuzzle) => {
    toast.success(`Starting "${puzzle.name}"! Find ${puzzle.keyCount} Golden Key${puzzle.keyCount !== 1 ? "s" : ""}.`);
  };

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Real World Puzzles</h1>
                <p className="text-sm text-slate-400">
                  Golden Key challenges across the real world and LB
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Puzzle
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
          <div className="text-sm text-yellow-400/80">
            <p className="font-semibold mb-1">How Real World Puzzles Work</p>
            <p>
              Each puzzle contains Golden Keys hidden in real content. Read, engage, and discover keys
              to earn <strong>{COVERAGE_MINUTES_PER_COMPLETION} Coverage Minutes</strong> per completion.
              One key per plane. Puzzles in LB islands cost {ISLAND_PLACEMENT_FEE} Credits and require
              Shirley Temple Policy approval.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search puzzles..."
            className="bg-slate-800/50 border-slate-700 text-slate-200 pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">All</TabsTrigger>
            <TabsTrigger value="library" className="data-[state=active]:bg-slate-700">Library</TabsTrigger>
            <TabsTrigger value="external" className="data-[state=active]:bg-slate-700">External</TabsTrigger>
            <TabsTrigger value="island" className="data-[state=active]:bg-slate-700">Islands</TabsTrigger>
          </TabsList>

          {["all", "library", "external", "island"].map(tab => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPuzzles
                  .filter(p => {
                    if (tab === "all") return true;
                    if (tab === "library") return p.location === "library" || p.location === "cephas_article";
                    if (tab === "external") return p.location === "external_site" || p.location === "publication" || p.location === "email";
                    if (tab === "island") return p.location === "lb_island";
                    return true;
                  })
                  .map(puzzle => {
                    const stats = getPuzzleStats(puzzle);
                    const diffStyle = getDifficultyStyle(puzzle.difficulty);

                    return (
                      <Card key={puzzle.id} className="bg-slate-800/50 border-slate-700 hover:border-yellow-500/30 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className={`${diffStyle.border} ${diffStyle.text} text-xs`}>
                              {puzzle.difficulty}
                            </Badge>
                            <div className="flex items-center gap-1 text-slate-500">
                              {getLocationIcon(puzzle.location)}
                              <span className="text-xs capitalize">{puzzle.location.replace(/_/g, " ")}</span>
                            </div>
                          </div>
                          <CardTitle className="text-sm font-medium text-slate-200">
                            {puzzle.name}
                          </CardTitle>
                          <CardDescription className="text-slate-400 text-xs">
                            {puzzle.description}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-3 pb-2">
                          {/* Keys */}
                          <div className="flex items-center gap-2">
                            {Array.from({ length: puzzle.keyCount }).map((_, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center"
                              >
                                <KeyRound className="w-3 h-3 text-yellow-400" />
                              </div>
                            ))}
                            <span className="text-xs text-slate-500 ml-1">
                              {puzzle.keyCount} key{puzzle.keyCount !== 1 ? "s" : ""}
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-2 text-xs text-center">
                            <div className="px-2 py-1.5 rounded bg-slate-900/40">
                              <p className="text-slate-500">Attempts</p>
                              <p className="text-slate-300 font-bold">{stats.attemptCount}</p>
                            </div>
                            <div className="px-2 py-1.5 rounded bg-slate-900/40">
                              <p className="text-slate-500">Completed</p>
                              <p className="text-slate-300 font-bold">{stats.completionCount}</p>
                            </div>
                            <div className="px-2 py-1.5 rounded bg-slate-900/40">
                              <p className="text-slate-500">Rate</p>
                              <p className="text-slate-300 font-bold">{stats.completionRate}%</p>
                            </div>
                          </div>

                          {/* Reward */}
                          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-amber-500/5 border border-amber-500/10">
                            <span className="text-amber-400/60 flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              Reward
                            </span>
                            <span className="text-amber-400 font-bold">
                              +{puzzle.coverageMinutesReward} Coverage Minutes
                            </span>
                          </div>

                          {/* Island badge */}
                          {puzzle.location === "lb_island" && puzzle.islandPlacement && (
                            <div className="flex items-center gap-1.5 text-xs">
                              <Shield className="w-3 h-3 text-green-400" />
                              <span className="text-green-400/80">Shirley Temple Approved</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-slate-500">Fee: {puzzle.islandPlacement.feePaid}C</span>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-2 border-t border-slate-700/50">
                          <Button
                            onClick={() => handleStartPuzzle(puzzle)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black text-sm"
                            size="sm"
                          >
                            <Compass className="w-3 h-3 mr-1" />
                            Start Puzzle
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create a Real World Puzzle</DialogTitle>
            <DialogDescription className="text-slate-400">
              Build a Golden Key puzzle chain. Place keys in Library content, publications,
              emails, or external sites. LB islands require {ISLAND_PLACEMENT_FEE} Credits + Shirley Temple review.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-3 text-xs text-yellow-400/80">
              <p className="font-semibold mb-1">Rules:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>One Golden Key per plane (never more than one per location)</li>
                <li>Max {MAX_KEYS_PER_CHAIN} keys per puzzle chain</li>
                <li>Completers earn {COVERAGE_MINUTES_PER_COMPLETION} Coverage Minutes</li>
                <li>LB Island placement: {ISLAND_PLACEMENT_FEE} Credits + Shirley Temple Policy</li>
                <li>Planes can become the basis for new Phase MimicTrunks</li>
              </ul>
            </div>
            <p className="text-sm text-slate-400 text-center">
              Full puzzle editor in development. Contact the Founder to discuss.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="border-slate-600 text-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalPageLayout>
  );
}
