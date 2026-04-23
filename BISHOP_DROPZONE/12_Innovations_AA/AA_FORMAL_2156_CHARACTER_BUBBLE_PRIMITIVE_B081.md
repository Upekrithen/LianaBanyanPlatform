# A&A Formal — Innovation #2156
## Character Bubble Primitive (Platform Voice Component)
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2156
- **Crown Jewel**: YES
- **Domain**: platform_architecture
- **Patent Bag**: Prov 12 candidate (Cooperative UX Patterns)
- **First Documented**: B080
- **Implemented**: B080 (DenkenBubble.tsx, used by DenkenAuthGate, BeaconBiteNudge, and available for all explanation surfaces)

---

## DESCRIPTION

A reusable character-voiced explanation component that serves as the universal "platform speaks to you" primitive. The component renders a dark-themed speech bubble with the platform mascot's icon, a title, message, optional helper text, and child content slots. It is designed to be used anywhere the platform needs to explain itself to a member:

- **Auth gates**: Character explains why sign-in is needed
- **Feature locks**: Character describes what members can do here
- **Empty states**: Character encourages first action
- **Permission walls**: Character explains governance requirements
- **Tutorial overlays**: Character walks through features
- **Beacon nudges**: Character introduces the beacon system

The key insight is that a cooperative platform should never present impersonal system messages. Every explanation comes from the platform's character voice, creating a consistent personality across all interaction surfaces.

---

## MECHANISM

1. `CharacterBubble` component (formerly DenkenBubble) accepts props: `title`, `message`, `helper`, `children`, `className`.
2. Renders: dark slate background (`bg-slate-800/95`), colored border (`border-cyan-500/30`), mascot icon, speech tail pointing toward mascot position.
3. Typography: title in `text-cyan-400 font-semibold`, message in `text-slate-300`, helper in `text-slate-400 text-xs`.
4. Children slot allows embedding forms, buttons, or interactive content within the speech bubble.
5. Composable: `CharacterAuthGate` wraps `CharacterBubble` with auth-specific logic. `BeaconBiteNudge` uses the same visual language. Any new explanation surface can use `CharacterBubble` directly.
6. The component enforces visual consistency: every platform explanation looks and feels like the same character speaking, regardless of context.

---

## PRIOR ART ASSESSMENT

**No known prior art for a universal character-voiced explanation primitive in cooperative platforms.**

Chatbots (Intercom, Drift) provide character-like help widgets but are conversational, not structural. Mascots (Duolingo's owl, GitHub's Octocat) appear in specific contexts but are not used as a universal explanation primitive across all platform surfaces. No platform uses a single character-voiced component as the standard rendering for auth gates, feature locks, empty states, permission walls, and tutorials simultaneously.

---

## FORMAL CLAIMS

1. A cooperative platform user interface component comprising a character-voiced explanation primitive that renders a mascot-identified speech bubble with structured content slots, said component serving as the universal rendering surface for authentication gates, feature locks, empty states, permission walls, and tutorial overlays, providing consistent character personality across all platform explanation surfaces.

2. A method of presenting platform explanations in a cooperative system comprising: rendering all system-to-member communications through a single character-voiced component with a consistent visual identity, wherein the component accepts contextual content describing the specific surface and renders it within a mascot-identified speech bubble, eliminating impersonal system messages across the platform.

3. A reusable user interface primitive for a cooperative platform comprising a character speech bubble with structured content slots for title, message, helper text, and interactive children, wherein said primitive is composable with authentication logic, feature-lock logic, tutorial logic, and empty-state logic to provide a unified character voice across all explanation contexts.
