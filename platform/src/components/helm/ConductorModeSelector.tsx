/**
 * ConductorModeSelector — Helm Settings Component
 * K446 · Phase 4 · Innovation #2277
 *
 * Three-mode toggle for Conductor routing preference.
 * Uses automatic-transmission metaphor per K446a spec:
 *   "Automatic" / "Manual" / "Fixed Gear"
 *
 * Placed in the member Helm (preferences/settings area).
 * "#40 Always Offer What You Would Want" — show the mode that gives
 * the member full knowledge of what the Conductor is doing.
 */

import React from "react";
import { useConductorMode, CONDUCTOR_MODE_LABELS } from "@/hooks/useConductorMode";
import type { ConductorMode } from "@/hooks/useConductorMode";

interface ConductorModeSelectorProps {
  className?: string;
}

const MODE_DESCRIPTIONS: Record<ConductorMode, string> = {
  auto:
    "The Conductor chooses the best AI model for each question automatically — " +
    "routing to the most accurate model at the lowest cost. Recommended.",
  manual:
    "You choose the AI model before each question. Gives you direct control " +
    "while the Conductor shows you what it would have recommended.",
  "vendor-lock":
    "All questions go to one AI provider. Useful for compliance, audit, or " +
    "reproducibility requirements.",
};

const MODE_ICON: Record<ConductorMode, string> = {
  auto: "⚙️",
  manual: "🎛️",
  "vendor-lock": "🔒",
};

export function ConductorModeSelector({ className = "" }: ConductorModeSelectorProps) {
  const { mode, setMode, isLoading } = useConductorMode();

  const modes: ConductorMode[] = ["auto", "manual", "vendor-lock"];

  return (
    <div className={`conductor-mode-selector ${className}`}>
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          AI Model Selection
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Control how the Conductor routes your questions to AI providers.
        </p>
      </div>

      {isLoading ? (
        <div className="text-xs text-gray-400 py-2">Loading preference…</div>
      ) : (
        <div className="space-y-2">
          {modes.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "w-full text-left rounded-lg border px-4 py-3 transition-all",
                mode === m
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
              ].join(" ")}
              aria-pressed={mode === m}
            >
              <div className="flex items-center gap-2">
                <span className="text-base" aria-hidden="true">
                  {MODE_ICON[m]}
                </span>
                <span
                  className={`text-sm font-medium ${
                    mode === m
                      ? "text-blue-700 dark:text-blue-300"
                      : "text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {CONDUCTOR_MODE_LABELS[m]}
                </span>
                {mode === m && (
                  <span className="ml-auto text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Active
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                {MODE_DESCRIPTIONS[m]}
              </p>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        The Conductor is powered by{" "}
        <span className="font-medium">empirical benchmarks</span> across
        Anthropic, OpenAI, Google, and Perplexity — not preferences or
        affiliations. It routes to the best model for your specific question.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cost visibility component — surfaces dollar-delta when Conductor saved money
// Used in query history / companion response footer (Phase 4.3, #2272)
// ---------------------------------------------------------------------------

export interface ConductorCostDeltaProps {
  chosenModel: string;
  chosenVendor: string;
  baselineModel?: string;   // What would have been chosen without cost-optimization
  chosenCostUsd: number;
  baselineCostUsd?: number;
  rationale?: string;
}

export function ConductorCostDelta({
  chosenModel,
  chosenVendor,
  baselineModel,
  chosenCostUsd,
  baselineCostUsd,
  rationale,
}: ConductorCostDeltaProps) {
  const hasSavings =
    baselineCostUsd != null && baselineCostUsd > chosenCostUsd && baselineModel;
  const savingsUsd = hasSavings ? baselineCostUsd! - chosenCostUsd : 0;

  return (
    <div className="conductor-cost-delta text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
      <span className="shrink-0">🎼</span>
      <span>
        {hasSavings ? (
          <>
            Conductor routed to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {chosenVendor}/{chosenModel}
            </span>{" "}
            at{" "}
            <span className="font-medium text-green-600 dark:text-green-400">
              ${chosenCostUsd.toFixed(5)}
            </span>
            . Would have cost{" "}
            <span className="line-through text-gray-400">
              ${baselineCostUsd!.toFixed(5)}
            </span>{" "}
            on {baselineModel}.{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              You saved ${savingsUsd.toFixed(5)}.
            </span>
          </>
        ) : (
          <>
            Routed to{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {chosenVendor}/{chosenModel}
            </span>
            {rationale ? ` — ${rationale}` : "."}
          </>
        )}
      </span>
    </div>
  );
}
