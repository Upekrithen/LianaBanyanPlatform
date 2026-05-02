/**
 * User Choice Integration — Sovereignty-Preserved Scope Handling
 * ===============================================================
 * Handles member's opt-in/opt-out choices for Make-Yourself-Comfortable
 * integration scope. Default integration set offered; member can deselect
 * any canonical path, add custom folders, and extend with Federation Library.
 *
 * Sovereignty per BP005 turn-N+R:
 *   - AGPL-free base substrate
 *   - Federation Library member-only opt-in
 *   - Personal-substrate scope controlled by member
 *   - Nothing pushed to substrate without explicit consent
 *
 * KN086 Phase 2 / BP010
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { STITCHPUNKS_DIR } from "../scribes/pheromone.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── Paths ────────────────────────────────────────────────────────────────

export const BASE_CAMP_DIR = resolve(STITCHPUNKS_DIR, "base_camp");
export const USER_CHOICE_PATH = resolve(BASE_CAMP_DIR, "user_choice.json");

// ─── Schema ───────────────────────────────────────────────────────────────

export interface UserChoiceScope {
  /** Canonical path categories the member has enabled (from default integration set) */
  enabled_categories: string[];
  /** Canonical path categories the member has opted OUT of */
  disabled_categories: string[];
  /** Custom folder paths the member added */
  custom_paths: string[];
  /** Whether member has opted into Federation Library content */
  federation_library_enabled: boolean;
  /** Timestamp of last scope update */
  last_updated: string;
  /** Scope version (incremented on each update) */
  version: number;
}

export type IntegrationCategory =
  | "project_memory"
  | "canonical_eblets"
  | "bishop_state"
  | "scribe_registry_metadata"
  | "canonical_values"
  | "cephas_content"
  | "bishop_dropzone"
  | "knight_dropzone";

export const ALL_CATEGORIES: IntegrationCategory[] = [
  "project_memory",
  "canonical_eblets",
  "bishop_state",
  "scribe_registry_metadata",
  "canonical_values",
  "cephas_content",
  "bishop_dropzone",
  "knight_dropzone",
];

// ─── Default scope ────────────────────────────────────────────────────────

/** Default scope: all canonical categories enabled; Federation Library opt-out */
export const DEFAULT_SCOPE: UserChoiceScope = {
  enabled_categories: [...ALL_CATEGORIES],
  disabled_categories: [],
  custom_paths: [],
  federation_library_enabled: false,
  last_updated: new Date().toISOString(),
  version: 1,
};

// ─── Persistence ─────────────────────────────────────────────────────────

export function loadUserChoiceScope(): UserChoiceScope {
  if (!existsSync(USER_CHOICE_PATH)) return { ...DEFAULT_SCOPE };
  try {
    return JSON.parse(readFileSync(USER_CHOICE_PATH, "utf-8")) as UserChoiceScope;
  } catch {
    return { ...DEFAULT_SCOPE };
  }
}

export function saveUserChoiceScope(scope: UserChoiceScope): void {
  if (!existsSync(BASE_CAMP_DIR)) mkdirSync(BASE_CAMP_DIR, { recursive: true });
  const updated = { ...scope, last_updated: new Date().toISOString() };
  writeFileSync(USER_CHOICE_PATH, JSON.stringify(updated, null, 2), "utf-8");
}

// ─── Scope manipulation ───────────────────────────────────────────────────

/** Enable a canonical category (opt-in) */
export function enableCategory(
  scope: UserChoiceScope,
  category: IntegrationCategory
): UserChoiceScope {
  return {
    ...scope,
    enabled_categories: [...new Set([...scope.enabled_categories, category])],
    disabled_categories: scope.disabled_categories.filter((c) => c !== category),
    version: scope.version + 1,
  };
}

/** Disable a canonical category (opt-out per sovereignty discipline) */
export function disableCategory(
  scope: UserChoiceScope,
  category: IntegrationCategory
): UserChoiceScope {
  return {
    ...scope,
    enabled_categories: scope.enabled_categories.filter((c) => c !== category),
    disabled_categories: [...new Set([...scope.disabled_categories, category])],
    version: scope.version + 1,
  };
}

/** Add a custom folder path to the scope */
export function addCustomPath(
  scope: UserChoiceScope,
  path: string
): UserChoiceScope {
  if (scope.custom_paths.includes(path)) return scope;
  return {
    ...scope,
    custom_paths: [...scope.custom_paths, path],
    version: scope.version + 1,
  };
}

/** Remove a custom folder path from the scope */
export function removeCustomPath(
  scope: UserChoiceScope,
  path: string
): UserChoiceScope {
  return {
    ...scope,
    custom_paths: scope.custom_paths.filter((p) => p !== path),
    version: scope.version + 1,
  };
}

/** Enable Federation Library content in scope */
export function enableFederationLibrary(scope: UserChoiceScope): UserChoiceScope {
  return { ...scope, federation_library_enabled: true, version: scope.version + 1 };
}

// ─── Scope description (for member-facing display) ────────────────────────

export function describeScopeForDisplay(scope: UserChoiceScope): string {
  const lines: string[] = [
    `Make-Yourself-Comfortable Integration Scope (v${scope.version})`,
    "─".repeat(50),
    "",
    `Enabled categories (${scope.enabled_categories.length}/${ALL_CATEGORIES.length}):`,
  ];
  for (const cat of ALL_CATEGORIES) {
    const enabled = scope.enabled_categories.includes(cat);
    lines.push(`  ${enabled ? "✓" : "✗"} ${cat}`);
  }
  if (scope.custom_paths.length > 0) {
    lines.push("", `Custom paths (${scope.custom_paths.length}):`);
    for (const p of scope.custom_paths) {
      lines.push(`  + ${p}`);
    }
  }
  if (scope.disabled_categories.length > 0) {
    lines.push("", `Opted out: ${scope.disabled_categories.join(", ")}`);
  }
  lines.push(
    "",
    `Federation Library: ${scope.federation_library_enabled ? "enabled" : "not enabled"}`
  );
  return lines.join("\n");
}
