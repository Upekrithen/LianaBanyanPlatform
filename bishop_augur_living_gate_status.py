#!/usr/bin/env python3
"""
bishop_augur_living_gate_status.py — Founder-callable Augur Living Gate debug script.

Usage:
  python bishop_augur_living_gate_status.py [--agent bishop|knight|pawn] [--all]

Prints:
  gate_state            : open | fire
  agent                 : bishop | knight | pawn
  last_consult_ts       : Unix float (or "none")
  last_consult_iso      : ISO-8601 string
  age_since_consult     : human-readable (e.g. "4h 22m 11s")
  last_pheromone_write  : ISO-8601 string (or "unavailable")
  pheromone_readable    : True | False
  hard_ceiling_remaining: human-readable time remaining before hard ceiling
  ttl_fallback_seconds  : fallback TTL in effect when Pheromone unavailable

KN038 / BP004, 2026-04-30
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Add workspace root to path so discipline_wing is importable
_ROOT = Path(__file__).parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from discipline_wing.augur_living_gate import gate_status, AGENT_NAMES


def _human_seconds(s: float | None) -> str:
    if s is None:
        return "n/a"
    if s == float("inf"):
        return "∞ (no consult on record)"
    s = abs(s)
    hours = int(s // 3600)
    minutes = int((s % 3600) // 60)
    secs = int(s % 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")
    return " ".join(parts)


def _print_status(agent: str) -> None:
    status = gate_status(agent)
    gate = status["gate_state"].upper()
    gate_display = f"{'✅ OPEN' if gate == 'OPEN' else '🔴 FIRE'} ({gate})"

    print(f"\n{'═' * 60}")
    print(f"  Augur Living Gate Status — agent: {agent}")
    print(f"{'═' * 60}")
    print(f"  gate_state              : {gate_display}")
    print(f"  last_consult_iso        : {status.get('last_consult_iso') or 'none (no consult on record)'}")
    print(f"  age_since_consult       : {_human_seconds(status.get('age_since_consult_s'))}")
    print(f"  last_pheromone_write    : {status.get('last_pheromone_write_iso') or 'unavailable'}")
    print(f"  pheromone_readable      : {status.get('pheromone_readable')}")
    print(f"  hard_ceiling_remaining  : {_human_seconds(status.get('hard_ceiling_seconds_remaining'))}")
    print(f"  hard_ceiling_seconds    : {status.get('hard_ceiling_seconds')} ({status.get('hard_ceiling_seconds', 0)//3600}h)")
    print(f"  ttl_fallback_seconds    : {status.get('ttl_fallback_seconds')} (active only when Pheromone unavailable)")
    print()

    if gate == "FIRE":
        print("  ⚠  Gate is FIRING — re-consult Librarian before writing gated artifacts.")
        print("     Run: mcp__librarian__brief_me({task: '<scope>'})")
    else:
        print("  ✓  Gate is OPEN — consult is fresh against the substrate.")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Augur Living Gate — real-time gate state for all agents"
    )
    parser.add_argument(
        "--agent",
        default="bishop",
        choices=list(AGENT_NAMES) + ["all"],
        help="Agent to query (default: bishop). Use 'all' for all three agents.",
    )
    parser.add_argument(
        "--all",
        dest="all_agents",
        action="store_true",
        help="Print status for all agents (bishop, knight, pawn)",
    )
    parser.add_argument(
        "--json",
        dest="as_json",
        action="store_true",
        help="Output raw JSON instead of formatted display",
    )
    args = parser.parse_args()

    agents = list(AGENT_NAMES) if (args.all_agents or args.agent == "all") else [args.agent]

    if args.as_json:
        result = {agent: gate_status(agent) for agent in agents}
        print(json.dumps(result, indent=2, default=str))
        return

    print("\nAugur Living Gate — KN038 / #2314 Prov 16 (Founder-ratified BP004 turn 14)")
    print("The gate watches the substrate, not the clock.")

    for agent in agents:
        _print_status(agent)


if __name__ == "__main__":
    main()
