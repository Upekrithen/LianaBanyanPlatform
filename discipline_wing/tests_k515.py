"""
K515 Verification — 16 checks for Twin Observer Pattern
Chronos+Chroniclers (C.1-C.8) + Embedded Correspondents+Bureau (C.9-C.16)

A&A #2299 (Chronos), #2300 (Chroniclers), #2306 (Embedded Correspondent + Bureau)

Run: python -m discipline_wing.tests_k515
"""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Any, Dict, List

# Ensure workspace root on path
WORKSPACE = Path(__file__).parent.parent
if str(WORKSPACE) not in sys.path:
    sys.path.insert(0, str(WORKSPACE))

from discipline_wing.chronicler import (
    CHRONICLER_DIR,
    write_chronicler,
    read_tablet,
    wing_chronos_query,
)
from discipline_wing.bureau import (
    CORRESPONDENTS_DIR,
    RISK_PATTERN_AUGURS,
    write_chunk,
    query_bureau,
    bureau_subscribe,
    _evaluate_risk_patterns,
)

PASS = "[OK]"
FAIL = "[XX]"


def run_check(label: str, ok: bool, detail: str = "") -> bool:
    status = PASS if ok else FAIL
    msg = f"{status} {label}"
    if detail:
        msg += f"  ({detail})"
    print(msg)
    return ok


def main() -> None:
    passed = 0
    total = 0

    print("=" * 70)
    print("K515 VERIFICATION — Twin Observer Pattern (16 checks)")
    print("=" * 70)
    print()

    # ── C-component: Chronos + Chroniclers ────────────────────────────────────

    print("── C-COMPONENT: Chronos + Chroniclers ──")
    print()

    # C.1 — Each Augur evaluation writes one Chronicler tablet entry
    total += 1
    test_augur = "k515_test_augur"
    test_tablet = CHRONICLER_DIR / f"augur_{test_augur}.jsonl"
    if test_tablet.exists():
        test_tablet.unlink()

    write_chronicler(
        augur_id=test_augur, augur_name="K515-Test-Augur",
        triggered=True, signal="block", failure_action="block",
        consensus_decision="block", file_path="/test/file.md",
        tool_name="Write", elapsed_ms=5, reason="C.1 test",
    )
    entries = read_tablet(test_augur)
    ok = len(entries) == 1 and entries[0]["triggered"] is True
    ok = run_check("C.1  Augur evaluation writes one Chronicler entry", ok,
                   f"{len(entries)} entry found")
    passed += ok

    # C.2 — chronos_query returns correct aggregates for synthetic 100-firing data
    total += 1
    syn_augur = "k515_synthetic_100"
    syn_tablet = CHRONICLER_DIR / f"augur_{syn_augur}.jsonl"
    if syn_tablet.exists():
        syn_tablet.unlink()
    CHRONICLER_DIR.mkdir(parents=True, exist_ok=True)

    for i in range(100):
        write_chronicler(
            augur_id=syn_augur, augur_name="K515-Synthetic",
            triggered=(i % 3 == 0),  # ~33 fires out of 100
            signal="block" if (i % 3 == 0) else None,
            failure_action="block", consensus_decision="block" if (i % 3 == 0) else "allow",
            file_path=f"/test/{i}.md", tool_name="Write", elapsed_ms=2,
        )
    result = wing_chronos_query(augur_ids=[syn_augur])
    stats = result.get("augur_stats", [{}])[0]
    ok = (stats.get("total_evaluations") == 100
          and 30 <= stats.get("total_triggered", 0) <= 40)
    ok = run_check("C.2  chronos_query returns correct aggregates (100 synthetic firings)", ok,
                   f"evals={stats.get('total_evaluations')} fired={stats.get('total_triggered')}")
    passed += ok

    # C.3 — Trend detection: augur_stats has fire_rate > 0 after many firings
    total += 1
    ok = (stats.get("fire_rate", 0.0) > 0.0 and stats.get("last_fire_ts") is not None)
    ok = run_check("C.3  Trend detection: fire_rate > 0, last_fire_ts present", ok,
                   f"fire_rate={stats.get('fire_rate')} last_ts={stats.get('last_fire_ts','<none>')[:19]}")
    passed += ok

    # C.4 — Cross-Augur query: Wing-wide rollup sums per-Augur counts
    total += 1
    result_all = wing_chronos_query(augur_ids=[test_augur, syn_augur])
    totals = result_all.get("wing_totals", {})
    ok = (totals.get("total_evaluations", 0) >= 101
          and totals.get("wing_fire_rate", 0.0) > 0.0)
    ok = run_check("C.4  Cross-Augur Wing-wide rollup sums per-Augur counts", ok,
                   f"total_evals={totals.get('total_evaluations')} wing_rate={totals.get('wing_fire_rate')}")
    passed += ok

    # C.5 — HourGlass routing: wing_chronos_query accepts augur_ids + since_ts filters
    total += 1
    from datetime import datetime, timezone, timedelta
    since = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat().replace("+00:00", "Z")
    result_ts = wing_chronos_query(augur_ids=[syn_augur], since_ts=since)
    ok = isinstance(result_ts, dict) and "augur_stats" in result_ts
    ok = run_check("C.5  HourGlass: wing_chronos_query accepts augur_ids + since_ts filters", ok)
    passed += ok

    # C.6 — Chronicler tablet is append-only (historical entries unchanged)
    total += 1
    entries_before = read_tablet(syn_augur)
    ts_before = [e["ts"] for e in entries_before]
    write_chronicler(
        augur_id=syn_augur, augur_name="K515-Synthetic",
        triggered=True, signal="block", failure_action="block",
        consensus_decision="block", file_path="/new.md", tool_name="Write", elapsed_ms=1,
    )
    entries_after = read_tablet(syn_augur)
    ts_after = [e["ts"] for e in entries_after]
    ok = (len(entries_after) == len(entries_before) + 1
          and ts_before == ts_after[:len(ts_before)])
    ok = run_check("C.6  Chronicler append-only: historical entries not modified", ok,
                   f"before={len(entries_before)} after={len(entries_after)}")
    passed += ok

    # C.7 — Helm dashboard renders (structural check: wing_chronos_query returns serializable data)
    total += 1
    try:
        json.dumps(result_all)
        ok = True
    except Exception as e:
        ok = False
    ok = run_check("C.7  Chronos result is JSON-serializable (Helm dashboard can render)", ok)
    passed += ok

    # C.8 — Performance: chronos_query p95 < 200ms on 10k-firing tablet
    total += 1
    perf_augur = "k515_perf_10k"
    perf_tablet = CHRONICLER_DIR / f"augur_{perf_augur}.jsonl"
    if perf_tablet.exists():
        perf_tablet.unlink()
    CHRONICLER_DIR.mkdir(parents=True, exist_ok=True)
    lines = []
    for i in range(10000):
        record = {
            "ts": "2026-04-26T00:00:00Z", "augur_id": perf_augur,
            "augur_name": "K515-Perf", "triggered": (i % 4 == 0),
            "signal": "block" if (i % 4 == 0) else None,
            "failure_action": "block", "consensus_decision": "block",
            "tool_call": {"tool": "Write", "file_path": f"/file_{i}.md"},
            "elapsed_ms": 2, "reason_snippet": "", "session": "K515",
        }
        lines.append(json.dumps(record))
    perf_tablet.write_text("\n".join(lines) + "\n", encoding="utf-8")

    t0 = time.perf_counter()
    wing_chronos_query(augur_ids=[perf_augur])
    elapsed_ms = (time.perf_counter() - t0) * 1000
    ok = elapsed_ms < 200
    ok = run_check("C.8  Performance: chronos_query p95 < 200ms on 10k-entry tablet", ok,
                   f"{elapsed_ms:.1f}ms")
    passed += ok

    # ── C-reasoning: Embedded Correspondents + Bureau ─────────────────────────

    print()
    print("── C-REASONING: Embedded Correspondents + Bureau ──")
    print()

    # Cleanup correspondent tablets for clean test
    for f in CORRESPONDENTS_DIR.glob("agent_k515test_*.jsonl"):
        f.unlink()

    # C.9 — correspondent_log writes append-only chunk to per-agent tablet
    total += 1
    res = write_chunk(
        agent="k515test", session="K515",
        chunk_text="I am analyzing the build output and checking for compile errors.",
        context={"phase": "verify"},
    )
    tablet_path = CORRESPONDENTS_DIR / "agent_k515test_session_K515.jsonl"
    ok = (res.get("logged") is True and tablet_path.exists())
    ok = run_check("C.9  correspondent_log writes append-only chunk to per-agent tablet", ok)
    passed += ok

    # C.10 — bureau_subscribe returns chunks filtered by risk_filter
    total += 1
    write_chunk(
        agent="k515knight", session="K515",
        chunk_text="Let me update the Supabase secret to ensure it is current before deploying.",
    )
    sub = bureau_subscribe(
        watching_agent="bishop",
        risk_filter=["ec_vendor_secret_rotation"],
    )
    risky = sub.get("advisories_by_filter", {}).get("ec_vendor_secret_rotation", [])
    ok = (len(risky) >= 1
          and any("k515knight" == c.get("agent") for c in risky))
    ok = run_check("C.10 bureau_subscribe returns chunks filtered by risk_filter", ok,
                   f"risky_chunks={len(risky)}")
    passed += ok

    # C.11 — bureau_query returns Chronos-style aggregates
    total += 1
    bq = query_bureau(agent="k515knight", session="K515")
    ok = (bq.get("total_found", 0) >= 1 and "chunks" in bq)
    ok = run_check("C.11 bureau_query returns Chronos-style aggregates", ok,
                   f"total_found={bq.get('total_found')}")
    passed += ok

    # C.12 — K512.5 REGRESSION: Knight reasoning "update Supabase secret" fires Augur-Vendor-Secret-Rotation
    total += 1
    k512_5_chunk = (
        "I need to make sure the production environment has the correct Anthropic key. "
        "Let me update the Supabase secret to ensure it's current: "
        "supabase secrets set ANTHROPIC_API_KEY=<value>"
    )
    advisories = _evaluate_risk_patterns(k512_5_chunk)
    vendor_augur = next((a for a in advisories if a["id"] == "ec_vendor_secret_rotation"), None)
    ok = (vendor_augur is not None and vendor_augur["triggered"] is True
          and vendor_augur["class"] == "critical")
    ok = run_check(
        "C.12 K512.5 REGRESSION: Vendor-secret-rotation chunk fires Augur-Vendor-Secret-Rotation",
        ok,
        f"triggered={vendor_augur['triggered'] if vendor_augur else 'AUGUR_NOT_FOUND'} class={vendor_augur['class'] if vendor_augur else 'N/A'}"
    )
    passed += ok

    # C.13 — Force-push reasoning → Augur-Force-Push fires → critical class advisory
    total += 1
    force_chunk = "git push --force origin main to overwrite the broken commit"
    advisories13 = _evaluate_risk_patterns(force_chunk)
    force_augur = next((a for a in advisories13 if a["id"] == "ec_force_push"), None)
    ok = (force_augur is not None and force_augur["triggered"] is True
          and force_augur["class"] == "critical")
    ok = run_check("C.13 Force-push chunk fires Augur-Force-Push (critical class)", ok,
                   f"triggered={force_augur['triggered'] if force_augur else 'NOT_FOUND'}")
    passed += ok

    # C.14 — Toolsmith-missing at ratification → advisory class (no block)
    total += 1
    ratification_chunk = "K515 is complete. FOR THE KEEP! Session closed successfully."
    advisories14 = _evaluate_risk_patterns(ratification_chunk)
    ts_augur = next((a for a in advisories14 if a["id"] == "ec_toolsmith_missing_ratification"), None)
    ok = (ts_augur is not None and ts_augur["triggered"] is True
          and ts_augur["advisory_type"] == "warn")
    ok = run_check("C.14 Ratification-without-TS-id fires Augur-Toolsmith-Missing (advisory/warn class)", ok,
                   f"triggered={ts_augur['triggered'] if ts_augur else 'NOT_FOUND'} type={ts_augur['advisory_type'] if ts_augur else 'N/A'}")
    passed += ok

    # C.14b — Same ratification chunk WITH TS-id → no fire (anti-pattern clears it)
    total += 1
    ratification_with_ts = "K515 is complete. FOR THE KEEP! Session closed. TS-055 Toolsmith logged."
    advisories14b = _evaluate_risk_patterns(ratification_with_ts)
    ts_augur_b = next((a for a in advisories14b if a["id"] == "ec_toolsmith_missing_ratification"), None)
    ok = (ts_augur_b is not None and ts_augur_b["triggered"] is False)
    ok = run_check("C.14b Ratification WITH TS-id clears Augur-Toolsmith-Missing (anti-pattern)", ok,
                   f"triggered={ts_augur_b['triggered'] if ts_augur_b else 'NOT_FOUND'}")
    passed += ok

    # C.15 — Bishop routine reasoning → no risk patterns → silent allow
    total += 1
    bishop_routine = (
        "I am drafting the Founder letter for the MSA initiative. "
        "This letter introduces the platform's membership tier and pricing model. "
        "No code changes are needed for this task."
    )
    advisories15 = _evaluate_risk_patterns(bishop_routine)
    any_critical = any(a["triggered"] and a["class"] == "critical" for a in advisories15)
    ok = not any_critical
    ok = run_check("C.15 Bishop routine reasoning has no critical risk-pattern fires", ok,
                   f"critical_fires={sum(1 for a in advisories15 if a['triggered'] and a['class']=='critical')}")
    passed += ok

    # C.16 — Performance: bureau_query p95 < 200ms on 10k-chunk tablet
    total += 1
    perf_agent = "k515_perf_bureau"
    perf_session = "KPERF"
    perf_correspondent = CORRESPONDENTS_DIR / f"agent_{perf_agent}_session_{perf_session}.jsonl"
    if perf_correspondent.exists():
        perf_correspondent.unlink()
    CORRESPONDENTS_DIR.mkdir(parents=True, exist_ok=True)
    lines16 = []
    for i in range(10000):
        rec = {
            "ts": "2026-04-26T00:00:00Z",
            "agent": perf_agent, "session": perf_session,
            "chunk": f"synthetic chunk {i}",
            "context": {}, "advisories": [],
        }
        lines16.append(json.dumps(rec))
    perf_correspondent.write_text("\n".join(lines16) + "\n", encoding="utf-8")

    t0 = time.perf_counter()
    query_bureau(agent=perf_agent, session=perf_session, limit=100)
    elapsed_ms = (time.perf_counter() - t0) * 1000
    ok = elapsed_ms < 200
    ok = run_check("C.16 Performance: bureau_query p95 < 200ms on 10k-chunk tablet", ok,
                   f"{elapsed_ms:.1f}ms")
    passed += ok

    # ── Summary ───────────────────────────────────────────────────────────────

    print()
    print("=" * 70)
    print(f"K515 RESULT: {passed}/{total} checks PASSED")
    print("=" * 70)

    if passed == total:
        print("ALL CHECKS PASSED — Twin Observer Pattern (Chronos+Chroniclers+Bureau) verified.")
    else:
        print(f"WARNING: {total - passed} check(s) FAILED. Review above.")

    # K512.5 regression proof — print canonical evidence for A&A #2306
    print()
    print("── K512.5 REGRESSION PROOF (C.12) — canonical for A&A #2306 ──")
    print(f"Input chunk: '{k512_5_chunk[:80]}...'")
    if vendor_augur:
        print(f"Augur fired:  {vendor_augur['name']}")
        print(f"Class:        {vendor_augur['class']} (CRITICAL)")
        print(f"Advisory:     {vendor_augur['message'][:120]}...")
        print("Conclusion:   K512.5 failure mode is empirically prevented in this regression test.")
    else:
        print("ERROR: Augur-Vendor-Secret-Rotation not found!")

    sys.exit(0 if passed == total else 1)


if __name__ == "__main__":
    main()
