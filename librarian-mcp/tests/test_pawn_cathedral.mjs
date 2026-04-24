/**
 * test_pawn_cathedral.mjs — K470(B121): Pawn Cathedral instantiation tests
 * =========================================================================
 * Six tests (A-F) per the feedback_tests_mutating_real_files_serial.md discipline:
 *   A. Directory structure exists — Cathedral dir, schema.json, README.md, keys/, scribes/
 *   B. Scribes load — all four Scribes are valid JSONL; required fields present per schema
 *   C. R11 corpus seeded correctly — 50 tablets, mode=corpus, scope=public,
 *      origin_cathedral=bishop_cathedral, all operator-signed
 *   D. Snapshot generator — produces valid markdown; idempotent on re-run
 *   E. Snapshot length — within Perplexity Pro context budget (~5K–15K tokens)
 *   F. Cathedral distinctness — tablets carry source_cathedral=pawn_cathedral
 *      with origin_cathedral preserved for cross-Cathedral provenance
 *
 * Run: node --test tests/test_pawn_cathedral.mjs (after npm run build)
 *
 * Serial-invocation discipline per feedback_tests_mutating_real_files_serial.md.
 * Tests D uses try/finally to clean up temp snapshot state.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MCP_ROOT = resolve(__dirname, "..");
const WORKSPACE = resolve(MCP_ROOT, "..");

const CATHEDRAL_DIR = resolve(MCP_ROOT, "stitchpunks/pawn_cathedral");
const SCRIBES_DIR = resolve(CATHEDRAL_DIR, "scribes");
const KEYS_DIR = resolve(CATHEDRAL_DIR, "keys");
const SCRIBE_FILES = [
  "PawnQueue.jsonl",
  "PawnHandoffs.jsonl",
  "R11_corpus.jsonl",
  "PawnGenerated.jsonl",
];
const REQUIRED_FIELDS = [
  "observation",
  "category",
  "timestamp",
  "source_session",
  "source_document",
  "tokens",
];
const SNAPSHOT_PATH = resolve(
  WORKSPACE,
  "BISHOP_DROPZONE/K455b_playbook/pawn_cathedral_snapshot.md"
);
const SNAPSHOT_SCRIPT = resolve(MCP_ROOT, "scripts/generate-pawn-snapshot.mjs");

/** Parse a JSONL file, returning entry records only (skip header + blank lines). */
function parseJsonl(filePath) {
  const lines = readFileSync(filePath, "utf-8").split("\n");
  const results = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj;
    try {
      obj = JSON.parse(trimmed);
    } catch (err) {
      throw new Error(
        `Invalid JSON in ${filePath}: ${err.message}\n  Line: ${trimmed.slice(0, 80)}`
      );
    }
    if (obj.type === "header") continue;
    results.push(obj);
  }
  return results;
}

/** Approximate token count (4 chars per token). */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// ── Test A: directory structure exists ────────────────────────────────────────

test("A: pawn_cathedral directory structure exists with all required files", () => {
  assert.ok(existsSync(CATHEDRAL_DIR), `Cathedral dir missing: ${CATHEDRAL_DIR}`);
  assert.ok(existsSync(SCRIBES_DIR), `Scribes dir missing: ${SCRIBES_DIR}`);
  assert.ok(existsSync(KEYS_DIR), `Keys dir missing: ${KEYS_DIR}`);
  assert.ok(
    existsSync(resolve(CATHEDRAL_DIR, "README.md")),
    "README.md missing"
  );
  assert.ok(
    existsSync(resolve(CATHEDRAL_DIR, "schema.json")),
    "schema.json missing"
  );
  assert.ok(
    existsSync(resolve(CATHEDRAL_DIR, "registry.yaml")),
    "registry.yaml missing"
  );
  assert.ok(
    existsSync(resolve(KEYS_DIR, "pawn_cathedral_pub.pem")),
    "pawn_cathedral_pub.pem (public key) missing"
  );
  assert.ok(
    existsSync(resolve(KEYS_DIR, "cooperative_attestation.md")),
    "cooperative_attestation.md missing"
  );
  for (const scribe of SCRIBE_FILES) {
    assert.ok(
      existsSync(resolve(SCRIBES_DIR, scribe)),
      `Scribe missing: ${scribe}`
    );
  }

  // Validate schema.json parses correctly
  const schema = JSON.parse(
    readFileSync(resolve(CATHEDRAL_DIR, "schema.json"), "utf-8")
  );
  assert.ok(schema.$id, "schema.json missing $id");
  assert.ok(
    schema.properties.operator_mediated_sig,
    "schema.json missing operator_mediated_sig property (Pawn-specific)"
  );
  assert.ok(
    schema.properties.source_cathedral,
    "schema.json missing source_cathedral property"
  );
  assert.ok(
    schema.properties.origin_cathedral,
    "schema.json missing origin_cathedral property"
  );

  // Public key must look like a PEM file (starts with -----BEGIN)
  const pubKey = readFileSync(
    resolve(KEYS_DIR, "pawn_cathedral_pub.pem"),
    "utf-8"
  );
  assert.ok(
    pubKey.startsWith("-----BEGIN"),
    "pawn_cathedral_pub.pem does not look like a PEM file"
  );
});

// ── Test B: Scribes load with required fields ────────────────────────────────

test("B: all four Scribes are valid JSONL; required schema fields present", () => {
  for (const scribeFile of SCRIBE_FILES) {
    const filePath = resolve(SCRIBES_DIR, scribeFile);
    const rawLines = readFileSync(filePath, "utf-8").split("\n");

    // Every non-blank line must be valid JSON
    let lineNum = 0;
    let headerFound = false;
    for (const line of rawLines) {
      lineNum++;
      const trimmed = line.trim();
      if (!trimmed) continue;
      let obj;
      try {
        obj = JSON.parse(trimmed);
      } catch (err) {
        assert.fail(
          `${scribeFile} line ${lineNum} is not valid JSON: ${err.message}\n  Content: ${trimmed.slice(0, 80)}`
        );
      }
      if (obj.type === "header") {
        headerFound = true;
        assert.ok(
          obj.scribe_id,
          `${scribeFile} header missing scribe_id`
        );
        assert.strictEqual(
          obj.operator_mediated_sig,
          true,
          `${scribeFile} header missing operator_mediated_sig: true`
        );
        continue;
      }

      // Required fields on entry tablets
      for (const field of REQUIRED_FIELDS) {
        assert.ok(
          field in obj,
          `${scribeFile} line ${lineNum} missing required field '${field}'`
        );
      }
      // timestamp must parse as a valid ISO date
      assert.ok(
        !isNaN(Date.parse(obj.timestamp)),
        `${scribeFile} line ${lineNum} has invalid timestamp: ${obj.timestamp}`
      );
      // tokens must be a number
      assert.equal(
        typeof obj.tokens,
        "number",
        `${scribeFile} line ${lineNum} 'tokens' must be number, got: ${typeof obj.tokens}`
      );
    }
    assert.ok(headerFound, `${scribeFile} has no header record (type: header)`);
  }

  // PawnGenerated is allowed to have no entry tablets (empty at instantiation)
  // PawnQueue and PawnHandoffs must have at least one seed entry
  for (const scribeFile of ["PawnQueue.jsonl", "PawnHandoffs.jsonl", "R11_corpus.jsonl"]) {
    const tablets = parseJsonl(resolve(SCRIBES_DIR, scribeFile));
    assert.ok(
      tablets.length > 0,
      `${scribeFile} has zero entry tablets — seed must exist`
    );
  }
});

// ── Test C: R11 corpus seeded correctly ───────────────────────────────────────

test("C: R11_corpus.jsonl seeded with exactly 50 tablets; mode, scope, provenance correct", () => {
  const filePath = resolve(SCRIBES_DIR, "R11_corpus.jsonl");
  const tablets = parseJsonl(filePath);

  assert.strictEqual(
    tablets.length,
    50,
    `Expected 50 R11 tablets, got ${tablets.length}`
  );

  for (let i = 0; i < tablets.length; i++) {
    const t = tablets[i];
    assert.strictEqual(
      t.scope,
      "public",
      `R11_corpus tablet #${i + 1} scope must be 'public', got: ${t.scope}`
    );
    assert.strictEqual(
      t.source_cathedral,
      "pawn_cathedral",
      `R11_corpus tablet #${i + 1} source_cathedral must be 'pawn_cathedral'`
    );
    assert.strictEqual(
      t.origin_cathedral,
      "bishop_cathedral",
      `R11_corpus tablet #${i + 1} origin_cathedral must be 'bishop_cathedral' (provenance)`
    );
    assert.strictEqual(
      t.operator_mediated_sig,
      true,
      `R11_corpus tablet #${i + 1} must have operator_mediated_sig: true`
    );
    assert.strictEqual(
      t.mode,
      "corpus",
      `R11_corpus tablet #${i + 1} must have mode: 'corpus'`
    );
    assert.ok(
      t.fact_id,
      `R11_corpus tablet #${i + 1} missing fact_id`
    );
    // fact_id must match expected pattern (CS-01, AM-01, etc.)
    assert.ok(
      /^[A-Z]{2}-\d+/.test(t.fact_id),
      `R11_corpus tablet #${i + 1} fact_id '${t.fact_id}' does not match expected pattern [A-Z]{2}-NN`
    );
    // source_session must be K470
    assert.strictEqual(
      t.source_session,
      "K470",
      `R11_corpus tablet #${i + 1} source_session must be 'K470'`
    );
  }

  // Check all 6 categories are present
  const categories = new Set(tablets.map((t) => t.category));
  const expectedCategories = [
    "canonical_statistics",
    "architecture_mechanics",
    "economic_governance",
    "member_journey",
    "regulatory_compliance",
    "historical_precedent",
  ];
  for (const cat of expectedCategories) {
    assert.ok(
      categories.has(cat),
      `R11_corpus missing category: ${cat}`
    );
  }
});

// ── Test D: Snapshot generator produces valid markdown; idempotent ─────────────

test("D: generate-pawn-snapshot.mjs produces valid markdown and is idempotent", () => {
  // Save existing snapshot content (if any) for restore
  const existingSnapshot = existsSync(SNAPSHOT_PATH)
    ? readFileSync(SNAPSHOT_PATH, "utf-8")
    : null;

  try {
    // First run
    const r1 = spawnSync(process.execPath, [SNAPSHOT_SCRIPT], {
      encoding: "utf-8",
      timeout: 15_000,
      cwd: MCP_ROOT,
    });
    assert.strictEqual(
      r1.status,
      0,
      `generate-pawn-snapshot.mjs first run failed (exit ${r1.status}).\nstderr: ${r1.stderr}\nstdout: ${r1.stdout}`
    );

    assert.ok(existsSync(SNAPSHOT_PATH), "Snapshot file not created by first run");
    const snap1 = readFileSync(SNAPSHOT_PATH, "utf-8");

    // Must look like a markdown file with expected headers
    assert.ok(
      snap1.includes("# Pawn Cathedral Snapshot"),
      "Snapshot missing '# Pawn Cathedral Snapshot' title"
    );
    assert.ok(
      snap1.includes("## Introduction"),
      "Snapshot missing ## Introduction section"
    );
    assert.ok(
      snap1.includes("You are Pawn"),
      "Snapshot missing 'You are Pawn' identity framing"
    );
    assert.ok(
      snap1.includes("R11_corpus"),
      "Snapshot missing R11_corpus section"
    );
    assert.ok(
      snap1.includes("## Snapshot Metadata"),
      "Snapshot missing metadata footer"
    );

    // Second run — idempotence check (content should be structurally identical
    // except for the generated timestamp line)
    const r2 = spawnSync(process.execPath, [SNAPSHOT_SCRIPT], {
      encoding: "utf-8",
      timeout: 15_000,
      cwd: MCP_ROOT,
    });
    assert.strictEqual(
      r2.status,
      0,
      `generate-pawn-snapshot.mjs second run failed (exit ${r2.status}).\nstderr: ${r2.stderr}`
    );

    const snap2 = readFileSync(SNAPSHOT_PATH, "utf-8");

    // Strip all timestamp values before comparing (timestamps differ between runs)
    const stripTimestamps = (s) =>
      s
        .replace(/generated \d{4}-\d{2}-\d{2}T[\d:.Z]+/gi, "generated <TS>")
        .replace(/(- Generated: )\d{4}-\d{2}-\d{2}T[\d:.Z]+/g, "$1<TS>");
    const snap1Normalized = stripTimestamps(snap1);
    const snap2Normalized = stripTimestamps(snap2);

    assert.strictEqual(
      snap1Normalized,
      snap2Normalized,
      "Snapshot is not idempotent — second run produced different content (excluding timestamp)"
    );
  } finally {
    // Restore original snapshot (append-only test cleanup)
    if (existingSnapshot !== null) {
      writeFileSync(SNAPSHOT_PATH, existingSnapshot, "utf-8");
    }
  }
});

// ── Test E: Snapshot length within budget ─────────────────────────────────────

test("E: snapshot token count is within Perplexity Pro context budget (5K–15K tokens)", () => {
  // Generate a fresh snapshot for length check
  const existingSnapshot = existsSync(SNAPSHOT_PATH)
    ? readFileSync(SNAPSHOT_PATH, "utf-8")
    : null;

  try {
    const result = spawnSync(process.execPath, [SNAPSHOT_SCRIPT], {
      encoding: "utf-8",
      timeout: 15_000,
      cwd: MCP_ROOT,
    });
    assert.strictEqual(
      result.status,
      0,
      `generate-pawn-snapshot.mjs failed (exit ${result.status}).\nstderr: ${result.stderr}`
    );

    assert.ok(existsSync(SNAPSHOT_PATH), "Snapshot file not found");
    const content = readFileSync(SNAPSHOT_PATH, "utf-8");

    const tokens = estimateTokens(content);
    const MIN_TOKENS = 5_000;
    const MAX_TOKENS = 15_000;

    assert.ok(
      tokens >= MIN_TOKENS,
      `Snapshot too short: ${tokens} tokens (minimum: ${MIN_TOKENS}). Add more Cathedral content.`
    );
    assert.ok(
      tokens <= MAX_TOKENS,
      `Snapshot too long: ${tokens} tokens (maximum: ${MAX_TOKENS}). Trim or paginate content.`
    );
  } finally {
    if (existingSnapshot !== null) {
      writeFileSync(SNAPSHOT_PATH, existingSnapshot, "utf-8");
    }
  }
});

// ── Test F: Cathedral distinctness — provenance preservation ──────────────────

test("F: Pawn Cathedral distinctness — source_cathedral=pawn_cathedral, origin_cathedral preserved", () => {
  // Check every entry tablet in every Scribe
  for (const scribeFile of SCRIBE_FILES) {
    const filePath = resolve(SCRIBES_DIR, scribeFile);
    const tablets = parseJsonl(filePath);

    for (let i = 0; i < tablets.length; i++) {
      const t = tablets[i];

      // Every tablet must declare source_cathedral = "pawn_cathedral"
      assert.strictEqual(
        t.source_cathedral,
        "pawn_cathedral",
        `${scribeFile} tablet #${i + 1} source_cathedral must be 'pawn_cathedral' (got: ${t.source_cathedral}). Cathedral distinctness violated — tablets must not appear to belong to Bishop's or Knight's Cathedral.`
      );

      // Every tablet must have operator_mediated_sig: true
      assert.strictEqual(
        t.operator_mediated_sig,
        true,
        `${scribeFile} tablet #${i + 1} missing operator_mediated_sig: true. All Pawn Cathedral tablets are operator-signed.`
      );
    }
  }

  // R11_corpus tablets specifically must have origin_cathedral = bishop_cathedral
  // (provenance preservation — content came from Bishop's Cathedral)
  const r11Tablets = parseJsonl(resolve(SCRIBES_DIR, "R11_corpus.jsonl"));
  for (let i = 0; i < r11Tablets.length; i++) {
    const t = r11Tablets[i];
    assert.strictEqual(
      t.origin_cathedral,
      "bishop_cathedral",
      `R11_corpus tablet #${i + 1} must carry origin_cathedral='bishop_cathedral' (content provenance from Bishop's Cathedral).`
    );
  }

  // PawnQueue / PawnHandoffs / PawnGenerated tablets must NOT have origin_cathedral
  // (they are original to Pawn's Cathedral)
  for (const scribeFile of ["PawnQueue.jsonl", "PawnHandoffs.jsonl"]) {
    const tablets = parseJsonl(resolve(SCRIBES_DIR, scribeFile));
    for (let i = 0; i < tablets.length; i++) {
      const t = tablets[i];
      assert.ok(
        !("origin_cathedral" in t) || t.origin_cathedral === undefined,
        `${scribeFile} tablet #${i + 1} should NOT have origin_cathedral (it is original to Pawn's Cathedral, not shared from another)`
      );
    }
  }
});
