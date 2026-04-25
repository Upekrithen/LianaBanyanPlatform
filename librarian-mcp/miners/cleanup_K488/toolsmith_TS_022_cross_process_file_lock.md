# TS-022 — Cross-Process File Lock for IP Ledger (Windows + Cross-platform)

**Session:** K488 · Bishop B123
**Phase:** C — Concurrent-write file-lock verification
**Surfaces:** K487 orphan-process race → 100,565 chain breaks in ip_ledger.jsonl
**Status:** DOCUMENTED — fix recommended for K-future; historical recovery via Phase A

---

## Problem

`threading.Lock` in `miner.py::_append_ledger()` prevents concurrent writes
from **multiple threads within the same process**. It does NOT prevent:

- Two separate Python processes writing simultaneously to `ip_ledger.jsonl`
- The K487 scenario: parent killed → orphan children survived → each child
  had its own copy of `_ledger_prior_hash` (module-level global) → stale
  hashes → 100,565 chain breaks

## Root cause (K487)

```
# In miner.py:
_ledger_prior_hash: str = "GENESIS"  # Module-level global — per-process

def _append_ledger(entry):
    global _ledger_prior_hash
    with _LEDGER_LOCK:            # <-- protects threads; NOT processes
        prior = _ledger_prior_hash
        ...
        _ledger_prior_hash = current_hash  # updates THIS process only
```

When `run_miner_k487.py` spawned the harness, the parent was killed mid-run.
Python child processes on Windows do NOT inherit the threading lock state
(they can't — it's per-process), so each orphan wrote with its own
`_ledger_prior_hash` value, advancing independently and diverging from the
canonical chain.

## Fix A — Process-kill discipline (immediate, no code change)

Always kill the ENTIRE process tree using:

```powershell
# Windows — kills parent AND all children
taskkill /F /T /PID <parent_pid>

# Verify no orphans remain:
Get-Process python | Select-Object Id, CommandLine
```

**This is the primary fix for K-future.** The orphan race only occurs if the
process tree is not terminated cleanly.

## Fix B — OS-level file lock (defense-in-depth, recommended for K-future)

Install `portalocker` (cross-platform) or use Windows `msvcrt.locking`:

### Option 1: portalocker (recommended — cross-platform)

```bash
pip install portalocker
```

```python
import portalocker

def _append_ledger(entry: dict) -> str:
    global _ledger_prior_hash
    with _LEDGER_LOCK:  # thread lock still needed for in-process concurrency
        prior = _ledger_prior_hash
        ts = datetime.now(timezone.utc).isoformat()
        # ... compute payload and hash ...
        with LEDGER_PATH.open("a", encoding="utf-8") as fh:
            portalocker.lock(fh, portalocker.LOCK_EX)  # OS-level exclusive lock
            fh.write(json.dumps(record) + "\n")
            portalocker.unlock(fh)
        _ledger_prior_hash = current_hash
        return current_hash
```

### Option 2: msvcrt.locking (Windows-only)

```python
import msvcrt

def _append_ledger(entry: dict) -> str:
    global _ledger_prior_hash
    with _LEDGER_LOCK:
        prior = _ledger_prior_hash
        # ... compute ...
        with LEDGER_PATH.open("a", encoding="utf-8") as fh:
            # Lock the append region
            pos = fh.seek(0, 2)  # seek to end
            nbytes = len(record_str.encode("utf-8"))
            fh.seek(pos)
            msvcrt.locking(fh.fileno(), msvcrt.LK_NBLCK, nbytes)
            fh.write(record_str + "\n")
            fh.seek(pos)
            msvcrt.locking(fh.fileno(), msvcrt.LK_UNLCK, nbytes)
        _ledger_prior_hash = current_hash
        return current_hash
```

`msvcrt.locking` is more complex (must lock exact byte range) and Windows-only.
Prefer `portalocker`.

## Threading.Lock verdict for single-process runs

✅ `threading.Lock` IS SUFFICIENT for single-process multi-thread mining runs
   (where threads share the same Python process and module-level state).

❌ `threading.Lock` is NOT SUFFICIENT when multiple Python processes write
   to the same ledger file simultaneously.

## TS-021 amendment note

TS-021 documented the addition of `threading.Lock`. TS-021 should be annotated:
> "Protects threads within one process. For cross-process safety, use
> portalocker (OS-level exclusive file lock) as documented in TS-022."

## Historical recovery

The K487 chain breaks were fixed via Phase A ledger rebuild (K488). No code
change was strictly required for historical recovery. TS-022 is forward-defense.

---

*TS-022 authored K488 · Phase C. B123-reviewed. Founder-ratified via K488 success.*
