"""
K490 Phase B — Keystone Watcher: Auto-Miner-Inception Event Mechanism

When a new Rhetorical Keystone is added to the registry, this module:
  1. Detects the new entry (file-watch on project_rhetorical_keystones.md
     OR explicit API call via register_keystone()).
  2. Fires an inception event.
  3. Creates a new Stone-Tablet-anchored Miner-Scribe config anchored to
     the new keystone's domain.
  4. The new Miner performs a focused-mining pass on existing bedrock,
     claiming Stone-Tablet-class tablets matching its keystone.
  5. Going forward, the Miner can be activated to monitor new bedrock +
     Synapses for ongoing Stone Tablet production.

Inception modes:
  - "keystone-spawned" (NEW, B123) — triggered by keystone registration
  - "mitosis-spawned" — daughter of existing miner (existing)
  - "root" — the first miner (existing)

Implementation strategy (Bishop B123 lean):
  - Primary: explicit API (register_keystone() / check_for_new_keystones())
  - Fallback: file-system watch on keystones registry JSON (built-in watchdog
    polling every POLL_INTERVAL_SEC seconds; no external deps required)
  - Both paths converge at _fire_inception_event()

File watched: keystones_registry.json (machine-readable; maintained by K490+)
Source of truth: project_rhetorical_keystones.md in Bishop memory (human-read)

K490 · B123
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
import threading
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Optional

# ── Paths ─────────────────────────────────────────────────────────────────────

HERE = Path(__file__).parent
KEYSTONES_REGISTRY = HERE / "keystones_registry.json"
INCEPTION_LOG = HERE / "keystone_inception_log.jsonl"
MINER_CONFIGS_DIR = HERE / "keystone_miner_configs"
MINER_CONFIGS_DIR.mkdir(parents=True, exist_ok=True)

POLL_INTERVAL_SEC = 30  # default polling interval for file-watch fallback

# Optional: path to Bishop memory (for file-watch source of truth)
# The watcher monitors keystones_registry.json (the machine-readable form)
# and the human source at BISHOP_MEMORY_KEYSTONES_MD if accessible.
BISHOP_MEMORY_KEYSTONES_MD = Path(
    r"C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory\project_rhetorical_keystones.md"
)

# ── Keystone-spawned Miner config ─────────────────────────────────────────────

def build_keystone_miner_config(keystone: dict, inception_session: str = "K490") -> dict:
    """
    Build a Miner-Scribe configuration anchored to this keystone.
    The config can be used to spawn a new Miner in run_k490_stone_tablets.py
    or in future mining runs.
    """
    kid = keystone["id"]
    phrase = keystone["phrase"]
    domain = keystone.get("domain", "unknown")
    thematic_kws = keystone.get("thematic_keywords", [])

    # Derive primary topic from keystone phrase (first non-stopword, ≥4 chars)
    stop = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
            "for", "of", "with", "by", "from", "as", "is", "it", "its",
            "i", "we", "you", "they", "this", "that", "what", "how",
            "just", "very", "not", "no", "so"}
    words = re.findall(r"[a-zA-Z']+", phrase)
    primary_topic = next(
        (w.lower() for w in words if w.lower() not in stop and len(w) >= 4),
        domain.split("-")[0]
    )

    return {
        "miner_config_version": "K490",
        "keystone_anchor_id": kid,
        "keystone_phrase_verbatim": phrase,
        "inception_mode": "keystone-spawned",
        "inception_session": inception_session,
        "inception_event_timestamp": datetime.now(timezone.utc).isoformat(),
        "primary_topic": primary_topic,
        "domain": domain,
        "seed_keywords": thematic_kws,
        "provenance": keystone.get("provenance", ""),
        "ratified_session": keystone.get("ratified_session", ""),
        "status": "pending-spawn",  # pending-spawn | active | dormant
        "stone_tablet_output_file": str(HERE / f"{kid}.jsonl"),
        "activation_notes": (
            f"This Miner-Scribe is anchored to {kid}: '{phrase[:60]}...'. "
            f"It monitors corpus content related to the '{domain}' domain. "
            f"Stone Tablets it produces carry keystone_anchor_id='{kid}' "
            f"and flow to Catacombs as highest-authority LB knowledge artifacts."
        ),
    }


def save_miner_config(config: dict) -> Path:
    """Save a keystone-spawned Miner config to disk."""
    kid = config["keystone_anchor_id"]
    path = MINER_CONFIGS_DIR / f"miner_config_{kid}.json"
    path.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


# ── Inception event ───────────────────────────────────────────────────────────

def _fire_inception_event(keystone: dict, source: str = "api") -> dict:
    """
    Fire the keystone-registration inception event.
    Creates and persists the Miner config; logs the event.
    Returns the event record.
    """
    kid = keystone["id"]
    miner_config = build_keystone_miner_config(keystone)
    config_path = save_miner_config(miner_config)

    event = {
        "event_type": "keystone_inception",
        "keystone_anchor_id": kid,
        "keystone_phrase": keystone["phrase"],
        "domain": keystone.get("domain", ""),
        "inception_mode": "keystone-spawned",
        "inception_source": source,  # "api" | "file-watch" | "retroactive"
        "timestamp": miner_config["inception_event_timestamp"],
        "miner_config_path": str(config_path),
        "status": "miner-config-created",
        "next_step": "run run_k490_stone_tablets.py to perform focused-mining pass on existing bedrock",
    }

    # Append to inception log (audit trail)
    with open(INCEPTION_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(event, ensure_ascii=False) + "\n")

    print(f"  [INCEPTION EVENT] {kid}: '{keystone['phrase'][:60]}...'")
    print(f"    Mode: keystone-spawned | Source: {source}")
    print(f"    Miner config: {config_path}")
    print(f"    Stone Tablet output: {miner_config['stone_tablet_output_file']}")
    return event


# ── Registry hash helper (change detection) ───────────────────────────────────

def _registry_hash(registry_path: Path) -> str:
    """Return a hash of the registry file for change detection."""
    if not registry_path.exists():
        return ""
    return hashlib.sha256(registry_path.read_bytes()).hexdigest()[:16]


def _count_keystones(registry_path: Path) -> int:
    """Return current keystone count from registry JSON."""
    try:
        data = json.loads(registry_path.read_text(encoding="utf-8"))
        return len(data.get("keystones", []))
    except Exception:
        return 0


def _load_registry(registry_path: Path) -> list[dict]:
    """Load keystones list from registry JSON."""
    try:
        data = json.loads(registry_path.read_text(encoding="utf-8"))
        return data.get("keystones", [])
    except Exception:
        return []


# ── Explicit API ──────────────────────────────────────────────────────────────

def register_keystone(
    keystone_dict: dict,
    update_registry: bool = True,
    session: str = "K490",
) -> dict:
    """
    Explicit API: register a new keystone and fire inception event.

    Args:
        keystone_dict: Must contain id, phrase, domain, thematic_keywords,
                       provenance, ratified_session. See keystones_registry.json
                       for field reference.
        update_registry: If True, append keystone to keystones_registry.json.
        session: Session ID for provenance.

    Returns:
        The inception event record.

    Example (registering Keystone #30 hypothetically):
        event = register_keystone({
            "id": "KEYSTONE-30",
            "number": 30,
            "phrase": "...",
            "domain": "...",
            "thematic_keywords": [...],
            "provenance": "project_rhetorical_keystones.md — BXXX",
            "ratified_session": "BXXX",
            "source": "...",
        })
    """
    kid = keystone_dict.get("id", "")
    if not kid:
        raise ValueError("keystone_dict must contain 'id' field (e.g. 'KEYSTONE-30')")

    print(f"\n[KEYSTONE REGISTRATION] {kid}: '{keystone_dict.get('phrase', '')[:60]}...'")

    # Check for collision
    existing = _load_registry(KEYSTONES_REGISTRY)
    if any(k["id"] == kid for k in existing):
        print(f"  WARNING: {kid} already exists in registry. Skipping duplicate registration.")
        return {"status": "duplicate", "keystone_anchor_id": kid}

    # Append to registry
    if update_registry and KEYSTONES_REGISTRY.exists():
        registry_data = json.loads(KEYSTONES_REGISTRY.read_text(encoding="utf-8"))
        registry_data["keystones"].append(keystone_dict)
        registry_data["_meta"]["count"] = len(registry_data["keystones"])
        registry_data["_meta"]["last_updated_session"] = session
        KEYSTONES_REGISTRY.write_text(
            json.dumps(registry_data, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )
        print(f"  Registry updated: {KEYSTONES_REGISTRY}")

    # Fire inception event
    event = _fire_inception_event(keystone_dict, source="api")
    return event


def check_for_new_keystones(
    known_ids: set[str] | None = None,
) -> list[dict]:
    """
    Check registry for keystones not yet processed (by inception event log).
    Fires inception events for any new ones found.
    Returns list of new inception events.

    Args:
        known_ids: Set of keystone IDs already processed. If None, reads from
                   inception log.
    """
    if known_ids is None:
        known_ids = _load_processed_keystone_ids()

    current_keystones = _load_registry(KEYSTONES_REGISTRY)
    new_events = []

    for keystone in current_keystones:
        kid = keystone["id"]
        if kid not in known_ids:
            event = _fire_inception_event(keystone, source="check-api")
            new_events.append(event)

    if not new_events:
        print(f"  No new keystones detected. Registry has {len(current_keystones)} keystones, "
              f"all processed.")

    return new_events


def _load_processed_keystone_ids() -> set[str]:
    """Read inception log to find which keystones have already been processed."""
    if not INCEPTION_LOG.exists():
        return set()
    processed = set()
    with open(INCEPTION_LOG, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                event = json.loads(line)
                processed.add(event.get("keystone_anchor_id", ""))
            except Exception:
                pass
    return processed


# ── File-watch daemon ─────────────────────────────────────────────────────────

class KeystoneWatcherDaemon:
    """
    Polls keystones_registry.json for changes.
    On detecting a new keystone (increased count), fires the inception event.
    Runs as a background thread.

    Usage:
        daemon = KeystoneWatcherDaemon(poll_interval_sec=30)
        daemon.start()
        # ... your code ...
        daemon.stop()
    """

    def __init__(
        self,
        registry_path: Path = KEYSTONES_REGISTRY,
        poll_interval_sec: int = POLL_INTERVAL_SEC,
        on_inception: Optional[Callable[[dict], None]] = None,
    ):
        self.registry_path = registry_path
        self.poll_interval_sec = poll_interval_sec
        self.on_inception = on_inception  # optional callback on new keystone
        self._stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None
        self._last_hash = _registry_hash(registry_path)
        self._known_ids = _load_processed_keystone_ids()
        print(f"  [KeystoneWatcher] Initialized. Watching: {registry_path}")
        print(f"  [KeystoneWatcher] Poll interval: {poll_interval_sec}s")
        print(f"  [KeystoneWatcher] Known processed keystones: {len(self._known_ids)}")

    def start(self):
        """Start the polling daemon in a background thread."""
        self._thread = threading.Thread(target=self._poll_loop, daemon=True)
        self._thread.start()
        print(f"  [KeystoneWatcher] Started (thread: {self._thread.name})")

    def stop(self):
        """Signal the daemon to stop."""
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=self.poll_interval_sec + 5)
        print(f"  [KeystoneWatcher] Stopped.")

    def _poll_loop(self):
        while not self._stop_event.is_set():
            try:
                current_hash = _registry_hash(self.registry_path)
                if current_hash != self._last_hash:
                    self._last_hash = current_hash
                    self._handle_registry_change()
            except Exception as exc:
                print(f"  [KeystoneWatcher] Poll error: {exc}", file=sys.stderr)
            self._stop_event.wait(self.poll_interval_sec)

    def _handle_registry_change(self):
        """Called when the registry file changes. Detect new keystones and fire inception."""
        print(f"  [KeystoneWatcher] Registry change detected at {datetime.now(timezone.utc).isoformat()}")
        current_keystones = _load_registry(self.registry_path)
        new_events = []

        for keystone in current_keystones:
            kid = keystone["id"]
            if kid not in self._known_ids:
                print(f"  [KeystoneWatcher] NEW KEYSTONE DETECTED: {kid}")
                event = _fire_inception_event(keystone, source="file-watch")
                new_events.append(event)
                self._known_ids.add(kid)
                if self.on_inception:
                    try:
                        self.on_inception(event)
                    except Exception as cb_exc:
                        print(f"  [KeystoneWatcher] Callback error: {cb_exc}", file=sys.stderr)

        if new_events:
            print(f"  [KeystoneWatcher] Fired {len(new_events)} inception event(s).")


# ── Retroactive inception (K490 Phase B — all 30 existing keystones) ──────────

def retroactive_inception_all_keystones(session: str = "K490") -> list[dict]:
    """
    Fire inception events for ALL keystones currently in the registry.
    Used in K490 to establish the inception audit trail for the 30 existing keystones.
    Idempotent: skips keystones that already have an inception event.
    """
    print(f"\n{'='*70}")
    print(f"  K490 Phase B — Retroactive Inception for all registered keystones")
    print(f"  Session: {session}")
    print(f"{'='*70}\n")

    keystones = _load_registry(KEYSTONES_REGISTRY)
    processed = _load_processed_keystone_ids()
    events = []

    print(f"  Registry has {len(keystones)} keystones.")
    print(f"  Already processed: {len(processed)}\n")

    for keystone in keystones:
        kid = keystone["id"]
        if kid in processed:
            print(f"  [SKIP] {kid} — already has inception event")
            continue
        event = _fire_inception_event(keystone, source="retroactive")
        events.append(event)
        processed.add(kid)

    print(f"\n  Inception events fired: {len(events)}")
    print(f"  Total processed: {len(processed)}")
    print(f"  Inception log: {INCEPTION_LOG}")
    print(f"  Miner configs dir: {MINER_CONFIGS_DIR}")
    print(f"{'='*70}\n")

    return events


# ── Phase B demonstration: register test keystone ─────────────────────────────

def demonstrate_inception(test_keystone: dict | None = None) -> dict:
    """
    Demonstrate the inception mechanism end-to-end.
    Uses a provided test keystone or a default test keystone.
    Per K490 prompt: if Keystone #29 is NOT yet in registry, use it;
    otherwise use a TEST_ keystone.
    """
    if test_keystone is None:
        # Check if KEYSTONE-29 is already registered
        existing_ids = {k["id"] for k in _load_registry(KEYSTONES_REGISTRY)}
        if "KEYSTONE-29" not in existing_ids:
            test_keystone = {
                "id": "KEYSTONE-29",
                "number": 29,
                "phrase": "This is Your World. Shape it, or Someone Else WILL.",
                "source": "B123, Founder home wall (long-standing personal anchor).",
                "provenance": "project_rhetorical_keystones.md — B123",
                "domain": "active-shaping-agency-sovereignty",
                "thematic_keywords": ["shape", "world", "will", "agency", "sovereignty",
                                       "active", "shaping", "ai", "policy", "decide"],
                "ratified_session": "B123",
            }
        else:
            # All 30 already in registry — use a test keystone
            test_keystone = {
                "id": "TEST_KEYSTONE-30",
                "number": 30,
                "phrase": "The architecture speaks. The person walks through the crowd unrecognized.",
                "source": "TEST — demonstration only. Not a ratified Founder keystone.",
                "provenance": "K490 demonstration test keystone — NOT for production use",
                "domain": "banksy-mode-founder-invisibility",
                "thematic_keywords": ["architecture", "crowd", "unrecognized", "invisible",
                                       "banksy", "founder", "platform", "disappear"],
                "ratified_session": "TEST_K490",
            }

    print(f"\n{'='*70}")
    print(f"  K490 Phase B — Inception Mechanism Demonstration")
    print(f"  Registering: {test_keystone['id']}")
    print(f"  Phrase: '{test_keystone['phrase'][:70]}...'")
    print(f"{'='*70}\n")

    event = register_keystone(test_keystone, update_registry=True, session="K490")

    print(f"\n  Demonstration complete.")
    print(f"  Event: {json.dumps(event, indent=2)}")
    return event


# ── Main ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="K490 Phase B — Keystone Watcher")
    parser.add_argument(
        "--retroactive", action="store_true",
        help="Fire inception events for all 30 existing keystones (K490 Phase B)."
    )
    parser.add_argument(
        "--demonstrate", action="store_true",
        help="Demonstrate end-to-end inception by registering a test/new keystone."
    )
    parser.add_argument(
        "--watch", action="store_true",
        help="Start file-watch daemon (watches keystones_registry.json)."
    )
    parser.add_argument(
        "--watch-duration", type=int, default=60,
        help="How many seconds to run the file-watch daemon (default: 60)."
    )
    args = parser.parse_args()

    if args.retroactive:
        retroactive_inception_all_keystones()

    if args.demonstrate:
        demonstrate_inception()

    if args.watch:
        print(f"\n[KeystoneWatcher] Starting file-watch daemon for {args.watch_duration}s...")
        daemon = KeystoneWatcherDaemon(poll_interval_sec=5)
        daemon.start()
        time.sleep(args.watch_duration)
        daemon.stop()

    if not (args.retroactive or args.demonstrate or args.watch):
        print("Usage: python keystone_watcher.py [--retroactive] [--demonstrate] [--watch]")
        print("  --retroactive  Fire inception events for all 30 existing keystones")
        print("  --demonstrate  Demonstrate end-to-end inception on a new/test keystone")
        print("  --watch        Run file-watch daemon for --watch-duration seconds")
