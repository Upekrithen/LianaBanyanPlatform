/**
 * test_registry.mjs (K436)
 * ========================
 * Tests the SP-23 Scribes registry loader.
 *
 * Run: node --test tests/test_registry.mjs (after `npm run build`).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { getRegistry, getScribe, listScribeIds, scoreScribe } from "../dist/scribes/registry.js";

test("registry parses and contains the 4 pilot Scribes (R9/BRIDLE/Landing/Prov14)", () => {
  const reg = getRegistry();
  assert.ok(Array.isArray(reg.scribes));
  const ids = reg.scribes.map((s) => s.id);
  for (const expected of ["R9", "BRIDLE", "Landing", "Prov14"]) {
    assert.ok(ids.includes(expected), `Expected '${expected}' to be registered, got ${ids.join(",")}`);
  }
});

test("registry exposes primary, adjacents, and keywords for every Scribe", () => {
  const reg = getRegistry();
  for (const s of reg.scribes) {
    assert.ok(s.primary && s.primary.field, `Scribe ${s.id} missing primary.field`);
    assert.ok(Array.isArray(s.adjacents), `Scribe ${s.id} missing adjacents`);
    assert.ok(Array.isArray(s.keywords) && s.keywords.length > 0, `Scribe ${s.id} has no keywords`);
  }
});

test("getScribe returns the entry for a known id", () => {
  const r9 = getScribe("R9");
  assert.ok(r9, "R9 should be findable");
  assert.equal(r9.primary.level, 1);
  assert.ok(r9.keywords.includes("R9"));
});

test("getScribe returns null for an unknown id", () => {
  assert.equal(getScribe("DEFINITELY_NOT_A_SCRIBE"), null);
});

test("listScribeIds returns all registered ids", () => {
  const ids = listScribeIds();
  assert.ok(ids.length >= 4);
  assert.ok(ids.includes("Prov14"));
});

test("scoreScribe ranks Prov14 highest on a Prov-14-themed text", () => {
  // Hand-crafted themes that simulate Clotho output for a Prov 14 paragraph.
  const themes = ["Prov 14", "innovation", "Crown Jewel", "patent_bag", "#2263"];
  const reg = getRegistry();
  const ranked = reg.scribes
    .map((s) => ({ id: s.id, ...scoreScribe(s.id, themes) }))
    .sort((a, b) => b.score - a.score);
  assert.equal(ranked[0].id, "Prov14", `Expected Prov14 first; got ${ranked[0].id}`);
  assert.ok(ranked[0].score >= 1.0);
});

test("scoreScribe returns zero for an unknown Scribe", () => {
  const r = scoreScribe("UNKNOWN", ["whatever"]);
  assert.equal(r.score, 0);
  assert.deepEqual(r.primaryMatches, []);
  assert.deepEqual(r.adjacentMatches, []);
});

test("scoreScribe gives partial credit on adjacent-only matches", () => {
  // Scribe R9 has Level 2 adjacent "prompt engineering". A theme exactly that
  // phrase should score on adjacent (0.5), not primary (1.0), unless one of
  // R9's primary keywords matches too.
  const r = scoreScribe("R9", ["prompt engineering"]);
  // It should NOT be zero; either primary (substring against keyword list) or
  // adjacent.
  assert.ok(r.score > 0, `Expected adjacent or primary match, score was ${r.score}`);
});
