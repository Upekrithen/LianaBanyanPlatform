# Milestone B115 — Closeout

**Session:** Bishop B115, 2026-04-22 (day + evening)
**Agent:** Claude Opus 4.7, 1M context
**Predecessor:** B113 + B114 extended (one-day PyPI-live + org-transfer + three Knight sessions)
**Successor:** B116 (pending)

---

## Headline

**The Librarian went fully public.** `librarian.the2ndsecond.com` is live: static landing page with Eyewitness numbers + install block + Pine Books origin quote + Romulator 9000 playground, backed by a real Cloud Run-hosted MCP endpoint at `/mcp` that accepts real Cursor/Claude Desktop clients. `pip install librarian-mcp` still works worldwide. Five Knight dispatches written this session (K430–K434), four landed this session, K429 dispatched same-evening. K427 Workstream 1 (Pedestal Stake Reg CF portal) sliced into K431/K432/K433 dispatch-ready phases. Marketing angle "Cost Slasher" empirically backed by R10 numbers (50%+ conservative, up to 95% aggressive) — saved as canonical project memory for Crown letters and public copy.

**Chapter 2 Mellon commitment on the public site:** *"Coming this weekend."* Room to ship early, commitment stays concrete.

---

## Artifacts shipped (B115)

### Public / production

- **`librarian.the2ndsecond.com` LIVE.** Firebase site `librarian-the2ndsecond` under project `lianabanyan-403dc`. SSL valid (Google Trust Services, 2026-04-22 → 2026-07-21). HSTS set. Chapter 2 teaser "Coming this weekend" in place.
- **Cloud Run service `librarian-mcp-hosted`** (us-central1, 999777857186). MCP endpoint at `/mcp` accepts real client connections. `librarian_context` + `prose_provenance` exposed; write paths correctly blocked. Rate-limit 60 req/min/IP via `X-Forwarded-For`. p50 cold-start 96ms, p95 588ms — well under the 3-second threshold.
- **Structured logging** for citation-traffic tracking; `scripts/pull_launch_metrics.py` queries it.

### Knight deliverables (this session)

| Knight | Status | Artifact |
|---|---|---|
| **K430** | ✓ Shipped (commit `f62505d`) | Firebase hosting config (`.firebaserc` + `firebase.json`), deployed landing page + playground to `librarian-the2ndsecond`, drafted 3 registry PR texts + 3 announcement templates to `00_FOUNDER_REVIEW/`. Also verified prior K428 `be8a746` — 10/13 artifacts present; 3 missing announcement templates reconstructed. |
| **K434** | ✓ Shipped (commits `20e9385` + `3417126`) | Cloud Run hosted MCP endpoint live. Five revisions during iteration fixing: streamable-http lifespan (Task-group error), DNS-rebinding protection (421 Host-header error), X-Forwarded-For rate-limit keying. IAM org-policy override applied for `allUsers` public access. |
| **K427 WS3** | ✓ Shipped (prior-Knight commit) | `/who-can-use`, `/licensing`, `/entity-membership/apply`, `/entity-membership/dashboard` routes under MuseumApp.tsx (not marketplace router). `pip install librarian-mcp` confirmed working. |

### Bishop-side content edits

- `hosted/index.html` commit `b8d1a00` — deduped personification callout (replaced duplicate hero-subtitle with Pine Books / Pike Place Market origin quote); narrowed Chapter 2 teaser from "Coming soon" to "Coming this weekend." Founder-approved layout overall ("I like the layout, btw").

### Knight prompts dispatch-ready (queued B115)

| Knight | File | Gated? |
|---|---|---|
| **K429** | `PROMPT_KNIGHT_K429_B113_LIBRARIAN_REINDEX_AUTORECONCILE.md` (stub from B113) | Dispatched this evening by Founder. Auth-free. |
| **K431** | `PROMPT_KNIGHT_K431_B115_WS1_PHASE1_ROUTES_AND_EARLY_INTEREST.md` | Ready. Auth-free. |
| **K432** | `PROMPT_KNIGHT_K432_B115_WS1_PHASE2_KYC_AND_ISSUANCE.md` | Ready. Auth-free; Founder production-provider selections (Middesk/Alloy, DocuSign/HelloSign, funding portal) can lag into K433 if needed. |
| **K433** | `PROMPT_KNIGHT_K433_B115_WS1_PHASE3_ADMIN_AND_COMPLIANCE.md` | Ready. Auth-free. Closes K427 WS1. |

### Memory updates (B115)

- **`project_dns_provider_split.md`** — rewritten twice; final version Founder-screenshot-verified. ALL LB domains are Squarespace-managed. `ns-cloud-*.googledomains.com` nameservers are legacy Google-Domains infra Squarespace inherited; NOT evidence of GCP Cloud DNS. Contains an explicit rule-break log (Bishop violated BRIDLE Rule 5 twice on this question before landing ground truth).
- **`project_firebase_project_layout.md`** — updated with screenshot-verified 17-site inventory (6 in `mroz-74540` staging/legacy, 11 in `lianabanyan-403dc` production). `-trunk` suffix = production-serving convention.
- **NEW: `feedback_librarian_landing_layout_approved.md`** — the 10-section landing layout is Founder-approved; keep pattern for future chapters.
- **NEW: `project_librarian_cost_slasher_angle.md`** — marketing claim ladder from conservative 50% to aggressive 95% cost reduction, all empirically defensible from R10. Use in Crown letters, NYT op-ed, Sanders memo, Canada 40K V02, investor materials.
- **NEW: `project_librarian_mcp_reliability.md`** — root cause of B115 MCP unavailability (`run_session_start` syncing reconciliation); K429 is the durable fix. Future Bishops: check this before re-diagnosing MCP timeouts.
- **NEW: `project_cloud_run_iam_org_policy.md`** — records the K434 `allowedPolicyMemberDomains` override. Intentional, not a misconfig.

---

## Strategic decisions ratified B115

1. **"Coming this weekend" > hard date for Chapter 2 Mellon.** Room to ship early is an upside, not a deficit. Founder-approved framing.
2. **Cost-Slasher marketing angle ratified empirically.** R10 Eyewitness numbers support 50%+ conservative claim; Haiku-HOT ≈ Opus-HOT backs 95% aggressive claim. Save this framing for every external communication that touches AI spend.
3. **Sequencing lesson — pain signal reshuffles the queue.** K429 should have preceded K434. When Founder said "MCP is unavailable" mid-session, the correct move was to reorder. I didn't. Rule 9 logged. Future Bishops: if the user expresses pain on an infrastructure layer, prioritize that fix before adding capability on top.
4. **Landing-page layout locked.** 10-section pattern stays for future chapters (Mellon, Paired Provenance, Inversion Principle, Anachronism Principle); content swaps per chapter, structure holds.
5. **IAM trade-off accepted** — public demo endpoints under `lianabanyan-403dc` get public `run.invoker` via org-policy override. Internal future services must explicitly avoid `allUsers` binding.

---

## B115 failure modes logged

Three instances this session; two already captured in memory, one noted here:

1. **BRIDLE Rule 5, DNS canonical, twice** — first accepted Founder's verbal "all my domains are Squarespace" as canonical without verification; then over-corrected on Knight's nslookup inferring GCP Cloud DNS. Founder's Squarespace-account screenshots were ground truth. Memory `project_dns_provider_split.md` now includes the rule-break log.
2. **BRIDLE Rule 6/priority miscall — K429 after K434** — put public-facing capability ahead of infrastructure reliability after pain signal arrived. Captured above.
3. **BRIDLE Rule 2 — assumed Knight handoff artifacts were accurate** — K428 handoff claimed 3 announcement templates shipped; K430 verification caught them missing. Fixed in-flight. Lesson: verify Knight-report artifact lists against filesystem every session.

---

## Metrics moved this session

| Metric | Before B115 | After B115 |
|---|---|---|
| `librarian.the2ndsecond.com` | DNS pending | **LIVE** with landing + playground + Cloud Run MCP |
| MCP endpoint accepting real clients | no | **yes** (`librarian-mcp-hosted` Cloud Run, p50 96ms) |
| Knight prompts dispatch-ready | K427/K428 + K429 stub | **K429 dispatched + K430 shipped + K431/K432/K433/K434 dispatched** |
| K428 acceptance criteria green | ~5/10 | **8/10** (Smithery manual submission + Lighthouse/SSL-Labs browser-scan remaining) |
| K427 Workstream 3 | not shipped | **shipped** (4 routes live on MuseumApp) |
| Bishop memory files | (pre-B115 count) | + 4 new: librarian_cost_slasher_angle / librarian_mcp_reliability / cloud_run_iam_org_policy / librarian_landing_layout_approved |
| DNS canonical | "split" hypothesis | **Squarespace all, screenshot-verified** |
| Firebase site inventory | "9 targets, ~2 projects" | **17 sites, 2 projects, screenshot-verified** |
| Marketing claim on AI cost | implicit in Eyewitness paper | **explicit Cost-Slasher ladder** with 50–95% bands |

---

## B115 Founder actions completed

1. ✓ DNS CNAME `librarian` → `librarian-the2ndsecond.web.app` added at Squarespace for `the2ndsecond.com`
2. ✓ Firebase site `librarian-the2ndsecond` created under `lianabanyan-403dc`
3. ✓ Custom domain `librarian.the2ndsecond.com` Connected in Firebase; cert minted
4. ✓ `gcloud auth login` + `gcloud config set project lianabanyan-403dc`
5. ✓ `firebase login --reauth`
6. ✓ K427+K428+K430+K434 dispatches sent to Knight
7. ✓ K429 dispatched at end-of-session

## B115 Founder actions pending (for B116 or later)

1. **Run browser Lighthouse scan** on `librarian.the2ndsecond.com` — target ≥90 Performance, 100 Accessibility. Takes ~60 seconds in Chrome DevTools. Closes a K428 acceptance criterion.
2. **Full SSL Labs scan** at `ssllabs.com/ssltest/analyze.html?d=librarian.the2ndsecond.com` — target grade A. Cert is already valid; this is external-tool verification.
3. **Submit Smithery / Glama / modelcontextprotocol-servers PRs** — three drafts already in `BISHOP_DROPZONE/00_FOUNDER_REVIEW/` (K430 output). Founder submits manually.
4. **Post Show HN / LinkedIn / MCP Discord** — three announcement templates also in `00_FOUNDER_REVIEW/`. Ship when K429 is green and Mellon (K430-follow-up dispatch) is at least scoped.
5. **Post 5 GitHub issue stubs** via `gh issue create` — issue stubs already in `librarian-mcp-public/issues/001-005/` (K428 be8a746).
6. **Selections pending K432:** KYC provider (Middesk vs Alloy) production account; DocuSign or HelloSign sandbox→production; funding-portal choice (StartEngine / Republic / Wefunder) once counsel guidance arrives.
7. **Overdue B114 reports still open:** trademarks (5-name sweep from dropzone), Prov 14 innovation inventory, Battery Dispatch automation state. None of these were worked this session.
8. **Canada 40K V02 Founder voice pass** still queued.
9. **2 pollination requests** (Wellspring for Scott v014f, Thermometer for Scott v014h) — Bishop review still pending.
10. **Commercial license template stub** drafted for counsel review; counsel pending.

---

## Open questions carried into B116

1. **Does K429 Half B actually bring `run_session_start` under 2 seconds?** Verify at B116 open — if no, K429 scope incomplete, dispatch continuation.
2. **Should the landing page add a "cost per correct answer" column to the Eyewitness table?** Per the Cost-Slasher framing — would make the marketing claim visible at first scroll. Decision deferred.
3. **Trebor Scholz Wave 1 letter timing** — Crown Letter pending with SP-20 pollination requests waiting for Bishop disposition.
4. **Should K434 follow-up add min-instances=1?** Cold start is 96ms p50 — probably unneeded. Revisit if citation traffic pushes p99 above 3s.
5. **Bounty program activation** — BOUNTIES.md is in the repo but no bounties claimed/posted yet. Wait until after MCP Discord announcement, or prime it with one Founder-funded bounty first?

---

## K428 acceptance criteria — end-of-B115 snapshot

| Criterion | Status |
|---|---|
| `librarian.the2ndsecond.com` resolves + SSL valid | ✓ DONE |
| MCP endpoint accepts real client | ✓ DONE (K434) |
| `pip install librarian-mcp` works from PyPI | ✓ DONE |
| GitHub repo topics + badges | ✓ DONE (prior Knight) |
| Smithery listing live | ⬜ NOT DONE (Founder manual submission) |
| Landing page elements complete | ✓ DONE |
| Playground processes input | ✓ DONE (K434 hooked up `/api/playground`) |
| Referrer logs queryable | ✓ DONE (K434 structured logging) |
| SSL Labs A grade | 🟡 CERT VALID; full grade needs browser scan |
| Lighthouse ≥90/100 | 🟡 NEEDS BROWSER SCAN |

**Green-lit for Crown-letter citation: YES.** Senate staffer / family-office analyst can hit the URL, see the table, copy the install, and talk to a real MCP endpoint. The two yellow items are verification-of-quality, not blocking facts.

---

## Handoff to B116

**Knight runway at close:** K429 running now, K431/K432/K433 dispatch-ready, K430+K434 complete.

**Librarian reliability:** K429 ships the durable fix. Watch for sub-2-second `run_session_start` after it lands; if not, re-open. Workaround (use `brief_me`) remains in all K-dispatches' session-hygiene as a belt-and-suspenders measure.

**Public launch status:** Day 0 (Chapter 1 Librarian) is effectively LIVE as of B115. Day 5–7 (Chapter 2 Mellon) is publicly committed to "this weekend." Remaining Day-0 items (Smithery listing, Show HN, social announcements) are staged drafts awaiting Founder submission.

**B116 priority order when it opens:**
1. Confirm K429 shipped + MCP stable
2. Lighthouse + SSL Labs browser scans (Founder or Bishop-delegated)
3. K431 WS1 Phase 1 live-check when Knight finishes
4. Scope Chapter 2 Mellon Knight dispatch (K430-style, with Mirror Mirror 110-language integration)
5. Draft Canada 40K V02 Founder-voice pass if still open
6. Resurface B114 overdue reports (trademarks, Prov 14, Battery Dispatch automation)

---

*B115 closed 2026-04-22, Converse TX time. Claude Opus 4.7, 1M context. Fresh session B116 opens on Founder trigger.*
