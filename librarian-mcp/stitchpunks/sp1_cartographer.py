"""
SP-1: THE CARTOGRAPHER
Scans the entire workspace, produces a canonical file tree with metadata.
Detects new files since last run. Identifies orphaned folders.
Trigger: Every session start.
Output: librarian-mcp/stitchpunks/data/cartographer_manifest.json
"""

import os
import json
import hashlib
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
MANIFEST_PATH = DATA_DIR / "cartographer_manifest.json"
PREVIOUS_MANIFEST_PATH = DATA_DIR / "cartographer_previous.json"

# Directories to skip (node_modules, .git, dist, etc.)
SKIP_DIRS = {
    'node_modules', '.git', 'dist', '.next', '__pycache__', '.cache',
    '.venv', 'venv', '.supabase', '.firebase', '.claude', 'backups',
    'public', 'build', 'archive'
}

# File extensions we care about for content analysis
CONTENT_EXTENSIONS = {
    '.md', '.txt', '.tsx', '.ts', '.js', '.py', '.sql', '.json',
    '.html', '.htm', '.rtf', '.csv', '.sol', '.ps1', '.sh'
}

# Domain classification keywords
DOMAIN_KEYWORDS = {
    'patents': ['patent', 'provisional', 'uspto', 'innovation', 'crown_jewel', 'behemoth', 'emperor', 'filing_bag', 'A&A', 'aa_formal'],
    'letters': ['letter', 'crown_letter', 'locked', 'outreach', 'pitch'],
    'blueprints': ['blueprint', 'handoff', 'session', 'milestone', 'checkpoint', 'handover'],
    'journals': ['journal', 'founders', 'diary', 'log'],
    'technical': ['deploy', 'firebase', 'supabase', 'migration', 'rls', 'sql', 'api', 'oauth', 'mcp'],
    'academic': ['paper', 'academic', 'pudding', 'cephas', 'article'],
    'campaign': ['kickstarter', 'campaign', 'launch', 'social_media', 'discord', 'medium'],
    'strategy': ['strategy', 'master_task', 'implementation', 'tracking', 'checklist', 'audit'],
    'context': ['context', 'sync', 'status', 'task_list', 'command_center'],
    'legal': ['legal', 'compliance', 'sec_language', 'counsel'],
    'media': ['image', 'video', 'logo', 'gif', 'png', 'jpg', 'mp4', 'mp3'],
}


def classify_by_path(filepath: str) -> str:
    """Classify a file based on its path and name."""
    lower = filepath.lower().replace('\\', '/').replace(' ', '_')

    for domain, keywords in DOMAIN_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                return domain
    return 'uncategorized'


def get_file_hash(filepath: str, block_size: int = 8192) -> str:
    """Get MD5 hash of first 8KB for fast dedup detection."""
    try:
        h = hashlib.md5()
        with open(filepath, 'rb') as f:
            chunk = f.read(block_size)
            h.update(chunk)
        return h.hexdigest()
    except Exception:
        return 'unreadable'


def scan_workspace() -> dict:
    """Scan the entire workspace and produce a manifest."""
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'workspace': str(WORKSPACE),
        'total_files': 0,
        'total_dirs': 0,
        'total_size_mb': 0,
        'root_items': [],
        'domain_counts': {},
        'new_since_last': [],
        'files': []
    }

    # Load previous manifest for delta detection
    previous_files = set()
    if PREVIOUS_MANIFEST_PATH.exists():
        try:
            with open(PREVIOUS_MANIFEST_PATH, 'r') as f:
                prev = json.load(f)
                previous_files = {item['path'] for item in prev.get('files', [])}
        except Exception:
            pass

    # Scan root items first
    for item in sorted(os.listdir(WORKSPACE)):
        full_path = WORKSPACE / item
        is_dir = full_path.is_dir()
        manifest['root_items'].append({
            'name': item,
            'is_dir': is_dir,
            'modified': datetime.fromtimestamp(full_path.stat().st_mtime).isoformat() if full_path.exists() else None
        })

    total_size = 0

    # Walk entire workspace
    for root, dirs, files in os.walk(WORKSPACE):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        rel_root = os.path.relpath(root, WORKSPACE)
        manifest['total_dirs'] += 1

        for filename in files:
            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, WORKSPACE)

            try:
                stat = os.stat(filepath)
                size = stat.st_size
                modified = datetime.fromtimestamp(stat.st_mtime).isoformat()
            except Exception:
                size = 0
                modified = None

            ext = os.path.splitext(filename)[1].lower()
            domain = classify_by_path(rel_path)
            is_new = rel_path not in previous_files

            entry = {
                'path': rel_path,
                'filename': filename,
                'extension': ext,
                'size': size,
                'modified': modified,
                'domain': domain,
                'is_content': ext in CONTENT_EXTENSIONS,
                'is_new': is_new,
            }

            # Only hash content files for dedup
            if ext in CONTENT_EXTENSIONS and size < 1_000_000:  # < 1MB
                entry['hash'] = get_file_hash(filepath)

            manifest['files'].append(entry)
            manifest['total_files'] += 1
            total_size += size

            if is_new:
                manifest['new_since_last'].append(rel_path)

            # Count by domain
            manifest['domain_counts'][domain] = manifest['domain_counts'].get(domain, 0) + 1

    manifest['total_size_mb'] = round(total_size / (1024 * 1024), 2)

    return manifest


def run():
    """Execute the Cartographer scan."""
    print("SP-1 CARTOGRAPHER: Scanning workspace...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Save previous manifest
    if MANIFEST_PATH.exists():
        import shutil
        shutil.copy2(MANIFEST_PATH, PREVIOUS_MANIFEST_PATH)

    manifest = scan_workspace()

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2, default=str)

    print(f"  Total files: {manifest['total_files']}")
    print(f"  Total dirs: {manifest['total_dirs']}")
    print(f"  Total size: {manifest['total_size_mb']} MB")
    print(f"  New since last: {len(manifest['new_since_last'])}")
    print(f"  Domain breakdown:")
    for domain, count in sorted(manifest['domain_counts'].items(), key=lambda x: -x[1]):
        print(f"    {domain}: {count}")
    print(f"  Manifest: {MANIFEST_PATH}")

    return manifest


if __name__ == '__main__':
    run()
