// court_packages.ts -- Mountain 1 · I-F · Court Package Library
// KNIGHT MARATHON 4 · BP089 · BLACK MAMBA
//
// Preconfigured Council compositions for different task classes.
// Each Package lazy-loads on first reference and is cached in memory.
// M5 (Reminder Scribes) consumes enforcement_council.
// M6 (Librarian Corps) consumes librarian_council.
// Both available post-M4 merge.
//
// §3 Truth-Always: all 6 default packages ship with Mountain 1.
// Custom package registration via court_package_audit table is ROADMAP (post-M4).

import type { DatabaseConfig } from './substrate_reader';

// ─── Types ────────────────────────────────────────────────────────────────────────

export type CouncilPackageName =
  | 'reader_council'
  | 'composer_council'
  | 'strategic_council'
  | 'enforcement_council'
  | 'librarian_council'
  | 'adjudicator_council';

export type EscalationPolicy =
  | 'flagship_on_divergence'
  | 'fail_on_divergence'
  | 'always_flagship';

export interface CouncilMember {
  model_id: string;
  vendor: 'local' | 'anthropic' | 'google' | 'openai';
  ram_required_gb?: number;
  fallback_model_id?: string;
}

export interface CourtPackage {
  name: CouncilPackageName;
  description: string;
  members: CouncilMember[];
  variance_threshold: number;
  escalation_policy: EscalationPolicy;
  substrate_context_filter?: string[];
  estimated_latency_s: number;
  cost_per_fire: number;
}

export interface CourtPackageLibrary {
  get(name: CouncilPackageName): Promise<CourtPackage>;
  list(): CouncilPackageName[];
  preload(names: CouncilPackageName[]): Promise<void>;
}

// ─── Default packages ─────────────────────────────────────────────────────────────

const DEFAULT_PACKAGES: Record<CouncilPackageName, CourtPackage> = {
  reader_council: {
    name: 'reader_council',
    description: '3x gemma2:2b · sub-second extraction · variance threshold 5%',
    members: [
      { model_id: 'gemma2:2b', vendor: 'local', fallback_model_id: 'gemma4:12b' },
      { model_id: 'gemma2:2b', vendor: 'local', fallback_model_id: 'gemma4:12b' },
      { model_id: 'gemma2:2b', vendor: 'local', fallback_model_id: 'gemma4:12b' },
    ],
    variance_threshold: 0.05,
    escalation_policy: 'flagship_on_divergence',
    estimated_latency_s: 2,
    cost_per_fire: 0.00,
  },

  composer_council: {
    name: 'composer_council',
    description: '3x gemma4:12b · ~25s composition · variance threshold 15%',
    members: [
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
    ],
    variance_threshold: 0.15,
    escalation_policy: 'flagship_on_divergence',
    estimated_latency_s: 25,
    cost_per_fire: 0.00,
  },

  strategic_council: {
    name: 'strategic_council',
    description: '3x llama3.3:70b (if peer RAM allows) OR 5x gemma4:12b · 60-90s · variance threshold 10%',
    members: [
      { model_id: 'llama3.3:70b', vendor: 'local', ram_required_gb: 48, fallback_model_id: 'gemma4:12b' },
      { model_id: 'llama3.3:70b', vendor: 'local', ram_required_gb: 48, fallback_model_id: 'gemma4:12b' },
      { model_id: 'llama3.3:70b', vendor: 'local', ram_required_gb: 48, fallback_model_id: 'gemma4:12b' },
    ],
    variance_threshold: 0.10,
    escalation_policy: 'flagship_on_divergence',
    estimated_latency_s: 75,
    cost_per_fire: 0.00,
  },

  enforcement_council: {
    name: 'enforcement_council',
    description: '3x gemma4:12b with canon corpus subset · Scribe enforcement · Marathon 5',
    members: [
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
    ],
    variance_threshold: 0.10,
    escalation_policy: 'flagship_on_divergence',
    substrate_context_filter: ['hot_eblets', 'active_pheromones'],
    estimated_latency_s: 25,
    cost_per_fire: 0.00,
  },

  librarian_council: {
    name: 'librarian_council',
    description: '3x gemma4:12b with path-specific cabinet · Librarian Corps · Marathon 6',
    members: [
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
      { model_id: 'gemma4:12b', vendor: 'local' },
    ],
    variance_threshold: 0.10,
    escalation_policy: 'flagship_on_divergence',
    substrate_context_filter: ['hot_eblets', 'recent_pearls'],
    estimated_latency_s: 25,
    cost_per_fire: 0.00,
  },

  adjudicator_council: {
    name: 'adjudicator_council',
    description: 'flagship Sonnet 4.6 fallback · used only on divergence from other councils',
    members: [
      { model_id: 'claude-sonnet-4-6', vendor: 'anthropic' },
    ],
    variance_threshold: 0.0,
    escalation_policy: 'always_flagship',
    estimated_latency_s: 5,
    cost_per_fire: 0.08,
  },
};

// ─── Factory ──────────────────────────────────────────────────────────────────────

export function createCourtPackageLibrary(_db?: DatabaseConfig): CourtPackageLibrary {
  const _cache = new Map<CouncilPackageName, CourtPackage>();

  return {
    async get(name: CouncilPackageName): Promise<CourtPackage> {
      if (_cache.has(name)) return _cache.get(name)!;
      const pkg = DEFAULT_PACKAGES[name];
      if (!pkg) throw new Error(`Unknown court package: ${name}`);
      _cache.set(name, pkg);
      return pkg;
    },

    list(): CouncilPackageName[] {
      return Object.keys(DEFAULT_PACKAGES) as CouncilPackageName[];
    },

    async preload(names: CouncilPackageName[]): Promise<void> {
      await Promise.all(names.map(async (n) => {
        const pkg = DEFAULT_PACKAGES[n];
        if (pkg) _cache.set(n, pkg);
      }));
    },
  };
}
