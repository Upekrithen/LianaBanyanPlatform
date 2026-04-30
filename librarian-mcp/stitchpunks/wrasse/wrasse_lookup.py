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
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Dict, Any, Optional
REGISTRY_PATH = Path(__file__).parent / "wrasse_registry.jsonl"

# ── KN051: eblet_path trigger class constants ───────────────────────────────────
# K544 size cap: if Eblet content exceeds this token approximation, summarize-on-load.
# Approximation: 1 token ≈ 4 characters (conservative). At 2000 tokens ≈ 8000 chars.
MAX_INJECTION_TOKENS = 2000
_CHARS_PER_TOKEN = 4
MAX_INJECTION_CHARS = MAX_INJECTION_TOKENS * _CHARS_PER_TOKEN

# Per-session cache: {eblet_path_str: resolved_content_str}
# Cleared at SessionEnd via The Shadow daemon kill (D.1).
_EBLET_PATH_CACHE: Dict[str, str] = {}

# Staleness filter constants (Phase E condition 1 — K-Wrasse-Wiring-Hardening)
# Entries older than STALENESS_DAYS that have fewer than MIN_VERIFICATION_COUNT
# verifications are excluded at load-time.  Cache invalidation via mtime means
# that once a Detective resolution bumps verification_count, the registry mtime
# changes, cache reloads, and the filter re-applies automatically.
STALENESS_DAYS = 30
MIN_VERIFICATION_COUNT = 3

# Module-level cache: reloaded on registry file mtime change
_CACHE: List[Dict[str, Any]] = []
_CACHE_MTIME: float = 0.0


def _is_stale_and_unverified(obj: Dict[str, Any], now: datetime) -> bool:
    """Return True if entry should be filtered out due to staleness."""
    ts_raw = obj.get("last_verified_ts", "")
    count = obj.get("verification_count", 0)

    if count >= MIN_VERIFICATION_COUNT:
        return False  # well-verified — always keep regardless of age

    if not ts_raw:
        return False  # no timestamp — assume fresh to avoid accidental drops

    try:
        # Parse ISO-8601 timestamp (supports Z suffix and +00:00 offset)
        ts_str = ts_raw.replace("Z", "+00:00")
        last_verified = datetime.fromisoformat(ts_str)
        if last_verified.tzinfo is None:
            last_verified = last_verified.replace(tzinfo=timezone.utc)
    except (ValueError, AttributeError):
        return False  # unparseable timestamp — err on the side of keeping

    age_days = (now - last_verified).days
    return age_days > STALENESS_DAYS


def _load_registry(path: Path = REGISTRY_PATH) -> List[Dict[str, Any]]:
    """Load registry from JSONL, compiling trigger_regex for each entry.

    Applies staleness filter at load time: entries with last_verified_ts older
    than STALENESS_DAYS AND verification_count < MIN_VERIFICATION_COUNT are
    excluded.  Cache invalidation via mtime means Detective-updated entries
    re-enter the active set automatically on next lookup.
    """
    global _CACHE, _CACHE_MTIME
    try:
        mtime = path.stat().st_mtime
    except FileNotFoundError:
        return []
    if mtime == _CACHE_MTIME and _CACHE:
        return _CACHE

    now = datetime.now(timezone.utc)
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
            if _is_stale_and_unverified(obj, now):
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

    For eblet_path trigger_class entries (KN051):
      - On match, auto-loads the Eblet file content into canonical_resolution
      - Honors K544 size cap (MAX_INJECTION_TOKENS=2000)
      - Uses per-session cache to avoid repeated disk reads

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
            trigger_class = entry.get("trigger_class", "")
            canonical_resolution = entry.get("canonical_resolution", "")

            # KN051: eblet_path class — auto-load Eblet content on trigger match
            if trigger_class == "eblet_path":
                canonical_resolution = _resolve_eblet_path_content(
                    entry.get("trigger_pattern", ""),
                    canonical_resolution,
                )

            results.append({
                "trigger_id": tid,
                "trigger_class": trigger_class,
                "trigger_pattern": entry.get("trigger_pattern", ""),
                "canonical_resolution": canonical_resolution,
                "last_verified_ts": entry.get("last_verified_ts", ""),
            })
            if len(results) >= max_matches:
                break

    return results


def _resolve_eblet_path_content(trigger_pattern: str, fallback_resolution: str) -> str:
    """
    KN051: On eblet_path trigger match, load the Eblet file content.

    Resolution priority:
      1. trigger_pattern as file path (primary — the eblet_path IS the path)
      2. fallback_resolution as file path (if trigger_pattern doesn't resolve)
      3. fallback_resolution as inline text (last resort)

    Size cap enforcement (K544, MAX_INJECTION_TOKENS=2000):
      - If content ≤ MAX_INJECTION_CHARS: return full content
      - If content > MAX_INJECTION_CHARS: return summary-on-load with pointer

    Per-session cache: repeated triggers on same path return cached content.
    """
    # Determine candidate path
    candidate_path = _find_eblet_file(trigger_pattern) or _find_eblet_file(fallback_resolution)
    if candidate_path is None:
        # No file found — return fallback inline text
        return fallback_resolution

    path_key = str(candidate_path)

    # Per-session cache hit
    if path_key in _EBLET_PATH_CACHE:
        return _EBLET_PATH_CACHE[path_key]

    # Load from disk
    try:
        content = candidate_path.read_text(encoding="utf-8")
    except OSError:
        return fallback_resolution

    # K544 size cap enforcement
    if len(content) <= MAX_INJECTION_CHARS:
        resolved = content
    else:
        resolved = _summarize_on_load(content, path_key)

    # Cache for the session
    _EBLET_PATH_CACHE[path_key] = resolved
    return resolved


def _find_eblet_file(path_str: str) -> Optional[Path]:
    """
    Attempt to locate the Eblet file from a path string.
    Tries:
      1. Absolute path as-is
      2. Relative to registry's parent directory
      3. state/eblets-relative expansion
    Returns Path if found and readable, None otherwise.
    """
    if not path_str:
        return None

    candidates = [
        Path(path_str),
        REGISTRY_PATH.parent / path_str,
    ]

    # Expand ~/.claude/state/eblets/ prefix
    if "state/eblets/" in path_str or "state\\eblets\\" in path_str:
        normalized = path_str.replace("\\", "/")
        if "~/" in normalized:
            candidates.append(Path(normalized.replace("~/", str(Path.home()) + "/")))

    for candidate in candidates:
        try:
            if candidate.exists() and candidate.is_file():
                return candidate
        except OSError:
            pass
    return None


def _summarize_on_load(content: str, path_key: str) -> str:
    """
    KN051 summary-on-load: when Eblet content exceeds MAX_INJECTION_TOKENS,
    return a structured summary with explicit pointer to the full file.

    Summary strategy:
      - Extract frontmatter (YAML between --- markers)
      - Extract first heading (# title)
      - Count total lines
      - Include explicit path pointer
    """
    lines = content.splitlines()
    total_lines = len(lines)
    token_approx = len(content) // _CHARS_PER_TOKEN

    # Extract frontmatter
    frontmatter_lines: List[str] = []
    in_frontmatter = False
    first_heading = ""
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == "---":
            in_frontmatter = True
            continue
        if in_frontmatter:
            if line.strip() == "---":
                in_frontmatter = False
                continue
            frontmatter_lines.append(line)
        elif line.startswith("# ") and not first_heading:
            first_heading = line

    frontmatter_summary = "\n".join(frontmatter_lines[:10]) if frontmatter_lines else "(none)"

    return (
        f"[Eblet content exceeds size cap ({token_approx} tokens > {MAX_INJECTION_TOKENS} max). "
        f"Summary below. Read full at: {path_key}]\n\n"
        f"**Title:** {first_heading or '(no heading)'}\n"
        f"**Total lines:** {total_lines}\n"
        f"**Frontmatter:**\n{frontmatter_summary}\n\n"
        f"**Full path:** {path_key}"
    )


def clear_eblet_cache() -> None:
    """
    Clear the per-session eblet_path cache.
    Called by The Shadow daemon on SessionEnd (D.1).
    """
    _EBLET_PATH_CACHE.clear()


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
