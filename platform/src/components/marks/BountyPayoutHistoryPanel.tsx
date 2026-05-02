/**
 * BountyPayoutHistoryPanel — KN-H8 / BP017
 * ==========================================
 * Displays a member's Bounty Marks payout history from bounty_payout_ledger.
 *
 * FORK doctrine: all payouts are Marks-class only. No fiat amounts displayed.
 * Year of Jubilee: append-only audit trail — all past payouts are permanently visible.
 * Membership-orthogonal: $5/year is not mentioned here; this is LB-currency-class content.
 *
 * Usage:
 *   <BountyPayoutHistoryPanel memberId={user.id} />
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface BountyPayoutRow {
  id: string;
  marks_earned: number;
  tier_class: string;
  tier_multiplier: number;
  completion_quality_factor: number;
  payout_at: string;
  bounty_id: string;
  canon_reference: string;
}

interface BountyPayoutHistoryPanelProps {
  memberId: string;
  className?: string;
  limit?: number;
}

const TIER_LABELS: Record<string, string> = {
  tier_a_floor_verification:  "Tier A — NEEDS (×1.0)",
  tier_b_uplift_verification: "Tier B — SUGGESTS (×1.25)",
  tier_c_founder_replication: "Tier C — FOUNDER (×1.5)",
  cross_tier_comparison:      "Cross-Tier Comparison (×2.0)",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BountyPayoutHistoryPanel({
  memberId,
  className,
  limit = 20,
}: BountyPayoutHistoryPanelProps) {
  const query = useQuery({
    queryKey: ["bounty-payout-history", memberId, limit],
    enabled: !!memberId,
    queryFn: async (): Promise<BountyPayoutRow[]> => {
      const { data, error } = await supabase
        .from("bounty_payout_ledger" as never)
        .select("id, marks_earned, tier_class, tier_multiplier, completion_quality_factor, payout_at, bounty_id, canon_reference")
        .eq("member_id", memberId)
        .order("payout_at", { ascending: false })
        .limit(limit) as Promise<{ data: BountyPayoutRow[] | null; error: Error | null }>;
      if (error) throw error;
      return data ?? [];
    },
  });

  const payouts = query.data ?? [];
  const totalMarks = payouts.reduce((sum, row) => sum + Number(row.marks_earned || 0), 0);

  if (query.isLoading) {
    return (
      <div className={cn("animate-pulse rounded-lg bg-muted/30 h-24", className)} />
    );
  }

  if (payouts.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed border-border p-6 text-center", className)}>
        <p className="text-sm text-muted-foreground">
          No Bounty Marks payouts yet.
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Complete a Bounty empirical receipt to earn Marks. Tier A starts at ×1.0.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Bounty Marks History</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Empirical-receipt completions — append-only audit trail
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-foreground tabular-nums">
            {totalMarks.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">total Marks earned</div>
        </div>
      </div>

      {/* Payout rows */}
      <ul className="divide-y divide-border">
        {payouts.map((row) => (
          <li key={row.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {/* Tier badge */}
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 whitespace-nowrap">
                  {TIER_LABELS[row.tier_class] ?? row.tier_class}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{formatDate(row.payout_at)}</span>
                <span>·</span>
                <span>Quality {Math.round(row.completion_quality_factor * 100)}%</span>
                {/* FORK doctrine: no fiat conversion shown */}
              </div>
            </div>
            <div className="ml-4 text-right flex-shrink-0">
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{Number(row.marks_earned).toLocaleString()} Marks
              </span>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer: FORK doctrine attestation */}
      <div className="px-4 py-2 border-t border-border bg-muted/10">
        <p className="text-xs text-muted-foreground/60">
          Marks are LB-currency class. One-way ratchet: value never decreases.
          Payouts are empirically anchored per Three-Tier canon BP017.
        </p>
      </div>
    </div>
  );
}

export default BountyPayoutHistoryPanel;
