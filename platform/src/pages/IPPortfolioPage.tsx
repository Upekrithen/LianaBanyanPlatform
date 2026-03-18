import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, Shield, Award, FileText, Users, Lock,
  ChevronDown, ChevronUp, ExternalLink, QrCode, Briefcase, Sparkles,
} from 'lucide-react';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';

type ViewMode = 'brand' | 'pedestal' | 'upekrithen_ledger' | 'initiative' | 'bag' | 'overview';

const BAG_LABELS: Record<string, { name: string; range: string; claims: number }> = {
  '1': { name: 'Bag 1 — Core Platform', range: '#1–#37', claims: 123 },
  '2': { name: 'Bag 2 — Physical + Community', range: '#38–#51', claims: 72 },
  '3': { name: 'Bag 3 — HexIsle / Tereno', range: 'HexIsle + Hydraulic', claims: 397 },
  '4': { name: 'Bag 4 — Defense Klaus → MSA', range: 'Defense through MSA', claims: 292 },
  '5': { name: 'Bag 5 — Ghost World', range: 'Ghost + Extensions', claims: 44 },
  '6': { name: 'Bag 6 — LEVIATHAN PLUS', range: 'Leviathan expansion', claims: 408 },
  '7': { name: 'Bag 7 — Full Specs', range: '#1001–#1690', claims: 0 },
};

const INITIATIVES = [
  "Let's Make Dinner", "Let's Get Groceries", "Let's Go Shopping",
  "Household Concierge", "The Family Table", "LifeLine Medications",
  "MSA", "Defense Klaus", "Rally Group", "VSL",
  "Let's Make Bread", "Harper Guild", "JukeBox",
  "Didasko", "Power to the People", "Brass Tacks",
];

function resolveViewMode(qrCode?: string): { mode: ViewMode; context: string } {
  if (!qrCode) return { mode: 'overview', context: '' };

  if (qrCode.startsWith('PQR-')) {
    return { mode: 'brand', context: qrCode };
  }
  if (qrCode.startsWith('BAG-')) {
    return { mode: 'bag', context: qrCode.replace('BAG-', '') };
  }
  if (qrCode.startsWith('PED-')) {
    return { mode: 'pedestal', context: qrCode.replace('PED-', '') };
  }
  if (qrCode.startsWith('INIT-')) {
    return { mode: 'initiative', context: qrCode.replace('INIT-', '') };
  }
  if (qrCode === 'LEDGER' || qrCode === 'upekrithen') {
    return { mode: 'upekrithen_ledger', context: '' };
  }

  return { mode: 'overview', context: qrCode };
}

function StatCard({ label, value, icon: Icon, sub }: {
  label: string; value: string | number; icon: React.ElementType; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-purple-500/20"
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-purple-400" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

function BagCard({ id, bag }: { id: string; bag: { name: string; range: string; claims: number } }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      className="bg-slate-800/50 rounded-lg border border-purple-500/10 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-amber-400" />
          <span className="font-medium text-white">{bag.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{bag.range}</span>
          {bag.claims > 0 && (
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
              {bag.claims} claims
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            <div className="text-sm text-slate-400 space-y-2">
              <p>Innovation range: {bag.range}</p>
              {bag.claims > 0 && <p>Formal patent claims filed: {bag.claims}</p>}
              {id === '7' && <p>653 innovations with full inline patent specifications. Filed March 15, 2026.</p>}
              <Link
                to={`/ip-portfolio/BAG-${id}`}
                className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors mt-2"
              >
                View bag details <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function OverviewView({ stats }: { stats: ReturnType<typeof useCanonicalStats> }) {
  const [search, setSearch] = useState('');

  const filteredBags = useMemo(() => {
    if (!search) return Object.entries(BAG_LABELS);
    return Object.entries(BAG_LABELS).filter(([, bag]) =>
      bag.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Innovations" value={stats.innovationCount} icon={Sparkles} sub="Cataloged and documented" />
        <StatCard label="Patent Claims" value={stats.patentClaims} icon={FileText} sub={`Across ${stats.patentApplications} provisionals`} />
        <StatCard label="Crown Jewels" value={stats.crownJewels} icon={Award} sub="Flagship innovations" />
        <StatCard label="Spec-Expanded" value={stats.specExpanded} icon={Shield} sub="Full patent-quality specs" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Domains" value={stats.domains} icon={Users} />
        <StatCard label="Initiatives" value={stats.initiatives} icon={Users} sub="The Sweet Sixteen" />
        <StatCard label="Creator Keeps" value={`${stats.creatorKeepsPct}%`} icon={Lock} sub="On every transaction" />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Filing Bags</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter bags..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="space-y-2">
          {filteredBags.map(([id, bag]) => (
            <BagCard key={id} id={id} bag={bag} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">The Sweet Sixteen Initiatives</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {INITIATIVES.map((name, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700/50 text-sm text-slate-300">
              <span className="text-purple-400 font-mono mr-2">{i + 1}.</span>
              {name}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/30 to-amber-900/20 rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-2">Applications Filed</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2">Application</th>
                <th className="text-left py-2">Filed</th>
                <th className="text-right py-2">Claims</th>
                <th className="text-left py-2">Scope</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/925,672</td><td>Nov 25–26, 2025</td><td className="text-right">123</td><td>Core Platform (#1–#37)</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/927,674</td><td>Nov 30, 2025</td><td className="text-right">72</td><td>Physical + Community</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/938,216</td><td>Dec 10, 2025</td><td className="text-right">397</td><td>HexIsle / Tereno</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/967,200</td><td>Jan 23–24, 2026</td><td className="text-right">292</td><td>Defense Klaus → MSA</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/969,601</td><td>Jan 28, 2026</td><td className="text-right">44</td><td>Ghost World</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">63/989,913</td><td>Feb 24, 2026</td><td className="text-right">408</td><td>LEVIATHAN PLUS</td></tr>
              <tr className="border-b border-slate-800"><td className="py-2 font-mono">64/006,010</td><td>Mar 15, 2026</td><td className="text-right text-slate-500">TBD</td><td>Full Specs (#1001–#1690)</td></tr>
              <tr className="font-bold text-white"><td className="py-2">Total</td><td></td><td className="text-right">1,336+</td><td>7 provisional applications</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LedgerView({ stats }: { stats: ReturnType<typeof useCanonicalStats> }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-900/30 to-purple-900/20 rounded-xl p-6 border border-amber-500/20">
        <h2 className="text-2xl font-bold text-white mb-2">Upekrithen Ledger</h2>
        <p className="text-slate-400">
          The Founder retains 20% of all {stats.innovationCount.toLocaleString()} innovations as permanently reserved.
          This ledger shows the complete innovation catalog owned by Liana Banyan Corporation.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Innovations" value={stats.innovationCount} icon={Sparkles} />
        <StatCard label="Founder Reserve" value={Math.ceil(stats.innovationCount * 0.2)} icon={Lock} sub="20% permanently reserved" />
        <StatCard label="Available for Sponsorship" value={Math.floor(stats.innovationCount * 0.8)} icon={Users} sub="80% open to sponsors" />
        <StatCard label="Crown Jewels" value={stats.crownJewels} icon={Award} />
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-3">Anti-Concentration Provisions</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p><span className="text-amber-400 font-medium">Founder Reserve:</span> 20% of patents permanently reserved</p>
          <p><span className="text-amber-400 font-medium">Single-Entity Cap:</span> Max 5% regardless of funding</p>
          <p><span className="text-amber-400 font-medium">Discipline Limits:</span> Max 2 patents per discipline per sponsor</p>
          <p><span className="text-amber-400 font-medium">Community Oversight:</span> {'>'}10 patents requires 60% member vote</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-bold text-white mb-3">Coverage Map</h3>
        <div className="space-y-1">
          {Object.entries(BAG_LABELS).map(([id, bag]) => (
            <div key={id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
              <span className="text-slate-300 text-sm">{bag.name}</span>
              <span className="text-purple-400 text-sm font-mono">{bag.range}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BagView({ bagId, stats }: { bagId: string; stats: ReturnType<typeof useCanonicalStats> }) {
  const bag = BAG_LABELS[bagId];
  if (!bag) return <div className="text-slate-400">Unknown bag: {bagId}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-900/30 to-slate-800 rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-2xl font-bold text-white mb-2">{bag.name}</h2>
        <p className="text-slate-400">Innovation range: {bag.range}</p>
        {bag.claims > 0 && (
          <p className="text-purple-300 mt-2">{bag.claims} formal patent claims filed</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Innovations in Bag" value={bag.range} icon={FileText} />
        <StatCard label="Patent Claims" value={bag.claims || 'TBD'} icon={Shield} />
      </div>
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-slate-400">
        <p>Pedestal contents for this bag are managed by curators. Changes are immutably recorded in the
          IP ledger. Innovation assignments can be rebalanced quarterly based on performance and strategic needs.</p>
      </div>
    </div>
  );
}

export default function IPPortfolioPage() {
  const { qrCode } = useParams<{ qrCode?: string }>();
  const stats = useCanonicalStats();
  const { mode, context } = resolveViewMode(qrCode);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                IP Portfolio
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {stats.innovationCount.toLocaleString()} innovations &middot; {stats.patentClaims.toLocaleString()} claims &middot; {stats.patentApplications} provisionals
              </p>
            </div>
          </div>
          {qrCode && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">
              <QrCode className="w-3 h-3" />
              <span className="font-mono">{qrCode}</span>
            </div>
          )}
        </div>

        {mode === 'overview' && <OverviewView stats={stats} />}
        {mode === 'upekrithen_ledger' && <LedgerView stats={stats} />}
        {mode === 'bag' && <BagView bagId={context} stats={stats} />}
        {mode === 'brand' && <OverviewView stats={stats} />}
        {mode === 'pedestal' && <OverviewView stats={stats} />}
        {mode === 'initiative' && <OverviewView stats={stats} />}

        <div className="mt-12 text-center text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} Liana Banyan Corporation &middot; $5/year membership &middot; Creators keep {stats.creatorKeepsPct}%
        </div>
      </div>
    </div>
  );
}
