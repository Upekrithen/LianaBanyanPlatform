"""
SEG-T-3: Dispatch shard manifests from M1 to M2 and M3 via the substrate /dag/emit endpoint.

Truth-Always note on endpoint shape:
  The spec payload is: {"event_type": "mesh_test_shard", "payload": <manifest>, "target": "<ip>"}
  The actual /dag/emit endpoint (substrate_api.ts) requires: {"pearls": string[]}
  Adaptation: the shard manifest is serialized as a JSON string and placed in pearls[0].
  The event_type and target are carried as bindings so the DAG node is self-describing.
"""
import json
import os
import sys
import urllib.request
import urllib.error


MESH_PORT = 11480
SHARD_DIR = os.path.expanduser("~/.mnemosynec/test-data/mmlu-pro/shards/")

# M2 and M3 targets (M1 = localhost, runs locally)
REMOTE_NODES = [
    {"node": "M2", "ip": "192.168.86.45"},
    {"node": "M3", "ip": "192.168.86.64"},
]


def dispatch_shard(node_name: str, ip: str, shard_path: str) -> dict:
    """
    Send shard manifest to a peer node via POST /dag/emit.

    The /dag/emit endpoint stores pearls[0] as the primary DAG content.
    bindings carry event_type and target for self-description.
    """
    if not os.path.exists(shard_path):
        return {"ok": False, "node": node_name, "ip": ip, "error": f"shard file not found: {shard_path}"}

    with open(shard_path) as f:
        shard_manifest = json.load(f)

    # Encode manifest as a JSON string pearl so /dag/emit accepts it
    pearl_content = json.dumps({
        "event_type": "mesh_test_shard",
        "payload": shard_manifest,
        "target": ip,
    })

    body = json.dumps({
        "pearls": [pearl_content],
        "bindings": {
            "event_type": "mesh_test_shard",
            "target_node": node_name,
            "target_ip": ip,
            "question_count": str(shard_manifest.get("question_count", 0)),
        },
        "faces": {
            "shard_index": str(shard_manifest.get("shard_index", 0)),
            "total_nodes": str(shard_manifest.get("total_nodes", 0)),
        },
    }).encode("utf-8")

    url = f"http://{ip}:{MESH_PORT}/dag/emit"
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            print(f"  {node_name} ({ip}): dispatched -> sid={result.get('sid', '?')} ok={result.get('ok')}")
            return {"ok": True, "node": node_name, "ip": ip, "sid": result.get("sid")}
    except urllib.error.URLError as e:
        print(f"  {node_name} ({ip}): FAILED -> {e}")
        return {"ok": False, "node": node_name, "ip": ip, "error": str(e)}


def main():
    results = []
    for target in REMOTE_NODES:
        node = target["node"]
        ip = target["ip"]
        shard_path = os.path.join(SHARD_DIR, f"shard_{node}.json")
        print(f"Dispatching shard to {node} ({ip})...")
        result = dispatch_shard(node, ip, shard_path)
        results.append(result)

    print(f"\nDispatch summary:")
    ok_count = sum(1 for r in results if r["ok"])
    print(f"  {ok_count}/{len(results)} dispatches succeeded")
    for r in results:
        status = "OK" if r["ok"] else f"FAIL: {r.get('error', '?')}"
        print(f"  {r['node']} ({r['ip']}): {status}")

    if ok_count < len(results):
        sys.exit(1)


if __name__ == "__main__":
    main()
