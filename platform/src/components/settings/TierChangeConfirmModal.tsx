/**
 * TierChangeConfirmModal — KN-H5 / BP017 Three-Tier Sovereignty
 * ==============================================================
 * Confirm modal for post-install tier change.
 * Shown BEFORE persisting to Supabase — avoids accidental tier changes.
 *
 * Displays:
 *   - Previous tier spec summary
 *   - New tier spec summary (arrows from → to)
 *   - Confirm / Cancel buttons
 *
 * BRIDLE Rule 4: Cancel returns to settings UI without mutation.
 * FORK doctrine: shows Marks-cost = 0 (FREE default); Marks-cost alternative
 *   pending Founder ratification at fire-time.
 *
 * Accessibility: WCAG 2.1 AA — role="dialog", aria-modal, focus-trap on mount.
 * data-xray-id: tier-change-confirm-modal
 */

import { useEffect, useRef } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResourceConfigTier } from "@/components/handshake/TierSelectionStep";

// ─── Tier metadata (mirrors TierSelectionStep; avoids circular import) ────────

interface TierMeta {
  id: ResourceConfigTier;
  label: string;
  tagline: string;
  bullets: string[];
  highlight: string;
  border: string;
  bg: string;
  badgeText: string;
}

const TIER_META: Record<ResourceConfigTier, TierMeta> = {
  needs: {
    id: "needs",
    label: "Tier A — NEEDS",
    tagline: "Whatever you have. No upgrade required.",
    bullets: [
      "Default Claude Code plan (no upgrade required)",
      "Standard token budget + message-rate limits",
      "Pheromone substrate read-only",
      "Cathedral Effect lift confirmed at default-plan tier",
    ],
    highlight: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
    badgeText: "Anyone Can Run It",
  },
  suggests: {
    id: "suggests",
    label: "Tier B — SUGGESTS",
    tagline: "Recommended uplift. Better experience.",
    bullets: [
      "Claude Code Max or equivalent (recommended, not required)",
      "Higher token budget + message-rate floor",
      "15–20 MCP server slots recommended",
      "Documented 2–3× Reckoning velocity uplift over Tier A",
    ],
    highlight: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50/60 dark:bg-blue-950/30",
    badgeText: "Recommended",
  },
  founder: {
    id: "founder",
    label: "Tier C — FOUNDER",
    tagline: "Empirical-receipt source. Maximum-velocity.",
    bullets: [
      "Founder-equivalent plan (self-attested; no purchase required)",
      "Maximum token budget + message-rate config",
      "All LB Frame core + extended MCPs",
      "BP015→BP017 cascade as empirical anchor",
    ],
    highlight: "text-violet-700 dark:text-violet-400",
    border: "border-violet-300 dark:border-violet-700",
    bg: "bg-violet-50/60 dark:bg-violet-950/30",
    badgeText: "Self-Attested",
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TierChangeConfirmModalProps {
  /** Tier the user is switching FROM (null = first-ever pick). */
  previousTier: ResourceConfigTier | null;
  /** Tier the user wants to switch TO. */
  newTier: ResourceConfigTier;
  /** Marks cost for this change (default 0 = FREE per anti-extraction default). */
  changeCostMarks?: number;
  /** Loading state while persisting. */
  isConfirming?: boolean;
  /** Called when user presses Confirm. */
  onConfirm: () => void | Promise<void>;
  /** Called when user presses Cancel or presses Escape. */
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TierChangeConfirmModal({
  previousTier,
  newTier,
  changeCostMarks = 0,
  isConfirming = false,
  onConfirm,
  onCancel,
}: TierChangeConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  const prev = previousTier ? TIER_META[previousTier] : null;
  const next = TIER_META[newTier];

  // Focus trap: focus Cancel on mount so Escape / Tab cycle stays in dialog
  useEffect(() => {
    cancelBtnRef.current?.focus();
  }, []);

  // Keyboard: Escape → cancel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
      // Basic focus-trap: keep Tab/Shift-Tab inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      aria-hidden="false"
    >
      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tier-change-confirm-title"
        aria-describedby="tier-change-confirm-desc"
        data-xray-id="tier-change-confirm-modal"
        className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md space-y-4 p-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <h2
              id="tier-change-confirm-title"
              className="text-sm font-semibold"
            >
              Confirm tier change
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-1"
            onClick={onCancel}
            aria-label="Close — cancel tier change"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </Button>
        </div>

        {/* Description */}
        <p
          id="tier-change-confirm-desc"
          className="text-xs text-muted-foreground"
        >
          {prev
            ? `You're changing your LB Frame resource-config tier from ${prev.label} to ${next.label}. Your choice is reversible anytime.`
            : `You're setting your LB Frame resource-config tier to ${next.label} for the first time.`}
        </p>

        {/* Before → After */}
        <div
          className="grid gap-2"
          aria-label="Tier change summary"
        >
          {prev && (
            <div className={cn("rounded-lg border p-3 text-xs space-y-1", prev.border, prev.bg)}>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[10px] uppercase tracking-wide font-medium">From</span>
                <span className={cn("font-semibold", prev.highlight)}>{prev.label}</span>
                <Badge variant="outline" className="text-[10px]">{prev.badgeText}</Badge>
              </div>
              <p className="text-muted-foreground">{prev.tagline}</p>
            </div>
          )}

          {prev && (
            <div className="flex justify-center" aria-hidden="true">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}

          <div className={cn("rounded-lg border p-3 text-xs space-y-1.5", next.border, next.bg)}>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wide font-medium">To</span>
              <span className={cn("font-semibold", next.highlight)}>{next.label}</span>
              <Badge variant="outline" className="text-[10px]">{next.badgeText}</Badge>
            </div>
            <p className="text-muted-foreground">{next.tagline}</p>
            <ul aria-label={`${next.label} specifications`} className="space-y-0.5 mt-1">
              {next.bullets.map((b, i) => (
                <li key={i} className={cn("flex gap-1.5 items-start", next.highlight)}>
                  <span className="mt-0.5" aria-hidden="true">•</span>
                  <span className="text-muted-foreground">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Change cost note */}
        {changeCostMarks === 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span>No cost — tier changes are FREE (anti-extraction default).</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
            <span>
              This change costs <strong>{changeCostMarks} Marks</strong> (one-way debit — non-cashout per FORK doctrine).
            </span>
          </div>
        )}

        {/* Anti-extraction footnote */}
        <p className="text-[10px] text-muted-foreground/70 text-center">
          Barrier-of-entry is not capital. You have full sovereignty to pick any tier.
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <Button
            ref={cancelBtnRef}
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isConfirming}
            aria-busy={isConfirming}
          >
            {isConfirming ? "Saving…" : `Switch to ${next.label}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
