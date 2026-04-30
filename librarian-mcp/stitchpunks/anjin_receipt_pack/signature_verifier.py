"""
Signature Verifier — KN034 / Anjin Receipt Pack

Verifies the Chronos signature on an assembled Anjin Receipt Pack.
External participants can run this to confirm pack authenticity.

Usage:
    from anjin_receipt_pack.signature_verifier import verify_pack
    result = verify_pack(pack_root_path)
    assert result["verified"] == True

Toolsmith log: TS-ANJIN-RECEIPT-PACK-ASSEMBLY-KN034-BP003
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any, Dict


def verify_pack(pack_root: Path) -> Dict[str, Any]:
    """
    Verify the Chronos signature on an assembled Anjin Receipt Pack.

    1. Load 08_chronos_signature.json
    2. Extract manifest body (all keys except chronos_signature)
    3. Recompute SHA-256(canonical_json(manifest_body))
    4. Compare against stored chronicler_hash

    Returns:
        {
            "verified": bool,
            "pack_root": str,
            "stored_hash": str,
            "computed_hash": str,
            "gate_passed": bool,
            "error": str | None,
        }
    """
    result: Dict[str, Any] = {
        "verified": False,
        "pack_root": str(pack_root),
        "stored_hash": "",
        "computed_hash": "",
        "gate_passed": False,
        "error": None,
    }

    sig_path = Path(pack_root) / "08_chronos_signature.json"
    if not sig_path.exists():
        result["error"] = f"Signature file not found: {sig_path}"
        return result

    try:
        full = json.loads(sig_path.read_text(encoding="utf-8"))
    except Exception as exc:
        result["error"] = f"Failed to parse signature file: {exc}"
        return result

    sig = full.get("chronos_signature", {})
    stored_hash = sig.get("chronicler_hash", "")
    result["stored_hash"] = stored_hash

    # Rebuild manifest body for verification (all keys except chronos_signature)
    manifest_body = {k: v for k, v in full.items() if k != "chronos_signature"}

    canonical = json.dumps(manifest_body, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    computed_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    result["computed_hash"] = computed_hash

    result["verified"] = stored_hash == computed_hash

    # Check acceptance gate
    acc = full.get("acceptance_summary", {})
    result["gate_passed"] = acc.get("gate_passes", False)
    result["green_count"] = acc.get("green_count", 0)
    result["total_items"] = acc.get("total", 0)

    return result


def verify_pack_from_tarball(tarball_path: Path, extract_to: Path) -> Dict[str, Any]:
    """
    Extract a .tar.gz pack and verify it.
    Convenience wrapper for external participants.
    """
    import tarfile

    extract_to.mkdir(parents=True, exist_ok=True)
    with tarfile.open(tarball_path, "r:gz") as tar:
        tar.extractall(extract_to)

    # Find the pack root (first directory in extracted)
    candidates = [p for p in extract_to.iterdir() if p.is_dir()]
    if not candidates:
        return {"verified": False, "error": "No directory found after extraction"}

    pack_root = candidates[0]
    return verify_pack(pack_root)
