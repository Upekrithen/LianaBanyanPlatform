#!/usr/bin/env python3
"""
SCEV-1 Preliminary Runner — Bishop B116 edition
================================================
Runs the 18-Q SEED question bank against 3 arms × 2 Anthropic models.
Arms: COLD (question only) / HOT-base (+ r9v2_base.md) / HOT-cathedral (+ r9v2_base + Scribe tablets)
Models: claude-haiku-4-5 + claude-opus-4-7
Grading: rubric-based keyword match against `hot_required_elements` per question.
Budget cap: $7 — halts on overrun.
Output: results_scev1_b116_preliminary/
"""

import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from adapters.anthropic_adapter import call as anthropic_call  # noqa: E402

BANK_PATH = SCRIPT_DIR / "SCEV1_QUESTION_BANK_SEED_B116.json"
BASE_PRELOAD_PATH = SCRIPT_DIR.parent.parent / "librarian-mcp-public" / "preload" / "r9v2_base.md"
SCRIBES_DIR = SCRIPT_DIR.parent / "stitchpunks" / "scribes"
OUT_DIR = SCRIPT_DIR / "results_scev1_b116_preliminary"
COST_CAP_USD = 7.00

MODELS = [
    ("anthropic", "claude-haiku-4-5-20251001", "cheap"),
    ("anthropic", "claude-opus-4-7", "premium"),
]
ARMS = ["cold", "hot_base", "hot_cathedral"]

COLD_SYS = "You are a helpful assistant. Answer the user's question to the best of your ability. If you don't know the answer, say so."
HOT_BASE_SYS = "You are the Liana Banyan canonical memory assistant. Answer using ONLY the preload below. If the preload does not contain the answer, say 'I don't know' or flag the gap — do NOT invent facts."
HOT_CATHEDRAL_SYS = "You are the Liana Banyan canonical memory assistant with access to the Scribes Cathedral (domain-indexed working memory). Use the base preload AND the relevant Scribe tablet entries below. If neither contains the answer, say 'I don't know'. Do NOT invent."


def load_cathedral_context() -> str:
    chunks = []
    for p in sorted(SCRIBES_DIR.glob("scribe_*.jsonl")):
        scribe_id = p.stem.replace("scribe_", "")
        entries = []
        for line in p.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            try:
                obj = json.loads(line)
                if obj.get("type") == "header":
                    continue
                entries.append(obj.get("observation", ""))
            except Exception:
                continue
        if entries:
            chunks.append(f"## Scribe {scribe_id} tablet\n\n" + "\n\n".join(f"- {e}" for e in entries))
    return "\n\n---\n\n".join(chunks)


def grade(response_text: str, required_elements: list) -> str:
    """Simple rubric: HOT if all required elements present (case-insensitive substring),
    HIT if half+ present, MISS otherwise."""
    if not required_elements:
        return "ungraded"
    text_lower = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in text_lower)
    if hits == len(required_elements):
        return "HOT"
    if hits >= len(required_elements) / 2:
        return "HIT"
    return "MISS"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]
    base_preload = BASE_PRELOAD_PATH.read_text(encoding="utf-8")
    cathedral_context = load_cathedral_context()

    print(f"SCEV-1 preliminary run starting.")
    print(f"  Questions: {len(questions)}")
    print(f"  Arms: {len(ARMS)} ({', '.join(ARMS)})")
    print(f"  Models: {len(MODELS)}")
    print(f"  Total calls: {len(questions) * len(ARMS) * len(MODELS)}")
    print(f"  Budget cap: ${COST_CAP_USD}")
    print(f"  Preload size: {len(base_preload)} chars")
    print(f"  Cathedral size: {len(cathedral_context)} chars")
    print()

    total_cost = 0.0
    all_results = []

    for vendor, model, tier in MODELS:
        for arm in ARMS:
            per_file = OUT_DIR / f"{model.replace('/', '_')}_{arm}.jsonl"
            with per_file.open("w", encoding="utf-8") as out:
                for q in questions:
                    if total_cost >= COST_CAP_USD:
                        print(f"\n!! BUDGET CAP HIT at ${total_cost:.4f} — halting.")
                        break
                    qid = q["q_id"]
                    question = q["question"]
                    required = q.get("hot_required_elements", [])
                    category = q["category"]
                    source_session = q.get("source_session", "unknown")

                    if arm == "cold":
                        sys_prompt = COLD_SYS
                        user_prompt = question
                    elif arm == "hot_base":
                        sys_prompt = HOT_BASE_SYS + "\n\n--- PRELOAD ---\n\n" + base_preload
                        user_prompt = question
                    else:  # hot_cathedral
                        sys_prompt = HOT_CATHEDRAL_SYS + "\n\n--- PRELOAD ---\n\n" + base_preload + "\n\n--- CATHEDRAL ---\n\n" + cathedral_context
                        user_prompt = question

                    try:
                        resp = anthropic_call(model, sys_prompt, user_prompt)
                        grade_result = grade(resp.text, required)
                        total_cost += resp.cost_usd
                        record = {
                            "qid": qid,
                            "category": category,
                            "source_session": source_session,
                            "model": model,
                            "tier": tier,
                            "arm": arm,
                            "question": question,
                            "required_elements": required,
                            "response_text": resp.text,
                            "grade": grade_result,
                            "cost_usd": resp.cost_usd,
                            "latency_s": resp.latency_s,
                            "input_tokens": resp.input_tokens,
                            "output_tokens": resp.output_tokens,
                        }
                        out.write(json.dumps(record) + "\n")
                        all_results.append(record)
                        print(f"  [{model[:16]:<16}] {arm:<14} {qid} {grade_result:<5} ${resp.cost_usd:.4f} (total ${total_cost:.4f})")
                    except Exception as e:
                        print(f"  [{model[:16]:<16}] {arm:<14} {qid} ERROR: {e}")
                        out.write(json.dumps({"qid": qid, "arm": arm, "model": model, "error": str(e)}) + "\n")
                    time.sleep(0.3)  # light rate limiting
                if total_cost >= COST_CAP_USD:
                    break
        if total_cost >= COST_CAP_USD:
            break

    # Aggregate summary
    summary = {"total_cost_usd": round(total_cost, 4), "total_calls": len(all_results), "by_model_arm": {}}
    for r in all_results:
        key = f"{r['model']}|{r['arm']}"
        b = summary["by_model_arm"].setdefault(key, {"n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost": 0.0})
        b["n"] += 1
        g = r["grade"]
        if g in ("HOT", "HIT", "MISS"):
            b[g] += 1
        b["cost"] = round(b["cost"] + r["cost_usd"], 4)
    summary_path = OUT_DIR / "aggregate_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2))

    print("\n=== AGGREGATE ===")
    print(json.dumps(summary, indent=2))
    print(f"\nSummary written to: {summary_path}")
    print(f"Total spend: ${total_cost:.4f}")


if __name__ == "__main__":
    main()
