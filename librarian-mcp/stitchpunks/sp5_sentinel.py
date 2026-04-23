"""
SP-5: THE SENTINEL
Verifies canonical numbers across all files. Reports stale values.
This is the AI Nanny health check as a Stitchpunk.
Trigger: Every session start + every deploy.
Output: librarian-mcp/stitchpunks/data/sentinel_report.json
"""

import os
import re
import json
from datetime import datetime
from pathlib import Path
from urllib import error as urllib_error
from urllib import parse as urllib_parse
from urllib import request as urllib_request

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
DATA_DIR = Path(__file__).parent / "data"
REPORT_PATH = DATA_DIR / "sentinel_report.json"
PLATFORM_ENV_PATH = WORKSPACE / "platform" / ".env"

# Hardcoded fallback canonical values when Supabase is unavailable.
FALLBACK_CANONICAL = {
    'innovation_count': 2130,
    'crown_jewel_count': 168,
    'formal_claims': 2103,
    'provisional_apps': 11,
    'production_systems': 35,
    'membership_cost': '$5/year',
    'creator_keeps': '83.3%',
    'platform_margin': 'Cost + 20%',
    'entity_name': 'LIANA BANYAN CORPORATION',
    'entity_type': 'Wyoming C-Corp',
}

CANONICAL_KEY_MAP = {
    'innovation_count': 'innovation_count',
    'crown_jewel_count': 'crown_jewel_count',
    'formal_claims_count': 'formal_claims',
    'provisional_count': 'provisional_apps',
    'production_systems_count': 'production_systems',
    'membership_cost': 'membership_cost',
}

PLATFORM_CANONICAL_KEYS = tuple(CANONICAL_KEY_MAP.keys())

# Patterns to find stale canonical references
PATTERNS = {
    'innovation_count': [
        r'(\d{1,2},?\d{3})\s+(?:documented\s+)?innovations',
        r'innovation[_ ]count["\s:=]+(\d{1,2},?\d{3})',
        r'(\d{4,5})\s+innovations',
    ],
    'crown_jewel_count': [
        r'(\d{1,3})\s+(?:Crown\s+Jewel|crown.jewel)',
        r'crown.jewel.count["\s:=]+(\d{1,3})',
    ],
    'formal_claims': [
        r'(\d{1,2},?\d{3})\s+formal\s+claims',
        r'formal.claims["\s:=]+(\d{1,2},?\d{3})',
    ],
    'provisional_apps': [
        r'(\d{1,2})\s+provisional',
        r'provisional.apps["\s:=]+(\d{1,2})',
    ],
}

# File types to scan
SCAN_EXTENSIONS = {'.md', '.tsx', '.ts', '.sql', '.json', '.txt', '.html'}

# Directories to skip
SKIP_DIRS = {'node_modules', '.git', 'dist', '.venv', '__pycache__', '.supabase', '.cache'}


def normalize_number(s: str) -> int:
    """Convert '2,130' or '2130' to int."""
    return int(s.replace(',', ''))


def parse_canonical_value(raw_value):
    """Parse canonical DB values into expected scalar forms."""
    if isinstance(raw_value, (int, float)):
        return int(raw_value)
    if isinstance(raw_value, str):
        stripped = raw_value.strip()
        if re.fullmatch(r'\d{1,3}(?:,\d{3})*', stripped) or stripped.isdigit():
            return normalize_number(stripped)
        return stripped
    return raw_value


def load_dotenv(path: Path) -> dict:
    """Best-effort .env parser for local tool scripts."""
    values = {}
    if not path.exists():
        return values
    try:
        for line in path.read_text(encoding="utf-8", errors="ignore").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#") or "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    except Exception:
        return {}
    return values


def resolve_supabase_credentials():
    """Resolve Supabase URL + key from env, then platform/.env fallback."""
    env_url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
    env_key = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")
        or os.getenv("SUPABASE_ANON_KEY")
    )
    if env_url and env_key:
        return env_url, env_key

    dotenv = load_dotenv(PLATFORM_ENV_PATH)
    file_url = dotenv.get("SUPABASE_URL") or dotenv.get("VITE_SUPABASE_URL")
    file_key = (
        dotenv.get("SUPABASE_SERVICE_ROLE_KEY")
        or dotenv.get("VITE_SUPABASE_PUBLISHABLE_KEY")
        or dotenv.get("SUPABASE_ANON_KEY")
    )
    if file_url and file_key:
        return file_url, file_key

    return None, None


def fetch_canonical_from_supabase():
    """Load canonical values from platform_canonical via Supabase REST."""
    supabase_url, service_role_key = resolve_supabase_credentials()
    if not supabase_url or not service_role_key:
        raise RuntimeError("Could not resolve Supabase URL/key from env or platform/.env")

    rest_base = supabase_url.rstrip("/")
    keys_clause = ",".join(f'"{key}"' for key in PLATFORM_CANONICAL_KEYS)
    query = urllib_parse.urlencode({
        "select": "key,value",
        "key": f"in.({keys_clause})",
    })
    url = f"{rest_base}/rest/v1/platform_canonical?{query}"
    req = urllib_request.Request(
        url,
        headers={
            "apikey": service_role_key,
            "Authorization": f"Bearer {service_role_key}",
            "Accept": "application/json",
        },
    )

    with urllib_request.urlopen(req, timeout=10) as response:
        body = response.read().decode("utf-8")
        rows = json.loads(body)

    canonical = dict(FALLBACK_CANONICAL)
    for row in rows:
        source_key = row.get("key")
        target_key = CANONICAL_KEY_MAP.get(source_key)
        if not target_key:
            continue
        canonical[target_key] = parse_canonical_value(row.get("value"))

    # Static non-table invariants remain in code (not in platform_canonical).
    canonical['creator_keeps'] = FALLBACK_CANONICAL['creator_keeps']
    canonical['platform_margin'] = FALLBACK_CANONICAL['platform_margin']
    canonical['entity_name'] = FALLBACK_CANONICAL['entity_name']
    canonical['entity_type'] = FALLBACK_CANONICAL['entity_type']
    return canonical


def load_canonical_values():
    """Return canonical values plus source indicator."""
    try:
        return fetch_canonical_from_supabase(), "supabase"
    except (RuntimeError, urllib_error.URLError, urllib_error.HTTPError, json.JSONDecodeError, TimeoutError) as exc:
        print(f"  WARNING: Supabase canonical fetch failed ({exc}); using hardcoded fallback.")
        return dict(FALLBACK_CANONICAL), "hardcoded_fallback"


def scan_for_stale_values(canonical: dict, canonical_source: str) -> dict:
    """Scan all content files for stale canonical references."""
    report = {
        'timestamp': datetime.now().isoformat(),
        'canonical': canonical,
        'canonical_source': canonical_source,
        'violations': [],
        'files_scanned': 0,
        'files_with_issues': 0,
        'total_violations': 0,
    }

    seen_files = set()

    for root, dirs, files in os.walk(WORKSPACE):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for filename in files:
            ext = os.path.splitext(filename)[1].lower()
            if ext not in SCAN_EXTENSIONS:
                continue

            filepath = os.path.join(root, filename)
            rel_path = os.path.relpath(filepath, WORKSPACE)

            # Skip very large files
            try:
                if os.path.getsize(filepath) > 500_000:  # 500KB
                    continue
            except Exception:
                continue

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except Exception:
                continue

            report['files_scanned'] += 1
            file_has_issue = False

            for field, patterns in PATTERNS.items():
                expected = canonical[field]
                if isinstance(expected, str):
                    continue  # Skip string fields for now

                for pattern in patterns:
                    for match in re.finditer(pattern, content, re.IGNORECASE):
                        found_str = match.group(1)
                        try:
                            found_val = normalize_number(found_str)
                        except ValueError:
                            continue

                        if found_val != expected and found_val > 100:  # Skip small numbers
                            violation = {
                                'file': rel_path,
                                'field': field,
                                'expected': expected,
                                'found': found_val,
                                'context': content[max(0, match.start()-30):match.end()+30].strip(),
                                'line': content[:match.start()].count('\n') + 1,
                            }
                            report['violations'].append(violation)
                            report['total_violations'] += 1
                            file_has_issue = True

            if file_has_issue:
                report['files_with_issues'] += 1

    return report


def run():
    """Execute the Sentinel scan."""
    print("SP-5 SENTINEL: Verifying canonical numbers...")
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    canonical, source = load_canonical_values()
    report = scan_for_stale_values(canonical, source)

    with open(REPORT_PATH, 'w') as f:
        json.dump(report, f, indent=2, default=str)

    print(f"  Files scanned: {report['files_scanned']}")
    print(f"  Files with issues: {report['files_with_issues']}")
    print(f"  Total violations: {report['total_violations']}")
    print(f"  Canonical source: {report['canonical_source']}")

    if report['violations']:
        print(f"\n  TOP VIOLATIONS:")
        for v in report['violations'][:10]:
            print(f"    {v['file']}:{v['line']} — {v['field']}: expected {v['expected']}, found {v['found']}")
    else:
        print("  ALL CLEAR — No stale canonical values detected.")

    print(f"  Report: {REPORT_PATH}")
    return report


if __name__ == '__main__':
    run()
