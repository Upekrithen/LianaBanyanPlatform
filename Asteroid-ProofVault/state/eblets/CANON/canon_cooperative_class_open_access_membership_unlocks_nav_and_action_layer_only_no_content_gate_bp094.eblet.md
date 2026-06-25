# CANON: Cooperative-Class Open Access - Membership Unlocks Nav and Action Layer Only, No Content Gate (BP094 HARD CANON)

Founder direct BP094:
"I don't want a membership GATE, I want all users to get to go to all things, only invokes membership check when users try to do what only members can. So it is right to have no membership gate on that, I just want it to Add that Tab once you join."

BINDING RULE: ALL content on MnemosyneC and LianaBanyan properties remains visible and accessible to ALL users, authenticated or not, member or not.

Membership check fires ONLY when a user attempts to perform an action that is member-only (e.g. submit a swarm run, redeem Marks, access IP Ledger write-path).

Membership presence ADDS nav surface items (HEOHO, Battery Dispatch, My IP Ledger) to the user's nav. It does NOT remove or hide any existing nav item or content from non-members.

Implementation: MemberNav.tsx component checks mnemosynec_members row on mount. Appends nav items if member. Renders nothing extra if not member. No redirects. No route guards. No content gates.

Anti-pattern (FORBIDDEN): Do NOT add if (!isMember) return null gates to content components. Do NOT redirect non-members away from any page. Do NOT hide content behind membership walls.

BP094 HARD CANON. Composes with canon_member_modal_substrate_advantage_immediate_value_bp092.eblet.md.
