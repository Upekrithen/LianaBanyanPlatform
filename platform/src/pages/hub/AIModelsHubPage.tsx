// ============================================================================
// SAGA 10 BP046B / BP073 α-W2 — Hub Source /hub/ai-models/
// Extended AIModelEntry (Switchboard fields) + AlmanacBenchmarkTable.
// Replaces card grid with sortable benchmark table; same route, no new page.
// ============================================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, Zap, Award, BarChart3,
  ChevronDown, ChevronUp, Shield, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TesterBadge {
  memberId: string;
  proofId: string;
  proofUrl: string;
}

interface AIModelEntry {
  model_key: string;
  model_display_name: string;
  model_version_tag: string;
  // Aggregated from gauntlet_pioneer_registry
  pioneer_count: number;
  first_pioneer_position: number;
  avg_banyan_metric: number | null;
  best_banyan_metric: number | null;
  // Static scaffold data (SAGA 10 — real data flows from Gauntlet DB post-SAGA 08 full impl)
  use_case_tags: string[];
  cost_tier: 'low' | 'medium' | 'high' | 'free';
  provider: string;
  is_pioneer_eligible: boolean;
  // Switchboard fields (BP073 α-W2) — all optional; render "—" when absent
  mySubscription?: string;
  speedScore?: number;
  costPerMTokens?: number;          // provider receipt-grounded when available, estimate-labeled otherwise
  accuracyScore?: number;
  benchmarkScore?: number;
  state?: 'ACTIVE' | 'EXPENDED' | 'DEMOTED_FREE' | 'AVAILABLE' | 'EXPIRED';
  periodStart?: string;             // ISO date
  periodEnd?: string;               // ISO date
  creditAllowance?: number;
  creditsSpent?: number;
  currentAssignment?: string;
  licenseClass?: 'FREE_LOCAL' | 'FREE_TIER' | 'PAID_SUBSCRIPTION' | 'PAID_API';
  testerBadges?: TesterBadge[];
}

// ── Scaffold model data (real data flows from gauntlet_pioneer_registry + Gauntlet runs) ──

const SCAFFOLD_MODELS: AIModelEntry[] = [
  {
    model_key: 'claude-opus-4-7',
    model_display_name: 'Claude Opus 4.7',
    model_version_tag: '4.7',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['code', 'analysis', 'long-context', 'reasoning'],
    cost_tier: 'high',
    provider: 'Anthropic',
    is_pioneer_eligible: true,
    licenseClass: 'PAID_API',
  },
  {
    model_key: 'claude-sonnet-4-6',
    model_display_name: 'Claude Sonnet 4.6',
    model_version_tag: '4.6',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['code', 'writing', 'balanced'],
    cost_tier: 'medium',
    provider: 'Anthropic',
    is_pioneer_eligible: true,
    licenseClass: 'PAID_API',
  },
  {
    model_key: 'gpt-5-3-codex',
    model_display_name: 'GPT-5.3 Codex',
    model_version_tag: '5.3',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['code', 'completion', 'instruct'],
    cost_tier: 'medium',
    provider: 'OpenAI',
    is_pioneer_eligible: true,
    licenseClass: 'PAID_API',
  },
  {
    model_key: 'gemini-3-1-pro',
    model_display_name: 'Gemini 3.1 Pro',
    model_version_tag: '3.1',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['multimodal', 'analysis', 'long-context'],
    cost_tier: 'medium',
    provider: 'Google',
    is_pioneer_eligible: true,
    licenseClass: 'PAID_API',
  },
  {
    model_key: 'llama-3-local',
    model_display_name: 'Llama 3 (Local)',
    model_version_tag: '3.x',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['local', 'free', 'privacy', 'offline'],
    cost_tier: 'free',
    provider: 'Meta (self-hosted)',
    is_pioneer_eligible: true,
    licenseClass: 'FREE_LOCAL',
  },
  {
    model_key: 'substrate-only',
    model_display_name: 'Substrate Only (No LLM)',
    model_version_tag: 'stage-2',
    pioneer_count: 0,
    first_pioneer_position: 1,
    avg_banyan_metric: null,
    best_banyan_metric: null,
    use_case_tags: ['offline', 'free', 'cpu-only', 'none-at-all'],
    cost_tier: 'free',
    provider: 'Liana Banyan (Cathedral)',
    is_pioneer_eligible: true,
    licenseClass: 'FREE_LOCAL',
  },
];

const USE_CASE_OPTIONS = ['all', 'code', 'writing', 'analysis', 'local', 'free', 'multimodal', 'reasoning', 'offline'];
const COST_OPTIONS = ['all', 'free', 'low', 'medium', 'high'];

// ── Pioneer position label helper ──────────────────────────────────────────────

function pioneerLabel(count: number): { label: string; cls: string } {
  if (count === 0) return { label: 'Pioneer slot OPEN · 3×', cls: 'text-green-400' };
  if (count === 1) return { label: 'Pioneer #2 slot · 2×', cls: 'text-emerald-400' };
  if (count === 2) return { label: 'Pioneer #3 slot · 1.5×', cls: 'text-teal-400' };
  if (count < 10)  return { label: `Pioneer #${count + 1} slot · 1.2×`, cls: 'text-sky-400' };
  return { label: 'Standard slot · 1×', cls: 'text-slate-400' };
}

// ── AlmanacBenchmarkTable helpers ─────────────────────────────────────────────

type SortKey =
  | 'model_display_name'
  | 'licenseClass'
  | 'state'
  | 'speedScore'
  | 'costPerMTokens'
  | 'accuracyScore'
  | 'benchmarkScore'
  | 'pioneer_count';

const STATE_BADGE_CLASS: Record<string, string> = {
  ACTIVE:       'bg-green-900/40 text-green-400 border-green-800',
  EXPENDED:     'bg-red-900/40 text-red-400 border-red-800',
  DEMOTED_FREE: 'bg-yellow-900/40 text-yellow-500 border-yellow-800',
  AVAILABLE:    'bg-blue-900/40 text-blue-400 border-blue-800',
  EXPIRED:      'bg-slate-800/60 text-slate-500 border-slate-700',
};

const LICENSE_ORDER: Record<string, number> = {
  FREE_LOCAL:        0,
  FREE_TIER:         1,
  PAID_SUBSCRIPTION: 2,
  PAID_API:          3,
};

const LICENSE_LABEL: Record<string, string> = {
  FREE_LOCAL:        'Free Local',
  FREE_TIER:         'Free Tier',
  PAID_SUBSCRIPTION: 'Paid Sub',
  PAID_API:          'Paid API',
};

const STATE_SORT_ORDER: Record<string, number> = {
  ACTIVE: 0, AVAILABLE: 1, DEMOTED_FREE: 2, EXPENDED: 3, EXPIRED: 4,
};

function dash(v: string | number | undefined | null): string {
  if (v === undefined || v === null || v === '') return '\u2014';
  return String(v);
}

function numCell(v: number | undefined | null, decimals = 1): string {
  if (v === undefined || v === null) return '\u2014';
  return v.toFixed(decimals);
}

// ── ColHeader ─────────────────────────────────────────────────────────────────

interface ColHeaderProps {
  col: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (col: SortKey) => void;
}

function ColHeader({ col, label, sortKey, sortDir, onSort }: ColHeaderProps) {
  const active = col === sortKey;
  return (
    <th
      className="px-3 py-2 text-left text-xs font-semibold text-slate-400 cursor-pointer select-none whitespace-nowrap hover:text-slate-200 transition-colors"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {active
          ? (sortDir === 'asc'
            ? <ChevronUp className="h-3 w-3 text-emerald-400" />
            : <ChevronDown className="h-3 w-3 text-emerald-400" />)
          : <ChevronDown className="h-3 w-3 text-slate-600" />
        }
      </span>
    </th>
  );
}

// ── RowDetail (accordion expand) ──────────────────────────────────────────────

function RowDetail({ model, peers }: { model: AIModelEntry; peers: AIModelEntry[] }) {
  const myIdx = peers.findIndex((p) => p.model_key === model.model_key);
  const prevPeer = myIdx > 0 ? peers[myIdx - 1] : null;
  const nextPeer = myIdx < peers.length - 1 ? peers[myIdx + 1] : null;

  function costStr(m: AIModelEntry): string {
    return m.costPerMTokens != null ? `$${m.costPerMTokens.toFixed(2)}` : '\u2014';
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs py-1">

      {/* Accuracy & Benchmark detail */}
      <div className="space-y-1.5">
        <div className="text-slate-400 font-semibold mb-1">Accuracy &amp; Benchmark</div>
        {(
          [
            ['Accuracy score',    numCell(model.accuracyScore)],
            ['Benchmark score',   numCell(model.benchmarkScore)],
            ['Avg Banyan Metric', numCell(model.avg_banyan_metric)],
            ['Best Banyan Metric',numCell(model.best_banyan_metric)],
            ['Speed score',       numCell(model.speedScore)],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between text-slate-500">
            <span>{k}</span>
            <span className="text-slate-300 tabular-nums">{v}</span>
          </div>
        ))}
      </div>

      {/* Cost comparison vs neighbors */}
      <div className="space-y-1.5">
        <div className="text-slate-400 font-semibold mb-1">Cost vs Neighbors ($/1M tokens)</div>
        {prevPeer && (
          <div className="flex justify-between text-slate-500">
            <span className="truncate mr-2 max-w-[120px]">{prevPeer.model_display_name}</span>
            <span className="tabular-nums">{costStr(prevPeer)}</span>
          </div>
        )}
        <div className="flex justify-between text-emerald-500 font-semibold">
          <span className="truncate mr-2 max-w-[120px]">&#8627; {model.model_display_name}</span>
          <span className="tabular-nums">
            {model.costPerMTokens != null
              ? <span>${model.costPerMTokens.toFixed(2)} <span className="text-yellow-600 font-normal">(est.)</span></span>
              : <span className="text-slate-600">&mdash;</span>
            }
          </span>
        </div>
        {nextPeer && (
          <div className="flex justify-between text-slate-500">
            <span className="truncate mr-2 max-w-[120px]">{nextPeer.model_display_name}</span>
            <span className="tabular-nums">{costStr(nextPeer)}</span>
          </div>
        )}
        <div className="mt-2 pt-2 border-t border-slate-700/40 space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Credit allowance</span>
            <span className="text-slate-300">{dash(model.creditAllowance)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Credits spent</span>
            <span className="text-slate-300">{dash(model.creditsSpent)}</span>
          </div>
        </div>
      </div>

      {/* Subscription & Tester Badges */}
      <div className="space-y-1.5">
        <div className="text-slate-400 font-semibold mb-1">Subscription &amp; Badges</div>
        <div className="flex justify-between text-slate-500">
          <span>My subscription</span>
          <span className="text-slate-300">{dash(model.mySubscription)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Assignment</span>
          <span className="text-slate-300">{dash(model.currentAssignment)}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Period</span>
          <span className="text-slate-300">
            {model.periodStart ?? '\u2014'}{model.periodEnd ? ` \u2192 ${model.periodEnd}` : ''}
          </span>
        </div>
        {model.testerBadges && model.testerBadges.length > 0 ? (
          <div className="mt-2 pt-2 border-t border-slate-700/40">
            <div className="text-slate-400 mb-1">Tester Badges ({model.testerBadges.length})</div>
            <div className="space-y-1">
              {model.testerBadges.map((badge) => (
                <a
                  key={badge.proofId}
                  href={badge.proofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span>{badge.memberId}</span>
                  <span className="text-slate-600">#{badge.proofId.slice(0, 8)}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-slate-600 italic mt-1">No tester badges yet</div>
        )}
      </div>
    </div>
  );
}

// ── AlmanacBenchmarkTable ─────────────────────────────────────────────────────

function AlmanacBenchmarkTable({ models }: { models: AIModelEntry[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('licenseClass');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  function handleSort(col: SortKey) {
    if (sortKey === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col);
      setSortDir('asc');
    }
  }

  const sorted = [...models].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'model_display_name':
        cmp = a.model_display_name.localeCompare(b.model_display_name);
        break;
      case 'licenseClass':
        cmp = (LICENSE_ORDER[a.licenseClass ?? ''] ?? 99) - (LICENSE_ORDER[b.licenseClass ?? ''] ?? 99);
        break;
      case 'state':
        cmp = (STATE_SORT_ORDER[a.state ?? ''] ?? 99) - (STATE_SORT_ORDER[b.state ?? ''] ?? 99);
        break;
      case 'speedScore':
        cmp = (a.speedScore ?? -1) - (b.speedScore ?? -1);
        break;
      case 'costPerMTokens':
        cmp = (a.costPerMTokens ?? Infinity) - (b.costPerMTokens ?? Infinity);
        break;
      case 'accuracyScore':
        cmp = (a.accuracyScore ?? -1) - (b.accuracyScore ?? -1);
        break;
      case 'benchmarkScore':
        cmp = (a.benchmarkScore ?? -1) - (b.benchmarkScore ?? -1);
        break;
      case 'pioneer_count':
        cmp = a.pioneer_count - b.pioneer_count;
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const colProps = { sortKey, sortDir, onSort: handleSort };

  return (
    <div className="space-y-2">
      {/* Privacy doorpost */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/40 bg-slate-900/60 text-xs text-slate-500">
        <Shield className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        <span>
          Subscription data: <strong className="text-slate-400">READ-ONLY</strong> · local-only · no phone-home
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/50">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="border-b border-slate-700/50 bg-slate-900/80">
            <tr>
              <ColHeader col="model_display_name" label="Model"     {...colProps} />
              <ColHeader col="licenseClass"        label="License"   {...colProps} />
              <ColHeader col="state"               label="State"     {...colProps} />
              <ColHeader col="speedScore"          label="Speed"     {...colProps} />
              <ColHeader col="costPerMTokens"      label="Cost / 1M" {...colProps} />
              <ColHeader col="accuracyScore"       label="Accuracy"  {...colProps} />
              <ColHeader col="benchmarkScore"      label="Benchmark" {...colProps} />
              <ColHeader col="pioneer_count"       label="Pioneers"  {...colProps} />
              <th className="px-3 py-2 w-6" />
            </tr>
          </thead>
          <tbody>
            {sorted.flatMap((model) => {
              const rowKey = `${model.model_key}-${model.model_version_tag}`;
              const isExpanded = expandedRow === rowKey;
              const pioneer = pioneerLabel(model.pioneer_count);
              return [
                <tr
                  key={rowKey}
                  className={cn(
                    'border-b border-slate-800/60 cursor-pointer transition-colors',
                    isExpanded ? 'bg-slate-800/50' : 'hover:bg-slate-800/30',
                  )}
                  onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                >
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-slate-100 text-xs leading-tight">{model.model_display_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{model.provider} · v{model.model_version_tag}</div>
                    <div className={cn('text-xs mt-0.5', pioneer.cls)}>{pioneer.label}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    {model.licenseClass ? (
                      <Badge
                        className={cn(
                          'text-xs border',
                          model.licenseClass.startsWith('FREE')
                            ? 'bg-green-900/40 text-green-400 border-green-800'
                            : 'bg-blue-900/40 text-blue-400 border-blue-800',
                        )}
                      >
                        {LICENSE_LABEL[model.licenseClass]}
                      </Badge>
                    ) : (
                      <span className="text-slate-600 text-xs">&mdash;</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {model.state ? (
                      <Badge className={cn('text-xs border', STATE_BADGE_CLASS[model.state])}>
                        {model.state}
                      </Badge>
                    ) : (
                      <span className="text-slate-600 text-xs">&mdash;</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-300 tabular-nums">{numCell(model.speedScore)}</td>
                  <td className="px-3 py-2.5 text-xs tabular-nums">
                    {model.costPerMTokens != null ? (
                      <span className="text-slate-300">
                        ${model.costPerMTokens.toFixed(2)}{' '}
                        <span className="text-slate-500">(est.)</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">&mdash;</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-300 tabular-nums">{numCell(model.accuracyScore)}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-300 tabular-nums">{numCell(model.benchmarkScore)}</td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 tabular-nums text-center">{model.pioneer_count}</td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {isExpanded
                      ? <ChevronUp className="h-3.5 w-3.5" />
                      : <ChevronDown className="h-3.5 w-3.5" />
                    }
                  </td>
                </tr>,
                ...(isExpanded ? [
                  <tr key={`${rowKey}-detail`} className="border-b border-slate-800/60 bg-slate-800/25">
                    <td colSpan={9} className="px-4 py-3">
                      <RowDetail model={model} peers={sorted} />
                    </td>
                  </tr>,
                ] : []),
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIModelsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [useCase, setUseCase] = useState('all');
  const [costFilter, setCostFilter] = useState('all');

  // Fetch live Pioneer counts from DB (community-aggregated)
  const { data: pioneerCounts } = useQuery({
    queryKey: ['pioneer-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauntlet_pioneer_registry')
        .select('model_key, model_version_tag')
        .eq('quality_gate_passed', true);
      if (error) return {};
      const counts: Record<string, number> = {};
      (data ?? []).forEach((r) => { counts[r.model_key] = (counts[r.model_key] ?? 0) + 1; });
      return counts;
    },
  });

  // Merge live counts into scaffold models
  const models = SCAFFOLD_MODELS.map((m) => ({
    ...m,
    pioneer_count: pioneerCounts?.[m.model_key] ?? m.pioneer_count,
  }));

  const filtered = models.filter((m) => {
    if (
      searchQuery &&
      !m.model_display_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.provider.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !m.use_case_tags.some((t) => t.includes(searchQuery.toLowerCase()))
    ) return false;
    if (useCase !== 'all' && !m.use_case_tags.includes(useCase)) return false;
    if (costFilter !== 'all' && m.cost_tier !== costFilter) return false;
    return true;
  });

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-bold text-white">Hub · AI Models</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Community-aggregated Gauntlet results for every AI model tested with Mnemosyne substrate.
            Pioneer Bonus slots open &mdash; be first to test a model and earn a permanent attribution + 3&times; marks.
          </p>
          <p className="text-xs text-slate-600">
            ANY hardware &middot; ANY network &middot; ANY AI model &middot; or NONE AT ALL &middot; Honest-Alpha variance bands ALWAYS
          </p>
        </div>

        {/* Pioneer CTA banner */}
        <div className="border border-yellow-800/40 bg-yellow-900/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-yellow-400 mb-1">Pioneer Bonus &mdash; all slots open</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Be the first to run the Gauntlet with any model listed here. Position #1 = 3&times; marks multiplier + permanent
                named attribution in the community Banyan Metric registry. Run the Gauntlet in the Mnemosyne app &rarr; Tab 3.
              </div>
              <a href="https://cephas.lianabanyan.com/download/" target="_blank" rel="noopener" className="inline-block mt-2 text-xs text-yellow-500 hover:text-yellow-400 underline">
                Download Mnemosyne v0.1.5 &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <Input
              placeholder="Search models, providers, use cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 h-8 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Use case filter */}
            <div className="flex gap-1 flex-wrap">
              {USE_CASE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setUseCase(opt)}
                  className={cn(
                    'text-xs px-2 py-1 rounded-md border transition-all',
                    useCase === opt
                      ? 'bg-emerald-900/50 border-emerald-700 text-emerald-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                  )}
                >
                  {opt === 'all' ? 'All use cases' : opt}
                </button>
              ))}
            </div>
            {/* Cost filter */}
            <div className="flex gap-1 flex-wrap">
              {COST_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setCostFilter(opt)}
                  className={cn(
                    'text-xs px-2 py-1 rounded-md border transition-all',
                    costFilter === opt
                      ? 'bg-blue-900/50 border-blue-700 text-blue-400'
                      : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
                  )}
                >
                  {opt === 'all' ? 'All costs' : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Benchmark table (replaces card grid) */}
        <div>
          <div className="text-xs text-slate-600 mb-3">
            {filtered.length} model{filtered.length !== 1 ? 's' : ''} &middot; click a row to expand detail &middot; Gauntlet-verified results appear as community runs accumulate
          </div>
          <AlmanacBenchmarkTable models={filtered} />
        </div>

        {/* How results are generated */}
        <div className="border border-slate-700/40 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" /> How Banyan Metric results are generated
          </h3>
          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <p>Every Gauntlet run in Mnemosyne produces a 6-stage result table with individual + cumulative Banyan Metric (BM) scores.</p>
            <p>Results submitted here with quality-gate-pass become community data. Pioneer #1 gets permanent named attribution.</p>
            <p>Variance-bands ALWAYS &middot; NEVER point-estimate &middot; Method C &middot; Honest-Alpha trimmed &middot; cooperative-class real.</p>
            <p className="text-slate-700">
              Early reviewers get 5&times; Production Level credit (Pre-Mint tier). Compose with Pioneer Bonus for maximum marks.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-slate-700 text-center pt-2 border-t border-slate-800">
          SAGA 10 BP046B / BP073 &alpha;-W2 &middot; Hub Source scaffold &middot; real data flows from Gauntlet community runs &middot; Pioneer Bonus per SAGA 09 Founder R10 RATIFIED &middot;
          Pledge #2260 &middot; Free to use. Better to join.
        </div>
      </div>
    </PortalPageLayout>
  );
}
