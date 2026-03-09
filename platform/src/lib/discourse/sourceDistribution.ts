/**
 * SOURCE CODE DISTRIBUTION -- Tamper-Proof Download System
 * =========================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 4, 7
 *
 * People can download the ENTIRE LB source code. The protection:
 * modified code won't connect. LB constantly checks all setups,
 * rules, and interactions, locked in place by the Immutable
 * Test-Net-By-Design Ledger (DNA chain).
 *
 * Download Package:
 *   +-- Source Code (full LB platform)
 *   +-- Phase MimicTrunk Configuration
 *   +-- Immutable Ledger Snapshot (test-net)
 *   +-- Validation Checksums (DNA chain)
 *   +-- Connection Handshake Protocol
 *
 * On Connection Attempt:
 *   1. Local ledger snapshot compared to canonical ledger
 *   2. Source code checksums validated against expected hashes
 *   3. Rules engine integrity verified
 *   4. Interaction policies confirmed unchanged
 *   5. If ANY check fails -> connection refused
 *   6. If ALL checks pass -> Phase connects to LB network
 */

import type {
  ValidationCheckType,
  ValidationResult,
  DNAChain,
} from "./phaseMimicTrunks";

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum number of concurrent downloads per member */
export const MAX_CONCURRENT_DOWNLOADS = 1;

/** Download package expiry (ms) -- must be used within this window */
export const PACKAGE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Handshake timeout (ms) -- max time for connection handshake */
export const HANDSHAKE_TIMEOUT_MS = 30_000; // 30 seconds

/** Maximum handshake retry attempts */
export const MAX_HANDSHAKE_RETRIES = 5;

/** Checksum algorithm used for DNA chain */
export const CHECKSUM_ALGORITHM = "sha256";

// ── Phase License Framework (R-004 Integration) ──────────────────────────
//
// Per Rook research R-004: Standard open-source licenses (OSI-approved)
// explicitly FORBID restrictions on how software is used. LB CANNOT use
// a standard open-source license if it wants to enforce ledger validation.
//
// Solution: Custom "Liana Banyan Phase License" — source-available with
// network integrity enforcement. NOT open-source. NOT proprietary.
// It's a new category: "Source-Available with Connection Covenant."
//
// Key clauses:
//   1. Right to View and Modify (personal/educational/internal testing)
//   2. Connection Covenant (must pass all validation to connect to LB network)
//   3. Prohibition on Circumvention (no bypassing DNA chain / ledger / rules engine)
//   4. Forking Restriction (no competing public networks)
//   5. Revocation (LB can sever access for tampered instances)
//
// Legal enforcement is the backstop. Technical enforcement (DNA chain +
// ledger validation) is the first line of defense.

/** License name */
export const PHASE_LICENSE_NAME = "Liana Banyan Phase License";

/** License version */
export const PHASE_LICENSE_VERSION = "1.0";

/** License SPDX-like identifier (custom, not OSI-registered) */
export const PHASE_LICENSE_IDENTIFIER = "LB-Phase-1.0";

/** License clause types */
export const PHASE_LICENSE_CLAUSES = {
  VIEW_AND_MODIFY: "right_to_view_and_modify",
  CONNECTION_COVENANT: "connection_covenant",
  NO_CIRCUMVENTION: "prohibition_on_circumvention",
  FORKING_RESTRICTION: "forking_restriction",
  REVOCATION: "revocation_clause",
} as const;

export type PhaseLicenseClause = typeof PHASE_LICENSE_CLAUSES[keyof typeof PHASE_LICENSE_CLAUSES];

// ── Types ──────────────────────────────────────────────────────────────────

export type PackageStatus =
  | "generating"    // being assembled
  | "ready"         // ready for download
  | "downloaded"    // has been downloaded
  | "expired"       // past expiry window
  | "invalidated";  // checksum no longer matches canonical (new version released)

export type HandshakeStep =
  | "initiate"              // 1. start connection
  | "ledger_comparison"     // 2. compare local ledger to canonical
  | "source_validation"     // 3. validate source code checksums
  | "rules_verification"    // 4. verify rules engine
  | "policy_confirmation"   // 5. confirm interaction policies
  | "governance_check"      // 6. check governance constraints
  | "complete";             // 7. all checks passed, connection established

export type HandshakeResult =
  | "success"               // connected
  | "failed_ledger"         // ledger mismatch
  | "failed_source"         // source code tampered
  | "failed_rules"          // rules engine modified
  | "failed_policies"       // interaction policies changed
  | "failed_governance"     // governance constraints altered
  | "timeout"               // handshake timed out
  | "pending";              // in progress

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface DownloadPackage {
  id: string;
  memberId: string;                   // who requested the download
  trunkId: string;                    // which Phase MimicTrunk this is for
  status: PackageStatus;
  /** Package contents manifest */
  manifest: PackageManifest;
  /** Validation checksums (DNA chain) */
  dnaChain: DNAChain;
  /** When the package was generated */
  generatedAt: string;
  /** When the package expires */
  expiresAt: string;
  /** When the package was downloaded (if applicable) */
  downloadedAt?: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Ledger entry for the download event */
  ledgerEntryId: string;
}

export interface PackageManifest {
  /** LB platform version */
  platformVersion: string;
  /** Source code file count */
  sourceFileCount: number;
  /** Source code total size (bytes) */
  sourceSize: number;
  /** Phase MimicTrunk configuration included */
  trunkConfigIncluded: boolean;
  /** Ledger snapshot iteration */
  ledgerSnapshotIteration: number;
  /** Ledger snapshot entry count */
  ledgerEntryCount: number;
  /** Rules engine version */
  rulesEngineVersion: string;
  /** Interaction policies version */
  interactionPoliciesVersion: string;
  /** Governance constraints version */
  governanceVersion: string;
}

export interface ConnectionHandshake {
  id: string;
  packageId: string;                  // which download package
  trunkId: string;                    // which Phase MimicTrunk
  memberId: string;
  currentStep: HandshakeStep;
  result: HandshakeResult;
  /** Results of each validation step */
  stepResults: HandshakeStepResult[];
  /** When the handshake started */
  initiatedAt: string;
  /** When the handshake completed (or timed out) */
  completedAt?: string;
  /** Total duration in ms */
  durationMs?: number;
  /** Retry count */
  retryCount: number;
  /** Ledger entry for the connection attempt */
  ledgerEntryId: string;
}

export interface HandshakeStepResult {
  step: HandshakeStep;
  result: ValidationResult;
  expectedChecksum: string;
  actualChecksum: string;
  timestamp: string;
  durationMs: number;
  discrepancy?: string;              // what was different (if failed)
}

export interface SourceCodeValidation {
  id: string;
  trunkId: string;
  validatedAt: string;
  checksumAlgorithm: string;
  /** Per-module checksums */
  moduleChecksums: ModuleChecksum[];
  /** Master checksum (hash of all module checksums) */
  masterChecksum: string;
  /** Whether this validation matches the canonical version */
  matchesCanonical: boolean;
  /** Canonical version at time of validation */
  canonicalVersion: string;
  ledgerEntryId: string;
}

export interface ModuleChecksum {
  moduleName: string;
  filePath: string;
  checksum: string;
  fileSize: number;
  lastModified: string;
}

// ── Phase License Types (R-004 Integration) ──────────────────────────────

/**
 * License grant status for a specific Phase MimicTrunk.
 * Every downloaded package includes a license grant tied to the member.
 */
export interface PhaseLicenseGrant {
  /** Grant ID */
  id: string;
  /** Licensed to this member */
  memberId: string;
  /** For this Phase MimicTrunk */
  trunkId: string;
  /** License version granted */
  licenseVersion: string;
  /** License identifier */
  licenseIdentifier: string;
  /** All clause acceptances */
  acceptedClauses: PhaseLicenseClause[];
  /** When the license was granted */
  grantedAt: string;
  /** Whether the license is currently active */
  isActive: boolean;
  /** Revocation reason (if revoked) */
  revocationReason?: string;
  /** Revoked at timestamp */
  revokedAt?: string;
  /** Download package ID that this license was bundled with */
  packageId: string;
  /** Ledger entry recording this grant */
  ledgerEntryId: string;
}

/**
 * License violation types — technical enforcement results
 * that could lead to legal enforcement (revocation).
 */
export type LicenseViolationType =
  | "circumvention_attempt"     // tried to bypass DNA chain validation
  | "forked_network"            // running a competing public network
  | "tampered_rules_engine"     // modified the rules engine
  | "spoofed_ledger"            // forged ledger entries
  | "disabled_validation"       // disabled the handshake protocol
  | "unauthorized_connection";  // connected without valid license

/**
 * License violation record — logged in the Immutable Ledger.
 */
export interface LicenseViolation {
  /** Violation ID */
  id: string;
  /** License grant that was violated */
  licenseGrantId: string;
  /** Member ID */
  memberId: string;
  /** Trunk ID */
  trunkId: string;
  /** Type of violation */
  violationType: LicenseViolationType;
  /** Detailed description of the violation */
  description: string;
  /** Evidence (e.g., mismatched checksums, tampered file paths) */
  evidence: string[];
  /** Which clause was violated */
  violatedClause: PhaseLicenseClause;
  /** When the violation was detected */
  detectedAt: string;
  /** Whether the license was revoked as a result */
  licenseRevoked: boolean;
  /** Ledger entry */
  ledgerEntryId: string;
}

/**
 * Create a Phase License grant for a member downloading a package.
 * All 5 clauses must be accepted before the download can proceed.
 */
export function createLicenseGrant(
  memberId: string,
  trunkId: string,
  packageId: string,
): PhaseLicenseGrant {
  return {
    id: `plg-${memberId}-${trunkId}-${Date.now()}`,
    memberId,
    trunkId,
    licenseVersion: PHASE_LICENSE_VERSION,
    licenseIdentifier: PHASE_LICENSE_IDENTIFIER,
    acceptedClauses: Object.values(PHASE_LICENSE_CLAUSES),
    grantedAt: new Date().toISOString(),
    isActive: true,
    packageId,
    ledgerEntryId: `ledger-plg-${Date.now()}`,
  };
}

/**
 * Check whether all required license clauses have been accepted.
 */
export function hasAcceptedAllClauses(grant: PhaseLicenseGrant): boolean {
  const required = Object.values(PHASE_LICENSE_CLAUSES);
  return required.every(clause => grant.acceptedClauses.includes(clause));
}

/**
 * Map a handshake failure to the corresponding license violation type.
 * Technical enforcement (handshake fails) → legal enforcement (license violation).
 */
export function handshakeFailureToViolation(
  result: HandshakeResult,
): { violationType: LicenseViolationType; violatedClause: PhaseLicenseClause } | null {
  switch (result) {
    case "failed_ledger":
      return {
        violationType: "spoofed_ledger",
        violatedClause: PHASE_LICENSE_CLAUSES.NO_CIRCUMVENTION,
      };
    case "failed_source":
      return {
        violationType: "circumvention_attempt",
        violatedClause: PHASE_LICENSE_CLAUSES.NO_CIRCUMVENTION,
      };
    case "failed_rules":
      return {
        violationType: "tampered_rules_engine",
        violatedClause: PHASE_LICENSE_CLAUSES.NO_CIRCUMVENTION,
      };
    case "failed_policies":
      return {
        violationType: "disabled_validation",
        violatedClause: PHASE_LICENSE_CLAUSES.CONNECTION_COVENANT,
      };
    case "failed_governance":
      return {
        violationType: "tampered_rules_engine",
        violatedClause: PHASE_LICENSE_CLAUSES.CONNECTION_COVENANT,
      };
    default:
      return null; // success, pending, timeout — no violation
  }
}

/**
 * Revoke a license grant and record the violation.
 */
export function revokeLicenseGrant(
  grant: PhaseLicenseGrant,
  reason: string,
): void {
  grant.isActive = false;
  grant.revocationReason = reason;
  grant.revokedAt = new Date().toISOString();
}

/**
 * Check if a download can proceed (valid license required).
 */
export function canDownloadWithLicense(
  grant: PhaseLicenseGrant | null,
): { allowed: boolean; reason?: string } {
  if (!grant) {
    return {
      allowed: false,
      reason: "No license grant found. Accept the Liana Banyan Phase License before downloading.",
    };
  }

  if (!grant.isActive) {
    return {
      allowed: false,
      reason: `License revoked: ${grant.revocationReason ?? "Contact support for details."}`,
    };
  }

  if (!hasAcceptedAllClauses(grant)) {
    return {
      allowed: false,
      reason: "All license clauses must be accepted before downloading.",
    };
  }

  return { allowed: true };
}

// ── Build Verification & Provenance (P-002 Integration) ─────────────────
//
// Per Pawn discovery P-002: Phase MimicTrunks should standardize on
// "immutable phase recipes" + signed SBOM + signed provenance.
//
// Patterns borrowed from:
//   - Nix flakes: treat builds as pure functions of pinned inputs
//   - Cloud Native Buildpacks: policy-driven with embedded SBOMs
//   - Sigstore/cosign: keyless image signing
//   - SLSA provenance: attestations tied to git commit + builder digest
//   - Bazel/rules_oci: hermetic builds with remote caching
//
// Phase MimicTrunk = "immutable phase recipe" that must produce
// a deterministic output. Verification = rebuild + digest comparison
// OR signature + provenance chain validation.

/** SBOM format standards */
export const SBOM_FORMATS = ["spdx", "cyclonedx"] as const;
export type SBOMFormat = typeof SBOM_FORMATS[number];

/** Provenance attestation frameworks */
export const PROVENANCE_FRAMEWORKS = ["slsa", "in_toto", "sigstore"] as const;
export type ProvenanceFramework = typeof PROVENANCE_FRAMEWORKS[number];

/** Build recipe types (how the Phase was assembled) */
export const BUILD_RECIPE_TYPES = [
  "nix_flake",          // Nix flake.lock + derivation
  "buildpack",          // Cloud Native Buildpack manifest
  "dockerfile",         // Traditional Dockerfile (least reproducible)
  "bazel_target",       // Bazel BUILD target with rules_oci
  "apko_manifest",      // Wolfi/apko.yaml composition
  "source_archive",     // Direct source archive (LB default)
] as const;

export type BuildRecipeType = typeof BUILD_RECIPE_TYPES[number];

/**
 * Software Bill of Materials (SBOM) embedded in a Phase MimicTrunk package.
 * Lists all dependencies, their versions, and license information.
 */
export interface PhaseSBOM {
  /** SBOM ID */
  id: string;
  /** Package ID this SBOM belongs to */
  packageId: string;
  /** SBOM format */
  format: SBOMFormat;
  /** Total number of dependencies */
  dependencyCount: number;
  /** Dependencies with known vulnerabilities */
  vulnerabilityCount: number;
  /** License summary (licenses found across all deps) */
  licenseSummary: string[];
  /** Generated at */
  generatedAt: string;
  /** SBOM document hash (for integrity) */
  documentHash: string;
}

/**
 * Provenance attestation for a Phase MimicTrunk build.
 * Proves WHO built it, WHEN, from WHAT source, using WHICH tools.
 */
export interface PhaseProvenance {
  /** Attestation ID */
  id: string;
  /** Package ID this attestation covers */
  packageId: string;
  /** Provenance framework used */
  framework: ProvenanceFramework;
  /** Build recipe type */
  buildRecipeType: BuildRecipeType;
  /** Git commit SHA the build was produced from */
  sourceCommitSha: string;
  /** Git repository URL */
  sourceRepoUrl: string;
  /** Builder identity (who/what performed the build) */
  builderId: string;
  /** Builder digest (hash of the build environment) */
  builderDigest: string;
  /** Build timestamp */
  builtAt: string;
  /** Output digest (hash of the final artifact) */
  outputDigest: string;
  /** Whether the build is reproducible (rebuild produces same digest) */
  isReproducible: boolean;
  /** Signature (cosign/sigstore keyless signature) */
  signature: string;
  /** Signature algorithm */
  signatureAlgorithm: string;
  /** Ledger entry recording this attestation */
  ledgerEntryId: string;
}

/**
 * Verify that a Phase MimicTrunk's provenance chain is intact.
 * Checks: signature valid, source commit matches, builder trusted, digest matches.
 */
export function verifyProvenanceChain(
  provenance: PhaseProvenance,
  expectedOutputDigest: string,
  trustedBuilderIds: string[],
): { valid: boolean; failures: string[] } {
  const failures: string[] = [];

  // Output digest must match
  if (provenance.outputDigest !== expectedOutputDigest) {
    failures.push(
      `Output digest mismatch: expected ${expectedOutputDigest.slice(0, 16)}..., got ${provenance.outputDigest.slice(0, 16)}...`
    );
  }

  // Builder must be trusted
  if (!trustedBuilderIds.includes(provenance.builderId)) {
    failures.push(`Builder ${provenance.builderId} is not in the trusted builder list.`);
  }

  // Signature must be present
  if (!provenance.signature || provenance.signature.length === 0) {
    failures.push("Provenance attestation is unsigned.");
  }

  // Source commit must be present
  if (!provenance.sourceCommitSha || provenance.sourceCommitSha.length < 7) {
    failures.push("Source commit SHA is missing or too short.");
  }

  return {
    valid: failures.length === 0,
    failures,
  };
}

/**
 * Create a provenance attestation stub for a new build.
 */
export function createProvenanceAttestation(
  packageId: string,
  sourceCommitSha: string,
  builderId: string,
  outputDigest: string,
  buildRecipeType: BuildRecipeType = "source_archive",
): PhaseProvenance {
  return {
    id: `prov-${packageId}-${Date.now()}`,
    packageId,
    framework: "slsa",
    buildRecipeType,
    sourceCommitSha,
    sourceRepoUrl: "",
    builderId,
    builderDigest: "",
    builtAt: new Date().toISOString(),
    outputDigest,
    isReproducible: buildRecipeType !== "dockerfile",
    signature: "",
    signatureAlgorithm: "cosign-keyless",
    ledgerEntryId: `ledger-prov-${Date.now()}`,
  };
}

// ── Package Generation Functions ───────────────────────────────────────────

/**
 * Generate a download package for a member's Phase MimicTrunk.
 */
export function generatePackage(
  memberId: string,
  trunkId: string,
  platformVersion: string,
): DownloadPackage {
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + PACKAGE_EXPIRY_MS).toISOString();

  return {
    id: `pkg-${trunkId}-${Date.now()}`,
    memberId,
    trunkId,
    status: "generating",
    manifest: {
      platformVersion,
      sourceFileCount: 0,    // populated during generation
      sourceSize: 0,         // populated during generation
      trunkConfigIncluded: true,
      ledgerSnapshotIteration: 0, // populated during generation
      ledgerEntryCount: 0,   // populated during generation
      rulesEngineVersion: platformVersion,
      interactionPoliciesVersion: platformVersion,
      governanceVersion: platformVersion,
    },
    dnaChain: {
      masterChecksum: "",
      components: [],
      iteration: 0,
      generatedAt: now,
    },
    generatedAt: now,
    expiresAt,
    sizeBytes: 0,
    ledgerEntryId: `ledger-pkg-${Date.now()}`,
  };
}

/**
 * Check if a download package is still valid (not expired, not invalidated).
 */
export function isPackageValid(pkg: DownloadPackage): {
  valid: boolean;
  reason?: string;
} {
  if (pkg.status === "expired") {
    return { valid: false, reason: "Package has expired. Please generate a new one." };
  }

  if (pkg.status === "invalidated") {
    return { valid: false, reason: "Package has been invalidated. A new platform version is available." };
  }

  const now = Date.now();
  const expiry = new Date(pkg.expiresAt).getTime();

  if (now > expiry) {
    return { valid: false, reason: "Package has expired. Please generate a new one." };
  }

  if (pkg.status !== "ready" && pkg.status !== "downloaded") {
    return { valid: false, reason: `Package is in '${pkg.status}' state and cannot be used yet.` };
  }

  return { valid: true };
}

// ── Connection Handshake Functions ─────────────────────────────────────────

/**
 * Initiate a connection handshake.
 */
export function initiateHandshake(
  packageId: string,
  trunkId: string,
  memberId: string,
): ConnectionHandshake {
  return {
    id: `hs-${trunkId}-${Date.now()}`,
    packageId,
    trunkId,
    memberId,
    currentStep: "initiate",
    result: "pending",
    stepResults: [],
    initiatedAt: new Date().toISOString(),
    retryCount: 0,
    ledgerEntryId: `ledger-hs-${Date.now()}`,
  };
}

/**
 * Process the next step of a connection handshake.
 */
export function advanceHandshake(
  handshake: ConnectionHandshake,
  stepResult: HandshakeStepResult,
): {
  proceed: boolean;
  nextStep: HandshakeStep | null;
  finalResult: HandshakeResult | null;
} {
  handshake.stepResults.push(stepResult);

  // If this step failed, the handshake fails
  if (stepResult.result === "fail") {
    const failedStep = stepResult.step;
    let failResult: HandshakeResult;

    switch (failedStep) {
      case "ledger_comparison":
        failResult = "failed_ledger";
        break;
      case "source_validation":
        failResult = "failed_source";
        break;
      case "rules_verification":
        failResult = "failed_rules";
        break;
      case "policy_confirmation":
        failResult = "failed_policies";
        break;
      case "governance_check":
        failResult = "failed_governance";
        break;
      default:
        failResult = "failed_source";
    }

    handshake.result = failResult;
    handshake.completedAt = new Date().toISOString();
    handshake.durationMs = Date.now() - new Date(handshake.initiatedAt).getTime();

    return {
      proceed: false,
      nextStep: null,
      finalResult: failResult,
    };
  }

  // Determine the next step
  const stepOrder: HandshakeStep[] = [
    "initiate",
    "ledger_comparison",
    "source_validation",
    "rules_verification",
    "policy_confirmation",
    "governance_check",
    "complete",
  ];

  const currentIndex = stepOrder.indexOf(stepResult.step);
  const nextIndex = currentIndex + 1;

  if (nextIndex >= stepOrder.length || stepOrder[nextIndex] === "complete") {
    // All steps passed
    handshake.result = "success";
    handshake.currentStep = "complete";
    handshake.completedAt = new Date().toISOString();
    handshake.durationMs = Date.now() - new Date(handshake.initiatedAt).getTime();

    return {
      proceed: false,
      nextStep: null,
      finalResult: "success",
    };
  }

  const nextStep = stepOrder[nextIndex];
  handshake.currentStep = nextStep;

  return {
    proceed: true,
    nextStep,
    finalResult: null,
  };
}

/**
 * Check if a handshake has timed out.
 */
export function isHandshakeTimedOut(handshake: ConnectionHandshake): boolean {
  if (handshake.result !== "pending") return false;
  const elapsed = Date.now() - new Date(handshake.initiatedAt).getTime();
  return elapsed > HANDSHAKE_TIMEOUT_MS;
}

/**
 * Check if a handshake can be retried.
 */
export function canRetryHandshake(handshake: ConnectionHandshake): boolean {
  return (
    handshake.result !== "success" &&
    handshake.result !== "pending" &&
    handshake.retryCount < MAX_HANDSHAKE_RETRIES
  );
}

/**
 * Validate the integrity of a source code module.
 */
export function validateModuleIntegrity(
  expected: ModuleChecksum,
  actual: ModuleChecksum,
): {
  matches: boolean;
  discrepancy?: string;
} {
  if (expected.checksum !== actual.checksum) {
    return {
      matches: false,
      discrepancy: `Checksum mismatch for ${expected.moduleName}: expected ${expected.checksum.slice(0, 16)}..., got ${actual.checksum.slice(0, 16)}...`,
    };
  }

  if (expected.fileSize !== actual.fileSize) {
    return {
      matches: false,
      discrepancy: `File size mismatch for ${expected.moduleName}: expected ${expected.fileSize} bytes, got ${actual.fileSize} bytes.`,
    };
  }

  return { matches: true };
}

/**
 * Get a human-readable description of a handshake failure.
 */
export function getHandshakeFailureMessage(result: HandshakeResult): string {
  switch (result) {
    case "failed_ledger":
      return "Connection refused: Your ledger snapshot does not match the canonical ledger. The source code may have been modified.";
    case "failed_source":
      return "Connection refused: Source code integrity check failed. One or more files have been modified from the canonical version.";
    case "failed_rules":
      return "Connection refused: The rules engine has been modified. All LB rules must remain intact.";
    case "failed_policies":
      return "Connection refused: Interaction policies have been changed. LB policies are immutable.";
    case "failed_governance":
      return "Connection refused: Governance constraints have been altered. The governance hierarchy must remain intact.";
    case "timeout":
      return "Connection timed out. Please check your network connection and try again.";
    case "success":
      return "Connection established. Phase is live on the LB network.";
    case "pending":
      return "Connection handshake in progress...";
    default:
      return "Unknown connection error.";
  }
}
