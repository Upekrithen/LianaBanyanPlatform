"""One-shot script: append 4 Founder-edict vocabulary entries to wrasse_registry.jsonl.
Scope B of K-Founder-Edict-Propagation/B133. Stone Tablet: append-only.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

registry_path = Path(__file__).parent.parent / "stitchpunks/wrasse/wrasse_registry.jsonl"
now_ts = datetime.now(timezone.utc).isoformat(timespec="seconds")

# Determine next trigger_id
existing_ids: set[str] = set()
if registry_path.exists():
    for line in registry_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            record = json.loads(line)
            if "trigger_id" in record:
                existing_ids.add(record["trigger_id"])
        except json.JSONDecodeError:
            pass

# Find max WV- (vocabulary) id
max_wv = 0
for tid in existing_ids:
    if tid.upper().startswith("WV-"):
        try:
            max_wv = max(max_wv, int(tid[3:]))
        except ValueError:
            pass

entries = [
    {
        "trigger_id": f"WV-{max_wv + 1:03d}",
        "trigger_class": "vocabulary",
        "trigger_pattern": "counsel",
        "canonical_resolution": (
            "Counsel is Founder's resource, NOT an agent-side gate. "
            "Bishop / Knight / Pawn surface substantive issues to Founder; "
            "Founder decides counsel involvement. "
            "Per feedback_dont_gate_on_counsel.md. "
            "BRIDLE Rule 11A (v11)."
        ),
        "last_verified_ts": now_ts,
        "verification_count": 1,
        "source_session": "K-Founder-Edict-Propagation / B133",
        "founder_edict": True,
        "scope": "cross_agent",
    },
    {
        "trigger_id": f"WV-{max_wv + 2:03d}",
        "trigger_class": "vocabulary",
        "trigger_pattern": "Edict",
        "canonical_resolution": (
            "Founder's prose-pass Edict (B133): all PUBLICATION dispatch prose-passed "
            "in single consolidated session at fire-time. Knight produces drafts when Founder "
            "fires drafting K-prompts. Knight does NOT pressure on timing. "
            "Per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md. "
            "BRIDLE Rule 11B (v11)."
        ),
        "last_verified_ts": now_ts,
        "verification_count": 1,
        "source_session": "K-Founder-Edict-Propagation / B133",
        "founder_edict": True,
        "scope": "cross_agent",
    },
    {
        "trigger_id": f"WV-{max_wv + 3:03d}",
        "trigger_class": "vocabulary",
        "trigger_pattern": "prose-pass",
        "canonical_resolution": (
            "Single consolidated Founder session at fire-time. "
            "Bishop / Knight scaffold; Founder rewrites 60-80% per feedback_drafts_as_scaffolding.md. "
            "Bishop / Knight NEVER pressure timing. "
            "Distinct from K-prompt firing (authorizing Knight to draft material, which can happen any time). "
            "Per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md."
        ),
        "last_verified_ts": now_ts,
        "verification_count": 1,
        "source_session": "K-Founder-Edict-Propagation / B133",
        "founder_edict": True,
        "scope": "cross_agent",
    },
    {
        "trigger_id": f"WV-{max_wv + 4:03d}",
        "trigger_class": "vocabulary",
        "trigger_pattern": "fire-time",
        "canonical_resolution": (
            "The single consolidated session where Founder prose-passes + dispatches PUBLICATION work. "
            "NOT the same as Knight K-prompt fire (Founder authorizing Knight to draft material — "
            "that can happen any time without timing pressure). "
            "Per feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md."
        ),
        "last_verified_ts": now_ts,
        "verification_count": 1,
        "source_session": "K-Founder-Edict-Propagation / B133",
        "founder_edict": True,
        "scope": "cross_agent",
    },
]

with registry_path.open("a", encoding="utf-8") as fh:
    for entry in entries:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"Appended {len(entries)} vocabulary entries to wrasse_registry.jsonl")
print(f"IDs: {[e['trigger_id'] for e in entries]}")
print(f"File now {registry_path.stat().st_size} bytes")
