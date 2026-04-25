"""
PAWN SESSION SAVINGS — Phase C, K505
=====================================
Tracks substrate savings for Pawn (Perplexity) tasks, including the
Pawn-specific friction multiplier baked into the cold_multiplier = 3.5×.

Friction model (from project_pawn_friction_secondary_cathedral_effect.md):
  Cold Pawn without substrate generates 3+ "yes/that/do it" confirmation
  rounds before action. Each round ≈ 1 full re-prompt of average input tokens.
  friction_multiplier = 3.0× (3 confirmations × avg re-prompt cost)
  cold_multiplier for Pawn = 3.5× (includes friction baked in)

Usage:
  python pawn_session_savings.py log <task_id> <input_tokens> <output_tokens>
       [--friction N] [--substrate-overhead N] [--injections N]
       [--vendor NAME] [--model NAME] [--notes TEXT]

  python pawn_session_savings.py summary [--window all|7d|30d]

  python pawn_session_savings.py task-summary <task_id>

Bishop calls this after Founder pastes Pawn task output back into Bishop session.
Pawn metadata (token counts) visible in Pawn's response footer for many vendors;
otherwise Founder supplies manually.

BRIDLE guardrails:
  - cold_multiplier 3.5× is CONSERVATIVE per #41 good-name.
  - Subtract substrate overhead — honest math.
  - Provisional flags visible until calibration K-future.
  - Never publish member savings without opt-in (K502 rule).
"""

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parent
SAVINGS_LOG = REPO_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"

PRICING = {
    "anthropic":  (3.00, 15.00),
    "openai":     (2.50, 10.00),
    "google":     (1.25,  5.00),
    "perplexity": (1.00,  1.00),
}

COLD_MULTIPLIER = 3.5   # Pawn: 3.0× counterfactual + friction baked in
AGENT = "PAWN"


def compute_savings(input_tokens, output_tokens, substrate_overhead_tokens, vendor):
    inp_rate, out_rate = PRICING.get(vendor.lower(), PRICING["perplexity"])
    m = 1_000_000
    actual = (input_tokens / m) * inp_rate + (output_tokens / m) * out_rate
    overhead = (substrate_overhead_tokens / m) * inp_rate
    counterfactual = actual * COLD_MULTIPLIER
    net = counterfactual - actual - overhead
    return round(actual, 4), round(counterfactual, 4), round(net, 4)


def append_record(record: dict):
    SAVINGS_LOG.parent.mkdir(parents=True, exist_ok=True)
    existing = SAVINGS_LOG.read_text("utf-8").strip() if SAVINGS_LOG.exists() else ""
    lines = existing.split("\n") if existing else []
    lines.append(json.dumps(record))
    SAVINGS_LOG.write_text("\n".join(lines) + "\n", "utf-8")
    return len(lines)


def read_log():
    if not SAVINGS_LOG.exists():
        return []
    raw = SAVINGS_LOG.read_text("utf-8").strip()
    return [json.loads(l) for l in raw.split("\n") if l.strip()] if raw else []


def cmd_log(args):
    actual, counterfactual, net = compute_savings(
        args.input_tokens, args.output_tokens, args.substrate_overhead, args.vendor
    )
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": AGENT,
        "session_id": args.task_id,
        "input_tokens": args.input_tokens,
        "output_tokens": args.output_tokens,
        "substrate_overhead_tokens": args.substrate_overhead,
        "substrate_injection_count": args.injections,
        "vendor": args.vendor,
        "model": args.model,
        "actual_cost_usd": actual,
        "counterfactual_cost_usd": counterfactual,
        "session_savings_usd": net,
        "cold_multiplier": COLD_MULTIPLIER,
        "friction_confirmations": args.friction,
        "multiplier_provisional": True,
        "notes": args.notes or None,
    }
    n = append_record(record)
    friction_note = (
        f"  Pawn friction:  {args.friction} confirmations logged"
        if args.friction > 0 else ""
    )
    print(f"""
── Pawn Substrate Savings Logged ({args.task_id}) ──
  Tokens:         {args.input_tokens:,} in / {args.output_tokens:,} out
  Substrate OH:   {args.substrate_overhead:,} tokens, {args.injections} injections
  Actual cost:    ${actual:.4f}
  Counterfactual: ${counterfactual:.4f} ({COLD_MULTIPLIER}× cold mult. + friction)
  Net savings:    ${net:.4f} [provisional]{friction_note}
  Total entries:  {n}

Structured summary for Bishop conversation:
  "Pawn substrate savings this task ({args.task_id}): ${net:.4f}"
""")


def cmd_summary(args):
    all_records = read_log()
    pawn_records = [r for r in all_records if r.get("agent") == "PAWN"]
    if not pawn_records:
        print("No Pawn savings records yet.")
        return

    now = datetime.now(timezone.utc).timestamp() * 1000
    window_ms = {"all": float("inf"), "7d": 7*86400000, "30d": 30*86400000}[args.window]
    filtered = [
        r for r in pawn_records
        if now - datetime.fromisoformat(r["ts"]).timestamp() * 1000 <= window_ms
    ]

    total_savings = sum(r.get("session_savings_usd", 0) for r in filtered)
    total_actual = sum(r.get("actual_cost_usd", 0) for r in filtered)
    total_friction = sum(r.get("friction_confirmations", 0) for r in filtered)
    avg_friction = round(total_friction / len(filtered), 1) if filtered else 0

    print(f"\n── Pawn Savings Summary ({args.window} window) ──")
    print(f"  Tasks:          {len(filtered)}")
    print(f"  Actual spend:   ${total_actual:.4f}")
    print(f"  Net savings:    ${total_savings:.4f} [provisional]")
    print(f"  Total friction: {total_friction} confirmations (avg {avg_friction}/task)")
    print(f"\n  [Pawn cold_multiplier 3.5× = counterfactual 3.0× + friction baked in]")
    print(f"  [Calibration: if friction avg ≠ 3 for 30 days, update multiplier]")


def cmd_task_summary(args):
    records = [r for r in read_log() if r.get("session_id") == args.task_id]
    if not records:
        print(f"No savings records for task {args.task_id}.")
        return
    r = records[-1]
    print(f"""
── Pawn task savings: {r['session_id']} ──
  Actual:    ${r['actual_cost_usd']:.4f}
  Saved:     ${r['session_savings_usd']:.4f} [{COLD_MULTIPLIER}× cold mult., provisional]
  Friction:  {r['friction_confirmations']} confirmations

Structured summary: "Pawn substrate savings this task ({r['session_id']}): ${r['session_savings_usd']:.4f}"
""")


def main():
    parser = argparse.ArgumentParser(description="Pawn task substrate savings tracker (K505)")
    sub = parser.add_subparsers(dest="cmd")

    p_log = sub.add_parser("log", help="Log savings for a Pawn task")
    p_log.add_argument("task_id", help="Pawn task ID or Pawn session label, e.g. P042")
    p_log.add_argument("input_tokens", type=int, help="Total input tokens")
    p_log.add_argument("output_tokens", type=int, help="Total output tokens")
    p_log.add_argument("--friction", type=int, default=0,
                       help="Number of yes/that/do-it confirmations before action")
    p_log.add_argument("--substrate-overhead", type=int, default=0, dest="substrate_overhead",
                       help="Tokens consumed by substrate context injection")
    p_log.add_argument("--injections", type=int, default=0, help="Number of substrate injections")
    p_log.add_argument("--vendor", default="perplexity", help="anthropic | openai | google | perplexity")
    p_log.add_argument("--model", default="sonar-pro", help="Model name")
    p_log.add_argument("--notes", default=None)

    p_sum = sub.add_parser("summary", help="Aggregate Pawn savings summary")
    p_sum.add_argument("--window", default="all", choices=["all", "7d", "30d"])

    p_ts = sub.add_parser("task-summary", help="Savings for a specific Pawn task")
    p_ts.add_argument("task_id")

    args = parser.parse_args()
    if args.cmd == "log":
        cmd_log(args)
    elif args.cmd == "summary":
        cmd_summary(args)
    elif args.cmd == "task-summary":
        cmd_task_summary(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
