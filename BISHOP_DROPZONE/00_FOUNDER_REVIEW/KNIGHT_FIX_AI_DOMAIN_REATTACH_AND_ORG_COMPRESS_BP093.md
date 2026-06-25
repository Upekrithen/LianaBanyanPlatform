# BP093 KNIGHT · Fix .ai Domain Reattach + .org Hero Compress

**Sonnet 4.6 ONLY. Confirm Composer model before proceeding. No other model. Statutes §3.**

## Context (Bishop empirical)

Founder rejected Firebase Console manual domain reattach. The .ai domain currently still attaches to `mnemosyne-lianabanyan` site. Bishop dispatched SEG-AS which:
- Created preserved Hugo build at `public-mnemosynec-ai/` from commit `e9aa242` (v0.5.18-era design)
- Deployed it to Firebase site `mnemosynec-ai-lianabanyan`
- Confirmed it's live at `https://mnemosynec-ai-lianabanyan.web.app` (ETag `239153c2...`)
- BUT `mnemosynec.ai` custom domain still serves from old site (ETag `c59a4bf5...`)

Founder also wants .org hero compressed further. Current .org has SEG-AQ work live (merged single yellow bar, readable bullets, no em-dashes, nav compress applied) but hero block is still too tall.

## Goal end state

1. `mnemosynec.ai` serves the preserved `e9aa242` design (v0.5.18-era brochure)
2. `mnemosynec.org` keeps current SEG-AQ design BUT hero block aggressively compressed (elephant smaller or removed from hero, hero padding near-zero, headline + sub + CTA above the fold in a single tight block)
3. Both domains serve correct content WITHOUT Founder Firebase Console action

## Task 1 — Domain reattach via Firebase Management API

Knight authenticates to Firebase Management API. Use existing `firebase` CLI credentials (already authenticated per prior deploys this session).

```
firebase login:list
```

Get the auth token:
```
firebase login:ci  # or read existing token from gcloud
```

Then call the Firebase Hosting REST API to manage custom domains:

```
# List current domains on both sites
curl -H "Authorization: Bearer <TOKEN>" \
  "https://firebasehosting.googleapis.com/v1beta1/sites/mnemosyne-lianabanyan/customDomains"

curl -H "Authorization: Bearer <TOKEN>" \
  "https://firebasehosting.googleapis.com/v1beta1/sites/mnemosynec-ai-lianabanyan/customDomains"
```

If `mnemosynec.ai` is currently attached to `mnemosyne-lianabanyan`:
```
# Detach from mnemosyne-lianabanyan
DELETE https://firebasehosting.googleapis.com/v1beta1/sites/mnemosyne-lianabanyan/customDomains/mnemosynec.ai

# Attach to mnemosynec-ai-lianabanyan
POST https://firebasehosting.googleapis.com/v1beta1/sites/mnemosynec-ai-lianabanyan/customDomains
Body: { "customDomain": "mnemosynec.ai", "hostState": "HOST_ACTIVE" }
```

If the v1beta1 endpoint doesn't expose the custom domain delete operation programmatically, fall back to `gcloud firebase hosting` commands OR use the Service Usage API with the project's service account credentials.

**Verify post-reattach:**
```
curl.exe -sI https://mnemosynec.ai/
# Expect ETag = 239153c2... (preserved site)
# Content-Length ≈ 93,863
```

## Task 2 — Aggressive .org hero compress

File: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

In the `<style>` block (lines 15-235):

**Hero compression (much more aggressive than SEG-AN):**
```css
.hero { padding-block: clamp(0.5rem, 1.5vw, 1rem) !important; }
.hero h1 { font-size: clamp(1.5rem, 3vw, 2rem) !important; line-height: 1.1 !important; margin: 0 0 0.3rem !important; }
.hero .lede { font-size: clamp(0.9rem, 1.2vw, 1rem) !important; margin: 0.3rem 0 !important; }
.hero .mascot, .hero img { max-width: 80px !important; }
.hero .free-private-pill { padding: 0.15rem 0.6rem !important; font-size: 0.7rem !important; }
```

**Result:** headline + sub + Download button visible above the fold. Mascot elephant becomes a small inline icon (~80px) rather than a hero-class graphic. Hero padding near-zero.

Build + deploy:
```
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
git add layouts/partials/mnemosynec-homepage.html
git commit -m "BP093 SEG-AT: aggressive hero compress · brochure density"
hugo --config config-mnemosynec.toml --destination public-mnemosynec --minify
firebase deploy --only hosting:mnemosyne
```

## Task 3 — Empirical verification

```
curl.exe -sI https://mnemosynec.org/
# Expect: NEW Last-Modified (after the rebuild)

curl.exe -sI https://mnemosynec.ai/
# Expect: ETag = 239153c2... (preserved design)

curl.exe -s https://mnemosynec.ai/ | findstr /c:"v0.5"
# Expect: v0.5.18 string present (or whatever old version was)

curl.exe -s https://mnemosynec.org/ | findstr /c:"v0.7.2"
# Expect: v0.7.2 string present (current design)
```

## Yoke Return format

Single message with:
- Domain reattach: SUCCESS / BLOCKED + reason
- .ai ETag post-reattach
- Hero compress commit SHA
- .org Last-Modified post-deploy
- 4 curl verification results
- ELECTRON_TOUCHED: NO

## §14 §15 §17 BLOOD reminders

- §14 Truth-Always: gadget reality, do not claim success without empirical curl
- §15 SEGs do work: fan out within Knight session if needed
- §17 Discovery: librarian gadgets or stated-path Read only, no bash-grep
- Sonnet 4.6 ONLY
