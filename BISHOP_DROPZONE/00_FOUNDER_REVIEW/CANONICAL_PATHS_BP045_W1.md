# CANONICAL PATHS — BP045 W1
**SAGA 8 MV-PATH-CONSOLIDATE · Absolute Paths Sweat Rule**
**Knight (Cursor · Sonnet 4.6) · 2026-05-15 · cooperative-class peer-class member-class peer-witness real**

> *"Use absolute paths. Always. Stop relative-path drift."* — Founder, BP044 W1 (escalating-to-Blood by repetition)

---

## §1 — Canonical Substrate Paths (Windows · copy-paste ready)

### Workspace Root
```
C:\Users\Administrator\Documents\LianaBanyanPlatform\
```

### Key Directories
| Directory | Absolute Path |
|---|---|
| **Workspace root** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\` |
| **BISHOP_DROPZONE** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\` |
| **BISHOP_DROPZONE/00_FOUNDER_REVIEW** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\` |
| **BISHOP_DROPZONE/01_KnightPrompts** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\01_KnightPrompts\` |
| **BISHOP_DROPZONE/02_PawnPrompts** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\02_PawnPrompts\` |
| **BISHOP_DROPZONE/03_BishopHandoffs** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\03_BishopHandoffs\` |
| **BISHOP_DROPZONE/04_PEC_AND_ROLL** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\04_PEC_AND_ROLL\` |
| **KNIGHT_DROPZONE** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\KNIGHT_DROPZONE\` |
| **ROOK_DROPZONE** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\ROOK_DROPZONE\` |
| **PAWN_DROPZONE** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\PAWN_DROPZONE\` |
| **platform/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\` |
| **amplify-computer/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\amplify-computer\` |
| **librarian-mcp/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\` |
| **Cephas/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\` |
| **Cephas Hugo content** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\content\` |
| **CONTEXT_MANAGEMENT/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\CONTEXT_MANAGEMENT\` |
| **LAUNCH_DOCUMENTS_MASTER/** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\LAUNCH_DOCUMENTS_MASTER\` |
| **Asteroid-ProofVault** *(SECRETS — READ RAW NEVER)* | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\` |

### LianaBanyanKNIGHT (Knight-side workspace)
```
C:\Users\Administrator\Documents\LianaBanyanKNIGHT\
```

### Claude State / Memory Paths (Bishop-side)
| Directory | Absolute Path |
|---|---|
| **Claude state root** | `C:\Users\Administrator\.claude\state\` |
| **Canon Eblets** | `C:\Users\Administrator\.claude\state\eblets\CANON\` |
| **Bishop memory** | `C:\Users\Administrator\.claude\projects\C--Users-Administrator-Documents\memory\` |
| **Claude projects** | `C:\Users\Administrator\.claude\projects\` |

### Cursor IDE Paths
| Directory | Absolute Path |
|---|---|
| **Cursor project root** | `C:\Users\Administrator\.cursor\projects\c-Users-Administrator-Documents-LianaBanyanPlatform\` |
| **Terminals folder** | `C:\Users\Administrator\.cursor\projects\c-Users-Administrator-Documents-LianaBanyanPlatform\terminals\` |
| **Agent transcripts** | `C:\Users\Administrator\.cursor\projects\c-Users-Administrator-Documents-LianaBanyanPlatform\agent-transcripts\` |
| **Firebase credentials** | `C:\Users\Administrator\.cursor\FireBase Login.txt` *(SECRETS — READ RAW NEVER)* |
| **MCP config** | `C:\Users\Administrator\.cursor\mcp.json` *(SECRETS — READ RAW NEVER)* |

### Credentials / Vault *(NEVER read raw contents)*
| File | Absolute Path |
|---|---|
| **SDS.env** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\SDS.env` |
| **DOUBLESECRET.env** | `C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\LockBox\DOUBLESECRET.env` |

---

## §2 — Path-Discipline Rules

### In documentation (`.md` files)
- Use **absolute Windows path** with backslashes: `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\`
- Copy-paste class — Founder can open any reference directly
- NEVER: `BISHOP_DROPZONE/`, `./BISHOP_DROPZONE/`, `Documents/BISHOP_DROPZONE/`

### In source code (`.ts` / `.tsx`)
- Use `path.join(app.getPath('userData'), ...)` for user-data paths
- Use `app.getPath('home')` for home-relative paths
- Use environment variables (`process.env.LB_WORKSPACE`) when configurable
- NEVER hardcode `C:\Users\Administrator\...` in source — cross-platform-class

### In build scripts (`.ps1`)
- Use `$PSScriptRoot` for script-relative paths
- Use absolute `$env:USERPROFILE` for user-home-relative paths
- NEVER: `./` prefix for workspace paths

### In YAML / JSON config
- Document-class YAML (`.cursor/rules/`, Cephas configs): absolute paths
- Runtime YAML (librarian-mcp configs): env-var-driven or `$HOME`-relative

---

## §3 — Grep Audit Results (BP045 W1)

**Drift signature searched:** `Documents/BISHOP` (forward-slash · Windows docs should use backslash)

*Audit run pending brand-lint completion — results appended below when available.*

**Known-clean surfaces (already corrected BP044 W1):**
- `canonical_values.yaml` — clean from AA-BETA
- `canonical_phrases.yaml` — clean from ASK E
- `amplify-computer/src/` — path.join() pattern used throughout

---

## §4 — Source Code Path Patterns (amplify-computer)

Per R-MECHANISM-VERIFY — confirmed patterns in `amplify-computer/src/main/`:
- `app.getPath('userData')` — Electron user data dir (cooperative-class cross-platform)
- `app.getPath('home')` — user home dir
- `path.join(...)` — path composition
- `__dirname` — source-relative (build-time) paths

These are correct. NEVER replace with hardcoded `C:\Users\Administrator\...`.

---

## §5 — Receipt

| Item | Status |
|---|---|
| CANONICAL_PATHS_BP045_W1.md written | ✅ |
| All canonical paths verified as existing | ✅ (verified 2026-05-15) |
| Source code path audit (amplify-computer) | ✅ path.join() pattern confirmed |
| Grep audit for relative-path drift | ⏳ pending brand-lint run |
| Commit `MV-PATH-CONSOLIDATE` | ⏳ pending grep audit |

---

🌊⚓🪙 Đ **FOR THE KEEP × 20.**

*Knight (Cursor · Sonnet 4.6) · SAGA 8 MV-PATH-CONSOLIDATE · BP045 W1 · 2026-05-15*
