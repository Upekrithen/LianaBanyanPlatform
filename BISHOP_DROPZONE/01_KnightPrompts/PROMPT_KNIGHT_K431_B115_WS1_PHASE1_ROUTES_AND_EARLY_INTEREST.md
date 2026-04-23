# Knight K431 — K427 Workstream 1, Phase 1 of 3
## Pedestal Stake Reg CF portal: routes + testing-the-waters + investor-cap computation + Supabase schema
## Bishop B115 — 2026-04-22 (late evening)
## Parent scope: [K427 B113 Counsel-Cleared Full Dispatch](./PROMPT_KNIGHT_K427_B113_ADDENDUM_COUNSEL_CLEARED_FULL_DISPATCH.md)
## B115 preamble: [K427 B115 Dispatch-Ready Addendum](./PROMPT_KNIGHT_K427_B115_ADDENDUM_DISPATCH_READY.md)

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

## Phase scope — Phase 1 of 3

The K427 B113 counsel-cleared addendum is the authoritative scope document. Do not re-read it for the overall design; this file just says which slice to ship in this session.

**This session ships the five Pedestal Stake routes as working skeletons + the testing-the-waters flow end-to-end + the per-investor cap calculator + the Upekrithen-scoped Supabase schema (migration staged, NOT applied). No KYC, no payment, no issuance yet — those are K432 and K433.**

---

## Session hygiene

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K431`, `task="K427 WS1 Phase 1 — Pedestal Stake portal scaffold + testing-the-waters + investor-cap computation + Supabase schema"`.
2. `mcp__librarian__brief_me` with the same task.
3. Read these in order: [K427 B115 addendum](./PROMPT_KNIGHT_K427_B115_ADDENDUM_DISPATCH_READY.md), [K427 B113 counsel-cleared addendum](./PROMPT_KNIGHT_K427_B113_ADDENDUM_COUNSEL_CLEARED_FULL_DISPATCH.md), [K427 B111 stub](./PROMPT_KNIGHT_K427_B111_STUB_PEDESTAL_STAKE_PORTAL.md).
4. Read `project_upekrithen_seller_of_record.md` and `project_herjavec_upekrithen.md` in Bishop memory.
5. Read the existing MuseumApp.tsx routing (K427 WS3 already added `/who-can-use`, `/licensing`, `/entity-membership/apply`, `/entity-membership/dashboard` — grep to confirm before layering).

---

## Deliverables — Phase 1

### Routes (skeleton only — render, don't wire payment or KYC yet)

- `lianabanyan.com/pedestal-stake/learn` — public overview. Render from static content. Placeholders: Form C link, Offering Memorandum link, risk-factors block (counsel-provided content TBD; use TODO blocks).
- `lianabanyan.com/pedestal-stake/early-interest` — testing-the-waters signup. Working end-to-end in this session.
- `lianabanyan.com/pedestal-stake/apply` — full signup flow **route only**; gate with "Application opening soon — register interest above" placeholder. K432 wires the real flow.
- `lianabanyan.com/my/pedestal-stake` — logged-in investor dashboard **route only**; empty-state placeholder. K432 populates.
- `admin.lianabanyan.com/pedestal-stake` OR `/admin/pedestal-stake` — staff view **route only**; behind existing admin-auth gate. K433 populates.

Per B113 addendum non-goals: do NOT build the `/pedestal-stake/accredited/apply` (506c) route — reserve the path in the router config so it can be added later without rebuild, but do not implement.

### Testing-the-waters flow — WORKING end-to-end

- Email capture + explicit consent checkbox (CAN-SPAM-compliant copy — consent language placeholder, Founder can rewrite)
- POST to a new Supabase table `upekrithen.pedestal_early_interest` (schema below)
- Confirmation screen with next-steps expectation (application opens soon; we'll email you)
- Confirmation email via existing `send-transactional-email` edge function (already in platform per librarian brief) — template to be swapped later, placeholder acceptable now
- **No KYC**, no payment, no Form C reader-attestation. Reg CF explicitly allows testing-the-waters without those.

### Investor-cap computation library

New file `src/lib/regcf-investor-cap.ts` (or equivalent path — match the existing platform/ repo conventions):

- Input: `annualIncome: number`, `netWorth: number`
- Output: `{ cap: number, tier: "greater_path" | "lesser_path", rationale: string }`
- Formula (from B113 addendum §Workstream 1, Reg CF architecture):
  - If both `annualIncome` AND `netWorth` ≥ $124,000 → cap = 10% of max(annualIncome, netWorth), but not more than $124,000
  - Otherwise → cap = greater of $2,500 or 5% of max(annualIncome, netWorth)
- Dollar thresholds ($124K, $2,500) as named constants — SEC updates these periodically; easy to bump later
- Unit tests covering: both-above, both-below, one-above-one-below, exactly-at-threshold, zero income, zero net worth, negative net worth (reject)
- Component `<RegCFCapCalculator />` — interactive calculator on the `/pedestal-stake/learn` page. User types income + net worth, sees their cap live. Pure client-side, no server round-trip.

### Supabase schema (MIGRATION STAGED, NOT APPLIED)

Create the migration file in the platform repo but **do not run `supabase db push`**. Founder applies when ready.

Tables (Upekrithen-scoped, NOT Liana Banyan Corp tables — two-track separation per B113 addendum §Workstream 1):

- `upekrithen.pedestal_early_interest` — (email, consent_timestamp, consent_version, source_page, utm params, created_at)
- `upekrithen.pedestal_applications` — skeleton for K432: (investor_id, status, income_attested, net_worth_attested, computed_cap, form_c_accepted_timestamp, subscription_agreement_signed_at, kyc_provider, kyc_result, bad_actor_check_result, created_at, updated_at)
- `upekrithen.pedestal_holders` — skeleton for K432/K433: (holder_id, subscription_id, stake_count, certificate_url, issued_at, ...)
- `upekrithen.pedestal_issuance_log` — immutable audit. Write-only RLS policy.
- `upekrithen.regcf_offering_raises` — annual cap tracking per 12-month rolling window.

RLS policies:
- `early_interest`: anon INSERT only; staff SELECT
- `applications`: investor reads own row only; staff reads all
- `holders`: investor reads own row only; staff reads all
- `issuance_log`: nobody UPDATE or DELETE; staff SELECT; system INSERT only
- All tables: explicit denial of any FK to `public.members` or other LB-scoped tables — two-track separation enforced at schema level, not just app layer

### Two-track separation test

Write a failing test first (red), then make it pass (green): attempt to insert a `pedestal_holders` row where the `holder_id` matches an existing `members.user_id` — the insert MUST succeed (natural person can be both), but any query attempting to join `pedestal_holders` to `members` must fail (no FK relationship defined). Include this test in the repo's test suite.

---

## Non-goals for K431

- No KYC integration (K432)
- No Stripe / funding-portal / ACH (K432)
- No subscription-agreement e-signature flow (K432)
- No PDF certificate generation (K432)
- No admin dashboard contents (K433)
- No Form C / Offering Memorandum final content — counsel delivers later; use placeholders
- No 506(c) route implementation — reserve path only
- Do not apply migrations — stage only

---

## Reporting

1. Commit SHA(s) per platform/ + librarian-mcp-public (if touched)
2. Migration file path(s), verified NOT applied
3. `/pedestal-stake/early-interest` working URL + screenshot of a submitted test entry (staging)
4. Unit test results for `regcf-investor-cap.ts` (all passing)
5. Two-track-separation test result (green)
6. Any gap you flagged as requiring counsel content — list them

---

## Estimated size

One focused Knight session. If you run long on the router/auth plumbing because of existing MuseumApp.tsx scaffolding, stop at the end of "testing-the-waters flow working" and defer the schema migration to start of K432. Report accurately either way.

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*K431 dispatch written 2026-04-22 late evening by Bishop B115 (Claude Opus 4.7, 1M context). Phase 1 of K427 WS1. Authorizes Phase 1 scope only; Phase 2 begins at K432.*
