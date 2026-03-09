/**
 * SIDE QUESTS — Universal Flexible Work System
 * ==============================================
 * Innovation #1550: Side Quests System (Session 8B)
 *
 * Browse, claim, and complete micro-tasks for currency rewards.
 * Integrates with Three-Gear Currency, HexIsle XP, and Boaz Principle.
 * Zero barriers to entry — anyone can quest from day one (gleaning).
 *
 * SEC-safe: All rewards are service Credits/Marks/Joules, not securities.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Scroll, Search, Coins, Zap, Star, Shield, Clock,
  CheckCircle2, XCircle, Play, ArrowRight, Loader2,
  Swords, Compass, Wrench, Palette, Megaphone,
  BookOpen, Bug, Users, Flame, LayoutDashboard,
  ChevronRight, Award, Send,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

interface SideQuest {
  id: string;
  title: string;
  description: string;
  detailed_instructions: string | null;
  category: string;
  difficulty: string;
  quest_type: string;
  reward_credits: number;
  reward_marks: number;
  reward_joules: number;
  hexisle_xp: number;
  max_claims: number | null;
  max_completions_per_user: number;
  time_limit_hours: number | null;
  requires_approval: boolean;
  min_reputation_level: number;
  min_membership_days: number;
  initiative_slug: string | null;
  status: string;
  featured: boolean;
  created_at: string;
}

interface QuestClaim {
  id: string;
  quest_id: string;
  status: string;
  progress_percentage: number;
  proof_url: string | null;
  proof_description: string | null;
  review_notes: string | null;
  credits_awarded: number;
  marks_cleared: number;
  joules_awarded: number;
  xp_awarded: number;
  claimed_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  side_quests?: SideQuest;
}

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const CATEGORY_ICONS: Record<string, any> = {
  harvest: Flame,
  navigate: Compass,
  engineer: Wrench,
  battle: Swords,
  seek: Search,
  magic: Star,
  train: Award,
  design: Palette,
  marketing: Megaphone,
  documentation: BookOpen,
  testing: Bug,
  community: Users,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  expert: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

// ═══════════════════════════════════════════════════════════════════
// QUEST CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════

function QuestCard({
  quest,
  userClaim,
  onClaim,
  onSubmit,
  isPending,
}: {
  quest: SideQuest;
  userClaim?: QuestClaim;
  onClaim: (questId: string) => void;
  onSubmit: (claimId: string, proofUrl: string, proofDescription: string) => void;
  isPending: boolean;
}) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofDesc, setProofDesc] = useState("");

  const CatIcon = CATEGORY_ICONS[quest.category] || Scroll;
  const diffClass = DIFFICULTY_COLORS[quest.difficulty] || DIFFICULTY_COLORS.beginner;
  const hasReward = quest.reward_credits > 0 || quest.reward_marks > 0 || quest.reward_joules > 0 || quest.hexisle_xp > 0;

  const handleSubmit = () => {
    if (!userClaim) return;
    onSubmit(userClaim.id, proofUrl, proofDesc);
    setSubmitOpen(false);
    setProofUrl("");
    setProofDesc("");
  };

  return (
    <Card className={`flex flex-col ${quest.featured ? "border-primary/30 bg-primary/5" : ""}`}>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <CatIcon className="w-4 h-4" />
            </div>
            <Badge className={diffClass} variant="secondary">
              {quest.difficulty}
            </Badge>
          </div>
          {quest.featured && (
            <Badge variant="default" className="gap-1">
              <Flame className="w-3 h-3" />
              Featured
            </Badge>
          )}
        </div>

        <CardTitle className="text-lg">{quest.title}</CardTitle>
        <CardDescription className="line-clamp-2">{quest.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Rewards */}
        {hasReward && (
          <div className="flex flex-wrap gap-2">
            {quest.reward_credits > 0 && (
              <Badge variant="outline" className="gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                {quest.reward_credits} Credits
              </Badge>
            )}
            {quest.reward_marks > 0 && (
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                {quest.reward_marks} Marks
              </Badge>
            )}
            {quest.reward_joules > 0 && (
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3 text-yellow-500" />
                {quest.reward_joules} Joules
              </Badge>
            )}
            {quest.hexisle_xp > 0 && (
              <Badge variant="outline" className="gap-1">
                <Star className="w-3 h-3 text-purple-500" />
                {quest.hexisle_xp} XP
              </Badge>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{quest.quest_type.replace("_", " ")}</span>
          {quest.time_limit_hours && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {quest.time_limit_hours}h limit
            </span>
          )}
          {quest.requires_approval && (
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Requires review
            </span>
          )}
        </div>

        {/* Claim status */}
        {userClaim && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <Badge variant={
                userClaim.status === "approved" ? "default" :
                userClaim.status === "submitted" ? "secondary" :
                userClaim.status === "rejected" ? "destructive" : "outline"
              }>
                {userClaim.status === "approved" ? "Completed" :
                 userClaim.status === "submitted" ? "Under Review" :
                 userClaim.status === "rejected" ? "Needs Revision" :
                 "In Progress"}
              </Badge>
            </div>
            <Progress value={userClaim.progress_percentage} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter>
        {!userClaim ? (
          <Button
            className="w-full gap-1"
            size="sm"
            onClick={() => onClaim(quest.id)}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Claim Quest
          </Button>
        ) : userClaim.status === "claimed" || userClaim.status === "in_progress" ? (
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-1" size="sm" variant="secondary">
                <Send className="w-3.5 h-3.5" />
                Submit Deliverable
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Quest: {quest.title}</DialogTitle>
                <DialogDescription>
                  {quest.detailed_instructions || quest.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Proof URL (optional)</label>
                  <Input
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description of completed work</label>
                  <Textarea
                    value={proofDesc}
                    onChange={(e) => setProofDesc(e.target.value)}
                    placeholder="Describe what you did..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!proofDesc.trim()}>
                  Submit for {quest.requires_approval ? "Review" : "Completion"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : userClaim.status === "approved" ? (
          <Button className="w-full gap-1" size="sm" variant="ghost" disabled>
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            Quest Complete
          </Button>
        ) : userClaim.status === "submitted" ? (
          <Button className="w-full gap-1" size="sm" variant="ghost" disabled>
            <Clock className="w-3.5 h-3.5" />
            Awaiting Review
          </Button>
        ) : userClaim.status === "rejected" ? (
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="w-full gap-1" size="sm" variant="outline">
                <ArrowRight className="w-3.5 h-3.5" />
                Resubmit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Resubmit: {quest.title}</DialogTitle>
                <DialogDescription>
                  Reviewer notes: {userClaim.review_notes || "No notes provided."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Proof URL (optional)</label>
                  <Input
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Updated work description</label>
                  <Textarea
                    value={proofDesc}
                    onChange={(e) => setProofDesc(e.target.value)}
                    placeholder="Describe what you changed..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!proofDesc.trim()}>
                  Resubmit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : null}
      </CardFooter>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function SideQuests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // ─── Fetch available quests ─────────────────────────────────────
  const { data: quests, isLoading: questsLoading } = useQuery({
    queryKey: ["side-quests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("side_quests")
        .select("*")
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as SideQuest[];
    },
  });

  // ─── Fetch user's claims ────────────────────────────────────────
  const { data: myClaims } = useQuery({
    queryKey: ["my-quest-claims"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("side_quest_claims")
        .select("*, side_quests(*)")
        .eq("user_id", (user as any).id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as QuestClaim[];
    },
    enabled: !!user,
  });

  // ─── Claim a quest ──────────────────────────────────────────────
  const claimMutation = useMutation({
    mutationFn: async (questId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("side_quest_claims").insert({
        quest_id: questId,
        user_id: (user as any).id,
        status: "claimed",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Quest claimed! Time to get to work.");
      queryClient.invalidateQueries({ queryKey: ["my-quest-claims"] });
    },
    onError: (err: any) => {
      if (err.message?.includes("unique_active_claim")) {
        toast.error("You already have an active claim on this quest.");
      } else {
        toast.error("Failed to claim quest.");
        console.error(err);
      }
    },
  });

  // ─── Submit deliverable ─────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async ({
      claimId,
      proofUrl,
      proofDescription,
    }: {
      claimId: string;
      proofUrl: string;
      proofDescription: string;
    }) => {
      const { error } = await supabase
        .from("side_quest_claims")
        .update({
          status: "submitted",
          proof_url: proofUrl || null,
          proof_description: proofDescription,
          submitted_at: new Date().toISOString(),
          progress_percentage: 100,
        })
        .eq("id", claimId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deliverable submitted! Awaiting review.");
      queryClient.invalidateQueries({ queryKey: ["my-quest-claims"] });
    },
    onError: () => {
      toast.error("Failed to submit deliverable.");
    },
  });

  // ─── Helpers ────────────────────────────────────────────────────
  const getClaimForQuest = (questId: string) =>
    myClaims?.find((c) => c.quest_id === questId && !["abandoned", "expired"].includes(c.status));

  const filteredQuests = (quests || []).filter((q) => {
    if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        q.title.toLowerCase().includes(term) ||
        q.description.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const activeClaimsCount = (myClaims || []).filter((c) =>
    ["claimed", "in_progress", "submitted"].includes(c.status)
  ).length;
  const completedCount = (myClaims || []).filter((c) => c.status === "approved").length;

  // ─── Categories for filter ─────────────────────────────────────
  const categories = ["all", ...Object.keys(CATEGORY_ICONS)];

  return (
    <div className="min-h-screen bg-background">
      <GlobalBreadcrumbs />
      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Hero */}
        <div className="text-center space-y-3">
          <Badge variant="outline" className="gap-1">
            <Scroll className="w-3 h-3" />
            Flexible Work
          </Badge>
          <h1 className="text-4xl font-bold">Side Quests</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Earn Credits, clear Marks, and gain HexIsle XP by completing tasks
            for the cooperative. No barriers — start from day one.
          </p>
        </div>

        {/* Stats Banner */}
        {user && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{activeClaimsCount}</p>
                <p className="text-xs text-muted-foreground">Active Quests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">{completedCount}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold">
                  {(myClaims || []).reduce((sum, c) => sum + c.credits_awarded, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Credits Earned</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="browse" className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse">Browse Quests</TabsTrigger>
            <TabsTrigger value="my-quests" disabled={!user}>
              My Quests {activeClaimsCount > 0 && `(${activeClaimsCount})`}
            </TabsTrigger>
          </TabsList>

          {/* ─── BROWSE TAB ──────────────────────────────────────── */}
          <TabsContent value="browse" className="space-y-4">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search quests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? "default" : "ghost"}
                    size="sm"
                    className="text-xs capitalize"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quest Grid */}
            {questsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredQuests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    userClaim={getClaimForQuest(quest.id)}
                    onClaim={(id) => claimMutation.mutate(id)}
                    onSubmit={(claimId, proofUrl, proofDescription) =>
                      submitMutation.mutate({ claimId, proofUrl, proofDescription })
                    }
                    isPending={claimMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Scroll className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold">No Quests Found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || categoryFilter !== "all"
                      ? "Try adjusting your filters."
                      : "New quests are being added. Check back soon!"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ─── MY QUESTS TAB ───────────────────────────────────── */}
          <TabsContent value="my-quests" className="space-y-4">
            {(myClaims || []).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(myClaims || []).map((claim) => {
                  const quest = claim.side_quests as unknown as SideQuest | undefined;
                  if (!quest) return null;
                  return (
                    <QuestCard
                      key={claim.id}
                      quest={quest}
                      userClaim={claim}
                      onClaim={() => {}}
                      onSubmit={(claimId, proofUrl, proofDescription) =>
                        submitMutation.mutate({ claimId, proofUrl, proofDescription })
                      }
                      isPending={false}
                    />
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold">No Active Quests</h3>
                  <p className="text-sm text-muted-foreground">
                    Browse the quest board and claim your first quest to get started.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
