"""
SEG-T-3: Shard strategy for mesh test datasets.
Distributes questions evenly across nodes and writes per-node shard manifests.

Supported datasets (--dataset flag):
  mmlu-pro          MMLU-Pro standard 12K (~5h, Google 77.2% target)
  mmlu-pro-diamond  MMLU-Pro filtered high-difficulty subset ~2.8K (~1.2h, internal)
  gpqa-diamond      GPQA Diamond ~448 PhD-level Qs (~30min, Google 78.8% target)
                    (requires download_gpqa_diamond.py to be run first)
"""
import argparse
import json
import math
import os
import sys
import hashlib

# ---------------------------------------------------------------------------
# Node definitions  (federation auto-discovered 2026-06-12)
# ---------------------------------------------------------------------------

# Ordered dict: M0 = orchestrator (this machine), M1–M3 = remote nodes.
# --node-count N selects the first N entries.
NODES = {
    "M0": "192.168.86.30",   # orchestrator (this machine)
    "M1": "192.168.86.45",
    "M2": "192.168.86.64",
    "M3": "192.168.86.156",
}


def compute_shards(questions: list, node_names: list, node_ips: list) -> dict:
    """Distribute questions evenly across nodes. Returns {name: (ip, questions)}."""
    N = len(questions)
    n = len(node_names)
    shards = {}
    for i, (name, ip) in enumerate(zip(node_names, node_ips)):
        start = math.floor(i * N / n)
        end = math.floor((i + 1) * N / n)
        shards[name] = (ip, questions[start:end])
    return shards


def write_shard_manifests(questions: list, node_names: list, node_ips: list, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    shards = compute_shards(questions, node_names, node_ips)
    manifests = {}
    for i, (name, (ip, shard)) in enumerate(shards.items()):
        manifest = {
            "node": name,
            "ip": ip,
            "shard_index": i,
            "total_nodes": len(node_names),
            "question_count": len(shard),
            "questions": shard,
        }
        path = os.path.join(out_dir, f"shard_{name}.json")
        with open(path, "w") as f:
            json.dump(manifest, f)
        sha = hashlib.sha256(open(path, "rb").read()).hexdigest()
        manifests[name] = {"path": path, "sha256": sha, "count": len(shard)}
        print(f"{name} ({ip}): {len(shard)} questions -> {path} (sha256: {sha[:16]}...)")
    return manifests


# Dataset registry: name -> (data_path, shard_dir, download_hint)
DATASET_REGISTRY = {
    "mmlu-pro": (
        os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/standard/mmlu_pro_standard.json"),
        os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/shards/"),
        "Run download_mmlu_pro.py first.",
    ),
    "mmlu-pro-diamond": (
        os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/diamond/mmlu_pro_diamond.json"),
        os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/shards-diamond/"),
        "Run download_mmlu_pro.py first (diamond tier is derived automatically).",
    ),
    "gpqa-diamond": (
        os.path.expanduser("~/.mnemosynec/test-data/gpqa-diamond/gpqa_diamond.json"),
        os.path.expanduser("~/.mnemosynec/test-data/gpqa-diamond/shards/"),
        "Run download_gpqa_diamond.py first. NOTE: dataset is HF-gated -- requires auth.",
    ),
}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SEG-T-3: Mesh shard generator")
    parser.add_argument(
        "--dataset",
        default="mmlu-pro",
        choices=list(DATASET_REGISTRY.keys()),
        help="Dataset to shard: mmlu-pro (default), mmlu-pro-diamond, or gpqa-diamond",
    )
    parser.add_argument(
        "--node-count",
        type=int,
        default=4,
        choices=[1, 2, 3, 4],
        help="Number of nodes to shard across (default: 4, uses first N from NODES dict)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print shard split without writing files (dataset file not required)",
    )
    args = parser.parse_args()

    active_items = list(NODES.items())[: args.node_count]
    active_names = [name for name, _ in active_items]
    active_ips   = [ip   for _, ip   in active_items]

    data_path, shard_dir, hint = DATASET_REGISTRY[args.dataset]

    if args.dry_run:
        # Synthesize a fake question list for split preview
        fake_total = {"mmlu-pro": 12032, "mmlu-pro-diamond": 2800, "gpqa-diamond": 448}
        total = fake_total.get(args.dataset, 1000)
        questions = list(range(total))
        print(f"DRY RUN -- dataset: {args.dataset}  ({total:,} synthetic questions)")
        print(f"Nodes ({args.node_count}): {', '.join(f'{n}={ip}' for n, ip in zip(active_names, active_ips))}")
        N, n = total, args.node_count
        for i, (name, ip) in enumerate(zip(active_names, active_ips)):
            start = math.floor(i * N / n)
            end = math.floor((i + 1) * N / n)
            print(f"  {name} ({ip}): questions [{start}:{end}]  count={end - start}")
        sys.exit(0)

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}.")
        print(f"  {hint}")
        sys.exit(1)

    with open(data_path) as f:
        questions = json.load(f)

    print(f"Dataset: {args.dataset}  ({len(questions):,} questions)")
    print(f"Nodes ({args.node_count}): {', '.join(f'{n}={ip}' for n, ip in zip(active_names, active_ips))}")
    manifests = write_shard_manifests(questions, active_names, active_ips, shard_dir)
    print(f"\nShard manifests written: {len(manifests)} nodes")
    for node, meta in manifests.items():
        print(f"  {node}: {meta['count']} questions  sha256={meta['sha256'][:16]}...")
