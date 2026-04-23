"""
SP-9B: VAULT CLEANUP EXTENSION
Processes loose files at Vault root AND the 01 MarkupFiles folder.
Classifies each file and copies to the correct canonical section.
Then moves originals to archive.

Usage:
  python sp9_vault_cleanup.py              # dry run
  python sp9_vault_cleanup.py --execute    # do it
"""

import os
import re
import json
import shutil
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
VAULT = WORKSPACE / "Asteroid-ProofVault"
MARKUP = WORKSPACE / "01 MarkupFiles"
ARCHIVE = WORKSPACE / "ARCHIVE2April2026"
DATA_DIR = Path(__file__).parent / "data"
MANIFEST_PATH = DATA_DIR / "vault_cleanup_manifest.json"


def classify_file(filename: str, content_head: str = "") -> str:
    """Classify a file into a vault canonical section based on name and content."""
    lower = filename.lower()
    combined = (lower + " " + content_head.lower()[:500]) if content_head else lower

    # Crown letters
    if any(kw in lower for kw in ['crown_letter', 'locked0', 'letter_', 'letter-',
                                   'mackenzie', 'buffett', 'newmark', 'scott_',
                                   'simon_cfo', 'seibel', 'dougherty', 'glenn',
                                   'kaiser', 'scholz', 'williams', 'herjavec',
                                   'kimmel', 'gates_', 'casilli', 'kiko',
                                   'letter_registry', 'master_registry',
                                   'crown_letter_package', 'letters_index']):
        return '02_CROWN_LETTERS'

    # Patents and innovations
    if any(kw in lower for kw in ['patent', 'innovation', 'crown_jewel', 'provisional',
                                   'behemoth', 'emperor', 'filing_bag', 'aa_formal',
                                   'a&a', 'prior_art', 'thresh', 'claims']):
        return '03_PATENT_BAGS'

    # Academic papers
    if any(kw in lower for kw in ['paper_', 'paper-', 'academic', 'pudding',
                                   'abstract', 'manuscript']):
        return '02_WRITTEN'

    # Articles and cephas content
    if any(kw in lower for kw in ['article', 'cephas', 'publication']):
        return '02_WRITTEN'

    # Handoffs and sessions
    if any(kw in lower for kw in ['handoff', 'handover', 'session', 'milestone',
                                   'blueprint', 'checkpoint', 'prompt_knight',
                                   'prompt_bishop', 'recast']):
        return '01_Blueprints'

    # Technical
    if any(kw in lower for kw in ['deploy', 'firebase', 'supabase', 'migration',
                                   'rls', 'api', 'oauth', 'tech_', 'mcp',
                                   'setup', 'config', '.sql', '.tsx', '.ts',
                                   '.py', '.js', '.html', '.htm', '.sol']):
        return '05_TECHNICAL_SPECS'

    # Campaign and launch
    if any(kw in lower for kw in ['campaign', 'kickstarter', 'launch', 'marketing',
                                   'social_media', 'discord', 'hootsuite']):
        return '06_CAMPAIGN_MATERIALS'

    # Journals
    if any(kw in lower for kw in ['journal', 'founders', 'diary', 'founder_status']):
        return 'Journal_Archive'

    # Strategy and tracking
    if any(kw in lower for kw in ['strategy', 'master_task', 'implementation',
                                   'tracking', 'audit', 'checklist', 'task_list',
                                   'status', 'sync_', 'command_center']):
        return '09_CONTEXT_MANAGEMENT'

    # Press and media
    if any(kw in lower for kw in ['press', 'pitch', 'media_', 'reporter']):
        return '04_PRESS_ARTICLES'

    # Legal
    if any(kw in lower for kw in ['legal', 'compliance', 'sec_', 'counsel',
                                   'disclosure', 'consent']):
        return '05_TECHNICAL_SPECS/Legal'

    # Content markers in first 500 chars
    if content_head:
        cl = content_head.lower()
        if 'dear ' in cl or 'sincerely' in cl or 'founder & general manager' in cl:
            return '02_CROWN_LETTERS'
        if 'innovation #' in cl or 'crown jewel' in cl:
            return '03_PATENT_BAGS'
        if '## abstract' in cl or '## introduction' in cl:
            return '02_WRITTEN'
        if 'for the keep' in cl:
            return '01_Blueprints'

    # Star Chamber
    if 'star_chamber' in lower or 'starchamber' in lower:
        return '10_INTEGRATED/StarChamber'

    # Core documents
    if any(kw in lower for kw in ['covenant', 'ai_master_prompt', 'master prompt',
                                   'considered_approach', 'skeleton_key']):
        return '01_CORE_DOCUMENTS'

    # Master references
    if any(kw in lower for kw in ['backer_benefits', 'medallion', 'joules_economics',
                                   'founder_anecdotes', 'founder_image', 'comparison_index',
                                   'comparison_findings', 'master_file_index',
                                   'how_liana_banyan_works', 'onboarding']):
        return '00_MASTER_REFERENCES'

    # Financial/investor docs
    if any(kw in lower for kw in ['investor', 'convertible', 'promissory',
                                   'canada_40k', 'valuation']):
        return '05_TECHNICAL_SPECS/Legal'

    # Sal Khan and other letter-like files
    if any(kw in lower for kw in ['sal_khan', 'khan_letter', 'khan_recommendation',
                                   'all_187_letters', 'send_now', 'santa_ps',
                                   'opening_gambit', 'pawn_assessment',
                                   'family_announcement', 'appeal']):
        return '02_CROWN_LETTERS'

    # Bibliography
    if 'bibliography' in lower or 'complete-bibliography' in lower:
        return '02_WRITTEN'

    return '00_INBOX_FOR_SYNTHESIS'


def read_head(filepath: Path, chars: int = 500) -> str:
    """Read first N chars for content classification."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read(chars)
    except Exception:
        return ''


def process_loose_files(source_dir: Path, label: str, dry_run: bool = True) -> dict:
    """Process all loose files in a directory into canonical sections."""
    results = {
        'source': str(source_dir),
        'label': label,
        'files_processed': 0,
        'files_classified': 0,
        'section_counts': {},
        'operations': [],
    }

    if not source_dir.exists():
        print(f"  {label}: directory not found")
        return results

    for item in sorted(source_dir.iterdir()):
        if item.is_dir():
            continue  # Skip subdirectories — they're already organized
        if item.name.startswith('~$') or item.name.startswith('~W'):
            continue  # Skip temp/lock files

        results['files_processed'] += 1

        # Classify
        content_head = read_head(item) if item.suffix.lower() in {
            '.md', '.txt', '.html', '.htm', '.json'
        } else ''
        section = classify_file(item.name, content_head)

        dest_dir = VAULT / section
        dest_file = dest_dir / item.name

        operation = {
            'file': item.name,
            'section': section,
            'source': str(item),
            'destination': str(dest_file),
            'status': 'pending',
        }

        if not dry_run:
            dest_dir.mkdir(parents=True, exist_ok=True)
            if dest_file.exists():
                operation['status'] = 'skipped (exists)'
            else:
                try:
                    shutil.copy2(str(item), str(dest_file))
                    operation['status'] = 'copied'
                    results['files_classified'] += 1
                except Exception as e:
                    operation['status'] = f'error: {e}'
        else:
            results['files_classified'] += 1

        results['section_counts'][section] = results['section_counts'].get(section, 0) + 1
        results['operations'].append(operation)

    return results


def move_to_archive(source_dir: Path, dry_run: bool = True) -> bool:
    """Move a processed directory to the archive."""
    if dry_run:
        return True

    dest = ARCHIVE / source_dir.name
    try:
        if dest.exists():
            # Merge into existing archive folder
            for item in source_dir.iterdir():
                target = dest / item.name
                if not target.exists():
                    shutil.move(str(item), str(target))
            # Remove empty source if possible
            try:
                source_dir.rmdir()
            except Exception:
                pass
        else:
            shutil.move(str(source_dir), str(dest))
        return True
    except Exception as e:
        print(f"  Could not archive {source_dir.name}: {e}")
        return False


def run(dry_run: bool = True):
    mode = "DRY RUN" if dry_run else "EXECUTE"
    print(f"SP-9B VAULT CLEANUP ({mode})")
    print("=" * 60)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    manifest = {
        'timestamp': datetime.now().isoformat(),
        'mode': mode,
        'sources': [],
    }

    # 1. Process 01 MarkupFiles
    if MARKUP.exists():
        print(f"\n[1/2] Processing 01 MarkupFiles ({sum(1 for f in MARKUP.iterdir() if f.is_file())} loose files)...")
        markup_results = process_loose_files(MARKUP, "01 MarkupFiles", dry_run)
        manifest['sources'].append(markup_results)

        for section, count in sorted(markup_results['section_counts'].items(), key=lambda x: -x[1]):
            print(f"    {section}: {count}")

        if not dry_run and markup_results['files_classified'] > 0:
            print(f"  Moving 01 MarkupFiles to archive...")
            move_to_archive(MARKUP, dry_run)

    # 2. Process Vault root loose files
    vault_loose = sum(1 for f in VAULT.iterdir() if f.is_file())
    print(f"\n[2/2] Processing Vault root ({vault_loose} loose files)...")
    vault_results = process_loose_files(VAULT, "Vault Root", dry_run)
    manifest['sources'].append(vault_results)

    for section, count in sorted(vault_results['section_counts'].items(), key=lambda x: -x[1]):
        print(f"    {section}: {count}")

    # If executing, move Vault root loose files to their sections
    # (they're already IN the vault, just at root — copy moved them to sections,
    #  now we need to remove the originals from vault root)
    if not dry_run:
        vault_root_archive = VAULT / "_root_archive_b063"
        vault_root_archive.mkdir(exist_ok=True)
        for op in vault_results['operations']:
            if op['status'] == 'copied':
                src = Path(op['source'])
                if src.exists():
                    try:
                        shutil.move(str(src), str(vault_root_archive / src.name))
                    except Exception:
                        pass
        print(f"  Vault root originals moved to Vault/_root_archive_b063/")

    # Save manifest
    with open(MANIFEST_PATH, 'w') as f:
        json.dump(manifest, f, indent=2, default=str)

    # Summary
    total_files = sum(s['files_processed'] for s in manifest['sources'])
    total_classified = sum(s['files_classified'] for s in manifest['sources'])
    print(f"\n{'=' * 60}")
    print(f"  Total files processed: {total_files}")
    print(f"  Total classified: {total_classified}")
    if dry_run:
        print(f"  To execute: python sp9_vault_cleanup.py --execute")
    print(f"  Manifest: {MANIFEST_PATH}")
    print(f"{'=' * 60}")

    return manifest


if __name__ == '__main__':
    import sys
    execute = '--execute' in sys.argv
    run(dry_run=not execute)
