/**
 * BP028 — AutoBaton routing + MAD row shape (no live API calls).
 */
import { mkdirSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import test, { after } from "node:test";
import assert from "node:assert";

const scratch = join(tmpdir(), `mad-test-${Date.now()}`);
mkdirSync(scratch, { recursive: true });
process.env.LB_SESSION_DIR = scratch;

const mod = await import("../dist/autobaton_dispatch.js");

test("planRouteForTaskClass matches BP028 matrix", () => {
  assert.strictEqual(
    mod.planRouteForTaskClass("synthesis").model,
    "claude-haiku-4-5-20251001",
  );
  assert.strictEqual(mod.planRouteForTaskClass("coordination").model, "claude-sonnet-4-6");
  assert.strictEqual(mod.planRouteForTaskClass("edit_precision").model, "claude-sonnet-4-6");
  assert.strictEqual(mod.planRouteForTaskClass("flagship_deliberation").model, "claude-opus-4-7");
  assert.strictEqual(mod.planRouteForTaskClass("research_external").kind, "pawn");
  assert.strictEqual(mod.planRouteForTaskClass("cross_domain_synthesis").kind, "rook");
  assert.strictEqual(
    mod.planRouteForTaskClass("cross_domain_synthesis").model,
    "gemini-3.1-pro-preview",
  );
});

test("inferTaskClassFromPrompt heuristic", () => {
  assert.strictEqual(mod.inferTaskClassFromPrompt("web search for today's news"), "research_external");
  assert.strictEqual(
    mod.inferTaskClassFromPrompt("cross-domain synthesis of patent and code"),
    "cross_domain_synthesis",
  );
  assert.strictEqual(
    mod.inferTaskClassFromPrompt("short coordinate the meeting times"),
    "coordination",
  );
});

test("autobatonDispatch dry-run appends MAD row", async () => {
  await mod.autobatonDispatch({
    prompt: "hello world",
      task_class: "synthesis",
      session_id: "TEST_BP028",
      execute: false,
      substrate_context_loaded: true,
      substrate_eblets_pre_injected: ["BP028"],
    });
  const raw = readFileSync(join(scratch, "mad_data.jsonl"), "utf-8").trim();
  const row = JSON.parse(raw.split("\n").pop() ?? "{}");
  assert.strictEqual(row.task_class, "synthesis");
  assert.strictEqual(row.model_routed, "claude-haiku-4-5-20251001");
  assert.strictEqual(row.substrate_context_loaded, true);
  assert.deepStrictEqual(row.substrate_eblets_pre_injected, ["BP028"]);
  assert.strictEqual(row.founder_grade, null);
  assert.ok(typeof row.dispatch_id === "string");
  assert.ok(typeof row.duration_ms === "number");
});

test("blind strip removes model ids", () => {
  const s = mod.stripModelIdentifiersForBlindGrade("Use claude-sonnet-4-6 and gemini-3.1-pro-preview");
  assert.ok(!s.includes("claude-"));
  assert.ok(s.includes("[model]"));
});

after(() => {
  try {
    rmSync(scratch, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});
