"""
SP-9: THE QUARTERMASTER
The big one. Takes Classifier assignments and physically copies files
to their Canonical Section destination in the Vault.
Maintains provenance (original path recorded).
Never deletes — only copies and logs.
Trigger: On demand (Founder authorization required).
Output: librarian-mcp/stitchpunks/data/quartermaster_manifest.json
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
VAULT = WORKSPACE / "Asteroid-ProofVault"
DATA_DIR = Path(__file__).parent / "data"
CLASSIFIER_PATH = DATA_DIR / "classifier_assignments.json"
MANIFEST_PATH = DATA_DIR / "quartermaster_manifest.json"
PROVENANCE_PATH = DATA_DIR / "quartermaster_provenance.json"

# Map classifier sections to Vault destination folders
SECTION_DESTINATIONS = {
    '01_BLUEPRINTS': VAULT / '01_Blueprints',
    '02_WRITTEN': VAULT / '02_WRITTEN',
    '03_PATENT_BAGS': VAULT / '03_PATENT_BAGS',
    '04_PRESS_ARTICLES': VAULT / '04_PRESS_ARTICLES',
    '05_TECHNICAL_SPECS': VAULT / '05_TECHNICAL_SPECS',
    '06_CAMPAIGN_MATERIALS': VAULT / '06_CAMPAIGN_MATERIALS',
    '07_REFERENCE_MATERIALS': VAULT / '07_REFERENCE_MATERIALS',
    '08_JOURNALS': VAULT / 'Journal_Archive',
    '09_CONTEXT_MANAGEMENT': VAULT / '09_CONTEXT_MANAGEMENT',
    '10_LETTERS': VAULT / '02_CROWN_LETTERS',
}

# Root-level folders that should be consolidated into the Vault
CONSOLIDATION_MAP = {
    'BEHEMOTH_IMAGES': ('03_PATENT_BAGS', 'Behemoth/Images'),
    'BEHEMOTH_PAGES': ('03_PATENT_BAGS', 'Behemoth/Pages'),
    'EMPEROR_PART_1_ALL_PATENTS': ('03_PATENT_BAGS', 'Emperor/Part1_All_Patents'),
    'EMPEROR_PART_2_ACADEMIC_JOURNALS': ('03_PATENT_BAGS', 'Emperor/Part2_Academic'),
    'EMPEROR_PRIORITY_FILES': ('03_PATENT_BAGS', 'Emperor/Priority'),
    'EMPEROR_VERIFICATION_PACKAGE': ('03_PATENT_BAGS', 'Emperor/Verification_V1'),
    'EMPEROR_VERIFICATION_PACKAGE_V2': ('03_PATENT_BAGS', 'Emperor/Verification_V2'),
    'EMPEROR_VERIFICATION_PACKAGE_V3': ('03_PATENT_BAGS', 'Emperor/Verification_V3'),
    'EXTRACTED_JOURNALS': ('08_JOURNALS', 'Extracted'),
    'Founders Journal': ('08_JOURNALS', 'Founders_Journal'),
    'FOUNDERS_JOURNAL': ('08_JOURNALS', 'Founders_Journal_2'),
    'FoundersJournal': ('08_JOURNALS', 'Founders_Journal_3'),
    'CROWN_LETTERS': ('10_LETTERS', 'From_Root'),
    'DESIGN_DOCS': ('01_BLUEPRINTS', 'Design_Docs'),
    'checkpoints': ('09_CONTEXT_MANAGEMENT', 'Checkpoints'),
    'CONTEXT_MANAGEMENT': ('09_CONTEXT_MANAGEMENT', 'Context'),
    'CONVERTED_DOCS': ('10_INTEGRATED', 'Converted'),
    'academic-papers': ('02_WRITTEN', 'Academic_From_Root'),
    'articles': ('02_WRITTEN', 'Articles_From_Root'),
    'architecture': ('05_TECHNICAL_SPECS', 'Architecture'),
    'PATENT_LANDSCAPE': ('03_PATENT_BAGS', 'Landscape'),
    'PATENT_MASTER': ('03_PATENT_BAGS', 'Master'),
    'PERPLEXITY_PATENTS_DEEP_RESEARCH': ('03_PATENT_BAGS', 'Perplexity_Research'),
    'kickstarter': ('06_CAMPAIGN_MATERIALS', 'Kickstarter'),
    'LAUNCH_DOCUMENTS_MASTER': ('06_CAMPAIGN_MATERIALS', 'Launch_Documents'),
    'LAUNCH_PREVIEW_FOLDER': ('06_CAMPAIGN_MATERIALS', 'Launch_Preview'),
    'LAUNCH_TONIGHT_JAN28': ('06_CAMPAIGN_MATERIALS', 'Launch_Jan28'),
    'launch-checklists': ('06_CAMPAIGN_MATERIALS', 'Checklists'),
    'SOCIAL_MEDIA': ('04_PRESS_ARTICLES', 'Social_Media'),
    'social-media': ('04_PRESS_ARTICLES', 'Social_Media_2'),
    'media': ('07_REFERENCE_MATERIALS', 'Media'),
    'video-production': ('07_REFERENCE_MATERIALS', 'Video'),
    'GENERATED_LOGOS': ('07_REFERENCE_MATERIALS', 'Logos'),
    'FABLE_ARC_FOR_DRAWING': ('07_REFERENCE_MATERIALS', 'Fable_Arc'),
    'DAUGHTER_VIDEO_HANDOFF': ('07_REFERENCE_MATERIALS', 'Daughter_Video'),
    'docs': ('01_BLUEPRINTS', 'Docs'),
    'Blueprints': ('01_BLUEPRINTS', 'Legacy_Blueprints'),
    'blueprint-site': ('01_BLUEPRINTS', 'Blueprint_Site'),
    'milestones': ('01_BLUEPRINTS', 'Milestones'),
    'reports': ('01_BLUEPRINTS', 'Reports'),
    'strategy-docs': ('01_BLUEPRINTS', 'Strategy'),
    'founder-docs': ('01_BLUEPRINTS', 'Founder_Docs'),
    'legal': ('05_TECHNICAL_SPECS', 'Legal'),
    'letters': ('10_LETTERS', 'Letters'),
    'PARTNERSHIP_ONE_PAGERS': ('10_LETTERS', 'Partnership'),
    'SEND_TO_DANIEL_LAWYER': ('05_TECHNICAL_SPECS', 'Legal/Daniel_Archive'),
    'VALUATIONS': ('03_PATENT_BAGS', 'Valuations'),
    'OPENING_GAMBIT': ('10_LETTERS', 'Opening_Gambit'),
}


def load_provenance() -> dict:
    """Load existing provenance records."""
    if PROVENANCE_PATH.exists():
        try:
            with open(PROVENANCE_PATH, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {'operations': []}


def save_provenance(provenance: dict):
    """Save provenance records."""
    with open(PROVENANCE_PATH, 'w') as f:
        json.dump(provenance, f, indent=2)


def copy_with_provenance(src: Path, dst: Path, provenance: dict) -> bool:
    """Copy a file and record provenance. Never overwrites."""
    if dst.exists():
        return False

    dst.parent.mkdir(parents=True, exist_ok=True)

    try:
        if src.is_dir():
            shutil.copytree(str(src), str(dst), dirs_exist_ok=False)
        else:
            shutil.copy2(str(src), str(dst))

        provenance['operations'].append({
            'timestamp': datetime.now().isoformat(),
            'source': str(src),
            'destination': str(dst),
            'is_dir': src.is_dir(),
            'size': src.stat().st_size if src.is_file() else 0,
        })
        return True
    except Exception as e:
        print(f"  WARN: Could not copy {src} -> {dst}: {e}")
        return False


def consolidate_folders(dry_run: bool = True) -> dict:
    """Consolidate root-level folders into the Vault structure."""
    provenance = load_provenance()
    manifest = {
        'timestamp': datetime.now().isoformat(),
        'mode': 'dry_run' if dry_run else 'execute',
        'folders_processed': 0,
        'files_copied': 0,
        'files_skipped': 0,
        'operations': [],
    }

    for folder_name, (section, subfolder) in CONSOLIDATION_MAP.items():
        src = WORKSPACE / folder_name
        if not src.exists():
            continue

        dest_base = SECTION_DESTINATIONS.get(section, VAULT / section)
        dst = dest_base / subfolder

        if src.is_dir():
            file_count = sum(1 for _ in src.rglob('*') if _.is_file())
            operation = {
                'source': str(src),
                'destination': str(dst),
                'file_count': file_count,
                'status': 'pending',
            }

            if not dry_run:
                if dst.exists():
                    operation['status'] = 'skipped (destination exists)'
                    manifest['files_skipped'] += file_count
                else:
                    success = copy_with_provenance(src, dst, provenance)
                    operation['status'] = 'copied' if success else 'failed'
                    if success:
                        manifest['files_copied'] += file_count

            manifest['operations'].append(operation)
            manifest['folders_processed'] += 1

    if not dry_run:
        save_provenance(provenance)

    return manifest


def run(dry_run: bool = True):
    """Execute the Quartermaster consolidation."""
    mode = "DRY RUN" if dry_run else "EXECUTE"
    print(f"SP-9 QUARTERMASTER: Consolidating workspace ({mode})...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    manifest = consolidate_folders(dry_run=dry_run)

    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"  Mode: {mode}")
    print(f"  Folders to process: {manifest['folders_processed']}")

    if dry_run:
        print(f"\n  PROPOSED OPERATIONS:")
        for op in manifest['operations']:
            src_name = Path(op['source']).name
            dst_rel = os.path.relpath(op['destination'], VAULT)
            print(f"    {src_name}/ ({op['file_count']} files) -> Vault/{dst_rel}/")
        print(f"\n  To execute: python sp9_quartermaster.py --execute")
    else:
        print(f"  Files copied: {manifest['files_copied']}")
        print(f"  Files skipped: {manifest['files_skipped']}")

    print(f"  Manifest: {MANIFEST_PATH}")
    return manifest


if __name__ == '__main__':
    import sys
    execute = '--execute' in sys.argv
    run(dry_run=not execute)
