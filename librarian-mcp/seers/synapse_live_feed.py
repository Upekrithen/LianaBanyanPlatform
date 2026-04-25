"""
Synapse Live-Feed → Eblet Continuous Pipeline
K489 · B123 — Phase A

Watches librarian-mcp/stitchpunks/synapses/ for new or updated synapse_K*.jsonl files.
When new clusters appear, runs them through Sculptor.generate_eblet() and appends
the resulting Eblet to the EbletStore — continuously, without manual batch jobs.

Architecture:
  Synapse emitter (writes synapse_K{N}.jsonl) →
  SynapseWatcher (this module) →
  Sculptor.generate_eblet() →
  EbletStore.append()

Usage:
  # One-shot: process any new clusters not yet in the Eblet store
  python -m seers.synapse_live_feed --once

  # Daemon: poll every 30s forever
  python -m seers.synapse_live_feed --daemon --interval 30

  # From Python (embedded in Helm PWA daemon thread)
  from seers.synapse_live_feed import SynapseWatcher
  watcher = SynapseWatcher(api_client=anthropic_client)
  watcher.run_once()                    # one pass
  watcher.start_daemon(interval_s=30)  # background thread, returns immediately

REF Staff discipline: this module reads Synapses and writes Eblets only.
It does NOT modify source Synapse files.
"""

from __future__ import annotations

import json
import os
import sys
import threading
import time
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# --- Path setup ---------------------------------------------------------------
_HERE = Path(__file__).parent
_LIBRARIAN_MCP = _HERE.parent
sys.path.insert(0, str(_LIBRARIAN_MCP.parent))
sys.path.insert(0, str(_LIBRARIAN_MCP))

# Force UTF-8 on Windows consoles (cp1252 can't encode checkmarks / arrows)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from eblets.eblet import (
    EbletStore,
    EBLET_STORE_PATH,
    SYNAPSE_DIR,
    _get_cluster_name,
    _get_synapse_text,
)
from sculptors.sculptor import Sculptor, CathedralProfile, DemandProfile

# Haiku pricing (as of K489)
HAIKU_INPUT_COST_PER_M = 0.80
HAIKU_OUTPUT_COST_PER_M = 4.00

# State file: records the last-seen file size per synapse file (survives restarts)
_STATE_FILE = _LIBRARIAN_MCP / "seers" / "live_feed_state.json"


def _make_sculptor() -> Sculptor:
    """Minimal Sculptor instance for Eblet-mode generation (same as K485 batch)."""
    profile = CathedralProfile(
        cathedral_name="eblet-live-feed",
        audience_scope="guild",
        scope_classes_allowed=["public", "guild", "private"],
        preferred_sculpt_form="summary",
        min_score=0.0,
    )
    demand = DemandProfile(
        cathedral_name="eblet-live-feed",
        frequent_topics=[],
        topic_weights={},
        preferred_depth_levels=[1, 2, 3],
    )
    return Sculptor(
        sculptor_id="SC-LIVEFEED-K489",
        cathedral_profile=profile,
        demand_profile=demand,
    )


def _parse_clusters_from_lines(lines: list[str]) -> dict[str, list[dict]]:
    """Parse a list of JSONL lines into {cluster_name: [entries]}."""
    clusters: dict[str, list[dict]] = defaultdict(list)
    cluster_order: list[str] = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue
        cn = _get_cluster_name(entry)
        if cn not in clusters:
            cluster_order.append(cn)
        clusters[cn].append(entry)
    return {name: clusters[name] for name in cluster_order}


class SynapseWatcher:
    """
    File-system watcher for the synapses directory.

    Polls for new synapse_K*.jsonl files and for new lines in existing files.
    For each new Synapse cluster found, generates an Eblet via Sculptor.generate_eblet()
    and appends it to the EbletStore.

    Design notes:
    - Polling (not inotify/FSEvents) for cross-platform compatibility (Windows + macOS + Linux).
    - State (file offsets) persisted in live_feed_state.json so the watcher is resumable.
    - All writes are append-only; no Synapse files are modified.
    - LLM calls are Haiku-class ($0.80/M input, $4.00/M output).
    """

    def __init__(
        self,
        api_client: Optional[Any] = None,
        synapse_dir: Path = SYNAPSE_DIR,
        eblet_store_path: Path = EBLET_STORE_PATH,
        cost_cap_usd: float = 1.00,
        verbose: bool = True,
    ) -> None:
        self.api_client = api_client
        self.synapse_dir = synapse_dir
        self.store = EbletStore(eblet_store_path)
        self.sculptor = _make_sculptor()
        self.cost_cap_usd = cost_cap_usd
        self.verbose = verbose
        self._total_cost_usd = 0.0
        self._total_generated = 0
        self._total_skipped = 0
        # file_offset: {filepath_str: byte_offset_of_last_read}
        self._file_offsets: dict[str, int] = {}
        self._load_state()

    # ------------------------------------------------------------------
    # State persistence
    # ------------------------------------------------------------------

    def _load_state(self) -> None:
        """Load persisted file offsets from state file."""
        if _STATE_FILE.exists():
            try:
                with _STATE_FILE.open("r", encoding="utf-8") as fh:
                    data = json.load(fh)
                self._file_offsets = data.get("file_offsets", {})
                self._total_generated = data.get("total_generated_lifetime", 0)
                if self.verbose:
                    print(
                        f"[live-feed] Loaded state: {len(self._file_offsets)} tracked files, "
                        f"{self._total_generated} Eblets generated lifetime",
                        flush=True,
                    )
            except Exception as exc:
                print(f"[live-feed] WARNING: state file load failed ({exc}); starting fresh.", flush=True)
                self._file_offsets = {}

    def _save_state(self) -> None:
        """Persist file offsets to state file."""
        _STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
        state = {
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "file_offsets": self._file_offsets,
            "total_generated_lifetime": self._total_generated,
        }
        with _STATE_FILE.open("w", encoding="utf-8") as fh:
            json.dump(state, fh, indent=2)

    # ------------------------------------------------------------------
    # Core processing
    # ------------------------------------------------------------------

    def _discover_synapse_files(self) -> list[Path]:
        """Return all synapse_K*.jsonl files, sorted by name."""
        return sorted(self.synapse_dir.glob("synapse_K*.jsonl"))

    def _read_new_lines(self, path: Path) -> list[str]:
        """
        Read only lines added since last read (byte-offset tracking).
        Returns new lines as strings. Updates self._file_offsets[str(path)].
        """
        key = str(path)
        offset = self._file_offsets.get(key, 0)
        current_size = path.stat().st_size

        if current_size <= offset:
            return []  # no new content

        new_lines: list[str] = []
        with path.open("rb") as fh:
            fh.seek(offset)
            raw = fh.read()
        self._file_offsets[key] = current_size

        for raw_line in raw.split(b"\n"):
            decoded = raw_line.decode("utf-8", errors="replace").strip()
            if decoded:
                new_lines.append(decoded)
        return new_lines

    def _process_cluster(
        self,
        synapse_path: Path,
        cluster_name: str,
        cluster_entries: list[dict],
    ) -> bool:
        """
        Generate one Eblet for the cluster and append it to the store.
        Returns True if generated, False if skipped or failed.
        """
        synapse_pointer = f"{synapse_path.name}#cluster_{cluster_name}"

        # Idempotency guard
        if self.store.already_has_pointer(synapse_pointer):
            self._total_skipped += 1
            return False

        # Cost guard
        if self._total_cost_usd >= self.cost_cap_usd:
            if self.verbose:
                print(f"[live-feed] Cost cap ${self.cost_cap_usd:.2f} reached — pausing LLM calls.", flush=True)
            return False

        if self.api_client is None:
            if self.verbose:
                print(f"[live-feed] No API client — dry-run recording pointer only: {synapse_pointer}", flush=True)
            self._total_skipped += 1
            return False

        eblet_id = self.store.next_id()
        try:
            eblet = self.sculptor.generate_eblet(
                synapse_cluster=cluster_entries,
                synapse_filename=synapse_path.name,
                cluster_name=cluster_name,
                api_client=self.api_client,
                eblet_id=eblet_id,
            )
            self.store.append(eblet)

            # Cost tracking (estimate)
            cluster_text = "\n\n".join(_get_synapse_text(e) for e in cluster_entries)
            in_tok = max(1, int(len(cluster_text.split()) / 0.75))
            out_tok = max(1, len(eblet.summary_text.split()))
            cost = (in_tok * HAIKU_INPUT_COST_PER_M + out_tok * HAIKU_OUTPUT_COST_PER_M) / 1_000_000
            self._total_cost_usd += cost
            self._total_generated += 1

            if self.verbose:
                print(
                    f"[live-feed] [OK] {eblet.eblet_id} <- {synapse_path.name}#{cluster_name} "
                    f"({len(eblet.summary_text.split())}w, conf={eblet.confidence_score:.2f}, "
                    f"cost=${cost:.5f})",
                    flush=True,
                )
            return True

        except Exception as exc:
            print(f"[live-feed] ERROR generating Eblet for {synapse_pointer}: {exc}", flush=True)
            return False

    def run_once(self) -> dict:
        """
        Single pass: scan all synapse files for new clusters and generate Eblets.

        Returns summary dict: {files_checked, new_lines_found, generated, skipped, cost_usd}.
        """
        files_checked = 0
        new_lines_found = 0
        generated = 0
        skipped = 0

        for synapse_path in self._discover_synapse_files():
            files_checked += 1
            new_lines = self._read_new_lines(synapse_path)

            if not new_lines:
                continue

            new_lines_found += len(new_lines)

            if self.verbose:
                print(
                    f"[live-feed] {synapse_path.name}: {len(new_lines)} new line(s)",
                    flush=True,
                )

            # Parse new lines into clusters (may be partial clusters if session mid-write)
            clusters = _parse_clusters_from_lines(new_lines)
            for cluster_name, cluster_entries in clusters.items():
                if self._process_cluster(synapse_path, cluster_name, cluster_entries):
                    generated += 1
                else:
                    skipped += 1

        self._save_state()

        summary = {
            "run_at": datetime.now(timezone.utc).isoformat(),
            "files_checked": files_checked,
            "new_lines_found": new_lines_found,
            "generated": generated,
            "skipped": skipped,
            "session_cost_usd": round(self._total_cost_usd, 6),
            "store_total": self.store.count(),
        }

        if self.verbose and (generated > 0 or new_lines_found > 0):
            print(
                f"[live-feed] Pass complete: {generated} Eblets generated, "
                f"{skipped} skipped, store={summary['store_total']}, "
                f"cost=${self._total_cost_usd:.4f}",
                flush=True,
            )

        return summary

    def start_daemon(self, interval_s: float = 30.0) -> threading.Thread:
        """
        Start a background daemon thread that polls every `interval_s` seconds.

        Returns the thread (already started, daemon=True so it dies with the process).
        Call this from the Helm PWA daemon wrapper to run the live feed continuously.
        """
        def _loop():
            print(
                f"[live-feed] Daemon started — polling every {interval_s}s "
                f"for new Synapse clusters in {self.synapse_dir}",
                flush=True,
            )
            while True:
                try:
                    self.run_once()
                except Exception as exc:
                    print(f"[live-feed] Unexpected error in daemon loop: {exc}", flush=True)
                time.sleep(interval_s)

        t = threading.Thread(target=_loop, name="synapse-live-feed", daemon=True)
        t.start()
        return t


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

def _make_api_client() -> Optional[Any]:
    """Load Anthropic client from environment. Returns None if key not set."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("[live-feed] WARNING: ANTHROPIC_API_KEY not set — dry-run mode (no LLM calls).", flush=True)
        return None
    try:
        import anthropic
        return anthropic.Anthropic(api_key=api_key)
    except ImportError:
        print("[live-feed] ERROR: anthropic package not installed. Run: pip install anthropic", flush=True)
        return None


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="K489 Synapse Live-Feed → Eblet daemon")
    parser.add_argument("--once", action="store_true", help="Run one pass then exit")
    parser.add_argument("--daemon", action="store_true", help="Run as polling daemon (default)")
    parser.add_argument("--interval", type=float, default=30.0, help="Poll interval in seconds (default 30)")
    parser.add_argument("--cost-cap", type=float, default=1.00, help="Max LLM spend per run (default $1.00)")
    parser.add_argument("--quiet", action="store_true", help="Suppress verbose output")
    args = parser.parse_args()

    api_client = _make_api_client()

    watcher = SynapseWatcher(
        api_client=api_client,
        cost_cap_usd=args.cost_cap,
        verbose=not args.quiet,
    )

    if args.once:
        summary = watcher.run_once()
        print(json.dumps(summary, indent=2))
        return

    # Default: daemon mode
    try:
        watcher.start_daemon(interval_s=args.interval)
        print("[live-feed] Press Ctrl+C to stop.", flush=True)
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[live-feed] Stopped.", flush=True)


if __name__ == "__main__":
    main()
