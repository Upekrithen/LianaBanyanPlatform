#!/usr/bin/env python3
"""
SEG-T-1 -- Mesh Precondition Diagnostic
Checks mesh nodes for:
  1. version_ok  -- MnemosyneC substrate API reachable on port 11480
  2. model_ok    -- Ollama has a Gemma 4/2 12B model on port 11434
  3. peers_ok    -- federation/status shows expected peers visible

Mesh HTTP port: 11480  (SubstrateAPIServer, API_PORT constant in substrate_api.ts)
Ollama port:    11434  (Ollama default)

NOTE: The /health endpoint returns a substrate API internal version ("0.4.0"),
not the MnemosyneC electron app version (e.g. "0.1.35"). version_ok is set
True when the health endpoint responds (meaning the app is running), and
version_found reflects what the health endpoint actually reports.

TODO: If a /dag/version or /app/version endpoint is added in a future release,
update _check_version() to parse the electron app version directly.

Usage:
    python scripts/mesh_precondition_check.py                  # all 4 nodes
    python scripts/mesh_precondition_check.py --node-count 3   # first 3 nodes
"""

import argparse
import json
import sys
import urllib.request
import urllib.error
from typing import Any

# ---------------------------------------------------------------------------
# Node definitions  (federation auto-discovered 2026-06-12)
# ---------------------------------------------------------------------------

# Ordered list: M0 = orchestrator (this machine), M1–M3 = remote nodes.
# --node-count N selects the first N entries.
NODES = [
    {"name": "M0", "ip": "192.168.86.30",  "display_ip": "192.168.86.30 (orchestrator)"},
    {"name": "M1", "ip": "192.168.86.45",  "display_ip": "192.168.86.45"},
    {"name": "M2", "ip": "192.168.86.64",  "display_ip": "192.168.86.64"},
    {"name": "M3", "ip": "192.168.86.156", "display_ip": "192.168.86.156"},
]


def _build_peer_map(active_nodes: list) -> dict:
    """Each node must see every other active node's IP."""
    all_ips = {n["name"]: n["ip"] for n in active_nodes}
    return {
        name: {ip for other_name, ip in all_ips.items() if other_name != name}
        for name, _ in all_ips.items()
    }

MESH_PORT = 11480   # SubstrateAPIServer (src/main/substrate_api.ts, API_PORT)
OLLAMA_PORT = 11434
TIMEOUT_S = 5

MIN_VERSION = "0.1.35"  # minimum required MnemosyneC release version

# ---------------------------------------------------------------------------
# Remediation strings
# ---------------------------------------------------------------------------

def _remediation(node_name: str, ip: str, version_ok: bool, model_ok: bool, peers_ok: bool) -> str:
    parts = []
    if not version_ok:
        parts.append(
            f"{node_name}: install v{MIN_VERSION} from "
            "https://github.com/liana-banyan/mnemosynec-releases/releases/tag/v0.1.35"
        )
    if not model_ok:
        parts.append(
            f"{node_name}: open MnemosyneC, click 'Just use it', choose "
            "'Free heavy-duty AI, stronger local model using Gemma 4 12B.' "
            "Wait for pull (~5 GB)."
        )
    if not peers_ok:
        parts.append(
            f"{node_name}: ensure MnemosyneC is running on all nodes and mesh discovery "
            "is enabled. Check that all machines are on the same LAN (192.168.86.x subnet)."
        )
    if not parts:
        return "None -- all checks passed."
    return " | ".join(parts)


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def _get(url: str) -> dict[str, Any] | None:
    """GET url, return parsed JSON or None on any error."""
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            return json.loads(raw)
    except Exception:
        return None


# ---------------------------------------------------------------------------
# Per-node checks
# ---------------------------------------------------------------------------

def _check_version(ip: str) -> tuple[bool, str | None]:
    """
    Returns (version_ok, version_found).
    version_ok = True if /health responds (app is running).
    version_found = the 'version' field from the health response (substrate API version),
    or None if unreachable.

    NOTE: The substrate /health endpoint returns its own internal version ("0.4.0"),
    not the MnemosyneC electron app version. Reachability is used as the proxy for
    "app is installed and running at >= v0.1.35 capability level."
    """
    url = f"http://{ip}:{MESH_PORT}/health"
    data = _get(url)
    if data is None or not data.get("ok"):
        return False, None
    version_found = str(data.get("version", "unknown"))
    return True, version_found


def _check_model(ip: str) -> tuple[bool, str | None]:
    """
    Returns (model_ok, model_found).
    Queries Ollama /api/tags and looks for any Gemma 12B variant.
    """
    url = f"http://{ip}:{OLLAMA_PORT}/api/tags"
    data = _get(url)
    if data is None:
        return False, None

    models = data.get("models", [])
    for m in models:
        name: str = m.get("name", "").lower()
        # Accept gemma4:12b, gemma2:12b, gemma:12b, gemma4-12b, etc.
        if ("gemma" in name) and ("12b" in name or "12" in name.split(":")[0]):
            return True, m.get("name")
    # No match -- return the first model name for diagnostics
    first = models[0].get("name") if models else None
    return False, first


def _check_peers(node_name: str, ip: str, peer_map: dict) -> tuple[bool, list[str]]:
    """
    Returns (peers_ok, peers_found).
    Calls /federation/status on the node and checks that the expected peer IPs
    are present in the returned peer list.
    """
    url = f"http://{ip}:{MESH_PORT}/federation/status"
    data = _get(url)
    if data is None:
        return False, []

    raw_peers = data.get("peers", [])
    # Peers may be objects with an 'address' field, or plain IP strings
    found_ips: list[str] = []
    for p in raw_peers:
        if isinstance(p, dict):
            addr = p.get("address") or p.get("ip") or p.get("host") or ""
            if addr:
                found_ips.append(str(addr))
        elif isinstance(p, str):
            found_ips.append(p)

    required = peer_map.get(node_name, set())
    found_set = set(found_ips)
    peers_ok = required.issubset(found_set)
    return peers_ok, found_ips


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def check_node(node: dict[str, Any], peer_map: dict) -> dict[str, Any]:
    name = node["name"]
    ip = node["ip"]
    display_ip = node["display_ip"]

    version_ok, version_found = _check_version(ip)
    model_ok, model_found = _check_model(ip)
    peers_ok, peers_found = _check_peers(name, ip, peer_map)

    return {
        "node": name,
        "ip": display_ip,
        "version_ok": version_ok,
        "version_found": version_found,
        "model_ok": model_ok,
        "model_found": model_found,
        "peers_ok": peers_ok,
        "peers_found": peers_found,
        "remediation": _remediation(name, ip, version_ok, model_ok, peers_ok),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="SEG-T-1: Mesh precondition diagnostic")
    parser.add_argument(
        "--node-count",
        type=int,
        default=4,
        choices=[1, 2, 3, 4],
        help="Number of nodes to check (default: 4, uses first N from NODES list)",
    )
    args = parser.parse_args()

    active_nodes = NODES[: args.node_count]
    peer_map = _build_peer_map(active_nodes)

    results = [check_node(n, peer_map) for n in active_nodes]

    print(json.dumps(results, indent=2))
    print()

    all_pass = all(
        r["version_ok"] and r["model_ok"] and r["peers_ok"]
        for r in results
    )

    if all_pass:
        print("PRECONDITION GATE: PASS -- all nodes ready for mesh test")
    else:
        print("PRECONDITION GATE: FAIL -- see remediation above")
        for r in results:
            failures = []
            if not r["version_ok"]:
                failures.append("version")
            if not r["model_ok"]:
                failures.append("model")
            if not r["peers_ok"]:
                failures.append("peers")
            if failures:
                print(f"  {r['node']} ({r['ip']}): FAIL [{', '.join(failures)}]")


if __name__ == "__main__":
    main()
