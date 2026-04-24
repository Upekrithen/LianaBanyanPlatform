/**
 * test_fates_router.mjs (K436)
 * ============================
 * Three Fates pipeline tests: Clotho theme extraction, Lachesis scoring,
 * Atropos dispatch on a hand-crafted text.
 *
 * K474/B122: LIBRARIAN_KEYWORDS_MODE=hand-only set for stability — Fates routing
 * tests assert on specific keyword-based dispatch outcomes. The auto-derived sidecar
 * keywords (added by K474) can shift Scribe scores and break these assertions if
 * union mode is active against the real registry. hand-only anchors the test to
 * the pre-K474 baseline behavior.
 */
// Set before any imports so the registry loads with hand-only mode.
process.env.LIBRARIAN_KEYWORDS_MODE = "hand-only";

import { test } from "node:test";
import assert from "node:assert/strict";
import { runFates, clothoExtract } from "../dist/scribes/fates.js";

const SAMPLE_TEXT = `
Knight K433 shipped the K427 Workstream 1 admin dashboard. 22/22 tests green.
Two new patent candidates surfaced for Prov 14: #2276 (two-track audit button)
and #2277 (anonymized-by-default holder view). BRIDLE Rule 2 caught a K432 bug
during session-hygiene reads — the Knight verified before asserting and noted
that PedestalStakeAdmin was querying the wrong schema.
The Cost-Slasher metric on the landing page (librarian.the2ndsecond.com) shows
HOT $/correct cleanly; Lighthouse stays 99/100/96/100. Founder approved the
Chapter 2 Mellon ship for this weekend.
`;

test("clothoExtract pulls innovation IDs (#2276, #2277)", () => {
  const { entities } = clothoExtract(SAMPLE_TEXT);
  assert.ok(entities.includes("#2276"), `entities=${JSON.stringify(entities)}`);
  assert.ok(entities.includes("#2277"));
});

test("clothoExtract pulls session ids (K427, K432, K433)", () => {
  const { entities } = clothoExtract(SAMPLE_TEXT);
  for (const want of ["K427", "K432", "K433"]) {
    assert.ok(entities.includes(want), `Expected ${want} in ${JSON.stringify(entities)}`);
  }
});

test("clothoExtract pulls 'Prov 14' as a provisional ref", () => {
  const { themes, entities } = clothoExtract(SAMPLE_TEXT);
  const flat = [...themes, ...entities].map((t) => t.toLowerCase());
  assert.ok(flat.some((t) => t.includes("prov")), `Expected a 'Prov ...' theme; got ${JSON.stringify(themes)}`);
});

test("runFates: Prov14 and BRIDLE both wake on the sample text", () => {
  const result = runFates(SAMPLE_TEXT);
  const dispatched = result.atropos_dispatch.map((d) => d.scribe_id);
  assert.ok(dispatched.includes("Prov14"), `Prov14 should wake; dispatched=${dispatched.join(",")}`);
  assert.ok(dispatched.includes("BRIDLE"), `BRIDLE should wake; dispatched=${dispatched.join(",")}`);
});

test("runFates: Prov14 dominates a focused Prov-14 paragraph", () => {
  const provText = `
    Prov 14 inventory continues to grow. Innovation candidates #2263, #2264,
    #2265, #2266, #2267 are pre-tagged Crown Jewel. Patent strategy with
    Harrity vs Mousilli decision pending. Conversion deadline Nov 26 looms.
    A&A drafting for AA_FORMAL slots is the next threshing pass on patent_bag.
  `;
  const result = runFates(provText);
  const ranked = Object.entries(result.lachesis_scores).sort((a, b) => b[1] - a[1]);
  assert.equal(ranked[0][0], "Prov14",
    `Expected Prov14 first on a Prov-14 paragraph; ranked=${JSON.stringify(ranked)}`);
  assert.ok(ranked[0][1] >= 3, `Prov14 score should be >= 3; got ${ranked[0][1]}`);
});

test("runFates: dispatch capped at 5 even if more Scribes match", () => {
  // Stuff text with keywords from many Scribes
  const noisy = `
    R9 R9-v2 Eyewitness HOT COLD preload Romulator Librarian
    BRIDLE Rule 1 Rule 2 Rule 3 Rule 4 Rule 5 verify before asserting
    landing librarian.the2ndsecond.com Chapter 1 Chapter 2 Mellon Anachronism Cost Slasher
    Prov 14 Crown Jewel patent_bag #2263 #2264 #2265 innovation Harrity Mousilli
    SDS DOUBLESECRET LockBox Asteroid-ProofVault credential ANTHROPIC_API_KEY token
  `;
  const result = runFates(noisy);
  assert.ok(result.atropos_dispatch.length <= 5,
    `dispatch length should be <=5; got ${result.atropos_dispatch.length}`);
});

test("runFates: dispatch is sorted by score descending", () => {
  const result = runFates(SAMPLE_TEXT);
  for (let i = 1; i < result.atropos_dispatch.length; i++) {
    assert.ok(
      result.atropos_dispatch[i - 1].score >= result.atropos_dispatch[i].score,
      `dispatch not sorted at index ${i}`,
    );
  }
});

test("runFates: empty text yields empty result, no crash", () => {
  const result = runFates("");
  assert.deepEqual(result.clotho_themes, []);
  assert.deepEqual(result.atropos_dispatch, []);
});

test("runFates: every dispatched Scribe has primary or adjacent matches", () => {
  const result = runFates(SAMPLE_TEXT);
  for (const d of result.atropos_dispatch) {
    const hits = d.primary_matches.length + d.adjacent_matches.length;
    assert.ok(hits > 0, `Dispatched ${d.scribe_id} with no matches`);
  }
});
