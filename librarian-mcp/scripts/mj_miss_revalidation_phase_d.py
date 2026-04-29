"""
Mini re-run: K-MJ-MJ-02b-Final-MISS Phase D validation.

Re-runs ONLY the 2 MISS cases from the K539 MJ refire with the fixed grader
(required_elements checked BEFORE the dont_know gate).

Questions:
  - R11v2-MJ-07   (Acknowledgment SLA — H2 retrieval miss; grader fix does NOT fix this)
  - R11v2-MJ-02b  (Governance rights withheld — H5 rubric; grader fix SHOULD fix this)

Brick Wall: no corpus changes; no new vendor calls beyond these 2 questions.
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

CONSULT_CLI = _ADAPTERS / "consult_scribes_cli.mjs"
RESULTS_DIR = _ADAPTERS / "results_r11v2_K535_v3_max200"


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

GRADE_HOT = "HOT"
GRADE_HIT = "HIT"
GRADE_MISS = "MISS"


def grade_response_fixed(response: str, required_elements: list, hit_keywords: list) -> str:
    """Fixed grader: required_elements checked BEFORE dont_know gate."""
    resp_lower = response.lower()
    matched = sum(1 for e in required_elements if e.lower() in resp_lower)
    threshold = max(1, int(len(required_elements) * 0.6))
    if matched >= threshold:
        return GRADE_HOT
    if "don't know" in resp_lower or "i do not know" in resp_lower:
        return GRADE_MISS
    if any(k.lower() in resp_lower for k in hit_keywords):
        return GRADE_HIT
    return GRADE_MISS


# The 2 MISS questions from K539 MJ refire
MISS_QUESTIONS = [
    {
        "qid": "R11v2-MJ-07",
        "source_fact_id": "MJ-07",
        "question": "What is the acknowledgment SLA for member inquiries submitted through the official support channel?",
        "required_elements": ["4 business hours"],
        "hit_keywords": ["4 hours", "acknowledgment", "SLA"],
        "category": "member_journey",
    },
    {
        "qid": "R11v2-MJ-02b",
        "source_fact_id": "MJ-02",
        "question": "What governance rights are withheld from a provisional member who has not yet passed the Cooperative Principles Assessment?",
        "required_elements": ["voting rights", "75 out of 100"],
        "hit_keywords": ["vote", "voting", "75", "assessment"],
        "category": "member_journey",
    },
]


def run_miss_revalidation():
    from r11_adapters import lb_cathedral_adapter
    from r11_adapters.lb_cathedral_adapter import ConsultClient

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    consult_client = ConsultClient(CONSULT_CLI)
    run_ts = datetime.now(timezone.utc).isoformat()
    ts_file = run_ts.replace(":", "-").replace(".", "-")[:19]

    results = []
    print(f"K-MJ-02b-Final-MISS Phase D re-validation — {run_ts}")
    print(f"Grader: FIXED (required_elements before dont_know gate)")
    print()

    for q in MISS_QUESTIONS:
        print(f"  Q: {q['qid']} — {q['question'][:60]}...")
        t0 = time.perf_counter()
        adapter_resp, scribes = lb_cathedral_adapter.answer(
            q["question"], "", consult_client=consult_client
        )
        latency = round(time.perf_counter() - t0, 2)
        response = adapter_resp.text
        cost = adapter_resp.cost_usd

        grade_old = GRADE_MISS  # they were MISS in K539
        grade_new = grade_response_fixed(response, q["required_elements"], q["hit_keywords"])

        result = {
            "qid": q["qid"],
            "source_fact_id": q["source_fact_id"],
            "question": q["question"],
            "required_elements": q["required_elements"],
            "grade_k539": grade_old,
            "grade_fixed": grade_new,
            "cost_usd": cost,
            "latency_s": latency,
            "scribes_consulted": scribes,
            "answer_preview": response[:400],
            "run_at": run_ts,
        }
        results.append(result)
        print(f"    Grade K539={grade_old}  Fixed={grade_new}")
        print(f"    Scribes: {scribes}")
        print(f"    Cost: ${cost:.4f}  Latency: {latency}s")
        print()

    out_path = RESULTS_DIR / f"mj_miss_revalidation_{ts_file}.jsonl"
    with out_path.open("w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    hot_fixed = sum(1 for r in results if r["grade_fixed"] == GRADE_HOT)
    print(f"Results written to: {out_path}")
    print(f"Fixed grader: {hot_fixed}/{len(results)} now HOT (was 0/{len(results)})")
    return results


if __name__ == "__main__":
    run_miss_revalidation()
