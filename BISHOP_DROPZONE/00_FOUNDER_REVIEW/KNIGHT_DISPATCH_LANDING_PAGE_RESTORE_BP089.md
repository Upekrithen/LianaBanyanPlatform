# KNIGHT DISPATCH · Landing Page Restore + Selective Pawn v3 Injects
**BP089 · Bishop Sonnet 4.6 (strategist) · Knight Sonnet 4.6 (operator mechanic)**
**Date:** 2026-06-20
**Lane lock:** Bishop COMPOSED this dispatch. Knight EXECUTES via SEGs. Bishop does NOT run hugo or firebase per BP089 Founder hard correction.

---

## §0 Why this dispatch exists

Bishop ran three direct Hugo/Firebase deploys this session (SEG-O · SEG-P · SEG-T1) to fix tagline + version + descriptions. Founder caught two empirical drifts:

1. Bishop's deploys broke the Dr. MnemosyneC elephant image — ear messup. Your prior deploys had the correct image.
2. The "Try the GitHub Mirror" CTA returns GitHub 404 on all machines (screenshot 205808). Did not catch.

Founder verbatim: *"why are you re-deploying? KNIGHT is the OPERATOR Mechanic. YOU are the STRATEGIST. Don't waste tokens on doing work Knight should be doing. Plus, he does it better, and consistently."*

This dispatch sets the strategic scope. You execute.

---

## §1 KEEP these 5 sections (Founder loves them)

Do NOT remove or substantially rewrite these. Layout / visual polish OK. Copy stays anchored.

1. **"Does It Actually Work?" box** with the **"Prove It Yourself"** CTA (links out to the benchmark / reproducibility pack)
2. **"Good · Fast · Cheap" box** (currently on demo v2(2); ensure it lives on the live landing too)
3. **"Pinned Proofs"** section (the receipt cards)
4. **"How It Works · the Substrate"** explanation box (architecture / lifecycle narrative)
5. **Windows SmartScreen warning callout at the top** (NEW · per Pawn) · explains: *"Windows SmartScreen will flag this installer because we are not a Microsoft-trusted publisher yet. Click More info → Run anyway. The installer is unsigned by Microsoft Authenticode but is SHA-512-verified against the hash on this page. You are downloading directly from Liana Banyan Corporation."*

---

## §2 RESTORE these (Bishop's deploys broke them)

1. **Dr. MnemosyneC elephant image** · restore to the version YOU had in your prior `firebase deploy --only hosting:mnemosyne`. The ear should render correctly — Bishop's deploys mangled it. Check git history on the asset (likely `static/img/dr-mnemosynec*.png` or `assets/dr-mnemosynec*.svg`) and revert to the commit you owned. Browser-test post-deploy.

2. **"Try the GitHub Mirror" link** · currently 404. Two options · YOUR choice:
   - **Option A** · point to the actual GitHub release URL once Founder publishes v0.5.14 there: `https://github.com/<org>/<repo>/releases/download/v0.5.14/MnemosyneC-Setup-0.5.14.exe`
   - **Option B** · remove the CTA entirely until a GitHub mirror is published. Don't ship a 404 link.
   - **Option C** · point to a Firebase Hosting mirror path. Same site, alternate URL — gives the redundancy story without GitHub dependency.
   - Recommended: Option B until Founder ratifies the GitHub mirror destination, then Option A.

---

## §3 APPLY these selective Pawn v3 injects (the worthwhile ones · Founder ratified)

Pawn's full v3 brief is at `BISHOP_DROPZONE\00_FOUNDER_REVIEW\PAWN_V3_INJECTS_BRIEF_BP089.md`. From that brief, APPLY:

- **INJ-B · Frontier mesh section** · "Your Frame Is One Node of the Frontier Mesh." Slot between Lifecycle and Proofs. Differentiator from RAG.
- **INJ-C · Exact tagline lock** · "The Substrate Cure to AI Amnesia" verbatim in hero subtitle or just under H1.
- **INJ-D · Embed compounding chart** · take the SVG at `C:\Users\Administrator\Downloads\substrate-compounding-chart.svg` (Pawn's 4-ASK deliverable · already clean · zero em-dashes) and inline it in the "How It Works" section as the proof-that-it-compounds visual.
- **INJ-E · REPLACE Saladin's Peace block with Healthy Self-Interest framing** per `canon_healthy_self_interest_licensing_supersedes_saladins_peace_public_framing_bp089.eblet.md`. Lead with "Here's why this is a good deal for you" + concrete AI-company wins (cost · throughput · accuracy · vendor-resilience · brand-defensive). NO mercy framing. NO "Don't integrate accept inferiority." NO decay table with mercy diminish language. Pledge #2260 stays referenced as legal mechanism only.
- **INJ-F · ADD "Substrate Works Without MnemosyneC Running" section** per `canon_substrate_portable_mesh_integrates_with_any_reasoning_model_free_or_flagship_bp089.eblet.md`. Three tiers (free local + substrate · flagship + substrate · standalone substrate API). Lead phrase: "Bring your own AI." Verbatim inequality: "Free WITH Substrate > Flagship WITHOUT Substrate."

## §4 HOLD this until Trial 02 fires

- **INJ-A · Trial 02 receipt block** · DO NOT POPULATE YET. Reserve the slot in the Pinned Proofs section. When Trial 02 lands (post Founder force-launch + SON gate + Bishop pre-fire), Bishop ships you the numbers + you wire the card. The current Mesh Proof / Storm Test / Benchmark R10 cards stay live until then.

---

## §5 ACCEPTANCE CHECKLIST (you verify post-deploy)

1. Dr. MnemosyneC elephant image renders correctly · no ear distortion · matches your prior deploy
2. "Does It Actually Work?" + "Prove It Yourself" CTA present
3. "Good · Fast · Cheap" box present
4. "Pinned Proofs" section present
5. "How It Works · the Substrate" section present
6. Windows SmartScreen warning callout present at top
7. "Try the GitHub Mirror" → does NOT return 404 (Option A/B/C per §2 item 2)
8. Frontier mesh section present between Lifecycle and Proofs
9. Exact tagline "The Substrate Cure to AI Amnesia" appears verbatim at least once
10. Compounding chart SVG embedded in How-It-Works section
11. Saladin / Mercy / "Don't integrate accept inferiority" body copy ABSENT
12. Healthy Self-Interest licensing framing present
13. "Substrate Works Without MnemosyneC Running" section present with 3 tiers
14. Trial 02 proof card slot held (placeholder OR absent until numbers land)
15. Zero em-dashes in rendered text · use " · " or " -- "
16. All version surfaces show v0.5.14 (homepage hero · /download · download.html · meta tags)
17. mnemosynec.org and mnemosynec.ai parity (same content)

---

## §6 GUARDRAIL · the AUGUR data/ stub gotcha

SEG-T1 hit this: an AUGUR pricing-violation supersede hook drops markdown stubs INTO `cephas-hugo/data/` which then breaks Hugo build (Hugo tries to parse them as data files). Workaround SEG-T1 used: move the stub to `BISHOP_DROPZONE/` per AUGUR no-delete canon, re-run build. Long-term fix: add path filter to the hook to exclude `cephas-hugo/data/`. Out of scope for THIS dispatch but flag in your return pearl if you hit it.

---

## §7 RETURN PROTOCOL

Return via `pearl_emit` with this structure:
```
topic: knight_landing_page_restore_return
bp: BP089
elephant_image: restored Y/N · commit hash
github_mirror_link: chosen option A/B/C · new href · 200 response confirmed Y/N
windows_warning_callout: present Y/N · position
5_keep_sections: per-item present Y/N
4_pawn_injects: per-item B/C/D/E/F present Y/N
trial_02_slot: held Y/N
acceptance_checklist: per-row Y/N (17 rows)
firebase_deploy: release URL · version finalized
post_deploy_verify: org tagline + ai tagline + curl version match
```

---

## §8 OUT OF SCOPE

- Trial 02 fire (still gated · Founder force-launch + SON model + Bishop pre-fire)
- I8 MIC inbound verify yoke (architectural · awaits Founder a/b/c call)
- peerKeyGen boot wire / ip-ledger get-entries IPC / attribution_log.ts (queued for next Knight dispatch after Session 2 closure pearl)
- Catacombs UI polish
- Anything in Knight Marathon Session 2 yoke §11 (Trial 02) — that fires only on Bishop wake

---

Use segs. Sonnet 4.6. Substrace Theorem holds. Bishop stays in lane.
