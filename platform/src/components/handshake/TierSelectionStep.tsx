/**
 * TierSelectionStep — KN-H1 / BP017 Three-Tier Resource-Config Installer
 * =========================================================================
 * Step 1.3 of LB Frame Handshake Phase 1 Discovery.
 *
 * Anti-extraction by structural form:
 *   - No default tier; user MUST consciously pick
 *   - Submit blocked until pick is made
 *   - Tier C FOUNDER does NOT require fiat upgrade-purchase; self-attested
 *   - Capital alone cannot purchase higher-tier participation
 *
 * Orthogonal to cohort-class (KN102 Step 1.2): Tier and cohort-class are
 * independent axes. User picks both at Handshake Phase 1 Discovery.
 *
 * data-xray-id: tier-selection-step
 */

import { useState, useId } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Layers, TrendingUp, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TIER_A_SPEC_BULLETS,
  TIER_A_TOOLTIP,
} from "@/data/lb_frame_tier_specs/tier_a_needs_spec";
import {
  TIER_B_SPEC_BULLETS,
  TIER_B_TOOLTIP,
  TIER_B_PLAN_ADVISORY,
} from "@/data/lb_frame_tier_specs/tier_b_suggests_spec";
import {
  TIER_C_SPEC_BULLETS,
  TIER_C_TOOLTIP,
  TIER_C_PLAN_ADVISORY,
} from "@/data/lb_frame_tier_specs/tier_c_founder_spec";

// ─── Types ─────────────────────────────────────────────────────────────────

export type ResourceConfigTier = "needs" | "suggests" | "founder";

export interface TierSelectionStepProps {
  /** Called when user confirms tier pick. Receives chosen tier. */
  onConfirm: (tier: ResourceConfigTier) => void | Promise<void>;
  /** If set, shows a "previously chose X" note (re-selection flow). */
  previousTier?: ResourceConfigTier | null;
  /** Loading state while persisting to Supabase. */
  isSubmitting?: boolean;
  /** Error from persistence attempt — shown with retry prompt. */
  persistError?: string | null;
  /** Detected surface for plan-tier advisory (optional; informational only). */
  detectedSurface?: string;
}

// ─── Tier definitions ───────────────────────────────────────────────────────

interface TierDef {
  id: ResourceConfigTier;
  label: string;
  tagline: string;
  description: string;
  bullets: string[];
  /** Optional tooltip shown on hover / info press (sourced from tier spec file). */
  tooltip?: string;
  icon: React.ElementType;
  badgeText: string;
  highlight: string;
  border: string;
  bg: string;
  badgeVariant: "default" | "secondary" | "outline";
}

const TIERS: TierDef[] = [
  {
    id: "needs",
    label: "Tier A — NEEDS",
    tagline: "Whatever you have. No upgrade required.",
    description:
      "LB Frame runs on your default Claude Code plan, out of the box. " +
      "No subscription upgrades, no extra spend. Anyone can run it.",
    // Spec bullets and tooltip sourced from tier_a_needs_spec.ts (single source of truth).
    // Human-readable canonical: platform/src/data/lb_frame_tier_specs/tier_a_needs.md
    bullets: TIER_A_SPEC_BULLETS as unknown as string[],
    tooltip: TIER_A_TOOLTIP,
    icon: Layers,
    badgeText: "Anyone Can Run It",
    highlight: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    badgeVariant: "secondary",
  },
  {
    id: "suggests",
    label: "Tier B — SUGGESTS",
    tagline: "Recommended uplift. Better experience.",
    description:
      "The recommended config for a better experience — documented lift over Tier A. " +
      "Claude Max or equivalent. Faster Reckoning velocity and Pod scaffolding.",
    // Spec bullets and tooltip sourced from tier_b_suggests_spec.ts (single source of truth).
    // Human-readable canonical: platform/src/data/lb_frame_tier_specs/tier_b_suggests.md
    bullets: TIER_B_SPEC_BULLETS as unknown as string[],
    tooltip: TIER_B_TOOLTIP,
    icon: TrendingUp,
    badgeText: "Recommended",
    highlight: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50/60 dark:bg-blue-950/30",
    badgeVariant: "default",
  },
  {
    id: "founder",
    label: "Tier C — FOUNDER",
    tagline: "Empirical-receipt source. Maximum-velocity.",
    description:
      "Founder's customized highest-throughput config. The spec under which " +
      "BP015→BP017 cascade (27 Crown Jewels + 70+ clean K-lineage + 4 architectural patterns recovered) was generated. " +
      "Self-attested — no fiat-bridge. Capital alone is not the gate.",
    // Spec bullets and tooltip sourced from tier_c_founder_spec.ts (single source of truth).
    // Human-readable canonical: platform/src/data/lb_frame_tier_specs/tier_c_founder.md
    // Empirical receipt: BISHOP_DROPZONE/14_CanonicalReferences/TIER_C_FOUNDER_BP015_BP017_CASCADE_TELEMETRY_RECEIPT_BP017.json
    bullets: TIER_C_SPEC_BULLETS as unknown as string[],
    tooltip: TIER_C_TOOLTIP,
    icon: Zap,
    badgeText: "Self-Attested",
    highlight: "text-violet-700 dark:text-violet-400",
    border: "border-violet-300 dark:border-violet-700",
    bg: "bg-violet-50/60 dark:bg-violet-950/30",
    badgeVariant: "outline",
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function TierSelectionStep({
  onConfirm,
  previousTier,
  isSubmitting = false,
  persistError = null,
  detectedSurface,
}: TierSelectionStepProps) {
  const [selected, setSelected] = useState<ResourceConfigTier | null>(null);
  const headingId = useId();
  const advisoryId = useId();
  const errorId = useId();

  const isReselection = previousTier != null;
  const canSubmit = selected !== null && !isSubmitting;

  function handleConfirm() {
    if (!selected) return;
    onConfirm(selected);
  }

  return (
    <div className="space-y-5" data-xray-id="tier-selection-step">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-base font-semibold" id={headingId}>
          Choose your LB Frame resource-config tier
        </h3>
        <p className="text-sm text-muted-foreground">
          {isReselection
            ? `You previously chose ${TIERS.find(t => t.id === previousTier)?.label ?? previousTier}. You can switch at any time.`
            : "This determines how LB Frame uses your Claude Code plan resources. Anyone can run any tier — barrier-of-entry is not capital."}
        </p>
      </div>

      {/* Tier picker — no default; submit blocked until pick */}
      <RadioGroup
        value={selected ?? ""}
        onValueChange={(v) => setSelected(v as ResourceConfigTier)}
        className="space-y-3"
        aria-labelledby={headingId}
        aria-required="true"
      >
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isSelected = selected === tier.id;
          const isPrev = previousTier === tier.id;

          return (
            <Label
              key={tier.id}
              htmlFor={`tier-${tier.id}`}
              className="cursor-pointer block"
            >
              <Card
                className={cn(
                  "transition-all",
                  isSelected
                    ? `${tier.border} ${tier.bg} ring-2 ring-offset-1`
                    : isPrev
                    ? "border-muted-foreground/30 bg-muted/30"
                    : "border-border hover:border-muted-foreground/40"
                )}
              >
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={tier.id}
                      id={`tier-${tier.id}`}
                      className="mt-0.5 sr-only"
                    />
                    {/* Visual radio indicator (aria-hidden; actual state on RadioGroupItem) */}
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                        isSelected ? `${tier.border} bg-current` : "border-muted-foreground/40"
                      )}
                      aria-hidden="true"
                    >
                      {isSelected && (
                        <div className={cn("h-1.5 w-1.5 rounded-full bg-white")} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon
                          className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isSelected ? tier.highlight : "text-muted-foreground"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isSelected ? tier.highlight : ""
                          )}
                        >
                          {tier.label}
                        </span>
                        <Badge variant={isSelected ? tier.badgeVariant : "outline"} className="text-xs">
                          {tier.badgeText}
                        </Badge>
                        {isPrev && !isSelected && (
                          <Badge variant="secondary" className="text-xs">Previous</Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                        {tier.tagline}
                      </p>

                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {tier.description}
                      </p>

                      {isSelected && (
                        <>
                          <ul
                            className="mt-2 space-y-0.5"
                            aria-label={`${tier.label} specifications`}
                          >
                            {tier.bullets.map((b, i) => (
                              <li key={i} className={cn("text-xs flex gap-1.5 items-start", tier.highlight)}>
                                <span className="mt-0.5" aria-hidden="true">•</span>
                                <span className="text-muted-foreground">{b}</span>
                              </li>
                            ))}
                          </ul>
                          {tier.tooltip && (
                            <p className="mt-2 text-xs text-muted-foreground/70 italic leading-relaxed border-t border-border/40 pt-2">
                              {tier.tooltip}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Label>
          );
        })}
      </RadioGroup>

      {/* Plan-tier advisory for Tier B (informational only — does NOT block) */}
      {selected === "suggests" && (
        <div
          role="note"
          aria-live="polite"
          aria-atomic="true"
          className="flex gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 p-3 text-xs text-muted-foreground"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-blue-500" aria-hidden="true" />
          <div>
            <span className="font-medium text-blue-700 dark:text-blue-400">Advisory (informational — does not block):</span>{" "}
            {TIER_B_PLAN_ADVISORY}
            {detectedSurface && (
              <span className="block mt-0.5 text-muted-foreground/70">Surface: {detectedSurface}</span>
            )}
          </div>
        </div>
      )}

      {/* Plan-tier advisory for Tier C (informational only — does NOT block) */}
      {selected === "founder" && (
        <div
          id={advisoryId}
          role="note"
          aria-live="polite"
          aria-atomic="true"
          className="flex gap-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-violet-50/40 dark:bg-violet-950/20 p-3 text-xs text-muted-foreground"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-violet-500" aria-hidden="true" />
          <div>
            <span className="font-medium text-violet-700 dark:text-violet-400">Advisory (informational — does not block):</span>{" "}
            {TIER_C_PLAN_ADVISORY}
            {detectedSurface && (
              <span className="block mt-0.5 text-muted-foreground/70">Surface: {detectedSurface}</span>
            )}
          </div>
        </div>
      )}

      {/* Persistence error with retry prompt (BRIDLE Rule 8) */}
      {persistError && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium">Could not save your tier choice:</span>{" "}
            {persistError} — please try again.
          </div>
        </div>
      )}

      {/* Anti-extraction note */}
      <p className="text-xs text-muted-foreground text-center">
        Anyone can run any tier. Barrier-of-entry is not capital. Your choice is reversible anytime via settings.
      </p>

      {/* Submit — disabled until pick made */}
      <Button
        onClick={handleConfirm}
        disabled={!canSubmit}
        className="w-full"
        aria-busy={isSubmitting}
        aria-describedby={persistError ? errorId : selected === "founder" ? advisoryId : undefined}
      >
        {isSubmitting
          ? "Saving tier choice…"
          : selected
          ? `Confirm ${TIERS.find(t => t.id === selected)?.label}`
          : "Choose a tier to continue"}
      </Button>
    </div>
  );
}
