"""
SP-10: THE PIPELINE BRIDGE
Single integration point between file-system Corps and database-backed Staff.
Reads SP-3/SP-7/SP-8 outputs, POSTs batch to ingest-corps-content edge function.
Tracks bridged items to prevent duplicates.

Trigger: Session end (after SP-8 Herald).
Output: librarian-mcp/stitchpunks/data/pipeline_bridge_log.json
        librarian-mcp/stitchpunks/data/pipeline_bridge_state.json

Environment:
  SUPABASE_URL — from .env or os.environ
  SUPABASE_SERVICE_ROLE_KEY — from .env or os.environ
"""

import argparse
import json
import os
import sys
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

DATA_DIR = Path(__file__).parent / "data"
ENV_PATH = Path(__file__).parent / ".env"
WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")

HERALD_PAYLOAD_PATH = DATA_DIR / "herald_pipeline_payload.json"
CLASSIFIER_PATH = DATA_DIR / "classifier_assignments.json"
COURIER_PATH = DATA_DIR / "courier_report.json"
MANIFEST_PATH = DATA_DIR / "cartographer_manifest.json"
ARCHIVE_INDEX_PATH = DATA_DIR / "content_archive_index.json"

BATCH_SIZE = 500  # backfill-friendly default
STATE_PATH = DATA_DIR / "pipeline_bridge_state.json"
LOG_PATH = DATA_DIR / "pipeline_bridge_log.json"


def _load_env():
    """Load Supabase credentials from .env or environment."""
    if load_dotenv and ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    url = os.environ.get('SUPABASE_URL', '')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
    return url, key


def _load_state() -> dict:
    """Load previously bridged item slugs to prevent duplicates."""
    if STATE_PATH.exists():
        try:
            with open(STATE_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'bridged_slugs': [], 'bridged_files': [], 'last_run': None}


def _save_state(state: dict):
    """Persist bridge state."""
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)


def _load_log() -> list:
    """Load existing bridge log."""
    if LOG_PATH.exists():
        try:
            with open(LOG_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return []


def _save_log(log: list):
    """Persist bridge log."""
    with open(LOG_PATH, 'w') as f:
        json.dump(log, f, indent=2)


CONTENT_ARCHIVE_DIR = DATA_DIR / "content_archive"


def _read_archive_content(slug: str, file_hash: str | None = None) -> str | None:
    """
    Read content_markdown from the content_archive JSON file.
    Tries by archive_file/hash first, then looks up slug in archive index.
    Returns the content string or None if not found.
    """
    # Direct file lookup by hash or archive_file name
    if file_hash:
        # Handle both bare hash and full filename
        candidate_name = file_hash if file_hash.endswith('.json') else f"{file_hash}.json"
        candidate = CONTENT_ARCHIVE_DIR / candidate_name
        if candidate.exists():
            try:
                with open(candidate, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                cm = data.get('content_markdown', '')
                if cm:
                    return cm
            except Exception:
                pass

    # Fallback: look up slug in archive index to find the archive_file
    if ARCHIVE_INDEX_PATH.exists():
        try:
            with open(ARCHIVE_INDEX_PATH, 'r', encoding='utf-8') as f:
                idx = json.load(f)
            for entry in idx.get('entries', []):
                if entry.get('slug') == slug:
                    af = entry.get('archive_file', '')
                    if af:
                        candidate = CONTENT_ARCHIVE_DIR / af
                        if candidate.exists():
                            with open(candidate, 'r', encoding='utf-8') as f2:
                                data = json.load(f2)
                            cm = data.get('content_markdown', '')
                            if cm:
                                return cm
                    break
        except Exception:
            pass

    return None


def _collect_herald_entries() -> list:
    """Collect entries from SP-8 Herald pipeline payload."""
    if not HERALD_PAYLOAD_PATH.exists():
        print("  No herald payload found — skipping FOTW/UTH entries")
        return []
    try:
        with open(HERALD_PAYLOAD_PATH, 'r') as f:
            payload = json.load(f)
        entries = payload.get('entries', [])
        print(f"  Herald payload: {len(entries)} entries")
        return entries
    except Exception as e:
        print(f"  WARNING: Could not read herald payload: {e}")
        return []


def _collect_new_classifier_entries(
    state: dict,
    session_id: str,
    agent: str,
    backfill: bool = False,
    include_patent_bags: bool = False,
    include_context_management: bool = False,
    min_confidence: float = 0.4,
) -> tuple[list, dict]:
    """Collect genuinely NEW content files from SP-3 that haven't been bridged yet.
    Only bridges files that are new since last Cartographer run (not the entire backlog)."""
    stats = {
        'already_bridged': 0,
        'uncategorized': 0,
        'low_confidence': 0,
        'not_new_since_last': 0,
        'context_management_skipped': 0,
        'patent_bags_skipped': 0,
    }

    if not CLASSIFIER_PATH.exists():
        print("  No classifier assignments found — skipping new content detection")
        return [], stats

    try:
        with open(CLASSIFIER_PATH, 'r') as f:
            assignments = json.load(f)
    except Exception as e:
        print(f"  WARNING: Could not read classifier: {e}")
        return [], stats

    # Load Cartographer manifest to check which files are actually new
    new_files_set = set()
    if MANIFEST_PATH.exists():
        try:
            with open(MANIFEST_PATH, 'r') as f:
                manifest = json.load(f)
            new_files_set = set(manifest.get('new_since_last', []))
        except Exception:
            pass

    bridged_files = set(state.get('bridged_files', []))
    entries = []
    for item in assignments.get('assignments', []):
        path = item.get('path', '')
        section = item.get('assigned_section', 'uncategorized')

        # Skip already-bridged, uncategorized, low-confidence, or non-content
        if path in bridged_files:
            stats['already_bridged'] += 1
            continue
        if section == 'uncategorized':
            stats['uncategorized'] += 1
            continue
        if item.get('confidence', 0) < min_confidence:
            stats['low_confidence'] += 1
            continue

        # Default mode only bridges new files since last Cartographer run.
        if not backfill and new_files_set and path not in new_files_set:
            stats['not_new_since_last'] += 1
            continue

        # Skip internal/context files — not publishable content
        if section == '09_CONTEXT_MANAGEMENT' and not include_context_management:
            stats['context_management_skipped'] += 1
            continue

        # Skip patent files — manual review required
        if section == '03_PATENT_BAGS' and not include_patent_bags:
            stats['patent_bags_skipped'] += 1
            continue

        filename = item.get('filename', '')
        slug = filename.lower().replace(' ', '-').replace('_', '-')
        slug = slug.rsplit('.', 1)[0] if '.' in slug else slug  # strip extension

        # Read actual content from content_archive JSON if available
        content_md = _read_archive_content(slug)

        entries.append({
            'type': 'classified_content',
            'slug': slug,
            'title': filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title(),
            'content_markdown': content_md,
            'content_type': item.get('content_type', 'cephas_article'),
            'category': item.get('cephas_category', 'article'),
            'section_librarian': item.get('section_librarian'),
            'session_id': session_id,
            'agent': agent,
            'source_file_path': path,
            'creation_context': f"Auto-detected by SP-3 Classifier (confidence: {item.get('confidence', 0)})",
            'timestamp': datetime.now().isoformat(),
        })

    mode = "backfill" if backfill else "incremental"
    print(f"  Classifier ({mode}): {len(entries)} candidate items")
    return entries, stats


def _collect_archive_backfill_entries(
    state: dict,
    session_id: str,
    agent: str,
    include_patent_bags: bool = False,
    include_context_management: bool = False,
) -> tuple[list, dict]:
    """
    Build bridge payloads from content_archive_index for full backlog throughput.
    This is the primary path for large-scale backfill.
    """
    stats = {
        'archive_rows_seen': 0,
        'already_bridged': 0,
        'invalid_section': 0,
        'missing_slug': 0,
    }
    entries = []

    if not ARCHIVE_INDEX_PATH.exists():
        print("  No content_archive_index found — skipping archive backfill source")
        return entries, stats

    with open(ARCHIVE_INDEX_PATH, 'r', encoding='utf-8') as f:
        archive_index = json.load(f)

    bridged_slugs = set(state.get('bridged_slugs', []))

    for item in archive_index.get('entries', []):
        stats['archive_rows_seen'] += 1
        slug = (item.get('slug') or '').strip()
        section = item.get('section') or 'uncategorized'
        if not slug:
            stats['missing_slug'] += 1
            continue
        if slug in bridged_slugs:
            stats['already_bridged'] += 1
            continue
        if section == 'uncategorized':
            stats['invalid_section'] += 1
            continue
        if section == '09_CONTEXT_MANAGEMENT' and not include_context_management:
            stats['invalid_section'] += 1
            continue
        if section == '03_PATENT_BAGS' and not include_patent_bags:
            stats['invalid_section'] += 1
            continue

        # Read actual content from content_archive JSON if available
        content_md = _read_archive_content(slug, item.get('archive_file'))

        entries.append({
            'type': 'classified_content',
            'slug': slug,
            'title': item.get('title') or item.get('filename', slug),
            'content_markdown': content_md,
            'content_type': item.get('content_type', 'cephas_article'),
            'category': item.get('category', 'article'),
            'section_librarian': item.get('section_librarian'),
            'session_id': session_id,
            'agent': agent,
            'source_file_path': item.get('path', ''),
            'creation_context': "Archive backfill bridge (SP-10)",
            'timestamp': datetime.now().isoformat(),
        })

    print(f"  Archive backfill source: {len(entries)} candidate items")
    return entries, stats


def _collect_courier_entries(state: dict, session_id: str, agent: str) -> list:
    """Collect new dropzone arrivals from SP-7 Courier."""
    if not COURIER_PATH.exists():
        print("  No courier report found — skipping dropzone entries")
        return []

    try:
        with open(COURIER_PATH, 'r') as f:
            courier = json.load(f)
    except Exception as e:
        print(f"  WARNING: Could not read courier report: {e}")
        return []

    new_files = courier.get('new_files', [])
    if not new_files:
        print("  Courier: no new dropzone arrivals")
        return []

    bridged_files = set(state.get('bridged_files', []))
    entries = []

    # Only take genuinely new dropzone files (limit to avoid first-run flood)
    for item in new_files[:50]:  # cap at 50 per session
        filename = item.get('filename', '')
        dropzone = item.get('dropzone', 'UNKNOWN')
        fpath = f"{dropzone}_DROPZONE/{filename}" if '_DROPZONE' not in dropzone else f"{dropzone}/{filename}"

        if fpath in bridged_files:
            continue

        slug = filename.lower().replace(' ', '-').replace('_', '-')
        slug = slug.rsplit('.', 1)[0] if '.' in slug else slug

        entries.append({
            'type': 'dropzone_arrival',
            'slug': f"dz-{slug}",
            'title': filename.rsplit('.', 1)[0].replace('_', ' ').title(),
            'content_markdown': None,
            'content_type': 'cephas_article',
            'category': 'article',
            'section_librarian': None,  # Edge function will categorize
            'session_id': session_id,
            'agent': agent,
            'source_file_path': fpath,
            'creation_context': f"New arrival in {dropzone} dropzone",
            'timestamp': datetime.now().isoformat(),
        })

    print(f"  Courier: {len(entries)} new dropzone arrivals")
    return entries


def _post_to_edge_function(supabase_url: str, service_key: str, entries: list) -> dict:
    """POST entries to ingest-corps-content edge function in batches."""
    if not requests:
        return {'error': 'requests library not installed. Run: pip install requests'}

    url = f"{supabase_url}/functions/v1/ingest-corps-content"
    headers = {
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
    }

    total_inserted = 0
    total_updated = 0
    total_skipped = 0
    all_errors = []

    # Send in batches to avoid edge function timeouts
    for i in range(0, len(entries), BATCH_SIZE):
        batch = entries[i:i + BATCH_SIZE]
        batch_num = (i // BATCH_SIZE) + 1
        total_batches = (len(entries) + BATCH_SIZE - 1) // BATCH_SIZE
        print(f"    Batch {batch_num}/{total_batches} ({len(batch)} entries)...")

        try:
            resp = requests.post(url, json={'entries': batch}, headers=headers, timeout=60)
            if resp.status_code == 200:
                data = resp.json()
                total_inserted += data.get('inserted', 0)
                total_updated += data.get('updated', 0)
                total_skipped += data.get('skipped', 0)
                batch_errors = data.get('errors', [])
                if batch_errors:
                    all_errors.extend(batch_errors[:5])  # cap error logging
            else:
                all_errors.append(f"Batch {batch_num}: HTTP {resp.status_code} - {resp.text[:200]}")
        except Exception as e:
            all_errors.append(f"Batch {batch_num}: {str(e)}")

    return {
        'inserted': total_inserted,
        'updated': total_updated,
        'skipped': total_skipped,
        'errors': all_errors,
        'batches': total_batches,
    }


def run(
    session_id: str = "UNKNOWN",
    agent: str = "UNKNOWN",
    backfill: bool = False,
    batch_size: int = BATCH_SIZE,
    max_entries: int = 0,
    include_patent_bags: bool = False,
    include_context_management: bool = False,
    min_confidence: float = 0.4,
):
    """Execute the Pipeline Bridge."""
    print("SP-10 PIPELINE BRIDGE: Connecting Corps to Staff...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    supabase_url, service_key = _load_env()
    state = _load_state()
    log = _load_log()

    # Collect all entries
    all_entries = []
    skipped_reasons = {}
    all_entries.extend(_collect_herald_entries())
    classifier_entries, classifier_stats = _collect_new_classifier_entries(
        state,
        session_id,
        agent,
        backfill=backfill,
        include_patent_bags=include_patent_bags,
        include_context_management=include_context_management,
        min_confidence=min_confidence,
    )
    skipped_reasons['classifier'] = classifier_stats
    all_entries.extend(classifier_entries)
    if backfill:
        archive_entries, archive_stats = _collect_archive_backfill_entries(
            state,
            session_id,
            agent,
            include_patent_bags=include_patent_bags,
            include_context_management=include_context_management,
        )
        skipped_reasons['archive_backfill'] = archive_stats
        all_entries.extend(archive_entries)
    all_entries.extend(_collect_courier_entries(state, session_id, agent))

    # Filter out already-bridged slugs
    bridged_slugs = set(state.get('bridged_slugs', []))
    new_entries = [e for e in all_entries if e['slug'] not in bridged_slugs]

    # De-duplicate by slug so archive and classifier sources do not double-submit.
    deduped = {}
    for entry in new_entries:
        deduped[entry['slug']] = entry
    new_entries = list(deduped.values())

    if max_entries and max_entries > 0:
        new_entries = new_entries[:max_entries]

    if not new_entries:
        print("  No new entries to bridge")
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'session_id': session_id,
            'agent': agent,
            'entries_collected': len(all_entries),
            'entries_new': 0,
            'result': 'nothing_to_bridge',
            'skipped_reasons': skipped_reasons,
        }
        log.append(log_entry)
        _save_log(log)
        state['last_run'] = datetime.now().isoformat()
        _save_state(state)
        return log_entry

    print(f"  Total entries to bridge: {len(new_entries)}")

    # POST to edge function (or log as pending if no credentials)
    if not supabase_url or not service_key:
        print("  WARNING: No Supabase credentials found — saving entries as PENDING")
        print("  To configure: create librarian-mcp/stitchpunks/.env with:")
        print("    SUPABASE_URL=https://your-project.supabase.co")
        print("    SUPABASE_SERVICE_ROLE_KEY=your-key")
        result = {
            'status': 'pending_no_credentials',
            'entries_pending': len(new_entries),
        }
    elif not requests:
        print("  WARNING: requests library not installed — saving entries as PENDING")
        print("  Run: pip install requests")
        result = {
            'status': 'pending_no_requests_lib',
            'entries_pending': len(new_entries),
        }
    else:
        print(f"  POSTing {len(new_entries)} entries to ingest-corps-content...")
        global BATCH_SIZE
        previous_batch_size = BATCH_SIZE
        BATCH_SIZE = batch_size
        result = _post_to_edge_function(supabase_url, service_key, new_entries)
        BATCH_SIZE = previous_batch_size

    # Update state
    success = 'error' not in result and result.get('status', '') not in ('pending_no_credentials', 'pending_no_requests_lib')
    if success:
        for entry in new_entries:
            if entry['slug'] not in state['bridged_slugs']:
                state['bridged_slugs'].append(entry['slug'])
            src = entry.get('source_file_path', '')
            if src and src not in state['bridged_files']:
                state['bridged_files'].append(src)
        print(f"  Bridge SUCCESS: {result}")
    else:
        print(f"  Bridge result: {result}")

    state['last_run'] = datetime.now().isoformat()
    _save_state(state)

    # Log
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'session_id': session_id,
        'agent': agent,
        'entries_collected': len(all_entries),
        'entries_new': len(new_entries),
        'entries_by_type': {},
        'result': result,
        'skipped_reasons': skipped_reasons,
        'mode': 'backfill' if backfill else 'incremental',
        'batch_size': batch_size,
    }
    for entry in new_entries:
        etype = entry.get('type', 'unknown')
        log_entry['entries_by_type'][etype] = log_entry['entries_by_type'].get(etype, 0) + 1

    log.append(log_entry)
    _save_log(log)
    print(f"  Bridge log: {LOG_PATH}")

    return log_entry


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="SP-10 Pipeline Bridge")
    parser.add_argument("session_id", nargs="?", default="UNKNOWN")
    parser.add_argument("agent", nargs="?", default="BISHOP")
    parser.add_argument("--backfill", action="store_true", help="Bridge full archive backlog, not just new files")
    parser.add_argument("--batch-size", type=int, default=BATCH_SIZE, help="POST batch size")
    parser.add_argument("--max-entries", type=int, default=0, help="Optional cap for single run")
    parser.add_argument("--include-patent-bags", action="store_true", help="Include 03_PATENT_BAGS in bridge")
    parser.add_argument("--include-context-management", action="store_true", help="Include 09_CONTEXT_MANAGEMENT in bridge")
    parser.add_argument("--min-confidence", type=float, default=0.4, help="Minimum classifier confidence threshold")
    args = parser.parse_args()

    run(
        session_id=args.session_id,
        agent=args.agent,
        backfill=args.backfill,
        batch_size=max(1, args.batch_size),
        max_entries=max(0, args.max_entries),
        include_patent_bags=args.include_patent_bags,
        include_context_management=args.include_context_management,
        min_confidence=max(0.0, min(1.0, args.min_confidence)),
    )
