"""
K491 — Wheelbarrow Empirical Replication at Scale (Phase E)

Original measurement (K485): 43% keystone-anchor rate on Bishop memory corpus (N=69 Eblets).
K490 measurement: 62.7% on full K487 real-corpus (870,086 tablets).

This module measures the keystone-anchor rate on the FULL K487+K490 Eblet substrate
(currently 133 Eblets post-consolidation), comparing to the K485 single-N=69 baseline.

Three measurements:
  1. Keystone-anchor rate on ALL Eblets (any keystone_anchor listed)
  2. Keystone-anchor rate by Scribe attribution domain
  3. Keystone-anchor rate by Eblet recency bin (cold/medium/recent)

REF Staff discipline: reads eblets.jsonl only; no modifications.
"""

from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from eblets.eblet import EbletStore, EBLET_STORE_PATH
from empirical_tests.harness import classify_eblet_recency, RESULTS_DIR, save_jsonl


def run(verbose: bool = True) -> dict:
    """Measure keystone-anchor rate on the full Eblet substrate."""
    print("\n" + "="*60, flush=True)
    print("PHASE E — WHEELBARROW EMPIRICAL REPLICATION AT SCALE", flush=True)
    print("="*60, flush=True)

    store = EbletStore(EBLET_STORE_PATH)
    eblets = store.load_all()
    n_total = len(eblets)
    print(f"Loaded {n_total} Eblets from {EBLET_STORE_PATH}", flush=True)

    # --- Measurement 1: Overall keystone-anchor rate ---
    with_keystone = [eb for eb in eblets if eb.keystone_anchors]
    n_with_keystone = len(with_keystone)
    keystone_rate = n_with_keystone / n_total if n_total > 0 else 0.0

    print(f"\n[Wheelbarrow] N={n_total} Eblets", flush=True)
    print(f"[Wheelbarrow] With keystone anchor: {n_with_keystone} ({keystone_rate*100:.1f}%)", flush=True)

    # --- Measurement 2: Keystone anchor distribution ---
    anchor_counts: Counter = Counter()
    for eb in eblets:
        for anchor in eb.keystone_anchors:
            anchor_counts[anchor] += 1

    top_anchors = anchor_counts.most_common(10)
    print(f"\n[Wheelbarrow] Top 10 keystone anchors:", flush=True)
    for anchor, count in top_anchors:
        print(f"  {anchor}: {count} Eblets ({count/n_total*100:.1f}%)", flush=True)

    # --- Measurement 3: Rate by Scribe attribution ---
    scribe_total: Counter = Counter()
    scribe_anchored: Counter = Counter()
    for eb in eblets:
        for scribe in eb.scribe_attributions:
            scribe_total[scribe] += 1
            if eb.keystone_anchors:
                scribe_anchored[scribe] += 1

    scribe_rates = {
        scribe: {
            "n": scribe_total[scribe],
            "n_anchored": scribe_anchored[scribe],
            "rate": round(scribe_anchored[scribe] / scribe_total[scribe], 4) if scribe_total[scribe] > 0 else 0.0,
        }
        for scribe in sorted(scribe_total.keys())
    }

    # --- Measurement 4: Rate by recency bin ---
    recency_total: Counter = Counter()
    recency_anchored: Counter = Counter()
    for eb in eblets:
        rec = classify_eblet_recency(eb)
        recency_total[rec] += 1
        if eb.keystone_anchors:
            recency_anchored[rec] += 1

    recency_rates = {
        bin_name: {
            "n": recency_total[bin_name],
            "n_anchored": recency_anchored[bin_name],
            "rate": round(recency_anchored[bin_name] / recency_total[bin_name], 4)
            if recency_total[bin_name] > 0 else 0.0,
        }
        for bin_name in ["cold", "medium", "recent"]
    }

    print(f"\n[Wheelbarrow] Rate by recency bin:", flush=True)
    for bin_name, stats in recency_rates.items():
        print(f"  {bin_name}: {stats['n_anchored']}/{stats['n']} ({stats['rate']*100:.1f}%)", flush=True)

    # --- Comparison to baselines ---
    k485_rate = 0.43   # K485 measurement on N=69 bishop corpus
    k490_rate = 0.627  # K490 measurement on N=870,086 real corpus tablets

    rate_vs_k485 = keystone_rate - k485_rate
    rate_vs_k490 = keystone_rate - k490_rate

    print(f"\n[Wheelbarrow] K485 baseline: {k485_rate*100:.1f}%", flush=True)
    print(f"[Wheelbarrow] K490 baseline: {k490_rate*100:.1f}%", flush=True)
    print(f"[Wheelbarrow] Current Eblet rate: {keystone_rate*100:.1f}% (vs K485: {rate_vs_k485*100:+.1f}pp, vs K490: {rate_vs_k490*100:+.1f}pp)", flush=True)

    # Verdict
    # The Wheelbarrow Empirical measures if keystones generalize beyond bishop sessions.
    # K491 measures the rate on the session-reasoning Eblet store (K475-K490).
    result = {
        "measurement": "Wheelbarrow Empirical Replication at Scale",
        "session": "K491",
        "n_eblets_total": n_total,
        "n_with_keystone_anchor": n_with_keystone,
        "keystone_anchor_rate": round(keystone_rate, 4),
        "k485_baseline_rate": k485_rate,
        "k490_at_scale_rate": k490_rate,
        "delta_vs_k485": round(rate_vs_k485, 4),
        "delta_vs_k490": round(rate_vs_k490, 4),
        "top_10_anchors": dict(top_anchors),
        "scribe_attribution_rates": scribe_rates,
        "recency_bin_rates": recency_rates,
        "comparable_measurement": abs(keystone_rate - k490_rate) <= 0.15,
        "verdict_note": (
            f"K491 Eblet substrate: {keystone_rate*100:.1f}% keystone-anchor rate at N={n_total} Eblets. "
            f"K485 bishop-corpus baseline was {k485_rate*100:.0f}% (N=69). "
            f"K490 real-corpus baseline was {k490_rate*100:.1f}% (N=870,086 tablets). "
            f"The rate {'is within 15pp of K490 baseline (comparable)' if abs(keystone_rate - k490_rate) <= 0.15 else 'diverges from K490 baseline by >15pp — likely due to different corpus type (Eblets index session-reasoning, not full document corpus)'}."
        ),
        "note_corpus_difference": (
            "K491 measures keystone-anchor rate on SESSION-REASONING Eblets (abstractions "
            "of architectural decisions). K490 measured on RAW BEDROCK TABLETS (document fragments). "
            "The comparison is valid but the populations are different: session-reasoning Eblets "
            "are expected to have HIGHER keystone rates (they abstract the most notable insights)."
        ),
        "run_at": datetime.now(timezone.utc).isoformat(),
    }

    save_jsonl([result], "wheelbarrow_replication.jsonl")

    print("\n" + "="*60, flush=True)
    print(f"WHEELBARROW REPLICATION: {keystone_rate*100:.1f}% keystone-anchor rate", flush=True)
    print(f"  vs K485: {rate_vs_k485*100:+.1f}pp | vs K490: {rate_vs_k490*100:+.1f}pp", flush=True)
    print(f"  Comparable to K490: {result['comparable_measurement']}", flush=True)
    print("="*60, flush=True)

    return result


if __name__ == "__main__":
    result = run(verbose=True)
    print(json.dumps(result, indent=2))
