/**
 * SovereigntyTierSelection — 3-Tier Sovereignty Onboarding Landing Page
 * ======================================================================
 * Bushel 13 / Phase C — BP021 Ratified
 *
 * Composes:
 *   - lb_frame_resource_config_sovereignty_three_tier_user_choice_canon_bp017.eblet.md
 *   - architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
 *   - how_to_save_the_world_6_easy_steps_paper_canon_bp016.eblet.md
 *   - paper_class_a_considered_approach_to_universal_series_12_papers_canon_bp021.eblet.md
 *
 * Anti-extraction by structural form:
 *   Anyone can run any tier. Barrier-of-entry is NOT capital.
 *   $5/year membership is the bright line for cooperative participation.
 *   Tier selection is orthogonal to membership (anyone-can-run principle).
 *
 * Augur-Pricing exemption: membership-orthogonal; $5/year membership identical
 *   for all members; tiers are resource-config tiers NOT pricing tiers.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Layers,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Users,
  Compass,
} from "lucide-react";

// ─── 6 Easy Steps ladder (canonical) ────────────────────────────────────────
// Source: how_to_save_the_world_6_easy_steps_paper_canon_bp016.eblet.md

const SIX_STEPS = [
  { n: 1, action: "Install LB Frame", note: "Lone Wolf — free, AGPL baseline" },
  { n: 2, action: "Send a Cue Card", note: "Pied Piper Tier 1 — Fluid Cathedral unlocks" },
  { n: 3, action: "Join the Federation", note: "$5/year — the single immutable membership" },
  { n: 4, action: "Opt-in checkmarks", note: "Contribution consent + Excalibur-eligible" },
  { n: 5, action: "Participate in a Hive", note: "Collective intelligence via Apiarist Librarian" },
  { n: 6, action: "Earn share-back", note: "Cooperative Datacenter — Cost+20% loop" },
] as const;

// ─── Tier summaries ──────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "tier-a" as const,
    path: "/onboarding/sovereignty/tier-a",
    label: "Tier A — NEEDS",
    tagline: "Whatever you have. No upgrade required.",
    badge: "Anyone Can Run It",
    badgeVariant: "secondary" as const,
    icon: Layers,
    highlight: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    bullets: [
      "Default Claude Code plan — no subscription upgrade",
      "Pheromone substrate read-only",
      "Detective TEAM read-only (canon fan-out)",
      "Brittle Cathedral fingerprint",
      "Caithedral Effect lift demonstrated at this tier",
    ],
  },
  {
    id: "tier-b" as const,
    path: "/onboarding/sovereignty/tier-b",
    label: "Tier B — SUGGESTS",
    tagline: "Recommended uplift. Better experience.",
    badge: "Recommended",
    badgeVariant: "default" as const,
    icon: TrendingUp,
    highlight: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50/60 dark:bg-blue-950/30",
    bullets: [
      "Claude Code Max or equivalent (recommended)",
      "Pheromone substrate read + write",
      "Detective TEAM full — Miner subclass",
      "Fluid Cathedral fingerprint (event-driven)",
      "2–3× Reckoning velocity over Tier A",
    ],
  },
  {
    id: "tier-c" as const,
    path: "/onboarding/sovereignty/tier-c",
    label: "Tier C — FOUNDER",
    tagline: "Empirical-receipt source. Maximum velocity.",
    badge: "Self-Attested",
    badgeVariant: "outline" as const,
    icon: Zap,
    highlight: "text-violet-700 dark:text-violet-400",
    border: "border-violet-300 dark:border-violet-700",
    bg: "bg-violet-50/60 dark:bg-violet-950/30",
    bullets: [
      "Founder's customized highest-throughput config",
      "All substrate features operational",
      "BP015→BP017 cascade generated under this spec",
      "Apiarist Hive full + Excalibur Class eligible",
      "Self-attested — capital alone is not the gate",
    ],
  },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function SovereigntyTierSelection() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="2xl" xrayId="sovereignty-tier-selection">
      <div className="space-y-10">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4 pt-4">
          <Badge variant="outline" className="text-xs px-3 py-1 mb-2">
            LB Frame Resource-Config Sovereignty
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight">
            Choose Your LB Frame Tier
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            LB Frame distribution does not require upgrading your AI plan.
            Three resource-config tiers — <span className="font-semibold">NEEDS / SUGGESTS / FOUNDER</span> —
            let anyone run it from day one.{" "}
            <span className="font-medium text-foreground">Barrier-of-entry is not capital.</span>
          </p>
          <p className="text-sm text-muted-foreground italic max-w-xl mx-auto">
            "We should specify what we NEED for it to work, what we SUGGEST for it to work even better,
            and allow the user to choose from the three — because any can run it."
            <br />
            <span className="not-italic font-medium">— Founder, BP017</span>
          </p>
        </div>

        {/* ── Architecture beats more ───────────────────────────────────────── */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/40 dark:bg-amber-950/20">
          <CardContent className="p-5 flex gap-4 items-start">
            <BookOpen className="w-5 h-5 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Architecture Beats More
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The Caithedral Effect's +51–84 pp HOT-retrieval lift holds at Tier A — default plan,
                no upgrades. Architecture is the lever, not raw model tier. Your seat at the
                Grown-Up table is reserved.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Tier cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`${tier.border} ${tier.bg} flex flex-col`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon className={`w-5 h-5 ${tier.highlight}`} />
                    <CardTitle className={`text-base ${tier.highlight}`}>
                      {tier.label}
                    </CardTitle>
                    <Badge variant={tier.badgeVariant} className="text-xs ml-auto">
                      {tier.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{tier.tagline}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4">
                  <ul className="space-y-1.5 flex-1">
                    {tier.bullets.map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex gap-2 items-start">
                        <CheckCircle2 className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${tier.highlight}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-auto"
                    onClick={() => navigate(tier.path)}
                  >
                    Learn more <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Anti-extraction note ─────────────────────────────────────────── */}
        <div className="text-center space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Anyone can run any tier.</p>
          <p>
            Tier is orthogonal to the $5/year cooperative membership — the membership unlocks cooperative
            participation; the tier determines your LB Frame resource-config. Both are your choice.
          </p>
        </div>

        {/* ── 6 Easy Steps (member-recruitment funnel composing) ───────────── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">How to Save the World in 6 Easy Steps</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The 6-step onboarding ladder — from first install through earning share-back via The Cooperative
            Datacenter. Each tier unlocks more of the cooperative substrate.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SIX_STEPS.map((step) => (
              <Card key={step.n} className="border-muted">
                <CardContent className="p-4 flex gap-3 items-start">
                  <span className="text-lg font-bold text-muted-foreground/50 leading-none mt-0.5 flex-shrink-0 w-5 text-center">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{step.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.note}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* ── 12-Paper Series as curriculum ────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">The 12-Paper Save-the-World Series</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Liana Banyan Corporation <em>is</em> the Save-the-World Foundation. Twelve papers compose
              into household-scale civilizational sovereignty — Cognitive × Material × Life × Civic vectors.
              The Series is the curriculum; the cooperative is the implementation.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
              {[
                "Universal Economic Prosperity",
                "DNA-Engineered AI",
                "Low Cost Energy",
                "Abolishing World Hunger",
                "Factory Manufacturing",
                "Resolving Political Conflict",
                "Health Care",
                "Engineering Conducted AI",
                "Lifelong Learning",
                "Cooperative Shelter",
                "Universal Caregiving",
                "Earth Stewardship",
              ].map((title, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <span className="text-muted-foreground/40 w-4 text-right flex-shrink-0">{i + 1}.</span>
                  <span>{title}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic">
              Each paper has a Pedestal Forum — contribute additions in the manner of the Law of the
              Medes and Persians. The paper is immutable; your addition composes alongside with co-equal authority.
            </p>
          </CardContent>
        </Card>

        {/* ── CTA to select tier ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={() => navigate("/onboarding/sovereignty/tier-a")}>
            Start with Tier A — NEEDS
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/join")}>
            Join the Cooperative — $5/year
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
