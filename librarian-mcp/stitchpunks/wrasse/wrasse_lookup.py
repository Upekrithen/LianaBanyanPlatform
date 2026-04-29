"""
Wrasse Scribe Lookup Engine — K540/B132

Pre-injection registry lookup: regex-first, sub-ms per entry.
Implements Phase C.1 of the Wrasse Scribe MVP.

Patent relevance: A&A #2317 (Pheromone Substrate, sub-linear scaling).
Architecture decision D.1: Regex-first MVP. Defer embedding fallback to Phase 2
based on empirical miss-rate measurement from wrasse_measure.py.

Usage (standalone):
    python wrasse_lookup.py "K461 BRIDLE canonical_values.yaml"

Usage (import):
    from wrasse_lookup import lookup, lookup_for_session, REGISTRY_PATH
    matches = lookup(["K461", "BRIDLE", "canonical_values.yaml"])
"""

import json
import re
import sys
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

REGISTRY_PATH = Path(__file__).parent / "wrasse_registry.jsonl"

# Module-level cache: reloaded on registry file mtime change
_CACHE: List[Dict[str, Any]] = []
_CACHE_MTIME: float = 0.0


def _load_registry(path: Path = REGISTRY_PATH) -> List[Dict[str, Any]]:
    """Load registry from JSONL, compiling trigger_regex for each entry."""
    global _CACHE, _CACHE_MTIME
    try:
        mtime = path.stat().st_mtime
    except FileNotFoundError:
        return []
    if mtime == _CACHE_MTIME and _CACHE:
        return _CACHE

    entries: List[Dict[str, Any]] = []
    with open(path, "r", encoding="utf-8") as fh:
        for raw in fh:
            raw = raw.strip()
            if not raw:
                continue
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                continue
            if obj.get("type") == "header":
                continue
            # Compile regex once at load time for sub-ms lookup
            pattern = obj.get("trigger_regex", "")
            if pattern:
                try:
                    obj["_rx"] = re.compile(pattern, re.IGNORECASE)
                except re.error:
                    obj["_rx"] = None
            else:
                obj["_rx"] = None
            entries.append(obj)

    _CACHE = entries
    _CACHE_MTIME = mtime
    return entries


def lookup(
    terms: List[str],
    max_matches: int = 25,
    path: Path = REGISTRY_PATH,
) -> List[Dict[str, Any]]:
    """
    Given a list of trigger terms, return matching registry entries.

    Uses compiled regex (case-insensitive) for sub-ms per entry.
    Deduplicates by trigger_id.

    Returns list of dicts with keys:
      trigger_id, trigger_class, trigger_pattern, canonical_resolution
    """
    registry = _load_registry(path)
    query = " ".join(terms)
    seen: set = set()
    results: List[Dict[str, Any]] = []

    for entry in registry:
        tid = entry.get("trigger_id", "")
        if tid in seen:
            continue
        rx = entry.get("_rx")
        if rx and rx.search(query):
            seen.add(tid)
            results.append({
                "trigger_id": tid,
                "trigger_class": entry.get("trigger_class", ""),
                "trigger_pattern": entry.get("trigger_pattern", ""),
                "canonical_resolution": entry.get("canonical_resolution", ""),
            })
            if len(results) >= max_matches:
                break

    return results


def lookup_for_session(
    session_context: str,
    max_matches: int = 25,
    path: Path = REGISTRY_PATH,
) -> List[Dict[str, Any]]:
    """
    Lookup from a free-form session context string.
    Wraps lookup() with single-string input.
    """
    return lookup([session_context], max_matches=max_matches, path=path)


def benchmark(n_runs: int = 1000, path: Path = REGISTRY_PATH) -> Dict[str, float]:
    """
    Benchmark lookup latency. Returns per-run stats in milliseconds.
    Used by wrasse_measure.py Phase D.1 baseline instrumentation.
    """
    # Warm cache
    _load_registry(path)
    test_query = "K461 BRIDLE canonical_values.yaml KNIGHT_QUEUE.md TS-011"

    times: List[float] = []
    for _ in range(n_runs):
        t0 = time.perf_counter()
        lookup([test_query], path=path)
        times.append((time.perf_counter() - t0) * 1000)

    return {
        "n_runs": n_runs,
        "mean_ms": sum(times) / len(times),
        "min_ms": min(times),
        "max_ms": max(times),
        "p95_ms": sorted(times)[int(0.95 * n_runs)],
        "sub_ms_pct": 100 * sum(1 for t in times if t < 1.0) / len(times),
        "registry_entries": len(_CACHE),
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python wrasse_lookup.py '<query terms>'")
        print("   or: python wrasse_lookup.py --benchmark")
        sys.exit(1)

    if sys.argv[1] == "--benchmark":
        stats = benchmark()
        print("Wrasse Lookup Benchmark (1000 runs)")
        for k, v in stats.items():
            print(f"  {k}: {v:.3f}" if isinstance(v, float) else f"  {k}: {v}")
        pct = stats["sub_ms_pct"]
        target = "PASS" if pct >= 95 else "NEEDS WORK"
        print(f"  sub-ms target (>=95%): {target}")
    else:
        query = " ".join(sys.argv[1:])
        matches = lookup_for_session(query)
        if not matches:
            print("No registry matches found.")
        else:
            print(f"Found {len(matches)} match(es) for: {query!r}\n")
            for m in matches:
                print(f"[{m['trigger_id']}] {m['trigger_pattern']} ({m['trigger_class']})")
                print(f"  {m['canonical_resolution'][:200]}...")
                print()
