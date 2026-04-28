#!/usr/bin/env python3
"""
lb-reproducibility-pack — Dataset Setup Script
================================================
Generates the reasonable-effort tier corpus and question bank from the canonical
K528 sources in datasets/full_k528/. Run once after `python -m pip install -r requirements.txt`.

Usage:
    python setup_datasets.py                   # generate reasonable tier
    python setup_datasets.py --verify-smoke    # verify smoke tier hot_required_elements resolve
    python setup_datasets.py --all             # generate reasonable + verify smoke

Sovereignty contract: this script operates entirely on local files. No network calls.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

PACK_ROOT = Path(__file__).resolve().parent
FULL_CORPUS = PACK_ROOT / "datasets" / "full_k528" / "corpus_full_k528.md"
FULL_QBANK = PACK_ROOT / "datasets" / "full_k528" / "questions_full_k528.json"
SMOKE_CORPUS = PACK_ROOT / "datasets" / "smoke" / "corpus_smoke.md"
SMOKE_QBANK = PACK_ROOT / "datasets" / "smoke" / "questions_smoke.json"
REASONABLE_DIR = PACK_ROOT / "datasets" / "reasonable"

# Reasonable tier: 75 facts drawn from the 150-fact canonical corpus.
# Selection: CS-01..CS-25 (25) + AM-01..AM-25 (25) + EG-01..EG-12 (12) + MJ-01..MJ-13 (13)
# = 75 facts. These correspond to the original R11-v1 50-fact base (CS+AM) plus 25 selected
# R11-v2 additions (EG-01..EG-12 + MJ-01..MJ-13 = 25 facts for balanced coverage).
REASONABLE_FACT_IDS = (
    [f"CS-{i:02d}" for i in range(1, 26)] +   # CS-01 to CS-25
    [f"AM-{i:02d}" for i in range(1, 26)] +   # AM-01 to AM-25
    [f"EG-{i:02d}" for i in range(1, 13)] +   # EG-01 to EG-12
    [f"MJ-{i:02d}" for i in range(1, 14)]     # MJ-01 to MJ-13
)
assert len(REASONABLE_FACT_IDS) == 75, f"Expected 75, got {len(REASONABLE_FACT_IDS)}"

# Reasonable tier: 100 questions. From the 200-question K528 bank, select questions whose
# source_fact_id is in REASONABLE_FACT_IDS. If > 100 qualify, take the first 100 (ordered
# by appearance in the question bank). If < 100 qualify, take all qualifying.
REASONABLE_Q_TARGET = 100


def _extract_chapter_blocks(corpus_text: str) -> dict[str, str]:
    """
    Parse corpus into per-fact blocks keyed by fact ID (e.g. 'CS-01').
    Each block includes the ### header line through the next --- separator.
    Fact IDs are extracted from source_fact_id values found in the section headers.

    The corpus uses section headers like "### CS-01 — Title" or embedded bold text
    like "**CS-01.**". We detect both patterns.
    """
    blocks: dict[str, str] = {}

    # Split on the --- separators used between facts
    # Each block between separators is one fact section
    raw_sections = re.split(r'\n---\n', corpus_text)

    for section in raw_sections:
        # Try to find a fact ID in the header line (### XX-NN) or bold (**XX-NN.**)
        header_match = re.search(r'###\s+(CS|AM|EG|MJ|RC|HP)-(\d+)', section)
        if not header_match:
            # Try bold-prefix pattern
            header_match = re.search(r'\*\*(CS|AM|EG|MJ|RC|HP)-(\d+)\.\*\*', section)
        if not header_match:
            continue

        prefix = header_match.group(1)
        num = int(header_match.group(2))
        fact_id = f"{prefix}-{num:02d}"
        blocks[fact_id] = section.strip()

    return blocks


def generate_reasonable_corpus(full_corpus_path: Path, out_path: Path) -> int:
    """Extract the 75-fact reasonable corpus from the canonical corpus. Returns fact count."""
    print(f"Reading canonical corpus from {full_corpus_path} ...")
    corpus_text = full_corpus_path.read_text(encoding="utf-8")

    blocks = _extract_chapter_blocks(corpus_text)
    print(f"  Parsed {len(blocks)} fact blocks from canonical corpus.")

    lines = [
        "# Cooperative AI Platform Ecosystem — Reasonable-Effort Corpus",
        "",
        "**Document version:** 1.0.0-K533-reasonable",
        "**Corpus ID:** R11v2-REASONABLE-K533",
        "**Derived from:** R11v2-CANONICAL-K528",
        f"**Generated:** {_today()}",
        "**Purpose:** 75-fact reasonable-effort subset for lb-reproducibility-pack.",
        "  Covers CS-01..CS-25 (25 facts) + AM-01..AM-25 (25 facts) +",
        "  EG-01..EG-12 (12 facts) + MJ-01..MJ-13 (13 facts) = 75 facts.",
        "  Runs in ~30-60 minutes at ~$10-30 industry-term API/compute spend.",
        "",
        "---",
        "",
    ]

    found = 0
    missing = []
    for fact_id in REASONABLE_FACT_IDS:
        if fact_id in blocks:
            lines.append(blocks[fact_id])
            lines.append("")
            lines.append("---")
            lines.append("")
            found += 1
        else:
            missing.append(fact_id)

    if missing:
        print(f"  WARNING: {len(missing)} facts not found in canonical corpus: {missing[:5]}...")
        print("  This may indicate the canonical corpus is not the K528 version.")

    lines.append(f"*End of reasonable-effort corpus. {found} facts extracted.*")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"  Written {found} facts to {out_path}")
    return found


def generate_reasonable_qbank(full_qbank_path: Path, out_path: Path, corpus_text: str) -> int:
    """Extract up to 100 questions for the reasonable tier. Returns question count."""
    print(f"Reading K528 question bank from {full_qbank_path} ...")
    bank = json.loads(full_qbank_path.read_text(encoding="utf-8"))
    all_questions = bank["questions"]

    reasonable_set = set(REASONABLE_FACT_IDS)
    qualifying = [q for q in all_questions if q.get("source_fact_id", "") in reasonable_set]
    print(f"  {len(qualifying)} questions qualify for reasonable tier (source_fact_id in 75-fact set).")

    selected = qualifying[:REASONABLE_Q_TARGET]
    print(f"  Selected {len(selected)} questions for reasonable tier.")

    # Verify hot_required_elements resolve against the reasonable corpus
    corpus_lower = corpus_text.lower()
    verified = 0
    failed = []
    for q in selected:
        ok = all(str(e).lower() in corpus_lower for e in q.get("hot_required_elements", []))
        if ok:
            verified += 1
        else:
            failed.append(q["id"])

    if failed:
        print(f"  WARNING: {len(failed)} questions failed alignment — excluded from reasonable bank:")
        for qid in failed[:5]:
            print(f"    {qid}")
        # Remove failing questions to maintain alignment guarantee
        selected = [q for q in selected if q["id"] not in set(failed)]
        print(f"  Filtered to {len(selected)} fully-verified questions.")
    else:
        print(f"  Alignment check: all {verified} selected questions verify against reasonable corpus. OK")

    out_bank = {
        "bank_version": "1.0.0-K533-reasonable-sealed",
        "bank_status": f"SEALED — {len(selected)} questions for K533 reasonable tier.",
        "corpus_id": "R11v2-REASONABLE-K533",
        "corpus_file": "corpus_reasonable.md",
        "parent_bank": "R11v2_QUESTION_BANK_SEALED_K528.json",
        "generated": _today(),
        "grading_rubric": bank.get("grading_rubric", ""),
        "alignment_guarantee": (
            f"All {verified}/{len(selected)} selected questions have hot_required_elements "
            "verified as substrings of corpus_reasonable.md at generation time."
        ),
        "categories": bank.get("categories", []),
        "questions": selected,
    }

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out_bank, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Written {len(selected)} questions to {out_path}")
    return len(selected)


def generate_reasonable_expected(selected_questions: list[dict], out_path: Path) -> None:
    """Write expected_results_reasonable.json from selected question set."""
    results = []
    for q in selected_questions:
        results.append({
            "id": q["id"],
            "canonical_answer": q.get("canonical_answer", q.get("ground_truth", "")),
            "hot_required_elements": q.get("hot_required_elements", []),
            "expected_grade_cathedral": "HOT",
            "expected_grade_cold": "MISS",
        })
    out = {
        "metadata": {
            "version": "1.0.0-K533",
            "description": (
                "Canonical expected results for reasonable-effort tier. "
                "Cathedral conditions should achieve 65-85% HOT. "
                "Cold conditions should achieve 0-5% HOT. "
                "±5pp tolerance for passing replication."
            ),
            "corpus_id": "R11v2-REASONABLE-K533",
            "generated": _today(),
            "expected_hot_pct_cathedral": "65-85",
            "expected_hot_pct_cold": "0-5",
            "expected_hot_pct_vendor_native": "55-90",
            "replication_tolerance_pp": 5,
        },
        "expected_results": results,
    }
    out_path.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  Written {len(results)} expected results to {out_path}")


def verify_smoke(smoke_corpus_path: Path, smoke_qbank_path: Path) -> bool:
    """Verify all smoke questions' hot_required_elements resolve against smoke corpus."""
    corpus_lower = smoke_corpus_path.read_text(encoding="utf-8").lower()
    bank = json.loads(smoke_qbank_path.read_text(encoding="utf-8"))
    questions = bank["questions"]

    all_pass = True
    for q in questions:
        for elem in q.get("hot_required_elements", []):
            if str(elem).lower() not in corpus_lower:
                print(f"  FAIL [{q['id']}]: '{elem}' not found in smoke corpus")
                all_pass = False

    if all_pass:
        print(f"  Smoke alignment: all {len(questions)} questions verify. OK")
    return all_pass


def _today() -> str:
    from datetime import date
    return date.today().isoformat()


def main() -> None:
    parser = argparse.ArgumentParser(description="lb-reproducibility-pack dataset setup")
    parser.add_argument("--all", action="store_true", help="Generate reasonable + verify smoke")
    parser.add_argument("--verify-smoke", action="store_true", help="Verify smoke tier alignment")
    parser.add_argument("--reasonable-only", action="store_true", help="Generate reasonable tier only")
    args = parser.parse_args()

    do_reasonable = args.all or args.reasonable_only or (not args.verify_smoke)
    do_verify_smoke = args.all or args.verify_smoke

    if do_verify_smoke:
        print("\n=== Smoke tier alignment check ===")
        if not SMOKE_CORPUS.exists():
            print(f"ERROR: smoke corpus not found at {SMOKE_CORPUS}")
            sys.exit(1)
        if not SMOKE_QBANK.exists():
            print(f"ERROR: smoke question bank not found at {SMOKE_QBANK}")
            sys.exit(1)
        ok = verify_smoke(SMOKE_CORPUS, SMOKE_QBANK)
        if not ok:
            sys.exit(1)

    if do_reasonable:
        print("\n=== Reasonable tier generation ===")
        if not FULL_CORPUS.exists():
            print(f"ERROR: canonical corpus not found at {FULL_CORPUS}")
            print("Run: python setup_datasets.py after placing corpus_full_k528.md in datasets/full_k528/")
            sys.exit(1)
        if not FULL_QBANK.exists():
            print(f"ERROR: K528 question bank not found at {FULL_QBANK}")
            sys.exit(1)

        out_corpus = REASONABLE_DIR / "corpus_reasonable.md"
        out_qbank = REASONABLE_DIR / "questions_reasonable.json"
        out_expected = REASONABLE_DIR / "expected_results_reasonable.json"

        fact_count = generate_reasonable_corpus(FULL_CORPUS, out_corpus)
        reasonable_corpus_text = out_corpus.read_text(encoding="utf-8")
        q_count = generate_reasonable_qbank(FULL_QBANK, out_qbank, reasonable_corpus_text)

        bank = json.loads(out_qbank.read_text(encoding="utf-8"))
        generate_reasonable_expected(bank["questions"], out_expected)

        print(f"\nOK Reasonable tier ready: {fact_count} facts, {q_count} questions")
        print(f"  corpus:   {out_corpus}")
        print(f"  qbank:    {out_qbank}")
        print(f"  expected: {out_expected}")

    print("\nSetup complete. Run `python run_benchmark.py --tier smoke` to verify installation.")


if __name__ == "__main__":
    main()
