/**
 * IMMUTABLE LEDGER SECTION DEFINITIONS
 * ======================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Section 7 (Immutable Ledger Sections)
 *
 * The Immutable Ledger needs these 8 sections for the Muffled Rule /
 * Coverage Minutes / Phase MimicTrunks feature set:
 *
 *   1. Coverage Minutes Transactions -- earning, spending, donating
 *   2. Donation Record Views -- who looked at whose donation records
 *   3. Pedestal Funding -- all contributions with amounts and sources
 *   4. Phase MimicTrunk Registry -- creation, validation, connection events
 *   5. Source Code Validation -- checksum comparisons, connection attempts, failures
 *   6. Round Table Sessions -- who spoke, for how long, on what topic
 *   7. Reading Verification -- content completion records, Coverage Minutes earned
 *   8. Guild/Tribe Governance -- creation, membership changes, Phase assignments
 *
 * Each entry is append-only. Once written, it cannot be modified or deleted.
 * This is a test-net by design -- the ledger validates everything.
 */

import type {
  CoverageMinuteTransaction,
  CoverageMinuteDonation,
  DonationRecordView,
  CoverageContentType,
} from "./coverageMinutes";

import type {
  RoundTableSession,
} from "./roundTables";

import type {
  PhaseConnectionStatus,
  ValidationCheckType,
} from "./phaseMimicTrunks";

import type {
  PedestalContribution,
  PedestalStatus,
} from "./pedestals";

import type {
  GovernanceAction,
} from "./guildTribePhases";

import type {
  HandshakeResult,
  PackageStatus,
} from "./sourceDistribution";

// ── Constants ──────────────────────────────────────────────────────────────

/** Total number of ledger sections */
export const LEDGER_SECTION_COUNT = 8;

/** Ledger section IDs -- stable identifiers */
export const LEDGER_SECTIONS = {
  COVERAGE_MINUTES: "ledger-section-coverage-minutes",
  DONATION_VIEWS: "ledger-section-donation-views",
  PEDESTAL_FUNDING: "ledger-section-pedestal-funding",
  PHASE_REGISTRY: "ledger-section-phase-registry",
  SOURCE_VALIDATION: "ledger-section-source-validation",
  ROUND_TABLE_SESSIONS: "ledger-section-round-table-sessions",
  READING_VERIFICATION: "ledger-section-reading-verification",
  GUILD_TRIBE_GOVERNANCE: "ledger-section-guild-tribe-governance",
} as const;

export type LedgerSectionId = typeof LEDGER_SECTIONS[keyof typeof LEDGER_SECTIONS];

// ── Types ──────────────────────────────────────────────────────────────────

export type LedgerEntryType =
  // Section 1: Coverage Minutes
  | "coverage_earned"
  | "coverage_spent"
  | "coverage_donated"
  | "coverage_received"
  // Section 2: Donation Views
  | "donation_record_viewed"
  // Section 3: Pedestal Funding
  | "pedestal_contribution"
  | "pedestal_status_change"
  // Section 3 (extension): Outreach Letter Credit-Staking (BP077)
  | "letter_credit_stake"
  | "letter_went_public_via_credits"
  // Section 4: Phase Registry
  | "phase_created"
  | "phase_validated"
  | "phase_connection_changed"
  | "phase_suspended"
  | "phase_access"
  // Section 5: Source Validation
  | "source_package_generated"
  | "source_package_downloaded"
  | "source_handshake_attempted"
  | "source_handshake_completed"
  | "source_validation_failed"
  // Section 6: Round Table Sessions
  | "session_started"
  | "session_ended"
  | "speaker_started"
  | "speaker_ended"
  | "mic_auto_muted"
  // Section 7: Reading Verification
  | "reading_started"
  | "reading_completed"
  | "golden_key_found"
  | "puzzle_completed"
  // Section 8: Governance
  | "guild_created"
  | "guild_dissolved"
  | "tribe_created"
  | "tribe_dissolved"
  | "member_joined_guild"
  | "member_left_guild"
  | "member_joined_tribe"
  | "member_left_tribe"
  | "member_promoted"
  | "member_demoted"
  | "phase_assigned_to_tribe"
  | "leader_changed";

// ── Base Ledger Entry ──────────────────────────────────────────────────────

export interface LedgerEntry {
  /** Unique entry ID -- never changes after creation */
  id: string;
  /** Which section this entry belongs to */
  sectionId: LedgerSectionId;
  /** Specific entry type */
  entryType: LedgerEntryType;
  /** When this entry was written (immutable) */
  timestamp: string;
  /** Hash of this entry (for chain integrity) */
  entryHash: string;
  /** Hash of the previous entry in this section (chain link) */
  previousEntryHash: string;
  /** Member who triggered this action */
  actorMemberId: string;
  /** Optional: member who was affected */
  targetMemberId?: string;
}

// ── Section 1: Coverage Minutes Transactions ───────────────────────────────

export interface CoverageMinutesLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.COVERAGE_MINUTES;
  entryType: "coverage_earned" | "coverage_spent" | "coverage_donated" | "coverage_received";
  /** Amount of Coverage Minutes (always positive) */
  minutes: number;
  /** Source of earning or spending */
  source: CoverageContentType | "round_table_speaking" | "text_publishing";
  /** Content ID (if earning from reading) */
  contentId?: string;
  /** Round table ID (if earning/spending at a table) */
  roundTableId?: string;
  /** Donation ID (if this is a donation transaction) */
  donationId?: string;
  /** Balance after this transaction */
  balanceAfter: number;
}

// ── Section 2: Donation Record Views ───────────────────────────────────────

export interface DonationViewLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.DONATION_VIEWS;
  entryType: "donation_record_viewed";
  /** Which donation record was viewed */
  donationId: string;
  /** Who donated (from the original donation) */
  donorMemberId: string;
  /** Who received (from the original donation) */
  recipientMemberId: string;
  /** Fee paid to view this record (Credits) */
  feePaid: number;
  /** This creates the "tracing is traceable" transparency chain */
}

// ── Section 3: Pedestal Funding ────────────────────────────────────────────

export interface PedestalFundingLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.PEDESTAL_FUNDING;
  entryType: "pedestal_contribution" | "pedestal_status_change";
  /** Which Pedestal */
  pedestalId: string;
  /** Contribution amount (Credits) -- for contribution entries */
  amount?: number;
  /** Contributor's total after this contribution */
  contributorTotalAfter?: number;
  /** Pedestal's total funding after this entry */
  pedestalTotalAfter: number;
  /** Status change (if applicable) */
  newStatus?: PedestalStatus;
  /** Whether this contribution pushed the Pedestal to Public */
  triggeredPublicStatus?: boolean;
}

// ── Section 3 Extension: Outreach Letter Credit-Staking (BP077) ───────────

/**
 * Ledger entry for a member staking Credits on an outreach letter.
 * Uses the same PEDESTAL_FUNDING section as Pedestal contributions —
 * the mechanism is identical (5K/20K threshold, 4-funder minimum).
 */
export interface LetterCreditStakeLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.PEDESTAL_FUNDING;
  entryType: "letter_credit_stake" | "letter_went_public_via_credits";
  /** Which outreach letter this stake is for */
  letterId: string;
  /** Credits staked in this transaction */
  amount: number;
  /** Member's running total for this letter after this stake */
  memberTotalAfter: number;
  /** Letter's credit_stake_total after this stake */
  letterTotalAfter: number;
  /** Number of unique funders after this stake */
  funderCount: number;
  /** Whether this stake pushed the letter to community-elevated status */
  wentPublic?: boolean;
}

// ── Section 4: Phase MimicTrunk Registry ───────────────────────────────────

export interface PhaseRegistryLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.PHASE_REGISTRY;
  entryType: "phase_created" | "phase_validated" | "phase_connection_changed" | "phase_suspended" | "phase_access";
  /** Which Phase MimicTrunk */
  trunkId: string;
  /** Owner type */
  ownerType: "member" | "guild" | "tribe";
  /** Owner ID */
  ownerId: string;
  /** Connection status (if changed) */
  connectionStatus?: PhaseConnectionStatus;
  /** Validation result (if validated) */
  validationPassed?: boolean;
  /** Failed validation components (if any) */
  failedComponents?: ValidationCheckType[];
  /** DNA chain iteration at time of event */
  dnaChainIteration?: number;
  /** Access method (if access event) */
  accessMethod?: "deck_card" | "golden_key" | "guild_portal" | "tribe_portal";
}

// ── Section 5: Source Code Validation ──────────────────────────────────────

export interface SourceValidationLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.SOURCE_VALIDATION;
  entryType: "source_package_generated" | "source_package_downloaded" | "source_handshake_attempted" | "source_handshake_completed" | "source_validation_failed";
  /** Download package ID */
  packageId: string;
  /** Package status */
  packageStatus?: PackageStatus;
  /** Handshake result (if handshake entry) */
  handshakeResult?: HandshakeResult;
  /** Which validation step failed (if failure) */
  failedStep?: string;
  /** Master checksum at time of event */
  masterChecksum?: string;
  /** Platform version */
  platformVersion?: string;
}

// ── Section 6: Round Table Sessions ────────────────────────────────────────

export interface RoundTableSessionLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.ROUND_TABLE_SESSIONS;
  entryType: "session_started" | "session_ended" | "speaker_started" | "speaker_ended" | "mic_auto_muted";
  /** Round table ID */
  roundTableId: string;
  /** Topic ID */
  topicId: string;
  /** Topic name (denormalized for ledger readability) */
  topicName: string;
  /** Session ID (if applicable) */
  sessionId?: string;
  /** Minutes spoken (for speaker_ended / mic_auto_muted) */
  minutesSpoken?: number;
  /** Why the mic was released (for speaker_ended) */
  releaseReason?: "voluntary" | "out_of_minutes" | "moderator_action";
  /** Total participants at time of event */
  participantCount?: number;
  /** Total minutes spoken in session so far */
  totalSessionMinutes?: number;
}

// ── Section 7: Reading Verification ────────────────────────────────────────

export interface ReadingVerificationLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.READING_VERIFICATION;
  entryType: "reading_started" | "reading_completed" | "golden_key_found" | "puzzle_completed";
  /** Content ID being read */
  contentId: string;
  /** Content type */
  contentType: CoverageContentType;
  /** Reading progress (0-100) */
  progressPercent: number;
  /** Coverage Minutes earned from this reading */
  coverageMinutesEarned: number;
  /** Golden Key plane ID (if golden_key_found) */
  goldenKeyPlaneId?: string;
  /** Puzzle ID (if puzzle_completed) */
  puzzleId?: string;
  /** Reading speed tier used */
  readingSpeedTier?: string;
}

// ── Section 8: Guild/Tribe Governance ──────────────────────────────────────

export interface GovernanceLedgerEntry extends LedgerEntry {
  sectionId: typeof LEDGER_SECTIONS.GUILD_TRIBE_GOVERNANCE;
  entryType:
    | "guild_created" | "guild_dissolved"
    | "tribe_created" | "tribe_dissolved"
    | "member_joined_guild" | "member_left_guild"
    | "member_joined_tribe" | "member_left_tribe"
    | "member_promoted" | "member_demoted"
    | "phase_assigned_to_tribe" | "leader_changed";
  /** Guild ID */
  guildId: string;
  /** Guild name (denormalized) */
  guildName: string;
  /** Tribe ID (if tribe-related event) */
  tribeId?: string;
  /** Tribe name (if tribe-related event) */
  tribeName?: string;
  /** New role (for promotion/demotion) */
  newRole?: string;
  /** Previous role (for promotion/demotion) */
  previousRole?: string;
  /** Phase MimicTrunk ID (for phase_assigned) */
  assignedTrunkId?: string;
  /** Member count after this event */
  memberCountAfter?: number;
}

// ── Union Type for All Ledger Entries ──────────────────────────────────────

export type AnyLedgerEntry =
  | CoverageMinutesLedgerEntry
  | DonationViewLedgerEntry
  | PedestalFundingLedgerEntry
  | LetterCreditStakeLedgerEntry
  | PhaseRegistryLedgerEntry
  | SourceValidationLedgerEntry
  | RoundTableSessionLedgerEntry
  | ReadingVerificationLedgerEntry
  | GovernanceLedgerEntry;

// ── Merkle Hash Chain (R-002 Integration) ─────────────────────────────────
//
// Per Rook research R-002: Custom Merkle Hash Chain backed by PostgreSQL.
// This is the ONLY approach that satisfies the "Test-Net-By-Design" requirement
// for Phase MimicTrunks. It enables:
//   - Snapshot bundling (like Git clones) for Phase downloads
//   - Offline validation without contacting canonical server
//   - High speed / low cost on standard infrastructure
//   - Tamper-evidence via cryptographic hash chain
//
// Architecture:
//   1. Storage: Supabase/PostgreSQL append-only tables
//   2. Hashing: Edge Function hashes every new entry, linking to previous hash
//   3. Snapshots: Periodically generate Merkle root for entire chain
//   4. Distribution: Phase MimicTrunk downloads snapshot + Merkle tree,
//      independently verifies by re-hashing local data against canonical root

/** Hash algorithm used for Merkle chain */
export const MERKLE_HASH_ALGORITHM = "sha256";

/** Maximum entries per Merkle tree leaf bundle */
export const MERKLE_LEAF_BUNDLE_SIZE = 256;

/** Snapshot generation interval (entries) — generate new root every N entries */
export const MERKLE_SNAPSHOT_INTERVAL = 1024;

/** Genesis hash — the "previous hash" of the very first entry in each section */
export const MERKLE_GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

/**
 * A single node in the Merkle tree.
 * Leaf nodes contain entry hashes; internal nodes contain child-pair hashes.
 */
export interface MerkleTreeNode {
  /** Hash of this node */
  hash: string;
  /** Left child hash (null for leaf nodes) */
  leftChild: string | null;
  /** Right child hash (null for leaf nodes) */
  rightChild: string | null;
  /** Depth in the tree (0 = root) */
  depth: number;
  /** Whether this is a leaf node containing an actual entry hash */
  isLeaf: boolean;
  /** Entry ID (only for leaf nodes) */
  entryId?: string;
}

/**
 * A Merkle proof — the minimum set of hashes needed to verify
 * that a specific entry exists in the tree without downloading
 * the entire ledger. Used for lightweight offline validation.
 */
export interface MerkleProof {
  /** The entry hash being proven */
  entryHash: string;
  /** Entry ID */
  entryId: string;
  /** Section this entry belongs to */
  sectionId: LedgerSectionId;
  /** Sibling hashes from leaf to root (the "proof path") */
  proofPath: Array<{
    hash: string;
    position: "left" | "right";
  }>;
  /** The Merkle root this proof validates against */
  merkleRoot: string;
  /** Snapshot iteration this proof belongs to */
  snapshotIteration: number;
}

/**
 * A complete Merkle snapshot — generated periodically and bundled
 * into Phase MimicTrunk download packages. This is the "Git clone"
 * equivalent: everything needed to independently verify the ledger.
 */
export interface MerkleSnapshot {
  /** Unique snapshot ID */
  id: string;
  /** Which ledger section this snapshot covers */
  sectionId: LedgerSectionId;
  /** Sequential iteration number */
  iteration: number;
  /** Merkle root hash — the single hash representing the entire section state */
  merkleRoot: string;
  /** Total number of entries in this section at snapshot time */
  entryCount: number;
  /** Hash of the last entry included in this snapshot */
  lastEntryHash: string;
  /** ID of the last entry included */
  lastEntryId: string;
  /** Tree depth */
  treeDepth: number;
  /** When this snapshot was generated */
  generatedAt: string;
  /** Hash algorithm used */
  algorithm: string;
  /** Previous snapshot's Merkle root (chain of snapshots) */
  previousSnapshotRoot: string;
}

/**
 * A full ledger snapshot for Phase MimicTrunk distribution.
 * Contains all 8 section snapshots — this is what gets bundled
 * into the download package alongside the source code.
 */
export interface FullLedgerSnapshot {
  /** Unique ID for this full snapshot */
  id: string;
  /** All 8 section snapshots */
  sectionSnapshots: MerkleSnapshot[];
  /** Master root — hash of all 8 section roots combined */
  masterRoot: string;
  /** Total entries across all sections */
  totalEntryCount: number;
  /** Platform version at snapshot time */
  platformVersion: string;
  /** When this full snapshot was generated */
  generatedAt: string;
  /** Size in bytes (for download package manifest) */
  sizeBytes: number;
}

// ── Ledger Functions ───────────────────────────────────────────────────────

/**
 * Create a ledger entry ID with section prefix.
 */
export function createLedgerEntryId(
  sectionId: LedgerSectionId,
): string {
  return `${sectionId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get the section ID for a given entry type.
 */
export function getSectionForEntryType(
  entryType: LedgerEntryType,
): LedgerSectionId {
  // Coverage Minutes
  if (["coverage_earned", "coverage_spent", "coverage_donated", "coverage_received"].includes(entryType)) {
    return LEDGER_SECTIONS.COVERAGE_MINUTES;
  }
  // Donation Views
  if (entryType === "donation_record_viewed") {
    return LEDGER_SECTIONS.DONATION_VIEWS;
  }
  // Pedestal Funding (includes BP077 letter credit-staking)
  if ([
    "pedestal_contribution",
    "pedestal_status_change",
    "letter_credit_stake",
    "letter_went_public_via_credits",
  ].includes(entryType)) {
    return LEDGER_SECTIONS.PEDESTAL_FUNDING;
  }
  // Phase Registry
  if (["phase_created", "phase_validated", "phase_connection_changed", "phase_suspended", "phase_access"].includes(entryType)) {
    return LEDGER_SECTIONS.PHASE_REGISTRY;
  }
  // Source Validation
  if (["source_package_generated", "source_package_downloaded", "source_handshake_attempted", "source_handshake_completed", "source_validation_failed"].includes(entryType)) {
    return LEDGER_SECTIONS.SOURCE_VALIDATION;
  }
  // Round Table Sessions
  if (["session_started", "session_ended", "speaker_started", "speaker_ended", "mic_auto_muted"].includes(entryType)) {
    return LEDGER_SECTIONS.ROUND_TABLE_SESSIONS;
  }
  // Reading Verification
  if (["reading_started", "reading_completed", "golden_key_found", "puzzle_completed"].includes(entryType)) {
    return LEDGER_SECTIONS.READING_VERIFICATION;
  }
  // Governance
  return LEDGER_SECTIONS.GUILD_TRIBE_GOVERNANCE;
}

/**
 * Validate chain integrity between two consecutive entries.
 * The current entry's previousEntryHash must match the previous entry's entryHash.
 */
export function validateChainLink(
  previous: LedgerEntry,
  current: LedgerEntry,
): { valid: boolean; reason?: string } {
  if (current.previousEntryHash !== previous.entryHash) {
    return {
      valid: false,
      reason: `Chain broken: entry ${current.id} references hash ${current.previousEntryHash} but previous entry ${previous.id} has hash ${previous.entryHash}.`,
    };
  }

  if (current.sectionId !== previous.sectionId) {
    return {
      valid: false,
      reason: `Section mismatch: entry ${current.id} is in section ${current.sectionId} but previous entry ${previous.id} is in section ${previous.sectionId}.`,
    };
  }

  // Chronological order
  const prevTime = new Date(previous.timestamp).getTime();
  const currTime = new Date(current.timestamp).getTime();
  if (currTime < prevTime) {
    return {
      valid: false,
      reason: `Chronological violation: entry ${current.id} (${current.timestamp}) is older than previous entry ${previous.id} (${previous.timestamp}).`,
    };
  }

  return { valid: true };
}

/**
 * Get a human-readable description of a ledger section.
 */
export function getSectionDescription(sectionId: LedgerSectionId): string {
  switch (sectionId) {
    case LEDGER_SECTIONS.COVERAGE_MINUTES:
      return "Coverage Minutes Transactions -- earning, spending, donating Coverage Minutes";
    case LEDGER_SECTIONS.DONATION_VIEWS:
      return "Donation Record Views -- who looked at whose donation records (tracing is traceable)";
    case LEDGER_SECTIONS.PEDESTAL_FUNDING:
      return "Pedestal Funding -- all contributions with amounts and sources";
    case LEDGER_SECTIONS.PHASE_REGISTRY:
      return "Phase MimicTrunk Registry -- creation, validation, connection events";
    case LEDGER_SECTIONS.SOURCE_VALIDATION:
      return "Source Code Validation -- checksum comparisons, connection attempts, failures";
    case LEDGER_SECTIONS.ROUND_TABLE_SESSIONS:
      return "Round Table Sessions -- who spoke, for how long, on what topic";
    case LEDGER_SECTIONS.READING_VERIFICATION:
      return "Reading Verification -- content completion records, Coverage Minutes earned";
    case LEDGER_SECTIONS.GUILD_TRIBE_GOVERNANCE:
      return "Guild/Tribe Governance -- creation, membership changes, Phase assignments";
    default:
      return "Unknown ledger section";
  }
}

/**
 * Get all section IDs.
 */
export function getAllSectionIds(): LedgerSectionId[] {
  return Object.values(LEDGER_SECTIONS);
}

// ── Merkle Hash Chain Functions ───────────────────────────────────────────

/**
 * Compute a SHA-256 hash of a string payload.
 * Uses the Web Crypto API (available in browsers + Edge Functions).
 * Falls back to a deterministic placeholder in non-crypto environments.
 */
export async function computeHash(payload: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for environments without Web Crypto (SSR, tests)
  // Produces a deterministic hash-like string — NOT cryptographically secure
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(64, "0");
}

/**
 * Compute the hash for a ledger entry.
 * The hash covers all immutable fields: id, sectionId, entryType, timestamp,
 * actorMemberId, targetMemberId, and the previousEntryHash (chain link).
 */
export async function computeEntryHash(
  entry: Omit<LedgerEntry, "entryHash">,
): Promise<string> {
  const payload = [
    entry.id,
    entry.sectionId,
    entry.entryType,
    entry.timestamp,
    entry.actorMemberId,
    entry.targetMemberId ?? "",
    entry.previousEntryHash,
  ].join("|");

  return computeHash(payload);
}

/**
 * Combine two child hashes into a parent Merkle node hash.
 * Standard Merkle tree construction: hash(left + right).
 */
export async function computeMerkleParentHash(
  leftHash: string,
  rightHash: string,
): Promise<string> {
  return computeHash(leftHash + rightHash);
}

/**
 * Build a Merkle tree from an array of entry hashes.
 * Returns the tree nodes (bottom-up) and the root hash.
 *
 * If the number of leaves is odd, the last leaf is duplicated
 * (standard Merkle tree padding).
 */
export async function buildMerkleTree(
  entryHashes: Array<{ entryId: string; hash: string }>,
): Promise<{ root: string; nodes: MerkleTreeNode[]; depth: number }> {
  if (entryHashes.length === 0) {
    return { root: MERKLE_GENESIS_HASH, nodes: [], depth: 0 };
  }

  const allNodes: MerkleTreeNode[] = [];

  // Create leaf nodes
  let currentLevel: string[] = entryHashes.map((e) => {
    const node: MerkleTreeNode = {
      hash: e.hash,
      leftChild: null,
      rightChild: null,
      depth: -1, // will be set after we know total depth
      isLeaf: true,
      entryId: e.entryId,
    };
    allNodes.push(node);
    return e.hash;
  });

  let depth = 0;

  // Build tree bottom-up
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];

    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      // If odd number, duplicate the last hash
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;

      const parentHash = await computeMerkleParentHash(left, right);

      const node: MerkleTreeNode = {
        hash: parentHash,
        leftChild: left,
        rightChild: right,
        depth: -1,
        isLeaf: false,
      };
      allNodes.push(node);
      nextLevel.push(parentHash);
    }

    currentLevel = nextLevel;
    depth++;
  }

  // Set depth values (root = 0, leaves = max depth)
  const totalDepth = depth;
  for (const node of allNodes) {
    if (node.isLeaf) {
      node.depth = totalDepth;
    }
  }

  return {
    root: currentLevel[0],
    nodes: allNodes,
    depth: totalDepth,
  };
}

/**
 * Generate a Merkle proof for a specific entry.
 * The proof contains the minimum set of sibling hashes needed to
 * reconstruct the path from the entry's leaf to the root.
 *
 * This allows lightweight offline verification: given an entry hash
 * and its proof, anyone can verify the entry exists in the tree
 * without downloading the entire ledger.
 */
export function generateMerkleProof(
  entryId: string,
  entryHash: string,
  sectionId: LedgerSectionId,
  proofPath: Array<{ hash: string; position: "left" | "right" }>,
  merkleRoot: string,
  snapshotIteration: number,
): MerkleProof {
  return {
    entryHash,
    entryId,
    sectionId,
    proofPath,
    merkleRoot,
    snapshotIteration,
  };
}

/**
 * Verify a Merkle proof — check that the proof path reconstructs
 * the expected Merkle root starting from the entry hash.
 */
export async function verifyMerkleProof(proof: MerkleProof): Promise<boolean> {
  let currentHash = proof.entryHash;

  for (const step of proof.proofPath) {
    if (step.position === "left") {
      // Sibling is on the left, current is on the right
      currentHash = await computeMerkleParentHash(step.hash, currentHash);
    } else {
      // Sibling is on the right, current is on the left
      currentHash = await computeMerkleParentHash(currentHash, step.hash);
    }
  }

  return currentHash === proof.merkleRoot;
}

/**
 * Create a section snapshot. Called periodically (every MERKLE_SNAPSHOT_INTERVAL entries)
 * or on-demand for Phase MimicTrunk download packages.
 */
export function createSectionSnapshot(
  sectionId: LedgerSectionId,
  iteration: number,
  merkleRoot: string,
  entryCount: number,
  lastEntryHash: string,
  lastEntryId: string,
  treeDepth: number,
  previousSnapshotRoot: string,
): MerkleSnapshot {
  return {
    id: `snap-${sectionId}-${iteration}`,
    sectionId,
    iteration,
    merkleRoot,
    entryCount,
    lastEntryHash,
    lastEntryId,
    treeDepth,
    generatedAt: new Date().toISOString(),
    algorithm: MERKLE_HASH_ALGORITHM,
    previousSnapshotRoot,
  };
}

/**
 * Create a full ledger snapshot combining all 8 sections.
 * This is what gets bundled into Phase MimicTrunk download packages.
 */
export async function createFullLedgerSnapshot(
  sectionSnapshots: MerkleSnapshot[],
  platformVersion: string,
): Promise<FullLedgerSnapshot> {
  // Master root = hash of all 8 section roots concatenated
  const combinedRoots = sectionSnapshots
    .map(s => s.merkleRoot)
    .sort() // deterministic order
    .join("|");

  const masterRoot = await computeHash(combinedRoots);
  const totalEntryCount = sectionSnapshots.reduce((sum, s) => sum + s.entryCount, 0);

  return {
    id: `full-snap-${Date.now()}`,
    sectionSnapshots,
    masterRoot,
    totalEntryCount,
    platformVersion,
    generatedAt: new Date().toISOString(),
    sizeBytes: 0, // populated during actual packaging
  };
}

/**
 * Validate a full ledger snapshot by recomputing the master root
 * from the individual section roots.
 */
export async function validateFullSnapshot(
  snapshot: FullLedgerSnapshot,
): Promise<{ valid: boolean; reason?: string }> {
  if (snapshot.sectionSnapshots.length !== LEDGER_SECTION_COUNT) {
    return {
      valid: false,
      reason: `Expected ${LEDGER_SECTION_COUNT} section snapshots, got ${snapshot.sectionSnapshots.length}.`,
    };
  }

  // Recompute master root
  const combinedRoots = snapshot.sectionSnapshots
    .map(s => s.merkleRoot)
    .sort()
    .join("|");

  const recomputedRoot = await computeHash(combinedRoots);

  if (recomputedRoot !== snapshot.masterRoot) {
    return {
      valid: false,
      reason: `Master root mismatch: expected ${snapshot.masterRoot}, recomputed ${recomputedRoot}. Snapshot may be tampered.`,
    };
  }

  // Verify section chain integrity (each snapshot references the previous)
  for (const section of snapshot.sectionSnapshots) {
    if (section.iteration > 1 && section.previousSnapshotRoot === MERKLE_GENESIS_HASH) {
      return {
        valid: false,
        reason: `Section ${section.sectionId} iteration ${section.iteration} has genesis previous root — chain broken.`,
      };
    }
  }

  return { valid: true };
}
