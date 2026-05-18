// ============================================================================
// SAGA 15 BP046B — /gauntlet/variants/ category on LB platform
// Variants submitted via Tab 4 Developer Mode land here.
// Community votes via 6-Production-Level multiplier.
// Variant crossing Level 3 (1,000+ credits pledged) → auto-offered as
// optional download strain in Mnemosyne (clearly labeled "community variant").
// Attribution + Cooperative Defensive Patent Pledge #2260 binding.
// ============================================================================

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award, ChevronRight, Code2, GitBranch, Star, TrendingUp,
  Layers, Users, Lock, CheckCircle, Clock, Flame,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

type ProductionLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface GauntletVariant {
  id: string;
  title: string;
  description: string;
  author_display: string;
  submitted_at: string;
  production_level: ProductionLevel;
  credits_pledged: number;
  stage_count: number;
  use_case_tags: string[];
  base_model_hint?: string;
  banyan_metric_achieved?: number;
  is_available_as_strain: boolean;
  pledge_2260_bound: boolean;
  variant_lineage?: string;
}

// ── Production Level helpers ───────────────────────────────────────────────────

const PRODUCTION_LEVELS: Record<ProductionLevel, { label: string; multiplier: number; color: string; description: string }> = {
  1: { label: 'Pre-Mint',   multiplier: 5.0, color: 'text-slate-400 border-slate-600 bg-slate-800/40',  description: 'Newly submitted — early supporters get 5× credit' },
  2: { label: 'Minted',     multiplier: 3.0, color: 'text-blue-400 border-blue-700 bg-blue-900/20',     description: 'Gaining traction — 3× early credit' },
  3: { label: 'Production', multiplier: 2.0, color: 'text-emerald-400 border-emerald-700 bg-emerald-900/20', description: '1,000+ credits pledged — auto-offered as Mnemosyne download strain' },
  4: { label: 'Distribution', multiplier: 1.5, color: 'text-yellow-400 border-yellow-700 bg-yellow-900/20', description: 'Widely distributed — 1.5× credit' },
  5: { label: 'Established', multiplier: 1.0, color: 'text-orange-400 border-orange-700 bg-orange-900/20', description: 'Established variant — standard credit' },
  6: { label: 'Legacy+Federation', multiplier: 1.0, color: 'text-purple-400 border-purple-700 bg-purple-900/20', description: 'Federated across Cathedral network' },
};

// ── Scaffold variants (real submissions come from Developer Mode Tab 4 → Supabase) ──

const SCAFFOLD_VARIANTS: GauntletVariant[] = [
  {
    id: 'var-001-substrate-speed',
    title: 'Substrate Speed Variant',
    description: 'Optimized Stage 2 Cathedral-alone retrieval — tests Wrasse Phase-0 pheromone fast-path under high-load conditions. Targets 0.040ms mean (vs 0.059ms canonical baseline).',
    author_display: 'Pioneer Member (Developer Mode)',
    submitted_at: '2026-05-18',
    production_level: 1,
    credits_pledged: 0,
    stage_count: 2,
    use_case_tags: ['speed', 'cathedral', 'stage-2'],
    base_model_hint: 'substrate-only',
    banyan_metric_achieved: undefined,
    is_available_as_strain: false,
    pledge_2260_bound: true,
    variant_lineage: 'derived from Mnemosyne v0.1.5 · Stage 2 only',
  },
  {
    id: 'var-002-cross-vendor-yoke',
    title: 'Cross-Vendor Yoke 4-Model Stack',
    description: 'Stage 4 variant — Yokes 4 AI models simultaneously (Anthropic + OpenAI + Google + local Llama). Measures symmetry drift across vendor boundaries. Proves ANY combination works.',
    author_display: 'Developer Mode (pending first submission)',
    submitted_at: '2026-05-18',
    production_level: 1,
    credits_pledged: 0,
    stage_count: 4,
    use_case_tags: ['yoke', 'cross-vendor', 'stage-4', 'multi-model'],
    base_model_hint: 'multiple',
    banyan_metric_achieved: undefined,
    is_available_as_strain: false,
    pledge_2260_bound: true,
    variant_lineage: 'Stage 4 extension · Yoke symmetric access canon',
  },
];

// ── Level badge ───────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level: ProductionLevel }) {
  const info = PRODUCTION_LEVELS[level];
  return (
    <Badge className={cn('text-xs font-bold border', info.color)}>
      L{level} · {info.label}
    </Badge>
  );
}

// ── Variant Card ──────────────────────────────────────────────────────────────

function VariantCard({ variant }: { variant: GauntletVariant }) {
  const levelInfo = PRODUCTION_LEVELS[variant.production_level];
  const isStrainEligible = variant.production_level >= 3 || variant.credits_pledged >= 1000;
  const creditsToProduction = Math.max(0, 1000 - variant.credits_pledged);

  return (
    <Card className="bg-slate-900/70 border-slate-700/50 hover:border-slate-500/50 transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <GitBranch className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {variant.title}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              by {variant.author_display} · {variant.submitted_at}
            </CardDescription>
          </div>
          <LevelBadge level={variant.production_level} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-slate-400 leading-relaxed">{variant.description}</p>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div className="font-bold text-emerald-400">
              {variant.banyan_metric_achieved !== undefined ? `${variant.banyan_metric_achieved.toFixed(1)} BM` : '—'}
            </div>
            <div className="text-slate-600">Banyan Metric</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-slate-300">{variant.stage_count}</div>
            <div className="text-slate-600">Stages</div>
          </div>
          <div className="text-center">
            <div className={cn('font-bold', isStrainEligible ? 'text-yellow-400' : 'text-slate-500')}>
              {variant.credits_pledged.toLocaleString()}
            </div>
            <div className="text-slate-600">Credits</div>
          </div>
        </div>

        {/* Production-level progress bar */}
        {!isStrainEligible && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Progress to Production (L3)</span>
              <span>{creditsToProduction.toLocaleString()} more credits</span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600/60 rounded-full transition-all"
                style={{ width: `${Math.min(100, (variant.credits_pledged / 1000) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Strain availability */}
        {variant.is_available_as_strain ? (
          <div className="flex items-center gap-2 text-xs text-yellow-400 font-semibold">
            <Layers className="h-3.5 w-3.5" />
            Available as optional Mnemosyne download strain
          </div>
        ) : isStrainEligible ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            Eligible for strain offer (Level 3 threshold reached)
          </div>
        ) : null}

        {/* Tags + Pledge notice */}
        <div className="flex flex-wrap gap-1">
          {variant.use_case_tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-500 border-slate-700 py-0 px-1.5">
              {tag}
            </Badge>
          ))}
        </div>

        {variant.pledge_2260_bound && (
          <div className="text-xs text-slate-700">
            Cooperative Defensive Patent Pledge #2260 · {levelInfo.multiplier}× credit multiplier for early supporters
          </div>
        )}

        {/* Vote CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-emerald-800 text-emerald-500 hover:bg-emerald-900/20 hover:text-emerald-400 h-8"
          onClick={() => {
            // Voting fires via 6-Production-Level infrastructure (post-SAGA 10 full DB impl)
            alert('Voting via 6-Production-Level system — full implementation in SAGA 10 DB pass.\n\n' +
              `You are supporting: ${variant.title}\nEarly credit: ${levelInfo.multiplier}× marks multiplier`);
          }}
        >
          <Star className="h-3 w-3 mr-1" />
          Support this variant · {levelInfo.multiplier}× credit
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Submit CTA ────────────────────────────────────────────────────────────────

function SubmitVariantCTA() {
  return (
    <div className="border border-dashed border-slate-700 rounded-xl p-5 text-center space-y-3">
      <Code2 className="h-8 w-8 text-slate-600 mx-auto" />
      <div>
        <div className="text-sm font-bold text-slate-400">Submit a Gauntlet Variant</div>
        <div className="text-xs text-slate-600 mt-1 max-w-md mx-auto leading-relaxed">
          Developer Mode required · LB membership + Pledge #2260 sign-off · or business license.
          Unlock Developer Mode in Mnemosyne app Tab 4, then submit via "Submit New Test".
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Lock className="h-3 w-3" />
          <span>Tab 4 → Submit New Test → define stages → register project → submit upstream</span>
        </div>
        <a
          href="https://cephas.lianabanyan.com/download/"
          target="_blank"
          rel="noopener"
          className="text-xs text-emerald-600 hover:text-emerald-500 underline"
        >
          Download Mnemosyne v0.1.5 to access Developer Mode →
        </a>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GauntletVariantsPage() {
  const [levelFilter, setLevelFilter] = useState<'all' | 'strain-eligible' | '1' | '2' | '3' | '4' | '5' | '6'>('all');

  const filtered = SCAFFOLD_VARIANTS.filter((v) => {
    if (levelFilter === 'all') return true;
    if (levelFilter === 'strain-eligible') return v.is_available_as_strain || v.credits_pledged >= 1000;
    return String(v.production_level) === levelFilter;
  });

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-bold text-white">Gauntlet · Variants</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Community-submitted Gauntlet variants. Vote to advance a variant through 6 Production Levels.
            Variants reaching Level 3 (1,000+ credits) are auto-offered as optional Mnemosyne download strains.
          </p>
        </div>

        {/* Production Level explainer */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([1, 2, 3, 4, 5, 6] as ProductionLevel[]).map((level) => {
            const info = PRODUCTION_LEVELS[level];
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(levelFilter === String(level) as typeof levelFilter ? 'all' : String(level) as typeof levelFilter)}
                className={cn(
                  'text-left p-2.5 rounded-lg border transition-all text-xs',
                  levelFilter === String(level)
                    ? 'border-emerald-700 bg-emerald-900/20'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700',
                )}
              >
                <div className={cn('font-bold text-xs mb-0.5', info.color.split(' ')[0])}>
                  L{level} · {info.label} · {info.multiplier}×
                </div>
                <div className="text-slate-600 text-xs leading-tight">{info.description}</div>
              </button>
            );
          })}
        </div>

        {/* Strain-eligible fast filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setLevelFilter('all')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-md border transition-all',
              levelFilter === 'all'
                ? 'bg-emerald-900/40 border-emerald-700 text-emerald-400'
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
            )}
          >
            All variants ({SCAFFOLD_VARIANTS.length})
          </button>
          <button
            onClick={() => setLevelFilter('strain-eligible')}
            className={cn(
              'text-xs px-3 py-1.5 rounded-md border transition-all flex items-center gap-1',
              levelFilter === 'strain-eligible'
                ? 'bg-yellow-900/40 border-yellow-700 text-yellow-400'
                : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600'
            )}
          >
            <Layers className="h-3 w-3" />
            Strain-eligible (L3+)
          </button>
        </div>

        {/* Variants grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center text-slate-600 text-sm py-8">
              No variants at this level yet — be first to submit.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((v) => <VariantCard key={v.id} variant={v} />)}
            </div>
          )}
        </div>

        {/* Submit CTA */}
        <SubmitVariantCTA />

        {/* How it works */}
        <div className="border border-slate-700/40 rounded-xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> How variant advancement works
          </h3>
          <ol className="text-xs text-slate-500 leading-relaxed space-y-1 list-decimal list-inside">
            <li>Member submits variant via Developer Mode Tab 4 → <em>Submit New Test</em></li>
            <li>Variant appears here at Level 1 (Pre-Mint · 5× early credit)</li>
            <li>Community votes by pledging credits · early supporters earn higher multipliers</li>
            <li>At 1,000+ credits (Level 3 Production) → auto-offered as optional Mnemosyne download strain</li>
            <li>Variant strain clearly labeled "community variant by [member]" — separate from official Mnemosyne strain</li>
            <li>Attribution permanent + Cooperative Defensive Patent Pledge #2260 binding on all variants</li>
          </ol>
        </div>

        <div className="text-xs text-slate-700 text-center pt-2 border-t border-slate-800">
          SAGA 15 BP046B · /gauntlet/variants/ scaffold · voting infra from existing 6-Production-Level canon ·
          Pledge #2260 · Free to use. Better to join. Share and Save.
        </div>
      </div>
    </PortalPageLayout>
  );
}
