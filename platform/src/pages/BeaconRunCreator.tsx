/**
 * BEACON RUN CREATOR — Ghost Mode Only
 * =====================================
 * Create Beacon Run games that can only be played in Ghost Mode.
 * Members enter Ghost Mode to walk routes and place 🟠 Game Markers.
 * 
 * "Not in normal mode. You'd have to go Ghost."
 * 
 * Features:
 * - Walk-and-drop route creation
 * - Orange beacon Game Markers
 * - Ante/prize pool settings
 * - Crow Feather leaderboard integration
 * - Join the Fray (Discord leagues)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Ghost,
  Gamepad2,
  MapPin,
  Play,
  Save,
  Send,
  Trophy,
  Zap,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Navigation,
} from "lucide-react";
import { toast } from "sonner";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { BeaconDropButton, BEACON_COLORS } from "@/components/BeaconDropButton";
import { BeaconRunCueCard } from "@/components/BeaconRunCueCard";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { LearnMoreBadge } from "@/components/cephas/LearnMoreBadge";

interface BeaconRunDraft {
  id?: string;
  name: string;
  description: string;
  beacon_ids: string[];
  estimated_minutes: number;
  ante_credits: number;
  prize_pool_credits: number;
}

export default function BeaconRunCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openOnboard } = useSeamlessOnboard();
  const queryClient = useQueryClient();
  
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [draft, setDraft] = useState<BeaconRunDraft>({
    name: "",
    description: "",
    beacon_ids: [],
    estimated_minutes: 15,
    ante_credits: 0,
    prize_pool_credits: 0,
  });

  // Get user's orange game marker beacons (dropped during this session)
  const { data: gameMarkers, refetch: refetchMarkers } = useQuery({
    queryKey: ["game-markers", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("beacons")
        .select("*")
        .eq("deposited_by", user.id)
        .eq("beacon_color", "orange")
        .eq("orange_subtype", "game_marker")
        .eq("is_archived", false)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!user && isGhostMode,
  });

  // Enter Ghost Mode (local UI state — ghost_mode_sessions table not yet created)
  const enterGhostMode = async () => {
    if (!user) return;
    setIsGhostMode(true);
    toast.success("👻 Ghost Mode activated! Walk your route and drop Game Markers.");
  };

  // Exit Ghost Mode
  const exitGhostMode = async () => {
    setIsGhostMode(false);
    setIsWalking(false);
    toast.info("Exited Ghost Mode");
  };

  // Start walking the route
  const startWalking = () => {
    setIsWalking(true);
    toast.success("Start navigating! Drop 🟠 Game Markers at each waypoint.");
  };

  // Save Beacon Run
  const saveBeaconRun = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in");
      if (!gameMarkers || gameMarkers.length < 2) {
        throw new Error("Need at least 2 Game Markers to create a Beacon Run");
      }
      if (!draft.name.trim()) {
        throw new Error("Please give your Beacon Run a name");
      }

      const beaconIds = gameMarkers.map((b: any) => b.id);
      
      const { data, error } = await supabase
        .from("beacon_runs")
        .insert({
          creator_id: user.id,
          name: draft.name,
          description: draft.description,
          beacon_ids: beaconIds,
          total_beacons: beaconIds.length,
          estimated_minutes: draft.estimated_minutes,
          ante_credits: draft.ante_credits,
          prize_pool_credits: draft.prize_pool_credits,
          requires_ghost_mode: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success("Beacon Run saved! Ready to publish.");
      setDraft((prev) => ({ ...prev, id: data.id, beacon_ids: data.beacon_ids }));
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Published state for showing Cue Card
  const [isPublished, setIsPublished] = useState(false);

  // Publish Beacon Run
  const publishBeaconRun = useMutation({
    mutationFn: async () => {
      if (!draft.id) {
        await saveBeaconRun.mutateAsync();
      }
      
      const { error } = await supabase
        .from("beacon_runs")
        .update({ published_at: new Date().toISOString() })
        .eq("id", draft.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("🎮 Beacon Run published! Share your Cue Card to earn clicks.");
      setIsPublished(true);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Handle beacon drop callback
  const handleBeaconDrop = () => {
    refetchMarkers();
  };

  if (!user) {
    return (
      <PortalPageLayout maxWidth="full" xrayId="beacon-run-creator">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout maxWidth="lg" xrayId="beacon-run-creator">
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold inline-flex items-center gap-2">Create Beacon Run <LearnMoreBadge featurePath="/beacons" variant="icon" /></h1>
            <p className="text-muted-foreground">
              Design a speedrun game. Ghost Mode only.
            </p>
          </div>
        </div>
        {isGhostMode && (
          <Badge variant="outline" className="gap-1 border-purple-500 text-purple-500">
            <Ghost className="w-4 h-4" />
            Ghost Mode Active
          </Badge>
        )}
      </div>

      {/* Ghost Mode Gate */}
      {!isGhostMode ? (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ghost className="w-6 h-6 text-purple-500" />
              Enter Ghost Mode to Create
            </CardTitle>
            <CardDescription>
              Beacon Runs can only be created and played in Ghost Mode. Even as a member,
              you must "go Ghost" to walk the route and place Game Markers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Ghost Mode Rules</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  <li>Your member equipment can be brought in (not consumed)</li>
                  <li>Crow Feathers 🪶 are earned for setting records</li>
                  <li>Half-Life decay applies to session items (not your member inventory)</li>
                  <li>Game Markers you drop become part of your Beacon Run</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              size="lg"
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
              onClick={enterGhostMode}
            >
              <Ghost className="w-5 h-5" />
              Enter Ghost Mode
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              "Not in normal mode. You'd have to go Ghost."
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Ghost Mode Active — Route Creation */}
          <Card className="border-orange-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-orange-500" />
                {isWalking ? "Walking Your Route" : "Route Setup"}
              </CardTitle>
              <CardDescription>
                {isWalking
                  ? "Navigate to each waypoint and drop a 🟠 Game Marker."
                  : "Give your Beacon Run a name, then start walking to place markers."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Beacon Run Name *</Label>
                  <Input
                    id="name"
                    value={draft.name}
                    onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="The Gauntlet of Knowledge"
                    disabled={isWalking}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={draft.description}
                    onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the challenge..."
                    rows={2}
                    disabled={isWalking}
                  />
                </div>
              </div>

              {/* Start Walking Button */}
              {!isWalking ? (
                <Button
                  className="w-full gap-2"
                  onClick={startWalking}
                  disabled={!draft.name.trim()}
                >
                  <Play className="w-4 h-4" />
                  Start Walking Route
                </Button>
              ) : (
                <>
                  {/* Walking Mode — Drop Beacons */}
                  <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">Game Markers Placed</span>
                      </div>
                      <Badge variant="outline" className="text-lg px-3">
                        {gameMarkers?.length || 0}
                      </Badge>
                    </div>

                    {/* Marker List */}
                    {gameMarkers && gameMarkers.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {gameMarkers.map((marker: any, index: number) => (
                          <div
                            key={marker.id}
                            className="flex items-center gap-2 p-2 rounded bg-background/50"
                          >
                            <span className="text-orange-500">🟠</span>
                            <span className="font-mono text-xs flex-1">
                              #{index + 1}: {marker.location_path}
                            </span>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Drop Beacon Button */}
                    <BeaconDropButton
                      isGhostMode={true}
                      beaconNumber={(gameMarkers?.length || 0) + 1}
                      onDrop={handleBeaconDrop}
                      className="w-full"
                    />

                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Navigate to your next waypoint, then drop a Game Marker.
                    </p>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Est. {draft.estimated_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{gameMarkers?.length || 0} markers</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Competition Settings */}
          {isWalking && gameMarkers && gameMarkers.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Competition Settings
                </CardTitle>
                <CardDescription>
                  Set entry fees and prizes for "Join the Fray" leagues.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ante">Entry Ante (Credits)</Label>
                    <Input
                      id="ante"
                      type="number"
                      min="0"
                      value={draft.ante_credits}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, ante_credits: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Credits required to play (0 = free)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize">Prize Pool (Credits)</Label>
                    <Input
                      id="prize"
                      type="number"
                      min="0"
                      value={draft.prize_pool_credits}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, prize_pool_credits: parseInt(e.target.value) || 0 }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Your contribution to the prize pool
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Estimated Time (minutes)</Label>
                  <Input
                    id="time"
                    type="number"
                    min="1"
                    value={draft.estimated_minutes}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, estimated_minutes: parseInt(e.target.value) || 15 }))
                    }
                  />
                </div>

                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Crow Feathers 🪶</AlertTitle>
                  <AlertDescription>
                    Players who set speed records on your Beacon Run earn Crow Feathers —
                    permanent achievements that prove their skill.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={exitGhostMode}>
              Exit Ghost Mode
            </Button>
            <div className="flex-1" />
            {gameMarkers && gameMarkers.length >= 2 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => saveBeaconRun.mutate()}
                  disabled={saveBeaconRun.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveBeaconRun.isPending ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  onClick={() => publishBeaconRun.mutate()}
                  disabled={publishBeaconRun.isPending}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {publishBeaconRun.isPending ? "Publishing..." : "Publish Beacon Run"}
                </Button>
              </>
            )}
          </div>

          {/* Minimum Markers Warning */}
          {isWalking && (!gameMarkers || gameMarkers.length < 2) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Need More Markers</AlertTitle>
              <AlertDescription>
                Drop at least 2 Game Markers to create a Beacon Run.
                Currently: {gameMarkers?.length || 0}
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Published Success — Show Cue Card */}
      {isPublished && draft.id && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Beacon Run Published!
            </CardTitle>
            <CardDescription>
              Share your Cue Card to earn clicks and unlock your Deck Card.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BeaconRunCueCard
              beaconRun={{
                id: draft.id,
                name: draft.name,
                description: draft.description,
                total_beacons: gameMarkers?.length || 0,
                estimated_minutes: draft.estimated_minutes,
                ante_credits: draft.ante_credits,
                prize_pool_credits: draft.prize_pool_credits,
                creator_id: user?.id || "",
                creator_name: user?.email?.split("@")[0],
              }}
              showShareButton={true}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/the-helm")}
              >
                Go to The Helm
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setIsPublished(false);
                  setDraft({
                    name: "",
                    description: "",
                    beacon_ids: [],
                    estimated_minutes: 15,
                    ante_credits: 0,
                    prize_pool_credits: 0,
                  });
                }}
              >
                Create Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Quote */}
      <p className="text-xs text-center text-muted-foreground pt-4">
        "The crow remembers what the ghost forgets." — Drop beacons to mark your path.
      </p>
    </div>
    </PortalPageLayout>
  );
}
