"""
SP-15 v2 Bulk Concatenator (one-shot).

v2 diffs from v1 concat:
  - Reads from EXTRACTED_V2/ (not EXTRACTED/)
  - Writes SESSION_REASONING_ARCHIVE_B109.md (not _B108)
  - Keeps two new v2 sections: LABELED ITERATIONS, EXACT QUOTES
  - Looser header regex tolerates parenthetical suffixes and mixed case
    (v2 prompt emits "## EXACT QUOTES (verbatim-locked phrasings)")

Drops "— none —" sections, concatenates with source attribution,
writes to 14_CanonicalReferences/.
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
EXTRACTED_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS" / "EXTRACTED_V2"
OUTPUT_PATH = PROJECT_ROOT / "BISHOP_DROPZONE" / "14_CanonicalReferences" / "SESSION_REASONING_ARCHIVE_B109.md"

# Ordered list of sections we keep (order preserved in output).
# Match against the NORMALIZED header (uppercase, parenthetical stripped).
KEEP_SECTIONS = [
    "SESSION METADATA",
    "DECISIONS MADE",
    "REJECTED ALTERNATIVES",
    "CANONICAL PHRASES LOCKED",
    "LABELED ITERATIONS",
    "EXACT QUOTES",
    "CROSS-LETTER / CROSS-DOCUMENT RULES",
    "NAMED FRAMEWORKS OR LAWS INTRODUCED",
    "CORRECTIONS / FACT CHANGES",
    "FOUNDER VOICE NOTES",
]

# Looser than v1: match any ## heading, capture entire heading text.
SECTION_HEADER_RE = re.compile(r"^##\s+(.+?)\s*$", re.MULTILINE)


def normalize_header(raw: str) -> str:
    """Strip parenthetical suffix, uppercase, collapse whitespace."""
    no_paren = re.sub(r"\s*\(.*?\)\s*$", "", raw)
    return re.sub(r"\s+", " ", no_paren).strip().upper()


def parse_sections(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    matches = list(SECTION_HEADER_RE.finditer(text))
    for i, m in enumerate(matches):
        name = normalize_header(m.group(1))
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        out[name] = body
    return out


def section_has_content(body: str) -> bool:
    if not body:
        return False
    stripped = body.strip()
    if stripped in ("— none —", "-- none --", "— NONE —", "none", "-- NONE --"):
        return False
    non_empty_lines = [ln for ln in stripped.splitlines() if ln.strip()]
    if len(non_empty_lines) == 1 and "none" in non_empty_lines[0].lower():
        return False
    return True


def main() -> None:
    files = sorted(EXTRACTED_DIR.glob("*.extracted.md"))
    if not files:
        sys.exit(f"No extractions in {EXTRACTED_DIR}")

    print(f"Reading {len(files)} v2 extractions...")

    blocks: list[str] = []
    total_sections_kept = 0
    total_sections_dropped = 0

    for f in files:
        raw = f.read_text(encoding="utf-8")
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
        "# Session-Derived Editorial Reasoning Archive — B109 (v2 preservation)",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Source:** SP-15 v2 Editorial Archaeologist extractions (tighter preservation: labeled iterations + exact quotes preserved verbatim)",
        f"**Sessions included:** {len(blocks)} (of {len(files)} v2 extractions — sessions with no non-empty substantive sections excluded)",
        f"**Sections kept / dropped:** {total_sections_kept} / {total_sections_dropped}",
        "",
        "**Supersedes:** `SESSION_REASONING_ARCHIVE_B108.md` (v1). v2 addresses the Q59 fidelity miss: labeled iterations (Version A/B/C, V1-Vn, Option N) are now preserved verbatim rather than collapsed into narrative prose.",
        "",
        "**Purpose:** R9 preload addition. Every Bishop session that loads this file has access to the editorial reasoning behind prior Crown Letter iterations, named frameworks, cross-letter rules, and locked canonical phrases — eliminating the LOCKED03-undoes-LOCKED01 drift pattern.",
        "",
        "**Maintenance:** append-only from SP-15 v2 outputs. New session extractions should be regenerated via `sp15v2_editorial_archaeologist.py` then re-consolidated via `sp15v2_bulk_concat.py`.",
        "",
        "---",
        "",
        "## How to read this archive",
        "",
        "Each block below is one session's extracted reasoning. Sections within a block (in order):",
        "- **SESSION METADATA** — date, primary topic, letter/project focus",
        "- **DECISIONS MADE** — editorial/design choices with rationale",
        "- **REJECTED ALTERNATIVES** — options considered and not taken",
        "- **CANONICAL PHRASES LOCKED** — exact wording chosen that MUST remain",
        "- **LABELED ITERATIONS** — Version A/B/C, V1-Vn, Option N variants preserved verbatim (v2 new)",
        "- **EXACT QUOTES** — verbatim-locked phrasings (v2 new)",
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
    print(f"  - MEMORY_PUBLIC + canonical_values + R9 brief + CANONICAL_LAWS = ~16k tokens")
    print(f"  - + v2 archive (~{approx_tokens:,} tokens)")
    print(f"  - = Total R9-v2 preload: ~{16_000 + approx_tokens:,} tokens")
    print(f"  - Haiku 4.5 context limit: 200,000 tokens")


if __name__ == "__main__":
    main()
