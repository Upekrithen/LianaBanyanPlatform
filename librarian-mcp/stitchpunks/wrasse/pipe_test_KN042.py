"""
KN042 Pipe-Test — Wrasse Registry CANON Eblet Expansion
Verify >=3 of the 8 new KN042 entries (W-313..W-320) trigger on a BP005 session context.

Run: python pipe_test_KN042.py
"""

from __future__ import annotations
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from wrasse_lookup import lookup_for_session  # type: ignore

# ── BP005 representative session context ─────────────────────────────────────
# Contains canonical terms from all 8 new entries.
# Simulates a KNIGHT session where the user references BP005 canon primitives.
BP005_CONTEXT = """
Session KN042 BP005. Working on Ring of Three golden eblet expansion.
Founder ratified the golden eblet architecture (Ring of Three: canon / platform rules / project rules).
Each golden eblet is a deck card medallion with Emblem and QR code.
The furnace federation verifies IP Ledger entries on scan.
Multi-layer authority: L1 LB Corp through L_n, each successive layer of authority gets its own Ring.
Social-authority DAG: Guilds, Tribes, Families decide for themselves how to choose, whom to choose.
Decisions are pheromone-anchored to the golden tablet, NOT directly edited.
Skipping Stones navigation: At a Glance (skipping stones) / More Details (wading) / In Depth (diving in).
Pudding tier = proof in the pudding.
AI tuning: aviator symphony. A good aviator feels the machine as extension of self, capability granted.
Hugo parallel double running until Launch Moment; supabase authority is source of truth for Cephas.
EBLET_PATH class seed: state/eblets/CANON. CANON/GOLDEN ring of three.
"""

KN042_IDS = {"W-313", "W-314", "W-315", "W-316", "W-317", "W-318", "W-319", "W-320"}

def main() -> int:
    results = lookup_for_session(BP005_CONTEXT, max_matches=50)

    kn042_hits = [r for r in results if r["trigger_id"] in KN042_IDS]
    other_hits = [r for r in results if r["trigger_id"] not in KN042_IDS]

    print(f"PIPE-TEST KN042: {len(kn042_hits)}/8 new entries triggered")
    print()
    for h in kn042_hits:
        res_preview = h["canonical_resolution"][:120].replace("\n", " ")
        print(f"  [{h['trigger_id']}] {h['trigger_pattern']!r}")
        print(f"    resolution preview: {res_preview}...")
        print()

    missed = KN042_IDS - {h["trigger_id"] for h in kn042_hits}
    if missed:
        print(f"  NOT TRIGGERED: {sorted(missed)}")
        print()

    print(f"  Collateral pre-existing entries also fired: {len(other_hits)}")
    print()

    if len(kn042_hits) >= 3:
        print("PIPE-TEST PASS: >=3 triggers fire -- substrate-routed memory expansion receipt confirmed.")
        return 0
    else:
        print(f"PIPE-TEST FAIL: only {len(kn042_hits)} triggers fired (need >=3).")
        return 1


if __name__ == "__main__":
    sys.exit(main())
