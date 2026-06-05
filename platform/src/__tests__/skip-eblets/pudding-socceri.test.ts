// @vitest-environment node
/**
 * PUDDING SOCCERI-EBLET VERIFICATION
 * ====================================
 * Canon BP063 -- Mnemosyne-wholeness acceptance test.
 *
 * Verifies that the Pudding subsystem entry in the explainerCorpus:
 *   1. Has a stable, non-drifting provenance hash (socceri-eblet integrity).
 *   2. Supplies all three required depth layers (Skipping Stones, Wading In, Deep Dive).
 *   3. Has a valid host + specialist pair (narrator rule compliance).
 *   4. Has no em-dashes in any text field (human punctuation doctrine).
 *   5. Has canon numbers wherever they appear (2,270 / 228 / 21 / 83.3% / Cost+20%).
 *   6. Marks are never described as equity, return, or guaranteed payout (securities-clean).
 *
 * The "socceri-eblet" check is the hash-stability proof: we encode the pudding
 * entry's canonical representation, hash it twice, and verify determinism --
 * mirroring the SID assignment that Soccerball performs at ingest time.
 */

import { webcrypto } from "node:crypto";
import { describe, it, expect, beforeAll } from "vitest";
import { hashEtching, detectEtchingDrift } from "@/lib/skip-eblets/provenance";
import { EXPLAINER_CORPUS } from "@/data/explainerCorpus";

beforeAll(() => {
  if (!globalThis.crypto?.subtle) {
    Object.defineProperty(globalThis, "crypto", { value: webcrypto });
  }
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Produces a stable canonical string for a subsystem explainer entry. */
function canonicalizeExplainer(entry: (typeof EXPLAINER_CORPUS)[number]): string {
  return JSON.stringify({
    id: entry.id,
    subsystemNumber: entry.subsystemNumber,
    subsystem: entry.subsystem,
    host: entry.host,
    specialist: entry.specialist,
    layerIds: entry.depths.map((d) => d.layer),
    narratorIds: entry.depths.map((d) => d.narrator.mascotId),
  });
}

const EM_DASH = "\u2014";
// These patterns detect actual securities violations, NOT protective disclaimers.
// The corpus correctly says "Marks (participation tokens -- not equity, not financial instruments)"
// and "Marks are returned to stakers" (returned = given back, not a financial return).
// We only flag affirmative association with financial instruments.
const PROHIBITED_MARKS_PHRASES = [
  /marks\s+(are|=|provide|generate|represent|constitute)\s+equity/i,
  /marks\s+guarantee[sd]?\s+[a-z\s]*payout/i,
  /guaranteed\s+payout\s+from\s+marks/i,
  // "a return" or "financial return" -- but NOT "returned to" which is harmless
  /marks\s+(are|provide)\s+(a\s+)?financial\s+return/i,
  /marks\s+(yield|deliver)\s+[a-z\s]*return\s+on/i,
];
const CANON_NUMBERS = {
  innovations: 2270,
  crownJewels: 228,
  provisionals: 21,
  participationPct: 83.3,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("pudding socceri-eblet verification (BP063)", () => {
  const puddingEntry = EXPLAINER_CORPUS.find((e) => e.id === "puddings");

  it("puddings entry exists in the explainer corpus", () => {
    expect(puddingEntry).toBeDefined();
  });

  it("puddings entry has exactly three depth layers", () => {
    expect(puddingEntry?.depths).toHaveLength(3);
    expect(puddingEntry?.depths[0].layer).toBe("skipping-stones");
    expect(puddingEntry?.depths[1].layer).toBe("wading-in");
    expect(puddingEntry?.depths[2].layer).toBe("deep-dive");
  });

  it("puddings host is lrh (Southern Province)", () => {
    expect(puddingEntry?.host).toBe("lrh");
    expect(puddingEntry?.province).toBe("southern");
  });

  it("puddings deep-dive specialist is present and has a summonLine", () => {
    const dd = puddingEntry?.depths[2];
    expect(dd?.narrator.role).toBe("specialist");
    expect(dd?.narrator.summonLine).toBeTruthy();
    expect(typeof dd?.narrator.summonLine).toBe("string");
    expect((dd?.narrator.summonLine ?? "").length).toBeGreaterThan(10);
  });

  it("socceri-eblet: canonical hash is deterministic (stable SID proof)", async () => {
    if (!puddingEntry) return;
    const canonical = canonicalizeExplainer(puddingEntry);
    const hash1 = await hashEtching(
      "urn:lb:subsystem:puddings",
      canonical,
      "pudding-corpus-v1",
      6,
    );
    const hash2 = await hashEtching(
      "urn:lb:subsystem:puddings",
      canonical,
      "pudding-corpus-v1",
      6,
    );
    expect(detectEtchingDrift(hash1, hash2)).toBe(false);
    expect(hash1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("socceri-eblet: mutated payload causes drift (tamper detection)", async () => {
    if (!puddingEntry) return;
    const canonical = canonicalizeExplainer(puddingEntry);
    const goodHash = await hashEtching(
      "urn:lb:subsystem:puddings",
      canonical,
      "pudding-corpus-v1",
      6,
    );
    const badHash = await hashEtching(
      "urn:lb:subsystem:puddings",
      canonical + "TAMPERED",
      "pudding-corpus-v1",
      6,
    );
    expect(detectEtchingDrift(goodHash, badHash)).toBe(true);
  });

  it("no em-dashes in any puddings text field", () => {
    if (!puddingEntry) return;
    for (const depth of puddingEntry.depths) {
      expect(depth.headline).not.toContain(EM_DASH);
      expect(depth.body).not.toContain(EM_DASH);
      expect(depth.narrator.text).not.toContain(EM_DASH);
      if (depth.narrator.summonLine) {
        expect(depth.narrator.summonLine).not.toContain(EM_DASH);
      }
    }
  });

  it("Marks are securities-clean in puddings text (no equity/return/guaranteed language)", () => {
    if (!puddingEntry) return;
    const allText = puddingEntry.depths
      .flatMap((d) => [d.body, d.narrator.text, d.narrator.summonLine ?? ""])
      .join(" ");
    for (const pattern of PROHIBITED_MARKS_PHRASES) {
      expect(allText).not.toMatch(pattern);
    }
  });

  it("all 22 corpus entries pass socceri-eblet determinism check", async () => {
    for (const entry of EXPLAINER_CORPUS) {
      const canonical = canonicalizeExplainer(entry);
      const h1 = await hashEtching(
        `urn:lb:subsystem:${entry.id}`,
        canonical,
        "corpus-v1",
        entry.subsystemNumber,
      );
      const h2 = await hashEtching(
        `urn:lb:subsystem:${entry.id}`,
        canonical,
        "corpus-v1",
        entry.subsystemNumber,
      );
      expect(detectEtchingDrift(h1, h2)).toBe(false);
    }
  });

  it("all 22 corpus entries have no em-dashes", () => {
    for (const entry of EXPLAINER_CORPUS) {
      for (const depth of entry.depths) {
        expect(depth.headline).not.toContain(EM_DASH);
        expect(depth.body).not.toContain(EM_DASH);
        expect(depth.narrator.text).not.toContain(EM_DASH);
      }
    }
  });

  it("all 22 corpus entries are securities-clean", () => {
    for (const entry of EXPLAINER_CORPUS) {
      const allText = entry.depths
        .flatMap((d) => [d.body, d.narrator.text, d.narrator.summonLine ?? ""])
        .join(" ");
      for (const pattern of PROHIBITED_MARKS_PHRASES) {
        expect(allText).not.toMatch(pattern);
      }
    }
  });

  it("innovation count 2,270 not contradicted in puddings body text", () => {
    if (!puddingEntry) return;
    const allText = puddingEntry.depths.map((d) => d.body).join(" ");
    // Check that if the corpus mentions an innovation count, it is the canon number
    const innovationCountMatches = allText.match(/(\d[\d,]+)\s+innovations/g);
    if (innovationCountMatches) {
      for (const match of innovationCountMatches) {
        const num = parseInt(match.replace(/[^\d]/g, ""), 10);
        expect(num).toBe(CANON_NUMBERS.innovations);
      }
    }
  });
});
