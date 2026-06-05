import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Rocket, ArrowUpDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LaunchConditionCard, type LaunchCondition } from '@/components/LaunchConditionOverlay';
import { PortalPageLayout } from '@/components/PortalPageLayout';

interface InitiativeData {
  slug: string;
  name: string;
  number: number;
  conditions: LaunchCondition[];
  avg: number;
}

const INITIATIVE_META: Record<string, { name: string; number: number; route: string }> = {
  'hexisle':              { name: 'HexIsle', number: 1, route: '/hexisle' },
  'lets-make-bread':      { name: "Let's Make Bread", number: 2, route: '/initiatives/lets-make-bread' },
  'jukebox':              { name: 'JukeBox', number: 3, route: '/initiatives/jukebox' },
  'lets-go-shopping':     { name: "Let's Go Shopping", number: 4, route: '/initiatives/lets-go-shopping' },
  'household-concierge':  { name: 'Household Concierge', number: 5, route: '/initiatives/household-concierge' },
  'vsl':                  { name: 'Voucher Short Loans', number: 6, route: '/initiatives/vsl' },
  'msa':                  { name: 'Medical Savings Accounts', number: 7, route: '/initiatives/msa' },
  'didasko':              { name: 'Didasko', number: 8, route: '/initiatives/didasko' },
  'lets-make-dinner':     { name: "Let's Make Dinner", number: 9, route: '/initiatives/lets-make-dinner' },
  'harper-guild':         { name: 'Harper Guild', number: 10, route: '/initiatives/harper-guild' },
  'coverage-minutes':     { name: 'Coverage Minutes', number: 11, route: '/initiatives/coverage-minutes' },
  'star-chamber':         { name: 'Star Chamber', number: 12, route: '/initiatives/star-chamber' },
  'defense-klaus':        { name: 'Defense Klaus', number: 13, route: '/initiatives/defense-klaus' },
  'family-table':         { name: 'The Family Table', number: 14, route: '/initiatives/family-table' },
  'power-to-the-people':  { name: 'Power to the People', number: 15, route: '/initiatives/power-to-the-people' },
  'brass-tacks':          { name: 'Brass Tacks', number: 16, route: '/initiatives/brass-tacks' },
};

function avgCompletion(conditions: LaunchCondition[]): number {
  if (!conditions.length) return 0;
  const sum = conditions.reduce((a, c) => a + Math.min(100, (c.current / c.target) * 100), 0);
  return Math.round(sum / conditions.length);
}

export default function LaunchTracker() {
  const [initiatives, setInitiatives] = useState<InitiativeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'closest' | 'number'>('closest');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ready' | 'progress' | 'early'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('launch_conditions')
          .select('*')
          .order('initiative_slug')
          .order('condition_type');

        if (cancelled || error || !data) {
          if (!cancelled) setLoading(false);
          return;
        }

        const grouped: Record<string, LaunchCondition[]> = {};
        for (const row of data) {
          const slug = row.initiative_slug;
          if (!grouped[slug]) grouped[slug] = [];
          grouped[slug].push({
            label: row.label,
            current: Number(row.current_value),
            target: Number(row.target_value),
            unit: row.unit,
            conditionType: row.condition_type,
          });
        }

        const result: InitiativeData[] = Object.entries(grouped).map(([slug, conds]) => {
          const meta = INITIATIVE_META[slug] || { name: slug, number: 99, route: '/' };
          return {
            slug,
            name: meta.name,
            number: meta.number,
            conditions: conds,
            avg: avgCompletion(conds),
          };
        });
        if (!cancelled) setInitiatives(result);
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sorted = useMemo(() => {
    let list = [...initiatives];
    if (filterStatus === 'ready') list = list.filter(i => i.avg >= 100);
    else if (filterStatus === 'progress') list = list.filter(i => i.avg >= 50 && i.avg < 100);
    else if (filterStatus === 'early') list = list.filter(i => i.avg < 50);

    if (sortBy === 'closest') list.sort((a, b) => b.avg - a.avg);
    else list.sort((a, b) => a.number - b.number);
    return list;
  }, [initiatives, sortBy, filterStatus]);

  const totalAvg = initiatives.length
    ? Math.round(initiatives.reduce((a, i) => a + i.avg, 0) / initiatives.length)
    : 0;
  const readyCount = initiatives.filter(i => i.avg >= 100).length;
  const progressCount = initiatives.filter(i => i.avg >= 50 && i.avg < 100).length;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="launch-tracker-page">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-medium mb-4">
            <Rocket className="h-4 w-4" />
            This is what we're building together
          </div>
          <h1 className="text-4xl font-extrabold text-foreground dark:text-white tracking-tight">
            Initiative Launch Tracker
          </h1>
          <p className="mt-3 text-lg text-muted-foreground dark:text-slate-400 max-w-2xl mx-auto">
            Every initiative launches when its conditions are met. No gatekeepers — just community momentum.
            The first node is the hard one. After that, it scales.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg mx-auto">
          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200 dark:border-green-800/40">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{readyCount}</div>
            <div className="text-xs text-green-600 dark:text-green-500">Ready</div>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-800/40">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{progressCount}</div>
            <div className="text-xs text-amber-600 dark:text-amber-500">In Progress</div>
          </div>
          <div className="text-center p-3 bg-muted/50 dark:bg-slate-800 rounded-xl border border-border dark:border-slate-700">
            <div className="text-2xl font-bold text-foreground dark:text-slate-300">{totalAvg}%</div>
            <div className="text-xs text-muted-foreground">Overall</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All ({initiatives.length})
            </Button>
            <Button
              variant={filterStatus === 'ready' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('ready')}
              className={filterStatus === 'ready' ? '' : 'text-green-700 border-green-300'}
            >
              Ready ({readyCount})
            </Button>
            <Button
              variant={filterStatus === 'progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('progress')}
              className={filterStatus === 'progress' ? '' : 'text-amber-700 border-amber-300'}
            >
              &gt;50% ({progressCount})
            </Button>
            <Button
              variant={filterStatus === 'early' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('early')}
            >
              &lt;50%
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(s => s === 'closest' ? 'number' : 'closest')}
            className="text-muted-foreground"
          >
            <ArrowUpDown className="h-4 w-4 mr-1" />
            {sortBy === 'closest' ? 'By progress' : 'By number'}
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20 text-muted-foreground/70">Loading launch conditions...</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground/70">
            No initiatives match this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(init => (
              <LaunchConditionCard
                key={init.slug}
                initiativeSlug={init.slug}
                initiativeName={init.name}
                initiativeNumber={init.number}
                conditions={init.conditions}
                onClick={() => {
                  const meta = INITIATIVE_META[init.slug];
                  if (meta) navigate(meta.route);
                }}
              />
            ))}
          </div>
        )}

        {/* Node scaling message */}
        <div className="mt-12 p-6 bg-muted dark:bg-slate-800 rounded-2xl text-center max-w-2xl mx-auto">
          <p className="text-foreground dark:text-slate-300 text-sm leading-relaxed">
            <strong>The first node is the hardest.</strong> Going from 0 to 1 location requires ~500 members.
            But once that first node works, every subsequent node is incremental — the infrastructure,
            processes, training, and supply chain already exist.
          </p>
          <p className="text-muted-foreground dark:text-slate-400 text-xs mt-3">
            Cost + 20% locked forever. Creators/workers keep 83.3% of every transaction.
          </p>
        </div>

        {/* SEC disclosure */}
        <p className="text-center text-xs text-muted-foreground/70 mt-8 max-w-xl mx-auto">
          Progress indicators reflect community participation milestones, not financial returns.
          Participation in Liana Banyan does not constitute a speculative instrument and carries no guarantee of income.
        </p>
    </PortalPageLayout>
  );
}
