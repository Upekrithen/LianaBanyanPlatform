"""
SP-15 EDITORIAL ARCHAEOLOGIST
=============================
Distill editorial reasoning out of SP-14's harvested session transcripts.

Input:  BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/*.md
Output: BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/EXTRACTED/*.extracted.md
        BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/EXTRACTED/_SYNTHESIS.md

For each transcript, Haiku 4.5 produces a structured extraction of:
  - Decisions made (editorial/design choices with rationale)
  - Rejected alternatives
  - Canonical phrases locked
  - Cross-letter / cross-document rules
  - Named frameworks or laws introduced
  - Corrections and fact changes
  - Founder voice notes

After all extractions, a programmatic synthesis pass categorizes findings
by letter / framework / drift so they can be merged into
CANONICAL_LAWS_AND_FRAMEWORKS.md.

Usage:
  python sp15_editorial_archaeologist.py              # process all transcripts
  python sp15_editorial_archaeologist.py --limit 3    # first 3 (for testing)
  python sp15_editorial_archaeologist.py --resume     # skip already-extracted
  python sp15_editorial_archaeologist.py --dry-run    # no API; show prompt for first
  python sp15_editorial_archaeologist.py --synthesis-only  # skip extraction; rebuild synthesis

Pre-registered in: BISHOP_DROPZONE/08_Papers/Academic/R9_EMPIRICAL_TEST_PREREGISTRATION_B108.md
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

import anthropic

# Force UTF-8 stdout
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # LianaBanyanPlatform/
TRANSCRIPTS_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS"
EXTRACTED_DIR = TRANSCRIPTS_DIR / "EXTRACTED"
STATE_FILE = SCRIPT_DIR / "sp15_state.json"

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 2000
PRICE_INPUT_PER_M = 0.80
PRICE_OUTPUT_PER_M = 4.00

# Max transcript size to send (tokens ≈ chars/4). Haiku context is 200k; leave headroom.
MAX_TRANSCRIPT_CHARS = 600_000  # ~150k tokens

# ─── CREDENTIALS ──────────────────────────────────────────────────────────────

def load_api_key() -> str:
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    sds_path = PROJECT_ROOT / "Asteroid-ProofVault" / "LockBox" / "SDS.env"
    if sds_path.exists():
        for line in sds_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("ERROR: ANTHROPIC_API_KEY not found in environment or LockBox/SDS.env")


# ─── EXTRACTION PROMPT ────────────────────────────────────────────────────────

EXTRACTION_SYSTEM = """You are SP-15 Editorial Archaeologist, a Liana Banyan agent.

Your job: read a claude.ai session transcript and extract the EDITORIAL REASONING that a future session would need to avoid re-litigating the same decisions. You are not summarizing content. You are extracting DECISIONS, REJECTED ALTERNATIVES, LOCKED PHRASES, and RULES.

The goal is to produce a reference artifact so that when a future Bishop session picks up work on the same letter, framework, or topic, it knows what was already decided and why — and does not silently undo choices by writing a "cleaner" version.

Be concise. One line per bullet. Compress to essence. Skip pleasantries and process talk. Keep only load-bearing reasoning.

If a section has no content, write "— none —" and move on. Do not invent.

Output in exactly the format requested — nothing before the first heading, nothing after the last."""

EXTRACTION_USER_TEMPLATE = """Extract the editorial reasoning from the session transcript below. Return EXACTLY this structure:

## SESSION METADATA
- Date:
- Primary topic:
- Crown Letter or project focus (if any):

## DECISIONS MADE
[one bullet per named editorial/design/structural decision, in the form: DECISION → RATIONALE]

## REJECTED ALTERNATIVES
[one bullet per option considered and rejected, with one-line reason]

## CANONICAL PHRASES LOCKED
[one bullet per specific word/phrase decision — what wording was chosen and MUST remain]

## CROSS-LETTER / CROSS-DOCUMENT RULES
[one bullet per rule about what content belongs where, what must NOT repeat, cross-ownership]

## NAMED FRAMEWORKS OR LAWS INTRODUCED
[one bullet per new named concept, framework, principle, or mechanism named in this session]

## CORRECTIONS / FACT CHANGES
[one bullet per place where a fact, number, term, or canonical value was updated]

## FOUNDER VOICE NOTES
[one bullet per observation about voice, style, register, or phrasing preference]

--- TRANSCRIPT BELOW ---

{transcript}

--- END TRANSCRIPT ---

Extract now. Use "— none —" for empty sections. No preamble, no postscript."""


# ─── DATA ─────────────────────────────────────────────────────────────────────

@dataclass
class ExtractionResult:
    transcript_path: str
    extracted_path: str
    input_tokens: int
    output_tokens: int
    seconds: float
    cost_usd: float
    error: str = ""


# ─── CORE ─────────────────────────────────────────────────────────────────────

def list_transcripts() -> list[Path]:
    """All .md files in TRANSCRIPTS_DIR except the index."""
    if not TRANSCRIPTS_DIR.exists():
        sys.exit(f"ERROR: {TRANSCRIPTS_DIR} not found — run SP-14 first.")
    files = sorted(
        p for p in TRANSCRIPTS_DIR.glob("*.md")
        if p.name != "_INDEX.md" and not p.name.startswith("_")
    )
    return files


def extracted_path_for(transcript_path: Path) -> Path:
    return EXTRACTED_DIR / (transcript_path.stem + ".extracted.md")


def extract_one(
    client: anthropic.Anthropic,
    transcript_path: Path,
    *,
    dry_run: bool = False,
) -> ExtractionResult:
    transcript_text = transcript_path.read_text(encoding="utf-8")

    # Trim if oversized
    if len(transcript_text) > MAX_TRANSCRIPT_CHARS:
        transcript_text = transcript_text[: MAX_TRANSCRIPT_CHARS] + "\n\n[...transcript truncated for size...]"

    user_msg = EXTRACTION_USER_TEMPLATE.format(transcript=transcript_text)
    out_path = extracted_path_for(transcript_path)

    if dry_run:
        print(f"[DRY] would extract: {transcript_path.name}")
        print(f"[DRY] transcript size: {len(transcript_text):,} chars (~{len(transcript_text)//4:,} tokens)")
        print(f"[DRY] output would go to: {out_path.name}")
        return ExtractionResult(
            transcript_path=str(transcript_path),
            extracted_path=str(out_path),
            input_tokens=0, output_tokens=0, seconds=0.0, cost_usd=0.0,
        )

    t0 = time.time()
    resp = None
    last_err = None
    for attempt in range(3):
        try:
            resp = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=EXTRACTION_SYSTEM,
                messages=[{"role": "user", "content": user_msg}],
            )
            break
        except anthropic.RateLimitError as e:
            last_err = e
            wait = 65 if attempt == 0 else 90
            print(f" [429 rate limit; sleeping {wait}s then retrying]", end="", flush=True)
            time.sleep(wait)
        except Exception as e:
            return ExtractionResult(
                transcript_path=str(transcript_path),
                extracted_path=str(out_path),
                input_tokens=0, output_tokens=0, seconds=round(time.time() - t0, 2),
                cost_usd=0.0, error=f"{type(e).__name__}: {e}",
            )

    if resp is None:
        return ExtractionResult(
            transcript_path=str(transcript_path),
            extracted_path=str(out_path),
            input_tokens=0, output_tokens=0, seconds=round(time.time() - t0, 2),
            cost_usd=0.0,
            error=f"RateLimitError after 3 attempts: {last_err}",
        )

    extracted_text = ""
    for block in resp.content:
        if block.type == "text":
            extracted_text += block.text

    usage = resp.usage
    cost = (usage.input_tokens / 1_000_000) * PRICE_INPUT_PER_M + (usage.output_tokens / 1_000_000) * PRICE_OUTPUT_PER_M

    # Write extraction with header pointing back to the source
    header = [
        f"# Editorial Extraction — {transcript_path.stem}",
        f"**Source transcript:** [{transcript_path.name}](../{transcript_path.name})",
        f"**Extracted:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Model:** {MODEL}",
        f"**Tokens:** {usage.input_tokens:,} in / {usage.output_tokens:,} out",
        f"**Cost:** ${cost:.5f}",
        "",
        "---",
        "",
    ]
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(header) + extracted_text.strip() + "\n", encoding="utf-8")

    return ExtractionResult(
        transcript_path=str(transcript_path),
        extracted_path=str(out_path),
        input_tokens=usage.input_tokens,
        output_tokens=usage.output_tokens,
        seconds=round(time.time() - t0, 2),
        cost_usd=cost,
    )


# ─── SYNTHESIS ────────────────────────────────────────────────────────────────

LETTER_KEYWORDS = {
    "Scott / Cardboard Boots": ["scott", "cardboard boots", "board chair"],
    "Newmark / Infrastructure Chancellor": ["newmark", "craigslist", "infrastructure chancellor"],
    "Seibel / CEO": ["seibel", "y combinator", "ycombinator"],
    "Tom Simon / CFO": ["tom simon", "fbi forensic"],
    "Sal Khan / Education": ["sal khan", "khan academy", "khanmigo"],
    "José Andrés / Food Security": ["jose andres", "josé andrés", "world central kitchen"],
    "Buffett / Berkshire": ["buffett", "warren buffett"],
    "Trebor Scholz / PCC": ["trebor scholz", "platform cooperativism", "platform coop"],
}

FRAMEWORK_KEYWORDS = [
    "three-gear", "three gear", "tab system", "position funding",
    "medallion", "cardboard boots", "boaz", "hexisle",
    "ratchet", "pledge", "ripple", "open water", "lighthouse",
    "joule", "credit", "mark",
    "c+20", "cost+20", "cost plus 20", "cost of doing good",
    "heoho", "interdependence",
    "romulator", "r9", "touchstone", "scrambler",
]


def synthesize() -> None:
    """Read every .extracted.md, categorize findings by letter/framework/drift,
    write the _SYNTHESIS.md that indexes everything."""
    extracted_files = sorted(EXTRACTED_DIR.glob("*.extracted.md"))
    if not extracted_files:
        print("No extracted files found — nothing to synthesize.")
        return

    print(f"\nSynthesizing {len(extracted_files)} extractions...")

    # Bucket by letter
    by_letter: dict[str, list[tuple[Path, str]]] = {k: [] for k in LETTER_KEYWORDS}
    other: list[tuple[Path, str]] = []

    for f in extracted_files:
        text = f.read_text(encoding="utf-8").lower()
        matched_any = False
        for letter, kws in LETTER_KEYWORDS.items():
            if any(k in text for k in kws):
                by_letter[letter].append((f, text))
                matched_any = True
        if not matched_any:
            other.append((f, text))

    # Collect framework mentions across all files
    framework_hits: dict[str, list[str]] = {k: [] for k in FRAMEWORK_KEYWORDS}
    for f in extracted_files:
        text = f.read_text(encoding="utf-8").lower()
        for kw in FRAMEWORK_KEYWORDS:
            if kw in text:
                framework_hits[kw].append(f.stem)

    lines: list[str] = []
    lines.append("# Editorial Reasoning — Synthesis Index")
    lines.append("")
    lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"**Source:** SP-15 extractions over SP-14 harvested transcripts")
    lines.append(f"**Total extractions indexed:** {len(extracted_files)}")
    lines.append("")
    lines.append("This document indexes editorial decisions, rejected alternatives,")
    lines.append("canonical phrases, cross-letter rules, named frameworks, fact")
    lines.append("corrections, and voice notes — grouped by Crown Letter and by framework.")
    lines.append("The underlying per-session extractions are in the same folder as")
    lines.append("`*.extracted.md` files.")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("## Crown Letter Coverage")
    lines.append("")
    lines.append("| Letter / Figure | Sessions with extraction |")
    lines.append("|---|---|")
    for letter, hits in by_letter.items():
        lines.append(f"| {letter} | {len(hits)} |")
    lines.append(f"| Other / Unmatched | {len(other)} |")
    lines.append("")

    # Per-letter detail
    for letter, hits in by_letter.items():
        if not hits:
            continue
        lines.append(f"## {letter}")
        lines.append("")
        for f, _ in hits:
            rel = f.name
            lines.append(f"- [{rel}]({rel})")
        lines.append("")

    if other:
        lines.append("## Other / Unmatched Sessions")
        lines.append("")
        for f, _ in other:
            lines.append(f"- [{f.name}]({f.name})")
        lines.append("")

    # Framework index
    lines.append("---")
    lines.append("")
    lines.append("## Framework / Concept Index")
    lines.append("")
    lines.append("| Concept | Session extractions mentioning |")
    lines.append("|---|---|")
    for kw in FRAMEWORK_KEYWORDS:
        hits = framework_hits.get(kw, [])
        if hits:
            count = len(hits)
            first_two = ", ".join(hits[:2]) + ("..." if count > 2 else "")
            lines.append(f"| `{kw}` | {count} — {first_two} |")
    lines.append("")
    lines.append("---")
    lines.append("")
    lines.append("*Next step: curate high-value extractions into CANONICAL_LAWS_AND_FRAMEWORKS.md Section X (Crown Letter Context) and per-letter reasoning files. Curation is a human-in-the-loop pass; the extractions here are the raw material.*")
    lines.append("")

    out_path = EXTRACTED_DIR / "_SYNTHESIS.md"
    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Synthesis: {out_path}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(description="SP-15 Editorial Archaeologist")
    ap.add_argument("--limit", type=int, default=0, help="Process first N transcripts only")
    ap.add_argument("--resume", action="store_true", help="Skip transcripts with existing extractions")
    ap.add_argument("--dry-run", action="store_true", help="No API calls; show plan")
    ap.add_argument("--synthesis-only", action="store_true", help="Skip extraction; only rebuild _SYNTHESIS.md")
    args = ap.parse_args()

    if args.synthesis_only:
        synthesize()
        return

    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)

    transcripts = list_transcripts()
    if args.resume:
        transcripts = [t for t in transcripts if not extracted_path_for(t).exists()]
    if args.limit:
        transcripts = transcripts[: args.limit]

    print("=" * 64)
    print("  SP-15 EDITORIAL ARCHAEOLOGIST")
    print(f"  Transcripts dir: {TRANSCRIPTS_DIR}")
    print(f"  Extracted dir:   {EXTRACTED_DIR}")
    print(f"  Mode:            {'DRY RUN' if args.dry_run else 'EXTRACT'}")
    print(f"  Resume:          {args.resume}")
    print(f"  Count to process: {len(transcripts)}")
    print("=" * 64)
    print()

    if args.dry_run and transcripts:
        extract_one(None, transcripts[0], dry_run=True)
        return

    client = anthropic.Anthropic(api_key=load_api_key())

    results: list[ExtractionResult] = []
    t_start = time.time()

    for i, t_path in enumerate(transcripts, start=1):
        print(f"[{i}/{len(transcripts)}] {t_path.name}", end="  ", flush=True)
        r = extract_one(client, t_path)
        if r.error:
            print(f"ERROR: {r.error}")
        else:
            print(f"{r.input_tokens:>6} in / {r.output_tokens:>4} out / {r.seconds:5.1f}s / ${r.cost_usd:.5f}")
        results.append(r)

    total_in = sum(r.input_tokens for r in results)
    total_out = sum(r.output_tokens for r in results)
    total_cost = sum(r.cost_usd for r in results)
    errors = [r for r in results if r.error]

    print()
    print("=" * 64)
    print(f"  Extracted:  {len(results) - len(errors)} / {len(results)}")
    print(f"  Errors:     {len(errors)}")
    print(f"  Tokens:     {total_in:,} in / {total_out:,} out")
    print(f"  Cost:       ${total_cost:.4f}")
    print(f"  Wall time:  {time.time() - t_start:.1f}s")
    print("=" * 64)

    # Save state
    state = {
        "run_at": datetime.now().isoformat(),
        "count_processed": len(results),
        "count_errors": len(errors),
        "total_input_tokens": total_in,
        "total_output_tokens": total_out,
        "total_cost_usd": round(total_cost, 5),
        "results": [asdict(r) for r in results],
    }
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")
    print(f"State: {STATE_FILE}")

    # Run synthesis
    synthesize()

    print("\nDone.")


if __name__ == "__main__":
    main()
