"""
Level-2 Synergy Receipt Collector — KN019
Emits L2 synergy receipts per primitive pair.

L2 synergy delta = Combined(A+B) - Σ Individual(A, B)
Positive synergy: primitives compose better than independently.

Composes with L1 receipts as ingredient inputs.
Toolsmith log: TS-CATHEDRAL-CROSS-VENDOR-BENCHMARK-REFRESH-KN019-BP002
"""

from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

_HERE = Path(__file__).parent
_RECEIPTS_DIR = _HERE / "receipts"

# Six canonical L2 primitive pairs (K535-class)
L2_PAIRS: List[Tuple[str, str]] = [
    ("cathedral_effect", "wrasse_scribe"),
    ("cathedral_effect", "pheromone_substrate"),
    ("cathedral_effect", "detective_search"),
    ("cathedral_effect", "bridle_edict_propagation"),
    ("wrasse_scribe", "pheromone_substrate"),
    ("wrasse_scribe", "detective_search"),
]


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _chronos_sign(record: Dict[str, Any]) -> str:
    payload = json.dumps(record, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:24]


def build_l2_receipt(
    primitive_a: str,
    primitive_b: str,
    vendor: str,
    model: str,
    baseline_hot_pct: float,
    individual_a_hot_pct: float,
    individual_b_hot_pct: float,
    combined_hot_pct: float,
    corpus_size: int,
    receipts_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """
    Build and persist a Level-2 synergy receipt.

    synergy_delta = combined - (individual_a + individual_b - baseline)
    Positive synergy_delta means composition is super-additive.
    """
    sum_individual = (individual_a_hot_pct - baseline_hot_pct) + (individual_b_hot_pct - baseline_hot_pct)
    combined_lift = combined_hot_pct - baseline_hot_pct
    synergy_delta = round(combined_lift - sum_individual, 2)

    receipt = {
        "type": "l2_synergy_receipt",
        "primitive_a": primitive_a,
        "primitive_b": primitive_b,
        "pair_id": f"{primitive_a}+{primitive_b}",
        "vendor": vendor,
        "model": model,
        "metric": "hot_pct",
        "baseline_hot_pct": baseline_hot_pct,
        "individual_a_hot_pct": individual_a_hot_pct,
        "individual_b_hot_pct": individual_b_hot_pct,
        "combined_hot_pct": combined_hot_pct,
        "synergy_delta_pp": synergy_delta,
        "super_additive": synergy_delta > 0,
        "corpus_size": corpus_size,
        "stub_mode": True,
        "recorded_at": _iso_now(),
    }
    receipt["chronos_hash"] = _chronos_sign(receipt)

    rdir = receipts_dir or _RECEIPTS_DIR
    rdir.mkdir(parents=True, exist_ok=True)
    fname = f"l2_{primitive_a}_{primitive_b}_{vendor}_{model.replace('-', '_')}.json"
    (rdir / fname).write_text(json.dumps(receipt, indent=2), encoding="utf-8")

    return receipt


def collect_all_l2_receipts(
    vendor: str = "anthropic",
    model: str = "claude-sonnet-4-6",
    baseline_hot_pct: float = 14.0,
    corpus_size: int = 9,
    receipts_dir: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    """
    Collect L2 synergy receipts for all 6 canonical primitive pairs.
    Returns list of L2 receipt dicts.
    """
    receipts = []
    individual_baselines = {
        "cathedral_effect": 53.5,
        "wrasse_scribe": 19.0,
        "pheromone_substrate": 18.5,
        "detective_search": 21.0,
        "bridle_edict_propagation": 16.0,
    }

    for prim_a, prim_b in L2_PAIRS:
        ind_a = individual_baselines.get(prim_a, 18.0)
        ind_b = individual_baselines.get(prim_b, 18.0)
        # Stub combined: superadditive by ~3pp
        combined = ind_a + (ind_b - baseline_hot_pct) + 3.0

        receipt = build_l2_receipt(
            primitive_a=prim_a,
            primitive_b=prim_b,
            vendor=vendor,
            model=model,
            baseline_hot_pct=baseline_hot_pct,
            individual_a_hot_pct=ind_a,
            individual_b_hot_pct=ind_b,
            combined_hot_pct=round(combined, 1),
            corpus_size=corpus_size,
            receipts_dir=receipts_dir,
        )
        receipts.append(receipt)

    return receipts


def query_l2_by_pair(
    primitive_a: str,
    primitive_b: str,
    receipts_dir: Optional[Path] = None,
) -> List[Dict[str, Any]]:
    """Return all L2 receipts matching a given primitive pair."""
    rdir = receipts_dir or _RECEIPTS_DIR
    if not rdir.exists():
        return []
    results = []
    for pattern in [f"l2_{primitive_a}_{primitive_b}_*.json", f"l2_{primitive_b}_{primitive_a}_*.json"]:
        for f in rdir.glob(pattern):
            try:
                results.append(json.loads(f.read_text(encoding="utf-8")))
            except Exception:
                pass
    return results
