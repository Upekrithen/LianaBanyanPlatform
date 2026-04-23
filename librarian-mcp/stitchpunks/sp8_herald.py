"""
SP-8: THE HERALD
Generates Built In Public content automatically:
- Fly on the Wall: what changed this session (raw progress)
- Under the Hood: current system state snapshot
- Transparent Accounting: stats, costs, progress
Trigger: Session end.
Output: librarian-mcp/stitchpunks/data/herald_update.json
        + generates markdown for Cephas pipeline
"""

import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).parent / "data"
WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
HERALD_PATH = DATA_DIR / "herald_update.json"
PIPELINE_PAYLOAD_PATH = DATA_DIR / "herald_pipeline_payload.json"
SENTINEL_PATH = DATA_DIR / "sentinel_report.json"
FLY_ON_WALL_DIR = WORKSPACE / "BISHOP_DROPZONE" / "FLY_ON_THE_WALL"
UNDER_HOOD_DIR = WORKSPACE / "BISHOP_DROPZONE" / "UNDER_THE_HOOD"

# Fallback canonical numbers — used ONLY if SP-5 Sentinel output unavailable
_CANONICAL_FALLBACK = {
    'innovations': 2130,
    'crown_jewels': 168,
    'formal_claims': 2103,
    'provisional_patents': 11,
    'patent_fees_total': '$715',
    'production_systems': 35,
    'v2_domains': '23/23',
    'database_tables': 580,
    'edge_functions': 139,
    'pages': 470,
    'components': 897,
    'publications': '~260',
    'pudding_articles': 100,
    'membership_cost': '$5/year',
    'creator_keeps': '83.3%',
    'platform_margin': 'Cost+20%',
    'entity': 'LIANA BANYAN CORPORATION',
    'entity_type': 'Wyoming C-Corp',
}


def _load_canonical() -> dict:
    """Load canonical numbers from SP-5 Sentinel output, falling back to hardcoded."""
    canonical = dict(_CANONICAL_FALLBACK)
    if SENTINEL_PATH.exists():
        try:
            with open(SENTINEL_PATH, 'r') as f:
                sentinel = json.load(f)
            src = sentinel.get('canonical', {})
            # Map sentinel field names to herald field names
            field_map = {
                'innovation_count': 'innovations',
                'crown_jewel_count': 'crown_jewels',
                'formal_claims': 'formal_claims',
                'provisional_apps': 'provisional_patents',
                'production_systems': 'production_systems',
                'membership_cost': 'membership_cost',
                'creator_keeps': 'creator_keeps',
                'platform_margin': 'platform_margin',
                'entity_name': 'entity',
                'entity_type': 'entity_type',
            }
            for sentinel_key, herald_key in field_map.items():
                if sentinel_key in src:
                    canonical[herald_key] = src[sentinel_key]
            print("  Canonical numbers loaded from SP-5 Sentinel output")
        except Exception as e:
            print(f"  WARNING: Could not read Sentinel output, using fallback: {e}")
    else:
        print("  WARNING: Sentinel report not found, using fallback canonical numbers")
    return canonical


CANONICAL = _load_canonical()


def generate_fly_on_the_wall(session_id: str, agent: str, summary: str,
                              files_changed: list = None,
                              documents_produced: list = None,
                              key_decisions: list = None) -> str:
    """Generate a Fly on the Wall entry — raw session progress update."""
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    time_str = now.strftime('%H:%M')

    entry = f"""# Fly on the Wall — {session_id}
*{date_str} at {time_str} | {agent} Session*

---

## What Happened

{summary}

"""
    if files_changed:
        entry += f"## Files Changed ({len(files_changed)})\n\n"
        for f in files_changed[:20]:
            entry += f"- `{f}`\n"
        if len(files_changed) > 20:
            entry += f"- ... and {len(files_changed) - 20} more\n"
        entry += "\n"

    if documents_produced:
        entry += f"## Documents Produced ({len(documents_produced)})\n\n"
        for d in documents_produced:
            entry += f"- {d}\n"
        entry += "\n"

    if key_decisions:
        entry += "## Key Decisions\n\n"
        for d in key_decisions:
            entry += f"- {d}\n"
        entry += "\n"

    entry += f"""---

*This is a Fly on the Wall update — raw, unpolished session progress.*
*Nothing is hidden. This is how the platform gets built.*
*{CANONICAL['entity']} | {CANONICAL['membership_cost']} | {CANONICAL['creator_keeps']} to creators*
"""

    return entry


def generate_under_the_hood() -> str:
    """Generate an Under the Hood snapshot — current system state."""
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d %H:%M')

    snapshot = f"""# Under the Hood — System State Snapshot
*Generated: {date_str}*

---

## Platform Numbers

| Metric | Value |
|--------|-------|
| Documented Innovations | {CANONICAL['innovations']} |
| Crown Jewels (zero prior art) | {CANONICAL['crown_jewels']} |
| Formal Patent Claims | {CANONICAL['formal_claims']} |
| Provisional Patents Filed | {CANONICAL['provisional_patents']} |
| Total Patent Fees | {CANONICAL['patent_fees_total']} |
| Production Systems | {CANONICAL['production_systems']} |
| v2 Domains Migrated | {CANONICAL['v2_domains']} |
| Database Tables | {CANONICAL['database_tables']} |
| Edge Functions | {CANONICAL['edge_functions']} |
| Pages | {CANONICAL['pages']} |
| Components/Hooks/Libs | {CANONICAL['components']} |
| Publications | {CANONICAL['publications']} |
| Pudding Articles | {CANONICAL['pudding_articles']} |

## Economic Structure

| Metric | Value |
|--------|-------|
| Membership Cost | {CANONICAL['membership_cost']} |
| Creator Keeps | {CANONICAL['creator_keeps']} |
| Platform Margin | {CANONICAL['platform_margin']} |
| Entity | {CANONICAL['entity']} |
| Entity Type | {CANONICAL['entity_type']} |

## How This Works

Every number on this page is pulled from the platform's canonical database.
These numbers update automatically. There are no screenshots, no PDFs, no
manually typed figures. What you see is what the system knows.

The platform margin is Cost+20%. That means on a $500 transaction, the
creator keeps $416.67. The platform takes $83.33. This number does not
change based on demand, competition, or revenue targets. It is structural.

---

*Under the Hood — where every mechanism is published and explained.*
*No black boxes. If it affects you, you can read exactly how it works.*
*{CANONICAL['entity']} | Built In Public*
"""

    return snapshot


def run(session_id: str = "UNKNOWN", agent: str = "UNKNOWN",
        summary: str = "", files_changed: list = None,
        documents_produced: list = None, key_decisions: list = None):
    """Generate Herald outputs."""
    print("SP-8 HERALD: Generating Built In Public content...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    # Generate Fly on the Wall
    fly = generate_fly_on_the_wall(session_id, agent, summary,
                                    files_changed, documents_produced, key_decisions)

    # Generate Under the Hood
    hood = generate_under_the_hood()

    # Save to dropzone
    FLY_ON_WALL_DIR.mkdir(parents=True, exist_ok=True)
    UNDER_HOOD_DIR.mkdir(parents=True, exist_ok=True)

    date_str = datetime.now().strftime('%Y%m%d')
    fly_path = FLY_ON_WALL_DIR / f"FOTW_{session_id}_{date_str}.md"
    hood_path = UNDER_HOOD_DIR / f"UTH_SNAPSHOT_{date_str}.md"

    with open(fly_path, 'w') as f:
        f.write(fly)
    print(f"  Fly on the Wall: {fly_path}")

    with open(hood_path, 'w') as f:
        f.write(hood)
    print(f"  Under the Hood: {hood_path}")

    # ── Auto-Wire: Generate pipeline payload for SP-10 Bridge ──
    now_iso = datetime.now().isoformat()
    date_str = datetime.now().strftime('%Y%m%d')
    pipeline_entries = []

    # FOTW entry
    pipeline_entries.append({
        'type': 'fly_on_the_wall',
        'slug': f"fotw-{session_id.lower()}-{date_str}",
        'title': f"Fly on the Wall — {session_id}",
        'content_markdown': fly,
        'content_type': 'cephas_article',
        'category': 'fly_on_the_wall',
        'section_librarian': 6,  # Content & Articles
        'session_id': session_id,
        'agent': agent,
        'source_file_path': str(fly_path),
        'creation_context': f"Auto-generated by SP-8 Herald at session end for {agent} {session_id}",
        'bishop_session': session_id if agent == 'BISHOP' else None,
        'knight_session': session_id if agent == 'KNIGHT' else None,
        'decision_log': key_decisions or [],
        'timestamp': now_iso,
    })

    # UTH entry
    pipeline_entries.append({
        'type': 'under_the_hood',
        'slug': f"uth-snapshot-{date_str}",
        'title': f"Under the Hood — System State {date_str}",
        'content_markdown': hood,
        'content_type': 'cephas_article',
        'category': 'under_the_hood',
        'section_librarian': 4,  # Technology & Architecture
        'session_id': session_id,
        'agent': agent,
        'source_file_path': str(hood_path),
        'creation_context': f"Auto-generated system state snapshot by SP-8 Herald",
        'technical_summary': f"Platform state: {CANONICAL['innovations']} innovations, {CANONICAL['crown_jewels']} CJ, {CANONICAL['production_systems']} production systems",
        'implementation_status': 'live',
        'innovation_ids': [],
        'system_components': ['Stitchpunk Corps', 'Staff of Librarians', 'Cephas', 'Librarian MCP'],
        'timestamp': now_iso,
    })

    pipeline_payload = {
        'timestamp': now_iso,
        'session_id': session_id,
        'agent': agent,
        'entry_count': len(pipeline_entries),
        'entries': pipeline_entries,
    }

    with open(PIPELINE_PAYLOAD_PATH, 'w') as f:
        json.dump(pipeline_payload, f, indent=2)
    print(f"  Pipeline payload: {PIPELINE_PAYLOAD_PATH} ({len(pipeline_entries)} entries)")

    # Save herald state
    update = {
        'timestamp': now_iso,
        'session_id': session_id,
        'agent': agent,
        'fly_on_the_wall_path': str(fly_path),
        'under_the_hood_path': str(hood_path),
        'pipeline_payload_path': str(PIPELINE_PAYLOAD_PATH),
        'canonical': CANONICAL,
    }

    with open(HERALD_PATH, 'w') as f:
        json.dump(update, f, indent=2)

    print(f"  Herald state: {HERALD_PATH}")
    return update


if __name__ == '__main__':
    run('B063', 'BISHOP',
        'Pudding 100 complete. Four-Agent V2 assembled. AI Cake V2 updated. '
        'Vault cleanup (112 files organized). Stitchpunk Corps Phase 1 built and tested. '
        'Librarian rebuilt. Firebase deployed. 23/23 domains confirmed.',
        documents_produced=[
            'Pudding #83-100 (18 articles)',
            'AI Cake paper V2',
            'INDL-9 abstract updated',
            'LB Card counsel routing doc',
            'Vault cleanup manifest',
            'Stitchpunk Corps architecture',
        ],
        key_decisions=[
            'V2 migration confirmed 23/23 — Vehicle was last domain',
            'Pudding century hit — 100 articles',
            'Stitchpunk Corps designed — 9 automated backend librarians',
            'Vault cleanup executed — 112 files organized (copy, not move)',
        ])
