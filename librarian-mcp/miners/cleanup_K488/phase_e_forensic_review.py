"""
K488 Phase E — K487 Forensic Review + Cleanup-needs Flagging

Reads the K487 population snapshot and cross-reference data to triage
everything K487 surfaced that is NOT covered by Phases A-D:

- Memory-pressure observations
- Performance bottlenecks
- Wells with anomalous cross-reference distribution
- File-types skipped
- Encoding issues

Triages into: Cleanup (this session) | Architecture (defer) | Skip

K488 · B123 · Phase E
"""

from __future__ import annotations

import json
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

MINERS_DIR = Path(__file__).parent.parent
SNAP = MINERS_DIR / "miner_population_snapshot_K487.jsonl"
CLEANUP_DIR = Path(__file__).parent
AUDIT_LOG = CLEANUP_DIR / "audit_log_K488_phase_e.json"
FORENSIC_REPORT = CLEANUP_DIR / "forensic_review_K487_K488.json"


def load_snapshot() -> list[dict]:
    miners = []
    with SNAP.open() as f:
        for line in f:
            miners.append(json.loads(line))
    return miners


def analyze_cross_refs(miners: list[dict]) -> dict:
    """Analyze cross-reference distribution for anomalies."""
    crossref_by_topic: dict[str, list[int]] = {}
    for m in miners:
        topic = m.get("primary_topic") or "unknown"
        xref = m.get("cross_ref_count", 0)
        crossref_by_topic.setdefault(topic, []).append(xref)

    summary = {}
    for topic, counts in sorted(crossref_by_topic.items(), key=lambda x: -max(x[1])):
        summary[topic] = {
            "miner_count": len(counts),
            "max_crossref": max(counts),
            "min_crossref": min(counts),
            "total_crossref": sum(counts),
            "anomalous": max(counts) > 50000,
        }
    return summary


def tablet_count_distribution(miners: list[dict]) -> dict:
    """Summarize tablet count distribution across Miners."""
    active = [m for m in miners if m.get("tablet_count", 0) > 0]
    ghost = [m for m in miners if m.get("tablet_count", 0) == 0]

    if active:
        counts = [m["tablet_count"] for m in active]
        return {
            "active_miners": len(active),
            "ghost_miners": len(ghost),
            "max_tablets": max(counts),
            "min_tablets": min(counts),
            "avg_tablets": round(sum(counts) / len(counts)),
            "total_tablets": sum(counts),
        }
    return {"active_miners": 0, "ghost_miners": len(ghost)}


def main() -> None:
    t_start = time.time()
    print("[PhaseE] K488 Phase E -- K487 Forensic Review")
    print()

    miners = load_snapshot()
    print(f"[PhaseE] Loaded {len(miners)} Miners")

    # ── Analysis 1: Tablet distribution ────────────────────────────────────────
    tab_dist = tablet_count_distribution(miners)
    print(f"[PhaseE] Tablet distribution:")
    print(f"  Active Miners: {tab_dist['active_miners']}")
    print(f"  Ghost Miners:  {tab_dist['ghost_miners']}")
    print(f"  Total tablets: {tab_dist.get('total_tablets', 0):,}")
    print(f"  Max per Miner: {tab_dist.get('max_tablets', 0):,}")
    print()

    # ── Analysis 2: Cross-reference anomalies ─────────────────────────────────
    xref_analysis = analyze_cross_refs(miners)
    anomalous = {t: v for t, v in xref_analysis.items() if v["anomalous"]}
    print(f"[PhaseE] Cross-reference anomalies (>50K):")
    for topic, data in anomalous.items():
        print(f"  topic={topic!r}: {data['miner_count']} miners, "
              f"max={data['max_crossref']:,}, total={data['total_crossref']:,}")
    print()

    # ── Analysis 3: Encoding issues ────────────────────────────────────────────
    # K487 surfaced 790 corrupted JSON lines in the ledger (orphan-process writes)
    # plus the CP1252 crash on the unicode emoji in the run banner.
    encoding_issues = {
        "corrupted_ledger_lines": 790,
        "cause": "Orphan-process concurrent writes produced partial/split JSON lines",
        "emoji_crash": {
            "event": "CP1252 UnicodeEncodeError on unicode checkmark in summary banner",
            "fix": "Remove emoji from print() calls in mining scripts",
            "also_affected": "run_k487_post_mining.py banner was already fixed; phase_a_ledger_rebuild.py hit same issue and was patched"
        },
        "encoding_policy": (
            "All Python scripts in this workspace should set PYTHONIOENCODING=utf-8 "
            "or use sys.stdout.reconfigure(encoding='utf-8') at startup. "
            "Alternatively, avoid unicode emoji in stdout on Windows."
        )
    }

    # ── Analysis 4: File-types skipped ─────────────────────────────────────────
    skipped_types = {
        "pdfs": {
            "status": "skipped",
            "reason": "path.read_text() raises UnicodeDecodeError on binary PDF; caught by except Exception -> returns []",
            "count_estimate": "unknown — not tracked in K487",
            "triage": "Architecture (defer): add PDF text extraction (pdfplumber/pymupdf) in K-future",
        },
        "docx": {
            "status": "skipped",
            "reason": "Same: binary file; read_text() fails silently",
            "triage": "Architecture (defer): add python-docx extraction in K-future",
        },
        "html": {
            "status": "partially_processed",
            "reason": "read_text() succeeds but HTML tags become noisy keywords (tag names tokenize as words)",
            "triage": "Architecture (defer): add BeautifulSoup stripping before keyword extraction",
        },
        "images": {
            "status": "skipped",
            "reason": "Binary; silently returns [] from read_text() except block",
            "triage": "Skip: no text to mine",
        },
    }

    # ── Analysis 5: Performance observations ──────────────────────────────────
    performance = {
        "files_processed": 16176,
        "elapsed_mining_sec": 1919,
        "mining_rate_files_per_sec": round(16176 / 1919, 2),
        "tablets_produced": tab_dist.get("total_tablets", 0),
        "tablets_per_sec": round(tab_dist.get("total_tablets", 0) / 1919, 1),
        "miner_cap_hit": True,
        "miner_cap_value": 50,
        "ghost_miners_from_cap": 151,
        "ram_pressure": {
            "observation": "MAX_KEYWORD_POOL=2000 cap (K474 rule) applied per Miner; prevented OOM",
            "note": "201 Miners x 2000-word pools = max 402K total words in-memory at peak",
            "recommendation": "Current cap is appropriate for 65GB corpus; re-evaluate if Miner count grows 5x",
        },
        "eta_accuracy": {
            "observation": "ETA not tracked in K487 harness",
            "recommendation": "Add progress ETA to K-future harness based on files_processed/files_total rate",
        },
    }

    # ── Triage table ──────────────────────────────────────────────────────────
    triage = [
        {
            "finding": "790 corrupted JSON lines in ip_ledger.jsonl",
            "disposition": "Cleanup (Phase A)",
            "status": "RESOLVED",
        },
        {
            "finding": "99,775 hash-chain breaks in ip_ledger.jsonl",
            "disposition": "Cleanup (Phase A)",
            "status": "RESOLVED",
        },
        {
            "finding": "academic_paper_non_speculative_002 as primary_topic for 16 Miners",
            "disposition": "Cleanup (Phase B)",
            "status": "RESOLVED — miner.py patched with FILENAME_STEM_PATTERNS filter",
        },
        {
            "finding": "threading.Lock insufficient for cross-process concurrent writes",
            "disposition": "Cleanup (Phase C)",
            "status": "RESOLVED — TS-022 written; primary fix: taskkill /F /T",
        },
        {
            "finding": "151 ghost Miners (capped by MAX_DAUGHTERS_PER_MINER)",
            "disposition": "Cleanup (Phase D)",
            "status": "RESOLVED — Catacombs entries written",
        },
        {
            "finding": "'credits' topic at 73,194 cross-references per Miner",
            "disposition": "Architecture (defer)",
            "status": "FLAG — credits is a genuine high-density domain in Liana Banyan corpus "
                       "(financial/cooperative credits are central platform concept). "
                       "73K cross-refs is expected given platform focus. "
                       "Monitor: if >1M in K-future, investigate cross-reference threshold (currently 0.40).",
        },
        {
            "finding": "PDF/DOCX files silently skipped",
            "disposition": "Architecture (defer to K-future)",
            "status": "DOCUMENTED — add pdfplumber + python-docx in K-future sprint",
        },
        {
            "finding": "HTML files partially processed (tag noise in keywords)",
            "disposition": "Architecture (defer)",
            "status": "DOCUMENTED — add BeautifulSoup stripping in K-future",
        },
        {
            "finding": "CP1252 encoding crash on emoji in print() calls",
            "disposition": "Cleanup (this session)",
            "status": "RESOLVED — emoji removed from Phase A script; policy: use ASCII-safe output on Windows",
        },
        {
            "finding": "No ETA tracking in mining harness",
            "disposition": "Architecture (defer)",
            "status": "DOCUMENTED — add progress ETA to K-future harness",
        },
        {
            "finding": "MAX_KEYWORD_POOL=2000 cap causing keyword loss in high-density Miners",
            "disposition": "Architecture (defer)",
            "status": "DOCUMENTED — cap is appropriate for K487 scale; revisit if Miner count 5x grows",
        },
        {
            "finding": "Miner-cap at 50 (MAX_DAUGHTERS_PER_MINER=4, depth 6 = max 50 total)",
            "disposition": "Architecture (defer)",
            "status": "DOCUMENTED — Ghost Miner Catacombs disposition is the forward resolution; "
                       "actual Miner-cap policy refinement is a Founder + Bishop design decision",
        },
    ]

    elapsed = time.time() - t_start

    forensic = {
        "session": "K488",
        "phase": "E",
        "description": "K487 forensic review and cleanup-needs triage",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "elapsed_sec": round(elapsed, 2),
        "tablet_distribution": tab_dist,
        "crossref_analysis_top": {
            k: v for k, v in list(xref_analysis.items())[:15]
        },
        "anomalous_crossref_topics": anomalous,
        "encoding_issues": encoding_issues,
        "skipped_file_types": skipped_types,
        "performance_observations": performance,
        "triage_table": triage,
        "triage_summary": {
            "RESOLVED": sum(1 for t in triage if t["status"].startswith("RESOLVED")),
            "ARCHITECTURE_DEFER": sum(1 for t in triage if "defer" in t["disposition"].lower()),
            "DOCUMENTED": sum(1 for t in triage if t["status"].startswith("DOCUMENTED")),
        },
    }

    with FORENSIC_REPORT.open("w", encoding="utf-8") as fh:
        json.dump(forensic, fh, indent=2)
    print(f"[PhaseE] Forensic report -> {FORENSIC_REPORT.name}")

    with AUDIT_LOG.open("w", encoding="utf-8") as fh:
        json.dump({"session": "K488", "phase": "E", "completed_at": forensic["completed_at"],
                   "triage_summary": forensic["triage_summary"]}, fh, indent=2)
    print(f"[PhaseE] Audit log -> {AUDIT_LOG.name}")

    print()
    print("=" * 60)
    print(f"[PhaseE] Phase E COMPLETE in {elapsed:.2f}s")
    resolved = forensic["triage_summary"]["RESOLVED"]
    deferred = forensic["triage_summary"]["ARCHITECTURE_DEFER"]
    print(f"[PhaseE]   Resolved in K488: {resolved} | Deferred to K-future: {deferred}")
    print("=" * 60)


if __name__ == "__main__":
    main()
