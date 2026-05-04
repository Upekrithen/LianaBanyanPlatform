# Librarian.LianaBanyan.com Deployment — B127 Scaffold

**Status**: Founder ratified B127 ("Great! Do it. I prefer single deployment...").
**Tagline source**: project_canonical_tagline_v2_99_1_b127.md ("Prove It at Librarian.LianaBanyan.com").
**Existing surface**: librarian.the2ndsecond.com (operational; SEO accumulated).
**Companion**: project_dns_provider_split.md (LB domain DNS canonical at Squarespace).

---

## Founder open question (B127 verbatim)

> "Great! Do it. I prefer single deployment, especially since the2ndSecond.com has its own Trunk. Unless better to have another on LianaBanyan.com trunk... but then can be different, easier to control, and measure and fix if issue, but then two makes the opposite case for backup and redundancy for stay-alive... Hmm. what do you think?"

## Three architectural options

### Option A — Single Firebase deployment, two hostnames bound (Bishop pick)
- One Firebase target serves both `librarian.lianabanyan.com` AND `librarian.the2ndsecond.com`
- Both hostnames load identical content (literally same files)
- 301 redirect optional: leave both as canonical OR make one canonical with 301 from the other
- **Pros**: simple, no drift, single source of truth, single deployment pipeline
- **Cons**: no per-hostname A/B testing; if one provider has outage, both go down (same Firebase target)

### Option B — Two separate Firebase deployments (per-trunk)
- `librarian.lianabanyan.com` deployed as new Firebase target on the LianaBanyan trunk
- `librarian.the2ndsecond.com` continues at existing target on the2ndSecond trunk
- Content sync via shared source repo or CI/CD job
- **Pros**: redundancy (if one trunk hiccups, other serves), per-trunk metrics independent, easier to A/B test, brand-specific theming possible per host
- **Cons**: two deployment targets to maintain, sync drift risk, doubled CI/CD overhead

### Option C — Hybrid (single content source, two Firebase targets, same build)
- One source repo
- Build pipeline outputs to both Firebase targets (lianabanyan + the2ndsecond) per push
- Both serve identical content; redundancy via deployment-pair
- **Pros**: redundancy + single source of truth + per-host metrics
- **Cons**: doubled Firebase storage cost; build complexity slightly higher

## Bishop recommendation

**Option A — single deployment, two hostnames bound.**

Reasoning weighed against Founder's concern:
- "Easier to control, measure, and fix if issue" → Option A wins; one deployment to fix.
- "Backup and redundancy for stay-alive" → Firebase already provides infra-level redundancy (Google CDN, multi-region). Adding a second deployment doesn't add MEANINGFUL redundancy unless they're on different cloud providers (which they aren't — both Firebase). A second Firebase target sharing Google's infrastructure provides illusion-of-redundancy without real failover benefit.
- "the2ndSecond.com has its own Trunk" → existing trunk continues to operate; Option A binds the LianaBanyan hostname AS WELL TO IT, no destruction of existing trunk infrastructure.
- "Different, easier to control, and measure and fix" → if A/B testing is later needed, Option A can be promoted to Option C without disruption (just add second Firebase target binding to same source).

Net: Option A captures all benefits Founder cited EXCEPT the redundancy-illusion, and the redundancy-illusion is just that — adding a second Firebase target on the same Google infrastructure does not protect against Firebase-level outages.

If Founder later wants TRUE redundancy (e.g. AWS S3 mirror + Cloudflare in addition to Firebase), that is a separate (larger) architectural decision.

## Implementation (small Knight task — K-future)

Phases:
- Phase A — Identify the existing Firebase target serving `librarian.the2ndsecond.com`. Confirm it's `MrOz` or `LianaBanyan` GCP project (per project_firebase_project_layout.md memory).
- Phase B — Add `librarian.lianabanyan.com` as a custom domain on the SAME Firebase target. Verify DNS A/AAAA records at Squarespace point to Firebase IPs.
- Phase C — Update Firebase site config to accept both hostnames; ensure SSL cert auto-provisions for the new hostname.
- Phase D — 301 redirect decision: 
   - Option D.1: leave both as equal canonical (no redirect) — both URLs serve content
   - Option D.2: 301 redirect `the2ndsecond` -> `lianabanyan` (Founder voice register: LB-canonical wins)
   - Option D.3: 301 redirect `lianabanyan` -> `the2ndsecond` (preserve existing SEO)
- Phase E — verify both URLs resolve, both serve identical content, SEO 301s (if chosen) propagate via Google indexing within ~6-12 weeks.

Bishop pick on D: **D.2 — 301 redirect the2ndsecond to lianabanyan**. Reasons:
- LB-canonical brand wins long-term
- Tagline (V2) literally says "Librarian.LianaBanyan.com"
- 301 redirect transfers SEO weight; over 6-12 weeks, Google indexes the new canonical
- the2ndSecond URL still works (301 is a redirect, not a deletion); legacy bookmarks land on new canonical

Founder open ratification on D-pick.

Estimated wallclock: small (1-2 hr Knight). Mostly Firebase config + DNS verification.

## Cross-references

- project_canonical_tagline_v2_99_1_b127.md (the tagline this URL satisfies)
- project_firebase_project_layout.md (existing Firebase target inventory)
- project_dns_provider_split.md (Squarespace DNS canonical)
- project_the2ndsecond_origin.md (the2ndSecond is origin-story; LianaBanyan is brand canonical)

---

*Filed B127 by Bishop, 2026-04-26. Long Haul AND Fix Along the Way. Both, Always.*
