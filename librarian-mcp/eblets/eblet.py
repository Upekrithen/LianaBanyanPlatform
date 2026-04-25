"""
Eblet — Electronic Tablet summary-pointer into a Synapse cluster.

K485 · B123 · Crown Jewel #2298 (Seer / Augur / Eblets — The Awareness Net)

Schema (9 canonical fields):

  eblet_id              "EB-NNNNNN"             monotonic 6-digit ID
  synapse_pointer       "synapse_K{N}.jsonl#cluster_{name}"  pointer to source
  summary_text          50-100 token LLM-generated summary
  scribe_attributions   list[str]  — which domain-Scribes are relevant
  root_miner_serial     "LB-CAT.M-NNNN" or null (null for pre-Miner Synapses)
  provenance_chain      ["source-file", "synapse-id", "eblet-id"]
  confidence_score      float [0.0–1.0]  — summary-quality self-rating
  created_at            ISO-8601 timestamp
  keystone_anchors      list[str]  — e.g. ["Keystone-28"] if Synapse touches domain

Resolution:
  Eblet.resolve()         → full Synapse cluster content (dict)
  Eblet.walk_provenance() → list of each layer's content (Eblet→Synapse→source)

Architecture reference:
  .claude/projects/.../memory/project_seer_augur_eblets_awareness_net.md
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

EBLET_STORE_PATH = Path(__file__).parent / "eblets.jsonl"

SYNAPSE_DIR = Path(__file__).parent.parent / "stitchpunks" / "synapses"

# Keystone phrase → anchor label mapping for keystone-anchor detection.
# String-matching heuristic (K485 baseline; upgrade to embedding-similarity later).
KEYSTONE_PATTERNS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\bip.as.filter\b|\bsculptor\b.*\bfilter\b|\bfilter.decision\b", re.I), "Keystone-28"),
    (re.compile(r"\bprovenance.chain\b|\bend.to.end.provenance\b|\bauditable\b", re.I), "Keystone-provenance"),
    (re.compile(r"\beblet\b|\bseer\b|\baugur\b|\bawareness.net\b", re.I), "CJ-2298"),
    (re.compile(r"\bsynapse\b.*\bcluster\b|\breasoning.moment\b", re.I), "CJ-2287"),
    (re.compile(r"\bminer\b.*\bbedrock\b|\bwell\b.*\bmitosis\b|\bscribe.spawn\b", re.I), "CJ-2296"),
    (re.compile(r"\bcathedral\b.*\bscribe\b|\bcathedral.effect\b", re.I), "CJ-cathedral"),
    (re.compile(r"\bvirtual.context\b|\bpointer.resolution\b|\bindex.entry\b", re.I), "CJ-2298-virtual-memory"),
    (re.compile(r"\bhelm\b.*\bpwa\b|\belectron\b.*\bdaemon\b", re.I), "CJ-helm"),
    (re.compile(r"\bcanonical.numbers\b|\bcanonical.values\b|\bsingle.source.of.truth\b", re.I), "CJ-canonical"),
    (re.compile(r"\bthree.fates\b|\bclotho\b|\blachesis\b|\batropos\b", re.I), "CJ-three-fates"),
]

# Scribe-domain keyword sets for attribution heuristic
SCRIBE_DOMAIN_KEYWORDS: dict[str, set[str]] = {
    "Scribe-Architecture": {"architect", "schema", "design", "pattern", "scaffold", "substrate"},
    "Scribe-IP": {"patent", "claim", "innovation", "crown", "jewel", "provisional", "thresh", "filing"},
    "Scribe-Engineering": {"python", "typescript", "api", "build", "deploy", "commit", "npm", "test"},
    "Scribe-Miners": {"miner", "bedrock", "tablet", "well", "mitosis", "corpus"},
    "Scribe-Sculptors": {"sculptor", "curate", "sculpt", "cathedral", "filter", "lachesis", "clotho"},
    "Scribe-Synapses": {"synapse", "cluster", "reasoning", "eblet", "seer", "augur"},
    "Scribe-Sessions": {"session", "knight", "bishop", "bridle", "phase", "handoff"},
    "Scribe-Platform": {"platform", "member", "cephas", "supabase", "firebase", "deployment"},
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _detect_keystone_anchors(text: str) -> list[str]:
    """String-match text against keystone patterns; return matching anchor labels."""
    anchors: list[str] = []
    for pattern, label in KEYSTONE_PATTERNS:
        if pattern.search(text) and label not in anchors:
            anchors.append(label)
    return anchors


def _detect_scribe_attributions(text: str) -> list[str]:
    """Heuristic: detect relevant Scribe domains by keyword overlap."""
    text_lower = text.lower()
    tokens = set(re.findall(r"[a-z][a-z0-9_\-]*", text_lower))
    attributions: list[str] = []
    for scribe, keywords in SCRIBE_DOMAIN_KEYWORDS.items():
        if tokens & keywords:
            attributions.append(scribe)
    return sorted(attributions)


def _extract_root_miner_serial(synapse: dict) -> Optional[str]:
    """
    Extract root miner serial from a Synapse entry if traceable.
    Returns "LB-CAT.M-NNNN" format if found in provenance fields, else None.
    Pre-K485 Synapses generally do not carry Miner provenance → null.
    """
    # Check common provenance fields
    for field_name in ("miner_serial", "root_miner", "provenance_chain"):
        val = synapse.get(field_name)
        if val:
            if isinstance(val, str) and re.match(r"LB-CAT\.M-\d+", val):
                return val
            if isinstance(val, list):
                for item in val:
                    if isinstance(item, str) and re.match(r"LB-CAT\.M-\d+", item):
                        return item
    return None


def _get_synapse_text(synapse: dict) -> str:
    """
    Extract the primary text content from a Synapse cluster entry.
    Handles both K483/K484 format (insight+rationale) and K475/K477 format (reasoning_text).
    """
    parts: list[str] = []

    # Newer format (K482+): insight + rationale
    if "insight" in synapse:
        parts.append(synapse["insight"])
    if "rationale" in synapse:
        parts.append(synapse["rationale"])

    # Older format (K475/K477): reasoning_text; also cited_facts
    if "reasoning_text" in synapse:
        parts.append(synapse["reasoning_text"])
    if "cited_facts" in synapse and isinstance(synapse["cited_facts"], list):
        facts = "; ".join(synapse["cited_facts"])
        if facts:
            parts.append("Cited: " + facts)

    return "\n\n".join(parts)


def _get_cluster_name(synapse: dict) -> str:
    """Return the cluster name, handling both formats."""
    return synapse.get("cluster") or synapse.get("cluster_id") or "unknown"


def _get_synapse_id(synapse: dict) -> str:
    return synapse.get("synapse_id", "unknown")


# ---------------------------------------------------------------------------
# Eblet dataclass
# ---------------------------------------------------------------------------

@dataclass
class Eblet:
    """
    A lightweight summary-pointer (Electronic Tablet) into a Synapse cluster.

    The summary (~50-100 tokens) is the index entry.
    The pointer (synapse_pointer) resolves to ~500-5,000 tokens of detail.
    This is virtual-context expansion: hold many Eblets in context,
    resolve on demand to access the full Pyramid below.
    """

    eblet_id: str                        # "EB-NNNNNN"  monotonic
    synapse_pointer: str                 # "synapse_K{N}.jsonl#cluster_{name}"
    summary_text: str                    # 50-100 token LLM-generated summary
    scribe_attributions: list[str]       # relevant Scribe domains
    root_miner_serial: Optional[str]     # "LB-CAT.M-NNNN" or None
    provenance_chain: list[str]          # ["source-file", "synapse-id", "eblet-id"]
    confidence_score: float              # [0.0-1.0] summary quality self-rating
    created_at: str                      # ISO-8601
    keystone_anchors: list[str]          # e.g. ["CJ-2298"] if touching keystone domain

    def to_dict(self) -> dict:
        return {
            "eblet_id": self.eblet_id,
            "synapse_pointer": self.synapse_pointer,
            "summary_text": self.summary_text,
            "scribe_attributions": self.scribe_attributions,
            "root_miner_serial": self.root_miner_serial,
            "provenance_chain": self.provenance_chain,
            "confidence_score": self.confidence_score,
            "created_at": self.created_at,
            "keystone_anchors": self.keystone_anchors,
        }

    @classmethod
    def from_dict(cls, d: dict) -> "Eblet":
        return cls(
            eblet_id=d["eblet_id"],
            synapse_pointer=d["synapse_pointer"],
            summary_text=d["summary_text"],
            scribe_attributions=d.get("scribe_attributions", []),
            root_miner_serial=d.get("root_miner_serial"),
            provenance_chain=d.get("provenance_chain", []),
            confidence_score=d.get("confidence_score", 0.0),
            created_at=d["created_at"],
            keystone_anchors=d.get("keystone_anchors", []),
        )

    # ------------------------------------------------------------------
    # Pointer resolution
    # ------------------------------------------------------------------

    def resolve(self) -> dict:
        """
        Resolve this Eblet's synapse_pointer to the full Synapse cluster content.

        Format: "synapse_K{N}.jsonl#cluster_{name}"
        Opens the linked JSONL file, finds all entries whose cluster matches,
        and returns them as a list (the full cluster content).

        No LLM call required — pure filesystem read.
        """
        # Parse pointer: "synapse_K483.jsonl#cluster_three-mode-structure-rationale"
        pointer = self.synapse_pointer
        if "#cluster_" in pointer:
            filename, cluster_name = pointer.split("#cluster_", 1)
        else:
            filename = pointer
            cluster_name = None

        synapse_path = SYNAPSE_DIR / filename
        if not synapse_path.exists():
            raise FileNotFoundError(f"Synapse file not found: {synapse_path}")

        entries: list[dict] = []
        with synapse_path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if cluster_name is None:
                    entries.append(entry)
                else:
                    entry_cluster = _get_cluster_name(entry)
                    if entry_cluster == cluster_name:
                        entries.append(entry)

        return {
            "synapse_pointer": self.synapse_pointer,
            "eblet_id": self.eblet_id,
            "cluster_name": cluster_name,
            "resolved_entries": entries,
            "entry_count": len(entries),
        }

    # ------------------------------------------------------------------
    # Provenance walk
    # ------------------------------------------------------------------

    def walk_provenance(self) -> list[dict]:
        """
        Walk the full provenance chain: Eblet → Synapse cluster → source file.

        Returns a list of dicts, one per provenance layer, each with:
          layer: "eblet" | "synapse" | "source"
          id: the ID at that layer
          content: the content at that layer (dict or str)
          token_estimate: rough token count
        """
        layers: list[dict] = []

        # Layer 0: the Eblet itself
        layers.append({
            "layer": "eblet",
            "id": self.eblet_id,
            "content": self.to_dict(),
            "token_estimate": len(self.summary_text.split()),
        })

        # Layer 1: the Synapse cluster
        try:
            resolved = self.resolve()
            synapse_text = "\n\n".join(
                _get_synapse_text(e) for e in resolved["resolved_entries"]
            )
            layers.append({
                "layer": "synapse",
                "id": self.synapse_pointer,
                "content": resolved,
                "token_estimate": len(synapse_text.split()),
            })
        except FileNotFoundError as exc:
            layers.append({
                "layer": "synapse",
                "id": self.synapse_pointer,
                "content": {"error": str(exc)},
                "token_estimate": 0,
            })

        # Layer 2: root miner serial (metadata layer; no separate file to read yet)
        if self.root_miner_serial:
            layers.append({
                "layer": "miner",
                "id": self.root_miner_serial,
                "content": {"miner_serial": self.root_miner_serial, "note": "bedrock tablets queryable via Librarian MCP"},
                "token_estimate": 5,
            })

        # Layer 3: source file (the synapse JSONL file itself)
        if "#cluster_" in self.synapse_pointer:
            source_file = self.synapse_pointer.split("#cluster_")[0]
        else:
            source_file = self.synapse_pointer
        layers.append({
            "layer": "source",
            "id": source_file,
            "content": {"source_file": source_file, "location": str(SYNAPSE_DIR / source_file)},
            "token_estimate": 0,
        })

        return layers


# ---------------------------------------------------------------------------
# EbletStore — append-only JSONL store
# ---------------------------------------------------------------------------

class EbletStore:
    """
    Append-only JSONL store for Eblets at librarian-mcp/eblets/eblets.jsonl.
    One Eblet per line. ID is monotonically increasing.
    """

    def __init__(self, path: Path = EBLET_STORE_PATH) -> None:
        self.path = path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def next_id(self) -> str:
        """Return the next monotonic Eblet ID: EB-000001, EB-000002, etc."""
        count = self._count()
        return f"EB-{count + 1:06d}"

    def _count(self) -> int:
        if not self.path.exists():
            return 0
        count = 0
        with self.path.open("r", encoding="utf-8") as fh:
            for line in fh:
                if line.strip():
                    count += 1
        return count

    def append(self, eblet: Eblet) -> None:
        """Append one Eblet to the store (append-only; never overwrites)."""
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(eblet.to_dict(), ensure_ascii=False) + "\n")

    def load_all(self) -> list[Eblet]:
        """Load all Eblets from the store."""
        if not self.path.exists():
            return []
        eblets: list[Eblet] = []
        with self.path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        eblets.append(Eblet.from_dict(json.loads(line)))
                    except (json.JSONDecodeError, KeyError):
                        pass
        return eblets

    def count(self) -> int:
        return self._count()

    def get_by_id(self, eblet_id: str) -> Optional[Eblet]:
        """Look up a single Eblet by ID."""
        for eblet in self.load_all():
            if eblet.eblet_id == eblet_id:
                return eblet
        return None

    def already_has_pointer(self, synapse_pointer: str) -> bool:
        """Check if the store already has an Eblet for the given pointer (idempotency)."""
        for eblet in self.load_all():
            if eblet.synapse_pointer == synapse_pointer:
                return True
        return False
