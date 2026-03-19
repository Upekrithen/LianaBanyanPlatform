/**
 * DemandSignaling — Shadow Mark Demand Discovery Page
 * Route: /demand
 * Innovation #1710-#1715: Per-area allocation, Brewster's distribution,
 * carry-forward, crystallization, beacon streaks, thermometers.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Zap,
  Hexagon,
  Timer,
  BarChart3,
  Info,
  Filter,
  Loader2,
} from 'lucide-react';
import { FeatureThermometer } from '@/components/demand/FeatureThermometer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  AREA_ALLOCATIONS,
  SAMPLE_PEDESTALS,
  BEACON_STREAK_TIERS,
  getBeaconTier,
  calculateCarryForward,
  carryForwardLimit,
  type AreaCategory,
  type Pedestal,
  type UserPedestalAllocation,
} from '@/lib/demandSignalingService';

const DemandSignaling: React.FC = () => {
  const { user } = useAuth();
  const [areaFilter, setAreaFilter] = useState<AreaCategory | 'all'>('all');
  const [pedestals, setPedestals] = useState<Pedestal[]>(SAMPLE_PEDESTALS);
  const [userAllocations, setUserAllocations] = useState<Record<string, UserPedestalAllocation>>({});
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: dbPedestals } = await supabase
          .from('demand_pedestals')
          .select('*')
          .order('shadow_mark_total', { ascending: false });

        if (dbPedestals && dbPedestals.length > 0) {
          setPedestals(dbPedestals.map((p: any) => ({
            id: p.id,
            featureName: p.feature_name,
            description: p.description,
            area: p.area as AreaCategory,
            status: p.status,
            activationThreshold: p.activation_threshold,
            currentCommitments: p.current_commitments,
            creditPledges: Number(p.credit_pledges),
            shadowMarkTotal: Number(p.shadow_mark_total),
            alphaLeadWeeks: p.alpha_lead_weeks,
            betaLeadWeeks: p.beta_lead_weeks,
            operationalLeadWeeks: p.operational_lead_weeks,
            icon: p.icon,
          })));
        }

        if (user) {
          const { data: allocations } = await supabase
            .from('demand_pedestal_allocations')
            .select('*')
            .eq('user_id', user.id);

          if (allocations) {
            const allocMap: Record<string, UserPedestalAllocation> = {};
            for (const a of allocations) {
              allocMap[a.pedestal_id] = {
                pedestalId: a.pedestal_id,
                freshToday: Number(a.fresh_today),
                carryForward: Number(a.carry_forward),
                total: Number(a.total),
                consecutiveDays: a.consecutive_days,
                crystallized: Number(a.crystallized),
                lastAllocatedAt: a.last_allocated_at,
              };
            }
            setUserAllocations(allocMap);
            const maxStreak = allocations.reduce((mx: number, a: any) => Math.max(mx, a.consecutive_days), 0);
            setStreakDays(maxStreak);
          }
        }
      } catch {
        // Fall back to SAMPLE_PEDESTALS (already set as default)
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const beaconTier = getBeaconTier(streakDays);

  const filtered = useMemo(
    () => areaFilter === 'all' ? pedestals : pedestals.filter(p => p.area === areaFilter),
    [areaFilter, pedestals],
  );

  const areas = Object.values(AREA_ALLOCATIONS);
  const totalSM = pedestals.reduce((s, p) => s + p.shadowMarkTotal, 0);
  const totalCredits = pedestals.reduce((s, p) => s + p.creditPledges, 0);
  const avgProgress = Math.round(
    pedestals.reduce((s, p) => s + (p.currentCommitments / p.activationThreshold) * 100, 0) / (pedestals.length || 1),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" data-xray-id="demand-signaling">
      {/* Header */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Platform
        </Link>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-7 h-7 text-amber-400" />
            <h1 className="text-3xl font-bold">Demand Discovery</h1>
          </div>
          <p className="text-slate-400 max-w-xl mx-auto">
            Tell us what to build next. Distribute Shadow Marks across pre-operational features.
            Consistent allocation crystallizes into real Marks backed by the patent portfolio.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Innovation #1710 · Brewster's Millions — you MUST spend them, so HOW you spend reveals what you really want.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-amber-400">{totalSM.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Total Shadow Marks</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-emerald-400">{totalCredits.toLocaleString()}</div>
            <div className="text-xs text-slate-500">Credits Pledged</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-blue-400">{avgProgress}%</div>
            <div className="text-xs text-slate-500">Avg. Progress</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-800/50 border border-slate-700">
            <div className="text-xl font-bold text-purple-400">{pedestals.length}</div>
            <div className="text-xs text-slate-500">Features Tracking</div>
          </div>
        </div>

        {/* Beacon Streak Info */}
        <div className="mb-6 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">Your Beacon Streak:</span>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30">
                {streakDays} days
              </Badge>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Carry-forward: <span className="text-white">{(beaconTier.carryForwardRate * 100).toFixed(0)}%</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">
                Crystallizes in: <span className="text-white">{beaconTier.crystallizationDays} days</span>
              </span>
            </div>
            <div className="flex gap-1">
              {BEACON_STREAK_TIERS.slice().reverse().map(t => (
                <Badge
                  key={t.minDays}
                  variant={t.minDays <= streakDays ? 'default' : 'outline'}
                  className={`text-[9px] ${t.minDays <= streakDays ? '' : 'text-slate-600 border-slate-700'}`}
                >
                  {t.minDays === 0 ? 'Base' : `${t.minDays}d`}: {(t.carryForwardRate * 100).toFixed(0)}%
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Area Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500" />
          <Button
            size="sm"
            variant={areaFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setAreaFilter('all')}
            className="text-xs"
          >
            All Areas
          </Button>
          {areas.map(a => (
            <Button
              key={a.category}
              size="sm"
              variant={areaFilter === a.category ? 'default' : 'outline'}
              onClick={() => setAreaFilter(a.category)}
              className="text-xs gap-1"
            >
              {a.icon} {a.label}
              <span className="text-slate-500 ml-1">{a.shadowMarksPerEntry} SM</span>
            </Button>
          ))}
        </div>

        {/* Thermometer Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map(p => (
            <FeatureThermometer
              key={p.id}
              pedestal={p}
              userAllocation={userAllocations[p.id]}
              beaconTier={beaconTier}
              dailyGrowthRate={p.currentCommitments > 10 ? Math.round(p.currentCommitments / 14) : 0}
            />
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 p-6 rounded-lg bg-slate-800/30 border border-slate-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-amber-400" />
            How Demand Discovery Works
          </h2>
          <div className="grid gap-6 md:grid-cols-3 text-sm text-slate-400">
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> 1. Enter & Allocate
              </h3>
              <p>
                Visit any area to receive Shadow Marks (free, 24-hour cooldown).
                Distribute them across pre-operational features. You MUST spend them before leaving —
                Brewster's Millions. How you distribute is the signal.
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> 2. Persist & Compound
              </h3>
              <p>
                50% of your allocation carries forward each day (more with Beacon streaks).
                Come back 3 days in a row and your persistent allocation crystallizes into
                real Marks — backed by the patent portfolio ({'>'}1,751 innovations).
              </p>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2 flex items-center gap-1">
                <BarChart3 className="w-4 h-4 text-blue-400" /> 3. Activate Features
              </h3>
              <p>
                When a feature hits its activation threshold (committed orders), we build it.
                Pledge Credits for ranked-choice production tiers — if your preferred tier doesn't fill,
                your order cascades to a cheaper tier (same Credits, more units).
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-3 text-xs">
            <a href="/faq#shadow-marks" className="text-amber-400 hover:text-amber-300">What are Shadow Marks?</a>
            <a href="/faq#brewster-bonus" className="text-amber-400 hover:text-amber-300">Brewster's Millions</a>
            <a href="/faq#pre-operational" className="text-amber-400 hover:text-amber-300">Pre-operational features</a>
            <a href="/faq#ip-load-balance" className="text-amber-400 hover:text-amber-300">IP Load Balance</a>
            <a href="/faq#beacon-persistence" className="text-amber-400 hover:text-amber-300">Beacon Streaks</a>
          </div>
        </div>

        {/* SEC Disclosure */}
        <p className="text-center text-[10px] text-slate-600 mt-8">
          Shadow Marks are effort-earned demand signals, not investments. Crystallized Marks are backed by
          cooperative-held intellectual property under IP Load Balance. No money invested, no common enterprise,
          no profit expectation, no reliance on others' efforts.
        </p>
      </div>
    </div>
  );
};

export default DemandSignaling;
