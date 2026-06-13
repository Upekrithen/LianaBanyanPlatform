---
horizon: BP081_POST_v0_1_60_HORIZON_INTERFACES_INTERACT
bp: BP081
composed_at: 2026-06-13
composed_by: Bishop Opus 4.7 (1M)
purpose: post-v0.1.60 strategic roadmap — "all interfaces interact" horizon. NOT for immediate dispatch. Reference when v0.1.60 ships.
status: SKETCH · awaiting Founder ratify at v0.1.60 close-stamp time
---

# Post-v0.1.60 Horizon · "All Interfaces Interact"

## §1 The thesis

After v0.1.60 ships the FULL Plow Loop + Substrate Bridge MCP, MnemosyneC becomes a **substrate operating system** for AI interactions. The next horizon is making **every AI surface a user touches** read from and write to their MnemosyneC substrate — bidirectionally.

**Capture** (Path B closure): every AI use grows the user's substrate
**Inject** (Path C unlock): every AI use BENEFITS from the user's substrate, even AI surfaces that don't know about MnemosyneC

That's "all interfaces interact" — and it's what makes the moat structurally uncopyable. Other AI vendors compete on the model. MnemosyneC competes on the substrate that compounds across every model the user touches.

## §2 v0.2.x — Browser extension (the volume play)

**Scope:** Chrome / Firefox / Edge / Safari extensions that hook the major browser AI surfaces.

**Surfaces:**
- chatgpt.com (OpenAI ChatGPT web)
- claude.ai (Anthropic Claude web)
- gemini.google.com (Google Gemini web)
- perplexity.ai (Perplexity)
- you.com / phind.com / poe.com (smaller surfaces)
- Workspace Gmail / Google Docs Smart Compose surfaces
- ChatGPT App embed (when Apple ships it)

**Per surface:**
- **Capture:** DOM scrape Q+A pairs, post to local MnemosyneC MCP server (already exposed v0.1.60), Plow-validated, eblet-written
- **Inject:** when user types a query, extension queries local MnemosyneC substrate first, prepends relevant verified eblets as context note ("MnemosyneC found 3 verified answers from your substrate: [collapsed]"), so the cloud AI answer is informed by user's accumulated knowledge

**Engineering reality:** per-site DOM selectors break weekly. Need maintenance discipline. Store review (Chrome Web Store, Firefox AMO) is slow. Privacy disclosures are real. Worth doing because volume is here.

**Recommended landing:** v0.2.0 with 3 surfaces (chatgpt.com, claude.ai, gemini.google.com). Subsequent v0.2.X bumps add surfaces.

## §3 v0.3.x — IDE + dev-tool integration

**Scope:** AI-aware developer tools that aren't MCP-aware yet OR want deeper substrate integration than MCP provides.

**Surfaces:**
- VS Code extension — MnemosyneC substrate in editor autocomplete + commit message generation + code review suggestions
- JetBrains plugin (IntelliJ / WebStorm / PyCharm)
- Antigravity / Gemini Code Assist hooks
- Aider / GPT-CLI / shell-based tools — auto-route through MnemosyneC MCP
- Vim / Emacs plugins
- Slack / Discord bot integrations (team substrate sharing)

**The thesis:** developers running AI tools all day generate dense, high-quality Q+A. That substrate growth is gold. Every code-review acceptance is a verified eblet. Every git commit message is provenance. Every test that passes after AI suggestion is a verification signal.

**Recommended landing:** v0.3.0 with VS Code extension. v0.3.X adds others.

## §4 v0.4.x — Mobile companion

**Scope:** iOS + Android companion apps that sync user's substrate to a mobile-local cache, enable substrate query / write from mobile AI apps.

**Surfaces:**
- iOS Shortcuts integration (Siri-driven MnemosyneC commands)
- Android share-sheet integration ("Send to MnemosyneC" from any app)
- Native mobile ChatGPT app, Claude mobile, Gemini mobile — share-sheet capture
- Voice capture (record voice, transcribe, store as Q+A draft)

**The thesis:** users on mobile have AI conversations all day in different apps. Mobile substrate growth captures what desktop can't.

**Engineering reality:** mobile platforms (Apple in particular) are restrictive. App store review processes are conservative. Worth doing because mobile is half the world's AI usage.

**Recommended landing:** v0.4.0 iOS first (Shortcuts + share-sheet), v0.4.1 Android.

## §5 v0.5.x — Voice + ambient

**Scope:** voice assistant hooks + ambient capture.

**Surfaces:**
- Alexa skill / Google Home action — "MnemosyneC, what did I learn about X?"
- Apple HomePod / Siri shortcut chains
- Recording-app integrations (Otter.ai, Granola, etc.) — meeting Q+A captured as eblet drafts
- Always-listening companion (local-only, privacy-strict opt-in)

**Engineering reality:** voice integration is fragile and privacy-sensitive. Local-only by default (no cloud STT). Opt-in everything.

## §6 v0.6.x — Federation amplification

**Scope:** scale federation from your-substrate to collective-substrate (opt-in per eblet).

**Surfaces:**
- "Public substrate" — opt-in eblets shared to a collective pool that anyone can query
- "Domain substrate" — eblets tagged by domain (Medical / Legal / Engineering) shared into domain-specific pools
- "Team substrate" — eblets shared within an organization (Slack-org / Discord-server / mailing-list scoped)
- Reputation-weighted: eblets verified by Shadow E-Giants AND endorsed by multiple users in federation rise; eblets that fail concordance in others' substrates fall
- "Stand on shoulders" — query the collective, write to your own. Take what works, leave what doesn't.

**The thesis:** this is the FULL cooperative-class substrate — the moat that nobody can build alone because it requires the community to compound. It's the marketing line "every user's verified answer lifts all users (with consent)" actually materialized at scale.

**Recommended landing:** v0.6.0 with team-substrate (smaller, easier governance). v0.7.0 with domain. v1.0 with public.

## §7 v1.0 — The substrate operating system

**Scope:** MnemosyneC is the layer between any AI surface and the user's accumulated knowledge. Every model the user touches reads from and writes to a substrate they own. Local-first. Mesh-amplified. Sha256-stamped. Append-only. Cooperative-class.

**The user-facing pitch at v1.0:**

> *"You use AI all day across a dozen surfaces. ChatGPT in browser. Claude Desktop. Cursor in your IDE. Gemini on your phone. Each one forgets every time. MnemosyneC remembers. Every interaction you have, with any AI, grows your substrate. Every time you ask any AI a question, your substrate informs the answer. The substrate is YOURS. SHA256-stamped. Append-only. Federated with anyone you choose. Free to copy if you want to fork. Cost+20% if you stay. Workers, Builders, Creators keep 83.3%. No ads. No VC. For the keep."*

**Strategic implication:** v1.0 isn't a product version. It's a category claim. By v1.0 MnemosyneC isn't competing with ChatGPT or Claude or Gemini. It's the substrate layer underneath all of them.

## §8 What enables this horizon

Every architectural decision in v0.1.55 → v0.1.60 makes the horizon achievable:

- **Local-first** (no cloud lock-in) → users own the substrate; portable; flash-drive-savable
- **MCP server** (v0.1.60 SEG-5) → any MCP-aware tool plugs in without bespoke integration
- **Clipboard hotkey** (v0.1.59 SEG-5) → low-friction capture from any surface that can copy text
- **Shadow E-Giant concordance** (v0.1.58 SEG-1, v0.1.60 SEG-1) → external answers can be verified before write — the substrate doesn't get poisoned by random web AI hallucinations
- **Andon discipline** (v0.1.58 SEG-2) → failed answers never persist — the substrate gets cleaner over time, not noisier
- **Mesh federation** (v0.1.55+) → collective-class substrate without giving up local sovereignty
- **Open source SSPL + Pledge #2260** → designed-to-be-copied; the architecture itself can be forked, but the substrate-as-asset accrues regardless

## §9 What this is NOT

- NOT a new AI model — MnemosyneC doesn't compete on model quality
- NOT a wrapper for existing models — MnemosyneC adds a layer, doesn't replace
- NOT cloud-first — local-first by structural choice (Boat-in-Water canon)
- NOT VC-fundable in the conventional sense — cooperative-class structure (No-VC canon)
- NOT ad-supported — No-Ads canon

## §10 Bishop recommendation for sequencing

Once v0.1.60 ships LATEST:

1. **v0.1.6X carry-along** (small bumps): polish, bug fixes, marketing surfaces, on-deck stability
2. **v0.2.0 browser extension** with chatgpt.com + claude.ai + gemini.google.com — high-leverage volume play
3. **v0.3.0 VS Code extension** — high-leverage developer-class play
4. **v0.4.0 mobile companion** (iOS Shortcuts + Android share-sheet) — half-world coverage
5. **v0.5.0 voice + ambient** — ambient capture surfaces
6. **v0.6.0 team-substrate federation** — cooperative-class scaling
7. **v1.0** — the substrate-OS claim, full architecture

**Timeline:** Founder's velocity statement "AS SOON AS POSSIBLE to v0.1.60" suggests v0.1.60 lands in 1-3 weeks. The v0.2.x → v1.0 horizon depends on team scaling, but each version bump is a tight wave (same canonical Knight Yoke pattern that landed v0.1.55 → v0.1.57). Aggressive estimate: v1.0 in 6-12 months. Conservative: 18-24 months.

## §11 What to ratify at v0.1.60 close-stamp time

When v0.1.60 ships LATEST and BP081 close-stamps:

- Ratify this horizon document (or amend)
- Decide v0.2.0 surface priority (chatgpt.com vs claude.ai vs gemini.google.com first?)
- Compose first Knight Yoke for v0.2.0 wave
- Update Coffee with new horizon

For now (BP081 still mid-flight): this file sits as canonical-pending. Bishop references when asked.

— Bishop · BP081 · 2026-06-13
