/**
 * TierProgressBadge — shows current referral tier + next tier preview
 * Reads from creator_referrals for the current user's completed referral count.
 * data-xray-id: tier-progress-badge
 *
 * Tier config (from dna_lock, canonical):
 *   Pioneer     1-100    10 Marks/ref
 *   Vanguard    101-500   5 Marks/ref
 *   Pathfinder  501-2000  3 Marks/ref
 *   Trailblazer 2001-10000 2 Marks/ref
 *   Guide       10001-50000 1.5 Marks/ref
 *   Ambassador  50001+    1 Mark/ref (floor)
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star } from "lucide-react";

interface TierInfo {
  name: string;
  minRef: number;
  maxRef: number | null;
  marksPerRef: number;
}

const TIERS: TierInfo[] = [
  { name: "Pioneer",     minRef: 0,     maxRef: 100,   marksPerRef: 10  },
  { name: "Vanguard",    minRef: 100,   maxRef: 500,   marksPerRef: 5   },
  { name: "Pathfinder",  minRef: 500,   maxRef: 2000,  marksPerRef: 3   },
  { name: "Trailblazer", minRef: 2000,  maxRef: 10000, marksPerRef: 2   },
  { name: "Guide",       minRef: 10000, maxRef: 50000, marksPerRef: 1.5 },
  { name: "Ambassador",  minRef: 50000, maxRef: null,  marksPerRef: 1   },
];

function getTierForCount(count: number): { current: TierInfo; next: TierInfo | null } {
  for (let i = 0; i < TIERS.length; i++) {
    const tier = TIERS[i];
    if (tier.maxRef === null || count < tier.maxRef) {
      return { current: tier, next: TIERS[i + 1] ?? null };
    }
  }
  return { current: TIERS[TIERS.length - 1], next: null };
}

interface TierProgressBadgeProps {
  compact?: boolean;
}

export function TierProgressBadge({ compact = false }: TierProgressBadgeProps) {
  const { user } = useAuth();

  const { data: vestedCount = 0, isLoading } = useQuery({
    queryKey: ["referral-vested-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("creator_referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_id", user!.id)
        .eq("handshake_vesting_state", "REWARDS_VESTED");
      if (error) throw error;
      return count ?? 0;
    },
  });

  if (!user || isLoading) return null;

  const { current, next } = getTierForCount(vestedCount);
  const progressPct = next
    ? Math.round(((vestedCount - current.minRef) / (next.minRef - current.minRef)) * 100)
    : 100;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="gap-1 cursor-default" data-xray-id="tier-progress-badge">
              <Star className="w-3 h-3" />
              {current.name}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">
              {vestedCount} successful referrals · {current.marksPerRef} Marks each
              {next ? ` · Next: ${next.name} at ${next.minRef}` : " · Maximum tier"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2" data-xray-id="tier-progress-badge">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 font-medium">
          <Star className="w-4 h-4 text-amber-500" />
          {current.name} Tier
        </div>
        <span className="text-muted-foreground text-xs">
          {current.marksPerRef} Marks / referral
        </span>
      </div>
      <Progress value={progressPct} className="h-1.5" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{vestedCount} vested referrals</span>
        {next ? (
          <span>{next.minRef - vestedCount} more → {next.name} ({next.marksPerRef} Marks)</span>
        ) : (
          <span>Maximum tier reached</span>
        )}
      </div>
    </div>
  );
}
