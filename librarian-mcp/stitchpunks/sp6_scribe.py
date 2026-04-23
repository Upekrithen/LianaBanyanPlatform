"""
SP-6: THE SCRIBE
Logs every session start/end with timestamp, agent type, session ID,
files changed, and summary. Maintains permanent session record.
Trigger: Session start and session end.
Output: librarian-mcp/stitchpunks/data/session_log.json
"""

import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
SESSION_LOG_PATH = DATA_DIR / "session_log.json"


def load_log() -> list:
    """Load existing session log."""
    if SESSION_LOG_PATH.exists():
        try:
            with open(SESSION_LOG_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            return []
    return []


def save_log(log: list):
    """Save session log."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(SESSION_LOG_PATH, 'w') as f:
        json.dump(log, f, indent=2, default=str)


def log_session_start(agent_type: str, session_id: str, task_description: str = ""):
    """Record a session start."""
    log = load_log()
    entry = {
        'timestamp': datetime.now().isoformat(),
        'event': 'session_start',
        'agent': agent_type,
        'session_id': session_id,
        'task': task_description,
    }
    log.append(entry)
    save_log(log)
    print(f"SP-6 SCRIBE: Logged {agent_type} session {session_id} START")
    return entry


def log_session_end(agent_type: str, session_id: str, summary: str = "",
                    files_changed: list = None, documents_produced: list = None,
                    innovations: list = None, pending_work: list = None):
    """Record a session end with full debrief."""
    log = load_log()
    entry = {
        'timestamp': datetime.now().isoformat(),
        'event': 'session_end',
        'agent': agent_type,
        'session_id': session_id,
        'summary': summary,
        'files_changed': files_changed or [],
        'documents_produced': documents_produced or [],
        'innovations': innovations or [],
        'pending_work': pending_work or [],
    }
    log.append(entry)
    save_log(log)
    print(f"SP-6 SCRIBE: Logged {agent_type} session {session_id} END")
    print(f"  Summary: {summary[:100]}...")
    print(f"  Files changed: {len(files_changed or [])}")
    print(f"  Documents produced: {len(documents_produced or [])}")
    return entry


def log_deployment(target: str, status: str, files_count: int = 0, notes: str = ""):
    """Record a deployment event."""
    log = load_log()
    entry = {
        'timestamp': datetime.now().isoformat(),
        'event': 'deployment',
        'target': target,
        'status': status,
        'files_count': files_count,
        'notes': notes,
    }
    log.append(entry)
    save_log(log)
    print(f"SP-6 SCRIBE: Logged deployment to {target} ({status})")
    return entry


def get_session_history(agent_type: str = None, limit: int = 20) -> list:
    """Get recent session history, optionally filtered by agent."""
    log = load_log()
    if agent_type:
        log = [e for e in log if e.get('agent') == agent_type]
    return log[-limit:]


def get_stats() -> dict:
    """Get aggregate statistics from the session log."""
    log = load_log()
    stats = {
        'total_events': len(log),
        'sessions': {},
        'deployments': 0,
        'first_event': log[0]['timestamp'] if log else None,
        'last_event': log[-1]['timestamp'] if log else None,
    }
    for entry in log:
        if entry['event'] == 'session_start':
            agent = entry.get('agent', 'unknown')
            stats['sessions'][agent] = stats['sessions'].get(agent, 0) + 1
        elif entry['event'] == 'deployment':
            stats['deployments'] += 1
    return stats


if __name__ == '__main__':
    # Demo: log this session
    log_session_start('BISHOP', 'B063',
        'Pudding 100, Four-Agent V2, AI Cake V2, Vault cleanup, Stitchpunk Corps build')
    stats = get_stats()
    print(f"\nSession log stats: {json.dumps(stats, indent=2)}")
