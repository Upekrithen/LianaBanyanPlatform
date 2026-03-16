/**
 * GHOST WORLD — The Pre-Member Experience
 * ========================================
 * Phase 1 of onboarding: Anonymous exploration.
 * No account required. No data collected (except hashed fingerprint).
 * Browse, explore, find Golden Keys, express interest.
 * When ready → convert to member ($5/year).
 *
 * Ghost Profile tracks: session time, pages visited, docs read,
 * golden keys found, detected skills/interests, aptitude radar.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Ghost,
  Key,
  Eye,
  BookOpen,
  Star,
  ArrowRight,
  Sparkles,
  Search,
  Map,
  Compass,
  Lock,
  Unlock,
  Trophy,
  UserPlus,
  Lightbulb,
  Calculator,
  Flame,
  Clock,
  Download
} from "lucide-react";
import { GhostLeaderboard } from "@/components/Leaderboards/GhostLeaderboard";
import { GhostCreditBalance } from "@/components/ghost/GhostCreditBalance";
import { BusinessSimulator } from "@/components/BusinessSimulator";
import { 
  getOrCreateGhostSession, 
  upgradePersistence, 
  type GhostSession,
  type PersistenceTier,
  PERSISTENCE_DURATIONS
} from "@/lib/ghostWorld";

interface GhostProfile {
  id: string;
  ghost_alias: string;
  total_session_time_minutes: number;
  pages_visited: number;
  documents_read: number;
  golden_keys_found: number;
  detected_skills: string[];
  detected_interests: string[];
  draft_pool_opted_in: boolean;
}

const EXPLORATION_MILESTONES = [
  { pages: 3, label: "Curious", icon: Eye, reward: "Ghost alias assigned" },
  { pages: 10, label: "Explorer", icon: Compass, reward: "Interest radar unlocked" },
  { pages: 25, label: "Scholar", icon: BookOpen, reward: "Skill detection active" },
  { pages: 50, label: "Seeker", icon: Search, reward: "Golden Key hints revealed" },
  { pages: 100, label: "Pathfinder", icon: Map, reward: "Draft pool eligible" },
];

export default function GhostWorld() {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const navigate = useNavigate();
  const [ghostProfile, setGhostProfile] = useState<GhostProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [goldenKeys, setGoldenKeys] = useState<any[]>([]);
  const [ghostSession, setGhostSession] = useState<GhostSession | null>(null);
  const [wasDecayed, setWasDecayed] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<any[]>([]);

  useEffect(() => {
    // If user is logged in and didn't explicitly choose to explore as a ghost, redirect to dashboard
    if (user) {
      const sessionChoice = sessionStorage.getItem('lb_landing_choice');
      if (sessionChoice !== 'explore') {
        navigate("/dashboard");
        return;
      }
    }
    loadOrCreateGhostProfile();
    loadGoldenKeys();
    
    // Initialize Ghost Session
    const ghostId = localStorage.getItem("lb_ghost_id") || "anonymous_ghost";
    const { session, decayed } = getOrCreateGhostSession(ghostId);
    setGhostSession(session);
    setWasDecayed(decayed);
  }, [user]);

  const loadOrCreateGhostProfile = async () => {
    try {
      // Check for existing ghost profile in localStorage
      const ghostId = localStorage.getItem("lb_ghost_id");

      if (ghostId) {
        const { data } = await supabase
          .from("ghost_profiles")
          .select("*")
          .eq("id", ghostId)
          .single();

        if (data) {
          setGhostProfile(data as GhostProfile);
          setIsLoading(false);
          return;
        }
      }

      // Create new ghost profile
      const fingerprint = await generateFingerprint();
      const alias = generateGhostAlias();

      const { data: newProfile, error } = await supabase
        .from("ghost_profiles")
        .insert({
          ghost_alias: alias,
          fingerprint_hash: fingerprint,
          total_session_time_minutes: 0,
          pages_visited: 0,
          documents_read: 0,
          golden_keys_found: 0,
          detected_skills: [],
          detected_interests: [],
          draft_pool_opted_in: false,
        })
        .select()
        .single();

      if (newProfile) {
        localStorage.setItem("lb_ghost_id", newProfile.id);
        setGhostProfile(newProfile as GhostProfile);
      }
    } catch (err) {
      console.error("Ghost profile error (table may not exist yet):", err);
      // Create a local-only ghost profile so the page still renders
      setGhostProfile({
        id: "local_ghost",
        ghost_alias: generateGhostAlias(),
        total_session_time_minutes: 0,
        pages_visited: 0,
        documents_read: 0,
        golden_keys_found: 0,
        detected_skills: [],
        detected_interests: [],
        draft_pool_opted_in: false,
      });
    }
    setIsLoading(false);
  };

  const loadGoldenKeys = async () => {
    const { data } = await supabase
      .from("golden_tickets")
      .select("id, puzzle, hint, prize_type, prize_description, is_active")
      .eq("is_active", true)
      .limit(5);

    setGoldenKeys(data || []);
  };

  const handleSimulationComplete = (result: any) => {
    setSavedSimulations(prev => [...prev, result]);
    setShowSimulator(false);
  };

  const handleUpgradePersistence = (tier: PersistenceTier) => {
    if (ghostSession) {
      const updated = upgradePersistence(ghostSession, tier);
      setGhostSession({...updated}); // force re-render
    }
  };

  const generateFingerprint = async (): Promise<string> => {
    const raw = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateGhostAlias = (): string => {
    const adjectives = ["Silent", "Wandering", "Curious", "Hidden", "Drifting", "Watching", "Seeking", "Quiet"];
    const nouns = ["Fox", "Owl", "Wolf", "Hawk", "Bear", "Raven", "Deer", "Hare"];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}${num}`;
  };

  const currentMilestone = EXPLORATION_MILESTONES.findIndex(
    (m) => (ghostProfile?.pages_visited || 0) < m.pages
  );
  const nextMilestone = EXPLORATION_MILESTONES[currentMilestone] || EXPLORATION_MILESTONES[EXPLORATION_MILESTONES.length - 1];
  const progress = nextMilestone
    ? ((ghostProfile?.pages_visited || 0) / nextMilestone.pages) * 100
    : 100;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Ghost className="w-12 h-12 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Ghost className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Ghost World</span>
            </div>
            <GhostCreditBalance compact />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Welcome, {ghostProfile?.ghost_alias || "Ghost"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore freely. No account required. Find Golden Keys. Discover what we're building.
            When you're ready, join for $5/year.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Ghost Profile */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ghost className="w-5 h-5" />
                  Your Ghost Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Ghost className="w-10 h-10 text-primary" />
                  </div>
                  <p className="font-bold text-foreground">{ghostProfile?.ghost_alias}</p>
                  <p className="text-xs text-muted-foreground">Anonymous Explorer</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{ghostProfile?.pages_visited || 0}</div>
                    <div className="text-xs text-muted-foreground">Pages</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{ghostProfile?.documents_read || 0}</div>
                    <div className="text-xs text-muted-foreground">Docs Read</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{ghostProfile?.golden_keys_found || 0}</div>
                    <div className="text-xs text-muted-foreground">Keys Found</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold">{ghostProfile?.total_session_time_minutes || 0}m</div>
                    <div className="text-xs text-muted-foreground">Time Spent</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Exploration Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Exploration Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {EXPLORATION_MILESTONES.map((milestone, i) => {
                  const Icon = milestone.icon;
                  const reached = (ghostProfile?.pages_visited || 0) >= milestone.pages;
                  return (
                    <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${reached ? "bg-primary/5" : "opacity-50"}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reached ? "bg-primary/20" : "bg-muted"}`}>
                        {reached ? <Unlock className="w-4 h-4 text-primary" /> : <Lock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{milestone.label}</p>
                        <p className="text-xs text-muted-foreground">{milestone.reward}</p>
                      </div>
                      <Badge variant={reached ? "default" : "outline"} className="text-xs">
                        {milestone.pages} pages
                      </Badge>
                    </div>
                  );
                })}

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Next: {nextMilestone?.label}</span>
                    <span>{ghostProfile?.pages_visited || 0}/{nextMilestone?.pages || 0}</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: What to Explore */}
          <div className="space-y-6">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Compass className="w-5 h-5 text-primary" />
                  Start Exploring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => window.open("https://the2ndsecond.com/under-the-hood/", "_blank")}>
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Under the Hood</div>
                    <div className="text-xs text-muted-foreground">105 technical documents</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => navigate("/initiatives")}>
                  <Star className="w-5 h-5 text-amber-500" />
                  <div className="text-left">
                    <div className="font-medium">The Sweet Sixteen</div>
                    <div className="text-xs text-muted-foreground">16 charitable initiatives</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => window.open("https://the2ndsecond.com/articles/", "_blank")}>
                  <Search className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Articles & Letters</div>
                    <div className="text-xs text-muted-foreground">Open letters, manifestos, vision</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => window.open("https://the2ndsecond.com/verification/crown-jewels-showcase/", "_blank")}>
                  <Trophy className="w-5 h-5 text-purple-500" />
                  <div className="text-left">
                    <div className="font-medium">Crown Jewels</div>
                    <div className="text-xs text-muted-foreground">8 patents with no prior art</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Golden Key Quest */}
            <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-500" />
                  Golden Key Quest
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Hidden throughout Cephas are Golden Keys. Find them, answer the puzzle,
                  earn rewards. Each key unlocks something new.
                </p>
                {goldenKeys.length > 0 ? (
                  <div className="space-y-2">
                    {goldenKeys.map((key) => (
                      <div key={key.id} className="p-3 rounded-lg bg-background border border-border">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-amber-500" />
                          <span className="font-medium text-sm">{key.puzzle}</span>
                        </div>
                        {key.hint && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            Hint: {key.hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">
                    Golden Keys are hidden in Cephas articles. Start reading to find them.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Business Simulator Card */}
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-500" />
                  Test a Business Idea
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Run "what-if" simulations using platform economics. See projected revenue, 
                  break-even points, and hourly rates before committing real resources.
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calculator className="w-4 h-4" />
                  Creator/Worker keeps 83.3% — Cost + 20% model
                </div>

                <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                      <Lightbulb className="w-4 h-4" />
                      Open Business Simulator
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <BusinessSimulator 
                      isGhostMode={true}
                      onSimulationComplete={handleSimulationComplete}
                    />
                  </DialogContent>
                </Dialog>

                {savedSimulations.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Your Simulations ({savedSimulations.length})
                    </p>
                    <div className="space-y-2">
                      {savedSimulations.slice(-3).map((sim, i) => (
                        <div 
                          key={i} 
                          className="p-2 rounded bg-background border border-border text-xs flex justify-between items-center"
                        >
                          <span className="font-medium">{sim.scenario.initiativeName}</span>
                          <Badge 
                            variant="outline" 
                            className={
                              sim.projections.netScore >= 0.7 
                                ? 'bg-green-100 text-green-800' 
                                : sim.projections.netScore >= 0.5 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }
                          >
                            {(sim.projections.netScore * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Join to save permanently and adopt your best ideas!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Convert to Member */}
          <div className="space-y-6">
            {/* 52-Card Treasure Map Game */}
            <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/treasure-map-game")}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="w-5 h-5 text-green-500" />
                  52-Card Treasure Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Find hidden cards across the platform. 4 suits, 13 ranks each, 52 total.
                  Each card reveals a piece of the Liana Banyan story.
                </p>
                <Button variant="outline" className="w-full gap-2">
                  <Map className="w-4 h-4" />
                  Start the Hunt
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-500" />
                  Enter the Real World
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ghost World leads here. Convert your profile and everything carries over —
                  pages visited, keys found, interests detected.
                </p>

                <div className="p-4 rounded-lg bg-background border border-border text-center">
                  <div className="text-4xl font-bold text-emerald-500">$5</div>
                  <div className="text-sm text-muted-foreground">per year</div>
                </div>

                {/* Three Real World Paths */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Three Paths Await</p>
                  <div className="grid gap-2">
                    <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                      <span className="text-lg">💼</span>
                      <div>
                        <p className="text-sm font-medium">Get a Real Job</p>
                        <p className="text-xs text-muted-foreground">Keep 83.3% of what you earn</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                      <span className="text-lg">🏰</span>
                      <div>
                        <p className="text-sm font-medium">Build a Real Business</p>
                        <p className="text-xs text-muted-foreground">Launch your Keep for $5</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 rounded bg-muted/30">
                      <span className="text-lg">🌱</span>
                      <div>
                        <p className="text-sm font-medium">Plant Real Seeds</p>
                        <p className="text-xs text-muted-foreground">Sponsor projects, fund initiatives</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-lg gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => openOnboard({ reason: "join the real world", actionLabel: "Join", membershipIncluded: true })}
                >
                  Join the Real World
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  No gatekeeping. No extraction. Just community.
                </p>
              </CardContent>
            </Card>

            {/* Ghost Session & Persistence */}
            {ghostSession && (
              <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Session Persistence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {wasDecayed && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400 mb-4">
                      <strong>Half-Life Applied:</strong> Your previous session expired. You lost half your collected items.
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-xl font-bold text-amber-500">{ghostSession.loot.goldenKeys}</div>
                      <div className="text-xs text-muted-foreground">Keys</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-xl font-bold text-orange-500">{ghostSession.loot.candles}</div>
                      <div className="text-xs text-muted-foreground">Candles</div>
                    </div>
                    <div className="p-2 bg-slate-900 rounded border border-slate-800">
                      <div className="text-xl font-bold text-slate-300">{ghostSession.loot.inventoryItems.length}</div>
                      <div className="text-xs text-muted-foreground">Feathers</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Current Tier:</span>
                      <span className="font-bold text-purple-400">
                        {ghostSession.persistenceTier === 'default' ? '12 Hours (Default)' : 
                         ghostSession.persistenceTier === '3_days' ? '3 Days' :
                         ghostSession.persistenceTier === '7_days' ? '7 Days' : '30 Days'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Install the PWA or complete quests to upgrade your rolling persistence and avoid the Half-Life decay.
                    </p>
                    
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {ghostSession.persistenceTier === 'default' && (
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleUpgradePersistence('3_days')}>
                          <Download className="w-3 h-3 mr-2" /> Install PWA (Unlock 3 Days)
                        </Button>
                      )}
                      {ghostSession.persistenceTier === '3_days' && (
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleUpgradePersistence('7_days')}>
                          <Sparkles className="w-3 h-3 mr-2" /> Find 10 Keys (Unlock 7 Days)
                        </Button>
                      )}
                      {ghostSession.persistenceTier === '7_days' && (
                        <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleUpgradePersistence('30_days')}>
                          <Trophy className="w-3 h-3 mr-2" /> Top Leaderboard (Unlock 30 Days)
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {ghostProfile?.detected_interests && ghostProfile.detected_interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ghostProfile.detected_interests.map((interest) => (
                      <Badge key={interest} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detected Skills */}
            {ghostProfile?.detected_skills && ghostProfile.detected_skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detected Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ghostProfile.detected_skills.map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Ghost Leaderboards */}
            <div className="md:col-span-3 mt-8">
              <GhostLeaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
