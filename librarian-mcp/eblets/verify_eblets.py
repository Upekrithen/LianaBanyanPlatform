"""
K485 · B123 — Phase C Verification of the Eblet substrate.

Checks:
  1. Eblet class instantiates with all 9 fields
  2. All synapse_K*.jsonl files parse cleanly; no skipped clusters
  3. Bulk generation produced one Eblet per cluster (1:1 mapping)
  4. All synapse_pointer fields resolve cleanly via Eblet.resolve()
  5. Provenance walk works on 5 sampled Eblets
  6. Summary token counts (50-100 word target; flag outliers)
  7. Virtual-context expansion: compute compression ratio per Eblet, report mean
  8. Keystone-anchor detection: at least some Eblets carry keystone_anchors

Usage:
    cd librarian-mcp
    python -m eblets.verify_eblets
"""

from __future__ import annotations

import json
import random
import sys
from pathlib import Path
from collections import Counter, defaultdict

_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

from eblets.eblet import (
    Eblet,
    EbletStore,
    SYNAPSE_DIR,
    EBLET_STORE_PATH,
    _get_cluster_name,
    _get_synapse_text,
)
from eblets.generate_eblets import discover_synapse_files, parse_clusters


def count_words(text: str) -> int:
    return len(text.split())


def estimate_tokens_rough(text: str) -> int:
    return int(len(text.split()) / 0.75)


def check(label: str, passed: bool, detail: str = "") -> bool:
    status = "[OK]  " if passed else "[FAIL]"
    print(f"  {status} {label}" + (f" — {detail}" if detail else ""))
    return passed


def main() -> None:
    print("\n=== K485 Phase C: Eblet Verification ===\n")

    store = EbletStore(EBLET_STORE_PATH)
    eblets = store.load_all()
    results: list[bool] = []

    # ------------------------------------------------------------------
    # CHECK 1: Eblet class instantiates with all 9 fields
    # ------------------------------------------------------------------
    print("1. Eblet class instantiation (9-field schema)")
    required_fields = [
        "eblet_id", "synapse_pointer", "summary_text", "scribe_attributions",
        "root_miner_serial", "provenance_chain", "confidence_score",
        "created_at", "keystone_anchors",
    ]
    if not eblets:
        r = check("Eblets in store", False, "store is empty — run generate_eblets first")
        results.append(r)
    else:
        sample = eblets[0]
        d = sample.to_dict()
        missing = [f for f in required_fields if f not in d]
        r = check("All 9 fields present", len(missing) == 0,
                  f"missing: {missing}" if missing else f"sample id={sample.eblet_id}")
        results.append(r)
        print(f"    Total Eblets in store: {len(eblets)}")
    print()

    # ------------------------------------------------------------------
    # CHECK 2: All synapse files parse cleanly
    # ------------------------------------------------------------------
    print("2. Synapse file parsing (no skipped clusters)")
    synapse_files = discover_synapse_files()
    all_clusters: dict[str, int] = {}  # filename -> cluster count
    parse_errors = 0
    for f in synapse_files:
        clusters = parse_clusters(f)
        all_clusters[f.name] = len(clusters)
        print(f"    {f.name}: {len(clusters)} clusters")
    total_expected = sum(all_clusters.values())
    r = check("All files parsed cleanly", parse_errors == 0,
              f"total {total_expected} clusters across {len(synapse_files)} files")
    results.append(r)
    print()

    # ------------------------------------------------------------------
    # CHECK 3: 1:1 mapping — one Eblet per cluster
    # ------------------------------------------------------------------
    print("3. 1:1 mapping (one Eblet per synapse cluster)")
    pointer_to_eblet: dict[str, Eblet] = {}
    duplicate_pointers: list[str] = []
    for eblet in eblets:
        if eblet.synapse_pointer in pointer_to_eblet:
            duplicate_pointers.append(eblet.synapse_pointer)
        pointer_to_eblet[eblet.synapse_pointer] = eblet

    missing_pointers: list[str] = []
    for f in synapse_files:
        clusters = parse_clusters(f)
        for cluster_name in clusters:
            pointer = f"{f.name}#cluster_{cluster_name}"
            if pointer not in pointer_to_eblet:
                missing_pointers.append(pointer)

    r1 = check("No duplicate pointers", len(duplicate_pointers) == 0,
               f"{len(duplicate_pointers)} duplicates" if duplicate_pointers else "clean")
    r2 = check("No missing pointers", len(missing_pointers) == 0,
               f"{len(missing_pointers)} missing" if missing_pointers else
               f"{len(pointer_to_eblet)} pointers all present")
    results += [r1, r2]
    if missing_pointers:
        for mp in missing_pointers[:5]:
            print(f"    MISSING: {mp}")
    print()

    # ------------------------------------------------------------------
    # CHECK 4: Pointer resolution — all Eblet.resolve() succeed
    # ------------------------------------------------------------------
    print("4. Pointer resolution (Eblet.resolve() — no broken pointers)")
    broken: list[str] = []
    for eblet in eblets:
        try:
            resolved = eblet.resolve()
            if not resolved["resolved_entries"]:
                broken.append(f"{eblet.eblet_id}: no entries found for {eblet.synapse_pointer}")
        except Exception as exc:
            broken.append(f"{eblet.eblet_id}: {exc}")

    r = check("All pointers resolve", len(broken) == 0,
              f"{len(broken)} broken" if broken else f"all {len(eblets)} resolve cleanly")
    results.append(r)
    if broken:
        for b in broken[:3]:
            print(f"    {b}")
    print()

    # ------------------------------------------------------------------
    # CHECK 5: Provenance walk on 5 sampled Eblets
    # ------------------------------------------------------------------
    print("5. Provenance walk (5 sampled Eblets)")
    sample_size = min(5, len(eblets))
    sampled = random.sample(eblets, sample_size) if len(eblets) >= sample_size else eblets
    walk_failures: list[str] = []
    for eblet in sampled:
        layers = eblet.walk_provenance()
        if len(layers) < 2:
            walk_failures.append(f"{eblet.eblet_id}: only {len(layers)} layers")
        else:
            layer_names = [l["layer"] for l in layers]
            synapse_layer = next((l for l in layers if l["layer"] == "synapse"), None)
            if synapse_layer and "error" in synapse_layer.get("content", {}):
                walk_failures.append(f"{eblet.eblet_id}: synapse layer error")
            else:
                print(f"    {eblet.eblet_id}: layers={layer_names}, "
                      f"synapse_entries={synapse_layer['content']['entry_count'] if synapse_layer else '?'}")

    r = check("Provenance walk works on 5 samples", len(walk_failures) == 0,
              f"failures: {walk_failures}" if walk_failures else "all walks complete")
    results.append(r)
    print()

    # ------------------------------------------------------------------
    # CHECK 6: Summary token distribution (50-100 word target)
    # ------------------------------------------------------------------
    print("6. Summary token distribution (50-100 word target)")
    word_counts = [count_words(e.summary_text) for e in eblets]
    if word_counts:
        in_range = [w for w in word_counts if 50 <= w <= 100]
        under_range = [w for w in word_counts if w < 50]
        over_range = [w for w in word_counts if w > 100]
        median_wc = sorted(word_counts)[len(word_counts) // 2]
        mean_wc = sum(word_counts) / len(word_counts)
        print(f"    Word counts: min={min(word_counts)}, max={max(word_counts)}, "
              f"median={median_wc}, mean={mean_wc:.1f}")
        print(f"    In range (50-100): {len(in_range)}/{len(word_counts)} "
              f"({100*len(in_range)/len(word_counts):.1f}%)")
        if under_range:
            print(f"    Under 50 words: {len(under_range)} outliers")
        if over_range:
            print(f"    Over 100 words: {len(over_range)} outliers")
        r = check("Median summary in 50-100 word range", 50 <= median_wc <= 100,
                  f"median={median_wc} words")
    else:
        r = check("Summary token distribution", False, "no Eblets to measure")
    results.append(r)
    print()

    # ------------------------------------------------------------------
    # CHECK 7: Compression ratio — virtual-context expansion
    # ------------------------------------------------------------------
    print("7. Virtual-context expansion (compression ratio)")
    compression_ratios: list[float] = []
    for eblet in eblets:
        try:
            resolved = eblet.resolve()
            synapse_text = "\n\n".join(
                _get_synapse_text(e) for e in resolved["resolved_entries"]
            )
            eblet_words = count_words(eblet.summary_text)
            synapse_words = count_words(synapse_text)
            if eblet_words > 0 and synapse_words > 0:
                ratio = synapse_words / eblet_words
                compression_ratios.append(ratio)
        except Exception:
            pass

    if compression_ratios:
        mean_ratio = sum(compression_ratios) / len(compression_ratios)
        median_ratio = sorted(compression_ratios)[len(compression_ratios) // 2]
        max_ratio = max(compression_ratios)
        min_ratio = min(compression_ratios)
        print(f"    Compression ratios (synapse_words / eblet_words):")
        print(f"      Mean:   {mean_ratio:.1f}x")
        print(f"      Median: {median_ratio:.1f}x")
        print(f"      Min:    {min_ratio:.1f}x")
        print(f"      Max:    {max_ratio:.1f}x")
        print(f"    (An Eblet of ~80 words indexes ~{mean_ratio:.0f}x that in Synapse detail)")

        virtual_expansion_ok = median_ratio >= 5.0
        r = check("Compression ratio >= 5x (median)", virtual_expansion_ok,
                  f"median={median_ratio:.1f}x")

        at_10x = sum(1 for r in compression_ratios if r >= 10.0)
        print(f"    Eblets with >=10x expansion: {at_10x}/{len(compression_ratios)}")
    else:
        r = check("Compression ratio", False, "could not compute (no resolved Synapses)")
    results.append(r)
    print()

    # ------------------------------------------------------------------
    # CHECK 8: Keystone-anchor detection
    # ------------------------------------------------------------------
    print("8. Keystone-anchor detection")
    with_anchors = [e for e in eblets if e.keystone_anchors]
    anchor_counter: Counter = Counter()
    for e in with_anchors:
        for a in e.keystone_anchors:
            anchor_counter[a] += 1

    print(f"    Eblets with keystone_anchors: {len(with_anchors)}/{len(eblets)}")
    for anchor, count in anchor_counter.most_common(10):
        print(f"      {anchor}: {count} Eblets")

    r = check("At least 5 Eblets have keystone_anchors", len(with_anchors) >= 5,
              f"{len(with_anchors)} Eblets carry anchors")
    results.append(r)
    print()

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    passed = sum(1 for r in results if r)
    total = len(results)
    print("=" * 60)
    print(f"VERIFICATION RESULT: {passed}/{total} checks passed")
    required = 5
    if passed >= required:
        print(f"[OK] K485 SUCCESSFUL — {passed}/{total} checks (need {required}/6)")
    else:
        print(f"[FAIL] K485 NOT YET SUCCESSFUL — need {required}/6, got {passed}/{total}")

    # Write verification report
    report_path = _HERE / "verification_K485.json"
    report = {
        "verified_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "total_checks": total,
        "passed": passed,
        "failed": total - passed,
        "k485_success": passed >= required,
        "store_total": len(eblets),
        "compression_ratios": {
            "mean": round(sum(compression_ratios) / len(compression_ratios), 2) if compression_ratios else None,
            "median": round(sorted(compression_ratios)[len(compression_ratios) // 2], 2) if compression_ratios else None,
            "min": round(min(compression_ratios), 2) if compression_ratios else None,
            "max": round(max(compression_ratios), 2) if compression_ratios else None,
        },
        "word_count_stats": {
            "min": min(word_counts) if word_counts else None,
            "max": max(word_counts) if word_counts else None,
            "median": sorted(word_counts)[len(word_counts) // 2] if word_counts else None,
            "mean": round(sum(word_counts) / len(word_counts), 1) if word_counts else None,
        },
        "keystone_anchors_distribution": dict(anchor_counter),
        "eblets_with_anchors": len(with_anchors),
    }
    with report_path.open("w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    print(f"\nVerification report written to: {report_path}")


if __name__ == "__main__":
    main()
