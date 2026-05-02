/**
 * LBFrameTierChange — KN-H5 / BP017 Three-Tier Sovereignty
 * =========================================================
 * Post-install settings UI for changing the LB Frame resource-config tier.
 * Composes with TierSelectionStep (KN-H1) in settings-context (no Handshake framing).
 *
 * Features:
 *   - Reads current tier from Supabase user_preferences
 *   - Shows current tier with spec summary + last-chosen-at timestamp
 *   - Allows selecting a different tier via TierSelectionStep (reuse-based)
 *   - Confirmation modal before persisting (avoids accidental changes)
 *   - Writes audit log entry to lb_frame_tier_change_log via log_lb_frame_tier_change RPC
 *   - BRIDLE Rule 4: failures surface error + retry; no silent state corruption
 *   - FORK doctrine: change_cost is Marks-class only; verified below
 *
 * Accessibility: WCAG 2.1 AA
 *   - aria-live="polite" on status/error regions
 *   - aria-busy on async operations
 *   - Full keyboard nav via TierSelectionStep + modal focus trap
 *
 * data-xray-id: lb-frame-tier-change
 */

import { useState, useEffect, useCallback, useId } from "react";
import { CheckCircle2, AlertCircle, RefreshCw, Layers, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TierSelectionStep } from "@/components/handshake/TierSelectionStep";
import type { ResourceConfigTier } from "@/components/handshake/TierSelectionStep";
import { TierChangeConfirmModal } from "./TierChangeConfirmModal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierState {
  tier: ResourceConfigTier | null;
  tier_chosen_at: string | null;
  tier_state: "not_chosen" | "chosen";
  tier_label: string | null;
}

// ─── Tier display helpers ──────────────────────────────────────────────────────

const TIER_ICON: Record<ResourceConfigTier, React.ElementType> = {
  needs: Layers,
  suggests: TrendingUp,
  founder: Zap,
};

const TIER_COLORS: Record<ResourceConfigTier, { highlight: string; border: string; bg: string }> = {
  needs: {
    highlight: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/30",
  },
  suggests: {
    highlight: "text-blue-700 dark:text-blue-400",
    border: "border-blue-300 dark:border-blue-700",
    bg: "bg-blue-50/60 dark:bg-blue-950/30",
  },
  founder: {
    highlight: "text-violet-700 dark:text-violet-400",
    border: "border-violet-300 dark:border-violet-700",
    bg: "bg-violet-50/60 dark:bg-violet-950/30",
  },
};

function formatChosenAt(iso: string | null): string {
  if (!iso) return "unknown";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface LBFrameTierChangeProps {
  /** Marks cost for tier change. 0 = FREE (anti-extraction default). Founder-ratifiable. */
  changeCostMarks?: number;
}

export function LBFrameTierChange({ changeCostMarks = 0 }: LBFrameTierChangeProps) {
  const { user } = useAuth();
  const statusRegionId = useId();
  const errorRegionId = useId();

  const [tierState, setTierState] = useState<TierState | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [pendingTier, setPendingTier] = useState<ResourceConfigTier | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [isConfirming, setIsConfirming] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ── Load current tier from Supabase ─────────────────────────────────────────
  const loadCurrentTier = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.rpc("get_lb_frame_resource_config_tier", {
        p_user_id: user.id,
      });
      if (error) throw error;
      setTierState(data as TierState);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setLoadError(`Could not load your current tier: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCurrentTier();
  }, [loadCurrentTier]);

  // ── Handle tier selection from TierSelectionStep ─────────────────────────────
  // In settings context: selecting raises the confirm-modal; doesn't persist immediately
  function handleTierSelected(tier: ResourceConfigTier) {
    if (tier === tierState?.tier) return; // no-op: same tier
    setPendingTier(tier);
    setPersistError(null);
    setSuccessMessage(null);
    setShowConfirmModal(true);
  }

  // ── Confirm change — persist to Supabase + write audit log ───────────────────
  // FORK doctrine compliance: log_lb_frame_tier_change ONLY writes to Marks-class
  // change_cost; no fiat-bridge at this call site or in the RPC definition.
  async function handleConfirmChange() {
    if (!pendingTier || !user?.id) return;
    setIsConfirming(true);
    setPersistError(null);
    try {
      // Step A: persist tier to user_preferences
      const { error: setErr } = await supabase.rpc("set_lb_frame_resource_config_tier", {
        p_user_id: user.id,
        p_tier: pendingTier,
        p_chosen_at: new Date().toISOString(),
      });
      if (setErr) throw setErr;

      // Step B: write audit log (FORK doctrine: change_cost_marks only; no fiat)
      const { error: logErr } = await supabase.rpc("log_lb_frame_tier_change", {
        p_member_id: user.id,
        p_previous_tier: tierState?.tier ?? null,
        p_new_tier: pendingTier,
        p_changed_at: new Date().toISOString(),
        p_cost_marks: changeCostMarks,
        p_notes: null,
      });
      if (logErr) {
        // Audit log failure is non-blocking (tier IS saved); warn but don't surface as hard error
        console.warn("KN-H5: tier saved but audit log failed:", logErr.message);
      }

      setShowConfirmModal(false);
      setPendingTier(null);
      setSuccessMessage(
        `Tier updated to ${pendingTier.charAt(0).toUpperCase() + pendingTier.slice(1)} successfully.`
      );
      await loadCurrentTier();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // BRIDLE Rule 4: surface error + retry; do NOT silently change state
      setPersistError(`Tier change failed: ${msg} — please try again.`);
      setShowConfirmModal(false);
    } finally {
      setIsConfirming(false);
    }
  }

  function handleCancelConfirm() {
    setShowConfirmModal(false);
    setPendingTier(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const currentTier = tierState?.tier ?? null;

  return (
    <div
      className="space-y-5"
      data-xray-id="lb-frame-tier-change"
      aria-busy={isLoading || isConfirming}
    >
      {/* Section header */}
      <div>
        <h2 className="text-base font-semibold">LB Frame Resource-Config Tier</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Change your LB Frame tier at any time. Your choice is sovereign — barrier-of-entry is not capital.
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
          <span>Loading your current tier…</span>
        </div>
      )}

      {/* Load error (BRIDLE Rule 4) */}
      {!isLoading && loadError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <div>
            <span className="font-medium">Could not load tier: </span>
            {loadError}
            <button
              onClick={loadCurrentTier}
              className="ml-2 underline text-destructive hover:no-underline focus:outline-none focus:ring-2 focus:ring-destructive rounded"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Current tier display */}
      {!isLoading && !loadError && (
        <>
          {currentTier ? (
            <section aria-label="Current tier" aria-labelledby="current-tier-heading">
              <h3 id="current-tier-heading" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Current Tier
              </h3>
              {(() => {
                const colors = TIER_COLORS[currentTier];
                const Icon = TIER_ICON[currentTier];
                return (
                  <Card className={cn("border", colors.border, colors.bg)}>
                    <CardContent className="p-3 flex items-center gap-3">
                      <Icon className={cn("w-5 h-5 flex-shrink-0", colors.highlight)} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn("text-sm font-semibold", colors.highlight)}>
                            {tierState?.tier_label ?? currentTier}
                          </span>
                          <Badge variant="secondary" className="text-[10px]">Active</Badge>
                        </div>
                        {tierState?.tier_chosen_at && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Set {formatChosenAt(tierState.tier_chosen_at)}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </section>
          ) : (
            <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/30 p-3 text-xs text-amber-700 dark:text-amber-400">
              <span className="font-medium">No tier chosen yet.</span>{" "}
              Select a tier below to configure your LB Frame resource allocation.
            </div>
          )}

          {/* Success message (aria-live) */}
          <div
            id={statusRegionId}
            aria-live="polite"
            aria-atomic="true"
            className={cn(
              "flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400",
              successMessage ? "" : "sr-only"
            )}
            role="status"
          >
            {successMessage && (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                <span>{successMessage}</span>
              </>
            )}
          </div>

          {/* Persist error (aria-live assertive — BRIDLE Rule 4) */}
          {persistError && (
            <div
              id={errorRegionId}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive"
            >
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <span>
                <span className="font-medium">Could not save tier change: </span>
                {persistError}
              </span>
            </div>
          )}

          {/* Divider */}
          <hr className="border-border/60" aria-hidden="true" />

          {/* Tier selector — reuses TierSelectionStep in settings context */}
          <section aria-label="Change tier" aria-labelledby="change-tier-heading">
            <h3 id="change-tier-heading" className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {currentTier ? "Switch to a different tier" : "Choose your tier"}
            </h3>
            <TierSelectionStep
              onConfirm={handleTierSelected}
              previousTier={currentTier}
              isSubmitting={isConfirming}
              persistError={null}
            />
          </section>
        </>
      )}

      {/* Confirm modal — shown before persistence */}
      {showConfirmModal && pendingTier && (
        <TierChangeConfirmModal
          previousTier={currentTier}
          newTier={pendingTier}
          changeCostMarks={changeCostMarks}
          isConfirming={isConfirming}
          onConfirm={handleConfirmChange}
          onCancel={handleCancelConfirm}
        />
      )}
    </div>
  );
}
