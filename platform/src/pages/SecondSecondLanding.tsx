import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ManufacturingLadder } from '@/components/manufacturing/ManufacturingLadder';
import { useManufacturingStatus } from '@/hooks/useManufacturingStatus';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { ShipMedallion } from '@/components/ShipMedallion';
import {
  Factory,
  Wrench,
  TrendingUp,
  Users,
  Rocket,
  ArrowRight,
  Target,
  Sparkles,
  ShieldCheck,
  Package,
  Zap,
} from 'lucide-react';

function useLiveStats() {
  return useQuery({
    queryKey: ['2nd-second-live-stats'],
    queryFn: async () => {
      const [projectsRes, bountiesRes] = await Promise.all([
        supabase.from('production_projects' as never).select('id', { count: 'exact', head: true }) as { count: number | null; error: unknown },
        supabase.from('bounties' as never).select('id', { count: 'exact', head: true }).eq('status', 'open') as { count: number | null; error: unknown },
      ]);
      return {
        projectCount: projectsRes.count ?? 0,
        openBounties: bountiesRes.count ?? 0,
      };
    },
    staleTime: 60_000,
  });
}

export default function SecondSecondLanding() {
  const { user } = useAuth();
  const mfgStatus = useManufacturingStatus();
  const { data: stats } = useLiveStats();

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="2nd-second-landing">
      {/* ── Hero ── */}
      <section className="text-center py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <div className="flex justify-center mb-6">
            <ShipMedallion size="hero" earned autoFlip />
          </div>
          <Badge className="bg-amber-500/20 text-amber-400 mb-4 text-xs tracking-wider uppercase">
            The Grand Experiment
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
            The 2nd Second Industrial Revolution
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 font-light mb-3 italic">
            The Grand Experiment to Save the World
          </p>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Manufacturing that grows from the ground up, funded by the community that uses it,
            governed by the people who built it.
          </p>
          <Link to="/production">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white text-lg px-8 gap-2">
              <Rocket className="w-5 h-5" /> Start Building <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ── The Ladder ── */}
      <section className="py-12 md:py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">The Escalation Ladder</h2>
          <p className="text-zinc-400 text-sm">From a $300 kit to your own factory — four levels, earned not bought.</p>
        </div>
        <div className="flex justify-center">
          <ManufacturingLadder
            currentMarks={user ? mfgStatus.aggregateMarks : 0}
            showDescriptions={true}
            compact={false}
          />
        </div>
        {!user && (
          <p className="text-center text-xs text-zinc-500 mt-4">
            Sign in to see your position on the ladder.
          </p>
        )}
      </section>

      {/* ── Live Stats ── */}
      <section className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { label: 'Production Projects', value: stats?.projectCount ?? '—', icon: Factory, color: 'text-amber-400' },
            { label: 'Open Bounties', value: stats?.openBounties ?? '—', icon: Target, color: 'text-blue-400' },
            { label: 'Total Marks Earned', value: '—', icon: Sparkles, color: 'text-violet-400' },
            { label: 'Active Nodes', value: 'Coming Soon', icon: Zap, color: 'text-emerald-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-zinc-900/60 border-zinc-800 text-center">
              <CardContent className="pt-6 pb-4">
                <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <p className="text-2xl font-bold">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-12 md:py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Package,
              title: 'Buy the Kit',
              body: 'Canister System, $250–400. Start making injection-molded parts from your kitchen table today.',
              color: 'text-amber-400 bg-amber-500/10',
            },
            {
              icon: TrendingUp,
              title: 'Earn Your Way Up',
              body: 'Complete bounties, accumulate Marks, unlock bigger equipment. No resume required — the ledger IS your resume.',
              color: 'text-blue-400 bg-blue-500/10',
            },
            {
              icon: ShieldCheck,
              title: 'Own What You Build',
              body: 'Revenue share, Factory Node, cooperative membership. Your contribution IS your contract.',
              color: 'text-emerald-400 bg-emerald-500/10',
            },
          ].map((card, i) => (
            <Card key={i} className="bg-zinc-900/60 border-zinc-800 overflow-hidden">
              <CardContent className="pt-8 pb-6 px-6 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${card.color}`}>
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{card.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/starter-kit" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium text-sm transition-colors">
            Or start with a $100 Business Starter Kit →
          </Link>
        </div>
      </section>

      {/* ── Current Projects ── */}
      <section className="py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Current Projects</h2>
          <Link to="/production">
            <Button variant="outline" size="sm" className="gap-1 text-xs">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              name: 'SlottedTop',
              desc: 'Modular closure system — first-to-market stackable cap platform',
              status: 'Active',
            },
            {
              name: 'Canister System',
              desc: 'Injection molding for $300 — 5,207 PSI, 90% cheaper molds, stackable',
              status: 'Active',
            },
          ].map((proj, i) => (
            <Card key={i} className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold">{proj.name}</h3>
                    <Badge variant="outline" className="text-[10px]">{proj.status}</Badge>
                  </div>
                  <p className="text-sm text-zinc-400">{proj.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── The Copy / Manifesto ── */}
      <section className="py-16 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          DO THE WORK = GET THE STATUS
        </h2>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p className="text-lg">
            A teenager printing test pieces can reach Partner faster than an engineer
            who fills out a form and stops.
          </p>
          <p>
            No resume. No interview. No application.
          </p>
          <p>
            Your contribution IS your resume. The bounty ledger IS your interview.
            The revenue share IS your contract.
          </p>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="py-12 text-center">
        <div className="bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-amber-950/40 rounded-2xl p-10 border border-amber-500/10">
          <h2 className="text-2xl font-bold mb-3">Join the Grand Experiment</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            From a kit to a factory. Earned, not granted. The world needs more builders.
          </p>
          <div className="flex gap-3 justify-center">
            {!user ? (
              <Link to="/auth">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
                  <Users className="w-5 h-5" /> Sign Up
                </Button>
              </Link>
            ) : (
              <Link to="/production">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-500 text-white gap-2">
                  <Rocket className="w-5 h-5" /> Go to Projects
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </PortalPageLayout>
  );
}
