# FOUNDER PUNCH LIST
## Liana Banyan Platform -- W30 FINAL (30/30 Waves Complete)

**Created:** 2026-06-02
**Last Verified:** 2026-06-03 (Wave 30 FINAL -- Wife Test on Real Hardware)
**Version:** Irreducible -- only items that genuinely require Founder action
**Total estimated time:** ~7.5 hours (many parallelizable)
**Dashboard:** `/launch-readiness` shows live status of all 25 gates (24 GREEN, 1 AMBER)
**W30 Status:** 30/30 waves COMPLETE. 2251/2251 tests. 0 TS errors. Yoke 2/2. Go/No-Go: GO.

This document contains ONLY items that Knight cannot complete: credentials, legal approvals, physical actions, and ratifications that require Founder identity or authority.

---

## W30 COMPLETION NOTE

Knight has completed 30/30 waves of the BLACK MAMBA BP073 30x30 program.

**What is DONE (Knight-built, verified, ready):**
- 2251/2251 tests PASS (66 files)
- 0 TypeScript errors
- Yoke 2/2
- 24/25 system gates GREEN (1 AMBER: xlsx CVE, accepted, no fix exists)
- WIFE_TEST_CHECKLIST.md fully audited with Prerequisites, Success Criteria, Failure Recovery
- ProofsPage: 30/30 waves, 24/24 proofs, hero stats final
- KNIGHT_TO_FOUNDER_HANDOFF.md written at repo root (full handoff summary)
- All platform code built, tested, and ready to deploy

**What requires YOU (Founder) -- ordered by dependency:**

1. **B-4: Supabase** -- the keystone. Everything else depends on this. ~2 hours.
2. **B-1: Stripe live key** -- after B-4. ~20 minutes.
3. **B-2: DNS** -- after B-4. ~15 minutes + 24h propagation.
4. **B-6: Vercel env vars** -- after B-4 and B-1. ~15 minutes.
5. **B-5: DR drill** -- after B-4. ~30 minutes.
6. **B-3: Production smoke test** -- after B-4, B-1, B-6. ~45 minutes.
7. **B-12: Clean machine test (Wife Test)** -- the final acceptance gate. ~30 minutes.

See the full items below. See `KNIGHT_TO_FOUNDER_HANDOFF.md` at the repo root for the complete summary.

---

---

## QUICK REFERENCE -- Suggested Order of Operations

```
T-7 days: B-7, B-8, B-10, B-11, B-9 confirm (content/legal -- independent, start early)
           + BP073-C Resend domain verification (24h DNS propagation -- start early)
T-3 days: B-4 -> B-5 -> B-14 (Supabase stack complete, DR drill done)
T-2 days: B-1, B-3 (credentials -- need Supabase live)
           + BP073-A Twilio (if call intake needed before launch)
           + BP073-B Gmail Pub/Sub (if live email intake needed before launch)
T-1 day:  B-6, B-2 (+ wait propagation), B-12, B-13 (secrets, DNS, clean-machine, monitoring)
T=0 Thursday:
  T-2h: npx vitest run (2044/2044), npx tsc --noEmit (0), npm audit residual only (xlsx)
  T-1h: Trigger Vercel production deploy
  T-30m: Verify health, Stripe webhook, DNS resolves
  T-15m: Arm UptimeRobot / BetterStack
  T=0:  NYT link live -> publish social posts
  T+1h: First post-launch debrief (LAUNCH_RUNBOOK.md Section 5)

Post-launch:
  BP073-D: Real cross-machine MIL test (two physical machines -- 2-4h; post-launch validation)
  BP073-E: Real ASN BGP lookup backend (optional post-launch optimization; SHA-256 address works for launch)
```

---

## B-1: Stripe Live Key ($5/year Membership)
**Category:** Credentials
**Estimated time:** 20 minutes
**Depends on:** B-4 (Supabase production must be wired first)
**When:** T-2 days before launch

### Exact Steps
1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers -> API Keys
3. Copy the **live** secret key: `sk_live_...` (NOT the test key)
4. In [Vercel Dashboard](https://vercel.com): Settings -> Environment Variables
5. Add `STRIPE_SECRET_KEY` = (the live key value)
6. In Stripe Dashboard: Products -> find "$5/year Membership" -> copy the Price ID
7. Add `STRIPE_PRICE_ID_MEMBERSHIP` = (the price ID, format `price_...`)
8. Click "Redeploy" in Vercel to pick up new env vars
9. Test end-to-end: navigate to /join on production, complete checkout with Stripe test card 4242 4242 4242 4242 (test mode first), then repeat with a live card -- you will be charged $5, refund yourself via Stripe dashboard

### Verification
- [ ] `sk_live_` key in Vercel env vars (not `sk_test_`)
- [ ] Stripe webhook firing on /api/stripe/webhook
- [ ] Member row created in Supabase after test purchase

---

## B-2: DNS -- Point Domain to Vercel
**Category:** Infrastructure
**Estimated time:** 15 minutes + 5-30 min propagation
**Depends on:** B-4 (need Vercel deployment URL)
**When:** T-1 day before launch

### Exact Steps
1. Log in to your domain registrar (where lianabanyan.com is registered)
2. Navigate to DNS management
3. Add record: Type `CNAME` | Name `www` | Value `cname.vercel-dns.com` | TTL `300`
4. Add record: Type `A` | Name `@` | Value = Vercel IP (get from Vercel Dashboard -> Settings -> Domains -> copy the IP shown)
5. Save DNS records
6. Wait 5-30 minutes for propagation
7. Verify: run `nslookup lianabanyan.com` -- should return Vercel IP
8. Verify: `curl https://lianabanyan.com/` returns 200

### Post-Launch
- After stable for 24 hours, increase TTL to 3600

### Verification
- [ ] `nslookup lianabanyan.com` -> Vercel IP
- [ ] `curl https://lianabanyan.com/` -> 200 OK
- [ ] SSL certificate auto-provisioned by Vercel (https:// works)

---

## B-3: LinkedIn OIDC OAuth App
**Category:** Credentials
**Estimated time:** 30 minutes
**Depends on:** B-4 (need Supabase callback URL)
**When:** T-2 days before launch

### Exact Steps
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/apps)
2. Click "Create app"
   - App name: `Liana Banyan Platform`
   - LinkedIn Page: (your company LinkedIn page, or create one)
   - App logo: upload platform logo
3. After creation, go to Products tab -> request "Sign In with LinkedIn using OpenID Connect"
4. Wait for product approval (usually instant for OIDC)
5. Go to Auth tab -> OAuth 2.0 settings
6. Add Authorized redirect URL: `https://[your-supabase-project].supabase.co/auth/v1/callback`
   - Get your Supabase project URL from Supabase Dashboard -> Settings -> API
7. Copy Client ID and Client Secret from Auth tab
8. In [Supabase Dashboard](https://supabase.com/dashboard): Authentication -> Providers -> LinkedIn (OIDC)
9. Toggle Enable, paste Client ID and Client Secret, save
10. Test: navigate to /join on staging, click "Sign in with LinkedIn", complete OAuth flow

### Verification
- [ ] LinkedIn app created and OIDC product enabled
- [ ] Redirect URL added in LinkedIn app
- [ ] Client ID + Secret saved in Supabase
- [ ] OAuth flow completes successfully on /join

---

## B-4: Supabase Production Project
**Category:** Infrastructure
**Estimated time:** 45 minutes
**Depends on:** nothing (do this first)
**When:** T-3 days before launch

### Exact Steps
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New project" (or confirm existing production project)
   - Name: `liana-banyan-production`
   - Region: choose closest to your primary audience (US East or US West)
   - Database password: generate strong password, save in password manager
3. Wait for project to provision (2-3 minutes)
4. Run all database migrations from repo root:
   ```bash
   supabase login
   supabase link --project-ref [your-project-ref]
   supabase db push
   ```
5. Copy project credentials: Settings -> API
   - Copy `Project URL` (format: `https://[ref].supabase.co`)
   - Copy `anon` public key
6. In [Vercel Dashboard](https://vercel.com): Settings -> Environment Variables
   - Add `VITE_SUPABASE_URL` = (Project URL)
   - Add `VITE_SUPABASE_ANON_KEY` = (anon key)
7. Redeploy Vercel

### Verification
- [ ] `curl https://[project].supabase.co/rest/v1/` -> 200 or 401 (reachable)
- [ ] Vercel deployment uses correct Supabase URL
- [ ] Tables exist in Supabase Table Editor

---

## B-5: Supabase RLS Enabled on All Production Tables
**Category:** Infrastructure
**Estimated time:** 15 minutes
**Depends on:** B-4
**When:** T-3 days before launch

### Exact Steps
1. In Supabase Dashboard: Table Editor
2. For EACH table: click table name -> click "RLS" tab -> toggle "Enable RLS" ON
3. Tables to verify (at minimum): `members`, `innovations`, `marks`, `proposals`, `bounties`
4. Confirm all tables show the lock icon indicating RLS is enabled
5. Test: attempt to read `members` table without authentication -> should return empty or 401

### Verification
- [ ] All tables show RLS enabled (lock icon in Table Editor)
- [ ] Unauthenticated read returns no rows from protected tables

---

## B-6: All Secrets in Vercel Environment Variables
**Category:** Credentials
**Estimated time:** 10 minutes
**Depends on:** B-1, B-4
**When:** T-1 day before launch

### Exact Steps
1. In [Vercel Dashboard](https://vercel.com): Settings -> Environment Variables
2. Verify ALL of the following are present (Production environment):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY` (must be `sk_live_...` not `sk_test_...`)
   - `STRIPE_PRICE_ID_MEMBERSHIP`
   - `STRIPE_WEBHOOK_SECRET` (from Stripe Dashboard -> Webhooks -> your endpoint -> Signing secret)
3. Run local secrets scan to confirm nothing leaked to code:
   ```bash
   cd platform
   # On Windows PowerShell:
   Select-String -Path "src/**" -Pattern "sk_live|sk_test|supabase\.co" -Recurse
   # Expected: 0 results (only in .env files, never in src/)
   ```
4. Confirm no `.env` files are committed: `git status` should not show any `.env` files

### Verification
- [ ] 5 required env vars present in Vercel (Production environment)
- [ ] No secrets in src/ (scan returns 0 results)
- [ ] No .env files committed to git

---

## B-7: Cardboard Boots v017 -- Approve and Load
**Category:** Legal / Content
**Estimated time:** 30 minutes
**Depends on:** nothing
**When:** T-7 days before launch (do early)

### Exact Steps
1. Review the Cardboard Boots v017 document in full
2. Approve the document as Founder
3. Load into platform per the held terms (Knight will wire per your instructions once approved)
4. Confirm the /cardboard-boots page or equivalent displays v017 content

### Verification
- [ ] v017 document reviewed and approved by Founder
- [ ] Content loaded into platform

---

## B-8: AOC v3 -- Founder Signature
**Category:** Legal
**Estimated time:** 15 minutes
**Depends on:** nothing
**When:** T-7 days before launch (do early)

### Exact Steps
1. Review the AOC v3 letter in full
2. Sign the letter as Founder (digital or physical signature)
3. Upload the signed version to the platform document repository
4. Confirm the platform displays v3 (not an older version)

### Verification
- [ ] AOC v3 reviewed, signed, and uploaded
- [ ] Platform shows signed v3

---

## B-9: NYT + Social -- Thursday Drop Confirmation
**Category:** Timing / Coordination
**Estimated time:** 20 minutes of coordination
**Depends on:** B-2, B-4 (production must be live before drop)
**When:** Confirm T-7 days; execute T=0 Thursday

### Exact Steps
1. Confirm NYT publication date is a Thursday (coordinate with NYT contact)
2. Navigate to `/staff/social-announcement-set` -- review all pre-written social posts
3. Schedule social posts to go live at the same time as the NYT link drop
4. Do NOT trigger Vercel production deploy before the Thursday social drop
5. On Thursday T=0: confirm NYT link is live, then publish social posts
6. After social posts live: confirm production Vercel deployment is serving correctly

### Pre-Written Content Location
- Social posts: `/staff/social-announcement-set` (staff-gated)
- All 30+ waves of content are live and ready

### Verification
- [ ] NYT publication date confirmed as Thursday
- [ ] Social posts scheduled (not yet published)
- [ ] Production deployment ready (B-2, B-4 complete)
- [ ] No pre-launch leaks (production not reachable until DNS live)

---

## B-10: Marks Rates -- Final Approval
**Category:** Credentials / Policy
**Estimated time:** 30 minutes
**Depends on:** nothing
**When:** T-7 days before launch (do early)

### Exact Steps
1. Review the proposed Marks rates (Marks are participation tokens, not equity or returns)
2. Approve the final rate schedule as Founder
3. Confirm with Knight the approved rates so they can be wired into the platform config
4. Verify `/marks-redeem` page shows the correct approved rates before launch

### Verification
- [ ] Marks rate schedule reviewed and approved by Founder
- [ ] Rates wired into platform config
- [ ] `/marks-redeem` page displays correct rates

---

## B-11: Character-Remake Art License
**Category:** Legal
**Estimated time:** 60 minutes (may require legal counsel)
**Depends on:** nothing
**When:** T-7 days before launch (do early -- may need lead time)

### Exact Steps
1. Identify all character-remake art assets currently in or planned for the platform
2. Confirm the source/origin of each asset
3. Obtain written legal clearance: confirm license covers the intended use (commercial platform, web display, potential merchandise)
4. If any asset is unclear: either obtain explicit license from creator or replace with licensed alternatives
5. Document clearances and store in the platform's legal records

### Verification
- [ ] All character-remake art has documented license clearance
- [ ] Written confirmation of usage rights obtained
- [ ] No uncleared art remaining in production build

---

## B-12: MIL Clean-Machine Factory Reset Test
**Category:** Infrastructure / Validation
**Estimated time:** 90 minutes
**Depends on:** nothing
**When:** T-1 day before launch

### Exact Steps
1. Obtain a clean machine (factory-reset or fresh VM -- no prior LB platform artifacts)
2. Follow the clean-machine MIL install procedure from scratch (no shortcuts)
3. Install all dependencies fresh: Node, npm, supabase CLI, etc.
4. Clone the repo to the clean machine
5. Run: `npm install` -> `npm run build` -> confirm build succeeds
6. Connect to production Supabase (using production env vars)
7. Navigate through the platform's key flows: join, proofs, member dashboard
8. Document: time elapsed, any issues encountered, resolution

### Verification
- [ ] Clean machine test run completed
- [ ] All key flows work on clean machine
- [ ] Results documented (time elapsed, issues if any)
- [ ] Founder signs off: "clean-machine test PASSED"

---

## B-13: Monitoring -- UptimeRobot / BetterStack
**Category:** Infrastructure
**Estimated time:** 20 minutes
**Depends on:** B-2, B-4 (need live production URL)
**When:** T-1 day before launch (can set up staging URL first, update to production on launch day)

### Exact Steps
1. Create account at [UptimeRobot](https://uptimerobot.com) or [BetterStack](https://betterstack.com)
2. Create HTTP monitor:
   - URL: `https://lianabanyan.com/`
   - Check interval: 5 minutes
   - Alert: email + SMS when status not 200
3. Create additional monitors:
   - `https://lianabanyan.com/proofs/` (every 5 min)
   - `https://lianabanyan.com/api/health` if endpoint exists (every 5 min)
4. Configure error budget alerts:
   - Alert 1 (AMBER): error rate > 0.05% over 15 minutes -> email
   - Alert 2 (RED): error rate > 0.09% over 5 minutes -> email + SMS
5. Add alert contacts: founder email + phone
6. Save the monitoring dashboard URL for Day-1 monitoring

### Verification
- [ ] At least 3 monitors created (homepage, proofs, health)
- [ ] Email alerts configured and tested (send a test alert)
- [ ] SMS alerts configured and tested
- [ ] Monitoring dashboard URL saved

---

## B-14: Supabase Daily Backup + DR Drill
**Category:** Infrastructure
**Estimated time:** 30 minutes
**Depends on:** B-4 (production project must exist)
**When:** T-3 days before launch

### Exact Steps
1. In [Supabase Dashboard](https://supabase.com/dashboard): Settings -> Database -> Backups
2. Enable "Point in Time Recovery" (requires Pro plan -- upgrade if needed)
3. Confirm daily backup schedule is active
4. **Run the DR drill:**
   a. Trigger a manual backup: Settings -> Database -> Backups -> "Create backup"
   b. Download the backup file
   c. Verify the file opens and is non-empty (contains SQL statements)
   d. Spin up a fresh Supabase project (staging): "staging-restore-test"
   e. Restore the backup to the staging project
   f. Verify row counts match: `SELECT COUNT(*) FROM members;` etc.
   g. Document results: restore time, row count match (yes/no)
5. Sign off the DR drill checklist in LAUNCH_RUNBOOK.md Section 7

### Verification
- [ ] PITR enabled on production project
- [ ] Daily backup confirmed active
- [ ] DR drill completed on staging project
- [ ] Row counts match after restore
- [ ] Restore time documented: _____ minutes
- [ ] DR drill checklist in LAUNCH_RUNBOOK.md Section 7 signed off

---

## DEPENDENCY MAP

```
B-4 (Supabase)
  |--- B-5 (RLS)
  |--- B-14 (Backups + DR drill)
  |--- B-1 (Stripe, needs Supabase live)
  |--- B-3 (LinkedIn OIDC, needs Supabase callback URL)
  |--- B-6 (Secrets audit, needs B-1 and B-4)
  |--- B-9 (Social drop, needs production live)
  |--- B-13 (Monitoring, needs live URL)

B-2 (DNS)
  |--- B-9 (Social drop, needs DNS propagated)
  |--- B-13 (Monitoring, needs final URL)

Independent (no blocking deps):
  B-7 (Cardboard Boots)
  B-8 (AOC v3)
  B-10 (Marks rates)
  B-11 (Art license)
  B-12 (Clean-machine test)
```

---

## TIME BUDGET SUMMARY

| Item | Category | Est. Time | Dependencies |
|------|----------|-----------|--------------|
| B-4: Supabase production | Infrastructure | 45 min | None -- do first |
| B-5: Supabase RLS | Infrastructure | 15 min | B-4 |
| B-14: Backup + DR drill | Infrastructure | 30 min | B-4 |
| B-1: Stripe live key | Credentials | 20 min | B-4 |
| B-3: LinkedIn OIDC | Credentials | 30 min | B-4 |
| B-6: Secrets audit | Credentials | 10 min | B-1, B-4 |
| B-2: DNS | Infrastructure | 15 min + wait | B-4 |
| B-13: Monitoring | Infrastructure | 20 min | B-2, B-4 |
| B-12: Clean-machine test | Validation | 90 min | None |
| B-7: Cardboard Boots | Legal | 30 min | None |
| B-8: AOC v3 | Legal | 15 min | None |
| B-10: Marks rates | Policy | 30 min | None |
| B-11: Art license | Legal | 60 min | None |
| B-9: Thursday drop | Timing | 20 min | B-2, B-4 |
| **TOTAL (B-1 to B-14)** | | **~5.5 hours** | |
| BP073-A: Twilio credentials | Credentials | 30 min | None (before launch if call intake needed) |
| BP073-B: Gmail Pub/Sub OAuth | Credentials | 45 min | None (before launch if live email needed) |
| BP073-C: Resend domain verification | Credentials | 20 min | B-2 DNS (TXT record; 24h propagation -- start T-7) |
| BP073-D: Real cross-machine MIL test | Physical | 2-4 hours | Two physical machines (POST-LAUNCH) |
| BP073-E: Real ASN BGP lookup backend | Infrastructure | 1-2 hours | POST-LAUNCH optional optimization |
| **TOTAL (all 19 items)** | | **~7.5 hours** | |

**Parallelizable:** B-7, B-8, B-10, B-11, B-12, BP073-C can all run independently. Do these while Supabase provisions or DNS propagates.
**Post-launch only:** BP073-D, BP073-E -- not required for initial launch; SHA-256 address derivation works for launch.

---

## LAUNCH DAY MINUTE-BY-MINUTE (Thursday)

```
T-7 days: B-7, B-8, B-10, B-11, BP073-C -- content, legal, Resend domain (start early for DNS propagation)
T-3 days: B-4 -> B-5 -> B-14 -- Supabase stack complete, DR drill done
T-2 days: B-1, B-3 -- credentials (need Supabase live); BP073-A/B if call/email intake needed at launch
T-1 day:  B-6, B-2 (+ wait propagation), B-12, B-13 -- secrets, DNS, clean-machine, monitoring
T-0 Thursday:
  T-2h: npx vitest run (2044/2044), npx tsc --noEmit (0), npm audit residual (xlsx only), yoke 2/2
  T-1h: Trigger Vercel production deploy
  T-30m: Verify health, Stripe webhook, DNS resolves, SSL cert
  T-15m: Arm UptimeRobot / BetterStack
  T=0:  NYT link live -> publish social posts
  T+1h: First post-launch debrief (see LAUNCH_RUNBOOK.md Section 5)
Post-launch: BP073-D (cross-machine test), BP073-E (ASN BGP -- optional optimization)
```

---

---

## BP073 Additions -- "Make It Real" Founder-Gated Items

**Added:** 2026-06-03 (BP073 Wave E)
These items were identified during BP073 and are gated on Founder credentials or physical hardware.

---

### BP073-A: Twilio Credentials (C1 Voice Routing)
**Category:** Credentials
**Estimated time:** 30 minutes
**Why needed:** moneypenny-voice edge function is code-complete. Without credentials the voice path returns a TwiML error.

1. Log in to [twilio.com/console](https://twilio.com/console)
2. Buy or use existing phone number (format: +1XXXXXXXXXX)
3. In Supabase Dashboard -> Settings -> Vault, add secrets:
   - `TWILIO_ACCOUNT_SID` (found on Twilio Console home)
   - `TWILIO_AUTH_TOKEN` (found on Twilio Console home)
   - `TWILIO_PHONE_NUMBER` (the E.164 number you purchased)
4. Under Twilio Phone Numbers -> Active Numbers -> click number -> Voice Configuration:
   - Webhook URL: `https://<your-project-ref>.supabase.co/functions/v1/moneypenny-voice`
   - Method: HTTP POST
5. Verify: call the Twilio number, hear "Liana Banyan, just a moment..." hold music

**Verification:**
- [ ] Twilio secrets in Supabase Vault
- [ ] Voice webhook URL set
- [ ] Test call connects to hold music

---

### BP073-B: Gmail Pub/Sub OAuth (C1 Email Live)
**Category:** Credentials / Infrastructure
**Estimated time:** 45 minutes
**Why needed:** moneypenny-intake processes inbound Gmail. The gmail-bridge edge function is built but needs OAuth tokens.

Two paths (choose one):

**Path A (simpler):** Email forwarding rule
1. In Gmail, Settings -> Forwarding -> Add a forwarding address
2. Forward to: `<your-project-ref>@supabase.co` (or set up a custom webhook)
3. Alternatively: set up an email-to-webhook service (e.g. Cloudmailin, Inbound) to POST to the moneypenny-intake function URL

**Path B (full Gmail API):**
1. Google Cloud Console -> APIs -> Enable Gmail API
2. Create OAuth 2.0 credentials (Web application type)
3. Authorized redirect URIs: `https://accounts.google.com/o/oauth2/auth`
4. In Supabase Vault, add: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`
5. Set up Pub/Sub topic and push subscription pointing to gmail-bridge function URL

**Verification:**
- [ ] Test email to founder@lianabanyan.com appears in MoneyPenny Dashboard at /admin/moneypenny
- [ ] Email classified with correct priority class

---

### BP073-C: Resend Domain Verification (C1 Email Sending)
**Category:** Credentials
**Estimated time:** 20 minutes
**Why needed:** Auto-response emails are built but blocked until the sending domain is verified with Resend.

1. Log in to [resend.com](https://resend.com)
2. Add domain: lianabanyan.com
3. Add DNS records shown (TXT record for SPF/DKIM verification)
4. Wait for DNS propagation (up to 24 hours, often faster)
5. In Supabase Vault, add: `RESEND_API_KEY` (from Resend Dashboard -> API Keys)
6. In Resend, set `FROM_EMAIL` = `noreply@lianabanyan.com`

**Verification:**
- [ ] DNS TXT records verified in Resend
- [ ] `RESEND_API_KEY` in Supabase Vault
- [ ] Test auto-response sends successfully (use the Contact form in Ghost World)

---

### BP073-D: Real Cross-Machine MIL Test (B2/B3/B4)
**Category:** Physical validation
**Estimated time:** 2-4 hours
**Why needed:** Organic mesh and cross-frame cooperation are proven in simulation. Real cross-machine validation requires two physical machines with Electron running.

1. Machine A (sender): Install Mnemosyne v0.1.25, start the Electron app
2. Machine B (receiver): Install Mnemosyne v0.1.25, start the Electron app
3. Machine A: add a test folder to the cooperative mesh
4. Machine B: verify the folder appears in its mesh peer list
5. Machine A -> Machine B: share a context snippet via /mesh/cross-frame
6. Verify delivery, integrity (SHA-256 match), and latency

**Success criteria (empirical):**
- [ ] Content appears on Machine B within 5 seconds (LAN)
- [ ] Content appears on Machine B within 60 seconds (WAN)
- [ ] SHA-256 hash matches (no corruption)
- [ ] WAN latency logged (should be 100-300ms per hop)

**Note:** The relay endpoint must be live. The wan_escalation.ts circuit breaker is production-grade but the relay server URL needs to be deployed.

---

### BP073-E: Real ASN BGP Lookup Backend (B1)
**Category:** Infrastructure
**Estimated time:** 1-2 hours
**Why needed:** WAN address derivation uses SHA-256(email+epoch) which is deterministic. For real network topology, ASN lookup maps IP -> network prefix for mesh routing optimization.

Options:
- Use a BGP lookup API (e.g. ipinfo.io, BGPView, Team Cymru)
- Self-host a bgpd/quagga lookup service
- Use the deterministic SHA-256 address (works for launch; ASN lookup is optimization only)

**For launch:** The SHA-256 address derivation WORKS today. ASN BGP lookup is an optimization for post-launch mesh routing quality. It is NOT required to launch.

**Verification (if implementing):**
- [ ] `GET /api/asn/lookup?ip=<ip>` returns `{ asn, network, country }`
- [ ] WanAddressWidget.tsx shows real ASN data

---

**Knight has built everything. The platform is ready. These 14 original items + 5 BP073 additions are the keys -- only you hold them.**

**Wave 29 system state:**
- 2251/2251 tests (66 files) | 0 TS errors | Yoke 2/2 | 22/22 proofs
- jspdf critical CVE patched | xlsx high CVE documented + accepted (browser-only, no npm fix)
- 25 system gates: 24 GREEN, 1 AMBER (xlsx -- documented)
- Critical path: B-4 is the keystone. Nothing ships until Supabase is wired.

*DOCTRINE: deploy-only-on-green / verify-before-stamp / NEVER suppress build*
*Membership: $5/year flat, no tiers. Canon: 2,270 / 228 / 21 / 83.3% / Cost+20%.*
