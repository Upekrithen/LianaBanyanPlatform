"""
MJ Partial Refire — post-expansion SCOPE A empirical receipt.

Runs 33 member_journey questions through lb_cathedral_haiku with
the rebuilt Bloodhound index (post MJ rich-fact expansion).

Architecture Decision D.1 verification: do MJ b-variant questions now score HOT?
Target: MJ >= 85% HOT (up from 75.8% pre-expansion baseline in haiku condition).
"""
from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

_HERE = Path(__file__).parent
_ROOT = _HERE.parent
_ADAPTERS = _ROOT / "r10_cross_vendor"
sys.path.insert(0, str(_ROOT))
sys.path.insert(0, str(_ADAPTERS))
sys.path.insert(0, str(_ADAPTERS / "r11_adapters"))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def _load_sds_env():
    candidates = [
        _ROOT.parent / "Asteroid-ProofVault" / "LockBox" / "SDS.env",
        Path("Asteroid-ProofVault") / "LockBox" / "SDS.env",
    ]
    sds = next((p for p in candidates if p.exists()), None)
    if not sds:
        return
    for line in sds.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, _, v = line.partition("=")
        k, v = k.strip(), v.strip()
        if k and v and not os.environ.get(k):
            os.environ[k] = v


_load_sds_env()

BANK_PATH = _ADAPTERS / "R11v2_QUESTION_BANK_SEALED_K528.json"
RESULTS_DIR = _ADAPTERS / "results_r11v2_K535_v3_max200"
CONSULT_CLI = _ADAPTERS / "consult_scribes_cli.mjs"

GRADE_HOT = "HOT"
GRADE_HIT = "HIT"
GRADE_MISS = "MISS"


def grade_response(response: str, required_elements: list, hit_keywords: list) -> str:
    resp_lower = response.lower()
    if "don't know" in resp_lower or "i do not know" in resp_lower:
        return GRADE_MISS
    matched = sum(1 for e in required_elements if e.lower() in resp_lower)
    threshold = max(1, int(len(required_elements) * 0.6))
    if matched >= threshold:
        return GRADE_HOT
    if any(k.lower() in resp_lower for k in hit_keywords):
        return GRADE_HIT
    return GRADE_MISS


def run_mj_refire():
    from r11_adapters import lb_cathedral_adapter
    from r11_adapters.lb_cathedral_adapter import ConsultClient

    bank = json.load(open(BANK_PATH))
    all_questions = bank["questions"]
    mj_questions = [q for q in all_questions if q["category"] == "member_journey"]
    run_ts = datetime.now(timezone.utc).isoformat()

    print(f"MJ Partial Refire — {len(mj_questions)} member_journey questions")
    print(f"Adapter: lb_cathedral_haiku (max_entries=1000, post-expansion)")
    print(f"Run: {run_ts}")
    print()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set. Load SDS.env first.")
        sys.exit(1)

    # Build R9 corpus text (minimal — adapter expects it)
    corpus_text = ""

    consult_client = ConsultClient(CONSULT_CLI)
    results = []
    total_cost = 0.0
    hot = hit = miss = 0

    try:
        for i, q in enumerate(mj_questions, 1):
            qid = q["id"]
            question = q["question"]
            required = q.get("hot_required_elements", [])
            hit_kw = q.get("hit_keywords", [])
            source_fact_id = q.get("source_fact_id", "?")

            print(f"[{i:02d}/{len(mj_questions)}] {qid} (src={source_fact_id})", flush=True)
            print(f"  Q: {question[:100]}", flush=True)

            try:
                resp_obj, scribes_used = lb_cathedral_adapter.answer(
                    question=question,
                    corpus_text=corpus_text,
                    model="claude-haiku-4-5-20251001",
                    mode="lb_cathedral",
                    consult_client=consult_client,
                )
                answer_text = resp_obj.text
                cost = resp_obj.cost_usd
            except Exception as exc:
                print(f"  ERROR: {exc}", flush=True)
                answer_text = f"[ERROR: {exc}]"
                cost = 0.0
                scribes_used = []

            grade = grade_response(answer_text, required, hit_kw)
            total_cost += cost

            if grade == GRADE_HOT:
                hot += 1
            elif grade == GRADE_HIT:
                hit += 1
            else:
                miss += 1

            print(f"  grade={grade} cost=${cost:.5f}", flush=True)
            print(f"  required: {required}", flush=True)
            if grade != GRADE_HOT:
                print(f"  response: {answer_text[:250].replace(chr(10),' ')}", flush=True)
            print()

            results.append({
                "qid": qid,
                "source_fact_id": source_fact_id,
                "question": question,
                "required_elements": required,
                "grade": grade,
                "cost_usd": cost,
                "scribes_consulted": scribes_used,
                "answer_preview": answer_text[:400],
                "run_at": run_ts,
            })
    finally:
        consult_client.close()

    # Save results
    ts_safe = run_ts.replace(":", "-")[:19]
    out_path = RESULTS_DIR / f"mj_refire_{ts_safe}.jsonl"
    with out_path.open("w", encoding="utf-8") as fh:
        for r in results:
            fh.write(json.dumps(r, ensure_ascii=False) + "\n")

    n = len(mj_questions)
    hot_pct = hot / n * 100
    print("=" * 60)
    print(f"MJ REFIRE RESULTS (post-expansion, lb_cathedral_haiku)")
    print(f"  HOT: {hot}/{n} = {hot_pct:.1f}%  [baseline was 75.8%]")
    print(f"  HIT: {hit}/{n} = {hit/n*100:.1f}%")
    print(f"  MISS: {miss}/{n} = {miss/n*100:.1f}%")
    print(f"  Total cost: ${total_cost:.4f}")
    print(f"  Gate target: MJ >= 85% HOT")
    print(f"  Gate: {'PASS' if hot_pct >= 85.0 else 'FAIL (close-watch)'} ({hot_pct:.1f}%)")
    print(f"  Results: {out_path}")
    print()

    # b-variant breakdown (qids ending in 'b')
    bv = [r for r in results if r["qid"].endswith("b") or r["qid"].endswith("B")]
    if bv:
        bv_hot = sum(1 for r in bv if r["grade"] == GRADE_HOT)
        print(f"  b-variant subset ({len(bv)} Qs): {bv_hot}/{len(bv)} HOT = {bv_hot/len(bv)*100:.1f}%")
        for r in bv:
            print(f"    {r['qid']} (src={r['source_fact_id']}): {r['grade']}")

    print("=" * 60)

    # Summary JSONL
    summary = {
        "run_ts": run_ts,
        "scope": "SCOPE_A_MJ_REFIRE",
        "condition": "lb_cathedral_haiku",
        "n_questions": n,
        "HOT": hot, "HIT": hit, "MISS": miss,
        "hot_pct": round(hot_pct, 2),
        "baseline_hot_pct": 75.8,
        "gate_target_hot_pct": 85.0,
        "gate_passed": hot_pct >= 85.0,
        "total_cost_usd": round(total_cost, 5),
        "call_sign": "v-mj-variant-kp-refinement-K_PENDING",
        "d1_decision": "rich-fact expansion",
        "expansion_session": "K-MJ-Variant",
    }
    summary_path = RESULTS_DIR / f"mj_refire_summary_{ts_safe}.jsonl"
    with summary_path.open("w", encoding="utf-8") as fh:
        fh.write(json.dumps(summary, ensure_ascii=False) + "\n")
    print(f"Summary: {summary_path}")


if __name__ == "__main__":
    run_mj_refire()
