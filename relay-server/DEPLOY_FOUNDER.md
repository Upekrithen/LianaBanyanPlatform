# Relay Server — Founder Deploy Runbook
## BP071 Black Mamba Scopes 5 + 14–15 — WAN/Socceri Connect + Pocket-6 Resolver

**Knight assessment (Truth-Always):** The relay server code and Pocket-6
email→Socceri resolver (Firebase Function) are built and verified.
Deployment requires **Founder GCP action**: the `firebase-adminsdk-fbsvc`
service account lacks `run.services.create` IAM permissions on project
`lianabanyan-403dc`. Founder runs `gcloud auth` once, then this is
**ONE command** per section below.

---

## Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- Node 20+ on PATH
- GCP project: `lianabanyan-403dc`
- Firestore enabled in `lianabanyan-403dc` (Native mode)
- Service account key path (optional — `gcloud auth` replaces it for manual runs)

---

## PART A — Cloud Run Relay Server

## Step 1 — Authenticate as Founder

```powershell
gcloud auth login
# Sign in as Founder@lianabanyan.com or upekrithen@gmail.com
gcloud config set project lianabanyan-403dc
```

## Step 2 — Enable Cloud Run API (if not already enabled)

```powershell
gcloud services enable run.googleapis.com --project lianabanyan-403dc
gcloud services enable cloudbuild.googleapis.com --project lianabanyan-403dc
gcloud services enable secretmanager.googleapis.com --project lianabanyan-403dc
```

## Step 3 — Create a RELAY_SECRET in Secret Manager

```powershell
# Generate a strong secret
$secret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "RELAY_SECRET = $secret"
# Store it (copy from output above):
echo "YOUR_GENERATED_SECRET" | gcloud secrets create relay-secret --data-file=- --project lianabanyan-403dc
```

## Step 4 — Deploy to Cloud Run (source-based build)

```powershell
gcloud run deploy mnemosynec-relay `
  --source "C:\Users\Administrator\Documents\LianaBanyanPlatform\relay-server" `
  --region us-central1 `
  --project lianabanyan-403dc `
  --allow-unauthenticated `
  --port 8080 `
  --update-secrets "RELAY_SECRET=relay-secret:latest" `
  --min-instances 1 `
  --max-instances 10 `
  --memory 256Mi `
  --timeout 3600
```

> `--timeout 3600` is critical: Cloud Run default is 60s which kills WebSocket
> connections. 3600s (1 hour) allows long-lived WS sessions.

After deploy, note the **Service URL** (e.g., `https://mnemosynec-relay-xxxx-uc.a.run.app`).

## Step 5 — Map custom domain relay.mnemosynec.ai

```powershell
# Map the custom domain
gcloud run domain-mappings create `
  --service mnemosynec-relay `
  --domain relay.mnemosynec.ai `
  --region us-central1 `
  --project lianabanyan-403dc

# Get the DNS records Cloud Run requires:
gcloud run domain-mappings describe `
  --domain relay.mnemosynec.ai `
  --region us-central1 `
  --project lianabanyan-403dc
```

The output will list CNAME or A records. Add them to `mnemosynec.ai` DNS
(wherever that zone is managed — if it's Google Cloud DNS on this project, use):

```powershell
# Example — replace VALUES with what the describe command printed:
gcloud dns record-sets create relay.mnemosynec.ai. `
  --zone=mnemosynec-ai `
  --type=CNAME `
  --ttl=300 `
  --rrdatas=ghs.googlehosted.com. `
  --project lianabanyan-403dc
```

## Step 6 — Verify

```powershell
# Health check
Invoke-WebRequest -Uri "https://relay.mnemosynec.ai/" -UseBasicParsing

# Expected: {"status":"ok","peers":0,"ts":"..."}
```

---

---

## PART B — Pocket-6 Firebase Functions (Scope 14)

### Step B1 — Authenticate (same credentials, skip if already done in Part A)

```powershell
gcloud auth login
firebase login
gcloud config set project lianabanyan-403dc
```

### Step B2 — Enable required APIs

```powershell
gcloud services enable firestore.googleapis.com --project lianabanyan-403dc
gcloud services enable cloudfunctions.googleapis.com --project lianabanyan-403dc
gcloud services enable identitytoolkit.googleapis.com --project lianabanyan-403dc
```

### Step B3 — Store INVITE_SECRET in Secret Manager

> The `INVITE_SECRET` used by the Firebase Functions **must equal** the
> `RELAY_SECRET` already stored in Secret Manager for the relay server.

```powershell
# Retrieve your existing relay secret value:
gcloud secrets versions access latest --secret relay-secret --project lianabanyan-403dc

# Store it as invite-secret as well (same value):
echo "PASTE_YOUR_RELAY_SECRET_HERE" | gcloud secrets create invite-secret --data-file=- --project lianabanyan-403dc

# Grant the default Firebase Functions SA access:
gcloud secrets add-iam-policy-binding invite-secret `
  --member="serviceAccount:lianabanyan-403dc@appspot.gserviceaccount.com" `
  --role="roles/secretmanager.secretAccessor" `
  --project lianabanyan-403dc
```

### Step B4 — Install function dependencies

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\relay-server\functions"
npm install
```

### Step B5 — Deploy Firebase Functions (ONE command)

```powershell
cd "C:\Users\Administrator\Documents\LianaBanyanPlatform\relay-server"
firebase deploy --only functions:registerPeer,functions:resolveEmail --project lianabanyan-403dc
```

After deploy Firebase prints the function URLs, e.g.:
```
Function URL (registerPeer(us-central1)): https://us-central1-lianabanyan-403dc.cloudfunctions.net/registerPeer
Function URL (resolveEmail(us-central1)):  https://us-central1-lianabanyan-403dc.cloudfunctions.net/resolveEmail
```

### Step B6 — Set INVITE_SECRET runtime config

```powershell
# Set secret via environment variable binding (Functions v2 / Secret Manager):
firebase functions:secrets:set INVITE_SECRET --project lianabanyan-403dc
# Paste your RELAY_SECRET value when prompted.

# Re-deploy to pick up the secret binding:
firebase deploy --only functions:registerPeer,functions:resolveEmail --project lianabanyan-403dc
```

---

## PART C — Firestore Security Rules

Add to your Firestore rules (Firestore console → Rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // peer_registrations: only Firebase Functions SA can write; deny all client reads/writes
    match /peer_registrations/{email} {
      allow read, write: if false;
    }
  }
}
```

---

## GATE_TEST — Pocket-6 + Relay End-to-End (Scope 15)

> Run these steps after completing Parts A and B. Replace placeholders.

### GT-1 — Register a test peer

```bash
curl -s -X POST \
  https://us-central1-lianabanyan-403dc.cloudfunctions.net/registerPeer \
  -H "Content-Type: application/json" \
  -d '{"peerId":"test1234abcd5678","email":"founder@test.com","displayName":"Test Founder","deviceName":"founder-laptop"}'
```

**Expected response:**
```json
{"ok":true,"email":"founder@test.com","status":"registered_no_email"}
```
(status will be `pending_verification` once Firebase Auth email delivery is configured)

### GT-2 — Resolve the registered peer

```bash
curl -s -X POST \
  https://us-central1-lianabanyan-403dc.cloudfunctions.net/resolveEmail \
  -H "Content-Type: application/json" \
  -d '{"secret":"$INVITE_SECRET","email":"founder@test.com"}'
```

**Expected response:**
```json
{"peerId":"test1234abcd5678"}
```

### GT-3 — Register an invite pair on the relay

```bash
curl -s -X POST \
  https://relay.mnemosynec.ai/invite \
  -H "Content-Type: application/json" \
  -d '{"secret":"$RELAY_SECRET","peerA":"test1234abcd5678","peerB":"ef567890ef567890"}'
```

**Expected response:**
```json
{"ok":true,"pair":"ef567890ef567890|test1234abcd5678"}
```

### GT-4 — Full invite flow (resolve then invite)

```bash
# Step 1: resolve peer B's Socceri address by email
PEER_B=$(curl -s -X POST \
  https://us-central1-lianabanyan-403dc.cloudfunctions.net/resolveEmail \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$INVITE_SECRET\",\"email\":\"peerB@example.com\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['peerId'])")

# Step 2: register the invite pair on the relay
curl -s -X POST \
  https://relay.mnemosynec.ai/invite \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$RELAY_SECRET\",\"peerA\":\"$MY_PEER_ID\",\"peerB\":\"$PEER_B\"}"
```

### GT-5 — SHA256 relay binary hash verification

```powershell
# Compute SHA256 of the deployed relay source entry point:
$hash = Get-FileHash "C:\Users\Administrator\Documents\LianaBanyanPlatform\relay-server\server.js" -Algorithm SHA256
Write-Host "server.js SHA256: $($hash.Hash)"
# Record this hash in your deployment log; compare after any update.
```

### GT-5 Gate Pass/Fail

| Check | Pass criterion |
|---|---|
| GT-1 registerPeer returns `ok: true` | ✓ |
| GT-2 resolveEmail returns correct `peerId` | ✓ |
| GT-3 relay `/invite` returns `ok: true` | ✓ |
| Relay `/peers` shows connected peers | ✓ |
| Full federation hash-verify (see `GATE_TEST.md`) | ✓ |

---

## Invite Pair Registration (post-deploy)

When Peer A invites Peer B by email, the invite flow resolves B's Socceri
address (peerId) and calls the relay `/invite` endpoint:

```powershell
Invoke-RestMethod -Uri "https://relay.mnemosynec.ai/invite" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"secret":"YOUR_RELAY_SECRET","peerA":"<peerIdA>","peerB":"<peerIdB>"}'
```

---

## GATE Test Protocol (for Founder to run post-deploy)

See `GATE_TEST.md` for WAN hash-verify gate (Scope 5 gate).
See **GATE_TEST** section above for Pocket-6 resolver gate (Scope 15 gate).
