# PUDDING #154 — "The Two Shells"
## Bishop B082 | April 5, 2026
## Category: Platform Architecture | Tags: founder, kitchen, ghost, governance

---

## THE PROOF

Every platform you've ever used makes you do two things at once: figure out what it IS and figure out how to USE it.

That's because most platforms have one shell. One frame. One interface that somehow has to serve the person who just arrived AND the person who's been there for three years. The result is a compromise nobody asked for: the new user sees too many buttons, and the veteran can't find anything because the buttons keep moving to make room for the "simplified" onboarding.

We solved this by building two shells.

---

## THE PUDDING

**FocusShell** is what you see before you're a member. It's the front porch. One hero message. One decision. One viewport. No sidebar. No dashboard. No buttons for things you haven't earned yet. The entire visual vocabulary says: here's what this is, here's who it's for, here's one thing you can do right now. It's a conversion gate that respects the visitor enough to not overwhelm them.

**AppShell** is what you see after. It's the workshop. Sidebar navigation. Operational density. The tools you need, arranged where you need them. Your Helm. Your Bridges. The surfaces you've built or joined. AppShell assumes you know what you're doing here — because by the time you see it, you do.

This isn't a toggle. It's not a preference. It's an architectural constraint enforced at the route level. Every page on the platform is classified as FocusShell or AppShell when it's built. A developer can't accidentally put a sidebar on a conversion page. A designer can't accidentally strip the navigation from a workspace. The shell classification IS the design decision, and it's made once, at build time, not negotiated in real time by some algorithm trying to guess whether you're new.

Why does this matter? Because the alternative is what every SaaS company does: progressive disclosure as a euphemism for drip-feeding complexity until the user has clicked through enough modals to unlock the actual product. That model treats the interface as a funnel. Our model treats it as two rooms — one for arriving, one for working.

The front porch (FocusShell) follows a strict hero pattern:
- Eyebrow (what category this is)
- Headline (what it does, in human language)
- Body (why it matters, in three sentences or fewer)
- Primary action (one thing to do)
- Secondary action (one backup)
- Proof strip (the numbers — 83.3% creator keep, Cost+20% pricing floor, $5/year membership)

That proof strip appears on every FocusShell page. Not as marketing. As architecture. The same way a building code requires an exit sign, our design doctrine requires economic transparency on every conversion surface. You can't hide it. You can't move it to a FAQ. It's load-bearing.

The workshop (AppShell) follows a different rule: operational clarity. The sidebar groups your surfaces. The content area gives you room to work. Mobile gets a hamburger menu with the same hierarchy, not a stripped-down "mobile version" that removed half the features. One Helm, many Bridges. Your personal space is permanent; your project spaces multiply as your work grows.

Ten design rules are codified INTO the architecture:
1. FocusShell owns the viewport for conversion pages
2. AppShell owns the sidebar for workspaces
3. Hero pattern: eyebrow, headline, body, CTA, proof strip — every time
4. Never "upgrade," "premium," "unlock features" — informative locks only
5. Progressive disclosure follows action, not time
6. One focal element per viewport
7. Mobile-first: sticky bottom CTA after first scroll
8. Lock messages say "Members can do X here" — never punitive
9. Amber for overdue, not red. "Room to grow," not "Declining"
10. 83.3% and Cost+20% appear as trust anchors, not promotional flourishes

These aren't guidelines. They're component constraints. A developer who tries to render a punitive lock message will get an `InformativeLock` component that won't accept the copy. A designer who tries to use red for a negative state will find the design token doesn't exist. The rules are in the code, not in a wiki nobody reads.

Two shells. One porch, one workshop. Every visitor gets clarity. Every member gets capability. And neither one has to pretend to be the other.

---

## THIS IS NOT PUDDING

FocusShell/AppShell Dual Topology is Innovation #2151, classified as a Crown Jewel. The 10 codified design rules are Innovation #2152, also a Crown Jewel. Together they represent one of the largest architectural decisions in the V2 redesign — the decision that every surface on the platform must declare what it IS before it can be built.

The two-shell model is not novel in isolation — many frameworks separate "marketing" and "app" layouts. What makes it an invention is the enforcement: route-level classification, component-level constraint propagation, and a design doctrine that compiles into code rather than existing as documentation. The shell doesn't suggest behavior. It prevents the alternative.

---

## SPOONFULS (7)

1. "Every platform makes you figure out what it IS and how to USE it at the same time. We built two shells instead."
2. "FocusShell = front porch. AppShell = workshop. The shell is chosen at build time, not runtime."
3. "Our design doctrine has 10 rules. They're not guidelines — they're component constraints. The code won't let you break them."
4. "Lock messages say 'Members can do X here.' Never 'Upgrade to unlock.' The component won't accept punitive copy."
5. "83.3% creator keep and Cost+20% pricing appear on every conversion surface. Not as marketing. As architecture."
6. "No red for negative states. The design token doesn't exist. Amber for overdue. 'Room to grow' for decline."
7. "One porch, one workshop. Every visitor gets clarity. Every member gets capability."

---

## SKIPPING STONE

YES — "Two Shells" pairs with Paper: Cooperative UX Architecture / Design Democracy
Stone: "Most platforms have one shell. One frame that somehow has to serve the person who just arrived and the person who's been there for three years."

---

*Pudding #154 — "The Two Shells"*
*Innovation #2151 (FocusShell/AppShell) + #2152 (Design Doctrine)*
*~1,350 words*
