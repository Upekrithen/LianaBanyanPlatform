"""
Extract family source material for Pawn compilation prompts.

Outputs BASE variant in full + unique-only lines from other variants,
minimizing token waste while preserving all unique content.

Usage:
  python extract_for_pawn.py letter-warren-buffett letter-mackenzie-scott
  python extract_for_pawn.py --batch letter-warren-buffett letter-mackenzie-scott
  python extract_for_pawn.py --list-letters   (show all letter families)
"""

import argparse
import sys
from pathlib import Path

from compilation_helper import (
    build_family_index,
    console_safe,
    load_archive_record,
    load_index,
    get_family_variants,
    unique_variant_count,
)

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "BISHOP_DROPZONE" / "PAWN_FAMILY_SOURCES"


def extract_family(index_data: dict, family_name: str) -> str:
    """Build markdown extraction for one family: full base + unique diffs."""
    matched_name, variants = get_family_variants(index_data, family_name)
    if not variants:
        return f"# SOURCE MATERIAL: {family_name}\n\nERROR: No family found for '{family_name}'.\n"

    # Load content for each variant, dedup by archive_file
    seen_archives = set()
    with_content = []
    for entry in variants:
        af = entry.get("archive_file", "")
        if af in seen_archives:
            continue
        seen_archives.add(af)
        archive_data = load_archive_record(af)
        content = archive_data.get("content_markdown", "")
        if content:
            with_content.append((entry, content))

    if not with_content:
        return f"# SOURCE MATERIAL: {matched_name}\n\nERROR: No content found.\n"

    # Sort by content length descending; longest = base
    with_content.sort(key=lambda x: len(x[1]), reverse=True)
    base_entry, base_content = with_content[0]
    base_lines = base_content.splitlines()
    base_line_set = set(line.strip() for line in base_lines if line.strip())

    parts = []
    parts.append(f"# SOURCE MATERIAL: {matched_name}")
    parts.append(f"## Base Variant: {base_entry.get('filename')} ({len(base_content)} chars)")
    parts.append("")
    parts.append(base_content)
    parts.append("")

    # Other variants: unique lines only
    other_variants = with_content[1:]
    if other_variants:
        parts.append("## Unique Additions from Other Variants")
        parts.append("")
        for entry, content in other_variants:
            variant_lines = content.splitlines()
            unique_lines = [
                line for line in variant_lines
                if line.strip() and line.strip() not in base_line_set
            ]
            parts.append(f"### {entry.get('filename')} ({len(unique_lines)} unique lines)")
            parts.append("")
            if unique_lines:
                parts.append("\n".join(unique_lines))
            else:
                parts.append("(No unique additions over base)")
            parts.append("")
    else:
        parts.append("## Unique Additions from Other Variants")
        parts.append("")
        parts.append("(Only one variant exists -- no diffs needed)")
        parts.append("")

    return "\n".join(parts)


def write_family_file(index_data: dict, family_name: str) -> tuple:
    """Write single-family markdown. Returns (path, char_count)."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    md = extract_family(index_data, family_name)
    out_path = OUTPUT_DIR / f"{family_name}.md"
    out_path.write_text(md, encoding="utf-8")
    return out_path, len(md)


def write_batch_file(index_data: dict, family_names: list, batch_name: str = "batch") -> tuple:
    """Combine multiple families into one file. Returns (path, char_count)."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sections = []
    for name in family_names:
        sections.append(extract_family(index_data, name))
    combined = "\n---\n\n".join(sections)
    out_path = OUTPUT_DIR / f"BATCH_{batch_name}.md"
    out_path.write_text(combined, encoding="utf-8")
    return out_path, len(combined)


def cmd_list_letters(index_data: dict) -> None:
    """List all letter families with variant counts."""
    entries = index_data.get("entries", [])
    families = build_family_index(entries)
    letter_families = {k: v for k, v in families.items() if k.startswith("letter-")}
    print(f"\nLetter families: {len(letter_families)}")
    print("-" * 90)
    print(f"{'Family':50} {'Variants':10} {'Unique':8} {'KB':8}")
    print("-" * 90)
    for name in sorted(letter_families.keys()):
        items = letter_families[name]
        uv = unique_variant_count(items)
        kb = sum(i.get("content_chars", 0) for i in items) / 1024
        print(f"{name[:50]:50} {len(items):10d} {uv:8d} {kb:8.1f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract family sources for Pawn prompts")
    parser.add_argument("families", nargs="*", help="Family names to extract")
    parser.add_argument("--batch", action="store_true", help="Combine all families into one output file")
    parser.add_argument("--batch-name", type=str, default="pawn_sources", help="Name for batch output file")
    parser.add_argument("--list-letters", action="store_true", help="List all letter families")
    args = parser.parse_args()

    if not args.families and not args.list_letters:
        parser.print_help()
        return

    index_data = load_index()

    if args.list_letters:
        cmd_list_letters(index_data)
        return

    if args.batch:
        out_path, chars = write_batch_file(index_data, args.families, args.batch_name)
        print(console_safe(f"Batch file written: {out_path}"))
        print(f"Total characters: {chars:,} ({chars / 1024:.1f} KB)")
    else:
        total_chars = 0
        for name in args.families:
            out_path, chars = write_family_file(index_data, name)
            total_chars += chars
            print(console_safe(f"  {name}: {out_path.name} ({chars:,} chars)"))
        print(f"\nTotal across {len(args.families)} files: {total_chars:,} chars ({total_chars / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
