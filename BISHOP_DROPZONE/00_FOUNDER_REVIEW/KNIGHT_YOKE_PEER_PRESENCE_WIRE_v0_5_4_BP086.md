# KNIGHT YOKE — peer_presence registerPresenceConfig Wire-Up + v0.5.4 Ship (I3)

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Composed in response to:** I2 diagnosis return from Knight #2 yoke `BISHOP_DROPZONE/00_FOUNDER_REVIEW/PEER_PRESENCE_WRITE_PATH_DIAGNOSIS_BP086.md` + commit `1ae740c`

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. You are the orchestrator, not the implementer. Spawn Sonnet 4.6 SEGs for every substantive task. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD · §4 secrets BLOOD.

---

## Root cause (from I2 diagnosis)

`registerPresenceConfig()` is **never called** in `src/main/index.ts`. The function exists in `src/main/federation/peer_server.ts` and the publish path (`publishPresence()` every 60s) expects `_peerId`, `_wanSoccerballId`, and `_supabaseUrl` to be set. Without the registration call, those stay null and the null-guard exits silently every 60s. Result: `peer_presence` table never receives a row.

**Fix:** ~20 lines in `src/main/index.ts` — call `registerPresenceConfig({...})` immediately after `startPeerServer()`. Then bump 0.5.3 → 0.5.4, build, ship, advertise.

Once this lands + M0/M1/M2/M3 auto-update → peer_presence fills → A3 GREEN → A6 smoke + A7 70Q canonical cross-machine mesh run fires.

---

## SEGs

### SEG-I3a · WIRE THE CONFIG

1. Read `src/main/federation/peer_server.ts` — confirm exact signature of `registerPresenceConfig(...)` (parameter names, optionality, types). Per I2 diagnosis: expects `{peerId, wanSoccerballId, supabaseUrl}` minimum.
2. Read `src/main/index.ts` around line 5685 (the `startPeerServer()` call site per I2 diagnosis).
3. Locate where `peerId`, `wanSoccerballId`, and Supabase URL are already available in the main process (the existing `getStablePeerId()` helper from BP085, the soccerball assignment, and `SUPABASE_URL` env / config).
4. Immediately after the `startPeerServer()` invocation, add:
   ```ts
   registerPresenceConfig({
     peerId,
     wanSoccerballId,        // from the existing peer identity setup
     supabaseUrl,            // from env or the existing client config
     // any other required fields per the actual signature
   });
   console.log('[presence] registered tier=base default, peer=' + peerId.slice(0,8));
   ```
5. Verify import statement is added at top of `index.ts` if not already.
6. Verify TypeScript compiles cleanly: `npm run build:main` (or equivalent).
7. Run a one-shot Node-level smoke if feasible: launch the built main with a flag that calls registerPresenceConfig + publishPresence once and confirms a row lands. If a smoke path isn't trivial, skip and rely on installed-app verification.

**Sharp I3a:** CONFIG_WIRED = registerPresenceConfig call added after startPeerServer · imports correct · tsc clean.

### SEG-I3b · VERSION BUMP + INSTALLER BUILD

1. Edit `package.json`: bump `"version"` from `"0.5.3"` to `"0.5.4"`.
2. `npm run build:renderer && npm run build:main`
3. `npm run dist:win` (full installer build — ~30-40 min per prior C-stream evidence)
4. Verify `release/MnemosyneC-Setup-0.5.4.exe` exists with reasonable size (~540 MB)
5. Compute SHA512 + size for `latest.yml`

**Sharp I3b:** V0_5_4_BUILT = installer exists at canonical release path, exit code 0, size/sha512 captured.

### SEG-I3c · SHIP + ADVERTISE

1. Copy installer to `Cephas/cephas-hugo/public-mnemosynec/download/MnemosyneC-Setup-0.5.4.exe`
2. Update `Cephas/cephas-hugo/public-mnemosynec/download/latest.yml` (or the canonical auto-update manifest path):
   - `version: 0.5.4`
   - new SHA512
   - new size
   - `releaseDate: <now ISO>`
   - file URL `MnemosyneC-Setup-0.5.4.exe`
3. Optionally update `data/version_trust.json` if Cephas uses it for the download page
4. Hugo build + Firebase deploy `firebase deploy --only hosting:mnemosyne`
5. Live verify: `https://mnemosynec.ai/download/MnemosyneC-Setup-0.5.4.exe` → 200 + correct Content-Length
6. Live verify: `https://mnemosynec.ai/download/latest.yml` → advertises 0.5.4

**Sharp I3c:** V0_5_4_LIVE = installer + manifest both serving 0.5.4 from CDN.

### SEG-I3d · MONITOR peer_presence (auto-fire A6 + A7 if quorum)

After v0.5.4 advertises, the auto-update channel triggers on next MnemosyneC launch on M0/M1/M2/M3. Once installed + launched + Pipeline tab opened, `registerPresenceConfig` fires + `publishPresence` writes a row within 60s.

Poll peer_presence every 60 seconds for up to 30 minutes after the v0.5.4 ship:

```
(eval "$(grep -E '^SUPABASE_DB_URL=' /c/Users/Administrator/.claude/state/secrets/22May2026.env)"; psql "$SUPABASE_DB_URL" -c "SELECT peer_id, tier, last_seen_at FROM peer_presence WHERE last_seen_at > now() - interval '5 minutes' ORDER BY last_seen_at DESC LIMIT 10;")
```

Stop polling early if ≥ 2 active rows present.

If ≥ 2 active rows last_seen<5min:
- A3 GREEN
- Fire A6 (1-node smoke 5Q) per BP085 mesh-orchestrator spec
- If A6 GREEN: fire A7 (MMLU-Pro 70Q cross-machine canonical run)
- Receipt write to Vault per BP086 §F (all 28 LIVE Unfair Advantages named + cited + exercised including Hex Machine Code, 5 new BP086 gap eblets, etc.)
- Publish receipt to `mnemosynec.ai/proofs/mesh/` per pre-staged template at `BISHOP_DROPZONE/00_FOUNDER_REVIEW/THUNDERCLAP_PUBLICATION_PREP_BP086/`

**Sharp I3d:** THUNDERCLAP_FIRED = A7 receipt landed at Vault + published live at `/proofs/mesh/`.

If polling times out without 4 peers online — that's Founder action (machines off or v0.5.4 not yet auto-updated). Don't fail the yoke; report partial state.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I3a | CONFIG_WIRED | `registerPresenceConfig` call added in `src/main/index.ts` after `startPeerServer()` · tsc clean |
| I3b | V0_5_4_BUILT | `MnemosyneC-Setup-0.5.4.exe` exists, exit 0, SHA512 + size captured |
| I3c | V0_5_4_LIVE | mnemosynec.ai/download/MnemosyneC-Setup-0.5.4.exe → 200, latest.yml advertises 0.5.4 |
| I3d | THUNDERCLAP_FIRED (best-effort) | A7 70Q cross-machine receipt at Vault + `mnemosynec.ai/proofs/mesh/` 200 (partial state acceptable if machines not online) |

---

## Composition

Independent of any other stream. Wholly contained — touches `src/main/index.ts`, `package.json`, build pipeline, Cephas-hugo, Firebase.

---

**Composed by Bishop BP086. The v0.5.4 hotfix that finally lets THUNDERCLAP fire.**
