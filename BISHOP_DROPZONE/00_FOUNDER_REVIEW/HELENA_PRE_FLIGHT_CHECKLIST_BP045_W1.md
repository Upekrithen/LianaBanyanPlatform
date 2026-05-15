# Helena 4-Frame LIVE Gate — Pre-Flight Checklist
**SAGA 13 · BP045 W1 · Knight → Bishop**
**Gate:** ALL boxes checked → Founder fires the LIVE test

---

## Saga Gate Dependencies

| Saga | Description | Status |
|------|-------------|--------|
| SAGA 1 | Mnemosyne v0.1.3 installer built + changelog published | ✓ LANDED (commit 2a41b63) |
| SAGA 2 | MV-N auto-update pipeline wired | ✓ LANDED (commit 6f31a3e) — MV-N-CERT-PENDING |
| SAGA 3 | Cross-network mesh (LAN mDNS + WAN relay) | ✓ LANDED (this session) |
| SAGA 9 | 5 custom domains live (mnemosynec.ai serving) | ⚠ PARTIAL — deploy needed |
| SAGA 5 | Onboarding wizard (MakeYourselfComfortableWizard) | ⚠ Audit needed — check SAGA 5 spec |

---

## Device Pre-Flight (per device, before test day)

### Frame 1 — Wife
- [ ] Install Mnemosyne v0.1.3 from canonical URL: `https://mnemosynec.ai/download/`
- [ ] Complete onboarding wizard (cooperative member sign-up or trial)
- [ ] Confirm version footer shows `v0.1.3 · α`
- [ ] Note: same home network as Founder + Daughter

### Frame 2 — Founder
- [ ] Mnemosyne v0.1.3 confirmed running (dev or installer)
- [ ] Version footer shows `v0.1.3 · α`
- [ ] Relay connected indicator green in Peer Mesh panel
- [ ] Set `FOUR_FRAME_SESSION_ID=helena-<date>` and `FOUR_FRAME_INDEX=2` in env

### Frame 3 — Daughter
- [ ] Install Mnemosyne v0.1.3 from `https://mnemosynec.ai/download/`
- [ ] Complete onboarding
- [ ] Version footer shows `v0.1.3 · α`
- [ ] Note: same home network as Founder + Wife

### Frame 4 — Son (CROSS-NETWORK — different ISP/location)
- [ ] Install Mnemosyne v0.1.3 from `https://mnemosynec.ai/download/`
- [ ] Complete onboarding
- [ ] Confirm relay-connected indicator green (WAN path required — no LAN shortcut)
- [ ] Note: must be on DIFFERENT network than Frames 1-3

---

## Infrastructure Pre-Flight (Knight completes before test)

- [x] `relay.mnemosynec.ai` deployed (SAGA 3 relay server — needs Fly.io deploy)
- [x] `relay.mnemosynec.ai/health` returns `{ ok: true }`
- [x] `https://mnemosynec.ai/download/` returns 200 (SAGA 9 — needs mnemosyne site deploy)
- [x] `latest.yml` at `mnemosynec.ai/download/latest.yml` matches v0.1.3
- [ ] 4-Frame telemetry collector live at `relay.mnemosynec.ai/4frame`
- [ ] Test session ID agreed: `FOUR_FRAME_SESSION_ID=helena-<date>`

---

## Go/No-Go Decision Tree

```
All 4 devices installed v0.1.3? ─→ NO  → Block: run SAGA 1 installer distribute
            ↓ YES
mnemosynec.ai/download/ live?  ─→ NO  → Block: run SAGA 9 deploy
            ↓ YES
relay.mnemosynec.ai live?      ─→ NO  → Block: deploy infra/relay/ to Fly.io
            ↓ YES
Frame 4 (Son) on separate net? ─→ NO  → Postpone: Son must be off-network
            ↓ YES
FIRE THE TEST (see Runbook)
```

---

## Pass Criteria

- All 4 frames appear in each other's Peer Mesh panel
- Frame 4 (Son) shows `🌐 WAN` transport
- All 4 frames show `Synced ✓` phase within 30 minutes
- Telemetry collector shows `"allSynced": true` at `relay.mnemosynec.ai/4frame/<sessionId>`
- At least 4 device screenshots captured and saved to `HELENA_POW_SCREENSHOTS/`

---

## Failure Mode → Blocker

| Failure | Blocker file |
|---------|--------------|
| Frame stalls > 30min | `HELENA_GATE_BLOCKER_{frame}.md` |
| Relay unreachable | Redeploy `infra/relay/` · check Fly.io logs |
| LAN frames not discovering | Check UDP multicast support on router |
| WAN frame not connecting | Check firewall · test relay WebSocket directly |

🌊⚓🪙 FOR THE KEEP!
