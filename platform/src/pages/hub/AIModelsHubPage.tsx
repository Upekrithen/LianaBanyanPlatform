// ============================================================================
// SAGA 10 BP046B — Hub Source /hub/ai-models/
// Each AI model = canonical page with empirical Banyan Metric (community-
// aggregated from Gauntlet runs) · Pioneer attribution panel · member
// testimonials · use-case tags · cost-per-task estimates · filterable matrix.
// ============================================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Star, Zap, DollarSign, Target, ChevronRight, Award, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

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
  },
];

const USE_CASE_OPTIONS = ['all', 'code', 'writing', 'analysis', 'local', 'free', 'multimodal', 'reasoning', 'offline'];
const COST_OPTIONS = ['all', 'free', 'low', 'medium', 'high'];
const PROVIDER_OPTIONS = ['all', 'Anthropic', 'OpenAI', 'Google', 'Meta (self-hosted)', 'Liana Banyan (Cathedral)'];

const COST_COLORS: Record<string, string> = {
  free: 'bg-green-900/40 text-green-400 border-green-800',
  low:  'bg-blue-900/40 text-blue-400 border-blue-800',
  medium: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  high: 'bg-red-900/40 text-red-400 border-red-800',
};

// ── Pioneer position label helper ──────────────────────────────────────────────

function pioneerLabel(count: number): { label: string; class: string } {
  if (count === 0) return { label: 'Pioneer slot OPEN · 3×', class: 'text-green-400' };
  if (count === 1) return { label: 'Pioneer #2 slot · 2×', class: 'text-emerald-400' };
  if (count === 2) return { label: 'Pioneer #3 slot · 1.5×', class: 'text-teal-400' };
  if (count < 10)  return { label: `Pioneer #${count + 1} slot · 1.2×`, class: 'text-sky-400' };
  return { label: 'Standard slot · 1×', class: 'text-slate-400' };
}

// ── Model Card ────────────────────────────────────────────────────────────────

function ModelCard({ model, onSelect }: { model: AIModelEntry; onSelect: () => void }) {
  const pioneer = pioneerLabel(model.pioneer_count);
  return (
    <Card
      className="bg-slate-900/70 border-slate-700/50 hover:border-slate-500/50 transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
              {model.model_display_name}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              {model.provider} · v{model.model_version_tag}
            </CardDescription>
          </div>
          <Badge className={cn('text-xs font-bold border', COST_COLORS[model.cost_tier])}>
            {model.cost_tier === 'free' ? 'FREE' : model.cost_tier.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Banyan Metric */}
        <div className="flex items-center gap-3">
          <BarChart3 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <div className="text-xs text-slate-400">
            {model.avg_banyan_metric !== null
              ? <><span className="text-emerald-400 font-bold">{model.avg_banyan_metric.toFixed(1)} BM avg</span> · best {model.best_banyan_metric?.toFixed(1)} BM</>
              : <span className="text-slate-600 italic">Banyan Metric: no Gauntlet runs yet — be first!</span>
            }
          </div>
        </div>

        {/* Pioneer Bonus */}
        <div className="flex items-center gap-3">
          <Award className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
          <span className={cn('text-xs font-semibold', pioneer.class)}>{pioneer.label}</span>
        </div>

        {/* Use-case tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {model.use_case_tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-400 border-slate-700 py-0 px-1.5">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-end text-xs text-slate-600 group-hover:text-slate-400 transition-colors pt-1">
          Run Gauntlet with this model <ChevronRight className="h-3 w-3 ml-0.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AIModelsHubPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [useCase, setUseCase] = useState('all');
  const [costFilter, setCostFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  // Fetch live Pioneer counts from DB (community-aggregated)
  const { data: pioneerCounts } = useQuery({
    queryKey: ['pioneer-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauntlet_pioneer_registry')
        .select('model_key, model_version_tag')
        .eq('quality_gate_passed', true);
      if (error) return {};
      // Count per model_key
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
    if (searchQuery && !m.model_display_name.toLowerCase().includes(searchQuery.toLowerCase())
      && !m.provider.toLowerCase().includes(searchQuery.toLowerCase())
      && !m.use_case_tags.some((t) => t.includes(searchQuery.toLowerCase()))) return false;
    if (useCase !== 'all' && !m.use_case_tags.includes(useCase)) return false;
    if (costFilter !== 'all' && m.cost_tier !== costFilter) return false;
    if (providerFilter !== 'all' && m.provider !== providerFilter) return false;
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
            Pioneer Bonus slots open — be first to test a model and earn a permanent attribution + 3× marks.
          </p>
          <p className="text-xs text-slate-600">
            ANY hardware · ANY network · ANY AI model · or NONE AT ALL · Honest-Alpha variance bands ALWAYS
          </p>
        </div>

        {/* Pioneer CTA banner */}
        <div className="border border-yellow-800/40 bg-yellow-900/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Award className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-yellow-400 mb-1">Pioneer Bonus — all slots open</div>
              <div className="text-xs text-slate-400 leading-relaxed">
                Be the first to run the Gauntlet with any model listed here. Position #1 = 3× marks multiplier + permanent
                named attribution in the community Banyan Metric registry. Run the Gauntlet in the Mnemosyne app → Tab 3.
              </div>
              <a href="https://cephas.lianabanyan.com/download/" target="_blank" rel="noopener" className="inline-block mt-2 text-xs text-yellow-500 hover:text-yellow-400 underline">
                Download Mnemosyne v0.1.5 →
              </a>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <Search className="h-4 w-4 text-slate-500 shrink-0" />
            <Input
              placeholder="Search models, providers, use cases…"
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
                  {opt === 'all' ? '🏷 All use cases' : opt}
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
                  {opt === 'all' ? '💰 All costs' : opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Model grid */}
        <div>
          <div className="text-xs text-slate-600 mb-3">
            {filtered.length} model{filtered.length !== 1 ? 's' : ''} · Gauntlet-verified results appear as community runs accumulate
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((model) => (
              <ModelCard
                key={`${model.model_key}-${model.model_version_tag}`}
                model={model}
                onSelect={() => {
                  // Navigate to Gauntlet in app or download page
                  window.open('https://cephas.lianabanyan.com/download/', '_blank');
                }}
              />
            ))}
          </div>
        </div>

        {/* How results are generated */}
        <div className="border border-slate-700/40 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-500" /> How Banyan Metric results are generated
          </h3>
          <div className="text-xs text-slate-500 leading-relaxed space-y-1">
            <p>Every Gauntlet run in Mnemosyne produces a 6-stage result table with individual + cumulative Banyan Metric (BM) scores.</p>
            <p>Results submitted here with quality-gate-pass become community data. Pioneer #1 gets permanent named attribution.</p>
            <p>Variance-bands ALWAYS · NEVER point-estimate · Method C · Honest-Alpha trimmed · cooperative-class real.</p>
            <p className="text-slate-700">
              Early reviewers get 5× Production Level credit (Pre-Mint tier). Compose with Pioneer Bonus for maximum marks.
            </p>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-slate-700 text-center pt-2 border-t border-slate-800">
          SAGA 10 BP046B · Hub Source scaffold · real data flows from Gauntlet community runs · Pioneer Bonus per SAGA 09 Founder R10 RATIFIED ·
          Pledge #2260 · Free to use. Better to join.
        </div>
      </div>
    </PortalPageLayout>
  );
}
