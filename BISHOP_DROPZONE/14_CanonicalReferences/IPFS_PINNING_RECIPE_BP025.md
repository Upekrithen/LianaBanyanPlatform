# IPFS Pinning Recipe — BP025 (IP Ledger Decentralization Layer 1)

**Project**: LianaBanyanPlatform  
**Phase**: 1 (Spike)  
**Date**: 2026-05-05  
**Authority**: Bishop FOREMAN dispatch via Yoke (BP025)

---

## Why IPFS Pinning?

Git provides content-addressed, version-controlled decentralization of **history**, but discovery relies on centralized hosting (GitHub). IPFS adds a complementary layer:

- **Content addressability**: CIDs are deterministic hashes — the same content always yields the same CID, regardless of origin server.
- **Decentralized retrieval**: Any node that has pinned a CID can serve it. No single point of failure for canonical artifact retrieval.
- **Immutability guarantees**: CID-linked artifacts cannot be silently altered. Drift is cryptographically detectable.
- **Gateway-agnostic access**: Public gateways (ipfs.io, dweb.link, Cloudflare) allow retrieval without running a local node.

This complements git-decentralized content with network-decentralized discovery.

---

## Canonical Artifacts (Phase 1)

| Artifact | Path | CID |
|---|---|---|
| Codex Ledger | `librarian-mcp/stitchpunks/codex/codex_ledger.jsonl` | `QmYsz5WNMxSvXguMA2oBvMQUN8AT7v7Aomxn8hKvHx7nFU` |
| Iron Tablets | `librarian-mcp/stitchpunks/old_ones_fleet/iron_tablets.jsonl` | `QmcsWdt8owJd8AJQ7wBB628w1uLM95Giy3hADj7LS5zEn7` |
| Stack Ledger | `BISHOP_DROPZONE/14_CanonicalReferences/STACK_LEDGER.jsonl` | `QmcbEaKd3Fmp5ULsWGg9v9cVFQanpMS3amXum3TACpWdtM` |
| Living Receipts | `BISHOP_DROPZONE/14_CanonicalReferences/MECHANICAL_COMPUTER_LIVING_RECEIPTS.md` | `Qmcme7FCA9bcVfDY7sZvzyrrQVJuQ46LDkHKaHM2NYEHFS` |
| Pheromone Records | `librarian-mcp/stitchpunks/pheromone_substrate/index.jsonl` | `QmXu17urj294J7pgk6Sc5tXu16SKpk8BB4TnYwnb7v6hBg` |

> **Phase 1 Note**: CIDs computed via `ipfs add --only-hash` (offline). Gateways will return 404 until a live daemon propagates the content. Phase 2 will activate daemon pinning.

---

## Setup: kubo Install

### Windows (kubo v0.28.0)

```powershell
# Download
Invoke-WebRequest -Uri "https://dist.ipfs.tech/kubo/v0.28.0/kubo_v0.28.0_windows-amd64.zip" -OutFile "$env:TEMP\kubo.zip"
Expand-Archive -Path "$env:TEMP\kubo.zip" -DestinationPath "$env:TEMP\kubo_extract" -Force

# Install to user bin
$installDir = "$env:LOCALAPPDATA\bin"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item "$env:TEMP\kubo_extract\kubo\ipfs.exe" $installDir

# Add to PATH (permanent)
[Environment]::SetEnvironmentVariable("PATH", "$installDir;$([Environment]::GetEnvironmentVariable('PATH','User'))", "User")

# Initialize and verify
ipfs init
ipfs --version
```

### Ubuntu / GitHub Actions (kubo v0.28.0)

```bash
wget -q https://dist.ipfs.tech/kubo/v0.28.0/kubo_v0.28.0_linux-amd64.tar.gz
tar -xzf kubo_v0.28.0_linux-amd64.tar.gz
sudo mv kubo/ipfs /usr/local/bin/ipfs
ipfs init
ipfs --version
```

---

## Manual Pin Commands

### Offline CID Computation (no daemon required)

```bash
# Compute CIDs without network/daemon
ipfs add --only-hash -Q <file>

# Example:
ipfs add --only-hash -Q librarian-mcp/stitchpunks/codex/codex_ledger.jsonl
```

### Live Pinning (daemon required)

```bash
# Start daemon (background)
ipfs daemon &

# Wait for daemon to be ready
sleep 5

# Pin a file (adds and pins to local node)
ipfs add librarian-mcp/stitchpunks/codex/codex_ledger.jsonl

# Pin a directory
ipfs add -r librarian-mcp/stitchpunks/pheromone_substrate/
```

---

## GitHub Action Setup

The workflow at `.github/workflows/ipfs-pin-canonical.yml` triggers on:
- Push to any of the 5 canonical artifact paths
- Manual dispatch (`workflow_dispatch`)

The action:
1. Installs kubo v0.28.0 on ubuntu-latest
2. Runs `ipfs add --only-hash` for each artifact
3. Appends a JSONL entry to `BISHOP_DROPZONE/14_CanonicalReferences/IPFS_PIN_MANIFEST.jsonl`
4. Commits and pushes the manifest update

To upgrade to live pinning, replace `--only-hash` with a daemon start step and a pinning service (Pinata, web3.storage, or self-hosted).

---

## Gateway Verification Matrix

After live pinning, verify retrieval from 3 public gateways:

```bash
CID=<your-cid>
curl -I https://ipfs.io/ipfs/$CID
curl -I https://dweb.link/ipfs/$CID
curl -I https://cloudflare-ipfs.com/ipfs/$CID
```

Expected: `HTTP/2 200` within 30–60s after propagation.

### Phase 1 Spike Results (2026-05-05)

| Artifact | ipfs.io | dweb.link | cloudflare-ipfs.com | Notes |
|---|---|---|---|---|
| Codex | 404 | 404 | DNS fail | Phase 1 spike — daemon not running |
| Iron Tablet | 404 | 404 | DNS fail | Phase 1 spike — daemon not running |
| Stack Ledger | 404 | 404 | DNS fail | Phase 1 spike — daemon not running |
| Living Receipts | 404 | 404 | DNS fail | Phase 1 spike — daemon not running |
| Pheromone | 404 | 404 | DNS fail | Phase 1 spike — daemon not running |

> **Phase 1 spike CIDs computed; propagation pending daemon deployment.** cloudflare-ipfs.com may also have DNS resolution issues in restricted network environments.

---

## Known Gaps (Phase 2+)

| Gap | Description | Phase |
|---|---|---|
| **IPNS** | Mutable names — CIDs change on every file update. IPNS provides a stable pointer to the latest CID. | Phase 2 |
| **ENS** | Ethereum Name Service for human-readable addresses (e.g., `lianabanyan.eth`). Requires Founder wallet. | Phase 2 |
| **Pinning service** | Self-hosted kubo daemon or service (Pinata, web3.storage) for persistent content availability. | Phase 2 |
| **Tor onion mirror** | Hidden service mirror for censorship-resistant access. | Phase 3 |
| **CID drift alerts** | Automated detection when artifact content changes (CID mismatch). | Phase 3 |
| **Multi-region replication** | Pin to 3+ geographic nodes for HA. | Phase 3 |

---

*Generated by Knight (Shadow Agent) — BP025 IPFS Phase 1 Spike — 2026-05-05*
