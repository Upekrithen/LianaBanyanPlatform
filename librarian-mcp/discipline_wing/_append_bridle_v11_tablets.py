"""One-shot script: append BRIDLE v11 Stone Tablet entries to KnightBRIDLEMemory.jsonl."""
import json
from pathlib import Path
from datetime import datetime, timezone

scribe_path = Path(__file__).parent.parent / "stitchpunks/knight_cathedral/scribes/KnightBRIDLEMemory.jsonl"
now = datetime.now(timezone.utc).isoformat(timespec="seconds")

entries = [
    {
        "observation": (
            "BRIDLE v10 -> v11 bump (K-Founder-Edict-Propagation/B133): Rule 11A (counsel-no-gate) + "
            "Rule 11B (founder-prose-pass-at-fire-time) added. "
            "Rule 11A: Knight NEVER inserts counsel review as a step gating Founder. "
            "Counsel is Founder's resource; Knight surfaces issues to Founder and Founder decides counsel involvement. "
            "Rule 11B: Knight produces drafts when Founder fires drafting K-prompts; Knight NEVER pressures Founder "
            "on PUBLICATION timing; Founder prose-passes all PUBLICATION dispatch at fire-time in single consolidated session. "
            "Both rules propagated to Wrasse registry (vocabulary entries) and Pawn dispatch context. "
            "Canonical doc: BISHOP_DROPZONE/UNDER_THE_HOOD/THE_BRIDLE_V11.md. "
            "Machine-readable: librarian-mcp/discipline_wing/bridle_rules.json."
        ),
        "category": "bridle-discipline",
        "timestamp": now,
        "source_session": "K-Founder-Edict-Propagation",
        "source_document": "BISHOP_DROPZONE/UNDER_THE_HOOD/THE_BRIDLE_V11.md",
        "tokens": 95,
        "bridle_rule_invoked": "Rule 11A: counsel-no-gate; Rule 11B: founder-prose-pass-at-fire-time",
        "scope": "public",
        "version_bump": "v10 -> v11",
    },
    {
        "observation": (
            "BRIDLE Rule 11A (counsel-no-gate) behavioral case: Founder direct quote B133 turn 19: "
            "Stop Gating On Counsel. Ask ME and I will ask counsel and reply. That is it. "
            "Pattern: if Knight/Pawn encounters a situation that would traditionally warrant a "
            "check-with-counsel-before-proceeding gate, it surfaces the substantive issue to Founder "
            "in plain language instead. Knight does not add counsel-gate steps to timelines, task lists, "
            "or implementation sequences. Memory file: feedback_dont_gate_on_counsel.md."
        ),
        "category": "bridle-discipline",
        "timestamp": now,
        "source_session": "K-Founder-Edict-Propagation",
        "source_document": "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K_FOUNDER_EDICT_PROPAGATION_CROSS_AGENT_B133.md",
        "tokens": 78,
        "bridle_rule_invoked": "Rule 11A: counsel-no-gate",
        "scope": "public",
        "founder_edict_b133": True,
    },
]

with scribe_path.open("a", encoding="utf-8") as fh:
    for entry in entries:
        fh.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"Appended {len(entries)} Stone Tablet entries to {scribe_path.name}")
print(f"File now {scribe_path.stat().st_size} bytes")
