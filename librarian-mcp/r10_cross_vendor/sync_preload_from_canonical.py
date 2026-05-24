#!/usr/bin/env python3
"""
sync_preload_from_canonical.py — Strategy B auto-sync (BP046 W1).

Reads canonical_values.yaml and patches r9v2_preload.md so the static
cross-vendor benchmark preload never drifts from canonical truth.

Patches:
  1. SECTION 2 `stats:` YAML block
  2. SECTION 2 `patents:` YAML block (most_recent_prov_* fields)
  3. "Critical Numbers" bullet list
  4. SECTION 7 "Filing Status" bullets
  5. Top-of-file `# CANONICAL SYNC: <iso>` stamp

Exit 0 on success with a summary of changed fields.
Exit 1 on any I/O or parse failure.
"""
from __future__ import annotations

import datetime as _dt
import re
import sys
from pathlib import Path

try:
    import yaml  # PyYAML
except ImportError:
    sys.stderr.write("ERROR: PyYAML is required (`pip install pyyaml`).\n")
    sys.exit(1)

HERE = Path(__file__).resolve().parent
CANONICAL = HERE.parent / "canonical_values.yaml"
PRELOAD = HERE / "r9v2_preload.md"

SYNC_STAMP_RE = re.compile(r"^# CANONICAL SYNC: .*\n", re.MULTILINE)


def load_canonical() -> dict:
    with CANONICAL.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def render_stats_yaml(stats: dict) -> str:
    keys = [
        "innovation_count",
        "crown_jewels",
        "production_systems",
        "patent_provisionals_filed",
        "formal_claims_approximate",
        "puddings",
        "papers",
        "letters_in_dispatch_queue",
        "vessel_tiers",
        "cold_start_pathways",
    ]
    lines = ["stats:"]
    for k in keys:
        if k in stats:
            lines.append(f"  {k}: {stats[k]}")
    return "\n".join(lines)


def render_patents_yaml(patents: dict) -> str:
    keys = [
        "most_recent_prov_number",
        "most_recent_prov_application",
        "most_recent_prov_filed",
        "next_prov_number",
        "next_prov_status",
        "conversion_deadline_first_prov",
    ]
    lines = ["patents:"]
    for k in keys:
        if k in patents:
            v = patents[k]
            v_str = f'"{v}"' if isinstance(v, str) else str(v)
            lines.append(f"  {k}: {v_str}")
    return "\n".join(lines)


def patch_block(text: str, block_name: str, new_block: str) -> tuple[str, bool]:
    """Replace `<block_name>:` YAML block (terminated by blank line or next top-level key)."""
    pattern = re.compile(
        rf"(?ms)^{re.escape(block_name)}:\n(?:[ \t]+.*\n)+"
    )
    m = pattern.search(text)
    if not m:
        return text, False
    new = new_block.rstrip() + "\n"
    return text[: m.start()] + new + text[m.end() :], True


def patch_critical_numbers(text: str, stats: dict, patents: dict) -> tuple[str, list[str]]:
    """Patch numbered values inside the `### Critical Numbers` block."""
    changes: list[str] = []
    block_re = re.compile(
        r"(### Critical Numbers \(must be exact\)\n)(.*?)(\n---\n)", re.DOTALL
    )
    m = block_re.search(text)
    if not m:
        return text, changes
    header, body, footer = m.group(1), m.group(2), m.group(3)

    def sub(line_re: str, replacement: str, label: str, body: str) -> str:
        new_body, n = re.subn(line_re, replacement, body)
        if n and new_body != body:
            changes.append(label)
        return new_body

    body = sub(
        r"\*\*Innovations:\*\* [\d,]+( .*)?",
        f"**Innovations:** {stats['innovation_count']:,} (synced from canonical_values.yaml)",
        "Critical/Innovations",
        body,
    )
    body = sub(
        r"\*\*Patent applications:\*\* \d+ provisional applications FILED( .*)?",
        f"**Patent applications:** {stats['patent_provisionals_filed']} provisional applications FILED (synced from canonical_values.yaml)",
        "Critical/Patents",
        body,
    )
    body = sub(
        r"\*\*Formal claims:\*\* ~[\d,]+ across \d+ provisional applications( .*)?",
        f"**Formal claims:** ~{stats['formal_claims_approximate']:,} across {stats['patent_provisionals_filed']} provisional applications (synced from canonical_values.yaml)",
        "Critical/Claims",
        body,
    )
    body = sub(
        r"\*\*Crown Jewels:\*\* \d+( .*)?",
        f"**Crown Jewels:** {stats['crown_jewels']} (synced from canonical_values.yaml)",
        "Critical/CrownJewels",
        body,
    )
    body = sub(
        r"\*\*Production systems:\*\* \d+",
        f"**Production systems:** {stats['production_systems']}",
        "Critical/ProductionSystems",
        body,
    )
    body = sub(
        r"\*\*Puddings:\*\* \d+( .*)?",
        f"**Puddings:** {stats['puddings']} (synced from canonical_values.yaml)",
        "Critical/Puddings",
        body,
    )
    body = sub(
        r"\*\*Last reconciliation:\*\* .*",
        f"**Last reconciliation:** auto-synced {_dt.datetime.utcnow().strftime('%Y-%m-%d')} from canonical_values.yaml",
        "Critical/LastRecon",
        body,
    )

    return text[: m.start()] + header + body + footer + text[m.end() :], changes


def patch_filing_status(text: str, stats: dict, patents: dict) -> tuple[str, list[str]]:
    changes: list[str] = []
    block_re = re.compile(
        r"(### Filing Status\n)(.*?)(\n### )", re.DOTALL
    )
    m = block_re.search(text)
    if not m:
        return text, changes
    header, body, footer = m.group(1), m.group(2), m.group(3)

    def sub(line_re: str, replacement: str, label: str, body: str) -> str:
        new_body, n = re.subn(line_re, replacement, body)
        if n and new_body != body:
            changes.append(label)
        return new_body

    body = sub(
        r"- \*\*\d+ provisional applications FILED\*\* \(most recent: [\d/,]+, filed [A-Za-z0-9, ]+\)( .*)?",
        f"- **{stats['patent_provisionals_filed']} provisional applications FILED** (most recent: {patents['most_recent_prov_application']}, filed {patents['most_recent_prov_filed']}) — synced from canonical_values.yaml",
        "Filing/Provisionals",
        body,
    )
    body = sub(
        r"- \*\*~[\d,]+ formal claims\*\* across all provisionals( .*)?",
        f"- **~{stats['formal_claims_approximate']:,} formal claims** across all provisionals — synced from canonical_values.yaml",
        "Filing/Claims",
        body,
    )
    body = sub(
        r"- \*\*\d+ Crown Jewels\*\* \(innovations with no prior art found\)( .*)?",
        f"- **{stats['crown_jewels']} Crown Jewels** (innovations with no prior art found) — synced from canonical_values.yaml",
        "Filing/CrownJewels",
        body,
    )

    return text[: m.start()] + header + body + footer + text[m.end() :], changes


def stamp_sync_header(text: str, iso: str) -> str:
    stamp = f"# CANONICAL SYNC: {iso} from canonical_values.yaml\n"
    text = SYNC_STAMP_RE.sub("", text, count=1)
    return stamp + text


def main() -> int:
    if not CANONICAL.exists():
        sys.stderr.write(f"ERROR: missing {CANONICAL}\n")
        return 1
    if not PRELOAD.exists():
        sys.stderr.write(f"ERROR: missing {PRELOAD}\n")
        return 1

    data = load_canonical()
    stats = data.get("stats") or {}
    patents = data.get("patents") or {}
    if not stats or not patents:
        sys.stderr.write("ERROR: canonical_values.yaml missing stats/patents block\n")
        return 1

    original = PRELOAD.read_text(encoding="utf-8")
    text = original
    changes: list[str] = []

    text, ok = patch_block(text, "stats", render_stats_yaml(stats))
    if ok:
        changes.append("yaml/stats")
    text, ok = patch_block(text, "patents", render_patents_yaml(patents))
    if ok:
        changes.append("yaml/patents")

    text, crit_changes = patch_critical_numbers(text, stats, patents)
    changes.extend(crit_changes)

    text, file_changes = patch_filing_status(text, stats, patents)
    changes.extend(file_changes)

    iso = _dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    text = stamp_sync_header(text, iso)

    if text == original:
        print(f"[sync_preload] no changes (already synced at {iso})")
        return 0

    PRELOAD.write_text(text, encoding="utf-8")
    print(f"[sync_preload] stamped {iso}")
    print(f"[sync_preload] patched {len(changes)} fields:")
    for c in changes:
        print(f"  - {c}")
    print(f"[sync_preload] canonical: {CANONICAL}")
    print(f"[sync_preload] target:    {PRELOAD}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
