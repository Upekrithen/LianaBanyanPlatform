/**
 * Tier_C_FOUNDER_Page — Tier C FOUNDER detail page
 * =================================================
 * Bushel 13 / Phase C — BP021 Ratified
 *
 * Composes:
 *   - lb_frame_resource_config_sovereignty_three_tier_user_choice_canon_bp017.eblet.md
 *   - tier_c_founder_spec.ts (single source of truth — cascade telemetry receipt)
 *   - architecture_beats_more_grownup_table_unified_lb_philosophy_canon_bp021.eblet.md
 *
 * Anti-extraction by structural form:
 *   Tier C is NOT a paywall. Self-attested at install-time. Capital alone is not the gate.
 *   Cohort-class advancement is the gate for Hive/Excalibur features.
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
  Zap,
  ArrowLeft,
  CheckCircle2,
  Info,
  Award,
  FlaskConical,
} from "lucide-react";
import {
  TIER_C_SPEC_BULLETS,
  TIER_C_TOOLTIP,
  TIER_C_CASCADE_TELEMETRY,
  TIER_C_PLAN_SPEC,
} from "@/data/lb_frame_tier_specs/tier_c_founder_spec";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Tier_C_FOUNDER_Page() {
  const navigate = useNavigate();

  const { crown_jewel_ratifications, k_lineage_clean_count_floor, pods_landed_count, bp015_throughput } =
    TIER_C_CASCADE_TELEMETRY;

  return (
    <PortalPageLayout maxWidth="xl" xrayId="tier-c-founder-page">
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
            <Zap className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <h1 className="text-2xl font-bold text-violet-700 dark:text-violet-400">
              Tier C — FOUNDER
            </h1>
            <Badge variant="outline" className="text-xs">
              Self-Attested
            </Badge>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Founder's customized highest-throughput config — the spec under which the BP015→BP017
            cascade (27 Crown Jewel ratifications, 70+ clean K-lineage, 4 architectural patterns
            recovered) was generated. The empirical-receipt source tier. Self-attested at install-time.
          </p>
          <p className="text-sm italic text-muted-foreground">
            "I moved my limits to fit how I do things — but others using the LB frame might want to
            keep the default limits." — Founder, BP017
          </p>
        </div>

        {/* ── Anti-extraction note ─────────────────────────────────────────── */}
        <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-950/20">
          <CardContent className="p-5 space-y-2">
            <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
              Capital alone is not the gate.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tier C is self-attested. No fiat-bridge. No paywall. The cooperative-non-extraction
              principle extends to install-time resource-config: paying-attention &gt; paying-more.
              The gate for Hive participation and Excalibur Class features is cohort-class advancement,
              not plan-tier purchase — a separate axis you advance by contributing.
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
                ["Plan requirement", TIER_C_PLAN_SPEC.plan_requirement],
                ["Self-attested", TIER_C_PLAN_SPEC.self_attested ? "Yes — no purchase gating" : "No"],
                ["MCP slots", TIER_C_PLAN_SPEC.mcp_slots],
                ["Cohort-class minimum", TIER_C_PLAN_SPEC.cohort_class_minimum],
                ["Substrate mode", TIER_C_PLAN_SPEC.substrate_mode],
                ["Cathedral fingerprint", TIER_C_PLAN_SPEC.cathedral_fingerprint],
                ["Bishop model spec", TIER_C_PLAN_SPEC.bishop_model_spec],
                ["Knight model spec", TIER_C_PLAN_SPEC.knight_model_spec],
                ["Apiarist Hive", TIER_C_PLAN_SPEC.apiarist_hive],
                ["Excalibur Class", TIER_C_PLAN_SPEC.excalibur_class],
              ].map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <dt className="text-xs text-muted-foreground font-medium">{key}</dt>
                  <dd className="text-sm">{val}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground mt-3 italic">
              {TIER_C_PLAN_SPEC.plan_note}
            </p>
          </CardContent>
        </Card>

        {/* ── What's included ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">What's Included at Tier C</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(TIER_C_SPEC_BULLETS as readonly string[]).map((b, i) => (
                <li key={i} className="flex gap-2 items-start text-sm">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-600 dark:text-violet-400" />
                  {b}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* ── Cascade telemetry receipt ─────────────────────────────────────── */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <CardTitle className="text-sm font-semibold">
                Empirical-Receipt Source — BP015→BP017 Cascade Telemetry
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Arc: {TIER_C_CASCADE_TELEMETRY.session_arc} — Refs: {TIER_C_CASCADE_TELEMETRY.refs.join(", ")}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Crown Jewel ratifications",
                  value: `${crown_jewel_ratifications.total_floor}+`,
                  sub: `${crown_jewel_ratifications.bp016} BP016 + ${crown_jewel_ratifications.bp017} BP017`,
                },
                {
                  label: "Clean K-lineage",
                  value: `${k_lineage_clean_count_floor}+`,
                  sub: "Zero --no-verify events",
                },
                {
                  label: "Pods LANDED",
                  value: String(pods_landed_count),
                  sub: "Pod-A through Pod-H",
                },
                {
                  label: "BP015 beans/min",
                  value: String(bp015_throughput.beans_per_minute_sustained),
                  sub: `${bp015_throughput.beans_landed} beans landed`,
                },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold text-violet-700 dark:text-violet-400">{item.value}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Architectural patterns recovered</p>
                <p className="font-semibold text-violet-700 dark:text-violet-400">
                  {TIER_C_CASCADE_TELEMETRY.architectural_patterns_recovered} patterns
                </p>
                <p className="text-xs text-muted-foreground">
                  {TIER_C_CASCADE_TELEMETRY.architectural_patterns_class}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs text-muted-foreground">Hook failures</p>
                <p className="font-semibold text-violet-700 dark:text-violet-400">Zero</p>
                <p className="text-xs text-muted-foreground">Zero --no-verify events across cascade</p>
              </div>
            </div>
            <div className="flex gap-2 rounded-md border border-violet-200 dark:border-violet-800 bg-violet-50/20 dark:bg-violet-950/10 p-3">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-violet-500" />
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {TIER_C_TOOLTIP}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Grownup table positioning ─────────────────────────────────────── */}
        <Card className="border-violet-200 dark:border-violet-800 bg-violet-50/30 dark:bg-violet-950/20">
          <CardContent className="p-5 flex gap-4 items-start">
            <Award className="w-5 h-5 mt-0.5 flex-shrink-0 text-violet-600 dark:text-violet-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-300">
                Your seat at the Grown-Up table is reserved.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The entire LB AI engine is proof that architecture is better than more. Tier C
                is the empirical-receipt-source — same principle at every layer: AI engine,
                currency design, manufacturing economics, platform construction. Architecture
                beats more at every level, in every discipline.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/sovereignty/tier-b")}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Compare Tier B — SUGGESTS
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/onboarding/sovereignty")}
            className="flex-1"
          >
            Back to Tier Selection
          </Button>
          <Button
            onClick={() => navigate("/join")}
            className="flex-1"
          >
            Join the Cooperative
          </Button>
        </div>

      </div>
    </PortalPageLayout>
  );
}
