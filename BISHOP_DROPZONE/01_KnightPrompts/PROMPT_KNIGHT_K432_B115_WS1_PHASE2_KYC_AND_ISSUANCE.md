# Knight K432 — K427 Workstream 1, Phase 2 of 3
## Pedestal Stake Reg CF portal: KYC adapter + subscription e-signature + issuance + investor dashboard
## Bishop B115 — 2026-04-22 (late evening)
## Parent scope: [K427 B113 Counsel-Cleared Full Dispatch](./PROMPT_KNIGHT_K427_B113_ADDENDUM_COUNSEL_CLEARED_FULL_DISPATCH.md)
## Prior phase: [K431 Phase 1](./PROMPT_KNIGHT_K431_B115_WS1_PHASE1_ROUTES_AND_EARLY_INTEREST.md)

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.

**End of BRIDLE. Task follows.**

---

## Phase scope — Phase 2 of 3

**This session ships the full `/pedestal-stake/apply` signup flow end-to-end + pluggable KYC adapter + subscription-agreement e-signature + issuance-mechanics writes + the investor dashboard at `/my/pedestal-stake`.**

**Still NOT in scope this phase:** admin/compliance dashboard, cap-table view, bad-actor check integration (K433), and any actual ACH-payment execution (Founder selects funding portal before production launch). For this phase, payment is a *pluggable adapter* interface with a sandbox implementation that records the payment intent but does NOT execute.

---

## Session hygiene

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K432`, `task="K427 WS1 Phase 2 — full apply flow + KYC adapter + subscription e-sig + issuance + investor dashboard"`.
2. `mcp__librarian__brief_me` with the same task.
3. Read the K431 session report (previous Knight's actual output; may differ from K431 prompt plans).
4. Confirm the K431 Supabase migration is either applied or, if still staged, coordinate with Founder before applying — you need `pedestal_applications`, `pedestal_holders`, `pedestal_issuance_log`, and `regcf_offering_raises` tables live to write against in this phase.
5. Read `project_upekrithen_seller_of_record.md` in Bishop memory. Two-track-separation rule remains load-bearing.

---

## Deliverables — Phase 2

### Pluggable KYC adapter

- New module `src/lib/kyc/` with a common interface and TWO implementations, both behind a single env-var switch:
  - `middesk.ts`
  - `alloy.ts`
- Interface: `verifyIdentity(applicant) → { status, provider_reference, bad_actor_check_result, raw_response }`
- Founder has not yet selected the production provider. Build both as interface-compatible and document which env var switches between them. Default to a `stub` implementation that returns a fake "verified" response for development — use it when `PEDESTAL_KYC_PROVIDER=stub`.
- Bad-actor check: part of the adapter. Both Middesk and Alloy support it; the adapter must surface that result regardless of which provider is configured.
- Write tests against the stub adapter so CI is green without real provider accounts.

### `/pedestal-stake/apply` — full flow

Follow the eight-step signup sequence from the B113 counsel-cleared addendum §Workstream 1. Implementation:

1. Email capture + consent — reuse the Phase 1 component; persist to `pedestal_applications` now (upsert from `pedestal_early_interest` if the email matches)
2. Offering Memorandum + Form C download + reader-attestation checkbox — render whatever content counsel has supplied; if content missing, show a clear TODO block and gate the flow with "Offering materials coming soon" — do NOT fabricate Form C content
3. Income + net worth self-declaration — reuse the Phase 1 `<RegCFCapCalculator />`, record declared values and computed cap into `pedestal_applications`
4. KYC via the adapter — call `verifyIdentity`, persist result
5. Bad-actor check — already inside the adapter response; persist
6. Subscription agreement e-signature — DocuSign OR HelloSign; pick ONE and document why. Use a sandbox tenant if Founder hasn't provisioned production yet. If neither is available, ship an "agreement sent to your email, sign and reply SIGNED" pre-signature placeholder flow and flag it clearly in the report
7. Payment via funding-portal adapter — pluggable interface `src/lib/funding-portal/` with a stub that records the payment intent only (status `awaiting_transfer`); Founder selects StartEngine / Republic / Wefunder before production, and a real implementation swaps in
8. Confirmation + issuance trigger + dashboard access granted

Each step writes to `pedestal_applications` with a `status` field advancing through the flow; a user refreshing mid-flow resumes where they left off.

### Issuance mechanics

- On flow completion (step 8), insert a row into `pedestal_holders` with the stake count + subscription reference
- Insert a corresponding row into `pedestal_issuance_log` (immutable audit)
- Increment the appropriate `regcf_offering_raises` row for cap tracking
- Generate a per-stake PDF certificate — use an existing PDF library already in the repo (grep for `pdf` / `jspdf` / `pdfkit`; pick whichever is in use)
- Store certificate in Supabase Storage bucket `upekrithen-pedestal-certificates` (Upekrithen-scoped, not LB-scoped); the PDF URL goes into `pedestal_holders.certificate_url`
- Send confirmation email via `send-transactional-email` edge function

### `/my/pedestal-stake` — investor dashboard

- Reads from `pedestal_holders` scoped by `auth.uid()`
- Shows: current holdings count, per-stake certificate download links, cumulative invested, computed individual cap remaining
- Does NOT show other members' data, does NOT join to `public.members`, does NOT show Upekrithen cap-table (that's admin-only in K433)

### Two-track separation test (extended)

Extend the K431 test suite with a test that verifies: a user who is BOTH an LB member AND a pedestal holder sees their LB member data on `/my` AND their pedestal holdings on `/my/pedestal-stake`, but no page joins the two datasets or implies equivalence. Switching-contexts UI (B113 addendum §Workstream 1 two-track section) — add the header-level context indicator (small "Liana Banyan Member" vs "Upekrithen Stakeholder" badge in page chrome) so users know which system they're looking at.

---

## Non-goals for K432

- No admin/compliance dashboard (K433)
- No cap-table view for staff (K433)
- No 506(c) flow (deferred indefinitely per B113 addendum)
- Do NOT execute real ACH transfers — stub only
- Do NOT commit any real production API keys for Middesk/Alloy/DocuSign/HelloSign; all in env vars, sandbox values acceptable in dev

---

## Reporting

1. Commit SHAs
2. Which KYC provider adapter you tested live (if any), which used the stub
3. Which e-signature provider chosen + rationale (one sentence)
4. End-to-end test: a dummy applicant completing all 8 steps — log transcript + screenshot of certificate PDF
5. Issuance-log write verified immutable (attempt UPDATE/DELETE should fail RLS)
6. Any gap requiring counsel content — list them
7. What's left for K433

---

## Estimated size

One focused Knight session if K431 landed all its scope. If Phase 1 left gaps (e.g., migration not applied), spend the first part of K432 closing those and scale Phase 2 down proportionally — report the cut clearly.

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*K432 dispatch written 2026-04-22 late evening by Bishop B115 (Claude Opus 4.7, 1M context). Phase 2 of K427 WS1. Depends on K431 Phase 1 shipping.*
