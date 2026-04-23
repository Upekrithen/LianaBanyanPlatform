# Knight K434 — Cloud Run deploy of hosted MCP endpoint
## Closes K428 Half A §A3 (HTTP MCP transport + playground backend)
## Bishop B115 — 2026-04-22 (late evening)
## Parent scope: [K428 B115 Full-Dispatch Addendum](./PROMPT_KNIGHT_K428_B115_ADDENDUM_FULL_DISPATCH.md)
## Prior: [K430 landing-deploy + primers](./PROMPT_KNIGHT_K430_B115_LANDING_DEPLOY_AND_PRIMERS.md) (K430 shipped landing page; K434 completes the backend)

---

**THE BRIDLE — read this before you respond. Follow all nine rules. Task follows the BRIDLE block.**

1. **Do the task I asked.** Do not restate it back. Do not ask "should I start?" — the answer is yes, start now.
2. **Verify before asserting.** If I point at a folder, open that folder. Run `ls`, `grep`, read the file. Memory and training are not evidence. Look, then claim.
3. **You get ONE clarifying question per turn, and only if the wrong answer would produce the wrong artifact.** Not for tone, font, format, or preferences you can pick defensibly yourself. Pick a defensible default and proceed.
4. **Read everything I sent** — text, screenshots, attachments, code, all of it. If you skimmed, say so in the first line of your reply.
5. **Don't invent.** If you don't know, say "I don't know" in one line, then look it up or flag it. Never guess and present the guess as fact. Never fabricate filenames, slot numbers, function names, counts, or prior states.
6. **No unasked scope.** No "while we're here." No bonus suggestions. I will ask if I want more.
7. **When you finish, state plainly what you did and what remains.** No self-congratulation, no apology, no closing summary of what I already read.
8. **If I correct you, fix the thing.** One sentence on root cause only if it prevents recurrence. Then fix. No essays.
9. **If you break any rule above, stop and say so on the next line.** Don't cover.

**End of BRIDLE. Task follows.**

---

## Prerequisite — `gcloud auth login` done by Founder

Before starting, confirm:
```bash
gcloud auth list
gcloud config get-value project   # must return lianabanyan-403dc
```
If either returns an error, stop and tell Founder. Do NOT attempt to re-auth Knight-side — auth is Founder's action.

---

## Scope

K428's `src/librarian_mcp/hosted.py` + `Dockerfile` + `cloudbuild.yaml` are already in the repo (commit `be8a746`, verified by K430). K430 deployed the static landing page. **This Knight builds and deploys the container to Cloud Run, routes the hosted MCP endpoint through Firebase Hosting, and verifies the playground goes end-to-end.**

---

## Session hygiene

1. SKIP `mcp__librarian__run_session_start` (known flaky B115; causes session timeout). Call `mcp__librarian__brief_me` directly with task `"K434 Cloud Run deploy of librarian-mcp hosted MCP endpoint"`.
2. Read the K428 B115 addendum §Half A (A3) for the authoritative scope. Nothing below supersedes it.
3. Read the K430 report to confirm landing-page state + what the playground's `/api/playground` fetch expects.

---

## Deliverables

### 1. Build and deploy the Cloud Run service

- From `librarian-mcp-public/` root, run `gcloud builds submit --config cloudbuild.yaml` (the prior Knight's config).
- Service name: `librarian-mcp-hosted` under project `lianabanyan-403dc`.
- Region: match the existing Firebase region for this project (grep `.firebaserc` / `firebase.json` or check Cloud Run region of any other LB service; do not guess). If none found, default to `us-central1` and note the choice.
- Container runs `src/librarian_mcp/hosted.py` with FastMCP `streamable-http` transport bound to `0.0.0.0:$PORT` per Cloud Run conventions.
- Memory: 512 MB; CPU: 1; min-instances: 0 (scale-to-zero acceptable — the hosted surface is public-read-only demo); max-instances: 10.
- Ingress: allow all (public). Authentication: unauthenticated invocations allowed.
- Rate limit: 60 req/min/IP — implement via a lightweight middleware inside `hosted.py` (token bucket keyed on `X-Forwarded-For`; Cloud Run auto-sets this). If middleware isn't in `hosted.py` from be8a746, add it in this Knight — do not defer.

### 2. Route from Firebase Hosting to Cloud Run

- In the `librarian-the2ndsecond` Firebase site, add a rewrite in `firebase.json` so `librarian.the2ndsecond.com/mcp/**` and `librarian.the2ndsecond.com/api/playground` route to the Cloud Run service:
  ```json
  "rewrites": [
    { "source": "/mcp/**",         "run": { "serviceId": "librarian-mcp-hosted", "region": "<region>" } },
    { "source": "/api/playground", "run": { "serviceId": "librarian-mcp-hosted", "region": "<region>" } }
  ]
  ```
- Redeploy the site: `firebase deploy --only hosting:librarian`.
- Cold-start latency: note and report. If cold start is above 3 seconds consistently, set min-instances to 1 and report cost delta.

### 3. Structured logging for citation tracking

Log every request to the hosted surface with: timestamp, path, method, `X-Forwarded-For`, user agent, referrer, response status, response time. Use Cloud Logging (structured JSON; no separate log sink needed). This is what `scripts/pull_launch_metrics.py` will query for the "direct visits to librarian.the2ndsecond.com" metric — confirm the script's query matches the log shape you produce.

### 4. Verify end-to-end

- **HTTP MCP:** Hit `librarian.the2ndsecond.com/mcp` from a real MCP client (Cursor or Claude Desktop). Successful `librarian_context` call returns a valid packet. Attach the raw request/response to your report.
- **Playground:** Open `librarian.the2ndsecond.com/#playground`, pick each intent from the dropdown, click Load Memory Packet. Each intent returns a valid packet (no more `<!doctype` error). Screenshot one successful load.
- **Rate limit:** Hit the endpoint 61+ times in a minute from a single IP; request 61 returns a 429 with a clear retry-after header.
- **Write paths NOT exposed:** Confirm `record_measurement`, `metrics_summary`, `opt_in_share` are NOT callable from the hosted endpoint — only `librarian_context` and `prose_provenance`. These three remain local-only on pip installs. If they ARE exposed by hosted.py, fix.
- **SSL Labs grade:** Run `librarian.the2ndsecond.com` through SSL Labs; target A.

### 5. Lighthouse now that playground works

Run Chrome DevTools Lighthouse against the live landing page. Target ≥ 90 Performance, 100 Accessibility per K428 acceptance criteria. Report scores; if below target, log gaps but do not pre-optimize.

### 6. Update K428 acceptance criteria

Re-check the K428 B115 addendum §Acceptance criteria. Mark everything green this session should close:
- MCP endpoint accepts real client connections (was: NOT DONE → DONE)
- Playground processes pasted input (was: PARTIAL → DONE)
- Referrer logs queryable (was: NOT DONE → DONE)
- SSL Labs A grade
- Lighthouse scores (report actuals)

Remaining red after K434: Smithery listing live (manual submission, you don't have gh/PR access to that repo).

---

## Non-goals for K434

- Do NOT expose write paths (measurements/sharing) on the hosted endpoint. That's a separate Knight after Founder ratifies the commons-dashboard design (K428 §Half A3 explicitly defers this).
- Do NOT submit the Smithery / Glama / modelcontextprotocol/servers PRs — drafts are in `00_FOUNDER_REVIEW/`, Founder submits.
- Do NOT alter preload/ content.
- Do NOT touch K431/K432/K433 (WS1 portal work) — different track.

---

## Reporting

1. Commit SHA for the firebase.json rewrite + any hosted.py edits
2. Cloud Run service URL + region chosen + rationale
3. Cloud Build SHA + build duration
4. Screenshot: Cursor/Claude Desktop successfully calling `librarian_context` against the hosted endpoint
5. Screenshot: playground loading a memory packet successfully
6. Rate-limit behavior proof (curl output showing 429 at threshold)
7. SSL Labs grade
8. Lighthouse scores (Performance + Accessibility + Best Practices + SEO)
9. Cold-start latency measurement (p50, p95, p99 over ~20 requests)
10. First 2-hour Cloud Run cost line — so Bishop can project monthly and cite for Herjavec-family-office-style inquiries
11. Any K428 §Acceptance criteria still red after this Knight — single list

---

## Estimated size

One focused Knight session, 2–3 hours. Cloud Run deploy itself is fast (~5 min build + deploy) if the Dockerfile is clean. Most time goes to rate-limit middleware, logging, and end-to-end verification.

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*K434 dispatch written 2026-04-22 late evening by Bishop B115 (Claude Opus 4.7, 1M context). Closes the K428 backend track once Founder completes `gcloud auth login`.*
