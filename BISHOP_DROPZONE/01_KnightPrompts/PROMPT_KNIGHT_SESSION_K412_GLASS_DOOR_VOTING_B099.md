# Knight Prompt — K412: The Glass Door Phase 2 — Member-Voted Outreach Dispatch

**From:** Bishop B099
**Date:** 2026-04-11
**Innovation:** #2262 The Glass Door — `BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2262_THE_GLASS_DOOR_B099.md`
**Phase 1 spec:** `BISHOP_DROPZONE/GLASS_DOOR_PHASE_1_PUBLICATION_DISCIPLINE_B099.md` (Bishop content discipline, no code)
**Composes with:** #2238 TouchStone, #2246 Living Laboratory, #2248 Hemispheric Protocol, #2260 Cooperative Defensive Patent Pledge, K404b Open Water, K409 Response Playbook, K411 Helm Schedule
**Counts as:** 1 of 3 Knight session features
**Estimated scope:** 2 migrations + 3 edge functions + 2 React components + TouchStone predicate + integration patches to existing letter dispatch flow
**Founder sign-off:** Confirmed B099 — *"consider me signed off on the Glass Door"*

---

## Founder ask (verbatim, B099)

> "I want all of that published on Cephas from the start. So that if anyone looks, they can see the letter that I am GOING to send to those people, and on what day I am sending it. Because can't those also be voted on?"

The Founder wants member voting on outbound letters before they ship, with the entire process publicly visible on Cephas. Phase 1 is a Bishop content discipline (no code). Phase 2 — this prompt — is the database, voting service, TouchStone predicate, and UI that turns the discipline into structurally enforced cooperative governance of outbound communications.

---

## Build steps

### Step 1 — Migration: `outreach_letters` schema

Create migration `platform/supabase/migrations/20260413000001_k412_glass_door.sql`:

```sql
-- K412 Glass Door Phase 2 — Member-Voted Outreach Dispatch
-- Innovation #2262 The Glass Door (Bishop B099)
-- Composes with #2238 TouchStone (vote-as-predicate gate)

CREATE TABLE IF NOT EXISTS outreach_letters (
  letter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_category TEXT NOT NULL
    CHECK (recipient_category IN (
      'crown_letter', 'research_invitation', 'press_pitch',
      'partnership_ask', 'patron_outreach', 'media_pitch',
      'follow_up', 'apology', 'other'
    )),
  recipient_tier SMALLINT DEFAULT 5,
  state TEXT NOT NULL DEFAULT 'draft'
    CHECK (state IN (
      'draft', 'proposed', 'scheduled', 'dispatched',
      'acknowledged', 'answered', 'no_response', 'withdrawn', 'retracted'
    )),
  full_text TEXT NOT NULL,
  substantive_summary TEXT,
  what_we_are_asking TEXT NOT NULL,
  what_we_are_not_asking TEXT,
  why_this_recipient TEXT,
  source_letter_file TEXT,
  source_innovation_refs INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  scheduled_dispatch TIMESTAMPTZ,
  dispatched_at TIMESTAMPTZ,
  voting_mode TEXT NOT NULL DEFAULT 'advisory'
    CHECK (voting_mode IN ('advisory', 'binding')),
  voting_window_start TIMESTAMPTZ,
  voting_window_end TIMESTAMPTZ,
  vote_threshold_approval_pct NUMERIC DEFAULT 60.0,
  vote_threshold_veto_pct NUMERIC DEFAULT 10.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_outreach_letters_state ON outreach_letters (state);
CREATE INDEX idx_outreach_letters_scheduled ON outreach_letters (scheduled_dispatch) WHERE state = 'scheduled';
CREATE INDEX idx_outreach_letters_slug ON outreach_letters (slug);

CREATE TABLE IF NOT EXISTS outreach_letter_votes (
  vote_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL
    CHECK (vote_type IN ('approve', 'request_edit', 'delay', 'redirect', 'veto', 'abstain')),
  comment TEXT,
  proposed_edit TEXT,
  proposed_delay_days INTEGER,
  proposed_redirect_recipient TEXT,
  voted_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (letter_id, member_id)
);

CREATE INDEX idx_outreach_votes_letter ON outreach_letter_votes (letter_id);
CREATE INDEX idx_outreach_votes_member ON outreach_letter_votes (member_id);

CREATE TABLE IF NOT EXISTS outreach_letter_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  response_received_at TIMESTAMPTZ NOT NULL,
  response_summary TEXT NOT NULL,
  response_full_text_redacted TEXT,
  response_classifier TEXT
    CHECK (response_classifier IN (
      'positive', 'neutral', 'declined', 'asked_followup', 'no_substantive', 'hostile', 'other'
    )),
  platform_downstream_action TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_outreach_responses_letter ON outreach_letter_responses (letter_id);

CREATE TABLE IF NOT EXISTS outreach_letter_retractions (
  retraction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id UUID NOT NULL REFERENCES outreach_letters(letter_id) ON DELETE CASCADE,
  proposed_at TIMESTAMPTZ DEFAULT now(),
  proposed_by UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  vote_threshold_pct NUMERIC DEFAULT 50.0,
  state TEXT NOT NULL DEFAULT 'proposed'
    CHECK (state IN ('proposed', 'approved', 'rejected', 'executed')),
  apology_text TEXT,
  executed_at TIMESTAMPTZ
);

-- RLS: anyone can read; only authenticated members can vote; only Bishop role can create/update
ALTER TABLE outreach_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_letters_public_read ON outreach_letters FOR SELECT USING (state != 'draft');
CREATE POLICY outreach_letters_bishop_write ON outreach_letters FOR ALL
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE email IN (
    'jonathan@lianabanyan.com', 'bishop@lianabanyan.com'
  )));

ALTER TABLE outreach_letter_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_votes_public_read ON outreach_letter_votes FOR SELECT USING (true);
CREATE POLICY outreach_votes_member_insert ON outreach_letter_votes FOR INSERT
  WITH CHECK (auth.uid() = member_id);
CREATE POLICY outreach_votes_member_update ON outreach_letter_votes FOR UPDATE
  USING (auth.uid() = member_id);

ALTER TABLE outreach_letter_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_responses_public_read ON outreach_letter_responses FOR SELECT USING (true);

ALTER TABLE outreach_letter_retractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY outreach_retractions_public_read ON outreach_letter_retractions FOR SELECT USING (true);
```

### Step 2 — Vote tally function (computes governance verdict)

```sql
CREATE OR REPLACE FUNCTION compute_outreach_letter_verdict(p_letter_id UUID)
RETURNS TABLE(
  total_votes INTEGER,
  approve_count INTEGER,
  veto_count INTEGER,
  approval_pct NUMERIC,
  veto_pct NUMERIC,
  verdict TEXT,
  next_action TEXT
) AS $$
DECLARE
  v_letter outreach_letters%ROWTYPE;
  v_total INTEGER;
  v_approve INTEGER;
  v_veto INTEGER;
  v_approval_pct NUMERIC;
  v_veto_pct NUMERIC;
  v_verdict TEXT;
  v_next_action TEXT;
BEGIN
  SELECT * INTO v_letter FROM outreach_letters WHERE letter_id = p_letter_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'letter not found';
  END IF;

  SELECT COUNT(*),
         COUNT(*) FILTER (WHERE vote_type = 'approve'),
         COUNT(*) FILTER (WHERE vote_type = 'veto')
    INTO v_total, v_approve, v_veto
    FROM outreach_letter_votes
    WHERE letter_id = p_letter_id;

  IF v_total = 0 THEN
    v_approval_pct := 0;
    v_veto_pct := 0;
    v_verdict := 'no_votes';
    v_next_action := 'awaiting_votes';
  ELSE
    v_approval_pct := (v_approve::NUMERIC / v_total) * 100;
    v_veto_pct := (v_veto::NUMERIC / v_total) * 100;

    IF v_veto_pct >= v_letter.vote_threshold_veto_pct THEN
      v_verdict := 'vetoed';
      v_next_action := 'block_dispatch';
    ELSIF v_approval_pct >= v_letter.vote_threshold_approval_pct THEN
      v_verdict := 'approved';
      v_next_action := 'authorize_dispatch';
    ELSE
      v_verdict := 'pending';
      v_next_action := 'awaiting_more_votes';
    END IF;
  END IF;

  RETURN QUERY SELECT v_total, v_approve, v_veto, v_approval_pct, v_veto_pct, v_verdict, v_next_action;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Step 3 — TouchStone predicate: `letter_dispatch_authorized`

Create `librarian-mcp/touchstone/predicates/letter_dispatch_authorized.py`:

```python
"""
TouchStone Predicate: letter_dispatch_authorized
Innovation #2262 The Glass Door

Returns True iff the letter's voting verdict permits dispatch and the
scheduled dispatch timestamp has arrived.
"""

from typing import Tuple
from .base import Predicate, PredicateResult


class LetterDispatchAuthorized(Predicate):
    name = "letter_dispatch_authorized"
    description = "Returns True iff the Glass Door governance verdict authorizes dispatch and the scheduled time has arrived."

    def evaluate(self, letter_id: str) -> PredicateResult:
        # Query Supabase for the letter and its current verdict
        letter = self.db.table("outreach_letters").select("*").eq("letter_id", letter_id).single().execute()
        if not letter.data:
            return PredicateResult(False, f"letter {letter_id} not found")

        l = letter.data

        # State must be 'scheduled'
        if l["state"] != "scheduled":
            return PredicateResult(False, f"state is {l['state']}, must be 'scheduled'")

        # Scheduled dispatch must have arrived
        from datetime import datetime, timezone
        if datetime.fromisoformat(l["scheduled_dispatch"]) > datetime.now(timezone.utc):
            return PredicateResult(False, f"scheduled_dispatch {l['scheduled_dispatch']} not yet reached")

        # Compute verdict via RPC
        verdict = self.db.rpc("compute_outreach_letter_verdict", {"p_letter_id": letter_id}).execute()
        if not verdict.data:
            return PredicateResult(False, "verdict computation failed")

        v = verdict.data[0]

        # Advisory mode: verdict does not block
        if l["voting_mode"] == "advisory":
            return PredicateResult(
                True,
                f"advisory mode; verdict={v['verdict']} ({v['approval_pct']:.1f}% approve, {v['veto_pct']:.1f}% veto)"
            )

        # Binding mode: verdict gates dispatch
        if v["verdict"] == "approved":
            return PredicateResult(True, f"binding approval ({v['approval_pct']:.1f}% approve)")
        elif v["verdict"] == "vetoed":
            return PredicateResult(False, f"binding veto ({v['veto_pct']:.1f}% veto)")
        else:
            return PredicateResult(False, f"binding pending; insufficient votes (verdict={v['verdict']})")
```

Register the predicate in the TouchStone predicate index. Increment predicate count from 7 → 8.

### Step 4 — Edge function: `dispatch-outreach-letter`

Create `platform/supabase/functions/dispatch-outreach-letter/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { letter_id } = await req.json();

  // Predicate gate via TouchStone
  const predicateRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/touchstone-evaluate-predicate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        predicate_name: "letter_dispatch_authorized",
        args: { letter_id },
      }),
    }
  );

  const predicate = await predicateRes.json();
  if (!predicate.satisfied) {
    return new Response(
      JSON.stringify({ dispatched: false, reason: predicate.reason }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Predicate satisfied; perform actual dispatch
  // (Hand off to the existing dispatch-letter edge function for the physical send)
  const dispatchRes = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/dispatch-letter`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ outreach_letter_id: letter_id }),
    }
  );

  const dispatch = await dispatchRes.json();

  // Update outreach_letters state
  await supabase
    .from("outreach_letters")
    .update({
      state: "dispatched",
      dispatched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("letter_id", letter_id);

  return new Response(
    JSON.stringify({ dispatched: true, dispatch_result: dispatch }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
```

### Step 5 — Edge function: `cast-outreach-letter-vote`

Create `platform/supabase/functions/cast-outreach-letter-vote/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { letter_id, vote_type, comment, proposed_edit, proposed_delay_days, proposed_redirect_recipient } = await req.json();

  // Get the authenticated user
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  // Upsert vote (one vote per member per letter; updating replaces)
  const { error } = await supabase
    .from("outreach_letter_votes")
    .upsert({
      letter_id,
      member_id: user.id,
      vote_type,
      comment,
      proposed_edit,
      proposed_delay_days,
      proposed_redirect_recipient,
      voted_at: new Date().toISOString(),
    }, { onConflict: "letter_id,member_id" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  // Recompute verdict
  const verdictRes = await supabase.rpc("compute_outreach_letter_verdict", { p_letter_id: letter_id });

  return new Response(
    JSON.stringify({ ok: true, verdict: verdictRes.data?.[0] }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
```

### Step 6 — Edge function: `outreach-dispatch-cron` (scheduled gate evaluator)

Create `platform/supabase/functions/outreach-dispatch-cron/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find letters scheduled for dispatch whose time has come
  const { data: ready } = await supabase
    .from("outreach_letters")
    .select("letter_id")
    .eq("state", "scheduled")
    .lte("scheduled_dispatch", new Date().toISOString());

  const results = [];
  for (const l of ready || []) {
    const res = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/dispatch-outreach-letter`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ letter_id: l.letter_id }),
      }
    );
    results.push({ letter_id: l.letter_id, ok: res.ok });
  }

  return new Response(JSON.stringify({ count: results.length, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

Register a pg_cron job to call this every 5 minutes (slower than helm-task-dispatcher; outreach letters are not minute-sensitive):

```sql
-- 20260413000002_k412_outreach_cron.sql
SELECT cron.schedule(
  'outreach-dispatch-cron',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/outreach-dispatch-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
  $$
);
```

### Step 7 — React components

**`<OutreachLetterCard />`** — public-facing card rendering one outreach letter for the Cephas page (server-rendered, no auth required for read). Path: `platform/src/components/outreach/OutreachLetterCard.tsx`.

Renders:
- Recipient name + category + tier badge
- State badge (color-coded by state)
- Scheduled dispatch timestamp prominently
- "What we are asking" + "What we are NOT asking" sections
- Full letter text (collapsible)
- "Why this recipient" section
- Real-time vote tally (count + percentages)
- Recent comments
- Response section (if state ≥ dispatched)

**`<OutreachLetterVotePanel />`** — authenticated-member voting interface. Path: `platform/src/components/outreach/OutreachLetterVotePanel.tsx`.

- Six radio buttons: approve, request_edit, delay, redirect, veto, abstain
- Optional textareas for comment, proposed_edit, proposed_redirect_recipient
- Numeric input for proposed_delay_days (when "delay" selected)
- Submit button calls `cast-outreach-letter-vote` edge function
- Shows current verdict computation result after vote
- Shows whether the user has already voted (and their previous vote)

**`<OutreachIndexPage />`** — `/outreach` route on the main site, listing all outreach letters by state.

Sections: "Scheduled to dispatch" (sorted by date), "Currently dispatched, awaiting response", "Answered", "Withdrawn or retracted", "All". Each entry links to the individual letter page.

**`<HelmGlassDoorCard />`** — Helm Dashboard card for the Founder showing pending letters in the Founder's queue with vote tallies. Composes with the K411 Helm Schedule card.

### Step 8 — Cephas Hugo template

Add a Hugo content type at `cephas/content/outreach/_index.md` and a layout at `cephas/layouts/outreach/single.html` that renders the outreach letter from the Supabase API and embeds the React components.

The Cephas pages live at `cephas.lianabanyan.com/outreach/{slug}` and the master index at `cephas.lianabanyan.com/outreach`.

### Step 9 — Integration patches

**Patch `dispatch-letter` edge function (existing):**
- When called with `outreach_letter_id` (new param), look up the outreach_letters row, do the physical send, and write the dispatch event back to outreach_letters.state and outreach_letters.dispatched_at
- Existing call signature without `outreach_letter_id` continues to work for non-Glass-Door letters

**Patch `log-letter-response` edge function (existing):**
- When a response is logged for a letter that has an outreach_letter_id, also write to the outreach_letter_responses table with the appropriate redaction
- The Glass Door page picks up the response automatically via the existing public read policy

**Patch K409 Response Playbook TouchStone wiring:**
- The `response_received_within` predicate from K409 should also fire updates to `outreach_letters.state = 'answered'` when a response lands within the window
- The K411 Helm task that was created at letter dispatch should be auto-cancelled (already wired in K411)

### Step 10 — Bishop content backfill helper

Create a helper script (Python or Node, Bishop-runnable) at `librarian-mcp/glass-door/backfill_existing_letters.py` that reads each existing Crown letter from `BISHOP_DROPZONE/06_Letters/` and `letter_dispatch_queue` (Supabase), generates a structured outreach_letters row for each, and produces a CEPHAS_OUTREACH markdown file. Bishop runs this once to backfill the 92 existing Crown letters.

---

## Smoke tests

After deploy:

1. **Create test letter:** Insert an outreach_letters row with `state='proposed'`, `voting_mode='advisory'`, `scheduled_dispatch=now() + 5 minutes`, slug='test-letter'. Confirm Cephas page renders at `cephas.lianabanyan.com/outreach/test-letter`.
2. **Cast votes:** Have 3 test users cast different votes (approve, approve, veto). Confirm `compute_outreach_letter_verdict` returns the right tallies.
3. **Advisory dispatch:** With voting_mode='advisory', advance state to 'scheduled', wait for cron to fire, confirm the letter is dispatched (test mode only — no actual letter sends to test recipients) and state moves to 'dispatched'.
4. **Binding veto block:** Same flow but voting_mode='binding' with veto_pct >= threshold. Confirm dispatch is blocked, state stays 'scheduled', predicate returns reason "binding veto".
5. **Response logging:** Insert a test response via `log-letter-response`. Confirm the outreach_letter_responses row is created and the Cephas page renders the response.
6. **Retraction flow:** Propose a retraction, vote it through, confirm the original letter page gets the RETRACTED banner.
7. **Helm Glass Door card:** Log in as Founder, navigate to Helm. Confirm `<HelmGlassDoorCard />` renders pending letters with vote tallies.

---

## Out of scope (Phase 3 — K413 or later)

- Inline editing of letters in proposed state via member-suggested edits (currently the proposed_edit field is captured but not auto-applied)
- Vote weighting by member tier (one-member-one-vote in Phase 2)
- Anonymous voting option
- Letter scheduling collisions (multiple letters scheduled at the same Hemispheric tier slot — currently the K411 Hemispheric validator only applies to Helm tasks, not outreach letters; Phase 3 extends it)
- Public response API for journalists / researchers to query the outreach corpus programmatically

---

## Deliverables on session close

- Both migrations applied
- Three edge functions deployed
- TouchStone predicate registered (count: 7 → 8)
- React components shipped, wired to Cephas + Helm
- Hugo template for `/outreach` deployed
- Integration patches to dispatch-letter, log-letter-response, K409 wiring
- Backfill helper script in repo (not yet executed; Bishop runs separately)
- Smoke tests 1–7 all passing
- Brief deploy report at `BISHOP_DROPZONE/13_Ops_Deploy/K412_GLASS_DOOR_PHASE_2_REPORT_B099.md`

---

**Counts as 1 of 3 Knight session features. Founder has signed off on the Glass Door (B099). Roll.**
