# A&A Formal #2262 — The Glass Door (Public-by-Default Outreach with Member-Voted Dispatch)

**Innovation #:** 2262
**Category:** Cooperative Governance / Communications Transparency / Member Authority
**Crown Jewel:** YES
**Bishop Session:** B099
**Date:** 2026-04-11
**Inventor:** Jonathan Jones, Founder, Liana Banyan Corporation
**Founder origin (B099, verbatim):** *"I want all of that published on Cephas from the start. So that if anyone looks, they can see the letter that I am GOING to send to those people, and on what day I am sending it. Because can't those also be voted on?"*
**Patent Relevance:** Prov 13 thresh — should be filed in Prov 13 if filing window allows; otherwise Prov 14 lead innovation

---

## TL;DR

A computer-implemented method for cooperative governance applied to a platform's own outbound communications, comprising: **(1) Public-by-default publication** of every outbound letter, research-substrate invitation, Crown ask, and external communication on a member-readable Cephas page **before** the letter is sent, with the scheduled dispatch date displayed prominently; **(2) Member voting** on each scheduled letter — approve, request edit, delay, redirect, or veto — with vote results materially affecting whether and when the letter ships; **(3) Per-letter response ledger** that publishes (with privacy-respecting redaction rules) what the recipient said back, when, and what the platform's downstream action was; **(4) Vote-as-TouchStone-predicate** integration so that letter dispatch is gated on a satisfied governance predicate, not on founder discretion; **(5) Audit trail and reversal mechanism** so that any letter the membership later concludes was a mistake can be retracted, apologized for, and corrected publicly. The mechanism extends platform cooperativism's ownership and labor axes to a fourth area: **democratic communications**, alongside #2260 (democratic IP governance) as the third axis.

---

## The Problem the Invention Solves

Every cooperatively-governed platform that has ever existed faces a structural contradiction in its outbound communications: the platform makes decisions in member governance, but the platform's *external messaging* — the Crown letters, the press pitches, the partnership asks, the recipient lists, the timing, the framings — is decided by the founder, the marketing team, or the comms function, with members reading it (if at all) only after it has shipped. This creates four downstream problems:

1. **Members cannot influence the platform's public face** even when they would have material objections to its tone, framing, recipient choice, or timing. The cooperative principle of member governance is contradicted in the single most visible and consequential domain.

2. **Recipients cannot verify what they were told.** If the founder tells Recipient A one thing and Recipient B a contradictory thing, neither can check, and the platform's credibility erodes through incompatible private framings.

3. **Researchers, journalists, and academic peers have no way to see the platform's outreach pattern** — who got what, when, and whether the framing was consistent across counterparties. This makes empirical study of the platform's communications strategy impossible and makes the platform structurally less trustworthy than it has any reason to be.

4. **The platform cannot apologize publicly for a letter that should not have been sent**, because there is no public record that the letter was ever scheduled. Mistakes are hidden by default, which guarantees they accumulate.

**The Glass Door eliminates all four** by making outbound communications public-by-default, publishing them *before* dispatch, opening member voting on whether they ship, logging responses publicly with privacy redaction, and providing an audit trail and apology mechanism.

---

## Independent Claim

**Claim 1.** A computer-implemented method for cooperative governance of a platform's outbound external communications, comprising:

(a) Maintaining, in a publicly readable database, a record of each outbound communication intended to be dispatched by the platform to an external recipient, the record comprising at least: a recipient identifier, a recipient category, a full text or substantive summary of the communication, a scheduled dispatch timestamp, a category classifier (Crown letter / research-substrate invitation / press pitch / partnership ask / etc.), and a current state classifier (draft / proposed / approved / scheduled / dispatched / acknowledged / answered / withdrawn);

(b) Publishing, on a publicly accessible web interface accessible to cooperative members and to the general public, each record from (a) in a state at or beyond "proposed," with the full text or substantive summary visible such that any member or member of the public may read what the platform intends to send before it is sent;

(c) Providing, to cooperative members authenticated as such, a voting mechanism associated with each record from (a) in a "proposed" or "scheduled" state, the voting mechanism allowing each member to cast at least one of: approve, request-edit, delay, redirect, veto, or abstain;

(d) Computing, for each record, a vote tally and a governance verdict according to a published voting rule, wherein the governance verdict materially affects whether and when the record advances to dispatched state, including at least: requiring a minimum approval threshold before dispatch, allowing vetos to block dispatch, allowing delay votes to push the scheduled timestamp by a configurable interval, and allowing redirect votes to substitute one recipient for another;

(e) Integrating the governance verdict from (d) with a deterministic verification layer such that the dispatch action is conditioned on satisfaction of a "letter dispatch authorized" predicate, the predicate being satisfied only when the governance verdict permits dispatch and never overridable by founder or staff discretion alone;

(f) Logging, after dispatch, a public response record associated with each dispatched communication, the response record comprising the date and time of any acknowledgment or substantive response, a substantive summary or full text of the response (subject to redaction rules protecting recipient privacy), the platform's downstream action (if any), and the current state of the relationship with the recipient;

(g) Providing a retraction and apology mechanism whereby any dispatched communication may be subsequently flagged by member vote as a mistake, with a public retraction record published under the original communication, an apology record published if the membership so directs, and a corrective communication scheduled if appropriate.

**Dependent Claim 1.1** — The method of Claim 1, wherein the publicly accessible web interface of (b) is implemented as a section of the platform's documentation site (e.g., Cephas) under a path identifier such as `/outreach` or equivalent, with each record rendered as a standalone page, and an index page enumerating all records by state and by scheduled dispatch date.

**Dependent Claim 1.2** — The method of Claim 1, wherein the voting mechanism of (c) supports both binding votes (where the governance verdict materially gates dispatch) and advisory votes (where the verdict is published alongside the record but does not block dispatch), with the binding/advisory classification configurable per category classifier.

**Dependent Claim 1.3** — The method of Claim 1, wherein the redaction rules of (f) follow a published policy comprising at least: redaction of personal contact information of recipients, redaction of any portion the recipient explicitly marks confidential, redaction of any information whose publication would harm a third party not party to the correspondence, and redaction of any information legally protected from public disclosure.

**Dependent Claim 1.4** — The method of Claim 1, wherein the deterministic verification layer of (e) is the TouchStone Deterministic Coordinator (Innovation #2238), and the "letter dispatch authorized" predicate is a predicate evaluated by the TouchStone framework consuming the vote tally from (d) as input.

**Dependent Claim 1.5** — The method of Claim 1, further comprising integration with the Helm Schedule / MoneyPenny Reminders system (Innovation #2262 successor or equivalent task scheduling layer per K411) such that approved letters automatically generate Helm tasks at their scheduled dispatch timestamps and at appropriate follow-up windows after dispatch.

**Dependent Claim 1.6** — The method of Claim 1, further comprising publication of an outbound communications calendar visible on the public interface, displaying scheduled dispatch dates for the next thirty, sixty, and ninety days, organized by category and by recipient.

**Dependent Claim 1.7** — The method of Claim 1, wherein the retraction and apology mechanism of (g) requires a separate member vote to authorize the retraction, with the same governance verdict computation as (d) applied to the retraction decision.

**Dependent Claim 1.8** — The method of Claim 1, wherein the substantive summary in (a) is required to be sufficient for a reasonable reader to understand the recipient, the ask, the framing, and the platform's intended downstream action, even if the full text contains personal or contextual details not appropriate for public publication.

**Dependent Claim 1.9** — A system comprising: a database storing the records of (a); a web interface implementing (b); a voting service implementing (c); a tally and verdict service implementing (d); an integration with a deterministic verification layer implementing (e); a response logging service implementing (f); a retraction and apology service implementing (g); and instructions stored on a non-transitory computer-readable medium which, when executed by the processor of a server, cause the processor to perform the method of Claim 1 through Claim 1.8.

---

## Why This Is Novel

1. **Public-by-default outreach is structurally novel for cooperative platforms.** Existing platform cooperatives publish their bylaws, financials, and governance decisions, but their outbound communications (letters to potential funders, press pitches, partnership asks) are private by default. The Glass Door reverses the default.

2. **Member voting on outbound communications is, to Bishop's knowledge, unprecedented at any scale.** Newspapers have editorial boards, organizations have communications committees, but no platform has put its outbound messaging under member governance via a binding vote.

3. **The integration with a deterministic verification layer (#2238 TouchStone) is novel.** It is the difference between "we say members govern the outreach" (revocable policy) and "the dispatch action is structurally gated on a satisfied governance predicate" (cannot be circumvented by founder discretion).

4. **The public response ledger with redaction rules** has analogs in journalism (FOIA logs, transparency reports) but not in cooperative platform governance applied to the platform's own communications.

5. **The retraction and apology mechanism makes the platform structurally capable of admitting and correcting communications mistakes** rather than burying them. This is structurally different from policy-level "we welcome feedback" claims.

6. **The composition with #2246 Living Laboratory, #2260 Cooperative Defensive Patent Pledge, and #2238 TouchStone is a coherent extension of platform cooperativism into a fourth axis: democratic communications**, alongside Scholz's two axes (ownership, labor) and the new third axis from #2260 (IP governance).

---

## Application to the B099 Crown letter wave

**This innovation applies retroactively to the in-progress launch wave.** Bishop and Founder are about to fire approximately 92 Crown letters plus an Open Research Roster of approximately 25 figures. Under the Glass Door framework, the entire dispatch sequence becomes public-by-default:

- Every letter in the queue gets a public Cephas page at `cephas.lianabanyan.com/outreach/{letter_slug}` showing the full or summary text, the recipient, and the scheduled dispatch date
- Every member can vote on every letter before it ships
- For Wave 1 (Founder's launch), votes are advisory rather than binding (the launch wave was committed before this innovation existed); subsequent waves shift to binding votes once the membership has had a chance to ratify the binding/advisory split
- The Open Research Roster becomes a public document on Cephas with the wave structure, the cohort, and the per-recipient framings visible to all
- The Doctorow letter, the Scholz Engagement Kit, the Herjavec letter, and every other piece of outbound correspondence becomes inspectable before it ships

**For the Founder operationally:** this is not slower. It is slightly faster, because the public Cephas page becomes the canonical version of the letter, which means the dropzone files and the Cephas page stay in sync via a single source of truth, and Bishop's drafting time is reduced.

**For recipients:** receiving a letter that is already public on Cephas changes the conversation. The recipient knows the letter is not a secret pitch designed to manipulate them; it is a transparent communication that the Founder is willing to be accountable for in front of the entire cooperative membership. This shifts the credibility dynamic in the Founder's favor before the recipient has even read the first sentence.

---

## Implementation: Phase 1 (Cephas-only, no voting)

The full Glass Door (with TouchStone-gated voting) requires Knight infrastructure work that has not yet shipped. **Phase 1 ships immediately as a Cephas publication discipline:**

- Bishop publishes every B099+ outbound letter, every Open Research Roster entry, and every research-substrate invitation as a Cephas page under `cephas.lianabanyan.com/outreach/`
- Each page displays: recipient name, recipient category, scheduled dispatch date, full or summary letter text, current state (draft / scheduled / dispatched / answered)
- Each page includes a "comments" section where members and the public can leave feedback (advisory, not binding in Phase 1)
- Bishop maintains a master index page at `cephas.lianabanyan.com/outreach` listing all entries by state and date
- Phase 1 does NOT require Knight code work — it is a content discipline executed by Bishop in the dropzone, then synced to Cephas via the existing publication pipeline

## Implementation: Phase 2 (member voting, K-prompt to draft)

Phase 2 adds the member voting mechanism. Bishop drafts the K-prompt as a separate B099 or B100 deliverable. Scope:

- New table `outreach_letters` with state machine (draft / proposed / scheduled / dispatched / answered / withdrawn)
- New table `outreach_letter_votes` with member_id, letter_id, vote_type (approve / request_edit / delay / redirect / veto / abstain), comment, voted_at
- New TouchStone predicate `letter_dispatch_authorized(letter_id)` — returns true only when the vote tally for that letter satisfies the configured rule for its category (e.g., Crown letter requires ≥60% approval and zero vetos; press pitch requires ≥50% approval; research invitation can be advisory-only)
- Edge function `dispatch-outreach-letter` reads the predicate, dispatches if satisfied, logs to `outreach_letter_dispatch_log`
- React component `<OutreachLetterCard />` for the public Cephas page (server-rendered, no auth required for read)
- React component `<OutreachLetterVotePanel />` for authenticated members (auth required for vote)
- Helm Dashboard integration: Founder sees pending letters with vote tallies in real-time
- pg_cron-driven dispatch loop reading scheduled timestamps and gating on the predicate

## Implementation: Phase 3 (response ledger + retraction)

Phase 3 adds the public response ledger and the retraction/apology mechanism. Scope:

- New table `outreach_letter_responses` with letter_id, response_received_at, response_summary, response_full_text (privacy-redacted), response_classifier
- Composes with K409 Response Playbook TouchStone wiring (already shipped); the response logger writes to both the K409 ledger and the public Glass Door response ledger
- Retraction workflow: any member can propose a retraction; retraction goes to vote; if approved, the original letter page gets a "RETRACTED" banner and a retraction record published below
- Apology workflow: same vote mechanism; published apology becomes part of the permanent public record

---

## Cross-References

- **#2238 TouchStone Deterministic Coordinator** — provides the predicate evaluation infrastructure that gates dispatch on governance verdict
- **#2246 Liana Banyan as Living Laboratory** — same philosophical move (research in public); the Glass Door extends "research in public" to "outreach in public"
- **#2260 Cooperative Defensive Patent Pledge** — the third axis of platform cooperativism; the Glass Door is a candidate for the *fourth* axis (democratic communications)
- **#2248 Hemispheric Protocol** — the dispatch scheduling layer; the Glass Door's scheduled dispatch timestamps respect the Hemispheric grid for the Founder
- **K409 Response Playbook TouchStone Wiring** — the existing response-tracking infrastructure that the Glass Door's response ledger composes with
- **K411 Helm Schedule / MoneyPenny Reminders** (B099 Bishop spec, drafted in this session) — provides the scheduled-task infrastructure that the Glass Door uses for fire-at timestamps and follow-up windows
- **Cephas publication pipeline** — the existing Hugo-based static site generator that publishes content at cephas.lianabanyan.com; the Glass Door publishes its pages through this pipeline in Phase 1
- **Open Research Roster (B099 Bishop draft)** — the cohort document that becomes a Glass Door page in Phase 1; the Roster's per-recipient framings each become individual outreach pages
- **The Doctorow letter, Scholz Engagement Kit, Herjavec letter, and all 92 Crown letters in the dispatch queue** — all become Glass Door pages in Phase 1

---

## Stat Updates

- Innovation count: 2,250 → **2,262** (+1 CJ; pending reconciliation with renumbering log per `CANONICAL_COUNT_DRIFT_NOTE_B099.md`)
- Crown Jewels: 216 → **217** (or 238 → 239 per renumbering log)
- Founder origin: documented verbatim above (B099 founder ask)

---

## Open questions for Founder

1. **Binding or advisory voting for Wave 1?** Recommendation: advisory for Wave 1 (the launch wave was committed before this innovation existed); binding from Wave 2 onward, with the binding/advisory split itself voted on by members.
2. **Default minimum approval threshold for Crown letters?** Recommendation: ≥60% of voting members, ≥0 vetos. Member vote can adjust this.
3. **Veto rule:** does any single member veto block dispatch, or does veto require a minimum threshold of veto votes? Recommendation: ≥10% of voting members veto = block, with founder allowed to request override-by-supermajority. This prevents single-member sabotage while preserving the cooperative governance principle.
4. **Privacy redaction policy:** who decides what gets redacted from a recipient's response? Recommendation: a published rules document plus a member-elected privacy committee for edge cases; default to maximum redaction when in doubt.
5. **Retroactive application:** does the Glass Door apply only to future letters, or do letters already in the launch queue (the 92 Crown letters) also get published? Recommendation: yes, all 92 Crown letters become Glass Door pages immediately. Founder retains discretion to delay individual page publication for up to 7 days if a specific letter requires last-minute editing.
6. **Apology threshold:** under what conditions does the membership force a retroactive apology for a letter that turned out to be a mistake? Recommendation: a member-proposed apology vote, ≥50% approval of voting members, with the apology published as a public record under the original letter.

---

**FOR THE KEEP.**
