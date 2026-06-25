# KNIGHT YOKE · v0.4.4 · `/download/` Tower of Peace + Kill Root-Redirect · BP084

**Session:** BP084 open
**Date:** 2026-06-15
**Bishop dispatched-to-Knight:** TRUE
**Founder ratify:** DIRECT verbatim — *"that stupid https://mnemosynec.ai/download/ page needs to NOT BE THAT WAY ANY MORE. We discussed what that download page should have, and ONLY have - before. Please make it that way right now. And stop AUTO redirecting to it from Mnemosynec.ai"*

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG dispatched in this yoke MUST pass `model: 'sonnet'`. Every Knight dispatch tool call must explicitly select Sonnet 4.6 pre-spawn. Yoke-return MUST report "Sonnet 4.6" verbatim per BP079 corrective canon. Zero Composer 2.5 contamination — BP081 BLOOD.

---

## Context

`/download/` currently serves the homepage Amnesia hero + a single green "Download for Windows v0.4.3" button (Founder screenshot 2026-06-15 18:57). That is **NOT** the Tower of Peace canon ratified at BP082.

The BP082 canon (`download_tower_of_peace_multi_version_catacombs_trust_accumulator_bp082`) requires `/download/` to be a **multi-version archive** with tier badges (🟢 STABLE / 🟡 LATEST / 🔵 HISTORICAL / 🔴 DEPRECATED), tier promotion rules, and a Catacombs trust accumulator that rolls install reports + verified eblets + zero-issue days into a per-version trust score.

The canon eblet was referenced in MEMORY.md but **never actually minted to disk** — SEG-0 mints it as part of this yoke.

Founder also reports auto-redirect from `mnemosynec.ai/` → `/download/`. No `redirects` rule exists in `firebase.json` per Sonnet 4.6 SEG read. Most likely the root and `/download/` are rendering the same content path (or the user's browser is caching the prior visit). The fix: make `/download/` **visually distinct** from the homepage hero — the perceived redirect resolves the moment the page looks different.

**18 .exe files** are physically present at `Cephas\cephas-hugo\static\download\`:
- v0.1.60 / v0.1.61 / v0.1.62
- v0.2.0 / v0.2.1 / v0.2.2
- v0.3.0 / v0.3.1 / v0.3.2 / v0.3.3 / v0.3.4 / v0.3.5 / v0.3.6 / v0.3.8 / v0.3.9 / v0.3.10
- v0.4.0 / v0.4.3

Tower of Peace populates directly from this disk inventory.

---

## SEG-0 — Mint the canon eblet (Sonnet 4.6 SEG)

**Path:** `C:\Users\Administrator\Documents\Asteroid-ProofVault\state\eblets\CANON\download_tower_of_peace_multi_version_catacombs_trust_accumulator_bp082.eblet.md`

Mint the BP082 canon to disk verbatim. Frontmatter `metadata.type: canon`, `metadata.session: BP082`, `metadata.minted_at: BP084_2026-06-15`. Body: tier definitions, promotion rules (10 installs + 30d zero issues + 3 verified eblets → promote), trust score formula (defined below in SEG-3), Marks awards (2/install report, 3/thread capture, 10/issue-triggers-demotion, 25/Stone-Tablet-truth bonus). Link `[[guild-node-voting-thresholds-founder-seed-proposal-bp082]]` and `[[canon-mic-federated-andon-the-diagnosis-just-add-salt-bp083]]`.

---

## SEG-1 — Replace `/download/` layout with Tower of Peace (Sonnet 4.6 SEG)

**File:** `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\download\list.html`

Delete the BP067-era `list.html.tmp.44256.7f3b041b1821` template. Write a fresh `list.html` Tower of Peace layout:

**Header:**
- Short title: **"Tower of Peace"** (Founder-chosen name)
- Subtitle: *"Every version, every receipt. Pick the rung that fits."*
- NO Amnesia hero. NO 4-paragraph body. NO single green button.

**Top section — "Right now":**
- One-row callout: 🟡 **LATEST · v0.4.3** + download button + sha256 + byte size + release date
- Below that, one-row callout: 🟢 **STABLE · v0.1.60** + download button + *"4 computers, Gemma working, Founder-attested"*

**Main table (the Tower itself, oldest at the bottom — bottom-up like a tower):**

| Tier | Version | Date | Trust score | Notes | Download |
|---|---|---|---|---|---|
| 🟡 LATEST | v0.4.3 | 2026-06-15 | (live count) | BP081 canon restored · hero revert | [Download .exe] |
| 🔵 HISTORICAL | v0.4.0 | … | … | MIC + Federated Andon + Just Add Salt | [Download] |
| 🔵 HISTORICAL | v0.3.10 | … | … | Triple-Pillar Ship | [Download] |
| … | … | … | … | … | … |
| 🟢 STABLE | v0.1.60 | … | … | 4-computer Gemma working · Founder-attested | [Download] |

Populate from disk inventory (the 18 .exe files listed in Context). Pull byte size from `Get-Item .Length`. SHA256 from existing `.sha256` files where present; compute and write `.sha256` for those missing.

**Visual style:** dense, tabular, library-of-versions feel. Matches "Tower" metaphor (vertical stack of rungs). Use Cephas typography but DO NOT reuse the homepage hero block.

**No horizontal scroll** (BP081 canon: NEVER SCROLL SIDEWAYS). Use responsive collapse — on mobile, table → stacked cards.

**Footer of page:** small "Try the GitHub mirror →" link per BP081 distribution canon. PRIMARY remains self-host (Firebase).

---

## SEG-2 — Kill the root-redirect (Sonnet 4.6 SEG)

**Files to audit + correct:**

1. `Cephas\cephas-hugo\firebase.json` — confirm zero redirect rules pointing `/` → `/download/`. If any cleanup tags exist, remove.
2. `Cephas\cephas-hugo\public-mnemosynec\index.html` (the deployed homepage Founder lands on at mnemosynec.ai) — verify it serves the **Amnesia hero** (BP081 verbatim restored at v0.4.3), NOT the same content as `/download/`. If they currently share a template, fork them.
3. `Cephas\cephas-hugo\content\_index.md` vs `content\download\_index.md` — verify root content is the Amnesia hero, /download/ content is JUST the Tower of Peace (no hero block at top).
4. Confirm no `<meta http-equiv="refresh">` and no `<script>window.location...</script>` redirect in either page.

**Truth-Always Sharp:** `curl -sI https://mnemosynec.ai/` returns `HTTP/1.1 200 OK` with body containing "Your AI has Amnesia" (verbatim BP081 hero). `curl -sI https://mnemosynec.ai/download/` returns `HTTP/1.1 200 OK` with body containing "Tower of Peace" and NOT containing "Your AI has Amnesia." Both literal 200 at first hop, no 302 chain.

---

## SEG-3 — Catacombs trust accumulator (Sonnet 4.6 SEG)

**Where:** `Cephas\cephas-hugo\data\version_trust.json` (build-time data file consumed by SEG-1 template)

**Trust score formula (canon-ready):**

```
trust_score = (verified_install_reports × 2)
            + (verified_eblets_minted_on_this_version × 1)
            + (zero_issue_days_since_release × 1)
            - (open_issue_reports × 10)
```

Initial seed:
- v0.4.3: 1 (Founder M0 install) + 0 + 0 = 1
- v0.1.60: 4 (Founder + 4-computer Gemma attest per BP082 canon) + (eblets if any tagged to v0.1.60) + (days since v0.1.60 release) = seeded high

Render trust score in the table cell. Hover tooltip shows formula breakdown.

**Promotion rules (display in collapsible "How do versions get promoted?" section at bottom of Tower):**
- 🟡 LATEST → 🟢 STABLE: 10 verified install reports + 30 days zero-issue + 3 verified eblets minted on this version
- 🔵 HISTORICAL → 🔴 DEPRECATED: critical bug confirmed and not fixable in this version
- 🟢 STABLE demotion: any P0 regression discovered

**Marks awards (display in "Earn Marks for this Tower" section):**
- +2 Marks: report a successful install (form on page)
- +3 Marks: capture a Discord/Reddit thread about this version → MnemosyneC Search → 📚 Save → eblet
- +10 Marks: report an issue that triggers a version demotion
- +25 Marks: Stone-Tablet-truth bonus (rare verified deep-canon contribution)

---

## SEG-4 — Wire mnemosynec.ai update banner (Sonnet 4.6 SEG)

If user has a prior version installed and arrives at mnemosynec.ai, show a small banner: *"You're on v0.X.X. Latest is v0.4.3. [See the Tower →]"* — the banner links to `/download/`, does NOT auto-redirect.

Detection: query the `X-LB-Version` header the desktop app injects on outbound requests (BP080 Squarespace+Firebase deploy canon documented this header pattern), OR a `?installed=v0.X.X` querystring the desktop app appends when it opens an external link.

If no detection signal, hide banner.

---

## SEG-5 — Deploy with BP080 4-Sharpening (Sonnet 4.6 SEG)

Use `deploy-atomic.ps1` from v0.4.3 (already fixed for PS5.1 ASCII compat per prior yoke close).

**Sharp 1 (mnemosynec.ai root):** `curl -sI https://mnemosynec.ai/` → HTTP/1.1 200 OK, body contains "Your AI has Amnesia."
**Sharp 2 (cephas.lianabanyan.com root):** `curl -sI https://cephas.lianabanyan.com/` → HTTP/1.1 200 OK, root content distinct from /download/.
**Sharp 3 (/download/ on mnemosynec.ai):** `curl -sI https://mnemosynec.ai/download/` → HTTP/1.1 200 OK, body contains "Tower of Peace", does NOT contain "Your AI has Amnesia."
**Sharp 4 (/download/ on cephas.lianabanyan.com):** same as Sharp 3 against cephas host.
**Sharp 5 (no 302):** all four Sharps must be HTTP 200 at FIRST HOP. Any 301/302 → HONEST RED.
**Sharp 6 (version count):** `grep -c "MnemosyneC-Setup" /download/index.html` returns ≥ 18 (all on-disk versions surfaced in the Tower).
**Sharp 7 (tier badges present):** body contains all four: 🟢 STABLE, 🟡 LATEST, 🔵 HISTORICAL, 🔴 DEPRECATED (or commented placeholder if no v is currently DEPRECATED).
**Sharp 8 (latest.yml consistency):** version in latest.yml == version shown as 🟡 LATEST in Tower body == v0.4.3.

**NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW.** If any Sharp returns 302 chain or stale body, mark HONEST RED, fix root cause, redeploy. BP083 standing order.

---

## Truth-Always discipline

- Every Sharp uses `curl -sI --max-time 30` (literal HTTP 200 at first hop, never trust a 302 chain).
- Yoke-return reports each Sharp's actual HTTP code + relevant body grep counts.
- If any Sharp is HONEST RED, report so — do NOT round up to YELLOW or claim "deployed."

---

## Yoke-return spec

Return file path: `BISHOP_DROPZONE\00_FOUNDER_REVIEW\YOKE_RETURN_v0_4_4_DOWNLOAD_TOWER_OF_PEACE_BP084.md`

Contents:
1. Model used (verbatim "Sonnet 4.6")
2. Each SEG status + commit SHA
3. All 8 Sharps with literal HTTP codes + body grep counts
4. Confirmation eblet was minted to canonical Vault path
5. Confirmation root vs /download/ are now visually distinct (screenshot of each ideal)
6. Any HONEST RED that was caught and how it was fixed

Send yoke-return pearl to Bishop via bridge per standing protocol.

---

## Bishop reminder

Bishop is orchestrator. Knight is implementer. Do NOT route src edits back through Bishop — implement in-Knight via Sonnet 4.6 SEGs and deploy.

Take the time to get it right. This is a canon-restoration yoke, not a stunt-deploy.

**FOR THE KEEP.**
