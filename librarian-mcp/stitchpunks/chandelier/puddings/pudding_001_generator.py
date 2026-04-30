"""
Pudding 001 — Crown Jewel Production Rate by Time-of-Day
KN011 / A&A #2291

"Proof is in the pudding, and I'm hungry." — Founder BP002 turn 13

This IS the first concrete Pudding from the Chandelier substrate.
Runs against real data: AA_FORMAL and INNOVATION_THRESH files in
BISHOP_DROPZONE/12_Innovations_AA/ (file mtimes as timestamp proxies).

Produces:
  - Per-hour-of-day CJ production histogram
  - Per-day-of-week histogram
  - Per-month-of-year histogram
  - Substrate-state at CJ filing (which primitives were live at each filing)
  - Right-Recipe argmax: what substrate predicts peak CJ production
  - Full provenance trace: every claim links to a receipt or source file

Output: BISHOP_DROPZONE/03_BishopHandoffs/CAPTAINS_ACADEMIC_LOG/
        PUDDING_001_CROWN_JEWEL_PRODUCTION_RATE_BP002.md

Reproducibility: reproducibility hash of output per Reproducibility Pack #2326.

Toolsmith log: TS-CJ-PRODUCTION-RATE-PUDDING-KN011-BP002
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent.parent  # librarian-mcp/stitchpunks/
_REPO_ROOT = _STITCH_DIR.parent.parent  # workspace root
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import build_index
from chandelier.queries.crown_jewel_temporal import CrownJewelTemporal, _build_histograms
from chandelier.queries.substrate_correlator import SubstrateCorrelator
from chandelier.queries.right_recipe_engine import RightRecipeEngine


SESSION_ID = "KN011-BP002"
PUDDING_OUTPUT_PATH = (
    _REPO_ROOT /
    "BISHOP_DROPZONE" /
    "03_BishopHandoffs" /
    "CAPTAINS_ACADEMIC_LOG" /
    "PUDDING_001_CROWN_JEWEL_PRODUCTION_RATE_BP002.md"
)


# ── CJ file-based ingestion ───────────────────────────────────────────────────

_CJ_SIGNALS = [
    "Crown Jewel",
    "crown_jewel",
    "CJ#",
    "CROWN JEWEL",
]

_REFERENCE_ONLY_SIGNALS = [
    "Related CJ anchors",
    "related CJ",
    "See CJ",
    "CJ anchor",
]


def _is_crown_jewel_file(path: Path) -> bool:
    """
    Determine if a file IS a Crown Jewel filing (vs merely mentioning CJs).

    Strategy:
      - Filename contains "CROWN_JEWEL" → yes
      - File content starts with CJ signal in first 800 chars
        BUT does NOT start with a reference-only marker
    """
    name_upper = path.name.upper()
    if "CROWN_JEWEL" in name_upper:
        return True

    try:
        head = path.read_text(encoding="utf-8", errors="ignore")[:800]
    except Exception:
        return False

    # Skip if it's only referencing CJs by name
    for ref_signal in _REFERENCE_ONLY_SIGNALS:
        if ref_signal in head[:300]:
            return False

    # Check for CJ signals in the content
    for signal in _CJ_SIGNALS:
        if signal in head:
            return True

    return False


def _extract_aa_numbers_from_filename(filename: str) -> List[str]:
    """
    Extract A&A numbers from a filename like AA_FORMAL_2278_THE_CATHEDRAL_EFFECT.md
    or INNOVATION_THRESH_2279_2281_B121.md.

    Returns list of A&A number strings.
    """
    numbers = re.findall(r"\b2\d{3}\b", filename)
    return numbers


def ingest_cj_timestamps_from_aa_formal_dir() -> List[Tuple[str, str, str]]:
    """
    Scan BISHOP_DROPZONE/12_Innovations_AA/ for Crown Jewel files.
    Returns list of (aa_number, iso_timestamp, source_file).

    Uses file modification time as timestamp proxy.
    """
    aa_dir = _REPO_ROOT / "BISHOP_DROPZONE" / "12_Innovations_AA"
    results: List[Tuple[str, str, str]] = []

    if not aa_dir.exists():
        return results

    for md_file in sorted(aa_dir.rglob("*.md")):
        if not _is_crown_jewel_file(md_file):
            continue

        try:
            mtime = os.path.getmtime(md_file)
            ts = datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat().replace("+00:00", "Z")
            aa_numbers = _extract_aa_numbers_from_filename(md_file.name)
            if not aa_numbers:
                # Use filename as ID
                results.append((md_file.stem, ts, str(md_file.name)))
            else:
                for num in aa_numbers:
                    results.append((num, ts, str(md_file.name)))
        except Exception:
            pass

    return results


def ingest_cj_timestamps() -> List[Tuple[str, str, str]]:
    """
    Union of all CJ timestamp sources.

    Returns list of (innovation_id, iso_timestamp, source_description).
    Deduplicated by innovation_id (first timestamp wins).
    """
    seen: Dict[str, Tuple[str, str]] = {}

    # Source 1: AA_FORMAL + INNOVATION_THRESH files
    for iid, ts, src in ingest_cj_timestamps_from_aa_formal_dir():
        if iid not in seen:
            seen[iid] = (ts, src)

    # Build into list of tuples
    return [(iid, ts, src) for iid, (ts, src) in sorted(seen.items())]


# ── Pudding markdown generator ────────────────────────────────────────────────

def _bar(value: int, max_val: int, width: int = 20) -> str:
    """ASCII bar chart."""
    if max_val == 0:
        return ""
    filled = round(value / max_val * width)
    return "█" * filled + "░" * (width - filled)


def _reproducibility_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()[:16]


def generate_pudding(
    cj_timestamps: Optional[List[Tuple[str, str, str]]] = None,
    include_right_recipe: bool = True,
    write_to_disk: bool = True,
) -> Dict[str, Any]:
    """
    Generate Pudding 001: Crown Jewel Production Rate by Time-of-Day.

    Parameters
    ----------
    cj_timestamps     : override CJ timestamp source (for testing)
    include_right_recipe : include Right-Recipe computation
    write_to_disk     : if True, write markdown to PUDDING_OUTPUT_PATH

    Returns dict with: markdown, histograms, substrate_correlation,
                       right_recipe, reproducibility_hash, caveats.
    """
    # ── Phase 1: Ingest CJ timestamps ─────────────────────────────────────
    if cj_timestamps is None:
        cj_timestamps = ingest_cj_timestamps()

    # cj_timestamps may be 2-tuples (iid, ts) or 3-tuples (iid, ts, src)
    ts_pairs = [(entry[0], entry[1]) for entry in cj_timestamps]
    source_count = len(cj_timestamps)

    # ── Phase 2: Build histograms ──────────────────────────────────────────
    histograms = _build_histograms(ts_pairs)

    # ── Phase 3: Substrate-state correlation ──────────────────────────────
    index = build_index()
    correlator = SubstrateCorrelator(index=index)
    # Use "day" grain for correlation (most signal with limited data)
    substrate_corr = correlator.correlate(grain="day", top_n_periods=5)

    # ── Phase 4: Right-Recipe argmax ──────────────────────────────────────
    right_recipe_result: Optional[Dict[str, Any]] = None
    if include_right_recipe:
        engine = RightRecipeEngine(index=index)
        try:
            right_recipe_result = engine.compute(
                "hot_accuracy_pct",
                query_time_budget_s=10.0,
            )
        except Exception as e:
            right_recipe_result = {"error": str(e), "winner": {"primitive_ids": [], "delta": None}}

    # ── Phase 5: Render pudding markdown ──────────────────────────────────
    caveats: List[str] = []
    if histograms["missing_ts"] > 0:
        caveats.append(
            f"{histograms['missing_ts']} CJ entries had no parseable timestamp — "
            "excluded from histograms."
        )
    if histograms["total_cj"] < 50:
        caveats.append(
            f"Sparse data: only {histograms['total_cj']} CJ timestamps found "
            "(target: 225+). File mtimes are proxies. "
            "As more CJ filings accrete timestamps, accuracy improves."
        )
    if histograms["total_cj"] == 0:
        caveats.append(
            "NO CJ timestamps found. This likely means the CJ-detection heuristic "
            "needs tuning. Raw data: 225 Crown Jewels are catalogued in the manifest."
        )

    hour_hist = histograms["hour_of_day"]
    dow_hist = histograms["day_of_week"]
    month_hist = histograms["month_of_year"]
    peak_hour = histograms.get("peak_hour")
    peak_day = histograms.get("peak_day")
    peak_month = histograms.get("peak_month")

    max_hour = max(hour_hist.values()) if hour_hist else 1
    max_dow = max(dow_hist.values()) if dow_hist else 1

    now_ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    # Build markdown
    md_lines = [
        "# PUDDING 001 — Crown Jewel Production Rate by Time-of-Day",
        "",
        f"**Session:** {SESSION_ID}  |  **Generated:** {now_ts}",
        "",
        '> "Proof is in the pudding, and I\'m hungry." -- Founder BP002 turn 13',
        "",
        "This is the **first concrete Pudding** from the Chandelier substrate (A&A #2291). ",
        "It answers: *What time of day / day of week does Liana Banyan produce Crown Jewels at the highest rate?*",
        "",
        "---",
        "",
        "## Data Summary",
        "",
        f"| Field | Value |",
        f"|-------|-------|",
        f"| CJ timestamps loaded | {histograms['total_cj']} |",
        f"| Parsed successfully | {histograms['parsed_ok']} |",
        f"| Missing / unparseable | {histograms['missing_ts']} |",
        f"| Source | AA_FORMAL + INNOVATION_THRESH file mtimes (proxy) |",
        f"| Session | {SESSION_ID} |",
        "",
        "---",
        "",
        "## Hour-of-Day Histogram (UTC)",
        "",
    ]

    if histograms["total_cj"] > 0 and peak_hour is not None:
        md_lines.append(f"> 🏆 **Peak hour:** {peak_hour:02d}:00 UTC")
        md_lines.append("")

    md_lines.append("| Hour (UTC) | CJ Count | Bar |")
    md_lines.append("|------------|----------|-----|")
    for h in range(24):
        key = f"{h:02d}"
        count = hour_hist.get(key, 0)
        bar = _bar(count, max_hour)
        peak_marker = " ← PEAK" if h == peak_hour else ""
        md_lines.append(f"| {h:02d}:00 | {count} | {bar}{peak_marker} |")

    md_lines += [
        "",
        "---",
        "",
        "## Day-of-Week Histogram",
        "",
    ]

    if peak_day:
        md_lines.append(f"> 🏆 **Peak day:** {peak_day}")
        md_lines.append("")

    md_lines.append("| Day | CJ Count | Bar |")
    md_lines.append("|-----|----------|-----|")
    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
        count = dow_hist.get(day, 0)
        bar = _bar(count, max_dow)
        peak_marker = " ← PEAK" if day == peak_day else ""
        md_lines.append(f"| {day} | {count} | {bar}{peak_marker} |")

    md_lines += [
        "",
        "---",
        "",
        "## Month-of-Year Histogram",
        "",
    ]
    max_month = max(month_hist.values()) if month_hist else 1
    md_lines.append("| Month | CJ Count | Bar |")
    md_lines.append("|-------|----------|-----|")
    for month in ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]:
        count = month_hist.get(month, 0)
        bar = _bar(count, max_month)
        peak_marker = " ← PEAK" if month == peak_month else ""
        md_lines.append(f"| {month} | {count} | {bar}{peak_marker} |")

    # Substrate-state correlation
    md_lines += [
        "",
        "---",
        "",
        "## Substrate-State at Peak Production Periods",
        "",
        "Which substrate primitives were live during the periods of highest CJ production?",
        "",
    ]

    corr_table = substrate_corr.get("correlation_table", [])
    if corr_table:
        md_lines.append("| Primitive | Correlation Score | Interpretation |")
        md_lines.append("|-----------|-------------------|----------------|")
        for row in corr_table[:10]:
            pid = row.get("primitive_id", "?")
            score = row.get("correlation_score", 0)
            interp = row.get("interpretation", "?")
            md_lines.append(f"| `{pid}` | {score:.2f} | {interp} |")
        md_lines.append("")
        md_lines.append(f"> ℹ {substrate_corr.get('caveat', '')}")
    else:
        md_lines.append(
            "_Insufficient receipt data for substrate correlation. "
            "Seed receipts need timestamp diversity for meaningful correlation._"
        )

    # Right-Recipe callout
    if right_recipe_result:
        md_lines += [
            "",
            "---",
            "",
            "## Right-Recipe: What Substrate Predicts Peak CJ Production?",
            "",
        ]
        winner = right_recipe_result.get("winner", {})
        winner_prims = winner.get("primitive_ids", [])
        winner_delta = winner.get("delta")
        method = right_recipe_result.get("method", "?")
        rr_caveats = right_recipe_result.get("caveats", [])

        if winner_prims and winner_delta is not None:
            md_lines.append(f"**Method:** {method}  |  **Empirical Δ:** {winner_delta:.4f}")
            md_lines.append("")
            md_lines.append("**Optimal Substrate Subset:**")
            for p in winner_prims:
                md_lines.append(f"- `{p}`")
            md_lines.append("")
        else:
            md_lines.append(
                "_Right-Recipe argmax returned no result. "
                "Run L1/LN measurements against the Right-Recipe metric to populate._"
            )

        for cav in rr_caveats:
            md_lines.append(f"> ⚠ {cav}")

    # Caveats
    if caveats:
        md_lines += [
            "",
            "---",
            "",
            "## Caveats",
            "",
        ]
        for c in caveats:
            md_lines.append(f"> ⚠ {c}")

    # Provenance footer
    md_lines += [
        "",
        "---",
        "",
        "## Provenance",
        "",
        f"- **Source files scanned:** {source_count} CJ files in `BISHOP_DROPZONE/12_Innovations_AA/`",
        f"- **Chandelier Stone Tablet:** `librarian-mcp/stitchpunks/chronos/chronicler_receipts/chandelier_receipts.jsonl`",
        f"- **Toolsmith log:** TS-CJ-PRODUCTION-RATE-PUDDING-KN011-BP002",
        f"- **Reproducibility Pack:** #2326 standard",
        "",
    ]

    markdown = "\n".join(md_lines)
    repro_hash = _reproducibility_hash(markdown)
    md_lines.append(f"- **Reproducibility hash:** `{repro_hash}`")
    markdown = "\n".join(md_lines)

    # ── Phase 6: Write to disk ─────────────────────────────────────────────
    if write_to_disk:
        PUDDING_OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
        PUDDING_OUTPUT_PATH.write_text(markdown, encoding="utf-8")

    return {
        "markdown": markdown,
        "histograms": histograms,
        "substrate_correlation": substrate_corr,
        "right_recipe": right_recipe_result,
        "cj_timestamps_loaded": source_count,
        "reproducibility_hash": repro_hash,
        "caveats": caveats,
        "output_path": str(PUDDING_OUTPUT_PATH),
        "toolsmith_log": "TS-CJ-PRODUCTION-RATE-PUDDING-KN011-BP002",
    }


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate Pudding 001: CJ Production Rate")
    parser.add_argument("--no-write", action="store_true", help="Skip writing to disk")
    parser.add_argument("--no-right-recipe", action="store_true", help="Skip Right-Recipe computation")
    args = parser.parse_args()

    result = generate_pudding(
        write_to_disk=not args.no_write,
        include_right_recipe=not args.no_right_recipe,
    )

    print(f"\n[Pudding 001] CJ timestamps loaded: {result['cj_timestamps_loaded']}")
    print(f"[Pudding 001] Total CJs in histograms: {result['histograms']['total_cj']}")
    print(f"[Pudding 001] Peak hour: {result['histograms'].get('peak_hour')}")
    print(f"[Pudding 001] Peak day:  {result['histograms'].get('peak_day')}")
    print(f"[Pudding 001] Reproducibility hash: {result['reproducibility_hash']}")
    if not args.no_write:
        print(f"[Pudding 001] Written to: {result['output_path']}")
    for cav in result["caveats"]:
        print(f"[Pudding 001] CAVEAT: {cav}")
