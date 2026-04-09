# KNIGHT SESSION 167 — Dashboard + Auth Persistence
## Dirty Dozen DD-12
## "Does the Dashboard work? Can I stay logged in?"

---

## CONTEXT

The Creator Dashboard (K126) is the member's home base. Deck Cards, League monitoring, social plugs, portfolio — all in one place. But if auth keeps dropping and members constantly re-login, the experience is broken. This session fixes both: verify the dashboard works AND fix auth persistence.

---

## TASK 1: Verify Creator Dashboard Current State

1. Log in as a test user
2. Navigate to the Dashboard (Creator Dashboard from K126)
3. Check each section loads:
   - [ ] Deck Card display (member's cards)
   - [ ] "The League" picks/votes monitoring
   - [ ] Social media integration plugs
   - [ ] Portfolio / project list
   - [ ] Revenue / Marks / Joules summary
   - [ ] Recent activity feed
   - [ ] Navigation to all member tools (Helm, Bridges)
4. Document what works, what's broken, what's missing

---

## TASK 2: Fix Auth Persistence

**Problem:** Members report constant re-login requirements. Auth drops on page refresh, tab switch, or after short idle periods.

**Investigation checklist:**
1. Check Supabase auth session configuration:
   - `persistSession` option — must be `true`
   - Session storage — should be `localStorage` not `sessionStorage`
   - Auto-refresh token behavior — must be enabled
2. Check for auth state listeners:
   - `onAuthStateChange` must be wired up in the app root
   - Session recovery on page load must happen before route guards fire
3. Check for race conditions:
   - Auth check firing before session is restored from storage
   - Route guards redirecting to /login before `onAuthStateChange` fires
   - Multiple Supabase client instances (each with separate auth state)

**Common fixes:**
```typescript
// In app initialization — BEFORE any route rendering
const { data: { session } } = await supabase.auth.getSession();
if (session) {
  // Set user state BEFORE rendering protected routes
  setUser(session.user);
}

// Listen for changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    setUser(session?.user ?? null);
  }
  if (event === 'SIGNED_OUT') {
    setUser(null);
  }
});
```

**Ensure:**
- Single Supabase client instance (singleton pattern)
- `persistSession: true` in client config
- Session recovery completes before any auth-gated route renders
- Token refresh happens automatically (Supabase default is 1 hour; confirm)

---

## TASK 3: Add "Logged In For X Days" Indicator

Show members how long they've been continuously logged in. This:
- Confirms auth persistence is working (members can SEE it)
- Creates a subtle sense of "home" (gamification lite)
- Helps debug if someone reports auth issues ("it says 0 days")

**Implementation:**
```typescript
// Store login timestamp
const loginTimestamp = localStorage.getItem('lb_login_timestamp');
if (!loginTimestamp && user) {
  localStorage.setItem('lb_login_timestamp', new Date().toISOString());
}

// Display in dashboard header or profile area
const daysSinceLogin = Math.floor(
  (Date.now() - new Date(loginTimestamp).getTime()) / (1000 * 60 * 60 * 24)
);
// Show: "Logged in for 3 days" or "Welcome back (12 days)"
```

Clear `lb_login_timestamp` on explicit logout only — not on session refresh.

---

## TASK 4: Dashboard Content Verification + Gaps

Verify each dashboard section has real data or meaningful empty states:

### Deck Cards Section
- If member has Deck Cards → show them in a grid/carousel
- If no Deck Cards → show "Start your first project" CTA with link to Treasure Maps
- Card should show: title, status, category, creation date, engagement stats if any

### League Monitoring
- Shows the member's active picks/votes in Design Battles
- If no active battles → show "No active battles — check the Arena" with link
- If battles active → show status (voting open, winner declared, etc.)

### Social Media Plugs
- Connected accounts indicator (which platforms linked)
- Quick-share buttons for member's projects/products
- If no accounts connected → show "Connect your social accounts" with setup flow

### Portfolio / Projects
- List of member's active projects (from Crew Tables, Commerce, HexIsle)
- Status per project (PREP, BUILD, DELIVER, COMPLETE)
- Link to each project's Bridge

### Revenue / Marks / Joules Summary
- Credits earned (lifetime + this month)
- Marks balance (Backed + Pledged)
- Joules earned
- If zero → show "Earn your first Marks" CTA

### Activity Feed
- Recent transactions, contributions, votes, Crew Call activity
- Chronological, last 30 days
- Empty state: "Your activity will appear here"

---

## TASK 5: Red Carpet Family Seeding

**Bonus task from Founder request:** Add family member entries to `red_carpet_recipients` table so the Founder can send personalized Cue Cards to family for testing.

Seed at minimum:
```sql
INSERT INTO red_carpet_recipients (email_domain, recipient_name, role_offered, initiative, wave, personalized_greeting, category)
VALUES
-- Family test entries (Founder to confirm exact domains/slugs)
('family', 'Jones Family', 'Family Tester', 'All Initiatives', 0, 'Welcome home. Dad built this for us.', 'family');
-- Add specific family member entries as Founder provides names/emails
```

Also add a `family` category handler in `RedCarpetWalkthrough.tsx`:
- Shows: all 16 initiatives overview, how to test, feedback overlay (X-ray goggles), Founder direct line
- Tone: warm, personal, "help me test this"

**Founder:** Provide family member names and email domains/slugs for personalized entries.

---

## BUILD + DEPLOY

1. Build — zero errors
2. Push any migrations
3. Deploy all 8 targets
4. Test: login → close browser → reopen → confirm still logged in
5. Test: idle 30 min → return → confirm still logged in
6. Test: dashboard sections all load with data or meaningful empty states

---

## ACCEPTANCE CRITERIA

- [ ] User logs in once and stays logged in across browser restarts
- [ ] Auth persists across page refreshes and tab switches
- [ ] "Logged in for X days" indicator visible on dashboard
- [ ] Dashboard shows all sections (Deck Cards, League, Social, Portfolio, Revenue, Activity)
- [ ] Each section has meaningful empty state if no data
- [ ] Family Red Carpet entries seeded (at minimum template row)
- [ ] Family category handler in RedCarpetWalkthrough
- [ ] Mobile responsive (375px)

---

*Prompt by Bishop (Foreman), Session B046*
*Dirty Dozen DD-12*
*FOR THE KEEP!*
