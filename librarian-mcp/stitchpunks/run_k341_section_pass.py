"""
K341 runner: section-by-section SP-12 deep reader pass.

Generates:
  data/deep_reader_section_<SECTION>.json

For each section:
  - Runs SP-12 classification
  - Reads archive JSON content for each innovation candidate
  - Writes 1-2 sentence summary per candidate
  - Flags innovation numbers outside known registry range (#1-#2211)
"""

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from sp12_deep_reader import (
    DATA_DIR,
    extract_innovation_numbers,
    load_archive_content,
    load_index,
    process_entries,
)


REGISTRY_MAX = 2211
DEFAULT_SECTIONS = [
    "uncategorized",
    "02_WRITTEN",
    "01_BLUEPRINTS",
    "08_JOURNALS",
    "07_REFERENCE_MATERIALS",
    "06_CAMPAIGN_MATERIALS",
    "03_PATENT_BAGS",
    "04_PRESS_ARTICLES",
    "09_CONTEXT_MANAGEMENT",
]


def _safe_dump(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def _clean_line(line: str) -> str:
    line = re.sub(r"`{1,3}", "", line)
    line = re.sub(r"^\s{0,3}#{1,6}\s*", "", line)
    line = re.sub(r"^\s*[-*+]\s+", "", line)
    line = re.sub(r"\[[^\]]+\]\([^)]+\)", "", line)  # markdown links
    line = re.sub(r"\s+", " ", line).strip()
    return line


def _summarize_content(content: str) -> str:
    lines = [_clean_line(x) for x in content.splitlines()]
    lines = [x for x in lines if x]
    if not lines:
        return "No readable text found in archive content."

    joined = " ".join(lines[:120])
    # Split on sentence boundaries.
    sentences = re.split(r"(?<=[.!?])\s+", joined)
    sentences = [s.strip() for s in sentences if s.strip()]
    if not sentences:
        return joined[:360]

    if len(sentences) == 1:
        return sentences[0][:360]

    summary = f"{sentences[0]} {sentences[1]}"
    return summary[:520]


def _enrich_candidates(candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    enriched: List[Dict[str, Any]] = []
    out_of_registry: List[Dict[str, Any]] = []

    for c in candidates:
        archive_file = c.get("archive_file", "")
        content = load_archive_content(archive_file) or ""
        summary = _summarize_content(content)

        nums = c.get("innovation_numbers")
        if nums is None:
            nums = extract_innovation_numbers(content)

        outside = [n for n in nums if n < 1 or n > REGISTRY_MAX]
        if outside:
            out_of_registry.append(
                {
                    "filename": c.get("filename"),
                    "archive_file": archive_file,
                    "innovation_numbers_outside_registry": sorted(set(outside)),
                }
            )

        enriched.append(
            {
                **c,
                "summary": summary,
                "innovation_numbers": nums,
                "innovation_numbers_outside_registry": sorted(set(outside)),
                "registry_check": (
                    "outside_registry"
                    if outside
                    else "within_registry_or_not_numbered"
                ),
            }
        )

    return {
        "innovation_candidates_enriched": enriched,
        "out_of_registry_candidates": out_of_registry,
    }


def run_section(section: str, index_entries: List[Dict[str, Any]]) -> Path:
    entries = [e for e in index_entries if e.get("section") == section]
    findings = process_entries(entries, dry_run=False)
    enriched = _enrich_candidates(findings.get("innovation_candidates", []))

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "section": section,
        "registry_range_checked": "1-2211",
        "source_total_entries": len(entries),
        "summary": {
            "total_processed": findings.get("total_processed", 0),
            "total_errors": findings.get("total_errors", 0),
            "innovation_candidates": len(findings.get("innovation_candidates", [])),
            "sec_flags_total": len(findings.get("sec_flags", [])),
            "out_of_registry_candidates": len(enriched["out_of_registry_candidates"]),
        },
        "classifications": findings.get("classifications", {}),
        "by_section": findings.get("by_section", {}),
        "innovation_numbers_found": findings.get("innovation_numbers_found", []),
        "innovation_candidates": enriched["innovation_candidates_enriched"],
        "out_of_registry_candidates": enriched["out_of_registry_candidates"],
        "sec_flags": findings.get("sec_flags", []),
    }

    output_path = DATA_DIR / f"deep_reader_section_{section}.json"
    _safe_dump(output_path, payload)
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="K341 section pass runner")
    parser.add_argument(
        "--sections",
        nargs="*",
        default=DEFAULT_SECTIONS,
        help="Section names to process (default: K341 target sections)",
    )
    args = parser.parse_args()

    index_entries = load_index()
    for section in args.sections:
        print(f"\n=== Processing section: {section} ===")
        out = run_section(section, index_entries)
        print(f"Wrote: {out}")


if __name__ == "__main__":
    main()
