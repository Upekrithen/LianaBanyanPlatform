"""
Move all archived root items into ARCHIVE2April2026/.
Preserves original folder structure inside the archive.
Uses MOVE (not copy) — originals leave root.
"""

import os
import shutil
import json
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
ARCHIVE = WORKSPACE / "ARCHIVE2April2026"
DATA_DIR = Path(__file__).parent / "data"

# Items that STAY at root
KEEP_AT_ROOT = {
    # Active platform code
    'platform', 'platform-v2', 'librarian-mcp',
    '.venv', '.claude', '.git', '.gitignore',
    'firebase.json', '.firebaserc',
    'package.json', 'package-lock.json',
    'tsconfig.json', 'vite.config.ts',
    'tailwind.config.ts', 'postcss.config.js',
    'components.json', 'node_modules',

    # Knowledge base
    'Asteroid-ProofVault',

    # Active dropzones
    'BISHOP_DROPZONE', 'KNIGHT_DROPZONE',
    'PAWN_DROPZONE', 'ROOK_DROPZONE',
    'FOUNDER_ACTION_QUEUE',

    # Portal trunks (active)
    'Escape Velocity Site', 'Cephas',
    'business-trunk', 'network-trunk', 'nonprofit-trunk',
    'dss-the2ndsecond', 'hexisle-trunk',
    'Upekrithen-Trunk', 'marketplace-trunk-fresh',

    # Active utilities
    'scripts', 'functions', 'patents',
    'librarian.py', 'librarian_index.json',

    # Archives (keep both)
    '_ARCHIVE_PRE_REORG_JAN23', '_ARCHIVE_B063',
    'ARCHIVE2April2026',
}


def run():
    print("=" * 60)
    print("  MOVE TO ARCHIVE2April2026")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    ARCHIVE.mkdir(exist_ok=True)

    moved_dirs = 0
    moved_files = 0
    errors = []
    kept = 0

    root_items = sorted(os.listdir(WORKSPACE))

    for item_name in root_items:
        src = WORKSPACE / item_name

        if item_name in KEEP_AT_ROOT:
            kept += 1
            continue

        # Skip hidden files not in keep list
        if item_name.startswith('.'):
            kept += 1
            continue

        dst = ARCHIVE / item_name

        if dst.exists():
            print(f"  [SKIP] {item_name} (already in archive)")
            continue

        try:
            shutil.move(str(src), str(dst))
            if (ARCHIVE / item_name).is_dir():
                moved_dirs += 1
                print(f"  [MOVED DIR]  {item_name}/")
            else:
                moved_files += 1
                print(f"  [MOVED FILE] {item_name}")
        except Exception as e:
            errors.append(f"{item_name}: {e}")
            print(f"  [ERROR] {item_name}: {e}")

    print(f"\n{'=' * 60}")
    print(f"  Dirs moved: {moved_dirs}")
    print(f"  Files moved: {moved_files}")
    print(f"  Kept at root: {kept}")
    print(f"  Errors: {len(errors)}")
    print(f"{'=' * 60}")

    # Save manifest
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'moved_dirs': moved_dirs,
        'moved_files': moved_files,
        'kept': kept,
        'errors': errors,
    }
    manifest_path = DATA_DIR / "move_archive_manifest.json"
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    return manifest


if __name__ == '__main__':
    run()
