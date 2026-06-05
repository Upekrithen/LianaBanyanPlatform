/**
 * CaiBonfirePage -- Wave 22 Phase B
 * ===================================
 * Deep-build landing for the CAI Bonfire spinout at /spinouts/cai-bonfire.
 * CAI Bonfire = cooperative AI gathering: members contribute prompts,
 * training data, and evaluations to improve shared models together.
 *
 * Key doctrine compliance:
 *   - Cost+20% compute with full honest disclosure
 *   - "NOT A FINANCIAL RETURN" on all Marks displays
 *   - IP-Ledger tracks every contribution for provenance
 *   - $5/year flat membership (no tiers) gates base model access
 *   - Securities-clean: Marks = participation only
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Flame,
  MessageSquare,
  Database,
  BarChart3,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Users,
  Cpu,
  GitBranch,
  Trophy,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

// ─── Static demo data ─────────────────────────────────────────────────────────

type ContributionType = "prompt" | "training_data" | "evaluation";

const CONTRIBUTION_TYPES: {
  type: ContributionType;
  label: string;
  icon: typeof MessageSquare;
  color: string;
  bg: string;
  description: string;
  example: string;
}[] = [
  {
    type: "prompt",
    label: "Prompts",
    icon: MessageSquare,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    description:
      "Contribute prompts that improve how community models respond to cooperative use cases -- resource requests, governance questions, skill matching.",
    example:
      '"Help me find a member who can teach bread-making in the 78201 zip code."',
  },
  {
    type: "training_data",
    label: "Training Data",
    icon: Database,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    description:
      "Submit annotated examples, conversation pairs, or structured datasets that reflect real cooperative member needs and language.",
    example: "Input/output pairs from 500 real member interactions (anonymized).",
  },
  {
    type: "evaluation",
    label: "Evaluations",
    icon: BarChart3,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    description:
      "Run benchmark evaluations on model outputs and report results. Open benchmarks: any community can run and verify independently.",
    example: "Helpfulness score: 4.2/5 on cooperative resource-finding tasks.",
  },
];

const RECENT_CONTRIBUTIONS = [
  {
    id: "contrib-001",
    contributor: "member:atlas-node-7",
    type: "prompt" as ContributionType,
    title: "Grocery co-op routing prompts (batch 3)",
    status: "verified",
    marksNote: "Marks awarded",
    date: "2026-05-28",
  },
  {
    id: "contrib-002",
    contributor: "member:jukebox-crew",
    type: "evaluation" as ContributionType,
    title: "Jukebox recommendation benchmark v2",
    status: "under_review",
    marksNote: "Pending review",
    date: "2026-05-31",
  },
  {
    id: "contrib-003",
    contributor: "member:family-table-sf",
    type: "training_data" as ContributionType,
    title: "Meal-sharing conversation pairs (200 examples)",
    status: "verified",
    marksNote: "Marks awarded",
    date: "2026-05-20",
  },
  {
    id: "contrib-004",
    contributor: "member:stewards-guild",
    type: "evaluation" as ContributionType,
    title: "Governance FAQ accuracy eval",
    status: "verified",
    marksNote: "Marks awarded",
    date: "2026-05-15",
  },
];

const COMPUTE_TIERS = [
  {
    label: "Inference (base model)",
    memberCost: "Included in membership",
    cost: "$5/year flat",
    note: "No per-query charge for members",
  },
  {
    label: "Fine-tune run (small)",
    memberCost: "Cost+20%",
    cost: "~$8-15 per run",
    note: "Full cost shown before you authorize",
  },
  {
    label: "Fine-tune run (large)",
    memberCost: "Cost+20%",
    cost: "~$40-120 per run",
    note: "Full cost shown before you authorize",
  },
  {
    label: "Benchmark evaluation",
    memberCost: "Cost+20%",
    cost: "~$2-6 per eval run",
    note: "Open results published to all members",
  },
];

const typeIcon: Record<ContributionType, typeof MessageSquare> = {
  prompt: MessageSquare,
  training_data: Database,
  evaluation: BarChart3,
};

const typeColor: Record<ContributionType, string> = {
  prompt: "text-orange-400",
  training_data: "text-red-400",
  evaluation: "text-yellow-400",
};

// ─── Live-data hook: CAI contribution summary ─────────────────────────────────

interface CaiSummaryRow {
  contribution_type: string;
  total_contributions: number;
  accepted_count: number;
  avg_quality_score: number;
  total_marks_awarded: number;
}

function useCaiSummary() {
  return useQuery<CaiSummaryRow[]>({
    queryKey: ["cai-contribution-summary"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("cai_contribution_summary")
        .select("*");
      return (data as CaiSummaryRow[] | null) ?? [];
    },
    staleTime: 2 * 60_000,
  });
}

interface CaiComputeTotal {
  total_cost_cents: number;
  total_billed_cents: number;
  run_count: number;
}

function useCaiComputeTotal() {
  return useQuery<CaiComputeTotal>({
    queryKey: ["cai-compute-total"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("cai_compute_ledger")
        .select("cost_cents, billed_cents");
      const rows = (data as { cost_cents: number; billed_cents: number }[] | null) ?? [];
      return {
        run_count: rows.length,
        total_cost_cents: rows.reduce((acc, r) => acc + Number(r.cost_cents), 0),
        total_billed_cents: rows.reduce((acc, r) => acc + Number(r.billed_cents), 0),
      };
    },
    staleTime: 2 * 60_000,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CaiBonfirePage() {
  usePageSEO({
    title: "CAI Bonfire | Liana Banyan Spinout",
    description: "Cooperative AI governance and community-owned intelligence tools. A Liana Banyan spinout for ethical AI deployment.",
    canonical: "https://lianabanyan.com/spinouts/cai-bonfire",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContributionType>("prompt");
  const { data: caiSummary } = useCaiSummary();
  const { data: computeTotal } = useCaiComputeTotal();

  const totalContributions = (caiSummary ?? []).reduce((acc, r) => acc + Number(r.total_contributions), 0);
  const totalMarks = (caiSummary ?? []).reduce((acc, r) => acc + Number(r.total_marks_awarded), 0);
  const computeMarginCents = (computeTotal?.total_billed_cents ?? 0) - (computeTotal?.total_cost_cents ?? 0);

  const activeType = CONTRIBUTION_TYPES.find((c) => c.type === activeTab)!;
  const TypeIcon = activeType.icon;

  return (
    <PortalPageLayout variant="stage" xrayId="cai-bonfire-page">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/spinouts")}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Spinouts
        </Button>

        {/* Hero */}
        <div className="rounded-2xl border-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 p-6 space-y-3">
          <div className="flex items-start gap-4">
            <span className="text-5xl">🔥</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">CAI Bonfire</h1>
                <Badge variant="outline">Community AI</Badge>
                <Badge className="text-xs border-amber-500/40 text-amber-400 bg-amber-500/10">
                  Forming
                </Badge>
                <Badge className="text-xs border-blue-500/40 text-blue-400 bg-blue-500/10">
                  Spinout #17
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-xl">
                The community AI gathering. Members contribute prompts, training
                data, and evaluations to improve shared models together. Option B:
                community-owned AI that serves, not extracts.
              </p>
            </div>
          </div>
        </div>

        {/* Live CAI Stats */}
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-400" />
              Bonfire -- Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-orange-400">{totalContributions}</div>
                <div className="text-xs text-muted-foreground mt-1">Contributions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{totalMarks}</div>
                <div className="text-xs text-muted-foreground mt-1">Marks Awarded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">${(computeMarginCents / 100).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">Cost+20% Margin</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Cost+20% compute -- honest cost telemetry.
            </p>
          </CardContent>
        </Card>

        {/* Option B Banner */}
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="py-4 flex items-start gap-3 text-sm">
            <GitBranch className="h-5 w-5 text-orange-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Option B: Cooperative AI</p>
              <p className="text-muted-foreground">
                Corporate AI is Option A: built for extraction, trained on data without consent,
                governed by shareholders. CAI Bonfire is Option B: built for communities, trained
                with attribution, governed by the members who contribute. Not one of the 16 Sweet
                Sixteen Initiatives -- a distinct legal entity with its own governance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contribution Types */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Contribute to the Bonfire</h2>

          {/* Tab selector */}
          <div className="flex gap-2 flex-wrap">
            {CONTRIBUTION_TYPES.map((ct) => {
              const Icon = ct.icon;
              return (
                <button
                  key={ct.type}
                  onClick={() => setActiveTab(ct.type)}
                  className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all ${
                    activeTab === ct.type
                      ? ct.bg + " " + ct.color
                      : "border-border/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {ct.label}
                </button>
              );
            })}
          </div>

          {/* Active tab detail */}
          <Card className={`border ${activeType.bg}`}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 text-base ${activeType.color}`}>
                <TypeIcon className="h-5 w-5" />
                {activeType.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{activeType.description}</p>
              <div className="p-3 rounded bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Example</p>
                <p className="text-xs text-foreground italic">{activeType.example}</p>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-200">
                  <strong>Marks for quality contributions -- NOT A FINANCIAL RETURN.</strong>{" "}
                  Marks represent cooperative participation only. Quality review by the
                  Bonfire evaluation committee gates Marks vesting.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IP-Ledger Tracking */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" />
              IP-Ledger Contribution Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              Every CAI Bonfire contribution is recorded as a{" "}
              <code className="font-mono text-xs text-orange-400 bg-orange-500/10 px-1 rounded">
                cai.contribution
              </code>{" "}
              entry in the hash-chained IP-Ledger. Attribution is permanent and
              tamper-evident. You own the provenance of what you build.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                "Contributor ID and timestamp",
                "Contribution type and title",
                "Model reference (if applicable)",
                "Compute cost in USD (Cost+20%)",
                "Quality review status",
                "Marks vesting note (NOT A FINANCIAL RETURN)",
              ].map((field) => (
                <div key={field} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                  {field}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Contributions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Contributions (Demo)</h2>
            <Badge variant="outline" className="text-xs">
              {RECENT_CONTRIBUTIONS.filter((c) => c.status === "verified").length} verified
            </Badge>
          </div>
          <div className="space-y-2">
            {RECENT_CONTRIBUTIONS.map((contrib) => {
              const Icon = typeIcon[contrib.type];
              const color = typeColor[contrib.type];
              return (
                <Card key={contrib.id} className="border-border/50">
                  <CardContent className="py-3 flex items-start gap-3">
                    <Icon className={`h-4 w-4 ${color} mt-0.5 shrink-0`} />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{contrib.title}</span>
                        <Badge
                          variant="outline"
                          className={
                            contrib.status === "verified"
                              ? "text-xs border-green-500/40 text-green-400"
                              : "text-xs border-amber-500/40 text-amber-400"
                          }
                        >
                          {contrib.status === "verified" ? "Verified" : "Under Review"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{contrib.contributor}</span>
                        <span className="text-border">|</span>
                        <span>{contrib.date}</span>
                        {contrib.status === "verified" && (
                          <>
                            <span className="text-border">|</span>
                            <span className="text-yellow-400 font-medium flex items-center gap-1">
                              <Trophy className="h-3 w-3" />
                              {contrib.marksNote}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Compute Pricing */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cpu className="h-5 w-5 text-orange-400" />
              Compute Pricing -- Cost+20%
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Full cost disclosed before any run is authorized. No hidden margins.
              83.3% of coordination fees to the Bonfire operations team.
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                      Type
                    </th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                      Member Cost
                    </th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                      Estimate
                    </th>
                    <th className="text-left py-2 text-xs font-medium text-muted-foreground">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPUTE_TIERS.map((tier) => (
                    <tr key={tier.label} className="border-b border-border/20">
                      <td className="py-2 font-medium">{tier.label}</td>
                      <td className="py-2 text-orange-400 font-mono text-xs">
                        {tier.memberCost}
                      </td>
                      <td className="py-2 text-muted-foreground text-xs">{tier.cost}</td>
                      <td className="py-2 text-muted-foreground text-xs">{tier.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Model Governance */}
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-5 w-5 text-red-400" />
              Community Model Governance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {[
              "Members vote on which model versions become canonical",
              "Open benchmarks published: any community can run and verify",
              "No corporate board approvals required to publish research",
              "Governance decisions logged to IP-Ledger for permanent record",
              "Fine-tune decision gate: 60% member approval required for major model changes",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Marks Disclaimer (prominent) */}
        <div className="rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <p className="font-semibold text-amber-300">Marks Disclosure</p>
          </div>
          <p className="text-sm text-amber-200/80 leading-relaxed">
            Marks awarded for CAI Bonfire contributions represent cooperative participation
            only -- <strong>NOT A FINANCIAL RETURN</strong>. Marks are not equity in CAI
            Bonfire or any other spinout. They are not shares, dividends, or guaranteed
            payouts of any kind. Marks rates are held for Founder review and will be
            published separately when set.
          </p>
        </div>

        {/* Business Plan Stub */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Business Plan Stub</CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Spinout #17 per BP041 Founder direct.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">The Problem</p>
              <p className="text-muted-foreground">
                AI development is concentrated in entities optimizing for extraction.
                Communities contribute vast data and labor but receive none of the
                governance, attribution, or benefit. There is no community-owned
                alternative at scale.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
              <p className="text-muted-foreground">
                Compute at honest Cost+20% -- full disclosure before any run.
                Base model access included in $5/year membership (flat, no tiers).
                Specialized fine-tunes at Cost+20% per run. 83.3% of coordination
                fees to the Bonfire operations team.
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: Bonfire research charter ratified by cooperative governance vote</li>
                <li>
                  Day 60: First community benchmark dataset published and IP-Ledger logged
                </li>
                <li>
                  Day 90: First open model released under cooperative license with
                  provenance chain
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            CAI Bonfire -- Spinout #17 per BP041 Founder direct. Legal entity forming.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Marks represent participation in the Liana Banyan cooperative -- not equity,
            shares, or guaranteed financial return. NOT A FINANCIAL RETURN.
          </p>
        </div>
      </div>
    </PortalPageLayout>
  );
}
