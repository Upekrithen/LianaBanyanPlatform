"""
SEG-B1: Fetch TIGER-Lab/MMLU-Pro from HuggingFace and split into 14 per-domain files.
BP081 · Wave B · Disk-backed canon enforcement
"""

import json
import os
import sys
import time
import hashlib
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

# Map MMLU-Pro category strings → our 14 domains (lowercase, normalized)
CATEGORY_MAP = {
    # math
    "math": "math",
    "mathematics": "math",
    # physics
    "physics": "physics",
    # chemistry
    "chemistry": "chemistry",
    # biology
    "biology": "biology",
    # computer science
    "computer science": "computer_science",
    "computer_science": "computer_science",
    "cs": "computer_science",
    # engineering
    "engineering": "engineering",
    "electrical engineering": "engineering",
    # history
    "history": "history",
    # philosophy
    "philosophy": "philosophy",
    # law
    "law": "law",
    # business
    "business": "business",
    "accounting": "business",
    "finance": "economics",  # keep finance near economics
    "marketing": "business",
    "management": "business",
    # economics
    "economics": "economics",
    "econometrics": "economics",
    # psychology
    "psychology": "psychology",
    # health / medicine
    "health": "health",
    "medicine": "health",
    "medical": "health",
    "nursing": "health",
    "pharmacy": "health",
    "public health": "health",
    # other — catch-all
    "other": "other",
}

OUT_BASE = Path(__file__).parent.parent / "datasets" / "mmlu_pro_per_domain"
MIN_QS = 20


def map_category(cat: str) -> str:
    """Map a raw MMLU-Pro category string to one of our 14 domains."""
    normalized = cat.strip().lower()
    if normalized in CATEGORY_MAP:
        return CATEGORY_MAP[normalized]
    # Partial-match fallback
    for key, domain in CATEGORY_MAP.items():
        if key in normalized or normalized in key:
            return domain
    return "other"


def build_question_record(row) -> dict:
    """Convert a HuggingFace dataset row into our schema."""
    # MMLU-Pro fields vary slightly by version — be defensive
    options = row.get("options", [])
    if not isinstance(options, list):
        options = list(options)

    answer_index = row.get("answer_index", None)
    answer = row.get("answer", None)

    # Resolve correct_answer to the actual option text (not the letter label)
    if answer_index is not None and 0 <= int(answer_index) < len(options):
        correct_answer = options[int(answer_index)]
    elif answer is not None and isinstance(answer, str) and len(answer) == 1:
        # Fallback: convert letter A-J to 0-based index
        idx = ord(answer.upper()) - ord('A')
        if 0 <= idx < len(options):
            correct_answer = options[idx]
        else:
            correct_answer = ""
    else:
        correct_answer = ""

    source_id = str(row.get("question_id", row.get("id", "")))
    source_category = str(row.get("category", ""))
    source_url = "https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro"

    return {
        "question": str(row.get("question", "")),
        "options": options,
        "correct_answer": correct_answer,
        "source_id": source_id,
        "source_category": source_category,
        "source_url": source_url,
    }


def create_stub_questions(domain: str) -> list:
    """Generate synthetic stub questions for a domain when HF is unavailable."""
    stubs = []
    for i in range(5):
        stubs.append({
            "question": f"[STUB] Sample question {i+1} for domain '{domain}'?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A",
            "source_id": f"stub_{domain}_{i+1}",
            "source_category": domain,
            "source_url": "STUB_DATA",
        })
    return stubs


def fetch_with_retry(dataset_name: str, split: str, max_retries: int = 3):
    """Load dataset from HuggingFace with exponential backoff on rate limits."""
    from datasets import load_dataset
    for attempt in range(max_retries):
        try:
            print(f"  Loading '{dataset_name}' split='{split}' (attempt {attempt+1}/{max_retries})...")
            ds = load_dataset(dataset_name, split=split, trust_remote_code=True)
            return ds
        except Exception as e:
            err = str(e).lower()
            if "rate" in err or "429" in err or "timeout" in err:
                wait = 2 ** attempt * 5
                print(f"  Rate limit / timeout hit — retrying in {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise RuntimeError(f"Failed to load '{dataset_name}' after {max_retries} attempts")


def main():
    print("=" * 60)
    print("SEG-B1 · BP081 Wave B · MMLU-Pro per-domain split")
    print("=" * 60)

    # Ensure output dirs exist
    for domain in DOMAINS:
        (OUT_BASE / domain).mkdir(parents=True, exist_ok=True)

    # Bucket accumulators
    buckets: dict[str, list] = {d: [] for d in DOMAINS}

    use_stub = False
    hf_available = True

    # Try HuggingFace
    try:
        splits_to_try = ["test", "validation", "train"]
        for split_name in splits_to_try:
            try:
                ds = fetch_with_retry("TIGER-Lab/MMLU-Pro", split_name)
                print(f"  Fetched split '{split_name}': {len(ds)} rows")
                for row in ds:
                    cat = row.get("category", "other")
                    domain = map_category(cat)
                    rec = build_question_record(row)
                    buckets[domain].append(rec)
            except Exception as ex:
                print(f"  WARNING: Could not load split '{split_name}': {ex}")

        # If we got nothing at all, go stub
        total = sum(len(v) for v in buckets.values())
        if total == 0:
            raise RuntimeError("Zero questions fetched across all splits")

    except Exception as e:
        print(f"\nWARNING: HuggingFace unavailable — {e}")
        print("Falling back to STUB DATA for all domains.")
        hf_available = False
        use_stub = True
        for domain in DOMAINS:
            buckets[domain] = create_stub_questions(domain)

    # Write per-domain raw files
    print("\n--- Writing per-domain questions_raw.json ---")
    for domain in DOMAINS:
        questions = buckets[domain]
        out_file = OUT_BASE / domain / "questions_raw.json"

        payload: dict = {"questions": questions}
        if use_stub:
            payload["_stub"] = True
            print(f"  STUB DATA: HuggingFace unavailable — created synthetic questions for domain {domain}")
        else:
            count = len(questions)
            if count < MIN_QS:
                print(f"  WARNING: domain '{domain}' has only {count} Qs (< {MIN_QS})")
            else:
                print(f"  domain '{domain}': {count} questions written")

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)

    print("\n--- SEG-B1 complete ---")
    total_written = sum(len(v) for v in buckets.values())
    print(f"Total Qs across all domains: {total_written}")
    print(f"HuggingFace reachable: {hf_available}")
    if use_stub:
        print("NOTE: All data is STUB (synthetic). Run again when HF is accessible.")


if __name__ == "__main__":
    main()
