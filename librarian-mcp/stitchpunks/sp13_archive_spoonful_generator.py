"""
SP-13: Archive Spoonful Generator

Generates distributable archive content directly into Battery Dispatch queue:
- Spoonfuls (channel=spoonfuls)
- Skipping Stones (channel=skipping_stones)
- BST-style archive episodes (channel=bst)

Source:
  compiled_documents where status in ('canonical', 'reviewed')
  and category in founding/journal/economic/creative/academic buckets.

Output:
  queued rows in crewman_episodes under one staged chapter.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

try:
    import requests
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
STITCHPUNK_DIR = Path(__file__).parent
DATA_DIR = STITCHPUNK_DIR / "data"
ENV_PATH = STITCHPUNK_DIR / ".env"
STATE_PATH = DATA_DIR / "sp13_archive_generator_state.json"
LOG_PATH = DATA_DIR / "sp13_archive_generator_log.json"

ARCHIVE_CATEGORIES = [
    # Legacy labels from prompt
    "founding_document",
    "journal",
    "economic_treatise",
    "creative_lore",
    "academic_document",
    # Live taxonomy currently used in compiled_documents
    "system_design",
    "reference",
    "founders-journal",
    "article",
    "innovation",
    "academic-paper",
]

MAX_POST_LEN = 280
DEFAULT_DOMAIN = "https://lianabanyan.com"
DEFAULT_PLATFORM = "twitter"
DEFAULT_PRIMARY_SPICE = "basil"


@dataclass
class CompiledDocument:
    id: str
    slug: str
    title: str
    category: Optional[str]
    family_name: Optional[str]
    compiled_markdown: str
    status: Optional[str]


def _load_env() -> Tuple[str, str]:
    if load_dotenv and ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    return (
        os.environ.get("SUPABASE_URL", "").rstrip("/"),
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
    )


def _auth_headers(service_role_key: str) -> Dict[str, str]:
    return {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }


def _load_json(path: Path, fallback):
    if not path.exists():
        return fallback
    try:
        with open(path, "r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return fallback


def _save_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def _get(
    supabase_url: str,
    headers: Dict[str, str],
    table: str,
    params: Dict[str, str],
) -> List[dict]:
    if not requests:
        raise RuntimeError("requests is required. Run: pip install requests")
    url = f"{supabase_url}/rest/v1/{table}"
    resp = requests.get(url, headers=headers, params=params, timeout=60)
    if resp.status_code >= 300:
        raise RuntimeError(f"GET {table} failed: {resp.status_code} {resp.text[:400]}")
    return resp.json()


def _post(
    supabase_url: str,
    headers: Dict[str, str],
    table: str,
    payload: List[dict],
) -> List[dict]:
    if not requests:
        raise RuntimeError("requests is required. Run: pip install requests")
    url = f"{supabase_url}/rest/v1/{table}"
    h = dict(headers)
    h["Prefer"] = "return=representation"
    resp = requests.post(url, headers=h, data=json.dumps(payload), timeout=60)
    if resp.status_code >= 300:
        raise RuntimeError(f"POST {table} failed: {resp.status_code} {resp.text[:400]}")
    return resp.json()


def _patch(
    supabase_url: str,
    headers: Dict[str, str],
    table: str,
    params: Dict[str, str],
    payload: Dict[str, object],
) -> List[dict]:
    if not requests:
        raise RuntimeError("requests is required. Run: pip install requests")
    url = f"{supabase_url}/rest/v1/{table}"
    h = dict(headers)
    h["Prefer"] = "return=representation"
    resp = requests.patch(url, headers=h, params=params, data=json.dumps(payload), timeout=60)
    if resp.status_code >= 300:
        raise RuntimeError(f"PATCH {table} failed: {resp.status_code} {resp.text[:400]}")
    return resp.json()


def _parse_docs(rows: Sequence[dict]) -> List[CompiledDocument]:
    docs: List[CompiledDocument] = []
    for row in rows:
        docs.append(
            CompiledDocument(
                id=str(row.get("id")),
                slug=str(row.get("slug")),
                title=str(row.get("title") or "Untitled Archive Document"),
                category=row.get("category"),
                family_name=row.get("family_name"),
                compiled_markdown=str(row.get("compiled_markdown") or ""),
                status=row.get("status"),
            )
        )
    return docs


def _extract_innovation_refs(text: str) -> List[int]:
    refs = re.findall(r"#(\d{1,5})", text or "")
    unique = sorted({int(x) for x in refs if x.isdigit()})
    return unique


def _split_passages(markdown: str) -> List[str]:
    text = re.sub(r"`{3}.*?`{3}", " ", markdown or "", flags=re.S)
    text = re.sub(r"!\[[^\]]*\]\([^\)]*\)", " ", text)
    parts = re.split(r"\n\s*\n+", text)
    cleaned = []
    for part in parts:
        p = re.sub(r"\s+", " ", part).strip()
        if len(p) < 80:
            continue
        cleaned.append(p)
    return cleaned


def _score_passage(passage: str, innovation_refs: Sequence[int]) -> float:
    length = len(passage)
    if length < 90:
        return 0
    ideal = 220
    length_score = max(0, 1 - abs(length - ideal) / ideal)
    ref_score = 0
    if innovation_refs:
        for ref in innovation_refs:
            if f"#{ref}" in passage:
                ref_score += 1.5
    quote_bonus = 0.2 if ("\"" in passage or "—" in passage) else 0.0
    return (length_score * 2.0) + ref_score + quote_bonus


def _truncate_post(text: str, max_len: int = MAX_POST_LEN) -> str:
    t = re.sub(r"\s+", " ", text).strip()
    if len(t) <= max_len:
        return t
    return t[: max(0, max_len - 1)].rstrip() + "…"


def _build_spoonfuls(doc: CompiledDocument, limit: int = 6) -> List[str]:
    refs = _extract_innovation_refs(doc.compiled_markdown)
    passages = _split_passages(doc.compiled_markdown)
    ranked = sorted(passages, key=lambda p: _score_passage(p, refs), reverse=True)
    selected = ranked[: max(1, min(limit, 8))]
    url = f"{DEFAULT_DOMAIN}/cephas/archive/{doc.slug}"
    out: List[str] = []
    for passage in selected:
        quote = _truncate_post(passage, 190)
        body = f"\"{quote}\" — from {doc.title} | Read more: {url}"
        out.append(_truncate_post(body))
    return out


def _build_skipping_stones(doc: CompiledDocument, spoonfuls: Sequence[str]) -> List[str]:
    refs = _extract_innovation_refs(doc.compiled_markdown)
    teaser_refs = ", ".join(f"#{n}" for n in refs[:3]) if refs else "core archive ideas"
    url = f"{DEFAULT_DOMAIN}/cephas/archive/{doc.slug}"
    stones: List[str] = []
    for idx, spoon in enumerate(spoonfuls[:3], start=1):
        line = (
            f"Skipping Stone {idx}: {doc.title} -> {teaser_refs}. "
            f"Start with the teaser, then trace to source: {url}"
        )
        if spoon:
            line = f"{line} | {spoon[:90].rstrip('…')}"
        stones.append(_truncate_post(line))
    return stones


def _build_bst_archive_episodes(doc: CompiledDocument) -> List[str]:
    refs = _extract_innovation_refs(doc.compiled_markdown)
    innovation_count = len(refs)
    passages = _split_passages(doc.compiled_markdown)[:5]
    if not passages:
        passages = [doc.compiled_markdown[:320] if doc.compiled_markdown else doc.title]
    url = f"{DEFAULT_DOMAIN}/cephas/archive/{doc.slug}"
    episodes: List[str] = []
    for idx, passage in enumerate(passages[:5], start=1):
        excerpt = _truncate_post(passage, 140)
        line = (
            f"From the Archives ({idx}/5): {doc.title} — {excerpt} "
            f"{innovation_count} innovations trace back here. {url}"
        )
        episodes.append(_truncate_post(line))
    return episodes


def _next_chapter_number(supabase_url: str, headers: Dict[str, str]) -> int:
    rows = _get(
        supabase_url,
        headers,
        "crewman_chapters",
        {
            "select": "chapter_number",
            "order": "chapter_number.desc",
            "limit": "1",
        },
    )
    if not rows:
        return 1000
    return int(rows[0]["chapter_number"]) + 1


def _upsert_archive_chapter(
    supabase_url: str,
    headers: Dict[str, str],
    chapter_number: int,
    title: str,
    source_document: str,
    episode_count: int,
) -> str:
    existing = _get(
        supabase_url,
        headers,
        "crewman_chapters",
        {"select": "id", "chapter_number": f"eq.{chapter_number}", "limit": "1"},
    )
    if existing:
        chapter_id = existing[0]["id"]
        _patch(
            supabase_url,
            headers,
            "crewman_chapters",
            {"id": f"eq.{chapter_id}"},
            {
                "title": title,
                "source_document": source_document,
                "episode_count": episode_count,
                "status": "staged",
                "updated_at": datetime.utcnow().isoformat(),
            },
        )
        return chapter_id

    inserted = _post(
        supabase_url,
        headers,
        "crewman_chapters",
        [
            {
                "chapter_number": chapter_number,
                "title": title,
                "source_document": source_document,
                "cephas_content_key": source_document,
                "episode_count": episode_count,
                "vote_threshold": 100,
                "status": "staged",
            }
        ],
    )
    return inserted[0]["id"]


def _existing_source_refs(
    supabase_url: str,
    headers: Dict[str, str],
    chapter_id: str,
) -> set:
    rows = _get(
        supabase_url,
        headers,
        "crewman_episodes",
        {
            "select": "source_reference",
            "chapter_id": f"eq.{chapter_id}",
            "limit": "10000",
        },
    )
    return {str(r.get("source_reference")) for r in rows if r.get("source_reference")}


def _insert_episodes(
    supabase_url: str,
    headers: Dict[str, str],
    chapter_id: str,
    episodes: Sequence[dict],
) -> int:
    if not episodes:
        return 0
    _post(supabase_url, headers, "crewman_episodes", list(episodes))
    return len(episodes)


def run(max_docs: int = 20, dry_run: bool = False) -> dict:
    supabase_url, service_key = _load_env()
    if not supabase_url or not service_key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in environment.")

    headers = _auth_headers(service_key)
    state = _load_json(STATE_PATH, {"last_run": None, "processed_slugs": []})
    processed_slugs = set(state.get("processed_slugs", []))

    category_filter = "(" + ",".join(ARCHIVE_CATEGORIES) + ")"
    status_filter = "(canonical,reviewed,published)"
    raw_docs = _get(
        supabase_url,
        headers,
        "compiled_documents",
        {
            "select": "id,slug,title,category,family_name,compiled_markdown,status",
            "status": f"in.{status_filter}",
            "category": f"in.{category_filter}",
            "order": "compiled_at.desc",
            "limit": str(max_docs * 3),
        },
    )
    docs = _parse_docs(raw_docs)
    docs = [d for d in docs if d.slug not in processed_slugs][:max_docs]

    if not docs:
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "no_new_archive_docs",
            "considered": len(raw_docs),
            "generated": 0,
        }
        _save_json(LOG_PATH, _load_json(LOG_PATH, []) + [result])
        return result

    chapter_number = _next_chapter_number(supabase_url, headers)
    chapter_title = f"Archive Dispatch Batch {chapter_number}"
    chapter_source = "compiled_documents"

    all_episode_rows: List[dict] = []
    sequence = 1
    generated_by_doc = []

    for doc in docs:
        spoonfuls = _build_spoonfuls(doc, limit=6)
        stones = _build_skipping_stones(doc, spoonfuls)
        bst_eps = _build_bst_archive_episodes(doc)[:3]
        generated_by_doc.append(
            {
                "slug": doc.slug,
                "title": doc.title,
                "spoonfuls": len(spoonfuls),
                "skipping_stones": len(stones),
                "bst": len(bst_eps),
            }
        )

        for idx, text in enumerate(spoonfuls, start=1):
            all_episode_rows.append(
                {
                    "sequence_number": sequence,
                    "content": text,
                    "source_reference": f"archive:{doc.slug}:spoonful:{idx}",
                    "tags": ["archive", "spoonfuls", doc.category or "archive_document"],
                    "platform": DEFAULT_PLATFORM,
                    "channel": "spoonfuls",
                    "status": "queued",
                    "primary_spice": DEFAULT_PRIMARY_SPICE,
                }
            )
            sequence += 1

        for idx, text in enumerate(stones, start=1):
            all_episode_rows.append(
                {
                    "sequence_number": sequence,
                    "content": text,
                    "source_reference": f"archive:{doc.slug}:stone:{idx}",
                    "tags": ["archive", "skipping_stones", doc.category or "archive_document"],
                    "platform": DEFAULT_PLATFORM,
                    "channel": "skipping_stones",
                    "status": "queued",
                    "primary_spice": DEFAULT_PRIMARY_SPICE,
                }
            )
            sequence += 1

        for idx, text in enumerate(bst_eps, start=1):
            all_episode_rows.append(
                {
                    "sequence_number": sequence,
                    "content": text,
                    "source_reference": f"archive:{doc.slug}:bst:{idx}",
                    "tags": ["archive", "bst", doc.category or "archive_document"],
                    "platform": DEFAULT_PLATFORM,
                    "channel": "bst",
                    "status": "queued",
                    "primary_spice": DEFAULT_PRIMARY_SPICE,
                }
            )
            sequence += 1

    if dry_run:
        result = {
            "timestamp": datetime.utcnow().isoformat(),
            "status": "dry_run",
            "chapter_number": chapter_number,
            "chapter_title": chapter_title,
            "docs_processed": len(docs),
            "episodes_prepared": len(all_episode_rows),
            "details": generated_by_doc,
        }
        _save_json(LOG_PATH, _load_json(LOG_PATH, []) + [result])
        return result

    chapter_id = _upsert_archive_chapter(
        supabase_url,
        headers,
        chapter_number=chapter_number,
        title=chapter_title,
        source_document=chapter_source,
        episode_count=len(all_episode_rows),
    )

    existing_refs = _existing_source_refs(supabase_url, headers, chapter_id)
    episode_rows = []
    for row in all_episode_rows:
        if row["source_reference"] in existing_refs:
            continue
        payload = dict(row)
        payload["chapter_id"] = chapter_id
        episode_rows.append(payload)

    inserted = _insert_episodes(supabase_url, headers, chapter_id, episode_rows)

    state["last_run"] = datetime.utcnow().isoformat()
    state["processed_slugs"] = sorted(list(processed_slugs.union({d.slug for d in docs})))
    _save_json(STATE_PATH, state)

    result = {
        "timestamp": datetime.utcnow().isoformat(),
        "status": "ok",
        "chapter_id": chapter_id,
        "chapter_number": chapter_number,
        "docs_processed": len(docs),
        "episodes_prepared": len(all_episode_rows),
        "episodes_inserted": inserted,
        "details": generated_by_doc,
    }
    _save_json(LOG_PATH, _load_json(LOG_PATH, []) + [result])
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SP-13 archive spoonful generator")
    parser.add_argument("--max-docs", type=int, default=20, help="Max archive docs to process")
    parser.add_argument("--dry-run", action="store_true", help="Generate but do not write to Supabase")
    args = parser.parse_args()

    output = run(max_docs=max(1, args.max_docs), dry_run=args.dry_run)
    print(json.dumps(output, indent=2))
