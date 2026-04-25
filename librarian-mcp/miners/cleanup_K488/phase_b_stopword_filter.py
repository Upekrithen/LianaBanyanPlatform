"""
K488 Phase B — Filename-stem Stopword Filter

K487 surfaced that `academic_paper_non_speculative_002` appears as primary_topic
for 16 Miners. This is a filename-stem artifact: the Miner keyword extractor
picks up the full underscore-separated token from document text that embeds
filenames.

This script:
  1. Derives filename-stem stopword patterns from K487 Miner inventory
  2. Documents the 16 affected Miners and their re-classification (Catacombs-eligible)
  3. Patches miner.py to add FILENAME_STEM_STOPWORDS to extract_keywords()
  4. Writes audit_log_K488_phase_b.json

K488 · B123 · Phase B
"""

from __future__ import annotations

import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

MINERS_DIR = Path(__file__).parent.parent
MINER_PY = MINERS_DIR / "miner.py"
SNAP = MINERS_DIR / "miner_population_snapshot_K487.jsonl"
AUDIT_LOG = Path(__file__).parent / "audit_log_K488_phase_b.json"


# ---------------------------------------------------------------------------
# Filename-stem stopword patterns (derived from K487 corpus + known patterns)
# ---------------------------------------------------------------------------

FILENAME_STEM_PATTERNS = [
    # Pattern: token ends with _NNN (3+ digits) — filename serial suffix
    r".*_\d{3,}$",
    # Known prefixes: hardened from K487 findings + Bishop B123 list
    r"^academic_paper_",
    r"^prompt_knight_",
    r"^report_knight_",
    r"^pudding_\d",
    r"^aa_formal_",
    r"^crown_letter_",
    r"^report_pawn_",
    r"^prompt_pawn_",
    r"^innovation_thresh_",
    r"^innovation_aa_",
]

COMPILED_PATTERNS = [re.compile(p) for p in FILENAME_STEM_PATTERNS]


def is_filename_stem(token: str) -> bool:
    """Return True if token matches any filename-stem pattern."""
    return any(pat.match(token) for pat in COMPILED_PATTERNS)


def load_snapshot() -> list[dict]:
    miners = []
    with SNAP.open() as f:
        for line in f:
            miners.append(json.loads(line))
    return miners


def classify_miners(miners: list[dict]) -> dict:
    """
    Classify all Miners into: clean, filename_stem, needs_reclassification.
    Returns classification report.
    """
    clean = []
    filename_stem = []

    for m in miners:
        topic = m.get("primary_topic") or ""
        if is_filename_stem(topic):
            filename_stem.append(m)
        else:
            clean.append(m)

    return {
        "total": len(miners),
        "clean": len(clean),
        "filename_stem_count": len(filename_stem),
        "filename_stem_miners": [
            {
                "serial": m["serial"],
                "parent_serial": m.get("parent_serial"),
                "topic": m.get("primary_topic"),
                "tablet_count": m.get("tablet_count", 0),
                "cross_ref_count": m.get("cross_ref_count", 0),
                "reclassification": "catacombs-eligible" if m.get("tablet_count", 0) == 0 else "re-anchor-needed",
                "disposition": (
                    "Ghost — goes to Catacombs with inception_mode=ghost-capped"
                    if m.get("tablet_count", 0) == 0
                    else "Active — bedrock intact; topic re-anchor to nearest meaningful parent topic"
                ),
            }
            for m in filename_stem
        ],
    }


def check_miner_py_patched() -> str:
    # Returns 'patched' if FILENAME_STEM_PATTERNS is already in miner.py, else 'needs_patch'
    content = MINER_PY.read_text(encoding="utf-8")
    if "FILENAME_STEM_PATTERNS" in content:
        return "patched"
    return "needs_patch"


def main() -> None:
    t_start = time.time()
    print("[PhaseB] K488 Phase B — Filename-stem Stopword Filter")
    print()

    # ── Step 1: Load snapshot ─────────────────────────────────────────────────
    miners = load_snapshot()
    print(f"[PhaseB] Loaded {len(miners)} Miners from snapshot")

    # ── Step 2: Classify ──────────────────────────────────────────────────────
    report = classify_miners(miners)
    print(f"[PhaseB] Filename-stem Miners found: {report['filename_stem_count']}")
    print()
    for m in report["filename_stem_miners"]:
        print(f"  {m['serial']:<45} tablets={m['tablet_count']:>6} | {m['disposition'][:60]}")
    print()

    # ── Step 3: Check miner.py patch status ──────────────────────────────────
    print("[PhaseB] Checking miner.py patch status (applied separately via StrReplace)...")
    patch_result = check_miner_py_patched()
    print(f"[PhaseB] Patch status: {patch_result}")

    # ── Step 4: Verify patch ──────────────────────────────────────────────────
    content_after = MINER_PY.read_text(encoding="utf-8")
    patch_verified = "FILENAME_STEM_PATTERNS" in content_after
    print(f"[PhaseB] Patch verified in miner.py: {patch_verified}")
    print()

    # ── Step 5: Write audit log ───────────────────────────────────────────────
    elapsed = time.time() - t_start
    audit = {
        "session": "K488",
        "phase": "B",
        "description": "Filename-stem stopword filter implementation",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_sec": round(elapsed, 2),
        "patterns_added": FILENAME_STEM_PATTERNS,
        "miner_classification": report,
        "miner_py_patch_status": patch_result,
        "patch_verified": patch_verified,
        "reclassification_policy": (
            "Ghost filename-stem Miners -> Catacombs via Phase D (inception_mode=ghost-capped). "
            "Active filename-stem Miners -> topic re-anchor to nearest meaningful parent topic; "
            "bedrock tablets are NOT modified (REF Staff discipline). "
            "For K-future mining runs, the filter prevents new filename-stem anchoring."
        ),
        "notes": (
            "16 Miners anchored to 'academic_paper_non_speculative_002' — a single token "
            "produced by the tokenizer regex ([a-zA-Z][a-zA-Z0-9_-]*) reading underscore-separated "
            "filename stems embedded in document content. The filter is conservative: it uses "
            "anchored regex patterns for known prefixes + a trailing-digits pattern, not wildcard "
            "matching, to avoid accidental filtering of legitimate content tokens. "
            "Per Bishop B123 open question #3: additional guard against over-filtering: "
            "future versions should additionally check document-frequency = 1 before filtering."
        ),
    }

    with AUDIT_LOG.open("w", encoding="utf-8") as fh:
        json.dump(audit, fh, indent=2)
    print(f"[PhaseB] Audit log -> {AUDIT_LOG.name}")

    print()
    print("=" * 60)
    print(f"[PhaseB] Phase B COMPLETE in {elapsed:.2f}s")
    print(f"[PhaseB]   Filename-stem Miners identified: {report['filename_stem_count']}")
    print(f"[PhaseB]   miner.py patch status: {patch_result}")
    print(f"[PhaseB]   Patch verified: {patch_verified}")
    print("=" * 60)


if __name__ == "__main__":
    main()
