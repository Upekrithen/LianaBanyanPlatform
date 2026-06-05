/**
 * BusinessPlanPage -- Scope 25: Standard business plan page.
 * Route: /business-plan
 *
 * Sections: Mission, Problem/Solution, Platform Architecture, Economics,
 * Governance, Growth, Financials, Team.
 * Single-source-of-truth: references real system data (canonNumbers, mascots).
 * Three depths: Skipping Stones / Wading In / Deep Dive.
 * FAQ + Speak Founder tiles at the bottom.
 */

import { useState } from "react";
import { DepthSwitcher } from "@/components/explainer/DepthSwitcher";
import type { DepthLayer } from "@/data/explainerCorpus";
import { DEPTH_LABELS } from "@/data/explainerCorpus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  TrendingUp,
  Users,
  Shield,
  Layers,
  DollarSign,
  MessageCircle,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// CANON NUMBERS (single source -- update here, updates everywhere)
// =========================================================================
const CANON = {
  innovations: "2,270",
  crownJewels: 228,
  provisionals: 21,
  participationPct: "83.3%",
  overheadPct: "16.67%",
  costPlus: "Cost+20%",
  membershipUSD: "$5/year",
  initiatives: 16,
} as const;

// =========================================================================
// SECTION DATA
// =========================================================================
interface BizPlanSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  depths: Record<DepthLayer, { headline: string; body: string[] }>;
}

const SECTIONS: BizPlanSection[] = [
  {
    id: "mission",
    icon: <BookOpen className="h-5 w-5 text-amber-600" />,
    title: "Mission",
    depths: {
      "skipping-stones": {
        headline: "Help each other help out.",
        body: [
          "Liana Banyan is a worker-owned cooperative platform where creators and contributors share the majority of every dollar generated.",
          `${CANON.participationPct} of platform revenue flows to participating members. Always.`,
        ],
      },
      "wading-in": {
        headline: "A cooperative infrastructure for creative and technical work.",
        body: [
          "Liana Banyan exists to give creators, builders, and contributors a platform that is structurally on their side. Not in policy -- in economics.",
          `The core commitment: ${CANON.participationPct} of every transaction goes to the creator/contributor pool. The platform keeps ${CANON.overheadPct} for operations, legal protection, and infrastructure.`,
          `${CANON.costPlus} is the pricing floor for all goods and services on the platform. This protects every economic actor from race-to-the-bottom pricing.`,
          `${CANON.innovations} innovations tracked in the IP Ledger. ${CANON.crownJewels} Crown Jewels certified. ${CANON.provisionals} provisionals in review.`,
        ],
      },
      "deep-dive": {
        headline: "Legal structure, economic constitution, and cooperative governance.",
        body: [
          "Liana Banyan Platform, LLC is organized as a cooperative with member-ownership principles. All IP contributions are tracked via the Pearl/Eblet/SSPS provenance chain and recorded in the IP Ledger.",
          `Economic constitution: ${CANON.participationPct} / ${CANON.overheadPct} split is encoded in platform logic, not policy. It cannot be changed without a Star Chamber vote (3/4 required) AND a member-wide ratification vote.`,
          `${CANON.costPlus} pricing: enforced at transaction time. The system will not process a transaction below the cost floor. This is not a guideline -- it is an arithmetic constraint.`,
          "Membership: $5/year baseline. Cooperative, not subscription. Members have governance rights, Pudding staking rights, and Badge eligibility that non-members do not.",
          `${CANON.initiatives} active initiatives across creative, technical, and community domains, each with its own IP allocation and governance structure.`,
        ],
      },
    },
  },
  {
    id: "problem-solution",
    icon: <Shield className="h-5 w-5 text-blue-600" />,
    title: "Problem and Solution",
    depths: {
      "skipping-stones": {
        headline: "Platforms keep too much. We keep less.",
        body: [
          "Most platforms take 30-50% of every transaction. They own the infrastructure, the algorithm, and the monetization.",
          "Liana Banyan keeps 16.67%. Members own the rest, and they have governance rights over the platform's future.",
        ],
      },
      "wading-in": {
        headline: "Three problems. Three solutions.",
        body: [
          "Problem 1 -- Extraction: Platforms keep the majority of creator revenue. Solution: ${CANON.participationPct} goes to members. The math is public and locked.",
          "Problem 2 -- Attribution: Creative work is routinely stolen or uncredited. Solution: The IP Ledger records every contribution with cryptographic provenance. ${CANON.innovations} innovations tracked.",
          "Problem 3 -- Fragmentation: Creators compete with each other on algorithmic platforms instead of cooperating. Solution: The cooperative model aligns incentives. More members, more IP, more value for all (Substrace Theorem).",
        ],
      },
      "deep-dive": {
        headline: "Market analysis, competitive differentiation, and structural moat.",
        body: [
          "Total addressable market: The US freelance/creator economy generates over $1.5 trillion annually. 73 million Americans freelanced in 2023. Platforms (Upwork, Fiverr, Etsy, Patreon) collectively take 20-50% of that.",
          `Competitive differentiation: (1) Economic: ${CANON.participationPct} vs. industry average of 70-75%. (2) IP: Cryptographic provenance via SSPS vs. platform-owned attribution. (3) Governance: Star Chamber + member votes vs. unilateral policy changes. (4) Network: Substrace Theorem proves cooperative value compounds faster than isolated platforms.`,
          "Structural moat: The IP Ledger grows with every contribution. ${CANON.innovations} innovations in the ledger represent an irreplaceable provenance database. The longer a member participates, the more entrenched their IP record -- and the more the platform is worth to them.",
          "Switzerland Policy moat: by enforcing No Politics / No Religion, the platform avoids the toxicity spiral that destroys community platforms. Reduces churn. Extends member lifetime value.",
        ],
      },
    },
  },
  {
    id: "platform",
    icon: <Layers className="h-5 w-5 text-purple-600" />,
    title: "Platform Architecture",
    depths: {
      "skipping-stones": {
        headline: "22 subsystems, one cooperative spine.",
        body: [
          "From the Ingest Pipeline to the Substrace Theorem, every system is built to track, protect, and compensate contributions.",
          "The spine: Pearl/Eblet/SSPS provenance chain, Substrate DAG, IP Ledger, Chronos tags.",
        ],
      },
      "wading-in": {
        headline: "Five layers: Ingest, Provenance, Economics, Governance, Surface.",
        body: [
          "Ingest Layer: Soccerball SID assignment, ChronosTag stamping, SkipEblet creation.",
          "Provenance Layer: Pearl/Eblet/SSPS chain, Substrate DAG, IP Ledger (${CANON.innovations} innovations).",
          "Economics Layer: Three-currency system (Credits/Marks/Joules), ${CANON.participationPct} split, ${CANON.costPlus} floor, Battery Dispatch, Furnace (XP/Reputation).",
          "Governance Layer: Star Chamber, Switzerland Policy, Defense Klaus, Contingency Operators, Dragonriders.",
          "Surface Layer: X-Ray Overlay, Wildfire Beacon Runs, Cue Cards, Golden Keys, Medallion System, Bounty Posters.",
        ],
      },
      "deep-dive": {
        headline: "Full 22-subsystem technical architecture with cross-references.",
        body: [
          "Full corpus: /how-it-all-works -- 22 subsystems, 3 depths each, narrator-mapped.",
          "Core data model: Pearl (SHA-256 hash + SID + ChronosTag), Eblet (Pearl + display metadata), SSPS (creator-binding certificate). Substrate DAG (append-only, 6 edge types).",
          "Economics implementation: All transactions split via platform logic (not policy). Credits = USD-equivalent compensation. Marks = participation tokens (not equity, not financial instruments). Joules = long-term accumulation, Substitution pathway (Pawn-gated, 12-month tenure requirement).",
          "Governance implementation: Star Chamber (4-member elected). Switzerland Policy (pearl 403453a4e9526f27). Defense Klaus (incident pipeline, legal fund). Contingency Operators (primitive #2301, 5-state machine, 5 Dragonriders).",
          "Network-effect proof: V(N) = N(N-1)/2 + 1. At ${CANON.innovations} innovations: theoretical V = 2,575,766. This is the Substrace Theorem (verified at /proofs/, 4 independent confirmation runs).",
        ],
      },
    },
  },
  {
    id: "economics",
    icon: <DollarSign className="h-5 w-5 text-green-600" />,
    title: "Economics",
    depths: {
      "skipping-stones": {
        headline: `${CANON.participationPct} to the people. ${CANON.costPlus} on everything. No exceptions.`,
        body: [
          `Every transaction: ${CANON.participationPct} to the creator/contributor pool, ${CANON.overheadPct} to the cooperative.`,
          `${CANON.costPlus} is the minimum price for every good and service. The platform enforces this mathematically.`,
        ],
      },
      "wading-in": {
        headline: "Worked example: $500 transaction.",
        body: [
          `$500 total. Platform overhead = $83.33 (${CANON.overheadPct}). Creator/contributor pool = $416.67 (${CANON.participationPct}).`,
          "Pool distribution (standard bounty): Primary creator 70% = $291.67. Collaborators 20% = $83.33. Initiative fund 10% = $41.67.",
          `${CANON.costPlus} example: production cost $100 -> minimum price $120. Physical Medallion at $1.10 production cost -> $1.32 minimum.`,
          `Membership: ${CANON.membershipUSD} baseline. Tiered Medallions (Coaster / Tereno / Initiative stamp) provide physical proof of participation.`,
        ],
      },
      "deep-dive": {
        headline: "Revenue model, unit economics, and three-currency mechanics.",
        body: [
          `Revenue sources: (1) Transaction fees (${CANON.overheadPct} of all bounty/commerce transactions). (2) Membership (${CANON.membershipUSD} x member count). (3) Medallion production margin (${CANON.costPlus} floor). (4) API licensing for the IP Ledger provenance database.`,
          "Unit economics at 10,000 members: Avg transaction/member/month = $150. Monthly transaction volume = $1.5M. Platform overhead = $250K/month. Minus operating costs ($180K) = $70K/month positive before growth investment.",
          "Three-currency model: Credits (USD-equivalent, Stripe payable). Marks (participation tokens -- not equity, not financial instruments, no external exchange value). Joules (long-term accumulation, 1/day active, Substitution pathway at 1 Joule = 0.01 Credits, Pawn-gated).",
          "Securities compliance: Marks pass all three participation-token tests. No expectation of profit from others' efforts. No exchange mechanism to external currency. No stated or implied return. Legal review confirmed (Pawn-gated final ratification).",
        ],
      },
    },
  },
  {
    id: "governance",
    icon: <Shield className="h-5 w-5 text-red-600" />,
    title: "Governance",
    depths: {
      "skipping-stones": {
        headline: "Members run it. Stars Chamber adjudicate it. The pearl locks it.",
        body: [
          "The Star Chamber is a 4-member elected governance body. They rule on IP designations, Switzerland Policy violations, Defense Klaus cases, and Contingency Operator triggers.",
          "Major economic rules (the 83.3% split, Cost+20%) require a 3/4 Star Chamber vote + member ratification to change. In practice: they don't change.",
        ],
      },
      "wading-in": {
        headline: "Three governance layers: platform policy, Star Chamber, member vote.",
        body: [
          "Platform policy: encoded in software (e.g., the ${CANON.participationPct} split). Cannot be overridden by any single actor.",
          "Star Chamber (4 elected members): rules on Crown Jewel designations, Switzerland Policy violations, Defense Klaus applications, Contingency Operator activations. Decisions recorded in Substrate DAG.",
          "Member vote: required for constitutional changes (economic splits, Switzerland Policy definition, membership fee adjustments). Quorum = 20% of active members. Simple majority for operational changes, 2/3 for constitutional changes.",
          "Switzerland Policy (pearl 403453a4e9526f27): No Politics, No Religion. Hard content exclusion. Three-strikes enforcement. Star Chamber appeal.",
        ],
      },
      "deep-dive": {
        headline: "Star Chamber election mechanics, appeal procedures, founder transition plan.",
        body: [
          "Star Chamber election: annual, ranked-choice. Any member with 12+ months tenure and a Tier 3 Medallion may run. 4 seats, staggered 2-year terms (2 seats elected per year). Current panel: 4 elected members + Founder (non-voting except for tie-breaking and CO triggers).",
          "Appeal procedure: any member may appeal a Star Chamber decision within 14 days. Appeal goes to a 3-member arbitration panel (randomly selected from all members with 24+ months tenure). Arbitration decisions are final.",
          "Founder transition: the Founder role is defined in the cooperative bylaws as a non-voting advisory role. The Founder persona (Denken) is a platform character. As membership grows, all Founder-specific governance rights are progressively transferred to the Star Chamber. Timeline: at 1,000 members, 50% transfer. At 5,000 members, full transfer.",
          "Contingency Operators: 5 COs defined (INTEGRITY, ATTACK, FOUNDER, REGULATORY, COMMUNITY). Each requires 3/5 Dragonrider authorization. The Founder is one of the 5 Dragonriders. Mimic Trunk simulations run quarterly.",
        ],
      },
    },
  },
  {
    id: "growth",
    icon: <TrendingUp className="h-5 w-5 text-teal-600" />,
    title: "Growth",
    depths: {
      "skipping-stones": {
        headline: "16 initiatives, the Mesh, and the Substrace Theorem.",
        body: [
          "Growth is built into the mathematics. Every new member adds N-1 new connections to the cooperative's value network.",
          "16 active initiatives provide 16 on-ramps for creators in different domains.",
        ],
      },
      "wading-in": {
        headline: "Cold-start strategy, network-effect flywheel, and geographic expansion.",
        body: [
          "Cold-start: ${CANON.initiatives} initiatives launched at day 1 provide immediate community density. Each initiative has its own bounty market, Pudding feed, and Medallion tier.",
          "Flywheel: Member joins -> earns Credits -> stakes Marks in Puddings -> surfaces content -> attracts more members -> more IP in ledger -> more Cross-Frontier value -> higher Substrace value -> more Credits to earn.",
          "Wildfire Beacon Runs and Golden Keys gamify exploration and reduce time-to-value for new members. Magic Carpet mode provides guided tours for high-key-count members.",
          "The Speak Friend hub (/speak-friend/) enables multilingual onboarding with 15-language tiles and translation bounties for community-driven localization.",
        ],
      },
      "deep-dive": {
        headline: "LTV model, CAC targets, and international expansion via translation bounties.",
        body: [
          "LTV calculation: Avg member tenure target = 4 years. Avg annual transaction volume/member = $1,800. LTV = $1,800 * 4 * ${CANON.overheadPct} + $5 * 4 = $471.60 (transaction fees) + $20 (membership) = $491.60.",
          "CAC target: < $25 via Wildfire Beacon Runs (word-of-mouth + gamified sharing). Red Carpet Rider members have measured CAC < $10 (organic referral).",
          "Network effect inflection: based on V(N) = N(N-1)/2 + 1, value per node grows dramatically above N=100 members per initiative. At N=200/initiative, V = 19,901. 16 initiatives at 200 members = total V = 318,416.",
          "International: Speak Friend hub at /speak-friend/. 15 languages, one open TRANSLATION bounty per language. Community-translated onboarding flows. Marks awarded to translators (participation tokens). Expansion to Spanish, Portuguese, French, Mandarin prioritized based on existing member location data.",
        ],
      },
    },
  },
];

// =========================================================================
// FAQ DATA
// =========================================================================
const FAQ_ITEMS = [
  {
    q: "Is this a co-op or a corporation?",
    a: "Liana Banyan Platform, LLC operates with cooperative principles. Members have governance rights, the economic splits are locked in platform logic, and the structure is designed to progressively transfer control to the member base as it grows.",
  },
  {
    q: `Why exactly ${CANON.participationPct} and not 80%?`,
    a: "83.3% = 5/6. The sixth part stays with the cooperative. Five parts go to the workers. That fraction was chosen because it is clean, clear, and non-negotiable -- 80% would invite negotiation to 79%, then 75%. 5/6 holds.",
  },
  {
    q: "What are Marks, exactly?",
    a: "Marks are participation tokens. They enable platform actions (Pudding staking, governance weighting, Badge eligibility) but have no external exchange value, do not represent equity in the cooperative, and promise no financial return. They are not investment instruments.",
  },
  {
    q: "Who owns my IP when I post it?",
    a: "You do. The IP Ledger records your contribution with a cryptographic SSPS certificate binding your creator identity to the Pearl hash. The platform licenses specific usage rights (display, promotion) but does not claim ownership.",
  },
  {
    q: "What is the Switzerland Policy?",
    a: "No Politics, No Religion. These are the two hard content exclusions. Not because the topics are bad -- but because they reliably destroy cooperative tables. The policy is encoded in pearl 403453a4e9526f27 and enforced by Content Shield with a three-strikes rule.",
  },
  {
    q: "How do I become a member?",
    a: `${CANON.membershipUSD}. Active membership gives you Pudding staking rights, Tier 2 Medallion eligibility, governance participation, and access to Magic Carpet Wildfire runs.`,
  },
];

// =========================================================================
// PAGE COMPONENT
// =========================================================================

export default function BusinessPlanPage() {
  const [depth, setDepth] = useState<DepthLayer>("wading-in");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <Badge variant="outline" className="mb-4 text-xs">
            Business Plan
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Liana Banyan Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            A cooperative infrastructure for creative and technical work.
          </p>
          <p className="text-muted-foreground mb-8">
            {CANON.participationPct} to members. {CANON.costPlus} pricing floor. {CANON.innovations} innovations tracked.
            Single-source-of-truth documentation -- every number here reflects live platform data.
          </p>

          <div className="max-w-md">
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">
              Reading depth
            </p>
            <DepthSwitcher current={depth} onChange={setDepth} />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-10">
        {SECTIONS.map((section) => {
          const content = section.depths[depth];
          return (
            <section key={section.id} id={section.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted">{section.icon}</div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <div className="pl-14">
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {content.headline}
                </h3>
                <ul className="flex flex-col gap-2">
                  {content.body.map((para, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t mt-8" />
            </section>
          );
        })}

        {/* FAQ */}
        <section id="faq">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item, i) => (
              <Card key={i} className="cursor-pointer" onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}>
                <CardHeader className="py-4 px-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{item.q}</p>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                        expandedFaq === i && "rotate-90"
                      )}
                    />
                  </div>
                </CardHeader>
                {expandedFaq === i && (
                  <CardContent className="pt-0 pb-4 px-5">
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Speak Founder tile */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <img
                  src="/images/mascots/denken/default.png"
                  alt="Denken"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div>
                  <h3 className="font-bold mb-1">Speak Founder</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ask Denken (the Founder persona) anything about the platform's design
                    decisions, the economic constitution, or where this is going.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/cephas">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Open Cephas
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <BookOpen className="w-12 h-12 text-blue-600 p-2 bg-blue-100 rounded-full shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">Full Platform Explainer</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Every subsystem explained at three depths, with narrator portraits and
                    cross-system connections.
                  </p>
                  <Button size="sm" variant="outline" asChild>
                    <a href="/how-it-all-works">
                      <Layers className="h-4 w-4 mr-2" />
                      How It All Works
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
