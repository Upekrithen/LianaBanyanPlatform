"""
Test the Comet Bridge REST server.
Run from librarian-mcp-public directory with the venv active,
or standalone if librarian-mcp is installed.

Usage:
  cd librarian-mcp-public
  .venv\Scripts\python.exe ..\librarian-mcp-helm-pwa\test_rest_server.py
"""
import sys
import os
import time
import threading
import json
import urllib.request
import urllib.error

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'librarian-mcp-public', 'src'))
sys.path.insert(0, os.path.dirname(__file__))

from daemon_wrapper import _start_rest_server

REST_PORT = 7712
TEST_QUERIES = [
    "What is the Cathedral Effect and what is the empirical evidence?",
    "What are Miners in the Liana Banyan architecture?",
    "What is the Pledge?",
    "Who is the Founder of Liana Banyan?",
]


def call_enrich(query: str) -> dict:
    data = json.dumps({"query": query}).encode("utf-8")
    req = urllib.request.Request(
        f"http://127.0.0.1:{REST_PORT}/enrich",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main():
    print("=== Comet Bridge REST Server Test ===\n")

    # Start server in background
    _start_rest_server(REST_PORT)
    time.sleep(0.5)  # let it bind

    # Test /health
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{REST_PORT}/health", timeout=3) as resp:
            health = json.loads(resp.read())
            print(f"[health] {health}")
    except Exception as e:
        print(f"[health] FAIL: {e}")
        return

    print()

    # Test /enrich for each query
    all_passed = True
    for query in TEST_QUERIES:
        try:
            result = call_enrich(query)
            eq = result.get("enriched_query", "")
            intent = result.get("intent", "?")
            tokens = result.get("token_count", 0)
            injected = "=== BEGIN AUTHORITATIVE SOURCES ===" in eq
            status = "PASS" if injected else "BARE (no injection)"
            print(f"[enrich] {status}")
            print(f"  Q      : {query[:70]}")
            print(f"  intent : {intent}  |  tokens: {tokens}  |  enriched_len: {len(eq)}")
            print()
            if not injected:
                all_passed = False
        except Exception as e:
            print(f"[enrich] FAIL: {e}")
            all_passed = False

    if all_passed:
        print("=== ALL TESTS PASSED ===")
    else:
        print("=== SOME TESTS FAILED ===")
        sys.exit(1)


if __name__ == "__main__":
    main()
