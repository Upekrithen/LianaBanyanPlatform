"""
Shutterbug Scribe — KN028 / A&A #2304 / BP003

Auto-screenshot every 1% context-budget-used via KN012 watcher integration.
Observer pattern on snapshot_receipts.jsonl — non-breaking.
Falls back to metadata-stub on headless environments.

Public API:
    from shutterbug import ShutterbugObserver, get_session_observer
    from shutterbug import take_screenshot, load_manifest

Output:
    Screenshots: ~/Pictures/BeanSprouts/<session_id>/
    Manifest:    shutterbug/sessions/<session_id>_manifest.jsonl
"""

from .shutterbug_scribe import (
    ShutterbugObserver,
    get_session_observer,
    stop_session_observer,
    load_manifest,
)
from .screenshot_engine import take_screenshot, list_session_captures, get_beansrpouts_dir

__all__ = [
    "ShutterbugObserver",
    "get_session_observer",
    "stop_session_observer",
    "load_manifest",
    "take_screenshot",
    "list_session_captures",
    "get_beansrpouts_dir",
]
