# KNIGHT SESSION 79 — Star Chamber: Real Case Filing + AI Verdict Engine

## Bishop: 023 (Updated) | Innovation Count: 1,935 | Priority: PHASE 1 (Wire the Gaps)

---

> **GOAL**: Turn the Star Chamber from a UI mockup with hardcoded sample cases into a real dispute resolution system where members file cases, AI judges analyze them, and the Founder renders final verdicts.
> 
> **KEY**: Use `ANTHROPIC_API_KEY` (already in codebase at `moneypenny-sms/index.ts` line 33). Founder will set this secret. Use Claude Haiku 4.5 for judge analyses (fast + cheap).

---

## CURRENT STATE

### What Exists
- **StarChamber.tsx** — Page with filter dropdowns (case type, status), expandable case cards showing 4-judge analysis grid
- **starChamberService.ts** — Complete CRUD service:
  - `fetchCases()` — returns from `star_chamber_cases`, falls back to SAMPLE_CASES if empty
  - `createCase(caseData)` — writes to DB
  - `addJudgeAnalysis(caseId, judge, analysis)` — writes to oracle/morpheus/red_queen/dredd fields
  - `setRecommendedAction(caseId, action)` — status='analysis_complete'
  - `setFinalAction(caseId, action)` — status='verdict_reached', resolved_at=now()
  - `setFounderOverride(caseId, reason)` — founder_override=true
- **Migration 20260319100023** — `star_chamber_cases` table (case_number SERIAL, all judge fields, evidence JSONB, RLS)
- **5 SAMPLE_CASES** hardcoded (to be removed)

### What's Missing
1. No "File a Case" UI
2. No AI judge analysis engine
3. No admin verdict panel
4. SAMPLE_CASES fallback masks empty DB

---

## TASK 1: "File a Case" Dialog

Add a **"File a Case"** button at top of StarChamber.tsx → dialog with:
- Case Type select (Dispute | Complaint | Violation | Appeal)
- Severity select (Low | Medium | High | Critical)
- Title (text input)
- Description (textarea, 5+ lines)
- Respondent search (optional — query `profiles` by `display_name ILIKE`)
- Evidence array (dynamic add/remove: type select + description + URL)
- Evidence types: document, screenshot, transaction_record, chat_log, witness_statement

On Submit: call `starChamberService.createCase()` → toast with case number → trigger `star-chamber-analyze` → refresh list.

---

## TASK 2: `star-chamber-analyze` Edge Function

**New file: `supabase/functions/star-chamber-analyze/index.ts`**

### LLM Setup
```typescript
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
// Use Claude Haiku 4.5 for speed: "claude-haiku-4-5-20251001"
// POST https://api.anthropic.com/v1/messages
// Headers: x-api-key, anthropic-version: "2023-06-01", content-type
```

### Flow
1. Receive `{ caseId }` → fetch case from DB
2. Set status → `under_review`
3. Run Oracle + Morpheus + Red Queen **in parallel** (Promise.all)
4. Parse each judge's `RECOMMENDED ACTION:` line
5. If 3 agree → set recommended_action, status='analysis_complete'
6. If disagreement → run Dredd with all 3 analyses → use Dredd's ruling
7. Write all analyses via `addJudgeAnalysis()`
8. Return `{ success, analyses, recommendedAction }`

### Judge Prompts

```typescript
const JUDGE_PROMPTS = {
  oracle: `You are ORACLE, the Pattern Detection judge on the Liana Banyan Star Chamber.
Your role: Identify patterns, precedents, and predict consequences.
Analyze: 1) Similar past patterns 2) Root cause vs symptoms 3) Predictions if no action 4) ONE recommended action.
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [action]" and "CONFIDENCE: [0-100]%"`,

  morpheus: `You are MORPHEUS, the Behavioral Risk judge on the Liana Banyan Star Chamber.
Your role: Assess behavioral patterns, motivations, and systemic risks.
Analyze: 1) One-time vs systematic pattern 2) Community risk 3) Intent vs impact 4) ONE recommended action.
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [action]" and "CONFIDENCE: [0-100]%"`,

  red_queen: `You are RED QUEEN, the Rule Compliance judge on the Liana Banyan Star Chamber.
Your role: Enforce platform rules strictly but fairly.
Analyze: 1) Which rules apply 2) Violation yes/no/ambiguous 3) First or repeat offense 4) ONE recommended action.
LB principles: Cost+20%, HEOHO, earned participation, transparent governance.
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [action]" and "CONFIDENCE: [0-100]%"`,

  dredd: `You are DREDD, the Final Arbiter. ONLY invoked when the other 3 judges disagree.
Weigh all three analyses and decide. Favor cooperative long-term health. Allow mercy for first offenses.
Format: 2-3 paragraphs. Address each judge. End with "FINAL RULING: [action]" and "CONFIDENCE: [0-100]%"`
};
```

### Case Context Template
```typescript
const caseContext = `CASE #${c.case_number}: ${c.title}
TYPE: ${c.case_type} | SEVERITY: ${c.severity} | FILED: ${c.created_at}

DESCRIPTION:
${c.description}

EVIDENCE:
${c.evidence.map(e => `- [${e.type}] ${e.description}${e.url ? ` (${e.url})` : ''}`).join('\n')}`;
```

---

## TASK 3: Admin Verdict Panel

Add admin-only section at bottom of StarChamber.tsx:
- Filter: cases with `status = 'analysis_complete'`
- For each: show case number, title, recommended action
- Buttons: **Accept** (calls setFinalAction), **Override** (reason input + setFounderOverride + setFinalAction), **Dismiss** (updateCaseStatus → 'closed')

**Remove SAMPLE_CASES fallback** in `starChamberService.ts`:
```typescript
// fetchCases should return [] on error, not SAMPLE_CASES
if (error) { console.error(error); return []; }
return data || [];
```
Empty state: "No cases filed yet. The Star Chamber awaits its first petition."

---

## DEPLOYMENT CHECKLIST

```bash
npm run build
npx supabase functions deploy star-chamber-analyze --linked
# ANTHROPIC_API_KEY should already be set from Session 78
firebase deploy --only hosting:production
```

**Test**: File a case → watch it progress open → under_review → analysis_complete → accept → verdict_reached.

---

## SECRETS

| Secret | Name | Status |
|--------|------|--------|
| Anthropic API | `ANTHROPIC_API_KEY` | Set in Session 78 (shared with moneypenny-sms) |

**No new secrets needed if Session 78 deploys ANTHROPIC_API_KEY.**

---

## INNOVATION COUNT: 1,935 | FOR THE KEEP
