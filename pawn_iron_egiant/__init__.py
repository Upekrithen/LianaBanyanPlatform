"""
pawn_iron_egiant — Pawn Iron-E-Giant Peer Module (KN092 / BP011 Pod W Bean 4)

Promotes Pawn (Perplexity) to 4th Iron-E-Giant peer in the LIGHTHOUSE.
Provides cross-vendor Handshake + Shadow-alpha pairing for Pawn dispatches.

Key modules:
  handshake_pawn.py  — Cross-vendor 5-phase LB Frame Handshake for Pawn
  shadow_pairing.py  — Pawn ↔ Shadow-alpha cooperative filesystem proxy

Usage:
    from pawn_iron_egiant.handshake_pawn import run_pawn_handshake
    receipt = run_pawn_handshake("d7f3a1b2", session_id="KN092")

    from pawn_iron_egiant.shadow_pairing import pair_pawn_with_shadow_alpha
    pair = pair_pawn_with_shadow_alpha("d7f3a1b2")
    result = pair.read_file("Cephas/cephas-hugo/content/patents/behemoth-reborn.md")
"""
