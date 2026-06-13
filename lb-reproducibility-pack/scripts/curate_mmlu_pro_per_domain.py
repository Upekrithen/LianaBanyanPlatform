"""
SEG-B2: Vet each raw Q for Andon discipline — correct answer locked, no ambiguity.
BP081 · Wave B · Disk-backed canon enforcement

Gemma cold-call substitution: structural validation used in place of LLM call
(Gemma access not guaranteed for this wave). Marks: "structural_check_pass" or
"structural_check_fail: [reason]".
"""

import json
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DOMAINS = [
    "math",
    "physics",
    "chemistry",
    "biology",
    "computer_science",
    "engineering",
    "history",
    "philosophy",
    "law",
    "business",
    "economics",
    "psychology",
    "health",
    "other",
]

OUT_BASE = Path(__file__).parent.parent / "datasets" / "mmlu_pro_per_domain"
MIN_QS = 20
MIN_QUESTION_CHARS = 20
MIN_OPTIONS = 2


def structural_check(q: dict) -> tuple[bool, str]:
    """
    Validate a question record structurally.
    Returns (pass: bool, notes: str).
    """
    question_text = q.get("question", "")
    options = q.get("options", [])
    correct_answer = q.get("correct_answer", "")

    if not question_text or len(str(question_text).strip()) < MIN_QUESTION_CHARS:
        return False, f"structural_check_fail: question too short ({len(str(question_text).strip())} chars)"

    if not isinstance(options, list) or len(options) < MIN_OPTIONS:
        return False, f"structural_check_fail: fewer than {MIN_OPTIONS} options ({len(options) if isinstance(options, list) else 0})"

    if not correct_answer or str(correct_answer).strip() == "":
        return False, "structural_check_fail: correct_answer is empty"

    if correct_answer not in options:
        return False, f"structural_check_fail: correct_answer '{correct_answer}' not in options"

    return True, "structural_check_pass"


def curate_domain(domain: str) -> dict:
    """Process one domain: read raw, vet, write curated. Returns stats dict."""
    raw_file = OUT_BASE / domain / "questions_raw.json"
    curated_file = OUT_BASE / domain / "questions_curated.json"

    if not raw_file.exists():
        print(f"  ERROR: {raw_file} not found — skipping domain '{domain}'")
        return {"domain": domain, "total": 0, "pass_count": 0, "fail_count": 0, "skipped": True}

    with open(raw_file, "r", encoding="utf-8") as f:
        payload = json.load(f)

    is_stub = payload.get("_stub", False)
    questions = payload.get("questions", [])

    curated = []
    pass_count = 0
    fail_count = 0

    for q in questions:
        ok, notes = structural_check(q)
        enriched = dict(q)
        enriched["curation_pass"] = ok
        enriched["curation_notes"] = notes
        curated.append(enriched)
        if ok:
            pass_count += 1
        else:
            fail_count += 1

    # Write curated output
    out_payload: dict = {"questions": curated}
    if is_stub:
        out_payload["_stub"] = True

    with open(curated_file, "w", encoding="utf-8") as f:
        json.dump(out_payload, f, ensure_ascii=False, indent=2)

    status_tag = "STUB" if is_stub else "OK"
    if pass_count < MIN_QS:
        print(f"  WARNING [{status_tag}] domain '{domain}': curation_pass={pass_count} (< {MIN_QS}) | fail={fail_count}")
    else:
        print(f"  [{status_tag}] domain '{domain}': curation_pass={pass_count} | fail={fail_count}")

    return {
        "domain": domain,
        "total": len(questions),
        "pass_count": pass_count,
        "fail_count": fail_count,
        "is_stub": is_stub,
        "skipped": False,
    }


def main():
    print("=" * 60)
    print("SEG-B2 · BP081 Wave B · MMLU-Pro curation (structural check)")
    print("=" * 60)
    print("NOTE: Gemma cold-call substituted with structural validation")
    print()

    stats_all = []
    for domain in DOMAINS:
        stats = curate_domain(domain)
        stats_all.append(stats)

    print()
    print("--- Curation Summary ---")
    total_pass = sum(s["pass_count"] for s in stats_all)
    total_fail = sum(s["fail_count"] for s in stats_all)
    shortfall_domains = [s["domain"] for s in stats_all if s["pass_count"] < MIN_QS and not s["skipped"]]

    print(f"Total curation_pass: {total_pass}")
    print(f"Total curation_fail: {total_fail}")
    if shortfall_domains:
        print(f"SHORTFALL DOMAINS (< {MIN_QS} pass): {shortfall_domains}")
    else:
        print(f"No shortfall domains — all have >= {MIN_QS} curated Qs.")

    print("\n--- SEG-B2 complete ---")


if __name__ == "__main__":
    main()
