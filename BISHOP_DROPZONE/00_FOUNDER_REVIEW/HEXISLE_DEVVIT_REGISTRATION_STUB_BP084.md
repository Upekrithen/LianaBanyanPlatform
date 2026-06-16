# HexIsle Devvit Registration Stub — BP084 SEG-6

**⚠ FOUNDER ACTION REQUIRED — register before 2026-06-30 (15 days from BP084)**

---

## What This Is

HexIsle's Reddit integration requires registering a Devvit (Developer Platform) application
with Reddit before June 30, 2026. Devvit is Reddit's first-party developer toolkit for
building interactive experiences directly inside subreddits.

---

## Cross-Realm Architecture

```
Council Realm (Reddit)          Sword Realm (Discord)
  ┌──────────────────┐            ┌────────────────────┐
  │  Devvit App      │            │  Discord Bot       │
  │  (subreddit UI)  │            │  (guild channels)  │
  └────────┬─────────┘            └────────┬───────────┘
           │                               │
           └──────────────┬────────────────┘
                          │
                   Shadow Gate
                 (MnemosyneC relay)
                   wan-relay-route
                 relay.lianabanyan.com
```

- **Council Realm (Reddit Devvit):** HexIsle interactive game board embedded in subreddits.
  Users play directly in Reddit posts via Devvit's custom post type.
- **Sword Realm (Discord bot):** Guild coordination, announcements, matchmaking in Discord servers.
- **Shadow Gate:** Cross-realm state sync via MnemosyneC relay (WAN NAT traversal, BP084 SEG-2).
  Devvit posts game-state changes → relay → Discord bot picks up and announces.

---

## Slot Assignments (Canon)

| Slot | Person | Role |
|------|--------|------|
| **Slot #1** | Mikey | Primary Devvit account / owner |
| **Slot #2** | Son | Secondary collaborator / backup owner |

---

## Reddit Devvit Registration Steps

### Step 1 — Create Reddit Developer Account (Mikey — Slot #1)
1. Go to [https://developers.reddit.com](https://developers.reddit.com)
2. Sign in with Mikey's Reddit account
3. Accept the Developer Agreement
4. Navigate to **My Apps** → **Create App**

### Step 2 — Install Devvit CLI
```bash
npm install -g devvit
devvit login
```

### Step 3 — Initialize HexIsle Devvit App
```bash
# In the HexIsle project directory
devvit new hexisle --template=custom-post
devvit upload
```

### Step 4 — Register App Name
- **App name:** `hexisle`
- **Display name:** `HexIsle — Cooperative Hex Strategy`
- **Description:** Cooperative hex-grid strategy game in the Liana Banyan cooperative ecosystem.
- **App type:** Custom Post

### Step 5 — Add Collaborator (Son — Slot #2)
1. In [https://developers.reddit.com/my-apps/hexisle](https://developers.reddit.com/my-apps/hexisle)
2. Settings → Collaborators → Add collaborator → Son's Reddit username
3. Grant: **Developer** access level

### Step 6 — Configure Subreddit
1. Create or use existing subreddit: `r/HexIsle` or `r/LianaBanyanCooperative`
2. In Devvit dashboard: **Install to subreddit** → select the subreddit
3. Configure custom post permissions

### Step 7 — Shadow Gate Webhook Config
Add to the Devvit app's `devvit.yaml`:
```yaml
webhooks:
  - url: https://relay.lianabanyan.com/functions/v1/wan-relay-route
    events:
      - game_state_change
      - player_join
      - player_leave
```

### Step 8 — Discord Bot Token
1. Create Discord application at [https://discord.com/developers/applications](https://discord.com/developers/applications)
2. Bot name: `HexIsle Guild Liaison`
3. Add to Liana Banyan Discord server with `MANAGE_CHANNELS`, `SEND_MESSAGES`, `READ_MESSAGE_HISTORY`
4. Add bot token to env: `HEXISLE_DISCORD_BOT_TOKEN=`

---

## Environment Variables Required

Add to `Asteroid-ProofVault/LockBox/SDS.env`:
```
HEXISLE_DEVVIT_APP_ID=<from Reddit Devvit dashboard>
HEXISLE_DEVVIT_APP_SECRET=<from Reddit Devvit dashboard>
HEXISLE_DISCORD_BOT_TOKEN=<from Discord developer portal>
HEXISLE_DISCORD_GUILD_ID=<your Discord server ID>
```

---

## Deadline Tracker

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Reddit Devvit account setup | Mikey (Slot #1) | 2026-06-30 | ⏳ PENDING |
| Devvit app registration | Mikey | 2026-06-30 | ⏳ PENDING |
| Son added as collaborator | Mikey | 2026-06-30 | ⏳ PENDING |
| Discord bot creation | Founder | 2026-06-30 | ⏳ PENDING |
| Shadow Gate webhook wired | Knight | After DNS resolves | ⏳ PENDING |

---

## References

- Reddit Devvit docs: [https://developers.reddit.com/docs](https://developers.reddit.com/docs)
- HexIsle portal: `hexisle.lianabanyan.com` (deployed from `platform/dist/`)
- MnemosyneC relay: `platform/supabase/functions/wan-relay-route/index.ts`
- WAN relay architecture: BP084 SEG-2

---

*Knight BP084 SEG-6 — 2026-06-15*
*FOR THE KEEP.*
