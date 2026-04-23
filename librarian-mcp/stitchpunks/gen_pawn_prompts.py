"""
Generate per-family Pawn compilation prompts with embedded source content.
Aggressively deduplicates: only includes variants that are >15% different from
all previously included variants. Produces one .md file per family.
"""

import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple

from compilation_helper import (
    load_index, build_family_index, load_archive_record, console_safe
)

ROOT = Path(__file__).resolve().parent
DROPZONE = ROOT.parent.parent / "BISHOP_DROPZONE"
OUTPUT_DIR = DROPZONE / "PAWN_B44_FAMILY_PROMPTS"

MASTER_RULES = """## MISSION
You are compiling multiple versions of the same document into ONE canonical version.
The Founder (Jonathan Jones) wrote many documents multiple times as the platform evolved.

**Your job**: Produce ONE compiled version that:
1. Contains ALL unique, relevant information from every version
2. Does NOT repeat information that appears in multiple versions
3. Applies Founder Corrections (below) — later decisions ALWAYS override earlier ones
4. Is the FULL text, not a summary — preserve the Founder's voice and detail
5. Marks anything superseded as [SUPERSEDED] with the reason

## FOUNDER CORRECTIONS (ALWAYS APPLY)
- **Entity**: Liana Banyan CORPORATION (Wyoming C-Corp). NEVER "LLC"
- **Founder title**: "Founder & General Manager" — NEVER "CEO"
- **HEOHO**: "Help Each Other, Help Ourselves" = **Interdependence** (not independence)
- **Marks**: Effort-DIFFERENTIAL currency. Not just "effort tokens"
- **Credits**: NEVER cash out to fiat. One-way valve. Irrevocable.
- **Attribution**: Sponsorship Marks are ONE LEVEL ONLY. Not MLM. Never 2nd-degree.
- **Scott letter**: Subject is "Cardboard Boots" NOT "Flight of the Phoenix"
- **Bio**: "a veteran of no particular note" — enlisted at 16, Infantry 11B, OCS to IFR-rated Aviation 15A. Military = HARD BOUNDARY.
- **WWWWW**: DEAD. Correct name = **Medallion Sponsorship**
- **Membership**: $5/year. Creator keeps 83.3%. Platform margin: Cost + 20%.
- **"As You Wish"**: Transaction confirmation phrase
- **"No Atomo. Superman!"**: Period then exclamation (not comma)
- **Innovation count**: 2,130 (as of April 3, 2026). Crown Jewels: 168. Patents: 11 FILED.
- **Publication count**: ~260. NEVER say "7 papers"
- **Hexislo.com**: INTENTIONAL — Spanish version of HexIsle

## OUTPUT FORMAT
```markdown
# [COMPILED] {Document Title}

**Family**: {family name}
**Sources**: {count} unique versions compiled
**Compiled by**: PAWN B44
**Corrections applied**: {list which corrections were relevant}

---

{Full compiled content — NOT a summary}

---

## Compilation Notes
- Version 1: {filename} — used as base (most complete/latest)
- Version 2: {filename} — added {what was unique}
- Version 3: {filename} — SUPERSEDED content noted below
- etc.

## Superseded Content
{Any content explicitly overridden by later decisions, with reason}
```

## CRITICAL RULES
- This is FULL TEXT compilation, not summarization
- Preserve the Founder's voice
- When versions contradict, the LATER/HIGHER-NUMBERED version wins
- For LOCKED Crown Letters: the locked version IS canonical — earlier drafts add context only
- Include ALL unique content; when in doubt, INCLUDE rather than cut
"""


def similarity(a: str, b: str) -> float:
    """Quick similarity check using shared line ratio."""
    a_lines = set(a.splitlines())
    b_lines = set(b.splitlines())
    if not a_lines or not b_lines:
        return 0.0
    shared = len(a_lines & b_lines)
    return shared / max(len(a_lines), len(b_lines))


def get_distinct_versions(items: list, threshold: float = 0.85) -> List[Tuple[str, str, int]]:
    """Return truly distinct versions: (filename, content, char_count).
    Deduplicates by content hash, then filters by similarity threshold."""
    # Step 1: content-hash dedup
    by_hash: Dict[str, Tuple[str, str]] = {}
    for item in items:
        rec = load_archive_record(item.get("archive_file", ""))
        content = rec.get("content_markdown", "")
        if not content:
            continue
        h = hashlib.md5(content.encode()).hexdigest()
        fn = item.get("filename", "unknown")
        if h not in by_hash or len(content) > len(by_hash[h][1]):
            by_hash[h] = (fn, content)

    # Step 2: sort by length desc (longest = base)
    candidates = sorted(by_hash.values(), key=lambda x: len(x[1]), reverse=True)

    # Step 3: greedily select versions that are <threshold similar to all selected
    selected: List[Tuple[str, str, int]] = []
    for fn, content in candidates:
        is_distinct = True
        for _, sel_content, _ in selected:
            if similarity(content, sel_content) > threshold:
                is_distinct = False
                break
        if is_distinct:
            selected.append((fn, content, len(content)))

    return selected


def generate_prompt(family_name: str, versions: List[Tuple[str, str, int]]) -> str:
    """Generate a complete Pawn prompt for one family."""
    lines = []
    lines.append(f"# PAWN B44 — Compile: {family_name}")
    lines.append("")
    lines.append(MASTER_RULES)
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append(f"# SOURCE MATERIAL: {family_name}")
    lines.append(f"**{len(versions)} distinct versions** (duplicates and near-duplicates already removed)")
    lines.append("")

    for i, (fn, content, chars) in enumerate(versions, 1):
        label = "BASE (most complete)" if i == 1 else f"Version {i}"
        lines.append(f"## [{label}] {fn} ({chars:,} chars)")
        lines.append("")
        lines.append(content)
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("## YOUR TASK")
    lines.append(f"Compile all {len(versions)} versions above into ONE canonical document.")
    lines.append("Use the BASE as your foundation. Add unique content from other versions.")
    lines.append("Apply ALL Founder Corrections. Output in the format specified above.")
    lines.append("")
    lines.append(f"Save as: `COMPILED_{family_name.upper().replace('-', '_')}.md`")

    return "\n".join(lines)


def main():
    index = load_index()
    entries = index.get("entries", [])
    families = build_family_index(entries)

    # Default: top 5 letter families
    target_families = [
        "letter-warren-buffett",
        "letter-mackenzie-scott",
        "letter-erik-brynjolfsson",
        "letter-trebor-scholz",
        "letter-nathan-schneider",
    ]

    # Accept family names as args
    if len(sys.argv) > 1:
        target_families = sys.argv[1:]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for family_name in target_families:
        if family_name not in families:
            # Try partial match
            matches = [k for k in families if family_name in k]
            if matches:
                family_name = matches[0]
            else:
                print(f"SKIP: {family_name} not found")
                continue

        items = families[family_name]
        versions = get_distinct_versions(items, threshold=0.85)
        prompt = generate_prompt(family_name, versions)

        out_path = OUTPUT_DIR / f"PAWN_B44_COMPILE_{family_name.upper().replace('-', '_')}.md"
        out_path.write_text(prompt, encoding="utf-8")
        print(f"{family_name}: {len(items)} copies -> {len(versions)} distinct -> {len(prompt)/1024:.1f}KB -> {out_path.name}")


if __name__ == "__main__":
    main()
