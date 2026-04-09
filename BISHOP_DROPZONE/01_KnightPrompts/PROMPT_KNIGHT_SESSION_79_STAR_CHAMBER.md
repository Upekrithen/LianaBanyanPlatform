# KNIGHT SESSION 79 — Star Chamber: Real Case Filing + AI Verdict Engine

## Bishop: 023 | Innovation Count: 1,935 | Priority: PHASE 1 (Wire the Gaps)

---

> **GOAL**: Turn the Star Chamber from a UI mockup with hardcoded sample cases into a real dispute resolution system where members file cases, AI judges analyze them, and the Founder renders final verdicts.

---

## CURRENT STATE

### What Exists
- **StarChamber.tsx** — Page with filter dropdowns (case type, status), expandable case cards showing 4-judge analysis grid
- **starChamberService.ts** — Complete CRUD service with these functions:
  - `fetchCases()` — returns from `star_chamber_cases` table, falls back to SAMPLE_CASES if empty
  - `createCase(caseData)` — writes to DB
  - `updateCaseStatus(caseId, status)` — updates status field
  - `addJudgeAnalysis(caseId, judge, analysis)` — writes to oracle_analysis/morpheus_analysis/red_queen_analysis/dredd_verdict
  - `setRecommendedAction(caseId, action)` — writes recommended_action, sets status='analysis_complete'
  - `setFinalAction(caseId, action)` — writes final_action, sets status='verdict_reached', resolved_at=now()
  - `setFounderOverride(caseId, reason)` — sets founder_override=true, founder_override_reason
- **Migration 20260319100023** — `star_chamber_cases` table with full schema (case_number SERIAL, all judge fields, evidence JSONB, RLS)
- **5 SAMPLE_CASES** hardcoded in the service file

### What's Missing
1. No "File a Case" UI — users can't submit cases
2. No AI judge analysis — fields are manually populated or empty
3. No admin verdict panel — Founder can't review/approve
4. SAMPLE_CASES fallback hides the fact that real cases don't exist

---

## TASK 1: "File a Case" Dialog

### Spec

Add a **"File a Case"** button at the top of StarChamber.tsx that opens a dialog:

```
┌─────────────────────────────────────────────┐
│  File a New Case                        [X] │
├─────────────────────────────────────────────┤
│                                             │
│  Case Type:  [Dispute ▾]                    │
│              Dispute | Complaint |          │
│              Violation | Appeal             │
│                                             │
│  Severity:   [Medium ▾]                     │
│              Low | Medium | High | Critical │
│                                             │
│  Title:      [________________________]     │
│                                             │
│  Description:                               │
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │  (textarea, 5+ lines)              │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  Respondent (optional):                     │
│  [Search member by name or email____]       │
│                                             │
│  Evidence:                                  │
│  [+ Add Evidence]                           │
│  ┌────────────────────────────────────┐     │
│  │ Type: [Document ▾]  Desc: [____]  │     │
│  │ URL:  [____________________] [-]   │     │
│  └────────────────────────────────────┘     │
│                                             │
│  [Cancel]              [Submit Case]        │
└─────────────────────────────────────────────┘
```

**On Submit:**
1. Call `starChamberService.createCase()` with form data
2. Show success toast with case number
3. Automatically trigger analysis (call `star-chamber-analyze` edge function)
4. Refresh case list

**Evidence types:** document, screenshot, transaction_record, chat_log, witness_statement

### Key Implementation Notes
- Use existing shadcn/ui Dialog, Select, Input, Textarea, Button
- Member search for respondent: query `profiles` table by `display_name ILIKE` or `email ILIKE`
- Evidence is a dynamic array — add/remove evidence items
- Complainant is automatically `auth.uid()`

---

## TASK 2: `star-chamber-analyze` Edge Function

### New file: `supabase/functions/star-chamber-analyze/index.ts`

**Purpose:** Takes a case ID, reads the case details, runs 4 AI judge personas in sequence, writes analyses back to the case record.

**Flow:**
```
1. Receive { caseId } in POST body
2. Fetch case from star_chamber_cases by ID
3. Update status → 'under_review'
4. Run Oracle analysis
5. Run Morpheus analysis
6. Run Red Queen analysis
7. Check consensus:
   - If all 3 agree on action → set recommended_action, status='analysis_complete'
   - If disagreement → run Dredd as tiebreaker
   - After Dredd → set recommended_action, status='analysis_complete'
8. Return { success, analyses, recommendedAction }
```

**Judge Prompt Templates:**

Each judge gets the same case data but a different system prompt:

```typescript
const JUDGE_PROMPTS = {
  oracle: `You are ORACLE, the Pattern Detection judge on the Liana Banyan Star Chamber.
Your role: Identify patterns, precedents, and predict consequences.
Analyze this case by:
1. Finding similar past patterns (even hypothetical)
2. Identifying the root cause vs. symptoms
3. Predicting what happens if no action is taken
4. Recommending ONE specific action
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  morpheus: `You are MORPHEUS, the Behavioral Risk judge on the Liana Banyan Star Chamber.
Your role: Assess behavioral patterns, motivations, and systemic risks.
Analyze this case by:
1. Evaluating the behavioral pattern (one-time vs. systematic)
2. Assessing risk to the cooperative community
3. Considering the human element (intent vs. impact)
4. Recommending ONE specific action that addresses behavior, not just symptoms
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  red_queen: `You are RED QUEEN, the Rule Compliance judge on the Liana Banyan Star Chamber.
Your role: Enforce platform rules strictly but fairly.
Analyze this case by:
1. Identifying which specific platform rules apply
2. Determining if a violation occurred (yes/no/ambiguous)
3. Checking if this is a first offense or repeat
4. Recommending ONE specific action based on rule application
Liana Banyan principles: Cost+20% pricing, HEOHO (Help Each Other Help Ourselves), earned participation, transparent governance.
Format: 2-3 paragraphs. End with "RECOMMENDED ACTION: [specific action]" and "CONFIDENCE: [0-100]%"`,

  dredd: `You are DREDD, the Final Arbiter on the Liana Banyan Star Chamber.
You are ONLY invoked when Oracle, Morpheus, and Red Queen disagree.
Your role: Break the tie with a definitive ruling.
You have access to all three prior analyses. Weigh them and decide.
Principles: Favor the cooperative's long-term health. Protect members. Enforce rules but allow mercy for first offenses.
Format: 2-3 paragraphs. Address each judge's reasoning. End with "FINAL RULING: [specific action]" and "CONFIDENCE: [0-100]%"`
};
```

**LLM Integration:**
- Use Supabase AI (if available) or call Anthropic/OpenAI API directly
- Store API key as Supabase secret: `STAR_CHAMBER_LLM_KEY`
- Model: Use Claude Haiku or GPT-4o-mini for speed (these are internal analyses, not user-facing prose)
- Each judge call is independent — can run in parallel (Promise.all for Oracle + Morpheus + Red Queen)

**Case Context Sent to Each Judge:**
```typescript
const caseContext = `
CASE #${case.case_number}: ${case.title}
TYPE: ${case.case_type} | SEVERITY: ${case.severity}
FILED: ${case.created_at}

DESCRIPTION:
${case.description}

EVIDENCE:
${case.evidence.map(e => `- [${e.type}] ${e.description}${e.url ? ` (${e.url})` : ''}`).join('\n')}

${previousAnalyses ? `PRIOR JUDGE ANALYSES:\n${previousAnalyses}` : ''}
`;
```

**Consensus Detection:**
- Parse each judge's "RECOMMENDED ACTION:" line
- If all 3 recommend the same category of action (warn, suspend, dismiss, compensate, etc.) → consensus
- If disagreement → invoke Dredd with all 3 analyses as context
- After Dredd, use Dredd's ruling as recommended_action

**Write Results:**
```typescript
await starChamberService.addJudgeAnalysis(caseId, 'oracle', oracleResult);
await starChamberService.addJudgeAnalysis(caseId, 'morpheus', morpheusResult);
await starChamberService.addJudgeAnalysis(caseId, 'red_queen', redQueenResult);
if (needsDredd) {
  await starChamberService.addJudgeAnalysis(caseId, 'dredd', dreddResult);
}
await starChamberService.setRecommendedAction(caseId, recommendedAction);
```

---

## TASK 3: Admin Verdict Panel

### Spec

Add an **admin-only section** at the bottom of StarChamber.tsx (visible when user is admin/founder):

```
┌─────────────────────────────────────────────────┐
│  ⚖️  Pending Verdicts (3 cases)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  SC-1004: "Delivery fee overcharge complaint"   │
│  Status: analysis_complete                      │
│  Recommended: Issue refund + warning            │
│                                                 │
│  [Accept Recommendation]  [Override]  [Dismiss] │
│                                                 │
│  Override Reason (if override):                 │
│  [________________________________]             │
│                                                 │
├─────────────────────────────────────────────────┤
│  SC-1005: "Repeated no-show for crew calls"     │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Actions:**
- **Accept Recommendation**: Calls `setFinalAction(caseId, recommendedAction)` → status='verdict_reached'
- **Override**: Opens override reason input, then calls `setFounderOverride(caseId, reason)` + `setFinalAction(caseId, customAction)`
- **Dismiss**: Calls `updateCaseStatus(caseId, 'closed')` with no action

**Filter:** Show only cases with `status = 'analysis_complete'` in the pending verdicts section.

### Remove SAMPLE_CASES Fallback

In `starChamberService.ts`, remove the fallback to SAMPLE_CASES:

```typescript
// BEFORE:
async fetchCases() {
  const { data, error } = await supabase.from('star_chamber_cases')...
  if (error || !data?.length) return SAMPLE_CASES;  // ← REMOVE THIS
  return data;
}

// AFTER:
async fetchCases() {
  const { data, error } = await supabase.from('star_chamber_cases')...
  if (error) { console.error(error); return []; }
  return data || [];
}
```

Show an empty state message instead: "No cases filed yet. The Star Chamber awaits its first petition."

---

## DEPLOYMENT CHECKLIST

```bash
# 1. Build
npm run build

# 2. Deploy new edge function
npx supabase functions deploy star-chamber-analyze --linked

# 3. Set secret for LLM API
npx supabase secrets set STAR_CHAMBER_LLM_KEY=sk-ant-...

# 4. Deploy to Firebase
firebase deploy --only hosting:production

# 5. Test
# File a test case (type: complaint, severity: low, title: "Test case")
# Watch the case progress: open → under_review → analysis_complete
# Review the 3-4 judge analyses
# Accept or override the recommendation
# Verify status → verdict_reached
```

---

## SECRETS NEEDED

| Secret | Purpose |
|--------|---------|
| `STAR_CHAMBER_LLM_KEY` | API key for LLM (Anthropic or OpenAI) used by judges |

---

## INNOVATION COUNT
Unchanged: **1,935**

## FOR THE KEEP
