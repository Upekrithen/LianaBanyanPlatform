"""
Archive all root-level items that have been consolidated or are no longer
needed at root. Copies into _ARCHIVE_B063/ preserving original structure.
Never deletes originals.
"""

import os
import shutil
from datetime import datetime
from pathlib import Path
import json

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
ARCHIVE = WORKSPACE / "_ARCHIVE_B063"
DATA_DIR = Path(__file__).parent / "data"

# Items that STAY at root (active infrastructure)
KEEP_AT_ROOT = {
    # Active platform code
    'platform',
    'platform-v2',
    'librarian-mcp',
    '.venv',
    '.claude',
    '.git',
    '.gitignore',
    'firebase.json',
    '.firebaserc',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'vite.config.ts',
    'tailwind.config.ts',
    'postcss.config.js',
    'components.json',

    # Knowledge base
    'Asteroid-ProofVault',

    # Active dropzones
    'BISHOP_DROPZONE',
    'KNIGHT_DROPZONE',
    'PAWN_DROPZONE',
    'ROOK_DROPZONE',
    'FOUNDER_ACTION_QUEUE',

    # Portal trunks (active)
    'Escape Velocity Site',
    'Cephas',
    'business-trunk',
    'network-trunk',
    'nonprofit-trunk',
    'dss-the2ndsecond',
    'hexisle-trunk',
    'Upekrithen-Trunk',
    'marketplace-trunk-fresh',

    # Active utilities
    'scripts',
    'functions',
    'patents',
    'librarian.py',
    'librarian_index.json',

    # Previous archive
    '_ARCHIVE_PRE_REORG_JAN23',

    # This archive itself
    '_ARCHIVE_B063',
}


def run():
    print("=" * 60)
    print("  ROOT ARCHIVER — B063")
    print(f"  Archive to: {ARCHIVE}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    ARCHIVE.mkdir(exist_ok=True)

    manifest = {
        'timestamp': datetime.now().isoformat(),
        'archived_dirs': [],
        'archived_files': [],
        'kept_at_root': [],
        'skipped': [],
        'errors': [],
    }

    root_items = sorted(os.listdir(WORKSPACE))
    total_archived = 0

    for item_name in root_items:
        src = WORKSPACE / item_name
        dst = ARCHIVE / item_name

        # Skip items that should stay
        if item_name in KEEP_AT_ROOT:
            manifest['kept_at_root'].append(item_name)
            continue

        # Skip hidden/system files
        if item_name.startswith('.') and item_name not in KEEP_AT_ROOT:
            manifest['kept_at_root'].append(item_name)
            continue

        # Skip if already archived
        if dst.exists():
            manifest['skipped'].append(f"{item_name} (already in archive)")
            continue

        try:
            if src.is_dir():
                shutil.copytree(str(src), str(dst))
                file_count = sum(1 for _ in Path(dst).rglob('*') if _.is_file())
                manifest['archived_dirs'].append({
                    'name': item_name,
                    'files': file_count,
                })
                total_archived += file_count
                print(f"  [DIR]  {item_name}/ ({file_count} files)")
            elif src.is_file():
                shutil.copy2(str(src), str(dst))
                manifest['archived_files'].append({
                    'name': item_name,
                    'size': src.stat().st_size,
                })
                total_archived += 1
                print(f"  [FILE] {item_name}")
        except Exception as e:
            manifest['errors'].append(f"{item_name}: {str(e)}")
            print(f"  [ERR]  {item_name}: {e}")

    # Save manifest
    manifest_path = DATA_DIR / "archive_manifest_b063.json"
    manifest['summary'] = {
        'dirs_archived': len(manifest['archived_dirs']),
        'files_archived': len(manifest['archived_files']),
        'total_items_archived': total_archived,
        'kept_at_root': len(manifest['kept_at_root']),
        'skipped': len(manifest['skipped']),
        'errors': len(manifest['errors']),
    }

    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"\n{'=' * 60}")
    s = manifest['summary']
    print(f"  Dirs archived: {s['dirs_archived']}")
    print(f"  Files archived: {s['files_archived']}")
    print(f"  Total items: {s['total_items_archived']}")
    print(f"  Kept at root: {s['kept_at_root']}")
    print(f"  Errors: {s['errors']}")
    print(f"  Manifest: {manifest_path}")
    print(f"{'=' * 60}")

    return manifest


if __name__ == '__main__':
    run()
