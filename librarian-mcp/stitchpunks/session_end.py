"""
STITCHPUNK CORPS — SESSION END HOOK
Runs automatically when any agent session ends.
Full auto-wire chain: Scribe → Cartographer → Classifier → Herald → Pipeline Bridge

Usage:
  python session_end.py BISHOP B063 "Summary of what was done"
"""

import sys
import time
from datetime import datetime


def run_session_end(agent_type: str, session_id: str, summary: str = "",
                    files_changed: list = None, documents_produced: list = None,
                    key_decisions: list = None):
    print("=" * 60)
    print(f"  STITCHPUNK CORPS — SESSION END (AUTO-WIRE)")
    print(f"  Agent: {agent_type} | Session: {session_id}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    start = time.time()

    # SP-6: Log session end
    print(f"\n[1/5] SP-6 SCRIBE")
    from sp6_scribe import log_session_end
    log_session_end(agent_type, session_id, summary, files_changed or [])

    # SP-1: Rescan for delta
    print(f"\n[2/5] SP-1 CARTOGRAPHER (delta scan)")
    from sp1_cartographer import run as cartographer_run
    manifest = cartographer_run()

    # SP-3: Classify all content (includes Section Librarian routing)
    print(f"\n[3/5] SP-3 CLASSIFIER (with Staff routing)")
    from sp3_classifier import run as classifier_run
    classifier_run(content_analysis=False)

    # SP-8: Generate FOTW/UTH + pipeline payload
    print(f"\n[4/5] SP-8 HERALD (Built In Public + pipeline payload)")
    from sp8_herald import run as herald_run
    herald_run(session_id, agent_type, summary,
               files_changed, documents_produced, key_decisions)

    # SP-10: Bridge to Staff (POST to edge function)
    print(f"\n[5/5] SP-10 PIPELINE BRIDGE (Corps -> Staff)")
    from sp10_pipeline_bridge import run as bridge_run
    bridge_result = bridge_run(session_id, agent_type)

    elapsed = round(time.time() - start, 1)
    new_files = len(manifest.get('new_since_last', []))
    bridged = bridge_result.get('entries_new', 0)
    print(f"\n{'=' * 60}")
    print(f"  SESSION END COMPLETE in {elapsed}s")
    print(f"  New files detected: {new_files}")
    print(f"  Entries bridged to Staff: {bridged}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    agent = sys.argv[1] if len(sys.argv) > 1 else 'BISHOP'
    session = sys.argv[2] if len(sys.argv) > 2 else 'UNKNOWN'
    summary = sys.argv[3] if len(sys.argv) > 3 else ''
    run_session_end(agent, session, summary)
