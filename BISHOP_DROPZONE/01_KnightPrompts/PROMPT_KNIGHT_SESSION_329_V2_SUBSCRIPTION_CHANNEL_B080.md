# KNIGHT SESSION 329 — V2 Subscription Channel (AppShell)
## Bishop B080 | April 5, 2026 | Phase 6 page 3 of 6

**Spec source**: `BISHOP_DROPZONE/02_PawnPrompts/PAWN_BATCH_37_V2_PAGE_DESIGN_SPECS_PHASE_3C_PRODUCT_SPEC.md` § 3
**Depends on**: K294 Foundation. Innovation #2102 (Universal Member Subscriptions).
**Tracker row**: `Subscription Channel` (B37 batch)

---

## PAGE PURPOSE

Let subscribers preview a creator's premium channel, see the economics clearly, and subscribe using platform-native currency options (all 4: Marks/Credits/Joules/Dollars).

## ROUTE

`/subscription-channel/:slug` (AppShell). Public preview + post-auth subscribe.

## HERO SPEC (copy EXACTLY)

- **Eyebrow**: "Subscription Channel"
- **Headline**: "Support the creator directly, inside the cooperative"
- **Body**: "A Subscription Channel is the creator's premium home for exclusive posts, recurring updates, and member-backed publishing. Subscribers can preview the channel, choose how to subscribe, and see the economics clearly."
- **Primary CTA**: "Subscribe Now"
- **Secondary CTA**: "Preview Recent Posts"
- **Proof strip**: "Creator keeps 83.3%" · "All 4 currencies accepted" · "Cancel any time"

## SECTION FLOW

1. Hero with creator name + channel title
2. `ChannelPreviewPanel` — recent posts (public preview)
3. `SubscriptionEconomicsCard` — 83.3% creator keep + Cost+20% breakdown
4. `CurrencyOptionSelector` — Marks / Credits / Joules / Dollars
5. `SubscribeConfirmation` — "As You Wish" stamp
6. `SubscriberBenefitsRail`
7. `RecentSubscriberStories` (testimonials, opt-in only)

## CRITICAL DESIGN RULES

- **All 4 currencies accepted**: Marks · Credits · Joules · Dollars (TasteMaker integration per #2102)
- **83.3% / Cost+20% economics visible descriptively** in SubscriptionEconomicsCard
- **Preview access without auth** (hero + ChannelPreviewPanel public)
- **Subscribe requires auth** — gate downstream
- **"As You Wish" stamp** for subscribe confirmation

## COMPONENTS (build in `platform/src/components/v2/subscription-channel/`)

- `ChannelPreviewPanel.tsx` (public)
- `SubscriptionEconomicsCard.tsx` (descriptive)
- `CurrencyOptionSelector.tsx` (4 currencies)
- `SubscribeConfirmation.tsx` (As You Wish stamp)
- `SubscriberBenefitsRail.tsx`
- `RecentSubscriberStories.tsx` (opt-in)

## MOBILE

- Single-column preview
- Currency selector full-width
- StickyMobileCTA: "Subscribe Now"

## DATA

- Existing subscription tables + TasteMaker integration
- All 4 currency balances from existing wallet sources

## BANNED

- NO financial-returns framing
- NO "investment" / "yield" / "ROI"
- NO hiding the creator keep
- NO locking out public preview
- NO "upgrade/premium/unlock"
- NO LLC / CEO language

## ACCEPTANCE

- [ ] Route `/subscription-channel/:slug` wired
- [ ] Hero copy matches spec EXACTLY
- [ ] Public preview accessible without auth
- [ ] All 4 currencies selectable at subscribe
- [ ] Economics card shows 83.3% + Cost+20% descriptively
- [ ] Subscribe confirmed via "As You Wish" stamp
- [ ] `data-tour-target="subscription-channel"` + `data-xray-id` anchors
- [ ] `npm run build` passes; tracker K329 review; Librarian logged

## DO NOT

- Do not restrict preview behind auth
- Do not omit any of the 4 currency options
- Do not promote as investment

---

*Bishop B080 — Phase 6 page 3 of 6 — Subscription Channel*
*4 currencies. 83.3% creator keep. Public preview. As You Wish subscribe.*
*FOR THE KEEP!*
