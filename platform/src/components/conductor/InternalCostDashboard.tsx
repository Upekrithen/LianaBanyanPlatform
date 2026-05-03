/**
 * InternalCostDashboard — Conductor Internal Cost + Quality Telemetry
 * Bushel X · BP021 · Innovation #2277 — Internal AI Cohort Routing Extension
 *
 * Surfaces in the Helm BushelDashboard (Bushel 8 deliverable).
 * Displays: per-role vendor-API-spend trend, accuracy (HOT%), canon-discipline
 * grade trend, and auto-mode adoption stats.
 *
 * Federation-tier visibility: member-visible per cohort-class enforcement.
 * WildFire Tour mode: stub values shown only when `tourMode` prop is true.
 * Real Data mode (default): zeroed/empty state until actual routing events exist.
 *
 * Data source: getInternalConductorAdoptionStats() + getRecentInternalRoutes()
 * from telemetry.ts (in-process ring buffer; per-session data only).
 */

import React from "react";
import type { AgentRole, InternalTaskClass } from "../../lib/conductor/internal_classifier.js";
import type { VendorName } from "../../lib/conductor/adapters/types.js";
import type { InternalConductorMode } from "../../lib/conductor/internal_router.js";

// ---------------------------------------------------------------------------
// Types for dashboard data (passed in as props from the Helm parent)
// ---------------------------------------------------------------------------

export interface InternalRoleStats {
  role: AgentRole;
  currentMode: InternalConductorMode;
  currentVendor: VendorName;
  currentModel: string;
  taskCount: number;
  canonicalLockCount: number;
  autoCount: number;
  manualCount: number;
  /** null = no cost data yet */
  estimatedCostUsd: number | null;
  /** null = no HOT data yet */
  hotPercent: number | null;
}

export interface RecentTaskEntry {
  ts: number;
  taskClass: InternalTaskClass;
  role: AgentRole;
  vendor: VendorName;
  model: string;
  mode: InternalConductorMode;
  canonicalAssignmentUsed: boolean;
}

export interface InternalCostDashboardProps {
  roleStats: InternalRoleStats[];
  recentTasks: RecentTaskEntry[];
  windowHours?: number;
  tourMode?: boolean;
}

// ---------------------------------------------------------------------------
// Tour-mode stub data (only rendered when tourMode=true)
// ---------------------------------------------------------------------------

const TOUR_ROLE_STATS: InternalRoleStats[] = [
  {
    role: "bishop",
    currentMode: "canonical-lock",
    currentVendor: "anthropic",
    currentModel: "claude-opus-4-7",
    taskCount: 47,
    canonicalLockCount: 47,
    autoCount: 0,
    manualCount: 0,
    estimatedCostUsd: 12.40,
    hotPercent: 96,
  },
  {
    role: "knight",
    currentMode: "canonical-lock",
    currentVendor: "anthropic",
    currentModel: "claude-sonnet-4-6",
    taskCount: 183,
    canonicalLockCount: 183,
    autoCount: 0,
    manualCount: 0,
    estimatedCostUsd: 8.72,
    hotPercent: 91,
  },
  {
    role: "pawn",
    currentMode: "canonical-lock",
    currentVendor: "perplexity",
    currentModel: "sonar-pro",
    taskCount: 62,
    canonicalLockCount: 62,
    autoCount: 0,
    manualCount: 0,
    estimatedCostUsd: 4.18,
    hotPercent: 94,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function _formatCost(usd: number | null): string {
  if (usd === null) return "—";
  if (usd < 0.01) return "<$0.01";
  return `$${usd.toFixed(2)}`;
}

function _formatHot(pct: number | null): string {
  if (pct === null) return "—";
  return `${pct.toFixed(0)}%`;
}

function _modeChip(mode: InternalConductorMode) {
  const configs: Record<
    InternalConductorMode,
    { label: string; className: string }
  > = {
    "canonical-lock": {
      label: "Canonical",
      className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300",
    },
    auto: {
      label: "Auto",
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    },
    manual: {
      label: "Manual",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    },
  };
  const cfg = configs[mode];
  return (
    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function _roleLabel(role: AgentRole): string {
  return { bishop: "Bishop", knight: "Knight", pawn: "Pawn" }[role];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RoleStatCard({ stats }: { stats: InternalRoleStats }) {
  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-neutral-800 dark:text-neutral-100">
          {_roleLabel(stats.role)}
        </span>
        {_modeChip(stats.currentMode)}
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {stats.currentVendor}/{stats.currentModel}
      </p>

      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="text-center">
          <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            {stats.taskCount}
          </div>
          <div className="text-xs text-neutral-400">tasks</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            {_formatHot(stats.hotPercent)}
          </div>
          <div className="text-xs text-neutral-400">HOT%</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            {_formatCost(stats.estimatedCostUsd)}
          </div>
          <div className="text-xs text-neutral-400">est. cost</div>
        </div>
      </div>

      {stats.taskCount > 0 && (
        <div className="text-xs text-neutral-400 dark:text-neutral-500 pt-1 space-y-0.5">
          <div className="flex justify-between">
            <span>Canonical-lock</span>
            <span>{stats.canonicalLockCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Auto</span>
            <span>{stats.autoCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Manual</span>
            <span>{stats.manualCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentTaskRow({ entry }: { entry: RecentTaskEntry }) {
  const date = new Date(entry.ts);
  const time = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800 last:border-0">
      <td className="py-1.5 pr-3 text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
        {time}
      </td>
      <td className="py-1.5 pr-3 text-xs text-neutral-700 dark:text-neutral-200 capitalize">
        {_roleLabel(entry.role)}
      </td>
      <td className="py-1.5 pr-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono">
        {entry.taskClass.replace(/_/g, " ")}
      </td>
      <td className="py-1.5 pr-3 text-xs text-neutral-600 dark:text-neutral-300">
        {entry.vendor}/{entry.model.split("-").slice(-2).join("-")}
      </td>
      <td className="py-1.5 text-xs">{_modeChip(entry.mode)}</td>
      <td className="py-1.5 pl-2 text-xs">
        {entry.canonicalAssignmentUsed ? (
          <span className="text-green-600 dark:text-green-400">✓</span>
        ) : (
          <span className="text-blue-500 dark:text-blue-400">↗</span>
        )}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InternalCostDashboard({
  roleStats,
  recentTasks,
  windowHours = 168,
  tourMode = false,
}: InternalCostDashboardProps) {
  const displayStats = tourMode ? TOUR_ROLE_STATS : roleStats;
  const displayTasks = tourMode ? [] : recentTasks;

  const totalTasks = displayStats.reduce((acc, s) => acc + s.taskCount, 0);
  const totalCost = displayStats.reduce((acc, s) => acc + (s.estimatedCostUsd ?? 0), 0);
  const hasData = totalTasks > 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            AI Cohort Cost + Quality
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {tourMode
              ? "Tour mode — demo data"
              : `Last ${windowHours / 24} days · in-session data`}
          </p>
        </div>
        {hasData && (
          <div className="text-right">
            <div className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              {_formatCost(totalCost)}
            </div>
            <div className="text-xs text-neutral-400">{totalTasks} tasks total</div>
          </div>
        )}
      </div>

      {/* Role stat cards */}
      {hasData ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {displayStats.map((s) => (
            <RoleStatCard key={s.role} stats={s} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center py-8 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
          No internal routing sessions recorded yet.
          <br />
          Stats will appear here after the first task dispatch.
        </div>
      )}

      {/* Recent tasks table */}
      {displayTasks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-2">
            Recent Internal Tasks
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                  <th className="pb-1.5 pr-3 font-medium">Time</th>
                  <th className="pb-1.5 pr-3 font-medium">Role</th>
                  <th className="pb-1.5 pr-3 font-medium">Task Class</th>
                  <th className="pb-1.5 pr-3 font-medium">Model</th>
                  <th className="pb-1.5 font-medium">Mode</th>
                  <th className="pb-1.5 pl-2 font-medium">Canon</th>
                </tr>
              </thead>
              <tbody>
                {displayTasks.map((entry, i) => (
                  <RecentTaskRow key={i} entry={entry} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footnote */}
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        ✓ = canonical-lock assignment · ↗ = Conductor-optimized deviation ·
        HOT% = task completion quality proxy · cost = estimated API spend
      </p>
    </div>
  );
}

export default InternalCostDashboard;
