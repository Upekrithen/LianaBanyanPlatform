"""
SP-3: THE CLASSIFIER
Reads file headers and content to assign each uncategorized file
to a Canonical Section. Uses keyword matching, path analysis,
and content sniffing.
Trigger: After Cartographer on session start.
Output: librarian-mcp/stitchpunks/data/classifier_assignments.json
"""

import argparse
import json
import os
import re
from datetime import datetime
from pathlib import Path

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
MANIFEST_PATH = DATA_DIR / "cartographer_manifest.json"
ASSIGNMENTS_PATH = DATA_DIR / "classifier_assignments.json"

# Canonical sections and their content signatures
SECTIONS = {
    '01_BLUEPRINTS': {
        'keywords': ['blueprint', 'architecture', 'handoff', 'session', 'milestone',
                     'checkpoint', 'handover', 'prompt_knight', 'prompt_bishop',
                     'bishop_handoff', 'knight_session', 'session_summary',
                     'implementation_plan', 'deployment_architecture'],
        'path_patterns': ['blueprint', 'handoff', 'checkpoint', 'milestone', 'session'],
        'content_markers': ['## SESSION', '## MISSION', '## HANDOFF', 'Knight Session',
                           'Bishop Session', 'FOR THE KEEP'],
    },
    '02_WRITTEN': {
        'keywords': ['paper', 'article', 'pudding', 'cephas', 'publication',
                     'abstract', 'manuscript', 'essay', 'academic'],
        'path_patterns': ['paper', 'article', 'pudding', 'written', 'academic'],
        'content_markers': ['## Abstract', '## Introduction', '## References',
                           '## Literature Review', 'Pudding #'],
    },
    '03_PATENT_BAGS': {
        'keywords': ['patent', 'provisional', 'uspto', 'innovation', 'crown_jewel',
                     'behemoth', 'emperor', 'filing_bag', 'aa_formal', 'a&a',
                     'prior_art', 'claim', 'specification'],
        'path_patterns': ['patent', 'uspto', 'emperor', 'behemoth', 'filing_bag',
                         'innovation', 'crown_jewel'],
        'content_markers': ['Innovation #', 'Crown Jewel', 'Patent Relevance',
                           'Provisional Patent', 'USPTO', 'formal claims'],
    },
    '04_PRESS_ARTICLES': {
        'keywords': ['press', 'media', 'pitch', 'journalist', 'reporter',
                     'interview', 'coverage', 'pr_', 'hootsuite', 'social_media'],
        'path_patterns': ['press', 'media', 'social', 'pitch'],
        'content_markers': ['PRESS RELEASE', 'FOR IMMEDIATE RELEASE', 'Media Contact'],
    },
    '05_TECHNICAL_SPECS': {
        'keywords': ['spec', 'technical', 'api', 'schema', 'database', 'deploy',
                     'firebase', 'supabase', 'migration', 'rls', 'oauth',
                     'mcp', 'config', 'setup'],
        'path_patterns': ['technical', 'spec', 'deploy', 'config', 'setup'],
        'content_markers': ['CREATE TABLE', 'ALTER TABLE', 'firebase deploy',
                           'npm run', 'supabase', 'API_KEY'],
    },
    '06_CAMPAIGN_MATERIALS': {
        'keywords': ['campaign', 'kickstarter', 'launch', 'marketing', 'discord',
                     'medium', 'social', 'outreach', 'announcement'],
        'path_patterns': ['campaign', 'kickstarter', 'launch', 'marketing'],
        'content_markers': ['Campaign', 'Launch Day', 'Reward Tier', 'Stretch Goal'],
    },
    '07_REFERENCE_MATERIALS': {
        'keywords': ['reference', 'lore', 'canon', 'fable', 'design_doc',
                     'world_architecture', 'naming'],
        'path_patterns': ['reference', 'lore', 'fable', 'design_doc'],
        'content_markers': [],
    },
    '08_JOURNALS': {
        'keywords': ['journal', 'founders', 'diary', 'personal', 'founder_status',
                     'morning', 'evening', 'scratch'],
        'path_patterns': ['journal', 'founders', 'diary'],
        'content_markers': ['Dear Diary', 'Journal Entry', 'Morning Update'],
    },
    '09_CONTEXT_MANAGEMENT': {
        'keywords': ['context', 'sync', 'status', 'task_list', 'command_center',
                     'tracking', 'audit', 'checklist', 'warp_speed', 'countdown',
                     'master_task'],
        'path_patterns': ['context', 'sync', 'status', 'task', 'tracking', 'audit', 'checklist'],
        'content_markers': ['## Status', '## Tracking', '## Checklist', '[ ]', '[x]'],
    },
    '10_LETTERS': {
        'keywords': ['letter', 'crown_letter', 'locked', 'outreach', 'correspondence',
                     'mackenzie', 'buffett', 'newmark', 'scott', 'simon'],
        'path_patterns': ['letter', 'crown', 'locked', 'outreach', 'send'],
        'content_markers': ['Dear ', 'Sincerely,', 'Founder & General Manager',
                           'FOR THE KEEP'],
    },
}

DOMAIN_FALLBACK_SECTION = {
    'technical': '05_TECHNICAL_SPECS',
    'academic': '02_WRITTEN',
    'journals': '08_JOURNALS',
    'media': '04_PRESS_ARTICLES',
    'strategy': '01_BLUEPRINTS',
    'legal': '03_PATENT_BAGS',
    'campaign': '06_CAMPAIGN_MATERIALS',
}

SKIP_DIRS = {'node_modules', '.git', 'dist', '.venv', '__pycache__', '.supabase', '.cache'}

# ── Auto-Wire: Section → Staff of Librarians mapping ──
# Maps SP-3 file-system sections to the 7 Section Librarians (DB: librarian_section_map)
SECTION_TO_LIBRARIAN = {
    '01_BLUEPRINTS': 4,          # Technology & Architecture
    '02_WRITTEN': 6,             # Content & Articles
    '03_PATENT_BAGS': 5,         # Legal & Compliance
    '04_PRESS_ARTICLES': 2,      # Letters & Outreach
    '05_TECHNICAL_SPECS': 4,     # Technology & Architecture
    '06_CAMPAIGN_MATERIALS': 3,  # Initiatives & Programs
    '07_REFERENCE_MATERIALS': 6, # Content & Articles
    '08_JOURNALS': 6,            # Content & Articles
    '09_CONTEXT_MANAGEMENT': 4,  # Technology & Architecture
    '10_LETTERS': 2,             # Letters & Outreach
}

# Maps SP-3 sections to Cephas content registry categories
SECTION_TO_CEPHAS_CATEGORY = {
    '01_BLUEPRINTS': 'system_design',
    '02_WRITTEN': 'article',
    '03_PATENT_BAGS': 'innovation',
    '04_PRESS_ARTICLES': 'article',
    '05_TECHNICAL_SPECS': 'system_design',
    '06_CAMPAIGN_MATERIALS': 'initiative',
    '07_REFERENCE_MATERIALS': 'reference',
    '08_JOURNALS': 'article',
    '09_CONTEXT_MANAGEMENT': 'system_design',
    '10_LETTERS': 'crown_letter',
}

# Maps SP-3 sections to primary MCP domains
SECTION_TO_MCP_DOMAINS = {
    '01_BLUEPRINTS': ['helm', 'innovation'],
    '02_WRITTEN': ['content', 'outreach'],
    '03_PATENT_BAGS': ['innovation', 'defense'],
    '04_PRESS_ARTICLES': ['outreach', 'social_media'],
    '05_TECHNICAL_SPECS': ['helm', 'manufacturing', 'governance'],
    '06_CAMPAIGN_MATERIALS': ['beacon', 'storefront', 'hex_isle'],
    '07_REFERENCE_MATERIALS': ['content', 'ghost_world'],
    '08_JOURNALS': ['content'],
    '09_CONTEXT_MANAGEMENT': ['helm'],
    '10_LETTERS': ['outreach', 'political'],
}

# Infer content_type from section + filename patterns
CONTENT_TYPE_PATTERNS = {
    'crown_letter': ['crown', 'locked0', 'mackenzie', 'buffett', 'newmark', 'scott_', 'simon_'],
    'outreach_letter': ['outreach', 'letter_', 'cue_card'],
    'academic_paper': ['paper_', 'academic_', 'manuscript'],
    'pudding_essay': ['pudding'],
    'cephas_article': ['cephas', 'article_'],
    'press_material': ['press', 'pitch', 'media_'],
    'patent_doc': ['patent', 'provisional', 'aa_formal', 'innovation_'],
}


def infer_content_type(section: str, filename_lower: str) -> str:
    """Infer helm_content_queue content_type from section and filename."""
    for ctype, patterns in CONTENT_TYPE_PATTERNS.items():
        for pat in patterns:
            if pat in filename_lower:
                return ctype
    # Fallback by section
    defaults = {
        '01_BLUEPRINTS': 'cephas_article',
        '02_WRITTEN': 'cephas_article',
        '03_PATENT_BAGS': 'patent_doc',
        '04_PRESS_ARTICLES': 'press_material',
        '05_TECHNICAL_SPECS': 'cephas_article',
        '06_CAMPAIGN_MATERIALS': 'media_post',
        '07_REFERENCE_MATERIALS': 'cephas_article',
        '08_JOURNALS': 'cephas_article',
        '09_CONTEXT_MANAGEMENT': 'cephas_article',
        '10_LETTERS': 'outreach_letter',
    }
    return defaults.get(section, 'cephas_article')


def read_file_head(filepath: str, chars: int = 1000) -> str:
    """Read first N characters of a file for content sniffing."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read(chars)
    except Exception:
        return ''


def classify_file(entry: dict) -> dict:
    """Classify a single file into a canonical section."""
    path_lower = entry['path'].lower().replace('\\', '/').replace(' ', '_')
    filename_lower = entry['filename'].lower().replace(' ', '_')

    scores = {}

    for section, config in SECTIONS.items():
        score = 0

        # Path pattern matching (strongest signal)
        for pattern in config['path_patterns']:
            if pattern in path_lower:
                score += 3

        # Keyword matching on filename
        for kw in config['keywords']:
            if kw in filename_lower:
                score += 2

        if score > 0:
            scores[section] = score

    if not scores:
        # Domain fallback ensures filesystem/domain analysis still routes
        # entries even when filename-only heuristics are weak.
        domain = str(entry.get('domain', '')).strip().lower()
        fallback_section = DOMAIN_FALLBACK_SECTION.get(domain)
        if fallback_section:
            return {
                'section': fallback_section,
                'confidence': 0.35,
                'scores': {fallback_section: 3},
            }
        return {'section': 'uncategorized', 'confidence': 0, 'scores': {}}

    best = max(scores, key=scores.get)
    confidence = min(scores[best] / 10.0, 1.0)

    return {
        'section': best,
        'confidence': round(confidence, 2),
        'scores': scores,
    }


def classify_with_content(entry: dict) -> dict:
    """Enhanced classification using content analysis for low-confidence files."""
    result = classify_file(entry)

    if result['confidence'] >= 0.5:
        return result

    # Read file content for deeper analysis
    filepath = WORKSPACE / entry['path']
    if not filepath.exists() or entry.get('size', 0) > 500_000:
        return result

    head = read_file_head(str(filepath))
    if not head:
        return result

    content_scores = {}
    for section, config in SECTIONS.items():
        score = result['scores'].get(section, 0)
        for marker in config['content_markers']:
            if marker.lower() in head.lower():
                score += 2
        if score > 0:
            content_scores[section] = score

    if content_scores:
        best = max(content_scores, key=content_scores.get)
        confidence = min(content_scores[best] / 10.0, 1.0)
        return {
            'section': best,
            'confidence': round(confidence, 2),
            'scores': content_scores,
        }

    return result


def _snapshot_existing_assignments() -> Path | None:
    """Preserve prior classifier output before overwriting."""
    if not ASSIGNMENTS_PATH.exists():
        return None
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    snapshot_path = DATA_DIR / f"classifier_assignments_{timestamp}.json"
    try:
        with open(ASSIGNMENTS_PATH, "r", encoding="utf-8") as src:
            previous = json.load(src)
        with open(snapshot_path, "w", encoding="utf-8") as dst:
            json.dump(previous, dst, indent=2, default=str)
        return snapshot_path
    except Exception:
        return None


def run(content_analysis: bool = False):
    """Execute the Classifier."""
    print("SP-3 CLASSIFIER: Categorizing files...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if not MANIFEST_PATH.exists():
        print("  ERROR: Cartographer manifest not found. Run SP-1 first.")
        return None

    with open(MANIFEST_PATH, 'r') as f:
        manifest = json.load(f)

    assignments = {
        'timestamp': datetime.now().isoformat(),
        'total_files': 0,
        'classified': 0,
        'uncategorized': 0,
        'content_analyzed': content_analysis,
        'section_counts': {},
        'assignments': [],
        'uncategorized_files': [],
    }

    classify_fn = classify_with_content if content_analysis else classify_file

    files = [entry for entry in manifest.get('files', []) if entry.get('is_content')]
    chunk_size = 500

    for idx in range(0, len(files), chunk_size):
        batch = files[idx:idx + chunk_size]
        if len(files) > chunk_size:
            print(f"  Processing batch {idx // chunk_size + 1}/{(len(files) + chunk_size - 1) // chunk_size} ({len(batch)} files)")

        for entry in batch:
            assignments['total_files'] += 1
            result = classify_fn(entry)

            section = result['section']
            filename_lower = entry['filename'].lower().replace(' ', '_')
            assignment = {
                'path': entry['path'],
                'filename': entry['filename'],
                'current_domain': entry.get('domain', 'unknown'),
                'assigned_section': section,
                'confidence': result['confidence'],
                'section_librarian': SECTION_TO_LIBRARIAN.get(section),
                'cephas_category': SECTION_TO_CEPHAS_CATEGORY.get(section),
                'mcp_domains': SECTION_TO_MCP_DOMAINS.get(section, []),
                'content_type': infer_content_type(section, filename_lower) if section != 'uncategorized' else None,
            }

            if section == 'uncategorized':
                assignments['uncategorized'] += 1
                assignments['uncategorized_files'].append(entry['path'])
            else:
                assignments['classified'] += 1
                assignments['section_counts'][section] = assignments['section_counts'].get(section, 0) + 1

            assignments['assignments'].append(assignment)

    with open(ASSIGNMENTS_PATH, 'w') as f:
        json.dump(assignments, f, indent=2, default=str)

    print(f"  Total content files: {assignments['total_files']}")
    print(f"  Classified: {assignments['classified']}")
    print(f"  Uncategorized: {assignments['uncategorized']}")
    print(f"  Section breakdown:")
    for section, count in sorted(assignments['section_counts'].items(), key=lambda x: -x[1]):
        print(f"    {section}: {count}")
    print(f"  Report: {ASSIGNMENTS_PATH}")

    return assignments


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="SP-3 Classifier")
    parser.add_argument("--deep", action="store_true", help="Enable content-aware classification")
    parser.add_argument("--with-content-analysis", action="store_true", help="Enable content-aware classification")
    parser.add_argument("--force", action="store_true", help="Force a rerun and preserve prior output snapshot")
    args = parser.parse_args()

    snapshot = _snapshot_existing_assignments() if args.force else None
    if snapshot:
        print(f"  Snapshot saved: {snapshot}")

    run(content_analysis=(args.deep or args.with_content_analysis))
