# KNIGHT YOKE · Dedicated /gemma/ Page + Interactive Comments + SUBSTRATE Blue Link Restore · BP084

**Session:** BP084
**Date:** 2026-06-15
**Founder ratify:** DIRECT — *"I want both: Add an interactive comment widget anchored to the Gemma section of how-it-works/_index.md ... PLUS Build a dedicated /gemma/ page (model explainer + benchmarks + comments). Supabase Comments (custom-built) — composes with member identity + Thorax heartbeat. You own the data. Best for cooperative-class brand. obviously."*

**Plus:** restore the missing blue SUBSTRATE link on `mnemosynec.ai/` homepage (`content/how-to-read-the-substrate/` exists empty — populate + restore anchor).

---

## 🩸 HARD BINDING — Sonnet 4.6 SEGs only

**USE Sonnet 4.6 SEGs FOR ALL WORK. DO NOT USE COMPOSER 2.5 OR ANY OTHER MODEL.**

Every SEG `model: 'sonnet'`. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

---

## Three deliverables, one yoke

### Deliverable A — Dedicated `/gemma/` first-class page
### Deliverable B — Interactive Supabase Comments (anchored, member-gated)
### Deliverable C — SUBSTRATE blue link restoration

---

## SEG-1 — Dedicated `/gemma/` page (Sonnet 4.6 SEG)

**Path:** `Cephas\cephas-hugo\content-mnemosynec\gemma\_index.md`

First-class explainer page for the Gemma model family inside MnemosyneC. Sections:

1. **What is Gemma** — Google's open-weight LLM family. Why we ship it inside MnemosyneC instead of routing to a paid API. Privacy posture (no token egress).
2. **The Gemma variants we use:**
   - **gemma2:2b** (1.5 GB, lightweight tier · M5 Son's hardware tier)
   - **gemma4:12b** (7 GB, premium tier · M0 Founder's hardware tier · the model behind 68/70)
3. **Why Gemma specifically** — license terms compatible with cooperative redistribution. Quality-per-watt favorable for consumer hardware. Google's stewardship vs. OpenAI's closed-weight posture.
4. **How Gemma performs in MnemosyneC** — link to the 68/70 MMLU-Pro disk-backed receipt + the 5-node constellation receipt (when it lands). Embedded benchmark table by tier.
5. **The substrate makes Gemma smarter** — link to `/how-to-read-the-substrate/` (Deliverable C) explaining how the substrate accumulator + Andon-Cord self-quarantine turn raw Gemma into 97.1% MMLU-Pro.
6. **Try it yourself** — link to Tower of Peace `/download/` + the Tools page `/tools/` for the CLI plow.
7. **Comments section** — Supabase Comments widget (Deliverable B).

**Frontmatter:**
```yaml
---
title: "Gemma — The Model Inside MnemosyneC"
date: 2026-06-15
description: "Why we ship Gemma inside the app. How it performs. What the substrate adds."
mimic-trunk-eligible: true
comments-enabled: true
comments-thread: "gemma-main"
---
```

URL: `https://mnemosynec.ai/gemma/` and `https://cephas.lianabanyan.com/gemma/` (same Hugo build, dual deploy targets).

---

## SEG-2 — Supabase Comments backend (Sonnet 4.6 SEG)

**Custom-built. Cooperative-class. Member-gated via Thorax heartbeat (per [[canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084]]).**

**Supabase schema migration:** `platform\supabase\migrations\20260616000001_comments.sql`

```sql
create table public.comments (
  id            uuid primary key default gen_random_uuid(),
  thread_slug   text not null,                 -- e.g., 'gemma-main', 'how-it-works-gemma-section'
  parent_id     uuid references public.comments(id) on delete cascade,  -- nested replies
  member_id     uuid not null references public.members(id) on delete cascade,
  body          text not null check (char_length(body) between 1 and 8000),
  body_html     text,                          -- sanitized render (server-side)
  created_at    timestamptz default now(),
  edited_at     timestamptz,
  deleted_at    timestamptz,                   -- soft delete
  flagged_count int default 0,                 -- member reports
  heartbeat_sig text not null,                 -- HMAC over (member_id, thread_slug, created_at, body)
  upvotes       int default 0,
  downvotes     int default 0
);

create index comments_thread_idx on public.comments(thread_slug, created_at desc) where deleted_at is null;

create table public.comment_votes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  member_id  uuid not null references public.members(id) on delete cascade,
  vote       int  not null check (vote in (-1, 1)),
  created_at timestamptz default now(),
  primary key (comment_id, member_id)
);

-- RLS policies: read = anyone (public), write = authenticated member only,
-- delete/edit = author only, soft-delete via deleted_at not destructive delete
alter table public.comments enable row level security;
create policy "comments_read_public" on public.comments for select using (deleted_at is null);
create policy "comments_insert_member" on public.comments for insert with check (member_id = auth.uid());
create policy "comments_update_author" on public.comments for update using (member_id = auth.uid());
create policy "comments_softdel_author" on public.comments for update using (member_id = auth.uid())
  with check (deleted_at is not null);
```

**Edge functions:**
- `comments-post` — accepts `{thread_slug, parent_id?, body, heartbeat_sig}`, verifies heartbeat signature against member's current session, sanitizes body via DOMPurify-server, returns inserted row
- `comments-list` — accepts `{thread_slug, after?, limit}`, returns paginated comments with author display_name from members table
- `comments-vote` — accepts `{comment_id, vote: -1|1}`, upserts vote
- `comments-flag` — accepts `{comment_id, reason}`, increments flagged_count, sends signal to Andon-Cord for review (per [[canon-mic-federated-andon-the-diagnosis-just-add-salt-bp083]])
- `comments-soft-delete` — author-only, sets deleted_at

**Heartbeat signature mechanic:** every comment carries an HMAC over `(member_id || thread_slug || created_at || body)` using a key derived from the member's authenticated session. This BINDS the comment to a heartbeat-attested member identity — meeting the [[canon-fork-derivative-cooperative-access-thorax-heartbeat-enforcement-bp084]] requirement for cooperative speech.

---

## SEG-3 — Comments client widget (Sonnet 4.6 SEG)

**Vanilla JS module:** `Cephas\cephas-hugo\static\js\comments.js`

Self-contained, no framework dependency. Drop-in `<div data-comments-thread="..."></div>` triggers mount.

Features:
- List existing comments, threaded replies (parent_id), sorted newest-first with infinite scroll
- Compose box with character counter (8,000 max)
- Member must be authenticated (Stripe Checkout flow from Join yoke pre-establishes member session)
- If not a member: compose box shows "Join the Cooperative to comment" + button that opens the Stripe modal (same modal from JOIN_FLOW_COLLAPSE yoke)
- Upvote / downvote (one per member per comment)
- "Flag" link → opens reason modal → routes to Andon-Cord
- "Reply" + "Edit" (author only) + "Delete" (author only, soft)
- Every interaction shows visible feedback within 200ms per BP078 every-click-feedback canon

**Render anchor:** include `<div data-comments-thread="gemma-main"></div>` at the bottom of the new `/gemma/` page AND `<div data-comments-thread="how-it-works-gemma-section"></div>` in the Gemma section of `how-it-works/_index.md`.

**Markdown body rendering:** light markdown subset client-side (paragraphs, bold/italic, inline code, links). Full markdown rejected to avoid XSS surface. Sanitize again client-side as defense-in-depth.

---

## SEG-4 — Gemma section anchor in how-it-works (Sonnet 4.6 SEG)

**File:** `Cephas\cephas-hugo\content-mnemosynec\how-it-works\_index.md`

At line ~215 ("Google Gemma 4 12B inside the app"):

1. Add `{#gemma}` anchor to the section heading so URLs can deep-link
2. Add a "→ Read more about Gemma" link to `/gemma/` (the new dedicated page from SEG-1)
3. Insert `<div data-comments-thread="how-it-works-gemma-section"></div>` after the Gemma paragraph block
4. Thread-slug `how-it-works-gemma-section` is DISTINCT from `gemma-main` so comments on the how-it-works page don't bleed into the dedicated /gemma/ page conversation, but power users can navigate between

---

## SEG-5 — Restore SUBSTRATE blue link (Sonnet 4.6 SEG)

**Empty page to populate:** `Cephas\cephas-hugo\content\how-to-read-the-substrate\_index.md`

Write the substrate explanation page from scratch. Content sections:

1. **Substrate, plain English** — the verified-knowledge accumulator. Not a database, not a vector store, not "training data" — an accumulator of canonical answers earned through the Plow Pipeline.
2. **The three layers** (per [[canon-catacombs-librarian-corps-cold-archive-refinement-bp083]]):
   - **Hot** — actively-queried eblets, top BM25
   - **Warm** — pheromone-strengthening, fading
   - **Cold (Catacombs)** — entombed but accessible
3. **How the substrate gets smarter** — Plow loop writes only verified-correct answers as eblets. Reader/Verifier/Accumulator architecture (per [[reference-substrate-verified-knowledge-accumulator-canon-bp080]]).
4. **Why it cures AI Amnesia** — every previous session's verified answers are still there. The model gets smarter over time on YOUR machine, with YOUR data, never leaving YOUR substrate.
5. **What it composes with** — Gemma (the reader/model), Federation Node Frontier (cooperative-class substrate sharing per [[reference-federation-node-frontier-capsules-thorax-cooperative-work-bp083]]), Six-folder layout (per [[canon-mnemosynec-self-context-memory-md-six-folder-substrate-layout-bp083]])
6. **Receipts** — link to the 68/70 disk-backed canonical receipt + the constellation receipt when it lands.

**Frontmatter:**
```yaml
---
title: "How to Read the Substrate"
date: 2026-06-15
description: "The verified-knowledge accumulator inside MnemosyneC. Cures AI Amnesia."
mimic-trunk-eligible: true
comments-enabled: true
comments-thread: "substrate-main"
---
```

**Restore the blue SUBSTRATE link on the homepage:**

File: `Cephas\cephas-hugo\content-mnemosynec\_index.md` (or whichever file builds mnemosynec.ai homepage hero — verify path)

Find the hero body text — currently reads something like *"…a permanent, private memory that actually stays"* — add an inline blue link on the word **substrate** wherever it appears (or insert a sentence: *"Your private [substrate](/how-to-read-the-substrate/) is the accumulator that makes Gemma smarter every session."*).

Also: add the same anchor link to the how-it-works page Gemma section ("MnemosyneC is the [substrate](/how-to-read-the-substrate/) that remembers your context").

Style: standard Cephas blue link color, no special treatment.

---

## SEG-6 — Mimic Trunk eligibility flags (Sonnet 4.6 SEG)

Per the new [[canon-mimic-trunks-gate-and-tunnel-partner-cooperative-volume-benefits-bp084]], all three new/updated pages MUST carry:
- `mimic-trunk-eligible: true` in frontmatter (done in SEGs above)
- Small footer link: *"Fork this page on a Mimic Trunk →"* → `/bounties/mimic-trunks/`

Add this to the Hugo partial `layouts/partials/footer.html` so it appears site-wide on any page with `mimic-trunk-eligible: true`.

---

## SEG-7 — Deploy + BP080 4-Sharpening (Sonnet 4.6 SEG)

Use atomic-deploy.ps1. Sharps (all literal HTTP 200 first hop):

- Sharp 1: `curl -sI https://mnemosynec.ai/gemma/` → 200 + body grep "Gemma — The Model Inside MnemosyneC"
- Sharp 2: `curl -sI https://mnemosynec.ai/how-to-read-the-substrate/` → 200 + body grep "verified-knowledge accumulator"
- Sharp 3: `curl -s https://mnemosynec.ai/` body grep `href="/how-to-read-the-substrate/"` (anchor restored) AND `>substrate<` text styled as link
- Sharp 4: Supabase migration applied · `comments` table exists in production · RLS policies verified
- Sharp 5: 4 edge functions deployed and callable: comments-post, comments-list, comments-vote, comments-flag
- Sharp 6: Comments widget mounts on `/gemma/` AND on `how-it-works/#gemma` (verify via headless browser snapshot)
- Sharp 7: Compose box on `/gemma/` for unauthenticated visitor shows "Join the Cooperative to comment" + opens Stripe modal (compose-and-fire path with test mode)
- Sharp 8: Heartbeat signature on test-post is validated server-side · invalid signature returns 403

NO COSMETIC-GREEN. NO TIMEOUT-SWALLOWED-YELLOW. HONEST RED if any 302 or 500.

---

## Yoke-return spec

Each SEG status + commits + 8 Sharps with literal HTTP codes + screenshots of `/gemma/` page + screenshot of `/how-to-read-the-substrate/` page + screenshot of restored SUBSTRATE blue link on homepage + verbatim "Sonnet 4.6".

---

## Composition notes for Bishop

- New thread_slugs introduced: `gemma-main`, `how-it-works-gemma-section`, `substrate-main`. Reserve naming convention: `{primary-topic}-main` for main page threads, `{page}-{section}-section` for embedded threads.
- Comments widget is reusable site-wide — once SEG-3 ships, any page can add `<div data-comments-thread="..."></div>` and inherit the same backend. Future yokes can opt-in any page.

**FOR THE KEEP.**
