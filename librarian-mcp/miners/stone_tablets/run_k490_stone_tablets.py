"""
K490 Phase A — Stone Tablet Retroactive Tagger

Scans all existing bedrock (K482/K486 = LB-CAT.M-0001 family in bedrock/;
K487 = LB-CAT.M-0002 family in bedrock/) against all 30 Rhetorical Keystones.
Produces per-keystone Stone Tablet JSONL files in stone_tablets/.

Match algorithm (non-LLM):
  1. VERBATIM   — keystone phrase (or ≥70% contiguous word-run) appears literally
                  in extracted_content (case-insensitive, unicode-normalized).
                  Confidence: 0.95 (full phrase) or 0.90 (major fragment).
  2. PARAPHRASE — ≥60% of non-stopword keystone words found in extracted_content
                  (case-insensitive). Score = matched / total_keystone_words.
                  Confidence: 0.50 + (match_ratio - 0.60) * 0.975 (range 0.50-0.89).
  3. THEMATIC   — ≥2 of keystone's domain thematic_keywords found in
                  extracted_content OR tablet keywords list.
                  Confidence: 0.30 + 0.05 * min(thematic_hits - 2, 4) (range 0.30-0.49).

Guardrails:
  - REF Staff discipline: reads bedrock, writes only to stone_tablets/.
  - Idempotency: dedup_key = tablet_id + '::' + keystone_id. Skip if already written.
  - Output: stone_tablets/KEYSTONE-{NN}.jsonl (one file per keystone, 30 files).
  - Stone Tablet IDs: LB-ST.{KEYSTONE_ID}-T{N:04d}
  - Brick-wall: runs on FULL bedrock (M-0001 + M-0002), not a sample.

K490 · B123
"""

from __future__ import annotations

import json
import re
import time
import unicodedata
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────

HERE = Path(__file__).parent
BEDROCK_DIR = HERE.parent / "bedrock"
KEYSTONES_REGISTRY = HERE / "keystones_registry.json"
OUTPUT_DIR = HERE
DEDUP_LOG = HERE / "dedup_log.json"

SESSION = "K490"
BISHOP_SESSION = "B123"
INCEPTION_TIMESTAMP = datetime.now(timezone.utc).isoformat()

# ── Stop words (same set as miner.py) ─────────────────────────────────────────

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "it", "its", "be", "was",
    "are", "were", "been", "has", "have", "had", "do", "does", "did",
    "will", "would", "could", "should", "may", "might", "this", "that",
    "these", "those", "i", "we", "you", "he", "she", "they", "not",
    "no", "so", "if", "then", "than", "when", "what", "which", "who",
    "how", "also", "about", "into", "out", "up", "can", "one", "two",
    "all", "more", "any", "each", "their", "there", "here", "his", "her",
    "our", "your", "my", "me", "us", "them", "s", "t", "re", "ve", "ll",
    "d", "m", "just", "only", "very", "well", "like", "get", "see",
    "new", "via", "per", "non",
}

# ── Unicode normalization helper ───────────────────────────────────────────────

def normalize(text: str) -> str:
    """Normalize unicode (em-dash → --, curly quotes → straight, etc.) and lowercase."""
    text = unicodedata.normalize("NFKD", text)
    # Normalize common typographic chars that appear in Founder writing
    text = text.replace("\u2014", " ").replace("\u2013", " ")  # em-dash, en-dash
    text = text.replace("\u2018", "'").replace("\u2019", "'")  # curly single quotes
    text = text.replace("\u201c", '"').replace("\u201d", '"')  # curly double quotes
    text = text.replace("\u2026", "...")                        # ellipsis
    return text.lower()


def tokenize(text: str) -> list[str]:
    """Extract word tokens (alpha+apostrophe, min length 2)."""
    return [w for w in re.findall(r"[a-z']+", normalize(text)) if len(w) >= 2]


def content_words(text: str) -> set[str]:
    """Extract non-stopword tokens from text."""
    return {w for w in tokenize(text) if w not in STOP_WORDS}

# ── Corpus origin detection ────────────────────────────────────────────────────

def detect_source_corpus(miner_serial: str) -> str:
    """Infer which mining session produced this tablet from the miner serial."""
    if miner_serial.startswith("LB-CAT.M-0001"):
        # M-0001 family: K482 produced root; K486 produced daughters
        # Heuristic: root + depth-1 daughters = K482; deeper = K486
        # (K486 run_miner_k486.py spawned daughters from K482 root)
        depth = len(miner_serial.split(".")) - 3  # LB-CAT.M-0001 = depth 0
        return "K482" if depth <= 0 else "K486"
    if miner_serial.startswith("LB-CAT.M-0002"):
        return "K487"
    return "unknown"

# ── Keystone matcher ───────────────────────────────────────────────────────────

class KeystoneMatcher:
    def __init__(self, keystone: dict):
        self.keystone = keystone
        self.kid = keystone["id"]
        self.phrase = keystone["phrase"]
        self.provenance = keystone["provenance"]
        self.thematic_kws = set(w.lower() for w in keystone.get("thematic_keywords", []))

        # Pre-compute normalized phrase and content words
        self.phrase_norm = normalize(self.phrase)
        self.phrase_tokens = tokenize(self.phrase)
        self.phrase_content_words = content_words(self.phrase)

        # Build verbatim sub-phrase (fragments) for partial verbatim matching
        # Use the 5 most distinctive words from the phrase (non-stop, longest first)
        distinctive = sorted(
            [w for w in self.phrase_content_words if len(w) >= 5],
            key=len, reverse=True
        )[:5]
        self.distinctive_words = distinctive

    def match(self, tablet: dict) -> dict | None:
        """
        Attempt to match this keystone against a tablet.
        Returns a match-result dict or None if no match.
        """
        content = tablet.get("extracted_content", "")
        keywords_list = tablet.get("keywords", [])
        content_norm = normalize(content)
        keywords_norm = {normalize(k) for k in keywords_list}

        # ── 1. Verbatim match ─────────────────────────────────────────────────
        result = self._check_verbatim(content_norm)
        if result:
            return result

        # ── 2. Paraphrase match ───────────────────────────────────────────────
        result = self._check_paraphrase(content_norm)
        if result:
            return result

        # ── 3. Thematic match ─────────────────────────────────────────────────
        result = self._check_thematic(content_norm, keywords_norm)
        if result:
            return result

        return None

    def _check_verbatim(self, content_norm: str) -> dict | None:
        # Full phrase match
        if self.phrase_norm in content_norm:
            return {
                "match_type": "verbatim",
                "match_confidence": 0.95,
                "matched_words": [],
                "matched_thematic": [],
                "verbatim_fragment": self.phrase,
            }

        # Partial verbatim: look for runs of ≥4 consecutive keystone tokens
        if len(self.phrase_tokens) >= 4:
            run_len = max(4, int(len(self.phrase_tokens) * 0.70))
            for start in range(len(self.phrase_tokens) - run_len + 1):
                fragment = " ".join(self.phrase_tokens[start:start + run_len])
                if fragment in content_norm:
                    return {
                        "match_type": "verbatim",
                        "match_confidence": 0.90,
                        "matched_words": [],
                        "matched_thematic": [],
                        "verbatim_fragment": fragment,
                    }

        # Check for 3+ distinctive long words appearing together
        if len(self.distinctive_words) >= 3:
            hits = [w for w in self.distinctive_words if w in content_norm]
            if len(hits) >= 3:
                # Additional check: are they within 200 chars of each other?
                positions = []
                for w in hits:
                    idx = content_norm.find(w)
                    if idx >= 0:
                        positions.append(idx)
                if positions and max(positions) - min(positions) <= 500:
                    return {
                        "match_type": "verbatim",
                        "match_confidence": 0.90,
                        "matched_words": hits,
                        "matched_thematic": [],
                        "verbatim_fragment": " + ".join(hits),
                    }
        return None

    def _check_paraphrase(self, content_norm: str) -> dict | None:
        if not self.phrase_content_words:
            return None
        content_toks = content_words(content_norm)
        matched = self.phrase_content_words & content_toks
        ratio = len(matched) / len(self.phrase_content_words)
        if ratio >= 0.60:
            confidence = 0.50 + (ratio - 0.60) * 0.975
            confidence = min(0.89, round(confidence, 3))
            return {
                "match_type": "paraphrase",
                "match_confidence": confidence,
                "matched_words": sorted(matched),
                "matched_thematic": [],
                "verbatim_fragment": None,
            }
        return None

    def _check_thematic(self, content_norm: str, keywords_norm: set[str]) -> dict | None:
        if not self.thematic_kws:
            return None
        # Check against content text and tablet keywords
        content_toks_set = set(tokenize(content_norm))
        all_searchable = content_toks_set | keywords_norm
        hits = [w for w in self.thematic_kws if w in all_searchable or w in content_norm]
        if len(hits) >= 2:
            confidence = 0.30 + 0.05 * min(len(hits) - 2, 4)
            confidence = round(confidence, 3)
            return {
                "match_type": "thematic",
                "match_confidence": confidence,
                "matched_words": [],
                "matched_thematic": hits,
                "verbatim_fragment": None,
            }
        return None

# ── Stone Tablet writer ────────────────────────────────────────────────────────

class StoneTabletWriter:
    def __init__(self):
        self.counters: dict[str, int] = defaultdict(int)  # keystone_id → count
        self.files: dict[str, object] = {}
        self.dedup: set[str] = set()  # tablet_id::keystone_id pairs
        self.stats = {
            "total_tablets_scanned": 0,
            "total_stone_tablets": 0,
            "by_keystone": {},
            "by_match_type": {"verbatim": 0, "paraphrase": 0, "thematic": 0},
            "by_corpus": {"K482": 0, "K486": 0, "K487": 0, "unknown": 0},
        }

        # Load existing dedup log if present (idempotency)
        if DEDUP_LOG.exists():
            try:
                existing = json.loads(DEDUP_LOG.read_text(encoding="utf-8"))
                self.dedup = set(existing.get("dedup_keys", []))
                print(f"  Loaded {len(self.dedup)} existing dedup keys.")
            except Exception:
                pass

    def _get_file(self, keystone_id: str):
        if keystone_id not in self.files:
            # KEYSTONE-00 → KEYSTONE-00.jsonl
            path = OUTPUT_DIR / f"{keystone_id}.jsonl"
            self.files[keystone_id] = open(path, "a", encoding="utf-8")
        return self.files[keystone_id]

    def write(self, tablet: dict, keystone: dict, match_result: dict) -> bool:
        """Write a Stone Tablet record. Returns True if written (not deduped)."""
        dedup_key = f"{tablet['tablet_id']}::{keystone['id']}"
        if dedup_key in self.dedup:
            return False

        self.dedup.add(dedup_key)
        kid = keystone["id"]
        self.counters[kid] += 1
        n = self.counters[kid]

        corpus = detect_source_corpus(tablet.get("miner_serial", ""))

        stone_tablet = {
            "stone_tablet_id": f"LB-ST.{kid}-T{n:04d}",
            "source_tablet_id": tablet["tablet_id"],
            "keystone_anchor_id": kid,
            "keystone_phrase_verbatim": keystone["phrase"],
            "match_type": match_result["match_type"],
            "match_confidence": match_result["match_confidence"],
            "matched_words": match_result.get("matched_words", []),
            "matched_thematic": match_result.get("matched_thematic", []),
            "verbatim_fragment": match_result.get("verbatim_fragment"),
            "inception_event_timestamp": INCEPTION_TIMESTAMP,
            "founder_speech_act_provenance": keystone["provenance"],
            "source_corpus": corpus,
            "dedup_key": dedup_key,
            "tagger_session": SESSION,
            "miner_serial": tablet.get("miner_serial", ""),
            "source_file": tablet.get("source_file", ""),
            "extracted_content": tablet.get("extracted_content", ""),
            "keywords": tablet.get("keywords", []),
            "depth_level": tablet.get("depth_level", 0),
            "original_timestamp": tablet.get("timestamp", ""),
            "provenance_chain": tablet.get("provenance_chain", []),
        }

        fh = self._get_file(kid)
        fh.write(json.dumps(stone_tablet, ensure_ascii=False) + "\n")

        # Update stats
        self.stats["total_stone_tablets"] += 1
        if kid not in self.stats["by_keystone"]:
            self.stats["by_keystone"][kid] = {"total": 0, "verbatim": 0, "paraphrase": 0, "thematic": 0}
        self.stats["by_keystone"][kid]["total"] += 1
        self.stats["by_keystone"][kid][match_result["match_type"]] += 1
        self.stats["by_match_type"][match_result["match_type"]] += 1
        self.stats["by_corpus"][corpus] = self.stats["by_corpus"].get(corpus, 0) + 1
        return True

    def close(self):
        for fh in self.files.values():
            fh.close()
        # Save dedup log
        DEDUP_LOG.write_text(
            json.dumps({"dedup_keys": sorted(self.dedup), "count": len(self.dedup)}, indent=2),
            encoding="utf-8"
        )

# ── Bedrock file iterator ──────────────────────────────────────────────────────

def iter_bedrock_files() -> list[Path]:
    """Return all bedrock JSONL files (M-0001 + M-0002), sorted."""
    all_files = sorted(BEDROCK_DIR.glob("LB-CAT.M-*.jsonl"))
    print(f"  Found {len(all_files)} bedrock files total.")
    m1 = [f for f in all_files if "M-0001" in f.name]
    m2 = [f for f in all_files if "M-0002" in f.name]
    print(f"    M-0001 (K482/K486 bishop memory): {len(m1)} files")
    print(f"    M-0002 (K487 real corpus): {len(m2)} files")
    return all_files


def iter_tablets(bedrock_file: Path):
    """Stream tablets from a bedrock JSONL file, skipping malformed lines."""
    with open(bedrock_file, encoding="utf-8", errors="replace") as f:
        for lineno, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                pass  # skip malformed lines silently

# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{'='*70}")
    print(f"  K490 Phase A — Stone Tablet Retroactive Tagger")
    print(f"  Session: {SESSION} · Bishop: {BISHOP_SESSION}")
    print(f"  Timestamp: {INCEPTION_TIMESTAMP}")
    print(f"{'='*70}\n")

    # Load keystones registry
    registry = json.loads(KEYSTONES_REGISTRY.read_text(encoding="utf-8"))
    keystones = registry["keystones"]
    matchers = [KeystoneMatcher(k) for k in keystones]
    print(f"  Loaded {len(keystones)} Rhetorical Keystones.")
    for k in keystones:
        print(f"    {k['id']}: {k['phrase'][:60]}...")

    print()

    # Initialize writer
    writer = StoneTabletWriter()

    # Collect bedrock files
    bedrock_files = iter_bedrock_files()
    print()

    # Main scan loop
    total_files = len(bedrock_files)
    start_time = time.time()

    for file_idx, bfile in enumerate(bedrock_files, 1):
        file_start = time.time()
        file_tablets = 0
        file_stone_tablets = 0

        corpus_label = "M-0001 (K482/K486)" if "M-0001" in bfile.name else "M-0002 (K487)"
        if file_idx % 5 == 1 or file_idx <= 3:
            print(f"  [{file_idx}/{total_files}] {bfile.name} ({corpus_label})")

        for tablet in iter_tablets(bfile):
            writer.stats["total_tablets_scanned"] += 1
            file_tablets += 1

            # Try each keystone matcher
            for matcher in matchers:
                result = matcher.match(tablet)
                if result:
                    written = writer.write(tablet, matcher.keystone, result)
                    if written:
                        file_stone_tablets += 1

        elapsed = time.time() - file_start
        if file_idx % 5 == 1 or file_idx <= 3:
            print(f"    -> {file_tablets} tablets, {file_stone_tablets} stone tablets, {elapsed:.1f}s")

    # Final stats
    total_elapsed = time.time() - start_time
    writer.close()

    print(f"\n{'='*70}")
    print(f"  PHASE A COMPLETE")
    print(f"  Wall time: {total_elapsed:.1f}s ({total_elapsed/60:.1f} min)")
    print(f"  Total tablets scanned: {writer.stats['total_tablets_scanned']:,}")
    print(f"  Total stone tablets produced: {writer.stats['total_stone_tablets']:,}")
    print(f"\n  By match type:")
    for mt, cnt in writer.stats["by_match_type"].items():
        print(f"    {mt}: {cnt:,}")
    print(f"\n  By corpus:")
    for corpus, cnt in writer.stats["by_corpus"].items():
        print(f"    {corpus}: {cnt:,}")
    print(f"\n  By keystone (with stone tablet count):")

    # Sort by count descending for report
    sorted_ks = sorted(
        writer.stats["by_keystone"].items(),
        key=lambda x: x[1]["total"], reverse=True
    )
    for kid, kcounts in sorted_ks:
        # Find keystone phrase
        phrase = next((k["phrase"][:50] for k in keystones if k["id"] == kid), "?")
        print(f"    {kid}: {kcounts['total']:4d} total "
              f"(v={kcounts['verbatim']}, p={kcounts['paraphrase']}, t={kcounts['thematic']}) — {phrase}...")

    # Zero-hit keystones
    zero_keystones = [k["id"] for k in keystones if k["id"] not in writer.stats["by_keystone"]]
    if zero_keystones:
        print(f"\n  Zero-hit keystones ({len(zero_keystones)}): {', '.join(zero_keystones)}")
        print(f"  (Zero hits = corpus doesn't touch this keystone's domain — valid; document for Founder reflection)")

    # Save run stats
    stats_path = HERE / "run_stats_K490.json"
    final_stats = {
        "session": SESSION,
        "bishop_session": BISHOP_SESSION,
        "inception_timestamp": INCEPTION_TIMESTAMP,
        "wall_time_sec": round(total_elapsed, 1),
        "keystones_count": len(keystones),
        "bedrock_files_scanned": total_files,
        **writer.stats,
        "top3_keystones": [kid for kid, _ in sorted_ks[:3]],
        "zero_hit_keystones": zero_keystones,
    }
    stats_path.write_text(json.dumps(final_stats, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n  Run stats saved to: {stats_path}")
    print(f"  Stone tablet files in: {OUTPUT_DIR}")
    print(f"  Dedup log: {DEDUP_LOG}")
    print(f"{'='*70}\n")

    return final_stats


if __name__ == "__main__":
    main()
