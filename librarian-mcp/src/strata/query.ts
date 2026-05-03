/**
 * Strata Query API — KN-T2 / BP018
 * ==================================
 * Ascend / Descend / ByStratum / Promote operations for the 7-layer
 * Keyword-Pyramid substrate.
 *
 * ascend(topic, levels)  — navigate upward toward Bedrock
 * descend(topic, levels) — navigate downward toward Sand
 * byStratum(stratum)     — all topics at a given stratum level
 * promote(topic, to_stratum, signer) — elevate a topic in the pyramid
 *
 * Pheromone Pixie-Dust emitted on promote.
 */

import { emitPheromone } from "../scribes/pheromone.js";
import {
  readAllAssignments,
  writeAssignment,
  getAssignment,
  isValidStratum,
  STRATUM_ORDINALS,
  ALL_STRATA,
  type Stratum,
  type StratumAssignment,
} from "./schema.js";

export class StrataQuery {
  /**
   * Return topics at higher strata (toward Bedrock) from the current topic's level.
   * @param topic  base topic to start from
   * @param levels how many stratum levels to ascend (default 1)
   */
  ascend(topic: string, levels: number = 1): StratumAssignment[] {
    const base = getAssignment(topic);
    if (!base) return [];
    const targetOrdinal = base.ordinal + levels;
    const all = readAllAssignments();
    return all.filter((a) => a.ordinal === targetOrdinal);
  }

  /**
   * Return topics at lower strata (toward Sand) from the current topic's level.
   * @param topic  base topic to start from
   * @param levels how many stratum levels to descend (default 1)
   */
  descend(topic: string, levels: number = 1): StratumAssignment[] {
    const base = getAssignment(topic);
    if (!base) return [];
    const targetOrdinal = base.ordinal - levels;
    if (targetOrdinal < 0) return []; // below Sand — nothing
    const all = readAllAssignments();
    return all.filter((a) => a.ordinal === targetOrdinal);
  }

  /**
   * Return all topics assigned to a given stratum level.
   */
  byStratum(stratum: Stratum): string[] {
    return readAllAssignments()
      .filter((a) => a.stratum === stratum)
      .map((a) => a.topic);
  }

  /**
   * Promote a topic to a higher stratum (immutable constraint: cannot demote).
   * Bedrock rejects further promotion.
   *
   * @param topic       the topic to promote
   * @param to_stratum  target stratum (must be higher than current)
   * @param signer      session ID or agent signing the promotion
   * @param session     ratification session ID (default = signer)
   */
  promote(
    topic: string,
    to_stratum: Stratum,
    signer: string,
    session?: string
  ): StratumAssignment {
    if (!isValidStratum(to_stratum)) {
      throw new Error(`Invalid stratum: '${to_stratum}'. Must be one of: ${ALL_STRATA.join(", ")}`);
    }

    const existing = getAssignment(topic);

    if (existing) {
      if (existing.stratum === "bedrock") {
        throw new Error(`Topic '${topic}' is already at Bedrock — top of pyramid. Promotion rejected.`);
      }
      if (STRATUM_ORDINALS[to_stratum] <= existing.ordinal) {
        throw new Error(
          `Cannot demote or stay: topic '${topic}' is at '${existing.stratum}' (ordinal ${existing.ordinal}). ` +
          `Target '${to_stratum}' (ordinal ${STRATUM_ORDINALS[to_stratum]}) must be higher.`
        );
      }
    }

    const promotion_chain = existing
      ? [...existing.promotion_chain, existing.stratum]
      : [];

    const assignment: StratumAssignment = {
      topic,
      stratum: to_stratum,
      ordinal: STRATUM_ORDINALS[to_stratum],
      ratification_session: session ?? signer,
      promotion_chain,
      ts: new Date().toISOString(),
    };

    writeAssignment(assignment);

    emitPheromone(
      "StrataQuery",
      `strata_promote_${topic}`,
      `strata promote ${topic} ${existing?.stratum ?? "unassigned"} → ${to_stratum} signer:${signer} keyword-pyramid`,
      { cathedral: "knight", flavorClass: { domain: "strata", cognition: "building-in-public" } }
    );

    return assignment;
  }
}

/**
 * Assign a topic to a stratum (initial assignment, no prior stratum required).
 * For first-time assignments where topic doesn't exist yet.
 */
export function assignStratum(
  topic: string,
  stratum: Stratum,
  session: string
): StratumAssignment {
  const q = new StrataQuery();
  return q.promote(topic, stratum, session);
}
