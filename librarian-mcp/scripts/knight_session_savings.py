"""
KNIGHT SESSION SAVINGS — Phase B, K505
=======================================
Tracks substrate-savings for a Knight (Cursor) session.

Usage:
  python knight_session_savings.py log <session_id> <input_tokens> <output_tokens>
       [--substrate-overhead N] [--injections N] [--model NAME] [--notes TEXT]

  python knight_session_savings.py summary [--window all|7d|30d] [--agent KNIGHT]

  python knight_session_savings.py report <session_id>

The savings math:
  actual_cost         = (input_tokens * $3.00 + output_tokens * $15.00) / 1_000_000
                        [Sonnet 4.6: $3/$15 per 1M; adjust model below if different]
  counterfactual_cost = actual_cost × 2.5  (Knight cold_multiplier, R13-derived, provisional)
  overhead_cost       = substrate_overhead_tokens * $3.00 / 1_000_000
  net_savings         = counterfactual_cost - actual_cost - overhead_cost

Outputs:
  - Appends to librarian-mcp/stitchpunks/data/substrate_savings_log.jsonl
  - On 'report': prints a savings subsection formatted for paste into REPORT_KNIGHT_K###.md

BRIDLE guardrails:
  - Cold multiplier is CONSERVATIVE (2.5× not 3.0×).
  - Provisional flag always true until K-future calibration run lands.
  - Overhead is subtracted, not ignored — honest math per #41 good-name.
"""

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
REPO_ROOT = SCRIPT_DIR.parent
SAVINGS_LOG = REPO_ROOT / "stitchpunks" / "data" / "substrate_savings_log.jsonl"

# ── Pricing (per 1M tokens, USD) ───────────────────────────────────────────────
PRICING = {
    "anthropic": {"claude-sonnet-4-6": (3.00, 15.00), "default": (3.00, 15.00)},
    "openai":    {"default": (2.50, 10.00)},
    "google":    {"default": (1.25,  5.00)},
    "perplexity":{"default": (1.00,  1.00)},
}

COLD_MULTIPLIER = 2.5   # Knight cold multiplier (R13-derived, provisional)
AGENT = "KNIGHT"


def get_pricing(vendor: str, model: str):
    vendor_map = PRICING.get(vendor.lower(), PRICING["anthropic"])
    return vendor_map.get(model, vendor_map["default"])


def compute_savings(input_tokens, output_tokens, substrate_overhead_tokens, vendor, model):
    inp_rate, out_rate = get_pricing(vendor, model)
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
    if not raw:
        return []
    return [json.loads(l) for l in raw.split("\n") if l.strip()]


def cmd_log(args):
    actual, counterfactual, net = compute_savings(
        args.input_tokens, args.output_tokens, args.substrate_overhead,
        args.vendor, args.model
    )
    record = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "agent": AGENT,
        "session_id": args.session_id,
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
        "friction_confirmations": 0,
        "multiplier_provisional": True,
        "notes": args.notes or None,
    }
    n = append_record(record)
    print(f"""
── Knight Substrate Savings Logged ({args.session_id}) ──
  Tokens:         {args.input_tokens:,} in / {args.output_tokens:,} out
  Substrate OH:   {args.substrate_overhead:,} tokens, {args.injections} injections
  Actual cost:    ${actual:.4f}
  Counterfactual: ${counterfactual:.4f} ({COLD_MULTIPLIER}× cold mult.)
  Net savings:    ${net:.4f} [provisional]
  Total entries:  {n}
""")


def cmd_summary(args):
    all_records = read_log()
    if not all_records:
        print("No savings records yet.")
        return

    now = datetime.now(timezone.utc).timestamp() * 1000
    window_ms = {"all": float("inf"), "7d": 7*86400000, "30d": 30*86400000}[args.window]
    agent_filter = args.agent.upper() if args.agent else "ALL"

    filtered = [
        r for r in all_records
        if (now - datetime.fromisoformat(r["ts"]).timestamp() * 1000 <= window_ms)
        and (agent_filter == "ALL" or r.get("agent") == agent_filter)
    ]

    by_agent = {}
    for r in filtered:
        ag = r.get("agent", "UNKNOWN")
        by_agent.setdefault(ag, []).append(r)

    print(f"\n── Substrate Savings Summary ({args.window} window, agent={agent_filter}) ──")
    total_savings = sum(r.get("session_savings_usd", 0) for r in filtered)
    total_actual = sum(r.get("actual_cost_usd", 0) for r in filtered)
    total_counter = sum(r.get("counterfactual_cost_usd", 0) for r in filtered)
    print(f"  Sessions:       {len(filtered)}")
    print(f"  Actual spend:   ${total_actual:.4f}")
    print(f"  Counterfactual: ${total_counter:.4f}")
    print(f"  Net savings:    ${total_savings:.4f} [provisional]")
    print()
    for ag, recs in by_agent.items():
        s = sum(r.get("session_savings_usd", 0) for r in recs)
        print(f"  {ag}: {len(recs)} sessions → ${s:.4f} saved")
    print(f"\n  [multipliers provisional — calibration K-future will refine]")
    print(f"  Log: {SAVINGS_LOG}")


def cmd_report(args):
    records = [r for r in read_log() if r.get("session_id") == args.session_id]
    if not records:
        print(f"No savings records found for session {args.session_id}.")
        return
    r = records[-1]  # use the latest entry for this session
    print(f"""
### Substrate Savings (K-Session {r['session_id']})

| Metric | Value |
|---|---|
| Agent | {r['agent']} |
| Model | {r.get('model','—')} @ {r.get('vendor','—')} |
| Input tokens | {r['input_tokens']:,} |
| Output tokens | {r['output_tokens']:,} |
| Substrate overhead | {r['substrate_overhead_tokens']:,} tokens ({r['substrate_injection_count']} injections) |
| Actual session cost | ${r['actual_cost_usd']:.4f} |
| Counterfactual cost | ${r['counterfactual_cost_usd']:.4f} ({r['cold_multiplier']}× cold mult.) |
| **Net savings** | **${r['session_savings_usd']:.4f}** |
| Multipliers provisional | {r['multiplier_provisional']} |

*Cold multipliers (Knight {COLD_MULTIPLIER}×) are evidence-informed estimates from R13 empirical baseline.*
*Calibration runs every 30 days per K505 Phase E plan.*
""")


def main():
    parser = argparse.ArgumentParser(description="Knight session substrate savings tracker (K505)")
    sub = parser.add_subparsers(dest="cmd")

    p_log = sub.add_parser("log", help="Log savings for a Knight session")
    p_log.add_argument("session_id", help="K-session ID, e.g. K505")
    p_log.add_argument("input_tokens", type=int, help="Total input tokens")
    p_log.add_argument("output_tokens", type=int, help="Total output tokens")
    p_log.add_argument("--substrate-overhead", type=int, default=0, dest="substrate_overhead",
                       help="Tokens consumed by Librarian/substrate injections")
    p_log.add_argument("--injections", type=int, default=0, help="Number of substrate injections")
    p_log.add_argument("--vendor", default="anthropic", help="anthropic | openai | google | perplexity")
    p_log.add_argument("--model", default="claude-sonnet-4-6", help="Model name")
    p_log.add_argument("--notes", default=None, help="Optional session notes")

    p_sum = sub.add_parser("summary", help="Print aggregate savings summary")
    p_sum.add_argument("--window", default="all", choices=["all", "7d", "30d"])
    p_sum.add_argument("--agent", default="ALL", help="BISHOP | KNIGHT | PAWN | ROOK | ALL")

    p_rep = sub.add_parser("report", help="Print savings subsection for a session report")
    p_rep.add_argument("session_id", help="K-session ID, e.g. K505")

    args = parser.parse_args()
    if args.cmd == "log":
        cmd_log(args)
    elif args.cmd == "summary":
        cmd_summary(args)
    elif args.cmd == "report":
        cmd_report(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
