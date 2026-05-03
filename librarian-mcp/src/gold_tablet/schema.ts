/**
 * Gold Tablet Schema — KN-N1 / BP018 Pod N
 * =========================================
 * Layer 4 SOURCE-class canonical tablets. Gold = REGULATIONS class.
 * 2-tier authority: Platform Gold Canon + Project Gold.
 * Excalibur Class derives FROM Gold via ledger-pointer (read-only).
 *
 * Ring of Three Golden Eblets:
 *   1_canon.eblet.md       → tier "platform_canon"  scope "platform"
 *   2_platform_rules.eblet.md → tier "platform_rules" scope "platform"
 *   3_project_rules.eblet.md  → tier "project_rules"  scope project_id
 *
 * Composes with:
 *   Iron Tablet KN089 (append-only + concurrent-writer discipline)
 *   Excalibur Class KN105 (derives from Gold)
 *   Pod-S Stats-Capture harness (test telemetry)
 *   Pheromone substrate (Pixie-Dust provenance on every mutation)
 */

export type GoldTier = "platform_canon" | "platform_rules" | "project_rules";
export type GoldStatus = "active" | "superseded";

export interface GoldTablet {
  id: string;                        // LB-GOLD-NNNN serial
  tier: GoldTier;
  scope: "platform" | string;        // "platform" or project_id
  topic: string;                     // canonical topic name
  rule_text: string;                 // the actual canonical statement
  ratification_session: string;      // e.g., "BP018"
  ratification_ts: string;           // ISO-8601
  founder_voice_quote?: string;
  excalibur_pointers: string[];      // Excalibur class IDs deriving from this tablet
  supersedes?: string[];             // prior Gold tablet IDs this replaces
  superseded_by?: string;            // populated when a newer tablet supersedes this
  status: GoldStatus;
  hmac_signature: string;            // append-only verifiability
  chronos_ts: string;                // Chronos-signed timestamp
}

/** Parameters for ratifying a new Gold Tablet. */
export interface GoldTabletRatifyParams {
  tier: GoldTier;
  scope: "platform" | string;
  topic: string;
  rule_text: string;
  ratification_session: string;
  founder_voice_quote?: string;
  supersedes?: string[];
  signer_id: string;                  // authority claiming right to ratify
}

/** Query filters for Gold Tablet lookup. */
export interface GoldTabletQuery {
  tier?: GoldTier;
  scope?: string;
  topic?: string;
  status?: "active" | "all";
  limit?: number;
  offset?: number;
}

/** Audit aggregate result. */
export interface GoldTabletAudit {
  total: number;
  by_tier: Record<GoldTier, number>;
  by_status: Record<GoldStatus, number>;
  by_scope: Record<string, number>;
}
