import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Clock, Award, Sparkles } from "lucide-react";

interface ShareChainIndicatorProps {
  streak: number;
  bonusPct: number;
  hoursRemaining: number;
  isAlive: boolean;
  isSustained: boolean;
  totalShares: number;
  compact?: boolean;
}

export function ShareChainIndicator({
  streak,
  bonusPct,
  hoursRemaining,
  isAlive,
  isSustained,
  totalShares,
  compact = false,
}: ShareChainIndicatorProps) {
  if (totalShares === 0 && !compact) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isSustained ? (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/40 gap-1">
            <Award className="w-3 h-3" />
            SUSTAINED 20%
          </Badge>
        ) : streak > 0 && isAlive ? (
          <Badge
            variant="outline"
            className="gap-1 text-orange-500 border-orange-500/40"
          >
            {Array.from({ length: Math.min(streak, 5) }, (_, i) => (
              <Flame key={i} className="w-3 h-3" />
            ))}
            {streak > 5 && <span className="text-xs">+{streak - 5}</span>}
            <span className="ml-1 text-xs font-mono">+{bonusPct}%</span>
          </Badge>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            Share Chain
          </h3>
          {isSustained && (
            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/40 gap-1">
              <Award className="w-3 h-3" />
              SUSTAINED
            </Badge>
          )}
        </div>

        {/* Streak fires */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(streak, 21) }, (_, i) => (
            <Flame
              key={i}
              className={`w-4 h-4 ${
                i < streak
                  ? "text-orange-500"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Bonus bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Chain Bonus</span>
            <span className="font-bold text-orange-500">+{bonusPct}%</span>
          </div>
          <Progress
            value={isSustained ? 100 : bonusPct}
            className="h-2"
          />
        </div>

        {/* Time remaining */}
        {isAlive && !isSustained && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Share within {hoursRemaining}h to keep your streak!
          </div>
        )}

        {isSustained && (
          <div className="flex items-center gap-2 text-xs text-amber-600">
            <Sparkles className="w-3 h-3" />
            Permanent 20% bonus — you earned it!
          </div>
        )}

        <div className="text-[10px] text-muted-foreground text-right">
          {totalShares} total shares
        </div>
      </CardContent>
    </Card>
  );
}

export default ShareChainIndicator;
