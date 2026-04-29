# Cephas Pre-Submission for Publication — Member Voting + Acceptance Rewards System

(LB membership pricing identical for all members at $5/year, unchanged. All economics references in this scope memo are membership-orthogonal — Marks-currency reward flow, AI-compute industry term, IP-allocation industry term — none reference membership pricing.)

**Filed:** 2026-04-29 by Bishop on Founder direction (B134 turn 16)
**Class:** New system spec, applies existing Six Degrees + Marks canon to publication-acceptance reward flow
**Founder articulation:** *"if members vote for written works to submit to publications that then get accepted by those publications; they get a reward already, I think, and if not then make it double what they voted with — funded through LB patents that are connected to the material that they are voting gets VIEWED by using Six Degrees of Separation and the Rewards program to secure it."*

---

## Existing canon this composes (research result per Founder direction)

1. **Glass Door Open Outreach (#2262 + #2327, B131 ratifications)** — letters published on Cephas as locked drafts BEFORE dispatch; members vote on amplification priority + Six-Degrees activation; Founder retains dispatch authority.
2. **Six Degrees of Separation activation (B131)** — member views letter on Cephas → recognizes recipient in personal/professional/family network → flags via vote → triggers Six-Degrees mechanism. LB platform aggregates flags per recipient. When dispatch fires, Six-Degrees-flagged members get a copy + invitation to introduce/amplify via their network.
3. **Rolodex Level 2 — Handshake (project_the_rolodex.md)** — mutual cross-promotion via PLUGS + Battery. Time-bound. Both earn Marks.
4. **Rolodex Level 3 — Pipeline** — connected selling. Referral Marks for conversions. ONE LEVEL ONLY (no MLM chains; `feedback_attribution_one_level.md`).
5. **Marks currency** — effort-differential, all-backed (per MEMORY.md "Three Currencies"; project_mark_backing_oneway.md). Earned via sponsorship + cross-promotion + referral conversion.
6. **IP Allocation 60/20/10/10 (industry term, membership-orthogonal)** — patent revenue flows: 60% patent buckets / 20% Founder-creator / 10% global sponsor pool / 10% individual Pedestals.

## What Founder's Pre-Submission system extends

The existing Six Degrees + Marks framework was built for **Crown Letter dispatch**. Founder's B134 ask **applies the same framework to written-work submission to external publications** (WIRED, MIT TR, The Information, NYT, Atlantic, Substack, etc.).

**Mapping:**

| Crown Letter dispatch (existing) | Pre-Submission for Publication (new) |
|---|---|
| Letter published on Cephas pre-dispatch | Written work published on Cephas pre-submission |
| Member vote = amplification priority + Six-Degrees activation | Member vote = which Pre-Submission goes to which target publication |
| Recipient experiences letter from LB AND from network simultaneously | Publication editor / readership encounters work via LB AND member-network amplification |
| Member who flags recipient → introduces / amplifies → earns Marks via Rolodex Level 2 PLUGS+Battery | Member who voted for accepted-Pre-Submission → earns Marks reward (rate TBD per Founder spec) |
| Founder retains dispatch authority | Founder retains submission authority (member vote informs, doesn't bind) |

## Spec elements (Founder articulation expanded)

### 1. Pre-Submission publication on Cephas

- Written works (papers, op-eds, Substack drafts, pitch letters, Pudding entries) get published on Cephas in a "Pre-Submission" section BEFORE submission to external target publication.
- Status flag: `PRE_SUBMISSION_OPEN` (members can vote) / `SUBMITTED` (Founder fired to target) / `ACCEPTED` (target accepted) / `PUBLISHED_EXTERNAL` (target published) / `REJECTED` (target declined; Pre-Submission stays available for re-target).
- Each Pre-Submission lists candidate target publications (e.g., "WIRED", "MIT Tech Review", "The Atlantic"). Members vote on which target.

### 2. Member vote mechanics

- Each member can vote with **N Marks** as stake on a Pre-Submission going to target publication T.
- Vote stake range: TBD per Founder spec (suggest min 1 Mark, max 100 Marks per Pre-Submission per member to prevent whale dominance).
- Vote tally per target = sum of member-Marks-staked. Highest-Mark target = recommended fire order; Founder retains submission authority.
- Vote scope: which target publication. NOT vote on whether to write the work / whether to submit at all.

### 3. Six Degrees activation for VIEWING

- When work is submitted (status flips to `SUBMITTED`), Six-Degrees-flagged members get notification + invitation to amplify-via-network.
- Member identifies they know editor X at WIRED → flags via Six-Degrees mechanism.
- Member's network introduction routes around editorial gatekeeping (W-001 Wisdom Guide: *"Never accept a No from someone who can't give you a Yes to begin with"*).
- Six-Degrees flagging happens at submission time, not vote time (vote = "should we submit"; Six-Degrees = "I can help land it").

### 4. Acceptance reward (the Founder ask)

- When external target publication ACCEPTS the Pre-Submission (status flips to `ACCEPTED`):
  - **All members who voted YES on that target** receive a Marks reward.
  - **Reward formula candidate (Founder ratification needed):** 2× the Marks they staked. (Founder articulation: *"if not then make it double what they voted with"*.)
  - Funding source: **LB patent revenue connected to the material the work discusses.** Specifically, the 60/20/10/10 IP allocation's "10% global sponsor pool" slice can fund Pre-Submission rewards (proposal — Founder ratification needed).
- Members who voted YES but target REJECTED: vote-stake is consumed (not refunded). Discipline: votes are skin-in-the-game, not free.
- Members who voted YES but target PENDING: vote-stake escrowed until status flips.

### 5. Rolodex Level 2 PLUGS+Battery integration

- The mutual-cross-promotion pattern from Rolodex Level 2 maps cleanly: LB writes the work; member-network amplifies via Six Degrees; both earn Marks through the Battery (the time-bound mutual exchange).
- Battery period: from `SUBMITTED` to `PUBLISHED_EXTERNAL` (typically 1-90 days depending on publication cycle).
- Marks flow: 2× vote stake to voting members on `ACCEPTED`; additional Marks to Six-Degrees flaggers who landed the introduction (separate flow, scoped per Rolodex Level 2 standard rates — TBD per Founder).

### 6. Anti-gaming protection

- ONE LEVEL ONLY attribution preserved (`feedback_attribution_one_level.md`) — no member earns from another member's voting downline.
- Per-member-per-Pre-Submission cap on vote stake (e.g., 100 Marks max) prevents whale dominance.
- Six-Degrees flag verification — flagging members must have demonstrable network connection (LinkedIn confirmation, email-domain match, prior-correspondence record, etc.) to claim Six-Degrees Marks.
- Pre-Submission cannot be self-voted-by-author (creator and Founder excluded from voting on their own works).

### 7. Funding flow — patent-revenue → Marks-reward

- LB patent revenue (e.g., from #2278 Cathedral Effect licensing, #2295 Sphinx Federation deployment, #2287 Partnership-Stake reversions) flows per 60/20/10/10 IP allocation (industry term, membership-orthogonal — pricing identical for all members at $5/year, unchanged).
- The 10% global sponsor pool is the natural funder for Pre-Submission acceptance rewards.
- Marks paid to voting members are backed by patent-revenue allocation; Marks remain backed currency per `project_mark_backing_oneway.md` invariant.

## Knight K-prompt scope (paste-ready when Founder fires)

```
K-Cephas-Presubmission-Voting-Rewards-MVP-B134

SCOPE:
1. Read full scope memo at BISHOP_DROPZONE/03_BishopHandoffs/CEPHAS_PRESUBMISSION_VOTING_REWARDS_SCOPE_MEMO_B134.md
2. Read existing Glass Door Open Outreach implementation (Cephas locked-draft publication flow, K412 deployed B118) and existing Rolodex Level 2 PLUGS+Battery code paths
3. Read existing Marks currency code (project_mark_backing_oneway.md + supabase Marks tables)
4. Build:
   a. Cephas Pre-Submission section (status flags + vote tallies per target)
   b. Member vote-with-Marks-stake UI flow + escrow logic
   c. Six-Degrees activation flow at submission time (separate from vote)
   d. Acceptance reward distribution (2× stake to YES voters when target ACCEPTS)
   e. Funding-source flow (10% global sponsor pool → Marks-reward escrow → distribution)
   f. ONE LEVEL ONLY attribution enforcement
   g. Anti-gaming protections (per-member cap, self-vote prevention, Six-Degrees verification)
5. Tests: 13+ unit tests covering vote flow, escrow, acceptance distribution, anti-gaming, ONE LEVEL ONLY attribution
6. Phase A.0 brief_me + Detective canon search before each phase
7. BRIDLE v11 enforced (Rule 11A no-counsel-gate, Rule 11B no-prose-pass-timing-pressure)
8. Stone Tablet Imperative — new artifacts, no in-place edits to existing Glass Door code

PUBLICATION GATE HARD per Fire Control: feature is internal until Founder fires public deployment.

Tag-on-close: v-cephas-presubmission-voting-rewards-mvp-K<INTEGER>

Bishop standing by for closeout ratification.
```

## What I think (anchored)

This is structurally coherent and applies existing canon cleanly. The Founder's "research existing system and apply" direction was right — Six Degrees + Marks + Rolodex Level 2 + Glass Door Open Outreach + IP allocation pool + Pledge framework all compose. **Low net-new architecture; high net-new market value.**

**Anchored receipts:**
- Glass Door Open Outreach (#2262/#2327) was K537-landed B132 — proves the publication-on-Cephas + member-vote pattern is shippable
- Marks currency is live infrastructure (supabase Marks tables exist per database schema)
- Rolodex Level 2 PLUGS+Battery is canonical (project_the_rolodex.md)
- ONE LEVEL ONLY attribution is canonized (feedback_attribution_one_level.md)

**Risk worth flagging:**
- 2× vote-stake reward feels generous; if many members vote and target accepts, reward pool drains fast. Suggest Founder review the multiplier (1.5×? 1×? variable based on target prestige?).
- Funding from 10% sponsor pool may compete with other sponsor-pool obligations. Founder should specify allocation priority.
- Six-Degrees verification mechanism needs concrete spec — what counts as "demonstrable network connection"? LinkedIn-only? Or broader? Anti-gaming depends on this.

These are tunable parameters, not deal-breakers. Refinable in K-MVP through Founder's first prose-pass when the feature exists in real form.

## Patent-claim implication for Prov 16

This system is itself patentable as method+system: cooperative content-amplification with Marks-stake voting + Six-Degrees activation + acceptance-reward funded from patent revenue connected to the content's subject matter. Distinguishable from:
- Reddit upvoting (no Marks economics, no acceptance reward, no Six-Degrees flagging)
- Hacker News upvoting (same)
- Patreon tier-rewards (one-direction creator-to-supporter, no member-vote-amplifying-content)
- Substack subscription (no member-vote content selection)

**Add to Prov 16 spec as #2288 candidate** (Bishop scaffolds; Founder ratifies number assignment).

## Standing on Founder ratification

1. Reward formula: 2× vote-stake (Founder articulation) confirmed?
2. Funding source: 10% global sponsor pool slice — confirmed?
3. Six-Degrees verification spec — Founder fire on what counts as network connection
4. Per-member vote cap — Founder fire on max Marks per Pre-Submission per member
5. Knight K-prompt fire timing — fire now (parallel with Bishop-2 Prov 16 + Pawn PP-for-proof) or sequential after Pawn returns?
