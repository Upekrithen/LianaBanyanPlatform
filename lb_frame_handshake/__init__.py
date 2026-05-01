"""
lb_frame_handshake — LB Frame Handshake bootstrap ritual (KN086/BP009)
=======================================================================
Five-phase substrate-install first-class bootstrap ritual for LB Frame.

Every LB-Frame deployment runs the Handshake to become operationally
ready before first use. Generalizes Bishop's BP009 SessionStart sequence
+ KN085 settings.json pre-approve into a UNIVERSAL primitive callable on
any LB-substrate-adopting Claude Code surface.

Crown-Jewel-class Prov-16 candidate per BP009 Founder ratification.

Quick start:
    from lb_frame_handshake import handshake
    result = handshake()                    # full run
    result = handshake(probe_only=True)     # Phase 1 only (read-only probe)

CLI:
    python -m lb_frame_handshake [--probe-only] [--dry-run] [--session KN086]
"""

__version__ = "1.0.0"
__canon__ = "~/.claude/state/eblets/CANON/lb_frame_handshake_bp009.eblet.md"
__session__ = "KN086/BP009"

from .handshake import handshake, HandshakeResult
from .host_context import HostContext

__all__ = ["handshake", "HandshakeResult", "HostContext"]
