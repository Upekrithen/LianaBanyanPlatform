/**
 * Tier_B_SUGGESTS_Page — Tier B SUGGESTS detail page
 * ====================================================
 * Bushel 13 / Phase C — BP021 Ratified
 *
 * Composes:
 *   - lb_frame_resource_config_sovereignty_three_tier_user_choice_canon_bp017.eblet.md
 *   - tier_b_suggests_spec.ts (single source of truth for spec bullets + empirical uplift)
 *   - architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
 *
 * Augur-Pricing exemption: membership-orthogonal; $5/year membership identical for all;
 *   tiers are resource-config tiers NOT pricing tiers.
 */

import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Info,
  BarChart3,
} from "lucide-react";
import {
  TIER_B_SPEC_BULLETS,
  TIER_B_TOOLTIP,
  TIER_B_EMPIRICAL_UPLIFT,
  TIER_B_PLAN_SPEC,
  TIER_B_LIMITATIONS,
} from "@/data/lb_frame_tier_specs/tier_b_suggests_spec";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Tier_B_SUGGESTS_Page() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tier-b-suggests-page">
      <div className="space-y-8">

        {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
        <button
          onClick={() => navigate("/onboarding/sovereignty")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tier Selection
        </button>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              Tier B — SUGGESTS
            </h1>
            <Badge variant="default" className="text-xs">
              Recommended
            </Badge>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            The recommended config for a better experience — documented lift over Tier A.
            Claude Code Max or equivalent. Faster Reckoning velocity, fuller substrate access,
            and Fluid Cathedral fingerprint via Cue Card recency gate.
          </p>
          <p className="text-sm italic text-muted-foreground">
            "What we SUGGEST for it to work even better — because any can run it, right?" — Founder, BP017
          </p>
        </div>

        {/* ── Plan spec ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Plan Specification</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Plan requirement", TIER_B_PLAN_SPEC.plan_requirement],
                ["Upgrade required", TIER_B_PLAN_SPEC.upgrade_required ? "Yes" : "No (informational advisory only)"],
                ["MCP slots", TIER_B_PLAN_SPEC.mcp_slots],
                ["Cohort-class recommended", TIER_B_PLAN_SPEC.cohort_class_recommended],
                ["Substrate mode", TIER_B_PLAN_SPEC.substrate_mode],
                ["Cathedral fingerprint", TIER_B_PLAN_SPEC.cathedral_fingerprint],
                ["Pheromone mode", TIER_B_PLAN_SPEC.pheromone_mode],
                ["Detective TEAM", TIER_B_PLAN_SPEC.detective_team_mode],
              ].map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground font-medium">{key}</dt>
                  <dd className="text-sm">{val}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground mt-3 italic">
              {TIER_B_PLAN_SPEC.plan_note}
            </p>
          </CardContent>
        </Card>

        {/* ── What's included ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">What's Included at Tier B</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(TIER_B_SPEC_BULLETS as readonly string[]).map((b, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Empirical uplift receipt ──────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <CardTitle className="text-sm font-semibold">Empirical Uplift over Tier A</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Refs: {TIER_B_EMPIRICAL_UPLIFT.refs.join(", ")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">HOT retrieval rate</p>
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  {TIER_B_EMPIRICAL_UPLIFT.hot_rate_min_pct}–{TIER_B_EMPIRICAL_UPLIFT.hot_rate_max_pct}%
                </p>
                <p className="text-xs text-muted-foreground italic leading-relaxed">
                  {TIER_B_EMPIRICAL_UPLIFT.hot_rate_note}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Reckoning velocity uplift</p>
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  {TIER_B_EMPIRICAL_UPLIFT.reckoning_velocity_uplift_range} over Tier A
                </p>
                <p className="text-xs text-muted-foreground">{TIER_B_EMPIRICAL_UPLIFT.reckoning_velocity_description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pod scaffolding rate</p>
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  ~{TIER_B_EMPIRICAL_UPLIFT.pod_scaffolding_rate_target_min_x}× over Tier A
                </p>
                <p className="text-xs text-muted-foreground">{TIER_B_EMPIRICAL_UPLIFT.pod_scaffolding_rate_description}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Cathedral HOT between rebuilds</p>
                <p className="font-semibold text-blue-700 dark:text-blue-400">
                  {TIER_B_EMPIRICAL_UPLIFT.cathedral_hot_between_rebuilds_pct_range}%
                </p>
                <p className="text-xs text-muted-foreground">Fluid Cathedral event-driven freshness</p>
              </div>
            </div>
            <div className="flex gap-2 mt-2 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-3">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {TIER_B_TOOLTIP}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Limitations at Tier B ─────────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">What Tier B Cannot Do (Without Separate Advancement)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(TIER_B_LIMITATIONS as readonly string[]).map((lim, i) => (
                <li key={i} className="flex gap-2 items-start text-sm text-muted-foreground">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/50" />
                  {lim}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Architecture Beats More tie-in ────────────────────────────────── */}
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              Architecture Beats More — even at Tier B
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Sonnet-on-both probe (BP021) demonstrated 100% structural parity + 57% richer
              rationale at ~5× lower cost vs Opus+Sonnet pairing. Tier B's bigger bag makes
              parallelizable work faster; the substrate routing is the core lift, not raw model size.
              Your seat at the Grown-Up table is reserved.
            </p>
          </CardContent>
        </Card>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/sovereignty/tier-a")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Compare Tier A — NEEDS
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/sovereignty/tier-c")}
            className="flex-1"
          >
            Compare Tier C — FOUNDER
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            onClick={() => navigate("/join")}
            className="flex-1"
          >
            Join the Cooperative
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
