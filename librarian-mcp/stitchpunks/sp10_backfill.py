"""
SP-10 BACKFILL: Reprocess entire classified archive through the pipeline.
Runs independently — no agent context needed. Just execute and let it churn.

Reads classifier_assignments.json and sends ALL classified content
(minus patents and context management) through ingest-corps-content
in batches of 50 with a 2-second delay between batches.

Usage:
  python sp10_backfill.py              # dry run (shows what would be sent)
  python sp10_backfill.py --execute    # actually send to edge function
  python sp10_backfill.py --resume     # resume from last successful batch

Progress saved to data/backfill_progress.json after each batch.
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

DATA_DIR = Path(__file__).parent / "data"
ENV_PATH = Path(__file__).parent / ".env"
CLASSIFIER_PATH = DATA_DIR / "classifier_assignments.json"
PROGRESS_PATH = DATA_DIR / "backfill_progress.json"

BATCH_SIZE = 50
DELAY_BETWEEN_BATCHES = 2  # seconds

# Sections to SKIP (not publishable content)
SKIP_SECTIONS = {'uncategorized', '09_CONTEXT_MANAGEMENT', '03_PATENT_BAGS'}


def load_progress() -> dict:
    if PROGRESS_PATH.exists():
        try:
            with open(PROGRESS_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'completed_batches': 0, 'total_sent': 0, 'errors': [], 'started': None, 'last_batch': None}


def save_progress(progress: dict):
    with open(PROGRESS_PATH, 'w') as f:
        json.dump(progress, f, indent=2)


def build_entries_from_classifier() -> list:
    """Build full list of entries from classifier assignments."""
    if not CLASSIFIER_PATH.exists():
        print("ERROR: classifier_assignments.json not found. Run SP-3 first.")
        return []

    with open(CLASSIFIER_PATH, 'r') as f:
        assignments = json.load(f)

    entries = []
    for item in assignments.get('assignments', []):
        section = item.get('assigned_section', 'uncategorized')
        if section in SKIP_SECTIONS:
            continue
        if item.get('confidence', 0) < 0.3:
            continue

        filename = item.get('filename', '')
        slug = filename.lower().replace(' ', '-').replace('_', '-')
        slug = slug.rsplit('.', 1)[0] if '.' in slug else slug
        # Ensure slug uniqueness by appending path hash
        path = item.get('path', '')
        if len(slug) < 3:
            slug = f"content-{hash(path) % 100000:05d}"

        entries.append({
            'type': 'classified_content',
            'slug': slug,
            'title': filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title(),
            'content_markdown': None,
            'content_type': item.get('content_type', 'cephas_article'),
            'category': item.get('cephas_category', 'article'),
            'section_librarian': item.get('section_librarian'),
            'session_id': 'BACKFILL',
            'agent': 'SP-10-BACKFILL',
            'source_file_path': path,
            'creation_context': f"Backfill from SP-3 Classifier (section: {section}, confidence: {item.get('confidence', 0)})",
            'timestamp': datetime.now().isoformat(),
        })

    return entries


def post_batch(url: str, headers: dict, batch: list) -> dict:
    """POST a single batch to the edge function."""
    try:
        resp = requests.post(url, json={'entries': batch}, headers=headers, timeout=60)
        if resp.status_code == 200:
            return resp.json()
        else:
            return {'error': f'HTTP {resp.status_code}: {resp.text[:300]}'}
    except Exception as e:
        return {'error': str(e)}


def main():
    execute = '--execute' in sys.argv
    resume = '--resume' in sys.argv

    print("=" * 60)
    print("  SP-10 BACKFILL: Full Archive Reprocess")
    print(f"  Mode: {'EXECUTE' if execute else 'DRY RUN'}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Load credentials
    load_dotenv(ENV_PATH)
    supabase_url = os.environ.get('SUPABASE_URL', '')
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')

    if execute and (not supabase_url or not service_key):
        print("ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        sys.exit(1)

    # Build entries
    print("\nBuilding entries from classifier...")
    entries = build_entries_from_classifier()
    print(f"  Total entries to backfill: {len(entries)}")

    total_batches = (len(entries) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"  Batches needed: {total_batches} (size {BATCH_SIZE})")

    # Resume support
    progress = load_progress() if resume else {
        'completed_batches': 0, 'total_sent': 0, 'errors': [],
        'started': datetime.now().isoformat(), 'last_batch': None
    }
    start_batch = progress['completed_batches'] if resume else 0

    if resume and start_batch > 0:
        print(f"  Resuming from batch {start_batch + 1}/{total_batches}")

    if not execute:
        # Dry run — show breakdown
        from collections import Counter
        sections = Counter(e.get('category', 'unknown') for e in entries)
        librarians = Counter(e.get('section_librarian', 0) for e in entries)
        print(f"\n  Category breakdown:")
        for cat, count in sections.most_common():
            print(f"    {cat}: {count}")
        print(f"\n  Section Librarian breakdown:")
        names = {1: 'Economics', 2: 'Letters', 3: 'Initiatives', 4: 'Technology', 5: 'Legal', 6: 'Content', 7: 'HexIsle'}
        for lib, count in sorted(librarians.items()):
            print(f"    {lib} ({names.get(lib, '?')}): {count}")
        print(f"\n  Estimated time: ~{total_batches * (DELAY_BETWEEN_BATCHES + 2)} seconds")
        print(f"\n  To execute: python sp10_backfill.py --execute")
        return

    # Execute mode
    url = f"{supabase_url}/functions/v1/ingest-corps-content"
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
    }

    print(f"\nStarting backfill...")
    start_time = time.time()

    for i in range(start_batch * BATCH_SIZE, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1

        print(f"  Batch {batch_num}/{total_batches} ({len(batch)} entries)...", end=" ", flush=True)
        result = post_batch(url, headers, batch)

        if 'error' in result:
            print(f"ERROR: {result['error'][:100]}")
            progress['errors'].append({
                'batch': batch_num,
                'error': result['error'][:200],
                'timestamp': datetime.now().isoformat(),
            })
            # Continue to next batch — don't stop on single failure
        else:
            inserted = result.get('inserted', 0)
            skipped = result.get('skipped', 0)
            print(f"OK (inserted: {inserted}, skipped: {skipped})")
            progress['total_sent'] += inserted

        progress['completed_batches'] = batch_num
        progress['last_batch'] = datetime.now().isoformat()
        save_progress(progress)

        # Delay between batches to avoid rate limiting
        if i + BATCH_SIZE < len(entries):
            time.sleep(DELAY_BETWEEN_BATCHES)

    elapsed = round(time.time() - start_time, 1)
    progress['completed'] = datetime.now().isoformat()
    progress['elapsed_seconds'] = elapsed
    save_progress(progress)

    print(f"\n{'=' * 60}")
    print(f"  BACKFILL COMPLETE in {elapsed}s")
    print(f"  Batches: {progress['completed_batches']}/{total_batches}")
    print(f"  Total sent: {progress['total_sent']}")
    print(f"  Errors: {len(progress['errors'])}")
    print(f"  Progress saved: {PROGRESS_PATH}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    main()
