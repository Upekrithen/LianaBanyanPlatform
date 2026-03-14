/**
 * Fantasy Bridge — Prediction accuracy → unlock real Backed Marks allocation
 * SEC language: earned allocation authority, no investment/return
 * data-xray-id: fantasy-bridge
 */

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Lock, Unlock, ChevronRight } from "lucide-react";

const UNLOCK_ACCURACY_THRESHOLD = 70; // percent; could come from dna_lock

export function FantasyBridge() {
  const { user } = useAuth();

  const { data: bridge } = useQuery({
    queryKey: ["fantasy-bridge", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Placeholder: real implementation would read fantasy_league_scores or similar
      return {
        predictionAccuracy: 0,
        backingsUnlocked: false,
        allocationBudget: 0,
      } as { predictionAccuracy: number; backingsUnlocked: boolean; allocationBudget: number };
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <Card data-xray-id="fantasy-bridge">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5" />
            Fantasy Bridge
          </CardTitle>
          <CardDescription>Sign in to see your prediction accuracy and bridge status.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const accuracy = bridge?.predictionAccuracy ?? 0;
  const unlocked = bridge?.backingsUnlocked ?? (accuracy >= UNLOCK_ACCURACY_THRESHOLD);
  const progress = Math.min(100, Math.round((accuracy / UNLOCK_ACCURACY_THRESHOLD) * 100));

  return (
    <Card data-xray-id="fantasy-bridge">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {unlocked ? <Unlock className="h-5 w-5 text-green-600" /> : <Lock className="h-5 w-5" />}
          Fantasy Bridge
        </CardTitle>
        <CardDescription>
          Demonstrated prediction accuracy in the Fantasy League can unlock the ability to allocate real Backed Marks to real projects.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-1">Prediction accuracy</p>
          <p className="text-2xl font-bold">{accuracy}%</p>
          {!unlocked && (
            <>
              <p className="text-xs text-muted-foreground mt-1">
                Reach {UNLOCK_ACCURACY_THRESHOLD}% to unlock real Backed Marks allocation.
              </p>
              <Progress value={progress} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress >= 100 ? "Unlocked!" : `${UNLOCK_ACCURACY_THRESHOLD - accuracy}% to go`}
              </p>
            </>
          )}
        </div>
        {unlocked ? (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              You can direct Backed Marks to sponsor projects. Build more accuracy to grow your allocation budget.
            </p>
            <Button asChild variant="default" size="sm">
              <Link to="/guilds/hub">
                Go to project backing <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Play the Fantasy League and improve your prediction accuracy to graduate from theoretical scoring to real cooperative allocation.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
