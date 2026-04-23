# COUNSEL ENGAGEMENT PACKAGE — Bylaws Amendment (Urgent, Pre-Wave-1)
## B112, April 21, 2026 — ready for Founder to send
## Companion to: `COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md` (the task specification)

**Purpose:** One-click-send package. Founder copies the email, attaches the three linked files, hits send. Counsel has everything needed to quote hours and begin drafting.

**Counsel (per B111 memory):** New task-based counsel secured March 29, 2026. File pointer: `project_counsel_task_based.md`.

**Timing target:**
- Send TODAY (Apr 21) so counsel can quote by Apr 22
- Amendment drafted by Apr 24
- Founder (solo-board) written-consent ratification Apr 24–25
- Wyoming filing if required Apr 25
- Scott Wave 1 dispatch Apr 22–23 can proceed on v014f text regardless (the letter's "bylaw-codified" phrasing is already accurate under current bylaws); the amendment *strengthens* the claim, not retroactively validates it.
- Doctorow V04 dispatch Apr 23–25 proceeds concurrent with counsel work; no text change needed if amendment lands within Doctorow window.

---

## PROPOSED COUNSEL EMAIL (Founder voice pass expected — scaffold follows)

**Subject:** Liana Banyan Corporation — Task-Based Engagement Request: Bylaws Amendment (Three Clauses, 4–6 hour scope)

**To:** [counsel name / firm — Founder insert from records]
**From:** Jonathan Jones, Founder & General Manager, Liana Banyan Corporation
**Date:** April 21, 2026

---

[FOUNDER PROSE — one-paragraph context scaffold below; rewrite in your voice]

> I'm reaching out to engage you on a specific task: three bylaws amendments for Liana Banyan Corporation, the Wyoming C-Corp we filed November 21, 2025. Scope is tight (~4–6 counsel hours + my review + solo-board ratification). The reason for the urgency is that I'm sending two philanthropic letters this week — to MacKenzie Scott (Apr 22–23 window) and Cory Doctorow (Apr 23–25 window) — and both letters make structural claims about the cooperative-commons design of the corporation. The current bylaws support those claims. These three amendments would make the claims *structurally unambiguous* in a way that serves both the letters and the longer-term governance integrity of the entity. Running parallel also puts the amendment on the books before our patent-provisional conversion deadline (Nov 26, 2026), which is when the commons lock becomes operationally load-bearing.

[FOUNDER PROSE — one-paragraph authorization scaffold]

> The three amendments are described in detail in the attached task specification (Attachment 1). In summary:
>
> 1. **Purpose-clause amendment** — making any corporate action inconsistent with the Cooperative Defensive Patent Pledge (Innovation #2260, bylaw-codified) *ultra vires*.
> 2. **Unanimous-member-consent requirement** — for any transaction that would cause the corporation to cease operating under the Pledge, plus an anti-amendment nesting clause so the requirement itself cannot be stripped without unanimous consent.
> 3. **Golden Key Steward role** — a non-economic, non-transferable veto share, held initially by me, over Pledge-ending transactions, amendments to the above two clauses, and dissolution. Precedents to review: Patagonia's 2022 Purpose Trust / Holdfast Collective restructuring; Mozilla Foundation → Mozilla Corporation; Tesla's share-class structures.
>
> I am not asking for contract drafting from scratch. The task specification includes proposed text for each amendment — counsel refines, identifies Wyoming-specific enforceability issues, and returns a clean draft. I then do a prose-level review and ratify via written consent (solo-founder board at present).

[FOUNDER PROSE — ask + attachments]

> **What I need from you:**
>
> 1. Hour estimate + flat-rate quote for the 4–6 hour scope (I'm open to a small buffer for Wyoming-specific research).
> 2. Draft amendment text reflecting the three clauses, with any counsel-identified cleanup items to the existing bylaws flagged separately.
> 3. Answers to the six specific counsel questions in the task specification (Attachment 1, Section "Specific counsel questions").
> 4. Wyoming filing guidance — which amendments require a filing with the Secretary of State vs. which are internal bylaw revisions only.
>
> **Attachments:**
>
> 1. `COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md` — the detailed task specification (proposed text for all three amendments, six counsel questions, ratification sequence, precedent pointers)
> 2. Current bylaws (full PDF — Founder retrieves from corporate records)
> 3. Certificate of Incorporation (Wyoming filing, Nov 21, 2025 — Founder retrieves)
>
> **Timing:** I'd like an hour estimate by EOD Apr 22 so I know whether to send the Scott letter with current bylaw language or hold one day for the stronger language. If scheduling is tight, a phone conversation tomorrow morning works fine. My number is 406-578-1232.
>
> There is a separate, medium-urgency task coming (consumer-portal Pedestal Stake structure — Reg CF vs. Reg D 506(b) analysis, Q3 2026 target) that I'll send as its own engagement once this one is quoted. Keeping them separate so the hours and scopes stay clean.

[FOUNDER PROSE — close]

> Appreciate your time. The structural integrity this amendment buys is exactly the kind of durable build I prefer to pay for once, correctly, up front.
>
> Respectfully,
> Jonathan Jones
> Founder & General Manager, Liana Banyan Corporation
> 406-578-1232 · Founder@LianaBanyan.com

---

## ATTACHMENT CHECKLIST (Founder to gather before send)

- [ ] `COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md` — already in `00_FOUNDER_REVIEW/`. Export to PDF or attach as markdown (counsel preference).
- [ ] Current bylaws PDF — **Founder action required.** Pull from corporate records. If not locatable in under 10 minutes, email counsel without and note in email body ("bylaws PDF to follow by end of day").
- [ ] Certificate of Incorporation (Wyoming, Nov 21, 2025) — **Founder action required.** Pull from corporate records or from Wyoming Secretary of State business portal using entity ID.
- [ ] (Optional but helpful) Liana Banyan Platform one-pager — pointer: Cephas.LianaBanyan.com front page OR `00_FOUNDER_REVIEW/OPENING_GAMBIT_v2_B111.md`. Gives counsel context on what the entity does without requiring them to read the whole site.

---

## POST-SEND TRACKING (Bishop / Helm task)

- Auto-create Helm task on dispatch: `fire_at = sent + 24h`, `priority_tier = 1`, `source_kind = "counsel_engagement"`. Body: "Counsel quote-receipt window. If no reply by EOD Apr 22, Bishop drafts a polite follow-up + also drafts a fallback plan to send Scott Wave 1 on current bylaw language."
- Log the send in `letter_send_log` (Supabase) under recipient = counsel firm, category = "governance", status = "sent_awaiting_quote".
- Bishop update session notes when quote arrives.

---

## FALLBACK PLAN (if counsel quote lands > $5,000 or > 2-week turnaround)

1. Send Scott Wave 1 on current bylaw language (v014f). No text change required.
2. Negotiate scope down with counsel — Amendment 3 (Golden Key Steward) is the biggest drafting load; if needed, land Amendments 1–2 first and defer Amendment 3 as a follow-on task.
3. Alternative counsel escalation — second quote from Lloyd & Mousilli (patent counsel #2 per memory `Patent attorneys: Harrity & Harrity (#1), Lloyd & Mousilli (#2)`). Corporate bylaws aren't their primary practice area, but they know the Pledge's patent side and may refer to a corporate specialist in their network.

---

## KEYSTONE / TONE NOTES

- This email is structurally business correspondence, not a Crown letter. Keep Keystones out of it. Optionally the close line "durable build I prefer to pay for once, correctly" echoes `feedback_build_for_long_haul.md` in a functional register.
- The [FOUNDER PROSE] brackets are placeholders for your voice pass. Expected rewrite is light (20–40%) because the register is already tight — memo-like.
- If counsel replies asking for plain-English explanation of why bylaw codification matters vs. press-release policy, point them to [project_anti_enshittification_architecture](placeholder) — or draft a one-paragraph inline explainer on demand.

---

## READY FOR

- **Founder prose pass** on three bracketed insertions (above)
- **Founder action:** pull bylaws PDF + Certificate of Incorporation from corporate records
- **Counsel dispatch** — send via email, same day as prose pass
- **Helm task auto-create** via Bishop on dispatch confirmation

---

*Saved B112, April 21, 2026. Counsel engagement scaffold. Pairs with COUNSEL_TASK_BYLAWS_AMENDMENT_B111.md (task spec). Bishop available to follow-up-draft on any counsel questions returned.*
