"""
Stenographer Scribe — KN027 / A&A #2304 / BP003

Continuous thinking-stream / Liner Notes / Brainscan capture at agent-spawn
boundary. Fires automatically from CheckBook Orchestrator (KN031). Provides
manual record_liner_note / record_brainscan API for rich thinking-stream capture.

Public API:
    from stenographer import StenographerScribe, get_session_scribe

Stone Tablet: all writes are fsync-appended.
Output: stenographer/sessions/<session_id>_liner_notes.jsonl
"""

from .stenographer_scribe import StenographerScribe, get_session_scribe
from .liner_notes_writer import write_record, load_session, get_session_path
from .brainscan_capture import make_brainscan_name, make_brainscan_id

__all__ = [
    "StenographerScribe",
    "get_session_scribe",
    "write_record",
    "load_session",
    "get_session_path",
    "make_brainscan_name",
    "make_brainscan_id",
]
