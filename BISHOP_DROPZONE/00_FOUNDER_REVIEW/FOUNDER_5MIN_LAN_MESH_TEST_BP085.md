## Self-Hosted Single-Node Mesh Readiness Test (5 min · Founder solo)

**PURPOSE:** Confirm that when v0.5.0 is open on Founder M0:
- Substrate Awakens token flow completes
- `peer_presence` row writes correctly with the new schema
- The row contains the right metadata (`version`, `machine_class`, `last_seen`)
- Tearing down v0.5.0 cleanly removes / decays the row appropriately

This is NOT the canonical 1,000-signup Mesh Test. It is a DEV readiness check so we know the relay end-to-end is honest before the public test fires.

---

### Step 1 · Open MnemosyneC v0.5.0

- Confirm app launches clean
- Navigate to **Test It Out** tab (BP083 canon: this is where Substrate Awakens lives)
- If blank tabs / no tabs visible, BP083 cure: `Win+R` → type `%APPDATA%\mnemosynec` → delete or rename the folder → relaunch + complete onboarding fresh

---

### Step 2 · Run Substrate Awakens token flow

- Click the **"Join Mesh"** / **"Substrate Awakens"** card on the Test It Out tab
- Follow on-screen: get token → enter token → wait for confirmation
- Expect: green **"Connected to mesh"** indicator

---

### Step 3 · Verify peer_presence row from another terminal

Open a **new PowerShell window** (do NOT use the same window MnemosyneC is running in) and paste this single line:

```powershell
$envContent = Get-Content "C:\Users\Administrator\.claude\state\secrets\22May2026.env" | Select-String "^SUPABASE_DB_URL="; $dbUrl = ($envContent -replace "SUPABASE_DB_URL=", "").ToString().Trim(); psql $dbUrl -c "SELECT peer_id, last_seen, version, machine_class FROM peer_presence WHERE last_seen > now() - interval '5 minutes' ORDER BY last_seen DESC;"
```

> NOTE: This loads `SUPABASE_DB_URL` safely into a local PowerShell variable without echoing the value to the terminal. Pattern is BP084 STATUTES §4 canon — secrets never printed, never piped, never logged.

**Expect:** 1 row containing:
- `peer_id` — your node's unique identifier
- `last_seen` — within the last 60 seconds
- `version` — `0.5.0`
- `machine_class` — `founder-m0` or similar founder-class label

---

### Step 4 · Decay test

- Close MnemosyneC fully: click **X** to close the window, then check the **system tray** (bottom-right) and quit from there if still running
- Wait **90 seconds**
- Re-run the same psql query from Step 3
- **Expect:** `last_seen` is frozen at the close-time timestamp; the row is still present in the table (decay is on-read, not on-write — the row is not deleted immediately)

---

### Step 5 · Reopen + verify revival

- Reopen MnemosyneC v0.5.0
- Wait **30 seconds** for the heartbeat cycle to fire
- Re-run the psql query from Step 3
- **Expect:** `last_seen` advances to the current time; the `peer_id` is the same value as before (peer identity persists across restarts)

---

### Sharp-Pass Criteria

| # | Check | Pass |
|---|-------|------|
| 1 | 1 row appears in `peer_presence` within 60s of token flow completing | ✅ |
| 2 | Schema matches: `peer_id` · `last_seen` · `version` · `machine_class` all present and populated | ✅ |
| 3 | Decay behavior correct: row persists after close, `last_seen` frozen | ✅ |
| 4 | Revival on reopen: `last_seen` advances, same `peer_id` | ✅ |
| 5 | No errors in Supabase Edge Function logs during the run | ✅ |

To check Edge Function logs: Supabase Dashboard → Edge Functions → your heartbeat function → Logs tab. All 200s expected; any 4xx/5xx = escalate.

---

### When to escalate

**Step 3 returns 0 rows:**
- Relay heartbeat is NOT firing, OR
- The Edge Function rejected the payload (check logs per above)

Action: Bishop dispatches Knight via diagnose yoke. Do not manually patch the schema — diagnose first.

**Step 5 shows a different `peer_id` on revival:**
- Peer identity is not being persisted to disk correctly
- Action: flag to Knight — `peer_id` must be stable across restarts for the canonical Mesh Test roster to be accurate

---

### After the test

- **Optional:** Leave MnemosyneC open and let it accumulate heartbeats — this is the live warm-up for the public Substrate Awakens event
- **Optional:** Re-run the `peer_presence` count query daily to track real users coming online before the 1,000-signup threshold is reached
- **Do not publish this result as the canonical Mesh Test receipt.** This is a single-node DEV readiness check. The canonical Substrate Awakens event requires simultaneous multi-node presence with the public dashboard live at `mnemosynec.ai/live/substrate-awakens/`

---

*BP085 · Composed by Sonnet 4.6 SEG · 2026-06-16 · Truth-Always: single-node DEV check only, NOT the 1,000-signup canonical Mesh Test*
