# Knight K430 — Landing-page deploy + community primers finalization
## Bishop B115 — 2026-04-22 (later evening)
## Continues: [K428 B115 Full-Dispatch Addendum](./PROMPT_KNIGHT_K428_B115_ADDENDUM_FULL_DISPATCH.md)

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

## Session hygiene (do these before touching code)

1. `mcp__librarian__run_session_start` with `agent=KNIGHT`, `session_id=K430`, `task="Deploy librarian.the2ndsecond.com landing page + playground; finalize BOUNTIES/BUILDING_TOGETHER; draft registry PRs"`.
2. `mcp__librarian__brief_me` with the same task string.
3. Read the K428 B115 full-dispatch addendum in full. Read the K428 B113 stub for anything the B115 addendum did not supersede.
4. Verify claims from the prior Knight's handoff before you act on them (see §1 below). Your prior Knight reported commit `be8a746` pushed with hosted/Dockerfile/BOUNTIES/issue-stubs/templates — when Bishop checked the local workspace, only `f86e6a1` (K424) was visible. Either the push landed on origin but the local workspace wasn't pulled, or the prior Knight's report overstated. Find out first.

---

## What changed since K428 dispatched

Founder-side progress this session (2026-04-22 evening, verified):

- **DNS:** `CNAME librarian → librarian-the2ndsecond.web.app` added at Squarespace for `the2ndsecond.com`. Saved.
- **Firebase site created:** `librarian-the2ndsecond` exists under project `lianabanyan-403dc`.
- **Custom domain connected:** `librarian.the2ndsecond.com` shows **Connected** in Firebase Hosting. Cert minted.
- **Site status:** "Waiting for your first release" — site is ready, no deploy yet.
- **Memory corrected (don't act on stale reads):** `project_dns_provider_split.md` is now screenshot-grounded — all LB domains are Squarespace-managed. The `ns-cloud-*.googledomains.com` nameservers are legacy Google-Domains infra Squarespace inherited; they are NOT evidence of GCP Cloud DNS. Edit DNS at Squarespace for every LB domain.

So: DNS done, site provisioned, cert minted. **The only remaining blocker for `librarian.the2ndsecond.com` to go live is a deploy.** That is the primary job of K430.

---

## 1. Verify prior-Knight claims before acting on them (BRIDLE Rule 2)

The prior Knight's handoff listed these artifacts as shipped in commit `be8a746`:

- `src/librarian_mcp/hosted.py` (HTTP MCP transport)
- `Dockerfile` + `cloudbuild.yaml`
- `hosted/index.html` (landing page + playground)
- `README.md` updates (badges, hero, links)
- `smithery.yaml`
- `scripts/pull_launch_metrics.py`
- `BOUNTIES.md` draft
- `BUILDING_TOGETHER.md` draft
- `issues/001-005/` (5 GitHub issue stubs)
- `BISHOP_DROPZONE/00_FOUNDER_REVIEW/K428_SHOW_HN_TEMPLATE.md`, `K428_LINKEDIN_TEMPLATE.md`, `K428_MCP_DISCORD_TEMPLATE.md`

**Step 1a:** Run from the librarian-mcp-public repo:
```bash
git fetch
git log --oneline origin/main -10
```
Report what you actually see. If `be8a746` is there but your local `main` is behind, `git pull`. If `be8a746` is NOT on origin, the prior-Knight report overstated — rebuild the artifacts below from scratch per the K428 B115 addendum scope. Say which case you found.

**Step 1b:** Whichever case, verify each of the 11 claimed artifacts exists by path. Report a clear diff: "present" / "missing" / "stub-only." Do not assume.

---

## 2. Deploy the landing page to `librarian-the2ndsecond`

**Only after Step 1 confirms the hosted directory exists OR you've rebuilt it.**

### 2a. Initialize Firebase Hosting config in the repo

The librarian-mcp-public repo has no `firebase.json` or `.firebaserc` yet (checked B115). Create them targeted at the new site:

- Project: `lianabanyan-403dc`
- Site: `librarian-the2ndsecond`
- Public directory: `hosted`
- Single-page rewrite: **NO** (this is a static landing + a client-side playground; HTML files resolve directly)
- Do NOT overwrite `hosted/index.html` during init

`.firebaserc` stub:
```json
{
  "projects": { "default": "lianabanyan-403dc" },
  "targets": {
    "lianabanyan-403dc": {
      "hosting": { "librarian": ["librarian-the2ndsecond"] }
    }
  }
}
```

`firebase.json` hosting block targeting `librarian` with `public: "hosted"` + appropriate headers (HSTS on, cache policy per the existing MrOz / lianabanyan-403dc firebase.json patterns in `LianaBanyanPlatform/platform/firebase.json` — copy the headers style for consistency).

### 2b. Deploy

```bash
firebase use lianabanyan-403dc
firebase target:apply hosting librarian librarian-the2ndsecond
firebase deploy --only hosting:librarian
```

### 2c. Verify

- `librarian.the2ndsecond.com` serves the landing page (not the Firebase default "Hosting setup complete" page)
- Eyewitness table, personification block, install command, Chapter 2 teaser, BOUNTIES footer link all render
- The web playground loads and can process a pasted small CANONICAL.md test input
- HTTPS cert valid (Firebase handles this automatically now that the domain is Connected)
- Lighthouse score ≥ 90 Performance, 100 Accessibility (as specified in K428 B113 stub acceptance criteria)

---

## 3. Finalize BOUNTIES.md + BUILDING_TOGETHER.md prose drafts

These were scoped in K428 B115 §Half C. Whether they exist from prior Knight or need rebuild (per Step 1b diff):

- **BOUNTIES.md** — structure already scoped in K428 B115 addendum §C1. Write the prose drafts. Leave anecdote hooks where Founder voice would anchor the points (Cloyd layaway, Pine Books, anachronism-principle examples, shape-note/aviation biographical instances). Expect 60-80% Founder rewrite per drafts-as-scaffolding rule.
- **BUILDING_TOGETHER.md** — structure already scoped in K428 B115 addendum §C2. Same treatment.
- Both files in repo root. Link both from the landing page footer (in `hosted/index.html`).

Commit both in the same PR/push so history stays clean.

---

## 4. Draft three registry PRs to `00_FOUNDER_REVIEW/`

These stay as DRAFTS only. Founder submits them manually (you do not have gh auth).

- `K430_SMITHERY_SUBMISSION.md` — the PR body + any smithery.yaml tweaks needed for their acceptance criteria
- `K430_GLAMA_SUBMISSION.md` — their submission format
- `K430_MCP_SERVERS_PR.md` — content for the PR to `modelcontextprotocol/servers` community list

Each must link to both `librarian.the2ndsecond.com` AND `github.com/liana-banyan/librarian-mcp` and must include the Eyewitness numbers verbatim (86.1pp / κ 0.883 / 8 models × 4 vendors × 1,200 calls).

---

## 5. Non-goals for K430

- **Do NOT deploy Cloud Run / HTTP MCP endpoint.** That needs `gcloud auth login` which Founder hasn't done. If `be8a746` contains Dockerfile + cloudbuild.yaml, leave them in-repo but unexecuted.
- **Do NOT post GitHub issues.** That needs `gh auth login`. Leave issue stubs in `issues/001-005/` as files.
- **Do NOT submit the registry PRs.** Drafts only.
- **Do NOT modify the preload/ content** in the repo. That's canonical; don't edit.

---

## 6. Reporting

At end of session, report in this order:

1. Step 1 verification diff (what was actually in `be8a746` vs. prior-Knight claims)
2. `librarian.the2ndsecond.com` live URL + screenshot/Lighthouse score
3. Commit SHA for the deploy + prose-finalization commit
4. Paths of the three registry-PR drafts in `00_FOUNDER_REVIEW/`
5. Any remaining acceptance-criteria gaps from the K428 B113 stub §Acceptance criteria

---

## Estimated size

One focused Knight session, 2–4 hours. The hosting config + deploy is the tightest part. The prose drafts are scaffolding pass (Founder rewrites).

**One launch. No shortcuts. Never say "non-blocking." Fix everything before reporting done.**

---

*K430 dispatch written 2026-04-22 evening by Bishop B115 (Claude Opus 4.7, 1M context). Builds on K428 B115 addendum and Founder's just-completed DNS + Firebase site + custom-domain provisioning for `librarian.the2ndsecond.com`.*
