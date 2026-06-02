# Museum DNS Prep — BP071 Knight

## Goal
Move `museum.lianabanyan.com` → `lianabanyan-museum-frozen` Firebase Hosting site
(Firebase project: `lianabanyan-403dc`)

---

## Founder Action (one pass)

### Step 1: Firebase Console — Add Custom Domain
1. Go to [Firebase Console](https://console.firebase.google.com/) → project **lianabanyan-403dc** → **Hosting**
2. In the Hosting sites list, select **lianabanyan-museum-frozen**
3. Click **Add custom domain**
4. Enter: `museum.lianabanyan.com`
5. Firebase will generate and display:
   - A **TXT verification record** (copy the full value — looks like `firebase=<token>`)
   - **DNS records to point the domain** — Firebase provides either:
     - Two **A records** (for apex domains), OR
     - A **CNAME** → `lianabanyan-museum-frozen.web.app` (typical for subdomains)
   - **Copy all values from the Console before leaving the dialog.**

> **Note:** For subdomains like `museum.lianabanyan.com`, Firebase most commonly issues a CNAME record. The Console is the authoritative source — do not use hardcoded IPs.

---

### Step 2: Squarespace DNS — TXT Verification Record
Add the TXT record Firebase generated in Step 1:

| Field | Value |
|---|---|
| Record type | `TXT` |
| Host | `museum` |
| Value | *(copy from Firebase Console — Step 1)* |
| TTL | Default (or 3600) |

---

### Step 3: Squarespace DNS — Pointing Record(s)
Add the record(s) Firebase generated in Step 1:

**If Firebase issued a CNAME (most likely for subdomain):**

| Field | Value |
|---|---|
| Record type | `CNAME` |
| Host | `museum` |
| Points to | `lianabanyan-museum-frozen.web.app` |
| TTL | Default (or 3600) |

**If Firebase issued A records instead:**

| Field | Value |
|---|---|
| Record type | `A` |
| Host | `museum` |
| Points to | *(IP 1 — copy from Firebase Console)* |

| Field | Value |
|---|---|
| Record type | `A` |
| Host | `museum` |
| Points to | *(IP 2 — copy from Firebase Console)* |

---

### Step 4: Back in Firebase Console
After DNS propagates (can take minutes to hours), return to the Firebase Console custom domain dialog and click **Verify** to complete domain ownership verification and activate SSL.

---

## Current Firebase Config (Confirmed)

### `.firebaserc` — `Cephas/cephas-hugo/.firebaserc`
```json
{
  "projects": {
    "default": "lianabanyan-403dc"
  },
  "targets": {
    "lianabanyan-403dc": {
      "hosting": {
        "museum": ["lianabanyan-museum"],
        "museum-frozen": ["lianabanyan-museum-frozen"]
      }
    }
  }
}
```

- `museum-frozen` target → `lianabanyan-museum-frozen` site: **CONFIRMED** in `.firebaserc`

### `firebase.json` — `Cephas/cephas-hugo/firebase.json`
The `firebase.json` currently defines hosting targets for `cephas`, `museum`, and `mnemosyne`.
**`museum-frozen` is not yet in `firebase.json`** — the site exists in Firebase and is registered in `.firebaserc`, but it is not wired into the deploy script.

> This is fine for DNS/custom domain purposes. The frozen site can receive a custom domain independently of the deploy config. If future deploys to `museum-frozen` are needed, add a `museum-frozen` target block to `firebase.json` and update `DEPLOY.md`.

### Current DEPLOY.md targets
| Short target | Hosting site | URL |
|---|---|---|
| `cephas` | `cephas-lianabanyan` | https://cephas.lianabanyan.com |
| `museum` | `lianabanyan-museum` | https://lianabanyan-museum.web.app |
| `mnemosyne` | `mnemosyne-lianabanyan` | https://mnemosyne.lianabanyan.com |

`museum.lianabanyan.com` is not yet pointed at any Firebase site — this scope provisions it against `lianabanyan-museum-frozen`.

---

## Blockers / Notes
- **Cannot pre-populate TXT or IP values** — Firebase generates the TXT token per-domain at the moment Founder initiates the custom domain flow in Console. Values must be copied live from the Console dialog.
- **Firebase Console is the gating action** — Squarespace DNS changes follow from what Console generates.
- **Existing `museum` target** (`lianabanyan-museum`) is unaffected. Only the `museum-frozen` site is receiving the custom domain.

---

## Status
⏳ **PENDING FOUNDER ACTION** — DNS records staged; awaiting Founder to initiate in Firebase Console → then add records in Squarespace.
