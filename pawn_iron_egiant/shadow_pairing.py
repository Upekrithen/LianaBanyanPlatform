"""
shadow_pairing.py — Pawn ↔ Shadow-alpha Cooperative Proxy (KN092 / BP011)
=========================================================================
Pairs a Pawn-Iron-E-Giant dispatch with Shadow-alpha as a ground-truth proxy.

Architecture (per KN092 design):
    Pawn never reads filesystem directly.
    Shadow-alpha reads from the canonical workspace filesystem and delivers
    content to Pawn via the Iron Tablet (or direct dict return for in-process use).

Usage:
    pair = ShadowPair(dispatch_id="d7f3a1b2", session_id="KN092")
    result = pair.read_file("Cephas/cephas-hugo/content/patents/behemoth-reborn.md")
    # result: {"status": "ok", "path": "...", "content": "...", "proxy_mode": "shadow_alpha"}

ShadowPair.read_file():
    1. Validates path is within workspace root (no path traversal).
    2. Reads file via the_shadow.iron_tablet_attach.IronTabletAttach (if available)
       or direct filesystem read (stub mode).
    3. Returns structured result dict compatible with tool_translator read_file format.

Iron Tablet write:
    When shadow_pair is active and Iron Tablet is available, the file content is
    written to the canonical Eblet at:
        ~/.claude/state/eblets/BP011/shadow_proxy_<dispatch_id>_<basename>.eblet.md
    This produces a ProvenanceReceipt that closes the BP011-failure-mode-closure test.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

WORKSPACE_ROOT = Path(__file__).resolve().parents[1]
EBLET_BP011_DIR = Path.home() / ".claude" / "state" / "eblets" / "BP011"

# Shadow-alpha scribe-id (LIGHTHOUSE position 1)
SHADOW_ALPHA_SCRIBE_ID = "R11_shadow_alpha"


class ShadowPair:
    """
    Cooperative proxy pairing a Pawn dispatch with Shadow-alpha for file reads.

    Parameters:
        dispatch_id:  Unique Pawn dispatch identifier.
        session_id:   Knight session (e.g. "KN092").
        use_iron_tablet: If True, attempt to write read content to Iron Tablet
                         for provenance. Falls back to in-memory if unavailable.
    """

    def __init__(
        self,
        dispatch_id: str,
        session_id: str = "KN092",
        *,
        use_iron_tablet: bool = True,
    ) -> None:
        self.dispatch_id = dispatch_id
        self.session_id = session_id
        self.pawn_scribe_id = f"R11_pawn_{dispatch_id}"
        self.shadow_scribe_id = SHADOW_ALPHA_SCRIBE_ID
        self.use_iron_tablet = use_iron_tablet
        self._iron_tablet_available: Optional[bool] = None

    def _check_iron_tablet(self) -> bool:
        if self._iron_tablet_available is not None:
            return self._iron_tablet_available
        try:
            from the_shadow.iron_tablet_attach import IronTabletAttach  # noqa: F401
            self._iron_tablet_available = True
        except ImportError:
            self._iron_tablet_available = False
        return self._iron_tablet_available

    def _safe_path(self, path_str: str) -> Optional[Path]:
        """
        Resolve path and verify it is within WORKSPACE_ROOT.
        Returns None if path traversal is detected.
        """
        candidate = Path(path_str)
        if not candidate.is_absolute():
            candidate = WORKSPACE_ROOT / candidate
        try:
            resolved = candidate.resolve()
            resolved.relative_to(WORKSPACE_ROOT.resolve())
            return resolved
        except ValueError:
            return None

    def read_file(self, path: str) -> dict:
        """
        Read a file via Shadow-alpha proxy.
        Returns tool_translator-compatible result dict.
        """
        resolved = self._safe_path(path)
        if resolved is None:
            return {
                "status": "error",
                "error": f"Path traversal blocked: '{path}' is outside workspace root.",
            }

        if not resolved.exists():
            return {
                "status": "error",
                "error": f"File not found: {resolved}",
                "path": path,
            }

        try:
            content = resolved.read_text(encoding="utf-8")
        except Exception as exc:
            return {"status": "error", "error": str(exc), "path": path}

        content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]

        # Attempt Iron Tablet write for provenance
        iron_receipt: Optional[dict] = None
        if self.use_iron_tablet and self._check_iron_tablet():
            iron_receipt = self._write_iron_tablet(str(resolved), content)

        rel_path = str(resolved.relative_to(WORKSPACE_ROOT))

        return {
            "status": "ok",
            "path": rel_path,
            "content": content,
            "content_hash": content_hash,
            "proxy_mode": "shadow_alpha",
            "shadow_scribe_id": self.shadow_scribe_id,
            "pawn_scribe_id": self.pawn_scribe_id,
            "iron_receipt": iron_receipt,
        }

    def _write_iron_tablet(self, abs_path: str, content: str) -> Optional[dict]:
        """
        Write file content to Iron Tablet for provenance receipt.
        Returns receipt dict or None on error.
        """
        try:
            from the_shadow.iron_tablet_attach import IronTabletAttach

            EBLET_BP011_DIR.mkdir(parents=True, exist_ok=True)
            basename = Path(abs_path).stem[:40]
            eblet_path = (
                EBLET_BP011_DIR
                / f"shadow_proxy_{self.dispatch_id}_{basename}.eblet.md"
            )

            attach = IronTabletAttach(
                scribe_id=self.shadow_scribe_id,
                session_id=self.session_id,
            )
            receipt = attach.write(
                eblet_path=str(eblet_path),
                content=content,
                provenance={
                    "session": self.session_id,
                    "decisionId": f"pawn_proxy_{self.dispatch_id}",
                },
            )
            if receipt:
                return {
                    "sequence": getattr(receipt, "sequence", None),
                    "hash": getattr(receipt, "hash", None),
                    "ts": getattr(receipt, "ts", None),
                }
        except Exception:
            pass
        return None

    def describe_pairing(self) -> dict:
        """Return a JSON-serialisable description of this pairing."""
        return {
            "pawn_scribe_id": self.pawn_scribe_id,
            "shadow_scribe_id": self.shadow_scribe_id,
            "dispatch_id": self.dispatch_id,
            "session_id": self.session_id,
            "iron_tablet_available": self._check_iron_tablet(),
        }


# ── Convenience factory ────────────────────────────────────────────────────────

def pair_pawn_with_shadow_alpha(
    dispatch_id: str,
    session_id: str = "KN092",
) -> ShadowPair:
    """
    Create a ShadowPair coupling Pawn dispatch `dispatch_id` with Shadow-alpha.
    This is the default pairing per KN092 design (Shadow-alpha as ground-truth proxy).
    """
    return ShadowPair(dispatch_id=dispatch_id, session_id=session_id)


def describe_all_pairings(dispatch_ids: list[str], session_id: str = "KN092") -> list[dict]:
    """Return pairing descriptions for a list of dispatch IDs (for logging)."""
    return [
        pair_pawn_with_shadow_alpha(d, session_id).describe_pairing()
        for d in dispatch_ids
    ]
