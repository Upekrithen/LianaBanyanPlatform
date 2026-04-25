"""
K485 · B123 — Bulk Eblet generation from all Synapse JSONL files.

Discovers all synapse_K*.jsonl files in librarian-mcp/stitchpunks/synapses/,
parses each for clusters, and generates one Eblet per cluster using a
Sculptor in Synapse-substrate mode (K485 dual-substrate pattern).

Cost discipline: claude-haiku-4-5 model. Stop if estimated cost > $2.
Output: librarian-mcp/eblets/eblets.jsonl (append-only)

Usage:
    cd librarian-mcp
    python -m eblets.generate_eblets [--dry-run]

    Or with ANTHROPIC_API_KEY in environment.
"""

from __future__ import annotations

import json
import os
import sys
import time
import argparse
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

# Allow running from repo root or librarian-mcp/
_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))  # workspace root
sys.path.insert(0, str(_LIBRARIAN_MCP))          # librarian-mcp

from eblets.eblet import (
    Eblet,
    EbletStore,
    SYNAPSE_DIR,
    EBLET_STORE_PATH,
    _get_cluster_name,
    _get_synapse_text,
)

# Minimal Sculptor instantiation for Synapse-substrate mode only
# (no cathedral profile or demand profile needed for generate_eblet)
from sculptors.sculptor import Sculptor, CathedralProfile, DemandProfile

COST_STOP_THRESHOLD = 2.00  # USD

# Haiku pricing (as of K485; check if changed)
HAIKU_INPUT_COST_PER_M = 0.80    # $0.80 per million input tokens
HAIKU_OUTPUT_COST_PER_M = 4.00   # $4.00 per million output tokens


def _make_sculptor() -> Sculptor:
    """Minimal Sculptor for Synapse-substrate mode (no cathedral config needed)."""
    profile = CathedralProfile(
        cathedral_name="eblet-generator",
        audience_scope="guild",
        scope_classes_allowed=["public", "guild", "private"],
        preferred_sculpt_form="summary",
        min_score=0.0,
    )
    demand = DemandProfile(
        cathedral_name="eblet-generator",
        frequent_topics=[],
        topic_weights={},
        preferred_depth_levels=[1, 2, 3],
    )
    return Sculptor(
        sculptor_id="SC-EBLET-K485",
        cathedral_profile=profile,
        demand_profile=demand,
    )


def discover_synapse_files() -> list[Path]:
    """Discover all synapse_K*.jsonl files in the synapses directory."""
    files = sorted(SYNAPSE_DIR.glob("synapse_K*.jsonl"))
    return files


def parse_clusters(synapse_path: Path) -> dict[str, list[dict]]:
    """
    Parse a synapse JSONL file into clusters.

    Clusters are groups of entries sharing the same cluster name
    (field 'cluster' in K482+ format, 'cluster_id' in K475/K477 format).

    Returns: {cluster_name: [entry, ...]} ordered dict preserving file order.
    """
    clusters: dict[str, list[dict]] = defaultdict(list)
    cluster_order: list[str] = []

    with synapse_path.open("r", encoding="utf-8") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
            except json.JSONDecodeError:
                print(f"  [WARN] JSON parse error in {synapse_path.name}, skipping line")
                continue
            cluster_name = _get_cluster_name(entry)
            if cluster_name not in clusters:
                cluster_order.append(cluster_name)
            clusters[cluster_name].append(entry)

    return {name: clusters[name] for name in cluster_order}


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~0.75 words per token."""
    return int(len(text.split()) / 0.75)


def main() -> None:
    parser = argparse.ArgumentParser(description="K485 Eblet bulk generator")
    parser.add_argument("--dry-run", action="store_true",
                        help="Parse and count clusters without making API calls")
    parser.add_argument("--skip-existing", action="store_true", default=True,
                        help="Skip synapse pointers already in store (default True)")
    parser.add_argument("--no-skip-existing", dest="skip_existing", action="store_false")
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key and not args.dry_run:
        print("[FAIL] ANTHROPIC_API_KEY not set in environment. Cannot proceed.")
        sys.exit(1)

    api_client = None
    if not args.dry_run:
        try:
            import anthropic
            api_client = anthropic.Anthropic(api_key=api_key)
        except ImportError:
            print("[FAIL] anthropic package not installed. Run: pip install anthropic")
            sys.exit(1)

    store = EbletStore(EBLET_STORE_PATH)
    sculptor = _make_sculptor()

    print(f"\n=== K485 Eblet Generator {'(DRY RUN)' if args.dry_run else ''} ===")
    print(f"Store path: {store.path}")
    print(f"Existing Eblets: {store.count()}")
    print()

    synapse_files = discover_synapse_files()
    print(f"Synapse files found: {len(synapse_files)}")
    for f in synapse_files:
        print(f"  {f.name}")
    print()

    # Phase B: Bulk generation
    total_clusters = 0
    total_generated = 0
    total_skipped = 0
    total_input_tokens = 0
    total_output_tokens = 0
    total_cost_usd = 0.0
    generation_errors: list[str] = []
    wall_start = time.time()

    file_stats: list[dict] = []

    for synapse_path in synapse_files:
        print(f"--- {synapse_path.name} ---")
        clusters = parse_clusters(synapse_path)
        print(f"  Clusters: {len(clusters)}")
        total_clusters += len(clusters)

        file_generated = 0
        file_skipped = 0

        for cluster_name, cluster_entries in clusters.items():
            synapse_pointer = f"{synapse_path.name}#cluster_{cluster_name}"

            # Idempotency: skip if already stored
            if args.skip_existing and store.already_has_pointer(synapse_pointer):
                print(f"  [SKIP] {synapse_pointer} (already in store)")
                file_skipped += 1
                total_skipped += 1
                continue

            if args.dry_run:
                cluster_text = "\n\n".join(
                    _get_synapse_text(e) for e in cluster_entries
                )
                est_in = estimate_tokens(cluster_text)
                est_out = 150  # ~100-word summary
                print(f"  [DRY]  {cluster_name} ({len(cluster_entries)} entries, ~{est_in} in-tokens)")
                total_input_tokens += est_in
                total_output_tokens += est_out
                file_generated += 1
                total_generated += 1
                continue

            # Cost guard
            if total_cost_usd >= COST_STOP_THRESHOLD:
                print(f"\n[WARN] Cost threshold ${COST_STOP_THRESHOLD:.2f} reached — stopping.")
                break

            eblet_id = store.next_id()
            try:
                eblet = sculptor.generate_eblet(
                    synapse_cluster=cluster_entries,
                    synapse_filename=synapse_path.name,
                    cluster_name=cluster_name,
                    api_client=api_client,
                    eblet_id=eblet_id,
                )
                store.append(eblet)

                # Track token usage from response (if available via SDK)
                # Estimate: input ≈ cluster text tokens, output ≈ summary tokens
                cluster_text = "\n\n".join(_get_synapse_text(e) for e in cluster_entries)
                in_tok = estimate_tokens(cluster_text)
                out_tok = estimate_tokens(eblet.summary_text)
                cost = (in_tok * HAIKU_INPUT_COST_PER_M + out_tok * HAIKU_OUTPUT_COST_PER_M) / 1_000_000
                total_input_tokens += in_tok
                total_output_tokens += out_tok
                total_cost_usd += cost

                word_count = len(eblet.summary_text.split())
                print(f"  [OK]   {eblet.eblet_id} <- {cluster_name} "
                      f"({word_count}w, conf={eblet.confidence_score:.2f}, "
                      f"cost=${cost:.5f})")
                file_generated += 1
                total_generated += 1

            except Exception as exc:
                msg = f"ERROR generating eblet for {synapse_pointer}: {exc}"
                print(f"  [ERR]  {msg}")
                generation_errors.append(msg)

        file_stats.append({
            "file": synapse_path.name,
            "clusters": len(clusters),
            "generated": file_generated,
            "skipped": file_skipped,
        })
        print()

    wall_elapsed = time.time() - wall_start

    # Summary
    print("=" * 60)
    print("GENERATION COMPLETE")
    print(f"  Total clusters found:   {total_clusters}")
    print(f"  Eblets generated:       {total_generated}")
    print(f"  Skipped (existing):     {total_skipped}")
    print(f"  Errors:                 {len(generation_errors)}")
    print(f"  Input tokens (est):     {total_input_tokens:,}")
    print(f"  Output tokens (est):    {total_output_tokens:,}")
    if args.dry_run:
        cost_in = total_input_tokens * HAIKU_INPUT_COST_PER_M / 1_000_000
        cost_out = total_output_tokens * HAIKU_OUTPUT_COST_PER_M / 1_000_000
        print(f"  Estimated cost:        ${cost_in + cost_out:.4f}")
    else:
        print(f"  Actual cost (est):     ${total_cost_usd:.4f}")
    print(f"  Wall time:             {wall_elapsed:.1f}s")
    print(f"  Total Eblets in store: {store.count()}")
    print()

    if generation_errors:
        print("ERRORS:")
        for err in generation_errors:
            print(f"  - {err}")
        print()

    if args.dry_run:
        print("[DRY RUN] No API calls made. Re-run without --dry-run to generate.")

    # Write stats JSON for Phase C
    stats_path = _HERE / "generation_stats_K485.json"
    stats = {
        "run_at": datetime.now(timezone.utc).isoformat(),
        "dry_run": args.dry_run,
        "total_clusters": total_clusters,
        "total_generated": total_generated,
        "total_skipped": total_skipped,
        "total_errors": len(generation_errors),
        "estimated_input_tokens": total_input_tokens,
        "estimated_output_tokens": total_output_tokens,
        "estimated_cost_usd": round(total_cost_usd if not args.dry_run else
                                     (total_input_tokens * HAIKU_INPUT_COST_PER_M +
                                      total_output_tokens * HAIKU_OUTPUT_COST_PER_M) / 1_000_000, 6),
        "wall_time_s": round(wall_elapsed, 2),
        "store_total": store.count(),
        "file_stats": file_stats,
        "errors": generation_errors,
    }
    with stats_path.open("w", encoding="utf-8") as fh:
        json.dump(stats, fh, indent=2)
    print(f"Stats written to: {stats_path}")


if __name__ == "__main__":
    main()
