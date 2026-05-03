---
name: Character-Voiced Progressive Auth Gate
description: Unified authentication system where a platform mascot character delivers contextual auth messaging through a speech bubble, with server-side email auto-detection eliminating the sign-in/sign-up choice and a 3D card-flip transition between flows.
type: aa_formal
innovation_id: "2155"
ratification_session: B081
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: true
wrasseTriggers:
  - character voiced auth gate
  - platform mascot authentication
  - auto-detect signin signup
  - aa formal 2155
  - 3d card flip auth transition
  - contextual gate messaging
  - cooperative character auth flow
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A Formal — Innovation #2155
## Character-Voiced Progressive Auth Gate
### Bishop B081 | April 5, 2026

---

## CLASSIFICATION

- **Innovation Number**: #2155
- **Crown Jewel**: YES
- **Domain**: membership, platform_architecture
- **Patent Bag**: Prov 12 candidate (Cooperative UX Patterns)
- **First Documented**: B080
- **Implemented**: B080 (DenkenAuthGate.tsx, ProtectedRoute.tsx, Auth.tsx)

---

## DESCRIPTION

A unified authentication system where a platform character (animal, insect, or chess piece mascot) delivers the entire auth experience through a single speech bubble interface. The system combines:

1. **Character voice**: All auth messaging comes from the platform mascot, not from generic form chrome. The character explains WHY authentication is needed in context: "To {action}, you'll need to sign in so we know it's you."

2. **Auto-detect flow**: A single email input field triggers a server-side RPC (`check_email_registered`) that determines whether the email belongs to an existing member or a new visitor. No "Sign In / Sign Up" toggle choice required from the user.

3. **3D card-flip transition**: When a new email is detected, the auth card performs a CSS 3D card-flip animation from sign-in to sign-up, making the flow feel like a natural conversation rather than a form-switching transaction.

4. **Context propagation**: The `gateContext` prop from `ProtectedRoute` stores the reason for the auth gate in `sessionStorage`, which the auth page reads and passes to the character speech bubble. The character's message is contextual to what the member was trying to do.

---

## MECHANISM

1. `ProtectedRoute` component intercepts unauthenticated navigation and stores `gateContext` in `sessionStorage` via `AUTH_GATE_CONTEXT_KEY`.
2. `Auth.tsx` renders `CharacterAuthGate` (formerly DenkenAuthGate) which reads context via `useAuthGateContext` hook.
3. Character speech bubble renders: title, contextual message incorporating `gateContext`, and a single email input with "Enter" button.
4. On email submission, `check_email_registered` RPC queries `auth.users` (SECURITY DEFINER function).
5. If email exists: password field reveals inline (sign-in flow).
6. If email is new: card performs 3D CSS transform (`rotateY(180deg)`) to sign-up face with name + password fields.
7. Sign-up face includes "Try Again" (flip back) and "Sign Up" (submit) actions.
8. All form controls use dark-themed styling matching the character's speech bubble aesthetic.
9. Graceful fallback if RPC is not deployed: defaults to sign-in flow with manual toggle.

---

## PRIOR ART ASSESSMENT

**No known prior art for character-voiced auth with auto-detect and card-flip.**

Standard auth patterns (Auth0, Clerk, Supabase Auth UI) use form-based sign-in/sign-up with tabs or separate pages. Some apps use conversational onboarding (Duolingo's owl), but none combine (a) character-voiced auth messaging, (b) server-side email auto-detection eliminating the sign-in/sign-up choice, (c) 3D card-flip transition, and (d) contextual gate messaging propagated from the protected route.

---

## FORMAL CLAIMS

1. A cooperative platform authentication system wherein a platform mascot character delivers contextual authentication messaging through a speech bubble interface, said system comprising server-side email detection that automatically determines sign-in versus sign-up flow without requiring user selection, and a visual card-flip transition between flows.

2. A method of contextual authentication in a cooperative platform comprising: intercepting unauthenticated navigation at a protected route, storing a description of the attempted action, rendering said description within a character-voiced speech bubble on the authentication page, and using server-side email lookup to automatically select the appropriate authentication flow.

3. A cooperative platform authentication interface comprising a character mascot speech bubble containing both sign-in and sign-up forms on opposite faces of a 3D-transformable card element, wherein the system automatically selects the appropriate face based on server-side email registration lookup, eliminating the requirement for users to choose between sign-in and sign-up flows.
