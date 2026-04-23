"""
SP-2: THE ARCHIVIST
Detects duplicate and near-duplicate files across the workspace.
Compares by content hash and filename similarity.
Identifies version chains (e.g., Tom Simon CFO v1-v7).
Trigger: On demand or weekly.
Output: librarian-mcp/stitchpunks/data/archivist_report.json
"""

import json
import re
from datetime import datetime
from pathlib import Path
from collections import defaultdict

DATA_DIR = Path(__file__).parent / "data"
MANIFEST_PATH = DATA_DIR / "cartographer_manifest.json"
REPORT_PATH = DATA_DIR / "archivist_report.json"


def normalize_name(filename: str) -> str:
    """Normalize filename for similarity comparison."""
    name = filename.lower()
    name = re.sub(r'\.(md|txt|docx|rtf|tsx|ts|html|htm|json|sql|py)$', '', name)
    name = re.sub(r'[_\-\s]+', ' ', name)
    name = re.sub(r'\s*(v\d+|draft|final|updated|copy|backup|\d{8})\s*', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def extract_version_key(filename: str) -> tuple:
    """Extract base name and version number for chain detection."""
    name = filename.lower()
    name = re.sub(r'\.(md|txt|docx|rtf|tsx|ts|html|htm|json|sql|py)$', '', name)

    # Match patterns like: "thing_v2", "thing 03", "thing_004", "thing V2"
    version_match = re.search(r'[\s_\-]*(v?\d{1,3}|draft|final|updated)[\s_\-]*$', name, re.IGNORECASE)
    if version_match:
        base = name[:version_match.start()].strip(' _-')
        version = version_match.group(1).strip()
        return (normalize_name(base), version)

    # Match patterns like: "LOCKED01_thing", "LOCKED02_thing"
    locked_match = re.match(r'locked\d*[_\s]*(.*)', name, re.IGNORECASE)
    if locked_match:
        base = locked_match.group(1).strip(' _-')
        return (normalize_name(base), 'locked')

    return (normalize_name(name), None)


def find_duplicates(manifest: dict) -> dict:
    """Analyze manifest for duplicates and version chains."""
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_files_analyzed': 0,
        'hash_duplicates': [],
        'name_duplicates': [],
        'version_chains': [],
        'summary': {}
    }

    # Group by content hash
    hash_groups = defaultdict(list)
    # Group by normalized name
    name_groups = defaultdict(list)
    # Group by version key
    version_groups = defaultdict(list)

    for entry in manifest.get('files', []):
        if not entry.get('is_content'):
            continue

        report['total_files_analyzed'] += 1
        filepath = entry['path']
        filename = entry['filename']

        # Hash-based dedup
        file_hash = entry.get('hash')
        if file_hash and file_hash != 'unreadable':
            hash_groups[file_hash].append({
                'path': filepath,
                'filename': filename,
                'size': entry['size'],
                'modified': entry['modified'],
                'domain': entry['domain'],
            })

        # Name-based dedup
        norm_name = normalize_name(filename)
        if len(norm_name) > 3:  # Skip very short names
            name_groups[norm_name].append({
                'path': filepath,
                'filename': filename,
                'size': entry['size'],
                'modified': entry['modified'],
                'domain': entry['domain'],
            })

        # Version chain detection
        base_key, version = extract_version_key(filename)
        if base_key and len(base_key) > 3:
            version_groups[base_key].append({
                'path': filepath,
                'filename': filename,
                'version': version,
                'size': entry['size'],
                'modified': entry['modified'],
            })

    # Report hash duplicates (exact content match)
    for h, files in hash_groups.items():
        if len(files) > 1:
            # Sort by modified date, newest first
            files.sort(key=lambda x: x.get('modified', ''), reverse=True)
            report['hash_duplicates'].append({
                'hash': h,
                'count': len(files),
                'keep_recommendation': files[0]['path'],
                'files': files,
            })

    # Report name duplicates (similar names, different locations)
    for name, files in name_groups.items():
        if len(files) > 1:
            # Only report if files are in different directories
            dirs = set(str(Path(f['path']).parent) for f in files)
            if len(dirs) > 1:
                files.sort(key=lambda x: x.get('modified', ''), reverse=True)
                report['name_duplicates'].append({
                    'normalized_name': name,
                    'count': len(files),
                    'locations': len(dirs),
                    'keep_recommendation': files[0]['path'],
                    'files': files,
                })

    # Report version chains (same document, multiple versions)
    for base, files in version_groups.items():
        if len(files) > 1:
            has_versions = any(f['version'] is not None for f in files)
            if has_versions:
                files.sort(key=lambda x: x.get('modified', ''), reverse=True)
                report['version_chains'].append({
                    'base_name': base,
                    'versions': len(files),
                    'latest': files[0]['path'],
                    'files': files,
                })

    # Sort by count descending
    report['hash_duplicates'].sort(key=lambda x: x['count'], reverse=True)
    report['name_duplicates'].sort(key=lambda x: x['count'], reverse=True)
    report['version_chains'].sort(key=lambda x: x['versions'], reverse=True)

    report['summary'] = {
        'hash_duplicate_groups': len(report['hash_duplicates']),
        'total_hash_duplicate_files': sum(g['count'] for g in report['hash_duplicates']),
        'name_duplicate_groups': len(report['name_duplicates']),
        'version_chain_groups': len(report['version_chains']),
    }

    return report


def run():
    """Execute the Archivist analysis."""
    print("SP-2 ARCHIVIST: Analyzing for duplicates and version chains...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not MANIFEST_PATH.exists():
        print("  ERROR: Cartographer manifest not found. Run SP-1 first.")
        return None

    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)

    report = find_duplicates(manifest)

    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    s = report['summary']
    print(f"  Files analyzed: {report['total_files_analyzed']}")
    print(f"  Hash duplicate groups: {s['hash_duplicate_groups']} ({s['total_hash_duplicate_files']} files)")
    print(f"  Name duplicate groups: {s['name_duplicate_groups']}")
    print(f"  Version chains: {s['version_chain_groups']}")

    if report['hash_duplicates']:
        print(f"\n  TOP EXACT DUPLICATES:")
        for g in report['hash_duplicates'][:5]:
            print(f"    [{g['count']} copies] {g['files'][0]['filename']}")
            for f in g['files'][:3]:
                print(f"      - {f['path']}")

    if report['version_chains']:
        print(f"\n  TOP VERSION CHAINS:")
        for c in report['version_chains'][:5]:
            print(f"    [{c['versions']} versions] {c['base_name']}")

    print(f"  Report: {REPORT_PATH}")
    return report


if __name__ == '__main__':
    run()
