# Eblet: TASTE-MAKER + HOW-TO-HUB MANAGER
## Canonical Definition · BP071 · Scope 14–15

**Eblet ID:** `eblet_taste_maker_howto_hub_manager_bp071`
**Date:** 2026-06-02
**Author:** Knight (BP071 dispatch)
**Status:** Canon · Gadget-indexed

---

## TASTE-MAKER

**Definition:** A TASTE-MAKER is a creator (podcaster, influencer, curator, independent researcher, or domain expert) who owns a subscription channel on LianaBanyanPlatform. Supporters subscribe to the taste-maker's channel. The taste-maker earns revenue via the four-currencies pass-through.

**Channel class:** `channel_type = 'taste-maker'` in `excalibur_subscriptions`

**Revenue path:**
- Supporter pays to subscribe
- Platform retains Cost+20% (Structural Bylaw)
- Taste-maker earns via `excalibur_share_back_ledger` at 83.3% of the cost portion
- Payable in any of the four currencies: $ (USD) / Marks / Credits / Joules

**Key distinctions from Excalibur business slice:**
- A taste-maker's subscription channel is CREATOR-OWNED, not topic/slice-gated
- Taste-maker personally curates the channel content and earns on subscriber count
- No Excalibur 4-gate vetting required (that is for the data-licensing path)
- A taste-maker is essentially a cooperative-native podcast/newsletter creator

**Example:** A cooperative member who hosts a weekly "Smart Savings" podcast signs up as a taste-maker. Supporters subscribe for $5/year. The taste-maker earns 83.3% of the cost portion. The platform keeps 20%. The taste-maker can cash out in Marks (cooperative currency) to spend inside the platform, or in USD to an external account.

**Canonical references:** `excalibur_subscriptions.channel_type = 'taste-maker'` / BP071 / Scope 14

---

## HOW-TO-HUB MANAGER

**Definition:** A HOW-TO-HUB MANAGER is a localized per-area role -- analogous to the Founding-300 national program, but operating at the local/neighborhood level. The HOW-TO-HUB MANAGER curates and maintains the local How-To Hub surface, recruits local taste-makers, and earns via tips routed through the cooperative's four-currencies pass-through system.

**Revenue path:**
- Tips from local community members and taste-maker channels flow through `excalibur_share_back_ledger`
- Tips route to the manager's own `excalibur_subscriptions` account (their own subscription account IS their earning account)
- Payable in any of the four currencies: $ (USD) / Marks / Credits / Joules

**Schema:** `excalibur_subscriptions.manager_entity_id` references the managing member's `profiles(id)`

**Scope of role:**
- Per-area (one per neighborhood/city node, not national)
- Earns tips, not salary -- cooperative tip-funded model
- Their subscription account is their "wallet" for incoming tip routing
- They do NOT need to be Founding-300 to become a local HOW-TO-HUB MANAGER

**Relationship to taste-makers:**
- A taste-maker may ALSO be a HOW-TO-HUB MANAGER (they set up a local hub and curate it)
- A HOW-TO-HUB MANAGER can sponsor/feature local taste-maker channels through their hub
- The hub is the surface; the taste-makers are the content producers; the manager is the curator

**Canonical references:** `excalibur_subscriptions.manager_entity_id` / BP071 / Scope 14-15

---

## Four-Currencies Pass-Through (Reference)

LianaBanyanPlatform operates on four currencies:
1. **$** (USD) -- standard dollar payment, external payout via Stripe
2. **Marks** -- cooperative internal currency, earnable and spendable on-platform
3. **Credits** -- platform service credits (compute, storage, API calls)
4. **Joules** -- energy/sustainability credits (tied to cooperative datacenter participation)

Both taste-makers and HOW-TO-HUB MANAGERs can receive their earnings in any combination of these four currencies. The ledger always records in USD; the currency conversion happens at payout time per member preference.

---

## Eblet Fingerprint

- **canonical_ref:** `eblet_taste_maker_howto_hub_manager_bp071`
- **class:** `doctrine`
- **linked_refs:** `kn105_excalibur_class_commercial_subscription`, `bp071_taste_maker_subscription_class`
- **decay_class:** `anchor`

*Not charity. A way out. Everyone gets their shot.*
*BP071 / Knight / For the Keep x We Are Those Workers, Builders, Creators*
