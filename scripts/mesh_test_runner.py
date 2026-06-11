"""
SEG-T-4: Standalone COLD-vs-HOT mesh test runner (Python, outside Electron).

Usage:
    python mesh_test_runner.py --shard <path_to_shard_N.json> [--node M1] [--model gemma4:12b]

Per-question record format (IMMUTABLE per spec):
    { question_id, gold_answer, cold_response, hot_response, cold_correct, hot_correct,
      latency_cold_ms, latency_hot_ms }

Substrate retrieval: POST http://127.0.0.1:11480/substrate/query with {"query": <text>}
If substrate returns a hit, its answer/text is prepended to the HOT prompt.
If substrate is unreachable, HOT falls back to empty context (TODO: wire live substrate).
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error
import hashlib


OLLAMA_BASE = "http://localhost:11434"
SUBSTRATE_URL = "http://127.0.0.1:11480/substrate/query"
MESH_EMIT_URL = "http://127.0.0.1:11480/dag/emit"
MESH_PROGRESS_URL = "http://127.0.0.1:11480/mesh/progress/update"
PROGRESS_BATCH = 100  # emit progress every N questions


def ollama_generate(prompt: str, model: str, timeout: int = 120) -> tuple[str, float]:
    """
    POST to Ollama /api/generate. Returns (response_text, latency_ms).
    stream=false so we get a single JSON response.
    """
    body = json.dumps({
        "model": model,
        "prompt": prompt,
        "stream": False,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE}/api/generate",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            latency_ms = (time.time() - t0) * 1000
            return data.get("response", ""), latency_ms
    except Exception as e:
        latency_ms = (time.time() - t0) * 1000
        return f"ERROR:{e}", latency_ms


def substrate_query(query_text: str, timeout: int = 10) -> str:
    """
    Query local substrate for context. Returns context string or empty string on miss.
    TODO: substrate retrieval not wired if substrate server is not running.
    """
    body = json.dumps({"query": query_text}).encode("utf-8")
    req = urllib.request.Request(
        SUBSTRATE_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("hit"):
                return data.get("answer") or data.get("text") or ""
            return ""
    except Exception:
        # Substrate unreachable -- HOT falls back to empty context
        return ""


def _post_mesh_progress(node_progress: dict, timeout_s: float = 1.0) -> None:
    """Non-fatal — mesh test continues even if the progress endpoint is unreachable."""
    try:
        body = json.dumps(node_progress).encode()
        req = urllib.request.Request(
            MESH_PROGRESS_URL,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=timeout_s):
            pass
    except Exception:
        pass  # non-fatal


def emit_progress(node: str, done: int, total: int, node_progress: dict | None = None):
    """Emit progress heartbeat via /dag/emit. Also posts to mesh glance endpoint if node_progress provided."""
    body = json.dumps({
        "pearls": [f"mesh_test:{node}:progress:{done}/{total}"],
        "bindings": {"event_type": "mesh_test_progress", "node": node},
    }).encode("utf-8")
    req = urllib.request.Request(
        MESH_EMIT_URL,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # Non-fatal: progress emit failure does not halt the run

    if node_progress is not None:
        _post_mesh_progress(node_progress)


def build_question_prompt(q: dict) -> str:
    """Build a prompt string from an MMLU-Pro question dict."""
    text = q.get("question", "")
    options = q.get("options", [])
    if options:
        option_lines = "\n".join(
            f"  {chr(65 + i)}. {opt}" for i, opt in enumerate(options)
        )
        text = f"{text}\n\nOptions:\n{option_lines}\n\nAnswer with the letter only."
    return text


def check_correct(response: str, gold: str) -> bool:
    """
    Simple correctness check: response contains the gold answer letter.
    MMLU-Pro gold answers are single letters (A-J).
    """
    if not gold or not response:
        return False
    gold_letter = gold.strip().upper()
    resp_upper = response.strip().upper()
    # Check first character or explicit letter match
    if resp_upper.startswith(gold_letter):
        return True
    # Also check "Answer: X" style
    for marker in [f"ANSWER: {gold_letter}", f"ANSWER:{gold_letter}", f"({gold_letter})"]:
        if marker in resp_upper:
            return True
    return False


def run_shard(shard_path: str, node: str, model: str) -> dict:
    with open(shard_path) as f:
        shard = json.load(f)

    questions = shard.get("questions", [])
    total = len(questions)
    results = []
    run_start = time.time()
    last_emit_time = run_start

    print(f"[{node}] Running {total} questions with model={model}")
    print(f"[{node}] COLD-vs-HOT  substrate={SUBSTRATE_URL}")

    for idx, q in enumerate(questions):
        q_id = str(q.get("question_id", idx))
        gold = str(q.get("answer", "")).strip().upper()
        prompt_base = build_question_prompt(q)

        # COLD: no context
        cold_resp, latency_cold = ollama_generate(prompt_base, model)
        cold_correct = check_correct(cold_resp, gold)

        # HOT: retrieve substrate context, prepend if found
        ctx = substrate_query(prompt_base)
        if ctx:
            hot_prompt = f"Context from substrate:\n{ctx}\n\n{prompt_base}"
        else:
            # TODO: substrate context empty -- substrate server may not be running
            hot_prompt = prompt_base
        hot_resp, latency_hot = ollama_generate(hot_prompt, model)
        hot_correct = check_correct(hot_resp, gold)

        record = {
            "question_id": q_id,
            "gold_answer": gold,
            "cold_response": cold_resp,
            "hot_response": hot_resp,
            "cold_correct": cold_correct,
            "hot_correct": hot_correct,
            "latency_cold_ms": round(latency_cold, 1),
            "latency_hot_ms": round(latency_hot, 1),
        }
        results.append(record)

        done = idx + 1
        now = time.time()
        # Emit progress every PROGRESS_BATCH questions or every 60 seconds
        if done % PROGRESS_BATCH == 0 or (now - last_emit_time) >= 60:
            cold_acc = sum(1 for r in results if r["cold_correct"]) / done
            hot_acc = sum(1 for r in results if r["hot_correct"]) / done
            elapsed = now - run_start
            rate = done / elapsed if elapsed > 0 else 1.0
            eta_s = max(0, int((total - done) / rate))
            emit_progress(node, done, total, node_progress={
                "nodeId": node,
                "label": node,
                "pct": round(done / total * 100.0, 1) if total > 0 else 0.0,
                "eta_s": eta_s,
                "cold_accuracy": cold_acc,
                "hot_accuracy": hot_acc,
                "last_seen": int(now),
                "total_rounds": total,
                "rounds_done": done,
            })
            last_emit_time = now
            print(f"[{node}] {done}/{total}  cold_acc={cold_acc:.3f}  hot_acc={hot_acc:.3f}")

    cold_correct_count = sum(1 for r in results if r["cold_correct"])
    hot_correct_count = sum(1 for r in results if r["hot_correct"])
    summary = {
        "node": node,
        "model": model,
        "total_questions": total,
        "cold_correct": cold_correct_count,
        "hot_correct": hot_correct_count,
        "cold_accuracy": cold_correct_count / total if total else 0,
        "hot_accuracy": hot_correct_count / total if total else 0,
        "delta_accuracy": (hot_correct_count - cold_correct_count) / total if total else 0,
    }
    return {"results": results, "summary": summary}


# Results directories per dataset
RESULTS_DIRS = {
    "mmlu-pro":         "~/.mnemosynec/test-data/mmlu-pro/results/",
    "mmlu-pro-diamond": "~/.mnemosynec/test-data/mmlu-pro/results-diamond/",
    "gpqa-diamond":     "~/.mnemosynec/test-data/gpqa-diamond/results/",
}


def main():
    parser = argparse.ArgumentParser(description="Mesh COLD-vs-HOT test runner")
    parser.add_argument("--shard", required=True, help="Path to shard_MN.json")
    parser.add_argument("--node", default="M1", help="Node identifier (M1, M2, M3)")
    parser.add_argument("--model", default="gemma4:12b", help="Ollama model name")
    parser.add_argument(
        "--dataset",
        default="mmlu-pro",
        choices=list(RESULTS_DIRS.keys()),
        help=(
            "Dataset being tested: mmlu-pro (default), mmlu-pro-diamond, or gpqa-diamond. "
            "Controls results output directory. Does not affect question loading -- "
            "questions come from the shard file. Use mesh_shard.py --dataset to generate "
            "the correct shard for each dataset."
        ),
    )
    args = parser.parse_args()

    if not os.path.exists(args.shard):
        print(f"Shard file not found: {args.shard}")
        sys.exit(1)

    out = run_shard(args.shard, args.node, args.model)
    results = out["results"]
    summary = out["summary"]

    # Write results JSON -- dataset-specific subdirectory
    results_dir = os.path.expanduser(RESULTS_DIRS[args.dataset])
    os.makedirs(results_dir, exist_ok=True)
    results_path = os.path.join(results_dir, f"shard_{args.node}_results.json")
    with open(results_path, "w") as f:
        json.dump({"summary": summary, "results": results}, f, indent=2)

    # SHA-256 of results file
    sha = hashlib.sha256(open(results_path, "rb").read()).hexdigest()

    print(f"\n[{args.node}] Done.")
    print(f"  cold_accuracy: {summary['cold_accuracy']:.4f}")
    print(f"  hot_accuracy:  {summary['hot_accuracy']:.4f}")
    print(f"  delta:         {summary['delta_accuracy']:+.4f}")
    print(f"  results -> {results_path}")
    print(f"  sha256:  {sha[:16]}...")


if __name__ == "__main__":
    main()
