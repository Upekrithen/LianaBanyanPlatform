# BISHOP SYNTHESIS · EMPRESS NAMING CAMPAIGN · BP092
*1-Page Founder Summary — Review before ratifying Knight dispatch*
*Composed: Bishop SEG · Sonnet 4.6 · 2026-06-22*

---

## CAMPAIGN MECHANIC

**Headline (verbatim canon):** "The Empress MnemosyneC needs a New Name. Be a Bastion. Name the Empress. STOP the Nothing."

**Identity lock:** The Empress IS the Substrate. Not a character — the cooperative mesh itself. Portrait = Dr. MnemosyneC + crown overlay. No independent Empress art commissioned by Knight.

**Participation:** Anyone can view The Court leaderboard and cast ghost votes (Ghost World, ungated). To REGISTER a name proposal, member must join for $5/yr. Registration writes immutably to the IP Ledger (Ed25519-signed, local now; frontier replication when PATH X unblocks).

**Coincides with:** Wildfire Cue Deck Card campaign + Influencer contests. Each registered proposal auto-generates a shareable Wildfire card with referral link.

---

## PRIZE STRUCTURE

- **Pool:** 60 winners from the 300 Floater allocations of the 5% Founder Patent Portfolio
- **Geographic distribution:** 1 winner per country/local slot (definition = Open Question #3)
- **Win paths:** Bookworm · Influence · Participate (weighting = Open Question #7)
- **NOT buyable.** "Attention and Participation > Bags of Money."
- **Ghost votes do NOT count for prize eligibility.** Only real marks (member votes) determine winners.

---

## LEADERBOARD LAYOUT — "THE COURT"

```
┌─────────────────────────────────────────────────────────────────┐
│  👑  THE COURT                                                  │
│  The Empress needs a name. Ghost votes welcome. Join to win.   │
├────────┬──────────────┬──────────────────┬────────┬────────────┤
│ Member │ Proposed     │ Appearance       │ Votes  │            │
│ Name   │ Empress Name │ (picture)        │ ⚡/👻  │ [Vote]    │
├────────┴──────────────┴──────────────────┴────────┴────────────┤
│  ROWS 1-3  ·  Newest proposals                  (standard)     │
├────────────────────────────────────────────────────────────────┤
│  ROWS 4-6  ·  Day top-3 by real votes      *** HIGHLIGHTED *** │
├────────────────────────────────────────────────────────────────┤
│  ROWS 7-9  ·  Next newest proposals             (standard)     │
├────────────────────────────────────────────────────────────────┤
│  ROWS 10-12 · Week top-3 by real votes     *** HIGHLIGHTED *** │
├────────────────────────────────────────────────────────────────┤
│  ROWS 13-15 · Next newest proposals             (standard)     │
├────────────────────────────────────────────────────────────────┤
│  ROWS 16-18 · Overall top-3 by real votes  *** HIGHLIGHTED *** │
└────────────────────────────────────────────────────────────────┘
  Auto-refreshes every 30 seconds via vanilla JS. No page reload.
  ⚡ = real marks (member votes) · 👻 = ghost marks (evaporate daily)
  Highlighted rows: distinct border/color CSS class (court-top-row)
```

---

## GHOST WORLD ARCHITECTURE

| Layer | Ghost (ungated) | Member |
|-------|----------------|--------|
| View The Court | YES | YES |
| Cast votes | YES (ghost marks, evaporate daily) | YES (real marks, permanent) |
| Register proposal | NO (join required) | YES |
| Prize eligibility | NO | YES (registered proposals only) |
| IP Ledger entry | NO | YES (on registration) |
| Referral tracking | Passive (ref param in URL) | Active (referral_codes row) |

**Ghost marks:** Accumulate per ghost_session_id up to daily cap (default 500, pending OQ-1 confirm). Display on leaderboard in faded/italic style. Evaporate end-of-day. Ghost votes move the leaderboard display but do not affect prize draw.

**Join prompt:** Triggered on proposal submit click for non-members. Uses existing join modal (canon_join_modal_benefits_over_barrier, BP085). No new modal built.

---

## DEPLOY PLAN

| Block | What | Executor | Method |
|-------|------|----------|--------|
| Pre-apply (Bishop §15) | 5 Postgres migrations (tables, view, RLS) | Bishop | psql direct |
| Block 2 | empress-ip-ledger-hook edge function | Knight | supabase functions deploy |
| Block 3 | The Court Hugo page + home button | Knight | hugo --minify + firebase deploy --only hosting:mnemosyne |
| Block 4 | vote-empress edge function | Knight | supabase functions deploy |
| Block 5 | Wildfire card integration | Knight | schema extend or stub |
| Block 6 | Referral scaffold + influencer leaderboard | Knight | schema + Hugo sub-page |
| Block 7 | Country/local detection | Knight | geo-IP (if live) or self-declare UI |
| Block 8 | Deploy-all verification gate | Knight | curl checks + function list |

**Version bump:** Recommended minor bump (new user-facing feature). Founder confirms OQ-6 timing first.

**Firebase command (canonical):** `firebase deploy --only hosting:mnemosyne` — no raw gcloud, ever.

---

## RATIFICATION CHECKLIST (Founder action required before Knight fires)

- [ ] OQ-1: Ghost daily allowance confirmed (default: 500/day)
- [ ] OQ-2: Ghost-to-member unlock spec provided (or "stub for now" confirmed)
- [ ] OQ-3: Country/local definition locked (ISO country code / US-per-state / other)
- [ ] OQ-4: Vote weighting formula locked (separate columns OR combined weighted score)
- [ ] OQ-5: UNIQUE constraint confirmed (1 vote per member per proposal — yes/no)
- [ ] OQ-6: Campaign start date + end date provided
- [ ] OQ-7: Win-path weighting confirmed (equal-third / judged / vote-only)
- [ ] OQ-8: Wildfire schema status confirmed (live or not) — OR let Knight gadget it
- [ ] OQ-9: Appearance image storage confirmed (Supabase bucket OR external URL)
- [ ] OQ-10: Moderation policy confirmed (pre-review / community-flag / hybrid)
- [ ] Founder verbal or written GO on full dispatch

**Fastest ratification path:** Answer OQ-10, OQ-6, OQ-5, OQ-3 first — these four determine the schema Bishop must pre-apply. Everything else Knight can adapt during the Marathon.

---

*Dispatch file: KNIGHT_MARATHON_EMPRESS_NAMING_CAMPAIGN_BP092.md (same folder)*
*Staged. Not fired. Awaiting Founder ratification.*
