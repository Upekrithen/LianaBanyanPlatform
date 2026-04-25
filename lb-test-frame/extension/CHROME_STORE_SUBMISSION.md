# LB Test Frame — Chrome Web Store Submission Checklist

## Store listing metadata

**Extension name:** LB Test Frame
**Tagline:** Verify the Cathedral Effect on your own AI session
**Category:** Productivity
**Language:** English

**Description (132 chars max for summary):**
> Works with Claude, ChatGPT, Gemini, Perplexity, and Copilot. No API key. No terminal. Install in one click.

**Full description (for store detail page):**
> LB Test Frame wraps your existing AI sessions with Liana Banyan's knowledge substrate — the "Cathedral" — enriching your queries with relevant context before they're sent. You stay in control: a small overlay asks whether to send the enriched or original query each time.
>
> **Cathedral Effect Verification Demo**
> Run a 25-question verification battery to measure the Cathedral Effect on your own AI session. Each question is asked twice — once cold (no context), once with LB context. You paste your AI's answers; we compute the lift. Typical result: +60–90 percentage points of improvement.
>
> **Three modes, one installer**
> • Casual — no API key, no setup, free
> • Developer — bring your own API keys, run full R13/R14 benchmarks
> • Member ($5/yr) — the full Liana Banyan platform (Helm, Marks, Trust Match, Six Sparks)
>
> **Privacy**
> Your AI chat history is never read, stored, or transmitted. We only see the query you're about to send. Verification results stay on your machine unless you opt in to share them.

---

## Permissions justification (required by Chrome Web Store review)

| Permission | Reason | Minimal? |
|---|---|---|
| `storage` | Stores injection toggle state, selected AI, onboarding status, and verification results locally. No remote storage of preferences. | ✅ |
| `tabs` | Reads tab URLs to detect which AI vendor sessions are active (claude.ai, chatgpt.com, etc.). Read-only; no tab modification. | ✅ |
| `activeTab` | Allows the popup to interact with the current active tab when the user clicks the extension icon. | ✅ |
| `host_permissions: http://127.0.0.1:7712/*` | Connects to the local Helm daemon (desktop companion app) to fetch cathedral context. Localhost only; no external network access from this permission. | ✅ |

**Content script host matches** (`claude.ai`, `chatgpt.com`, `gemini.google.com`, `perplexity.ai`, `copilot.microsoft.com`):
The content script runs on these five AI vendor domains to intercept query submission and offer cathedral enrichment. It does NOT read page content, session history, or cookies. It only intercepts the text the user is actively typing and about to submit.

---

## Privacy policy URL

Required by Chrome Web Store. Point to:
`https://lianabanyan.com/privacy#test-frame`

(Ensure the privacy policy page includes a "LB Test Frame" section explaining the data practices above.)

---

## Screenshots required (Chrome Web Store min: 1 screenshot, recommended: 5)

| # | Content | Recommended size |
|---|---|---|
| 1 | Onboarding — Persona Picker (Casual / Developer / Member) with LRH greeter | 1280×800 |
| 2 | Pick-Your-AI dialog showing detected sessions with login status badges | 1280×800 |
| 3 | Cathedral injection overlay on claude.ai — "Send original" vs "Send with LB context" | 1280×800 |
| 4 | Verification demo — cold vs cathedral question pair | 1280×800 |
| 5 | Results page — cold vs cathedral lift metrics + LRH quote | 1280×800 |

**Promo tile (440×280):** Required for featured placement. Show LRH chess piece + "Verify the Cathedral Effect" headline.

---

## Icon requirements

- 128×128 PNG for store listing
- 48×48 PNG for Chrome toolbar
- 16×16 PNG for favicon

**Visual canon:** LRH remains chess-piece / animal style per `feedback_no_human_characters.md`. No human rendering.

---

## Submission steps

1. Build extension ZIP: `npm run make:extension-zip` (from `lb-test-frame/electron/`)
2. Log into [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
3. Create new item → upload `lb-test-frame-extension.zip`
4. Fill in all metadata from this document
5. Upload screenshots + promo tile
6. Set privacy policy URL
7. Submit for review (typical approval: 3–7 business days)
8. Review is async — landing page can soft-launch with "Coming soon" badge while pending

---

## Post-approval

- Update `DOWNLOAD_LINKS.chrome` in `platform/src/pages/TestFrameLanding.tsx` with the live store URL
- Tag K502 release once approval notification received
- Announce via Cephas + letters (Bishop handles)
