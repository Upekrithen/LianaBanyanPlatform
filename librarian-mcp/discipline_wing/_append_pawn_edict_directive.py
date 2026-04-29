"""One-shot script: append cross-agent edict directive to PawnHandoffs.jsonl.
Scope C of K-Founder-Edict-Propagation/B133. Stone Tablet: append-only.
"""
import json
from pathlib import Path
from datetime import datetime, timezone

pawn_handoffs = Path(__file__).parent.parent / "stitchpunks/pawn_cathedral/scribes/PawnHandoffs.jsonl"
now_ts = datetime.now(timezone.utc).isoformat(timespec="seconds")

entry = {
    "observation": (
        "PAWN CROSS-AGENT DIRECTIVES (B133 cross-agent edict propagation / K-Founder-Edict-Propagation): "
        "\n\n"
        "1. Counsel-no-gate (BRIDLE Rule 11A): Pawn NEVER inserts 'counsel review' as a step that gates Founder. "
        "Pawn surfaces substantive issues to Founder via Bishop relay; Founder decides counsel involvement. "
        "Counsel is Founder's resource, not an agent-side gate. "
        "\n\n"
        "2. Founder-prose-pass-at-fire-time (BRIDLE Rule 11B): Pawn produces research / brief material when "
        "Bishop dispatches. Pawn does NOT pressure Founder on PUBLICATION timing. "
        "Founder prose-passes all PUBLICATION dispatch at fire-time, single consolidated session. "
        "\n\n"
        "References: feedback_dont_gate_on_counsel.md + feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md. "
        "These directives apply to all Pawn sessions until superseded by a new Founder edict."
    ),
    "category": "cross_agent_directive",
    "timestamp": now_ts,
    "source_session": "K-Founder-Edict-Propagation",
    "source_document": "BISHOP_DROPZONE/01_KnightPrompts/PROMPT_KNIGHT_K_FOUNDER_EDICT_PROPAGATION_CROSS_AGENT_B133.md",
    "tokens": 100,
    "scope": "public",
    "source_cathedral": "pawn_cathedral",
    "operator_mediated_sig": True,
    "k_number": "K-Founder-Edict-Propagation",
    "directive_type": "founder_edict_propagation",
    "directives": {
        "counsel_no_gate": {
            "rule": "BRIDLE Rule 11A",
            "text": "Pawn NEVER inserts counsel review as a step that gates Founder. Pawn surfaces issues to Founder via Bishop relay; Founder decides counsel involvement.",
            "reference": "feedback_dont_gate_on_counsel.md",
        },
        "founder_prose_pass_at_fire_time": {
            "rule": "BRIDLE Rule 11B",
            "text": "Pawn produces research/brief material when Bishop dispatches. Pawn does NOT pressure Founder on PUBLICATION timing. Founder prose-passes all PUBLICATION dispatch at fire-time.",
            "reference": "feedback_founder_prose_pass_at_fire_time_only_no_pre_drafting.md",
        },
    },
}

with pawn_handoffs.open("a", encoding="utf-8") as fh:
    fh.write(json.dumps(entry, ensure_ascii=False) + "\n")

print(f"Appended Pawn cross-agent edict directive to {pawn_handoffs.name}")
print(f"File now {pawn_handoffs.stat().st_size} bytes")
