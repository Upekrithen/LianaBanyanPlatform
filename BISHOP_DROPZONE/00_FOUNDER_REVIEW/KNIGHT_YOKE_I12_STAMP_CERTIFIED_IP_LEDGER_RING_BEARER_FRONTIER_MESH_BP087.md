# KNIGHT YOKE · I12 · STAMP-CERTIFIED IP LEDGER · RING BEARER · FRONTIER MESH · BP087

**From:** Bishop · BP087 · Founder-direct architectural ratify
**To:** Knight
**Class:** Architectural wiring · backbone-class · LB Frame substrate
**Model:** Sonnet 4.6 verbatim (Statutes §3 · NEVER "4.5" per BP079) · **use segs** on every dispatch
**Priority:** queued post-THUNDERCLAP (do NOT preempt MAMBA-ζ) · ship in v0.5.13 or later

---

## §0 — Founder direct (BP087 verbatim)

> *"And if any machine doesn't have gemma4:12b installed, please install it for them (I thought about it, and that should always be an option, but always explicitly Stamp-Certified (that means to Stamp the Immutable I.P. Ledger that a local copy is kept in the installation of Mnemosynec and constantly and consistently (pray without ceasing doesn't mean to pray at every moment, it means never stop - like eat without ceasing would then mean to never go without it such that you starve) updated between it and every other ledger that it contacts - this is all specced, I want to make sure it is wired, as it is the backbone of all of this with the I.P. ledger section that pertains to the ring bearer (the person installing the Mnemosynec LB Frame on their computer) as well as replicating with all other nodes in the frontier mesh for truly immutable hash block chain test-net by design backup."*

Canonical eblet: `canon_stamp_certified_ip_ledger_ring_bearer_frontier_mesh_replicating_backbone_bp087` · Statutes §16.

---

## §1 — Sharps (use segs · Sonnet 4.6 verbatim)

### I12a · Local IP Ledger schema (SQLite or content-addressed jsonl)

- Path: `%APPDATA%\mnemosynec\state\ip_ledger\` (Windows) · `~/.config/mnemosynec/state/ip_ledger/` (Linux) · `~/Library/Application Support/mnemosynec/state/ip_ledger/` (macOS)
- Tables/files:
  - `ip_ledger_entries` — content-addressed by SHA256 of entry payload · columns: `entry_id`, `entry_type` (`patent_contribution` / `eblet_mint` / `code_commit` / `marks_earned` / `model_stamp` / `crown_letter_cosign` / `paper_contribution`), `payload_json`, `ring_bearer_pubkey_hex`, `signature_hex`, `created_at_utc`, `merkle_index`
  - `ip_ledger_merkle_root` — current root hash, last_updated_at, peer-quorum count
  - `ip_ledger_peer_diffs` — log of diffs exchanged with each peer (peer_id, last_handshake_ts, entries_pushed, entries_received)
- Migration shipped in MnemosyneC installer (per-install local state, NOT Supabase — this is intentionally local-first)

### I12b · Ring Bearer keypair generation (first launch)

- On first MnemosyneC launch post-v0.5.13, generate an Ed25519 keypair for the Ring Bearer
- Private key stored in OS keychain: Windows Credential Manager (via `wincred`) · macOS Keychain · Linux libsecret/keyring
- Public key written to:
  - Local Ledger metadata
  - `peer_presence.capabilities.ring_bearer_pubkey_hex` (so Frontier peers can verify signatures)
- Keypair is durable across reinstalls (read from OS keychain on launch; only regenerated if not present)

### I12c · Stamp-Certify primitive

- `ipLedger.stamp(entry: IPLedgerEntry, ringBearerPrivKey: Buffer): SignedEntry`
- Computes SHA256 of canonical-JSON payload, Ed25519-signs with Ring Bearer key, appends to local Ledger, updates Merkle root, emits `ip_ledger:entry_added` IPC event for renderer (refresh "My IP Ledger" tab)
- Auto-invocation hooks:
  - After successful `ollama pull <model>` (called from `mic-broadcast.config_set` handler) → stamp the model with `entry_type='model_stamp'`, payload `{model_name, gguf_sha256, pull_ts, source_url}`
  - After eblet mint (when the local app authors an eblet) → stamp with `entry_type='eblet_mint'`
  - After Marks earned (bounty completed) → stamp with `entry_type='marks_earned'`
  - After Crown letter co-sign → stamp with `entry_type='crown_letter_cosign'`

### I12d · Mesh diff protocol (Merkle-tree path exchange)

- During every relay handshake (currently via `wan-relay-route` Edge Function), peers exchange `ip_ledger_merkle_root` hashes
- If roots differ: bisect-diff protocol — exchange Merkle-tree paths to find diverging branches, push/pull the missing entries
- Conflict resolution: canonical hash-chain ordering · entry with earlier valid Ed25519 signature wins · ties broken by lexicographic ordering of `entry_id`
- Quorum tracking: each entry tracks how many peer Frames have echoed it back; UI surfaces "this entry is replicated on N Frames"

### I12e · "My IP Ledger" UI tab

- New tab in MnemosyneC: "My IP Ledger"
- Shows Ring Bearer pubkey (the receipt anchor — "this is who you are in the cooperative")
- Lists entries chronologically: type, payload summary, signature timestamp, mesh-quorum count
- Search/filter by entry_type
- Export "My IP Ledger" as a portable proof file (canonical-JSON + Merkle root + Ring Bearer signature)

### I12f · Auto-install gemma4:12b on missing peers (closes Founder direct BP087)

- When a peer has empty `loaded_models` for `gemma4:12b` (detected via health_snapshot), auto-trigger `config_set ollama.model_pull=gemma4:12b` for THAT peer specifically
- After successful pull, auto-Stamp-Certify the model into the local Ledger (per I12c)
- This makes "gemma4:12b is always available" a Frame invariant, AND every install gets a Stamp-Certified receipt of its model possession

---

## §2 — Composition with existing canon (READ before authoring)

- `canon_lb_frame_self_verifying_full_replica_resilience_platform_down_proof_bp063` — Frame-replica-resilience at the data layer (this canon extends to the IP Ledger layer)
- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` — Ed25519 signing pattern · MIC broadcast security (re-use the same keypair primitive when feasible)
- `canon_federation_node_frontier_peer_presence_relay_routing_bp086` — the Frontier Mesh substrate this Ledger replicates over
- `canon_substrace_theorem_sequential_context_handoff_bp086` — re-weave semantics; the Ledger uses analogous principle for IP entries
- `canon_socceri_node_frontier_network_naming_taxonomy_supersedes_futbol_bp063` — naming: each Frame is a "Node of Socceri" in the Frontier; the IP Ledger lives ON each Socceri
- `canon_angel_of_death_ai_content_verifier_furnace_companion_bp051` — C2PA + LB Stamp content-attribution discipline (Layer 3 attestation composes here)

---

## §3 — Statutes binding

- §2 IMMUTABLES — fix-as-we-go · build-for-the-long-haul · ALWAYS mint small canon eblet · Truth-Always · 100%-read-before-eblet
- §3 SEGs Sonnet 4.6 verbatim
- §4 absolute paths · PowerShell `;` · secrets blacklist
- §16 (NEW) — this yoke implements the architectural binding
- §12 Knight-direct
- A14 BLOOD: gadget-verify before claims
- A15 BLOOD: SEGs do the work
- A16 BLOOD: Founder ratifies ONCE at end of cycle (the Ledger primitive landing receipt + UI smoke-test, not mid-flow)

---

## §4 — Brick Wall scope (pre-authorized)

- Local Ledger schema + storage location convention
- Ring Bearer keypair generation + OS keychain integration
- Stamp-Certify primitive
- Auto-Stamp hooks for model pull / eblet mint / marks earned / crown cosign
- Mesh diff protocol (Merkle-path exchange)
- "My IP Ledger" UI tab
- v0.5.13 (or later) installer build
- Firebase deploy
- 4-curl verification
- 2-3 canon eblet mints at I12 close (`canon_local_ip_ledger_schema_v1_bp087+`, `canon_mesh_diff_merkle_path_exchange_protocol_bp087+`, `canon_ring_bearer_keypair_os_keychain_storage_bp087+`)

NOT pre-authorized:
- Founder signature key derivation method changes
- Storage in Supabase instead of local-first (the LOCAL-FIRST architecture is the entire point of this canon — do NOT route through Supabase)
- Removing any composition with existing canon listed in §2

---

## §5 — Return format

Knight yoke return SHALL contain:
1. Schema migration / file format chosen + rationale
2. Ring Bearer keypair generation code path + OS keychain integration
3. Stamp-Certify primitive signature + sample stamped entry
4. Auto-Stamp hook list (which event types trigger Stamps)
5. Mesh diff protocol description + Merkle bisection algorithm reference
6. "My IP Ledger" UI screenshot or wireframe
7. v0.5.13 installer SHA512 + size + commit hash
8. 4-curl-check verbatim from both domains
9. ISO-8601 UTC timestamps for each milestone
10. Drift catches surfaced inline per BP053
11. Canon eblet mint queue

---

## §6 — Priority + sequencing

**HELD** until THUNDERCLAP-ζ receipt has landed and Founder has ratified it (A16). Do NOT preempt MAMBA-ζ — the empirical-proof event is the immediate gate.

After THUNDERCLAP ratify:
1. Bishop opens I12 (this yoke) to Knight
2. Knight ships v0.5.13 with the Ledger primitive + Stamp + mesh diff + UI
3. Auto_update broadcast → fleet receives v0.5.13
4. Smoke test: M0 stamps gemma4:12b → mesh diff propagates to all peers → quorum count = 5
5. PROV_23 patent claim group draft authored (Bishop-side)
6. End-of-cycle ratify

---

— Bishop · BP087 · 🌊⚓ · *The IP Ledger is the backbone. The mesh is the backup. The Ring Bearer carries the receipt.*
