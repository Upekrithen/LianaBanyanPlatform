"""
Chandelier Full Query — KN032 / A&A #2291 / Anjin Phase 3 Acceptance #7

Receipt query API for the fully-populated Bedrock Foundation Chandelier.

Public interface:
  query_l1(primitive_id)            → list[dict]  (all L1 receipts for primitive)
  query_l2(primitive_a, primitive_b) → list[dict]  (all L2 receipts for the pair)
  query_coverage()                  → CoverageReport
  chandelier_status()               → "OPERATIONAL" | "PARTIAL" | "OFFLINE"

Three-mode comparator extension (D.5):
  compare_modes(primitive_id, modes=["Basic","Modified","Full Stack"])

Toolsmith log: TS-MAKE-CHANDELIER-FULL-DEPLOYMENT-KN032-BP003
"""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

_HERE = Path(__file__).parent
_STITCH_DIR = _HERE.parent
if str(_STITCH_DIR) not in sys.path:
    sys.path.insert(0, str(_STITCH_DIR))

from chandelier.chronos_chandelier_bridge import build_index, verify_receipt, ReceiptIndex

# ── Coverage gate constants ───────────────────────────────────────────────────

L1_COVERAGE_TARGET = 18       # minimum L1 receipts required for OPERATIONAL
L2_COVERAGE_TARGET = 10       # minimum L2 receipts required for OPERATIONAL

# The full canon set of substrate primitives for L1 coverage check
CANON_PRIMITIVES = [
    "cathedral_effect",
    "wrasse_scribe",
    "detective",
    "pheromone_substrate",
    "stone_tablet_imperative",
    "bridle_rules",
    "reproducibility_pack",
    "eblet_system",
    "timewave_security",
    "pre_reg_protocol",
    "rd_battery",
    "sweeper_scribe",
    "scavenger_scribe",
    "herder_scribe",
    "checkbook_suite",
    "stenographer_scribe",
    "shutterbug_scribe",
    "accountant_scribe",
    "lighthouse",
    "vine_transfer",
    "pawn_via_api",
    "augur_stack",
    "chronos_chronicler",
]


# ── Coverage report ───────────────────────────────────────────────────────────

@dataclass
class CoverageReport:
    total_l1: int
    total_l2: int
    total_receipts: int
    primitives_covered: List[str]
    primitives_missing: List[str]
    l1_meets_target: bool
    l2_meets_target: bool
    status: str  # "OPERATIONAL" | "PARTIAL" | "OFFLINE"

    def as_dict(self) -> Dict[str, Any]:
        return {
            "total_l1": self.total_l1,
            "total_l2": self.total_l2,
            "total_receipts": self.total_receipts,
            "primitives_covered": self.primitives_covered,
            "primitives_missing": self.primitives_missing,
            "l1_meets_target": self.l1_meets_target,
            "l2_meets_target": self.l2_meets_target,
            "status": self.status,
        }


# ── Query API ─────────────────────────────────────────────────────────────────

def query_l1(
    primitive_id: str,
    index: Optional[ReceiptIndex] = None,
    verify: bool = False,
) -> List[Dict[str, Any]]:
    """
    Return all L1 receipts for the given primitive_id.

    Parameters
    ----------
    primitive_id : canonical primitive identifier (e.g. "cathedral_effect")
    index        : optional pre-built ReceiptIndex; builds fresh if None
    verify       : if True, filters to only Chronos-verified receipts

    Returns
    -------
    List of signed L1 receipt dicts, chronological order.
    """
    idx = index or build_index()
    results = idx.query(primitive_ids=[primitive_id])
    # Filter to L1 only
    results = [r for r in results if r.get("receipt_class") == "L1"]
    if verify:
        results = [r for r in results if verify_receipt(r)]
    return results


def query_l2(
    primitive_a: str,
    primitive_b: str,
    index: Optional[ReceiptIndex] = None,
    verify: bool = False,
) -> List[Dict[str, Any]]:
    """
    Return all L2 receipts for the given primitive pair.

    Parameters
    ----------
    primitive_a, primitive_b : primitives forming the synergy pair (order-independent)
    index                    : optional pre-built ReceiptIndex
    verify                   : if True, filters to Chronos-verified only

    Returns
    -------
    List of signed L2 receipt dicts, chronological order.
    """
    idx = index or build_index()
    results = idx.query(primitive_ids=[primitive_a, primitive_b])
    results = [r for r in results if r.get("receipt_class") == "L2"]
    if verify:
        results = [r for r in results if verify_receipt(r)]
    return results


def query_coverage(
    index: Optional[ReceiptIndex] = None,
    canon_primitives: Optional[List[str]] = None,
) -> CoverageReport:
    """
    Compute coverage report: how many L1 + L2 receipts exist,
    which primitives are covered, which are missing.
    """
    idx = index or build_index()
    canon = canon_primitives or CANON_PRIMITIVES

    all_receipts = idx.all_receipts()
    l1_receipts = [r for r in all_receipts if r.get("receipt_class") == "L1"]
    l2_receipts = [r for r in all_receipts if r.get("receipt_class") == "L2"]

    # Which primitives have at least one L1 receipt?
    covered: set = set()
    for r in l1_receipts:
        pids = r.get("primitive_ids", [])
        if len(pids) == 1:
            covered.add(pids[0])

    primitives_covered = sorted(p for p in canon if p in covered)
    primitives_missing = sorted(p for p in canon if p not in covered)

    total_l1 = len(l1_receipts)
    total_l2 = len(l2_receipts)
    total_receipts = idx.total_receipts()

    l1_ok = total_l1 >= L1_COVERAGE_TARGET
    l2_ok = total_l2 >= L2_COVERAGE_TARGET

    if l1_ok and l2_ok:
        status = "OPERATIONAL"
    elif total_l1 > 0 or total_l2 > 0:
        status = "PARTIAL"
    else:
        status = "OFFLINE"

    return CoverageReport(
        total_l1=total_l1,
        total_l2=total_l2,
        total_receipts=total_receipts,
        primitives_covered=primitives_covered,
        primitives_missing=primitives_missing,
        l1_meets_target=l1_ok,
        l2_meets_target=l2_ok,
        status=status,
    )


def chandelier_status(index: Optional[ReceiptIndex] = None) -> str:
    """
    Quick status check. Returns 'OPERATIONAL', 'PARTIAL', or 'OFFLINE'.
    """
    report = query_coverage(index=index)
    return report.status


# ── Three-mode comparator extension (D.5) ────────────────────────────────────

_MODE_FILTERS = {
    "Basic": ["cathedral_effect", "wrasse_scribe", "detective"],
    "Modified": [
        "cathedral_effect", "wrasse_scribe", "detective",
        "pheromone_substrate", "eblet_system", "bridle_rules",
        "reproducibility_pack",
    ],
    "Full Stack": CANON_PRIMITIVES,
}


def compare_modes(
    primitive_id: str,
    modes: Optional[List[str]] = None,
    index: Optional[ReceiptIndex] = None,
) -> Dict[str, Any]:
    """
    Three-mode comparator: return the most-recent L1 receipt for a primitive
    under Basic / Modified / Full Stack mode filters.

    In Basic mode, only returns the receipt if the primitive is in the Basic set.
    In Modified, Basic+Modified set; Full Stack, all primitives.

    This extends the KN010 three-mode comparator for L1 receipt lookup.

    Parameters
    ----------
    primitive_id : primitive to look up
    modes        : subset of ["Basic", "Modified", "Full Stack"]; default all three
    index        : optional pre-built ReceiptIndex

    Returns
    -------
    dict mapping mode_name → receipt | None
    """
    active_modes = modes or list(_MODE_FILTERS.keys())
    idx = index or build_index()
    result: Dict[str, Any] = {}

    l1_receipts = query_l1(primitive_id, index=idx)
    latest = l1_receipts[-1] if l1_receipts else None

    for mode in active_modes:
        allowed = _MODE_FILTERS.get(mode, CANON_PRIMITIVES)
        if primitive_id in allowed:
            result[mode] = latest
        else:
            result[mode] = None

    return result


# ── Convenience print ─────────────────────────────────────────────────────────

def print_coverage_report(index: Optional[ReceiptIndex] = None) -> None:
    """Print a human-readable coverage report."""
    report = query_coverage(index=index)
    print(f"\n{'='*60}")
    print(f" BEDROCK FOUNDATION CHANDELIER — STATUS: {report.status}")
    print(f"{'='*60}")
    ok1 = "OK" if report.l1_meets_target else "!!"
    ok2 = "OK" if report.l2_meets_target else "!!"
    print(f" L1 receipts : {report.total_l1:>3}  (target: >={L1_COVERAGE_TARGET}) [{ok1}]")
    print(f" L2 receipts : {report.total_l2:>3}  (target: >={L2_COVERAGE_TARGET}) [{ok2}]")
    print(f" Total       : {report.total_receipts:>3}")
    print(f"\n Primitives covered ({len(report.primitives_covered)}/{len(CANON_PRIMITIVES)}):")
    for p in report.primitives_covered:
        print(f"   [v]  {p}")
    if report.primitives_missing:
        print(f"\n Primitives missing ({len(report.primitives_missing)}):")
        for p in report.primitives_missing:
            print(f"   [x]  {p}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    print_coverage_report()
