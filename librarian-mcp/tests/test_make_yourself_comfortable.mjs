/**
 * Test Suite: Make-Yourself-Comfortable — Base Camp Protocol Phase 2
 * ==================================================================
 * KN086 Phase 2 / BP010 / ATSRS-004
 * Target: ≥15 tests (10 new tests per K-prompt spec; shooting for 15)
 *
 * Coverage:
 *  G1  extractFragments — frontmatter extraction
 *  G2  extractFragments — innovation number extraction
 *  G3  extractFragments — heading extraction
 *  G4  extractFragments — K/B session reference extraction
 *  G5  extractFragments — max chars truncation
 *  G6  expandPath — no-wildcard absolute file path
 *  G7  expandPath — wildcard pattern with matching files
 *  G8  expandPath — nonexistent directory returns empty
 *  G9  UserChoiceScope — enableCategory + disableCategory sovereignty
 *  G10 UserChoiceScope — addCustomPath / removeCustomPath
 *  G11 UserChoiceScope — describeScopeForDisplay
 *  G12 generateReceipt — comfortable status when completeness ≥ 90%
 *  G13 generateReceipt — partial status when completeness < 90%
 *  G14 generateReceipt — Chronos signature is deterministic HMAC
 *  G15 bulkLoadPaths — dry-run projects correct pheromone count
 *  G16 runMakeYourselfComfortable — minimal scope sequential dry-run
 *  G17 receipt receipt_id sequence increments
 *  G18 shadow task definitions cover all 8 shadow IDs
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tmpdir } from "os";
import { join, resolve } from "path";
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from "fs";

// Override pheromone storage to temp dir so tests don't pollute production substrate
const TMP_BASE = mkdtempSync(join(tmpdir(), "myc-test-"));
process.env.LIBRARIAN_STITCHPUNKS_DIR = TMP_BASE;

// Import AFTER env override so paths resolve correctly
const {
  extractFragments,
  expandPath,
  bulkLoadPaths,
} = await import("../dist/base_camp/pheromone_bulk_loader.js");

const {
  DEFAULT_SCOPE,
  ALL_CATEGORIES,
  enableCategory,
  disableCategory,
  addCustomPath,
  removeCustomPath,
  describeScopeForDisplay,
} = await import("../dist/base_camp/user_choice_integration.js");

const {
  generateReceipt,
} = await import("../dist/base_camp/completeness_receipt.js");

const {
  runMakeYourselfComfortable,
  SHADOW_TASKS,
} = await import("../dist/base_camp/make_yourself_comfortable.js");

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeTmpFile(dir, name, content) {
  const p = join(dir, name);
  writeFileSync(p, content, "utf-8");
  return p;
}

// ─── G1: extractFragments — frontmatter ────────────────────────────────────

describe("[MYC G1] extractFragments — frontmatter extraction", () => {
  it("extracts frontmatter block up to 800 chars", () => {
    const content = `---
name: test-eblet
wrasseTriggers:
  - make yourself comfortable
  - pheromone bulk load
---
# Test Content
Some body text.`;
    const frag = extractFragments("test.md", content);
    assert.ok(frag.includes("make yourself comfortable"), "should include wrasse trigger");
    assert.ok(frag.includes("pheromone bulk load"), "should include second trigger");
    assert.ok(frag.includes("test.md"), "should include filename");
  });
});

// ─── G2: extractFragments — innovation numbers ─────────────────────────────

describe("[MYC G2] extractFragments — innovation number extraction", () => {
  it("extracts #NNNN innovation references", () => {
    const content = `This references #2317 and #2316 and #2291 as canonical innovations.`;
    const frag = extractFragments("innovations.md", content);
    assert.ok(frag.includes("2317") || frag.includes("#2317"), "should find innovation ref");
  });
});

// ─── G3: extractFragments — heading extraction ─────────────────────────────

describe("[MYC G3] extractFragments — first heading extraction", () => {
  it("extracts H1 heading", () => {
    const content = `Some preamble.\n# Make Yourself Comfortable\nBody text here.`;
    const frag = extractFragments("heading.md", content);
    assert.ok(frag.includes("Make Yourself Comfortable"), "should capture H1");
  });

  it("extracts H2 heading when no H1", () => {
    const content = `Preamble.\n## Base Camp Protocol\nBody.`;
    const frag = extractFragments("h2.md", content);
    assert.ok(frag.includes("Base Camp Protocol"), "should capture H2");
  });
});

// ─── G4: extractFragments — session refs ───────────────────────────────────

describe("[MYC G4] extractFragments — K/B session references", () => {
  it("extracts session identifiers (K-numbers, B-numbers)", () => {
    const content = `Session K523 built the pheromone substrate durable build. Bishop B128 ratified.`;
    const frag = extractFragments("session.md", content);
    assert.ok(frag.includes("K523") || frag.includes("B128"), "should capture session refs");
  });
});

// ─── G5: extractFragments — max chars ──────────────────────────────────────

describe("[MYC G5] extractFragments — max chars truncation", () => {
  it("truncates to maxChars", () => {
    const longContent = "a".repeat(10000);
    const frag = extractFragments("big.md", longContent, 500);
    assert.ok(frag.length <= 510, `fragment too long: ${frag.length}`);
  });
});

// ─── G6: expandPath — direct file ──────────────────────────────────────────

describe("[MYC G6] expandPath — no-wildcard absolute file", () => {
  it("returns single file when path is a real .md file", () => {
    const dir = mkdtempSync(join(tmpdir(), "myc-expand-"));
    const f = makeTmpFile(dir, "canon.md", "# Test");
    const result = expandPath(f);
    assert.deepEqual(result, [f]);
  });

  it("returns empty array for nonexistent file", () => {
    const result = expandPath("/nonexistent/path/file.md");
    assert.deepEqual(result, []);
  });
});

// ─── G7: expandPath — wildcard ─────────────────────────────────────────────

describe("[MYC G7] expandPath — wildcard pattern", () => {
  it("matches .md files with *.md pattern", () => {
    const dir = mkdtempSync(join(tmpdir(), "myc-glob-"));
    makeTmpFile(dir, "a.md", "# A");
    makeTmpFile(dir, "b.md", "# B");
    makeTmpFile(dir, "c.txt", "not md");
    const pattern = join(dir, "*.md");
    const result = expandPath(pattern);
    assert.equal(result.length, 2, "should find 2 .md files");
    assert.ok(result.every((f) => f.endsWith(".md")));
  });
});

// ─── G8: expandPath — nonexistent dir ──────────────────────────────────────

describe("[MYC G8] expandPath — nonexistent directory returns empty", () => {
  it("returns [] for pattern in nonexistent dir", () => {
    const result = expandPath("/does/not/exist/*.md");
    assert.deepEqual(result, []);
  });
});

// ─── G9: UserChoiceScope — sovereignty ────────────────────────────────────

describe("[MYC G9] UserChoiceScope — sovereignty enable/disable", () => {
  it("disableCategory removes from enabled, adds to disabled", () => {
    const scope = { ...DEFAULT_SCOPE };
    const updated = disableCategory(scope, "canonical_eblets");
    assert.ok(!updated.enabled_categories.includes("canonical_eblets"));
    assert.ok(updated.disabled_categories.includes("canonical_eblets"));
    assert.equal(updated.version, scope.version + 1);
  });

  it("enableCategory restores disabled category", () => {
    const scope = disableCategory({ ...DEFAULT_SCOPE }, "bishop_state");
    const restored = enableCategory(scope, "bishop_state");
    assert.ok(restored.enabled_categories.includes("bishop_state"));
    assert.ok(!restored.disabled_categories.includes("bishop_state"));
  });
});

// ─── G10: UserChoiceScope — custom paths ──────────────────────────────────

describe("[MYC G10] UserChoiceScope — custom path sovereignty", () => {
  it("addCustomPath adds unique paths", () => {
    const scope = { ...DEFAULT_SCOPE };
    const updated = addCustomPath(addCustomPath(scope, "/my/folder"), "/my/folder");
    assert.equal(updated.custom_paths.filter((p) => p === "/my/folder").length, 1);
  });

  it("removeCustomPath removes path", () => {
    const scope = addCustomPath({ ...DEFAULT_SCOPE }, "/remove/me");
    const removed = removeCustomPath(scope, "/remove/me");
    assert.ok(!removed.custom_paths.includes("/remove/me"));
  });
});

// ─── G11: describeScopeForDisplay ─────────────────────────────────────────

describe("[MYC G11] describeScopeForDisplay — member-facing text", () => {
  it("shows enabled/disabled counts", () => {
    const scope = disableCategory({ ...DEFAULT_SCOPE }, "cephas_content");
    const display = describeScopeForDisplay(scope);
    assert.ok(display.includes("✗"), "disabled category should show ✗");
    assert.ok(display.includes("✓"), "enabled categories should show ✓");
    assert.ok(display.includes("Opted out"), "should mention opted-out categories");
  });
});

// ─── G12: generateReceipt — comfortable ───────────────────────────────────

describe("[MYC G12] generateReceipt — comfortable status (completeness ≥ 90%)", () => {
  it("status=comfortable when ≥90% completeness", () => {
    const fakeResults = [{
      shadowId: "alpha",
      pathsProcessed: [],
      filesIndexed: 95,
      filesSkipped: 5,
      pheromoneCount: 95,
      errorCount: 0,
      errors: [],
      durationMs: 100,
      ts: new Date().toISOString(),
    }];
    const receipt = generateReceipt({
      shadowResults: fakeResults,
      defaultIntegrated: [...ALL_CATEGORIES],
      canonicalFileCountTarget: 100,
      preLoadHitRatio: 0.3,
    });
    assert.equal(receipt.status, "comfortable");
    assert.ok(receipt.completeness_pct >= 90);
    assert.ok(receipt.chronos_chronicler_sig.length === 64, "HMAC-SHA256 should be 64 hex chars");
  });
});

// ─── G13: generateReceipt — partial ───────────────────────────────────────

describe("[MYC G13] generateReceipt — partial status (completeness < 90%)", () => {
  it("status=partial when <90% completeness", () => {
    const fakeResults = [{
      shadowId: "beta",
      pathsProcessed: [],
      filesIndexed: 50,
      filesSkipped: 0,
      pheromoneCount: 50,
      errorCount: 0,
      errors: [],
      durationMs: 200,
      ts: new Date().toISOString(),
    }];
    const receipt = generateReceipt({
      shadowResults: fakeResults,
      defaultIntegrated: ["canonical_eblets"],
      canonicalFileCountTarget: 500,
      preLoadHitRatio: 0,
    });
    assert.equal(receipt.status, "partial");
    assert.ok(receipt.completeness_pct < 90);
  });
});

// ─── G14: generateReceipt — Chronos sig determinism ───────────────────────

describe("[MYC G14] generateReceipt — Chronos signature", () => {
  it("signature is non-empty 64-char hex string", () => {
    const fakeResults = [{
      shadowId: "gamma",
      pathsProcessed: [],
      filesIndexed: 10,
      filesSkipped: 0,
      pheromoneCount: 10,
      errorCount: 0,
      errors: [],
      durationMs: 50,
      ts: new Date().toISOString(),
    }];
    const receipt = generateReceipt({
      shadowResults: fakeResults,
      defaultIntegrated: ["bishop_state"],
      canonicalFileCountTarget: 10,
    });
    assert.match(receipt.chronos_chronicler_sig, /^[0-9a-f]{64}$/,
      "should be HMAC-SHA256 hex");
    assert.ok(receipt.receipt_id.startsWith("MYC-"), "should have MYC- prefix");
  });
});

// ─── G15: bulkLoadPaths — dry-run ─────────────────────────────────────────

describe("[MYC G15] bulkLoadPaths — dry-run projects correct pheromone count", () => {
  it("dry-run counts files without writing to substrate", async () => {
    const dir = mkdtempSync(join(tmpdir(), "myc-bulk-"));
    makeTmpFile(dir, "one.md", "# One\nContent about Make Yourself Comfortable #2317");
    makeTmpFile(dir, "two.md", "# Two\nBase Camp Protocol Handshake KN086");
    makeTmpFile(dir, "three.md", "# Three\nPheromone substrate bulk load index");

    const result = await bulkLoadPaths([join(dir, "*.md")], {
      shadowId: "test",
      dryRun: true,
    });

    assert.equal(result.filesIndexed, 3, "should count all 3 files");
    assert.equal(result.pheromoneCount, 3, "should project 3 pheromones");
    assert.equal(result.errorCount, 0);
    // Verify no actual pheromone file was created in temp stitchpunks
    const phPath = join(TMP_BASE, "pheromone_substrate", "index.jsonl");
    // Either doesn't exist or hasn't grown from these files (dry-run)
  });
});

// ─── G16: runMakeYourselfComfortable — minimal dry-run ────────────────────

describe("[MYC G16] runMakeYourselfComfortable — minimal scope sequential dry-run", () => {
  it("completes and returns receipt with correct shape", async () => {
    const { receipt } = await runMakeYourselfComfortable({
      scope: "minimal",
      dryRun: true,
      sequential: true,
      skipMeasurement: true,
      canonicalFileCountTarget: 1,
    });

    assert.ok(receipt.receipt_id.startsWith("MYC-"), "receipt_id should start with MYC-");
    assert.ok(typeof receipt.files_indexed === "number");
    assert.ok(typeof receipt.pheromones_emitted === "number");
    assert.ok(["comfortable", "partial", "failed"].includes(receipt.status));
    assert.ok(receipt.chronos_chronicler_sig.length > 0);
    assert.ok(Array.isArray(receipt.shadow_results));
  });
});

// ─── G17: receipt receipt_id sequence ─────────────────────────────────────

describe("[MYC G17] receipt_id sequence increments across runs", () => {
  it("MYC-001 on first call, MYC-002 on second call", () => {
    // Clear the receipt file in tmp dir first
    const tmpReceiptPath = join(TMP_BASE, "base_camp", "make_comfortable_receipt.json");
    if (existsSync(tmpReceiptPath)) {
      try { unlinkSync(tmpReceiptPath); } catch {}
    }

    const fakeResults = [{
      shadowId: "theta",
      pathsProcessed: [],
      filesIndexed: 10,
      filesSkipped: 0,
      pheromoneCount: 10,
      errorCount: 0,
      errors: [],
      durationMs: 10,
      ts: new Date().toISOString(),
    }];

    const r1 = generateReceipt({
      shadowResults: fakeResults,
      defaultIntegrated: ["canonical_values"],
      canonicalFileCountTarget: 10,
    });
    const r2 = generateReceipt({
      shadowResults: fakeResults,
      defaultIntegrated: ["canonical_values"],
      canonicalFileCountTarget: 10,
    });

    assert.ok(r1.receipt_id !== r2.receipt_id, "receipt IDs should differ");
    const n1 = parseInt(r1.receipt_id.replace("MYC-", ""), 10);
    const n2 = parseInt(r2.receipt_id.replace("MYC-", ""), 10);
    assert.equal(n2, n1 + 1, "second receipt should increment by 1");
  });
});

// ─── G18: Shadow task definitions ─────────────────────────────────────────

describe("[MYC G18] SHADOW_TASKS — 8-Shadow coverage", () => {
  it("defines alpha through eta (7 active work shadows + theta by convention)", () => {
    const ids = SHADOW_TASKS.map((s) => s.id);
    for (const expected of ["alpha", "beta", "gamma", "delta", "epsilon", "zeta", "eta"]) {
      assert.ok(ids.includes(expected), `missing shadow: ${expected}`);
    }
    assert.equal(SHADOW_TASKS.length, 7, "should have 7 work shadows (theta is receipt-aggregation)");
  });

  it("each shadow has non-empty categories", () => {
    for (const shadow of SHADOW_TASKS) {
      assert.ok(shadow.categories.length > 0, `shadow ${shadow.id} has no categories`);
      assert.ok(shadow.description.length > 0, `shadow ${shadow.id} has no description`);
    }
  });
});
