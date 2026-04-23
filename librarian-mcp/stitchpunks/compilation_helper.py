"""
Compilation helper for document family workflows.

Usage:
  python compilation_helper.py --list
  python compilation_helper.py --list --section 10_LETTERS
  python compilation_helper.py --family "letter-warren-buffett"
  python compilation_helper.py --diff "letter-warren-buffett"
  python compilation_helper.py --submit "letter-warren-buffett" compiled.md
"""

import argparse
import difflib
import json
import os
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, List, Tuple

try:
    import requests
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
INDEX_PATH = DATA_DIR / "content_archive_index.json"
ARCHIVE_DIR = DATA_DIR / "content_archive"
ENV_PATH = ROOT / ".env"


def normalize_family_name(filename: str, slug: str = "") -> str:
    """Normalize filenames into stable family names."""
    name = filename.strip().lower()
    if "." in name:
        name = name.rsplit(".", 1)[0]
    name = re.sub(r"\s*\(copy\)$", "", name)
    name = re.sub(r"[-_ ](?:copy|final|draft|revised|rev\d+)$", "", name)
    name = re.sub(r"[-_ ]v\d+$", "", name)
    name = re.sub(r"[-_ ]\d{8,14}$", "", name)
    name = re.sub(r"[-_ ]\d+$", "", name)
    name = re.sub(r"[^a-z0-9]+", "-", name).strip("-")
    return name or slug or "unknown-family"


def console_safe(value: str) -> str:
    """Avoid Windows cp1252 print crashes on odd Unicode from archived files."""
    encoding = getattr(sys.stdout, "encoding", None) or "utf-8"
    return value.encode(encoding, errors="replace").decode(encoding, errors="replace")


def load_index() -> Dict[str, Any]:
    if not INDEX_PATH.exists():
        print(f"ERROR: Missing index file: {INDEX_PATH}")
        sys.exit(1)
    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_archive_record(archive_file: str) -> Dict[str, Any]:
    path = ARCHIVE_DIR / archive_file
    if not path.exists():
        return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_family_index(entries: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    families: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for entry in entries:
        family = normalize_family_name(entry.get("filename", ""), entry.get("slug", ""))
        families[family].append(entry)
    return families


def unique_variant_count(items: List[Dict[str, Any]]) -> int:
    hashes = {item.get("archive_file", "") for item in items if item.get("archive_file")}
    return len(hashes)


def get_family_variants(index_data: Dict[str, Any], family_name: str) -> Tuple[str, List[Dict[str, Any]]]:
    entries = index_data.get("entries", [])
    families = build_family_index(entries)
    # Exact match first, fallback to partial.
    if family_name in families:
        return family_name, families[family_name]
    for key in families.keys():
        if family_name in key:
            return key, families[key]
    return family_name, []


def cmd_list(index_data: Dict[str, Any], section_filter: str = "") -> None:
    entries = index_data.get("entries", [])
    families = build_family_index(entries)
    rows: List[Dict[str, Any]] = []
    for family_name, items in families.items():
        unique_variants = unique_variant_count(items)
        if unique_variants <= 1:
            continue
        section = items[0].get("section", "")
        if section_filter and section != section_filter:
            continue
        rows.append(
            {
                "family_name": family_name,
                "section": section,
                "category": items[0].get("category"),
                "variant_count": len(items),
                "unique_variants": unique_variants,
                "total_chars": sum(i.get("content_chars", 0) for i in items),
            }
        )

    rows.sort(key=lambda r: (r["unique_variants"], r["variant_count"], r["total_chars"]), reverse=True)
    print(f"\nFamilies needing compilation: {len(rows)}")
    if not rows:
        return
    print("-" * 120)
    print(f"{'Family':45} {'Section':20} {'Variants':8} {'Unique':6} {'KB':8}")
    print("-" * 120)
    for row in rows:
        kb = row["total_chars"] / 1024
        print(
            f"{row['family_name'][:45]:45} {row['section'][:20]:20} "
            f"{row['variant_count']:8d} {row['unique_variants']:6d} {kb:8.1f}"
        )


def cmd_family(index_data: Dict[str, Any], family_name: str) -> None:
    matched_name, variants = get_family_variants(index_data, family_name)
    if not variants:
        print(f"No family found for '{family_name}'.")
        return

    print(f"\nFamily: {matched_name}")
    print(f"Source files: {len(variants)} | Unique variants: {unique_variant_count(variants)}")
    print("=" * 120)
    for i, entry in enumerate(sorted(variants, key=lambda e: e.get("content_chars", 0), reverse=True), start=1):
        archive_data = load_archive_record(entry.get("archive_file", ""))
        content = archive_data.get("content_markdown", "")
        print(f"\n[{i}] {entry.get('filename')} ({entry.get('content_chars', 0)} chars)")
        print(f"Path: {entry.get('path')}")
        print("-" * 120)
        preview = content[:1200] + ("\n... [truncated]" if len(content) > 1200 else "")
        print(console_safe(preview))


def cmd_diff(index_data: Dict[str, Any], family_name: str) -> None:
    matched_name, variants = get_family_variants(index_data, family_name)
    if not variants:
        print(f"No family found for '{family_name}'.")
        return

    with_content = []
    for entry in variants:
        archive_data = load_archive_record(entry.get("archive_file", ""))
        content = archive_data.get("content_markdown", "")
        if content:
            with_content.append((entry, content))

    if len(with_content) < 2:
        print("Need at least two non-empty variants to diff.")
        return

    base_entry, base_content = max(with_content, key=lambda x: len(x[1]))
    base_lines = base_content.splitlines()

    print(f"\nFamily: {matched_name}")
    print(f"Base variant (longest): {base_entry.get('filename')} ({len(base_content)} chars)")
    print("=" * 120)

    for entry, content in with_content:
        if entry.get("archive_file") == base_entry.get("archive_file"):
            continue
        diff = difflib.ndiff(base_lines, content.splitlines())
        unique_lines = [line[2:] for line in diff if line.startswith("+ ") and line[2:].strip()]
        print(f"\nVariant: {entry.get('filename')} ({len(content)} chars)")
        print(f"Unique lines vs base: {len(unique_lines)}")
        print("-" * 120)
        if unique_lines:
            preview = unique_lines[:80]
            print(console_safe("\n".join(preview)))
            if len(unique_lines) > len(preview):
                print(f"... [{len(unique_lines) - len(preview)} more unique lines]")
        else:
            print("(No unique additions over base)")


def make_submit_payload(index_data: Dict[str, Any], family_name: str, compiled_markdown: str) -> Dict[str, Any]:
    matched_name, variants = get_family_variants(index_data, family_name)
    if not variants:
        raise ValueError(f"No family found for '{family_name}'")

    source_files = []
    for entry in variants:
        source_files.append(
            {
                "path": entry.get("path"),
                "filename": entry.get("filename"),
                "content_hash": (entry.get("archive_file") or "").replace(".json", ""),
                "chars": entry.get("content_chars", 0),
            }
        )

    base_title = variants[0].get("title") or matched_name.replace("-", " ").title()
    return {
        "slug": f"compiled-{matched_name}",
        "title": f"[COMPILED] {base_title}",
        "family_name": matched_name,
        "section": variants[0].get("section"),
        "category": variants[0].get("category"),
        "section_librarian": variants[0].get("section_librarian"),
        "compiled_markdown": compiled_markdown,
        "source_count": len(variants),
        "source_files": source_files,
        "unique_variants": unique_variant_count(variants),
        "compilation_notes": "Compiled via compilation_helper.py",
        "compiled_by": "BISHOP",
        "founder_corrections_applied": [],
        "status": "draft",
    }


def cmd_submit(index_data: Dict[str, Any], family_name: str, markdown_path: str) -> None:
    if requests is None:
        print("ERROR: requests package missing. Install with: pip install requests")
        return

    if load_dotenv:
        load_dotenv(ENV_PATH)

    supabase_url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or os.environ.get("SUPABASE_ANON_KEY", "")
    if not supabase_url or not service_key:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are required")
        return

    file_path = Path(markdown_path)
    if not file_path.exists():
        print(f"ERROR: compiled markdown file not found: {markdown_path}")
        return

    compiled_markdown = file_path.read_text(encoding="utf-8")
    payload = make_submit_payload(index_data, family_name, compiled_markdown)
    endpoint = f"{supabase_url}/functions/v1/compile-document"

    response = requests.post(
        endpoint,
        headers={
            "Authorization": f"Bearer {service_key}",
            "apikey": service_key,
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=60,
    )
    if response.status_code >= 300:
        print(f"ERROR {response.status_code}: {response.text}")
        return
    print("Submit success:")
    print(response.text)


def main() -> None:
    parser = argparse.ArgumentParser(description="Document family compilation helper")
    parser.add_argument("--family", type=str, help="Show all variants for a family")
    parser.add_argument("--diff", type=str, help="Show unique lines in each variant compared to longest base variant")
    parser.add_argument("--list", action="store_true", help="List families needing compilation")
    parser.add_argument("--section", type=str, help="Filter --list by section (e.g. 10_LETTERS)")
    parser.add_argument("--submit", nargs=2, metavar=("FAMILY", "MARKDOWN_PATH"),
                        help='Submit compiled markdown to compile-document edge function')
    args = parser.parse_args()

    if not any([args.family, args.diff, args.list, args.submit]):
        parser.print_help()
        return

    index_data = load_index()

    if args.list:
        cmd_list(index_data, args.section or "")
    if args.family:
        cmd_family(index_data, args.family)
    if args.diff:
        cmd_diff(index_data, args.diff)
    if args.submit:
        cmd_submit(index_data, args.submit[0], args.submit[1])


if __name__ == "__main__":
    main()
