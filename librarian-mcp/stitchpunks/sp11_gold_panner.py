"""
SP-11 GOLD PANNER

Read content_archive rows from Supabase in batches, surface "gold" signals
using local heuristics, and emit ranked JSON artifacts + summary report.

Usage:
  python sp11_gold_panner.py
  python sp11_gold_panner.py --resume
  python sp11_gold_panner.py --limit 1000
  python sp11_gold_panner.py --dry-run
"""

from __future__ import annotations

import argparse
import json
import os
import re
import time
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import requests
except ImportError:
    requests = None

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data"
GOLD_DIR = DATA_DIR / "gold"
ARCHIVE_DIR = DATA_DIR / "content_archive"
ARCHIVE_INDEX_PATH = DATA_DIR / "content_archive_index.json"
ENV_PATH = SCRIPT_DIR / ".env"

STATE_PATH = GOLD_DIR / "gold_panner_state.json"
RESUME_CACHE_PATH = GOLD_DIR / "gold_panner_resume_cache.json"
INNOVATION_PATH = GOLD_DIR / "candidate_innovations_b079.json"
QUOTES_PATH = GOLD_DIR / "quotable_passages_b079.json"
THEME_PATH = GOLD_DIR / "theme_map_b079.json"
CONTRADICTION_PATH = GOLD_DIR / "contradiction_log_b079.json"
NAMES_PATH = GOLD_DIR / "name_org_extraction_b079.json"
REPORT_PATH = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\99_Misc\GOLD_PANNER_REPORT_B079.md")

BATCH_SIZE = 200
CHECKPOINT_EVERY_BATCH = 1
TARGET_INNOVATIONS = 200
TARGET_QUOTES = 500
MIN_INNOVATIONS = 100
MIN_QUOTES = 250

DEFAULT_CANONICALS: Dict[str, Any] = {
    "innovation_count": 2150,
    "initiative_count": 16,
    "crown_jewels": 184,
    "creator_keep_pct": "83.3%",
    "membership_price": "$5/year",
    "cost_plus_floor": "20%",
}

EXCLUDED_FROM_QUOTABLES = [
    "BISHOP_DROPZONE/PROMPT_KNIGHT_",
    "BISHOP_DROPZONE/PROMPT_PAWN_",
    "BISHOP_DROPZONE/BISHOP_HANDOFF_",
    "BISHOP_DROPZONE/PUDDING_",
    "BISHOP_DROPZONE/COMPILED_PUDDING_",
    "BISHOP_DROPZONE/HISTORY_PUDDING_",
    "BISHOP_DROPZONE/CANONICAL_STATS_UPDATE_",
    "AA_FORMAL_",
    "/assets/",
    "dist-backup-",
    ".sql",
    ".tsx",
    ".ts",
    ".js",
    ".html",
]

EXCLUDED_FROM_INNOVATIONS = [
    "BISHOP_DROPZONE/PROMPT_KNIGHT_",
    "BISHOP_DROPZONE/PROMPT_PAWN_",
    "BISHOP_DROPZONE/BISHOP_HANDOFF_",
    "BISHOP_DROPZONE/PUDDING_",
    "BISHOP_DROPZONE/COMPILED_PUDDING_",
    "BISHOP_DROPZONE/HISTORY_PUDDING_",
    "BISHOP_DROPZONE/CANONICAL_STATS_UPDATE_",
    "AA_FORMAL_",
    "dist-backup-",
]

QUALITY_BOOSTS = {
    "letters/circle-": 0.15,
    "LETTER_MACKENZIE_SCOTT": 0.12,
    "LETTER-MOLLY-WHITE": 0.10,
    "PITCH-INVESTOPEDIA": 0.10,
    "02_WRITTEN/01_Crown_Letters/": 0.08,
    "02_WRITTEN/05_Academic_Papers/": 0.08,
    "Cephas/cephas-hugo/content/": 0.06,
    "journals/": 0.10,
    "Founders_Journal": 0.10,
}

QUALITY_PENALTIES = {
    "PROMPT_KNIGHT_SESSION_": -0.20,
    "PROMPT_PAWN_": -0.20,
    "BISHOP_HANDOFF_": -0.15,
    "COMPILED_PUDDING_": -0.12,
    "HISTORY_PUDDING_": -0.12,
    "PROVISIONAL_": -0.10,
    "AA_FORMAL_": -0.15,
}

FIRST_PERSON_PATTERNS = [
    r"\bI've built\b",
    r"\bI'm launching\b",
    r"\bI asked\b",
    r"\bwe built\b",
    r"\bI believe\b",
    r"\bI want you to\b",
    r"\bI'm writing\b",
    r"\bI know\b",
    r"\bMy\b",
    r"\bI decided\b",
    r"\bI chose\b",
]

CROWN_LETTER_STEMS = [
    r"I want you to be the \w+",
    r"be the Crown of",
    r"Fleet Admiral / Crown for",
    r"I'm asking you to be",
    r"Apothecary Mentor",
    r"Lender Mentor",
]

STOP_WORDS = {
    "the", "and", "for", "with", "from", "that", "this", "your", "into",
    "about", "when", "where", "their", "there", "were", "been", "will",
    "have", "has", "had", "are", "was", "not", "all", "one", "two", "three",
    "you", "our", "its", "they", "them", "his", "her", "she", "him", "who",
    "what", "why", "how", "but", "can", "could", "would", "should", "also",
}


THEME_DEFS: Dict[str, List[str]] = {
    "cost_plus_20": [r"cost\+20", r"cost\s*\+\s*20", r"cost plus 20"],
    "creator_keep_83_3": [r"83\.3%", r"83\.3 percent", r"creator keeps"],
    "membership_5": [r"\$5/year", r"\$5 per year", r"membership.*\$5"],
    "sweet_sixteen": [r"sweet sixteen", r"\b16 initiatives\b", r"initiative[s]?\s+16"],
    "cooperative": [r"cooperative", r"help each other help ourselves"],
    "closed_loop": [r"closed-loop", r"closed loop", r"loop"],
    "railroad": [r"railroad", r"rail way", r"track"],
    "medallion": [r"medallion", r"ship medallion"],
    "crown_jewel": [r"crown jewel", r"crown jewels"],
    "hexisle": [r"hexisle"],
    "pudding": [r"pudding", r"puddings"],
    "soup": [r"soup"],
    "spice": [r"spice rack", r"spice"],
    "recipe_pot": [r"recipe pot"],
    "red_carpet": [r"red carpet"],
    "bridge": [r"pipeline bridge", r"\bbridge\b"],
    "sentinel": [r"\bsentinel\b", r"\bsp-5\b"],
    "stitchpunk_corps": [r"stitchpunk", r"corps"],
    "innovation_log": [r"innovation log", r"innovation #\d{1,4}"],
    "claims_language": [r"\bclaims\b", r"method comprising", r"embodiments?", r"prior art"],
    "founder_voice": [r"\bi\b", r"\bwe\b", r"founder"],
    "platform_margin": [r"platform margin", r"margin"],
    "wildfire_tour": [r"wildfire tour"],
    "real_data": [r"real data"],
    "show_me_help": [r"show me", r"\bhelp\b"],
    "crown_initiative": [r"let'?s make dinner", r"rally group", r"vsl", r"harper guild"],
    "patent": [r"provisional", r"patent", r"formal claims?"],
    "contradiction": [r"contradiction", r"canonical", r"reconciliation"],
    "deployment": [r"firebase deploy", r"hosting:"],
    "membership": [r"membership", r"member[s]?"],
}


KNOWN_CROWN_PEOPLE = {
    "Maneet Chauhan", "Mary Beth Laughton", "Kimberly A. Williams", "Cathie Mahon",
    "Warren Buffett", "Melinda French Gates", "Dolly Parton", "Taylor Swift",
    "Jimmy Kimmel", "Craig Newmark", "Seth Godin", "Howard Marks", "Li Jin",
    "Majora Carter", "Tatiana Schlossberg", "Anand Giridharadas", "Kara Swisher",
}


@dataclass
class RowContext:
    row_id: str
    source_file: str
    slug: str
    title: str
    session_id: str
    content: str


def _safe_json_dump(path: Path, payload: Dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2, ensure_ascii=False)


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def load_canonicals() -> Dict[str, Any]:
    repo_root = SCRIPT_DIR.parent
    candidates = [
        repo_root / "indexes" / "canonical.json",
        repo_root / "index" / "canonical.json",
        repo_root / "indexes" / "overview.json",
        repo_root / "index" / "overview.json",
    ]

    canonical_payload: Dict[str, Any] = {}
    source = None
    for path in candidates:
        payload = _load_json(path, {})
        if isinstance(payload, dict) and payload:
            canonical_payload = payload
            source = path
            break

    if not canonical_payload:
        print("WARN: canonical index missing; using fallback canonical defaults.")
        return dict(DEFAULT_CANONICALS)

    def _num(*keys: str, default: int = 0) -> int:
        for key in keys:
            value = canonical_payload.get(key)
            if isinstance(value, int):
                return value
            if isinstance(value, str) and value.isdigit():
                return int(value)
        return default

    def _text(*keys: str, default: str = "") -> str:
        for key in keys:
            value = canonical_payload.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()
        return default

    resolved = {
        "innovation_count": _num("innovation_count", "innovationCount", default=DEFAULT_CANONICALS["innovation_count"]),
        "initiative_count": _num("initiative_count", "initiativeCount", default=DEFAULT_CANONICALS["initiative_count"]),
        "crown_jewels": _num("crown_jewels", "crownJewelCount", default=DEFAULT_CANONICALS["crown_jewels"]),
        "creator_keep_pct": _text("creator_keep_pct", "creatorKeeps", default=DEFAULT_CANONICALS["creator_keep_pct"]),
        "membership_price": _text("membership_price", "membershipCost", default=DEFAULT_CANONICALS["membership_price"]),
        "cost_plus_floor": _text("cost_plus_floor", "platformMargin", default=DEFAULT_CANONICALS["cost_plus_floor"]),
    }
    print(f"Loaded canonicals from {source}")
    return resolved


def _load_env() -> Tuple[str, str]:
    if load_dotenv and ENV_PATH.exists():
        load_dotenv(ENV_PATH)
    return os.environ.get("SUPABASE_URL", ""), os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


def _rest_headers(service_key: str) -> Dict[str, str]:
    return {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }


def _split_passages(text: str) -> List[str]:
    chunks = re.split(r"(?<=[\.\!\?])\s+|\n{2,}", text or "")
    return [c.strip() for c in chunks if c and c.strip()]


def _extract_context_window(text: str, match_span: Tuple[int, int], window: int = 180) -> Tuple[str, str]:
    start, end = match_span
    pre = text[max(0, start - window):start].strip()
    post = text[end:min(len(text), end + window)].strip()
    return pre, post


def _normalized_key(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9\s]", "", (text or "").lower())).strip()


def _is_patent_heavy_path(path: str) -> bool:
    p = (path or "").lower()
    return "patent" in p or "papers" in p or "03_patent_bags" in p


def _is_excluded_path(path: str, patterns: List[str]) -> bool:
    p = (path or "").replace("\\", "/").lower()
    for pattern in patterns:
        if pattern.lower() in p:
            return True
    return False


def _extract_known_innovation_number(text: str) -> Optional[int]:
    m = re.search(r"#\s*(\d{1,4})\b", text)
    if not m:
        return None
    n = int(m.group(1))
    if 1 <= n <= 9999:
        return n
    return None


def _extract_named_concepts(text: str) -> List[str]:
    concepts = []
    for token in ("Liana Banyan", "Crown", "Pudding", "HexIsle", "Medallion", "Rally Group", "Sweet Sixteen"):
        if re.search(re.escape(token), text, re.IGNORECASE):
            concepts.append(token)
    return concepts


def _metaphor_tags(text: str) -> List[str]:
    tags = []
    lookup = {
        "crown": [r"crown", r"medallion", r"fleet admiral", r"mentor", r"chancellor"],
        "pudding": [r"pudding", r"proof is in the pudding", r"this is not pudding", r"start with pudding", r"spoonful"],
        "ship": [r"ship", r"harbor", r"voyage", r"captain", r"fleet", r"anchor", r"mast"],
        "lighthouse": [r"lighthouse", r"beacon", r"ladder", r"rung"],
        "waterwheel": [r"waterwheel", r"water wheel", r"millstone", r"millrace"],
        "railroad": [r"railroad", r"rail", r"track", r"locomotive", r"caboose"],
        "canister": [r"canister", r"injection mold", r"hydraulic"],
        "battery": [r"battery dispatch", r"burst", r"pacing"],
        "kitchen": [r"kitchen", r"table", r"soup", r"bread", r"stone soup", r"recipe", r"pot", r"spices?", r"popcorn", r"ingredient"],
        "brick-wall": [r"brick wall", r"starscreaming"],
        "harper": [r"harper", r"cub harper", r"bounty"],
        "steward": [r"steward", r"ombudsperson"],
        "joule": [r"joule", r"forever stamp", r"surplus"],
        "ghost": [r"ghost credits?", r"ghost browse", r"ghost world"],
        "spoonful": [r"spoonful of cephas", r"skipping stone"],
        "currency": [r"credits", r"marks", r"cost\+20", r"83\.3"],
        "family": [r"family table", r"family fund", r"family tribe"],
        "guild": [r"guild", r"tribe", r"charter", r"stake"],
        "governance": [r"star chamber", r"backer election", r"areopagus", r"five-rook"],
        "manufacturing": [r"design democracy", r"pioneer node", r"earn-down"],
        "adapt": [r"adapt score", r"dependability", r"timeliness"],
        "commerce": [r"storefront", r"marketplace", r"crew call", r"red carpet"],
        "defense": [r"content shield", r"dirty dozen", r"ip governance"],
        "outreach": [r"cue card", r"dispatch", r"coalition", r"bounty photography"],
        "founder": [r"founder", r"general manager", r"eight children", r"veteran"],
    }
    for tag, patterns in lookup.items():
        if any(re.search(p, text, re.IGNORECASE) for p in patterns):
            tags.append(tag)
    return tags


def _first_person_detected(text: str) -> bool:
    return any(re.search(p, text, re.IGNORECASE) for p in FIRST_PERSON_PATTERNS)


def _source_quality_adjustment(path: str) -> Tuple[float, str]:
    score_delta = 0.0
    normalized = (path or "").replace("\\", "/")
    for pat, val in QUALITY_BOOSTS.items():
        if pat in normalized:
            score_delta += val
    for pat, val in QUALITY_PENALTIES.items():
        if pat in normalized:
            score_delta += val

    if score_delta >= 0.12:
        tier = "founder_voice"
    elif score_delta >= 0.06:
        tier = "high"
    elif score_delta >= 0.0:
        tier = "medium"
    else:
        tier = "low"
    return score_delta, tier


def _crown_stem_match(text: str) -> Optional[str]:
    for stem in CROWN_LETTER_STEMS:
        if re.search(stem, text, re.IGNORECASE):
            return stem
    return None


def _is_boilerplate_quote(text: str) -> bool:
    t = (text or "").strip().lower()
    if "http://" in t or "https://" in t:
        return True
    if len(re.findall(r"\w+", t)) < 8:
        return True
    if t.count("|") >= 3:
        return True
    return False


def _extract_people_names(text: str) -> Iterable[str]:
    for m in re.finditer(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b", text or ""):
        candidate = m.group(1).strip()
        if len(candidate) < 5:
            continue
        bits = candidate.split()
        if any(b.lower() in STOP_WORDS for b in bits):
            continue
        yield candidate


def _extract_org_names(text: str) -> Iterable[str]:
    patterns = [
        r"\b([A-Z][A-Za-z0-9&\.\- ]{2,60}\s(?:Inc|Corp|LLC|Company|Foundation|Institute|University))\b",
        r"\b([A-Z][A-Za-z0-9&\.\- ]{2,60}\s(?:Labs|Lab|Studios|Press|Media|Group))\b",
    ]
    for pat in patterns:
        for m in re.finditer(pat, text or ""):
            org = re.sub(r"\s+", " ", m.group(1)).strip()
            if len(org) >= 5:
                yield org


def _fetch_supabase_rows(
    supabase_url: str,
    service_key: str,
    table: str,
    select_clause: str,
    offset: int,
    limit: int,
) -> List[Dict[str, Any]]:
    if not requests:
        raise RuntimeError("requests library missing; run: pip install requests")

    endpoint = f"{supabase_url}/rest/v1/{table}"
    params = {
        "select": select_clause,
        "order": "id.asc",
        "offset": str(offset),
        "limit": str(limit),
    }
    resp = requests.get(endpoint, headers=_rest_headers(service_key), params=params, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"{table} query failed HTTP {resp.status_code}: {resp.text[:400]}")
    data = resp.json()
    return data if isinstance(data, list) else []


def _detect_supabase_source(supabase_url: str, service_key: str) -> Optional[Tuple[str, str]]:
    """
    Prefer original content_archive; fall back to content_pipeline if archive table is absent.
    Returns (table, select_clause) or None if no viable source exists.
    """
    if not requests:
        return None
    candidates = [
        ("content_archive", "id,slug,title,source_file_path,session_id,content_markdown,created_at"),
        (
            "content_pipeline",
            "id,slug,title,cephas_path,corps_source,seed_content,tldr_content,blog_content,article_content,paper_content,updated_at",
        ),
    ]
    for table, select_clause in candidates:
        endpoint = f"{supabase_url}/rest/v1/{table}"
        params = {"select": "id", "limit": "1"}
        try:
            resp = requests.get(endpoint, headers=_rest_headers(service_key), params=params, timeout=30)
            if resp.status_code in (200, 206):
                return table, select_clause
        except Exception:
            continue
    return None


def _map_row_from_supabase(row: Dict[str, Any], table: str) -> RowContext:
    if table == "content_archive":
        content = row.get("content_markdown") or ""
        source_file = row.get("source_file_path") or row.get("path") or ""
        session_id = row.get("session_id") or ""
    else:
        # content_pipeline fallback: pick richest available content field.
        candidates = [
            row.get("paper_content"),
            row.get("article_content"),
            row.get("blog_content"),
            row.get("tldr_content"),
            row.get("seed_content"),
        ]
        content = ""
        for c in candidates:
            if isinstance(c, str) and len(c.strip()) > len(content):
                content = c.strip()
        source_file = row.get("cephas_path") or row.get("corps_source") or row.get("slug") or ""
        session_id = row.get("session_id") or ""

    if not isinstance(source_file, str):
        try:
            source_file = json.dumps(source_file, ensure_ascii=False)
        except Exception:
            source_file = str(source_file)

    return RowContext(
        row_id=str(row.get("id", "")),
        source_file=source_file,
        slug=row.get("slug") or "",
        title=row.get("title") or "",
        session_id=session_id,
        content=content,
    )


def _load_local_archive_entries() -> List[Dict[str, Any]]:
    idx = _load_json(ARCHIVE_INDEX_PATH, {})
    entries = idx.get("entries", []) if isinstance(idx, dict) else []
    return entries if isinstance(entries, list) else []


def _fetch_local_rows(entries: List[Dict[str, Any]], offset: int, limit: int) -> List[RowContext]:
    batch = entries[offset: offset + limit]
    out: List[RowContext] = []
    for item in batch:
        archive_file = ARCHIVE_DIR / (item.get("archive_file") or "")
        if not archive_file.exists():
            continue
        data = _load_json(archive_file, {})
        content = data.get("content_markdown") or ""
        if not isinstance(content, str):
            continue
        source_file = data.get("path") or item.get("path") or ""
        source_file = source_file.replace("\\", "/")
        session_id = ""
        m = re.search(r"\b(B\d{3})\b", source_file, re.IGNORECASE)
        if m:
            session_id = m.group(1).upper()
        out.append(RowContext(
            row_id=str(item.get("archive_file") or item.get("path") or ""),
            source_file=source_file,
            slug=data.get("slug") or item.get("slug") or "",
            title=data.get("title") or item.get("title") or "",
            session_id=session_id,
            content=content,
        ))
    return out


def _fetch_known_innovation_refs(supabase_url: str, service_key: str) -> set:
    if not requests:
        return set()
    endpoint = f"{supabase_url}/rest/v1/innovation_log"
    params = {"select": "innovation_number,innovation_id,id,title", "limit": "3000"}
    try:
        resp = requests.get(endpoint, headers=_rest_headers(service_key), params=params, timeout=45)
        if resp.status_code != 200:
            return set()
        rows = resp.json()
        refs = set()
        for r in rows:
            for key in ("innovation_number", "innovation_id", "id"):
                value = r.get(key)
                if isinstance(value, int):
                    refs.add(value)
                elif isinstance(value, str) and value.isdigit():
                    refs.add(int(value))
        return refs
    except Exception:
        return set()


def _innovation_candidates_for_row(row: RowContext, known_refs: set, canonicals: Dict[str, Any]) -> List[Dict[str, Any]]:
    patterns = [
        ("innovation-keyword", r"\binnovation\b"),
        ("i-invented", r"\bI invented\b"),
        ("new-system", r"\bnew system\b"),
        ("called", r"\bwe call this\b|\bthis is called\b"),
        ("novel", r"\bnovel approach\b|\bfirst of its kind\b"),
        ("innovation-number", r"#\d{4}\b"),
        ("crown-jewel", r"\bCrown Jewel\b"),
        ("patent-adjacent", r"\bclaims\b|\bembodiments?\b|\bprior art\b|\bmethod comprising\b"),
        ("architectural-pattern", r"\bthe [A-Za-z0-9\- ]{2,30} system\b|\bthe [A-Za-z0-9\- ]{2,30} mechanism\b|\bwhen .* happens,\s*.* occurs\b"),
    ]

    if _is_excluded_path(row.source_file, EXCLUDED_FROM_INNOVATIONS):
        return []

    found: List[Dict[str, Any]] = []
    innovation_max = int(canonicals.get("innovation_count", DEFAULT_CANONICALS["innovation_count"]))
    for passage in _split_passages(row.content):
        p_lower = passage.lower()
        hits = []
        for name, pat in patterns:
            if re.search(pat, passage, re.IGNORECASE):
                hits.append(name)
        if not hits:
            continue

        score = 0.2 + (0.11 * len(set(hits)))
        if _is_patent_heavy_path(row.source_file):
            score += 0.12
        if "handoff" in row.source_file.lower() or "dropzone" in row.source_file.lower():
            score -= 0.08

        known_num = _extract_known_innovation_number(passage)
        canonical_number_present = known_num is not None
        number_in_registry = bool(known_num is not None and 1 <= known_num <= innovation_max)
        if known_num is not None:
            if known_num in known_refs:
                score -= 0.15
            elif 1 <= known_num <= innovation_max:
                score -= 0.05

        m = re.search(re.escape(passage[: min(40, len(passage))]), row.content)
        match_span = m.span() if m else (0, min(len(passage), len(row.content)))
        before, after = _extract_context_window(row.content, match_span)

        normalized_score = round(max(0.0, min(1.0, score)), 4)
        found.append({
            "score": normalized_score,
            "passage": passage,
            "source_file": row.source_file,
            "source_slug": row.slug,
            "context_before": before,
            "context_after": after,
            "matched_heuristics": sorted(set(hits)),
            "already_known_innovation": known_num if (known_num in known_refs) else None,
            "canonical_number_present": canonical_number_present,
            "number_in_registry": number_in_registry,
            "likely_net_new": (not canonical_number_present) and normalized_score >= 0.60,
        })
    return found


def _quote_candidates_for_row(row: RowContext, uniqueness_counter: Counter) -> List[Dict[str, Any]]:
    if _is_excluded_path(row.source_file, EXCLUDED_FROM_QUOTABLES):
        return []

    out: List[Dict[str, Any]] = []
    quality_delta, source_quality_tier = _source_quality_adjustment(row.source_file)
    for passage in _split_passages(row.content):
        if re.search(r"PROMPT_KNIGHT_|PROMPT_PAWN_|AA_FORMAL_", passage, re.IGNORECASE):
            continue
        words = re.findall(r"\b\w+\b", passage)
        wc = len(words)
        if wc < 12 or wc > 60:
            continue
        if _is_boilerplate_quote(passage):
            continue
        if not re.match(r"^[A-Z]", passage):
            continue
        if not re.search(r"[\.\!\?:]$", passage):
            continue

        rhetorical = re.search(r"\b(What if|Imagine|The truth is|This is why|Consider:)\b", passage) is not None
        metaphors = _metaphor_tags(passage)
        named = _extract_named_concepts(passage)
        founder_voice = re.search(r"\b(I|we|our|I'd|we'd)\b", passage, re.IGNORECASE) is not None
        first_person_detected = _first_person_detected(passage)
        high_signal = rhetorical or bool(metaphors) or bool(named) or founder_voice
        if not high_signal:
            continue

        base_score = 0.38
        if named:
            base_score += 0.2
        if founder_voice:
            base_score += 0.12
        if rhetorical:
            base_score += 0.08
        if uniqueness_counter[_normalized_key(passage)] == 1:
            base_score += 0.15
        base_score += min(0.12, len(metaphors) * 0.04)
        if len(metaphors) >= 2:
            base_score += 0.05
        if first_person_detected:
            base_score += 0.08
        quality_boosted_score = base_score + quality_delta
        final_score = round(max(0.0, min(1.0, quality_boosted_score)), 4)

        out.append({
            "score": final_score,
            "base_score": round(max(0.0, min(1.0, base_score)), 4),
            "quality_boosted_score": round(quality_boosted_score, 4),
            "quote": passage,
            "source_file": row.source_file,
            "word_count": wc,
            "metaphor_tags": metaphors,
            "named_concepts": named,
            "source_quality_tier": source_quality_tier,
            "first_person_detected": first_person_detected,
        })
    return out


def _collect_theme_mentions(row: RowContext) -> Dict[str, List[str]]:
    mentions: Dict[str, List[str]] = defaultdict(list)
    passages = _split_passages(row.content)
    for passage in passages:
        for theme, pats in THEME_DEFS.items():
            if any(re.search(p, passage, re.IGNORECASE) for p in pats):
                mentions[theme].append(passage)
    return mentions


def _contradictions_from_row(row: RowContext, canonicals: Dict[str, Any]) -> List[Dict[str, Any]]:
    hits: List[Dict[str, Any]] = []
    content = row.content
    canonical_creator_keep = str(canonicals.get("creator_keep_pct", DEFAULT_CANONICALS["creator_keep_pct"]))
    canonical_initiatives = int(canonicals.get("initiative_count", DEFAULT_CANONICALS["initiative_count"]))
    canonical_innovation_count = int(canonicals.get("innovation_count", DEFAULT_CANONICALS["innovation_count"]))

    for pct in re.finditer(r"\b(8[234](?:\.\d)?%)\b", content):
        val = pct.group(1)
        if val != canonical_creator_keep:
            hits.append({
                "topic": "creator_keep_percentage",
                "canonical": canonical_creator_keep,
                "value": val,
                "file": row.source_file,
                "session": row.session_id,
                "severity": "high" if val in {"83%", "84%"} else "medium",
            })

    for n in re.finditer(r"\b(\d{1,2})\s+initiatives?\b", content, re.IGNORECASE):
        val = int(n.group(1))
        if val != canonical_initiatives:
            hits.append({
                "topic": "initiative_count",
                "canonical": str(canonical_initiatives),
                "value": str(val),
                "file": row.source_file,
                "session": row.session_id,
                "severity": "high" if val in {14, 15, 17} else "medium",
            })

    for n in re.finditer(r"\b(?:innovation[s]?\s*(?:count|total)?\s*[:=]?\s*)(\d{3,4})\b", content, re.IGNORECASE):
        val = int(n.group(1))
        if val != canonical_innovation_count:
            hits.append({
                "topic": "innovation_count",
                "canonical": str(canonical_innovation_count),
                "value": str(val),
                "file": row.source_file,
                "session": row.session_id,
                "severity": "medium",
            })
    return hits


def _score_name_candidate(name: str, mentions: int) -> float:
    base = 0.35 + min(0.4, mentions * 0.03)
    if len(name.split()) >= 2:
        base += 0.1
    if name in KNOWN_CROWN_PEOPLE:
        base -= 0.25
    return round(max(0.0, min(1.0, base)), 4)


def _render_report(
    innovations: List[Dict[str, Any]],
    quotes: List[Dict[str, Any]],
    theme_map: Dict[str, Any],
    contradictions: List[Dict[str, Any]],
    people: List[Dict[str, Any]],
    orgs: List[Dict[str, Any]],
    source_files_scanned: int,
) -> str:
    def _md_link(path: Path) -> str:
        return path.as_posix()

    lines: List[str] = []
    lines.append("# GOLD PANNER REPORT B079")
    lines.append("")
    lines.append(f"- Generated: {datetime.now().isoformat()}")
    lines.append(f"- Source files scanned: {source_files_scanned}")
    lines.append(f"- Candidate innovations surfaced: {len(innovations)}")
    lines.append(f"- Quotable passages surfaced: {len(quotes)}")
    lines.append("")

    lines.append("## Top 20 Candidate Innovations")
    for i, item in enumerate(innovations[:20], start=1):
        lines.append(f"{i}. **{item['score']:.2f}** — {item['passage'][:220]}  ")
        lines.append(f"   - Source: `{item['source_file']}`")
        lines.append(f"   - Heuristics: {', '.join(item.get('matched_heuristics', []))}")
    lines.append("")

    lines.append("## Top 50 Quotable Passages")
    for i, item in enumerate(quotes[:50], start=1):
        lines.append(f"{i}. **{item['score']:.2f}** — \"{item['quote']}\"")
        lines.append(f"   - Source: `{item['source_file']}`")
    lines.append("")

    lines.append("## Theme Frequency Heatmap (Top 30)")
    top_themes = sorted(theme_map.items(), key=lambda kv: kv[1]["mention_count"], reverse=True)[:30]
    for theme, info in top_themes:
        bars = "█" * max(1, min(20, info["mention_count"] // 25))
        lines.append(f"- `{theme}` | {info['mention_count']} mentions | {bars}")
    lines.append("")

    lines.append("## Top 10 Contradictions Needing Reconciliation")
    for i, item in enumerate(contradictions[:10], start=1):
        first = (item.get("conflicting_statements") or [{}])[0]
        conflicting_value = first.get("value", "n/a")
        conflicting_file = first.get("file", "unknown")
        lines.append(
            f"{i}. **{item['topic']}** canonical `{item['canonical']}` vs `{conflicting_value}` "
            f"in `{conflicting_file}` ({item.get('severity', 'medium')})"
        )
    lines.append("")

    lines.append("## Top 20 New Name/Org Outreach Candidates")
    rank = 1
    for p in people[:10]:
        lines.append(f"{rank}. Person: **{p['name']}** ({p['mention_count']} mentions)")
        rank += 1
    for o in orgs[:10]:
        lines.append(f"{rank}. Organization: **{o['name']}** ({o['mention_count']} mentions)")
        rank += 1
    lines.append("")

    lines.append("## Full JSON Outputs")
    lines.append(f"- `{_md_link(INNOVATION_PATH)}`")
    lines.append(f"- `{_md_link(QUOTES_PATH)}`")
    lines.append(f"- `{_md_link(THEME_PATH)}`")
    lines.append(f"- `{_md_link(CONTRADICTION_PATH)}`")
    lines.append(f"- `{_md_link(NAMES_PATH)}`")
    lines.append(f"- `{_md_link(STATE_PATH)}`")
    lines.append("")

    return "\n".join(lines) + "\n"


def _serialize_theme_mentions(theme_mentions: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    payload: Dict[str, Any] = {}
    for theme, info in theme_mentions.items():
        payload[theme] = {
            "mention_count": info.get("mention_count", 0),
            "file_set": sorted(info.get("file_set", set())),
            "session_set": sorted(info.get("session_set", set())),
            "sample_passages": info.get("sample_passages", []),
        }
    return payload


def _deserialize_theme_mentions(payload: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    theme_mentions: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "mention_count": 0,
        "file_set": set(),
        "session_set": set(),
        "sample_passages": [],
    })
    for theme, info in (payload or {}).items():
        bucket = theme_mentions[theme]
        bucket["mention_count"] = int(info.get("mention_count", 0))
        bucket["file_set"] = set(info.get("file_set", []))
        bucket["session_set"] = set(info.get("session_set", []))
        bucket["sample_passages"] = list(info.get("sample_passages", []))
    return theme_mentions


def _serialize_entity_index(index: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for name, rec in index.items():
        out[name] = {
            "mention_count": rec.get("mention_count", 0),
            "contexts": rec.get("contexts", []),
            "sessions": sorted(rec.get("sessions", set())),
        }
    return out


def _deserialize_entity_index(payload: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
    index: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "mention_count": 0, "contexts": [], "sessions": set(),
    })
    for name, rec in (payload or {}).items():
        entry = index[name]
        entry["mention_count"] = int(rec.get("mention_count", 0))
        entry["contexts"] = list(rec.get("contexts", []))
        entry["sessions"] = set(rec.get("sessions", []))
    return index


def run(resume: bool = False, row_limit: int = 0, dry_run: bool = False) -> None:
    GOLD_DIR.mkdir(parents=True, exist_ok=True)
    canonicals = load_canonicals()

    supabase_url, service_key = _load_env()
    if not supabase_url or not service_key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in stitchpunks/.env")

    state = _load_json(STATE_PATH, {
        "started_at": datetime.now().isoformat(),
        "last_updated": None,
        "offset": 0,
        "batches_completed": 0,
        "source_files_scanned": 0,
        "passages_seen": 0,
        "innovation_candidates_seen": 0,
        "quote_candidates_seen": 0,
    })
    if not resume:
        state["offset"] = 0
        state["batches_completed"] = 0
        state["source_files_scanned"] = 0
        state["passages_seen"] = 0
        state["innovation_candidates_seen"] = 0
        state["quote_candidates_seen"] = 0

    supabase_source = _detect_supabase_source(supabase_url, service_key)
    local_entries = _load_local_archive_entries()
    if supabase_source and supabase_source[0] == "content_archive":
        source_mode = f"supabase:{supabase_source[0]}"
    elif local_entries:
        source_mode = "local_archive_fallback"
    elif supabase_source:
        source_mode = f"supabase:{supabase_source[0]}"
    else:
        raise RuntimeError("No usable source found (no Supabase table and no local archive index).")

    known_innovation_refs = _fetch_known_innovation_refs(supabase_url, service_key) if supabase_source else set()

    default_theme_mentions: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "mention_count": 0,
        "file_set": set(),
        "session_set": set(),
        "sample_passages": [],
    })
    default_people_index: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "mention_count": 0, "contexts": [], "sessions": set(),
    })
    default_org_index: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
        "mention_count": 0, "contexts": [], "sessions": set(),
    })

    if resume and RESUME_CACHE_PATH.exists():
        cache = _load_json(RESUME_CACHE_PATH, {})
        innovations = list(cache.get("innovations", []))
        quotes = list(cache.get("quotes", []))
        theme_mentions = _deserialize_theme_mentions(cache.get("theme_mentions", {}))
        contradictions_raw = list(cache.get("contradictions_raw", []))
        people_index = _deserialize_entity_index(cache.get("people_index", {}))
        org_index = _deserialize_entity_index(cache.get("org_index", {}))
        quote_uniqueness = Counter(cache.get("quote_uniqueness", {}))
    else:
        innovations = []
        quotes = []
        theme_mentions = default_theme_mentions
        contradictions_raw = []
        people_index = default_people_index
        org_index = default_org_index
        quote_uniqueness = Counter()

    offset = int(state.get("offset", 0))
    scanned_rows = int(state.get("source_files_scanned", 0))

    print("=" * 70)
    print("SP-11 GOLD PANNER")
    print(f"Start offset: {offset}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Resume mode: {resume}")
    print(f"Source mode: {source_mode}")
    print(f"Canonicals: innovation={canonicals['innovation_count']} initiative={canonicals['initiative_count']} creator_keep={canonicals['creator_keep_pct']}")
    print("=" * 70)

    while True:
        if row_limit and scanned_rows >= row_limit:
            break

        remaining = row_limit - scanned_rows if row_limit else BATCH_SIZE
        limit = min(BATCH_SIZE, remaining) if row_limit else BATCH_SIZE

        if source_mode.startswith("supabase:") and supabase_source:
            table, select_clause = supabase_source
            raw_rows = _fetch_supabase_rows(
                supabase_url=supabase_url,
                service_key=service_key,
                table=table,
                select_clause=select_clause,
                offset=offset,
                limit=limit,
            )
            rows = [_map_row_from_supabase(r, table) for r in raw_rows]
        else:
            rows = _fetch_local_rows(local_entries, offset=offset, limit=limit)
        if not rows:
            break

        batch_innov = 0
        batch_quotes = 0
        batch_passages = 0

        for ctx in rows:
            content = ctx.content or ""
            if not isinstance(content, str) or not content.strip():
                continue
            source_file = ctx.source_file
            session_id = ctx.session_id

            passages = _split_passages(content)
            batch_passages += len(passages)
            state["passages_seen"] = int(state.get("passages_seen", 0)) + len(passages)

            for p in passages:
                quote_uniqueness[_normalized_key(p)] += 1

            inv = _innovation_candidates_for_row(ctx, known_innovation_refs, canonicals)
            innovations.extend(inv)
            batch_innov += len(inv)

            q = _quote_candidates_for_row(ctx, quote_uniqueness)
            quotes.extend(q)
            batch_quotes += len(q)

            t = _collect_theme_mentions(ctx)
            for theme, samples in t.items():
                bucket = theme_mentions[theme]
                bucket["mention_count"] += len(samples)
                bucket["file_set"].add(source_file)
                if session_id:
                    bucket["session_set"].add(session_id)
                for s in samples[:2]:
                    if s not in bucket["sample_passages"] and len(bucket["sample_passages"]) < 6:
                        bucket["sample_passages"].append(s)

            for c in _contradictions_from_row(ctx, canonicals):
                contradictions_raw.append(c)

            row_window = content[:4000]
            for person in _extract_people_names(row_window):
                rec = people_index[person]
                rec["mention_count"] += 1
                if len(rec["contexts"]) < 3:
                    rec["contexts"].append(f"{source_file}: {person}")
                if session_id:
                    rec["sessions"].add(session_id)

            for org in _extract_org_names(row_window):
                rec = org_index[org]
                rec["mention_count"] += 1
                if len(rec["contexts"]) < 3:
                    rec["contexts"].append(f"{source_file}: {org}")
                if session_id:
                    rec["sessions"].add(session_id)

            scanned_rows += 1

        offset += len(rows)
        state["offset"] = offset
        state["batches_completed"] = int(state.get("batches_completed", 0)) + 1
        state["source_files_scanned"] = scanned_rows
        state["innovation_candidates_seen"] = int(state.get("innovation_candidates_seen", 0)) + batch_innov
        state["quote_candidates_seen"] = int(state.get("quote_candidates_seen", 0)) + batch_quotes
        state["last_updated"] = datetime.now().isoformat()

        if state["batches_completed"] % CHECKPOINT_EVERY_BATCH == 0:
            _safe_json_dump(STATE_PATH, state)
            _safe_json_dump(RESUME_CACHE_PATH, {
                "innovations": innovations,
                "quotes": quotes,
                "theme_mentions": _serialize_theme_mentions(theme_mentions),
                "contradictions_raw": contradictions_raw,
                "people_index": _serialize_entity_index(people_index),
                "org_index": _serialize_entity_index(org_index),
                "quote_uniqueness": dict(quote_uniqueness),
            })

        print(
            f"Batch {state['batches_completed']:>3} | rows {len(rows):>3} | "
            f"files_scanned {scanned_rows:>5} | passages {batch_passages:>6} | "
            f"innov {batch_innov:>5} | quotes {batch_quotes:>5}"
        )

        time.sleep(0.1)

    # Deduplicate + rank innovations
    inv_seen = set()
    dedup_innov = []
    for item in sorted(innovations, key=lambda x: x["score"], reverse=True):
        key = (item.get("source_file"), _normalized_key(item.get("passage", "")))
        if key in inv_seen:
            continue
        inv_seen.add(key)
        dedup_innov.append(item)
    top_innov = dedup_innov[:TARGET_INNOVATIONS]

    # Deduplicate + rank quotes
    quote_seen = set()
    dedup_quotes = []
    best_crown_stem: Dict[str, Dict[str, Any]] = {}
    for item in sorted(quotes, key=lambda x: x["score"], reverse=True):
        key = _normalized_key(item.get("quote", ""))
        if key in quote_seen:
            continue
        stem = _crown_stem_match(item.get("quote", ""))
        if stem:
            existing = best_crown_stem.get(stem)
            if existing and existing.get("score", 0.0) >= item.get("score", 0.0):
                continue
            best_crown_stem[stem] = item
            continue
        quote_seen.add(key)
        dedup_quotes.append(item)
    dedup_quotes.extend(best_crown_stem.values())
    dedup_quotes.sort(key=lambda x: x["score"], reverse=True)
    top_quotes = dedup_quotes[:TARGET_QUOTES]

    # Theme map format
    theme_map: Dict[str, Any] = {}
    for theme, info in theme_mentions.items():
        sessions = sorted(info["session_set"])
        span = []
        if sessions:
            span = [sessions[0], sessions[-1]]
        theme_map[theme] = {
            "mention_count": info["mention_count"],
            "file_count": len(info["file_set"]),
            "session_span": span,
            "sample_passages": info["sample_passages"][:3],
        }

    # Contradictions grouped by topic/value
    grouped: Dict[Tuple[str, str], List[Dict[str, Any]]] = defaultdict(list)
    for c in contradictions_raw:
        grouped[(c["topic"], c["value"])].append(c)
    contradictions_final: List[Dict[str, Any]] = []
    for (topic, value), items in grouped.items():
        canonical = items[0]["canonical"]
        severity = "high" if any(i.get("severity") == "high" for i in items) else "medium"
        conflicts = [{"value": value, "file": i["file"], "session": i.get("session", "")} for i in items[:10]]
        contradictions_final.append({
            "topic": topic,
            "canonical": canonical,
            "conflicting_statements": conflicts,
            "severity": severity,
        })
    contradictions_final.sort(key=lambda x: (0 if x["severity"] == "high" else 1, -len(x["conflicting_statements"])))

    # Name/org extraction
    people_payload = []
    for name, rec in people_index.items():
        if name in KNOWN_CROWN_PEOPLE:
            continue
        if rec["mention_count"] < 2:
            continue
        people_payload.append({
            "name": name,
            "mention_count": rec["mention_count"],
            "context_samples": rec["contexts"][:3],
            "is_known_crown_candidate": name in KNOWN_CROWN_PEOPLE,
            "sessions_mentioned": sorted(rec["sessions"])[:20],
            "score": _score_name_candidate(name, rec["mention_count"]),
        })
    people_payload.sort(key=lambda x: (x["score"], x["mention_count"]), reverse=True)

    org_payload = []
    for name, rec in org_index.items():
        if rec["mention_count"] < 2:
            continue
        score = round(max(0.0, min(1.0, 0.35 + min(0.45, rec["mention_count"] * 0.04))), 4)
        org_payload.append({
            "name": name,
            "mention_count": rec["mention_count"],
            "context_samples": rec["contexts"][:3],
            "sessions_mentioned": sorted(rec["sessions"])[:20],
            "score": score,
        })
    org_payload.sort(key=lambda x: (x["score"], x["mention_count"]), reverse=True)

    innovation_payload = {
        "candidates": top_innov,
        "total_candidates": len(top_innov),
        "source_files_scanned": scanned_rows,
    }
    quotes_payload = {
        "passages": top_quotes,
        "total_passages": len(top_quotes),
    }
    theme_payload = {"themes": theme_map}
    contradiction_payload = {"contradictions": contradictions_final}
    names_payload = {"people": people_payload, "organizations": org_payload}

    if not dry_run:
        _safe_json_dump(INNOVATION_PATH, innovation_payload)
        _safe_json_dump(QUOTES_PATH, quotes_payload)
        _safe_json_dump(THEME_PATH, theme_payload)
        _safe_json_dump(CONTRADICTION_PATH, contradiction_payload)
        _safe_json_dump(NAMES_PATH, names_payload)
        _safe_json_dump(STATE_PATH, state)
        _safe_json_dump(RESUME_CACHE_PATH, {
            "innovations": innovations,
            "quotes": quotes,
            "theme_mentions": _serialize_theme_mentions(theme_mentions),
            "contradictions_raw": contradictions_raw,
            "people_index": _serialize_entity_index(people_index),
            "org_index": _serialize_entity_index(org_index),
            "quote_uniqueness": dict(quote_uniqueness),
        })

        report = _render_report(
            innovations=top_innov,
            quotes=top_quotes,
            theme_map=theme_map,
            contradictions=contradictions_final,
            people=people_payload,
            orgs=org_payload,
            source_files_scanned=scanned_rows,
        )
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            f.write(report)

    print("\nRun complete.")
    print(f"Scanned rows: {scanned_rows}")
    print(f"Innovation candidates: {len(top_innov)}")
    print(f"Quotable passages: {len(top_quotes)}")
    print(f"Contradictions: {len(contradictions_final)}")
    print(f"People candidates: {len(people_payload)}")
    print(f"Org candidates: {len(org_payload)}")

    if len(top_innov) < MIN_INNOVATIONS:
        print(f"WARNING: innovations below target minimum ({MIN_INNOVATIONS})")
    if len(top_quotes) < MIN_QUOTES:
        print(f"WARNING: quotes below target minimum ({MIN_QUOTES})")
    if len(contradictions_final) < 5:
        print("WARNING: contradictions below expected minimum (5)")


def main() -> None:
    parser = argparse.ArgumentParser(description="SP-11 Gold Panner")
    parser.add_argument("--resume", action="store_true", help="Resume from saved state offset")
    parser.add_argument("--limit", type=int, default=0, help="Optional cap on rows scanned")
    parser.add_argument("--dry-run", action="store_true", help="Compute but do not write outputs")
    args = parser.parse_args()
    run(resume=args.resume, row_limit=max(0, args.limit), dry_run=args.dry_run)


if __name__ == "__main__":
    main()
