/**
 * UpekrithenLanding — Founder Admin Dashboard
 * Quick-access hub for all MoneyPenny functions and system health.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Inbox, FileText, MessageSquare, Radio,
  Activity, RefreshCw, Loader2, CheckCircle, XCircle,
  Shield, Zap, ExternalLink, Crown, DollarSign, Briefcase,
  ChevronDown, ChevronUp, Gem, Scale, Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";

const ADMIN_LINKS = [
  { label: "Inbox / MoneyPenny", href: "/inbox", icon: Inbox, desc: "AI assistant, SMS drafts, pending actions" },
  { label: "Briefing", href: "/briefing", icon: FileText, desc: "Session summaries, handoff reports" },
  { label: "QA Review", href: "/qa", icon: Activity, desc: "Quality assurance, consistency checks" },
  { label: "Social Queue", href: "/social", icon: Radio, desc: "Auto-post queue, draft review, scheduling" },
] as const;

const PORTAL_LINKS = [
  { label: "Marketplace", url: "https://lianabanyan.com", emoji: "🏪" },
  { label: "Business", url: "https://lianabanyan.biz", emoji: "💼" },
  { label: "Non-Profit", url: "https://lianabanyan.org", emoji: "🏛️" },
  { label: "Network", url: "https://lianabanyan.net", emoji: "🔗" },
  { label: "DSS", url: "https://the2ndsecond.com", emoji: "🖨️" },
  { label: "HexIsle", url: "https://hexisle.com", emoji: "🏝️" },
  { label: "Cephas", url: "/cephas", emoji: "📚" },
] as const;

/* ─── Patent Bag static data (matches IPPortfolioPage) ─── */
const BAG_DATA: { id: string; name: string; range: string; claims: number; filed?: string; appNo?: string }[] = [
  { id: "1", name: "Core Platform Architecture", range: "#1–#37", claims: 123, filed: "2025-11-26", appNo: "63/925,672" },
  { id: "2", name: "Physical + Community", range: "#38–#51", claims: 72, filed: "2025-11-30", appNo: "63/927,674" },
  { id: "3", name: "HexIsle / Tereno (Behemoth)", range: "#211–#956", claims: 397, filed: "2025-12-10", appNo: "63/938,216" },
  { id: "4", name: "Defense Klaus → MSA", range: "#54–#120", claims: 292, filed: "2026-01-23", appNo: "63/967,200" },
  { id: "5", name: "Ghost World / Non-Speculative", range: "#121–#210", claims: 44, filed: "2026-01-28", appNo: "63/969,601" },
  { id: "6", name: "LEVIATHAN PLUS", range: "#956–#1329", claims: 408, filed: "2026-02-24", appNo: "63/989,913" },
  { id: "7", name: "Full Spec Expansions", range: "#1001–#1719", claims: 0, filed: "2026-03-15", appNo: "Prov 7" },
  { id: "8", name: "Character Layers + Hitbase", range: "#1720–#1748", claims: 0, filed: "2026-03-17", appNo: "Prov 8" },
  { id: "9", name: "Post-Pollinate Session", range: "#1749–#1979", claims: 120, filed: "2026-03-25", appNo: "Prov 9" },
];

const FMT = new Intl.NumberFormat("en-US");
const USD = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/* ─── Crown Jewels Audit Panel ─── */
function CrownJewelsPanel({ stats }: { stats: ReturnType<typeof useCanonicalStats> }) {
  const [showAll, setShowAll] = useState(false);

  const { data: crownJewelRows, isLoading: jewelsLoading } = useQuery({
    queryKey: ["crown-audit-jewels"],
    queryFn: async () => {
      const { data } = await supabase
        .from("innovation_log" as never)
        .select("innovation_number, title, category, patent_bag, is_crown_jewel")
        .eq("is_crown_jewel", true)
        .order("innovation_number", { ascending: true }) as {
        data: { innovation_number: number; title: string; category: string | null; patent_bag: string | null; is_crown_jewel: boolean }[] | null;
      };
      return data || [];
    },
    staleTime: 5 * 60_000,
  });

  const { data: catBreakdown, isLoading: catLoading } = useQuery({
    queryKey: ["crown-audit-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("innovation_log" as never)
        .select("category") as { data: { category: string | null }[] | null };
      if (!data) return [];
      const counts: Record<string, number> = {};
      for (const r of data) {
        const cat = r.category || "Uncategorized";
        counts[cat] = (counts[cat] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([cat, count]) => ({ cat, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60_000,
  });

  const { data: bagBreakdown, isLoading: bagLoading } = useQuery({
    queryKey: ["crown-audit-bags"],
    queryFn: async () => {
      const { data } = await supabase
        .from("innovation_log" as never)
        .select("patent_bag") as { data: { patent_bag: string | null }[] | null };
      if (!data) return [];
      const counts: Record<string, number> = {};
      for (const r of data) {
        const bag = r.patent_bag || "Unassigned";
        counts[bag] = (counts[bag] || 0) + 1;
      }
      return Object.entries(counts)
        .map(([bag, count]) => ({ bag, count }))
        .sort((a, b) => b.count - a.count);
    },
    staleTime: 5 * 60_000,
  });

  const loading = jewelsLoading || catLoading || bagLoading;
  const liveCount = crownJewelRows?.length ?? 0;
  const visibleJewels = showAll ? crownJewelRows : crownJewelRows?.slice(0, 30);

  return (
    <div className="space-y-6 p-4 bg-zinc-900/70 rounded-xl border border-amber-900/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
          <Crown className="w-5 h-5" /> Crown Jewels Audit
        </h3>
        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-lg px-3">
          {FMT.format(liveCount || stats.crownJewels)} Crown Jewels (live)
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-2xl font-mono text-amber-400">{FMT.format(stats.innovationCount)}</p>
          <p className="text-xs text-zinc-500">Total Innovations</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-2xl font-mono text-amber-400">{FMT.format(stats.patentClaims)}</p>
          <p className="text-xs text-zinc-500">Patent Claims</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-2xl font-mono text-amber-400">{stats.patentApplications}</p>
          <p className="text-xs text-zinc-500">Provisionals Filed</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Querying innovation_log…</div>
      ) : (
        <>
          {/* Crown Jewels List */}
          {visibleJewels && visibleJewels.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
                <Gem className="w-4 h-4" /> Crown Jewels ({liveCount})
              </h4>
              <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                {visibleJewels.map((r) => (
                  <div key={r.innovation_number} className="flex items-center gap-2 text-sm py-1 border-b border-amber-900/20">
                    <span className="font-mono text-amber-500 w-12 text-right shrink-0">#{r.innovation_number}</span>
                    <span className="text-zinc-300 truncate">{r.title}</span>
                    {r.category && (
                      <Badge variant="outline" className="ml-auto text-[10px] shrink-0 border-zinc-700 text-zinc-500">
                        {r.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              {!showAll && liveCount > 30 && (
                <Button variant="ghost" size="sm" className="mt-2 text-amber-400" onClick={() => setShowAll(true)}>
                  Show all {liveCount} Crown Jewels
                </Button>
              )}
              {showAll && liveCount > 30 && (
                <Button variant="ghost" size="sm" className="mt-2 text-zinc-500" onClick={() => setShowAll(false)}>
                  Collapse
                </Button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Category */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">By Category</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {catBreakdown?.slice(0, 20).map((r) => (
                  <div key={r.cat} className="flex items-center justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-300 truncate max-w-[180px]">{r.cat}</span>
                    <span className="font-mono text-amber-400">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* By Patent Bag */}
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">By Patent Bag</h4>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
                {bagBreakdown?.slice(0, 20).map((r) => (
                  <div key={r.bag} className="flex items-center justify-between text-sm py-1 border-b border-zinc-800/50">
                    <span className="text-zinc-300 truncate max-w-[180px]">{r.bag}</span>
                    <span className="font-mono text-amber-400">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Portfolio Valuation Panel ─── */
function PortfolioValuationPanel({ stats }: { stats: ReturnType<typeof useCanonicalStats> }) {
  const LOW_PER_CLAIM = 450;
  const HIGH_PER_CLAIM = 80_000;
  const FILING_COST_PER_APP = 65;

  const lowVal = stats.patentClaims * LOW_PER_CLAIM;
  const highVal = stats.patentClaims * HIGH_PER_CLAIM;
  const filingCost = stats.patentApplications * FILING_COST_PER_APP;
  const roiLow = stats.personalInvestment > 0 ? lowVal / stats.personalInvestment : 0;
  const roiHigh = stats.personalInvestment > 0 ? highVal / stats.personalInvestment : 0;
  const totalBagClaims = BAG_DATA.reduce((s, b) => s + b.claims, 0);

  return (
    <div className="space-y-6 p-4 bg-zinc-900/70 rounded-xl border border-emerald-900/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
          <Scale className="w-5 h-5" /> Patent Portfolio Valuation
        </h3>
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs">
          Industry Benchmark Method
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-emerald-900/20">
          <p className="text-xs text-zinc-500 mb-1">Conservative (${FMT.format(LOW_PER_CLAIM)}/claim)</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{USD.format(lowVal)}</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-emerald-900/20">
          <p className="text-xs text-zinc-500 mb-1">High (${FMT.format(HIGH_PER_CLAIM)}/claim)</p>
          <p className="text-2xl font-mono font-bold text-emerald-400">{USD.format(highVal)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xl font-mono text-zinc-200">{FMT.format(stats.patentClaims)}</p>
          <p className="text-[10px] text-zinc-500">Total Claims</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xl font-mono text-zinc-200">{stats.patentApplications}</p>
          <p className="text-[10px] text-zinc-500">Applications Filed</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xl font-mono text-zinc-200">{USD.format(filingCost)}</p>
          <p className="text-[10px] text-zinc-500">Filing Cost ($65 × {stats.patentApplications})</p>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-3">
          <p className="text-xl font-mono text-zinc-200">{USD.format(stats.personalInvestment)}</p>
          <p className="text-[10px] text-zinc-500">Personal Commitment ({stats.investmentYears} yrs)</p>
        </div>
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-4 border border-emerald-900/20">
        <h4 className="text-sm font-semibold text-zinc-400 mb-3">Return Multiple</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-zinc-500">Conservative</p>
            <p className="text-3xl font-mono font-bold text-emerald-400">{roiLow.toFixed(1)}×</p>
            <p className="text-[10px] text-zinc-600">{USD.format(lowVal)} / {USD.format(stats.personalInvestment)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">High</p>
            <p className="text-3xl font-mono font-bold text-emerald-400">{FMT.format(Math.round(roiHigh))}×</p>
            <p className="text-[10px] text-zinc-600">{USD.format(highVal)} / {USD.format(stats.personalInvestment)}</p>
          </div>
        </div>
      </div>

      {/* Per-application breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-zinc-400 mb-2">Per-Application Breakdown</h4>
        <div className="space-y-1">
          {BAG_DATA.filter((b) => b.claims > 0).map((b) => (
            <div key={b.id} className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-800/50">
              <span className="text-zinc-300">Bag {b.id}: {b.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-zinc-500 text-xs">{b.claims} claims</span>
                <span className="font-mono text-emerald-400 text-xs w-24 text-right">
                  {USD.format(b.claims * LOW_PER_CLAIM)} – {USD.format(b.claims * HIGH_PER_CLAIM)}
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm py-1.5 font-semibold">
            <span className="text-zinc-200">Total from bags</span>
            <span className="font-mono text-emerald-400">{FMT.format(totalBagClaims)} claims</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Patent Bags Summary Panel ─── */
function PatentBagsPanel() {
  return (
    <div className="space-y-4 p-4 bg-zinc-900/70 rounded-xl border border-purple-900/30">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
          <Package className="w-5 h-5" /> Patent Bags
        </h3>
        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40">
          {BAG_DATA.length} Applications
        </Badge>
      </div>

      <div className="space-y-3">
        {BAG_DATA.map((bag) => (
          <div
            key={bag.id}
            className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 hover:border-purple-700/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-purple-400">{bag.id}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{bag.name}</p>
                  <p className="text-xs text-zinc-500">{bag.appNo}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                {bag.claims > 0 ? (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {bag.claims} claims
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-zinc-500 border-zinc-700">
                    Spec-only
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span>Range: {bag.range}</span>
              {bag.filed && <span>Filed: {bag.filed}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
        <p className="text-xs text-zinc-500">
          Total claims across all bags: <span className="font-mono text-purple-400 font-semibold">{FMT.format(BAG_DATA.reduce((s, b) => s + b.claims, 0))}</span>
        </p>
      </div>
    </div>
  );
}

export default function UpekrithenLanding() {
  const stats = useCanonicalStats();
  const [mercuryStatus, setMercuryStatus] = useState<"idle" | "pinging" | "success" | "error">("idle");
  const [mercuryMsg, setMercuryMsg] = useState("");
  const [openPanel, setOpenPanel] = useState<"crown" | "valuation" | "bags" | null>(null);

  const togglePanel = (panel: "crown" | "valuation" | "bags") =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const pingMercury = async () => {
    setMercuryStatus("pinging");
    try {
      const { data, error } = await supabase.functions.invoke("mercury-keepalive");
      if (error || !data?.success) {
        setMercuryStatus("error");
        setMercuryMsg(error?.message || data?.error || "Unknown error");
      } else {
        setMercuryStatus("success");
        setMercuryMsg(data.message || "Token kept alive");
      }
    } catch (err: any) {
      setMercuryStatus("error");
      setMercuryMsg(err.message || "Network error");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-amber-900/30 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-amber-400">Upekrithen</h1>
            <span className="text-xs text-zinc-500 hidden sm:inline">Fortress of Solitude</span>
          </div>
          <a
            href="https://lianabanyan.com/dashboard"
            className="text-sm text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            Marketplace <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">MoneyPenny Functions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ADMIN_LINKS.map((link) => (
              <Link key={link.href} to={link.href}>
                <Card className="bg-zinc-900/50 border-zinc-800 hover:border-amber-600/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-amber-400 text-base">
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-500">{link.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* System Health */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mercury Keepalive */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-zinc-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Mercury Keepalive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={pingMercury}
                  disabled={mercuryStatus === "pinging"}
                  variant="outline"
                  size="sm"
                  className="border-amber-500/50 hover:bg-amber-500/10 text-amber-300"
                >
                  {mercuryStatus === "pinging" ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : mercuryStatus === "success" ? (
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  ) : mercuryStatus === "error" ? (
                    <XCircle className="w-4 h-4 mr-2 text-red-400" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Ping Mercury
                </Button>
                {mercuryMsg && (
                  <p className={`text-sm ${mercuryStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                    {mercuryMsg}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Platform Stats (live from canonical) */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-zinc-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Platform Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-zinc-500">Innovations</span>
                    <p className="text-lg font-mono text-amber-400">{FMT.format(stats.innovationCount)}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Portals</span>
                    <p className="text-lg font-mono text-amber-400">7</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Initiatives</span>
                    <p className="text-lg font-mono text-amber-400">{stats.initiatives}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Membership</span>
                    <p className="text-lg font-mono text-amber-400">${stats.membershipCost}/yr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Helm Command Center */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Helm Command Center</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Button
              onClick={() => togglePanel("crown")}
              variant="outline"
              className={`h-auto py-4 flex flex-col items-center gap-2 border-amber-500/30 hover:bg-amber-500/10 ${openPanel === "crown" ? "bg-amber-500/10 border-amber-500" : ""}`}
            >
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">Crown Jewels Audit</span>
              <span className="text-xs text-zinc-500">{FMT.format(stats.crownJewels)} jewels</span>
              {openPanel === "crown" ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </Button>
            <Button
              onClick={() => togglePanel("valuation")}
              variant="outline"
              className={`h-auto py-4 flex flex-col items-center gap-2 border-emerald-500/30 hover:bg-emerald-500/10 ${openPanel === "valuation" ? "bg-emerald-500/10 border-emerald-500" : ""}`}
            >
              <Scale className="w-6 h-6 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">Portfolio Valuation</span>
              <span className="text-xs text-zinc-500">{FMT.format(stats.patentClaims)} claims</span>
              {openPanel === "valuation" ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </Button>
            <Button
              onClick={() => togglePanel("bags")}
              variant="outline"
              className={`h-auto py-4 flex flex-col items-center gap-2 border-purple-500/30 hover:bg-purple-500/10 ${openPanel === "bags" ? "bg-purple-500/10 border-purple-500" : ""}`}
            >
              <Package className="w-6 h-6 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Patent Bags</span>
              <span className="text-xs text-zinc-500">{BAG_DATA.length} applications</span>
              {openPanel === "bags" ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
            </Button>
          </div>

          {openPanel === "crown" && <CrownJewelsPanel stats={stats} />}
          {openPanel === "valuation" && <PortfolioValuationPanel stats={stats} />}
          {openPanel === "bags" && <PatentBagsPanel />}
        </section>

        {/* Portal Quick Links */}
        <section>
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">All Portals</h2>
          <div className="flex flex-wrap gap-3">
            {PORTAL_LINKS.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 hover:border-amber-600/50 rounded-lg text-sm text-zinc-300 hover:text-amber-400 transition-colors"
              >
                <span>{p.emoji}</span>
                {p.label}
                <ExternalLink className="w-3 h-3 opacity-50" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
