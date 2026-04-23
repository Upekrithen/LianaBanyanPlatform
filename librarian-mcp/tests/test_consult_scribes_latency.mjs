/**
 * test_consult_scribes_latency.mjs (K436)
 * =======================================
 * Latency target per K436 prompt: p95 < 200ms for a 20-tablet cathedral with
 * synthetic 500-entry tablets.
 *
 * Sets up a temp Cathedral with a synthetic registry containing 20 Scribes,
 * 500 entries each (10,000 entries total). Runs `consult_scribes` 50 times
 * with varying topics, computes p50/p95/p99 wall-clock, asserts p95 < 200ms.
 */
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build a 20-Scribe synthetic Cathedral.
const TMP_ROOT = mkdtempSync(resolve(tmpdir(), "k436-latency-"));
mkdirSync(resolve(TMP_ROOT, "scribes"), { recursive: true });
mkdirSync(resolve(TMP_ROOT, "data"), { recursive: true });

const SCRIBE_COUNT = 20;
const ENTRIES_PER_TABLET = 500;
const SCRIBES = [];
for (let i = 0; i < SCRIBE_COUNT; i++) {
  SCRIBES.push({
    id: `Synth${i}`,
    primary: { level: 1, field: `synthetic field ${i}` },
    adjacents: [
      { level: 2, field: `adjacent field A ${i}` },
      { level: 3, field: `adjacent field B ${i}` },
    ],
    keywords: [
      `synth${i}`,
      `keyword_${i}_alpha`,
      `keyword_${i}_beta`,
      `keyword_${i}_gamma`,
      `topic_${i % 5}`,
    ],
  });
}
const registryYaml = [
  "version: test",
  "opened: 2026-04-23",
  "opener: K436 latency test",
  "spec: ../SP22_SP23_THREE_FATES_AND_SCRIBES_CATHEDRAL_SPEC.md",
  "scribes:",
];
for (const s of SCRIBES) {
  registryYaml.push(`  - id: ${s.id}`);
  registryYaml.push(`    primary:`);
  registryYaml.push(`      level: ${s.primary.level}`);
  registryYaml.push(`      field: "${s.primary.field}"`);
  registryYaml.push(`    adjacents:`);
  for (const a of s.adjacents) {
    registryYaml.push(`      - level: ${a.level}`);
    registryYaml.push(`        field: "${a.field}"`);
  }
  registryYaml.push(`    keywords:`);
  for (const k of s.keywords) registryYaml.push(`      - "${k}"`);
}
writeFileSync(resolve(TMP_ROOT, "scribes", "registry.yaml"), registryYaml.join("\n") + "\n", "utf-8");

// Synthetic tablets (header + 500 entries each).
for (const s of SCRIBES) {
  const lines = [];
  lines.push(JSON.stringify({
    type: "header",
    scribe_id: s.id,
    primary_level: s.primary.level,
    primary_field: s.primary.field,
    adjacents: s.adjacents,
    opened: new Date().toISOString(),
    opened_by: "K436 latency test",
  }));
  for (let i = 0; i < ENTRIES_PER_TABLET; i++) {
    lines.push(JSON.stringify({
      ts: new Date(Date.now() - (ENTRIES_PER_TABLET - i) * 60000).toISOString(),
      session: `B${(i % 200).toString().padStart(3, "0")}`,
      observation: `Synthetic observation ${i} for Scribe ${s.id}, sample text with some content for realism.`,
      source: "founder_dialogue",
      canonical_ref: `synth/ref_${i}.md`,
    }));
  }
  writeFileSync(
    resolve(TMP_ROOT, "scribes", `scribe_${s.id}.jsonl`),
    lines.join("\n") + "\n",
    "utf-8",
  );
}

process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_ROOT;
const { consultScribes } = await import("../dist/scribes/consult.js");

after(() => {
  try {
    rmSync(TMP_ROOT, { recursive: true, force: true });
  } catch {
    // Ignore cleanup failures
  }
});

test("consult_scribes p95 < 200ms on 20-tablet, 500-entry/tablet Cathedral", () => {
  // Topics chosen to hit varying numbers of Scribes (some shared via topic_<n%5>).
  const topics = [];
  for (let i = 0; i < 50; i++) {
    if (i % 3 === 0) topics.push(`synth${i % SCRIBE_COUNT}`);          // primary hit
    else if (i % 3 === 1) topics.push(`topic_${i % 5}`);               // multi-Scribe primary
    else topics.push(`adjacent field A ${i % SCRIBE_COUNT}`);          // adjacent-only
  }

  const elapsed = [];
  // Warm-up (JIT + filesystem cache)
  for (let i = 0; i < 3; i++) consultScribes({ topic: topics[i], max_entries: 20 });

  for (const topic of topics) {
    const t0 = process.hrtime.bigint();
    const result = consultScribes({ topic, max_entries: 20 });
    const t1 = process.hrtime.bigint();
    const ms = Number(t1 - t0) / 1_000_000;
    elapsed.push(ms);
    assert.ok(typeof result.elapsed_ms === "number");
  }

  elapsed.sort((a, b) => a - b);
  const pct = (p) => elapsed[Math.floor(elapsed.length * p)] ?? elapsed[elapsed.length - 1];
  const p50 = pct(0.5);
  const p95 = pct(0.95);
  const p99 = pct(0.99);
  // eslint-disable-next-line no-console
  console.log(`consult_scribes latency: p50=${p50.toFixed(1)}ms p95=${p95.toFixed(1)}ms p99=${p99.toFixed(1)}ms n=${elapsed.length}`);
  assert.ok(p95 < 200, `p95 must be < 200ms; got ${p95.toFixed(1)}ms (p50=${p50.toFixed(1)}, p99=${p99.toFixed(1)})`);
});
