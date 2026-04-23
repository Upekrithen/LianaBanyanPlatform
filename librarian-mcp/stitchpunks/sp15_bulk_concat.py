"""
SP-15 Bulk Concatenator (one-shot).

Reads all *.extracted.md files from SESSION_TRANSCRIPTS/EXTRACTED/,
drops "— none —" sections, concatenates with source attribution,
writes SESSION_REASONING_ARCHIVE_B108.md to 14_CanonicalReferences/.

Prints a size estimate so we know whether it fits in R9 preload.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path
from datetime import datetime

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
EXTRACTED_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS" / "EXTRACTED"
OUTPUT_PATH = PROJECT_ROOT / "BISHOP_DROPZONE" / "14_CanonicalReferences" / "SESSION_REASONING_ARCHIVE_B108.md"

# Sections we keep from each extraction (SESSION METADATA is kept for context)
KEEP_SECTIONS = [
    "SESSION METADATA",
    "DECISIONS MADE",
    "REJECTED ALTERNATIVES",
    "CANONICAL PHRASES LOCKED",
    "CROSS-LETTER / CROSS-DOCUMENT RULES",
    "NAMED FRAMEWORKS OR LAWS INTRODUCED",
    "CORRECTIONS / FACT CHANGES",
    "FOUNDER VOICE NOTES",
]

SECTION_HEADER_RE = re.compile(r"^##\s+([A-Z][A-Z /-]+)\s*$", re.MULTILINE)

def parse_sections(text: str) -> dict[str, str]:
    """Split extraction text into {section_name: body} dict."""
    out: dict[str, str] = {}
    matches = list(SECTION_HEADER_RE.finditer(text))
    for i, m in enumerate(matches):
        name = m.group(1).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        out[name] = body
    return out


def section_has_content(body: str) -> bool:
    """True if body is non-trivial (not empty, not just '— none —')."""
    if not body:
        return False
    stripped = body.strip()
    if stripped in ("— none —", "-- none --", "— NONE —", "none", "-- NONE --"):
        return False
    # Body may have one bullet that says "— none —"; check that too
    non_empty_lines = [ln for ln in stripped.splitlines() if ln.strip()]
    if len(non_empty_lines) == 1 and "none" in non_empty_lines[0].lower():
        return False
    return True


def main() -> None:
    files = sorted(EXTRACTED_DIR.glob("*.extracted.md"))
    if not files:
        sys.exit(f"No extractions in {EXTRACTED_DIR}")

    print(f"Reading {len(files)} extractions...")

    # Group by primary focus (infer from filename + SESSION METADATA)
    blocks: list[str] = []
    total_sections_kept = 0
    total_sections_dropped = 0

    for f in files:
        raw = f.read_text(encoding="utf-8")
        # Strip the metadata header (everything before first ---)
        after_header = raw.split("---", 1)
        body = after_header[1].strip() if len(after_header) > 1 else raw
        sections = parse_sections(body)

        kept_sections: list[tuple[str, str]] = []
        for name in KEEP_SECTIONS:
            if name in sections and section_has_content(sections[name]):
                kept_sections.append((name, sections[name]))
                total_sections_kept += 1
            else:
                total_sections_dropped += 1

        # Only include this session's block if it has at least 1 non-metadata kept section
        non_meta_kept = [(n, b) for n, b in kept_sections if n != "SESSION METADATA"]
        if not non_meta_kept:
            continue

        block_lines = [f"### {f.stem}"]
        for name, body in kept_sections:
            block_lines.append(f"**{name}:**")
            block_lines.append(body)
            block_lines.append("")
        blocks.append("\n".join(block_lines))

    header = [
        "# Session-Derived Editorial Reasoning Archive — B108",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Source:** SP-15 Editorial Archaeologist extractions over SP-14 harvested transcripts",
        f"**Sessions included:** {len(blocks)} (of 54 total extractions — sessions with no non-empty substantive sections excluded)",
        f"**Sections kept / dropped:** {total_sections_kept} / {total_sections_dropped}",
        "",
        "**Purpose:** R9 preload addition. Every Bishop session that loads this file has access to the editorial reasoning behind prior Crown Letter iterations, named frameworks, cross-letter rules, and locked canonical phrases — eliminating the LOCKED03-undoes-LOCKED01 drift pattern.",
        "",
        "**Maintenance:** this file is append-only from SP-15 outputs. New session extractions should be regenerated via SP-15 then re-consolidated via `sp15_bulk_concat.py`.",
        "",
        "---",
        "",
        "## How to read this archive",
        "",
        "Each block below is one session's extracted reasoning. Sections within a block:",
        "- **SESSION METADATA** — date, primary topic, letter/project focus",
        "- **DECISIONS MADE** — editorial/design choices with rationale",
        "- **REJECTED ALTERNATIVES** — options considered and not taken",
        "- **CANONICAL PHRASES LOCKED** — exact wording chosen that MUST remain",
        "- **CROSS-LETTER / CROSS-DOCUMENT RULES** — what belongs where; what must NOT repeat",
        "- **NAMED FRAMEWORKS OR LAWS INTRODUCED** — new named concepts, principles, mechanisms",
        "- **CORRECTIONS / FACT CHANGES** — facts, numbers, terms updated",
        "- **FOUNDER VOICE NOTES** — voice, style, register preferences",
        "",
        "Empty sections in the underlying extractions have been dropped for density.",
        "",
        "---",
        "",
        "## Sessions",
        "",
    ]

    output = "\n".join(header) + "\n\n---\n\n".join(blocks) + "\n"

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(output, encoding="utf-8")

    char_count = len(output)
    approx_tokens = char_count // 4
    print(f"\nWrote {OUTPUT_PATH}")
    print(f"Sessions with content: {len(blocks)} / {len(files)}")
    print(f"Sections kept: {total_sections_kept} | dropped (empty): {total_sections_dropped}")
    print(f"Total chars: {char_count:,}")
    print(f"Approx tokens: {approx_tokens:,}")
    print()
    print(f"R9 preload budget check:")
    print(f"  - Current R9 preload (~16k tokens): MEMORY_PUBLIC + canonical_values.yaml + R9 brief + CANONICAL_LAWS")
    print(f"  - + This archive (~{approx_tokens:,} tokens)")
    print(f"  - = Total R9-v2 preload: ~{16_000 + approx_tokens:,} tokens")
    print(f"  - Haiku 4.5 context limit: 200,000 tokens (plenty of headroom)")


if __name__ == "__main__":
    main()
