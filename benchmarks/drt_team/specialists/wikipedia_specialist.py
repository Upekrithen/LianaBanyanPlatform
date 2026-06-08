"""WikipediaSpecialist -- DRT team specialist for Wikipedia.

BM-MNEM-30 S01 (BP077). Returns Eblet dicts for a query using the MediaWiki
REST API with on-disk cache. Falls back to libzim if installed and configured.

Offline-first posture: cache hits never make network calls.
Honor 4-SKU: NANO SKU returns empty list immediately.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from urllib.parse import quote

log = logging.getLogger(__name__)

try:
    import requests  # type: ignore
except ImportError:
    requests = None  # type: ignore

# ---------------------------------------------------------------------------
# libzim optional import (offline ZIM path)
# ---------------------------------------------------------------------------
try:
    import libzim as _libzim_mod  # type: ignore
    _LIBZIM_AVAILABLE = True
except ImportError:
    _LIBZIM_AVAILABLE = False

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

WIKI_API = "https://en.wikipedia.org/w/api.php"
WIKI_REST_SUMMARY = "https://en.wikipedia.org/api/rest_v1/page/summary/{title}"
WIKI_USER_AGENT = "LianaBanyanResearch/0.1 (BP077 BM-MNEM-30 S01 DRT; lianabanyan.com)"
WIKI_SLEEP_S = 0.5          # polite inter-call delay per dispatch spec
WIKI_TIMEOUT_S = 12

SPECIALIST_ID = "wikipedia"
LONG_QUERY_CHARS = 200       # queries longer than this get distilled first

# Cache location: benchmarks/drt_team/cache/wikipedia/{sha256}.json
_THIS_DIR = Path(__file__).parent
_CACHE_DIR = _THIS_DIR.parent / "cache" / "wikipedia"

# SKU env variable -- "NANO" short-circuits to empty list
_SKU_ENV = "MNEM_SKU"

# ---------------------------------------------------------------------------
# Stopwords (no external deps)
# ---------------------------------------------------------------------------
_STOPWORDS = frozenset({
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were",
    "be", "been", "being", "have", "has", "had", "do", "does", "did",
    "will", "would", "shall", "should", "may", "might", "must", "can",
    "could", "that", "this", "these", "those", "of", "in", "on", "at",
    "by", "to", "from", "with", "for", "not", "no", "nor", "yet", "so",
    "as", "if", "then", "what", "which", "who", "how", "when", "where",
    "why", "all", "any", "both", "each", "few", "more", "most", "other",
    "some", "such", "very", "just", "than", "too", "also", "it", "its",
    "they", "them", "their", "there", "here", "up", "out", "through",
    "into", "about", "over", "under", "again", "further",
    "i", "you", "he", "she", "we", "me", "my", "your", "our",
    # MMLU MCQ framing noise
    "question", "questions", "answer", "options", "option", "choice",
    "choices", "multiple", "following", "correct", "letter",
})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _cache_path(cache_key: str) -> Path:
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    return _CACHE_DIR / f"{_sha256(cache_key)}.json"


def _save_cache(path: Path, data: list) -> None:
    """Persist results to disk. Silently ignores write failures."""
    try:
        with path.open("w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)
    except Exception:
        pass


def _tokenize(text: str) -> List[str]:
    """Lowercase alpha-only tokenization; strips stopwords. No external deps."""
    return [
        t.lower() for t in re.findall(r"[A-Za-z][A-Za-z']*", text)
        if t.lower() not in _STOPWORDS and len(t) > 1
    ]


def _bm25_lite(query_tokens: List[str], section_text: str,
               k1: float = 1.5, b: float = 0.75) -> float:
    """BM25-lite score: term-frequency component with length normalization.

    Single-document variant: no IDF (single corpus has no useful IDF signal).
    Implementation is inline with no external dependencies per dispatch spec.
    Returns 0.0 if either argument is empty.
    """
    if not query_tokens or not section_text:
        return 0.0
    sec_tokens = _tokenize(section_text)
    if not sec_tokens:
        return 0.0
    sec_len = len(sec_tokens)
    tf_counts = Counter(sec_tokens)
    score = 0.0
    for qt in set(query_tokens):
        tf = tf_counts.get(qt, 0)
        if tf == 0:
            continue
        score += (tf * (k1 + 1)) / (tf + k1 * (1.0 - b + b * sec_len / max(sec_len, 1)))
    return score


def _split_sections(full_text: str) -> List[str]:
    """Split plain-text extract into section-like blocks.

    The MediaWiki explaintext extract separates sections with blank lines
    and section headers (== Title ==). We split on two+ newlines and drop
    very short fragments (< 30 chars) as headers/noise.
    """
    parts = re.split(r"\n{2,}", full_text.strip())
    return [p.strip() for p in parts if len(p.strip()) >= 30]


def _distill_queries(question: str) -> List[str]:
    """Extract up to 3 short Wikipedia-friendly search queries from a long
    MMLU-style question. No NLP deps -- pure regex heuristic.
    """
    # Strip few-shot preamble: take last "Question:" block
    last_q = question.rfind("Question:")
    body = question[last_q + len("Question:"):] if last_q != -1 else question
    for marker in ("\nOptions:", "Options:", "\nA.", "Answer with"):
        idx = body.find(marker)
        if idx != -1:
            body = body[:idx]
            break
    body = body.strip()
    if not body:
        return [question.strip()[:100]] if question.strip() else []

    candidates: List[str] = []
    seen: set = set()

    def _push(s: str) -> None:
        s = s.strip(" \t\n.,;:!?")[:100]
        if not s:
            return
        key = s.lower()
        if key in seen:
            return
        tokens = re.findall(r"[A-Za-z][A-Za-z']*", s)
        if all(t.lower() in _STOPWORDS for t in tokens):
            return
        seen.add(key)
        candidates.append(s)

    # Capitalized multi-word phrases (proper nouns / titles)
    for m in re.finditer(r"\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,3})\b", body):
        _push(m.group(1))

    # Contiguous non-stopword runs of 2-5 words
    tokens_all = re.findall(r"[A-Za-z][A-Za-z']*", body)
    run: List[str] = []
    for tok in tokens_all:
        if tok.lower() in _STOPWORDS:
            if len(run) >= 2:
                _push(" ".join(run[:5]))
            run = []
        else:
            run.append(tok)
    if len(run) >= 2:
        _push(" ".join(run[:5]))

    if not candidates:
        words = [t for t in tokens_all if t.lower() not in _STOPWORDS]
        if words:
            _push(" ".join(words[:4]))

    return candidates[:3]


def _http_get_json(url: str, params: Optional[dict] = None) -> Optional[dict]:
    """GET with exponential backoff on 429/5xx. Returns JSON or None.

    Truth-Always: never fabricates; returns None on any failure.
    Heart of Peace: polite User-Agent; backoff on server errors.
    """
    if requests is None:
        raise RuntimeError("requests not installed -- pip install requests")
    headers = {"User-Agent": WIKI_USER_AGENT, "Accept": "application/json"}
    backoff = 1.0
    for _attempt in range(3):
        try:
            r = requests.get(
                url, params=params or {}, headers=headers,
                timeout=WIKI_TIMEOUT_S,
            )
        except Exception as exc:
            log.warning("Wikipedia request error: %s", exc)
            time.sleep(backoff)
            backoff *= 2
            continue
        if r.status_code == 200:
            try:
                return r.json()
            except Exception:
                return None
        if r.status_code == 429 or 500 <= r.status_code < 600:
            time.sleep(backoff)
            backoff *= 2
            continue
        return None  # 4xx other than 429 -- give up cleanly
    return None


def _build_eblet(
    url: str,
    title: str,
    lede: str,
    sections: List[str],
) -> dict:
    """Construct an Eblet dict with all required fields."""
    retrieval_ts = _utc_iso()
    provenance_hash = _sha256(url + title + retrieval_ts)
    return {
        "source_url": url,
        "title": title,
        "lede": lede[:1000],
        "sections": [s[:500] for s in sections],
        "retrieval_ts": retrieval_ts,
        "specialist_id": SPECIALIST_ID,
        "provenance_hash": provenance_hash,
    }


# ---------------------------------------------------------------------------
# WikipediaSpecialist
# ---------------------------------------------------------------------------

class WikipediaSpecialist:
    """DRT specialist: Wikipedia. Returns Eblet dicts for a query.

    Default: REST API with on-disk cache. Falls back to libzim if installed
    and MNEM_ZIM_PATH env var points to a valid ZIM archive.
    Offline-first posture: cache hits never make network calls.
    Honor 4-SKU: NANO SKU returns empty list immediately.
    """

    def fetch(self, query: str, k: int = 5) -> list:
        """Fetch Wikipedia evidence Eblets for `query`.

        Returns list of Eblet dicts. Each Eblet has:
          - source_url: str
          - title: str
          - lede: str (first paragraph)
          - sections: list[str] (top-k sections by BM25 relevance to query)
          - retrieval_ts: str (ISO-8601 UTC)
          - specialist_id: "wikipedia"
          - provenance_hash: str (sha256 of source_url + title + retrieval_ts)

        Truth-Always: returns [] on API failure; never fabricates.
        Heart of Peace: WIKI_SLEEP_S delay between API calls; polite UA.
        """
        # 4-SKU guard: NANO returns empty immediately
        sku = os.environ.get(_SKU_ENV, "FULL").upper()
        if sku == "NANO":
            return []

        if not query or not query.strip():
            return []

        cache_key = f"{query}|k={k}"
        cp = _cache_path(cache_key)
        if cp.exists():
            try:
                with cp.open("r", encoding="utf-8") as f:
                    cached = json.load(f)
                if isinstance(cached, list):
                    return cached
            except Exception:
                pass  # corrupt cache -- refetch

        # libzim offline path (preferred if configured)
        if _LIBZIM_AVAILABLE:
            try:
                results = self._fetch_libzim(query, k)
                if results:
                    _save_cache(cp, results)
                    return results
            except Exception as exc:
                log.warning("libzim path failed (%s), falling back to REST API", exc)

        results = self._fetch_rest(query, k)
        if results:
            _save_cache(cp, results)
        return results

    # ------------------------------------------------------------------
    # REST API path
    # ------------------------------------------------------------------

    def _fetch_rest(self, query: str, k: int) -> list:
        """Fetch via live MediaWiki API. Returns list of Eblet dicts."""
        if len(query) > LONG_QUERY_CHARS:
            search_queries = _distill_queries(query)
        else:
            search_queries = [query.strip()]

        query_tokens = _tokenize(query)
        results: list = []
        seen_urls: set = set()

        for sq in search_queries:
            if len(results) >= k:
                break
            sub = self._search_and_build(sq, query, query_tokens, k, seen_urls)
            results.extend(sub)

        return results[:k]

    def _search_and_build(
        self,
        search_query: str,
        query_origin: str,
        query_tokens: List[str],
        k: int,
        seen_urls: set,
    ) -> list:
        """Run opensearch + extract for one short search query."""
        # Step 1: opensearch -> titles + URLs
        search = _http_get_json(
            WIKI_API,
            {
                "action": "opensearch",
                "search": search_query,
                "limit": max(k, 3),
                "namespace": 0,
                "format": "json",
            },
        )
        time.sleep(WIKI_SLEEP_S)

        if not search or not isinstance(search, list) or len(search) < 4:
            return []

        titles: List[str] = search[1] if isinstance(search[1], list) else []
        urls: List[str] = search[3] if isinstance(search[3], list) else []

        if not titles:
            return []

        results: list = []
        for i, title in enumerate(titles[:k]):
            # Step 2: full-text extract (intro + sections, plain text)
            extract_resp = _http_get_json(
                WIKI_API,
                {
                    "action": "query",
                    "titles": title,
                    "prop": "extracts",
                    "explaintext": 1,
                    "redirects": 1,
                    "format": "json",
                },
            )
            time.sleep(WIKI_SLEEP_S)

            if not extract_resp:
                continue

            try:
                pages = extract_resp["query"]["pages"]
            except (KeyError, TypeError):
                continue

            full_text = ""
            actual_title = title
            for pid, page in pages.items():
                if pid == "-1":
                    continue
                full_text = (page.get("extract") or "").strip()
                actual_title = (page.get("title") or title).strip()
                break

            if not full_text:
                continue

            # Build canonical URL
            url = (
                urls[i] if i < len(urls) and urls[i]
                else "https://en.wikipedia.org/wiki/{}".format(
                    quote(actual_title.replace(" ", "_"))
                )
            )
            if url in seen_urls:
                continue
            seen_urls.add(url)

            # Lede: first non-empty paragraph
            paras = [p.strip() for p in full_text.split("\n\n") if p.strip()]
            lede = paras[0] if paras else full_text[:500].strip()

            # BM25-lite section ranking
            all_sections = _split_sections(full_text)
            if query_tokens and all_sections:
                scored = sorted(
                    all_sections,
                    key=lambda s: _bm25_lite(query_tokens, s),
                    reverse=True,
                )
                top_sections = scored[:k]
            else:
                top_sections = all_sections[:k]

            results.append(_build_eblet(url, actual_title, lede, top_sections))

        return results

    # ------------------------------------------------------------------
    # libzim offline path
    # ------------------------------------------------------------------

    def _fetch_libzim(self, query: str, k: int) -> list:
        """Offline retrieval via libzim. Raises on any config error."""
        zim_path = os.environ.get("MNEM_ZIM_PATH", "")
        if not zim_path or not Path(zim_path).exists():
            raise RuntimeError(
                "MNEM_ZIM_PATH not set or ZIM archive not found -- "
                "falling back to REST API"
            )

        archive = _libzim_mod.Archive(zim_path)
        query_tokens = _tokenize(query)
        results: list = []

        try:
            searcher = _libzim_mod.Searcher(archive)
            query_obj = _libzim_mod.Query().set_query(query)
            search = searcher.search(query_obj)
            hits = search.getResults(0, k)
            for entry in hits:
                try:
                    path = entry.get_path()
                    item = archive.get_entry_by_path(path)
                    raw = bytes(item.get_item().content).decode("utf-8", errors="ignore")
                    # Strip HTML
                    text = re.sub(r"<[^>]{0,300}>", " ", raw)
                    text = re.sub(r"\s+", " ", text).strip()
                    title = path.split("/")[-1].replace("_", " ")
                    url = "https://en.wikipedia.org/wiki/{}".format(
                        quote(title.replace(" ", "_"))
                    )
                    all_sections = _split_sections(text)
                    top_sections = sorted(
                        all_sections,
                        key=lambda s: _bm25_lite(query_tokens, s),
                        reverse=True,
                    )[:k]
                    lede = all_sections[0][:1000] if all_sections else text[:500]
                    results.append(_build_eblet(url, title, lede, top_sections))
                    if len(results) >= k:
                        break
                except Exception:
                    continue
        except AttributeError:
            raise RuntimeError("libzim version lacks Searcher API")

        return results[:k]
