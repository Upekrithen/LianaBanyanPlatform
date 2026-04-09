# KNIGHT SESSION 166 — Ghost Browsing + Seamless Onboarding
## Dirty Dozen DD-5
## "Can any user browse freely as a Ghost, then seamlessly onboard?"

---

## CONTEXT

A non-member follows a Cue Card link, a Treasure Map, or any public URL. They should be able to browse, play, earn temporary Marks, hit gamification elements — all WITHOUT signing up. When they hit a membership-required action, the gate appears seamlessly with benefits shown, and they sign up in under 3 clicks.

This is the "try before you buy" layer. If it doesn't work, every Cue Card and every Battery Dispatch link is a dead end for non-members.

---

## TASK 1: Verify Ghost Mode Current State

1. Open LianaBanyan.com in an incognito/private window (no auth)
2. Navigate to: `/treasure-maps`, `/ghost-world`, `/beacons`, `/crew-calls`, `/lemon-lot`
3. For each page, document: Does it load? Does it show content? Does it block with auth wall?
4. Check: Is there a Ghost session mechanism already in place? (Look for `ghost_session`, anonymous session tokens, or localStorage markers)
5. Deliverable: Status matrix — which pages work for non-auth users, which block

---

## TASK 2: Implement Ghost Session

If no Ghost session exists, build one:

```typescript
// Ghost session: anonymous browsing with temporary identity
interface GhostSession {
  ghostId: string;          // UUID, stored in localStorage
  createdAt: string;        // ISO timestamp
  tempMarks: number;        // Temporary Marks (half-life decay)
  pagesVisited: string[];   // Track engagement for onboarding prompt
  actionsAttempted: string[]; // Track what they tried to do (for gate messaging)
}
```

**Half-life rule:** Ghost Marks decay by 50% every 24 hours. After 72 hours with no activity, Ghost session expires. This creates gentle urgency without pressure.

**Storage:** localStorage for session persistence across page loads. No Supabase auth required.

---

## TASK 3: Enable Ghost Access to Key Pages

These pages MUST work for non-authenticated users:

| Page | Ghost Can | Ghost Cannot |
|------|-----------|-------------|
| `/treasure-maps` | View all 8 maps, flip cards, read business plans | Start a project |
| `/ghost-world` | Full access (it's designed for Ghosts) | — |
| `/beacons` | View beacons, read content | Create a beacon |
| `/crew-calls` | Browse open calls | Accept a call |
| `/lemon-lot` | Browse vehicles | List or rent |
| `/housing` | Browse listings | Apply or list |
| `/political-expedition` | View representatives, voting records | Take advocacy action |
| `/products` (Commerce) | Browse products, view prices | Purchase |
| `/design-pipeline` | Browse Arena, view designs | Submit or vote |
| Red Carpet | Full access (designed for non-members) | — |
| Cephas content | Full access (public by design) | — |

**Implementation:** Wrap auth-required actions in a gate check, NOT entire pages. The page loads; only the action button triggers the gate.

---

## TASK 4: Build Membership Gate Component

When a Ghost hits a membership-required action, show a gate — NOT a redirect to /login. The gate appears inline or as a modal on the current page.

```tsx
<MembershipGate
  action="accept-crew-call"          // What they tried to do
  ghostMarks={ghostSession.tempMarks} // Show what they'd keep
  benefits={[
    "Keep your " + ghostSession.tempMarks + " Marks permanently",
    "Accept Crew Calls and earn Credits",
    "Start your own projects for $5",
    "Join 16 charitable initiatives"
  ]}
  cta="Join for $5/year"
  onJoin={() => navigate('/join')}
  onDismiss={() => {/* close modal, stay on page */}}
/>
```

**Design principles:**
- Show what they GAIN, not what they're blocked from
- Show their Ghost Marks count — "You've earned 47 temporary Marks. Join to keep them permanently."
- $5/year membership prominently displayed
- "Not ready? Keep browsing." option always visible
- NO guilt, NO countdown timers, NO dark patterns

---

## TASK 5: Ghost Gamification Elements

These should work for Ghosts to create engagement before signup:

| Element | Ghost Behavior |
|---------|---------------|
| **Beacon Runs** | Ghost can follow a beacon trail, earn temp Marks |
| **Wildfire Runs** | Ghost can participate, earn temp Marks |
| **Golden Keys** | Ghost can find golden keys but can't redeem until member |
| **Deck Cards** | Ghost can view but can't collect |
| **Treasure Map flip cards** | Full access (K164 already deployed) |
| **Ghost World** | Full access by design |

Temp Marks earned by Ghosts:
- Viewing a Treasure Map: 5 temp Marks
- Completing a Beacon Run: 10 temp Marks
- Finding a Golden Key: 25 temp Marks (redeemable on signup)
- Visiting 5+ pages: 5 temp Marks

---

## TASK 6: Seamless Onboarding Flow

When Ghost clicks "Join" from the gate:

```
Gate modal → /join (pre-filled with ghost data)
  → Email + password (or OAuth)
  → $5 payment (Stripe Checkout)
  → Account created
  → Ghost Marks converted to permanent Marks
  → Redirect to the EXACT page/action they were trying to do
  → Action completes automatically
```

**Critical:** After signup, redirect them back to the action they were attempting. Don't dump them on a generic dashboard. If they were trying to accept a Crew Call, take them back to that Crew Call with the accept button now active.

**Ghost→Member migration:**
```sql
-- On signup, convert ghost session to member
UPDATE profiles SET
  temp_marks_converted = ghost_session.tempMarks,
  ghost_origin_page = ghost_session.pagesVisited[0],
  onboarding_source = 'ghost_conversion'
WHERE id = new_member_id;
```

---

## BUILD + DEPLOY

1. Build — zero errors
2. Push migration (if any new tables/columns)
3. Deploy to all 8 hosting targets
4. Test in incognito: browse 3 pages → hit gate → verify gate shows → dismiss → keep browsing → hit gate again → join flow
5. Verify Ghost Marks display and half-life decay

---

## ACCEPTANCE CRITERIA

- [ ] Non-member can browse `/treasure-maps`, `/ghost-world`, `/beacons`, `/crew-calls`, `/lemon-lot`, `/housing`, `/political-expedition` without auth
- [ ] Ghost earns temp Marks through engagement
- [ ] Membership gate appears inline when Ghost attempts restricted action
- [ ] Gate shows benefits + Ghost Marks count + $5/year CTA
- [ ] "Keep browsing" dismisses gate without leaving page
- [ ] Join flow returns Ghost to the exact action they attempted
- [ ] Ghost Marks convert to permanent Marks on signup
- [ ] Mobile responsive (375px)

---

## WHAT NOT TO DO

- Do NOT require auth to VIEW any public page — only to ACT
- Do NOT show login forms on public pages — only the membership gate when action is attempted
- Do NOT expire Ghost session silently — show "Your Marks are fading" message at 48 hours
- Do NOT run Hugo builds
- Do NOT use dark patterns, countdown timers, or guilt messaging

---

*Prompt by Bishop (Foreman), Session B046*
*Dirty Dozen DD-5*
*FOR THE KEEP!*
