"""
STITCHPUNK_GO — on-demand launcher (B109)
==========================================
One-stop Python entry point for the Stitchpunk pipelines. Wraps auto_ingest_pipeline
and sp16_recombiner so the Founder can fire them from a terminal, a batch file, or
a desktop shortcut with a single command.

Subcommands:
  ingest                               run auto_ingest_pipeline.py
  recombine [--model NAME]             run sp16_recombiner.py with chosen model
  both [--model NAME]                  ingest first (fresh corpus), then recombine
  status                               show last ingest log entry + latest recombiner file

Model flag defaults to Opus (matches sp16_recombiner default / Founder ratification).
Valid models: claude-haiku-4-5-20251001, claude-sonnet-4-6, claude-opus-4-7.

Examples:
  python stitchpunk_go.py ingest
  python stitchpunk_go.py recombine
  python stitchpunk_go.py recombine --model claude-sonnet-4-6
  python stitchpunk_go.py both --model claude-haiku-4-5-20251001
  python stitchpunk_go.py status
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

AUTO_INGEST = SCRIPT_DIR / "auto_ingest_pipeline.py"
SP16 = SCRIPT_DIR / "sp16_recombiner.py"
INGEST_LOG = PROJECT_ROOT / "BISHOP_DROPZONE" / "03_BishopHandoffs" / "_AUTO_INGEST_LOG.md"
RECOMBINER_INBOX = PROJECT_ROOT / "BISHOP_DROPZONE" / "15_RECOMBINER_INBOX"

VALID_MODELS = [
    "claude-haiku-4-5-20251001",
    "claude-sonnet-4-6",
    "claude-opus-4-7",
]
DEFAULT_MODEL = "claude-opus-4-7"


def run(script: Path, *extra_args: str) -> int:
    cmd = [sys.executable, str(script), *extra_args]
    print(f"→ {' '.join(cmd)}\n")
    return subprocess.call(cmd)


def cmd_ingest(_args) -> int:
    return run(AUTO_INGEST)


def cmd_recombine(args) -> int:
    return run(SP16, "--model", args.model)


def cmd_both(args) -> int:
    rc = run(AUTO_INGEST)
    if rc != 0:
        print(f"\n[ingest failed rc={rc}; skipping recombine]")
        return rc
    return run(SP16, "--model", args.model)


def cmd_status(_args) -> int:
    print("=" * 64)
    print(f"  STITCHPUNK STATUS  ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    print("=" * 64)

    # Last auto-ingest entry
    if INGEST_LOG.exists():
        text = INGEST_LOG.read_text(encoding="utf-8")
        # Find the last "## " entry
        entries = text.split("\n## ")
        if len(entries) > 1:
            print("\n### Last auto-ingest entry\n")
            print("## " + entries[-1].strip())
        else:
            print("\n(auto_ingest log exists but no entries yet)")
    else:
        print("\n(no auto_ingest log yet — nothing has run)")

    # Latest recombiner file
    if RECOMBINER_INBOX.exists():
        files = sorted(
            RECOMBINER_INBOX.glob("recombiner_*.md"),
            key=lambda p: p.stat().st_mtime,
            reverse=True,
        )
        if files:
            latest = files[0]
            mtime = datetime.fromtimestamp(latest.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")
            size = latest.stat().st_size
            print(f"\n### Latest recombiner file\n")
            print(f"  {latest.name}")
            print(f"  Modified: {mtime}")
            print(f"  Size:     {size:,} bytes")
            print(f"  Path:     {latest}")
            print(f"\n(Open the file directly to read the 5 sections.)")
        else:
            print("\n(no recombiner files yet — fire `recombine` to generate one)")
    else:
        print("\n(recombiner inbox not yet created)")

    return 0


def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="stitchpunk_go",
                                 description="On-demand launcher for Stitchpunk pipelines")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("ingest", help="Run auto-ingestion pipeline (SP-14 + SP-15 v2 + concat)")

    p_rec = sub.add_parser("recombine", help="Run SP-16 Creative Recombiner")
    p_rec.add_argument("--model", default=DEFAULT_MODEL, choices=VALID_MODELS)

    p_both = sub.add_parser("both", help="Ingest first, then recombine")
    p_both.add_argument("--model", default=DEFAULT_MODEL, choices=VALID_MODELS)

    sub.add_parser("status", help="Show last ingest log entry + latest recombiner file")

    return ap


def main() -> int:
    args = build_parser().parse_args()
    dispatch = {
        "ingest": cmd_ingest,
        "recombine": cmd_recombine,
        "both": cmd_both,
        "status": cmd_status,
    }
    return dispatch[args.cmd](args)


if __name__ == "__main__":
    sys.exit(main())
