import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Flame,
  Sparkles,
  Heart,
  Key,
  Users,
  GitFork,
  Gift,
  ChevronRight,
  X,
  Play,
  CheckCircle,
  Footprints,
  Timer,
  Trophy
} from "lucide-react";
import { CandleReward } from "./CandleSystem";
import { getOrCreateGhostSession, addCandle } from "@/lib/ghostWorld";
import "./WillOWisp.css";

interface WispBeacon {
  id: number;
  title: string;
  message: string;
  icon: React.ElementType;
  destination?: string;
  highlight?: string;
}

const WISP_JOURNEY: WispBeacon[] = [
  {
    id: 1,
    title: "The Landing",
    message: "Welcome, traveler. I am the Wisp. Follow me — I'll show you the paths through this forest.",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "The Heart",
    message: "This is the Heart of the platform. 'Help Each Other, Help Ourselves.' Click it to see the ways you can GET and GIVE.",
    icon: Heart,
    destination: "/",
    highlight: "HEOHO",
  },
  {
    id: 3,
    title: "The Golden Key",
    message: "The Golden Key opens everything. $5 a year. Cost + 20%. You keep 83.3% of what you earn.",
    icon: Key,
    destination: "/membership",
    highlight: "golden-key",
  },
  {
    id: 4,
    title: "The Explainer",
    message: "Not charity TO the people — infrastructure BY the people. Member-owned. Community-governed.",
    icon: Users,
    destination: "/about",
    highlight: "explainer",
  },
  {
    id: 5,
    title: "Choose Your Path",
    message: "Three doors. Get a Job. Build a Business. Plant Seeds. Each leads somewhere real.",
    icon: GitFork,
    destination: "/start",
    highlight: "three-paths",
  },
  {
    id: 6,
    title: "Your First Candle",
    message: "You've arrived. Take this candle — your first of many. It will light short paths for you.",
    icon: Gift,
  },
];

interface WispState {
  started: boolean;
  currentBeacon: number;
  completed: boolean;
  candleClaimed: boolean;
}

const DEFAULT_WISP_STATE: WispState = {
  started: false,
  currentBeacon: 0,
  completed: false,
  candleClaimed: false,
};

export function useWispState() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["wisp-state", user?.id],
    queryFn: async () => {
      if (!user) {
        const stored = localStorage.getItem("wisp_state");
        return stored ? JSON.parse(stored) : DEFAULT_WISP_STATE;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("wisp_journey_state")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return (data?.wisp_journey_state as WispState) || DEFAULT_WISP_STATE;
    },
  });
}

export function WillOWispTrigger() {
  const { data: wispState } = useWispState();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (wispState?.completed) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogOpen(true)}
        className="gap-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
        {wispState?.started ? "Continue Journey" : "Start Tour"}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <WillOWispJourney onClose={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function WillOWispJourney({ onClose, onComplete }: { onClose?: () => void; onComplete?: () => void }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: wispState, isLoading } = useWispState();
  const [currentBeacon, setCurrentBeacon] = useState(0);
  const [showCandle, setShowCandle] = useState(false);
  const [chaseMode, setChaseMode] = useState(false);
  const [chaseTimeLeft, setChaseTimeLeft] = useState(60); // 60 seconds to complete
  const [chaseScore, setChaseScore] = useState(0);

  useEffect(() => {
    if (wispState) {
      setCurrentBeacon(wispState.currentBeacon || 0);
    }
  }, [wispState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (chaseMode && chaseTimeLeft > 0 && !showCandle) {
      timer = setInterval(() => {
        setChaseTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (chaseTimeLeft === 0 && chaseMode) {
      // Time's up!
      setChaseMode(false);
      toast.error("The Wisp got away! Try again.");
      setCurrentBeacon(0);
    }
    return () => clearInterval(timer);
  }, [chaseMode, chaseTimeLeft, showCandle]);

  const updateState = useMutation({
    mutationFn: async (newState: Partial<WispState>) => {
      const fullState = { ...wispState, ...newState };

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ wisp_journey_state: fullState })
          .eq("id", user.id);
        if (error) throw error;
      } else {
        localStorage.setItem("wisp_state", JSON.stringify(fullState));
      }

      return fullState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wisp-state"] });
    },
  });

  const handleStart = () => {
    updateState.mutate({ started: true, currentBeacon: 1 });
    setCurrentBeacon(1);
    setChaseMode(false);
  };

  const handleStartChase = () => {
    updateState.mutate({ started: true, currentBeacon: 1 });
    setCurrentBeacon(1);
    setChaseMode(true);
    setChaseTimeLeft(60);
    setChaseScore(0);
    toast.success("Chase started! Follow the Wisp quickly!");
  };

  const handleNext = () => {
    const nextBeacon = currentBeacon + 1;
    
    if (chaseMode) {
      setChaseScore(prev => prev + 10);
    }
    
    if (nextBeacon > WISP_JOURNEY.length) {
      setShowCandle(true);
      if (chaseMode) {
        setChaseScore(prev => prev + 50); // Bonus for finishing
      }
      updateState.mutate({ completed: true, currentBeacon: WISP_JOURNEY.length });
    } else {
      setCurrentBeacon(nextBeacon);
      updateState.mutate({ currentBeacon: nextBeacon });
    }
  };

  const handleCandleClaimed = () => {
    updateState.mutate({ candleClaimed: true });
    
    // Add candle to Ghost Session if they are a ghost
    if (!user) {
      const ghostId = localStorage.getItem("lb_ghost_id") || "anonymous_ghost";
      const { session } = getOrCreateGhostSession(ghostId);
      addCandle(session, 1);
    }
    
    toast.success("Journey complete! Your candle awaits in your satchel.");
    onComplete?.();
    onClose?.();
  };

  const handleExit = () => {
    updateState.mutate({ currentBeacon });
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Sparkles className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (showCandle || wispState?.completed) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cyan-600">
            <Sparkles className="w-5 h-5" />
            Journey Complete!
          </DialogTitle>
          <DialogDescription>
            You've followed the Wisp through the forest. Here is your reward.
          </DialogDescription>
        </DialogHeader>

        {!wispState?.candleClaimed ? (
          <div className="space-y-4">
            {chaseMode && (
              <div className="bg-cyan-900 text-white p-4 rounded-lg text-center">
                <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <h4 className="font-bold text-lg">Chase Completed!</h4>
                <p className="text-cyan-200">Final Score: {chaseScore} pts</p>
                <p className="text-sm text-cyan-300 mt-1">Time Remaining: {chaseTimeLeft}s</p>
              </div>
            )}
            <CandleReward
              amount={1.0}
              reason={chaseMode ? "Completed the Will-o'-the-Wisp Chase!" : "Completed the Will-o'-the-Wisp journey"}
              onClaim={handleCandleClaimed}
            />
          </div>
        ) : (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-4 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p className="font-medium text-green-800">Candle Already Claimed!</p>
              <p className="text-sm text-green-700">
                Your candle is in your satchel, ready to light your path.
              </p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (currentBeacon === 0) {
    return (
      <div className="space-y-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-500" />
            Will-o'-the-Wisp
          </DialogTitle>
          <DialogDescription>
            A guided tour through the Liana Banyan platform
          </DialogDescription>
        </DialogHeader>

        <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
          <CardContent className="pt-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-16 h-16 rounded-full bg-cyan-400/30 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-cyan-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-300 rounded-full animate-ping" />
            </div>
            
            <h3 className="text-lg font-semibold text-cyan-800 mb-2">
              Follow the Wisp
            </h3>
            <p className="text-cyan-700 mb-4">
              I'll guide you through the key parts of the platform. 
              At the end, you'll receive your first candle.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-sm text-cyan-600 mb-4">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Earn 1 Candle upon completion</span>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={handleStart} className="bg-cyan-500 hover:bg-cyan-600">
                <Footprints className="w-4 h-4 mr-2" />
                Leisurely Tour
              </Button>
              <Button onClick={handleStartChase} variant="outline" className="border-cyan-500 text-cyan-600 hover:bg-cyan-50">
                <Timer className="w-4 h-4 mr-2" />
                Chase Mode (Timed)
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          You can exit anytime and continue later
        </p>
      </div>
    );
  }

  const beacon = WISP_JOURNEY[currentBeacon - 1];
  const Icon = beacon.icon;
  const progress = (currentBeacon / WISP_JOURNEY.length) * 100;

  return (
    <div className="space-y-4 relative">
      {chaseMode && (
        <div className="absolute -top-12 left-0 right-0 flex justify-between items-center bg-cyan-900 text-white px-4 py-2 rounded-lg shadow-lg z-10 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${chaseTimeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`} />
            <span className={`font-mono font-bold text-lg ${chaseTimeLeft <= 10 ? 'text-red-400' : ''}`}>
              00:{chaseTimeLeft.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-mono font-bold text-lg">{chaseScore} pts</span>
          </div>
        </div>
      )}
      
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2 text-cyan-600">
            <Sparkles className="w-5 h-5" />
            Beacon {currentBeacon} of {WISP_JOURNEY.length}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={handleExit}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </DialogHeader>

      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cyan-400/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-cyan-600" />
            </div>
            <CardTitle className="text-cyan-800">{beacon.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white/50 rounded-lg p-4 mb-4">
            <p className="text-cyan-700 italic">"{beacon.message}"</p>
          </div>

          {beacon.destination && (
            <Badge variant="outline" className="mb-4">
              Destination: {beacon.destination}
            </Badge>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExit}
              className="flex-1"
            >
              Exit & Save
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600"
            >
              {currentBeacon === WISP_JOURNEY.length ? (
                <>
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Candle
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Beacon indicators */}
      <div className="flex justify-center gap-1">
        {WISP_JOURNEY.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i + 1 < currentBeacon
                ? "bg-cyan-500"
                : i + 1 === currentBeacon
                ? "bg-cyan-400 animate-pulse"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function WillOWispMirror() {
  const { data: wispState } = useWispState();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <button
        onClick={() => setDialogOpen(true)}
        className="relative group"
      >
        <div className="w-32 h-48 bg-gradient-to-b from-cyan-200 to-cyan-400 rounded-t-full border-4 border-cyan-600 overflow-hidden transition-all group-hover:shadow-lg group-hover:shadow-cyan-300/50">
          <div className="absolute inset-2 bg-gradient-to-b from-cyan-100/50 to-transparent rounded-t-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-cyan-600 animate-pulse" />
          </div>
          {wispState?.completed && !wispState?.candleClaimed && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="w-6 h-8 bg-amber-400 rounded-t-sm border border-amber-500 animate-bounce">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full" />
              </div>
            </div>
          )}
        </div>
        <div className="text-center mt-2 text-sm font-medium text-cyan-700">
          Will-o'-the-Wisp
        </div>
        {!wispState?.started && (
          <Badge className="absolute -top-2 -right-2 bg-cyan-500">
            Start Here
          </Badge>
        )}
      </button>

      <DialogContent className="sm:max-w-lg">
        <WillOWispJourney onClose={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

export function WillOWisp({
  isActive,
  onComplete,
  onExit,
}: {
  isActive: boolean;
  onComplete?: () => void;
  onExit?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(isActive);

  useEffect(() => {
    setDialogOpen(isActive);
  }, [isActive]);

  const handleClose = () => {
    setDialogOpen(false);
    onExit?.();
  };

  const handleComplete = () => {
    setDialogOpen(false);
    onComplete?.();
  };

  if (!isActive && !dialogOpen) return null;

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-lg">
        <WillOWispJourney 
          onClose={handleClose}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
}

export default WillOWispJourney;
