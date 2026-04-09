# KNIGHT SESSION 125: Global Stats Cleanup + Email Notifications + Legal Pages

## Brief
Call `brief_me("stats cleanup, canonical stats, email notifications, resend, terms of service, privacy policy")`

## Context
K116-K120 deployed. K121-K124 in various states. K125 is the "infrastructure hardening" session — fixing the 43+ files with stale hardcoded stats, adding transactional email, and creating legal pages so the platform is ready for public outreach.

Canonical stats: 2,007 innovations | 1,511 claims | 10 provisionals | 23 production systems

**CRITICAL RULE:** No securities language.

---

## Deliverable 1: Stats Cleanup — Replace Hardcoded Numbers Everywhere

### The Problem
43+ files across the codebase hardcode old stats (1,938 innovations, 1,401 patent claims, 8 provisional applications, 22 production systems). The `useCanonicalStats` hook exists and works. Most of these files don't use it.

### The Fix

**For React components/pages:** Import and use `useCanonicalStats()`:
```tsx
import { useCanonicalStats } from '@/hooks/useCanonicalStats';

function MyComponent() {
  const stats = useCanonicalStats();
  return <span>{stats.innovationCount.toLocaleString()} innovations</span>;
}
```

**For data files (non-React):** Import `CANONICAL_DEFAULTS` from the hook:
```ts
import { CANONICAL_DEFAULTS } from '@/hooks/useCanonicalStats';
// Use CANONICAL_DEFAULTS.innovationCount, etc.
```

**For template strings in data files where imports aren't practical:** Update the hardcoded values to current:
- `1,938` → `2,007` (or ${CANONICAL_DEFAULTS.innovationCount.toLocaleString()})
- `1,401` → `1,511`
- `8 provisional` → `10 provisional`
- `22 production systems` → `23 production systems`

### Files to Update (known list — search for "1,938", "1,401", "1938", "1401"):

**High priority (user-facing):**
- `src/pages/AcademicPapersDirectory.tsx`
- `src/pages/PatentPortfolio.tsx`
- `src/pages/IPPortfolioPage.tsx`
- `src/pages/DeveloperPortal.tsx`
- `src/pages/BenefitsPage.tsx`
- `src/pages/Marketplace.tsx`
- `src/pages/Index.tsx`
- `src/pages/SponsorshipPage.tsx`
- `src/pages/WhyNoVC.tsx`
- `src/pages/Senate.tsx`
- `src/pages/The2ndSecondPortal.tsx`
- `src/components/PatentPortfolioTicker.tsx`
- `src/components/ShowMeHelp.tsx`

**Medium priority (data/content):**
- `src/data/crowsNestItems.ts`
- `src/data/xrayGlossary.ts`
- `src/data/guildRecruitingCards.ts`
- `src/data/letterCueCards.ts`
- `src/data/redCarpetRecipients.ts`
- `src/data/foundingTransactions.ts`

**Low priority (lib/internal):**
- `src/lib/platformBlueprint.ts`
- `src/lib/guildSystem.ts`
- `src/lib/guildHandshakeProtocol.ts`
- `src/lib/socialMediaService.ts`
- `src/lib/ipfsService.ts`
- `src/lib/nervous-system/platformMetrics.ts`
- `src/lib/nervous-system/knowledgeBase.ts`
- `src/lib/spotlightAlgorithm.ts`
- `src/lib/durinsDoor.ts`
- `src/lib/alcoveSystem.ts`

**Crown Letters (DO NOT UPDATE YET — Bishop will do a coordinated pass):**
- `src/data/crown-letters/LOCKED_*.md` — leave these alone

### Search Strategy
Run these searches and fix every match:
```bash
grep -rn "1,938\|1938" src/ --include="*.ts" --include="*.tsx" --include="*.md"
grep -rn "1,401\|1401" src/ --include="*.ts" --include="*.tsx" --include="*.md"
grep -rn "8 provisional" src/ --include="*.ts" --include="*.tsx"
grep -rn "22 production" src/ --include="*.ts" --include="*.tsx"
```

**EXCEPTION:** Do NOT modify any files in `src/data/crown-letters/` — Bishop manages those separately.

---

## Deliverable 2: Email Notification System (Resend)

### Setup
Use **Resend** (resend.com) — free for first 100 emails/day, great DX, TypeScript SDK.

### Supabase Edge Function: `send-email`
```ts
// supabase/functions/send-email/index.ts
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

Deno.serve(async (req) => {
  const { to, subject, template, data } = await req.json();
  
  const html = renderTemplate(template, data);
  
  const { data: result, error } = await resend.emails.send({
    from: 'Liana Banyan <noreply@lianabanyan.com>',
    to,
    subject,
    html,
  });
  
  return new Response(JSON.stringify({ success: !error, result }));
});
```

### Email Templates Needed
| Template | Trigger | Priority |
|----------|---------|----------|
| `welcome` | User signs up | HIGH |
| `project-claimed` | Creator claims a Red Carpet showcase | HIGH |
| `pledge-notification` | Someone pledges on a project | HIGH |
| `delivery-confirmation-request` | Captain ships order, needs confirmation | HIGH |
| `contest-entry-received` | Contest submission confirmed | MEDIUM |
| `membership-confirmed` | $5/year membership activated | MEDIUM |
| `payout-sent` | Creator payout processed | MEDIUM |

### Template Design
- Clean, minimal design with LB green (#16a34a) accent
- "Liana Banyan" wordmark at top
- Single-column, mobile-responsive
- No images (fast loading, fewer spam triggers)
- Unsubscribe link at bottom (CAN-SPAM compliance)

### Frontend Hook: `useSendEmail()`
```ts
export function useSendEmail() {
  return useMutation({
    mutationFn: async ({ to, subject, template, data }) => {
      const { data: result } = await supabase.functions.invoke('send-email', {
        body: { to, subject, template, data }
      });
      return result;
    }
  });
}
```

### Integration Points
- `ShowcaseClaimPage.tsx` → send `project-claimed` to pledgers
- `BackerPledgeEscrow.tsx` → send `pledge-notification` to creator
- `ContestEntryPage.tsx` → send `contest-entry-received`
- Auth flow → send `welcome`

---

## Deliverable 3: Terms of Service + Privacy Policy Pages

### Page: `/terms` — Terms of Service

Create a real ToS page with these sections:
1. **Acceptance of Terms** — By using Liana Banyan, you agree
2. **Membership** — $5/year, what it includes, cancellation
3. **Three-Currency System** — Credits ($1=1), Marks (effort-differential), Joules (surplus)
4. **Creator Responsibilities** — Accurate listings, fulfillment obligations
5. **Captain Responsibilities** — Staking requirements, fulfillment obligations, penalty structure
6. **Intellectual Property** — Creators own their IP, platform license for display/sale
7. **The 20% Margin** — Constitutionally locked, funds 16 charitable initiatives
8. **Prohibited Conduct** — No fraud, no fake listings, no harassment
9. **Dispute Resolution** — Wyoming law governs, arbitration clause
10. **Limitation of Liability** — Standard limitation language
11. **Modification** — Platform may update terms with 30-day notice
12. **Contact** — legal@lianabanyan.com

**Note:** This is a PLACEHOLDER until real attorney review. Display a banner: "These terms are under legal review and subject to change."

### Page: `/privacy` — Privacy Policy

Create a privacy policy with:
1. **Information We Collect** — Name, email, payment info (via Stripe), usage data
2. **How We Use Information** — Account management, transactions, communication, analytics
3. **Information Sharing** — With Stripe (payments), with Captains (fulfillment addresses only), never sold
4. **Data Retention** — Account data kept while active, deleted 30 days after account closure
5. **Cookies** — Minimal: auth session only, no tracking cookies, no ad cookies
6. **Your Rights** — Access, correct, delete your data. Email privacy@lianabanyan.com
7. **Children's Privacy** — Not directed at under-13
8. **Changes** — 30-day notice for material changes
9. **Contact** — privacy@lianabanyan.com

**Same banner:** "This privacy policy is under legal review and subject to change."

### Route both pages:
```tsx
<Route path="/terms" element={<TermsOfServicePage />} />
<Route path="/privacy" element={<PrivacyPolicyPage />} />
```

---

## Deliverable 4: Canonical Stats in Supabase

If the `platform_canonical` table exists, update it:
```sql
UPDATE platform_canonical SET value = 2007 WHERE key = 'innovation_count';
UPDATE platform_canonical SET value = 1511 WHERE key = 'patent_claims';
UPDATE platform_canonical SET value = 10 WHERE key = 'patent_applications';
UPDATE platform_canonical SET value = 23 WHERE key = 'production_systems';
```

If it doesn't exist, create it with current values.

---

## Build + Deploy all 8 Firebase hosting targets.

## Quality Checks
- [ ] No file in src/ contains "1,938" or "1,401" (except crown-letters/)
- [ ] Footer shows "2,007 innovations · 1,511 patent claims"
- [ ] /terms loads with full ToS content + "under review" banner
- [ ] /privacy loads with full privacy policy + "under review" banner
- [ ] Email edge function deploys to Supabase
- [ ] Welcome email sends on new signup (test with throwaway account)
- [ ] All 8 Firebase targets deployed

## FOR THE KEEP.
