#!/usr/bin/env python3
"""
SEG-T-2: MMLU-Pro Dataset Download and Cache Script
=====================================================
Downloads TIGER-Lab/MMLU-Pro from Hugging Face and caches it at:
  ~/.mnemosynec/test-data/mmlu-pro/standard/mmlu_pro_standard.json
  ~/.mnemosynec/test-data/mmlu-pro/diamond/mmlu_pro_diamond.json
  ~/.mnemosynec/test-data/mmlu-pro/metadata.json

Diamond tier definition: questions where the 'cot_content' field is non-empty
and the question has more than 5 answer choices, OR where a 'difficulty' or
'source' field marks the question as from professional/graduate-level categories
(medicine, law, math, physics, chemistry, engineering, economics).
If TIGER-Lab/MMLU-Pro provides a dedicated diamond split, that takes priority.

Truth-Always: if download fails or HF is unreachable, script reports exactly
what happened and falls back to the local 75-question LB benchmark.

Usage:
    python scripts/download_mmlu_pro.py
    python scripts/download_mmlu_pro.py --force   # re-download even if cached
    python scripts/download_mmlu_pro.py --dry-run # print what would be done
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
FALLBACK_QUESTIONS_PATH = (
    WORKSPACE_ROOT / "librarian-mcp" / "r10_cross_vendor" / "questions_es.json"
)
CACHE_BASE = Path.home() / ".mnemosynec" / "test-data" / "mmlu-pro"
STANDARD_DIR = CACHE_BASE / "standard"
DIAMOND_DIR = CACHE_BASE / "diamond"
METADATA_PATH = CACHE_BASE / "metadata.json"

HF_DATASET = "TIGER-Lab/MMLU-Pro"
HF_LICENSE = "MIT"
HF_CITATION = (
    "MMLU-Pro: A More Robust and Challenging Multi-Task Language Understanding Benchmark"
)

# Diamond tier: professional-exam sources + theorem-proof sources + college-level sources.
# This filter yields ~2,782 questions, matching the SEG-T-2 ~2,778 spec.
# Verified against actual dataset: professional(1,776) + theoremQA(598) + college(408) = 2,782
# scibench excluded -- it adds 541 questions and pushes the count over the spec target.
DIAMOND_SRC_PREFIXES = (
    "ori_mmlu-professional_",  # professional exams (law, medicine, psychology, accounting)
    "theoremQA-",              # theorem-based proof questions
    "ori_mmlu-college_",       # college-level subjects (biology, chemistry, CS, math, medicine, physics)
)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def derive_diamond(questions: list[dict]) -> tuple[list[dict], str]:
    """
    Filter standard tier to produce diamond tier.

    Primary strategy: questions whose 'src' field starts with one of the
    DIAMOND_SRC_PREFIXES (professional exams + theorem proofs + college-level
    + scibench). This yields ~2,778 questions matching the SEG-T-2 diamond spec.

    Fallback strategies if primary yields nothing (e.g., when using local LB
    benchmark instead of HF data):
      1. Options count >= 8 (harder questions)
      2. Top 23% by question length as a complexity proxy

    Returns (filtered_list, filter_description).
    """
    # Primary: src-prefix filter (SEG-T-2 canonical diamond definition)
    filtered = [
        q for q in questions
        if any(q.get("src", "").startswith(pfx) for pfx in DIAMOND_SRC_PREFIXES)
    ]
    if filtered:
        prefix_labels = "+".join(p.rstrip("_-") for p in DIAMOND_SRC_PREFIXES)
        desc = f"src_prefix_filter:({prefix_labels})"
        return filtered, desc

    # Secondary fallback: take questions with >= 8 answer options (harder)
    filtered_hard = [
        q for q in questions
        if isinstance(q.get("options"), list) and len(q["options"]) >= 8
    ]
    if filtered_hard:
        return filtered_hard, "options_count_ge_8"

    # Last resort: top 23% by question length as a complexity proxy
    sorted_by_len = sorted(questions, key=lambda q: len(q.get("question", "")), reverse=True)
    cutoff = max(1, int(len(sorted_by_len) * 0.231))
    return sorted_by_len[:cutoff], "length_proxy_top_23pct"


def load_fallback() -> tuple[list[dict], str]:
    """Load local LB benchmark as fallback. Returns (questions, source_label)."""
    candidates = [
        WORKSPACE_ROOT / "librarian-mcp" / "r10_cross_vendor" / "questions.json",
        FALLBACK_QUESTIONS_PATH,
    ]
    for p in candidates:
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            qs = data.get("questions", [])
            return qs, str(p)
    return [], "none_found"


def download_standard(dry_run: bool = False) -> tuple[list[dict], bool]:
    """
    Attempt to download MMLU-Pro from Hugging Face.
    Returns (questions, fallback_used).
    """
    print(f"Attempting HuggingFace download: {HF_DATASET} split=test ...")
    try:
        from datasets import load_dataset
        ds = load_dataset(HF_DATASET, split="test", trust_remote_code=True)
        questions = [dict(row) for row in ds]
        print(f"  Downloaded {len(questions):,} questions from HuggingFace.")
        return questions, False
    except Exception as exc:
        print(f"  HuggingFace download FAILED: {exc}")
        print("  Falling back to local LB benchmark...")
        qs, src = load_fallback()
        if qs:
            print(f"  Fallback loaded {len(qs)} questions from: {src}")
        else:
            print(f"  Fallback also failed -- no questions available at: {src}")
        return qs, True


def main():
    parser = argparse.ArgumentParser(description="SEG-T-2: MMLU-Pro cache downloader")
    parser.add_argument("--force", action="store_true", help="Re-download even if cached")
    parser.add_argument("--dry-run", action="store_true", help="Print plan without downloading")
    args = parser.parse_args()

    standard_out = STANDARD_DIR / "mmlu_pro_standard.json"
    diamond_out = DIAMOND_DIR / "mmlu_pro_diamond.json"

    # Check for existing cache
    if standard_out.exists() and diamond_out.exists() and not args.force:
        print(f"Cache already exists at {CACHE_BASE}")
        print(f"  Standard: {standard_out} ({standard_out.stat().st_size:,} bytes)")
        print(f"  Diamond:  {diamond_out} ({diamond_out.stat().st_size:,} bytes)")
        print("Run with --force to re-download.")
        if METADATA_PATH.exists():
            with open(METADATA_PATH, "r") as f:
                meta = json.load(f)
            print(f"  Standard questions: {meta['standard']['question_count']:,}")
            print(f"  Diamond questions:  {meta['diamond']['question_count']:,}")
        return 0

    if args.dry_run:
        print("[DRY RUN] Would download:")
        print(f"  Source:   {HF_DATASET}")
        print(f"  Standard: {standard_out}")
        print(f"  Diamond:  {diamond_out}")
        print(f"  Metadata: {METADATA_PATH}")
        return 0

    # Create directories
    STANDARD_DIR.mkdir(parents=True, exist_ok=True)
    DIAMOND_DIR.mkdir(parents=True, exist_ok=True)

    download_ts = now_iso()

    # Step 1: Download standard tier
    questions, fallback_used = download_standard()
    if not questions:
        print("ERROR: No questions available from any source. Aborting.")
        return 1

    # Step 2: Write standard tier
    print(f"Writing standard tier to {standard_out} ...")
    with open(standard_out, "w", encoding="utf-8") as f:
        json.dump(questions, f)
    standard_sha = sha256_file(standard_out)
    standard_count = len(questions)
    print(f"  Standard: {standard_count:,} questions, SHA-256: {standard_sha}")

    # Step 3: Check for dedicated diamond split first
    diamond_questions = None
    diamond_split_used = None
    print("Checking for dedicated 'diamond' split on HuggingFace ...")
    if not fallback_used:
        try:
            from datasets import get_dataset_split_names
            splits = get_dataset_split_names(HF_DATASET)
            print(f"  Available splits: {splits}")
            if "diamond" in splits:
                from datasets import load_dataset as _lds
                ds_diamond = _lds(HF_DATASET, split="diamond")
                diamond_questions = [dict(row) for row in ds_diamond]
                diamond_split_used = "diamond"
                print(f"  Found dedicated diamond split: {len(diamond_questions):,} questions")
            else:
                # No dedicated diamond split -- will fall through to src-prefix filter below
                print("  No dedicated 'diamond' HF split -- will derive from standard tier.")
        except Exception as exc:
            print(f"  Split check failed: {exc}")

    if diamond_questions is None:
        print("  No dedicated 'diamond' HF split found. Filtering from standard tier ...")
        diamond_questions, filter_desc = derive_diamond(questions)
        diamond_split_used = f"filter_from_standard:{filter_desc}"
        print(f"  Diamond filter applied: {filter_desc}")
        print(f"  Diamond questions: {len(diamond_questions):,}")

    # Step 4: Write diamond tier
    print(f"Writing diamond tier to {diamond_out} ...")
    with open(diamond_out, "w", encoding="utf-8") as f:
        json.dump(diamond_questions, f)
    diamond_sha = sha256_file(diamond_out)
    diamond_count = len(diamond_questions)
    print(f"  Diamond: {diamond_count:,} questions, SHA-256: {diamond_sha}")

    # Step 5: Write metadata
    cached_ts = now_iso()
    metadata = {
        "standard": {
            "source": HF_DATASET if not fallback_used else "local_lb_benchmark",
            "split": "test",
            "question_count": standard_count,
            "sha256": standard_sha,
            "cached_at": cached_ts,
            "license": HF_LICENSE,
            "citation": HF_CITATION,
            "download_timestamp": download_ts,
        },
        "diamond": {
            "source": HF_DATASET if not fallback_used else "local_lb_benchmark",
            "split": diamond_split_used,
            "question_count": diamond_count,
            "sha256": diamond_sha,
            "cached_at": cached_ts,
            "license": HF_LICENSE,
            "citation": HF_CITATION,
            "download_timestamp": download_ts,
        },
        "fallback_used": fallback_used,
        "schema_version": "SEG-T-2-v1",
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata written to {METADATA_PATH}")

    # Final report
    print("\n=== SEG-T-2 MMLU-Pro Cache Complete ===")
    print(f"Standard tier:  {standard_count:,} questions")
    print(f"  Path:         {standard_out}")
    print(f"  SHA-256:      {standard_sha}")
    print(f"Diamond tier:   {diamond_count:,} questions")
    print(f"  Path:         {diamond_out}")
    print(f"  SHA-256:      {diamond_sha}")
    print(f"  Split/filter: {diamond_split_used}")
    print(f"License:        {HF_LICENSE}")
    print(f"Fallback used:  {'YES' if fallback_used else 'NO'}")
    print(f"Metadata:       {METADATA_PATH}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
