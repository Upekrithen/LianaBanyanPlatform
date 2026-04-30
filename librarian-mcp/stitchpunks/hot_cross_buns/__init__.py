"""
Hot Cross Buns Testing Packet — KN030 / A&A #2304 / #2299 / #2326 / BP003

Publishable participant-export kit bundling the CheckBook Suite (KN027 + KN028 + KN029).
Composes with R&D Battery participant-export (#2299) and Reproducibility Pack (#2326).

License: Free public package per #2260 Cooperative Defensive Patent Pledge.

Public API:
    from hot_cross_buns import bundle_kit, list_kits
"""

from .participant_bundler import bundle_kit, list_kits

__all__ = ["bundle_kit", "list_kits"]
