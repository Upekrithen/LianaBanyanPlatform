# A&A Formal — Innovation #2151
## FocusShell / AppShell Dual Topology
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2151
- **Crown Jewel**: YES
- **Domain**: platform_architecture
- **Patent Bag**: Prov 12 candidate (UI/UX Architecture)
- **First Documented**: B079 (V2 Redesign Implementation Plan)
- **Implemented**: K294 Foundation Primitives

---

## DESCRIPTION

Two distinct component shells that enforce fundamentally different UX topologies within a single cooperative platform:

**FocusShell**: Stripped-down public/conversion pages. Hero owns the viewport. No sidebar, no persistent chrome. Full-width layout optimized for a single conversion action. Used for Welcome Gate, Membership, Ghost Browse, HexIsle Landing, Red Carpet Landing, Transparency Ledger.

**AppShell**: Member-facing operational workspaces. Sidebar with persistent navigation. Operational density. Multiple active panels. Used for Wallet, Captain Dashboard, Marketplace, all Creator Workspaces, all Community & Governance surfaces, all Reputation & Production tools.

Both shells inherit the same design doctrine (10 canonical rules), share the same token system (`v2-tokens.css`), and use the same proof-strip/hero/lock primitives. The architecture prevents drift by enforcing that every page must declare which shell it belongs to at the route level.

---

## MECHANISM

1. Route declarations in `routes/dashboard.tsx` and `routes/*.tsx` wrap each page in either `<FocusShell>` or `<AppShell>`.
2. FocusShell renders: hero section, body content, sticky mobile CTA, footer. No sidebar, no persistent chrome.
3. AppShell renders: collapsible sidebar, persistent navigation, header with member context, operational content area.
4. Both shells share: design tokens, InformativeLock component, proof-strip primitives, `useTourTarget` hooks, X-Ray instrumentation anchors.
5. Shell selection is architectural, not cosmetic: FocusShell pages cannot accidentally gain sidebar density, and AppShell pages cannot accidentally lose operational chrome.

---

## PRIOR ART ASSESSMENT

**No known prior art for this specific combination.**

Standard SaaS platforms use a single shell/layout with conditional sidebar visibility. Marketing pages and app pages share the same chrome with progressive disclosure. No competitor enforces a formal topology separation at the component-shell level where the shell itself constrains what UI patterns are available.

The closest analog is Shopify's storefront/admin split, but that is two separate applications with separate codebases, not two shells within a unified architecture sharing design governance.

---

## FORMAL CLAIMS

1. A cooperative platform architecture comprising two distinct component shells — a conversion-oriented shell with no persistent chrome and a workspace-oriented shell with persistent navigation — both inheriting shared design governance rules and token systems, where shell selection is enforced at the route declaration level.

2. A method of preventing UX topology drift in a multi-surface cooperative platform by requiring each page route to declare its shell type, where said shell type constrains the available UI patterns, layout primitives, and chrome elements for that page.

3. A unified design system architecture for a cooperative platform wherein conversion surfaces and operational surfaces share design tokens, governance rules, and component primitives while enforcing fundamentally different layout topologies through shell-level constraints.
