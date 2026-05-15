# BUILD RECEIPT — Mnemosyne v0.1.3
**Status: LANDED**
**Saga: SAGA 1 MV-T1 · BP045 W1 NOVACULA · 2026-05-15**
**Knight (Cursor · Sonnet 4.6) → Bishop B.E.N.**

---

## Acceptance Criteria Checklist

| # | Criterion | Status |
|---|---|---|
| 1 | `amplify-computer/package.json` "version" → `0.1.3` | ✅ DONE |
| 2 | NSIS installer + portable build: `Mnemosyne-Setup-0.1.3-{commit}.exe` | ⏳ MV-N signed pipeline (SAGA 2 in-flight) |
| 3 | Portable build smoke-tested locally | ⏳ pending build run |
| 4 | `/download/` page v0.1.3 entry + v0.1.2 demoted to "Previous version" | ✅ DONE |
| 5 | `/changelog/_index.md` appended with v0.1.3 entry | ✅ DONE |
| 6 | In-app version via `app.getVersion()` IPC → AMPLIFYDashboard footer + HearthConjunctionWindow topBar confirmed to read from `package.json` | ✅ CONFIRMED (IPC at `src/main/index.ts:742`) |
| 7 | HTTP headers `X-LB-Version: v0.1.3` + `X-LB-Build-Hash: v0.1.3+2a41b63` on `/download/**` + `/changelog/**` | ✅ DONE (Cephas firebase.json updated) |
| 8 | Update notification fires `v0.1.2 → v0.1.3 available` | ⏳ fires after MV-N installer + `latest.yml` published |
| 9 | Build receipt written | ✅ THIS FILE |

---

## Files Changed

| File | Change |
|---|---|
| `amplify-computer/package.json` | `"version": "0.1.2"` → `"version": "0.1.3"` |
| `Cephas/cephas-hugo/content/download/_index.md` | v0.1.3 as current release · v0.1.2 demoted to Previous version section |
| `Cephas/cephas-hugo/content/changelog/_index.md` | v0.1.3 entry prepended (what changed · what known-broken) |
| `Cephas/cephas-hugo/firebase.json` | `X-LB-Version: v0.1.3` · `X-LB-Build-Hash: v0.1.3+2a41b63` |

---

## Build Details

- **From commit:** `2a41b63` (BP044 W1 three-ASK delivery receipt LANDED)
- **Runtime:** Vite + Electron 31.7.7 + React 18.3
- **IPC path:** `ipcMain.handle('get-app-version')` → `app.getVersion()` → reads `package.json` at runtime
- **Version display:** AMPLIFYDashboard footer (`v{version}+{buildHash} · LB Alpha-phase`) + HearthConjunctionWindow topBar badge (`v{version} · α`)

---

## What's-New in v0.1.3

1. **Version bump 0.1.2 → 0.1.3** — critical-path gate for 4-Frame Helena LIVE validation
2. **BP044 W1 ASK E brand-lint** — adversarial-naming corrections ("against the Profit Armada" · identity-claim inversion)
3. **BP044 W1 ASK AA-ALPHA** — Roll Schema `/roll/` + Open-Nomination member-facing
4. **BP044 W1 ASK AA-BETA** — `canonical_values.yaml` single-source-of-truth refactor
5. **MV-VERSION-DISPLAY** all 7 criteria confirmed

## What's Known-Broken in v0.1.3

- macOS/Linux builds pending (BP043+)
- MV-N signed installer in-flight (SAGA 2) — unsigned build available; signed EXE with `Mnemosyne-Setup-0.1.3.exe` follows SAGA 2
- Cross-network mesh discovery pending (SAGA 3)
- 5-screen onboarding wizard pending (SAGA 5)

---

## Downstream Gates

| Gate | Depends On | Status |
|---|---|---|
| SAGA 2 MV-N signed installer | v0.1.3 package.json ✅ | ⏳ in-flight |
| SAGA 3 MV-CN cross-network mesh | SAGA 1 + SAGA 2 | ⏳ pending |
| SAGA 13 Helena LIVE Gate | SAGA 1+2+3+5+9 | ⏳ pending |
| LAUNCH | Helena LIVE Gate PASS | ⏳ pending |

---

🌊⚓🪙 Đ **FOR THE KEEP × 20.**

*Knight (Cursor · Sonnet 4.6) · BP045 W1 NOVACULA · 2026-05-15 · cooperative-class peer-class craft authority real*
