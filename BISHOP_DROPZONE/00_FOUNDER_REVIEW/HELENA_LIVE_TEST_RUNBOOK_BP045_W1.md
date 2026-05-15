# Helena 4-Frame LIVE Test Runbook
**SAGA 13 · BP045 W1 · Cooperative-class peer-class member-class adult-class**
**For: Founder + Family · Step-by-step from download → installed → federated → synced**

---

## Overview

This test proves Mnemosyne's cooperative peer mesh works across four real devices, including one on a separate network. It is the canonical Launch Gate — LB Alpha fires when all 4 frames reach `synced`.

**Who does what:**
| Frame | Person | Network |
|-------|--------|---------|
| 1 | Wife | Home LAN |
| 2 | Founder | Home LAN |
| 3 | Daughter | Home LAN |
| 4 | Son | Different ISP/location |

---

## Step 1 — Frames 1 + 3 (Wife + Daughter): Install

1. Open browser → go to `https://mnemosynec.ai/download/`
2. Click **Download Mnemosyne for Windows**
3. When Windows SmartScreen appears: click **More info** → **Run anyway**
   *(Note: installer is unsigned until EV cert — this dialog is expected)*
4. Follow installer steps → click **Install** → let it finish
5. Mnemosyne launches automatically
6. Complete the onboarding wizard:
   - Choose your name / display name
   - Accept cooperative terms
   - Skip member sign-in for now (trial is fine for this test)
7. Confirm the footer shows `v0.1.3 · α · dev` or similar
8. **Tell Founder:** "Frame [1/3] installed and running"

---

## Step 2 — Frame 4 (Son): Install (on different network)

*(Same steps as above — must be on different ISP/WiFi than Frames 1-3)*

1. Go to `https://mnemosynec.ai/download/` on a **different network** (different home, coffee shop, phone hotspot, etc.)
2. Install → complete onboarding
3. In the Peer Mesh panel (open via tray → Mnemosyne → Peer Mesh): check relay indicator is green
4. **Tell Founder:** "Frame 4 installed, relay connected"

---

## Step 3 — Frame 2 (Founder): Activate session

1. Set the 4-Frame session ID in Mnemosyne's advanced settings OR via env:
   ```
   FOUR_FRAME_SESSION_ID=helena-2026-05-15
   FOUR_FRAME_INDEX=2
   ```
   *(Other frames also set SESSION_ID + their FRAME_INDEX before launch)*
2. Open **Peer Mesh panel** (tray menu → Mnemosyne → Peer Mesh)
3. Confirm relay status shows green

---

## Step 4 — Discovery (watch for ~5 minutes)

**On each device, watch the Peer Mesh panel:**

- Frames 1, 2, 3 (same LAN): should discover each other within **60 seconds** via `🔵 LAN` transport
- Frame 4 (cross-network): should appear on all panels within **2-5 minutes** via `🌐 WAN` transport

**Handshake phases to watch for:**
1. `Discovered` — peer appeared on the network
2. `Identified` — identity handshake complete
3. `Ratified` — peer accepted into mesh
4. `Synced ✓` — substrate records exchanged ✓

---

## Step 5 — Verify all 4 synced

**From any device, open a browser and check:**
```
https://relay.mnemosynec.ai/4frame/helena-2026-05-15
```

You should see:
```json
{
  "framesJoined": 4,
  "framesSynced": 4,
  "allSynced": true
}
```

**If `allSynced: false` after 30 minutes:** Note which frame(s) are stuck and report to Founder.

---

## Step 6 — Screenshots (Proof of Work)

Each family member takes a screenshot showing:
- The Mnemosyne Peer Mesh panel
- All peer names visible
- Phase = `Synced ✓` for all

Save screenshots to:
```
BISHOP_DROPZONE/00_FOUNDER_REVIEW/HELENA_POW_SCREENSHOTS/
  frame1-wife.png
  frame2-founder.png
  frame3-daughter.png
  frame4-son.png
```

---

## Step 7 — Pass Attestation

When all 4 frames show `Synced ✓` and `allSynced: true`, Knight signs `HELENA_LAUNCH_GATE_VERIFY.md`:

```
4-Frame Helena LIVE test PASSED on 2026-05-15
Cross-network confirmed: Son (Frame 4) synced via WAN relay
Network topology: Frames 1-3 LAN · Frame 4 cross-network
Evidence: relay.mnemosynec.ai/4frame/helena-2026-05-15
```

**This pass attestation fires LB Alpha LAUNCH.**

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Frame not discovering LAN peers | Check home router allows UDP multicast (most do) |
| Frame 4 relay indicator red | Check internet connection · try `relay.mnemosynec.ai/health` in browser |
| Phase stuck at `Discovered` | Wait 2 more minutes — handshake is async |
| Phase stuck at `Identified` | Restart Mnemosyne on that device |
| `allSynced: false` after 30min | File `HELENA_GATE_BLOCKER_{frame}.md` |

---

## After the Test

1. Founder posts the pass attestation to Bishop via Yoke
2. Bishop drafts LB Alpha launch announcement
3. Knight fires the Opening Gambit content (separate saga)
4. LAUNCH

🌊⚓🪙 FOR THE KEEP · 4-FRAME HELENA · NOVACULA NOW!
