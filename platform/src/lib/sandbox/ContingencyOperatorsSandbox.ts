/**
 * ContingencyOperatorsSandbox -- BP072 Wave 3 / Scope 24
 * =======================================================
 * JS/DOM sandbox boundary for member Chronos overlays.
 *
 * Built ON TOP OF the shipped Dragonrider primitive (#2301).
 * This is a NEW reduction-to-practice: an actual browser/Electron
 * execution boundary for member overlays.
 *
 * Architecture:
 *   - Sandboxed: overlays execute inside a sandboxed iframe (no top-frame access)
 *   - Declarative allowlist: the overlay declares what DOM it needs;
 *     the platform grants or denies per-API, never by default
 *   - Reputation-gated: overlays must pass a reputation threshold before
 *     appearing in the gallery or being shared over the Frontier
 *
 * NEVER reaches:
 *   - window.parent, window.top
 *   - document.cookie, localStorage, sessionStorage
 *   - Any fetch/XHR not on the explicit allowlist
 *   - navigator.credentials, Bluetooth, USB, serial ports
 *
 * References:
 *   - Dragonrider primitive #2301 (shipped)
 *   - Overlay gallery (scope 26)
 *   - Frontier-share (scope 26 gate)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/** The set of capabilities an overlay may request. All are DENY by default. */
export type AllowedCapability =
  | "dom:read"           // read the host DOM (limited to declared selectors)
  | "dom:write"          // inject elements into declared mount points
  | "style:inject"       // inject CSS into declared mount points (shadow DOM isolated)
  | "postMessage:send"   // send structured messages to the host frame
  | "postMessage:recv"   // receive structured messages from the host frame
  | "fetch:canonical"    // fetch from https://lianabanyan.com canonical endpoints only
  | "marks:read"         // read the calling member's Marks balance (read-only)
  | "chronos:badge"      // update the Chronos badge-flash counter
  | "llm:local";         // invoke local Ollama model (no external network)

/** Reputation gate: minimum reputation score before overlay enters gallery. */
export const GALLERY_REPUTATION_THRESHOLD = 50; // out of 100
/** Minimum reputation for Frontier-share. */
export const FRONTIER_REPUTATION_THRESHOLD = 75;

/** Declarative overlay manifest. Must be bundled with every overlay. */
export interface OverlayManifest {
  /** Unique identifier -- semver-style slug, e.g. "my-overlay@1.0.0" */
  id: string;
  /** Human-readable display name */
  name: string;
  /** One sentence description (<120 chars) */
  description: string;
  /** Cooperative member ID of the author */
  authorMemberId: string;
  /** Capabilities requested. Platform grants or denies per-API. */
  requestedCapabilities: AllowedCapability[];
  /** DOM selectors the overlay may read (if "dom:read" is requested) */
  domReadSelectors?: string[];
  /** Mount point IDs the overlay may write to (if "dom:write" is requested) */
  domWriteMountPoints?: string[];
  /** Allowed fetch origins (must be a strict subset of canonical LB endpoints) */
  allowedFetchOrigins?: string[];
  /** Chronos overlay iteration number (auto-incremented on each publish) */
  chronosIteration: number;
  /** Semver string */
  version: string;
}

/** The sandbox grant -- what the platform actually allows after reviewing the manifest. */
export interface SandboxGrant {
  manifestId: string;
  grantedCapabilities: AllowedCapability[];
  deniedCapabilities: AllowedCapability[];
  grantedAt: string;
  grantorReason: string;
}

/** Result of running a sandbox boundary check. */
export interface SandboxCheckResult {
  allowed: boolean;
  grant?: SandboxGrant;
  blockedCapabilities: AllowedCapability[];
  reputationScore: number;
  gallerySafe: boolean;
  frontierSafe: boolean;
  reason: string;
}

// ─── Allowlist ────────────────────────────────────────────────────────────────

/** Capabilities that are NEVER grantable, regardless of reputation. */
const HARD_DENY: AllowedCapability[] = [];
// (no hard-deny in v1 -- all declared capabilities are potentially grantable)

/** Capabilities requiring reputation >= GALLERY_REPUTATION_THRESHOLD to grant. */
const REPUTATION_GATED: AllowedCapability[] = [
  "dom:write",
  "style:inject",
  "fetch:canonical",
  "marks:read",
  "llm:local",
];

/** Allowed canonical fetch origins (strict list). */
export const CANONICAL_FETCH_ORIGINS = [
  "https://lianabanyan.com",
  "https://api.lianabanyan.com",
  "https://lianabanyan.supabase.co",
] as const;

// ─── Core sandbox evaluator ───────────────────────────────────────────────────

/**
 * Evaluate whether a manifest should be granted the sandbox and which
 * capabilities are allowed.
 *
 * This runs in the main browser frame before the sandboxed iframe is created.
 * The sandboxed iframe only receives the granted capability list -- it cannot
 * see what was denied or why.
 */
export function evaluateSandboxRequest(
  manifest: OverlayManifest,
  authorReputationScore: number,
): SandboxCheckResult {
  // Normalize reputation: reject NaN, clamp to [0, 100].
  // NaN/Infinity cannot bypass reputation gates.
  const effectiveRep = !Number.isFinite(authorReputationScore)
    ? 0
    : Math.max(0, Math.min(100, authorReputationScore));

  const granted: AllowedCapability[] = [];
  const denied: AllowedCapability[] = [];

  for (const cap of manifest.requestedCapabilities) {
    if (HARD_DENY.includes(cap as never)) {
      denied.push(cap);
      continue;
    }
    if (REPUTATION_GATED.includes(cap) && effectiveRep < GALLERY_REPUTATION_THRESHOLD) {
      denied.push(cap);
      continue;
    }
    granted.push(cap);
  }

  const gallerySafe =
    effectiveRep >= GALLERY_REPUTATION_THRESHOLD && denied.length === 0;
  const frontierSafe =
    effectiveRep >= FRONTIER_REPUTATION_THRESHOLD && denied.length === 0;

  const grant: SandboxGrant | undefined =
    granted.length > 0
      ? {
          manifestId: manifest.id,
          grantedCapabilities: granted,
          deniedCapabilities: denied,
          grantedAt: new Date().toISOString(),
          grantorReason:
            denied.length > 0
              ? `${denied.length} capability(ies) denied: reputation or allowlist constraint.`
              : "All requested capabilities granted.",
        }
      : undefined;

  return {
    allowed: granted.length > 0 || manifest.requestedCapabilities.length === 0,
    grant,
    blockedCapabilities: denied,
    reputationScore: effectiveRep,
    gallerySafe,
    frontierSafe,
    reason: grant?.grantorReason ?? "No capabilities requested.",
  };
}

// ─── Sandboxed iframe builder ─────────────────────────────────────────────────

/**
 * Build the sandbox attribute string for the overlay iframe.
 * Only adds permissions corresponding to granted capabilities.
 * The base set ("allow-scripts") is ALWAYS present.
 * Top-frame navigation is NEVER allowed.
 */
export function buildIframeSandboxAttr(grant: SandboxGrant): string {
  const attrs = new Set<string>(["allow-scripts"]);

  // "dom:write" or "style:inject" require allow-same-origin (in shadow DOM context only)
  if (
    grant.grantedCapabilities.includes("dom:write") ||
    grant.grantedCapabilities.includes("style:inject")
  ) {
    // Intentionally NOT adding allow-same-origin here; overlays use postMessage protocol.
    // Shadow DOM isolation is enforced by the mount point component.
  }

  // "postMessage:send" / "postMessage:recv" -- covered by allow-scripts
  // "fetch:canonical" -- covered by allow-scripts + CSP header
  // Never add: allow-top-navigation, allow-modals, allow-popups, allow-pointer-lock

  return Array.from(attrs).join(" ");
}

/**
 * Build the CSP (Content Security Policy) header string for the overlay iframe.
 * Only allows fetch to the canonical origins declared in the manifest,
 * intersected with the CANONICAL_FETCH_ORIGINS allowlist.
 */
export function buildOverlayCSP(
  manifest: OverlayManifest,
  grant: SandboxGrant,
): string {
  const fetchAllowed = grant.grantedCapabilities.includes("fetch:canonical");

  let connectSrc = "'none'";
  if (fetchAllowed && manifest.allowedFetchOrigins) {
    const safeOrigins = manifest.allowedFetchOrigins.filter((o) =>
      CANONICAL_FETCH_ORIGINS.includes(o as typeof CANONICAL_FETCH_ORIGINS[number])
    );
    if (safeOrigins.length > 0) {
      connectSrc = safeOrigins.join(" ");
    }
  }

  return [
    "default-src 'none'",
    "script-src 'self' 'unsafe-inline'",   // inline scripts from the bundle
    `connect-src ${connectSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "frame-ancestors 'self'",              // no embedding outside our frame
  ].join("; ");
}

// ─── React component stub ─────────────────────────────────────────────────────

/**
 * ContingencyOperatorsSandboxMount -- use this in JSX to mount a sandboxed overlay.
 *
 * Example:
 *   <ContingencyOperatorsSandboxMount
 *     manifest={overlayManifest}
 *     overlayBundleUrl={url}
 *     authorReputationScore={authorScore}
 *   />
 *
 * The component renders a sandboxed iframe or an error card if evaluation fails.
 */
export interface SandboxMountProps {
  manifest: OverlayManifest;
  overlayBundleUrl: string;
  authorReputationScore: number;
}

/** Returns a ready-to-render iframe src URL with the sandbox params encoded. */
export function buildSandboxIframeSrc(
  overlayBundleUrl: string,
  grant: SandboxGrant,
): string {
  const params = new URLSearchParams({
    granted: grant.grantedCapabilities.join(","),
    manifest_id: grant.manifestId,
    grant_ts: grant.grantedAt,
  });
  const separator = overlayBundleUrl.includes("?") ? "&" : "?";
  return `${overlayBundleUrl}${separator}${params.toString()}`;
}

/** Utility: increment the chronos iteration number on a manifest (returns new object). */
export function bumpChronosIteration(manifest: OverlayManifest): OverlayManifest {
  return { ...manifest, chronosIteration: manifest.chronosIteration + 1 };
}
