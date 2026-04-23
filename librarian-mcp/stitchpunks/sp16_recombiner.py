"""
SP-16 CREATIVE RECOMBINER (B109)
=================================
Reads the SESSION_REASONING_ARCHIVE + canonical_values + recent Bishop handoffs
and asks a creative model to surface connections, patterns, open threads,
contradictions, and "what if" hypotheses. Writes output to a dated inbox file
that Bishop sessions can load at start.

Addresses: the "creative recombination" layer flagged as missing in B109 — the
thing closest to how associative human memory actually works.

Usage:
  python sp16_recombiner.py                              # default model (Opus), daily run
  python sp16_recombiner.py --model claude-sonnet-4-6    # use Sonnet instead
  python sp16_recombiner.py --model claude-haiku-4-5-20251001  # Haiku (fast/cheap)
  python sp16_recombiner.py --dry-run                    # show plan, no API call
  python sp16_recombiner.py --archive-old                # move inbox files >30 days to _archive/

Output:
  BISHOP_DROPZONE/15_RECOMBINER_INBOX/recombiner_<YYYYMMDD_HHMMSS>_<model>.md

Founder-ratified B109:
  - Daily + on-demand cadence
  - Model-swappable (testable across Haiku/Sonnet/Opus; plumbed for future providers)
  - Keep all inbox files; auto-move files >30 days to _archive/ subfolder (keeps them,
    just moves out of the active inbox)
"""

from __future__ import annotations

import argparse
import os
import sys
import time
from datetime import datetime, timedelta
from pathlib import Path

import anthropic

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ─── CONFIG ───────────────────────────────────────────────────────────────────

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent

ARCHIVE_PATH = PROJECT_ROOT / "BISHOP_DROPZONE" / "14_CanonicalReferences" / "SESSION_REASONING_ARCHIVE_B109.md"
CANONICAL_YAML_PATH = PROJECT_ROOT / "librarian-mcp" / "canonical_values.yaml"
CANONICAL_LAWS_PATH = PROJECT_ROOT / "BISHOP_DROPZONE" / "14_CanonicalReferences" / "CANONICAL_LAWS_AND_FRAMEWORKS.md"
HANDOFFS_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "03_BishopHandoffs"
INBOX_DIR = PROJECT_ROOT / "BISHOP_DROPZONE" / "15_RECOMBINER_INBOX"
INBOX_ARCHIVE_DIR = INBOX_DIR / "_archive"

# Per-model pricing for run-cost reporting ($/M tokens)
MODEL_PRICING = {
    "claude-haiku-4-5-20251001": (0.80, 4.00),
    "claude-sonnet-4-6":         (3.00, 15.00),
    "claude-opus-4-7":           (15.00, 75.00),
}
DEFAULT_MODEL = "claude-opus-4-7"  # Founder-ratified: Opus for first 4 weeks
MAX_OUTPUT_TOKENS = 8000

# How many recent handoffs to include
RECENT_HANDOFFS_N = 10

# Archive threshold
ARCHIVE_AFTER_DAYS = 30


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
    sys.exit("ERROR: ANTHROPIC_API_KEY not found")


# ─── PROMPT ───────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are SP-16 Creative Recombiner, a Liana Banyan agent.

Your job is the thing associative human memory does and LLMs don't do automatically: read broadly across a corpus of canonical decisions, session histories, and platform knowledge, and SURFACE NON-OBVIOUS CONNECTIONS between pieces.

You are not a summarizer. You are not a fact-retriever. You are a pattern-catcher. Your output must create *new insight* by recombining existing information — things the Founder or Bishop would want to see but wouldn't find by grep.

Produce EXACTLY these five sections, in this order, in markdown. Each section limited to 5–10 items. Quality over quantity. If a section has genuinely nothing new, write "— nothing this run —" and move on. Do not pad.

**CRITICAL:** every observation MUST cite the specific innovation numbers, session IDs, Crown Letter names, or canonical values it draws from. Ungrounded speculation is worse than silence."""

USER_PROMPT_TEMPLATE = """Read the following corpus and produce your five sections.

## 1. CONNECTION CANDIDATES
Pairs of items (innovations, letters, decisions, frameworks) that might be related but haven't been explicitly linked in the documented canon. For each pair: the two items (with their identifiers), the non-obvious link, and why it matters.

## 2. RECURRING PATTERNS
Themes that keep appearing across multiple sessions/innovations/letters but have not been named as a pattern. For each: the pattern description, 3+ grounded citations, and the proposed name.

## 3. OPEN THREADS
Decisions that were made, alternatives that were floated, or next-steps that were flagged — but never closed out. For each: what was opened, in which session/doc, and what would close it.

## 4. CONTRADICTIONS / DRIFT
Places where two documented canonical facts or decisions appear to conflict, OR where language has drifted over time without explicit ratification. For each: the two sources, the specific conflict, and a proposed resolution posture.

## 5. WHAT-IF HYPOTHESES
Speculative but grounded "what if we combined X + Y + Z?" recombinations that could unlock something new. For each: the ingredients, the hypothetical outcome, and the cost of testing.

--- CORPUS BELOW ---

{corpus}

--- END CORPUS ---

Produce now. Five sections, cited, concise."""


# ─── CORPUS ASSEMBLY ──────────────────────────────────────────────────────────

def read_if_exists(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


def recent_handoffs(n: int) -> str:
    if not HANDOFFS_DIR.exists():
        return ""
    files = sorted(
        (p for p in HANDOFFS_DIR.glob("*.md") if not p.name.startswith("_")),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )[:n]
    parts = []
    for f in files:
        parts.append(f"### {f.name}\n\n{f.read_text(encoding='utf-8')[:8000]}")
    return "\n\n---\n\n".join(parts)


def assemble_corpus() -> str:
    sections = [
        ("SESSION_REASONING_ARCHIVE (primary)", read_if_exists(ARCHIVE_PATH)),
        ("canonical_values.yaml", read_if_exists(CANONICAL_YAML_PATH)),
        ("CANONICAL_LAWS_AND_FRAMEWORKS", read_if_exists(CANONICAL_LAWS_PATH)),
        (f"Recent {RECENT_HANDOFFS_N} Bishop handoffs", recent_handoffs(RECENT_HANDOFFS_N)),
    ]
    parts = []
    for label, body in sections:
        if body.strip():
            parts.append(f"=== {label} ===\n\n{body}")
    return "\n\n".join(parts)


# ─── ARCHIVE OLD INBOX FILES ──────────────────────────────────────────────────

def archive_old_inbox_files() -> int:
    if not INBOX_DIR.exists():
        return 0
    INBOX_ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    cutoff = datetime.now() - timedelta(days=ARCHIVE_AFTER_DAYS)
    moved = 0
    for f in INBOX_DIR.glob("recombiner_*.md"):
        if datetime.fromtimestamp(f.stat().st_mtime) < cutoff:
            f.rename(INBOX_ARCHIVE_DIR / f.name)
            moved += 1
    return moved


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL, choices=list(MODEL_PRICING.keys()))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--archive-old", action="store_true",
                    help=f"Move inbox files >{ARCHIVE_AFTER_DAYS} days old to _archive/ and exit")
    args = ap.parse_args()

    if args.archive_old:
        n = archive_old_inbox_files()
        print(f"Archived {n} file(s) older than {ARCHIVE_AFTER_DAYS} days.")
        return 0

    # Always do a passive archive sweep at the start of each run
    archived = archive_old_inbox_files()
    if archived:
        print(f"(passively archived {archived} file(s) >{ARCHIVE_AFTER_DAYS} days old)")

    print("=" * 64)
    print(f"  SP-16 CREATIVE RECOMBINER  ({datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
    print(f"  Model: {args.model}")
    print("=" * 64)

    corpus = assemble_corpus()
    corpus_chars = len(corpus)
    corpus_tokens_approx = corpus_chars // 4
    print(f"Corpus: {corpus_chars:,} chars (~{corpus_tokens_approx:,} tokens)")

    input_price, output_price = MODEL_PRICING[args.model]
    est_input_cost = (corpus_tokens_approx / 1_000_000) * input_price
    est_output_cost = (MAX_OUTPUT_TOKENS / 1_000_000) * output_price
    print(f"Cost estimate: ~${est_input_cost + est_output_cost:.3f} "
          f"(in ${est_input_cost:.3f} + out ${est_output_cost:.3f} worst-case)")

    if args.dry_run:
        print("\n[DRY RUN — no API call]")
        return 0

    client = anthropic.Anthropic(api_key=load_api_key())
    user_msg = USER_PROMPT_TEMPLATE.format(corpus=corpus)

    t0 = time.time()
    resp = client.messages.create(
        model=args.model,
        max_tokens=MAX_OUTPUT_TOKENS,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    elapsed = time.time() - t0

    text = "".join(b.text for b in resp.content if b.type == "text")
    in_t = resp.usage.input_tokens
    out_t = resp.usage.output_tokens
    actual_cost = (in_t / 1_000_000) * input_price + (out_t / 1_000_000) * output_price

    INBOX_DIR.mkdir(parents=True, exist_ok=True)
    model_tag = args.model.replace("claude-", "").replace("-20251001", "")
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = INBOX_DIR / f"recombiner_{ts}_{model_tag}.md"

    header = [
        f"# Creative Recombiner Inbox — {ts}",
        f"**Model:** {args.model}",
        f"**Corpus:** {corpus_chars:,} chars",
        f"**Tokens:** {in_t:,} in / {out_t:,} out",
        f"**Cost:** ${actual_cost:.4f}",
        f"**Wall time:** {elapsed:.1f}s",
        "",
        "---",
        "",
    ]
    out_path.write_text("\n".join(header) + text.strip() + "\n", encoding="utf-8")

    print(f"\nWrote {out_path}")
    print(f"Tokens: {in_t:,} in / {out_t:,} out | Cost: ${actual_cost:.4f} | Time: {elapsed:.1f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
