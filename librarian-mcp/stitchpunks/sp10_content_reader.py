"""
SP-10 CONTENT READER: Read ALL classified files and store content LOCALLY first.
Then optionally push to Supabase pipeline.

Phase 1: Read all files, store in data/content_archive/ as individual JSON files
Phase 2: Push to Supabase via edge function (optional, after local storage confirmed)

This ensures NOTHING is lost. Every document gets READ and STORED locally
before any network operations.

Usage:
  python sp10_content_reader.py                    # Phase 1: read all, store locally
  python sp10_content_reader.py --incremental      # Phase 1: archive only new files from cartographer manifest
  python sp10_content_reader.py --section 02_WRITTEN  # Only one section
  python sp10_content_reader.py --push             # Phase 2: push local archive to Supabase
  python sp10_content_reader.py --incremental --push  # Push only newly archived incremental entries
  python sp10_content_reader.py --push --resume    # Resume push from last batch
  python sp10_content_reader.py --stats            # Show what's been read
"""

import json
import os
import sys
import time
import hashlib
from datetime import datetime
from pathlib import Path
from collections import Counter

try:
    import requests
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
ENV_PATH = Path(__file__).parent / ".env"
CLASSIFIER_PATH = DATA_DIR / "classifier_assignments.json"
CARTOGRAPHER_MANIFEST_PATH = DATA_DIR / "cartographer_manifest.json"
ARCHIVE_DIR = DATA_DIR / "content_archive"
INDEX_PATH = DATA_DIR / "content_archive_index.json"
PUSH_PROGRESS_PATH = DATA_DIR / "content_push_progress.json"

MAX_CONTENT_CHARS = 50000  # B081: ~25 pages — Founder directive: READ ALL, not summarize
READABLE_EXTS = {'.md', '.txt', '.json', '.ts', '.tsx', '.js', '.jsx', '.py',
                 '.sql', '.css', '.html', '.htm', '.yml', '.yaml', '.toml', '.sh',
                 '.bat', '.ps1', '.csv', '.env', '.log', '.sol', '.rtf'}
SKIP_SECTIONS = set()  # B081: Founder directive — READ ALL. No sections skipped.

BATCH_SIZE = 25
DELAY_BETWEEN_BATCHES = 2


def file_hash(path: str) -> str:
    """Create a short hash for a file path to use as archive filename."""
    return hashlib.md5(path.encode()).hexdigest()[:12]


def read_file_content(filepath: Path, max_chars: int = MAX_CONTENT_CHARS) -> str:
    """Read file content up to max_chars."""
    try:
        if not filepath.exists():
            return ''
        if filepath.stat().st_size > 1_000_000:
            return f'[FILE TOO LARGE: {filepath.stat().st_size / 1024:.0f} KB]'
        if filepath.suffix.lower() not in READABLE_EXTS:
            return f'[BINARY FILE: {filepath.suffix}]'
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(max_chars)
        if len(content) >= max_chars:
            content += f'\n\n[... TRUNCATED at {max_chars:,} chars ...]'
        return content
    except Exception as e:
        return f'[READ ERROR: {e}]'


def slugify_filename(filename: str, path: str) -> str:
    """Build stable slug from filename."""
    slug = filename.lower().replace(' ', '-').replace('_', '-')
    slug = slug.rsplit('.', 1)[0] if '.' in slug else slug
    if len(slug) < 3:
        slug = f"content-{hash(path) % 100000:05d}"
    return slug


def title_from_filename(filename: str) -> str:
    return filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()


def load_archive_index_entries():
    """Return (entries_list, path_to_entry map) from archive index."""
    if not INDEX_PATH.exists():
        return [], {}
    try:
        with open(INDEX_PATH, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
            entries = existing_data.get('entries', [])
            return entries, {e['path']: e for e in entries if e.get('path')}
    except Exception:
        return [], {}


def load_classifier_map():
    """Return classifier assignment map keyed by path."""
    if not CLASSIFIER_PATH.exists():
        return {}
    try:
        with open(CLASSIFIER_PATH, 'r', encoding='utf-8') as f:
            assignments = json.load(f).get('assignments', [])
            return {item.get('path', ''): item for item in assignments if item.get('path')}
    except Exception:
        return {}


def infer_section_from_domain(domain: str) -> str:
    mapping = {
        'technical': '05_TECHNICAL_SPECS',
        'press': '04_PRESS_ARTICLES',
        'campaign': '06_CAMPAIGN_MATERIALS',
        'letters': '10_LETTERS',
        'context': '09_CONTEXT_MANAGEMENT',
        'journal': '08_JOURNALS',
        'patent': '03_PATENT_BAGS',
        'reference': '07_REFERENCE_MATERIALS',
    }
    return mapping.get((domain or '').lower(), 'uncategorized')


def build_archive_entry(path: str, filename: str, section: str, source_meta: dict, content: str):
    """Build full archive entry + compact index metadata entry."""
    slug = slugify_filename(filename, path)
    category = source_meta.get('cephas_category', 'article')
    content_type = source_meta.get('content_type', source_meta.get('cephas_type', 'cephas_article'))
    section_librarian = source_meta.get('section_librarian')
    confidence = source_meta.get('confidence', 0)
    if not isinstance(confidence, (int, float)):
        confidence = 0

    entry = {
        'path': path,
        'filename': filename,
        'slug': slug,
        'title': title_from_filename(filename),
        'content_markdown': content,
        'content_chars': len(content),
        'section': section,
        'content_type': content_type,
        'category': category,
        'section_librarian': section_librarian,
        'confidence': confidence,
        'read_at': datetime.now().isoformat(),
    }
    fhash = file_hash(path)
    index_entry = {
        'path': path,
        'filename': filename,
        'slug': slug,
        'title': entry['title'],
        'section': section,
        'category': category,
        'section_librarian': section_librarian,
        'content_chars': len(content),
        'content_type': content_type,
        'archive_file': f"{fhash}.json",
        'read_at': entry['read_at'],
    }
    return entry, index_entry, fhash


# ── PHASE 1: Local Read & Store ──

def phase1_read(section_filter: str = None):
    """Read all classified files and store content locally."""
    print("=" * 60)
    print("  PHASE 1: Reading all files to local archive")
    if section_filter:
        print(f"  Filter: {section_filter}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    if not CLASSIFIER_PATH.exists():
        print("ERROR: classifier_assignments.json not found. Run SP-3 first.")
        return

    with open(CLASSIFIER_PATH, 'r') as f:
        assignments = json.load(f)

    # Load existing index to track what's already been read
    _, existing_index = load_archive_index_entries()

    index_entries = []
    files_read = 0
    files_skipped = 0
    files_already_done = 0
    total_content_bytes = 0
    section_counts = Counter()

    all_items = assignments.get('assignments', [])
    total = len(all_items)

    for i, item in enumerate(all_items):
        section = item.get('assigned_section', 'uncategorized')
        if section in SKIP_SECTIONS:
            files_skipped += 1
            continue
        if section_filter and section != section_filter:
            continue
        # B081: No confidence threshold — read everything regardless of confidence

        path = item.get('path', '')
        filename = item.get('filename', '')
        filepath = WORKSPACE / path

        # Check if already in archive and file hasn't changed
        fhash = file_hash(path)
        archive_file = ARCHIVE_DIR / f"{fhash}.json"

        if path in existing_index and archive_file.exists():
            # Already read — keep existing entry
            index_entries.append(existing_index[path])
            files_already_done += 1
            section_counts[section] += 1
            continue

        # Read content
        content = read_file_content(filepath)
        if not content or content.startswith('[BINARY') or content.startswith('[READ ERROR'):
            files_skipped += 1
            continue

        files_read += 1
        content_bytes = len(content.encode('utf-8'))
        total_content_bytes += content_bytes
        section_counts[section] += 1

        entry, index_entry, fhash = build_archive_entry(
            path=path,
            filename=filename,
            section=section,
            source_meta=item,
            content=content,
        )

        # Save individual archive file
        with open(archive_file, 'w', encoding='utf-8') as f:
            json.dump(entry, f, ensure_ascii=False)

        # Track in index (without content to keep index small)
        index_entries.append(index_entry)

        # Progress indicator
        if files_read % 500 == 0:
            print(f"  ... {files_read} files read ({i + 1}/{total} processed)")

    # Save index
    index = {
        'timestamp': datetime.now().isoformat(),
        'total_entries': len(index_entries),
        'files_read_this_run': files_read,
        'files_already_done': files_already_done,
        'files_skipped': files_skipped,
        'total_content_bytes': total_content_bytes,
        'section_counts': dict(section_counts),
        'entries': index_entries,
    }
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n  PHASE 1 COMPLETE")
    print(f"  Files read (new): {files_read}")
    print(f"  Files already archived: {files_already_done}")
    print(f"  Files skipped: {files_skipped}")
    print(f"  Total archived: {len(index_entries)}")
    print(f"  Content this run: {total_content_bytes / 1024 / 1024:.1f} MB")
    print(f"  Archive location: {ARCHIVE_DIR}")
    print(f"\n  Section breakdown:")
    for s, c in section_counts.most_common():
        print(f"    {s}: {c}")
    print(f"\n  To push to Supabase: python sp10_content_reader.py --push")


def phase1_incremental(push_new: bool = False):
    """Incremental mode: read only files new to cartographer_manifest vs archive index."""
    print("=" * 60)
    print("  PHASE 1 (INCREMENTAL): Archiving new files only")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    if not CARTOGRAPHER_MANIFEST_PATH.exists():
        print("ERROR: cartographer_manifest.json not found. Run cartographer first.")
        return

    with open(CARTOGRAPHER_MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    manifest_files = manifest.get('files', [])

    existing_entries, existing_index = load_archive_index_entries()
    existing_paths = set(existing_index.keys())
    classifier_map = load_classifier_map()

    index_entries = list(existing_entries)
    new_index_entries = []
    files_read = 0
    files_skipped = 0
    total_content_bytes = 0
    section_counts = Counter()

    new_candidates = [
        file_meta for file_meta in manifest_files
        if file_meta.get('is_content') and file_meta.get('path') not in existing_paths
    ]

    print(f"  New file candidates from manifest: {len(new_candidates)}")

    for i, file_meta in enumerate(new_candidates):
        path = file_meta.get('path', '')
        if not path:
            files_skipped += 1
            continue
        filename = file_meta.get('filename') or Path(path).name

        classifier_meta = classifier_map.get(path, {})
        section = classifier_meta.get('assigned_section') or infer_section_from_domain(file_meta.get('domain', ''))
        if section in SKIP_SECTIONS:
            files_skipped += 1
            continue
        confidence = classifier_meta.get('confidence')
        if confidence is not None and confidence < 0.1:
            files_skipped += 1
            continue

        filepath = WORKSPACE / path
        content = read_file_content(filepath)
        if not content or content.startswith('[BINARY') or content.startswith('[READ ERROR'):
            files_skipped += 1
            continue

        entry, index_entry, fhash = build_archive_entry(
            path=path,
            filename=filename,
            section=section,
            source_meta=classifier_meta,
            content=content,
        )

        archive_file = ARCHIVE_DIR / f"{fhash}.json"
        with open(archive_file, 'w', encoding='utf-8') as f:
            json.dump(entry, f, ensure_ascii=False)

        index_entries.append(index_entry)
        new_index_entries.append(index_entry)
        files_read += 1
        total_content_bytes += len(content.encode('utf-8'))
        section_counts[section] += 1

        if files_read and files_read % 200 == 0:
            print(f"  ... {files_read} new files archived ({i + 1}/{len(new_candidates)} checked)")

    index = {
        'timestamp': datetime.now().isoformat(),
        'total_entries': len(index_entries),
        'files_read_this_run': files_read,
        'files_already_done': len(existing_entries),
        'files_skipped': files_skipped,
        'total_content_bytes': total_content_bytes,
        'section_counts': dict(section_counts),
        'entries': index_entries,
    }
    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)

    print(f"\n  INCREMENTAL ARCHIVE COMPLETE")
    print(f"  New files archived: {files_read}")
    print(f"  New files skipped: {files_skipped}")
    print(f"  Total archive size: {len(index_entries)} entries")
    print(f"  New content this run: {total_content_bytes / 1024 / 1024:.1f} MB")
    if section_counts:
        print(f"\n  New section breakdown:")
        for s, c in section_counts.most_common():
            print(f"    {s}: {c}")

    if push_new and new_index_entries:
        print("\n  Incremental push enabled (--push): sending new entries to Supabase...")
        phase2_push(entries_override=new_index_entries)
    elif push_new:
        print("\n  Incremental push skipped: no new archive entries to send.")


# ── PHASE 2: Push to Supabase ──

def phase2_push(resume: bool = False, entries_override=None):
    """Push locally archived content to Supabase via edge function."""
    if not requests:
        print("ERROR: pip install requests")
        return
    if not load_dotenv:
        print("ERROR: pip install python-dotenv")
        return

    load_dotenv(ENV_PATH)
    supabase_url = os.environ.get('SUPABASE_URL', '')
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    if not supabase_url or not service_key:
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        return

    if not INDEX_PATH.exists():
        print("ERROR: No content archive index. Run Phase 1 first.")
        return

    with open(INDEX_PATH, 'r') as f:
        index = json.load(f)

    entries_meta = entries_override if entries_override is not None else index.get('entries', [])
    print(f"=" * 60)
    print(f"  PHASE 2: Pushing {len(entries_meta)} entries to Supabase")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"=" * 60)

    # Load progress for resume
    progress = {'completed_batches': 0, 'total_sent': 0, 'errors': [],
                'started': datetime.now().isoformat()}
    if resume and PUSH_PROGRESS_PATH.exists():
        try:
            with open(PUSH_PROGRESS_PATH, 'r') as f:
                progress = json.load(f)
        except Exception:
            pass

    total_batches = (len(entries_meta) + BATCH_SIZE - 1) // BATCH_SIZE
    start_batch = progress['completed_batches']
    if resume:
        print(f"  Resuming from batch {start_batch + 1}/{total_batches}")

    endpoint = f"{supabase_url}/functions/v1/ingest-corps-content"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {service_key}'
    }

    for i in range(start_batch, total_batches):
        batch_meta = entries_meta[i * BATCH_SIZE:(i + 1) * BATCH_SIZE]

        # Load actual content from archive files
        batch_entries = []
        for meta in batch_meta:
            archive_file = ARCHIVE_DIR / meta.get('archive_file', '')
            if not archive_file.exists():
                continue
            try:
                with open(archive_file, 'r', encoding='utf-8') as f:
                    entry = json.load(f)
                batch_entries.append({
                    'type': 'classified_content',
                    'slug': entry['slug'],
                    'title': entry['title'],
                    'content_markdown': entry.get('content_markdown'),
                    'content_type': entry.get('content_type', 'cephas_article'),
                    'category': entry.get('category', 'article'),
                    'section_librarian': entry.get('section_librarian'),
                    'session_id': 'CONTENT-BACKFILL-B065',
                    'agent': 'SP-10-CONTENT-READER',
                    'source_file_path': entry.get('path', ''),
                    'creation_context': (
                        f"Full content read from {entry.get('section', '?')} "
                        f"(confidence: {entry.get('confidence', 0)}, "
                        f"chars: {entry.get('content_chars', 0)})"
                    ),
                    'timestamp': datetime.now().isoformat(),
                })
            except Exception as e:
                progress['errors'].append({
                    'file': str(archive_file),
                    'error': str(e)[:200],
                })

        if not batch_entries:
            progress['completed_batches'] = i + 1
            continue

        # POST batch
        try:
            resp = requests.post(endpoint, json={'entries': batch_entries},
                                headers=headers, timeout=120)
            if resp.status_code == 200:
                result = resp.json()
                inserted = result.get('inserted', 0)
                progress['total_sent'] += inserted
                print(f"  Batch {i + 1}/{total_batches}: {inserted} inserted")
            else:
                progress['errors'].append({
                    'batch': i + 1,
                    'error': f'HTTP {resp.status_code}: {resp.text[:200]}',
                })
                print(f"  Batch {i + 1}/{total_batches}: ERROR {resp.status_code}")
        except Exception as e:
            progress['errors'].append({
                'batch': i + 1,
                'error': str(e)[:200],
            })
            print(f"  Batch {i + 1}/{total_batches}: EXCEPTION {e}")

        progress['completed_batches'] = i + 1
        progress['last_batch'] = datetime.now().isoformat()
        with open(PUSH_PROGRESS_PATH, 'w') as f:
            json.dump(progress, f, indent=2)

        if i < total_batches - 1:
            time.sleep(DELAY_BETWEEN_BATCHES)

    progress['completed'] = datetime.now().isoformat()
    with open(PUSH_PROGRESS_PATH, 'w') as f:
        json.dump(progress, f, indent=2)

    print(f"\n  PHASE 2 COMPLETE")
    print(f"  Total sent: {progress['total_sent']}")
    print(f"  Errors: {len(progress['errors'])}")


# ── Stats ──

def show_stats():
    """Show what's been read and archived."""
    if not INDEX_PATH.exists():
        print("No content archive yet. Run: python sp10_content_reader.py")
        return

    with open(INDEX_PATH, 'r') as f:
        index = json.load(f)

    entries = index.get('entries', [])
    total_chars = sum(e.get('content_chars', 0) for e in entries)
    sections = Counter(e.get('section', '?') for e in entries)

    print(f"Content Archive Stats")
    print(f"  Total entries: {len(entries)}")
    print(f"  Total content: {total_chars:,} chars ({total_chars / 1024 / 1024:.1f} MB)")
    print(f"  Last updated: {index.get('timestamp', '?')}")
    print(f"\n  By section:")
    for s, c in sections.most_common():
        section_chars = sum(e.get('content_chars', 0) for e in entries if e.get('section') == s)
        print(f"    {s}: {c} files ({section_chars / 1024:.0f} KB)")

    if PUSH_PROGRESS_PATH.exists():
        with open(PUSH_PROGRESS_PATH, 'r') as f:
            push = json.load(f)
        print(f"\n  Push status:")
        print(f"    Sent: {push.get('total_sent', 0)}")
        print(f"    Errors: {len(push.get('errors', []))}")


def main():
    if '--stats' in sys.argv:
        show_stats()
    elif '--push' in sys.argv and '--incremental' not in sys.argv:
        phase2_push(resume='--resume' in sys.argv)
    elif '--incremental' in sys.argv:
        phase1_incremental(push_new='--push' in sys.argv)
    else:
        section_filter = None
        for i, arg in enumerate(sys.argv):
            if arg == '--section' and i + 1 < len(sys.argv):
                section_filter = sys.argv[i + 1]
        phase1_read(section_filter)


if __name__ == '__main__':
    main()
