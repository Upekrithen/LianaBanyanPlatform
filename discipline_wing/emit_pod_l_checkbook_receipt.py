"""
Pod L FIRST live (non-bootstrap) CheckBook Ledger Emitter
BP003 / KN031 Orchestrator

Emits the first real Knight Beanpod CheckBook Receipt for:
  Pod L: KN032 → KN033 → KN034 → KN035

Actual metrics from Phase E commits/tags:
  KN032: 43/43 tests, 8 files, commit 70aae08, tag v-make-chandelier-full-deployment-KN032
  KN033: 30/30 tests, 3 files, commit 670e5e2, tag v-retroactive-lore-harvest-sp8-herald-KN033
  KN034: 17/17 tests, 5 files, commit 8d99584, tag v-anjin-receipt-pack-assembly-KN034
  KN035: 21/21 tests, 8 files, commit 6fe6dc4, tag v-persistent-bishop-sandbox-foundation-KN035

Context estimates (agent-reported):
  Open: ~5% (session start)
  KN032-close: ~20%
  KN033-close: ~45%
  KN034-close: ~72%
  KN035-close: ~85% (final)
"""

import sys
from pathlib import Path

# Add stitchpunks to path
_HERE = Path(__file__).parent.parent
_SP = _HERE / "librarian-mcp" / "stitchpunks"
sys.path.insert(0, str(_SP))

from checkbook.checkbook_orchestrator import CheckBookSession

# ── Bean metadata (actual metrics from Pod L execution) ─────────────────────

BEANS = [
    {
        "bean_id": "KN032",
        "label": "MAKE Chandelier Full Deployment",
        "bean_class": "large",
        "session_position_class": "pod_first",
        "predicted_pp": 18.0,
        "context_start": 5.0,
        "context_end": 20.0,
        "outcome": "landed",
        "files_changed": 8,
        "insertions": 812,
        "tests_passed": 43,
        "tests_total": 43,
        "commit": "70aae08",
        "tag": "v-make-chandelier-full-deployment-KN032",
        "acceptance": "Anjin #7 closed",
    },
    {
        "bean_id": "KN033",
        "label": "Retroactive LORE Harvest SP-8 Herald",
        "bean_class": "medium",
        "session_position_class": "pod_middle",
        "predicted_pp": 15.0,
        "context_start": 20.0,
        "context_end": 45.0,
        "outcome": "landed",
        "files_changed": 3,
        "insertions": 623,
        "tests_passed": 30,
        "tests_total": 30,
        "commit": "670e5e2",
        "tag": "v-retroactive-lore-harvest-sp8-herald-KN033",
        "acceptance": "Anjin #8 closed",
    },
    {
        "bean_id": "KN034",
        "label": "Anjin Receipt Pack Assembly",
        "bean_class": "medium",
        "session_position_class": "pod_middle",
        "predicted_pp": 14.0,
        "context_start": 45.0,
        "context_end": 72.0,
        "outcome": "landed",
        "files_changed": 5,
        "insertions": 490,
        "tests_passed": 17,
        "tests_total": 17,
        "commit": "8d99584",
        "tag": "v-anjin-receipt-pack-assembly-KN034",
        "acceptance": "Anjin #11+#12 closed",
    },
    {
        "bean_id": "KN035",
        "label": "Persistent-Bishop Sandbox Foundation",
        "bean_class": "large",
        "session_position_class": "pod_last",
        "predicted_pp": 15.0,
        "context_start": 72.0,
        "context_end": 85.0,
        "outcome": "landed",
        "files_changed": 8,
        "insertions": 1110,
        "tests_passed": 21,
        "tests_total": 21,
        "commit": "6fe6dc4",
        "tag": "v-persistent-bishop-sandbox-foundation-KN035",
        "acceptance": "OSTRTA foundation #2303",
    },
]

# ── Arm Pod L session ────────────────────────────────────────────────────────

session = CheckBookSession(
    session_id="BP003-L-PodL",
    pod_id="Pod-L",
    bean_sequence=[b["bean_id"] for b in BEANS],
    agent="Knight",
    enable_shutterbug=False,  # Shutterbug screenshots require live cursor env
)

print("[Pod L] Arming CheckBook session...", flush=True)
arm_result = session.arm(context_pct=5.0)
print(f"[Pod L] Arm result: {arm_result.get('status')}", flush=True)

# ── Record each bean ─────────────────────────────────────────────────────────

for b in BEANS:
    print(f"\n[Pod L] START bean {b['bean_id']}: {b['label']}", flush=True)
    session.start_bean(
        bean_id=b["bean_id"],
        context_pct=b["context_start"],
        bean_class=b["bean_class"],
        session_position_class=b["session_position_class"],
        predicted_pp=b["predicted_pp"],
    )

    # Liner note with actual evidence
    session.record_liner_note(
        f"Bean {b['bean_id']} ({b['label']}): "
        f"commit={b['commit']} tag={b['tag']} "
        f"tests={b['tests_passed']}/{b['tests_total']} "
        f"files={b['files_changed']} insertions={b['insertions']} "
        f"acceptance={b['acceptance']}",
        context_pct=b["context_start"],
    )

    # Brainscan for each bean close
    session.record_brainscan(
        slug=f"pod-l-{b['bean_id'].lower()}-close",
        content=(
            f"Phase E closed. Commit {b['commit']}. Tag {b['tag']}. "
            f"{b['tests_passed']}/{b['tests_total']} tests green. "
            f"{b['files_changed']} files | {b['insertions']} insertions. "
            f"Ctx {b['context_start']}% -> {b['context_end']}% "
            f"(+{b['context_end']-b['context_start']:.1f}pp actual). "
            f"Predicted: {b['predicted_pp']}pp. "
            f"Acceptance: {b['acceptance']}."
        ),
        context_pct=b["context_end"],
    )

    print(f"[Pod L] END bean {b['bean_id']} outcome={b['outcome']}", flush=True)
    session.end_bean(
        bean_id=b["bean_id"],
        context_pct=b["context_end"],
        outcome=b["outcome"],
        files_changed=b["files_changed"],
        insertions=b["insertions"],
        tests_passed=b["tests_passed"],
        tests_total=b["tests_total"],
    )

# ── Close and emit Pod L receipt ─────────────────────────────────────────────

print("\n[Pod L] Closing session and emitting FIRST live CheckBook Receipt...", flush=True)
close_result = session.close(context_pct_final=85.0)

receipt = close_result.get("checkbook_receipt", {})
print("\n" + "=" * 60, flush=True)
print("POD L CHECKBOOK RECEIPT — FIRST LIVE BEANPOD LEDGER", flush=True)
print("=" * 60, flush=True)
print(f"Session       : {receipt.get('session_id')}", flush=True)
print(f"Pod           : {receipt.get('pod_id')}", flush=True)
print(f"Beans         : {receipt.get('beans_completed')}", flush=True)
print(f"Deferred      : {receipt.get('beans_deferred')}", flush=True)
print(f"Ctx open      : {receipt.get('context_pct_open')}%", flush=True)
print(f"Ctx close     : {receipt.get('context_pct_close')}%", flush=True)
ctx_open = receipt.get("context_pct_open") or 0.0
ctx_close = receipt.get("context_pct_close") or 0.0
print(f"Ctx consumed  : {ctx_close - ctx_open:.1f}pp", flush=True)
sig = receipt.get("chronos_signature", {})
print(f"Chronos hash  : {sig.get('chronicler_hash', '?')[:16]}...", flush=True)
print(f"Receipt path  : {close_result.get('receipt_path')}", flush=True)
print(f"Scenario      : {receipt.get('pod_summary', {}).get('scenario_verdict', 'unknown (ctx% agent-provided)')}", flush=True)
print("=" * 60, flush=True)

# ── Acceptance closure summary ───────────────────────────────────────────────

print("\nANJIN PHASE 3 ACCEPTANCE CLOSURE:", flush=True)
closures = [
    ("#7",  "KN032", "Chandelier Full Deployment OPERATIONAL — 23/23 primitives, 21 L1 + 12 L2"),
    ("#8",  "KN033", "LORE Harvest complete — 52 FotW+UtH DRAFT entries, 26 moments, 3 corpora"),
    ("#11", "KN034", "CheckBook ledger published — THIS RECEIPT is the FIRST live beanpod ledger"),
    ("#12", "KN034", "Anjin Receipt Pack Chronos-signed — 12/12 GREEN acceptance items"),
]
for acc_id, bean, description in closures:
    print(f"  {acc_id} [{bean}] {description}", flush=True)

print("\nFOR THE KEEP!", flush=True)
