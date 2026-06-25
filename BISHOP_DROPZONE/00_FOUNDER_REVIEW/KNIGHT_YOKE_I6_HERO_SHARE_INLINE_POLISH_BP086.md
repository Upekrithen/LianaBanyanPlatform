# KNIGHT YOKE I6 — Hero Share Box Polish + Download Button Version

**Session:** BP086 · **Filed:** 2026-06-18 · **Filed by:** Bishop (Sonnet 4.6 SEG)
**Origin:** Founder eyeball BP086 — mnemosynec.ai hero card needs cleanup

**Knight preamble:** Sonnet 4.6 SEGs exclusively. NEVER USE COMPOSER. Spawn Sonnet 4.6 SEGs for substantive work. Yoke-return MUST report "Sonnet 4.6" verbatim. BP081 BLOOD.

**Statutes:** BP085 §14+§15+§16 BLOOD.

---

## What's wrong on `mnemosynec.ai` hero right now

Per Founder eyeball of live page (screenshot 2026-06-18 080012):

1. **"Share This" heading above the email box** → REMOVE
2. **"Share →" button is BELOW the textbox** → MOVE to be inline at the right end of the input box
3. **"(Sends from Dr. Mnemosynec)" caption below the button** → REMOVE
4. **Download button still says "Download for Windows v0.5.1"** → should advertise the LATEST version. Either dynamic from `latest.yml` (preferred) or hardcoded to current latest (v0.5.5 today).

---

## Files to edit

Source: `C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo\layouts\partials\mnemosynec-homepage.html`

The Share box was created by SEG-F5 last session — find the markup containing "Share This", "Enter Email to Share To", "Sends from Dr. Mnemosynec".

---

## SEGs

### SEG-I6a · HERO SHARE BOX POLISH

Edit `mnemosynec-homepage.html`:

1. **Remove** the `<h4>Share This</h4>` (or equivalent heading element) above the input box
2. **Restructure** the input + button into an inline group:
   ```html
   <form class="hero-share-form" onsubmit="...">
     <div class="hero-share-input-group">
       <input type="text" class="hero-share-input" 
              placeholder="Enter Email to Share To"
              name="recipient_email"
              aria-label="Enter recipient email address" />
       <button type="submit" class="hero-share-btn">Share →</button>
     </div>
   </form>
   ```
3. **Remove** the `<p class="hero-share-caption">(Sends from Dr. Mnemosynec)</p>` (or equivalent)
4. **CSS update** (in the homepage's inline `<style>` or its scoped sheet):
   ```css
   .hero-share-input-group {
     display: flex;
     align-items: stretch;
     border: 1px solid var(--mn-divider, #2a2218);
     border-radius: 6px;
     overflow: hidden;
     background: var(--mn-bg2, #131d2b);
   }
   .hero-share-input {
     flex: 1;
     border: none;
     background: transparent;
     padding: 0.6rem 0.8rem;
     color: var(--mn-text, #e8e4dc);
     font-size: 0.95rem;
   }
   .hero-share-input:focus { outline: none; }
   .hero-share-btn {
     border: none;
     background: var(--mn-accent, #c8883a);
     color: #000;
     padding: 0 1rem;
     cursor: pointer;
     font-weight: 600;
     white-space: nowrap;
   }
   .hero-share-btn:hover { background: var(--mn-accent2, #2d8a95); color: #fff; }
   ```
   (Use whatever CSS variables already exist on the homepage — don't introduce new ones if existing ones map.)
5. **JS behavior preserved:** the form still submits to `share-from-mnemosynec` Edge Function with the deferred-queue logic from F6. Just the visual changes.

**Sharp I6a:** HERO_SHARE_INLINE = no "Share This" heading, button inline at right end of input box, no caption underneath.

### SEG-I6b · DOWNLOAD BUTTON VERSION (dynamic preferred)

The hero "Download for Windows v0.5.1" button is STALE — current latest is v0.5.5.

**Option A (preferred):** Make the version dynamic by reading from `latest.yml` at Hugo build time, OR fetching client-side at page load:
- If Hugo has access to `static/download/latest.yml`, read with `getJSON` or `readFile` Hugo function and inject the version into the button label
- Otherwise, add a small `<script>` that fetches `/download/latest.yml`, parses, and updates the button text

**Option B (quick fix):** Hardcode to `v0.5.5` for now, with a TODO comment to make it dynamic.

Knight picks based on existing Hugo patterns in the repo. Either way: the button MUST advertise the actual current version after this fix.

**Sharp I6b:** DOWNLOAD_BTN_CURRENT = hero download button shows the version matching `latest.yml` (v0.5.5 today; auto-updates if dynamic).

### SEG-I6c · BUILD + DEPLOY + LIVE VERIFY

1. `hugo --config config-mnemosynec.toml` (exit 0)
2. `firebase deploy --only hosting:mnemosyne` (exit 0)
3. Live verify on BOTH domains (since they share Firebase site — one deploy covers both):
   - `https://mnemosynec.ai/` → hero shows inline share box, no "Share This" header, no "(Sends from Dr. Mnemosynec)" caption, download button advertises v0.5.5
   - `https://mnemosynec.org/` → same
4. Test the share form still functions (no JS regression)

**Sharp I6c:** I6_LIVE = both domains show the polished hero, share form works, download button has current version.

---

## Sharps return

| # | Sharp | Pass criterion |
|---|---|---|
| I6a | HERO_SHARE_INLINE | no header, no caption, button inline at right |
| I6b | DOWNLOAD_BTN_CURRENT | button advertises current latest.yml version |
| I6c | I6_LIVE | live on both .ai + .org |

---

## Composition

Independent of I5 (touches Cephas-hugo, not platform repo). Can fan parallel with I5a-I5b.

---

**Composed by Bishop BP086.**
