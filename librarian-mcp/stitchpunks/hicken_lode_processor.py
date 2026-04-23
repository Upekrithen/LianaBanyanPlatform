"""
Hicken Lode Processor (K333)
============================
Chunked compilation workflow for oversized document families ("Lodes").

Usage:
  python hicken_lode_processor.py --dry-run
  python hicken_lode_processor.py --family "index"
  python hicken_lode_processor.py --family "index" --dry-run
"""

import argparse
import json
import math
import os
import re
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Tuple
from urllib.parse import quote

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
PROGRESS_PATH = DATA_DIR / "hicken_lode_progress.json"

CHUNK_BYTES = 200 * 1024
LODE_THRESHOLD_BYTES = 200 * 1024
CHUNK_DELAY_SECONDS = 1
FAMILY_DELAY_SECONDS = 2


def normalize_family_name(filename: str, slug: str = "") -> str:
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


def load_env() -> Tuple[str, str]:
    if load_dotenv and ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    return os.environ.get("SUPABASE_URL", "").rstrip("/"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def load_archive_content(archive_file: str) -> str:
    path = ARCHIVE_DIR / archive_file
    if not path.exists():
        return ""
    try:
        with open(path, "r", encoding="utf-8") as f:
            payload = json.load(f)
        return payload.get("content_markdown", "") or ""
    except Exception:
        return ""


def chunk_text(content: str, chunk_bytes: int = CHUNK_BYTES) -> List[str]:
    raw = content.encode("utf-8")
    chunks: List[str] = []
    offset = 0
    while offset < len(raw):
        end = min(offset + chunk_bytes, len(raw))
        # Keep chunk boundary UTF-8-safe.
        while end > offset:
            try:
                candidate = raw[offset:end].decode("utf-8")
                chunks.append(candidate)
                offset = end
                break
            except UnicodeDecodeError:
                end -= 1
        if end <= offset:
            # Last-resort fallback to avoid deadlock on malformed bytes.
            fallback_end = min(offset + chunk_bytes, len(raw))
            chunks.append(raw[offset:fallback_end].decode("utf-8", errors="ignore"))
            offset = fallback_end
    return chunks


def build_family_queue(index_entries: List[Dict[str, Any]], family_filter: str = "") -> List[Dict[str, Any]]:
    families: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
    for entry in index_entries:
        family = normalize_family_name(entry.get("filename", ""), entry.get("slug", ""))
        families[family].append(entry)

    queue: List[Dict[str, Any]] = []
    filter_norm = family_filter.lower().strip()

    for family_name, items in families.items():
        if len(items) < 2:
            continue
        if filter_norm and filter_norm not in family_name:
            continue

        best_entry = None
        best_content = ""
        best_size_bytes = 0
        for entry in items:
            content = load_archive_content(entry.get("archive_file", ""))
            size_bytes = len(content.encode("utf-8"))
            if size_bytes > best_size_bytes:
                best_size_bytes = size_bytes
                best_content = content
                best_entry = entry
        if not best_entry:
            continue
        if best_size_bytes <= LODE_THRESHOLD_BYTES:
            continue

        queue.append(
            {
                "family_name": family_name,
                "items": items,
                "best_entry": best_entry,
                "best_content": best_content,
                "best_size_bytes": best_size_bytes,
            }
        )

    queue.sort(key=lambda row: row["best_size_bytes"], reverse=True)
    return queue


def get_existing_progress(url: str, key: str, slug: str) -> Dict[str, Any]:
    endpoint = f"{url}/rest/v1/compiled_documents?slug=eq.{quote(slug)}&select=slug,content_size_bytes,status"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
    }
    try:
        response = requests.get(endpoint, headers=headers, timeout=30)
        if response.status_code >= 300:
            return {}
        rows = response.json()
        if not rows:
            return {}
        return rows[0]
    except Exception:
        return {}


def post_chunk(url: str, key: str, payload: Dict[str, Any]) -> Tuple[bool, str]:
    endpoint = f"{url}/functions/v1/compile-document-chunked"
    headers = {
        "Authorization": f"Bearer {key}",
        "apikey": key,
        "Content-Type": "application/json",
    }
    try:
        response = requests.post(endpoint, json=payload, headers=headers, timeout=120)
        if response.status_code >= 300:
            return False, f"HTTP {response.status_code}: {response.text[:300]}"
        return True, response.text[:200]
    except Exception as exc:
        return False, str(exc)


def save_progress(progress: Dict[str, Any]) -> None:
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def run(dry_run: bool = False, family_filter: str = "") -> int:
    if requests is None:
        print("ERROR: requests package required. Install with `pip install requests`.")
        return 1
    if not INDEX_PATH.exists():
        print(f"ERROR: Missing index file at {INDEX_PATH}")
        return 1

    with open(INDEX_PATH, "r", encoding="utf-8") as f:
        index_payload = json.load(f)
    entries = index_payload.get("entries", [])

    queue = build_family_queue(entries, family_filter=family_filter)
    print("=" * 72)
    print("  HICKEN LODE PROCESSOR (K333)")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Lode queue size: {len(queue)}")
    if dry_run:
        print("  MODE: DRY RUN")
    if family_filter:
        print(f"  FAMILY FILTER: {family_filter}")
    print("=" * 72)

    if not queue:
        print("No Lode families found for current filter.")
        return 0

    supabase_url, service_key = load_env()
    if not dry_run and (not supabase_url or not service_key):
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required")
        return 1

    progress: Dict[str, Any] = {
        "timestamp": datetime.now().isoformat(),
        "dry_run": dry_run,
        "family_filter": family_filter or None,
        "processed": [],
        "failed": [],
    }

    for family_index, row in enumerate(queue, start=1):
        family_name = row["family_name"]
        items = row["items"]
        best_entry = row["best_entry"]
        best_content = row["best_content"]
        best_size_bytes = row["best_size_bytes"]
        chunks = chunk_text(best_content)
        total_chunks = len(chunks)
        slug = f"compiled-{family_name}"
        title = best_entry.get("title") or family_name.replace("-", " ").title()

        print(
            f"\n[{family_index}/{len(queue)}] {family_name} | "
            f"{best_size_bytes / 1024:.1f} KB | {len(items)} variants | {total_chunks} chunks"
        )

        if dry_run:
            progress["processed"].append(
                {
                    "family_name": family_name,
                    "slug": slug,
                    "size_bytes": best_size_bytes,
                    "chunk_total": total_chunks,
                    "variants": len(items),
                }
            )
            continue

        existing = get_existing_progress(supabase_url, service_key, slug)
        existing_bytes = int(existing.get("content_size_bytes") or 0) if existing else 0
        start_chunk = existing_bytes // CHUNK_BYTES
        if existing_bytes and existing_bytes % CHUNK_BYTES != 0:
            # If a partial chunk was saved, replay that chunk.
            start_chunk = max(0, start_chunk)

        if start_chunk >= total_chunks:
            print(f"  Already complete (content_size_bytes={existing_bytes}).")
            progress["processed"].append(
                {
                    "family_name": family_name,
                    "slug": slug,
                    "resumed_from_chunk": start_chunk,
                    "status": "already_complete",
                }
            )
            if family_index < len(queue):
                time.sleep(FAMILY_DELAY_SECONDS)
            continue

        source_files = sorted(
            [
                {
                    "path": entry.get("path"),
                    "filename": entry.get("filename"),
                    "content_hash": (entry.get("archive_file") or "").replace(".json", ""),
                    "chars": int(entry.get("content_chars", 0) or 0),
                }
                for entry in items
            ],
            key=lambda value: value.get("chars", 0),
            reverse=True,
        )[:200]

        family_failed = False
        for chunk_index in range(start_chunk, total_chunks):
            payload = {
                "slug": slug,
                "title": f"[COMPILED] {title}",
                "family_name": family_name,
                "section": best_entry.get("section"),
                "category": best_entry.get("category"),
                "section_librarian": best_entry.get("section_librarian"),
                "chunk_index": chunk_index,
                "chunk_total": total_chunks,
                "chunk_content": chunks[chunk_index],
                "source_count": len(items),
                "source_files": source_files,
                "unique_variants": len({entry.get("archive_file", "") for entry in items if entry.get("archive_file")}),
                "compilation_notes": (
                    f"Hicken chunked Lode compile. Family size: {best_size_bytes} bytes. "
                    f"Chunk {chunk_index + 1}/{total_chunks}"
                ),
                "compiled_by": "HICKEN",
                "founder_corrections_applied": ["K333_CHUNKED_LODE_PIPELINE"],
            }

            ok, message = post_chunk(supabase_url, service_key, payload)
            if not ok:
                print(f"  Chunk {chunk_index + 1}/{total_chunks} FAILED: {message}")
                progress["failed"].append(
                    {
                        "family_name": family_name,
                        "slug": slug,
                        "chunk_index": chunk_index,
                        "chunk_total": total_chunks,
                        "error": message,
                    }
                )
                family_failed = True
                break

            print(f"  Chunk {chunk_index + 1}/{total_chunks} OK")
            save_progress(progress)
            if chunk_index < total_chunks - 1:
                time.sleep(CHUNK_DELAY_SECONDS)

        if not family_failed:
            progress["processed"].append(
                {
                    "family_name": family_name,
                    "slug": slug,
                    "size_bytes": best_size_bytes,
                    "chunk_total": total_chunks,
                    "resumed_from_chunk": start_chunk,
                    "status": "success",
                }
            )
            print("  Family compile complete.")

        save_progress(progress)
        if family_index < len(queue):
            time.sleep(FAMILY_DELAY_SECONDS)

    print("\n" + "=" * 72)
    print("  HICKEN RUN COMPLETE")
    print(f"  Processed: {len(progress['processed'])}")
    print(f"  Failed: {len(progress['failed'])}")
    print(f"  Progress file: {PROGRESS_PATH}")
    print("=" * 72)
    return 0 if not progress["failed"] else 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Chunked Lode compilation processor.")
    parser.add_argument("--dry-run", action="store_true", help="Preview queue without sending chunks.")
    parser.add_argument("--family", type=str, default="", help="Process a single family name (substring match).")
    args = parser.parse_args()
    return run(dry_run=args.dry_run, family_filter=args.family)


if __name__ == "__main__":
    raise SystemExit(main())
