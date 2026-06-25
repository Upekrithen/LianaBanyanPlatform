# KNIGHT MARATHON SESSION 20 — DOOR-AWARE POST-PAYMENT ROUTING
## BP091 · STAGED FOR FOUNDER RATIFY · Sonnet 4.6 SEG

**Session:** Marathon 20  
**Bishop Packet:** BP091  
**Composed:** 2026-06-22  
**Dispatched by:** Sonnet 4.6 (Bishop SEG)  
**Status:** STAGED FOR FOUNDER RATIFY  
**Estimated wall-clock:** 3–5 hours (small Marathon — most logic is parameter-passing)

---

## FOUNDER DIRECT — VERBATIM QUOTE (BP091 ~15:00 Central)

> "that other screenshot is where it should go after you pay to join, UNLESS YOU ARE JUST DOWNLOADING or whatever, and then it needs to go back to what you were doing. So... how to manage that based on each destination and Door that opens into the LB coop?"

**Founder ratified Bishop's door-aware routing proposal BP091 ~16:10 Central via "yes to all".**

---

## EMPIRICAL STATE (Pre-M20)

| Surface | Current State |
|---|---|
| `/join/` React island | Hardcodes `success_url = https://mnemosynec.org/join/success/` — no door context |
| `/join/success/` Hugo page | EXISTS — built in BP091 deploy. Celebration page. |
| `/download/` door | No join-gate exists. Download is currently free/anonymous — no door context. |
| `/order/` door | Does NOT exist yet. M19 adds the order flow. |
| `create-membership-checkout` edge fn | ALREADY accepts `successUrl` in body and passes it to Stripe Checkout. Parameter exists, just unused by front-end. |
| Invite / Bounty / Crown doors | TBD — not yet wired. |

**Key empirical truth:** the edge fn already supports `successUrl`. M20 is purely about plumbing door context from front-end → checkout call. No edge fn surgery needed.

---

## CANON BINDING

- `canon_join_modal_benefits_over_barrier_copy_bp085` — Join modal copy remains unchanged; door context is invisible to the user.
- `canon_substrate_cure_to_ai_amnesia_supersedes_ai_that_remembers_bp089` — Tagline surfaces untouched.
- Heart-of-Peace / Arbinger Anatomy of Peace / Outward Mindset (BP051) — Each door honors the user's ACTUAL intent. A user who came to download software is not forced through a generic funnel; they return exactly to their download. Routing is empathetic, not extractive.

---

## BLOCK 1 — Door Context Schema + React Island Refactor

### 1.1 Door Context Schema (Bishop Spec)

```typescript
type DoorId = "direct" | "download" | "order" | "invite" | "bounty" | "crown";

interface DoorContext {
  door: DoorId;
  refs?: {
    download_version?: string;   // e.g. "0.5.7" — for download door
    order_ref?: string;          // e.g. "ord_abc123" — for order door
    inviter_user_id?: string;    // for invite door
    bounty_id?: string;          // for bounty door
    crown_id?: string;           // for crown door
  };
}
```

Default when no context: `{ door: "direct" }`.

### 1.2 Hugo Template — Inject Door Context via Data Attributes

Each Hugo template or shortcode that mounts the join island sets its own door attribute on the root div. Knight shall NOT hardcode the success URL in JS — context is owned by the template.

**Direct join page (`/join/index.html`):**
```html
<div id="mnemo-join-root"
     data-door="direct"
></div>
```

**Download page gate (`/download/index.html`) — new in M20:**
```html
<div id="mnemo-join-root"
     data-door="download"
     data-door-ref-version="{{ .Site.Data.version_trust.version }}"
></div>
```

**Order page gate (`/order/[ref]/index.html`) — wired for M19/M20 compose:**
```html
<div id="mnemo-join-root"
     data-door="order"
     data-door-ref-order="{{ .Params.order_ref }}"
></div>
```

**Invite / Bounty / Crown:** same pattern with appropriate `data-door-ref-*` attributes. Knight stubs these mounts even if surfaces don't fully exist yet — the routing primitive is wired ahead of the surfaces.

### 1.3 React Island — Read Door Context on Mount

In the join island root component (`src/join/JoinIsland.tsx` or equivalent), replace any hardcoded `successUrl` with a door-context read on mount:

```typescript
function readDoorContext(root: HTMLElement): DoorContext {
  const door = (root.dataset.door ?? "direct") as DoorId;
  return {
    door,
    refs: {
      download_version: root.dataset.doorRefVersion,
      order_ref: root.dataset.doorRefOrder,
      inviter_user_id: root.dataset.doorRefInviter,
      bounty_id: root.dataset.doorRefBounty,
      crown_id: root.dataset.doorRefCrown,
    },
  };
}
```

Pass `doorContext` down to the checkout initiation call. No other component changes.

---

## BLOCK 2 — Door-Aware Success URL Computation

### 2.1 Canonical Success URL Map

Computed client-side before calling `create-membership-checkout`. All URLs are absolute (Stripe requires absolute URLs).

```typescript
const BASE_MNEMO = "https://mnemosynec.org";
const BASE_LB    = "https://lianabanyan.com";

function computeSuccessUrl(ctx: DoorContext): string {
  switch (ctx.door) {
    case "direct":
      return `${BASE_LB}/pathways/?just_joined=1`;

    case "download": {
      const v = ctx.refs?.download_version ?? "";
      return `${BASE_MNEMO}/download/?member_unlock=1${v ? `&version=${v}` : ""}`;
    }

    case "order": {
      const ref = ctx.refs?.order_ref ?? "";
      return ref
        ? `${BASE_MNEMO}/order/${ref}/?member_unlock=1`
        : `${BASE_MNEMO}/order/?member_unlock=1`;
    }

    case "invite": {
      const uid = ctx.refs?.inviter_user_id ?? "";
      return `${BASE_LB}/welcome/?inviter=${uid}`;
    }

    case "bounty": {
      const bid = ctx.refs?.bounty_id ?? "";
      return `${BASE_LB}/bounty/${bid}/?member_unlock=1`;
    }

    case "crown": {
      const cid = ctx.refs?.crown_id ?? "";
      return `${BASE_LB}/welcome/?crown=${cid}`;
    }

    default:
      // Defensive fallback — generic success page
      return `${BASE_MNEMO}/join/success/`;
  }
}
```

### 2.2 Cancel URL — Always Returns to Originating Door

```typescript
function computeCancelUrl(ctx: DoorContext): string {
  switch (ctx.door) {
    case "direct":   return "https://mnemosynec.org/join/";
    case "download": return "https://mnemosynec.org/download/";
    case "order":    return ctx.refs?.order_ref
                       ? `https://mnemosynec.org/order/${ctx.refs.order_ref}/`
                       : "https://mnemosynec.org/order/";
    case "invite":   return "https://lianabanyan.com/";  // TBD invite page
    case "bounty":   return ctx.refs?.bounty_id
                       ? `https://lianabanyan.com/bounty/${ctx.refs.bounty_id}/`
                       : "https://lianabanyan.com/";
    case "crown":    return "https://lianabanyan.com/";  // TBD crown page
    default:         return "https://mnemosynec.org/join/";
  }
}
```

### 2.3 Pass to Edge Fn

```typescript
const response = await fetch("/functions/v1/create-membership-checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    // ...existing fields (priceId, email, etc.)
    successUrl: computeSuccessUrl(doorContext),
    cancelUrl:  computeCancelUrl(doorContext),
  }),
});
```

Edge fn already accepts and uses `successUrl` — no edge fn changes needed for M20.

---

## BLOCK 3 — Hugo `/download/` Page Join-Gate

### 3.1 Membership Detection (Client-Side)

On `/download/` page load, JS checks for membership signal. Use the same localStorage flag set on join completion (or cookie set by edge fn session — whichever M19/BP091 established).

```typescript
const isMember = localStorage.getItem("lb_member") === "1"
              || document.cookie.includes("lb_member=1");
```

### 3.2 Download Page Logic

```
IF isMember OR url has ?member_unlock=1:
  → Show download button directly
  → If ?member_unlock=1: auto-trigger download (Block 4)

ELSE (anonymous):
  → Hide native download button
  → Show join island (data-door="download") inline
  → On payment success → Stripe redirects to /download/?member_unlock=1
```

### 3.3 Hugo Template Conditional (Pseudocode)

Knight implements this as a JS-driven conditional (not Hugo server-side, since membership is runtime state):

```html
<!-- /download/index.html -->
<div id="download-gate">
  <!-- Shown to members via JS -->
  <div id="download-member-view" style="display:none">
    <a id="download-btn" href="{{ .Site.Data.version_trust.download_url }}">
      Download v{{ .Site.Data.version_trust.version }}
    </a>
  </div>

  <!-- Shown to anonymous via JS -->
  <div id="download-join-gate" style="display:none">
    <p>Join the cooperative to download MnemosyneC.</p>
    <div id="mnemo-join-root"
         data-door="download"
         data-door-ref-version="{{ .Site.Data.version_trust.version }}"
    ></div>
  </div>
</div>
```

**NOTE for Knight:** Download is currently free/anonymous per existing Hugo flow. Founder must confirm whether to gate it at M20 or leave download free and only show join as an invitation. If Founder confirms free-download-no-gate: omit the conditional; just add a join invitation panel alongside. The routing infrastructure in Blocks 1–2 is built regardless.

---

## BLOCK 4 — JS Bootstrap on Success-Target Pages

### 4.1 `/download/?member_unlock=1` — Auto-Trigger Download

On `/download/` page, after `?member_unlock=1` is detected:

```typescript
const params = new URLSearchParams(window.location.search);
if (params.get("member_unlock") === "1") {
  // Set membership flag for future visits
  localStorage.setItem("lb_member", "1");

  // Auto-trigger download
  const version = params.get("version") ?? "";
  const downloadUrl = version
    ? `/* resolve download URL from version_trust.json for this version */`
    : document.getElementById("download-btn")?.getAttribute("href") ?? "";

  if (downloadUrl) {
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Clean URL (optional UX — remove query params after triggering)
  window.history.replaceState({}, "", "/download/");
}
```

### 4.2 `/order/{ref}/?member_unlock=1` — Resume Order Checkout

```typescript
if (params.get("member_unlock") === "1") {
  localStorage.setItem("lb_member", "1");

  // Resume order — signal to order island that membership is now confirmed
  const orderRoot = document.getElementById("mnemo-order-root");
  if (orderRoot) {
    orderRoot.dataset.memberUnlocked = "1";
    // Order island reads this flag and advances to payment step
  }

  window.history.replaceState({}, "", window.location.pathname);
}
```

### 4.3 `/pathways/?just_joined=1` — Welcome Overlay

```typescript
if (params.get("just_joined") === "1") {
  localStorage.setItem("lb_member", "1");

  // Show subtle welcome overlay
  const overlay = document.getElementById("welcome-overlay");
  if (overlay) {
    overlay.classList.add("visible");
    // Animate in, auto-dismiss after 4 seconds or on user click
    setTimeout(() => overlay.classList.remove("visible"), 4000);
  }

  window.history.replaceState({}, "", "/pathways/");
}
```

**Welcome overlay markup (minimal, in `/pathways/` Hugo template):**
```html
<div id="welcome-overlay" class="welcome-overlay" aria-live="polite">
  <span>Welcome to the cooperative.</span>
</div>
```

---

## BLOCK 5 — Empirical Smoke

Bishop verifies each door after Knight deploys. Knight documents curl commands in session notes.

### Smoke Checklist

| Test | Command / Action | Expected |
|---|---|---|
| S1 — Direct door checkout | `curl -X POST .../create-membership-checkout -d '{"successUrl":"https://lianabanyan.com/pathways/?just_joined=1"}'` | Stripe session URL contains correct success_url |
| S2 — Download door checkout | Same with download success URL | Stripe session URL contains download success_url |
| S3 — Stripe redirect (browser) | Complete test payment via Direct door | Lands on `/pathways/?just_joined=1` |
| S4 — Stripe redirect (browser) | Complete test payment via Download door | Lands on `/download/?member_unlock=1` |
| S5 — Auto-download trigger | Load `/download/?member_unlock=1` in browser | Download dialog fires automatically |
| S6 — Cancel returns to door | Cancel Stripe checkout from Download door | Returns to `/download/` |
| S7 — Default fallback | Load `/join/success/` directly (no door context) | Celebration page renders correctly |
| S8 — Data attribute injection | Inspect DOM of `/download/` page | `data-door="download"` present on `mnemo-join-root` |

---

## VERIFICATION GATES

| Gate | Condition | Pass |
|---|---|---|
| T1 | Direct door: Stripe success_url = `lianabanyan.com/pathways/?just_joined=1` | |
| T2 | Download door: Stripe success_url = `mnemosynec.org/download/?member_unlock=1&version=X` | |
| T3 | Order door: Stripe success_url = `mnemosynec.org/order/{ref}/?member_unlock=1` | |
| T4 | Invite door: success_url = `lianabanyan.com/welcome/?inviter={uid}` (stub OK if invite system TBD) | |
| T5 | Bounty door: success_url = `lianabanyan.com/bounty/{id}/?member_unlock=1` (stub OK) | |
| T6 | Crown door: success_url = `lianabanyan.com/welcome/?crown={id}` (stub OK) | |
| T7 | Default fallback: no door context → `/join/success/` | |
| T8 | Auto-download fires on `/download/?member_unlock=1` without user click | |

---

## OUT OF SCOPE — M20

- **Crown letter customization**: per-Crown custom welcome content is a separate dispatch. M20 wires the routing slot; Crown welcome page content is a future Marathon.
- **Bounty system**: the bounty surface itself (listing, claim flow) is a separate dispatch. M20 wires the door routing primitive.
- **Invite system**: inviter profile + welcome message surface is a separate dispatch.
- **Download gate decision**: whether to gate download behind membership is a Founder call. M20 builds the mechanism; the policy is confirmed by Founder before Knight enables the gate.

---

## RATIFICATION GATES

| Gate | Condition |
|---|---|
| R1 | Founder confirms `/pathways/?just_joined=1` as correct Direct door destination |
| R2 | Founder confirms whether `/download/` is gated (join required) or free (join invited but not required) |
| R3 | Founder confirms `version_trust.json` version field name for download URL construction |
| R4 | Founder confirms `/join/success/` celebration page remains for direct-nav-with-no-door-context (default fallback) |
| R5 | Bishop empirical smoke S1–S8 all pass before M20 is closed |

---

## OPEN QUESTIONS FOR FOUNDER (pre-Knight wake)

1. **Download gate policy**: is `/download/` gated behind membership, or is download free with a join invitation panel alongside?
2. **`/pathways/` welcome overlay**: simple text "Welcome to the cooperative." or something more specific?
3. **Invite door**: when invite system lands, should the welcome page show the inviter's name/avatar? Placeholder wired in M20 as `?inviter={user_id}`.

---

*Marathon 20 — Composed by Sonnet 4.6 SEG · BP091 · 2026-06-22*
