# KNIGHT SESSION 84 — MoneyPenny AI Intelligence Layer
## Bishop 025 | March 22, 2026
## Innovation Count: 1,935 (unchanged — wiring session)

---

## MISSION

Wire AI intelligence into MoneyPenny's existing systems. The UI, edge functions, and database are all built. What's missing: AI doesn't actually draft responses, classify messages, or generate briefings. After this session, MoneyPenny thinks.

Reuse the Claude ↔ Perplexity mutual fallback pattern from K80's Star Chamber.

---

## CONTEXT: WHAT EXISTS

| Component | Status | What It Does |
|-----------|--------|-------------|
| MoneyPenny Dashboard | ✅ 5 pages LIVE | Inbox, Social, QA, Briefing, Tasks |
| moneypenny-auto-post | ✅ LIVE | Posts approved drafts to social (pg_cron) |
| moneypenny-intake | ✅ LIVE | Email classification by domain rules |
| moneypenny-signal | ✅ LIVE | Red carpet signal processing |
| moneypenny-daily-digest | ✅ LIVE | Counts pending items, generates summary |
| moneypenny-sms | ✅ LIVE | Twilio SMS with Claude replies |
| Q&A System | ✅ UI LIVE | Classification + AI responder fields exist but AI not called |
| Social Interactions | ✅ 20 samples seeded | Draft response field exists but AI not generating |
| Star Chamber Fallback | ✅ LIVE (K80) | Claude ↔ Perplexity pattern proven |

---

## TASK 1: AI Response Drafting Edge Function

Create `supabase/functions/moneypenny-ai-draft/index.ts`:

This is the central AI brain. Any MoneyPenny system that needs AI-generated text calls this function.

```typescript
// Accepts: { task_type, context, metadata }
// task_type: 'draft_qa_response' | 'draft_social_response' | 'classify_message' | 'generate_briefing' | 'summarize_inbox'
// Returns: { result: string, engine: 'claude' | 'perplexity', confidence: number }

// Uses the SAME callLLM() pattern from star-chamber-analyze:
// 1. Try Claude (ANTHROPIC_API_KEY) with 30s timeout
// 2. If fails, try Perplexity (PERPLEXITY_API_KEY) with 30s timeout
// 3. If both fail, return graceful fallback text
// 4. Append _Engine metadata to response
```

### System Prompt for MoneyPenny:

```
You are MoneyPenny, the virtual assistant for Liana Banyan cooperative platform.

Key facts:
- LB is a cooperative serving working families (food, housing, transportation)
- 16 initiatives ("Sweet Sixteen"), 1,935 innovations, 8 patent applications
- Core principle: HEOHO (Help Each Other, Help Ourselves) — interdependence, not collectivism
- Three currencies: Credits ($1=1), Marks (effort-based), Joules (surplus storage)
- Cost+20% pricing floor. 83.3% to creators, 13.3% operations, 3.3% Gleaner's Corner
- Mission ONE: "EVERYONE Eats Tonight" | Mission TWO: Housing | Mission THREE: Transport
- Confirmation phrase: "As You Wish"

Tone: Warm, professional, knowledgeable. Like a sharp executive assistant who genuinely cares about the cooperative's mission. Never use corporate buzzwords. Be direct and helpful.

SEC compliance: Never use "invest," "equity," "ROI," "returns," "shares," "profit," or "dividend." Use "sponsor," "participation," "service value," "membership," "platform benefit" instead.
```

### Task-Specific Behavior:

**draft_qa_response**: Given a question, draft a helpful answer. Include relevant links to platform pages. Flag if the question touches SEC-sensitive topics.

**draft_social_response**: Given a social media mention/comment, draft an appropriate reply. Match the tone of the platform (warm, not corporate). Keep under 280 chars for Twitter.

**classify_message**: Given an email or message, return: priority (1-4), category (crown_response/press/patent/member/support/unknown), sentiment (positive/neutral/negative), suggested_action.

**generate_briefing**: Given today's inbox count, action items, social drafts, and pending tasks, generate a 3-paragraph morning briefing with priorities and recommendations.

**summarize_inbox**: Given a batch of inbox items, generate a 1-line summary for each.

---

## TASK 2: Wire Q&A Auto-Response

In `MoneyPennyQA.tsx` (or the QA service), when a new question is submitted or fetched:

1. If `qa_entries.answer_text` is NULL and `status = 'pending'`:
   - Call `moneypenny-ai-draft` with `task_type: 'draft_qa_response'` and the question text
   - Store the draft in `answer_text` with `ai_responder: 'moneypenny'`
   - Set `status: 'draft'` (not auto-published — Founder approves)
2. Show the AI draft in the QA dashboard with an "Approve" / "Edit" / "Reject" button
3. On approve: set `status: 'published'`, award Marks per the reward rules

This means MoneyPenny pre-drafts answers to every incoming question. Founder just reviews and approves.

---

## TASK 3: Wire Social Response Drafting

In the social interactions inbox (`MoneyPennySocial.tsx`):

1. When viewing an interaction with `response_status = 'pending'`:
   - Show a "Draft Response" button
   - On click: call `moneypenny-ai-draft` with `task_type: 'draft_social_response'` and the interaction details (channel, content, sentiment)
   - Populate `draft_response` field with the AI result
   - Set `response_status: 'drafted'`
2. Founder reviews, edits if needed, then approves → feeds into `moneypenny-auto-post`

Also add a "Draft All Pending" bulk action that processes up to 10 interactions at once (sequential calls, not parallel — rate limiting).

---

## TASK 4: Smart Classification

Update `moneypenny-intake` to use AI classification as a second pass:

1. Keep the existing domain-based rules as the FAST first pass (no API call needed)
2. For items classified as P3 (support) or P4 (unknown), make a second pass:
   - Call `moneypenny-ai-draft` with `task_type: 'classify_message'` and the email subject + first 500 chars of body
   - AI may upgrade priority (e.g., a P4 unknown email that mentions "patent" → P1)
   - AI adds `sentiment` and `suggested_action` to the inbox item's metadata
3. This is ADDITIVE — never downgrade priority, only upgrade

---

## TASK 5: AI-Powered Daily Briefing

Update `moneypenny-daily-digest` to generate an AI narrative briefing:

1. After collecting all the stats (inbox count, actions, social, milestones):
   - Call `moneypenny-ai-draft` with `task_type: 'generate_briefing'` and all the day's data
   - Store the narrative in a new field on the digest response
2. Show the AI briefing as the top section of `MoneypennyBriefing.tsx`:
   - Founder sees: "Good morning. You have 3 priority items..."
   - Below: the usual stats grid

---

## FILES TO CREATE

| File | Purpose |
|------|---------|
| `supabase/functions/moneypenny-ai-draft/index.ts` | Central AI brain with Claude ↔ Perplexity fallback |

## FILES TO MODIFY

| File | Change |
|------|--------|
| `src/pages/MoneyPennyQA.tsx` | Add AI auto-draft for pending questions |
| `src/pages/MoneyPennySocial.tsx` | Add "Draft Response" + "Draft All Pending" buttons |
| `src/pages/MoneypennyBriefing.tsx` | Show AI narrative briefing at top |
| `supabase/functions/moneypenny-intake/index.ts` | Add AI second-pass classification |
| `supabase/functions/moneypenny-daily-digest/index.ts` | Add AI briefing generation |

## DO NOT TOUCH

- `moneypenny-auto-post` — works fine, don't change posting logic
- `moneypenny-sms` — already has Claude, don't modify
- `moneypenny-signal` — signal processing is separate concern

---

## DEPLOY CHECKLIST

1. Deploy `moneypenny-ai-draft` edge function
2. Deploy updated `moneypenny-intake` and `moneypenny-daily-digest`
3. Deploy frontend to Firebase
4. Test: Submit a Q&A question → see AI draft appear
5. Test: View social interaction → click "Draft Response" → see AI reply
6. Test: Check briefing page → see AI narrative at top
7. Test: Send email to intake → see AI classification enhancement

---

## SUCCESS CRITERIA

- [ ] moneypenny-ai-draft edge function deployed with Claude ↔ Perplexity fallback
- [ ] New Q&A questions get AI-drafted answers (pending Founder approval)
- [ ] Social interactions can be AI-drafted individually or in bulk
- [ ] Email classification enhanced by AI second pass (upgrade only, never downgrade)
- [ ] Daily briefing includes AI-generated narrative summary
- [ ] All AI responses include engine metadata (which LLM answered)
- [ ] SEC-safe system prompt prevents compliance violations in AI outputs

---

**MoneyPenny stops being a dashboard. MoneyPenny starts thinking.**

**FOR THE KEEP.**
