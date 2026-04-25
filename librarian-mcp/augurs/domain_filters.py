"""
Domain filter functions for Augur-level Seer substrate partitioning.

K492 · B123 · Crown Jewel #2298 (The Augur)

Two Pyramid sub-domains are defined for K492:

  Seer-A — arch_empirics
    Anchored to the architecture/empirics Pyramid:
    Cathedral Effect benchmarks, Mush Index, Miners/Sculptors empirical work,
    Seer/Augur/Eblets technical implementation, R10/R11 methodology.
    Filter criteria (include if ANY match):
      - Keystone anchors: CJ-cathedral, CJ-2296, CJ-helm
      - Scribe attributions: Scribe-Miners, Scribe-Sculptors,
        Scribe-Architecture, Scribe-Engineering, Scribe-Platform

  Seer-B — founder_voice
    Anchored to the founder-voice/biography Pyramid:
    Rhetorical Keystones, lived-experience anchors, Stone Tablets,
    IP provenance chains, Keystone-Compounding Loop, Founder speech-acts.
    Filter criteria (include if ANY match):
      - Keystone anchors: any Keystone-* (non-CJ), CJ-three-fates,
        CJ-canonical, CJ-2287, CJ-2298-virtual-memory, CJ-2298
      - Scribe attributions: Scribe-IP, Scribe-Synapses, Scribe-Sessions

Design note: filters are intentionally overlapping — Eblets in both domains
are accessible to both Seers. The Augur routes by relevance score, not by
hard exclusion. Eblets matching neither filter are out-of-coverage for both
Seers, producing honest-unknown from the Augur's synthesis.
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from eblets.eblet import Eblet

# ---------------------------------------------------------------------------
# Seer-A: architecture / empirics Pyramid
# ---------------------------------------------------------------------------

_ARCH_KEYSTONE_ANCHORS = {
    "CJ-cathedral",
    "CJ-2296",
    "CJ-helm",
}

_ARCH_SCRIBE_ATTRIBUTIONS = {
    "Scribe-Miners",
    "Scribe-Sculptors",
    "Scribe-Architecture",
    "Scribe-Engineering",
    "Scribe-Platform",
}


def arch_empirics_filter(eblet: "Eblet") -> bool:
    """
    Return True if this Eblet belongs to the architecture/empirics sub-domain.

    Includes Eblets with architecture-focused keystone anchors OR
    architecture-focused Scribe attributions.
    """
    anchors = set(eblet.keystone_anchors)
    scribes = set(eblet.scribe_attributions)

    if anchors & _ARCH_KEYSTONE_ANCHORS:
        return True
    if scribes & _ARCH_SCRIBE_ATTRIBUTIONS:
        return True
    return False


# ---------------------------------------------------------------------------
# Seer-B: founder-voice / biography Pyramid
# ---------------------------------------------------------------------------

# Non-CJ Keystones (Rhetorical Keystones, IP keystones, etc.)
_KEYSTONE_NON_CJ_RE = re.compile(r"^Keystone-", re.IGNORECASE)

_FOUNDER_KEYSTONE_ANCHORS = {
    "CJ-three-fates",
    "CJ-canonical",
    "CJ-2287",
    "CJ-2298-virtual-memory",
    "CJ-2298",
}

_FOUNDER_SCRIBE_ATTRIBUTIONS = {
    "Scribe-IP",
    "Scribe-Synapses",
    "Scribe-Sessions",
}


def founder_voice_filter(eblet: "Eblet") -> bool:
    """
    Return True if this Eblet belongs to the founder-voice/biography sub-domain.

    Includes Eblets with Rhetorical Keystone anchors, IP/Synapse/Sessions Scribes,
    or awareness-net theory anchors (CJ-2287, CJ-2298-virtual-memory).
    """
    anchors = set(eblet.keystone_anchors)
    scribes = set(eblet.scribe_attributions)

    # Any non-CJ Keystone anchor (Rhetorical Keystones)
    if any(_KEYSTONE_NON_CJ_RE.match(a) for a in anchors):
        return True
    # Founder-voice CJ anchors (awareness net theory, three-fates, canonical)
    if anchors & _FOUNDER_KEYSTONE_ANCHORS:
        return True
    # Founder-voice Scribe attributions
    if scribes & _FOUNDER_SCRIBE_ATTRIBUTIONS:
        return True
    return False


# ---------------------------------------------------------------------------
# Utility: describe which domains an Eblet belongs to
# ---------------------------------------------------------------------------

def classify_eblet(eblet: "Eblet") -> list[str]:
    """Return list of domain names this Eblet is in ('arch_empirics', 'founder_voice')."""
    domains: list[str] = []
    if arch_empirics_filter(eblet):
        domains.append("arch_empirics")
    if founder_voice_filter(eblet):
        domains.append("founder_voice")
    return domains
