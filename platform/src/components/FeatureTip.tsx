/**
 * FEATURE TIP — First-Time Discovery Tooltips
 * =============================================
 * Google Admin-style "first time" popover tips.
 * Shows once per feature per user, with "Got It" and "Don't Show Tips" options.
 *
 * Pattern: Non-blocking, contextual, dismissible, educational.
 * Uses shadcn/ui Popover with localStorage persistence.
 *
 * Innovation #1516 — Feature Tip Discovery System (Session 7D)
 *
 * Usage:
 *   <FeatureTip
 *     tipId="arena-tier-select"
 *     title="Choose Your Tier"
 *     description="Each tier has different moderation rules. Tier 1 requires sources."
 *     side="bottom"
 *   >
 *     <TierSelector />
 *   </FeatureTip>
 */

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, ChevronRight } from "lucide-react";

// ─── STORAGE KEY ───
const TIPS_STORAGE_KEY = "lb_feature_tips_state";
const TIPS_GLOBAL_DISABLED_KEY = "lb_feature_tips_disabled";

// ─── TIP STATE ───

interface TipState {
  dismissed: Record<string, boolean>;   // tipId → dismissed
  globalDisabled: boolean;              // "Don't Show Tips" master switch
}

function loadTipState(): TipState {
  try {
    const raw = localStorage.getItem(TIPS_STORAGE_KEY);
    const disabled = localStorage.getItem(TIPS_GLOBAL_DISABLED_KEY) === "true";
    return {
      dismissed: raw ? JSON.parse(raw) : {},
      globalDisabled: disabled,
    };
  } catch {
    return { dismissed: {}, globalDisabled: false };
  }
}

function saveTipDismissal(tipId: string) {
  try {
    const state = loadTipState();
    state.dismissed[tipId] = true;
    localStorage.setItem(TIPS_STORAGE_KEY, JSON.stringify(state.dismissed));
  } catch {
    // localStorage unavailable — fail silently
  }
}

function saveGlobalDisable() {
  try {
    localStorage.setItem(TIPS_GLOBAL_DISABLED_KEY, "true");
  } catch {
    // localStorage unavailable
  }
}

function clearAllTips() {
  try {
    localStorage.removeItem(TIPS_STORAGE_KEY);
    localStorage.removeItem(TIPS_GLOBAL_DISABLED_KEY);
  } catch {
    // localStorage unavailable
  }
}

// ─── CONTEXT (for "Don't Show Tips" global control) ───

interface FeatureTipContextValue {
  isGloballyDisabled: boolean;
  disableAll: () => void;
  resetAll: () => void;
  isDismissed: (tipId: string) => boolean;
  dismiss: (tipId: string) => void;
}

const FeatureTipContext = createContext<FeatureTipContextValue>({
  isGloballyDisabled: false,
  disableAll: () => {},
  resetAll: () => {},
  isDismissed: () => false,
  dismiss: () => {},
});

export function FeatureTipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TipState>(loadTipState);

  const disableAll = useCallback(() => {
    saveGlobalDisable();
    setState((prev) => ({ ...prev, globalDisabled: true }));
  }, []);

  const resetAll = useCallback(() => {
    clearAllTips();
    setState({ dismissed: {}, globalDisabled: false });
  }, []);

  const isDismissed = useCallback(
    (tipId: string) => state.globalDisabled || !!state.dismissed[tipId],
    [state],
  );

  const dismiss = useCallback((tipId: string) => {
    saveTipDismissal(tipId);
    setState((prev) => ({
      ...prev,
      dismissed: { ...prev.dismissed, [tipId]: true },
    }));
  }, []);

  return (
    <FeatureTipContext.Provider
      value={{ isGloballyDisabled: state.globalDisabled, disableAll, resetAll, isDismissed, dismiss }}
    >
      {children}
    </FeatureTipContext.Provider>
  );
}

export function useFeatureTips() {
  return useContext(FeatureTipContext);
}

// ─── FEATURE TIP COMPONENT ───

interface FeatureTipProps {
  /** Unique identifier — once dismissed, won't show again */
  tipId: string;
  /** Bold header text */
  title: string;
  /** Explanation body text */
  description: string;
  /** Which side of the child element to show the tip */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment along the side */
  align?: "start" | "center" | "end";
  /** Optional "learn more" link */
  learnMoreUrl?: string;
  /** Delay before showing (ms) — prevents tips from appearing during fast navigation */
  showDelay?: number;
  /** Whether to show the "Don't show tips" option */
  showGlobalDisable?: boolean;
  /** The wrapped child element */
  children: ReactNode;
}

export function FeatureTip({
  tipId,
  title,
  description,
  side = "bottom",
  align = "center",
  learnMoreUrl,
  showDelay = 800,
  showGlobalDisable = true,
  children,
}: FeatureTipProps) {
  const { isDismissed, dismiss, disableAll, isGloballyDisabled } = useFeatureTips();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Delay showing to prevent flash during navigation
  useEffect(() => {
    if (isDismissed(tipId) || isGloballyDisabled) return;

    const timer = setTimeout(() => {
      setReady(true);
      setOpen(true);
    }, showDelay);

    return () => clearTimeout(timer);
  }, [tipId, isDismissed, isGloballyDisabled, showDelay]);

  const handleGotIt = () => {
    dismiss(tipId);
    setOpen(false);
  };

  const handleDontShow = () => {
    disableAll();
    setOpen(false);
  };

  // If already dismissed or globally disabled, just render children
  if (isDismissed(tipId) || isGloballyDisabled || !ready) {
    return <>{children}</>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        className="w-80 p-0 shadow-lg border-primary/20"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
            <h4 className="font-semibold text-sm">{title}</h4>
          </div>
          <button
            onClick={handleGotIt}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 -m-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 pb-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
            >
              Learn more <ChevronRight className="w-3 h-3" />
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/30">
          {showGlobalDisable && (
            <button
              onClick={handleDontShow}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              DON&apos;T SHOW TIPS
            </button>
          )}
          {!showGlobalDisable && <span />}
          <Button size="sm" variant="outline" onClick={handleGotIt} className="text-xs h-7">
            GOT IT
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── PRE-DEFINED TIP IDS ───
// Centralized registry prevents ID collisions

export const TIP_IDS = {
  // Arenas
  ARENA_GATEWAY: "arena-gateway-intro",
  ARENA_TIER_SELECT: "arena-tier-select",
  ARENA_POST_SOURCES: "arena-post-sources-required",
  ARENA_POST_STEELMAN: "arena-post-steelman-required",
  ARENA_FREEZE_PENALTY: "arena-freeze-penalty-info",

  // Content Pipeline
  PIPELINE_STAGE_FLOW: "pipeline-stage-flow",
  PIPELINE_WORD_COUNT: "pipeline-word-count-validation",

  // HexIsle
  HEXISLE_VIEW_SWITCHER: "hexisle-view-phase-switcher",
  HEXISLE_CANAL: "hexisle-canal-district",
  HEXISLE_PHASE_PORTAL: "hexisle-phase-portal",

  // Currency
  CURRENCY_CREDITS: "currency-credits-intro",
  CURRENCY_MARKS: "currency-marks-intro",
  CURRENCY_JOULES: "currency-joules-intro",

  // Areopagus Doctrine Explorer
  DOCTRINE_THREE_COLUMNS: "doctrine-three-columns",
  DOCTRINE_DICTIONARY: "doctrine-dictionary-link",
  DOCTRINE_EVIDENCE_BASIS: "doctrine-evidence-basis",
  DOCTRINE_DEPTH_LEVEL: "doctrine-depth-selector",
  DOCTRINE_CTA: "doctrine-empty-column-cta",
  DOCTRINE_EQUAL_TIME: "doctrine-equal-time-balance",

  // General
  DISCOVERY_CHALK_OUTLINE: "discovery-chalk-outline-intro",
  GUILD_STAKE: "guild-stake-intro",
  MARKETPLACE_PRICE_FLOOR: "marketplace-price-floor",
  RED_CARPET: "red-carpet-intro",
} as const;

export type TipId = (typeof TIP_IDS)[keyof typeof TIP_IDS];

export default FeatureTip;
