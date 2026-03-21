/**
 * SWITZERLAND RULE ARENAS
 * ========================
 * "No politics, no religion" — except in designated arenas.
 *
 * Three arenas, all OUTSIDE the main LB platform:
 *   1. Political Expedition — Political/civic discourse
 *   2. Areopagus — Religious/theological discussion (Acts 17)
 *   3. Crucible — Debate/argumentation
 *
 * Each has 4 moderation tiers:
 *   Tier 1: Moderated Debate — sources required, formal turns
 *   Tier 2: Structured Discussion — steelman requirement, cooldowns
 *   Tier 3: Casual Conversation — light moderation
 *   Tier 4: Free-for-All — minimal rules (no threats/doxxing)
 *
 * Freeze penalties for carrying arena behavior to main platform:
 *   Yellow: 4 hours | Orange: 24 hours | Red: 7 days | Black: 30 days
 *
 * Petitions can flow to Town Hall IF they get 500+ signatures + civility review.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield, Landmark, Church, Flame, MessageSquare,
  Users, AlertTriangle, ExternalLink, Lock,
  FileText, PenTool, ThumbsUp, Clock, Snowflake,
  ArrowRight, Check, Scale, BookOpen, Megaphone, Library,
} from "lucide-react";
import DoctrineExplorer from "@/components/areopagus/DoctrineExplorer";
import { toast } from "sonner";
import { PortalPageLayout } from "@/components/PortalPageLayout";

// ─── TYPES ───

interface Arena {
  id: string;
  slug: string;
  name: string;
  portal_name: string;
  description: string;
  category: string;
  icon: string;
  entry_flagstone_text: string;
  exit_flagstone_text: string;
  discord_invite_url: string | null;
}

interface ArenaMembership {
  id: string;
  arena_id: string;
  tier: number;
  reputation_score: number;
  is_frozen: boolean;
  freeze_until: string | null;
  total_posts: number;
}

interface Petition {
  id: string;
  arena_id: string;
  author_id: string;
  title: string;
  description: string;
  petition_type: string;
  target_entity: string | null;
  signature_threshold: number;
  current_signatures: number;
  status: string;
  created_at: string;
}

// ─── CONSTANTS ───

const ARENA_ICONS: Record<string, React.ElementType> = {
  political: Landmark,
  religious: Church,
  debate: Flame,
};

const ARENA_COLORS: Record<string, string> = {
  political: "from-blue-500/10 to-indigo-500/10 border-blue-500/20",
  religious: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
  debate: "from-red-500/10 to-rose-500/10 border-red-500/20",
};

const TIER_LABELS: Record<number, { name: string; description: string; icon: React.ElementType }> = {
  1: { name: "Moderated Debate", description: "Sources required. Formal turns. Policy deep dives.", icon: Scale },
  2: { name: "Structured Discussion", description: "Steelman requirement. Topic threads. Cooldowns.", icon: BookOpen },
  3: { name: "Casual Conversation", description: "Light moderation. No personal attacks.", icon: MessageSquare },
  4: { name: "Free-for-All", description: "Minimal rules. No threats or doxxing.", icon: Flame },
};

const FREEZE_TIERS = [
  { tier: "yellow", color: "bg-yellow-500/10 text-yellow-600", duration: "4 hours", credits: 0 },
  { tier: "orange", color: "bg-orange-500/10 text-orange-600", duration: "24 hours", credits: 50 },
  { tier: "red", color: "bg-red-500/10 text-red-600", duration: "7 days", credits: 200 },
  { tier: "black", color: "bg-gray-900/10 text-gray-800", duration: "30 days", credits: 500 },
];

// ─── MAIN COMPONENT ───

export default function Arenas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  const [selectedTier, setSelectedTier] = useState(3);
  const [enterDialogOpen, setEnterDialogOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [postSources, setPostSources] = useState("");
  const [postSteelman, setPostSteelman] = useState("");
  const [postTitle, setPostTitle] = useState("");

  // Load arenas
  const { data: arenas } = useQuery({
    queryKey: ["arenas"],
    queryFn: async () => {
      const { data } = await supabase
        .from("arenas")
        .select("*")
        .eq("is_active", true)
        .order("slug");
      return (data || []) as Arena[];
    },
  });

  // Load user's arena memberships
  const { data: memberships } = useQuery({
    queryKey: ["arena-memberships", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("arena_memberships")
        .select("*")
        .eq("user_id", user.id);
      return (data || []) as ArenaMembership[];
    },
    enabled: !!user,
  });

  // Load active petitions
  const { data: petitions } = useQuery({
    queryKey: ["active-petitions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("petitions")
        .select("*")
        .in("status", ["collecting", "threshold_met"])
        .order("current_signatures", { ascending: false })
        .limit(10);
      return (data || []) as Petition[];
    },
  });

  // Load recent posts for selected arena
  const { data: arenaPosts } = useQuery({
    queryKey: ["arena-posts", selectedArena?.id],
    queryFn: async () => {
      if (!selectedArena) return [];
      const { data } = await supabase
        .from("arena_posts")
        .select("*")
        .eq("arena_id", selectedArena.id)
        .eq("is_removed", false)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!selectedArena,
  });

  // Join arena with gateway stamp
  const joinArena = useMutation({
    mutationFn: async () => {
      if (!user || !selectedArena) throw new Error("Not ready");

      // Create membership
      const { error } = await supabase.from("arena_memberships").upsert({
        user_id: user.id,
        arena_id: selectedArena.id,
        tier: selectedTier,
        last_active_at: new Date().toISOString(),
      }, { onConflict: "user_id,arena_id" });
      if (error) throw error;

      // Record acknowledgment stamp to IP Ledger
      const stampData = `${user.id}:arena_enter_${selectedArena.slug}:${new Date().toISOString()}`;
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(stampData));
      const stampHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

      await supabase.from("acknowledgment_stamps").insert({
        user_id: user.id,
        action_type: "arena_enter",
        action_id: `arena_enter_${selectedArena.slug}`,
        arena_id: selectedArena.id,
        stamp_hash: stampHash,
        flagstone_text_shown: selectedArena.entry_flagstone_text || selectedArena.exit_flagstone_text,
        metadata: { tier: selectedTier, arena_name: selectedArena.name },
      });
    },
    onSuccess: () => {
      toast.success(`Gateway crossed. Stamp recorded to IP Ledger. Welcome to ${selectedArena?.name}.`);
      setEnterDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["arena-memberships"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to cross gateway"),
  });

  // Post in arena
  const createPost = useMutation({
    mutationFn: async () => {
      if (!user || !selectedArena) throw new Error("Not ready");
      const membership = memberships?.find((m) => m.arena_id === selectedArena.id);
      if (!membership) throw new Error("Join the arena first");
      if (membership.is_frozen) throw new Error("You are currently frozen in this arena");

      const sources = postSources ? postSources.split("\n").filter(Boolean) : undefined;
      if (membership.tier === 1 && (!sources || sources.length === 0)) {
        throw new Error("Tier 1 requires at least one source");
      }
      if (membership.tier === 2 && !postSteelman) {
        throw new Error("Tier 2 requires a steelman of the opposing view");
      }

      const { error } = await supabase.from("arena_posts").insert({
        arena_id: selectedArena.id,
        user_id: user.id,
        tier: membership.tier,
        title: postTitle || null,
        body: postText,
        sources: sources || null,
        steelman: postSteelman || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Posted!");
      setPostText("");
      setPostTitle("");
      setPostSources("");
      setPostSteelman("");
      queryClient.invalidateQueries({ queryKey: ["arena-posts"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to post"),
  });

  const getMembership = (arenaId: string) => memberships?.find((m) => m.arena_id === arenaId);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="arenas">
    <div className="space-y-6">
      {/* Header + Switzerland Rule */}
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">The Arenas</h1>
          <p className="text-muted-foreground">
            Designated spaces for the topics that matter most — and divide most.
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-foreground">The Switzerland Rule</p>
              <p className="text-sm text-muted-foreground">
                "No politics, no religion" on the main platform — except in these designated arenas.
                What happens in the arena stays in the arena. Carry it outside and you get frozen.
                These spaces exist because the conversations matter — they just need their own room.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Three Arenas */}
      <div className="grid md:grid-cols-3 gap-6">
        {arenas?.map((arena) => {
          const Icon = ARENA_ICONS[arena.category] || Shield;
          const color = ARENA_COLORS[arena.category] || "";
          const membership = getMembership(arena.id);

          return (
            <Card
              key={arena.id}
              className={`border-2 bg-gradient-to-br ${color} hover:scale-[1.02] transition-all duration-300 cursor-pointer`}
              onClick={() => {
                setSelectedArena(arena);
                if (!membership) {
                  setEnterDialogOpen(true);
                }
              }}
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{arena.icon}</div>
                <CardTitle className="text-xl">{arena.name}</CardTitle>
                <Badge variant="outline" className="mx-auto">{arena.portal_name}</Badge>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">{arena.description}</p>
                {membership && (
                  <div className="space-y-2">
                    <Badge>Tier {membership.tier}: {TIER_LABELS[membership.tier]?.name}</Badge>
                    {membership.is_frozen && (
                      <Badge className="bg-blue-500/10 text-blue-600">
                        <Snowflake className="w-3 h-3 mr-1" /> Frozen
                      </Badge>
                    )}
                    <p className="text-xs text-muted-foreground">{membership.total_posts} posts</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="justify-center">
                <Button
                  variant={membership ? "default" : "outline"}
                  className="gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedArena(arena);
                    if (!membership) {
                      setEnterDialogOpen(true);
                    }
                  }}
                >
                  {membership ? (
                    <>Enter Arena <ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <>Choose Your Tier <Lock className="w-4 h-4" /></>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Active Arena View */}
      {selectedArena && getMembership(selectedArena.id) && (
        <Tabs defaultValue="discussion" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {selectedArena.icon} {selectedArena.name}
              <Badge variant="outline">{selectedArena.portal_name}</Badge>
            </h2>
            <TabsList>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
              {selectedArena.category === "religious" && (
                <TabsTrigger value="doctrine" className="gap-1">
                  <Library className="w-3.5 h-3.5" />
                  Doctrine Explorer
                </TabsTrigger>
              )}
              <TabsTrigger value="petitions">Petitions</TabsTrigger>
              <TabsTrigger value="rules">Rules</TabsTrigger>
            </TabsList>
          </div>

          {/* DISCUSSION TAB */}
          <TabsContent value="discussion" className="space-y-4">
            {/* Post Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post in {selectedArena.name}</CardTitle>
                <CardDescription>
                  Tier {getMembership(selectedArena.id)?.tier}: {TIER_LABELS[getMembership(selectedArena.id)?.tier || 3]?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Title (optional)"
                />
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Share your perspective..."
                  rows={4}
                />
                {getMembership(selectedArena.id)?.tier === 1 && (
                  <div>
                    <label className="text-sm font-medium text-amber-600">Sources (required for Tier 1)</label>
                    <Textarea
                      value={postSources}
                      onChange={(e) => setPostSources(e.target.value)}
                      placeholder="One URL per line..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                )}
                {getMembership(selectedArena.id)?.tier === 2 && (
                  <div>
                    <label className="text-sm font-medium text-blue-600">Steelman the opposing view (required for Tier 2)</label>
                    <Textarea
                      value={postSteelman}
                      onChange={(e) => setPostSteelman(e.target.value)}
                      placeholder="The strongest version of the opposing argument is..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                )}
                <Button
                  onClick={() => createPost.mutate()}
                  disabled={!postText || createPost.isPending}
                  className="gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  Post
                </Button>
              </CardContent>
            </Card>

            {/* Posts */}
            {arenaPosts && arenaPosts.length > 0 ? (
              arenaPosts.map((post: any) => (
                <Card key={post.id}>
                  <CardContent className="py-4">
                    {post.title && <h3 className="font-bold text-foreground mb-1">{post.title}</h3>}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.body}</p>
                    {post.steelman && (
                      <div className="mt-2 p-2 rounded bg-blue-500/5 border border-blue-500/10">
                        <p className="text-xs font-medium text-blue-600 mb-1">Steelman:</p>
                        <p className="text-xs text-muted-foreground">{post.steelman}</p>
                      </div>
                    )}
                    {post.sources && post.sources.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {post.sources.map((src: string, i: number) => (
                          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" /> {src}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">Tier {post.tier}</Badge>
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                      <span>{post.upvotes || 0} upvotes</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No posts yet. Be the first to start the conversation.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* DOCTRINE EXPLORER TAB (Areopagus only) */}
          {selectedArena.category === "religious" && (
            <TabsContent value="doctrine" className="space-y-4">
              <DoctrineExplorer />
            </TabsContent>
          )}

          {/* PETITIONS TAB */}
          <TabsContent value="petitions" className="space-y-4">
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-amber-500" />
                  Petitions
                </CardTitle>
                <CardDescription>
                  Propose a petition. Get 500+ signatures + pass civility review to promote to Town Hall.
                </CardDescription>
              </CardHeader>
            </Card>

            <Button
              onClick={() => navigate(`/petitions?arena=${selectedArena.slug}`)}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              View All Petitions
            </Button>

            {petitions?.filter((p) => p.arena_id === selectedArena.id).map((petition) => (
              <Card key={petition.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{petition.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{petition.description}</p>
                    </div>
                    <Badge className={petition.status === "threshold_met" ? "bg-green-500/10 text-green-600" : ""}>
                      {petition.status}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{petition.current_signatures} signatures</span>
                      <span>{petition.signature_threshold} needed</span>
                    </div>
                    <Progress
                      value={(petition.current_signatures / petition.signature_threshold) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* RULES TAB */}
          <TabsContent value="rules" className="space-y-4">
            {/* Tier Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Moderation Tiers</CardTitle>
                <CardDescription>Choose your tier before posting. You can change tiers anytime.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(TIER_LABELS).map(([tier, config]) => {
                  const Icon = config.icon;
                  const tierNum = Number(tier);
                  const isCurrent = getMembership(selectedArena.id)?.tier === tierNum;
                  return (
                    <div key={tier} className={`flex items-start gap-3 p-3 rounded-lg ${isCurrent ? "bg-primary/5 border border-primary/20" : "bg-muted/50"}`}>
                      <Icon className={`w-5 h-5 mt-0.5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tier {tier}: {config.name}</span>
                          {isCurrent && <Badge className="text-xs">Current</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Freeze Penalties */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Snowflake className="w-5 h-5 text-blue-500" />
                  Freeze Penalties
                </CardTitle>
                <CardDescription>
                  Violations of the Switzerland Rule (carrying arena behavior to main platform).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {FREEZE_TIERS.map((f) => (
                  <div key={f.tier} className={`flex items-center justify-between p-3 rounded-lg ${f.color}`}>
                    <div>
                      <span className="font-medium capitalize">{f.tier}</span>
                      <span className="text-sm text-muted-foreground ml-2">{f.duration}</span>
                    </div>
                    <span className="text-sm">
                      {f.credits > 0 ? `${f.credits} credits to resolve early` : "Wait it out"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exit Flagstone */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Exit Flagstone</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-serif italic p-4 bg-muted/50 rounded-lg">
                  {selectedArena.exit_flagstone_text}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Gateway Dialog — Glowing Hexagonal Stepping Stones */}
      <Dialog open={enterDialogOpen} onOpenChange={setEnterDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {selectedArena?.icon} Gateway to {selectedArena?.name}
            </DialogTitle>
            <DialogDescription className="text-center">
              You are about to leave Liana Banyan proper.
            </DialogDescription>
          </DialogHeader>

          {/* Glowing Hexagonal Stepping Stones */}
          {selectedArena && (
            <div className="relative">
              {/* Hexagonal stone pattern */}
              <div className="grid grid-cols-3 gap-1 mb-4">
                {(selectedArena.entry_flagstone_text || "").split("\n").filter(Boolean).map((line, i) => (
                  <div
                    key={i}
                    className={`relative p-2 text-center text-xs ${
                      line.startsWith("⬡")
                        ? "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 text-foreground font-medium"
                        : "col-span-3 text-muted-foreground"
                    }`}
                    style={line.startsWith("⬡") ? {
                      clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
                      animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                    } : undefined}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Full flagstone text */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb,59,130,246),0.08),transparent_70%)]" />
                <pre className="text-sm text-foreground whitespace-pre-wrap font-serif relative z-10 leading-relaxed">
                  {selectedArena.entry_flagstone_text}
                </pre>
              </div>
            </div>
          )}

          {/* Tier Selection */}
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium">Choose your moderation tier:</p>
            {Object.entries(TIER_LABELS).map(([tier, config]) => {
              const Icon = config.icon;
              const tierNum = Number(tier);
              return (
                <div
                  key={tier}
                  className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all text-sm ${
                    selectedTier === tierNum
                      ? "bg-primary/10 border border-primary/30"
                      : "bg-muted/30 border border-transparent hover:border-muted"
                  }`}
                  onClick={() => setSelectedTier(tierNum)}
                >
                  <Icon className={`w-4 h-4 mt-0.5 ${selectedTier === tierNum ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="flex-1">
                    <span className="font-medium">Tier {tier}: {config.name}</span>
                    <span className="text-muted-foreground ml-2">{config.description}</span>
                  </div>
                  {selectedTier === tierNum && <Check className="w-4 h-4 text-primary" />}
                </div>
              );
            })}
          </div>

          {/* Stamp Agreement */}
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">
              By crossing this gateway, your acknowledgment is <strong>stamped</strong> and
              recorded to the <strong>IP Ledger</strong>. This is a permanent record of your
              agreement to the arena terms.
            </p>
            <p className="text-xs text-amber-600 font-medium">
              Credits, MARKS, and Joules still work beyond this gateway.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnterDialogOpen(false)}>Stay in LB</Button>
            <Button onClick={() => joinArena.mutate()} disabled={joinArena.isPending} className="gap-2">
              {joinArena.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              Stamp &amp; Cross Gateway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discord Links */}
      {arenas?.some((a) => a.discord_invite_url) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Discord Channels</CardTitle>
            <CardDescription>
              For voice debate and real-time argument, join the Discord channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {arenas.filter((a) => a.discord_invite_url).map((arena) => (
              <a
                key={arena.id}
                href={arena.discord_invite_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <span className="text-xl">{arena.icon}</span>
                <span className="font-medium">{arena.name} Discord</span>
                <ExternalLink className="w-4 h-4 ml-auto text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </PortalPageLayout>
  );
}
