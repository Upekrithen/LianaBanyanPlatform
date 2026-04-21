import { useState, useEffect } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Flame,
  Sparkles,
  Navigation,
  Eye,
  Package,
  Gift,
  Lock,
  Unlock,
} from "lucide-react";

const CANDLE_CAPACITY = 10;
const BABYLON_THRESHOLD = 11.0;

interface CandleState {
  standardCandles: number;
  babylonCandles: number;
  beaconJourneyComplete: boolean;
  totalEarned: number;
  totalUsed: number;
}

const DEFAULT_CANDLE_STATE: CandleState = {
  standardCandles: 0,
  babylonCandles: 0,
  beaconJourneyComplete: false,
  totalEarned: 0,
  totalUsed: 0,
};

export function useCandleState() {
  const { user } = useAuth();

  const { data: candleState, isLoading } = useQuery({
    queryKey: ["candle-state", user?.id],
    queryFn: async () => {
      if (!user) {
        const stored = localStorage.getItem("candle_state");
        return stored ? JSON.parse(stored) : DEFAULT_CANDLE_STATE;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("candle_state")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return (data?.candle_state as CandleState) || DEFAULT_CANDLE_STATE;
    },
  });

  return { candleState: candleState || DEFAULT_CANDLE_STATE, isLoading };
}

export function CandleDisplay({ compact = false }: { compact?: boolean }) {
  const { candleState } = useCandleState();
  const hasBabylon = candleState.standardCandles >= BABYLON_THRESHOLD;
  const babylonCount = hasBabylon ? Math.floor((candleState.standardCandles - BABYLON_THRESHOLD + 1) / CANDLE_CAPACITY) : 0;
  const standardDisplay = candleState.standardCandles - (babylonCount * CANDLE_CAPACITY);

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-mono">{standardDisplay.toFixed(1)}</span>
            {babylonCount > 0 && (
              <Badge variant="outline" className="text-purple-600 border-purple-400 text-xs">
                +{babylonCount}✨
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <CandleSatchelContent />
        </PopoverContent>
      </Popover>
    );
  }

  return <CandleSatchelContent />;
}

function CandleSatchelContent() {
  const { candleState } = useCandleState();
  const hasBabylon = candleState.standardCandles >= BABYLON_THRESHOLD;
  const babylonCount = hasBabylon ? Math.floor((candleState.standardCandles - BABYLON_THRESHOLD + 1) / CANDLE_CAPACITY) : 0;
  const standardDisplay = candleState.standardCandles - (babylonCount * CANDLE_CAPACITY);

  const fullCandles = Math.floor(standardDisplay);
  const partialCandle = standardDisplay - fullCandles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Package className="w-4 h-4" />
          Your Satchel
        </h4>
      </div>

      {/* Standard Candles */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Standard Candles
          </span>
          <span className="font-mono font-bold">{standardDisplay.toFixed(1)}</span>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: fullCandles }).map((_, i) => (
            <div key={i} className="w-4 h-8 bg-amber-400 rounded-t-sm border border-amber-500 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            </div>
          ))}
          {partialCandle > 0 && (
            <div className="w-4 h-8 bg-muted rounded-t-sm border border-muted-foreground/30 relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-amber-400"
                style={{ height: `${partialCandle * 100}%` }}
              />
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Each candle has 10 uses (0.1 per short jump)
        </p>
      </div>

      {/* Babylon Candles */}
      {hasBabylon ? (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Black Babylon Candles
            </span>
            <span className="font-mono font-bold text-purple-600">{babylonCount}</span>
          </div>

          <div className="flex gap-1">
            {Array.from({ length: babylonCount }).map((_, i) => (
              <div key={i} className="w-4 h-8 bg-purple-900 rounded-t-sm border border-purple-500 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <Sparkles className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 text-purple-300" />
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Travel anywhere — even places you can see but can't reach
          </p>
        </div>
      ) : (
        <div className="pt-2 border-t">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span className="text-sm">Black Babylon Candle</span>
          </div>
          <Progress
            value={(candleState.standardCandles / BABYLON_THRESHOLD) * 100}
            className="h-2 mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Collect {BABYLON_THRESHOLD.toFixed(1)} candles to unlock ({(BABYLON_THRESHOLD - candleState.standardCandles).toFixed(1)} more needed)
          </p>
        </div>
      )}

      {/* Usage Info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span>Standard jump:</span>
            <span className="font-mono">0.1 candle</span>
          </div>
          <div className="flex justify-between">
            <span>Babylon look:</span>
            <span className="font-mono">0.2 candle</span>
          </div>
          <div className="flex justify-between">
            <span>Babylon return:</span>
            <span className="font-mono">0.3 candle</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CandleNavigator({
  destination,
  destinationName,
  requiresBabylon = false,
  onNavigate
}: {
  destination: string;
  destinationName: string;
  requiresBabylon?: boolean;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { candleState } = useCandleState();

  const hasBabylon = candleState.standardCandles >= BABYLON_THRESHOLD;
  const canUseStandard = candleState.standardCandles >= 0.1 && !requiresBabylon;
  const canUseBabylon = hasBabylon && candleState.standardCandles >= (requiresBabylon ? 0.2 : 0.1);

  const useCandle = useMutation({
    mutationFn: async (useBabylon: boolean) => {
      const cost = useBabylon ? 0.2 : 0.1;
      const newState = {
        ...candleState,
        standardCandles: candleState.standardCandles - cost,
        totalUsed: candleState.totalUsed + cost,
      };

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ candle_state: newState })
          .eq("id", user.id);
        if (error) throw error;
      } else {
        localStorage.setItem("candle_state", JSON.stringify(newState));
      }

      return newState;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candle-state"] });
      toast.success(`Traveling to ${destinationName}...`);
      onNavigate?.();
      navigate(destination);
    },
    onError: (error) => {
      toast.error(`Failed to use candle: ${error.message}`);
    },
  });

  if (requiresBabylon && !hasBabylon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Lock className="w-4 h-4" />
            Requires Babylon Candle
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Collect {BABYLON_THRESHOLD} candles to unlock Black Babylon Candles</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!canUseStandard && !canUseBabylon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm" disabled className="gap-2">
            <Flame className="w-4 h-4 text-muted-foreground" />
            No Candles
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Complete the Will-o'-the-Wisp journey to earn your first candle</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => useCandle.mutate(requiresBabylon)}
      disabled={useCandle.isPending}
      className="gap-2"
    >
      {requiresBabylon ? (
        <Sparkles className="w-4 h-4 text-purple-500" />
      ) : (
        <Flame className="w-4 h-4 text-amber-500" />
      )}
      {useCandle.isPending ? "Traveling..." : `Go to ${destinationName}`}
    </Button>
  );
}

export function CandleReward({
  amount = 1.0,
  reason,
  onClaim
}: {
  amount?: number;
  reason: string;
  onClaim?: () => void;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { candleState } = useCandleState();
  const [claimed, setClaimed] = useState(false);

  const claimCandle = useMutation({
    mutationFn: async () => {
      const newState = {
        ...candleState,
        standardCandles: candleState.standardCandles + amount,
        totalEarned: candleState.totalEarned + amount,
      };

      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({ candle_state: newState })
          .eq("id", user.id);
        if (error) throw error;
      } else {
        localStorage.setItem("candle_state", JSON.stringify(newState));
      }

      return newState;
    },
    onSuccess: (newState) => {
      setClaimed(true);
      queryClient.invalidateQueries({ queryKey: ["candle-state"] });

      const wasUnderThreshold = candleState.standardCandles < BABYLON_THRESHOLD;
      const nowOverThreshold = newState.standardCandles >= BABYLON_THRESHOLD;

      if (wasUnderThreshold && nowOverThreshold) {
        toast.success("🖤✨ Black Babylon Candle Unlocked!", {
          description: "You can now travel anywhere — even places you can see but can't reach!",
        });
      } else {
        toast.success(`+${amount} Candle${amount !== 1 ? "s" : ""} collected!`, {
          description: reason,
        });
      }

      onClaim?.();
    },
    onError: (error) => {
      toast.error(`Failed to claim candle: ${error.message}`);
    },
  });

  if (claimed) {
    return (
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-4 text-center">
          <Flame className="w-8 h-8 mx-auto mb-2 text-amber-500" />
          <p className="font-medium">Candle Collected!</p>
          <p className="text-sm text-muted-foreground">{reason}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 animate-pulse">
      <CardContent className="pt-4 text-center">
        <div className="relative inline-block mb-2">
          <div className="w-12 h-16 bg-amber-400 rounded-t-sm border-2 border-amber-500 mx-auto relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-orange-500 rounded-full animate-bounce" />
          </div>
          <Gift className="absolute -top-2 -right-2 w-6 h-6 text-amber-600" />
        </div>
        <p className="font-semibold text-amber-800">Candle Reward!</p>
        <p className="text-sm text-amber-700 mb-3">{reason}</p>
        <Button
          onClick={() => claimCandle.mutate()}
          disabled={claimCandle.isPending}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Flame className="w-4 h-4 mr-2" />
          {claimCandle.isPending ? "Collecting..." : `Collect +${amount} Candle`}
        </Button>
      </CardContent>
    </Card>
  );
}

export default CandleDisplay;
