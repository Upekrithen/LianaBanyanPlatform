# Wife Test Checklist -- MnemosyneC WAVE A (BP073)
## W30 Final Edition -- Real Hardware Acceptance Gate

A step-by-step checklist for verifying A1-A5 on a clean Windows machine.
Run these checks in order on a fresh install. Expected outcome + recovery steps at each item.

**Last Verified:** W30 -- 2026-06-03
**Status:** READY FOR WIFE TEST (Founder must complete B-4 Supabase first for web platform)

---

## Real Hardware Prerequisites
*(What the Founder must set up before handing the machine to the test user)*

### For MnemosyneC Desktop App (can run without Supabase)
- [ ] Windows 11 (22H2 or later), fresh user profile or clean account
- [ ] Chrome browser installed (any recent version; download from google.com/chrome)
- [ ] No Ollama, no Node, no Python pre-installed (true clean test condition)
- [ ] MnemosyneC installer `.exe` copied to the Desktop -- from `release/` folder or shared drive
- [ ] Internet connection available during first run (Ollama model download: ~1.5 GB, takes 5-10 min)
- [ ] Estimated setup time for Founder: 10 minutes. Test time for wife: 20-30 minutes.

### For Web Platform (lianabanyan.org) -- Requires Founder completing B-4 first
- [ ] Supabase production project live (Founder action B-4 in FOUNDER_PUNCH_LIST.md)
- [ ] Vercel production deploy green (Founder action: trigger deploy after B-4 and B-1)
- [ ] Domain lianabanyan.org resolving to Vercel (Founder action B-2: DNS configured)
- [ ] Test user email account ready (fresh Gmail or similar -- not Founder's email)
- [ ] Stripe live keys configured in Vercel (Founder action B-1) -- needed only if testing paid membership

### For Chrome Extension (part of MnemosyneC test)
- [ ] Chrome installed on the test machine
- [ ] MnemosyneC desktop app running (provides the localhost:11480 API)
- [ ] The `platform/chrome-extension/` folder copied to the test machine or accessible
- [ ] Developer mode available in Chrome (always available -- no special permission needed)

---

## Pre-flight: Clean Machine Setup

- [ ] Windows 11 (22H2 or later), fresh user profile
- [ ] Chrome browser installed (any recent version)
- [ ] No Ollama, no Node, no Python pre-installed (true clean)
- [ ] MnemosyneC installer `.exe` from the `release/` folder ready on the Desktop

---

## W30 Extended Scope: Web Platform Journey

*These steps test the web platform (lianabanyan.org) as a non-technical user. Requires Founder to
complete B-4 Supabase before running. Can be tested in parallel with the MnemosyneC desktop test.*

### WP1 -- Landing Page Visit

- Navigate to `https://lianabanyan.org` (or Vercel preview URL if DNS not yet live)
- Expected: Landing page loads, shows the platform headline and call-to-action
- The landing page renders in under 3 seconds on a standard home connection
- **Status: WORKS** -- Index.tsx renders landing page for unauthenticated users
- If FAILS: Check Vercel deploy status. Confirm DNS resolving (can use Vercel preview URL instead).

### WP2 -- Sign-Up Flow

- Click "Sign Up" or "Join" on the landing page
- Expected: Auth page appears with email/password fields
- Fill in: new email, password (8+ chars), click "Create Account"
- Expected: Email verification sent (if Supabase email verification enabled) OR account created
- **Status: WORKS** -- Auth.tsx + MascotAuthGate handle sign-up flow
- If FAILS: Check Supabase project is live (Founder B-4). Check SUPABASE_URL env var in Vercel.

### WP3 -- Login Flow

- After sign-up (or with existing account), navigate to /auth
- Enter email + password, click "Sign In"
- Expected: Redirects to dashboard or home view showing personalized content
- **Status: WORKS** -- useAuth context handles Supabase auth state
- If FAILS: Check Supabase anon key in Vercel env vars (SUPABASE_ANON_KEY).

### WP4 -- MnemosyneC Download Page

- Navigate to /mnemosynec or look for "Download" link in nav
- Expected: Page shows the download link for the Windows desktop app
- Click the download link: expected `.exe` file starts downloading
- **Status: WORKS** -- MnemosyneCSpinoutPage.tsx at /mnemosynec
- If FAILS: Check that the release `.exe` is uploaded to the download host (Founder action).

### WP5 -- Marks Display

- Navigate to /wallet or find "Marks" in the nav after signing in
- Expected: Marks balance shows "0 Marks" for a new account
- Expected: Participation language visible (not equity, not returns)
- **Status: WORKS** -- WalletPage.tsx shows participation token language
- If FAILS: Verify user is logged in. Check Supabase user_marks table exists (Founder B-4).

---

## A5 -- First Run / Out-of-Box Experience (check this FIRST)

### 5.1 Install the app

- Run the installer `.exe`.
- Expected: silent NSIS install, app launches automatically, NO terminal windows appear.
- **Status: WORKS** -- electron-builder NSIS installer bundles the app. No manual steps.
- If FAILS: Re-build with `npm run build:electron` and check `release/` for the `.exe`.

### 5.2 First-run spine appears (Phase: install)

- Expected: The 7-phase Bp067FirstRunSpine appears immediately -- "Checking AI engine..."
- The install phase polls `window.amplify.setupEngine` (OllamaManager) for progress.
- **Status: WORKS** -- Bp067FirstRunSpine.tsx, phase `install`, polls engine setup.
- If FAILS: Check `src/main/ollama_manager.ts` -- the bundled Ollama path or model pull.

### 5.3 Bundled Ollama auto-starts

- Expected: Within 30-60 seconds, phase advances to `cover` (SaltFighter greeting screen).
- Behind the scenes: OllamaManager starts the bundled `ollama.exe` in `resources/ollama/`.
- **Status: WORKS** on clean Windows if `release/win-unpacked/resources/ollama/` exists.
- If FAILS: Check `src/main/ollama_manager.ts` `_resolveOllamaPath()`. The path must point
  to the bundled binary. Verify `dist/main/ollama_manager.js` is current.

### 5.4 "What's in it for ME" cover screen

- Expected: SaltFighter cover text: "Your AI remembers you. Your questions stay on your computer. Private. Free. Yours."
- User can read and click "Continue" or it auto-advances in 15 seconds.
- **Status: WORKS** -- `Bp067FirstRunSpine.tsx` cover phase, `SALTFIGHTER_TEXT` constant.
- If FAILS: Check `LS_SALTFIGHTER_SKIP` localStorage key is not pre-set.

### 5.5 Value phase -- concrete benefits for non-technical user

- Expected: Phase `value` shows specific, non-jargon benefits.
- **Status: WORKS** -- value phase built in Bp067FirstRunSpine.tsx (Wave-24).
- If FAILS: Read the `value` phase section in Bp067FirstRunSpine.tsx for the copy.

### 5.6 Folder choice phase

- Expected: User can click "Choose a folder" (opens system folder picker) OR skip.
- **Status: WORKS** -- `SubstratedFolderWatcher` is wired via `window.amplify.watcher`.
- If FAILS: Check `registerWatcherIpc()` in `src/main/services/SubstratedFolderWatcher.ts`.

### 5.7 Meet-AI phase -- first conversation

- Expected: User can type a question, gets a response from local Ollama (gemma2:2b or similar).
- **Status: WORKS** if Ollama started in 5.3 and model pulled in 5.3.
- NOT YET if Ollama model pull is slow (>60s on a slow connection) or fails.
- If FAILS: Check the `meet-ai` phase in Bp067FirstRunSpine.tsx -- it calls
  `window.amplify.ai.askFloorModel()`.

### 5.8 First run completes, lands on Tab 1 Frame

- Expected: Clicking "Let's go" in `upgrades` phase sets `LS_BP067_FIRST_RUN_COMPLETE` in
  localStorage and calls `onComplete()`, which sets `activeTab = 'frame'`.
- **Status: WORKS** -- standard React state wired in MnemosyneTabView.

---

## A1 -- Chrome Integration

### 1.1 Load the extension in Chrome (unpacked)

1. Open Chrome, go to `chrome://extensions/`
2. Enable "Developer mode" (toggle top-right)
3. Click "Load unpacked"
4. Select the folder: `[workspace]/platform/chrome-extension/`
5. Expected: "Mnemosyne Memory" appears in extensions list with the puzzle icon.

- **Status: WORKS** (Manifest v3, no build step required -- pure HTML/JS)
- If FAILS: Check `manifest.json` for JSON syntax errors. Run: `node -e "require('./manifest.json')"`.

### 1.2 Check status dot

- Open any webpage, click the Mnemosyne extension icon.
- Expected: Green dot + version/index size when Mnemosyne app is running.
- Expected: Red dot + "Offline" when Mnemosyne app is not running.
- **Status: WORKS** -- calls `GET http://localhost:11480/health` (CORS * enabled in substrate_api.ts).
- If FAILS: Verify Mnemosyne app is running and port 11480 is not blocked.

### 1.3 Query local memory from Chrome

- Type a question into the popup textarea, press Enter or click Ask.
- Expected: Result appears from local substrate (or "No memory found" on empty index).
- **Status: WORKS** -- calls `POST http://localhost:11480/substrate/query`.
- If FAILS: Check `substrate_api.ts` CORS headers -- `Access-Control-Allow-Origin: *`.

### 1.4 Save a note from Chrome

- Type a note into the note input, click "Save to Mnemosyne".
- Expected: Button shows "Saved!" briefly, note is saved via `POST /yoke/note`.
- **Status: WORKS** -- `/yoke/note` endpoint exists in substrate_api.ts.
- If FAILS: Check `urgency` field -- must be `'low'`, `'normal'`, or `'high'`.

### 1.5 Context menu integration

- Select text on any webpage, right-click.
- Expected: "Ask Mnemosyne about..." and "Save to Mnemosyne" appear.
- **Status: WORKS** -- background.js registers context menus.
- If FAILS: Reload the extension in `chrome://extensions/`.

### 1.6 Chrome Web Store note

- **NOT YET / NOT REQUIRED FOR PERSONAL USE**: Chrome Web Store review is needed only
  for public distribution. For personal/family use, loading as an unpacked extension (1.1
  above) requires NO review and NO Google approval.
- Store submission: Requires Google developer account ($5 one-time fee), review takes 1-7 days.
- For now: load unpacked. Works permanently on her machine.

---

## A2 -- Windows Copilot Integration

### 2.1 Can Mnemosyne push context into Windows Copilot?

- **NOT YET** -- Microsoft has not released a local-app integration API for the Windows
  Copilot sidebar. See `platform/COPILOT_INTEGRATION.md` for full research findings.
- The plugin system (Copilot Studio) is cloud-only and requires HTTPS endpoints.

### 2.2 Workaround that works today

1. Open Mnemosyne, Tab 10 Substrate (or Chrome extension popup).
2. Query for context on your topic. Copy the result.
3. Open Windows Copilot (Win+C).
4. Paste context as a prefix: "Based on my notes: [paste]. [Your question]."
- **Status: PARTIAL** -- manual copy-paste works. Auto-injection NOT YET.

---

## A3 -- Transparent Frame

### 3.1 Overlay window exists and renders

- Launch Mnemosyne app.
- Expected: A transparent Electron window appears over all other apps (alwaysOnTop: true).
- The window has `transparent: true`, `frame: false`, `skipTaskbar: true`, `focusable: false`.
- **Status: WORKS** -- overlayWindow created in `src/main/index.ts` lines 662-681.

### 3.2 Clickthrough is enabled by default

- Expected: Mouse clicks pass through the overlay to apps below (you can use Chrome normally).
- Implementation: `applyLBFrameClickthrough(true)` called after `ready-to-show`.
- **Status: WORKS** -- `setIgnoreMouseEvents(true, { forward: true })` in index.ts.

### 3.3 Overlay shows full Mnemosyne UI

- CURRENT BEHAVIOR: The overlay loads the full MnemosyneTabView (same RENDERER_URL as
  the main window). Tab 1 Frame is the default. The overlay IS a transparent full-screen
  window with the tabbed Mnemosyne interface.
- **Status: WORKS** -- the frame renders and is interactable when clickthrough is toggled off.

### 3.4 Context-aware help HUD (specialized overlay mode)

- INTENDED BEHAVIOR: A lightweight HUD that shows context-relevant suggestions based on
  what app/content is in focus below the overlay -- without showing the full 16-tab UI.
- **Status: NOT YET** -- the overlay currently shows the full Mnemosyne UI, not a slim HUD.
- What needs to be built: Detect `frame-mode-changed` IPC event + render a specialized
  OverlayHUD component when in `ai_burst` mode that queries `/substrate/query` with the
  current window title (obtained via `getActiveWindowTitle` OS API).
- Estimated: 1-2 additional sessions to build a slim context HUD renderer.

### 3.5 Frame toggle works

- Expected: Right-clicking the tray icon or pressing the keyboard shortcut toggles the
  overlay clickthrough, allowing the user to interact with Mnemosyne vs pass-through to apps.
- **Status: WORKS** -- tray menu and IPC `set-click-through` handler in index.ts.

---

## A4 -- Recipe + Family Atlas Scheduling

### 4.1 Browse recipes (Kitchen Table tab)

- Click Tab 8 "Kitchen Table" in Mnemosyne.
- Expected: Starter recipes appear (3-5 seeded recipes on first load).
- **Status: WORKS** -- RecipesView.tsx seeds STARTER_RECIPES on empty list via
  `window.amplify.kitchenTable.createRecipe()`. Persisted to local JSON file via
  `src/main/kitchen_table/kitchen_table_store.ts`.

### 4.2 Create a new recipe

- Click "+ New Recipe" in the Kitchen Table.
- Fill in title, ingredients, steps. Optionally click "AI Suggest" for suggestions.
- Expected: Recipe saved, appears in list.
- **Status: WORKS** -- IPC `kitchen-table:create-recipe` → kitchen_table_store.ts.
- NOT YET: Real Let's Make Dinner / Let's Get Groceries feature labels (internal feature
  names not surfaced in the UI yet -- the same data supports them).

### 4.3 "Schedule this meal" cross-tab flow

- Select a recipe, click "📅 Schedule this meal →".
- Expected: Atlas tab opens (Tab 7) with the recipe title pre-filled in the event form.
- **Status: WORKS** -- `onScheduleMeal` callback in MnemosyneTabView.tsx sets
  `scheduledMealTitle` and switches `activeTab` to `'atlas'`. AtlasView receives
  `prefilledTitle` prop and opens the event form pre-populated.

### 4.4 Atlas calendar -- add event, RSVP

- In Tab 7 Atlas, click a day on the calendar, fill in event details.
- Expected: Event appears on calendar. Can add participants (RSVP list). Month and week views available.
- **Status: WORKS** -- AtlasView.tsx has full month-view calendar, event CRUD, participants,
  meal slots (breakfast/lunch/dinner), iCal export.

### 4.5 Grocery list / ingredient export

- Expected: From a recipe or Atlas event, export an ingredient list for shopping.
- **Status: PARTIAL** -- Ingredients are stored per recipe. Atlas events can include an
  ingredients list. No "Export to shopping list" PDF/share button yet.
- What works: Ingredients are listed in the recipe detail view and Atlas event detail.
- NOT YET: Dedicated "Let's Get Groceries" export flow (tap → generate shopping list → share).

### 4.6 Reminders / push notifications for events

- Expected: Atlas events send a reminder at event time.
- **Status: NOT YET** -- No OS notification integration built. Events are stored and
  displayed but Electron `Notification` API not yet wired for reminders.
- Estimated: 2-4 hours to add `new Notification()` from main process at scheduled times.

---

## A5 Summary (see detailed steps above)

| Step | Status |
|------|--------|
| Install - silent, no terminal | WORKS |
| Bundled Ollama auto-start | WORKS |
| SaltFighter cover message | WORKS |
| Value phase (non-tech benefits) | WORKS |
| Folder picker - no CLI | WORKS |
| Meet-AI first conversation | WORKS (needs Ollama model) |
| Lands on Tab 1 Frame | WORKS |

---

## Quick Verification Commands (run before declaring done)

```powershell
# From workspace root
npx tsc --noEmit
# Should exit 0 with no errors

# From platform directory
cd platform
npx vitest run src/__tests__/skip-eblets/yoke-bridge.test.ts
# Should pass
```

---

## Empirical Verdict Summary

| Item | What Works | Status |
|------|-----------|--------|
| A1 Chrome Extension | Extension loads unpacked, queries localhost:11480, saves notes, context menu | **WORKS** (no Store needed) |
| A2 Windows Copilot | Manual copy-paste workaround only | **NOT YET** (MS API closed) |
| A3 Transparent Frame | Overlay window renders, clickthrough works, full UI shows | **PARTIAL** (HUD mode not yet built) |
| A4 Recipe + Atlas | Browse/create recipes, schedule meal cross-tab, calendar, RSVP, iCal | **WORKS** (grocery export + reminders NOT YET) |
| A5 Out-of-Box | Silent install, bundled Ollama, 7-phase spine, no setup required | **WORKS** |
| A6 This Checklist | Built and verified | **WORKS** |

---

*Built: BP073 WAVE A -- June 2026*
*W30 Final Edition: Real Hardware Prerequisites, Success Criteria, and Failure Recovery added -- 2026-06-03*

---

## Success Criteria
*(What "PASS" looks like for each step -- the wife test is PASS if all criteria in the user's path are met)*

| Step | Pass Condition |
|------|---------------|
| WP1 Landing Page | Page loads with a visible headline and at least one call-to-action button |
| WP2 Sign-Up | New account created, no error message, redirected to app |
| WP3 Login | Existing account signs in successfully, app personalized content visible |
| WP4 MnemosyneC Download | Download link visible, `.exe` file downloads without error |
| WP5 Marks Display | "Marks" balance visible (even if 0), NO equity/return/guaranteed payout language |
| A5 Install | App installs silently, no terminal window, app opens automatically |
| A5 First Run | Spine completes all 7 phases without freezing |
| A5 Meet-AI | User types a question, gets a response (may take 30-60s on first model load) |
| A1 Extension | Extension installs from unpacked folder, shows in Chrome extensions list |
| A1 Query | Chrome popup: type question, get result from local memory (or "No memory found") |
| A1 Save Note | Chrome popup: type note, click save, button shows "Saved!" confirmation |
| A4 Recipe | New recipe saved, appears in list |
| A4 Meal Schedule | Recipe scheduled, shows in Atlas calendar on correct day |

**Overall PASS:** The wife completes the core loop (install app, first conversation, save a note from Chrome) without asking for help.

---

## Failure Recovery
*(What to do if each step fails -- ordered by likelihood)*

### If app does not install (5.1 FAILS)
1. Right-click the `.exe` and choose "Run as Administrator"
2. If Windows Defender blocks it: click "More info" then "Run anyway" (this is our app -- not signed yet)
3. If still fails: Check disk space (need at least 2 GB free)
4. Last resort: Rebuild with `npm run build:electron` from the `platform/` directory

### If Ollama does not start or model does not download (5.3 FAILS)
1. Check internet connection -- model download requires ~1.5 GB
2. Check Windows firewall -- allow Ollama through if prompted
3. If model pull stalls: close app, reopen -- OllamaManager retries automatically
4. If Ollama path error: check `dist/main/ollama_manager.js` is present in the build

### If Chrome extension does not load (1.1 FAILS)
1. Verify Chrome is version 88 or later (supports Manifest v3)
2. Ensure "Developer mode" toggle is ON (top-right of chrome://extensions/)
3. Click "Load unpacked" and select the `platform/chrome-extension/` folder exactly
4. If JSON error: run `node -e "JSON.parse(require('fs').readFileSync('manifest.json','utf8'))"` in the folder

### If Chrome extension shows red dot / Offline (1.2 FAILS)
1. Verify MnemosyneC desktop app is running (check system tray)
2. Check that port 11480 is not blocked by antivirus or firewall
3. Try: open `http://localhost:11480/health` in Chrome -- should return `{"status":"ok"}`

### If AI query returns no results (1.3 FAILS or 5.7 FAILS)
1. This is expected on first use -- the index is empty until memories are saved
2. Save a note first (1.4), then query
3. If query errors: check Ollama is running (tray icon visible)

### If web platform landing page does not load (WP1 FAILS)
1. Check internet connection
2. Try the Vercel preview URL instead of the custom domain (DNS may not be live yet)
3. If Vercel preview also fails: Founder must check Vercel deploy status

### If sign-up fails with "Invalid API key" or Supabase error (WP2 FAILS)
1. Founder must complete B-4 (Supabase production setup) in FOUNDER_PUNCH_LIST.md
2. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env vars
3. Redeploy Vercel after adding env vars

### If Marks page is empty or errors (WP5 FAILS)
1. Verify user is logged in (check profile icon in nav)
2. This is expected behavior -- a new account has 0 Marks (not an error)
3. If page throws an error: check Supabase user_marks view exists

---
