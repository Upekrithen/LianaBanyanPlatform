#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
R11 K474 Benchmark Runner — Self-Indexing Scribes Clean-Cathedral-Effect Verification
======================================================================================
Two phases, 50 questions each, anthropic_haiku_bishop condition:

  Phase B — auto-only clean test
    LIBRARIAN_KEYWORDS_MODE=auto-only
    K472/K473 hand-added keywords temporarily removed from R11/KnightR11 in registry.yaml
    Results: results_r11_k474_auto_only/
    This is the CLEAN CATHEDRAL EFFECT number — what the architecture earns without
    any operator tuning to the sealed question bank.

  Phase C — union shipping configuration
    LIBRARIAN_KEYWORDS_MODE=union
    Full registry.yaml with K472/K473 hand-adds retained
    Results: results_r11_k474_union/
    This is the SHIPPING NUMBER — what real operation produces.

Usage:
  python run_r11_k474.py --phase B   # Phase B: auto-only
  python run_r11_k474.py --phase C   # Phase C: union
  python run_r11_k474.py --phase ALL # Both phases sequentially

Env: ANTHROPIC_API_KEY (load from SDS.env per AGENTS.md)
"""
from __future__ import annotations

import argparse
import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).resolve().parent
LIBRARIAN_MCP_DIR = SCRIPT_DIR.parent
STITCHPUNKS_DIR = LIBRARIAN_MCP_DIR / "stitchpunks"

BANK_PATH = SCRIPT_DIR / "R11_QUESTION_BANK_SEALED_K471.json"
CONSULT_CLI_PATH = SCRIPT_DIR / "consult_scribes_cli.mjs"
R9_PRELOAD_PATH = LIBRARIAN_MCP_DIR.parent.parent / "librarian-mcp-public" / "preload" / "r9v2_base.md"

# Fallback R9 preload (minimal context if librarian-mcp-public not available)
R9_FALLBACK = (
    "You are the Liana Banyan canonical memory assistant.\n"
    "Answer using only the context provided in the Scribes Cathedral below.\n"
    "If the context does not contain the answer, say 'I don't know' — do NOT invent facts.\n"
)

CATHEDRAL_SYS_PREFIX = (
    "You are the Liana Banyan canonical memory assistant with access to the "
    "Scribes Cathedral (domain-indexed working memory). "
    "Use the base preload AND the most-relevant Scribe entries below. "
    "If neither contains the answer, say 'I don't know'. Do NOT invent facts.\n\n"
    "--- R9-v2 BASE PRELOAD ---\n\n"
)
CATHEDRAL_DIVIDER = "\n\n--- SCRIBES CATHEDRAL (top 10 most-relevant entries) ---\n\n"

HAIKU_PRICING = {"input": 1.00, "output": 5.00}
MODEL = "claude-haiku-4-5-20251001"

# K472/K473 hand-added keywords to remove from R11 in Phase B
# These were added by K472 (AM-category) and K473 (MJ-category)
K472_K473_ADDITIONS = {
    # K472 Fix 1: AM-category
    "Reference Architecture",
    "Cooperative AI Platform",
    "Cooperative AI Platform Reference Architecture",
    "Architecture Working Group",
    # K473 Fix: MJ-category
    "Reference Onboarding Framework",
    "Cooperative Principles Assessment",
    "Reference Communication Standards",
    "exit interview completion rate",
    "exit interview",
}


# ─── Grader ──────────────────────────────────────────────────────────────────

def grade_response(response_text: str, required_elements: list[str]) -> str:
    """R10 three-tier substring rubric. HOT=all, HIT>=ceil(n/2), MISS=rest."""
    if not required_elements:
        return "ungraded"
    text_lower = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in text_lower)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= math.ceil(n / 2):
        return "HIT"
    return "MISS"


# ─── Consult subprocess ───────────────────────────────────────────────────────

class ConsultClient:
    """Persistent Node subprocess for consult_scribes_cli.mjs with custom env."""

    def __init__(self, cli_path: Path, extra_env: dict | None = None) -> None:
        env = {**os.environ}
        if extra_env:
            env.update(extra_env)
        self.proc = subprocess.Popen(
            ["node", str(cli_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(cli_path.parent),
            text=True,
            encoding="utf-8",
            bufsize=1,
            env=env,
        )

    def consult(self, topic: str, max_entries: int = 100) -> dict:
        if self.proc.stdin is None or self.proc.stdout is None:
            raise RuntimeError("consult subprocess not initialized")
        self.proc.stdin.write(json.dumps({"topic": topic, "max_entries": max_entries, "cathedral": "bishop", "scope": "public"}) + "\n")
        self.proc.stdin.flush()
        line = self.proc.stdout.readline()
        if not line:
            err = self.proc.stderr.read() if self.proc.stderr else ""
            raise RuntimeError(f"consult subprocess died: {err}")
        return json.loads(line)

    def close(self) -> None:
        try:
            if self.proc.stdin:
                self.proc.stdin.close()
            self.proc.wait(timeout=5)
        except Exception:
            self.proc.kill()


def render_cathedral_block(consult_response: dict) -> tuple[str, list[str]]:
    if not consult_response.get("ok"):
        return ("(consult_scribes returned no entries)", [])
    result = consult_response["result"]
    consulted = result.get("scribes_consulted", [])
    entries = result.get("entries", [])
    if not entries:
        return ("(no Scribes scored above zero)", [])
    scribe_ids = [c["scribe_id"] for c in consulted]
    lines = []
    summary = ", ".join(
        f"{c['scribe_id']}(score={c['score']},n={c['entries_returned']})"
        for c in consulted
    )
    lines.append(f"Scribes consulted: {summary}")
    for e in entries:
        lines.append(f"\n### Scribe {e['scribe_id']} — {e.get('session', '?')} ({e.get('ts', '?')})")
        lines.append(e.get("observation", ""))
        if e.get("canonical_ref"):
            lines.append(f"*ref: {e['canonical_ref']}*")
    return ("\n".join(lines), scribe_ids)


# ─── Phase B registry setup ───────────────────────────────────────────────────

def build_phase_b_stitchpunks() -> Path:
    """
    Create a temp stitchpunks dir with:
      - A pruned registry.yaml (K472/K473 hand-adds removed from R11/KnightR11)
      - A symlinked/copied auto_keywords directory (sidecars needed for auto-only routing)
    Returns the path to the temp dir.
    """
    import yaml

    tmp = Path(tempfile.mkdtemp(prefix="k474_phaseB_"))

    # Copy structure: scribes/ and knight_cathedral/ with auto_keywords
    bishop_src = STITCHPUNKS_DIR / "scribes"
    knight_src = STITCHPUNKS_DIR / "knight_cathedral"
    bishop_dst = tmp / "scribes"
    knight_dst = tmp / "knight_cathedral"
    bishop_dst.mkdir()
    knight_dst.mkdir()
    (bishop_dst / "auto_keywords").mkdir()
    (knight_dst / "auto_keywords").mkdir()
    knight_scribes_dst = knight_dst / "scribes"
    knight_scribes_dst.mkdir()

    # Copy auto_keywords sidecars (needed in auto-only mode)
    for f in (bishop_src / "auto_keywords").glob("*.yaml"):
        shutil.copy2(f, bishop_dst / "auto_keywords" / f.name)
    for f in (knight_src / "auto_keywords").glob("*.yaml"):
        shutil.copy2(f, knight_dst / "auto_keywords" / f.name)

    # Copy tablet JSONL files (needed for consult_scribes result rendering)
    for f in bishop_src.glob("scribe_*.jsonl"):
        shutil.copy2(f, bishop_dst / f.name)
    for f in (knight_src / "scribes").glob("*.jsonl"):
        shutil.copy2(f, knight_scribes_dst / f.name)

    # Copy schema files if present
    for f in bishop_src.glob("schema.json"):
        shutil.copy2(f, bishop_dst / f.name)
    for f in knight_src.glob("schema.json"):
        shutil.copy2(f, knight_dst / f.name)
    for f in knight_src.glob("*.md"):
        shutil.copy2(f, knight_dst / f.name)

    # Load and prune Bishop registry
    bishop_reg = yaml.safe_load((bishop_src / "registry.yaml").read_text(encoding="utf-8"))
    for scribe in bishop_reg["scribes"]:
        if scribe["id"] in ("R11", "KnightR11"):
            original = scribe.get("keywords", [])
            pruned = [k for k in original if k not in K472_K473_ADDITIONS]
            removed = [k for k in original if k in K472_K473_ADDITIONS]
            scribe["keywords"] = pruned
            if removed:
                print(f"  [Phase B setup] {scribe['id']}: removed {len(removed)} K472/K473 keywords")
    (bishop_dst / "registry.yaml").write_text(
        yaml.dump(bishop_reg, allow_unicode=True, default_flow_style=False),
        encoding="utf-8",
    )

    # Load and prune Knight registry
    knight_reg = yaml.safe_load((knight_src / "registry.yaml").read_text(encoding="utf-8"))
    for scribe in knight_reg["scribes"]:
        if scribe["id"] in ("R11", "KnightR11"):
            original = scribe.get("keywords", [])
            pruned = [k for k in original if k not in K472_K473_ADDITIONS]
            scribe["keywords"] = pruned
    (knight_dst / "registry.yaml").write_text(
        yaml.dump(knight_reg, allow_unicode=True, default_flow_style=False),
        encoding="utf-8",
    )

    return tmp


# ─── Main runner ──────────────────────────────────────────────────────────────

def run_phase(phase: str, out_dir: Path) -> dict:
    """
    Run one phase (B or C) of the K474 benchmark.
    Returns a summary dict with HOT/HIT/MISS counts per category.
    """
    import anthropic as anthropic_sdk

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("FATAL: ANTHROPIC_API_KEY not set", file=sys.stderr)
        sys.exit(2)

    try:
        import yaml
    except ImportError:
        print("FATAL: PyYAML not installed. Run: pip install pyyaml", file=sys.stderr)
        sys.exit(2)

    bank = json.loads(BANK_PATH.read_text(encoding="utf-8"))
    questions = bank["questions"]
    print(f"Loaded {len(questions)} questions from {BANK_PATH.name}")

    out_dir.mkdir(parents=True, exist_ok=True)
    condition = "anthropic_haiku_bishop"
    per_file = out_dir / f"{condition}.jsonl"
    cost_file = out_dir / "cost_log.csv"

    # Phase-specific env vars
    tmp_dir: Path | None = None
    extra_env: dict = {}

    if phase == "B":
        print("\n[Phase B] Setting up pruned registry (removing K472/K473 hand-adds)...")
        tmp_dir = build_phase_b_stitchpunks()
        extra_env = {
            "LIBRARIAN_KEYWORDS_MODE": "auto-only",
            "LIBRARIAN_STITCHPUNKS_DIR": str(tmp_dir),
        }
        print(f"  Temp stitchpunks: {tmp_dir}")
        print("  LIBRARIAN_KEYWORDS_MODE=auto-only")
    else:  # Phase C
        extra_env = {"LIBRARIAN_KEYWORDS_MODE": "union"}
        print("\n[Phase C] LIBRARIAN_KEYWORDS_MODE=union (full registry, shipping config)")

    # Load R9 preload
    if R9_PRELOAD_PATH.exists():
        preload = R9_PRELOAD_PATH.read_text(encoding="utf-8")
        print(f"R9 preload loaded ({len(preload)} chars)")
    else:
        preload = R9_FALLBACK
        print(f"WARNING: R9 preload not found at {R9_PRELOAD_PATH} — using fallback")

    # Start consult subprocess
    if not CONSULT_CLI_PATH.exists():
        print(f"FATAL: consult_scribes_cli.mjs not found at {CONSULT_CLI_PATH}", file=sys.stderr)
        sys.exit(2)

    client_sdk = anthropic_sdk.Anthropic(api_key=api_key)
    consult_client = ConsultClient(CONSULT_CLI_PATH, extra_env=extra_env)
    print("consult_scribes subprocess started.")

    # Category tracking
    categories: dict[str, dict] = {}
    total_cost = 0.0
    records = []
    cost_rows = ["qid,category,grade,cost_usd,latency_s,input_tokens,output_tokens\n"]

    print(f"\nRunning {len(questions)} questions [{phase}={condition}]...\n")

    for i, q in enumerate(questions, 1):
        qid = q.get("qid", f"Q{i:03d}")
        question_text = q["question"]
        required_elements = q.get("hot_required_elements", [])
        category = q.get("category", "unknown")
        source_fact_id = q.get("source_fact_id", "")

        # Consult the Cathedral
        try:
            cresp = consult_client.consult(question_text)
            cathedral_md, scribe_ids = render_cathedral_block(cresp)
        except Exception as e:
            print(f"  [{qid}] consult error: {e} — using empty context")
            cathedral_md = "(consult error)"
            scribe_ids = []

        # Build system prompt
        system_prompt = CATHEDRAL_SYS_PREFIX + preload + CATHEDRAL_DIVIDER + cathedral_md

        # Ask Haiku
        t0 = time.perf_counter()
        try:
            response = client_sdk.messages.create(
                model=MODEL,
                max_tokens=512,
                system=system_prompt,
                messages=[{"role": "user", "content": question_text}],
            )
            latency = time.perf_counter() - t0
            response_text = response.content[0].text if response.content else ""
            input_tokens = response.usage.input_tokens
            output_tokens = response.usage.output_tokens
        except Exception as e:
            print(f"  [{qid}] API error: {e}", file=sys.stderr)
            response_text = f"(API error: {e})"
            input_tokens = output_tokens = 0
            latency = 0.0

        # Grade
        grade = grade_response(response_text, required_elements)
        cost_usd = (input_tokens / 1_000_000) * HAIKU_PRICING["input"] + \
                   (output_tokens / 1_000_000) * HAIKU_PRICING["output"]
        total_cost += cost_usd

        # Category tracking
        if category not in categories:
            categories[category] = {"HOT": 0, "HIT": 0, "MISS": 0, "n": 0, "cost": 0.0}
        categories[category][grade] += 1
        categories[category]["n"] += 1
        categories[category]["cost"] += cost_usd

        # Record
        record = {
            "qid": qid,
            "condition": condition,
            "vendor": "anthropic",
            "model": MODEL,
            "adapter_type": "anthropic_cross_cathedral",
            "cathedral": "bishop",
            "keywords_mode": phase == "B" and "auto-only" or "union",
            "category": category,
            "source_fact_id": source_fact_id,
            "question": question_text,
            "required_elements": required_elements,
            "response_text": response_text,
            "grade": grade,
            "cost_usd": round(cost_usd, 6),
            "latency_s": round(latency, 3),
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "scribes_consulted": scribe_ids,
            "ts": datetime.now(timezone.utc).isoformat(),
        }
        records.append(record)

        grade_icon = "✓" if grade == "HOT" else ("~" if grade == "HIT" else "✗")
        print(f"  [{i:02d}/{len(questions)}] {qid} [{category}] → {grade} {grade_icon} (${cost_usd:.4f}, {latency:.2f}s, scribes={scribe_ids})")

        cost_rows.append(f"{qid},{category},{grade},{cost_usd:.6f},{latency:.3f},{input_tokens},{output_tokens}\n")

    consult_client.close()

    # Write outputs
    with open(per_file, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")

    # Also write all_graded.jsonl
    with open(out_dir / "all_graded.jsonl", "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")

    with open(cost_file, "w", encoding="utf-8") as f:
        f.writelines(cost_rows)

    # Compute summary
    total = len(records)
    hot = sum(1 for r in records if r["grade"] == "HOT")
    hit = sum(1 for r in records if r["grade"] == "HIT")
    miss = sum(1 for r in records if r["grade"] == "MISS")

    summary = {
        "session": "K474",
        "phase": phase,
        "keywords_mode": "auto-only" if phase == "B" else "union",
        "k472_k473_hand_adds": "removed" if phase == "B" else "retained",
        "corpus_id": "R11-CANONICAL-K471",
        "total_cost_usd": round(total_cost, 3),
        "total_records": total,
        "halted_on_budget": False,
        "by_condition": {
            condition: {
                "n": total,
                "HOT": hot,
                "HIT": hit,
                "MISS": miss,
                "cost_usd": round(total_cost, 6),
                "vendor": "anthropic",
                "model": MODEL,
                "cathedral": "bishop",
                "hot_pct": round(100 * hot / total, 1) if total else 0,
                "hit_pct": round(100 * hit / total, 1) if total else 0,
                "miss_pct": round(100 * miss / total, 1) if total else 0,
                "hot_or_hit_pct": round(100 * (hot + hit) / total, 1) if total else 0,
            }
        },
        "by_category": {
            cat: {
                "n": v["n"],
                "HOT": v["HOT"],
                "HIT": v["HIT"],
                "MISS": v["MISS"],
                "hot_pct": round(100 * v["HOT"] / v["n"], 1) if v["n"] else 0,
            }
            for cat, v in sorted(categories.items())
        },
    }

    with open(out_dir / "results_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    # Print summary
    print(f"\n{'='*60}")
    print(f"Phase {phase} RESULTS ({condition})")
    print(f"{'='*60}")
    print(f"  HOT: {hot}/{total} = {summary['by_condition'][condition]['hot_pct']}%")
    print(f"  HIT: {hit}/{total} = {summary['by_condition'][condition]['hit_pct']}%")
    print(f"  MISS: {miss}/{total} = {summary['by_condition'][condition]['miss_pct']}%")
    print(f"  Total cost: ${total_cost:.4f}")
    print(f"\nBy category:")
    for cat, v in sorted(categories.items()):
        print(f"  {cat:25s}: HOT={v['HOT']:2d}/{v['n']:2d} ({round(100*v['HOT']/v['n'],0) if v['n'] else 0:.0f}%)")
    print(f"\nResults written to: {out_dir}")

    # Cleanup temp dir
    if tmp_dir and tmp_dir.exists():
        shutil.rmtree(tmp_dir, ignore_errors=True)
        print(f"Temp dir cleaned up: {tmp_dir}")

    return summary


# ─── Entry point ─────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="K474 Phase B/C benchmark runner")
    parser.add_argument("--phase", required=True, choices=["B", "C", "ALL"],
                        help="Phase to run: B=auto-only clean, C=union shipping, ALL=both")
    args = parser.parse_args()

    phases = ["B", "C"] if args.phase == "ALL" else [args.phase]
    summaries = {}

    for phase in phases:
        if phase == "B":
            out_dir = SCRIPT_DIR / "results_r11_k474_auto_only"
        else:
            out_dir = SCRIPT_DIR / "results_r11_k474_union"

        print(f"\n{'#'*60}")
        print(f"# K474 Phase {phase}: {'auto-only (clean)' if phase == 'B' else 'union (shipping)'}")
        print(f"# Output: {out_dir}")
        print(f"{'#'*60}")

        summaries[phase] = run_phase(phase, out_dir)

    if "B" in summaries and "C" in summaries:
        b_hot = summaries["B"]["by_condition"]["anthropic_haiku_bishop"]["hot_pct"]
        c_hot = summaries["C"]["by_condition"]["anthropic_haiku_bishop"]["hot_pct"]
        print(f"\n{'='*60}")
        print("COMPARISON: Phase B vs Phase C vs K473 baseline")
        print(f"{'='*60}")
        print(f"  Phase B (auto-only clean):    {b_hot:.1f}% HOT")
        print(f"  Phase C (union shipping):     {c_hot:.1f}% HOT")
        print(f"  K473 baseline (hand+union):   88.0% HOT")
        delta_bc = c_hot - b_hot
        print(f"  C - B lift:                   {delta_bc:+.1f}pp")


if __name__ == "__main__":
    main()
