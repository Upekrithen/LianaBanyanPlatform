"""
STITCHPUNK CORPS — SESSION START HOOK
Runs automatically when any agent session begins.
Chain: Scribe → Cartographer → Sentinel → Courier

Usage:
  python session_start.py BISHOP B064 "Task description here"
  python session_start.py KNIGHT K231 "Vehicle domain enhancements"
"""

import sys
import time
from datetime import datetime

def run_session_start(agent_type: str, session_id: str, task: str = ""):
    print("=" * 60)
    print(f"  STITCHPUNK CORPS — SESSION START (AUTO-WIRE)")
    print(f"  Agent: {agent_type} | Session: {session_id}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    start = time.time()

    # SP-6: Log session start
    print(f"\n[1/4] SP-6 SCRIBE")
    from sp6_scribe import log_session_start
    log_session_start(agent_type, session_id, task)

    # SP-1: Scan workspace
    print(f"\n[2/4] SP-1 CARTOGRAPHER")
    from sp1_cartographer import run as cartographer_run
    manifest = cartographer_run()

    # SP-5: Verify canonical numbers
    print(f"\n[3/4] SP-5 SENTINEL")
    from sp5_sentinel import run as sentinel_run
    report = sentinel_run()

    # SP-7: Monitor dropzones for new arrivals
    print(f"\n[4/4] SP-7 COURIER (dropzone scan)")
    from sp7_courier import run as courier_run
    courier = courier_run()

    elapsed = round(time.time() - start, 1)
    new_dropzone = len(courier.get('new_files', [])) if courier else 0
    print(f"\n{'=' * 60}")
    print(f"  SESSION START COMPLETE in {elapsed}s")
    print(f"  Files: {manifest['total_files']} | Size: {manifest['total_size_mb']} MB")
    print(f"  New since last: {len(manifest['new_since_last'])}")
    print(f"  Sentinel violations: {report['total_violations']}")
    print(f"  New dropzone arrivals: {new_dropzone}")
    print(f"{'=' * 60}")


if __name__ == '__main__':
    agent = sys.argv[1] if len(sys.argv) > 1 else 'BISHOP'
    session = sys.argv[2] if len(sys.argv) > 2 else 'UNKNOWN'
    task = sys.argv[3] if len(sys.argv) > 3 else ''
    run_session_start(agent, session, task)
