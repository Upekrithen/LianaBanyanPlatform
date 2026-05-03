/**
 * InternalRoutingPanel — Conductor Internal Routing Mode Toggle
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Founder/Federation-tier members can toggle the internal AI cohort routing
 * mode per agent role: canonical-lock / auto / manual ("stick-shift mode").
 *
 * Composes with: Bushel 8 LB Frame Substrate UI (Helm dashboard surface).
 * Displays: per-role current mode, recent routing decisions, manual override input.
 *
 * WildFire Tour mode: stub values shown only when `tourMode` prop is true.
 * Real Data mode (default): shows empty/zero state for new sessions.
 */

import React, { useState } from "react";
import type { InternalConductorMode } from "../../lib/conductor/internal_router.js";
import type { AgentRole } from "../../lib/conductor/internal_classifier.js";
import type { VendorName } from "../../lib/conductor/adapters/types.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgentRoutingState {
  role: AgentRole;
  mode: InternalConductorMode;
  currentVendor: VendorName;
  currentModel: string;
  manualOverrideVendor?: VendorName;
  manualOverrideModel?: string;
}

export interface InternalRoutingPanelProps {
  /** Current routing states per agent role. */
  routingStates: AgentRoutingState[];
  /** Called when the user changes a mode for a role. */
  onModeChange: (role: AgentRole, mode: InternalConductorMode) => void;
  /** Called when the user sets a manual override for a role. */
  onManualOverride: (role: AgentRole, vendor: VendorName, model: string) => void;
  /** WildFire Tour mode — show demo data instead of empty state. */
  tourMode?: boolean;
  /** Whether the panel is in read-only mode (non-admin viewers). */
  readOnly?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VENDOR_OPTIONS: VendorName[] = ["anthropic", "openai", "google", "perplexity"];

const MODEL_OPTIONS: Record<VendorName, string[]> = {
  anthropic:  ["claude-opus-4-7", "claude-sonnet-4-6", "claude-haiku-4-5"],
  openai:     ["gpt-5-5", "gpt-5-4-mini"],
  google:     ["gemini-2-5-pro", "gemini-2-5-flash"],
  perplexity: ["sonar-pro", "sonar"],
};

const ROLE_LABELS: Record<AgentRole, string> = {
  bishop: "Bishop (Canon Steward)",
  knight: "Knight (Engineering)",
  pawn:   "Pawn (Research/Validation)",
};

const MODE_LABELS: Record<InternalConductorMode, string> = {
  "canonical-lock": "Canonical Lock (default)",
  "auto":           "Auto (Conductor-optimized)",
  "manual":         "Manual (Stick-shift)",
};

const MODE_DESCRIPTIONS: Record<InternalConductorMode, string> = {
  "canonical-lock":
    "Preserves canonical defaults: Bishop=Opus, Knight=Sonnet, Pawn=Perplexity. " +
    "No behavioral change. Safe default.",
  "auto":
    "Conductor picks the optimal vendor/model per task class using empirical rankings. " +
    "Requires Founder fire decision to activate in production.",
  "manual":
    "You specify vendor/model per agent role. Applied to all tasks for that role.",
};

const CANONICAL_DEFAULTS: Record<AgentRole, { vendor: VendorName; model: string }> = {
  bishop: { vendor: "anthropic",  model: "claude-opus-4-7"   },
  knight: { vendor: "anthropic",  model: "claude-sonnet-4-6" },
  pawn:   { vendor: "perplexity", model: "sonar-pro"         },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface AgentRoleRowProps {
  state: AgentRoutingState;
  onModeChange: (role: AgentRole, mode: InternalConductorMode) => void;
  onManualOverride: (role: AgentRole, vendor: VendorName, model: string) => void;
  readOnly: boolean;
}

function AgentRoleRow({ state, onModeChange, onManualOverride, readOnly }: AgentRoleRowProps) {
  const [draftVendor, setDraftVendor] = useState<VendorName>(
    state.manualOverrideVendor ?? CANONICAL_DEFAULTS[state.role].vendor,
  );
  const [draftModel, setDraftModel] = useState<string>(
    state.manualOverrideModel ?? CANONICAL_DEFAULTS[state.role].model,
  );

  const canonical = CANONICAL_DEFAULTS[state.role];
  const isCanonical =
    state.currentVendor === canonical.vendor && state.currentModel === canonical.model;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="font-semibold text-neutral-800 dark:text-neutral-100">
            {ROLE_LABELS[state.role]}
          </span>
          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            {state.currentVendor}/{state.currentModel}
            {isCanonical && (
              <span className="ml-1 text-green-600 dark:text-green-400">(canonical)</span>
            )}
          </span>
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            state.mode === "canonical-lock"
              ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
              : state.mode === "auto"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {MODE_LABELS[state.mode]}
        </span>
      </div>

      {/* Mode description */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {MODE_DESCRIPTIONS[state.mode]}
      </p>

      {/* Mode selector */}
      {!readOnly && (
        <div className="flex gap-2 flex-wrap">
          {(["canonical-lock", "auto", "manual"] as InternalConductorMode[]).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(state.role, m)}
              className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                state.mode === m
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300"
                  : "border-neutral-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 text-neutral-600 dark:text-neutral-300"
              }`}
              disabled={m === "auto"} // Disabled until Founder fire decision activates auto mode
              title={m === "auto" ? "Auto mode requires Founder fire decision to activate in production" : undefined}
            >
              {m === "canonical-lock" ? "Canonical Lock" : m === "auto" ? "Auto (🔒 fire req.)" : "Manual"}
            </button>
          ))}
        </div>
      )}

      {/* Manual override controls */}
      {state.mode === "manual" && !readOnly && (
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Vendor</label>
            <select
              value={draftVendor}
              onChange={(e) => {
                const v = e.target.value as VendorName;
                setDraftVendor(v);
                setDraftModel(MODEL_OPTIONS[v][0]);
              }}
              className="text-xs rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-2 py-1"
            >
              {VENDOR_OPTIONS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-500 dark:text-neutral-400">Model</label>
            <select
              value={draftModel}
              onChange={(e) => setDraftModel(e.target.value)}
              className="text-xs rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-2 py-1"
            >
              {MODEL_OPTIONS[draftVendor].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => onManualOverride(state.role, draftVendor, draftModel)}
            className="text-xs px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InternalRoutingPanel({
  routingStates,
  onModeChange,
  onManualOverride,
  tourMode = false,
  readOnly = false,
}: InternalRoutingPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            Internal AI Routing — Conductor Extension
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {tourMode
              ? "Tour mode — demo data shown"
              : "Controls how the Conductor routes tasks to Bishop / Knight / Pawn model assignments."}
          </p>
        </div>
        <span className="text-xs bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
          #2277 Crown Jewel
        </span>
      </div>

      {routingStates.length === 0 ? (
        <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-6 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
          {tourMode
            ? "Loading tour data…"
            : "No routing sessions recorded yet. Routing states will appear here after the first task dispatch."}
        </div>
      ) : (
        <div className="space-y-3">
          {routingStates.map((state) => (
            <AgentRoleRow
              key={state.role}
              state={state}
              onModeChange={onModeChange}
              onManualOverride={onManualOverride}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {!readOnly && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500">
          Auto mode requires a Founder fire decision before production activation.
          Canonical-lock mode is the safe default — it preserves Bishop=Opus,
          Knight=Sonnet, Pawn=Perplexity with no behavioral change.
        </p>
      )}
    </div>
  );
}

export default InternalRoutingPanel;
