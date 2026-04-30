"""
KN025 — Ingest 9 Pod G+H+I observations into herder training data.
Run once: python -m librarian-mcp.stitchpunks.herder.ingest_kn025_observations
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

_HERE = Path(__file__).parent
_OBS_FILE = _HERE / "observations" / "herder_observations.jsonl"


def _iso_now():
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _make_hash(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


# 9 new observations from PAPER 004 Part 2 (KN014-KN022, Pods G+H+I)
NEW_OBSERVATIONS = [
    # Pod G — fresh session, beans 1-3
    {
        "bean_id": "KN014", "pod_id": "POD-G-BP002", "session_id": "K553-BP002",
        "bean_class": "small", "context_cost_pp": 4.0,
        "phase_c_component_count": 2, "test_density": 11.0, "wrasse_density": 1.2,
        "canonical_path_resolution_count": 2, "grep_count": 1,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_first", "bean_ordinal_in_pod": 1,
        "cumulative_pp_at_start": 0.0, "composes_on_warm_infrastructure": False,
        "cross_pod_ordinal": 1,
        "lines_added": 50, "files_touched": 3, "tests_run": 33, "tests_passed": 33,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN014 Herder Test Isolation Patch — Pod G bean 1, fresh session",
    },
    {
        "bean_id": "KN015", "pod_id": "POD-G-BP002", "session_id": "K553-BP002",
        "bean_class": "medium", "context_cost_pp": 12.0,
        "phase_c_component_count": 3, "test_density": 0.0, "wrasse_density": 0.8,
        "canonical_path_resolution_count": 3, "grep_count": 2,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_warm", "bean_ordinal_in_pod": 2,
        "cumulative_pp_at_start": 4.0, "composes_on_warm_infrastructure": False,
        "cross_pod_ordinal": 2,
        "lines_added": 800, "files_touched": 4, "tests_run": 0, "tests_passed": 0,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN015 Foundation Paper Polish ~10K words — Pod G bean 2",
    },
    {
        "bean_id": "KN016", "pod_id": "POD-G-BP002", "session_id": "K553-BP002",
        "bean_class": "medium", "context_cost_pp": 16.0,
        "phase_c_component_count": 4, "test_density": 3.75, "wrasse_density": 1.0,
        "canonical_path_resolution_count": 4, "grep_count": 3,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_deep_warm", "bean_ordinal_in_pod": 3,
        "cumulative_pp_at_start": 16.0, "composes_on_warm_infrastructure": False,
        "cross_pod_ordinal": 3,
        "lines_added": 300, "files_touched": 8, "tests_run": 15, "tests_passed": 15,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN016 Bishop Sweeper+Scavenger MVP — Pod G bean 3",
    },
    # Pod H — cross-pod warm (cumulative context carries over from Pod G)
    {
        "bean_id": "KN017", "pod_id": "POD-H-BP002", "session_id": "K553-BP002",
        "bean_class": "medium", "context_cost_pp": 13.0,
        "phase_c_component_count": 4, "test_density": 4.75, "wrasse_density": 1.0,
        "canonical_path_resolution_count": 4, "grep_count": 2,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_first", "bean_ordinal_in_pod": 1,
        "cumulative_pp_at_start": 32.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 4,
        "lines_added": 220, "files_touched": 6, "tests_run": 19, "tests_passed": 19,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN017 Mercury Bank Write-Path Activation — Pod H bean 1, cross-pod warm",
    },
    {
        "bean_id": "KN018", "pod_id": "POD-H-BP002", "session_id": "K553-BP002",
        "bean_class": "medium-large", "context_cost_pp": 20.0,
        "phase_c_component_count": 5, "test_density": 4.0, "wrasse_density": 1.0,
        "canonical_path_resolution_count": 5, "grep_count": 2,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_warm", "bean_ordinal_in_pod": 2,
        "cumulative_pp_at_start": 45.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 5,
        "lines_added": 280, "files_touched": 7, "tests_run": 20, "tests_passed": 20,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN018 Pawn-via-API MCP Wrapper Cylinder 7 — Pod H bean 2",
    },
    {
        "bean_id": "KN019", "pod_id": "POD-H-BP002", "session_id": "K553-BP002",
        "bean_class": "large", "context_cost_pp": 15.0,
        "phase_c_component_count": 6, "test_density": 3.33, "wrasse_density": 1.0,
        "canonical_path_resolution_count": 6, "grep_count": 2,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_deep_warm", "bean_ordinal_in_pod": 3,
        "cumulative_pp_at_start": 65.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 6,
        "lines_added": 350, "files_touched": 9, "tests_run": 20, "tests_passed": 20,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN019 Cathedral Cross-Vendor Benchmark — Pod H bean 3, compose-on-warm large",
    },
    # Pod I — cross-pod deep warm (cumulative context high, late-session amortization)
    {
        "bean_id": "KN020", "pod_id": "POD-I-BP002", "session_id": "K553-BP002",
        "bean_class": "medium", "context_cost_pp": 12.0,
        "phase_c_component_count": 4, "test_density": 4.75, "wrasse_density": 1.0,
        "canonical_path_resolution_count": 4, "grep_count": 2,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_first", "bean_ordinal_in_pod": 1,
        "cumulative_pp_at_start": 80.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 7,
        "lines_added": 260, "files_touched": 7, "tests_run": 19, "tests_passed": 19,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN020 Wave-1 Distribution Channels — Pod I bean 1, cross_pod_ordinal=7 late",
    },
    {
        "bean_id": "KN021", "pod_id": "POD-I-BP002", "session_id": "K553-BP002",
        "bean_class": "medium", "context_cost_pp": 8.0,
        "phase_c_component_count": 3, "test_density": 0.0, "wrasse_density": 0.9,
        "canonical_path_resolution_count": 3, "grep_count": 1,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_late", "bean_ordinal_in_pod": 2,
        "cumulative_pp_at_start": 92.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 8,
        "lines_added": 180, "files_touched": 5, "tests_run": 0, "tests_passed": 0,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN021 Tagline V4 Cephas — Pod I bean 2, late-session amortization confirmed",
    },
    {
        "bean_id": "KN022", "pod_id": "POD-I-BP002", "session_id": "K553-BP002",
        "bean_class": "small", "context_cost_pp": 5.0,
        "phase_c_component_count": 2, "test_density": 0.0, "wrasse_density": 0.9,
        "canonical_path_resolution_count": 2, "grep_count": 1,
        "wrasse_pre_injection_flag": True,
        "session_position_class": "pod_late", "bean_ordinal_in_pod": 3,
        "cumulative_pp_at_start": 100.0, "composes_on_warm_infrastructure": True,
        "cross_pod_ordinal": 9,
        "lines_added": 50, "files_touched": 2, "tests_run": 0, "tests_passed": 0,
        "commits_emitted": 1, "vendor": "anthropic", "model": "claude-sonnet-4-6",
        "ide": "cursor", "seed": True,
        "notes": "KN022 Korinek Letter Mechanical Prep Rule 11B — Pod I bean 3, tail bean",
    },
]


def ingest(dry_run: bool = False) -> dict:
    """Ingest the 9 new observations. Idempotent (skips existing bean_ids)."""
    # Load existing observations to check for duplicates
    existing_ids = set()
    if _OBS_FILE.exists():
        for line in _OBS_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line:
                try:
                    obs = json.loads(line)
                    existing_ids.add(obs.get("bean_id", ""))
                except Exception:
                    pass

    observed_at = _iso_now()
    added = []
    skipped = []

    for obs in NEW_OBSERVATIONS:
        bean_id = obs["bean_id"]
        if bean_id in existing_ids:
            skipped.append(bean_id)
            continue

        full_obs = {
            "type": "herder_observation",
            **obs,
            "start_timestamp": "2026-04-30T00:00:00Z",
            "end_timestamp": "2026-04-30T04:00:00Z",
            "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
            "observed_at": observed_at,
        }
        obs_id = f"H-{obs['session_id']}-{bean_id}-{_make_hash(bean_id)[:8]}"
        full_obs["observation_id"] = obs_id
        full_obs["chronicler_hash"] = _make_hash(obs_id)

        if not dry_run:
            with open(_OBS_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(full_obs) + "\n")
        added.append(bean_id)

    # Count final observations
    n_total = len(_OBS_FILE.read_text(encoding="utf-8").strip().splitlines()) if _OBS_FILE.exists() else 0

    return {
        "added": added,
        "skipped": skipped,
        "n_added": len(added),
        "n_skipped": len(skipped),
        "n_total_observations": n_total,
        "dry_run": dry_run,
    }


if __name__ == "__main__":
    result = ingest()
    print(f"KN025 ingest: +{result['n_added']} observations (skipped {result['n_skipped']})")
    print(f"Total observations: {result['n_total_observations']}")
    print(f"Added: {result['added']}")
