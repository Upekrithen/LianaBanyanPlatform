"""
Prerequisite Graph Loader — KN009 / A&A #2291

Loads prerequisite_graph.yaml and provides query functions:
  query_prerequisites(primitive_id) → hard prerequisites list
  query_enhancers(primitive_id)     → soft enhancers list
  validate_substrate_subset(subset) → (valid: bool, missing: list)
  recommend_minimum_subset(target)  → minimum set with all hard prerequisites met
  update_prerequisite_graph(...)    → add/update a node (persists to YAML)

Toolsmith log: TS-CHANDELIER-EMPIRICAL-MEASUREMENT-KN009-BP002
"""

from __future__ import annotations

import copy
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple

try:
    import yaml  # type: ignore
except ImportError:
    yaml = None  # type: ignore

_GRAPH_PATH = Path(__file__).parent / "prerequisite_graph.yaml"


def _load_yaml(path: Path) -> Dict[str, Any]:
    if yaml is None:
        raise ImportError("PyYAML is required: pip install pyyaml")
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def _save_yaml(path: Path, data: Dict[str, Any]) -> None:
    if yaml is None:
        raise ImportError("PyYAML is required: pip install pyyaml")
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)


class PrerequisiteGraph:
    """
    In-memory prerequisite graph loaded from prerequisite_graph.yaml.

    Provides fast O(1) per-node queries and O(N+E) graph traversal
    for transitive closure queries.
    """

    def __init__(self, graph_path: Optional[Path] = None) -> None:
        self._path = graph_path or _GRAPH_PATH
        self._data: Dict[str, Any] = {}
        self._nodes: Dict[str, Dict[str, Any]] = {}
        self._load()

    def _load(self) -> None:
        self._data = _load_yaml(self._path)
        self._nodes = self._data.get("primitives", {}) or {}

    def reload(self) -> None:
        """Reload from disk (e.g., after update_prerequisite_graph)."""
        self._load()

    # ── Direct node queries ────────────────────────────────────────────────────

    def query_prerequisites(self, primitive_id: str) -> List[str]:
        """Return hard prerequisites of a primitive (direct, not transitive)."""
        node = self._nodes.get(primitive_id, {})
        return list(node.get("hard_prerequisites", []) or [])

    def query_enhancers(self, primitive_id: str) -> List[str]:
        """Return soft enhancers of a primitive (direct)."""
        node = self._nodes.get(primitive_id, {})
        return list(node.get("soft_enhancers", []) or [])

    def query_orthogonals(self, primitive_id: str) -> List[str]:
        """Return orthogonals of a primitive (direct)."""
        node = self._nodes.get(primitive_id, {})
        return list(node.get("orthogonals", []) or [])

    def query_layer(self, primitive_id: str) -> Optional[str]:
        """Return the layer of a primitive (scaffold/framing/wiring/building/edifice/paint)."""
        node = self._nodes.get(primitive_id, {})
        return node.get("layer")

    def all_primitive_ids(self) -> List[str]:
        return list(self._nodes.keys())

    # ── Transitive closure ─────────────────────────────────────────────────────

    def transitive_prerequisites(self, primitive_id: str) -> List[str]:
        """
        Return all transitive hard prerequisites of a primitive
        (recursively following hard_prerequisites chains).
        Returns sorted list (not including the primitive itself).
        """
        visited: Set[str] = set()
        stack = list(self.query_prerequisites(primitive_id))
        while stack:
            pid = stack.pop()
            if pid in visited:
                continue
            visited.add(pid)
            stack.extend(self.query_prerequisites(pid))
        return sorted(visited)

    # ── Subset validation ──────────────────────────────────────────────────────

    def validate_substrate_subset(
        self,
        subset: List[str],
    ) -> Tuple[bool, List[str]]:
        """
        Check that all hard prerequisites are met within a subset.

        For each primitive P in the subset, every hard prerequisite of P
        must also be in the subset (or have no prerequisites).

        Returns (valid: bool, missing: list of (primitive_id, missing_prereq) pairs)
        """
        subset_set = set(subset)
        missing_pairs: List[str] = []
        for pid in subset:
            for prereq in self.query_prerequisites(pid):
                if prereq not in subset_set:
                    missing_pairs.append(f"{pid} requires {prereq}")
        valid = len(missing_pairs) == 0
        return valid, missing_pairs

    # ── Minimum subset recommendation ─────────────────────────────────────────

    def recommend_minimum_subset(self, target_primitive_id: str) -> List[str]:
        """
        Return the minimum subset of primitives needed to support target_primitive_id.
        Includes the target itself plus all transitive hard prerequisites.
        """
        prereqs = self.transitive_prerequisites(target_primitive_id)
        return sorted(set(prereqs) | {target_primitive_id})

    # ── Graph update (MCP-callable) ────────────────────────────────────────────

    def update_prerequisite_graph(
        self,
        primitive_id: str,
        layer: str,
        hard_prerequisites: Optional[List[str]] = None,
        soft_enhancers: Optional[List[str]] = None,
        orthogonals: Optional[List[str]] = None,
        aa_number: Optional[str] = None,
        landed_session: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Add or update a node in the prerequisite graph.  Persists to YAML.

        Returns the updated node dict.
        """
        existing = copy.deepcopy(self._nodes.get(primitive_id, {}))
        node: Dict[str, Any] = {
            "layer": layer,
            "aa_number": aa_number if aa_number is not None else existing.get("aa_number"),
            "landed_session": landed_session if landed_session is not None else existing.get("landed_session"),
            "hard_prerequisites": hard_prerequisites if hard_prerequisites is not None else existing.get("hard_prerequisites", []),
            "soft_enhancers": soft_enhancers if soft_enhancers is not None else existing.get("soft_enhancers", []),
            "orthogonals": orthogonals if orthogonals is not None else existing.get("orthogonals", []),
        }
        if notes is not None:
            node["notes"] = notes
        elif "notes" in existing:
            node["notes"] = existing["notes"]

        self._nodes[primitive_id] = node
        self._data["primitives"] = self._nodes
        _save_yaml(self._path, self._data)
        self._load()
        return node


# Module-level singleton (lazy-initialised)
_GRAPH_SINGLETON: Optional[PrerequisiteGraph] = None


def get_graph(force_reload: bool = False) -> PrerequisiteGraph:
    """Get (or rebuild) the module-level PrerequisiteGraph singleton."""
    global _GRAPH_SINGLETON
    if _GRAPH_SINGLETON is None or force_reload:
        _GRAPH_SINGLETON = PrerequisiteGraph()
    return _GRAPH_SINGLETON
