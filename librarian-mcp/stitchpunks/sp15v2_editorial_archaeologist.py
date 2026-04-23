"""
SP-15 v2 EDITORIAL ARCHAEOLOGIST — TIGHTER PRESERVATION
========================================================
Addresses the Q59 fidelity miss from the April 18 post-intervention benchmark:
labeled iterations (Version A/B/C, V1–V6) and verbatim-locked phrasings were
being collapsed into narrative prose. v2 requires explicit preservation.

Changes from v1:
  - New section: LABELED ITERATIONS — extract A/B/C, V1–Vn variants with full verbatim text
  - New section: EXACT QUOTES — verbatim-preserved phrasings the Founder has locked
  - max_tokens raised from 2000 → 3000
  - Cross-letter rules must tag the owning letter by name
  - Output written to EXTRACTED_V2/ so v1 and v2 can be compared

Input:  BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/*.md
Output: BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/EXTRACTED_V2/*.extracted.md
        BISHOP_DROPZONE/04_Compiled/SESSION_TRANSCRIPTS/EXTRACTED_V2/_SYNTHESIS.md

Usage:
  python sp15v2_editorial_archaeologist.py              # process all
  python sp15v2_editorial_archaeologist.py --limit 3    # pilot
  python sp15v2_editorial_archaeologist.py --resume     # skip already-v2-extracted
  python sp15v2_editorial_archaeologist.py --dry-run    # show plan only
  python sp15v2_editorial_archaeologist.py --synthesis-only

Pre-registered (for v2 companion paper):
  - Re-run over all 54 transcripts: expected one-time cost $1.20–$1.80
  - Expected Q59-class accuracy lift: from 0 to ≥1 (out of 1 total such Q currently)
  - If broader Set-B re-benchmarked against v2 preload: expect parity or slight gain
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path

import anthropic

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
TRANSCRIPTS_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "04_Compiled" / "SESSION_TRANSCRIPTS"
EXTRACTED_DIR = TRANSCRIPTS_DIR / "EXTRACTED_V2"
STATE_FILE = SCRIPT_DIR / "sp15v2_state.json"

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 4000  # bumped from 2000 → 3000 → 4000 (B109: two B108 extractions hit 3000 cap)
PRICE_INPUT_PER_M = 0.80
PRICE_OUTPUT_PER_M = 4.00

MAX_TRANSCRIPT_CHARS = 600_000

# ─── CREDENTIALS ──────────────────────────────────────────────────────────────

def load_api_key() -> str:
    import os
    key = os.environ.get("ANTHROPIC_API_KEY")
    if key:
        return key
    sds_path = PROJECT_ROOT / "Asteroid-ProofVault" / "LockBox" / "SDS.env"
    if sds_path.exists():
        for line in sds_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("ANTHROPIC_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("ERROR: ANTHROPIC_API_KEY not found")


# ─── EXTRACTION PROMPT — v2 ───────────────────────────────────────────────────

EXTRACTION_SYSTEM_V2 = """You are SP-15 v2 Editorial Archaeologist, a Liana Banyan agent.

Your job: read a claude.ai session transcript and extract the EDITORIAL REASONING so a future session can avoid re-litigating decisions. You extract DECISIONS, REJECTED ALTERNATIVES, LOCKED PHRASES, RULES, LABELED ITERATIONS, and EXACT QUOTES.

CRITICAL UPGRADES FROM v1:
  - When the transcript contains LABELED VARIANTS (Version A/B/C, V1/V2/V3/.../V9, Option 1/2/3, Draft 1/2/3, or any similar alphanumeric labeling of alternative wordings), you MUST preserve every label and its full verbatim text. Do NOT paraphrase labeled variants. Do NOT collapse them into narrative summary.
  - When the Founder has explicitly declared a phrase "locked," "canonical," "must remain," or similar, you MUST quote the exact phrase verbatim, not a paraphrase.
  - Cross-letter rules MUST be tagged by the owning letter's recipient name (e.g., "Scott letter owns the bus-driver chain reaction"; "Newmark letter owns the acquisition-ethic paragraph").

Be concise elsewhere. One line per bullet. Skip pleasantries. Keep only load-bearing reasoning.

If a section has no content, write "— none —". Do not invent.

Output in exactly the format requested — nothing before the first heading, nothing after the last."""

EXTRACTION_USER_V2 = """Extract the editorial reasoning from the session transcript below. Return EXACTLY this structure:

## SESSION METADATA
- Date:
- Primary topic:
- Crown Letter or project focus (if any):

## DECISIONS MADE
[one bullet per named editorial/design/structural decision, in the form: DECISION → RATIONALE]

## REJECTED ALTERNATIVES
[one bullet per option considered and rejected, with one-line reason]

## CANONICAL PHRASES LOCKED
[one bullet per specific word/phrase decision — what wording was chosen and MUST remain. Include verbatim quotes.]

## LABELED ITERATIONS
[IF the transcript contains labeled variants (Version A/B/C, V1-V6, Option 1/2/3, Draft N, etc.), reproduce each label with its FULL VERBATIM TEXT. No paraphrase. Include the final selection if identified.]
[Format:
  - LABEL: "Verbatim text of that variant."
  - LABEL: "Verbatim text."
  - SELECTED: LABEL  (if a selection was made)
]

## EXACT QUOTES (verbatim-locked phrasings)
[Exact quotes the Founder explicitly locked. One per bullet. Preserve quotation marks.]

## CROSS-LETTER / CROSS-DOCUMENT RULES
[one bullet per rule about what content belongs where. PREFIX each rule with the owning letter's name or "ALL LETTERS:". Examples: "SCOTT LETTER OWNS: bus-driver chain reaction; NEWMARK MUST NOT REUSE." or "ALL LETTERS: avoid cross-redundancy because recipients see all letters on Cephas."]

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


def list_transcripts() -> list[Path]:
    if not TRANSCRIPTS_DIR.exists():
        sys.exit(f"ERROR: {TRANSCRIPTS_DIR} not found")
    return sorted(
        p for p in TRANSCRIPTS_DIR.glob("*.md")
        if p.name != "_INDEX.md" and not p.name.startswith("_")
    )


def extracted_path_for(transcript_path: Path) -> Path:
    return EXTRACTED_DIR / (transcript_path.stem + ".extracted.md")


def extract_one(client, transcript_path: Path, *, dry_run: bool = False) -> ExtractionResult:
    transcript_text = transcript_path.read_text(encoding="utf-8")
    if len(transcript_text) > MAX_TRANSCRIPT_CHARS:
        transcript_text = transcript_text[:MAX_TRANSCRIPT_CHARS] + "\n\n[...truncated...]"

    user_msg = EXTRACTION_USER_V2.format(transcript=transcript_text)
    out_path = extracted_path_for(transcript_path)

    if dry_run:
        print(f"[DRY] would extract v2: {transcript_path.name}")
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
                system=EXTRACTION_SYSTEM_V2,
                messages=[{"role": "user", "content": user_msg}],
            )
            break
        except anthropic.RateLimitError as e:
            last_err = e
            wait = 65 if attempt == 0 else 90
            print(f" [429; sleep {wait}s]", end="", flush=True)
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

    text = "".join(b.text for b in resp.content if b.type == "text")
    usage = resp.usage
    cost = (usage.input_tokens / 1_000_000) * PRICE_INPUT_PER_M + (usage.output_tokens / 1_000_000) * PRICE_OUTPUT_PER_M

    header = [
        f"# Editorial Extraction v2 — {transcript_path.stem}",
        f"**Source:** [{transcript_path.name}](../{transcript_path.name})",
        f"**Extracted:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Model:** {MODEL} · **Version:** SP-15 v2 (tighter preservation)",
        f"**Tokens:** {usage.input_tokens:,} in / {usage.output_tokens:,} out · **Cost:** ${cost:.5f}",
        "",
        "---",
        "",
    ]
    EXTRACTED_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(header) + text.strip() + "\n", encoding="utf-8")

    return ExtractionResult(
        transcript_path=str(transcript_path),
        extracted_path=str(out_path),
        input_tokens=usage.input_tokens,
        output_tokens=usage.output_tokens,
        seconds=round(time.time() - t0, 2),
        cost_usd=cost,
    )


# ─── SYNTHESIS (reuses v1 logic) ──────────────────────────────────────────────

LETTER_KEYWORDS = {
    "Scott / Cardboard Boots": ["scott", "cardboard boots", "board chair"],
    "Newmark / Infrastructure Chancellor": ["newmark", "craigslist", "infrastructure chancellor"],
    "Seibel / CEO": ["seibel", "y combinator", "ycombinator"],
    "Tom Simon / CFO": ["tom simon", "fbi forensic"],
    "Sal Khan / Education": ["sal khan", "khan academy"],
    "José Andrés / Food Security": ["jose andres", "josé andrés", "world central kitchen"],
    "Buffett / Berkshire": ["buffett", "warren buffett"],
    "Trebor Scholz / PCC": ["trebor scholz", "platform cooperativism", "platform coop"],
}


def synthesize() -> None:
    files = sorted(EXTRACTED_DIR.glob("*.extracted.md"))
    if not files:
        print("No v2 extractions found — nothing to synthesize.")
        return

    print(f"\nSynthesizing {len(files)} v2 extractions...")
    by_letter: dict[str, list[Path]] = {k: [] for k in LETTER_KEYWORDS}
    other: list[Path] = []

    for f in files:
        text = f.read_text(encoding="utf-8").lower()
        matched = False
        for letter, kws in LETTER_KEYWORDS.items():
            if any(k in text for k in kws):
                by_letter[letter].append(f)
                matched = True
        if not matched:
            other.append(f)

    lines = [
        "# Editorial Reasoning v2 — Synthesis Index",
        "",
        f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Source:** SP-15 v2 extractions (tighter preservation)",
        f"**Total:** {len(files)}",
        "",
        "**v2 improvements:** labeled iterations (A/B/C, V1-Vn) preserved verbatim; exact-quote section added; cross-letter rules tagged by owner.",
        "",
        "---",
        "",
        "## Crown Letter Coverage",
        "",
        "| Letter / Figure | Sessions |",
        "|---|---|",
    ]
    for letter, hits in by_letter.items():
        lines.append(f"| {letter} | {len(hits)} |")
    lines.append(f"| Other / Unmatched | {len(other)} |")
    lines.append("")

    for letter, hits in by_letter.items():
        if not hits:
            continue
        lines.append(f"## {letter}")
        lines.append("")
        for f in hits:
            lines.append(f"- [{f.name}]({f.name})")
        lines.append("")

    if other:
        lines.append("## Other / Unmatched")
        lines.append("")
        for f in other:
            lines.append(f"- [{f.name}]({f.name})")
        lines.append("")

    (EXTRACTED_DIR / "_SYNTHESIS.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Synthesis: {EXTRACTED_DIR / '_SYNTHESIS.md'}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--synthesis-only", action="store_true")
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
    print("  SP-15 v2 EDITORIAL ARCHAEOLOGIST (tighter preservation)")
    print(f"  Count: {len(transcripts)}")
    print(f"  Mode: {'DRY' if args.dry_run else 'EXTRACT'}  Resume: {args.resume}")
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
    errors = sum(1 for r in results if r.error)

    print()
    print("=" * 64)
    print(f"  Extracted: {len(results) - errors}/{len(results)}  Errors: {errors}")
    print(f"  Tokens: {total_in:,} in / {total_out:,} out")
    print(f"  Cost: ${total_cost:.4f}")
    print(f"  Wall time: {time.time() - t_start:.1f}s")
    print("=" * 64)

    state = {
        "run_at": datetime.now().isoformat(),
        "count": len(results),
        "errors": errors,
        "total_input_tokens": total_in,
        "total_output_tokens": total_out,
        "total_cost_usd": round(total_cost, 5),
        "results": [asdict(r) for r in results],
    }
    STATE_FILE.write_text(json.dumps(state, indent=2), encoding="utf-8")

    synthesize()
    print("\nDone.")


if __name__ == "__main__":
    main()
