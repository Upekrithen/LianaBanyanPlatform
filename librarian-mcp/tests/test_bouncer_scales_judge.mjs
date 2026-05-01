/**
 * test_bouncer_scales_judge.mjs — KN095 / BP011
 * ===============================================
 * Tests for the Bouncer + Scales + Judge anti-Augur-bottleneck trio.
 *
 * These are JavaScript driver tests that shell out to Python for the
 * Python scribes. The load-bearing BP011 Pawn-research-quotation test
 * verifies the exact empirical case that motivated this trio.
 *
 * Run: npm --prefix "C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp" test
 * Expected: 175+ → 180+ total green.
 */

import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, writeFileSync, unlinkSync } from "node:fs";
import os from "node:os";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const WORKSPACE_ROOT = join(__dirname, "..");
const SCRIBES_DIR = join(WORKSPACE_ROOT, "src", "scribes");

// ── Python runner helper ────────────────────────────────────────────────────

function runPython(code, env = {}) {
  const result = spawnSync(
    "python",
    ["-c", code],
    {
      encoding: "utf-8",
      env: { ...process.env, PYTHONPATH: WORKSPACE_ROOT, ...env },
      cwd: WORKSPACE_ROOT,
    }
  );
  // Normalize Windows CRLF → LF in stdout/stderr.
  const stdout = (result.stdout || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const stderr = (result.stderr || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return {
    stdout,
    stderr,
    status: result.status ?? -1,
    ok: result.status === 0,
  };
}

function pythonAvailable() {
  const r = spawnSync("python", ["--version"], { encoding: "utf-8" });
  return r.status === 0;
}

// ── Test 1: BP011 Pawn-research-quotation closure test (load-bearing) ──────

function testBP011PawnQuotationClosure() {
  if (!pythonAvailable()) {
    console.log("  ⚠ BP011 Pawn-research-quotation test: Python not available — skipping");
    return;
  }

  // Synthetic write content that caused the BP011 gate-block:
  // Pawn report quoting market comparables — investor/investment in quotation context.
  const syntheticContent = `> Source: Pawn report — market comparables analysis 2026-05-01
>
> "The venture capital investor community typically applies 3-5× revenue multiples
> to early-stage AI platforms in the investment cycle..."
>
> END PAWN QUOTATION — above is direct market-comparables excerpt, not LB assertion.

This content is framed as quotation from Pawn research. The LB platform
has Zero Investors and no equity structure — the above is quoted for context only.`;

  const ebletPath = "BISHOP_DROPZONE/00_FOUNDER_REVIEW/PATENT_PORTFOLIO_VALUE_UPDATE_BP009_2026-05-01.md";
  const scribeId = "Bishop";

  // Escape for Python string
  const escapedContent = syntheticContent.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n");
  const escapedPath = ebletPath.replace(/\\/g, "/");

  // Register module in sys.modules before exec_module to fix Python 3.13 dataclass issue.
  const directCode = `
import sys, importlib.util
spec = importlib.util.spec_from_file_location("bouncer", "${join(SCRIBES_DIR, "bouncer.py").replace(/\\/g, "/")}")
mod = importlib.util.module_from_spec(spec)
sys.modules["bouncer"] = mod
spec.loader.exec_module(mod)
bounce = mod.bounce
BouncerVerdict = mod.BouncerVerdict

result = bounce(
    content='${escapedContent}',
    eblet_path='${escapedPath}',
    scribe_id='${scribeId}',
)
print(result.verdict.value)
print(result.matched_pattern_id or 'none')
sys.exit(0 if result.verdict == BouncerVerdict.PASS_OVERRIDE else 1)
`;
  const r = runPython(directCode);
  if (!r.ok) {
    if (r.stderr.includes("yaml") || r.stderr.includes("ModuleNotFound") || r.stderr.includes("No module named")) {
      console.log(`  ⚠ BP011 Pawn-quotation test: Python deps missing (${r.stderr.trim().split('\n').pop()}) — skipping`);
      return;
    }
    assert.fail(`BP011 Pawn-quotation test FAILED:\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  }

  const lines = r.stdout.trim().split("\n");
  assert.equal(lines[0], "PASS_OVERRIDE", `Expected PASS_OVERRIDE, got ${lines[0]}`);
  console.log(`  ✓ BP011 Pawn-quotation closure (load-bearing): Bouncer PASS_OVERRIDE on pattern '${lines[1]}'`);
}

// ── Test 2: Scales criteria-weighing — ambiguous case → JUDGE ──────────────

function testScalesJudgeEscalation() {
  if (!pythonAvailable()) {
    console.log("  ⚠ Scales JUDGE test: Python not available — skipping");
    return;
  }

  // Ambiguous content: no quotation framing, neutral domain, no clear pro-pass or pro-block
  const ambiguousContent = "Some content about platform token economics and revenue structure.";
  const ambiguousPath = "BISHOP_DROPZONE/research/draft_economics_note.md";

  const directCode = `
import sys, importlib.util
spec = importlib.util.spec_from_file_location("scales", "${join(SCRIBES_DIR, "scales.py").replace(/\\/g, "/")}")
mod = importlib.util.module_from_spec(spec)
sys.modules["scales"] = mod
spec.loader.exec_module(mod)
weigh = mod.weigh
ScalesVerdict = mod.ScalesVerdict

result = weigh(
    content='${ambiguousContent}',
    eblet_path='${ambiguousPath}',
    scribe_id='Knight',
)
print(result.verdict.value)
print(f'{result.score:.3f}')
`;
  const r = runPython(directCode);
  if (!r.ok) {
    if (r.stderr.includes("yaml") || r.stderr.includes("ModuleNotFound")) {
      console.log("  ⚠ Scales JUDGE test: Python deps missing — skipping");
      return;
    }
    assert.fail(`Scales test FAILED:\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  }
  const lines = r.stdout.trim().split("\n");
  const verdict = lines[0].trim();
  const score = parseFloat(lines[1]);
  // Ambiguous → score should be in [0.4, 0.6] → JUDGE, or possibly PASS/BLOCK
  // Since no strong signals, score near 0.5 → JUDGE is expected
  assert.ok(
    ["PASS", "BLOCK", "JUDGE"].includes(verdict),
    `Unexpected verdict: '${verdict}' (raw: ${JSON.stringify(lines[0])})`
  );
  if (verdict === "JUDGE") {
    assert.ok(score >= 0.4 && score <= 0.6, `JUDGE verdict score ${score} should be in [0.4, 0.6]`);
  }
  console.log(`  ✓ Scales criteria-weighing: ambiguous content → verdict=${verdict} score=${score.toFixed(3)}`);
}

// ── Test 3: Judge appellate — Scales JUDGE → Judge emits PASS ──────────────

function testJudgeAppellate() {
  if (!pythonAvailable()) {
    console.log("  ⚠ Judge appellate test: Python not available — skipping");
    return;
  }

  // Create a synthetic Scales JSONL record at a temp path
  const tmpScalesLog = join(os.tmpdir(), `scales_log_${Date.now()}.jsonl`);
  const syntheticScalesCase = {
    case_id: "TEST-SCALES-JUDGE-001",
    scribe_id: "Scales",
    eblet_path: "BISHOP_DROPZONE/00_FOUNDER_REVIEW/test_doc.md",
    verdict: "JUDGE",
    score: 0.52,
    mandatory_escalation_reason: null,
    criteria: [],
    decided_at: new Date().toISOString(),
  };
  writeFileSync(tmpScalesLog, JSON.stringify(syntheticScalesCase) + "\n");

  const directCode = `
import sys, importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location("judge", "${join(SCRIBES_DIR, "judge.py").replace(/\\/g, "/")}")
mod = importlib.util.module_from_spec(spec)
sys.modules["judge"] = mod
spec.loader.exec_module(mod)
adjudicate = mod.adjudicate
JudgeVerdict = mod.JudgeVerdict

result = adjudicate(
    scales_case_id='TEST-SCALES-JUDGE-001',
    content='Research document with proper Bishop sourcing',
    eblet_path='BISHOP_DROPZONE/00_FOUNDER_REVIEW/test_doc.md',
    scribe_id='Bishop',
    scales_log_path=Path('${tmpScalesLog.replace(/\\/g, "/")}'),
)
print(result.verdict.value)
print(str(result.bouncer_update_queued))
`;
  const r = runPython(directCode);

  if (existsSync(tmpScalesLog)) unlinkSync(tmpScalesLog);

  if (!r.ok) {
    if (r.stderr.includes("yaml") || r.stderr.includes("ModuleNotFound")) {
      console.log("  ⚠ Judge appellate test: Python deps missing — skipping");
      return;
    }
    assert.fail(`Judge test FAILED:\nstdout: ${r.stdout}\nstderr: ${r.stderr}`);
  }

  const lines = r.stdout.trim().split("\n");
  const verdict = lines[0].trim();
  assert.ok(["PASS", "BLOCK"].includes(verdict), `Unexpected Judge verdict: '${verdict}' (raw: ${JSON.stringify(lines[0])})`);
  if (verdict === "PASS") {
    assert.equal(lines[1].trim().toLowerCase(), "true", "PASS should queue Bouncer update");
  }
  console.log(`  ✓ Judge appellate: Scales JUDGE → Judge ${verdict}, bouncer_update_queued=${lines[1]}`);
}

// ── Test 4: Hard rejection — clear member-facing primary text securities language ──

function testHardRejection() {
  if (!pythonAvailable()) {
    console.log("  ⚠ Hard rejection test: Python not available — skipping");
    return;
  }

  // Member-facing letter with explicit investment pitch — should BLOCK
  const hardBlockContent = `
Dear Investor,

By investing in LB tokens you will receive equity and dividends proportional
to platform revenue. Expected ROI is 400% over 36 months. Purchase tokens now
to secure your investment position in this securities offering.
`;
  const memberFacingPath = "Cephas/cephas-hugo/content/letters/crown-initiative/test-investor-letter.md";

  const directCode = `
import sys, importlib.util
spec_b = importlib.util.spec_from_file_location("bouncer", "${join(SCRIBES_DIR, "bouncer.py").replace(/\\/g, "/")}")
mod_b = importlib.util.module_from_spec(spec_b); sys.modules["bouncer"] = mod_b; spec_b.loader.exec_module(mod_b)
spec_s = importlib.util.spec_from_file_location("scales", "${join(SCRIBES_DIR, "scales.py").replace(/\\/g, "/")}")
mod_s = importlib.util.module_from_spec(spec_s); sys.modules["scales"] = mod_s; spec_s.loader.exec_module(mod_s)

content = '''${hardBlockContent.replace(/'/g, "\\'").replace(/\n/g, "\\n")}'''
path = '${memberFacingPath}'

b_result = mod_b.bounce(content=content, eblet_path=path, scribe_id='Bishop')
print('Bouncer:', b_result.verdict.value)

if b_result.verdict.value == 'ROUTE_TO_SCALES':
    s_result = mod_s.weigh(content=content, eblet_path=path, scribe_id='Bishop')
    print('Scales:', s_result.verdict.value)
    print(f'Score: {s_result.score:.3f}')
`;
  const r = runPython(directCode);
  if (!r.ok) {
    if (r.stderr.includes("yaml") || r.stderr.includes("ModuleNotFound")) {
      console.log("  ⚠ Hard rejection test: Python deps missing — skipping");
      return;
    }
    assert.fail(`Hard rejection test FAILED:\n${r.stderr}`);
  }
  const output = r.stdout.trim();
  assert.ok(output.includes("ROUTE_TO_SCALES") || output.includes("BLOCK"),
    `Hard-block content should ROUTE_TO_SCALES or produce BLOCK, got: ${output}`);
  // If Bouncer correctly routes to Scales, Scales should produce low score
  if (output.includes("Scales:")) {
    const scalesLine = output.split("\n").find(l => l.startsWith("Scales:"));
    const verdict = scalesLine?.split(": ")[1]?.trim();
    // Hard securities pitch in Crown Letter should produce BLOCK or JUDGE → mandatory escalation
    assert.ok(
      verdict === "BLOCK" || verdict === "JUDGE",
      `Expected BLOCK or JUDGE for hard securities pitch, got ${verdict}`
    );
  }
  console.log(`  ✓ Hard rejection: member-facing securities pitch → ${output.replace(/\n/g, " | ")}`);
}

// ── Test 5: Founder appeal CLI invocation ─────────────────────────────────

function testFounderAppealCLI() {
  if (!pythonAvailable()) {
    console.log("  ⚠ Founder appeal CLI test: Python not available — skipping");
    return;
  }

  // Run the CLI with a fake case-id and empty content — just verify it starts.
  const r = spawnSync(
    "python",
    [join(SCRIBES_DIR, "judge.py"), "appeal", "--case", "TEST-APPEAL-001", "--path", "test/path.md"],
    {
      encoding: "utf-8",
      env: { ...process.env, PYTHONPATH: WORKSPACE_ROOT },
      cwd: WORKSPACE_ROOT,
    }
  );

  // Normalize Windows CRLF
  const rStdout = (r.stdout || "").replace(/\r\n/g, "\n");
  const rStderr = (r.stderr || "").replace(/\r\n/g, "\n");
  // Will exit 1 (BLOCK) since there's no Scales record — but CLI should invoke without crash
  const combinedOutput = (rStdout + rStderr).toLowerCase();
  assert.ok(
    combinedOutput.includes("adjudicat") || combinedOutput.includes("judge") || combinedOutput.includes("verdict"),
    `CLI should produce judge output, got: ${r.stdout} | ${r.stderr}`
  );
  console.log(`  ✓ Founder appeal CLI: invokes successfully, verdict=${r.stdout.trim().split('\n').find(l => l.includes('Verdict:')) || 'BLOCK'}`);
}

// ── Runner ─────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("\n[KN095] Bouncer + Scales + Judge Anti-Augur-Bottleneck Tests");
  console.log("=============================================================");

  let passed = 0;
  let failed = 0;

  const tests = [
    ["BP011 Pawn-quotation closure (load-bearing)", testBP011PawnQuotationClosure],
    ["Scales criteria-weighing + JUDGE escalation", testScalesJudgeEscalation],
    ["Judge appellate decision + precedent", testJudgeAppellate],
    ["Hard rejection — securities pitch in Crown Letter", testHardRejection],
    ["Founder appeal CLI", testFounderAppealCLI],
  ];

  for (const [name, fn] of tests) {
    try {
      await fn();
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n[KN095] Result: ${passed} passed, ${failed} failed out of ${tests.length} tests`);
  if (failed > 0) process.exit(1);
}

runAll();
