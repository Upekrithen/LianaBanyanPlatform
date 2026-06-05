/**
 * StandInTheGapSpinoutPage — Wave 23 Phase beta
 * ================================================
 * Route: /spinouts/stand-in-the-gap
 *
 * Mutual-aid engine for the cooperative. When the market won't provide at
 * Cost+20%, the community stands in. Gap-fillers earn Marks. Every closed
 * gap becomes a platform knowledge asset in the IP-Ledger.
 *
 * Securities-clean: Marks = participation, never equity or guaranteed return.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  HandHeart,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Users,
  Zap,
  Shield,
  PlusCircle,
  MessageSquare,
  Star,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

type FlowStep = "board" | "post" | "respond" | "close";

const MOCK_GAPS = [
  {
    id: 1,
    need: "Legal document notarization - rural county, no notary within 40 miles",
    ceiling: "$15",
    postedBy: "Member #1,847",
    age: "3 hours ago",
    responded: false,
  },
  {
    id: 2,
    need: "Small-batch screen printing for 50 community event shirts",
    ceiling: "$8/shirt",
    postedBy: "Member #503",
    age: "1 day ago",
    responded: true,
  },
  {
    id: 3,
    need: "Spanish-English interpreter for medical appointment, 2 hours",
    ceiling: "$60 total",
    postedBy: "Member #2,101",
    age: "6 hours ago",
    responded: false,
  },
  {
    id: 4,
    need: "Basic plumbing repair - shut-off valve replacement",
    ceiling: "$45",
    postedBy: "Member #782",
    age: "2 days ago",
    responded: true,
  },
];

// ─── Live-data hooks: gap requests ───────────────────────────────────────────

interface SitgGapRequest {
  id: string;
  need_description: string;
  category: string;
  ceiling_cents: number;
  status: string;
  marks_bounty: number;
  response_count: number;
  created_at: string;
}

function useSitgOpenGaps() {
  return useQuery<SitgGapRequest[]>({
    queryKey: ["sitg-open-gaps"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("sitg_gap_requests")
        .select("id, need_description, category, ceiling_cents, status, marks_bounty, response_count, created_at")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(10);
      return (data as SitgGapRequest[] | null) ?? [];
    },
    staleTime: 60_000,
  });
}

interface SitgStats {
  open_count: number;
  fulfilled_count: number;
  total_marks_awarded: number;
  knowledge_assets: number;
}

function useSitgStats() {
  return useQuery<SitgStats>({
    queryKey: ["sitg-stats"],
    queryFn: async () => {
      const [reqResult, respResult] = await Promise.all([
        (supabase as any).from("sitg_gap_requests").select("status"),
        (supabase as any).from("sitg_gap_responses").select("marks_awarded, knowledge_asset_created, status"),
      ]);
      const reqs = (reqResult.data as { status: string }[] | null) ?? [];
      const resps = (respResult.data as { marks_awarded: number; knowledge_asset_created: boolean; status: string }[] | null) ?? [];
      return {
        open_count: reqs.filter((r) => r.status === "open").length,
        fulfilled_count: reqs.filter((r) => r.status === "fulfilled").length,
        total_marks_awarded: resps.reduce((acc, r) => acc + Number(r.marks_awarded), 0),
        knowledge_assets: resps.filter((r) => r.knowledge_asset_created).length,
      };
    },
    staleTime: 2 * 60_000,
  });
}

export default function StandInTheGapSpinoutPage() {
  usePageSEO({
    title: "Stand in the Gap | Liana Banyan Spinout",
    description: "Community mutual aid and gap-filling cooperative spinout. Neighbors supporting neighbors cooperatively.",
    canonical: "https://lianabanyan.com/spinouts/stand-in-the-gap",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState<FlowStep>("board");
  const { data: openGaps } = useSitgOpenGaps();
  const { data: sitgStats } = useSitgStats();

  return (
    <PortalPageLayout variant="stage" xrayId="stand-in-the-gap-spinout-page">
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
        <div className="rounded-2xl border-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/30 p-8">
          <div className="flex items-start gap-5">
            <HandHeart className="h-14 w-14 text-emerald-400 shrink-0 mt-1" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">Stand in the Gap</h1>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400">
                  Mutual Aid
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-400 text-xs flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Forming
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                When the market says no, the community says yes. Stand in the Gap is the
                cooperative's mutual-aid engine -- every closed gap earns Marks for the filler
                and becomes a knowledge asset for every member who comes after.
              </p>
              <p className="text-xs text-muted-foreground/60 italic">
                Marks = cooperative participation. Not equity, shares, or guaranteed financial return.
              </p>
            </div>
          </div>
        </div>

        {/* Live Gap Stats */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              Gap Board -- Live Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-400">{sitgStats?.open_count ?? openGaps?.length ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Open Gaps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{sitgStats?.fulfilled_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Gaps Filled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{sitgStats?.total_marks_awarded ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Marks Earned</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{sitgStats?.knowledge_assets ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Knowledge Assets</div>
              </div>
            </div>
            {openGaps && openGaps.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Open Gaps (Live)</p>
                {openGaps.slice(0, 3).map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 truncate max-w-[60%]">{g.need_description}</span>
                    <span className="text-muted-foreground">${(g.ceiling_cents / 100).toFixed(0)} ceiling</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Marks = participation -- not equity.
            </p>
          </CardContent>
        </Card>

        {/* The Core Principle */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              The Market Failure Floor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              The cooperative's Cost+20% ceiling means most needs get met through the normal
              platform marketplace. But markets have blind spots: rural areas with no local
              providers, niche skills, small-batch requests, or needs that simply aren't
              profitable enough for commercial operators at any price.
            </p>
            <p>
              Stand in the Gap is the explicit infrastructure for that failure floor. The
              cooperative acknowledges that Cost+20% alone is not enough for every need -- and
              commits to building a system where members can fill the gaps for each other.
            </p>
            <div className="grid gap-3 sm:grid-cols-3 pt-2">
              {[
                { icon: Users, label: "2,270+", sublabel: "Members who can post or fill" },
                { icon: Zap, label: "Cost+20%", sublabel: "Maximum ceiling enforced" },
                { icon: BookOpen, label: "IP-Ledger", sublabel: "Every solution preserved" },
              ].map(({ icon: Icon, label, sublabel }) => (
                <div
                  key={label}
                  className="text-center rounded-lg border border-border bg-card p-4"
                >
                  <Icon className="h-6 w-6 mx-auto mb-1 text-emerald-400" />
                  <div className="font-bold text-foreground">{label}</div>
                  <div className="text-xs text-muted-foreground">{sublabel}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Member Flow */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Member Flow</h2>
          <p className="text-sm text-muted-foreground">
            Explore how the Gap lifecycle works from first post to IP-Ledger entry.
          </p>

          {/* Flow Steps Nav */}
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "board", label: "1. Gap Board", icon: MessageSquare },
                { key: "post", label: "2. Post a Gap", icon: PlusCircle },
                { key: "respond", label: "3. Community Responds", icon: HandHeart },
                { key: "close", label: "4. Gap Closes", icon: CheckCircle },
              ] as { key: FlowStep; label: string; icon: React.ElementType }[]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveFlow(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeFlow === key
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Flow Panel */}
          <Card className="min-h-64">
            {activeFlow === "board" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">The Gap Board</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Open gaps visible to all members. Cost+20% ceiling shown on every post.
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {MOCK_GAPS.map((gap) => (
                    <div
                      key={gap.id}
                      className={`rounded-lg border p-4 text-sm space-y-1 ${
                        gap.responded
                          ? "border-green-500/20 bg-green-500/5"
                          : "border-border bg-card"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-foreground leading-snug">{gap.need}</p>
                        {gap.responded ? (
                          <Badge className="shrink-0 text-xs bg-green-500/20 text-green-400 border-green-500/30">
                            Filled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs border-amber-500/40 text-amber-400"
                          >
                            Open
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <span>Ceiling: <strong className="text-foreground">{gap.ceiling}</strong></span>
                        <span>{gap.postedBy}</span>
                        <span>{gap.age}</span>
                      </div>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 mt-2"
                    onClick={() => setActiveFlow("post")}
                  >
                    Post a New Gap
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </>
            )}

            {activeFlow === "post" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Post a Gap</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Tell the community what you need and the most you can pay (Cost+20% enforced).
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        What do you need?
                      </label>
                      <div className="h-10 rounded-md border border-border bg-muted/40 px-3 flex items-center text-sm text-muted-foreground">
                        Describe your need in plain language...
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Cost+20% ceiling (what you can pay)
                      </label>
                      <div className="h-10 rounded-md border border-border bg-muted/40 px-3 flex items-center text-sm text-muted-foreground">
                        $0.00
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground bg-card rounded p-3 border border-border">
                      <strong className="text-foreground">How the ceiling works:</strong> The Gap
                      Review Council verifies that any accepted fulfilment is at or below your
                      stated ceiling. If market rate is $50, Cost+20% = $60 max. You set your
                      ceiling; the Council enforces it.
                    </div>
                    <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                      <PlusCircle className="h-4 w-4" />
                      Post to the Gap Board
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Gap posts are visible to all members. Held for Founder: live posting gates on
                    full member launch.
                  </p>
                </CardContent>
              </>
            )}

            {activeFlow === "respond" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Community Responds</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Members browse open gaps and volunteer to fill them.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      {
                        step: "1",
                        title: "Gap-filler claims the gap",
                        detail:
                          "Any member with the relevant skill or resource can click Respond on an open gap. They enter their proposed fulfilment plan and confirm they can meet the ceiling.",
                      },
                      {
                        step: "2",
                        title: "Gap poster accepts or declines",
                        detail:
                          "The poster reviews the proposal. They can accept, ask clarifying questions, or decline if the proposal misses the mark. Multiple responders can offer; the poster chooses.",
                      },
                      {
                        step: "3",
                        title: "Fulfilment window begins",
                        detail:
                          "Once accepted, the gap-filler has a set window (default 7 days, adjustable by poster) to deliver. Both parties use the in-platform messaging thread.",
                      },
                    ].map(({ step, title, detail }) => (
                      <div key={step} className="flex gap-4 p-4 rounded-lg border border-border">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-400 shrink-0">
                          {step}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setActiveFlow("close")}
                  >
                    See how gaps close
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </>
            )}

            {activeFlow === "close" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Gap Closes: Marks + IP-Ledger</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Fulfilment verified. Marks minted. Knowledge asset preserved.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-emerald-400" />
                        <span className="font-semibold text-sm">Marks Awarded</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The Gap Review Council confirms the gap was closed within the ceiling. Marks
                        are minted to the gap-filler's cooperative account. Marks represent
                        participation -- not equity, not a guaranteed payout.
                      </p>
                    </div>
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-violet-400" />
                        <span className="font-semibold text-sm">IP-Ledger Entry</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The closed gap -- problem, ceiling, solution, and gap-filler attribution --
                        is logged to the IP-Ledger as a hash-chained knowledge asset. The next
                        member with the same need finds a documented path.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-border p-4 font-mono text-xs text-muted-foreground space-y-1">
                    <p className="text-foreground font-semibold">Sample IP-Ledger entry:</p>
                    <p>type: innovation.registered</p>
                    <p>category: gap-fill.solution</p>
                    <p>title: "Notarization -- rural, 40-mi radius"</p>
                    <p>ceiling_usd: 15</p>
                    <p>gap_filler: member#1847</p>
                    <p>marks_minted: 12</p>
                    <p>previous_hash: 0xa3f8...</p>
                    <p>current_hash: 0x7c21...</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gap-fill knowledge assets belong to the cooperative, not to individual members
                    or initiatives. Attribution is preserved in the ledger for every contributor.
                  </p>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Business Plan */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Business Plan Stub</CardTitle>
            <p className="text-xs text-muted-foreground">
              Cost+20% template. Marks = participation, not equity or guaranteed return.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="font-semibold text-foreground">The Problem</p>
                <p className="text-muted-foreground">
                  Markets routinely fail members in underserved areas, niche needs, or low-volume
                  requests. The cooperative exists precisely because the market said no.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Who We Serve</p>
                <p className="text-muted-foreground">
                  All 2,270+ cooperative members who hit a wall -- a need the market won't meet at
                  a fair price. Also the gap-fillers who earn Marks by stepping in.
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">The Offering</p>
                <p className="text-muted-foreground italic">
                  "I connect members who need something with members who can provide it, at
                  Cost+20% or better, so no one in the cooperative is left without a path."
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
                <p className="text-muted-foreground">
                  No platform fee on gap transactions. Cost+20% ceiling is enforced by the Gap
                  Review Council. Marks for gap-fillers are minted by the cooperative treasury.
                  Every closed gap is logged to the IP-Ledger as a reusable knowledge asset.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: Gap Board live with first 10 open gaps posted by beta members</li>
                <li>Day 60: First 25 gaps closed, Marks awarded, IP-Ledger entries created</li>
                <li>
                  Day 90: Gap pattern analysis published -- recurring gaps trigger initiative
                  proposals
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Governance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              The Gap Review Council
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>
              The Gap Review Council is the governance body responsible for three things:
              verifying that closed gaps met the ceiling, minting Marks to gap-fillers, and
              approving IP-Ledger entries for reusable knowledge assets.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  title: "Ceiling Verification",
                  detail: "Confirm the gap was filled at or below Cost+20% before Marks vest",
                },
                {
                  title: "Marks Minting",
                  detail: "Authorize the treasury to mint Marks for the verified gap-filler",
                },
                {
                  title: "Ledger Entry",
                  detail:
                    "Write the structured knowledge asset to the IP-Ledger with full attribution",
                },
              ].map(({ title, detail }) => (
                <div key={title} className="rounded-lg border border-border p-3 space-y-1">
                  <p className="font-semibold text-foreground text-xs">{title}</p>
                  <p className="text-xs">{detail}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nav to related */}
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
            onClick={() => navigate("/spinouts/mnemosyne-c")}
            className="gap-2"
          >
            MnemosyneC Exemplar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground/60 text-center border-t border-border pt-4">
          Marks represent participation in the Liana Banyan cooperative -- not equity, shares, or
          guaranteed financial return in any spinout entity.
        </p>
      </div>
    </PortalPageLayout>
  );
}
