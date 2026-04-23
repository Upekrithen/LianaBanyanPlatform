"""
AUTO-INGESTION PIPELINE (B109)
==============================
Chains SP-14 (harvest) → SP-15 v2 (extract) → sp15v2_bulk_concat (archive)
into a single idempotent run. Designed to be called on a schedule or on demand.

What it does (in order):
  1. Scan SESSION_TRANSCRIPTS/_INBOX/ for new claude.ai export zips.
     For each: extract + run SP-14 to emit per-session .md files,
     then move the zip to _INBOX/_archive/.
  2. Scan SESSION_TRANSCRIPTS/*.md for transcripts lacking a v2 extraction.
     If any: run SP-15 v2 --resume (idempotent).
  3. If any new v2 extractions landed, re-run sp15v2_bulk_concat
     to refresh SESSION_REASONING_ARCHIVE_<version>.md.
  4. Write a status entry to BISHOP_DROPZONE/03_BishopHandoffs/_AUTO_INGEST_LOG.md
     so the next Bishop session sees what happened.

Usage:
  python auto_ingest_pipeline.py              # full run
  python auto_ingest_pipeline.py --dry-run    # detect what would happen; no work
  python auto_ingest_pipeline.py --skip-sp14  # only run extract+concat (no zip harvest)

Exit codes:
  0 = success (may include "nothing to do")
  1 = SP-14 failed
  2 = SP-15 v2 failed
  3 = bulk_concat failed
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
TRANSCRIPTS_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS"
EXTRACTED_DIR = TRANSCRIPTS_DIR / "EXTRACTED_V2"
INBOX_DIR = TRANSCRIPTS_DIR / "_INBOX"
INBOX_ARCHIVE_DIR = INBOX_DIR / "_archive"
LOG_FILE = PROJECT_ROOT / "BISHOP_DROPZONE" / "03_BishopHandoffs" / "_AUTO_INGEST_LOG.md"

SP14 = SCRIPT_DIR / "sp14_transcript_harvester.py"
SP15V2 = SCRIPT_DIR / "sp15v2_editorial_archaeologist.py"
CONCAT = SCRIPT_DIR / "sp15v2_bulk_concat.py"


def log(msg: str) -> None:
    print(msg, flush=True)


def append_log_entry(lines: list[str]) -> None:
    """Append a dated entry to _AUTO_INGEST_LOG.md (markdown-formatted)."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    header = [
        f"\n## {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
    ]
    if not LOG_FILE.exists():
        LOG_FILE.write_text("# Auto-Ingest Log\n\nRun-by-run log of pipeline activity.\n", encoding="utf-8")
    with LOG_FILE.open("a", encoding="utf-8") as f:
        f.write("\n".join(header + lines) + "\n")


def find_new_zips() -> list[Path]:
    if not INBOX_DIR.exists():
        return []
    return sorted(p for p in INBOX_DIR.glob("*.zip"))


def find_unextracted_transcripts() -> list[Path]:
    if not TRANSCRIPTS_DIR.exists():
        return []
    transcripts = [p for p in TRANSCRIPTS_DIR.glob("*.md") if not p.name.startswith("_")]
    unextracted = []
    for t in transcripts:
        if not (EXTRACTED_DIR / (t.stem + ".extracted.md")).exists():
            unextracted.append(t)
    return unextracted


def run_sp14(zip_path: Path, dry_run: bool) -> tuple[bool, str]:
    """Extract claude.ai export zip and run SP-14 harvest on it."""
    import tempfile
    import zipfile

    log(f"  [SP-14] Processing {zip_path.name}")
    if dry_run:
        return True, f"would extract {zip_path.name} and run SP-14"

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        try:
            with zipfile.ZipFile(zip_path) as zf:
                zf.extractall(tmp_path)
        except zipfile.BadZipFile as e:
            return False, f"bad zip: {e}"

        # SP-14 expects --export-dir pointing at a directory with conversations.json
        export_dir = tmp_path
        if not (export_dir / "conversations.json").exists():
            # some exports nest it one level down
            inner = list(tmp_path.iterdir())
            if len(inner) == 1 and inner[0].is_dir() and (inner[0] / "conversations.json").exists():
                export_dir = inner[0]
            else:
                return False, "conversations.json not found in export"

        result = subprocess.run(
            [sys.executable, str(SP14), "--export-dir", str(export_dir)],
            capture_output=True, text=True,
        )
        if result.returncode != 0:
            return False, f"SP-14 failed (rc={result.returncode}): {result.stderr[:500]}"

    # Move zip to archive
    INBOX_ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    stamped_name = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{zip_path.name}"
    shutil.move(str(zip_path), str(INBOX_ARCHIVE_DIR / stamped_name))
    return True, f"harvested; archived zip to _archive/{stamped_name}"


def run_sp15v2(dry_run: bool) -> tuple[bool, str]:
    log("  [SP-15 v2] Running --resume on unextracted transcripts")
    if dry_run:
        return True, "would run sp15v2 --resume"
    result = subprocess.run(
        [sys.executable, str(SP15V2), "--resume"],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return False, f"SP-15 v2 failed (rc={result.returncode}): {result.stderr[:500]}"
    return True, result.stdout.strip().splitlines()[-3:] if result.stdout else "ok"


def run_bulk_concat(dry_run: bool) -> tuple[bool, str]:
    log("  [bulk_concat] Regenerating SESSION_REASONING_ARCHIVE")
    if dry_run:
        return True, "would run bulk_concat"
    result = subprocess.run(
        [sys.executable, str(CONCAT)],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        return False, f"bulk_concat failed (rc={result.returncode}): {result.stderr[:500]}"
    return True, result.stdout.strip().splitlines()[-6:] if result.stdout else "ok"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true", help="Detect-only; no work performed")
    ap.add_argument("--skip-sp14", action="store_true", help="Skip zip harvest; only run extract+concat")
    args = ap.parse_args()

    log("=" * 64)
    log(f"  AUTO-INGEST PIPELINE  ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    log("=" * 64)

    entry: list[str] = []
    INBOX_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1 — SP-14 harvest new zips
    new_zips: list[Path] = [] if args.skip_sp14 else find_new_zips()
    if new_zips:
        log(f"Found {len(new_zips)} new export zip(s) in _INBOX/")
        entry.append(f"- **SP-14:** harvested {len(new_zips)} zip(s)")
        for z in new_zips:
            ok, msg = run_sp14(z, args.dry_run)
            if not ok:
                log(f"  ERROR on {z.name}: {msg}")
                entry.append(f"  - ERROR {z.name}: {msg}")
                append_log_entry(entry)
                return 1
            entry.append(f"  - {z.name}: {msg}")
    else:
        log("No new export zips in _INBOX/ (skipping SP-14)")
        entry.append("- **SP-14:** no new zips in _INBOX/")

    # Step 2 — SP-15 v2 extract new transcripts
    unextracted = find_unextracted_transcripts()
    if unextracted:
        log(f"Found {len(unextracted)} transcript(s) needing v2 extraction")
        entry.append(f"- **SP-15 v2:** extracted {len(unextracted)} new transcript(s)")
        ok, msg = run_sp15v2(args.dry_run)
        if not ok:
            log(f"  ERROR: {msg}")
            entry.append(f"  - ERROR: {msg}")
            append_log_entry(entry)
            return 2

        # Step 3 — bulk_concat (only if we actually extracted something new)
        ok, msg = run_bulk_concat(args.dry_run)
        if not ok:
            log(f"  ERROR: {msg}")
            entry.append(f"  - bulk_concat ERROR: {msg}")
            append_log_entry(entry)
            return 3
        entry.append(f"  - bulk_concat: archive regenerated")
    else:
        log("No unextracted transcripts — archive is current")
        entry.append("- **SP-15 v2 / bulk_concat:** nothing to do (archive current)")

    append_log_entry(entry)
    log("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
