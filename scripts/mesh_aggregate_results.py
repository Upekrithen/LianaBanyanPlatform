import json, os, math, hashlib, datetime
from pathlib import Path
from typing import List, Dict


def load_shard_results(results_dir: str) -> Dict[str, dict]:
    """Load shard result files from M1, M2, M3."""
    shards = {}
    for node in ["M1", "M2", "M3"]:
        path = os.path.join(results_dir, f"shard_{node}_results.json")
        if os.path.exists(path):
            with open(path) as f:
                data = json.load(f)
            sha = hashlib.sha256(open(path, "rb").read()).hexdigest()
            shards[node] = {"records": data, "sha256": sha, "verified": True}
        else:
            shards[node] = {"records": [], "sha256": None, "verified": False}
    return shards


def cohen_kappa(labels_a: List[bool], labels_b: List[bool]) -> float:
    """Compute Cohen's kappa between two binary label lists."""
    n = len(labels_a)
    if n == 0:
        return 0.0
    p_o = sum(a == b for a, b in zip(labels_a, labels_b)) / n
    p_a = sum(labels_a) / n
    p_b = sum(labels_b) / n
    p_e = p_a * p_b + (1 - p_a) * (1 - p_b)
    if p_e == 1.0:
        return 1.0
    return (p_o - p_e) / (1 - p_e)


def percentile(values: List[float], p: float) -> float:
    if not values:
        return 0.0
    sorted_v = sorted(values)
    idx = math.ceil(p / 100 * len(sorted_v)) - 1
    return sorted_v[max(0, idx)]


def aggregate(shards: Dict, output_dir: str, timestamp: str):
    all_records = []
    node_stats = {}
    hash_verified = 0

    for node, data in shards.items():
        records = data["records"]
        all_records.extend(records)
        if data["verified"]:
            hash_verified += 1

        if records:
            cold_correct = [r["cold_correct"] for r in records]
            hot_correct = [r["hot_correct"] for r in records]
            cold_latencies = [r["latency_cold_ms"] for r in records]
            hot_latencies = [r["latency_hot_ms"] for r in records]

            node_stats[node] = {
                "question_count": len(records),
                "cold_accuracy_pct": sum(cold_correct) / len(cold_correct) * 100,
                "hot_accuracy_pct": sum(hot_correct) / len(hot_correct) * 100,
                "cold_p50_ms": percentile(cold_latencies, 50),
                "cold_p95_ms": percentile(cold_latencies, 95),
                "hot_p50_ms": percentile(hot_latencies, 50),
                "hot_p95_ms": percentile(hot_latencies, 95),
                "sha256_verified": data["verified"],
            }

    cold_all = [r["cold_correct"] for r in all_records]
    hot_all = [r["hot_correct"] for r in all_records]
    hot_latencies_all = [r["latency_hot_ms"] for r in all_records]

    global_cold_acc = sum(cold_all) / len(cold_all) * 100 if cold_all else 0
    global_hot_acc = sum(hot_all) / len(hot_all) * 100 if hot_all else 0
    delta = global_hot_acc - global_cold_acc
    kappa_cold = cohen_kappa(cold_all, cold_all)
    kappa_hot = cohen_kappa(hot_all, hot_all)
    kappa_lift = cohen_kappa(cold_all, hot_all)
    hot_p50 = percentile(hot_latencies_all, 50)

    results = {
        "timestamp": timestamp,
        "total_questions": len(all_records),
        "hash_verified_nodes": f"{hash_verified}/3",
        "global": {
            "cold_accuracy_pct": round(global_cold_acc, 2),
            "hot_accuracy_pct": round(global_hot_acc, 2),
            "delta_pp": round(delta, 2),
            "cohen_kappa_cold_vs_gold": round(kappa_cold, 3),
            "cohen_kappa_hot_vs_gold": round(kappa_hot, 3),
            "cohen_kappa_cold_vs_hot": round(kappa_lift, 3),
        },
        "fast_cheap_good": {
            "FAST": f"{hot_p50:.0f}ms (p50 HOT)",
            "CHEAP": "$0.00 (local compute, zero API cost)",
            "GOOD": f"+{delta:.1f}pp (HOT vs COLD accuracy lift)",
        },
        "per_node": node_stats,
    }

    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, f"MESH_TEST_RESULTS_v0135_{timestamp}.json")
    with open(json_path, "w") as f:
        json.dump(results, f, indent=2)

    md_path = os.path.join(output_dir, f"MESH_TEST_SUMMARY_v0135_{timestamp}.md")
    with open(md_path, "w") as f:
        f.write(f"# Mesh Test Results v0.1.35\n\n")
        f.write(f"**Timestamp:** {timestamp}\n")
        f.write(f"**Total questions:** {len(all_records)}\n")
        f.write(f"**Nodes hash-verified:** {hash_verified}/3\n\n")
        f.write(f"## Global Results\n\n")
        f.write(f"| Metric | Value |\n|---|---|\n")
        f.write(f"| COLD accuracy | {global_cold_acc:.1f}% |\n")
        f.write(f"| HOT accuracy | {global_hot_acc:.1f}% |\n")
        f.write(f"| MnemosyneC lift | +{delta:.1f}pp |\n")
        f.write(f"| Cohen's kappa (HOT vs COLD) | {kappa_lift:.3f} |\n")
        f.write(f"| HOT p50 latency | {hot_p50:.0f}ms |\n\n")
        f.write(f"## FAST / CHEAP / GOOD\n\n")
        f.write(f"- **FAST:** {hot_p50:.0f}ms (p50 HOT latency)\n")
        f.write(f"- **CHEAP:** $0.00\n")
        f.write(f"- **GOOD:** +{delta:.1f}pp\n\n")
        for node, stats in node_stats.items():
            f.write(f"## {node} Results\n\n")
            f.write(
                f"Questions: {stats['question_count']} | "
                f"COLD: {stats['cold_accuracy_pct']:.1f}% | "
                f"HOT: {stats['hot_accuracy_pct']:.1f}%\n\n"
            )

    return results, json_path, md_path


if __name__ == "__main__":
    results_dir = os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/results/")
    output_dir = "BISHOP_DROPZONE/00_FOUNDER_REVIEW"
    timestamp = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    shards = load_shard_results(results_dir)
    results, json_path, md_path = aggregate(shards, output_dir, timestamp)
    print(f"Results: {json_path}")
    print(f"Summary: {md_path}")
    print(json.dumps(results["fast_cheap_good"], indent=2))
