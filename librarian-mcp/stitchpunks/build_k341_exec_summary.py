"""
Build consolidated K341 execution summary from per-section outputs.

Input files:
  data/deep_reader_section_*.json

Output file:
  data/K341_EXEC_SUMMARY.json
"""

from __future__ import annotations

import glob
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List


DATA_DIR = Path(__file__).parent / "data"
INPUT_GLOB = str(DATA_DIR / "deep_reader_section_*.json")
OUTPUT_PATH = DATA_DIR / "K341_EXEC_SUMMARY.json"


def _load(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _dump(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def main() -> None:
    files = sorted(glob.glob(INPUT_GLOB))
    sections: List[Dict[str, Any]] = []
    out_of_registry_all: List[Dict[str, Any]] = []

    totals = {
        "sections_count": 0,
        "total_processed": 0,
        "total_errors": 0,
        "total_innovation_candidates": 0,
        "total_sec_flags": 0,
        "total_files_with_sec_flags": 0,
        "total_out_of_registry_candidates": 0,
    }

    for fp in files:
        data = _load(fp)
        summary = data.get("summary", {})
        section_name = data.get("section", Path(fp).stem.replace("deep_reader_section_", ""))

        sec_row = {
            "section": section_name,
            "file": str(Path(fp).name),
            "total_processed": summary.get("total_processed", 0),
            "total_errors": summary.get("total_errors", 0),
            "innovation_candidates": summary.get("innovation_candidates", 0),
            "sec_flags_total": summary.get("sec_flags_total", 0),
            "files_with_sec_flags": summary.get("files_with_sec_flags", 0),
            "out_of_registry_candidates": summary.get("out_of_registry_candidates", 0),
        }
        sections.append(sec_row)

        totals["sections_count"] += 1
        totals["total_processed"] += sec_row["total_processed"]
        totals["total_errors"] += sec_row["total_errors"]
        totals["total_innovation_candidates"] += sec_row["innovation_candidates"]
        totals["total_sec_flags"] += sec_row["sec_flags_total"]
        totals["total_files_with_sec_flags"] += sec_row["files_with_sec_flags"]
        totals["total_out_of_registry_candidates"] += sec_row["out_of_registry_candidates"]

        for o in data.get("out_of_registry_candidates", []):
            out_of_registry_all.append(
                {
                    "section": section_name,
                    "filename": o.get("filename"),
                    "archive_file": o.get("archive_file"),
                    "innovation_numbers_outside_registry": o.get("innovation_numbers_outside_registry", []),
                }
            )

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "task": "K341",
        "source_pattern": "data/deep_reader_section_*.json",
        "totals": totals,
        "sections": sections,
        "out_of_registry_candidates": out_of_registry_all,
    }

    _dump(OUTPUT_PATH, payload)
    print(f"Wrote {OUTPUT_PATH}")
    print(json.dumps(totals, indent=2))


if __name__ == "__main__":
    main()
