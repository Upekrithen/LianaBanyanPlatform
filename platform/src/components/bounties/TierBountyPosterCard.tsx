/**
 * TierBountyPosterCard — Per-Tier Bounty Poster cards for Three-Tier LB Frame testing
 * KN-H6 / BP017 — Pod-H Bounty Poster #1 of 3
 * =============================================================================
 * Displays the four Three-Tier empirical-verification Bounty classes:
 *   A. Tier A NEEDS floor verification     (Marks × 1.0 — baseline)
 *   B. Tier B SUGGESTS uplift verification (Marks × 1.25)
 *   C. Tier C FOUNDER replication          (Marks × 1.5 — Project-cohort uplift)
 *   D. Cross-tier comparison receipt       (Marks × 2.0 — highest class)
 *
 * FORK doctrine display: Marks pay-rate shown as Marks-class only.
 * "100 Marks base × 2.0 = 200 Marks" — never USD equivalent.
 *
 * Composes with:
 *   - FeaturedBountyCard.tsx (KN088/BP009) — existing Bounty Poster pattern
 *   - bounty_poster_tier_scaffold.ts (KN-H5) — pay-rate metadata
 *   - bounty_poster_tier_generator.ts (KN-H6) — generator function
 *   - TierBountyPosterGallery.tsx (below) — tier-class filter + full display
 *
 * data-xray-id: tier-bounty-poster-card
 * Tags: KN-H6 / v-per-tier-bounty-poster-generator-KN-H6-<sha>
 */

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  FlaskConical,
  TrendingUp,
  Crown,
  GitCompare,
  ChevronDown,
  ChevronUp,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types (mirrored from bounty_poster_tier_scaffold.ts) ────────────────────
// Inlined here to avoid cross-package imports between platform/ and librarian-mcp/.

export type TierBountyClass =
  | "tier_a_floor_verification"
  | "tier_b_uplift_verification"
  | "tier_c_founder_replication"
  | "cross_tier_comparison";

export interface TierBountyMeta {
  bounty_class: TierBountyClass;
  tier_label: string;
  marks_multiplier: number;
  poster_headline: string;
  poster_subhead: string;
  description: string;
  empirical_anchor: string;
}

// ─── Static metadata (mirrors THREE_TIER canon) ──────────────────────────────
// Source of truth: bounty_poster_tier_scaffold.ts TIER_BOUNTY_PAY_RATES

const TIER_BOUNTY_META: TierBountyMeta[] = [
  {
    bounty_class: "tier_a_floor_verification",
    tier_label: "Tier A — NEEDS",
    marks_multiplier: 1.0,
    poster_headline: "Verify the Tier A Floor",
    poster_subhead: "Does Cathedral Effect hold on a default plan? Prove it.",
    description:
      "Run LB Frame Cathedral Effect benchmark (R10/R11/R13 question bank) at Tier A " +
      "(default plan). Document cold vs HOT accuracy. Submit empirical-receipt JSON " +
      "showing ≥30pp Cathedral Effect lift. Confirms the floor — substrate value at " +
      "the universal access tier.",
    empirical_anchor: "TIER_A_EMPIRICAL_FLOOR_RECEIPT_BP017.json",
  },
  {
    bounty_class: "tier_b_uplift_verification",
    tier_label: "Tier B — SUGGESTS",
    marks_multiplier: 1.25,
    poster_headline: "Verify the Tier B Uplift",
    poster_subhead: "Is Tier B faster? Measure it. Prove it. Earn Marks.",
    description:
      "Run benchmark at Tier B (recommended plan). Compare to a Tier A floor receipt. " +
      "Verify Reckoning velocity ≥1.5× faster than Tier A with Cathedral Effect preserved " +
      "(≥30pp). Documents the measurable value of the recommended tier.",
    empirical_anchor: "tier_a_floor_verification.ts (Tier A anchor)",
  },
  {
    bounty_class: "tier_c_founder_replication",
    tier_label: "Tier C — FOUNDER",
    marks_multiplier: 1.5,
    poster_headline: "Replicate the Founder's Receipt",
    poster_subhead: "Can you reproduce the 36-hour Reckoning at Tier C? The corpus wants to know.",
    description:
      "Replicate Founder's BP015→BP017 cascade at Tier C on your own corpus. " +
      "Confirm max-velocity is substrate-driven, not plan-exclusive. Self-attested tier; " +
      "capital is not the gate. 1.5× Marks includes Apiarist Project-cohort uplift (BP016).",
    empirical_anchor: "BP015→BP017 cascade receipt (KN-H4)",
  },
  {
    bounty_class: "cross_tier_comparison",
    tier_label: "Cross-Tier Comparison",
    marks_multiplier: 2.0,
    poster_headline: "The Full Tier Comparison",
    poster_subhead: "Run all three. Show the deltas. Highest Marks in the tier-test corpus.",
    description:
      "Same question bank, same submitter, three separate runs (Tier A / B / C). " +
      "Document Cathedral Effect lift at each tier and lift deltas between tiers. " +
      "Definitive empirical artifact. Feeds the Three-Tier canon with member-generated " +
      "generalization evidence. Highest Bounty class (2.0× Marks).",
    empirical_anchor: "R10/R11/R13 cross-vendor benchmark (K477/K481/K499)",
  },
];

// ─── Color schemes per tier class ────────────────────────────────────────────

interface TierColorScheme {
  cardBorder: string;
  cardBg: string;
  badgeBg: string;
  badgeText: string;
  multiplierBg: string;
  multiplierText: string;
  headlineColor: string;
  iconColor: string;
}

const TIER_COLORS: Record<TierBountyClass, TierColorScheme> = {
  tier_a_floor_verification: {
    cardBorder: "border-sky-200 dark:border-sky-800",
    cardBg: "bg-sky-50/40 dark:bg-sky-950/20",
    badgeBg: "bg-sky-100 dark:bg-sky-900",
    badgeText: "text-sky-800 dark:text-sky-200",
    multiplierBg: "bg-sky-100 dark:bg-sky-900/60",
    multiplierText: "text-sky-700 dark:text-sky-300",
    headlineColor: "text-sky-900 dark:text-sky-100",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  tier_b_uplift_verification: {
    cardBorder: "border-violet-200 dark:border-violet-800",
    cardBg: "bg-violet-50/40 dark:bg-violet-950/20",
    badgeBg: "bg-violet-100 dark:bg-violet-900",
    badgeText: "text-violet-800 dark:text-violet-200",
    multiplierBg: "bg-violet-100 dark:bg-violet-900/60",
    multiplierText: "text-violet-700 dark:text-violet-300",
    headlineColor: "text-violet-900 dark:text-violet-100",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  tier_c_founder_replication: {
    cardBorder: "border-amber-300 dark:border-amber-700",
    cardBg: "bg-amber-50/40 dark:bg-amber-950/20",
    badgeBg: "bg-amber-100 dark:bg-amber-900",
    badgeText: "text-amber-800 dark:text-amber-200",
    multiplierBg: "bg-amber-100 dark:bg-amber-900/60",
    multiplierText: "text-amber-700 dark:text-amber-300",
    headlineColor: "text-amber-900 dark:text-amber-100",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  cross_tier_comparison: {
    cardBorder: "border-emerald-300 dark:border-emerald-700",
    cardBg: "bg-emerald-50/40 dark:bg-emerald-950/20",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    multiplierBg: "bg-emerald-100 dark:bg-emerald-900/60",
    multiplierText: "text-emerald-700 dark:text-emerald-300",
    headlineColor: "text-emerald-900 dark:text-emerald-100",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
};

// ─── Icon per tier class ──────────────────────────────────────────────────────

function TierIcon({
  bounty_class,
  className,
}: {
  bounty_class: TierBountyClass;
  className?: string;
}) {
  switch (bounty_class) {
    case "tier_a_floor_verification":
      return <FlaskConical className={className} />;
    case "tier_b_uplift_verification":
      return <TrendingUp className={className} />;
    case "tier_c_founder_replication":
      return <Crown className={className} />;
    case "cross_tier_comparison":
      return <GitCompare className={className} />;
  }
}

// ─── Marks Multiplier Badge ───────────────────────────────────────────────────

function MarksMultiplierBadge({
  multiplier,
  standardRate,
  colorScheme,
}: {
  multiplier: number;
  standardRate: number;
  colorScheme: TierColorScheme;
}) {
  const earned = standardRate * multiplier;
  return (
    <div
      className={cn(
        "flex flex-col items-end gap-0.5 rounded-lg px-2 py-1",
        colorScheme.multiplierBg,
      )}
      data-testid="marks-multiplier-badge"
      title="FORK doctrine: Marks only — never fiat"
    >
      <div className="flex items-center gap-1">
        <Trophy className={cn("w-3 h-3", colorScheme.multiplierText)} />
        <span className={cn("text-sm font-bold", colorScheme.multiplierText)}>
          {earned.toLocaleString()} Marks
        </span>
      </div>
      <span className={cn("text-[10px] font-mono", colorScheme.multiplierText)}>
        {standardRate} × {multiplier.toFixed(2)}
      </span>
    </div>
  );
}

// ─── Submission Requirements Preview ─────────────────────────────────────────

const SUBMISSION_PREVIEW: Record<TierBountyClass, string[]> = {
  tier_a_floor_verification: [
    "cold_accuracy_pct + hot_accuracy_pct",
    "lift_pp ≥ 30 (Cathedral Effect floor)",
    "tier_config: 'needs'",
    "ai_model + question_bank_version + run_timestamp",
  ],
  tier_b_uplift_verification: [
    "tier_b_cold/hot_accuracy_pct",
    "tier_b_lift_pp ≥ 30",
    "reckoning_velocity_ratio ≥ 1.5",
    "tier_a_reference_receipt (required)",
  ],
  tier_c_founder_replication: [
    "replication_cold/hot_accuracy_pct",
    "replication_lift_pp ≥ 30",
    "reckoning_velocity_hours (ref: 36 hrs)",
    "corpus_folder_description (own corpus)",
  ],
  cross_tier_comparison: [
    "All three tiers: cold + hot accuracy",
    "same_submitter: true (required)",
    "same question_bank_version all tiers",
    "run_timestamps for all three tiers",
  ],
};

// ─── Component: TierBountyPosterCard ─────────────────────────────────────────

export interface TierBountyPosterCardProps {
  meta: TierBountyMeta;
  /** Base Marks rate (default: 100). Displayed as standard_rate × multiplier. */
  standardRate?: number;
  /** If true, renders compact (no description, no submission fields). */
  compact?: boolean;
  /** Called when "Submit Receipt" is clicked. */
  onSubmit?: (bounty_class: TierBountyClass) => void;
  /** Whether the viewer is a Federation Member (eligibility gate display). */
  isMember?: boolean;
}

export function TierBountyPosterCard({
  meta,
  standardRate = 100,
  compact = false,
  onSubmit,
  isMember = false,
}: TierBountyPosterCardProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = TIER_COLORS[meta.bounty_class];

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md border",
        colors.cardBorder,
        colors.cardBg,
      )}
      data-xray-id="tier-bounty-poster-card"
      data-tier-class={meta.bounty_class}
    >
      <CardContent className={cn("space-y-3", compact ? "pt-4 pb-2 px-4" : "pt-5 pb-3 px-5")}>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center bg-white/60 dark:bg-black/20",
              )}
            >
              <TierIcon
                bounty_class={meta.bounty_class}
                className={cn("w-5 h-5", colors.iconColor)}
              />
            </div>
            <div>
              <p
                className={cn(
                  "font-semibold leading-tight",
                  compact ? "text-sm" : "text-base",
                  colors.headlineColor,
                )}
              >
                {meta.poster_headline}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.tier_label}</p>
            </div>
          </div>
          <MarksMultiplierBadge
            multiplier={meta.marks_multiplier}
            standardRate={standardRate}
            colorScheme={colors}
          />
        </div>

        {/* Sub-headline */}
        <p className="text-xs font-medium text-muted-foreground italic">
          "{meta.poster_subhead}"
        </p>

        {/* Eligibility badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge
            variant="outline"
            className={cn("text-[10px]", colors.badgeBg, colors.badgeText, "border-none")}
          >
            Federation Member or higher
          </Badge>
          {meta.marks_multiplier === 2.0 && (
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200"
            >
              Highest Bounty Class
            </Badge>
          )}
          {meta.marks_multiplier === 1.5 && (
            <Badge
              variant="outline"
              className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
            >
              + Apiarist Cohort Uplift
            </Badge>
          )}
        </div>

        {/* Description (expandable in compact mode) */}
        {!compact && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {meta.description}
          </p>
        )}

        {/* Submission fields preview (expandable) */}
        {!compact && (
          <div>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setExpanded((e) => !e)}
              aria-expanded={expanded}
              data-testid={`tier-bounty-expand-${meta.bounty_class}`}
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
              {expanded ? "Hide" : "Show"} required submission fields
            </button>

            {expanded && (
              <ul
                className="mt-2 space-y-1"
                data-testid={`tier-bounty-fields-${meta.bounty_class}`}
              >
                {SUBMISSION_PREVIEW[meta.bounty_class].map((field) => (
                  <li key={field} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <span className="mt-0.5 text-green-500 font-bold">✓</span>
                    <span>{field}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* FORK doctrine note */}
        {!compact && (
          <div
            className="rounded-md border border-border/40 bg-muted/30 px-3 py-2 flex items-start gap-2"
            data-testid="fork-doctrine-note"
          >
            <Shield className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
            <p className="text-[10px] text-muted-foreground leading-snug">
              <strong>FORK doctrine:</strong> Bounty reward is Marks-class only — never fiat.
              Marks back labor and contribution, not investment. One-way ratchet: Marks value
              can only rise.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className={cn("gap-2", compact ? "pb-3 px-4" : "pb-4 px-5")}>
        {isMember && onSubmit ? (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSubmit(meta.bounty_class)}
            data-testid={`tier-bounty-submit-${meta.bounty_class}`}
          >
            Submit Empirical Receipt
          </Button>
        ) : !isMember ? (
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            disabled
            data-testid={`tier-bounty-gate-${meta.bounty_class}`}
          >
            Federation Member required
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          asChild
        >
          <a href={`/bounties/tier/${meta.bounty_class}`}>
            View Full Bounty
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Component: TierBountyPosterGallery ──────────────────────────────────────

export interface TierBountyPosterGalleryProps {
  /** Base Marks rate for pay-rate display. Default: 100 Marks. */
  standardRate?: number;
  /** If true, renders all cards in compact form. */
  compact?: boolean;
  /** Called when a member clicks "Submit Empirical Receipt" on a card. */
  onSubmit?: (bounty_class: TierBountyClass) => void;
  /** Whether the viewer is a Federation Member. */
  isMember?: boolean;
  /**
   * Active tier-class filter. If undefined, all four classes are shown.
   * Used by parent pages to wire tab-based filtering.
   */
  activeFilter?: TierBountyClass | "all";
}

export function TierBountyPosterGallery({
  standardRate = 100,
  compact = false,
  onSubmit,
  isMember = false,
  activeFilter = "all",
}: TierBountyPosterGalleryProps) {
  const [localFilter, setLocalFilter] = useState<TierBountyClass | "all">(
    activeFilter,
  );

  const visibleMeta =
    localFilter === "all"
      ? TIER_BOUNTY_META
      : TIER_BOUNTY_META.filter((m) => m.bounty_class === localFilter);

  const filterButtons: Array<{ value: TierBountyClass | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "tier_a_floor_verification", label: "Tier A" },
    { value: "tier_b_uplift_verification", label: "Tier B" },
    { value: "tier_c_founder_replication", label: "Tier C" },
    { value: "cross_tier_comparison", label: "Cross-Tier" },
  ];

  return (
    <div
      className="space-y-4"
      data-xray-id="tier-bounty-poster-gallery"
      data-testid="tier-bounty-poster-gallery"
    >
      {/* Tier-class filter tabs */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Tier Bounty class filter"
        data-testid="tier-bounty-filter"
      >
        {filterButtons.map((btn) => (
          <button
            key={btn.value}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors border",
              localFilter === btn.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground",
            )}
            onClick={() => setLocalFilter(btn.value)}
            aria-pressed={localFilter === btn.value}
            data-testid={`tier-filter-${btn.value}`}
          >
            {btn.label}
            {btn.value !== "all" &&
              TIER_BOUNTY_META.find((m) => m.bounty_class === btn.value) && (
                <span className="ml-1 font-mono text-[10px] opacity-70">
                  ×{TIER_BOUNTY_META.find(
                    (m) => m.bounty_class === btn.value,
                  )!.marks_multiplier.toFixed(2)}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div
        className={cn(
          "grid gap-4",
          compact
            ? "grid-cols-1 sm:grid-cols-2"
            : "grid-cols-1 md:grid-cols-2",
        )}
        data-testid="tier-bounty-cards-grid"
      >
        {visibleMeta.map((meta) => (
          <TierBountyPosterCard
            key={meta.bounty_class}
            meta={meta}
            standardRate={standardRate}
            compact={compact}
            onSubmit={onSubmit}
            isMember={isMember}
          />
        ))}
      </div>

      {/* Empty state */}
      {visibleMeta.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No Bounty classes match the current filter.
        </div>
      )}
    </div>
  );
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { TIER_BOUNTY_META };
export type { TierBountyMeta };
