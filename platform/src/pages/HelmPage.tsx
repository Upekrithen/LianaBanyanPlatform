import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Compass,
  Map,
  Gamepad2,
  Trophy,
  Ghost,
  Search,
  Filter,
  Sparkles,
  Users,
  Clock,
  MapPin,
  ArrowRight,
  Award,
} from "lucide-react";
import { ShipMedallion } from "@/components/ShipMedallion";
import { JourneyMap } from "@/components/JourneyMap";
import { BeaconDropUI } from "@/components/BeaconDropUI";
import { BeaconRunCard, BeaconRunCreator, BeaconRunLeaderboard } from "@/components/BeaconRunGame";
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface BeaconRun {
  id: string;
  creator_id: string;
  name: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  beacon_ids: string[];
  total_beacons: number;
  estimated_minutes: number;
  ante_credits: number;
  prize_pool_credits: number;
  times_started: number;
  times_completed: number;
  best_time_seconds: number | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

type TreasureProgress = {
  id: string;
  map_id: string;
  current_phase: string;
  current_level: number;
  quiz_score: number | null;
  completed_at: string | null;
  last_activity_at: string;
  phase_data: Record<string, Record<string, boolean>>;
};

const MAP_LABELS: Record<string, string> = {
  "breakfast-runner": "Breakfast Runner",
  "lunch-runner": "Lunch Runner",
  "taco-truck": "Taco Truck",
  "catering": "Catering Coordinator",
  "grocery": "Grocery Runner",
  "service": "Service Business",
  "designer": "LB Designer",
};

const PHASE_COUNT = 4;

export function HelmPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("journey");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const { data: beaconRuns, isLoading: runsLoading } = useQuery({
    queryKey: ["beacon-runs", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beacon_runs")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("times_completed", { ascending: false });

      if (error) throw error;
      return data as BeaconRun[];
    },
  });

  const { data: myRuns } = useQuery({
    queryKey: ["beacon-runs", "my", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("beacon_runs")
        .select("*")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BeaconRun[];
    },
    enabled: !!user,
  });

  const { data: treasureProgress } = useQuery({
    queryKey: ["treasure-map-progress-all", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("treasure_map_progress" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("last_activity_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TreasureProgress[];
    },
    enabled: !!user,
  });

  const filteredRuns = beaconRuns?.filter((run) => {
    const matchesSearch = run.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === "all" || run.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const featuredRuns = filteredRuns?.filter((r) => r.is_featured) || [];
  const regularRuns = filteredRuns?.filter((r) => !r.is_featured) || [];

  return (
    <PortalPageLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Compass className="w-8 h-8" />
            The Helm
          </h1>
          <p className="text-muted-foreground mt-1">
            Your navigation center — Journey maps, beacons, and Beacon Runs
          </p>
        </div>
        <div className="flex gap-2">
          <BeaconDropUI
            currentPath={window.location.pathname}
            currentPageTitle="The Helm"
          />
          {user && <BeaconRunCreator />}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
          <TabsTrigger value="journey" className="gap-2">
            <Map className="w-4 h-4" />
            Journey Map
          </TabsTrigger>
          <TabsTrigger value="runs" className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            Beacon Runs
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="gap-2">
            <Trophy className="w-4 h-4" />
            Leaderboards
          </TabsTrigger>
        </TabsList>

        {/* Journey Map Tab */}
        <TabsContent value="journey" className="mt-6">
          <JourneyMap />
        </TabsContent>

        {/* Beacon Runs Tab */}
        <TabsContent value="runs" className="mt-6 space-y-6">
          {/* Ghost Mode Notice */}
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Ghost className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-medium">Ghost Mode Required</p>
                  <p className="text-sm text-muted-foreground">
                    Beacon Runs can only be created and played in Ghost Mode.
                    Even paying members go Ghost to compete!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search beacon runs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Runs */}
          {featuredRuns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Featured Runs
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            </div>
          )}

          {/* All Runs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              All Beacon Runs
            </h3>
            {runsLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : regularRuns && regularRuns.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-medium mb-2">No Beacon Runs Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Be the first to create a Beacon Run course!
                  </p>
                  {user && <BeaconRunCreator />}
                </CardContent>
              </Card>
            )}
          </div>

          {/* My Runs */}
          {user && myRuns && myRuns.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                My Beacon Runs
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myRuns.map((run) => (
                  <BeaconRunCard key={run.id} run={run} />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Global Leaderboards
              </CardTitle>
              <CardDescription>
                "The crow remembers what the ghost forgets."
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <h4 className="font-medium">Fastest Times</h4>
                    <p className="text-sm text-muted-foreground">
                      Speed demons across all runs
                    </p>
                    <Badge className="mt-2">Coming Soon</Badge>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <h4 className="font-medium">Most Beacons</h4>
                    <p className="text-sm text-muted-foreground">
                      Prolific explorers
                    </p>
                    <Badge className="mt-2">Coming Soon</Badge>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-4 text-center">
                    <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <h4 className="font-medium">Most Completions</h4>
                    <p className="text-sm text-muted-foreground">
                      Run champions
                    </p>
                    <Badge className="mt-2">Coming Soon</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Crow Feathers Explanation */}
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🪶</div>
                <div>
                  <h3 className="font-semibold text-lg">Crow Feathers</h3>
                  <p className="text-muted-foreground">
                    Earn Crow Feathers by setting records in Ghost Mode.
                    These are permanent achievements that prove your skill
                    even when you return to normal mode.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">Speed Records</Badge>
                    <Badge variant="outline">First Completions</Badge>
                    <Badge variant="outline">Course Creation</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* My Treasure Map Progress */}
      {user && treasureProgress && treasureProgress.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-5 h-5 text-amber-500" />
              My Treasure Map Progress
            </CardTitle>
            <CardDescription>Your active journeys and knowledge scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {treasureProgress.map((tp) => {
                const phaseIdx = ["scout", "pitch", "launch", "expand"].indexOf(tp.current_phase);
                const phasesComplete = tp.completed_at ? PHASE_COUNT : Math.max(0, phaseIdx);
                const pct = Math.round((phasesComplete / PHASE_COUNT) * 100);

                return (
                  <Card
                    key={tp.id}
                    className="bg-card/50 border-border hover:border-amber-500/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/treasure-maps/${tp.map_id}`)}
                  >
                    <CardContent className="pt-4 pb-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          {MAP_LABELS[tp.map_id] || tp.map_id}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          Lvl {tp.current_level}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span className="capitalize">{tp.current_phase} phase</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                      {tp.quiz_score != null && (
                        <p className="text-xs text-muted-foreground">
                          Quiz: {tp.quiz_score}/5
                        </p>
                      )}
                      {tp.completed_at && (
                        <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Completed
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost" className="w-full text-xs gap-1">
                        Continue <ArrowRight className="w-3 h-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medallions Earned */}
      {user && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Medallions Earned
            </CardTitle>
            <CardDescription>
              Physical and digital medallions awarded for platform achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Ship Medallion — first entry, future medallions follow same pattern */}
              <Card className="bg-card/50 border-border hover:border-amber-500/30 transition-colors">
                <CardContent className="pt-6 pb-4 flex flex-col items-center text-center gap-3">
                  <ShipMedallion size="sm" earned={false} remainingLinks={13} />
                  <div>
                    <p className="text-sm font-semibold">Ship Medallion</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Complete all 13 HexIsle campaigns to earn
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    Locked
                  </Badge>
                </CardContent>
              </Card>

              {/* Placeholder slots for future medallions */}
              <Card className="bg-muted/20 border-dashed border-border">
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center text-center gap-2 min-h-[180px]">
                  <Award className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/50">Guild Medallion</p>
                  <p className="text-[10px] text-muted-foreground/30">Coming Soon</p>
                </CardContent>
              </Card>
              <Card className="bg-muted/20 border-dashed border-border">
                <CardContent className="pt-6 pb-4 flex flex-col items-center justify-center text-center gap-2 min-h-[180px]">
                  <Award className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/50">Captain Medallion</p>
                  <p className="text-[10px] text-muted-foreground/30">Coming Soon</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <Card className="mt-8 bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <Map className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Journey Maps</h4>
              <p className="text-sm text-muted-foreground">
                Drop beacons as you explore. Portal back anytime.
              </p>
            </div>
            <div>
              <Gamepad2 className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Beacon Runs</h4>
              <p className="text-sm text-muted-foreground">
                Create and compete in timed courses. Ghost Mode only.
              </p>
            </div>
            <div>
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Crow Feathers</h4>
              <p className="text-sm text-muted-foreground">
                Permanent achievements from Ghost Mode records.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalPageLayout>
  );
}

export default HelmPage;
