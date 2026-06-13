# Knight Wake-Up — BP080 · FIX-5 · v0.1.47 P0 Crash · caithedral-core exports map
**Issued:** 2026-06-11 · Bishop · BP080
**Hard binding: use Sonnet 4.6 SEGs for ALL work.**

---

Knight —

P0 crash on v0.1.47 clean install. Founder is down. Fix it now. Use segs — three Sonnet 4.6 SEGs, fan-out immediately.

**Crash (verbatim):**
```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './dns/wan_soccerball_address'
is not defined by "exports" in
C:\Program Files\Mnemosyne\MnemosyneC\resources\app.asar\node_modules\caithedr...\package.json
```

**Root cause:** `caithedral-core/package.json` `exports` map is missing the `./dns/wan_soccerball_address` subpath. SEG-WAN-2 (commits a29f033 / 514da1f / a431e3a) wired this subpath into the renderer but never updated exports. Dev mode is loose; packaged Electron under strict ESM exports enforcement crashes at startup. Class-of-bug: source-only verify missed it. Runtime evidence is mandatory per [[feedback_actual_runtime_verify_for_runtime_bugs_bp078]].

---

## SEG-V0147-FIX-5-EXPORTS (Sonnet 4.6)

1. Locate `caithedral-core/package.json`.
2. Add to `exports` map: `"./dns/wan_soccerball_address": "./dist/dns/wan_soccerball_address.js"` — verify the compiled output path is correct first.
3. Audit ALL `from 'caithedral-core/` imports in renderer + main. Add every missing subpath to exports. Do not patch just the one that crashed — find them all now.

## SEG-V0147-FIX-5-REBUILD (Sonnet 4.6)

1. Rebuild `caithedral-core` after exports map update.
2. Run `npm run dist:win` — full packaged build.
3. Confirm both assertions pass: ollama bundled + vcredist + floor model present.
4. Record new SHA-256 and SHA-512.

## SEG-V0147-FIX-5-RUNTIME-VERIFY (Sonnet 4.6)

Boot the rebuilt packaged installer in a clean Windows context. Mandatory 5-capture evidence bundle — do NOT mark complete without all five:

- **(a)** Installer DetailPrint confirms VC++ redistributable step ran
- **(b)** Main window open, title bar showing "MnemosyneC" (not "Mnemosyne")
- **(c)** AI responds to a sent chat message in the renderer
- **(d)** DevTools console clean — zero `ERR_PACKAGE_PATH_NOT_EXPORTED` errors
- **(e)** Diagnostic log shows `BUNDLED_SPAWN`

You do NOT self-stamp GREEN. Return the 5 captures in the Yoke. Bishop ratifies.

---

## DRAFT RELEASE — DELETE BEFORE RE-STAGING

The current DRAFT GitHub release at:
`https://github.com/Upekrithen/LianaBanyanPlatform/releases/tag/untagged-7ef6590150119232e856`

...is the known-crashing v0.1.47 build. **DELETE or relabel it before re-staging anything.** Do NOT leave a broken draft live. Re-stage a new DRAFT only after the 5 runtime captures are in hand. Do NOT publish — that is Founder ratify.

---

## Yoke-return

Append results to `KNIGHT_BISHOP_MESSAGES.md` (MCP fallback canon). Include: exports diff, rebuild SHA-256/SHA-512, and all 5 runtime captures. Flag if any capture is missing — partial verify = not done.

**All SEGs Sonnet 4.6. No exceptions.**
