"""
SEG-T-3: Shard strategy for MMLU-Pro mesh test.
Distributes questions evenly across nodes and writes per-node shard manifests.
"""
import json
import math
import os
import sys
import hashlib


def compute_shards(questions: list, node_ips: list) -> dict:
    """Distribute questions evenly across nodes."""
    N = len(questions)
    n = len(node_ips)
    shards = {}
    for i, ip in enumerate(node_ips):
        start = math.floor(i * N / n)
        end = math.floor((i + 1) * N / n)
        shards[ip] = questions[start:end]
    return shards


def write_shard_manifests(questions: list, node_ips: list, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    shards = compute_shards(questions, node_ips)
    manifests = {}
    for i, (ip, shard) in enumerate(shards.items()):
        node_name = f"M{i+1}"
        manifest = {
            "node": node_name,
            "ip": ip,
            "shard_index": i,
            "total_nodes": len(node_ips),
            "question_count": len(shard),
            "questions": shard,
        }
        path = os.path.join(out_dir, f"shard_{node_name}.json")
        with open(path, "w") as f:
            json.dump(manifest, f)
        sha = hashlib.sha256(open(path, "rb").read()).hexdigest()
        manifests[node_name] = {"path": path, "sha256": sha, "count": len(shard)}
        print(f"{node_name} ({ip}): {len(shard)} questions -> {path} (sha256: {sha[:16]}...)")
    return manifests


if __name__ == "__main__":
    data_path = os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/standard/mmlu_pro_standard.json")
    shard_dir = os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/shards/")
    node_ips = ["127.0.0.1", "192.168.86.45", "192.168.86.64"]  # M1, M2, M3

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}. Run download_mmlu_pro.py first.")
        sys.exit(1)

    with open(data_path) as f:
        questions = json.load(f)

    manifests = write_shard_manifests(questions, node_ips, shard_dir)
    print(f"\nShard manifests written: {len(manifests)} nodes")
    for node, meta in manifests.items():
        print(f"  {node}: {meta['count']} questions  sha256={meta['sha256'][:16]}...")
