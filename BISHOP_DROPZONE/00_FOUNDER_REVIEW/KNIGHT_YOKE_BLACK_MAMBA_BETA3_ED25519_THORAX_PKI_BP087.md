# KNIGHT YOKE -- BLACK MAMBA BETA3 -- ED25519 THORAX PKI -- BP087

## §0 Header

**Stream:** BLACK MAMBA beta3 -- Ed25519 Thorax PKI full wiring
**Session:** BP087
**Status at intake:** AMBER (structural fields present in peer_presence capabilities JSON; no actual keypair generation, no signing, no verification wired)
**Brick Wall pre-authorized scope (verbatim):**
- Generate Ed25519 keypair at first launch; persist via electron-store
- Write public_key_hex into peer_presence capabilities JSON column on peer register/update
- Sign every hex-mcode dispatch frame with private key (16-byte signature suffix appended)
- Verify signature on receive against sender's public_key_hex fetched from peer_presence
- Reject and log Thorax violation event if signature is invalid or missing
- Acceptance: 5/5 peers exchange keys + noop_test broadcast signs and verifies end-to-end

**Statutes binding this yoke:** §2 IMMUTABLES · §3 Sonnet 4.6 verbatim · §4 absolute paths only · §14 gadget-first before asking Founder · §15 Bishop-direct-Supabase (no SEG applies DB schema; SEGs ship .sql files only)

---

## §1 Context

Knight already landed BLACK MAMBA WAVE 1 at commit 80cd33a. MAMBA-alpha is GREEN. MAMBA-beta1, beta4, and beta7 are GREEN. MAMBA-beta3 was marked AMBER because the peer_presence capabilities JSON now carries a `public_key_hex` field stub but no actual Ed25519 key is ever generated, no frame is ever signed, and the receiver never checks any signature. The Thorax PKI layer is structurally plumbed but functionally inert.

The goal of this yoke is to complete beta3: every MnemosyneC peer generates a real Ed25519 keypair at first launch (stored in electron-store so it survives restarts), publishes the public key into peer_presence capabilities, signs outbound hex-mcode dispatch frames with a 16-byte signature suffix, and verifies inbound frames against the sender's published key. Invalid signatures produce a logged Thorax violation and the frame is dropped. When all 5 LAN-as-WAN peers pass noop_test with signing and verification active, beta3 flips GREEN and MAMBA-zeta becomes eligible to fire.

---

## §2 Required SEG Fan-out

Knight: **use segs Sonnet 4.6 verbatim** for ALL implementation work. Do not implement inline. Fan out immediately.

**WAVE 1 -- three parallel SEGs:**

**SEG-A: Keypair generation + electron-store persistence**
- Task: implement `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\thorax\ed25519_keypair.ts`
- Generate Ed25519 keypair using Node.js `crypto.generateKeyPairSync('ed25519', { publicKeyEncoding: { type: 'spki', format: 'der' }, privateKeyEncoding: { type: 'pkcs8', format: 'der' } })`
- Persist private_key_hex and public_key_hex in electron-store key `thorax_ed25519`
- On subsequent launches: load from store, do not regenerate
- Export: `getOrCreateKeypair(): { public_key_hex: string; private_key_hex: string }`
- No em-dashes. Absolute imports. TypeScript strict.

**SEG-B: Sign and verify utilities**
- Task: implement `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\thorax\sign_verify.ts`
- `signFrame(frameHex: string, private_key_hex: string): string` -- appends 16-byte Ed25519 signature (first 16 bytes of the 64-byte raw signature) as hex suffix; returns full signed frame hex
- `verifyFrame(signedFrameHex: string, public_key_hex: string): { valid: boolean; frameHex: string }` -- strips last 32 chars (16 bytes), reconstructs signature, verifies; returns validity flag and original frame
- Use `crypto.sign` / `crypto.verify` with `null` algorithm (Ed25519 handles internally)
- Export both functions; no side effects
- No em-dashes. Absolute imports. TypeScript strict.

**SEG-C: capabilities JSON extension + Thorax violation logger**
- Task: locate the peer_presence write path (where `capabilities` JSON is built before upsert) in `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` and inject `public_key_hex` from `getOrCreateKeypair()`
- Also locate the inbound frame receive handler and wire: call `verifyFrame`; if `valid === false`, insert a row into `thorax_violations` table with columns `(peer_id, frame_hex_prefix, violation_type, detected_at)` and drop the frame
- If `thorax_violations` table does not exist, add migration file `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120004_thorax_violations.sql` with the CREATE TABLE statement
- Knight: Bishop will apply migrations directly via psql -- your SEGs do NOT apply DB schema, only ship the .sql file
- No em-dashes.

**WAVE 2 -- one integration SEG (after WAVE 1 complete):**

**SEG-D: Wire sign on send + verify on receive in dispatch path**
- Task: locate the hex-mcode dispatch send path (outbound) and wrap frame with `signFrame` using local private key before transmission
- Locate receive/parse path and wrap with `verifyFrame` before any frame processing; gate on validity per SEG-C violation logger
- Confirm noop_test frame path is covered (noop is a broadcast frame and must be signed)
- Write a brief inline comment above each insertion point: `// MAMBA-beta3: Ed25519 sign` or `// MAMBA-beta3: Ed25519 verify`

---

## §3 File Targets

All paths absolute. Knight confirms these exist or creates them.

| Action | Absolute Path |
|--------|--------------|
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\thorax\ed25519_keypair.ts` |
| CREATE | `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\thorax\sign_verify.ts` |
| EDIT (capabilities injection) | Peer presence write path under `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (SEG-C locates exact file) |
| EDIT (dispatch send) | Hex-mcode outbound dispatch path under `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (SEG-D locates exact file) |
| EDIT (dispatch receive) | Inbound frame receive/parse path under `C:\Users\Administrator\Documents\LianaBanyanPlatform\src\main\` (SEG-D locates exact file) |
| CREATE (conditional) | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\supabase\migrations\20260619120004_thorax_violations.sql` |

---

## §4 Acceptance Gates

**gadget-first before asking Founder.** Run every gate via gadget before reporting back.

**Gate 1 -- keypair persists across restart:**
```
# Launch peer, check electron-store for thorax_ed25519 key
# Restart peer; confirm same public_key_hex loaded (no regeneration)
```

**Gate 2 -- public_key_hex appears in peer_presence capabilities:**
```sql
SELECT peer_id, capabilities->>'public_key_hex' AS pubkey
FROM peer_presence
WHERE last_seen > NOW() - INTERVAL '5 minutes'
ORDER BY last_seen DESC
LIMIT 10;
```
Expected: 5 rows each with a non-null 64-char hex string (32-byte Ed25519 public key = 64 hex chars).

**Gate 3 -- noop_test frame is signed (4-curl style):**
```
# Capture a noop broadcast frame from wire log
# Assert last 32 chars of frame hex are non-zero (signature suffix present)
# Assert frame length = original_length + 32 chars
```

**Gate 4 -- receiver verifies valid frame (GREEN):**
```
# Fire noop_test broadcast from M0
# On M1 receive log: assert "MAMBA-beta3 verify: VALID" or equivalent log line
# Zero Thorax violations in thorax_violations table after clean 5-peer noop_test
```

**Gate 5 -- receiver rejects tampered frame (RED correctly caught):**
```
# Manually corrupt last 32 chars of a captured frame
# Re-inject; assert thorax_violations table gains 1 row
# Assert frame is NOT processed past verification gate
```

**Gate 6 -- 5/5 peers exchange keys GREEN:**
```sql
SELECT COUNT(*) FROM peer_presence
WHERE capabilities->>'public_key_hex' IS NOT NULL
  AND last_seen > NOW() - INTERVAL '10 minutes';
```
Expected: 5

**Gate 7 -- beta3 flip check:**
All 6 gates pass. Knight logs MAMBA-beta3 GREEN in return template.

---

## §5 Drift Surface Protocol (BP053 inline)

If any SEG returns a result that conflicts with another SEG's output, Knight flags the conflict explicitly before merging. Knight does NOT silently resolve conflicts.

If a SEG cannot locate a file path (e.g. peer_presence write path or inbound frame receive handler), SEG reports the search result verbatim and Knight escalates to Founder with the exact file listing -- Knight does NOT guess or hallucinate a path.

If a gate fails, Knight reports the failure verbatim (error text, gate number, peer count) and does NOT mark beta3 GREEN. AMBER means at least one gate failed. RED means keypair generation or signing crashed.

No estimates in the return template. Empirical results only.

---

## §6 Composition with Prior Canons

- `canon_mic_stamped_user_approval_circle_of_influence_reciprocal_trust_bp086` -- MIC STAMPED canon: every broadcast Ed25519-signed by issuer; this yoke wires the signature layer that canon depends on
- `canon_lan_as_wan_test_mode_4_machine_mesh_bp085` -- all 5 peers routed via relay.lianabanyan.com; signature verification must work over WAN roundtrip, not LAN shortcut
- `canon_sock_puppets_stitchpunks_callable_substrate_workers_bp085` -- SEGs are Callable Substrate Workers dispatched by Knight
- `canon_every_knight_dispatch_and_paste_prompt_must_say_use_segs_bp063` -- use segs Sonnet 4.6 verbatim is mandatory per this canon

---

## §7 Return Template

Knight returns this block filled with empirical values only. No estimates.

```
MAMBA-beta3 Ed25519 Thorax PKI -- BP087 RETURN RECEIPT

Gate 1 keypair persist:          [ GREEN / AMBER / RED ] -- [observed: same pubkey Y/N]
Gate 2 pubkey in peer_presence:  [ GREEN / AMBER / RED ] -- [observed peer count: N/5]
Gate 3 noop_test frame signed:   [ GREEN / AMBER / RED ] -- [observed frame suffix: hex value]
Gate 4 valid frame verified:     [ GREEN / AMBER / RED ] -- [observed log line verbatim]
Gate 5 tampered frame rejected:  [ GREEN / AMBER / RED ] -- [observed thorax_violations rows: N]
Gate 6 5/5 peers exchange keys:  [ GREEN / AMBER / RED ] -- [observed SQL count: N]
Gate 7 beta3 status:             [ GREEN / AMBER / RED ]

Files created:
  [list with absolute paths + line counts]

Files edited:
  [list with absolute paths + diff summary]

Drift surface events:
  [any conflicts or escalations verbatim, or NONE]

Commit hash:
  [git commit hash after Knight commits, or PENDING]

MAMBA-beta3: [ GREEN / AMBER / RED ]
```

---

## §8 Statutes Binding Header (echoed)

- **§2 IMMUTABLES:** Do not alter foundational substrate primitives outside scoped targets above.
- **§3 Sonnet 4.6 verbatim:** All SEG dispatches use Sonnet 4.6 verbatim. No model substitution.
- **§4 Absolute paths:** Every file reference in SEG prompts uses absolute paths. No relative paths.
- **§14 gadget-first before asking Founder:** Run every acceptance gate via gadget. Report results empirically.
- **§15 Bishop-direct-Supabase:** Knight: Bishop will apply migrations directly via psql. Your SEGs do NOT apply DB schema. SEGs ship the .sql file only.
