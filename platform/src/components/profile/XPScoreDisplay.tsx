/**
 * XPScoreDisplay — XP = cumulative accomplishment metric (separate from reputation)
 * Total XP (box notation), bounties/products/production breakdown, avg score, Founding Status. Session 18: XPBoxDisplay.
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Star, Target, Trophy, Package, Factory } from "lucide-react";
import { XPBoxDisplay } from "@/components/reputation/XPBoxDisplay";

interface XPScoreDisplayProps {
  userId: string;
  className?: string;
}

const LEVEL_STEPS = [0, 100, 500, 1000, 2500, 5000, 10000, 25000];

export function XPScoreDisplay({ userId, className }: XPScoreDisplayProps) {
  const { data: xp, isLoading } = useQuery({
    queryKey: ["xp-score", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_scores")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading || !xp) return null;

  const total = Number(xp.total_xp ?? 0);
  const bounties = Number(xp.bounties_completed ?? 0);
  const bountyXp = Number((xp as { bounty_xp?: number }).bounty_xp ?? 0);
  const productXp = Number((xp as { product_xp?: number }).product_xp ?? 0);
  const productionXp = Number((xp as { production_xp?: number }).production_xp ?? 0);
  const productsCompleted = Number((xp as { products_completed?: number }).products_completed ?? 0);
  const productionRunsCompleted = Number((xp as { production_runs_completed?: number }).production_runs_completed ?? 0);
  const avgScore = Number(xp.average_accomplishment_score ?? 0);
  const highest = Number(xp.highest_single_xp ?? 0);
  const founding = Boolean(xp.founding_status);
  const hasTypeBreakdown = bountyXp > 0 || productXp > 0 || productionXp > 0;

  const currentLevel = LEVEL_STEPS.findIndex((s) => s > total);
  const levelIndex = currentLevel === -1 ? LEVEL_STEPS.length - 1 : Math.max(0, currentLevel - 1);
  const levelMin = LEVEL_STEPS[levelIndex];
  const levelMax = LEVEL_STEPS[levelIndex + 1] ?? levelMin + 5000;
  const progress = levelMax > levelMin ? ((total - levelMin) / (levelMax - levelMin)) * 100 : 0;

  return (
    <Card className={className} data-xray-id="xp-score-display">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            XP Score
          </span>
          {founding && (
            <Badge className="bg-amber-500/20 text-amber-700">Founding Status</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Accomplishment metric (separate from reputation)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-bold">
            <XPBoxDisplay totalXp={total} />
          </span>
          <span className="text-muted-foreground">total XP</span>
        </div>
        {hasTypeBreakdown && (
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {bountyXp > 0 && (
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                Bounty: <XPBoxDisplay totalXp={bountyXp} variant="compact" />
              </span>
            )}
            {productXp > 0 && (
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5" />
                Product: <XPBoxDisplay totalXp={productXp} variant="compact" />
              </span>
            )}
            {productionXp > 0 && (
              <span className="flex items-center gap-1">
                <Factory className="w-3.5 h-3.5" />
                Production: <XPBoxDisplay totalXp={productionXp} variant="compact" />
              </span>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span>{bounties} bounties completed</span>
          </div>
          {(productsCompleted > 0 || productionRunsCompleted > 0) && (
            <>
              {productsCompleted > 0 && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{productsCompleted} products</span>
                </div>
              )}
              {productionRunsCompleted > 0 && (
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-muted-foreground" />
                  <span>{productionRunsCompleted} production runs</span>
                </div>
              )}
            </>
          )}
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span>Avg score: {avgScore.toFixed(2)}</span>
          </div>
          {highest > 0 && (
            <div className="flex items-center gap-2 col-span-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Highest single: {highest} XP</span>
            </div>
          )}
        </div>
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Level progress</span>
            <span>{total} / {levelMax}</span>
          </div>
          <Progress value={Math.min(100, progress)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
