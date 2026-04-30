"""
Herder Scribe — Component 8: Initial Seed Observations
KN013 / A&A #2297

Backfills observation events from BP001 + BP002 Knight commits already on disk.

Sources:
  - KN001 Eblet build (BP001)
  - KN005 / KN002 / KN003 / KN004 (Pod A BP002)
  - KN006 / KN007 / KN008 (Pod B BP002)
  - KN009 (Pod C BP002)
  - KN010 (Pod D Bean1 BP002)
  - KN011 (Pod D Bean2 BP002)
  - (KN013 itself will add its own observation at closeout)

Context-cost estimates come from Founder / Bishop notes and commit sizes.
These are seed approximations; empirical precision improves as Herder Scribe
accumulates real observations.

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from herder_observe import record_observation, load_observations, _TABLET_PATH

SEED_OBSERVATIONS: List[Dict[str, Any]] = [
    {
        "bean_id": "KN001",
        "pod_id": "POD-BP001-A",
        "session_id": "K430-BP001",
        "start_timestamp": "2026-04-22T10:00:00Z",
        "end_timestamp": "2026-04-22T12:30:00Z",
        "context_cost_pp": 35.0,
        "lines_added": 280,
        "files_touched": 7,
        "tests_run": 12,
        "tests_passed": 12,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": False,
        "canonical_path_resolution_count": 1,
        "grep_count": 5,
        "bean_class": "medium",
        "phase_c_component_count": 4,
        "test_density": 1.7,
        "wrasse_density": 0.0,
        "notes": "Seed: BP001 Eblet build — inaugural bean",
        "seed": True,
    },
    {
        "bean_id": "KN002",
        "pod_id": "POD-A-BP002",
        "session_id": "K440-BP002",
        "start_timestamp": "2026-04-25T09:00:00Z",
        "end_timestamp": "2026-04-25T11:00:00Z",
        "context_cost_pp": 28.0,
        "lines_added": 210,
        "files_touched": 6,
        "tests_run": 15,
        "tests_passed": 15,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 3,
        "grep_count": 2,
        "bean_class": "medium",
        "phase_c_component_count": 4,
        "test_density": 2.5,
        "wrasse_density": 0.3,
        "notes": "Seed: Pod A BP002",
        "seed": True,
    },
    {
        "bean_id": "KN003",
        "pod_id": "POD-A-BP002",
        "session_id": "K440-BP002",
        "start_timestamp": "2026-04-25T11:15:00Z",
        "end_timestamp": "2026-04-25T13:00:00Z",
        "context_cost_pp": 25.0,
        "lines_added": 185,
        "files_touched": 5,
        "tests_run": 18,
        "tests_passed": 18,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 4,
        "grep_count": 1,
        "bean_class": "medium",
        "phase_c_component_count": 3,
        "test_density": 3.6,
        "wrasse_density": 0.4,
        "notes": "Seed: Pod A BP002 warm bean",
        "seed": True,
    },
    {
        "bean_id": "KN004",
        "pod_id": "POD-A-BP002",
        "session_id": "K440-BP002",
        "start_timestamp": "2026-04-25T13:30:00Z",
        "end_timestamp": "2026-04-25T15:00:00Z",
        "context_cost_pp": 22.0,
        "lines_added": 165,
        "files_touched": 4,
        "tests_run": 14,
        "tests_passed": 14,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 4,
        "grep_count": 1,
        "bean_class": "small",
        "phase_c_component_count": 3,
        "test_density": 3.5,
        "wrasse_density": 0.5,
        "notes": "Seed: Pod A BP002 final bean — context warm, compact",
        "seed": True,
    },
    {
        "bean_id": "KN005",
        "pod_id": "POD-A-BP002",
        "session_id": "K442-BP002",
        "start_timestamp": "2026-04-26T08:00:00Z",
        "end_timestamp": "2026-04-26T10:30:00Z",
        "context_cost_pp": 38.0,
        "lines_added": 320,
        "files_touched": 9,
        "tests_run": 22,
        "tests_passed": 22,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 5,
        "grep_count": 3,
        "bean_class": "large",
        "phase_c_component_count": 6,
        "test_density": 2.4,
        "wrasse_density": 0.6,
        "notes": "Seed: KN005 Pod A BP002 — largest Pod-A bean",
        "seed": True,
    },
    {
        "bean_id": "KN006",
        "pod_id": "POD-B-BP002",
        "session_id": "K445-BP002",
        "start_timestamp": "2026-04-27T09:00:00Z",
        "end_timestamp": "2026-04-27T11:30:00Z",
        "context_cost_pp": 40.0,
        "lines_added": 350,
        "files_touched": 10,
        "tests_run": 20,
        "tests_passed": 20,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 6,
        "grep_count": 2,
        "bean_class": "large",
        "phase_c_component_count": 6,
        "test_density": 2.0,
        "wrasse_density": 0.7,
        "notes": "Seed: Pod B BP002 bean 1",
        "seed": True,
    },
    {
        "bean_id": "KN007",
        "pod_id": "POD-B-BP002",
        "session_id": "K445-BP002",
        "start_timestamp": "2026-04-27T12:00:00Z",
        "end_timestamp": "2026-04-27T13:30:00Z",
        "context_cost_pp": 30.0,
        "lines_added": 240,
        "files_touched": 7,
        "tests_run": 18,
        "tests_passed": 18,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 5,
        "grep_count": 2,
        "bean_class": "medium",
        "phase_c_component_count": 5,
        "test_density": 2.57,
        "wrasse_density": 0.6,
        "notes": "Seed: Pod B BP002 bean 2 — warm session",
        "seed": True,
    },
    {
        "bean_id": "KN008",
        "pod_id": "POD-B-BP002",
        "session_id": "K445-BP002",
        "start_timestamp": "2026-04-27T14:00:00Z",
        "end_timestamp": "2026-04-27T15:30:00Z",
        "context_cost_pp": 26.0,
        "lines_added": 200,
        "files_touched": 5,
        "tests_run": 16,
        "tests_passed": 16,
        "commits_emitted": 1,
        "phase_completion_flags": {"A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 5,
        "grep_count": 1,
        "bean_class": "medium",
        "phase_c_component_count": 4,
        "test_density": 3.2,
        "wrasse_density": 0.65,
        "notes": "Seed: Pod B BP002 bean 3 — compact tail bean",
        "seed": True,
    },
    {
        "bean_id": "KN009",
        "pod_id": "POD-C-BP002",
        "session_id": "K448-BP002",
        "start_timestamp": "2026-04-28T10:00:00Z",
        "end_timestamp": "2026-04-28T14:30:00Z",
        "context_cost_pp": 55.0,
        "lines_added": 620,
        "files_touched": 16,
        "tests_run": 45,
        "tests_passed": 45,
        "commits_emitted": 1,
        "phase_completion_flags": {"A0": True, "A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-opus-4-7",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 8,
        "grep_count": 3,
        "bean_class": "large",
        "phase_c_component_count": 9,
        "test_density": 2.8,
        "wrasse_density": 0.8,
        "notes": "Seed: KN009 Chandelier Substrate — bedrock, largest single bean in BP002",
        "seed": True,
    },
    {
        "bean_id": "KN010",
        "pod_id": "POD-D-BP002",
        "session_id": "K450-BP002",
        "start_timestamp": "2026-04-29T20:00:00Z",
        "end_timestamp": "2026-04-29T22:00:00Z",
        "context_cost_pp": 45.0,
        "lines_added": 520,
        "files_touched": 12,
        "tests_run": 30,
        "tests_passed": 30,
        "commits_emitted": 1,
        "phase_completion_flags": {"A0": True, "A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-sonnet-4-6",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 7,
        "grep_count": 2,
        "bean_class": "large",
        "phase_c_component_count": 8,
        "test_density": 2.5,
        "wrasse_density": 0.75,
        "notes": "Seed: KN010 Chandelier Diagnostic Queries + Three-Mode Comparator",
        "seed": True,
    },
    {
        "bean_id": "KN011",
        "pod_id": "POD-D-BP002",
        "session_id": "K450-BP002",
        "start_timestamp": "2026-04-29T22:05:00Z",
        "end_timestamp": "2026-04-29T22:55:00Z",
        "context_cost_pp": 18.0,
        "lines_added": 280,
        "files_touched": 7,
        "tests_run": 16,
        "tests_passed": 16,
        "commits_emitted": 1,
        "phase_completion_flags": {"A0": True, "A": True, "B": True, "C": True, "D": True, "E": True},
        "vendor": "anthropic",
        "model": "claude-sonnet-4-6",
        "ide": "cursor",
        "wrasse_pre_injection_flag": True,
        "canonical_path_resolution_count": 5,
        "grep_count": 1,
        "bean_class": "medium",
        "phase_c_component_count": 3,
        "test_density": 4.0,
        "wrasse_density": 0.8,
        "notes": "Seed: KN011 First Pudding — compact warm bean, stayed in session",
        "seed": True,
    },
]


def backfill(tablet_path: Path = _TABLET_PATH) -> Dict[str, Any]:
    """
    Backfill all seed observations, skipping any already stored.
    Returns summary of actions.
    """
    existing = load_observations(tablet_path)
    existing_ids = {o.get("bean_id") for o in existing}

    results = {"skipped": [], "stored": [], "errors": []}
    for obs in SEED_OBSERVATIONS:
        bid = obs["bean_id"]
        if bid in existing_ids:
            results["skipped"].append(bid)
            continue
        result = record_observation(obs, tablet_path)
        if result["status"] == "stored":
            results["stored"].append(bid)
        else:
            results["errors"].append({"bean_id": bid, "errors": result.get("errors", [])})

    return {
        "total_seed": len(SEED_OBSERVATIONS),
        "stored": results["stored"],
        "skipped": results["skipped"],
        "errors": results["errors"],
    }


if __name__ == "__main__":
    summary = backfill()
    print(json.dumps(summary, indent=2))
