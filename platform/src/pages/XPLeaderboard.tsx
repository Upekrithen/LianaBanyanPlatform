import { useState, useMemo, useEffect } from 'react';
import { Trophy, ChevronDown, ChevronUp, Star, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XPBoxDisplay } from '@/components/XPBoxDisplay';
import { SAMPLE_LEADERBOARD, fetchLeaderboard, type LeaderboardEntry } from '@/lib/xpService';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { PortalPageLayout } from '@/components/PortalPageLayout';

type CategoryFilter = 'all' | 'creators' | 'stewards' | 'backers';
type TimeFilter = 'all_time' | 'this_month' | 'this_week';

const CATEGORY_MAP: Record<string, CategoryFilter> = {
  creator: 'creators',
  steward: 'stewards',
  backer: 'backers',
};

export default function XPLeaderboard() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [_timeFilter, setTimeFilter] = useState<TimeFilter>('all_time');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);

  useEffect(() => {
    fetchLeaderboard().then(setLeaderboard);
  }, []);

  const filteredData = useMemo(() => {
    if (categoryFilter === 'all') return leaderboard;
    return leaderboard.filter(
      (entry) => CATEGORY_MAP[entry.category] === categoryFilter
    );
  }, [categoryFilter, leaderboard]);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="xp-leaderboard">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-yellow-900/20 border border-yellow-700/30">
            <Trophy className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-100">
              XP Leaderboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Earned, Not Given
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Tabs
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="stewards">Stewards</TabsTrigger>
            <TabsTrigger value="backers">Backers</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs
          value={_timeFilter}
          onValueChange={(v) => setTimeFilter(v as TimeFilter)}
          className="w-full sm:w-auto"
        >
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="all_time">All Time</TabsTrigger>
            <TabsTrigger value="this_month">This Month</TabsTrigger>
            <TabsTrigger value="this_week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-950/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="w-16 text-center text-slate-400">#</TableHead>
              <TableHead className="text-slate-400">Member</TableHead>
              <TableHead className="text-slate-400">XP</TableHead>
              <TableHead className="text-slate-400 hidden sm:table-cell">Tier</TableHead>
              <TableHead className="text-slate-400 hidden md:table-cell">Top Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((entry, index) => (
              <LeaderboardRow key={entry.rank} entry={entry} index={index} />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* How XP Works */}
      <div className="mt-8">
        <Collapsible open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-slate-300 transition-colors group">
            <Info className="h-4 w-4" />
            <span className="font-medium">How XP Works</span>
            {howItWorksOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormulaCard
                  title="Bounty XP"
                  formula="Accomplishment Score x Bounty Points"
                  example="Score 3.5 on a 40-point bounty = 140 XP"
                />
                <FormulaCard
                  title="Product Creator XP"
                  formula="Price x Preorder Volume x (Quality / 5.0)"
                  example="$25 x 40 preorders x 0.9 quality = 900 XP"
                />
                <FormulaCard
                  title="Production Labor XP"
                  formula="Points/Unit x Units Stamped x Quality Fraction"
                  example="5 pts x 60 units x 0.95 = 285 XP"
                />
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">*</span>
                  <span>
                    <strong className="text-slate-300">STAMP Required</strong> — Client or bounty sponsor must formally verify quality score before XP is awarded. You cannot self-rate.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">*</span>
                  <span>
                    <strong className="text-slate-300">XP Never Decreases</strong> — Aggregate and cumulative. Your XP only goes up.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">*</span>
                  <span>
                    <strong className="text-slate-300">Starting Reputation</strong> — All members start at 100. XP adds on top as earned experience.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">*</span>
                  <span>
                    <strong className="text-slate-300">Founding Status</strong> — First onboarding cohort gets a permanent badge, and their feedback becomes pathway intelligence.
                  </span>
                </div>
              </div>

              {/* Box Notation Legend */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Box Notation</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Every 10,000 XP earns one filled box. The remainder displays as a number.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="text-amber-700 font-mono">Bronze</span> — 0-9,999
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-slate-300 font-mono">Silver</span> — 10K-99K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-yellow-400 font-mono">Gold</span> — 100K-999K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-blue-300 font-mono">Platinum</span> — 1M-9.9M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-cyan-300 font-mono">Diamond</span> — 10M-99M
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-slate-100 font-mono">Obsidian</span> — 100M+
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </PortalPageLayout>
  );
}

function LeaderboardRow({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const isTopThree = entry.rank <= 3;
  const rankIcons: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <TableRow
      className={cn(
        'border-slate-800/50 transition-colors',
        index % 2 === 0 ? 'bg-slate-950/30' : 'bg-slate-900/20',
        isTopThree && 'bg-yellow-950/10'
      )}
    >
      <TableCell className="text-center font-mono">
        {isTopThree ? (
          <span className="text-lg">{rankIcons[entry.rank]}</span>
        ) : (
          <span className="text-muted-foreground">{entry.rank}</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className={cn('font-medium', isTopThree ? 'text-slate-100' : 'text-slate-300')}>
            {entry.name}
          </span>
          {entry.foundingStatus && (
            <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <XPBoxDisplay xp={entry.xp} size="sm" />
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <Badge
          variant="outline"
          className={cn(
            'font-mono text-xs',
            entry.tier.textColor,
            entry.tier.bgColor,
            entry.tier.borderColor
          )}
        >
          {entry.tier.name}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-xs truncate">
        {entry.topAchievement}
      </TableCell>
    </TableRow>
  );
}

function FormulaCard({
  title,
  formula,
  example,
}: {
  title: string;
  formula: string;
  example: string;
}) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/50 p-4">
      <h4 className="text-sm font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs font-mono text-yellow-400/80 mb-2">{formula}</p>
      <p className="text-xs text-muted-foreground">{example}</p>
    </div>
  );
}
