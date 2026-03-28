import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useManufacturingStatus, type Tier } from '@/hooks/useManufacturingStatus';
import { Award, Target, Zap, TrendingUp, Loader2 } from 'lucide-react';

const TIER_COLORS: Record<Tier, string> = {
  bounty_hunter: 'bg-zinc-700 text-zinc-200',
  contractor: 'bg-blue-600/20 text-blue-400',
  senior_contractor: 'bg-violet-600/20 text-violet-400',
  partner: 'bg-amber-600/20 text-amber-400',
  senior_partner: 'bg-emerald-600/20 text-emerald-400',
};

export function PartnershipStatusCard() {
  const status = useManufacturingStatus();

  if (status.isLoading) {
    return (
      <Card data-xray-id="partnership-status-card">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const progressPct = status.nextThreshold
    ? Math.min(100, (status.aggregateMarks / status.nextThreshold.marks) * 100)
    : 100;

  return (
    <Card data-xray-id="partnership-status-card" className="bg-slate-800/60 border-slate-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Your Manufacturing Status
          </span>
          <Badge className={TIER_COLORS[status.currentTier]}>
            {status.currentTierLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
            <span>{status.aggregateMarks.toLocaleString()} Marks</span>
            {status.nextThreshold ? (
              <span>{status.nextThreshold.marks.toLocaleString()} to {status.nextThreshold.tier}</span>
            ) : (
              <span className="text-emerald-400">Max tier reached</span>
            )}
          </div>
          <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <Zap className="w-4 h-4 mx-auto mb-1 text-amber-400" />
            <p className="text-lg font-bold">{status.multiplier}x</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Multiplier</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <Target className="w-4 h-4 mx-auto mb-1 text-blue-400" />
            <p className="text-lg font-bold">{status.bountiesCompleted}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Bounties Done</p>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-3">
            <TrendingUp className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
            <p className="text-lg font-bold">
              {status.currentTier === 'partner' || status.currentTier === 'senior_partner' ? 'Active' : '—'}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Revenue Share</p>
          </div>
        </div>

        {/* Next milestone */}
        {status.nextThreshold && (
          <div className="bg-zinc-900/40 rounded-lg p-3 border border-zinc-700/50">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Next milestone →</p>
            <p className="text-sm font-semibold text-white">{status.nextThreshold.tier}</p>
            <ul className="mt-1 space-y-0.5">
              {status.nextThreshold.benefits.map((b, i) => (
                <li key={i} className="text-[11px] text-zinc-500 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-amber-500/60" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link to="/dashboard/bounty-arena" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">View Bounties</Button>
          </Link>
          <Link to="/production" className="flex-1">
            <Button variant="outline" size="sm" className="w-full text-xs">My Contributions</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
