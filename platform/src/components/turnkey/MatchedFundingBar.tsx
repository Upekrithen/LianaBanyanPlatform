import { Progress } from '@/components/ui/progress';

interface MatchedFundingBarProps {
  creatorBacking: number;
  communityMatched: number;
  matchingCap: number;
  compact?: boolean;
}

export function MatchedFundingBar({ creatorBacking, communityMatched, matchingCap, compact }: MatchedFundingBarProps) {
  const cap = matchingCap || creatorBacking;
  const creatorPct = cap > 0 ? Math.min((creatorBacking / cap) * 100, 100) : 0;
  const communityPct = cap > 0 ? Math.min((communityMatched / cap) * 100, 100) : 0;

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Matched Funding</span>
          <span>{communityMatched.toLocaleString()} / {cap.toLocaleString()} Credits</span>
        </div>
        <div className="flex gap-1 h-2">
          <div className="flex-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${creatorPct}%` }} />
          </div>
          <div className="flex-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${communityPct}%` }} />
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Creator</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Community</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-card">
      <h4 className="font-semibold text-sm">Matched Funding</h4>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-emerald-600 font-medium">Creator's Backing</span>
            <span>{creatorBacking.toLocaleString()} Credits ✓</span>
          </div>
          <Progress value={creatorPct} className="h-3 [&>div]:bg-emerald-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-blue-600 font-medium">Community Matched</span>
            <span>{communityMatched.toLocaleString()} / {cap.toLocaleString()} Credits</span>
          </div>
          <Progress value={communityPct} className="h-3 [&>div]:bg-blue-500" />
        </div>
      </div>
    </div>
  );
}
