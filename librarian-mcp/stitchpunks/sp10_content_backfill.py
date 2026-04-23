"""
SP-10 CONTENT BACKFILL: Re-read ALL classified files and send actual content
to the pipeline. This ensures nothing is lost — every document gets READ,
not just filed by name.

Reads up to 10,000 chars per file (covers 5+ page documents).
Sends in batches of 25 (smaller batches since content is included).

Usage:
  python sp10_content_backfill.py              # dry run
  python sp10_content_backfill.py --execute    # send to edge function
  python sp10_content_backfill.py --resume     # resume from last batch
  python sp10_content_backfill.py --section 02_WRITTEN  # only one section

Progress saved to data/content_backfill_progress.json after each batch.
"""

import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: pip install requests")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: pip install python-dotenv")
    sys.exit(1)

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
ENV_PATH = Path(__file__).parent / ".env"
CLASSIFIER_PATH = DATA_DIR / "classifier_assignments.json"
PROGRESS_PATH = DATA_DIR / "content_backfill_progress.json"

BATCH_SIZE = 25  # Smaller batches since we're sending content
DELAY_BETWEEN_BATCHES = 2
MAX_CONTENT_CHARS = 10000  # ~5 pages of text
READABLE_EXTS = {'.md', '.txt', '.json', '.ts', '.tsx', '.js', '.jsx', '.py',
                 '.sql', '.css', '.html', '.yml', '.yaml', '.toml', '.sh',
                 '.bat', '.ps1', '.csv', '.env', '.log'}

# Sections to SKIP
SKIP_SECTIONS = {'uncategorized', '09_CONTEXT_MANAGEMENT'}


def read_file_content(filepath: Path, max_chars: int = MAX_CONTENT_CHARS) -> str:
    """Read file content up to max_chars. Returns empty string on failure."""
    try:
        if not filepath.exists():
            return ''
        if filepath.stat().st_size > 1_000_000:  # Skip files > 1MB
            return f'[FILE TOO LARGE: {filepath.stat().st_size / 1024:.0f} KB]'
        if filepath.suffix.lower() not in READABLE_EXTS:
            return f'[BINARY FILE: {filepath.suffix}]'
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(max_chars)
        if len(content) >= max_chars:
            content += '\n\n[... TRUNCATED at 10,000 chars ...]'
        return content
    except Exception as e:
        return f'[READ ERROR: {e}]'


def load_progress() -> dict:
    if PROGRESS_PATH.exists():
        try:
            with open(PROGRESS_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'completed_batches': 0, 'total_sent': 0, 'errors': [],
            'started': None, 'last_batch': None, 'files_read': 0,
            'content_bytes': 0}


def save_progress(progress: dict):
    with open(PROGRESS_PATH, 'w') as f:
        json.dump(progress, f, indent=2)


def build_entries(section_filter: str = None) -> list:
    """Build entries with ACTUAL CONTENT from classified files."""
    if not CLASSIFIER_PATH.exists():
        print("ERROR: classifier_assignments.json not found. Run SP-3 first.")
        return []

    with open(CLASSIFIER_PATH, 'r') as f:
        assignments = json.load(f)

    entries = []
    total_content_bytes = 0
    files_read = 0
    files_skipped = 0

    for item in assignments.get('assignments', []):
        section = item.get('assigned_section', 'uncategorized')
        if section in SKIP_SECTIONS:
            continue
        if section_filter and section != section_filter:
            continue
        if item.get('confidence', 0) < 0.2:
            continue

        filepath = WORKSPACE / item.get('path', '')
        filename = item.get('filename', '')

        # Read actual content
        content = read_file_content(filepath)
        if not content or content.startswith('[BINARY') or content.startswith('[READ ERROR'):
            files_skipped += 1
            continue

        files_read += 1
        total_content_bytes += len(content.encode('utf-8'))

        # Build slug
        slug = filename.lower().replace(' ', '-').replace('_', '-')
        slug = slug.rsplit('.', 1)[0] if '.' in slug else slug
        if len(slug) < 3:
            slug = f"content-{hash(item.get('path', '')) % 100000:05d}"

        # Build title from filename
        title = filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()

        entries.append({
            'type': 'classified_content',
            'slug': slug,
            'title': title,
            'content_markdown': content,
            'content_type': item.get('content_type', 'cephas_article'),
            'category': item.get('cephas_category', 'article'),
            'section_librarian': item.get('section_librarian'),
            'session_id': 'CONTENT-BACKFILL-B065',
            'agent': 'SP-10-CONTENT-READER',
            'source_file_path': item.get('path', ''),
            'creation_context': (
                f"Full content read from {section} "
                f"(confidence: {item.get('confidence', 0)}, "
                f"chars: {len(content)})"
            ),
            'timestamp': datetime.now().isoformat(),
        })

    print(f"  Files read: {files_read}")
    print(f"  Files skipped (binary/error): {files_skipped}")
    print(f"  Total content: {total_content_bytes / 1024 / 1024:.1f} MB")

    return entries


def post_batch(url: str, headers: dict, batch: list) -> dict:
    """POST a single batch to the edge function."""
    try:
        resp = requests.post(url, json={'entries': batch}, headers=headers, timeout=120)
        if resp.status_code == 200:
            return resp.json()
        else:
            return {'error': f'HTTP {resp.status_code}: {resp.text[:300]}'}
    except Exception as e:
        return {'error': str(e)}


def main():
    execute = '--execute' in sys.argv
    resume = '--resume' in sys.argv
    section_filter = None
    for i, arg in enumerate(sys.argv):
        if arg == '--section' and i + 1 < len(sys.argv):
            section_filter = sys.argv[i + 1]

    print("=" * 60)
    print("  SP-10 CONTENT BACKFILL: Full Archive Content Read")
    print(f"  Mode: {'EXECUTE' if execute else 'DRY RUN'}")
    if section_filter:
        print(f"  Section filter: {section_filter}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Load credentials
    load_dotenv(ENV_PATH)
    supabase_url = os.environ.get('SUPABASE_URL', '')
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

    if execute and (not supabase_url or not service_key):
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        sys.exit(1)

    # Build entries WITH CONTENT
    print("\nReading file contents...")
    entries = build_entries(section_filter)
    print(f"  Total entries with content: {len(entries)}")

    total_batches = (len(entries) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"  Batches needed: {total_batches} (size {BATCH_SIZE})")

    # Resume support
    progress = load_progress() if resume else {
        'completed_batches': 0, 'total_sent': 0, 'errors': [],
        'started': datetime.now().isoformat(), 'last_batch': None,
        'files_read': len(entries), 'content_bytes': 0
    }

    start_batch = progress['completed_batches']
    if resume:
        print(f"  Resuming from batch {start_batch + 1}/{total_batches}")

    # Section breakdown
    from collections import Counter
    sections = Counter(e['category'] for e in entries)
    print(f"\n  Category breakdown:")
    for s, c in sections.most_common():
        print(f"    {s}: {c}")

    # Content size estimate
    total_chars = sum(len(e.get('content_markdown', '') or '') for e in entries)
    print(f"\n  Total content chars: {total_chars:,}")
    print(f"  Estimated payload: {total_chars / 1024 / 1024:.1f} MB")
    print(f"  Estimated time: ~{total_batches * (DELAY_BETWEEN_BATCHES + 3)} seconds")

    if not execute:
        print(f"\n  To execute: python sp10_content_backfill.py --execute")
        if section_filter:
            print(f"  (with filter: --section {section_filter})")
        return

    # Execute batches
    endpoint = f"{supabase_url}/functions/v1/ingest-corps-content"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {service_key}'
    }

    print(f"\n  Sending {total_batches} batches...")
    for i in range(start_batch, total_batches):
        batch = entries[i * BATCH_SIZE:(i + 1) * BATCH_SIZE]
        result = post_batch(endpoint, headers, batch)

        if 'error' in result:
            progress['errors'].append({
                'batch': i + 1,
                'error': str(result['error'])[:200],
                'timestamp': datetime.now().isoformat()
            })
            print(f"  Batch {i + 1}/{total_batches}: ERROR - {str(result['error'])[:100]}")
        else:
            inserted = result.get('inserted', 0)
            progress['total_sent'] += inserted
            print(f"  Batch {i + 1}/{total_batches}: {inserted} inserted")

        progress['completed_batches'] = i + 1
        progress['last_batch'] = datetime.now().isoformat()
        save_progress(progress)

        if i < total_batches - 1:
            time.sleep(DELAY_BETWEEN_BATCHES)

    progress['completed'] = datetime.now().isoformat()
    elapsed = (datetime.fromisoformat(progress['completed']) -
               datetime.fromisoformat(progress['started'])).total_seconds()
    progress['elapsed_seconds'] = round(elapsed, 1)
    save_progress(progress)

    print(f"\n  DONE!")
    print(f"  Total sent: {progress['total_sent']}")
    print(f"  Errors: {len(progress['errors'])}")
    print(f"  Elapsed: {elapsed:.0f} seconds")


if __name__ == '__main__':
    main()
