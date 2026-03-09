/**
 * PHASE MIMICTRUNKS -- Personal & Organizational Server Instances
 * ================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 3, 4, 7
 *
 * A Phase MimicTrunk is a self-contained server/instance of the LB world,
 * accessed through Special Deck Cards. It operates under all LB rules and
 * policies, tied together by an Immutable Ledger snapshot (DNA chain).
 *
 * Key architectural constraints:
 *
 *   - Each Phase operates with the SAME rules and policies as all of LB
 *   - Downloaded source code includes an immutable ledger snapshot
 *   - Modified code WILL NOT connect -- DNA chain validates everything
 *   - Personal, Guild, and Tribe ownership types supported
 *   - Nested governance: LB -> Guild -> Tribe -> Sub-tribe
 *   - Golden Key planes can become the basis for new MimicTrunks
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Connection validation interval (ms) — how often integrity is checked */
export const VALIDATION_INTERVAL_MS = 300_000; // every 5 minutes

/** Maximum retry attempts for failed connection validation */
export const MAX_VALIDATION_RETRIES = 3;

/** Grace period (ms) after validation failure before suspension */
export const VALIDATION_GRACE_PERIOD_MS = 600_000; // 10 minutes

/** Number of checksum components in the DNA chain */
export const DNA_CHAIN_COMPONENTS = 5; // source, rules, interactions, transactions, governance

// ── Types ──────────────────────────────────────────────────────────────────

export type PhaseOwnerType = "member" | "guild" | "tribe";

export type PhaseConnectionStatus =
  | "active"            // connected and validated
  | "suspended"         // failed validation, within grace period
  | "validation_failed" // hard failure, disconnected
  | "initializing"      // first-time setup in progress
  | "offline";          // intentionally disconnected (local-only mode)

export type ValidationCheckType =
  | "source_code"       // source code checksums match expected hashes
  | "rules_engine"      // rules engine integrity verified
  | "interaction_policies" // interaction policies confirmed unchanged
  | "transaction_history"  // transaction ledger consistent
  | "governance_constraints"; // governance rules intact

export type ValidationResult = "pass" | "fail" | "pending";

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface PhaseMimicTrunk {
  id: string;
  name: string;
  description: string;
  ownerType: PhaseOwnerType;
  ownerId: string;                    // member, guild, or tribe ID
  parentTrunkId?: string;             // for tribe trunks nested in guild trunks
  ledgerSnapshotId: string;           // immutable ledger copy ID
  ledgerSnapshotTimestamp: string;    // when the snapshot was taken
  sourceCodeChecksum: string;         // DNA chain master checksum
  dnaChain: DNAChain;                 // full validation chain
  connectionStatus: PhaseConnectionStatus;
  lastValidatedAt?: string;           // last successful validation timestamp
  validationFailureCount: number;     // consecutive failures (resets on success)
  monthlyFee: number;                 // Credits per month
  specialDeckCardId: string;          // access card for entering this Phase
  goldenKeyPlaneId?: string;          // if Phase originated from a Golden Key plane
  createdAt: string;
  updatedAt: string;
  suspendedAt?: string;               // when suspension began (if applicable)
}

export interface DNAChain {
  /** Master checksum — hash of all component checksums combined */
  masterChecksum: string;
  /** Individual component checksums */
  components: DNAChainComponent[];
  /** The iteration/version of the chain */
  iteration: number;
  /** When this chain was generated */
  generatedAt: string;
}

export interface DNAChainComponent {
  type: ValidationCheckType;
  checksum: string;
  /** Number of items/rules/entries hashed into this component */
  itemCount: number;
  /** Timestamp of the most recent item in this component */
  latestItemTimestamp: string;
}

export interface ValidationAttempt {
  id: string;
  trunkId: string;
  attemptedAt: string;
  results: ValidationCheckResult[];
  overallResult: ValidationResult;
  /** If failed, which components failed */
  failedComponents: ValidationCheckType[];
  /** Duration of the validation check in ms */
  durationMs: number;
  ledgerEntryId: string;            // recorded in Immutable Ledger
}

export interface ValidationCheckResult {
  checkType: ValidationCheckType;
  result: ValidationResult;
  expectedChecksum: string;
  actualChecksum: string;
  discrepancyDetails?: string;      // what was different (if failed)
}

export interface PhaseAccessRecord {
  id: string;
  trunkId: string;
  memberId: string;
  accessedAt: string;
  exitedAt?: string;
  accessMethod: "deck_card" | "golden_key" | "guild_portal" | "tribe_portal";
  specialDeckCardId?: string;
  sessionDurationMinutes?: number;
  ledgerEntryId: string;
}

export interface SpecialDeckCardLink {
  cardId: string;
  trunkId: string;
  memberId: string;
  issuedAt: string;
  isActive: boolean;
  revokedAt?: string;
  revokeReason?: string;
}

// ── Phase Creation ─────────────────────────────────────────────────────────

/**
 * Create a new Phase MimicTrunk.
 * The trunk starts in "initializing" status until the first validation passes.
 */
export function createPhaseMimicTrunk(
  name: string,
  description: string,
  ownerType: PhaseOwnerType,
  ownerId: string,
  monthlyFee: number,
  options?: {
    parentTrunkId?: string;
    goldenKeyPlaneId?: string;
  },
): PhaseMimicTrunk {
  const now = new Date().toISOString();
  const trunkId = `pmt-${ownerType}-${ownerId}-${Date.now()}`;

  return {
    id: trunkId,
    name,
    description,
    ownerType,
    ownerId,
    parentTrunkId: options?.parentTrunkId,
    ledgerSnapshotId: `ledger-snap-${Date.now()}`,
    ledgerSnapshotTimestamp: now,
    sourceCodeChecksum: "", // set during initialization
    dnaChain: createInitialDNAChain(),
    connectionStatus: "initializing",
    validationFailureCount: 0,
    monthlyFee,
    specialDeckCardId: `sdc-${trunkId}-${Date.now()}`,
    goldenKeyPlaneId: options?.goldenKeyPlaneId,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create the initial (empty) DNA chain.
 * Components are populated during the initialization validation.
 */
function createInitialDNAChain(): DNAChain {
  const now = new Date().toISOString();
  const componentTypes: ValidationCheckType[] = [
    "source_code",
    "rules_engine",
    "interaction_policies",
    "transaction_history",
    "governance_constraints",
  ];

  return {
    masterChecksum: "",
    components: componentTypes.map(type => ({
      type,
      checksum: "",
      itemCount: 0,
      latestItemTimestamp: now,
    })),
    iteration: 0,
    generatedAt: now,
  };
}

// ── Connection Validation ──────────────────────────────────────────────────

/**
 * Process a validation attempt result.
 * Returns the updated connection status based on the validation outcome.
 */
export function processValidation(
  trunk: PhaseMimicTrunk,
  results: ValidationCheckResult[],
): {
  newStatus: PhaseConnectionStatus;
  failedComponents: ValidationCheckType[];
  shouldDisconnect: boolean;
} {
  const failedComponents = results
    .filter(r => r.result === "fail")
    .map(r => r.checkType);

  const allPassed = failedComponents.length === 0;

  if (allPassed) {
    return {
      newStatus: "active",
      failedComponents: [],
      shouldDisconnect: false,
    };
  }

  // Increment failure count
  const newFailureCount = trunk.validationFailureCount + 1;

  if (newFailureCount >= MAX_VALIDATION_RETRIES) {
    return {
      newStatus: "validation_failed",
      failedComponents,
      shouldDisconnect: true,
    };
  }

  return {
    newStatus: "suspended",
    failedComponents,
    shouldDisconnect: false,
  };
}

/**
 * Check if a trunk is in a state where it can accept connections.
 */
export function canConnect(trunk: PhaseMimicTrunk): {
  allowed: boolean;
  reason?: string;
} {
  switch (trunk.connectionStatus) {
    case "active":
      return { allowed: true };
    case "initializing":
      return { allowed: false, reason: "Phase is still initializing. Please wait for first validation." };
    case "suspended":
      return { allowed: false, reason: "Phase is suspended due to validation failure. Retrying..." };
    case "validation_failed":
      return { allowed: false, reason: "Phase connection refused. Source code integrity check failed." };
    case "offline":
      return { allowed: false, reason: "Phase is in offline/local-only mode." };
    default:
      return { allowed: false, reason: "Unknown status." };
  }
}

/**
 * Check if a member has a valid Special Deck Card for a given trunk.
 */
export function hasValidAccess(
  links: SpecialDeckCardLink[],
  memberId: string,
  trunkId: string,
): boolean {
  return links.some(
    link =>
      link.memberId === memberId &&
      link.trunkId === trunkId &&
      link.isActive,
  );
}

/**
 * Get the governance hierarchy for a Phase MimicTrunk.
 * Returns the chain: LB -> Guild -> Tribe -> Sub-tribe (etc.)
 */
export function getGovernanceChain(
  trunk: PhaseMimicTrunk,
  allTrunks: PhaseMimicTrunk[],
): PhaseMimicTrunk[] {
  const chain: PhaseMimicTrunk[] = [trunk];
  let current = trunk;

  while (current.parentTrunkId) {
    const parent = allTrunks.find(t => t.id === current.parentTrunkId);
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}

/**
 * Get a summary of a Phase MimicTrunk's status.
 */
export function getTrunkSummary(trunk: PhaseMimicTrunk): {
  name: string;
  ownerType: PhaseOwnerType;
  connectionStatus: PhaseConnectionStatus;
  dnaChainIteration: number;
  isHealthy: boolean;
  daysSinceLastValidation: number | null;
} {
  const lastValidated = trunk.lastValidatedAt
    ? new Date(trunk.lastValidatedAt).getTime()
    : null;
  const daysSinceValidation = lastValidated
    ? Math.floor((Date.now() - lastValidated) / (24 * 60 * 60 * 1000))
    : null;

  return {
    name: trunk.name,
    ownerType: trunk.ownerType,
    connectionStatus: trunk.connectionStatus,
    dnaChainIteration: trunk.dnaChain.iteration,
    isHealthy: trunk.connectionStatus === "active" && trunk.validationFailureCount === 0,
    daysSinceLastValidation: daysSinceValidation,
  };
}
