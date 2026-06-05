/**
 * HarperGuildSpinoutPage — Wave 23 Phase beta
 * =============================================
 * Route: /spinouts/harper-guild
 *
 * The Harper Guild spinout layer: the certification system, Cost+20% for certified
 * creative work, mini-DAO governance, IP-Ledger Brand Stamp, and member flow.
 *
 * Distinct from the initiative page at /initiatives/harper-guild which covers
 * internal cooperative ethics and care coordination.
 *
 * Securities-clean: Marks = participation, never equity or guaranteed return.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import {
  Scale,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle,
  Users,
  BookOpen,
  Star,
  Shield,
  FileText,
  Vote,
  Stamp,
  Lock,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { usePageSEO } from "@/hooks/usePageSEO";

type FlowStep = "apply" | "review" | "badge" | "stamp";

const CERTIFICATION_TIERS = [
  {
    name: "Harper Apprentice",
    emoji: "📘",
    requirements: [
      "Complete the Harper Ethics Primer (self-paced, ~4 hours)",
      "Submit one sample review or care report",
      "No prior violations of cooperative standards",
    ],
    what_you_can_do: "Review creative work within the cooperative at Cost+20%",
    marks_on_cert: 25,
    renewal: "Annual -- submit 2 completed reviews",
  },
  {
    name: "Harper Certified",
    emoji: "📗",
    requirements: [
      "Hold Harper Apprentice for at least 90 days",
      "Complete 5 verified reviews with no quality flags",
      "Peer review by 2 existing Harper Certified members",
    ],
    what_you_can_do:
      "Issue Brand Stamps on creative work; take external engagements at Cost+20%",
    marks_on_cert: 75,
    renewal: "Annual -- submit 4 completed reviews + 1 external engagement",
  },
  {
    name: "Harper Senior",
    emoji: "📕",
    requirements: [
      "Hold Harper Certified for at least 1 year",
      "Complete 20+ verified reviews with 90%+ quality rating",
      "Mentor 1 Harper Apprentice through full certification",
      "Guild Council ratification vote",
    ],
    what_you_can_do:
      "Conduct ethics audits; seat on the Guild Council; vote on governance proposals",
    marks_on_cert: 200,
    renewal: "Annual -- Guild Council review + member feedback",
  },
];

const GOVERNANCE_LAYERS = [
  {
    icon: Users,
    title: "Guild Council",
    detail:
      "All Harper Senior members form the Guild Council -- the governing body of the Harper Guild spinout. The Council sets certification standards, reviews appeals, and ratifies the annual budget.",
  },
  {
    icon: Vote,
    title: "Member Votes",
    detail:
      "Any structural change to certification standards (tiers, requirements, fees) requires a member vote. Harper Certified and above can vote. Quorum: 60% participation.",
  },
  {
    icon: Shield,
    title: "Firewall Protocol",
    detail:
      "The Guild Council maintains a strict firewall between internal cooperative work and external client engagements. External clients cannot influence cooperative audits; internal audits cannot be disclosed to external clients.",
  },
  {
    icon: Scale,
    title: "Platform Relationship",
    detail:
      "The Harper Guild spinout operates within the larger cooperative's Switzerland Protocol governance. It is a mini-DAO with its own Council but it does not override the 7-Crown Council on platform-wide matters.",
  },
];

// ─── Live-data hooks: guild certifications + review queue ────────────────────

interface HgGuildStats {
  apprentice_count: number;
  certified_count: number;
  senior_count: number;
  guild_master_count: number;
  total_certifications: number;
}

function useHgGuildStats() {
  return useQuery<HgGuildStats>({
    queryKey: ["hg-guild-stats"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("hg_guild_stats")
        .select("*")
        .maybeSingle();
      return data ?? {
        apprentice_count: 0, certified_count: 0, senior_count: 0,
        guild_master_count: 0, total_certifications: 0,
      };
    },
    staleTime: 2 * 60_000,
  });
}

interface HgReviewQueueItem {
  id: string;
  work_title: string;
  work_type: string;
  review_status: string;
  marks_reward: number;
  required_cert_tier: string;
  created_at: string;
}

function useHgOpenReviews() {
  return useQuery<HgReviewQueueItem[]>({
    queryKey: ["hg-open-reviews"],
    queryFn: async () => {
      const { data } = await (supabase as any)
        .from("hg_review_queue")
        .select("id, work_title, work_type, review_status, marks_reward, required_cert_tier, created_at")
        .in("review_status", ["queued", "assigned"])
        .order("created_at", { ascending: false })
        .limit(5);
      return (data as HgReviewQueueItem[] | null) ?? [];
    },
    staleTime: 60_000,
  });
}

export default function HarperGuildSpinoutPage() {
  usePageSEO({
    title: "Harper Guild Spinout | Liana Banyan",
    description: "The Harper Guild as a standalone cooperative company. Writers, storytellers, and creators building a member-owned publishing house.",
    canonical: "https://lianabanyan.com/spinouts/harper-guild",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState<FlowStep>("apply");
  const [selectedTier, setSelectedTier] = useState(0);
  const { data: guildStats } = useHgGuildStats();
  const { data: openReviews } = useHgOpenReviews();

  return (
    <PortalPageLayout variant="stage" xrayId="harper-guild-spinout-page">
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
        <div className="rounded-2xl border-2 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-indigo-500/30 p-8">
          <div className="flex items-start gap-5">
            <Scale className="h-14 w-14 text-indigo-400 shrink-0 mt-1" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">Harper Guild</h1>
                <Badge variant="outline" className="border-indigo-500/40 text-indigo-400">
                  Ethics & HR
                </Badge>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-400 text-xs flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" />
                  Forming
                </Badge>
                <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-xs">
                  Spinout Layer
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                The Harper Guild spinout takes the cooperative's internal ethics infrastructure
                and makes it available to the world -- at Cost+20%, with certification, Brand
                Stamp, and mini-DAO governance. Every certified creative work is logged to the
                IP-Ledger. Every engagement is transparent.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10"
                  onClick={() => navigate("/initiatives/harper-guild")}
                >
                  <ArrowRight className="h-3 w-3" />
                  See the Initiative (internal ethics)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground/60 italic">
                Marks = cooperative participation. Not equity, shares, or guaranteed financial return.
              </p>
            </div>
          </div>
        </div>

        {/* Live Guild Stats */}
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              Harper Guild -- Live Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-400">{guildStats?.apprentice_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Apprentices</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">{guildStats?.certified_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Certified</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">{guildStats?.senior_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Senior</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-400">{guildStats?.guild_master_count ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Guild Masters</div>
              </div>
            </div>
            {openReviews && openReviews.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Open Review Queue (Live)</p>
                {openReviews.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-xs">
                    <span className="text-indigo-400 truncate max-w-[60%]">{r.work_title}</span>
                    <span className="text-muted-foreground">{r.marks_reward} Marks</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Live from Supabase. Marks = participation -- not equity.
            </p>
          </CardContent>
        </Card>

        {/* Initiative vs. Spinout */}
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              Initiative vs. Spinout: What Is the Difference?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4 space-y-2">
                <p className="font-semibold text-foreground">Initiative #12 (internal)</p>
                <p>
                  The Harper Guild initiative provides embedded ethics checkers and care
                  coordinators inside every LianaBanyan initiative. Harpers are paid by the
                  platform and cannot be fired by the businesses they observe.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs p-0 h-auto"
                  onClick={() => navigate("/initiatives/harper-guild")}
                >
                  Read the initiative
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-2">
                <p className="font-semibold text-foreground">Spinout (external market)</p>
                <p>
                  The Harper Guild spinout offers Harper-quality ethics audits, HR support, and
                  fact-verification to external organizations -- cooperatives, small businesses,
                  community land trusts -- at Cost+20% per engagement.
                </p>
                <Badge variant="outline" className="text-xs border-indigo-500/40 text-indigo-400">
                  You are here
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certification System */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold">Certification System</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Three tiers, each with clear requirements, Marks-on-certification, and an annual
            renewal track. Certification gates what work a Harper can take and what Brand Stamps
            they can issue.
          </p>

          {/* Tier selector */}
          <div className="flex flex-wrap gap-2">
            {CERTIFICATION_TIERS.map((tier, i) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedTier === i
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tier.emoji} {tier.name}
              </button>
            ))}
          </div>

          {/* Tier detail */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{CERTIFICATION_TIERS[selectedTier].emoji}</span>
                {CERTIFICATION_TIERS[selectedTier].name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Requirements</p>
                <ul className="space-y-1">
                  {CERTIFICATION_TIERS[selectedTier].requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">What you can do</p>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {CERTIFICATION_TIERS[selectedTier].what_you_can_do}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Marks on certification</p>
                  <p className="text-2xl font-black text-amber-400">
                    {CERTIFICATION_TIERS[selectedTier].marks_on_cert}
                  </p>
                  <p className="text-xs text-muted-foreground">participation Marks</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">Annual renewal</p>
                  <p className="text-xs font-semibold text-foreground mt-1">
                    {CERTIFICATION_TIERS[selectedTier].renewal}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Member Flow */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Member Flow</h2>
          <p className="text-sm text-muted-foreground">
            From application to Brand Stamp -- how a Harper gets certified and starts working.
          </p>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "apply", label: "1. Apply", icon: ClipboardList },
                { key: "review", label: "2. Guild Review", icon: Scale },
                { key: "badge", label: "3. Earn Badge", icon: Award },
                { key: "stamp", label: "4. Issue Brand Stamp", icon: Stamp },
              ] as { key: FlowStep; label: string; icon: React.ElementType }[]
            ).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveFlow(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  activeFlow === key
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          <Card className="min-h-48">
            {activeFlow === "apply" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Any cooperative member can apply for Harper Apprentice certification. Applications
                    for Harper Certified and Harper Senior require holding the prior tier.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border p-4 space-y-1">
                      <p className="font-semibold text-foreground">What to submit</p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-indigo-400" /> Completed Harper Ethics Primer certificate</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-indigo-400" /> One sample review or care report (your own work)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-indigo-400" /> Brief statement of why you want to be a Harper</li>
                      </ul>
                    </div>
                    <div className="rounded-lg border border-border p-4 space-y-1">
                      <p className="font-semibold text-foreground">What happens next</p>
                      <p className="text-xs">
                        Your application enters the Guild Review queue. Two Harper Certified (or
                        Senior) members are assigned as reviewers. You receive feedback within 14
                        days. Approved applications trigger automatic Marks minting and badge issuance.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setActiveFlow("review")}
                  >
                    See the review process
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </>
            )}

            {activeFlow === "review" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Guild Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    The Guild Review is a structured peer process, not a gatekeeping exercise.
                    Reviewers are looking for evidence that the applicant understands the Harper
                    standard -- not perfection.
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Ethics alignment",
                        detail: "Does the sample work reflect cooperative ethics? No hidden agenda, no harm, full citation.",
                      },
                      {
                        label: "Quality standard",
                        detail: "Is the review or report clear, factual, and actionable? Reviewers score on a 5-point rubric.",
                      },
                      {
                        label: "Conflict check",
                        detail: "Reviewers confirm no financial relationship between the applicant and any work they will review.",
                      },
                    ].map(({ label, detail }) => (
                      <div key={label} className="flex gap-3 p-3 rounded-lg border border-border">
                        <Scale className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-foreground text-xs">{label}</p>
                          <p className="text-xs mt-0.5">{detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setActiveFlow("badge")}
                  >
                    See badge issuance
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </>
            )}

            {activeFlow === "badge" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">Earn the Guild Badge</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    On approval, the Guild Council issues three things simultaneously: the Guild
                    badge, the Marks award, and the certification record in the IP-Ledger.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 text-center space-y-2">
                      <Award className="h-8 w-8 mx-auto text-indigo-400" />
                      <p className="font-semibold text-foreground text-xs">Guild Badge</p>
                      <p className="text-xs">Displayed on your cooperative profile. Tier-specific visual.</p>
                    </div>
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4 text-center space-y-2">
                      <Star className="h-8 w-8 mx-auto text-amber-400" />
                      <p className="font-semibold text-foreground text-xs">Marks Minted</p>
                      <p className="text-xs">25 (Apprentice) / 75 (Certified) / 200 (Senior) Marks awarded on certification.</p>
                    </div>
                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4 text-center space-y-2">
                      <BookOpen className="h-8 w-8 mx-auto text-violet-400" />
                      <p className="font-semibold text-foreground text-xs">IP-Ledger Entry</p>
                      <p className="text-xs">Certification logged with date, tier, reviewer IDs, and hash chain.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => setActiveFlow("stamp")}
                  >
                    See Brand Stamp issuance
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </>
            )}

            {activeFlow === "stamp" && (
              <>
                <CardHeader>
                  <CardTitle className="text-base">The Brand Stamp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p>
                    Harper Certified and above can issue Brand Stamps on creative work they have
                    reviewed. A Brand Stamp is a logged IP-Ledger entry that certifies the work
                    meets Harper standards for ethics, quality, and provenance.
                  </p>
                  <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Stamp className="h-8 w-8 text-indigo-400" />
                      <div>
                        <p className="font-bold text-foreground">Harper Brand Stamp</p>
                        <p className="text-xs text-muted-foreground">
                          Issued by a Harper Certified member. Logged in the IP-Ledger. Verifiable
                          by anyone with the ledger entry hash.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border p-4 font-mono text-xs space-y-1">
                      <p className="text-foreground font-semibold">Sample Brand Stamp ledger entry:</p>
                      <p>type: content.created</p>
                      <p>category: harper.brand-stamp</p>
                      <p>work_title: "Mutual Aid Handbook, Vol. 3"</p>
                      <p>certified_by: member#0412 (Harper Certified)</p>
                      <p>ethics_score: 5/5</p>
                      <p>quality_score: 4/5</p>
                      <p>conflict_check: clear</p>
                      <p>previous_hash: 0x3d9a...</p>
                      <p>current_hash: 0xb7f2...</p>
                    </div>
                  </div>
                  <p className="text-xs">
                    Brand Stamps are not endorsements of content -- they are certifications that
                    the Harper standard was applied. The Guild does not endorse the views expressed
                    in stamped work.
                  </p>
                </CardContent>
              </>
            )}
          </Card>
        </div>

        {/* Mini-DAO Governance */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Vote className="h-5 w-5 text-indigo-400" />
            <h2 className="text-xl font-bold">Guild Governance: Mini-DAO</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            The Harper Guild spinout is self-governing within the larger cooperative. The Guild
            Council sets its own certification standards and budget -- but operates under the
            cooperative's overall Switzerland Protocol and 7-Crown Council authority.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {GOVERNANCE_LAYERS.map(({ icon: Icon, title, detail }) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="h-4 w-4 text-indigo-400" />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground">{detail}</CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Business Plan */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Plan Stub
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
                  Small cooperatives and businesses cannot afford HR departments or ethics
                  consultants. They operate without guardrails that prevent them from becoming
                  exploitative.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-foreground">Who We Serve</p>
                <p className="text-muted-foreground">
                  Small cooperatives, worker-owned businesses, community land trusts, and
                  non-profits in the 10-200 employee range.
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">The Offering</p>
                <p className="text-muted-foreground italic">
                  "I provide small cooperatives with Harper-quality ethics checking and HR support
                  so they can operate fairly without the overhead of a full HR department."
                </p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="font-semibold text-foreground">Economics (Cost+20%)</p>
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Project-based engagement range</span>
                    <span className="font-mono font-bold text-foreground">$500 - $2,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Harper share (83.3%)</span>
                    <span className="font-mono text-emerald-400">$416 - $1,666</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform + Guild overhead (16.7%)</span>
                    <span className="font-mono text-muted-foreground">$84 - $334</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2">
                    <span>Annual certification audit renewal</span>
                    <span className="font-mono text-foreground">$250/year</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">First 90 Days</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Day 30: First 3 external Harper engagements scoped and priced</li>
                <li>Day 60: Harper external work firewall protocol documented and reviewed</li>
                <li>Day 90: First external ethics audit completed and Brand Stamp issued</li>
              </ol>
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
            onClick={() => navigate("/initiatives/harper-guild")}
            className="gap-2"
          >
            Harper Guild Initiative
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/spinouts/stand-in-the-gap")}
            className="gap-2"
          >
            Stand in the Gap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="space-y-1 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Canon reference: Harper Guild Spinout -- Wave 23 Phase beta / spinout_entities
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
