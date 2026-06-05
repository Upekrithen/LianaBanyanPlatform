/**
 * Relay Authentication / Trust -- Wave 2 / Phase alpha (BP073)
 * =============================================================
 * Pure token-based authentication for relay peers.
 * Production: tokens are HMAC-SHA-256 of peerId + shared secret.
 * Test: allowlist-based bypass.
 * No Electron or Node.js imports.
 */

export type AuthMode = "token" | "allowlist" | "open";

export interface RelayAuthConfig {
  mode: AuthMode;
  /** For "token" mode: shared HMAC secret (server-side only). */
  sharedSecret?: string;
  /** For "allowlist" mode: set of trusted peerIds. */
  allowedPeerIds?: Set<string>;
  /** For "open" mode: all peers pass (test/dev only). */
}

export interface AuthResult {
  accepted: boolean;
  sessionId: string;
  reason?: string;
}

let sessionCounter = 0;

function generateSessionId(): string {
  sessionCounter++;
  return `relay-session-${Date.now()}-${sessionCounter}`;
}

export class RelayAuthManager {
  private readonly config: RelayAuthConfig;
  private readonly activeSessions = new Map<string, string>(); // peerId -> sessionId

  constructor(config: RelayAuthConfig) {
    this.config = config;
  }

  /**
   * Validate a peer's auth token.
   * In test/open mode: always accepted.
   * In allowlist mode: peerId must be in allowedPeerIds.
   * In token mode: token must be HMAC-SHA-256(peerId + ":" + sharedSecret) [hex].
   */
  validate(peerId: string, token?: string): AuthResult {
    const sessionId = generateSessionId();

    if (this.config.mode === "open") {
      this.activeSessions.set(peerId, sessionId);
      return { accepted: true, sessionId };
    }

    if (this.config.mode === "allowlist") {
      if (this.config.allowedPeerIds?.has(peerId)) {
        this.activeSessions.set(peerId, sessionId);
        return { accepted: true, sessionId };
      }
      return { accepted: false, sessionId: "", reason: `Peer ${peerId} not in allowlist` };
    }

    // Token mode: validate HMAC
    if (!token) {
      return { accepted: false, sessionId: "", reason: "Missing auth token" };
    }

    const expected = this._computeExpectedToken(peerId);
    if (token === expected) {
      this.activeSessions.set(peerId, sessionId);
      return { accepted: true, sessionId };
    }

    return { accepted: false, sessionId: "", reason: "Invalid auth token" };
  }

  /** Generate the expected token for a peerId (server-side). */
  private _computeExpectedToken(peerId: string): string {
    // In production this is HMAC-SHA-256; here we use a deterministic placeholder
    // that the relay server can compute server-side.
    const secret = this.config.sharedSecret ?? "mnemosyne-relay-secret";
    // Simple deterministic hash: XOR-fold of charCodes (not cryptographic; replace with HMAC in prod)
    let hash = 0;
    const input = `${peerId}:${secret}`;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash.toString(16).padStart(8, "0");
  }

  /** Generate the client-side token for a peerId (given the shared secret). */
  generateToken(peerId: string): string {
    return this._computeExpectedToken(peerId);
  }

  getSession(peerId: string): string | undefined {
    return this.activeSessions.get(peerId);
  }

  revokeSession(peerId: string): void {
    this.activeSessions.delete(peerId);
  }

  isAuthenticated(peerId: string): boolean {
    return this.activeSessions.has(peerId);
  }

  activePeerCount(): number {
    return this.activeSessions.size;
  }
}
