# MEMORY.md — Liana Banyan Platform
**KEYHOLE Refresh: BP055 W3 Close · 2026-05-24**
**Last updated by: Knight (Cursor · Sonnet 4.6)**

---

## §A — Identity & Mission

Platform: Liana Banyan Corporation (C-Corp)
Golden Key: "Help each other help ourselves"
Brand line: "Free to use. Better to join. Share and Save."
Founder: Jonathan Jones — Conductor-Class sole inventor, 53 yr, ARNG veteran, father of 8, 21 yr IT, 37 yr developing this system (1989-2026), chess top 0.4% globally (2080s rating), FAA Commercial Rotary Wing IFR.
Membership: $5/year

---

## §B — Canonical Numbers (single source of truth: `librarian-mcp/canonical_values.yaml`)

| Metric | Value | Source |
|---|---|---|
| Innovations | 2,270 | canonical_values.yaml — updated BP030 May 7, 2026 |
| Patent applications FILED | 19 provisional | Prov 18+19 filed 2026-05-11 BP036 |
| Prov 20 | IN QUEUE | 100-page expansion target, before July 10 |
| Formal claims | ~2,506 | Across 17 provs (Prov 18+19 pending audit) |
| Crown Jewels | 228 | — |
| Production systems | 36 | — |
| A&A Formals | Complete through #2262 (B100) | — |
| Membership | $5/year | — |
| Creator keeps | 83.3% | NEVER round to 83% |
| Platform margin | Cost + 20% | — |
| On $500 transaction | Creator/Worker gets $416.67 | — |

**Canon Eblets:**
- Pre-BP055: ~665
- End of W2: 705 (manifest-confirmed)
- Disk count at W3 close: 786 .md files in `CANON/`
- W3 target (manifest rows sealed): 750+

---

## §C — Economics

- Creator keeps: 83.3% (NOT 83%)
- Platform margin: Cost + 20%
- On $500 transaction: Creator or Worker gets $416.67
- Membership: $5/year

---

## §D — Legal

- Entity: LIANA BANYAN CORPORATION (C-Corp)
- USPTO status: 19 provisional applications FILED. Prov 20 in queue.
- 5 USPTO TEAS applications pending: Caithedral™, Mnemosyne™, Banyan Metric™, NotCents™, + 1 TBD. Target: before July 10.

---

## §E — Active Work (BP055 W3 Close · 2026-05-24)

**Session BP055 summary:**
- W1: 60-NOVACULI (60 SAGAs · 9 workers · 19.6 min)
- W2: 120-BROBDINGNAGIAN (120 SAGAs · 8 workers · ~18 min)
- W3: 240-GOLIATH (240 SAGAs · 13 workers · ~45-50 min est)
- Total: 420 SAGAs across 3 waves

**Current status:**
- v0.1.12 built and staged (Electron + Mnemosyne)
- Firebase deploy PENDING — Founder needs `firebase login --reauth`
- Show HN + social posts drafted, PENDING Founder review + send
- Launch verdict: CONDITIONAL GO

**Outstanding blockers (Founder actions):**
- firebase login --reauth (5 min — top priority)
- Williams letter: Variant A or B decision
- MScott letter: V1 or V2 decision
- Catechist R14-R28: fill decision column
- SSL.com escalation: confirm-send
- K.4 locality: NEEDS-FOUNDER

**Sunday launch GO conditions met:** D.2 README ✅ · D.6 GDPR ✅ · D.7 a11y ✅

**Next session:** BP056 Wednesday/Thursday window. W4 if geometric doubling: 480 SAGAs.

---

## §F — Canonical Origin Correction

**FOR-THE-KEEP origin:** BP041 (not BP054). `canon_for_the_keep_origin_correction_bp041.eblet.md` on disk.

---

## §G — Agents / Architecture

| Agent | Role | Model |
|---|---|---|
| Knight | Mechanic — Tech, code, deployment, data | Cursor Sonnet 4.6 |
| Bishop | Engineer — Letters, articles, communications | Claude Code Opus 4.7 |
| Pawn | Researcher — Legal review, compliance, QA | Perplexity |
| Rook | Patents, innovation extraction | — |
| Weaver | Loom-class | Gemini |
| Queen | Reserved | — |

**Bridge MCP:** DOWN as of BP055 W1. Fix A (package.json type:module) + Fix B (settings.json mcpServers) documented in `BRIDGE_REATTACH_DIAG_BP055.md`. Sprite is interim inter-agent comm layer.

**Spider/Sprite:** LIVE. Fingerprint: 91e87cf166189e2a. 5/5 basic tests PASS (W2 Tier C).

**Librarian MCP:** LIVE. user-librarian restarted by Founder BP055 W2.

**Cathedral scribes:**
- Knight: `librarian-mcp/stitchpunks/knight_cathedral/` (4 scribes)
- Pawn: `librarian-mcp/stitchpunks/pawn_cathedral/` (4 scribes, snapshot-delivered)

---

## §H — Key Disciplines (Binding All Agents)

1. **PowerShell `;` not `&&`** (Chocolate 1 — BLOOD class)
2. **Absolute paths always** (Chocolate 2 — SWEAT class)
3. **Latin alphabet a/b/c Founder-facing** (Chocolate 3 — SWEAT class)
4. **Greek α/β/γ internal-only** (corollary to Chocolate 3)
5. **Canon-inventory-before-mint:** Glob CANON/ before any new Eblet mint. Current count: 786 files.
6. **Path-B discipline:** parallel-Read session-open canons first tool batch
7. **Detective-first for canon search** (per AGENTS.md — never Grep for named concepts)
8. **Yoke = Bridge MCP** (currently DOWN — paste-relay via Founder)
9. **sha256 dual-write on every Eblet**
10. **Banyan Metric™ self-score per SAGA**

---

## §I — Deployment Commands

**Full deploy:**
```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\platform"; npm run build; firebase deploy --only hosting:main,hosting:dotcom,hosting:biz,hosting:org,hosting:net,hosting:the2ndsecond,hosting:hexisle,hosting:upekrithen -P default; cd "..\Cephas\cephas-hugo"; hugo --minify; firebase deploy
```

**If reauth needed:** `firebase login --reauth`

---

*FOR THE KEEP. 🌊⚓🪙 Đ*
