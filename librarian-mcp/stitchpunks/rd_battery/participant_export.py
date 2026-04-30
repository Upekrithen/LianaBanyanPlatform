"""
Component 10 — R&D Battery Participant Export
KN026 / #2299 / BP003

Packages a reproducibility kit for external participants.
Per #2299: battery is open; anyone can run it with their data + LB standards.
Per #2326: reproducibility pack standard required for valid receipts.

Export kit contains:
  - pre_registration.json (the locked #2298 pre-reg document)
  - methodology.md (test battery methodology + standards summary)
  - bean_queue.json (the bean list; participants substitute their beans)
  - herder_predictions.json (Herder Scribe predictions for each bean class)
  - receipt_submission_template.json (format for submitting receipts to Chandelier)
  - README_reproducibility.md (instructions for running the battery)

Kit written to: librarian-mcp/stitchpunks/rd_battery/participant_kits/<test_run_id>/

Toolsmith log: TS-NINETY-POD-TEST-INFRASTRUCTURE-KN026-BP003
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

_KITS_DIR = Path(__file__).parent / "participant_kits"

_METHODOLOGY_TEMPLATE = """\
# R&D Battery Methodology — Liana Banyan Corporation
## Published Standard v1.0 | {date}

### Test Battery Overview (#2299)
The R&D Battery is a published empirical-standards framework for measuring AI-substrate
composition efficacy. Anyone can run the same tests on their own data and submit
receipts to the Liana Banyan Chandelier registry.

### Pre-Registration Discipline (#2298)
Every battery instance MUST follow #2298 Pre-Registered Empirical-Receipt Protocol:
1. Lock pre-registration BEFORE running (hypothesis + predictions + falsification criteria)
2. Execute test with declared protocol
3. Reconcile actual measurements against locked prediction
4. Submit both Part 1 (pre-reg) + Part 2 (reconciliation) as signed pair

### Test Modes
- **γ (gamma):** 90-bean, single-session, 1M context window
- **δ (delta):** 90-Pod cross-session, pod-boundary checkpointing
- **ε (epsilon):** wall-clock budget (1 hour), measures pp/minute climb rate

### Receipt Submission
Submit signed receipts to Chandelier registry per the receipt_submission_template.json
included in this kit. Receipts must be Chronos-signed (SHA-256 of canonical JSON body).

### Standards
A valid receipt must include:
- Locked pre-registration (content_hash_lock verified)
- Per-bean before/after context% snapshots
- Chronos signature (sha256 of body)
- Scenario verdict (A/B/C per reconciliation methodology)
- Determinism-class flag: "deterministic" | "llm_nondeterministic"

### License
Battery methodology available to all cooperative-class participants per #2260 Pledge.
Commercial participants: contact Liana Banyan Corporation.
"""

_RECEIPT_TEMPLATE = {
    "receipt_schema_version": "1.0",
    "receipt_class": "L1",
    "participant_id": "<your-organization-id>",
    "test_mode": "<gamma|delta|epsilon>",
    "test_run_id": "<your-test-run-id>",
    "pre_reg_content_hash": "<content_hash_lock from your pre-registration>",
    "vendor": "<anthropic|openai|google|etc>",
    "model": "<model-name>",
    "context_window_tokens": 0,
    "beans_executed": 0,
    "total_measured_pp": 0.0,
    "total_predicted_pp": 0.0,
    "scenario_verdict": "<A|B|C>",
    "determinism_class": "llm_nondeterministic",
    "chronos_signature": {
        "chronicler_hash": "<sha256-of-body-excluding-this-field>",
        "temporal_anchor": "<ISO-timestamp>",
        "verify_method": "sha256(json.dumps(receipt_body_no_sig, sort_keys=True))"
    },
    "per_bean_table": [
        {
            "bean_id": "<bean-id>",
            "predicted_pp": 0.0,
            "measured_pp": 0.0,
            "residual_pp": 0.0
        }
    ]
}


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def export_participant_kit(
    prereg_doc: Dict[str, Any],
    bean_queue: List[Dict[str, Any]],
    test_run_id: str,
    herder_predictions: Optional[Dict[str, Any]] = None,
    test_mode: str = "gamma",
) -> Path:
    """
    Package reproducibility kit for external participants.

    Args:
        prereg_doc: locked #2298 pre-registration document.
        bean_queue: list of bean spec dicts.
        test_run_id: unique test run identifier.
        herder_predictions: optional Herder Scribe prediction summary per bean class.
        test_mode: "gamma" | "delta" | "epsilon".

    Returns:
        Path to the kit directory.
    """
    kit_dir = _KITS_DIR / test_run_id
    kit_dir.mkdir(parents=True, exist_ok=True)

    # 1. Pre-registration (locked)
    (kit_dir / "pre_registration.json").write_text(
        json.dumps(prereg_doc, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 2. Methodology
    (kit_dir / "methodology.md").write_text(
        _METHODOLOGY_TEMPLATE.format(date=_iso_now()[:10]), encoding="utf-8"
    )

    # 3. Bean queue (sanitized — no internal annotations)
    sanitized_queue = []
    for b in bean_queue:
        sanitized_queue.append({
            "bean_id": b.get("bean_id", ""),
            "bean_class": b.get("bean_class", "medium"),
            "pod_id": b.get("pod_id", ""),
            "predicted_pp": b.get("predicted_pp", 0.0),
            "session_position_class": b.get("session_position_class", "pod_first"),
        })
    (kit_dir / "bean_queue.json").write_text(
        json.dumps(sanitized_queue, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 4. Herder predictions (if provided)
    if herder_predictions:
        (kit_dir / "herder_predictions.json").write_text(
            json.dumps(herder_predictions, indent=2, ensure_ascii=False), encoding="utf-8"
        )

    # 5. Receipt submission template
    template = dict(_RECEIPT_TEMPLATE)
    template["test_mode"] = test_mode
    template["pre_reg_content_hash"] = prereg_doc.get("content_hash_lock", "")
    (kit_dir / "receipt_submission_template.json").write_text(
        json.dumps(template, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    # 6. README
    readme = f"""\
# R&D Battery Reproducibility Kit
**Test Run ID:** {test_run_id}
**Test Mode:** {test_mode}
**Generated:** {_iso_now()}
**Pre-reg hash:** {prereg_doc.get("content_hash_lock", "not-locked")}

## Files

| File | Description |
|------|-------------|
| `pre_registration.json` | Locked #2298 pre-registration (content_hash_lock verified) |
| `methodology.md` | Battery methodology and standards |
| `bean_queue.json` | Bean list (substitute your beans / adapt to your substrate) |
| `herder_predictions.json` | Herder Scribe predictions per bean class |
| `receipt_submission_template.json` | Format for submitting receipts to Chandelier |

## Steps to Reproduce

1. Read `methodology.md` to understand #2298 pre-registration discipline.
2. Verify `pre_registration.json` is locked: `content_hash_lock` field must match
   `sha256(json.dumps(doc_without_hash, sort_keys=True))`.
3. Adapt `bean_queue.json` to your substrate (keep bean_class/predicted_pp as reference).
4. Run your test following the declared receipt_collection_protocol.
5. Fill out `receipt_submission_template.json` with your actual measurements.
6. Sign your receipt using SHA-256 of the body (see template's chronos_signature field).
7. Submit to Liana Banyan Chandelier registry (contact: info@lianabanyan.com).

## Standards

A receipt is valid iff:
- pre_reg_content_hash matches the locked pre-registration
- chronos_signature.chronicler_hash = sha256(json.dumps(receipt_body_without_sig, sort_keys=True))
- scenario_verdict is one of: A (confirmed), B (partial), C (falsified)

Liana Banyan Corporation — EIN 41-2797446 — Wyoming C-Corp
"""
    (kit_dir / "README_reproducibility.md").write_text(readme, encoding="utf-8")

    return kit_dir


def list_participant_kits() -> List[str]:
    """List all available participant kit test_run_ids."""
    if not _KITS_DIR.exists():
        return []
    return [d.name for d in sorted(_KITS_DIR.iterdir()) if d.is_dir()]
