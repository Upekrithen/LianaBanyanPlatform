"""
Batch auto-compilation for document families.
B081: Founder directive — process ALL remaining families.

For each family with 2+ variants:
  1. Select the longest variant as canonical base
  2. Submit to compile-document edge function
  3. Track progress

Usage:
  python batch_compile.py                          # Compile all sections
  python batch_compile.py --section 02_WRITTEN     # One section
  python batch_compile.py --section 10_LETTERS     # Letters only
  python batch_compile.py --dry-run                # Preview without submitting
  python batch_compile.py --stats                  # Show current state
"""

import argparse
import json
import os
import sys
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path

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
PROGRESS_PATH = DATA_DIR / "compilation_progress.json"

# Sections to compile (content-heavy, not code)
CONTENT_SECTIONS = {
    '01_BLUEPRINTS', '02_WRITTEN', '03_PATENT_BAGS', '04_PRESS_ARTICLES',
    '06_CAMPAIGN_MATERIALS', '07_REFERENCE_MATERIALS', '08_JOURNALS',
    '09_CONTEXT_MANAGEMENT', '10_LETTERS', 'uncategorized'
}

# Skip code-heavy sections unless explicitly requested
CODE_SECTIONS = {'05_TECHNICAL_SPECS'}


def load_env():
    if load_dotenv and ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    url = os.environ.get('SUPABASE_URL', '')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    return url, key


def normalize_family_name(filename, slug=""):
    import re
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


def load_archive_content(archive_file):
    path = ARCHIVE_DIR / archive_file
    if not path.exists():
        return ""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('content_markdown', '')
    except Exception:
        return ""


def submit_compiled(url, key, payload):
    """Submit compiled document to edge function."""
    if not requests:
        print("    ERROR: requests library not installed")
        return False

    fn_url = f"{url}/functions/v1/compile-document"
    headers = {
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json',
    }

    # Sanitize content — remove null bytes, control chars, invalid UTF-8
    md = payload.get('compiled_markdown', '')
    md = md.replace('\x00', '').replace('\r', '')
    md = ''.join(c if ord(c) >= 32 or c in '\n\t' else '' for c in md)
    payload['compiled_markdown'] = md

    # Cap compiled_markdown at 500KB to avoid edge function payload limits
    MAX_MARKDOWN = 500_000
    if len(md) > MAX_MARKDOWN:
        payload['compiled_markdown'] = md[:MAX_MARKDOWN] + f'\n\n[... LODE: truncated at {MAX_MARKDOWN} chars, full content is {len(md)} chars ...]'
        payload['compilation_notes'] = (payload.get('compilation_notes', '') or '') + f' | LODE: {len(md)} chars total, truncated to {MAX_MARKDOWN}'

    try:
        resp = requests.post(fn_url, json=payload, headers=headers, timeout=60)
        if resp.status_code == 200:
            return True
        else:
            print(f"    ERROR: {resp.status_code} - {resp.text[:200]}")
            return False
    except Exception as e:
        print(f"    ERROR: {e}")
        return False


def run_compilation(section_filter=None, include_code=False, dry_run=False):
    print("=" * 70)
    print("  BATCH COMPILATION — B081")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if section_filter:
        print(f"  Section filter: {section_filter}")
    if dry_run:
        print("  MODE: DRY RUN (no submissions)")
    print("=" * 70)

    # Load index
    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    entries = index_data.get('entries', [])
    print(f"\n  Total archive entries: {len(entries)}")

    # Build family index
    families = defaultdict(list)
    for entry in entries:
        family = normalize_family_name(entry.get('filename', ''), entry.get('slug', ''))
        families[family].append(entry)

    # Filter to multi-variant families in target sections
    allowed_sections = CONTENT_SECTIONS | (CODE_SECTIONS if include_code else set())

    compile_queue = []
    for family_name, items in families.items():
        if len(items) < 2:
            continue
        section = items[0].get('section', 'uncategorized')
        if section_filter and section != section_filter:
            continue
        if section not in allowed_sections:
            continue
        compile_queue.append((family_name, items, section))

    compile_queue.sort(key=lambda x: len(x[1]), reverse=True)
    print(f"  Families to compile: {len(compile_queue)}")

    if not compile_queue:
        print("  Nothing to compile.")
        return

    # Load Supabase credentials
    url, key = load_env()
    if not dry_run and (not url or not key):
        print("  ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        print("  Set in .env or environment variables")
        return

    compiled = 0
    failed = 0
    skipped = 0

    for i, (family_name, items, section) in enumerate(compile_queue):
        # Find the best (longest content) variant
        best_entry = None
        best_content = ""
        best_chars = 0

        for entry in items:
            archive_file = entry.get('archive_file', '')
            if not archive_file:
                continue
            content = load_archive_content(archive_file)
            if len(content) > best_chars:
                best_chars = len(content)
                best_content = content
                best_entry = entry

        if not best_entry or not best_content:
            skipped += 1
            continue

        # Build source files list
        source_files = []
        for entry in items:
            source_files.append({
                'path': entry.get('path'),
                'filename': entry.get('filename'),
                'content_hash': (entry.get('archive_file') or '').replace('.json', ''),
                'chars': entry.get('content_chars', 0),
            })

        # Cap source_files to avoid oversized JSONB
        MAX_SOURCES = 100
        if len(source_files) > MAX_SOURCES:
            source_files = sorted(source_files, key=lambda x: x.get('chars', 0), reverse=True)[:MAX_SOURCES]

        base_title = best_entry.get('title') or family_name.replace('-', ' ').title()
        payload = {
            'slug': f"compiled-{family_name}",
            'title': f"[COMPILED] {base_title}",
            'family_name': family_name,
            'section': section,
            'category': best_entry.get('category'),
            'section_librarian': best_entry.get('section_librarian'),
            'compiled_markdown': best_content,
            'source_count': len(items),
            'source_files': source_files,
            'unique_variants': len(set(e.get('archive_file', '') for e in items)),
            'compilation_notes': f'Auto-compiled B081 batch. Best variant: {best_entry.get("filename")}',
            'compiled_by': 'BISHOP',
            'founder_corrections_applied': ['B081_AUTO_COMPILATION'],
            'status': 'draft',
        }

        if dry_run:
            print(f"  [{i+1}/{len(compile_queue)}] {family_name} ({section}, {len(items)} variants, {best_chars} chars) — would submit")
            compiled += 1
        else:
            ok = submit_compiled(url, key, payload)
            if ok:
                compiled += 1
                if compiled % 50 == 0:
                    print(f"  ... {compiled} compiled ({i+1}/{len(compile_queue)})")
            else:
                failed += 1

            # Rate limit
            if (i + 1) % 25 == 0:
                time.sleep(1)

    print(f"\n  COMPILATION COMPLETE")
    print(f"  Compiled: {compiled}")
    print(f"  Failed: {failed}")
    print(f"  Skipped (no content): {skipped}")
    print(f"  Total families processed: {len(compile_queue)}")

    # Save progress
    progress = {
        'timestamp': datetime.now().isoformat(),
        'phase': 'B081_batch_compilation',
        'section_filter': section_filter,
        'compiled_count': compiled,
        'failed_count': failed,
        'skipped_count': skipped,
        'total_families': len(compile_queue),
    }
    with open(PROGRESS_PATH, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2)


def show_stats():
    if not INDEX_PATH.exists():
        print("No archive index found.")
        return

    with open(INDEX_PATH, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    entries = index_data.get('entries', [])
    families = defaultdict(list)
    for entry in entries:
        family = normalize_family_name(entry.get('filename', ''), entry.get('slug', ''))
        families[family].append(entry)

    multi = {k: v for k, v in families.items() if len(v) >= 2}
    by_section = defaultdict(int)
    for items in multi.values():
        by_section[items[0].get('section', 'unknown')] += 1

    print(f"\nTotal archive entries: {len(entries)}")
    print(f"Total families: {len(families)}")
    print(f"Multi-variant families (need compilation): {len(multi)}")
    print(f"\nBy section:")
    for sec, cnt in sorted(by_section.items(), key=lambda x: -x[1]):
        print(f"  {sec}: {cnt}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Batch document compilation')
    parser.add_argument('--section', help='Filter to specific section')
    parser.add_argument('--include-code', action='store_true', help='Include 05_TECHNICAL_SPECS')
    parser.add_argument('--dry-run', action='store_true', help='Preview without submitting')
    parser.add_argument('--stats', action='store_true', help='Show current state')
    args = parser.parse_args()

    if args.stats:
        show_stats()
    else:
        run_compilation(
            section_filter=args.section,
            include_code=args.include_code,
            dry_run=args.dry_run,
        )
