"""
Scrambler — Staleness & Gap Detection
========================================
Flags stale/orphaned deliverables, auto-complete candidates,
and session index gaps. K418 / Innovation #2263.
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

SCRAMBLER_DIR = Path(__file__).resolve().parent
LIBRARIAN_DIR = SCRAMBLER_DIR.parent
INDEX_DIR = LIBRARIAN_DIR / "index"
SESSIONS_INDEX = INDEX_DIR / "sessions.json"
TOUCHSTONE_DIR = LIBRARIAN_DIR / "touchstone"
TOUCHSTONE_MANIFEST = TOUCHSTONE_DIR / "manifest.json"
TOUCHSTONE_LEDGER = TOUCHSTONE_DIR / "ledger.jsonl"


def load_sessions() -> list:
    if not SESSIONS_INDEX.exists():
        return []
    return json.loads(SESSIONS_INDEX.read_text(encoding="utf-8"))


def load_manifest() -> dict:
    if not TOUCHSTONE_MANIFEST.exists():
        return {"deliverables": []}
    return json.loads(TOUCHSTONE_MANIFEST.read_text(encoding="utf-8"))


def extract_session_number(sid: str) -> Optional[int]:
    """Extract numeric portion from session ID like 'B098' -> 98, 'K407' -> 407."""
    m = re.match(r'^[A-Z](\d+)', sid)
    return int(m.group(1)) if m else None


def _normalize_session_id(sid: str) -> str:
    """Normalize malformed session IDs to canonical form before gap analysis.

    Rules:
    - KNIGHT_XXX  → KXXX  (all-caps KNIGHT prefix)
    - knight-XXX  → KXXX  (lowercase knight prefix)
    Patterns that don't match are returned unchanged.
    """
    return re.sub(r'^(?:KNIGHT|knight)[_-](\d+)', r'K\1', sid)


def detect_session_gaps(sessions: list) -> list:
    """
    Find gaps in session numbering per agent prefix.
    E.g., if we have B096, B097, B101 — gaps are B098, B099, B100.

    Cross-prefix guard (K460 + MAMBA fix): when a session ID contains parts from
    multiple agent namespaces (e.g. K154-B041-sync or K232_B067), only the parts
    whose letter matches the *primary* prefix of the ID are counted.  This prevents
    entries like K154-B041-sync from injecting phantom B041 into the B namespace
    and manufacturing ~9 false B-namespace gaps.
    """
    by_prefix: dict[str, list[int]] = {}

    for s in sessions:
        sid = s.get("id", "")
        if not sid:
            continue
        # TEST_ prefix IDs are the K460 escape hatch — exclude from gap detection
        # so test authors injecting e.g. TEST_K999 don't manufacture phantom gaps.
        if sid.startswith("TEST_"):
            continue

        # Normalize KNIGHT_XXX / knight-XXX → KXXX before further parsing
        sid = _normalize_session_id(sid)

        prefix = sid[0] if sid[0].isalpha() else None
        if not prefix:
            continue

        if "-" in sid or "_" in sid:
            # Split on both separators; only count parts whose prefix matches
            # the primary prefix to avoid cross-namespace injection.
            parts = re.split(r"[-_]", sid)
            for part in parts:
                part = part.strip()
                m = re.match(r'^([A-Z])(\d+)$', part)
                if m and m.group(1) == prefix:
                    by_prefix.setdefault(prefix, []).append(int(m.group(2)))
        else:
            num = extract_session_number(sid)
            if num is not None:
                by_prefix.setdefault(prefix, []).append(num)

    gaps = []
    for prefix, numbers in by_prefix.items():
        if not numbers:
            continue
        numbers = sorted(set(numbers))
        min_n, max_n = numbers[0], numbers[-1]
        present = set(numbers)

        for n in range(min_n, max_n + 1):
            if n not in present:
                gaps.append({
                    "missing_id": f"{prefix}{n:03d}" if n < 100 else f"{prefix}{n}",
                    "prefix": prefix,
                    "number": n,
                    "between": f"{prefix}{n-1} and {prefix}{n+1}",
                })

    return sorted(gaps, key=lambda g: (g["prefix"], g["number"]))


def flag_stale_deliverables(manifest: dict, sessions: list) -> list:
    """
    Flag deliverables that are stale or orphaned based on session count.
    - Pending 5+ sessions with no status change → [STALE]
    - In-progress 10+ sessions with no update → [ORPHANED]
    """
    deliverables = manifest.get("deliverables", [])
    if not deliverables or not sessions:
        return []

    current_session_count = len(sessions)
    flags = []

    ledger_events = _load_ledger_events()

    for d in deliverables:
        did = d["id"]
        status = d.get("status", "pending")
        created_at = d.get("created_at", "")

        if status in ("completed", "failed"):
            continue

        last_event = _find_last_event(did, ledger_events)
        last_event_session = _estimate_session_index(last_event, sessions) if last_event else 0
        created_session = _estimate_session_index_by_date(created_at, sessions) if created_at else 0

        reference_session = max(last_event_session, created_session)
        sessions_since = current_session_count - reference_session if reference_session > 0 else current_session_count

        flag = None
        if status == "pending" and sessions_since >= 5:
            flag = {
                "deliverable_id": did,
                "title": d.get("title", ""),
                "status": status,
                "flag": "STALE",
                "sessions_since_activity": sessions_since,
                "last_activity": last_event.get("timestamp", "") if last_event else created_at,
                "message": f"Pending for {sessions_since} sessions with no status change",
            }
        elif status == "in_progress" and sessions_since >= 10:
            flag = {
                "deliverable_id": did,
                "title": d.get("title", ""),
                "status": status,
                "flag": "ORPHANED",
                "sessions_since_activity": sessions_since,
                "last_activity": last_event.get("timestamp", "") if last_event else created_at,
                "message": f"In-progress for {sessions_since} sessions with no update",
            }

        if flag:
            flags.append(flag)

    return flags


def detect_auto_complete_candidates(manifest: dict, sessions: list, summary: str = "") -> list:
    """
    Pattern-match deliverable titles against session summaries and files_changed
    to find deliverables that may have been completed without being marked.
    """
    deliverables = manifest.get("deliverables", [])
    candidates = []

    search_corpus = _build_search_corpus(sessions, summary)

    for d in deliverables:
        if d.get("status") in ("completed", "failed"):
            continue

        title = d.get("title") or ""
        notes = d.get("notes") or ""
        did = d["id"]

        score = _match_score(title, notes, search_corpus)

        if score >= 2:
            candidates.append({
                "deliverable_id": did,
                "title": title,
                "status": d.get("status", "pending"),
                "flag": "AUTO-COMPLETE CANDIDATE",
                "match_score": score,
                "message": f"Title/notes match {score} session references — verify completion",
            })

    return sorted(candidates, key=lambda c: c["match_score"], reverse=True)


def _load_ledger_events() -> list:
    if not TOUCHSTONE_LEDGER.exists():
        return []
    entries = []
    for line in TOUCHSTONE_LEDGER.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries


def _find_last_event(deliverable_id: str, events: list) -> Optional[dict]:
    last = None
    for e in events:
        if e.get("deliverable_id") == deliverable_id:
            last = e
    return last


def _estimate_session_index(event: dict, sessions: list) -> int:
    """Rough estimate of which session an event corresponds to by timestamp."""
    ts = event.get("timestamp", "")
    if not ts:
        return 0
    for i, s in enumerate(sessions):
        if s.get("date", "") >= ts[:10]:
            return i
    return len(sessions)


def _estimate_session_index_by_date(date_str: str, sessions: list) -> int:
    if not date_str:
        return 0
    date_prefix = date_str[:10]
    for i, s in enumerate(sessions):
        if s.get("date", "") >= date_prefix:
            return i
    return len(sessions)


def _build_search_corpus(sessions: list, extra_summary: str = "") -> str:
    """Build a lowercase text corpus from recent session data for matching."""
    parts = []
    for s in sessions[-20:]:
        parts.append(s.get("summary", ""))
        parts.extend(s.get("filesChanged", []))
        parts.extend(s.get("pagesCreated", []))
        parts.extend(s.get("functionsCreated", []))
    if extra_summary:
        parts.append(extra_summary)
    return " ".join(parts).lower()


def _match_score(title: str, notes: str, corpus: str) -> int:
    """Score how well a deliverable's title/notes match session work."""
    score = 0
    title_words = set(re.findall(r'\b\w{4,}\b', title.lower()))
    note_words = set(re.findall(r'\b\w{4,}\b', notes.lower()))

    stopwords = {"this", "that", "with", "from", "have", "been", "will", "should", "must", "does"}
    title_words -= stopwords
    note_words -= stopwords

    for word in title_words:
        if word in corpus:
            score += 1

    for word in list(note_words)[:10]:
        if word in corpus:
            score += 1

    return score


ASTEROID_VAULT = LIBRARIAN_DIR.parent / "Asteroid-ProofVault"
BISHOP_DROPZONE = LIBRARIAN_DIR.parent / "BISHOP_DROPZONE"
SESSIONS_COVERAGE_OUTPUT = INDEX_DIR / "sessions_coverage.json"

# Known BP session range (extend as sessions are created)
_BP_MAX_SESSION = 70


def generate_sessions_coverage(bp_max: int = _BP_MAX_SESSION) -> list:
    """
    Scan workspace and produce per-BP-session coverage records.

    Fields:
      id              - e.g. "BP001"
      docx_present    - True if a BP*.docx exists anywhere under workspace
      md_converted    - True if a BP*.md exists in BISHOP_DROPZONE or Asteroid-ProofVault
      soccerball_sid  - matching session id in sessions.json, or null
      ingest_receipt  - True if BP{N}_INGEST_RECEIPT* exists in Asteroid-ProofVault
      close_stamped   - True if BP{N}_CLOSE_STAMP* exists in Asteroid-ProofVault
    """
    sessions = load_sessions()
    sessions_by_id: dict[str, dict] = {s.get("id", ""): s for s in sessions}

    # Index files once
    vault_files: list[str] = []
    if ASTEROID_VAULT.exists():
        vault_files = [f.name for f in ASTEROID_VAULT.iterdir() if f.is_file()]

    dropzone_md: list[str] = []
    if BISHOP_DROPZONE.exists():
        for f in BISHOP_DROPZONE.rglob("*.md"):
            dropzone_md.append(f.name)

    records = []
    for n in range(1, bp_max + 1):
        bp_id = f"BP{n:03d}"
        prefix_pattern = re.compile(rf"^BP0*{n}[^0-9]", re.IGNORECASE)

        ingest_receipt = any(
            re.match(rf"^BP0*{n}_INGEST_RECEIPT", f, re.IGNORECASE) for f in vault_files
        )
        close_stamped = any(
            re.match(rf"^BP0*{n}_CLOSE_STAMP", f, re.IGNORECASE) for f in vault_files
        )
        # md_converted: presence of BP{N}*.md in dropzone directories or vault
        md_converted = any(prefix_pattern.match(f) for f in dropzone_md) or any(
            prefix_pattern.match(f) and f.endswith(".md") for f in vault_files
        )
        # soccerball_sid: match in sessions index
        soccerball_sid = None
        if bp_id in sessions_by_id:
            soccerball_sid = bp_id
        else:
            # Try loose match (e.g. BP002 might be stored as BP002 etc.)
            for sid in sessions_by_id:
                if re.match(rf"^BP0*{n}$", sid, re.IGNORECASE):
                    soccerball_sid = sid
                    break

        records.append({
            "id": bp_id,
            "docx_present": False,   # docx scan skipped (slow); set by manual update
            "md_converted": md_converted,
            "soccerball_sid": soccerball_sid,
            "ingest_receipt": ingest_receipt,
            "close_stamped": close_stamped,
        })

    return records


def write_sessions_coverage() -> dict:
    """Generate and write sessions_coverage.json; return summary stats."""
    records = generate_sessions_coverage()
    SESSIONS_COVERAGE_OUTPUT.write_text(
        json.dumps({"generated_at": datetime.now(timezone.utc).isoformat(), "sessions": records},
                   indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    ingested = sum(1 for r in records if r["ingest_receipt"])
    closed = sum(1 for r in records if r["close_stamped"])
    uningested = [r["id"] for r in records if not r["ingest_receipt"]]
    return {
        "path": str(SESSIONS_COVERAGE_OUTPUT),
        "total": len(records),
        "ingested": ingested,
        "closed": closed,
        "uningested_ids": uningested,
    }


def scan_uningested_bp_sessions(bp_max: int = _BP_MAX_SESSION) -> list[str]:
    """Return list of BP session IDs that have no ingest receipt in Asteroid-ProofVault."""
    if not ASTEROID_VAULT.exists():
        return [f"BP{n:03d}" for n in range(1, bp_max + 1)]
    vault_files = [f.name for f in ASTEROID_VAULT.iterdir() if f.is_file()]
    uningested = []
    for n in range(1, bp_max + 1):
        has_receipt = any(
            re.match(rf"^BP0*{n}_INGEST_RECEIPT", f, re.IGNORECASE) for f in vault_files
        )
        if not has_receipt:
            uningested.append(f"BP{n:03d}")
    return uningested


def full_staleness_report() -> dict:
    """Generate a complete staleness + gap report, including coverage dashboard."""
    sessions = load_sessions()
    manifest = load_manifest()

    session_gaps = detect_session_gaps(sessions)
    stale_flags = flag_stale_deliverables(manifest, sessions)
    auto_candidates = detect_auto_complete_candidates(manifest, sessions)
    uningested = scan_uningested_bp_sessions()

    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "session_gaps": session_gaps,
        "session_gap_count": len(session_gaps),
        "stale_deliverables": stale_flags,
        "stale_count": len(stale_flags),
        "auto_complete_candidates": auto_candidates,
        "auto_complete_count": len(auto_candidates),
        "uningested_bp_sessions": uningested,
        "uningested_count": len(uningested),
    }


if __name__ == "__main__":
    import sys as _sys
    if len(_sys.argv) > 1 and _sys.argv[1] == "--coverage":
        summary = write_sessions_coverage()
        print(json.dumps(summary, indent=2, ensure_ascii=False))
    else:
        result = full_staleness_report()
        print(json.dumps(result, indent=2, ensure_ascii=False))
