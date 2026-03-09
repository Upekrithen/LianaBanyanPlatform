import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Gamepad2,
  Play,
  Trophy,
  Clock,
  Users,
  Ghost,
  MapPin,
  Flag,
  Timer,
  Pause,
  CheckCircle,
  AlertCircle,
  Star,
  Crown,
} from "lucide-react";
import { BeaconIndicator } from "./BeaconDropUI";

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
  best_time_user_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  completion_time_seconds: number;
  completed_at: string;
  rank: number;
  crow_feathers_earned: number;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
}

const DIFFICULTY_CONFIG = {
  easy: { color: "bg-green-500", label: "Easy", multiplier: 1 },
  medium: { color: "bg-yellow-500", label: "Medium", multiplier: 1.5 },
  hard: { color: "bg-orange-500", label: "Hard", multiplier: 2 },
  expert: { color: "bg-red-500", label: "Expert", multiplier: 3 },
};

export function BeaconRunCard({ run }: { run: BeaconRun }) {
  const navigate = useNavigate();
  const diffConfig = DIFFICULTY_CONFIG[run.difficulty || "medium"];
  const completionRate = run.times_started > 0 
    ? Math.round((run.times_completed / run.times_started) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              {run.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {run.description}
            </CardDescription>
          </div>
          {run.is_featured && (
            <Badge className="bg-amber-500">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={diffConfig.color + " text-white"}>
            {diffConfig.label}
          </Badge>
          <Badge variant="outline">
            <MapPin className="w-3 h-3 mr-1" />
            {run.total_beacons} beacons
          </Badge>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            ~{run.estimated_minutes} min
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            <Ghost className="w-3 h-3 mr-1" />
            Ghost Mode
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-muted-foreground">Started</p>
            <p className="font-bold">{run.times_started}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completed</p>
            <p className="font-bold">{run.times_completed}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Rate</p>
            <p className="font-bold">{completionRate}%</p>
          </div>
        </div>

        {run.best_time_seconds && (
          <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-lg">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="text-sm">
              Best: {formatTime(run.best_time_seconds)}
            </span>
          </div>
        )}

        {run.ante_credits > 0 && (
          <div className="flex items-center justify-between py-2 px-3 bg-muted rounded-lg">
            <span className="text-sm">Entry Fee</span>
            <Badge>{run.ante_credits} Credits</Badge>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => navigate(`/beacon-run/${run.slug}`)}
        >
          <Play className="w-4 h-4 mr-2" />
          Start Run
        </Button>
      </CardFooter>
    </Card>
  );
}

export function BeaconRunCreator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "medium" as "easy" | "medium" | "hard" | "expert",
    estimated_minutes: 10,
    ante_credits: 0,
  });

  const { data: userBeacons } = useQuery({
    queryKey: ["user-beacons", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("beacons")
        .select("*")
        .eq("user_id", user.id)
        .eq("beacon_color", "orange")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const gameMarkerBeacons = userBeacons?.filter(
    (b) => b.orange_subtype === "game_marker"
  ) || [];

  const createRun = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (gameMarkerBeacons.length < 2) {
        throw new Error("Need at least 2 game marker beacons");
      }

      const { data, error } = await supabase
        .from("beacon_runs")
        .insert({
          creator_id: user.id,
          name: formData.name,
          description: formData.description,
          difficulty: formData.difficulty,
          beacon_ids: gameMarkerBeacons.map((b) => b.id),
          total_beacons: gameMarkerBeacons.length,
          estimated_minutes: formData.estimated_minutes,
          ante_credits: formData.ante_credits,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Beacon Run created!");
      queryClient.invalidateQueries({ queryKey: ["beacon-runs"] });
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    },
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Gamepad2 className="w-4 h-4" />
          Create Beacon Run
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Create Beacon Run
          </DialogTitle>
          <DialogDescription>
            Create a game course from your orange game marker beacons
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {gameMarkerBeacons.length < 2 ? (
            <Card className="border-amber-500 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Need more game markers</p>
                    <p className="text-sm text-muted-foreground">
                      Drop at least 2 orange beacons with "Beacon Run" type to create a course.
                      You have {gameMarkerBeacons.length} game marker{gameMarkerBeacons.length !== 1 ? "s" : ""}.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>{gameMarkerBeacons.length} game markers ready</span>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label>Run Name</Label>
                <Input
                  placeholder="e.g., Treasury Sprint"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your beacon run..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(v) => setFormData({ ...formData, difficulty: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Est. Minutes</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.estimated_minutes}
                    onChange={(e) => setFormData({ ...formData, estimated_minutes: parseInt(e.target.value) || 10 })}
                  />
                </div>
              </div>

              <div>
                <Label>Entry Fee (Credits)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.ante_credits}
                  onChange={(e) => setFormData({ ...formData, ante_credits: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 for free runs. Entry fees go to the prize pool.
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => createRun.mutate()}
                disabled={!formData.name || createRun.isPending}
              >
                {createRun.isPending ? "Creating..." : "Create Beacon Run"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BeaconRunLeaderboard({ runId }: { runId: string }) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["beacon-run-leaderboard", runId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beacon_run_leaderboard")
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq("run_id", runId)
        .order("completion_time_seconds", { ascending: true })
        .limit(50);

      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  if (!entries || entries.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No completions yet. Be the first!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                index === 0 ? "bg-amber-50 border border-amber-200" :
                index === 1 ? "bg-gray-100" :
                index === 2 ? "bg-orange-50" :
                "bg-muted/50"
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                index === 0 ? "bg-amber-500 text-white" :
                index === 1 ? "bg-gray-400 text-white" :
                index === 2 ? "bg-orange-400 text-white" :
                "bg-muted text-muted-foreground"
              }`}>
                {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {entry.profiles?.display_name || "Anonymous"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.completed_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold">
                  {formatTime(entry.completion_time_seconds)}
                </p>
                {entry.crow_feathers_earned > 0 && (
                  <Badge variant="outline" className="text-xs">
                    🪶 {entry.crow_feathers_earned}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActiveRunTracker({ 
  runId, 
  totalBeacons,
  onComplete 
}: { 
  runId: string;
  totalBeacons: number;
  onComplete?: () => void;
}) {
  const { user } = useAuth();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentBeacon, setCurrentBeacon] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const progress = (currentBeacon / totalBeacons) * 100;

  return (
    <Card className="border-2 border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Active Run
          </span>
          <span className="font-mono text-2xl">
            {formatTime(elapsedSeconds)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{currentBeacon} / {totalBeacons}</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentBeacon((c) => Math.min(c + 1, totalBeacons))}
          >
            <Flag className="w-4 h-4 mr-2" />
            Mark Reached
          </Button>
        </div>

        {currentBeacon === totalBeacons && (
          <Button className="w-full" onClick={onComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Complete Run!
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default BeaconRunCard;
