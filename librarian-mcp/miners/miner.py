"""
Root Miner -- K482/B123 prototype implementation.
Updated K486/B123: multi_well_scores, cross-reference, Bloodhound-anchor hook.

Crown Jewel candidate #2296: Miners -- Self-Replicating Corpus-Prospecting Scribes
with Mitotic Specialization and IP-Ledger Provenance (Living Pyramid of Roots).

Architecture reference: project_miners_self_replicating_scribes.md (Bishop B123)
First empirical reduction-to-practice: K482.
K486 additions:
  - multi_well_scores: dict[well_name, score] on every bedrock tablet
  - set_active_wells(wells): register sibling Wells for scoring
  - Daughter.claim_cross_references(): build cross-reference index from existing bedrock
"""

from __future__ import annotations

import hashlib
import json
import math
import re
import threading
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# Process-level lock: prevents concurrent ledger writes when multiple threads
# share the same miner module. Also serves as a reminder that the ledger is
# NOT safe for concurrent writes from SEPARATE PROCESSES (use taskkill /T or
# a file-lock library like portalocker for multi-process safety).
_LEDGER_LOCK = threading.Lock()

# ---------------------------------------------------------------------------
# Constants / tunables
# ---------------------------------------------------------------------------

MITOSIS_ABSENT_THRESHOLD = 0.30   # >30% of top-N primary-signature kws absent -> new-category
TOP_KEYWORD_N = 20                 # keywords per tablet to inspect
PRIMARY_SIG_LOCK_AT = 3           # lock primary-topic signature after this many depth-1 tablets
PRIMARY_SIG_SIZE = 30             # keywords in the locked primary-topic signature
MIN_TABLETS_BEFORE_MITOSIS = 3   # minimum tablets mined before first split allowed
MAX_DAUGHTERS_PER_MINER = 4      # each Miner can spawn at most 4 daughters
MAX_KEYWORD_POOL = 2000           # K474 rule: cap per-Miner keyword pool to control RAM at scale

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

# ---------------------------------------------------------------------------
# IP Ledger helpers
# ---------------------------------------------------------------------------

LEDGER_PATH = Path(__file__).parent / "ip_ledger.jsonl"
BEDROCK_DIR = Path(__file__).parent / "bedrock"
CROSSREF_DIR = Path(__file__).parent / "cross_references"
BEDROCK_DIR.mkdir(parents=True, exist_ok=True)
CROSSREF_DIR.mkdir(parents=True, exist_ok=True)

# K486: Global active-wells registry (well_name → primary_topic keyword)
# Populated by run harness as Miners spawn; used for multi_well_scores.
_ACTIVE_WELLS: dict[str, str] = {}  # serial → primary_topic


def register_active_well(serial: str, primary_topic: str) -> None:
    """Register a Miner's primary Well. Called by the run harness on spawn."""
    _ACTIVE_WELLS[serial] = primary_topic


def get_active_wells() -> dict[str, str]:
    """Return a snapshot of currently registered Wells."""
    return dict(_ACTIVE_WELLS)


def _score_vs_well(keywords: list[str], well_topic: str) -> float:
    """Compute a relevance score for a tablet against a Well's primary topic.

    Score = fraction of top-20 keywords that match the well_topic keyword,
    weighted by position. Simple and deterministic — no ML.
    Returns 0.0-1.0.
    """
    if not keywords or not well_topic:
        return 0.0
    top = keywords[:TOP_KEYWORD_N]
    # Exact match on the well_topic keyword in the tablet's keyword list
    if well_topic in top:
        pos = top.index(well_topic)
        # Position-weighted: position 0 = 1.0, position 19 = ~0.05
        return round(1.0 - (pos / len(top)) * 0.95, 4)
    # Partial credit: any keyword sharing a 5-char prefix with the well_topic
    prefix = well_topic[:5]
    partial = sum(1 for kw in top if kw.startswith(prefix))
    return round(min(0.25, partial * 0.08), 4)

_ledger_prior_hash: str = "GENESIS"


def _sha256(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _append_ledger(entry: dict) -> str:
    """Append one event to the IP ledger and return current_hash."""
    global _ledger_prior_hash

    with _LEDGER_LOCK:
        prior = _ledger_prior_hash
        ts = datetime.now(timezone.utc).isoformat()

        payload_keys = {k for k in entry if k not in ("prior_hash", "current_hash", "timestamp")}
        event_payload = json.dumps(
            {k: entry[k] for k in payload_keys},
            sort_keys=True,
        )
        current_hash = _sha256(prior + event_payload + ts)

        record = {
            **entry,
            "timestamp": ts,
            "prior_hash": prior,
            "current_hash": current_hash,
        }

        with LEDGER_PATH.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record) + "\n")

        _ledger_prior_hash = current_hash
        return current_hash


def _bootstrap_ledger_chain() -> None:
    """On startup, fast-forward _ledger_prior_hash to the last line of the ledger."""
    global _ledger_prior_hash
    if LEDGER_PATH.exists():
        last_line = ""
        with LEDGER_PATH.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    last_line = line
        if last_line:
            record = json.loads(last_line)
            _ledger_prior_hash = record.get("current_hash", "GENESIS")


# ---------------------------------------------------------------------------
# Serial number generator
# ---------------------------------------------------------------------------

class SerialRegistry:
    """Process-scoped serial registry (sufficient for K482 single-process run)."""

    def __init__(self) -> None:
        self._counter: int = 0
        self._issued: set[str] = set()

    def next_root(self) -> str:
        self._counter += 1
        serial = f"LB-CAT.M-{self._counter:04d}"
        assert serial not in self._issued, f"Serial collision: {serial}"
        self._issued.add(serial)
        return serial

    def next_daughter(self, parent_serial: str, branch: str) -> str:
        serial = f"{parent_serial}.{branch}"
        base = serial
        suffix = 0
        while serial in self._issued:
            suffix += 1
            serial = f"{base}{suffix}"
        self._issued.add(serial)
        return serial


REGISTRY = SerialRegistry()


def bootstrap_serial_registry_from_bedrock(bedrock_dir: Path | None = None) -> int:
    """
    Pre-populate REGISTRY from existing bedrock JSONL filenames to prevent
    serial collisions when a new run follows K482/K486 artifacts.

    Scans bedrock_dir (default: BEDROCK_DIR) for *.jsonl files whose stems
    match the LB-CAT.M-NNNN[...] pattern. Extracts all serials, adds them to
    REGISTRY._issued, and advances REGISTRY._counter to the highest root number
    found. Returns the count of pre-registered serials.
    """
    import re as _re
    bdir = bedrock_dir or BEDROCK_DIR
    count = 0
    max_root_num = 0

    root_pattern = _re.compile(r"^LB-CAT\.M-(\d+)$")
    any_pattern = _re.compile(r"^(LB-CAT\.M-\d+.*)$")

    for f in bdir.glob("*.jsonl"):
        m = any_pattern.match(f.stem)
        if not m:
            continue
        serial = m.group(1)
        REGISTRY._issued.add(serial)
        count += 1

        root_m = root_pattern.match(f.stem)
        if root_m:
            num = int(root_m.group(1))
            if num > max_root_num:
                max_root_num = num

    if max_root_num > REGISTRY._counter:
        REGISTRY._counter = max_root_num

    return count


# ---------------------------------------------------------------------------
# TF-IDF keyword extractor
# ---------------------------------------------------------------------------

def _tokenize(text: str) -> list[str]:
    tokens = re.findall(r"[a-zA-Z][a-zA-Z0-9_\-]*", text.lower())
    return [t for t in tokens if t not in STOP_WORDS and len(t) > 2]


def extract_keywords(text: str, n: int = TOP_KEYWORD_N) -> list[str]:
    """Return top-N keywords by term-frequency (TF-weighted by token length)."""
    tokens = _tokenize(text)
    if not tokens:
        return []
    freq = Counter(tokens)
    scored = {tok: count * math.log(1 + len(tok)) for tok, count in freq.items()}
    return [tok for tok, _ in sorted(scored.items(), key=lambda x: -x[1])[:n]]


# ---------------------------------------------------------------------------
# Miner
# ---------------------------------------------------------------------------

@dataclass
class Miner:
    """A Root Miner or Daughter Miner-Scribe (#2296)."""

    serial: str
    parent_serial: Optional[str]           # None for the first Root
    primary_topic: Optional[str]           # None until first-pass anchors it
    provenance_chain: list[str]            # serials from root to self inclusive

    # Knowledge depth: level 1 = primary specialty, 2-6 = ancillary
    knowledge_depth: dict[int, list[str]] = field(
        default_factory=lambda: {i: [] for i in range(1, 7)}
    )

    # Connections graph: (source_tablet_id, target_concept, weight)
    connections: list[tuple[str, str, float]] = field(default_factory=list)

    # Full accumulated keyword pool (for depth assignment and connection weights)
    _keyword_pool: Counter = field(default_factory=Counter)

    # PRIMARY TOPIC SIGNATURE -- locked after PRIMARY_SIG_LOCK_AT depth-1 tablets
    # This is the stable "what this Miner is about" set used for mitosis detection.
    # CRITICAL: absent_ratio is computed against this set, NOT the full pool,
    # so it stays discriminating as the pool grows.
    _primary_sig: set[str] = field(default_factory=set)
    _primary_sig_locked: bool = False
    _depth1_tablet_count: int = 0          # depth-1 tablets seen so far

    # Per-Miner tablet counter
    tablet_count: int = 0

    # Branch label used when this Miner was spawned
    branch: Optional[str] = None

    # Child miners spawned from mitosis events
    daughters: list["Miner"] = field(default_factory=list)

    # Daughter serials we've already spawned for (to detect de-dup topic)
    _spawned_topics: set[str] = field(default_factory=set)

    def __post_init__(self) -> None:
        self._bedrock_path = BEDROCK_DIR / f"{self.serial}.jsonl"
        _append_ledger({
            "miner_serial": self.serial,
            "parent_serial": self.parent_serial,
            "event_type": "instantiate",
            "tablet_id": None,
        })

    # ------------------------------------------------------------------
    # Mining interface
    # ------------------------------------------------------------------

    def mine_file(self, path: Path) -> list["Miner"]:
        """
        Mine one file. Returns list of newly-spawned daughter Miners
        (empty if no mitosis fired).
        """
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except Exception:
            return []

        keywords = extract_keywords(text, TOP_KEYWORD_N)
        if not keywords:
            return []

        # Anchor primary topic from the dominant keyword on first tablet
        if self.primary_topic is None:
            self.primary_topic = keywords[0]
            _append_ledger({
                "miner_serial": self.serial,
                "parent_serial": self.parent_serial,
                "event_type": "topic_anchor",
                "tablet_id": None,
                "primary_topic": self.primary_topic,
            })

        tablet_id = f"{self.serial}-T{self.tablet_count + 1:04d}"

        # Depth assignment: overlap of tablet keywords vs primary signature
        # MUST be computed BEFORE updating the pool and signature.
        overlap = self._overlap_with_signature(keywords)
        depth = self._depth_from_overlap(overlap)

        # --- MITOSIS CHECK (before pool update, so absent_ratio is meaningful) ---
        new_daughters: list[Miner] = []
        if (
            self.tablet_count >= MIN_TABLETS_BEFORE_MITOSIS
            and len(self.daughters) < MAX_DAUGHTERS_PER_MINER
        ):
            absent_ratio = self._absent_ratio_vs_signature(keywords)
            if absent_ratio > MITOSIS_ABSENT_THRESHOLD:
                candidate_topic = keywords[0]
                # Avoid spawning a duplicate topic daughter
                if candidate_topic not in self._spawned_topics:
                    daughter = self._mitosis(keywords, tablet_id)
                    new_daughters.append(daughter)

        # --- Update state AFTER mitosis check ---
        self.knowledge_depth[depth].append(tablet_id)
        self._keyword_pool.update(keywords)
        # K474 rule: cap pool to avoid RAM pressure at scale
        if len(self._keyword_pool) > MAX_KEYWORD_POOL:
            self._keyword_pool = Counter(dict(self._keyword_pool.most_common(MAX_KEYWORD_POOL)))

        # Update primary signature if not yet locked
        if not self._primary_sig_locked:
            if depth == 1:
                self._primary_sig.update(keywords)
                self._depth1_tablet_count += 1
                if self._depth1_tablet_count >= PRIMARY_SIG_LOCK_AT:
                    # Lock: keep only top PRIMARY_SIG_SIZE by accumulated pool freq
                    pool_sorted = [
                        kw for kw, _ in self._keyword_pool.most_common()
                        if kw in self._primary_sig
                    ]
                    self._primary_sig = set(pool_sorted[:PRIMARY_SIG_SIZE])
                    self._primary_sig_locked = True
            else:
                # Even before lock: seed sig from any tablet so overlap grows
                self._primary_sig.update(keywords[:5])

        # Build connection edges
        for kw in keywords[:5]:
            weight = round(self._keyword_pool[kw] / max(1, self.tablet_count + 1), 4)
            self.connections.append((tablet_id, kw, weight))

        # K486: Compute multi_well_scores against all currently-registered Wells
        active_wells = get_active_wells()
        multi_well_scores: dict[str, float] = {}
        for well_serial, well_topic in active_wells.items():
            if well_serial != self.serial:  # score against OTHER wells only
                multi_well_scores[well_serial] = _score_vs_well(keywords, well_topic)

        # Write bedrock tablet
        tablet = {
            "tablet_id": tablet_id,
            "miner_serial": self.serial,
            "source_file": str(path),
            "source_offset": 0,
            "extracted_content": text[:500],
            "keywords": keywords,
            "depth_level": depth,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "provenance_chain": list(self.provenance_chain),
            "multi_well_scores": multi_well_scores,
        }
        self._write_bedrock(tablet)

        _append_ledger({
            "miner_serial": self.serial,
            "parent_serial": self.parent_serial,
            "event_type": "mine_tablet",
            "tablet_id": tablet_id,
            "source_file": str(path),
            "depth_level": depth,
            "keyword_overlap": round(overlap, 4),
        })

        self.tablet_count += 1
        return new_daughters

    # ------------------------------------------------------------------
    # Mitosis
    # ------------------------------------------------------------------

    def _mitosis(self, trigger_keywords: list[str], trigger_tablet_id: str) -> "Miner":
        """Halve-and-restore mitosis. Returns newly-spawned daughter Miner."""
        branch_label = chr(ord("a") + len(self.daughters))
        daughter_serial = REGISTRY.next_daughter(self.serial, branch_label)
        daughter_primary = trigger_keywords[0]
        self._spawned_topics.add(daughter_primary)

        _append_ledger({
            "miner_serial": self.serial,
            "parent_serial": self.parent_serial,
            "event_type": "mitosis_trigger",
            "tablet_id": trigger_tablet_id,
            "daughter_serial": daughter_serial,
            "new_category_primary": daughter_primary,
        })

        daughter = Miner(
            serial=daughter_serial,
            parent_serial=self.serial,
            primary_topic=daughter_primary,
            provenance_chain=list(self.provenance_chain) + [daughter_serial],
        )
        daughter.branch = branch_label

        # Seed daughter's signature + pool with trigger keywords (whole from birth)
        daughter._keyword_pool.update(trigger_keywords)
        daughter._primary_sig.update(trigger_keywords)

        _append_ledger({
            "miner_serial": daughter_serial,
            "parent_serial": self.serial,
            "event_type": "daughter_seeded",
            "tablet_id": trigger_tablet_id,
            "seed_keywords": trigger_keywords[:10],
        })

        self.daughters.append(daughter)
        return daughter

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _overlap_with_signature(self, keywords: list[str]) -> float:
        """Fraction of tablet keywords already in the primary signature."""
        if not keywords or not self._primary_sig:
            return 0.0
        matches = sum(1 for kw in keywords if kw in self._primary_sig)
        return matches / len(keywords)

    def _absent_ratio_vs_signature(self, keywords: list[str]) -> float:
        """
        Fraction of top-N tablet keywords NOT in the primary signature.
        Computed BEFORE pool update so the current tablet's keywords are not yet
        in the pool/sig -- measuring genuine novelty against the Miner's known topic.
        """
        top = keywords[:TOP_KEYWORD_N]
        if not top or not self._primary_sig:
            return 0.0
        absent = sum(1 for kw in top if kw not in self._primary_sig)
        return absent / len(top)

    @staticmethod
    def _depth_from_overlap(overlap: float) -> int:
        """Map overlap ratio -> knowledge depth level (1=primary, 6=most ancillary)."""
        if overlap >= 0.70:
            return 1
        elif overlap >= 0.55:
            return 2
        elif overlap >= 0.40:
            return 3
        elif overlap >= 0.25:
            return 4
        elif overlap >= 0.10:
            return 5
        else:
            return 6

    def _write_bedrock(self, tablet: dict) -> None:
        with self._bedrock_path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(tablet) + "\n")

    # ------------------------------------------------------------------
    # K486: Daughter cross-reference
    # ------------------------------------------------------------------

    def claim_cross_references(
        self,
        threshold: float = 0.40,
        bedrock_dir: Path | None = None,
    ) -> int:
        """
        Build a cross-reference index for this daughter Miner.

        Scans ALL existing bedrock tablets (from all Miners) for tablets that
        scored > threshold against this daughter's primary Well. Those tablets
        are NOT re-mined — they remain parent-owned. The daughter records
        a claim-link (tablet_id + parent_serial + score) in her cross-reference
        index at CROSSREF_DIR/<daughter_serial>.jsonl.

        Returns the count of cross-referenced tablets.

        Called AFTER all mining is complete (forward-only design: tablets written
        before this daughter's Well was registered may have multi_well_scores={};
        we score them from the bedrock content at cross-reference time).
        """
        if not self.primary_topic:
            return 0
        if not self.parent_serial:
            # Root miners don't cross-reference (no "sibling" context)
            return 0

        bdir = bedrock_dir or BEDROCK_DIR
        crossref_path = CROSSREF_DIR / f"{self.serial}.jsonl"
        claimed = 0

        for bedrock_file in sorted(bdir.glob("*.jsonl")):
            if bedrock_file.stem == self.serial:
                continue  # skip own bedrock

            try:
                with bedrock_file.open("r", encoding="utf-8") as fh:
                    for line in fh:
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            tablet = json.loads(line)
                        except json.JSONDecodeError:
                            continue

                        # Score: check multi_well_scores first (fast path)
                        multi = tablet.get("multi_well_scores", {})
                        score = multi.get(self.serial, None)

                        if score is None:
                            # Fallback: score from keywords directly
                            kws = tablet.get("keywords", [])
                            score = _score_vs_well(kws, self.primary_topic)

                        if score > threshold:
                            crossref = {
                                "daughter_serial": self.serial,
                                "daughter_primary_topic": self.primary_topic,
                                "tablet_id": tablet.get("tablet_id"),
                                "parent_miner_serial": tablet.get("miner_serial"),
                                "source_file": tablet.get("source_file"),
                                "cross_ref_score": round(score, 4),
                                "provenance_chain": tablet.get("provenance_chain", []),
                                "claimed_at": datetime.now(timezone.utc).isoformat(),
                            }
                            with crossref_path.open("a", encoding="utf-8") as cf:
                                cf.write(json.dumps(crossref) + "\n")
                            claimed += 1

            except Exception:
                continue

        _append_ledger({
            "miner_serial": self.serial,
            "parent_serial": self.parent_serial,
            "event_type": "cross_reference_claimed",
            "tablet_id": None,
            "cross_ref_count": claimed,
            "threshold": threshold,
        })

        return claimed

    # ------------------------------------------------------------------
    # Snapshot
    # ------------------------------------------------------------------

    def snapshot(self) -> dict:
        crossref_path = CROSSREF_DIR / f"{self.serial}.jsonl"
        crossref_count = 0
        if crossref_path.exists():
            try:
                crossref_count = sum(
                    1 for line in crossref_path.read_text(encoding="utf-8").splitlines()
                    if line.strip()
                )
            except Exception:
                pass
        return {
            "serial": self.serial,
            "parent_serial": self.parent_serial,
            "primary_topic": self.primary_topic,
            "branch": self.branch,
            "provenance_chain": self.provenance_chain,
            "tablet_count": self.tablet_count,
            "depth_distribution": {k: len(v) for k, v in self.knowledge_depth.items()},
            "connection_count": len(self.connections),
            "daughter_serials": [d.serial for d in self.daughters],
            "top_keywords": [kw for kw, _ in self._keyword_pool.most_common(10)],
            "primary_sig_locked": self._primary_sig_locked,
            "primary_sig_size": len(self._primary_sig),
            "cross_ref_count": crossref_count,
        }
