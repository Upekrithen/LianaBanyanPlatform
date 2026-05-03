/**
 * Tier_A_NEEDS_Page — Tier A NEEDS detail page
 * =============================================
 * Bushel 13 / Phase C — BP021 Ratified
 *
 * Composes:
 *   - lb_frame_resource_config_sovereignty_three_tier_user_choice_canon_bp017.eblet.md
 *   - tier_a_needs_spec.ts (single source of truth for spec bullets + empirical floor)
 *   - how_to_save_the_world_6_easy_steps_paper_canon_bp016.eblet.md
 *   - pre_cathedral_empirical_floor_substack_hook (BP015 lock-in)
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
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  TIER_A_SPEC_BULLETS,
  TIER_A_TOOLTIP,
  TIER_A_EMPIRICAL_FLOOR,
  TIER_A_PLAN_SPEC,
  TIER_A_LIMITATIONS,
} from "@/data/lb_frame_tier_specs/tier_a_needs_spec";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Tier_A_NEEDS_Page() {
  const navigate = useNavigate();

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tier-a-needs-page">
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
            <Layers className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              Tier A — NEEDS
            </h1>
            <Badge variant="secondary" className="text-xs">
              Anyone Can Run It
            </Badge>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Whatever you have out-of-box. No subscription upgrade required. No extra spend.
            LB Frame runs on your default Claude Code plan and demonstrates Cathedral Effect
            retrieval lift at this tier.
          </p>
          <p className="text-sm italic text-muted-foreground">
            "The first being whatever it IS — because any can run it, right?" — Founder, BP017
          </p>
        </div>

        {/* ── Pre-Cathedral empirical floor hook ───────────────────────────── */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Pre-Cathedral isn't just an empirical floor — it's the default state of the AI
              industry as of 2026.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every AI company, every API integration, every prompt-engineering shop demonstrates it
              daily. They think "good prompts" + "RAG" + "fine-tuning" are the levers. They aren't.
              The lever is the substrate-shape of the gears. Tier A runs on the same models you use
              today — through properly ground and interlocked gears.
            </p>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 italic">
              Go ask any AI you currently use a hard retrieval question. Observe the floor.
              Come back when you want the ceiling.
            </p>
          </CardContent>
        </Card>

        {/* ── Plan spec ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Plan Specification</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Plan requirement", TIER_A_PLAN_SPEC.plan_requirement],
                ["Upgrade required", TIER_A_PLAN_SPEC.upgrade_required ? "Yes" : "No"],
                ["MCP slots", TIER_A_PLAN_SPEC.mcp_slots],
                ["Cohort-class default", TIER_A_PLAN_SPEC.cohort_class_default],
                ["Substrate mode", TIER_A_PLAN_SPEC.substrate_mode],
                ["Cathedral fingerprint", TIER_A_PLAN_SPEC.cathedral_fingerprint],
              ].map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground font-medium">{key}</dt>
                  <dd className="text-sm">{val}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* ── What's included ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">What's Included at Tier A</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(TIER_A_SPEC_BULLETS as readonly string[]).map((b, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Empirical floor receipt ───────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold">Empirical Floor Receipt</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Benchmark: {TIER_A_EMPIRICAL_FLOOR.benchmark} — {TIER_A_EMPIRICAL_FLOOR.refs.join(", ")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">HOT retrieval rate</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {TIER_A_EMPIRICAL_FLOOR.hot_rate_min_pct}–{TIER_A_EMPIRICAL_FLOOR.hot_rate_max_pct}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lift over default AI</p>
                <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                  +{TIER_A_EMPIRICAL_FLOOR.lift_pp_min}–{TIER_A_EMPIRICAL_FLOOR.lift_pp_max} pp
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Target lift (minimum)</p>
                <p className="font-semibold">
                  +{TIER_A_EMPIRICAL_FLOOR.target_lift_pp} pp{" "}
                  {TIER_A_EMPIRICAL_FLOOR.pass && (
                    <Badge variant="secondary" className="text-xs ml-1">PASS</Badge>
                  )}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {TIER_A_TOOLTIP}
            </p>
          </CardContent>
        </Card>

        {/* ── Limitations at Tier A ─────────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">What Tier A Cannot Do (Without Advancement)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(TIER_A_LIMITATIONS as readonly string[]).map((lim, i) => (
                <li key={i} className="flex gap-2 items-start text-sm text-muted-foreground">
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground/50" />
                  {lim}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-3 italic">
              These require cohort-class advancement (Federation membership, Cue Card recency, etc.)
              — a separate axis from resource-config tier.
            </p>
          </CardContent>
        </Card>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/sovereignty")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Tier Selection
          </Button>
          <Button
            onClick={() => navigate("/onboarding/sovereignty/tier-b")}
            variant="outline"
            className="flex-1"
          >
            Compare Tier B — SUGGESTS
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
