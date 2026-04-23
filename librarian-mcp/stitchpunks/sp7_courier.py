"""
SP-7: THE COURIER
Monitors all dropzones for new files since last run.
Categorizes new arrivals and updates the Librarian dropzone index.
Trigger: Every session start.
Output: librarian-mcp/stitchpunks/data/courier_report.json
"""

import json
import os
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
REPORT_PATH = DATA_DIR / "courier_report.json"
STATE_PATH = DATA_DIR / "courier_state.json"

DROPZONES = {
    'BISHOP': WORKSPACE / 'BISHOP_DROPZONE',
    'KNIGHT': WORKSPACE / 'KNIGHT_DROPZONE',
    'PAWN': WORKSPACE / 'PAWN_DROPZONE',
    'ROOK': WORKSPACE / 'ROOK_DROPZONE',
    'FOUNDER': WORKSPACE / 'FOUNDER_ACTION_QUEUE',
    'BISHOP_OUTPUT': WORKSPACE / 'BISHOP OUTPUT',
    'KNIGHT_INBOX': WORKSPACE / 'KNIGHT_INBOX',
}


def load_state() -> dict:
    """Load previous courier state (last seen files per dropzone)."""
    if STATE_PATH.exists():
        try:
            with open(STATE_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def save_state(state: dict):
    """Save courier state."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)


def scan_dropzone(name: str, path: Path) -> dict:
    """Scan a single dropzone for all files."""
    if not path.exists():
        return {'name': name, 'path': str(path), 'exists': False, 'files': []}

    files = []
    for item in sorted(path.iterdir()):
        if item.is_file():
            try:
                stat = item.stat()
                files.append({
                    'filename': item.name,
                    'size': stat.st_size,
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'extension': item.suffix.lower(),
                })
            except Exception:
                continue
        elif item.is_dir():
            # Count files in subdirectories
            subcount = sum(1 for _ in item.rglob('*') if _.is_file())
            files.append({
                'filename': item.name + '/',
                'size': 0,
                'modified': datetime.fromtimestamp(item.stat().st_mtime).isoformat(),
                'extension': 'dir',
                'subfile_count': subcount,
            })

    return {
        'name': name,
        'path': str(path),
        'exists': True,
        'file_count': len(files),
        'files': files,
    }


def run():
    """Execute the Courier scan."""
    print("SP-7 COURIER: Scanning dropzones...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    previous_state = load_state()

    report = {
        'timestamp': datetime.now().isoformat(),
        'dropzones': {},
        'new_files': [],
        'total_files': 0,
        'total_new': 0,
    }

    new_state = {}

    for name, path in DROPZONES.items():
        scan = scan_dropzone(name, path)
        report['dropzones'][name] = {
            'exists': scan['exists'],
            'file_count': scan.get('file_count', 0),
        }

        if not scan['exists']:
            continue

        report['total_files'] += scan['file_count']

        # Track new files vs previous state
        current_files = {f['filename'] for f in scan['files']}
        previous_files = set(previous_state.get(name, []))
        new_files = current_files - previous_files

        for filename in sorted(new_files):
            report['new_files'].append({
                'dropzone': name,
                'filename': filename,
            })
            report['total_new'] += 1

        new_state[name] = list(current_files)

    save_state(new_state)

    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    print(f"  Dropzones scanned: {len(DROPZONES)}")
    print(f"  Active dropzones: {sum(1 for d in report['dropzones'].values() if d['exists'])}")
    print(f"  Total files across dropzones: {report['total_files']}")
    print(f"  New since last scan: {report['total_new']}")

    for name, info in report['dropzones'].items():
        status = f"{info['file_count']} files" if info['exists'] else "NOT FOUND"
        print(f"    {name}: {status}")

    if report['new_files']:
        print(f"\n  NEW FILES:")
        for nf in report['new_files'][:15]:
            print(f"    [{nf['dropzone']}] {nf['filename']}")
        if len(report['new_files']) > 15:
            print(f"    ... and {len(report['new_files']) - 15} more")

    print(f"  Report: {REPORT_PATH}")
    return report


if __name__ == '__main__':
    run()
