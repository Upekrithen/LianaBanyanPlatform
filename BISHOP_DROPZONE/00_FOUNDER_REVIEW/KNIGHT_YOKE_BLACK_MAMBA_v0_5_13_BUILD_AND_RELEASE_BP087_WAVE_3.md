# BLACK MAMBA · YOKE 1 · BP087 WAVE 3
# v0.5.13 BUILD AND RELEASE
# "The last manual install ever."

---

## §0 BRICK WALL PRE-AUTHORIZED SCOPE

Brick Wall pre-authorized scope verbatim:
- Apply 1-line heartbeat version patch to wan-relay-publish/index.ts line 220
- Bump package.json from 0.5.12 to 0.5.13
- Write CHANGELOG entry for 0.5.13
- Build dist:win installer
- Compute sha512 + size
- Copy installer to Cephas-hugo/static/download/
- Regenerate latest.yml
- Run Hugo build
- Firebase deploy to mnemosynec.ai and mnemosynec.org
- Run 4-curl green check on both domains

NO scope beyond this list without Founder verbal ratify.

---

## §1 CONTEXT

v0.5.12 landed all Wave 2 fixes but shipped with one outstanding defect: the heartbeat peer-presence payload does not propagate the version field from capabilities. This means Fleet peers running v0.5.12 show as version-unknown in health_snapshot output, which blocks the homogeneity check that gates Trial 02. The fix is a single line in wan-relay-publish/index.ts at line 220.

v0.5.13 packages that patch forward alongside all v0.5.12 fixes. The significance is architectural: once version is visible in heartbeat, the auto-update MIC broadcast can target peers by version string. This closes the "manual install round" as a permanent pattern. The tagline is earned: after this build, future versions push themselves.

---

## §2 SEG FAN-OUT

use segs Sonnet 4.6 verbatim

**SEG-A1 · Heartbeat patch + tsc clean check + commit**

File: C:\Users\Administrator\Documents\LianaBanyanPlatform\wan-relay-publish\index.ts

At line 220, after the presencePayload assembly block, add exactly:

```typescript
if (roll.capabilities?.version) presencePayload.version = roll.capabilities.version;
```

Then:
1. Run `npx tsc --noEmit` from the wan-relay-publish directory. Gate: zero errors.
2. Open C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json and bump "version" from "0.5.12" to "0.5.13".
3. Write CHANGELOG entry: "## [0.5.13] - 2026-06-20 / Heartbeat version propagation: presencePayload now carries capabilities.version for homogeneity-gated health_snapshot and auto-update targeting."
4. `git add wan-relay-publish/index.ts package.json CHANGELOG.md`
5. `git commit -m "v0.5.13: heartbeat version propagation"`
6. Return: commit SHA + tsc exit code + line 220 verbatim after patch.

**SEG-A2 · Build dist:win + verify installer**

Depends on SEG-A1 commit GREEN.

1. From C:\Users\Administrator\Documents\LianaBanyanPlatform run `npm run dist:win`.
2. Gate: build exits 0.
3. Locate installer in dist/ directory. Expected pattern: MnemosyneC-Setup-0.5.13.exe or similar.
4. Compute sha512: `certutil -hashfile <installer_path> SHA512` (Windows) or `sha512sum` if available.
5. Record file size in bytes.
6. Return: installer path + sha512 + size_bytes + build exit code.

**SEG-A3 · Deploy chain + 4-curl check**

Depends on SEG-A2 installer GREEN.

1. Copy installer from dist/ to C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\static\download\MnemosyneC-Setup-0.5.13.exe
2. Regenerate latest.yml at C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\static\download\latest.yml with fields: version: 0.5.13, path: MnemosyneC-Setup-0.5.13.exe, sha512: <from SEG-A2>, size: <from SEG-A2>.
3. From Cephas-hugo directory run `hugo` to build static site.
4. Run `firebase deploy --only hosting:mnemosynec-ai` then `firebase deploy --only hosting:mnemosynec-org`.
5. 4-curl check:
   - `curl -sI https://mnemosynec.ai/download/latest.yml | head -5`
   - `curl -sI https://mnemosynec.org/download/latest.yml | head -5`
   - `curl -s https://mnemosynec.ai/download/latest.yml | grep version`
   - `curl -s https://mnemosynec.org/download/latest.yml | grep version`
6. Gate: all 4 curls return HTTP 200 + version: 0.5.13.
7. Return: 4-curl output verbatim + both deploy exit codes.

---

## §3 FILE TARGETS

Patch target:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\wan-relay-publish\index.ts (line 220, 1-line add)

Version bump:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\package.json

Changelog:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\CHANGELOG.md

Deploy artifacts:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\static\download\MnemosyneC-Setup-0.5.13.exe
- C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas-hugo\static\download\latest.yml

---

## §4 ACCEPTANCE GATES

Gate 1: tsc --noEmit exits 0 after heartbeat patch (SEG-A1).
Gate 2: dist:win build exits 0, installer file exists on disk (SEG-A2).
Gate 3: sha512 computed and matches installer file (SEG-A2).
Gate 4: latest.yml on disk contains version: 0.5.13 (SEG-A3).
Gate 5: curl https://mnemosynec.ai/download/latest.yml returns HTTP 200 + version: 0.5.13 (SEG-A3).
Gate 6: curl https://mnemosynec.org/download/latest.yml returns HTTP 200 + version: 0.5.13 (SEG-A3).
Gate 7: installer download link resolves (curl -sI the .exe URL returns HTTP 200 or 302, not 404) (SEG-A3).

All 7 gates GREEN before Yoke 1 is declared closed.

---

## §5 DRIFT SURFACE PROTOCOL (BP053 INLINE)

If tsc exits non-zero after the 1-line patch: STOP. Do not suppress errors. Return exact tsc output to Founder. Do not attempt to fix TypeScript errors beyond the authorized single line.

If dist:win build fails: return full npm error output. Do not retry with flags that skip validation.

If firebase deploy fails on one domain: deploy the succeeding domain, report the failing domain error verbatim. Do not declare the yoke GREEN until both succeed.

If 4-curl shows version other than 0.5.13: Hugo cache issue or deploy did not complete. Return curl output verbatim. Do not mark GREEN.

Drift = immediate surface to Founder. No silent workarounds.

---

## §6 COMPOSITION

Related canon slugs:
- canon_lan_as_wan_test_mode_4_machine_mesh_bp085 (WAN roundtrip requirement for mesh test gating)
- canon_mic_machine_in_charge_naming_lock_bp086 (MIC broadcast auto-update targeting uses version field)
- canon_persistent_active_memory_crown_jewel_bp085 (v0.5.13 ships heartbeat for Mnemo fleet health)
- canon_free_with_substrate_flagship_inequality_trinity_bp085 (v0.5.13 enables Trial 02 which produces trinity receipt)

---

## §7 RETURN TEMPLATE (BP053 §4)

Knight returns one block per SEG:

```
YOKE 1 RETURN · BP087 WAVE 3
SEG-A1: [GREEN|RED] · commit SHA: ______ · tsc exit: ______ · line 220 verbatim: ______
SEG-A2: [GREEN|RED] · installer path: ______ · sha512: ______ · size_bytes: ______ · build exit: ______
SEG-A3: [GREEN|RED] · curl-1: ______ · curl-2: ______ · curl-3: ______ · curl-4: ______ · deploy exits: ______
YOKE 1 STATUS: [GREEN|AMBER|RED]
AMBER/RED NOTES: ______
```

---

## §8 STATUTES BINDING HEADER

§2 IMMUTABLES: Do not alter relay topology, Supabase schema, or auth flows. The 1-line heartbeat patch is the ONLY code change in this yoke outside version/changelog housekeeping.

§3 SONNET 4.6 VERBATIM: use segs Sonnet 4.6 verbatim. All SEG workers run Sonnet 4.6. No model substitution.

§4 ABSOLUTE PATHS: All file operations use absolute paths as listed in §3. No relative paths.

§14 GADGET-FIRST: Every gate check uses a runnable command (tsc, certutil, curl, firebase). No human-eyeball assertions.

§15 BISHOP-DIRECT-SUPABASE: This yoke contains no Supabase migrations. If a migration need is discovered during execution, Knight ships a .sql file to BISHOP_DROPZONE and halts. Bishop applies via psql. Knight does not touch Supabase directly.
