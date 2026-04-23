#!/usr/bin/env python3
"""
SCEV-1 K437 Runner — architecturally-correct edition
=====================================================
3 arms (COLD / HOT-base / HOT-cathedral) x 2 Anthropic models
x N graded questions from a SEED or SEALED question bank.

Differences from `run_scev1_prelim.py` (Bishop-side preliminary):
  * HOT-cathedral uses the K436 `consult_scribes` MCP code path — calls the
    in-repo TypeScript implementation through a long-running Node subprocess
    shim (`consult_scribes_cli.mjs`). Returns up to 10 most-relevant Scribe
    entries per question. NOT direct-file-stuffing of all tablets.
  * Records `scribes_consulted` and `cathedral_entries` per call so the
    summary's "error attribution" section can attribute each hit to a Scribe.
  * Bank path is a CLI arg — point at the SEED today, the SEALED file when
    Bishop ships it. Output dir name is parameterized with the bank version.

Usage:
  python run_scev1_k437.py \
      --bank SCEV1_QUESTION_BANK_SEED_B116.json \
      --out  results_scev1_b116_k437_seed18 \
      --budget 20.00

Env: ANTHROPIC_API_KEY must be set (load from SDS.env upstream).
"""
from __future__ import annotations

import argparse
import json
import os
import statistics
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent.parent
sys.path.insert(0, str(SCRIPT_DIR.parent))
sys.path.insert(0, str(SCRIPT_DIR))

from adapters.anthropic_adapter import call as anthropic_call  # noqa: E402

R9_BASE_PRELOAD_PATH = REPO_ROOT / "librarian-mcp-public" / "preload" / "r9v2_base.md"
CONSULT_CLI_PATH = SCRIPT_DIR / "consult_scribes_cli.mjs"

MODELS = [
    ("anthropic", "claude-haiku-4-5-20251001", "cheap"),
    ("anthropic", "claude-opus-4-7", "premium"),
]
ARMS = ["cold", "hot_base", "hot_cathedral"]

# System-prompt pre-amble per arm. The body of the user message is the question.
COLD_SYS = (
    "You are a helpful assistant. Answer the user's question to the best of "
    "your ability. If you don't know the answer, say so. Do not invent facts."
)
HOT_BASE_SYS_PREFIX = (
    "You are the Liana Banyan canonical memory assistant. Answer using ONLY the "
    "preload below. If the preload does not contain the answer, say 'I don't "
    "know' or flag the gap — do NOT invent facts.\n\n--- R9-v2 BASE PRELOAD ---\n\n"
)
HOT_CATHEDRAL_SYS_PREFIX = (
    "You are the Liana Banyan canonical memory assistant with access to the "
    "Scribes Cathedral (domain-indexed working memory). Use the base preload "
    "AND the most-relevant Scribe entries below (selected by the Cathedral's "
    "consult_scribes routing, max 10 entries). Cite which Scribe(s) you used "
    "if it helps. If neither contains the answer, say 'I don't know'. Do NOT "
    "invent.\n\n--- R9-v2 BASE PRELOAD ---\n\n"
)
CATHEDRAL_DIVIDER = "\n\n--- SCRIBES CATHEDRAL (top 10 most-relevant entries for this question) ---\n\n"


# ─── consult_scribes long-running subprocess ──────────────────────────────────

class ConsultClient:
    """Persistent subprocess wrapper around consult_scribes_cli.mjs.

    Sends one JSON line per request, reads one JSON line per response. Avoids
    the ~200ms node-startup penalty per question.
    """

    def __init__(self, cli_path: Path):
        self.proc = subprocess.Popen(
            ["node", str(cli_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(cli_path.parent),
            text=True,
            encoding="utf-8",
            bufsize=1,
        )

    def consult(self, topic: str, max_entries: int = 10) -> dict:
        if self.proc.stdin is None or self.proc.stdout is None:
            raise RuntimeError("consult subprocess not initialized")
        req = json.dumps({"topic": topic, "max_entries": max_entries})
        self.proc.stdin.write(req + "\n")
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


def render_cathedral_block(consult_response: dict) -> tuple[str, list[str], list[dict]]:
    """Turn a consult_scribes JSON response into the markdown block injected
    into HOT-cathedral system prompts. Returns (markdown, scribe_ids, entries_meta)."""
    if not consult_response.get("ok"):
        return ("(consult_scribes returned no entries)", [], [])
    result = consult_response["result"]
    consulted = result.get("scribes_consulted", [])
    entries = result.get("entries", [])
    if not entries:
        return ("(no Scribes scored above zero for this topic)", [], [])

    scribe_ids = [c["scribe_id"] for c in consulted]
    entries_meta = [
        {"scribe_id": e["scribe_id"], "ts": e.get("ts"), "session": e.get("session")}
        for e in entries
    ]
    md_lines = []
    consulted_summary = ", ".join(
        f"{c['scribe_id']}(score={c['score']},entries={c['entries_returned']})"
        for c in consulted
    )
    md_lines.append(f"Scribes consulted: {consulted_summary}")
    md_lines.append("")
    for e in entries:
        sid = e["scribe_id"]
        ts = e.get("ts", "?")
        session = e.get("session", "?")
        obs = e.get("observation", "")
        ref = e.get("canonical_ref", "")
        md_lines.append(f"### Scribe {sid} — {session} ({ts})")
        md_lines.append(obs)
        if ref:
            md_lines.append(f"*ref: {ref}*")
        md_lines.append("")
    return ("\n".join(md_lines), scribe_ids, entries_meta)


# ─── Grading ──────────────────────────────────────────────────────────────────

def grade_response(response_text: str, required_elements: list) -> str:
    """R10 three-tier substring rubric.
    HOT  = all required elements (case-insensitive substring) present
    HIT  = >=50% present
    MISS = <50%
    Refusals ('I don't know') with zero hits count as MISS, not a separate
    bucket — matches R10 prelim convention."""
    if not required_elements:
        return "ungraded"
    text_lower = response_text.lower()
    hits = sum(1 for e in required_elements if str(e).lower() in text_lower)
    n = len(required_elements)
    if hits == n:
        return "HOT"
    if hits >= max(1, (n + 1) // 2):  # >=ceil(n/2), and at least one
        return "HIT"
    return "MISS"


# ─── Runner ───────────────────────────────────────────────────────────────────

def run(bank_path: Path, out_dir: Path, budget_usd: float, half_warn: bool = True) -> dict:
    if not bank_path.exists():
        raise FileNotFoundError(f"Question bank not found: {bank_path}")
    if not R9_BASE_PRELOAD_PATH.exists():
        raise FileNotFoundError(f"R9-v2 preload not found: {R9_BASE_PRELOAD_PATH}")
    if not CONSULT_CLI_PATH.exists():
        raise FileNotFoundError(f"consult_scribes_cli.mjs missing: {CONSULT_CLI_PATH}")

    bank = json.loads(bank_path.read_text(encoding="utf-8"))
    questions = bank.get("questions", [])
    if not questions:
        raise ValueError(f"Bank file has no 'questions' array: {bank_path}")
    base_preload = R9_BASE_PRELOAD_PATH.read_text(encoding="utf-8")

    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"SCEV-1 K437 runner starting.")
    print(f"  Bank:        {bank_path.name}  (n={len(questions)} questions)")
    print(f"  Bank status: {bank.get('bank_status', '(no status field)')[:120]}")
    print(f"  Models:      {len(MODELS)}  ({', '.join(m for _, m, _ in MODELS)})")
    print(f"  Arms:        {len(ARMS)}  ({', '.join(ARMS)})")
    print(f"  Total calls: {len(questions) * len(MODELS) * len(ARMS)}")
    print(f"  Budget cap:  ${budget_usd:.2f}")
    print(f"  Output:      {out_dir}")
    print()

    consult = ConsultClient(CONSULT_CLI_PATH)
    cathedral_cache: dict[str, tuple[str, list[str], list[dict]]] = {}
    cost_log_path = out_dir / "cost_log.csv"
    cost_log_path.write_text("ts,model,arm,qid,grade,cost_usd,latency_s,running_total_usd\n", encoding="utf-8")

    total_cost = 0.0
    halted = False
    half_warned = False
    all_records: list[dict] = []

    try:
        for vendor, model, tier in MODELS:
            for arm in ARMS:
                if halted:
                    break
                per_file = out_dir / f"{model.replace('/', '_')}_{arm}.jsonl"
                with per_file.open("w", encoding="utf-8") as out:
                    for q in questions:
                        if total_cost >= budget_usd:
                            print(f"\n!! BUDGET CAP HIT at ${total_cost:.4f} — halting after this loop.")
                            halted = True
                            break
                        if half_warn and not half_warned and total_cost >= budget_usd / 2:
                            print(f"\n** HALF-BUDGET WARNING at ${total_cost:.4f} of ${budget_usd:.2f}. Continuing.")
                            half_warned = True

                        qid = q["q_id"]
                        question = q["question"]
                        required = q.get("hot_required_elements", [])
                        category = q["category"]
                        source_session = q.get("source_session", "unknown")
                        hallucination_risk = q.get("hallucination_risk", "")

                        # Build per-arm prompt
                        if arm == "cold":
                            sys_prompt = COLD_SYS
                            cathedral_md = ""
                            scribe_ids: list[str] = []
                            entries_meta: list[dict] = []
                        elif arm == "hot_base":
                            sys_prompt = HOT_BASE_SYS_PREFIX + base_preload
                            cathedral_md = ""
                            scribe_ids = []
                            entries_meta = []
                        else:  # hot_cathedral — the architectural distinctive
                            if qid in cathedral_cache:
                                cathedral_md, scribe_ids, entries_meta = cathedral_cache[qid]
                            else:
                                cresp = consult.consult(question, max_entries=10)
                                cathedral_md, scribe_ids, entries_meta = render_cathedral_block(cresp)
                                cathedral_cache[qid] = (cathedral_md, scribe_ids, entries_meta)
                            sys_prompt = (
                                HOT_CATHEDRAL_SYS_PREFIX
                                + base_preload
                                + CATHEDRAL_DIVIDER
                                + cathedral_md
                            )

                        # Anthropic call
                        try:
                            resp = anthropic_call(model, sys_prompt, question)
                            grade = grade_response(resp.text, required)
                            total_cost += resp.cost_usd
                            record = {
                                "qid": qid,
                                "category": category,
                                "source_session": source_session,
                                "hallucination_risk": hallucination_risk,
                                "model": model,
                                "tier": tier,
                                "arm": arm,
                                "question": question,
                                "required_elements": required,
                                "response_text": resp.text,
                                "grade": grade,
                                "cost_usd": resp.cost_usd,
                                "latency_s": resp.latency_s,
                                "input_tokens": resp.input_tokens,
                                "output_tokens": resp.output_tokens,
                                "scribes_consulted": scribe_ids,
                                "cathedral_entries_meta": entries_meta,
                                "ts": datetime.now(timezone.utc).isoformat(),
                            }
                            out.write(json.dumps(record) + "\n")
                            all_records.append(record)
                            with cost_log_path.open("a", encoding="utf-8") as cl:
                                cl.write(
                                    f"{record['ts']},{model},{arm},{qid},{grade},"
                                    f"{resp.cost_usd:.6f},{resp.latency_s:.3f},{total_cost:.6f}\n"
                                )
                            scribes_tag = (",".join(scribe_ids[:3]) or "-") if arm == "hot_cathedral" else ""
                            print(
                                f"  [{model[:18]:<18}] {arm:<14} {qid} {grade:<5} "
                                f"${resp.cost_usd:.4f} (running ${total_cost:.4f})  {scribes_tag}"
                            )
                        except Exception as e:
                            err = {"qid": qid, "arm": arm, "model": model, "error": str(e)}
                            out.write(json.dumps(err) + "\n")
                            print(f"  [{model[:18]:<18}] {arm:<14} {qid} ERROR: {e}")
                        time.sleep(0.25)
    finally:
        consult.close()

    summary = aggregate(all_records, total_cost, halted)
    summary_path = out_dir / "results_summary.json"
    summary_path.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    raw_path = out_dir / "all_graded.jsonl"
    with raw_path.open("w", encoding="utf-8") as f:
        for r in all_records:
            f.write(json.dumps(r) + "\n")

    print()
    print("=== AGGREGATE ===")
    print(json.dumps(summary["by_model_arm"], indent=2))
    print(f"\nTotal spend: ${total_cost:.4f}  (cap ${budget_usd:.2f})")
    print(f"Records: {len(all_records)}")
    print(f"Halted-on-budget: {halted}")
    print(f"\nWrote: {summary_path}")
    return summary


def aggregate(records: list[dict], total_cost: float, halted: bool) -> dict:
    by = {}
    latencies_by_key: dict[str, list[float]] = {}
    for r in records:
        if "grade" not in r:
            continue
        key = f"{r['model']}|{r['arm']}"
        b = by.setdefault(key, {"n": 0, "HOT": 0, "HIT": 0, "MISS": 0, "cost_usd": 0.0})
        b["n"] += 1
        g = r["grade"]
        if g in ("HOT", "HIT", "MISS"):
            b[g] += 1
        b["cost_usd"] = round(b["cost_usd"] + r["cost_usd"], 6)
        latencies_by_key.setdefault(key, []).append(r["latency_s"])

    for key, b in by.items():
        n = b["n"] or 1
        b["accuracy_hot_pct"] = round(100.0 * b["HOT"] / n, 2)
        b["accuracy_hot_or_hit_pct"] = round(100.0 * (b["HOT"] + b["HIT"]) / n, 2)
        b["mean_cost_per_q"] = round(b["cost_usd"] / n, 6)
        b["cost_per_correct"] = (
            round(b["cost_usd"] / b["HOT"], 6) if b["HOT"] > 0 else None
        )
        lats = sorted(latencies_by_key.get(key, []))
        if lats:
            mid = len(lats) // 2
            b["p50_latency_s"] = round(lats[mid], 3)
            b["p95_latency_s"] = round(lats[max(0, int(0.95 * len(lats)) - 1)], 3)

    return {
        "total_cost_usd": round(total_cost, 4),
        "total_calls": len(records),
        "halted_on_budget": halted,
        "by_model_arm": by,
    }


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--bank", required=True, help="Path to question bank JSON (relative to script dir or absolute)")
    p.add_argument("--out", required=True, help="Output directory name (relative to script dir or absolute)")
    p.add_argument("--budget", type=float, default=20.00, help="Hard cost cap in USD (default 20.00)")
    args = p.parse_args()

    bank_path = Path(args.bank)
    if not bank_path.is_absolute():
        bank_path = SCRIPT_DIR / bank_path
    out_dir = Path(args.out)
    if not out_dir.is_absolute():
        out_dir = SCRIPT_DIR / out_dir

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("FATAL: ANTHROPIC_API_KEY not set. Load SDS.env upstream.", file=sys.stderr)
        sys.exit(2)

    run(bank_path, out_dir, args.budget)


if __name__ == "__main__":
    main()
