"""
Herder Scribe — Component 5: Wrasse Pre-Injection Registration
KN013 / A&A #2297

Registers Herder Scribe at Bishop-spawn-boundary so Bishop can query
"will it fit?" before assembling the next bean bundle.

Wrasse registry path:
  librarian-mcp/stitchpunks/wrasse/wrasse_registry.jsonl

Registers canonical paths for:
  - Herder observation tablet
  - Herder fingerprint registry
  - Herder model files
  - query_will_it_fit / query_predicted_context_climb MCP tools
  - record_observation hook

Toolsmith log: TS-HERDER-SCRIBE-T-SIPPING-REFINER-KN013-BP002
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

_HERE = Path(__file__).parent
_WORKSPACE_ROOT = _HERE.parent.parent.parent  # librarian-mcp/../..

# Locate wrasse registry writer
_WRASSE_PATH = _HERE.parent / "wrasse" / "wrasse_registry_writer.py"
sys.path.insert(0, str(_HERE.parent / "wrasse"))

from wrasse_registry_writer import append_if_new

SESSION_ID = "KN013-BP002"

HERDER_ENTRIES = [
    {
        "trigger_pattern": "Herder Scribe",
        "trigger_class": "vocabulary",
        "canonical_resolution": "librarian-mcp/stitchpunks/herder/ — T-Sipping Refiner / capacity-prediction Scribe (#2297). MCP tools in herder_query.ts. record_observation / query_will_it_fit / query_predicted_context_climb / query_fingerprint / query_model_confidence / compare_vendor_predictions.",
    },
    {
        "trigger_pattern": "T-Sipping Refiner",
        "trigger_class": "vocabulary",
        "canonical_resolution": "Herder Scribe (#2297) — substrate-capacity-prediction primitive. Observes Knight bean closeouts, derives fingerprints, trains linear regression (v1) / nearest-neighbor (v2) / generalized (v3) predictive models. Path: librarian-mcp/stitchpunks/herder/",
    },
    {
        "trigger_pattern": "query_will_it_fit",
        "trigger_class": "vocabulary",
        "canonical_resolution": "Herder Scribe MCP tool (herder_query.ts). Given beanpod_composition [{bean_class, vendor?}], predicts whether the bundle fits in context budget. Returns: will_fit bool, predicted_total_pp, confidence interval, per_bean_predictions, model_version, n_basis, recommendation.",
    },
    {
        "trigger_pattern": "query_predicted_context_climb",
        "trigger_class": "vocabulary",
        "canonical_resolution": "Herder Scribe MCP tool (herder_query.ts). Given bean_id_or_class, returns predicted context-cost percentage-point climb with confidence interval. Basis: trained linear regression model from historical observations.",
    },
    {
        "trigger_pattern": "herder_observations.jsonl",
        "trigger_class": "file_path",
        "canonical_resolution": "librarian-mcp/stitchpunks/herder/observations/herder_observations.jsonl — Stone Tablet of all Herder Scribe observation events. Append-only JSONL. Each record contains: bean_id, pod_id, session_id, context_cost_pp, phase_completion_flags, vendor, model, wrasse_pre_injection_flag, etc.",
    },
    {
        "trigger_pattern": "fingerprint_registry.json",
        "trigger_class": "file_path",
        "canonical_resolution": "librarian-mcp/stitchpunks/herder/fingerprints/fingerprint_registry.json — Bean-class fingerprint registry. Keyed by bean_class. Contains statistical distributions of context_cost_pp, lines_added, files_touched, etc. Updated on every observation via herder_fingerprint.py.",
    },
    {
        "trigger_pattern": "record_observation",
        "trigger_class": "vocabulary",
        "canonical_resolution": "Herder Scribe MCP tool / Python API (herder_observe.py::record_observation). Accepts D.2 observation event, validates, signs via SHA-256 Chronicler hash, persists to herder_observations.jsonl Stone Tablet. Returns observation_id + chronicler_hash.",
    },
    {
        "trigger_pattern": "substrate-capacity-prediction",
        "trigger_class": "vocabulary",
        "canonical_resolution": "Herder Scribe (#2297) — the substrate-capacity-prediction innovation class. Predicts context budget consumption per bean/pod before execution so Bishop can plan bundles. Patent innovation ID #2297.",
    },
]


def register_herder_scribe(session_id: str = SESSION_ID) -> list:
    """Register all Herder Scribe entries in the Wrasse registry."""
    results = []
    for entry in HERDER_ENTRIES:
        result = append_if_new(
            trigger_pattern=entry["trigger_pattern"],
            trigger_class=entry["trigger_class"],
            canonical_resolution=entry["canonical_resolution"],
            source_session=session_id,
        )
        results.append({"trigger_pattern": entry["trigger_pattern"], **result})
    return results


if __name__ == "__main__":
    results = register_herder_scribe()
    for r in results:
        print(json.dumps(r))
