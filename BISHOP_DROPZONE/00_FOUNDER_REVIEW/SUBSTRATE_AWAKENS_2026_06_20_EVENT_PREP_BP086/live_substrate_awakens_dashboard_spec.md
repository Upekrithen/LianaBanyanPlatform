---
title: Substrate Awakens — Live Dashboard Page Spec
session: BP086
date: 2026-06-18
status: SPEC — Knight build yoke required
url: mnemosynec.ai/live/substrate-awakens/
---

# Live Dashboard · `mnemosynec.ai/live/substrate-awakens/`

**Knight build note:** This is the spec, not the implementation. Knight receives this doc as a yoke-input. Build output goes to Cephas Hugo repo. No production deploy without Founder explicit ratify.

---

## Page Overhead

**Headline (hero, large):**
Permission to Board — Granted. Grab an Oar. Help Make the Sails.

**Subhead:**
Substrate Awakens · First Live Cooperative Mesh · 2026-06-20

**Live status badge** (top right corner, always visible):
- STANDBY (pre-event, gray)
- LIVE (event active, green, pulsing dot)
- COMPLETE (post-event, static green)
- DELAYED — One Day (slip state, amber)

**Truth-Always footer strip** (sticky bottom, always visible):
- "Quarantined answers this session: [N]" — real count, never hidden
- "Peers connected: [N] · Peers offline: [N]"
- "This event is real. What you see is what is happening."

---

## Panel 1 — Constellation Map

**Purpose:** Visual representation of connected peers as geometric shapes. Viewers watch the mesh form in real time.

**Visual language (per Constellation Switchboard canon):**
- Each peer = a shape: ▢ (square) · △ (triangle) · ◯ (circle)
- Shape assignment: consistent per peer_id for the event session (auto-assigned on first presence registration)
- Filled shape = peer active, running
- Outline shape = peer registered but idle
- Glow animation on active answer processing
- Dim on quarantine trigger
- Dark / outline-only on peer dropout — shape stays visible (not removed) with "(offline)" label

**Per-peer node label (on hover):**
- Pseudonym (if registered) or "Peer [short_id]"
- Tier badge: BASE or MEMBER (small pill, muted color — not prominent; both are real participants)
- Current domain + progress: e.g. "math 147/200"
- Accuracy: e.g. "94%"
- Quarantine count: e.g. "23 quarantined"

**Layout:**
- SVG-based constellation, responsive container
- Nodes auto-position using force-directed layout (d3-force or equivalent)
- Maximum node count for clean render: 100 (beyond 100, nodes collapse to density map)
- Mobile: nodes stack vertically in a scrollable list (shapes preserved, force-layout dropped at < 480px width)

**Data source:**
- Supabase Realtime subscription on `peer_presence` table
- Events: INSERT (new peer joins) · UPDATE (heartbeat / progress update) · DELETE/state-change (peer drops)
- Fallback: REST poll every 5s on `peer_presence` ordered by `last_seen_at DESC` LIMIT 100

---

## Panel 2 — Live Ticker

**Purpose:** Event log. Last 20 significant events across the whole mesh, newest at top.

**Event types + display format:**

| Event | Ticker line |
|---|---|
| Peer registers | `[TIME UTC] · Peer [pseudonym or short_id] joined · tier: BASE/MEMBER · shard assigned: [domain]` |
| Run started | `[TIME UTC] · [pseudonym] started [domain] · [N] questions` |
| Run completed | `[TIME UTC] · [pseudonym] completed [domain] · [N]/[total] correct · [quarantine count] quarantined` |
| Receipt published | `[TIME UTC] · Receipt published · [domain] · aggregate: [score]%` |
| Peer dropout | `[TIME UTC] · [pseudonym] went offline · last seen: [domain] [N]/[total]` |
| Aggregate milestone | `[TIME UTC] · Mesh milestone: [N] questions completed across all peers` |
| Quarantine triggered | `[TIME UTC] · Andon-Cord: [N] answers quarantined on [pseudonym]'s [domain] run — self-policing active` |

**Scroll behavior:**
- Auto-scroll to newest entry (top)
- User can pause auto-scroll by hovering
- Max 20 entries visible; older entries accessible via "View full event log" expand

**Mobile:** Full-width single column, same auto-scroll behavior.

---

## Panel 3 — Replicator Roster

**Purpose:** Permanent public record of every peer who participated. Alphabetical by pseudonym. Viewers watch their name appear when they join.

**Entry format per replicator:**
```
[Pseudonym or "Peer [short_id]"]   Tier: BASE · Shard: [domain] · Joined: [HH:MM UTC] · Status: Active / Complete / Offline
```

**Columns:**
- Pseudonym (or anonymous short ID)
- Tier (BASE / MEMBER — no visual hierarchy, both equal participants)
- Shard assigned
- Join time
- Status

**Sorting:** Active first (by join time, newest last), then Completed (by completion time), then Offline.

**Roster count:** "N peers in the mesh" displayed as live count above the table.

**Post-event:** Roster persists permanently at this URL. Each entry links to the replicator's eventual permanent attribution credit on the event ledger.

**Mobile:** Condensed card layout (pseudonym + tier + status per card, shard on expand).

---

## Technical Implementation Notes for Knight

### Supabase Realtime Subscription

```javascript
// Anon key works for base-tier Realtime — no JWT required for public payloads
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const channel = supabase
  .channel('peer-presence-live')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'peer_presence'
  }, (payload) => {
    handlePresenceEvent(payload)
  })
  .subscribe()
```

Fallback REST poll (if WebSocket fails):
```javascript
async function pollFallback() {
  const { data } = await supabase
    .from('peer_presence')
    .select('*')
    .order('last_seen_at', { ascending: false })
    .limit(100)
  reconcileState(data)
}
setInterval(pollFallback, 5000)
```

### tier field display

Per BP086 canon: both BASE and MEMBER are real participants. Do NOT visually emphasize tier differences in a way that implies BASE is lesser. Both get the same color dot. Tier label is informational only.

### Hugo page structure

- New Hugo page at `content/live/substrate-awakens/index.html`
- JavaScript bundle: `static/js/substrate-awakens-dashboard.js`
- No server-side rendering needed — all data comes from Supabase Realtime client-side
- Hugo build: static shell with JS hydration on load
- Cache headers: `no-store` on the HTML page (always fresh) · assets with hash = long cache

### Mobile responsiveness constraints

- NEVER scroll sideways at any viewport width
- Breakpoints: 480px (mobile), 768px (tablet), 1200px (desktop)
- Constellation map drops force-layout below 480px
- All three panels stack vertically on mobile
- Ticker and Roster remain functional on mobile — no content hidden

### Performance targets

- Initial page load: under 2s on 20 Mbps
- WebSocket reconnect: automatic, under 3s
- Constellation map re-render on UPDATE event: under 100ms
- Load test target: 50 simultaneous WebSocket connections without degradation (Sharp 12)

---

## Copy + Voice Notes

All copy uses canonical cooperative voice. No corporate hedging. No feature-announcement tone.

The page is not a marketing page. It is a window into a live technical event. The copy treats the viewer as intelligent. It names failures when they happen. It does not perform health.

Forbidden patterns on this page:
- "We're excited to announce..."
- "Powered by AI" without specifics
- Any copy that would become false if the event partially fails
- Any UI that hides the quarantine count or peer-dropout count

---

*BP086 · Sonnet 4.6 · Bishop SEG · Dashboard spec for Knight build yoke*
