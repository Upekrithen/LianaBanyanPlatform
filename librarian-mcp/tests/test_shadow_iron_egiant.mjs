/**
 * test_shadow_iron_egiant.mjs — KN090 / BP011 Pod W Bean 2
 * =========================================================
 * Shadow → Iron E-Giant Promotion integration tests.
 *
 * 4 tests (BRIDLE v11 load-bearing):
 *   T1. Single-Shadow promotion — spawn Shadow alpha, verify Handshake
 *       completes, write authority works, scribe-id assigned correctly.
 *   T2. Multi-Shadow promotion — promote all 8; verify no scribe-id conflicts;
 *       each gets correct LIGHTHOUSE position.
 *   T3. Continuous lifecycle (LOAD-BEARING) — spawn Shadow; trigger synthetic
 *       Bishop refresh; verify Shadow continues running; verify new Bishop reads
 *       heartbeat + checkpoint; verify re-attach completes.
 *   T4. Federation-readiness — synthetic 2-member case: Member-A Shadow writes
 *       to shared Iron Tablet; Member-B Shadow reads; entries are visible across
 *       scribe boundary.
 *
 * Run: node --test tests/test_shadow_iron_egiant.mjs
 *
 * These tests invoke Python subprocesses; Python 3.9+ required in PATH.
 * The tests are integration-level: they spawn `python -c "..."` snippets that
 * import from the_shadow package and assert invariants.
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  existsSync,
  readFileSync,
  readdirSync,
  appendFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync, execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(__dirname, "..", "..");
const THE_SHADOW = resolve(WORKSPACE_ROOT, "the_shadow");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function python(code, { cwd = WORKSPACE_ROOT, env = {}, timeout = 60000 } = {}) {
  const result = spawnSync(
    "python",
    ["-c", code],
    {
      cwd,
      encoding: "utf-8",
      timeout,
      env: { ...process.env, PYTHONPATH: WORKSPACE_ROOT, ...env },
    }
  );
  return result;
}

function assertPythonSuccess(result, context = "") {
  const msg = context
    ? `${context}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
    : `stdout: ${result.stdout}\nstderr: ${result.stderr}`;
  assert.strictEqual(result.status, 0, `Python exited ${result.status}: ${msg}`);
  assert.equal(result.error, undefined, `Spawn error: ${result.error}`);
}

let TMP_DIR;

before(() => {
  TMP_DIR = mkdtempSync(join(tmpdir(), "kn090-shadow-iron-egiant-"));
  mkdirSync(TMP_DIR, { recursive: true });
});

after(() => {
  try {
    rmSync(TMP_DIR, { recursive: true, force: true });
  } catch {
    // Windows file-lock; best effort
  }
});

// ─── T1: Single-Shadow promotion ─────────────────────────────────────────────

test("T1: single-Shadow promotion — alpha spawns, Handshake runs, write authority works", async () => {
  const ebletRoot = join(TMP_DIR, "t1_eblet_root");
  mkdirSync(ebletRoot, { recursive: true });

  const code = `
import sys, os, json, pathlib
sys.path.insert(0, r"${WORKSPACE_ROOT.replace(/\\/g, "\\\\")}")

from the_shadow.iron_tablet_attach import IronTabletAttach, WriteAuthority
from the_shadow.handshake_invoker import run_full_handshake
from the_shadow.iron_egiant_promotion import LIGHTHOUSE_POSITIONS, SCRIBE_IDS

# 1. Verify scribe-id convention
assert SCRIBE_IDS[0] == "R11_shadow_alpha", f"Expected R11_shadow_alpha, got {SCRIBE_IDS[0]}"
assert SCRIBE_IDS[7] == "R11_shadow_theta", f"Expected R11_shadow_theta, got {SCRIBE_IDS[7]}"
assert len(SCRIBE_IDS) == 8, f"Expected 8 scribe-ids, got {len(SCRIBE_IDS)}"

# 2. Verify LIGHTHOUSE positions
assert LIGHTHOUSE_POSITIONS[0] == "alpha"
assert LIGHTHOUSE_POSITIONS[7] == "theta"

# 3. Handshake invocation (dry-run — no workspace changes)
receipt = run_full_handshake("R11_shadow_alpha", 1, session_id="KN090_T1", dry_run=True)
assert receipt.scribe_id == "R11_shadow_alpha"
assert receipt.lighthouse_position == 1
assert receipt.session_id == "KN090_T1"
assert len(receipt.phases) == 5, f"Expected 5 phases, got {len(receipt.phases)}"
for p in receipt.phases:
    assert p.status in ("pass", "skip"), f"Phase {p.phase} unexpected status: {p.status}"

# 4. Iron Tablet write authority — canonical eblet OK
eblet_path = pathlib.Path(r"${ebletRoot.replace(/\\/g, "\\\\")}") / "shadow_alpha_test.eblet.md"
attach = IronTabletAttach("R11_shadow_alpha", session="KN090_T1")
result = attach.write(eblet_path, "test content alpha", scope=WriteAuthority.CANONICAL_EBLET)
assert result.stone_receipt.scribe_id == "R11_shadow_alpha"
assert result.stone_receipt.sequence == 1
assert result.eblet_hash, "Expected non-empty hash"
assert eblet_path.exists(), "Eblet file not written"

# 5. Iron Tablet write authority — cathedral export denied
import traceback as _tb
try:
    attach.write(eblet_path, "test2", scope=WriteAuthority.CATHEDRAL_EXPORT)
    assert False, "Expected PermissionError for cathedral_export"
except PermissionError as e:
    assert "NOT permitted" in str(e), f"Wrong error message: {e}"

print("T1: PASS")
`;

  const result = python(code);
  assertPythonSuccess(result, "T1 single-Shadow promotion");
  assert.match(result.stdout, /T1: PASS/, "T1 did not print PASS");
});

// ─── T2: Multi-Shadow promotion — all 8 scribe-ids no conflicts ───────────────

test("T2: multi-Shadow promotion — all 8 scribe-ids unique, correct LIGHTHOUSE positions", async () => {
  const ebletRoot = join(TMP_DIR, "t2_eblet_root");
  mkdirSync(ebletRoot, { recursive: true });

  const code = `
import sys, pathlib, json
sys.path.insert(0, r"${WORKSPACE_ROOT.replace(/\\/g, "\\\\")}")

from the_shadow.iron_egiant_promotion import (
    LIGHTHOUSE_POSITIONS, SCRIBE_IDS, promote_all
)

# 1. Verify uniqueness of all scribe-ids
assert len(set(SCRIBE_IDS)) == 8, f"Duplicate scribe-ids: {SCRIBE_IDS}"
assert len(SCRIBE_IDS) == 8

# 2. Verify Greek-letter convention
expected = [
    "R11_shadow_alpha", "R11_shadow_beta", "R11_shadow_gamma",
    "R11_shadow_delta", "R11_shadow_epsilon", "R11_shadow_zeta",
    "R11_shadow_eta", "R11_shadow_theta"
]
for i, (got, exp) in enumerate(zip(SCRIBE_IDS, expected)):
    assert got == exp, f"Position {i+1}: expected {exp}, got {got}"

# 3. Promote all 8 (dry-run; no lifecycle; no file writes outside eblet root)
results = promote_all(
    session_id="KN090_T2",
    dry_run=True,
    start_lifecycle=False,
)
assert len(results) == 8, f"Expected 8 results, got {len(results)}"

scribe_ids_seen = set()
for i, r in enumerate(results):
    position = i + 1
    assert r.lighthouse_position == position, (
        f"Position mismatch: expected {position}, got {r.lighthouse_position}"
    )
    assert r.scribe_id not in scribe_ids_seen, f"Duplicate scribe-id: {r.scribe_id}"
    scribe_ids_seen.add(r.scribe_id)
    assert r.scribe_id == f"R11_shadow_{LIGHTHOUSE_POSITIONS[i]}", (
        f"Scribe-id mismatch at position {position}: {r.scribe_id}"
    )

assert scribe_ids_seen == set(SCRIBE_IDS), f"Missing scribe-ids: {set(SCRIBE_IDS) - scribe_ids_seen}"
print("T2: PASS")
`;

  const result = python(code, { timeout: 180000 });
  assertPythonSuccess(result, "T2 multi-Shadow promotion");
  assert.match(result.stdout, /T2: PASS/, "T2 did not print PASS");
});

// ─── T3: Continuous lifecycle (LOAD-BEARING) ─────────────────────────────────

test("T3: continuous lifecycle — Shadow survives synthetic Bishop refresh, re-attaches", async () => {
  const ebletRoot = join(TMP_DIR, "t3_eblet_root");
  mkdirSync(ebletRoot, { recursive: true });

  const code = `
import sys, time, pathlib, json
sys.path.insert(0, r"${WORKSPACE_ROOT.replace(/\\/g, "\\\\")}")

from the_shadow.lifecycle import ShadowLifecycle
from the_shadow.iron_tablet_attach import IronTabletAttach

eblet_root = pathlib.Path(r"${ebletRoot.replace(/\\/g, "\\\\")}")

# 1. Spawn Shadow beta lifecycle (fast heartbeat for test)
lc = ShadowLifecycle(
    scribe_id="R11_shadow_beta",
    lighthouse_position=2,
    session_id="KN090_T3",
    heartbeat_interval_s=1,       # 1s for test speed
    bishop_check_interval_s=1,    # 1s for test speed
    eblet_root=eblet_root,
)
lc.start()
assert lc.is_alive(), "Lifecycle should be alive after start()"

# 2. Wait for first heartbeat
for _ in range(30):
    heartbeat = lc.read_heartbeat()
    if heartbeat:
        break
    time.sleep(0.2)
assert heartbeat is not None, "Heartbeat not written within 6s"
assert "R11_shadow_beta" in heartbeat, f"scribe_id not in heartbeat: {heartbeat}"
assert "KN090_T3" in heartbeat, f"session not in heartbeat: {heartbeat}"

# 3. Trigger synthetic Bishop refresh
lc.simulate_bishop_refresh("bishop_prime_KN090_T3_session2")
# Wait for monitor to detect the refresh
for _ in range(30):
    state = lc.get_state()
    if state.reattach_count >= 1:
        break
    time.sleep(0.2)

state = lc.get_state()
assert state.reattach_count >= 1, (
    f"Expected reattach_count >= 1, got {state.reattach_count}"
)
assert "bishop_prime_KN090_T3_session2" in state.bishop_session_ids_seen, (
    f"New Bishop session not recorded: {state.bishop_session_ids_seen}"
)
# Allow a brief settle for the checkpoint file to be fully flushed to disk
time.sleep(0.3)

# 4. Verify Shadow is STILL running (continuous-organism: survives refresh)
assert lc.is_alive(), "Shadow should still be alive after Bishop refresh"

# 5. Verify checkpoint was written
checkpoint_files = list(eblet_root.glob("checkpoint_R11_shadow_beta_*.eblet.md"))
assert len(checkpoint_files) >= 1, f"No checkpoint file found in {eblet_root}"
checkpoint_content = checkpoint_files[0].read_text(encoding="utf-8")
assert "R11_shadow_beta" in checkpoint_content
assert "reattach_count" in checkpoint_content

# 6. New Bishop reads heartbeat (re-attach simulation)
attach_new_bishop = IronTabletAttach("bishop_prime_KN090_T3_session2", session="KN090_T3")
heartbeat_read = attach_new_bishop.read(lc.heartbeat_path)
assert heartbeat_read is not None, "New Bishop cannot read heartbeat eblet"
assert "R11_shadow_beta" in heartbeat_read.content

# 7. Stop lifecycle gracefully
lc.stop()
lc.wait_for_stop(timeout=5.0)
assert not lc.is_alive(), "Lifecycle should be stopped"

print("T3: PASS")
`;

  const result = python(code, { timeout: 60000 });
  assertPythonSuccess(result, "T3 continuous lifecycle");
  assert.match(result.stdout, /T3: PASS/, "T3 did not print PASS");
});

// ─── T4: Federation-readiness ─────────────────────────────────────────────────

test("T4: federation-readiness — Member-A Shadow writes, Member-B Shadow reads via shared Iron Tablet", async () => {
  const sharedRoot = join(TMP_DIR, "t4_federation_shared");
  mkdirSync(sharedRoot, { recursive: true });

  const code = `
import sys, pathlib
sys.path.insert(0, r"${WORKSPACE_ROOT.replace(/\\/g, "\\\\")}")

from the_shadow.iron_tablet_attach import IronTabletAttach, WriteAuthority

shared_root = pathlib.Path(r"${sharedRoot.replace(/\\/g, "\\\\")}")
shared_eblet = shared_root / "federation_test.eblet.md"

# Member-A: Shadow gamma writes to shared eblet
attach_a = IronTabletAttach("R11_shadow_gamma", session="KN090_T4_memberA")
result_a = attach_a.write(
    shared_eblet,
    "Member-A cooperative content: help each other help ourselves",
    decision_id="federation_test_a",
    scope=WriteAuthority.CROSS_ORG_IRON_TABLET,
)
assert result_a.stone_receipt.scribe_id == "R11_shadow_gamma"
assert result_a.stone_receipt.sequence == 1
assert result_a.conflict is None, f"Unexpected conflict: {result_a.conflict}"

# Member-B: Shadow delta reads from same eblet path
attach_b = IronTabletAttach("R11_shadow_delta", session="KN090_T4_memberB")
read_b = attach_b.read(shared_eblet)
assert read_b is not None, "Member-B cannot read Member-A's eblet"
assert "help each other help ourselves" in read_b.content
# Provenance chain shows Member-A wrote it
assert any(r.scribe_id == "R11_shadow_gamma" for r in read_b.stone_provenance), (
    f"Member-A not in provenance chain: {[r.scribe_id for r in read_b.stone_provenance]}"
)

# Member-B writes a reply to the same eblet (cross-org Iron Tablet)
result_b = attach_b.write(
    shared_eblet,
    "Member-B cooperative reply: acknowledged and forwarding",
    decision_id="federation_test_b",
    scope=WriteAuthority.CROSS_ORG_IRON_TABLET,
)
assert result_b.stone_receipt.scribe_id == "R11_shadow_delta"
assert result_b.stone_receipt.sequence == 2, (
    f"Expected sequence=2, got {result_b.stone_receipt.sequence}"
)

# Member-A reads the full provenance chain: both entries present
prov = attach_a.provenance_chain(shared_eblet)
assert len(prov) == 2, f"Expected 2 provenance entries, got {len(prov)}"
assert prov[0].scribe_id == "R11_shadow_gamma"
assert prov[1].scribe_id == "R11_shadow_delta"

# Verify eblet content-addressed last-write-wins: current content = Member-B's
read_final = attach_a.read(shared_eblet)
assert "Member-B cooperative reply" in read_final.content, (
    f"Expected Member-B content, got: {read_final.content}"
)

print("T4: PASS")
`;

  const result = python(code, { timeout: 30000 });
  assertPythonSuccess(result, "T4 federation-readiness");
  assert.match(result.stdout, /T4: PASS/, "T4 did not print PASS");
});
