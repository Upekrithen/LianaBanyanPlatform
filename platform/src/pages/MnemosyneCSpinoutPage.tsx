/**
 * MnemosyneCSpinoutPage -- Wave 23 Phase beta
 * ============================================
 * Route: /spinouts/mnemosyne-c  (alias: /spinouts/mnemosynec-spinout)
 *
 * "The spinout that proves the model."
 * MnemosyneC is the flagship spinout exemplar -- it demonstrates how technology
 * developed inside a cooperative becomes a standalone entity while preserving
 * Cost+20%, member Marks, and IP-Ledger integrity.
 *
 * Benchmarks: 83.3% / 92.7% / 3.6% -- link to /proofs.
 * Securities-clean: Marks = participation, never equity or guaranteed return.
 */
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  CheckCircle,
  BookOpen,
  Cpu,
  Star,
  TrendingUp,
  Users,
  Lock,
  FlaskConical,
  Database,
  GitBranch,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

const BENCHMARKS = [
  {
    value: "83.3%",
    label: "Cost retained by node operators",
    detail:
      "Every MnemosyneC subscription fee: 83.3% stays with the team that built and maintains the model. 16.7% funds platform infrastructure.",
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    liveKey: "cost_parity",
  },
  {
    value: "92.7%",
    label: "Cardboard Boots recall rate",
    detail:
      "MnemosyneC's provenance tracking reaches 92.7% recall on the Cardboard Boots benchmark -- the corpus used to test whether a knowledge system can trace every claim back to its source.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    liveKey: "cardboard_boots",
  },
  {
    value: "3.6%",
    label: "Hallucination rate (vs. 20%+ baseline)",
    detail:
      "The hash-chained IP-Ledger backend reduces hallucination by forcing every assertion to a ledger reference. Frontier models without this layer average 20% or higher on the same benchmark.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    liveKey: "hallucination_rate",
  },
];

const SPINOUT_MODEL_STEPS = [
  {
    step: "1",
    title: "Technology built inside the cooperative",
    detail:
      "MnemosyneC started as the memory layer for LianaBanyan's own operations. The IP-Ledger, provenance tracking, and corpus management tools were built to serve member needs first.",
  },
  {
    step: "2",
    title: "IP logged to the cooperative ledger",
    detail:
      "Every improvement to the MnemosyneC system is recorded as an IP-Ledger entry with full contributor attribution. No contributor can later claim sole ownership; the ledger is the record.",
  },
  {
    step: "3",
    title: "External market identified",
    detail:
      "Other cooperatives, community land trusts, and mutual aid networks have the same institutional-memory problem. MnemosyneC's solution applies beyond LianaBanyan.",
  },
  {
    step: "4",
    title: "Spinout entity formed",
    detail:
      "The cooperative ratifies the spinout charter. The spinout holds a license to the MnemosyneC IP while the cooperative retains the ledger record. The spinout operates under Cost+20%.",
  },
  {
    step: "5",
    title: "Members earn Marks for contributions",
    detail:
      "Contributors to MnemosyneC's ongoing development earn Marks in the cooperative. Marks represent participation -- not equity in the spinout entity.",
  },
  {
    step: "6",
    title: "Benchmarks published to /proofs",
    detail:
      "The 83.3% / 92.7% / 3.6% numbers are not marketing claims. They are benchmark results published to /proofs with the test datasets, methodology, and reproducibility instructions.",
  },
];

// ─── Live-data hook: benchmark runs (read from mnemo_benchmark_runs) ──────────

interface MnemoBenchmarkRun {
  run_uuid: string;
  model_version: string;
  benchmark_name: string;
  score: number;
  score_unit: string;
  run_hash: string;
  run_at: string;
  notes: string | null;
}

function useMnemoBenchmarks() {
  return useQuery<MnemoBenchmarkRun[]>({
    queryKey: ["mnemo-benchmark-runs"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("mnemo_benchmark_runs")
        .select("run_uuid, model_version, benchmark_name, score, score_unit, run_hash, run_at, notes")
        .eq("published", true)
        .order("run_at", { ascending: false })
        .limit(10);
      return (data as MnemoBenchmarkRun[] | null) ?? [];
    },
    staleTime: 5 * 60_000,
  });
}

export default function MnemosyneCSpinoutPage() {
  usePageSEO({
    title: "Mnemosyne-C | Liana Banyan Spinout",
    description: "Cooperative knowledge archiving and community memory system. A spinout from the Liana Banyan platform.",
    canonical: "https://lianabanyan.com/spinouts/mnemosyne-c",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: benchmarkRuns } = useMnemoBenchmarks();

  // Pick the latest score for each benchmark, or fall back to canon
  function latestScore(name: string, fallback: string): string {
    const run = (benchmarkRuns ?? []).find((r) => r.benchmark_name === name);
    return run ? `${run.score}%` : fallback;
  }

  return (
    <PortalPageLayout variant="stage" xrayId="mnemosynec-spinout-page">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/spinouts")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All 7 Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30 p-8">
          <div className="flex items-start gap-5">
            <Brain className="h-14 w-14 text-violet-400 shrink-0 mt-1" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">MnemosyneC</h1>
                <Badge variant="outline" className="border-violet-500/40 text-violet-400">
                  Knowledge & AI
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-400 text-xs flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Forming
                </Badge>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                  Spinout Exemplar
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The spinout that proves the model. MnemosyneC began as LianaBanyan's own memory
                layer and became the blueprint for how every cooperative technology spinout works:
                IP-Ledger provenance, Cost+20% economics, and benchmark-verified quality published
                to /proofs for anyone to reproduce.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                  onClick={() => navigate("/proofs")}
                >
                  <ExternalLink className="h-3 w-3" />
                  View Benchmark Proofs
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60 italic">
                Marks = cooperative participation. Not equity, shares, or guaranteed financial return.
              </p>
            </div>
          </div>
        </div>

        {/* Benchmarks */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-violet-400" />
            <h2 className="text-xl font-bold">The Three Numbers</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            MnemosyneC's performance is measured on three canonical benchmarks. These are not
            internal targets -- they are published results at{" "}
            <button
              onClick={() => navigate("/proofs")}
              className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
            >
              /proofs
            </button>{" "}
            with full methodology and reproducibility instructions.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {BENCHMARKS.map(({ value, label, detail, color, bg, liveKey }) => (
              <div key={value} className={`rounded-xl border p-5 space-y-2 ${bg}`}>
                <div className={`text-4xl font-black ${color}`}>
                  {liveKey ? latestScore(liveKey, value) : value}
                </div>
                <div className="font-semibold text-sm text-foreground">{label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{detail}</p>
                {liveKey && benchmarkRuns && benchmarkRuns.find((r) => r.benchmark_name === liveKey) && (
                  <p className="text-xs text-violet-400/70 font-mono">
                    hash: {benchmarkRuns.find((r) => r.benchmark_name === liveKey)!.run_hash.slice(0, 12)}...
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-violet-400"
              onClick={() => navigate("/proofs")}
            >
              Full benchmark evidence at /proofs
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* The Spinout Model */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-violet-400" />
            <h2 className="text-xl font-bold">The Spinout Model -- Step by Step</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            MnemosyneC is the reference implementation for how any cooperative technology becomes a
            spinout. Every future spinout follows the same six steps.
          </p>
          <div className="space-y-3">
            {SPINOUT_MODEL_STEPS.map(({ step, title, detail }) => (
              <div
                key={step}
                className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:border-violet-500/30 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300 shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Business Model */}
        <Card className="border-violet-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-violet-400" />
              Full Business Model
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Marks = participation, not equity.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">The Problem</p>
                <p className="text-muted-foreground">
                  Cooperatives and community organizations lose institutional knowledge constantly.
                  There is no memory layer that is affordable, open, and built for community
                  governance.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Who We Serve</p>
                <p className="text-muted-foreground">
                  Other cooperatives, community land trusts, mutual aid networks, and any
                  organization that needs durable memory without corporate lock-in.
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">The Offering</p>
                <p className="text-muted-foreground italic">
                  "I provide cooperative organizations with durable, provenance-tracked knowledge
                  infrastructure so their institutional memory survives leadership transitions."
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Base subscription per organization</span>
                    <span className="font-mono font-bold text-foreground">$20/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operations team share (83.3%)</span>
                    <span className="font-mono text-emerald-400">$16.66/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform infrastructure (16.7%)</span>
                    <span className="font-mono text-muted-foreground">$3.34/month</span>
                  </div>
                  <div className="border-t border-border pt-2 text-xs">
                    Specialized fine-tunes and large-corpus hosting priced at Cost+20% on actual
                    compute. Base model access is included for all cooperative members.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: MnemosyneC spinout charter filed</li>
                <li>Day 60: First external cooperative customer onboarded</li>
                <li>Day 90: Benchmark verification published to /proofs</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* How Marks Work Here */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Member Marks for MnemosyneC Contributions
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Members who contribute to MnemosyneC's development earn Marks in the cooperative.
              Contribution categories include:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Database,
                  title: "Corpus contributions",
                  detail:
                    "Adding curated documents, citations, or structured knowledge to the shared corpus",
                },
                {
                  icon: FlaskConical,
                  title: "Benchmark runs",
                  detail:
                    "Running the Cardboard Boots or hallucination benchmarks and submitting results",
                },
                {
                  icon: GitBranch,
                  title: "IP-Ledger branch work",
                  detail:
                    "Proposing and implementing provenance improvements to the hash-chain model",
                },
                {
                  icon: Layers,
                  title: "Integration builds",
                  detail:
                    "Building MnemosyneC connectors for other cooperative initiatives or external systems",
                },
              ].map(({ icon: Icon, title, detail }) => (
                <div key={title} className="flex gap-3 p-3 rounded-lg border border-border">
                  <Icon className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-xs">{title}</p>
                    <p className="text-xs mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
              <strong>Securities-clean reminder:</strong> Marks represent participation in the
              cooperative -- not equity, shares, or any ownership stake in the MnemosyneC spinout
              entity. Spinout participation is governed by the spinout's own structure.
            </div>
          </CardContent>
        </Card>

        {/* IP-Ledger */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-400" />
              IP-Ledger: Every Improvement Preserved
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              The IP-Ledger is the authoritative record of every contribution to MnemosyneC. It is
              hash-chained: each entry references the previous entry's hash, making the record
              tamper-evident. No contributor can retroactively remove their attribution or another
              contributor's.
            </p>
            <div className="rounded-lg border border-border p-4 font-mono text-xs space-y-1">
              <p className="text-foreground font-semibold">Sample MnemosyneC IP-Ledger entry:</p>
              <p>type: innovation.registered</p>
              <p>category: mnemosynec.provenance-improvement</p>
              <p>title: "Hash-chain depth increase to 256-bit"</p>
              <p>contributor: member#0092</p>
              <p>co_authors: [member#0144, member#0271]</p>
              <p>benchmark_delta: hallucination -1.2pp (3.6% to 2.4%)</p>
              <p>previous_hash: 0xf4a1...</p>
              <p>current_hash: 0x9b3c...</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs">
                All MnemosyneC model improvements are logged before deployment. The ledger is
                counsel-gated for patent or contributor-contract enforcement.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Why It Is the Exemplar */}
        <Card className="border-violet-500/20 bg-violet-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-violet-400" />
              Why MnemosyneC Is the Exemplar
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              Not every spinout will be a knowledge-management system. But every spinout will face
              the same questions: How does the cooperative retain ownership of the IP? How do
              contributing members earn recognition? How do we prove quality claims? How does the
              spinout price its services fairly?
            </p>
            <p>
              MnemosyneC answers all four. The IP-Ledger solves ownership. Marks solve recognition.
              The published benchmarks at /proofs solve quality claims. Cost+20% solves pricing.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 pt-2">
              {[
                {
                  icon: BookOpen,
                  label: "IP-Ledger",
                  sub: "Cooperative ownership record",
                },
                { icon: Star, label: "Marks", sub: "Contributor recognition" },
                {
                  icon: FlaskConical,
                  label: "/proofs benchmarks",
                  sub: "Verifiable quality claims",
                },
                { icon: TrendingUp, label: "Cost+20%", sub: "Fair pricing model" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                  <Icon className="h-5 w-5 text-violet-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Founder Bio */}
        <Card className="border-violet-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Not Built by a Faceless Corporation.
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              <div className="shrink-0">
                <figure className="w-[120px]">
                  <img
                    src="/img/founder/mark-9-24-forearm-01.jpg"
                    alt="Mark 9:24 -- Lord, I believe; help thou mine unbelief."
                    className="w-[120px] rounded-lg border border-border"
                    width={120}
                  />
                  <figcaption className="text-xs text-muted-foreground/70 mt-1 leading-snug">
                    Mark 9:24 -- Lord, I believe; help thou mine unbelief.{" "}
                    <button
                      onClick={() => navigate("/founder/faith-statement")}
                      className="underline underline-offset-2 hover:text-violet-400"
                    >
                      Faith Statement
                    </button>
                  </figcaption>
                </figure>
              </div>
              <div className="space-y-3">
                <p className="text-muted-foreground leading-relaxed">
                  Mnemosynec.ai is not built by a faceless corporation. It is founder-built; a chess
                  player who has lost more games than he has won, ARNG veteran, happily married father
                  of eight, a repentant sinner/hopeful christian, who at eleven designed floating
                  cities that the local newspaper called the Wave of the Future. The receipts are
                  below. The product is what he is doing with them.
                </p>
                <p className="text-sm text-muted-foreground/70 italic">
                  So we can use AI for what it&apos;s Good for.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                    onClick={() => navigate("/founder/story")}
                  >
                    Meet the Founder
                  </Button>
                  <a
                    href="https://lianabanyan.com/founder/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-violet-500/30 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    lianabanyan.com/founder
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nav */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/spinouts")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            All Spinouts
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/proofs")}
            className="gap-2"
          >
            Benchmark Proofs
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/spinouts/harper-guild")}
            className="gap-2"
          >
            Harper Guild Spinout
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Canon / disclaimer */}
        <div className="space-y-1 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Canon reference: MnemosyneC -- mnemosynec.ai / dns-staging.config.ts / Wave 23 Phase beta
          </p>
          <p className="text-xs text-muted-foreground/60 text-center">
            Marks represent participation in the Liana Banyan cooperative -- not equity, shares, or
            guaranteed financial return in any spinout entity.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
