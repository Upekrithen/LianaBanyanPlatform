#!/usr/bin/env python3
"""
SEG-T-5: GPQA Diamond Dataset Download and Cache Script
========================================================
Downloads Idavidrein/gpqa (gpqa_diamond config) from Hugging Face and caches it at:
  ~/.mnemosynec/test-data/gpqa-diamond/gpqa_diamond.json
  ~/.mnemosynec/test-data/gpqa-diamond/metadata.json

GPQA Diamond is ~448 PhD-level Bio/Chem/Physics questions (Google-proof).
License: CC BY 4.0  (https://creativecommons.org/licenses/by/4.0/)
Source:  https://huggingface.co/datasets/Idavidrein/gpqa
Paper:   "GPQA: A Graduate-Level Google-Proof Q&A Benchmark"
         Rein et al., 2023  https://arxiv.org/abs/2311.12022

AUTHENTICATION REQUIRED:
  This dataset is gated on Hugging Face.
  Before running, authenticate with:
      pip install huggingface_hub
      huggingface-cli login
  Or set the env var:
      $env:HUGGING_FACE_HUB_TOKEN = "hf_..."
  Then visit https://huggingface.co/datasets/Idavidrein/gpqa and click "Access repository"
  to accept the dataset's license terms.

Output format (matches mmlu_pro_standard.json convention):
  List of dicts, each with keys:
    question_id   -- string identifier
    question      -- question text
    options       -- list of option strings (4 options: A, B, C, D)
    answer        -- correct letter ("A", "B", "C", or "D")
    answer_index  -- 0-based index of correct answer
    category      -- subject area (biology, chemistry, physics)
    src           -- "gpqa_diamond"

Usage:
    python scripts/download_gpqa_diamond.py
    python scripts/download_gpqa_diamond.py --force   # re-download even if cached
    python scripts/download_gpqa_diamond.py --dry-run # print what would be done
    python scripts/download_gpqa_diamond.py --token hf_xxx  # pass HF token directly
"""

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

CACHE_DIR = Path.home() / ".mnemosynec" / "test-data" / "gpqa-diamond"
OUTPUT_PATH = CACHE_DIR / "gpqa_diamond.json"
METADATA_PATH = CACHE_DIR / "metadata.json"

HF_DATASET = "Idavidrein/gpqa"
HF_CONFIG = "gpqa_diamond"
HF_SPLIT = "train"
HF_LICENSE = "CC BY 4.0"
HF_CITATION = (
    "GPQA: A Graduate-Level Google-Proof Q&A Benchmark. "
    "Rein et al., 2023. https://arxiv.org/abs/2311.12022"
)
EXPECTED_ROW_COUNT = 448  # approximate; actual may vary slightly


# GPQA Diamond field names in the raw HF dataset
RAW_QUESTION_FIELD = "Question"
RAW_CORRECT_FIELD = "Correct Answer"
RAW_INCORRECT_1 = "Incorrect Answer 1"
RAW_INCORRECT_2 = "Incorrect Answer 2"
RAW_INCORRECT_3 = "Incorrect Answer 3"
RAW_SUBDOMAIN_FIELD = "Subdomain"
RAW_HIGH_LEVEL_FIELD = "High-level domain"
RAW_RECORD_ID = "Record ID"


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def normalize_category(row: dict) -> str:
    """
    Map GPQA domain fields to a canonical category string.
    High-level domain values are typically:
      "Biology", "Chemistry", "Physics"
    """
    domain = row.get(RAW_HIGH_LEVEL_FIELD, "") or row.get(RAW_SUBDOMAIN_FIELD, "")
    return domain.lower().strip() if domain else "unknown"


def normalize_row(row: dict, idx: int) -> dict:
    """
    Convert a raw GPQA HF row to the standard mesh-test format:
      { question_id, question, options, answer, answer_index, category, src }

    GPQA stores one correct + three incorrect answers. We randomly (but
    deterministically) shuffle them into options A-D so the model cannot
    simply anchor on position.

    Deterministic shuffle: uses question text hash mod 24 to pick permutation,
    so repeated downloads produce identical orderings.
    """
    question_text = row.get(RAW_QUESTION_FIELD, "")
    correct = row.get(RAW_CORRECT_FIELD, "")
    wrong1 = row.get(RAW_INCORRECT_1, "")
    wrong2 = row.get(RAW_INCORRECT_2, "")
    wrong3 = row.get(RAW_INCORRECT_3, "")

    # Deterministic permutation from question hash
    h = int(hashlib.md5(question_text.encode("utf-8")).hexdigest(), 16) % 24
    # 24 permutations of 4 positions; use h to index into a simple deterministic mapping
    # Build the 24 permutations of [0,1,2,3] in lexicographic order
    from itertools import permutations
    perms = list(permutations(range(4)))
    perm = perms[h]

    raw_options = [correct, wrong1, wrong2, wrong3]
    shuffled = [raw_options[perm[i]] for i in range(4)]
    correct_shuffled_idx = shuffled.index(correct)
    correct_letter = chr(65 + correct_shuffled_idx)  # "A", "B", "C", or "D"

    record_id = row.get(RAW_RECORD_ID, None)
    q_id = f"gpqa_{record_id}" if record_id else f"gpqa_{idx}"

    return {
        "question_id": str(q_id),
        "question": question_text,
        "options": shuffled,
        "answer": correct_letter,
        "answer_index": correct_shuffled_idx,
        "category": normalize_category(row),
        "src": "gpqa_diamond",
    }


def download_gpqa(token: str = None) -> list:
    """
    Download GPQA Diamond from Hugging Face.
    Returns list of normalized question dicts.
    Raises on gating / auth failure -- caller surfaces the error.
    """
    print(f"Attempting HuggingFace download: {HF_DATASET} config={HF_CONFIG} split={HF_SPLIT}")

    # Set token in env if provided
    if token:
        os.environ["HUGGING_FACE_HUB_TOKEN"] = token

    try:
        from datasets import load_dataset
        ds = load_dataset(HF_DATASET, HF_CONFIG, split=HF_SPLIT)
        print(f"  Raw download: {len(ds)} rows")
        normalized = [normalize_row(dict(row), i) for i, row in enumerate(ds)]
        print(f"  Normalized: {len(normalized)} questions")
        return normalized
    except Exception as exc:
        raise RuntimeError(str(exc)) from exc


def main():
    parser = argparse.ArgumentParser(description="SEG-T-5: GPQA Diamond cache downloader")
    parser.add_argument("--force", action="store_true", help="Re-download even if cached")
    parser.add_argument("--dry-run", action="store_true", help="Print plan without downloading")
    parser.add_argument("--token", default=None, help="Hugging Face API token (hf_...)")
    args = parser.parse_args()

    # Check for existing cache
    if OUTPUT_PATH.exists() and not args.force:
        size = OUTPUT_PATH.stat().st_size
        print(f"Cache already exists at {OUTPUT_PATH}")
        print(f"  Size: {size:,} bytes")
        if METADATA_PATH.exists():
            with open(METADATA_PATH) as f:
                meta = json.load(f)
            print(f"  Questions: {meta.get('question_count', '?')}")
            print(f"  SHA-256:   {meta.get('sha256', '?')}")
        print("Run with --force to re-download.")
        # Print first question as sanity check
        with open(OUTPUT_PATH) as f:
            data = json.load(f)
        if data:
            print("\nFirst question (sanity):")
            print(f"  ID:       {data[0]['question_id']}")
            print(f"  Category: {data[0]['category']}")
            print(f"  Q:        {data[0]['question'][:120]}...")
            print(f"  Answer:   {data[0]['answer']}")
        return 0

    if args.dry_run:
        print("[DRY RUN] Would download:")
        print(f"  Source:   {HF_DATASET} config={HF_CONFIG}")
        print(f"  Output:   {OUTPUT_PATH}")
        print(f"  Metadata: {METADATA_PATH}")
        print(f"  License:  {HF_LICENSE}")
        print()
        print("AUTHENTICATION REQUIRED:")
        print("  1. huggingface-cli login  (or set $env:HUGGING_FACE_HUB_TOKEN)")
        print("  2. Accept dataset terms at https://huggingface.co/datasets/Idavidrein/gpqa")
        return 0

    # Create output directory
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    download_ts = now_iso()

    # Attempt download
    try:
        questions = download_gpqa(token=args.token)
    except RuntimeError as exc:
        err = str(exc)
        print()
        print("=" * 60)
        print("DOWNLOAD FAILED -- GATING / AUTH ISSUE")
        print("=" * 60)
        print(f"Error: {err}")
        print()
        print("GPQA Diamond is gated on Hugging Face. To access it:")
        print()
        print("  Step 1: Obtain a Hugging Face account and accept the dataset")
        print("          license at: https://huggingface.co/datasets/Idavidrein/gpqa")
        print("          (click 'Access repository' and agree to CC BY 4.0 + dataset terms)")
        print()
        print("  Step 2: Create a HF read token at:")
        print("          https://huggingface.co/settings/tokens")
        print()
        print("  Step 3: Authenticate in one of two ways:")
        print("    Option A: Run 'huggingface-cli login' and paste the token")
        print("    Option B: Run this script with --token hf_YOUR_TOKEN_HERE")
        print("    Option C: Set environment variable:")
        print("              $env:HUGGING_FACE_HUB_TOKEN = 'hf_YOUR_TOKEN_HERE'")
        print()
        print("  Then re-run: python scripts/download_gpqa_diamond.py")
        print()
        print("Truth-Always: no row count claimed, no fake data written.")
        return 1

    if not questions:
        print("ERROR: Download returned 0 questions. Aborting.")
        return 1

    # Write output
    print(f"Writing {len(questions):,} questions to {OUTPUT_PATH} ...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f)
    file_sha = sha256_file(OUTPUT_PATH)
    file_size = OUTPUT_PATH.stat().st_size
    print(f"  Written: {file_size:,} bytes  SHA-256: {file_sha}")

    # Category breakdown
    from collections import Counter
    cats = Counter(q["category"] for q in questions)
    print(f"  Category breakdown: {dict(cats)}")

    # Write metadata
    metadata = {
        "source": HF_DATASET,
        "config": HF_CONFIG,
        "split": HF_SPLIT,
        "question_count": len(questions),
        "sha256": file_sha,
        "file_size_bytes": file_size,
        "cached_at": now_iso(),
        "download_timestamp": download_ts,
        "license": HF_LICENSE,
        "citation": HF_CITATION,
        "google_published_accuracy": "78.8% (Gemma 4 12B, as published by Google)",
        "schema_version": "SEG-T-5-v1",
        "normalization": "correct + 3 wrong answers shuffled deterministically by question-text md5 hash",
        "category_breakdown": dict(cats),
    }
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Metadata written to {METADATA_PATH}")

    # Sanity: print first question
    print("\nFirst question (sanity check):")
    q0 = questions[0]
    print(f"  ID:       {q0['question_id']}")
    print(f"  Category: {q0['category']}")
    print(f"  Q:        {q0['question'][:120]}...")
    for i, opt in enumerate(q0["options"]):
        marker = " <-- correct" if chr(65 + i) == q0["answer"] else ""
        print(f"  {chr(65+i)}: {opt[:80]}{marker}")
    print(f"  Answer:   {q0['answer']}")

    # Final report
    print()
    print("=== SEG-T-5 GPQA Diamond Cache Complete ===")
    print(f"Questions:  {len(questions):,}")
    print(f"Path:       {OUTPUT_PATH}")
    print(f"Size:       {file_size:,} bytes")
    print(f"SHA-256:    {file_sha}")
    print(f"License:    {HF_LICENSE}")
    print(f"Google 78.8% target is apples-to-apples on this dataset.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
