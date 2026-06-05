/**
 * ChronosBadgeFlash -- BP072 Wave 3 / Scope 23
 * =============================================
 * Iterative experiment number badge for member UI experiments on the
 * Mimic-Trunk staging environment.
 *
 * This is a TEMPORARY overlay -- it never replaces code; it only annotates
 * the current iteration number of an in-flight member UI experiment.
 *
 * Usage:
 *   <ChronosBadgeFlash iteration={3} label="Ghost World v2 layout" flash />
 *
 * Props:
 *   iteration  -- the Chronos iteration number (auto-incremented per experiment round)
 *   label      -- short experiment name (<50 chars)
 *   flash      -- if true, the badge pulses to indicate a new iteration just started
 *   dismissed  -- if true, renders nothing (user has dismissed the badge)
 *   onDismiss  -- callback when user dismisses the badge
 */
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export interface ChronosBadgeFlashProps {
  iteration: number;
  label: string;
  flash?: boolean;
  dismissed?: boolean;
  onDismiss?: () => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

export function ChronosBadgeFlash({
  iteration,
  label,
  flash = false,
  dismissed = false,
  onDismiss,
  position = "top-right",
}: ChronosBadgeFlashProps) {
  const [visible, setVisible] = useState(!dismissed);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (dismissed) setVisible(false);
  }, [dismissed]);

  // Trigger a brief flash animation when `flash` prop changes to true
  useEffect(() => {
    if (flash) {
      setFlashing(true);
      const timer = setTimeout(() => setFlashing(false), 800);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  if (!visible) return null;

  const positionClasses: Record<ChronosBadgeFlashProps["position"] & string, string> = {
    "top-right": "top-3 right-3",
    "top-left": "top-3 left-3",
    "bottom-right": "bottom-3 right-3",
    "bottom-left": "bottom-3 left-3",
  };

  return (
    <div
      role="status"
      aria-label={`Chronos experiment: ${label}, iteration ${iteration}`}
      className={[
        "absolute z-50 flex items-center gap-2 px-2.5 py-1.5",
        "rounded-full border text-xs font-mono",
        "bg-violet-950/90 border-violet-700 text-violet-200 shadow-lg",
        "transition-all duration-300",
        flashing ? "ring-2 ring-violet-400 ring-offset-1 scale-110" : "scale-100",
        positionClasses[position],
      ].join(" ")}
    >
      {/* Iteration pips */}
      <div className="flex gap-0.5">
        {Array.from({ length: Math.min(iteration, 9) }).map((_, i) => (
          <div
            key={i}
            className={[
              "w-1.5 h-1.5 rounded-full",
              i < iteration ? "bg-violet-400" : "bg-violet-800",
            ].join(" ")}
          />
        ))}
        {iteration > 9 && (
          <span className="text-violet-400 text-xs">+{iteration - 9}</span>
        )}
      </div>

      <span className="text-violet-300 font-bold">#{iteration}</span>

      <span className="text-violet-400 max-w-[120px] truncate" title={label}>
        {label}
      </span>

      {onDismiss && (
        <button
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          aria-label="Dismiss Chronos badge"
          className="text-violet-500 hover:text-violet-200 ml-0.5 shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/**
 * ChronosBadgeFlashContext -- lightweight context for overlays to update the
 * global iteration counter without prop-drilling.
 */
import { createContext, useContext, useCallback } from "react";

interface ChronosBadgeCtx {
  iteration: number;
  label: string;
  flash: boolean;
  bump: (newLabel?: string) => void;
  dismiss: () => void;
  dismissed: boolean;
}

const defaultCtx: ChronosBadgeCtx = {
  iteration: 0,
  label: "",
  flash: false,
  bump: () => {},
  dismiss: () => {},
  dismissed: false,
};

export const ChronosBadgeContext = createContext<ChronosBadgeCtx>(defaultCtx);

export function useChronosBadge() {
  return useContext(ChronosBadgeContext);
}

/** Provider -- wrap a staging page in this to get a managed badge. */
export function ChronosBadgeProvider({
  initialLabel = "Experiment",
  children,
}: {
  initialLabel?: string;
  children: React.ReactNode;
}) {
  const [state, setState] = useState({
    iteration: 1,
    label: initialLabel,
    flash: false,
    dismissed: false,
  });

  const bump = useCallback((newLabel?: string) => {
    setState((s) => ({
      ...s,
      iteration: s.iteration + 1,
      label: newLabel ?? s.label,
      flash: true,
    }));
    setTimeout(() => setState((s) => ({ ...s, flash: false })), 900);
  }, []);

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, dismissed: true }));
  }, []);

  return (
    <ChronosBadgeContext.Provider value={{ ...state, bump, dismiss }}>
      {children}
    </ChronosBadgeContext.Provider>
  );
}
