"""
SP-4: THE CROSS-REFERRER
Scans all files for innovation numbers (#NNNN), Crown Jewel references,
patent bag references, and domain keywords. Builds a cross-reference index.
This is "every innovation cross-referenced across the entire platform."
Trigger: After Classifier.
Output: librarian-mcp/stitchpunks/data/cross_references.json
"""

import json
import os
import re
from datetime import datetime
from pathlib import Path
from collections import defaultdict

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
REPORT_PATH = DATA_DIR / "cross_references.json"

SKIP_DIRS = {'node_modules', '.git', 'dist', '.venv', '__pycache__', '.supabase', '.cache'}
CONTENT_EXTENSIONS = {'.md', '.txt', '.tsx', '.ts', '.sql', '.json', '.html'}

# Patterns to extract cross-references
INNOVATION_PATTERN = re.compile(r'#(\d{3,4})\b')
CROWN_JEWEL_PATTERN = re.compile(r'[Cc]rown\s+[Jj]ewel', re.IGNORECASE)
PATENT_BAG_PATTERN = re.compile(r'(?:patent\s+bag|filing\s+bag|prov(?:isional)?\s+(?:#?\d+|patent))', re.IGNORECASE)
SESSION_PATTERN = re.compile(r'\b([KBR]\d{2,3})\b')
INNOVATION_KEYWORD_PATTERN = re.compile(r'[Ii]nnovation\s+#?(\d{3,4})')

# Domain reference patterns
DOMAIN_PATTERNS = {
    'commerce': re.compile(r'\b(?:storefront|commerce|marketplace|cost\+20|creator.keeps)\b', re.IGNORECASE),
    'housing': re.compile(r'\b(?:housing|waterwheel|roommate|vacation.network)\b', re.IGNORECASE),
    'currency': re.compile(r'\b(?:credits?|marks?|joules?|three.currency|substitution.method)\b', re.IGNORECASE),
    'governance': re.compile(r'\b(?:star.chamber|round.table|backer.election|counter.vote)\b', re.IGNORECASE),
    'manufacturing': re.compile(r'\b(?:canister|s.piston|freezer.node|injection.mold)\b', re.IGNORECASE),
    'beacon': re.compile(r'\b(?:beacon|treasure.map|wildfire.run)\b', re.IGNORECASE),
    'vehicle': re.compile(r'\b(?:lemon.lot|rideshare|local.wheels|rally.group)\b', re.IGNORECASE),
    'outreach': re.compile(r'\b(?:cue.card|red.carpet|pioneer|medallion)\b', re.IGNORECASE),
    'membership': re.compile(r'\b(?:\$5.year|membership|cold.start|front.door|ghost.world)\b', re.IGNORECASE),
    'content': re.compile(r'\b(?:cephas|pudding|subscription.channel|content.shield)\b', re.IGNORECASE),
    'reputation': re.compile(r'\b(?:adapt.score|safety.ledger|xp.score)\b', re.IGNORECASE),
    'guild': re.compile(r'\b(?:guild|tribe|crew.call|family.table)\b', re.IGNORECASE),
    'political': re.compile(r'\b(?:political.expedition|coalition|bill.tracking)\b', re.IGNORECASE),
    'defense': re.compile(r'\b(?:content.shield|areopagus|moderation)\b', re.IGNORECASE),
    'helm': re.compile(r'\b(?:helm|captain|bridge|dispatch)\b', re.IGNORECASE),
}


def scan_file_references(filepath: str, rel_path: str) -> dict:
    """Extract all cross-references from a single file."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception:
        return None

    refs = {
        'path': rel_path,
        'innovations': [],
        'has_crown_jewel_ref': False,
        'has_patent_ref': False,
        'sessions_mentioned': [],
        'domains_mentioned': [],
    }

    # Find innovation numbers
    for match in INNOVATION_KEYWORD_PATTERN.finditer(content):
        num = int(match.group(1))
        if 1 <= num <= 3000:
            refs['innovations'].append(num)

    # Also find bare #NNNN patterns in likely contexts
    for match in INNOVATION_PATTERN.finditer(content):
        num = int(match.group(1))
        if 100 <= num <= 3000 and num not in refs['innovations']:
            # Check context — is this likely an innovation number?
            start = max(0, match.start() - 50)
            context = content[start:match.start()].lower()
            if any(kw in context for kw in ['innovation', 'crown', 'patent', '#', 'a&a']):
                refs['innovations'].append(num)

    refs['innovations'] = sorted(set(refs['innovations']))

    # Crown Jewel references
    refs['has_crown_jewel_ref'] = bool(CROWN_JEWEL_PATTERN.search(content))

    # Patent references
    refs['has_patent_ref'] = bool(PATENT_BAG_PATTERN.search(content))

    # Session references
    sessions = set()
    for match in SESSION_PATTERN.finditer(content):
        sid = match.group(1)
        if sid[0] in 'KBR' and int(sid[1:]) < 500:
            sessions.add(sid)
    refs['sessions_mentioned'] = sorted(sessions)

    # Domain references
    for domain, pattern in DOMAIN_PATTERNS.items():
        if pattern.search(content):
            refs['domains_mentioned'].append(domain)

    return refs


def run():
    """Execute the Cross-Referrer scan."""
    print("SP-4 CROSS-REFERRER: Building cross-reference index...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    report = {
        'timestamp': datetime.now().isoformat(),
        'files_scanned': 0,
        'files_with_refs': 0,
        'unique_innovations_referenced': set(),
        'innovation_file_map': defaultdict(list),  # innovation# -> [files]
        'domain_file_map': defaultdict(list),       # domain -> [files]
        'session_file_map': defaultdict(list),       # session -> [files]
        'crown_jewel_files': [],
        'patent_files': [],
        'file_refs': [],
    }

    for root, dirs, files in os.walk(WORKSPACE):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in CONTENT_EXTENSIONS:
                continue

            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, WORKSPACE)

            try:
                if os.path.getsize(filepath) > 1_000_000:
                    continue
            except Exception:
                continue

            report['files_scanned'] += 1
            refs = scan_file_references(filepath, rel_path)
            if not refs:
                continue

            has_any = (refs['innovations'] or refs['has_crown_jewel_ref'] or
                      refs['has_patent_ref'] or refs['sessions_mentioned'] or
                      refs['domains_mentioned'])

            if has_any:
                report['files_with_refs'] += 1
                report['file_refs'].append(refs)

                for inno in refs['innovations']:
                    report['unique_innovations_referenced'].add(inno)
                    report['innovation_file_map'][str(inno)].append(rel_path)

                for domain in refs['domains_mentioned']:
                    report['domain_file_map'][domain].append(rel_path)

                for session in refs['sessions_mentioned']:
                    report['session_file_map'][session].append(rel_path)

                if refs['has_crown_jewel_ref']:
                    report['crown_jewel_files'].append(rel_path)

                if refs['has_patent_ref']:
                    report['patent_files'].append(rel_path)

    # Convert sets to lists for JSON serialization
    report['unique_innovations_referenced'] = sorted(report['unique_innovations_referenced'])
    report['innovation_file_map'] = dict(report['innovation_file_map'])
    report['domain_file_map'] = {k: v for k, v in report['domain_file_map'].items()}
    report['session_file_map'] = dict(report['session_file_map'])

    # Summary stats
    report['summary'] = {
        'files_scanned': report['files_scanned'],
        'files_with_references': report['files_with_refs'],
        'unique_innovations': len(report['unique_innovations_referenced']),
        'crown_jewel_files': len(report['crown_jewel_files']),
        'patent_files': len(report['patent_files']),
        'domains_referenced': len(report['domain_file_map']),
        'sessions_referenced': len(report['session_file_map']),
    }

    # Don't include full file_refs in output (too large) — just summary
    file_refs = report.pop('file_refs')

    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    s = report['summary']
    print(f"  Files scanned: {s['files_scanned']}")
    print(f"  Files with refs: {s['files_with_references']}")
    print(f"  Unique innovations referenced: {s['unique_innovations']}")
    print(f"  Crown Jewel reference files: {s['crown_jewel_files']}")
    print(f"  Patent reference files: {s['patent_files']}")
    print(f"  Domains cross-referenced: {s['domains_referenced']}")
    print(f"  Sessions cross-referenced: {s['sessions_referenced']}")

    # Top referenced innovations
    top_innovations = sorted(report['innovation_file_map'].items(),
                            key=lambda x: len(x[1]), reverse=True)[:10]
    if top_innovations:
        print(f"\n  TOP REFERENCED INNOVATIONS:")
        for inno, files in top_innovations:
            print(f"    #{inno}: {len(files)} files")

    print(f"  Report: {REPORT_PATH}")
    return report


if __name__ == '__main__':
    run()
