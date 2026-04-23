# Glass Door Phase 1 — Publication Discipline (Bishop, no code required)

**Author:** Bishop B099
**Date:** 2026-04-11
**Founder sign-off:** Confirmed B099 — *"consider me signed off on the Glass Door"*
**Innovation:** #2262 The Glass Door — A&A formal at `12_Innovations_AA/AA_FORMAL_2262_THE_GLASS_DOOR_B099.md`
**Status:** Phase 1 ships immediately as Bishop publication discipline; Phase 2 (member voting infrastructure) is K412 (Knight prompt drafted in this same B099 session, see separate file)

---

## Why Phase 1 ships now without Knight code

The full Glass Door (with TouchStone-gated voting, public response ledger, retraction mechanism) requires Knight infrastructure work that has not yet shipped. **But the publication discipline that gets the most leverage out of the innovation can ship today, with no code, by Bishop committing to a content discipline in the dropzone that propagates to Cephas through the existing publication pipeline.**

The discipline below is what every Bishop session from B099 forward will follow until Phase 2 lands.

---

## The Phase 1 discipline (six rules)

### Rule 1 — Every outbound letter gets a Cephas page before dispatch

When Bishop drafts a Crown letter, an Open Research Roster letter, a press pitch, a partnership ask, or any other outbound external communication, the deliverable is **two files**, not one:

1. The letter itself in `BISHOP_DROPZONE/06_Letters/{slug}_B0XX.md` or equivalent
2. A Cephas-ready outreach page in `BISHOP_DROPZONE/CEPHAS_OUTREACH/{slug}.md`

The Cephas-ready file is the public-facing version. It contains:
- Frontmatter with recipient name, recipient category, scheduled dispatch date, current state, source slug
- The full or substantive summary of the letter (privacy-redacted as needed)
- The "what we are asking" section made explicit
- The "what we are NOT asking" section made explicit (lifted from the letter or expanded for the public page)
- A "comments welcome" section pointing to where members can leave feedback
- A backlink to the source letter file in the dropzone

### Rule 2 — The Cephas page is published BEFORE dispatch

The Cephas publication pipeline takes the file from `BISHOP_DROPZONE/CEPHAS_OUTREACH/` and publishes it to `cephas.lianabanyan.com/outreach/{slug}` on the next sync. **Bishop and Founder confirm the Cephas page is live BEFORE the letter is physically dispatched to the recipient.**

This gives the cooperative membership and the general public a window — a few hours minimum, ideally 24+ hours — to read what is about to be sent. In Phase 1 the window is advisory only; in Phase 2 it gates dispatch through TouchStone.

### Rule 3 — The scheduled dispatch date is displayed prominently

Every Cephas outreach page has a clearly visible "scheduled to dispatch on YYYY-MM-DD" line. Members and the public can see not just *what* is being sent but *when*. This is the part that makes the page actually useful for member oversight rather than after-the-fact accountability theater.

### Rule 4 — The state machine is visible

Each page shows current state from the spec's enum:
- **draft** — Bishop is still working on the letter; not yet for review
- **proposed** — letter is finalized as a draft, awaiting Founder approval and member feedback window
- **scheduled** — Founder has approved, dispatch date is locked, awaiting dispatch
- **dispatched** — letter has been physically sent to the recipient
- **acknowledged** — recipient has confirmed receipt (auto-detected via K409 wiring or manual)
- **answered** — recipient has substantively responded (response logged separately)
- **withdrawn** — letter was pulled before dispatch (reason logged)

The state changes over time as the letter progresses through the lifecycle, and the page updates accordingly.

### Rule 5 — Index pages exist by category and by date

Bishop maintains four index pages on Cephas:

1. **`cephas.lianabanyan.com/outreach`** — master index, all states, all categories
2. **`cephas.lianabanyan.com/outreach/scheduled`** — only state=scheduled, ordered by dispatch date (the "what's coming next" view)
3. **`cephas.lianabanyan.com/outreach/dispatched`** — only state=dispatched or beyond
4. **`cephas.lianabanyan.com/outreach/by-category/{category}`** — one page per category (crown_letter, research_invitation, press_pitch, partnership_ask, etc.)

These are static markdown files in `BISHOP_DROPZONE/CEPHAS_OUTREACH/_indexes/` that Bishop regenerates whenever a new outreach page is added or a state changes. Phase 2 makes them dynamic via the Supabase tables.

### Rule 6 — The response, when it lands, becomes part of the same page

When a recipient responds (or fails to respond within the follow-up window), the response is logged on the same Cephas outreach page below the original letter. Privacy-redacted per the rules in #2262 Claim 1.3:

- Personal contact info redacted
- Anything the recipient explicitly marks confidential redacted
- Anything that would harm a third party redacted
- Default to maximum redaction when in doubt

The page shows:
- Date of response
- Substantive summary of what they said
- What the platform's downstream action is or was
- Link to any subsequent letter or follow-up generated as a result

If 90 days pass with no response, the page is updated to "no response within window" and a follow-up Helm task fires per K411 wiring.

---

## What this discipline applies to in B099 immediately

The following B099 deliverables become Cephas outreach pages **before any of them are dispatched**:

### Wave 1 (single recipient)
- `cephas.lianabanyan.com/outreach/scholz` — the Scholz Crown letter package per the Scholz Engagement Kit

### Wave 2 (per the Open Research Roster, accelerated)
- `cephas.lianabanyan.com/outreach/schneider` — Nathan Schneider letter
- `cephas.lianabanyan.com/outreach/orsi` — Janelle Orsi letter
- `cephas.lianabanyan.com/outreach/kelly` — Marjorie Kelly letter
- `cephas.lianabanyan.com/outreach/alperovitz` — Gar Alperovitz letter
- `cephas.lianabanyan.com/outreach/doctorow` — Doctorow V03 letter (accelerated to Wave 2 per Bishop recommendation)

### Wave 3 (foundational theorists)
- `cephas.lianabanyan.com/outreach/benkler` — Yochai Benkler
- `cephas.lianabanyan.com/outreach/blasi` — Joe Blasi
- `cephas.lianabanyan.com/outreach/gorbis` — Marina Gorbis
- `cephas.lianabanyan.com/outreach/bollier` — David Bollier

### Wave 4 (international / P2P)
- `cephas.lianabanyan.com/outreach/bauwens` — Michel Bauwens
- `cephas.lianabanyan.com/outreach/mazzucato` — Mariana Mazzucato

### Wave 5 (journalists/activists, parallel to Wave 4)
- `cephas.lianabanyan.com/outreach/farrell` — Maria Farrell
- `cephas.lianabanyan.com/outreach/ong` — Edward Ong
- `cephas.lianabanyan.com/outreach/watters` — Audrey Watters

### Wave 6 (antitrust/law/policy)
- `cephas.lianabanyan.com/outreach/sitaraman` — Ganesh Sitaraman
- (Khan, Wu — already in main Crown letter pipeline; coordinate to avoid duplicates)

### The 92 Crown letters in the existing dispatch queue
- Every existing letter in the dispatch queue gets a Cephas outreach page in `cephas.lianabanyan.com/outreach/{recipient_slug}` retroactively. This is a one-time backfill: Bishop reads each letter from the existing queue, generates the Cephas page using the template below, and publishes. Estimated time: 3-4 sessions of focused work, one wave at a time.

---

## The Cephas outreach page template

Every Cephas outreach page follows this structure. Bishop produces it as a markdown file with frontmatter that the Cephas Hugo pipeline understands.

```markdown
---
title: "Letter to {{Recipient Name}}"
recipient_name: {{Recipient Name}}
recipient_category: {{crown_letter | research_invitation | press_pitch | partnership_ask}}
recipient_tier: {{1-7 per Hemispheric Protocol}}
state: {{draft | proposed | scheduled | dispatched | acknowledged | answered | withdrawn}}
scheduled_dispatch: {{YYYY-MM-DD}}
dispatched_at: {{YYYY-MM-DDTHH:MM:SSZ if dispatched, else null}}
source_letter_file: {{relative path to source in dropzone}}
source_innovation_refs: [{{e.g., 2246, 2260, 2249}}]
---

# Letter to {{Recipient Name}}

**Status:** {{state}}
**Scheduled to dispatch:** {{scheduled_dispatch}}
**Category:** {{recipient_category}}

## What we are asking

{{1-3 sentence summary of the ask, made explicit and unambiguous}}

## What we are NOT asking

{{Bullet list of explicit non-asks, lifted from the letter}}

## The letter (full or substantive summary)

{{Full text of the letter with privacy-redactions as needed, or a substantive summary if the full text contains private contextual material}}

## Why this recipient

{{1-2 paragraphs on why this person specifically and what the strategic logic is — this is the "show our work" section}}

## Open for comment

Members and members of the public can leave feedback in the comments section below or by emailing `feedback@lianabanyan.com`. In Phase 1 (current), feedback is advisory and read by Bishop and the Founder. In Phase 2 (planned, K412), members will be able to vote on whether the letter ships, request edits, delay dispatch, redirect to a different recipient, or veto.

## Source documents

- Letter source file: `{{source_letter_file}}`
- Related innovations: {{links to A&A formals}}
- Engagement kit (if applicable): {{link to kit}}

## Response (logged after dispatch)

*This section is empty until the recipient responds. When a response is received, it will be logged here with privacy-redaction per the published rules. If 90 days pass with no response, the page will be updated to "no response within window" and the dispatch state will move to "no_response".*

---

*Published under the Glass Door framework (Innovation #2262). Every outbound letter from Liana Banyan is published here before dispatch so members and the public can see, comment on, and (in Phase 2) vote on whether it ships. Founder discretion is gated on this transparency.*
```

---

## What this changes about Bishop's workflow

**Before Glass Door (B098 and earlier):**
1. Bishop drafts letter in dropzone
2. Founder reviews
3. Letter is dispatched
4. Response (if any) lands privately in Founder's inbox

**After Glass Door Phase 1 (B099 and later):**
1. Bishop drafts letter in dropzone AND drafts the Cephas outreach page
2. Bishop publishes the outreach page on Cephas (state=proposed)
3. Founder reviews; outreach page state changes to scheduled when Founder approves
4. Window opens (24+ hours minimum) for member feedback
5. Letter is dispatched; outreach page state changes to dispatched
6. Response (if any) is logged publicly on the same outreach page with redaction

The added Bishop work is approximately one extra paragraph per letter (the "why this recipient" section) plus the structured frontmatter. Net cost: ~5 minutes per letter. Net benefit: every letter is publicly accountable, retroactively and prospectively, and the cooperative governance principle finally extends to the platform's own communications.

---

## What stays private (not published on Cephas)

Some communications appropriately stay private. Bishop maintains discipline on the boundary:

1. **Counsel-attorney privileged communications.** Legal advice from counsel, internal legal strategy memos, and any communication that would waive attorney-client privilege if published. These stay in `BISHOP_DROPZONE/06_Letters/_PRIVILEGED/` and are never published on Cephas.

2. **Personal correspondence with family members or close friends.** Founder personal correspondence is not platform business and is not published.

3. **Receipts of sensitive recipient information.** If a recipient sends Bishop or Founder a private medical detail, financial detail, or other sensitive information, that detail is redacted from the response log even if the rest of the response is published.

4. **Correspondence under explicit confidentiality agreement.** If a recipient asks at the start of a conversation that the conversation be kept private, that request is honored. The Cephas outreach page is updated to show "this conversation is being held under recipient-requested confidentiality" without revealing what was said.

5. **In-progress drafts that have not yet reached the proposed state.** Letters in state=draft are not published. Only state=proposed and beyond are visible on Cephas. This gives Bishop room to iterate without publishing every draft revision.

The boundary is: **anything Liana Banyan is sending out, by default, is public. Anything Liana Banyan is receiving, by default, is private until and unless the sender consents to publication or the response is explicitly part of the platform's public engagement.**

---

## Founder action items for Glass Door Phase 1

1. **Confirm sign-off** — done in B099, captured here
2. **Authorize Bishop to backfill the existing 92 Crown letters as Cephas outreach pages** — recommended but not strictly required; the 92 letters can also be brought into the discipline going forward only, with new letters getting pages and old letters getting pages as they are revisited
3. **Decide whether to delay any specific letter's Cephas page publication** — Founder retains discretion to delay individual page publication for up to 7 days if a specific letter requires last-minute editing. Default is "publish on completion."
4. **Decide on the privileged-counsel publication policy** — Bishop's recommendation is in the "What stays private" section above. Founder confirms or amends.
5. **Authorize Bishop to draft the K412 Phase 2 prompt** — already drafted in B099 (see `01_KnightPrompts/PROMPT_KNIGHT_SESSION_K412_GLASS_DOOR_VOTING_B099.md`); Founder reads and dispatches when ready.

---

**FOR THE KEEP.**
