# KNIGHT YOKE · I10 · ACK CHANNEL DIAGNOSTIC · BP087

**From:** Bishop · BP087 · §14 catch
**To:** Knight
**Class:** Diagnostic before BLACK MAMBA — gates MAMBA dispatch
**Model:** Sonnet 4.6 verbatim (Statutes §3) · **use segs** on every dispatch
**Priority:** BLOCKS BLACK MAMBA · BLOCKS THUNDERCLAP · BLOCKS PATH X

---

## §0 — What just happened

Founder relaunched all 5 peers after I9.5 deployed v0.5.8 to both download domains (independently curl-verified — `latest.yml` v0.5.8, installer 200 + 539,916,017 bytes on both `mnemosynec.ai` and `mnemosynec.org`).

Bishop fired noop_test as a 60-second litmus before shipping the BLACK MAMBA:

```
node "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mic-broadcast\issue.mjs" \
  --type=noop_test --version=0.5.8 --watch --poll-until=5 --timeout-s=120
```

Result: broadcast ID `eb3a1bd0-f23e-4d73-ad9e-373b71684932` issued at `2026-06-18T23:48:53.614553+00:00`. Polled for full 120s. **0/5 acks. Identical symptom to the v0.5.7 PATH X failure.**

The litmus existed precisely to catch this before the MAMBA started burning Knight time on top of a dead channel. Catch landed in time.

---

## §1 — What this could mean (no speculation past evidence)

Three hypothesis classes, in order of likelihood, gadget-verifiable:

**H1 · Process not actually upgraded.** Auto-updater downloaded v0.5.8 but the running MnemosyneC process is still v0.5.7 (the original system-tray process never fully exited, the new install is on disk but the new code never executed, or the auto-updater staged-but-didn't-restart).

**H2 · Listener regression in v0.5.8.** Peers ARE on v0.5.8 code, but the I9 fix (replacing Realtime subscription with 5s REST polling) didn't actually apply to the `fleet_broadcast` listener — only to `help_messages`. I9 note in Knight's prior return: *"fleet_broadcast note: startMicBroadcastListener was already using REST polling from a prior session — no change needed there."* That claim needs gadget-verification — if `startMicBroadcastListener` was using broken Realtime, not REST polling, the v0.5.8 fix never touched it.

**H3 · Ack-write path broken.** Listener IS polling and seeing the broadcast, but the ack INSERT is failing silently (RLS on `fleet_broadcast_ack` blocking anon-key inserts, schema mismatch, missing field, etc.).

DO NOT pick a hypothesis without empirical evidence. Test all three in parallel.

---

## §2 — Sharps (use segs — Sonnet 4.6)

### I10a · Peer version truth (H1 gate)

- Query `peer_presence` table for all 5 peers' `capabilities.version` AS OF NOW.
- Compare to last-seen timestamp — if `last_seen_at` is within 60 seconds AND `version` is `0.5.8`, peer process is alive on v0.5.8.
- If `version` is still `0.5.7` for any peer → H1 confirmed for that peer; auto-updater bootstrap failed, peer needs manual install OR manual full process kill.
- Return: 5-row table {peer_id, host_label, version, last_seen_at, capabilities_blob}.

### I10b · Listener code path forensics (H2 gate)

- Open `src/main/index.ts` and confirm `startMicBroadcastListener` implementation as of commit `038b09d` (v0.5.8).
- Verify it uses REST polling on the `fleet_broadcast` table (NOT `.channel().subscribe()`).
- Confirm the polling interval, the table name, the broadcast_type filter, and the ack-write target table name.
- If `startMicBroadcastListener` was using Realtime in v0.5.7 and the I9 fix DID NOT touch it → H2 confirmed; the listener is still broken in v0.5.8.
- Return: copy-paste the actual `startMicBroadcastListener` function body verbatim.

### I10c · Ack-write probe (H3 gate)

- On the Founder's M0 machine, MANUALLY INSERT a row into `fleet_broadcast_ack` using the anon key the desktop listener would use:
  ```
  broadcast_id = eb3a1bd0-f23e-4d73-ad9e-373b71684932
  peer_id      = <M0's peer_id>
  ack_payload  = {"manual_probe": true, "i10c": true}
  ```
- If INSERT succeeds → ack-write path is open; the listener is the problem (H1 or H2).
- If INSERT fails with RLS error → H3 confirmed; ack-table RLS is blocking anon-key inserts; needs migration to allow anon INSERT-only.
- Return: the INSERT response (success row OR error message verbatim).

### I10d · Live process inspection on M0 (H1 deep)

- On Founder's M0, run: `Get-Process MnemosyneC` (PowerShell) — confirm there is ONE process (not zero, not two).
- Check process start time. Compare to the I9.5 deploy timestamp + Founder's relaunch confirmation timestamp.
- Inspect the executable path the process is running from — confirm it's the v0.5.8 binary (`C:\Users\Administrator\AppData\Local\Programs\MnemosyneC\MnemosyneC.exe` or wherever the installer placed v0.5.8).
- Optionally: query the process's loaded module list to confirm the v0.5.8 main bundle is loaded.
- Return: process count, PID, start time, exe path.

### I10e · Recovery decision tree (deliverable)

Based on I10a-d returns, produce a one-page recovery plan:

- **If H1:** which peers need re-install? Is there a hung old process? Should peers download v0.5.8 manually instead of via auto-updater? Does the auto-updater need a fix (separate Knight yoke I10.5)?
- **If H2:** what's the actual `startMicBroadcastListener` fix? v0.5.9 hotfix path. Time-to-fix estimate.
- **If H3:** what's the RLS migration? Time-to-deploy estimate. Note: this only affects acks, NOT the listener's read of broadcasts, so the listener may BE working — we just can't see it.

Return the recovery plan as I10's yoke-return. Bishop reads, Founder ratifies, Knight executes.

---

## §3 — What this means for the BLACK MAMBA

The BLACK MAMBA at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_YOKE_BLACK_MAMBA_THUNDERCLAP_100_FULL_WIRING_BP087.md` is **HELD** until I10 returns GREEN on the ack channel. The MAMBA's α-ζ streams ALL depend on mesh dispatches succeeding; wiring them on top of a dead ack channel is rope on sand.

The MAMBA is NOT cancelled. It's a 1-cycle hold for an honest channel.

Drift-as-we-go (`canon_fix_as_we_go_build_for_the_long_haul_always_convenient_immutables_bp053`): the I10 fix gets shipped FULLY before MAMBA fires. No half-fix. No queue.

---

## §4 — Bishop catch self-audit (Truth-Always)

The litmus test was the right discipline. Without it, the MAMBA would have shipped, Knight would have built α-ε for days, then MAMBA-ζ would have hit the same 0/5 ack at the unified fire — and we'd have spent days of build burn before discovering the channel is dead.

The 60-second probe cost: ~$0 + 120 seconds.
The catch: days of MAMBA burn avoided.

Composing canon eblet at I10 close: `canon_litmus_test_before_mamba_60_second_probe_catches_dead_channel_bp087.eblet.md` — pattern for every future BLACK MAMBA dispatch that depends on a live mesh channel.

---

## §5 — Statutes binding

- §2 IMMUTABLES — fix-as-we-go · build-for-the-long-haul · ALWAYS mint small canon eblet · 100%-read · fix-ONE-thing-FULLY-before-moving-on · Truth-Always at every claim
- §3 SEGs Sonnet 4.6 verbatim
- §4 absolute paths · PowerShell `;` · secrets blacklist
- §10 always-timestamp ISO-8601 UTC · Accuracy > Speed (BEDROCK)
- §12 Knight-direct (this yoke goes Knight, NOT Founder)
- §14 Bishop catch operationalized

---

## §6 — Return format

Knight yoke return SHALL contain:

1. I10a results: 5-row peer_presence snapshot (peer_id, version, last_seen_at)
2. I10b results: verbatim `startMicBroadcastListener` function body
3. I10c results: INSERT response (success OR error verbatim)
4. I10d results: M0 process inspection (count, PID, start time, exe path)
5. Hypothesis ratified: H1 / H2 / H3 / mixed
6. Recovery plan one-pager
7. Time-to-fix estimate
8. Any drift catches discovered while probing
9. ISO-8601 UTC timestamps for each probe

---

— Bishop · BP087 · 🌊⚓ · *Litmus first. Truth-Always. Always convenient.*
