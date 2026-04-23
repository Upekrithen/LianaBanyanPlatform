"""
SP-14 TRANSCRIPT HARVESTER
===========================
Parse Anthropic claude.ai data export (conversations.json) and write per-session
markdown transcripts into BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/.

Why: claude.ai web sessions aren't in the project file system. Editorial reasoning
produced during those sessions (letter iterations, framework discussions, decision
histories) dissipates when the session ends. SP-14 harvests those transcripts so
SP-15 Editorial Archaeologist can distill them into canonical R9 preload content.

No API calls. Pure parse-and-write. Single pass on the export zip contents.

Usage:
  python sp14_transcript_harvester.py --export-dir /path/to/data-export
  python sp14_transcript_harvester.py --export-dir /path/to/data-export --dry-run
  python sp14_transcript_harvester.py --export-dir /path/to/data-export --all   # don't filter; harvest every session

Filter default: only sessions whose name or first-3-messages contain any of the
LB_KEYWORDS list. Use --all to bypass filtering.

Output:
  BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/<date>_<slug>.md  (one per session)
  BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/_INDEX.md          (auto-generated)
  sp14_state.json                                                    (run metadata)

Pre-registered in: BISHOP_DROPZONE/08_Papers/Academic/R9_EMPIRICAL_TEST_PREREGISTRATION_B108.md
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any

# Force UTF-8 stdout for Windows cp1252 consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # LianaBanyanPlatform/
OUTPUT_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS"
STATE_FILE = SCRIPT_DIR / "sp14_state.json"

# LB-relevance keywords (case-insensitive). A session qualifies if any of these
# appear in the session name OR in the content of the first 3 messages.
LB_KEYWORDS = [
    "liana banyan", "lianabanyan",
    "cardboard boots", "mackenzie scott", "mckenzie scott",
    "newmark", "craigslist",
    "seibel", "y combinator", "ycombinator",
    "tom simon", "fbi forensic",
    "khan academy", "sal khan", "khanmigo",
    "jose andres", "josé andrés", "world central kitchen",
    "trebor scholz", "platform cooperativism", "platform coop",
    "buffett", "warren buffett",
    "c+20", "cost+20", "cost plus 20", "cost of doing good",
    "romulator", "heoho", "interdependence",
    "medallion", "boaz", "hexisle",
    "jonathan jones", "founder@lianabanyan",
    "upekrithen", "cephas",
    "stitchpunk", "librarian", "scrambler",
    "innovation log", "crown jewel", "crown letter",
    "open water", "ripple", "voucher",
    "three currenc", "credits mark joule", "credits and marks", "joules",
    "patent prosecution", "patent pledge", "cooperative defensive",
    "glass door", "red carpet",
    "let's make dinner", "lets make dinner", "let's make bread", "lets make bread",
]


# ─── DATA STRUCTURES ──────────────────────────────────────────────────────────

@dataclass
class HarvestedSession:
    uuid: str
    name: str
    summary: str
    created_at: str
    updated_at: str
    message_count: int
    matched_keywords: list[str]
    filename: str


# ─── UTILITIES ────────────────────────────────────────────────────────────────

def slugify(name: str, maxlen: int = 60) -> str:
    """Make a filename-safe slug from a conversation name."""
    if not name:
        return "untitled"
    s = name.strip().lower()
    s = re.sub(r"[^a-z0-9\s\-_]+", "", s)
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:maxlen] or "untitled"


def extract_date(iso_ts: str | None) -> str:
    """Extract YYYY-MM-DD from an ISO-8601 timestamp."""
    if not iso_ts:
        return "unknown-date"
    m = re.match(r"(\d{4}-\d{2}-\d{2})", iso_ts)
    return m.group(1) if m else "unknown-date"


def extract_message_text(msg: dict[str, Any]) -> str:
    """Pull text out of an Anthropic export message.

    Anthropic's export schema can vary slightly; handle both:
      - content: "string"
      - content: [ { type: "text", text: "..." }, ... ]
    """
    content = msg.get("content")
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    parts.append(block.get("text", ""))
                elif block.get("type") == "tool_use":
                    tool_name = block.get("name", "?")
                    parts.append(f"[tool_use: {tool_name}]")
                elif block.get("type") == "tool_result":
                    parts.append("[tool_result]")
                # silently skip other block types
            elif isinstance(block, str):
                parts.append(block)
        return "\n".join(p for p in parts if p)
    return ""


def match_keywords(text: str) -> list[str]:
    """Return the subset of LB_KEYWORDS found in text (case-insensitive)."""
    lo = text.lower()
    return [k for k in LB_KEYWORDS if k in lo]


# ─── CORE HARVEST ─────────────────────────────────────────────────────────────

def harvest(export_dir: Path, *, all_sessions: bool, dry_run: bool) -> list[HarvestedSession]:
    conv_path = export_dir / "conversations.json"
    if not conv_path.exists():
        sys.exit(f"ERROR: {conv_path} not found")

    print(f"Reading {conv_path} ({conv_path.stat().st_size // 1024 // 1024} MB)...")
    with conv_path.open("r", encoding="utf-8") as f:
        conversations = json.load(f)

    if not isinstance(conversations, list):
        sys.exit(f"ERROR: expected list at top level, got {type(conversations).__name__}")

    print(f"Parsed {len(conversations)} conversations.")

    if not dry_run:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    harvested: list[HarvestedSession] = []
    skipped_no_match = 0
    skipped_empty = 0

    for i, conv in enumerate(conversations, start=1):
        uuid = conv.get("uuid", f"unknown-{i}")
        name = conv.get("name") or "(Untitled)"
        summary = conv.get("summary") or ""
        created_at = conv.get("created_at", "")
        updated_at = conv.get("updated_at", "")
        messages = conv.get("chat_messages") or []

        if not messages:
            skipped_empty += 1
            continue

        # Build search corpus: name + summary + first 3 messages' content
        search_corpus_parts = [name, summary]
        for m in messages[:3]:
            search_corpus_parts.append(extract_message_text(m))
        search_corpus = "\n".join(search_corpus_parts)

        matched = match_keywords(search_corpus)

        if not all_sessions and not matched:
            skipped_no_match += 1
            continue

        # Build the output filename
        date = extract_date(created_at)
        slug = slugify(name)
        filename = f"{date}_{slug}.md"

        if dry_run:
            print(f"[DRY] would write: {filename}  (matched: {', '.join(matched[:3])}{'...' if len(matched) > 3 else ''})")
        else:
            out_path = OUTPUT_DIR / filename
            # If filename collision, append a short uuid fragment
            if out_path.exists():
                filename = f"{date}_{slug}_{uuid[:8]}.md"
                out_path = OUTPUT_DIR / filename

            write_session_markdown(out_path, conv, matched)
            print(f"  wrote {filename}")

        harvested.append(HarvestedSession(
            uuid=uuid,
            name=name,
            summary=summary,
            created_at=created_at,
            updated_at=updated_at,
            message_count=len(messages),
            matched_keywords=matched,
            filename=filename,
        ))

    print()
    print(f"Harvested: {len(harvested)} sessions")
    print(f"Skipped (no keyword match): {skipped_no_match}")
    print(f"Skipped (empty): {skipped_empty}")

    return harvested


def write_session_markdown(out_path: Path, conv: dict[str, Any], matched: list[str]) -> None:
    """Write one session as a markdown document."""
    name = conv.get("name") or "(Untitled)"
    uuid = conv.get("uuid", "")
    summary = conv.get("summary") or ""
    created_at = conv.get("created_at", "")
    updated_at = conv.get("updated_at", "")
    messages = conv.get("chat_messages") or []

    lines: list[str] = []
    lines.append(f"# {name}")
    lines.append("")
    lines.append(f"**UUID:** `{uuid}`")
    lines.append(f"**Created:** {created_at}")
    lines.append(f"**Last updated:** {updated_at}")
    lines.append(f"**Message count:** {len(messages)}")
    if matched:
        lines.append(f"**Matched keywords:** {', '.join(matched)}")
    if summary:
        lines.append("")
        lines.append(f"**Summary (from export):** {summary}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Transcript")
    lines.append("")

    for m in messages:
        sender = m.get("sender") or m.get("role") or "unknown"
        ts = m.get("created_at") or m.get("updated_at") or ""
        text = extract_message_text(m)
        if not text:
            continue

        role_label = {"human": "Human", "assistant": "Assistant", "user": "Human"}.get(sender, sender.title())
        header = f"### {role_label}" + (f"  ·  {extract_date(ts)}" if ts else "")
        lines.append(header)
        lines.append("")
        lines.append(text)
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("")
    lines.append("*Harvested by SP-14 Transcript Harvester. Candidate for SP-15 Editorial Archaeologist distillation.*")

    out_path.write_text("\n".join(lines), encoding="utf-8")


# ─── INDEX ────────────────────────────────────────────────────────────────────

def write_index(harvested: list[HarvestedSession], dry_run: bool) -> None:
    """Write an _INDEX.md summary of all harvested sessions, sorted by date."""
    harvested_sorted = sorted(harvested, key=lambda s: s.created_at or "")

    lines: list[str] = []
    lines.append("# SESSION TRANSCRIPTS — Index")
    lines.append("")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Source:** Anthropic claude.ai data export")
    lines.append(f"**Harvester:** SP-14 Transcript Harvester")
    lines.append(f"**Total sessions archived:** {len(harvested_sorted)}")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Sessions by Date")
    lines.append("")
    lines.append("| Date | Session Name | Messages | Matched Keywords | File |")
    lines.append("|---|---|---|---|---|")

    for s in harvested_sorted:
        date = extract_date(s.created_at)
        name = s.name[:60] + ("..." if len(s.name) > 60 else "")
        # escape pipes
        name = name.replace("|", "\\|")
        matched = ", ".join(s.matched_keywords[:3])
        if len(s.matched_keywords) > 3:
            matched += f", +{len(s.matched_keywords) - 3}"
        matched = matched.replace("|", "\\|")
        lines.append(f"| {date} | {name} | {s.message_count} | {matched} | [{s.filename}]({s.filename}) |")

    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*Feed this index + the session files to SP-15 Editorial Archaeologist for distillation into canonical R9 preload content.*")

    if dry_run:
        print(f"\n[DRY] would write _INDEX.md with {len(harvested_sorted)} entries")
    else:
        idx_path = OUTPUT_DIR / "_INDEX.md"
        idx_path.write_text("\n".join(lines), encoding="utf-8")
        print(f"\nWrote index: {idx_path}")


# ─── STATE ────────────────────────────────────────────────────────────────────

def write_state(harvested: list[HarvestedSession], export_dir: Path) -> None:
    state = {
        "run_at": datetime.now().isoformat(),
        "export_dir": str(export_dir),
        "count": len(harvested),
        "sessions": [
            {
                "uuid": s.uuid,
                "name": s.name,
                "created_at": s.created_at,
                "message_count": s.message_count,
                "matched_keywords": s.matched_keywords,
                "filename": s.filename,
            }
            for s in harvested
        ],
    }
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")
    print(f"State: {STATE_FILE}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="SP-14 Transcript Harvester")
    ap.add_argument("--export-dir", type=str, required=True,
                    help="Path to the Anthropic data export directory (contains conversations.json)")
    ap.add_argument("--all", action="store_true",
                    help="Harvest every session, not just LB-matching ones")
    ap.add_argument("--dry-run", action="store_true",
                    help="Do not write files; just report what would happen")
    args = ap.parse_args()

    export_dir = Path(args.export_dir)
    if not export_dir.is_dir():
        sys.exit(f"ERROR: {export_dir} is not a directory")

    print("=" * 64)
    print("  SP-14 TRANSCRIPT HARVESTER")
    print(f"  Export dir: {export_dir}")
    print(f"  Output dir: {OUTPUT_DIR}")
    print(f"  Filter:     {'OFF (all sessions)' if args.all else 'ON (LB keywords)'}")
    print(f"  Mode:       {'DRY RUN' if args.dry_run else 'WRITE'}")
    print("=" * 64)

    harvested = harvest(export_dir, all_sessions=args.all, dry_run=args.dry_run)

    if harvested:
        write_index(harvested, dry_run=args.dry_run)
        if not args.dry_run:
            write_state(harvested, export_dir)

    print("\nDone.")


if __name__ == "__main__":
    main()
