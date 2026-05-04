# DRAFT — Terms of Service clause: Prohibition on External Use of LB Credentials

**Purpose:** Closes Pawn red-team vector **C.1 (LB Affinity Facade)** — verified LB credentials weaponized as social-proof in external fraud.

**Status:** Bishop scaffold for Founder + counsel review. Legal text needs counsel-finalization before publication.

**Where it lives:** Inserted into `platform/legal/terms_of_service.md` § "Member Conduct"; member onboarding flow surfaces a plain-language version at first login; Helm Settings → "Membership Use" displays the canonical text.

**Pairs with:** Pawn report B119 → C.1; project_slow_blade_architecture_v2.md (B124 update) → countermeasure #1; project_rhetorical_keystones.md → #41 *"A good name is rather to be chosen than great riches"* (the architectural backing for why this clause exists at all).

---

## DRAFT CLAUSE TEXT (counsel-review pending)

### § X.Y — Prohibited Use of Liana Banyan Membership Credentials

**X.Y.1 — Scope of Prohibition.** Members shall not use, display, or reference their Liana Banyan membership, Furnace-verified badges, XP × Reputation scores, Trust Match bonds, Pedestal participation, Crown Jewel attribution, or any other Liana Banyan-issued credential ("LB Credentials") as evidence of trustworthiness, legitimacy, accreditation, or financial standing in any transaction, solicitation, or communication that occurs **outside the Liana Banyan Corporation platform** ("Off-Platform Activity").

**X.Y.2 — Specifically Prohibited Off-Platform Activities.** Without limiting the generality of X.Y.1, the following constitute prohibited Off-Platform Activities:

(a) **Investment solicitation.** Soliciting, offering, or facilitating any investment, loan, equity participation, security, or financial instrument in any venture not formally registered with Liana Banyan Corporation, while referencing LB Credentials as evidence of the soliciting party's trustworthiness or financial discipline.

(b) **External commercial transactions.** Selling, marketing, or promoting goods or services in venues not operated by Liana Banyan Corporation (including but not limited to: third-party marketplaces, social media advertising, classified-ad platforms, direct outreach campaigns) while referencing LB Credentials as evidence of seller reliability or product quality.

(c) **Donation or fundraising solicitation.** Soliciting donations, charitable contributions, crowdfunding pledges, or political contributions for any cause not formally endorsed and registered with Liana Banyan Corporation, while referencing LB Credentials as evidence of the soliciting party's character, trustworthiness, or stewardship capacity.

(d) **Quasi-professional credentialing.** Holding out LB Credentials as functionally equivalent to professional licensure, regulatory accreditation, fiduciary capacity, or any other credential issued by an accredited professional or governmental body.

**X.Y.3 — Permitted References.** Members MAY reference their LB Credentials in the following Off-Platform contexts without violating X.Y.1:

(a) **Personal biography.** Including LB membership in a personal résumé, professional biography, social media profile, or similar contexts where the membership is named alongside other affiliations and not used as transactional trust signal.

(b) **Educational and informational discussion.** Discussing the Liana Banyan platform, its cooperative-economic principles, its empirical research, or the member's own experience as a member, in journalistic, academic, public-discourse, or social contexts where no Off-Platform transaction is being solicited or facilitated.

(c) **Inter-member networking.** Identifying oneself as an LB member to other LB members in private communications, including communications that originate or terminate outside the LB platform, provided no Off-Platform transaction is solicited.

(d) **Linking to public LB content.** Sharing links to publicly accessible LB content (Cathedral pages, op-eds, member dashboards intended for public sharing) in Off-Platform contexts.

**X.Y.4 — Why This Matters.** The Liana Banyan platform's defense architecture (the Slow Blade V2 stack, including the Furnace verification engine, Trust Match staking, Six Sparks acceleration paths, and the Good Standing Roll) protects members and counterparties **within the Liana Banyan platform**. The architecture does not extend protection to Off-Platform Activities. A member who uses LB Credentials to lower a non-member's guard for an Off-Platform transaction is exploiting the gap between within-platform protection and off-platform jurisdiction. This pattern — known as "affinity facade" — is documented by the U.S. Securities and Exchange Commission and the North American Securities Administrators Association as a class of fraud that disproportionately harms communities whose trust is otherwise well-deserved. Liana Banyan Corporation explicitly rejects this exploitation pattern and prohibits it as a condition of continued membership.

**X.Y.5 — Enforcement.** Violations of X.Y.1 or X.Y.2, when reported to Liana Banyan Corporation by an affected non-member or by another member, will be evaluated by the Member Conduct Review process (described in § Z). Confirmed violations may result in:

(a) Removal of LB Credentials from the violating member's account (loss of Furnace-verified status).
(b) Forfeiture of staked Marks, Credits, and/or Joules in active Trust Match bonds.
(c) Suspension or termination of membership.
(d) In cases involving substantive financial harm to non-members, referral to relevant law-enforcement or regulatory bodies.

**X.Y.6 — Member Education.** Liana Banyan Corporation shall provide members, at first login and on annual reaffirmation, plain-language education materials explaining (a) what affinity facade is, (b) why this prohibition exists, and (c) examples of permitted vs. prohibited use of LB Credentials. The Member Conduct Review process is community-anchored, not adversarial; the goal is to maintain the *good name* of the cooperative for the benefit of all members and the publics with whom they interact.

---

## NOTES FOR COUNSEL REVIEW

1. **Jurisdictional considerations.** Wyoming C-Corp; Member ToS likely governed by Wyoming law. Counsel should confirm enforceability of credential-revocation and stake-forfeiture remedies under Wyoming UCC and contract law.

2. **Federalism consideration.** Some of the affinity-facade harms (specifically X.Y.2(a) investment solicitation) intersect with state and federal securities law (Howey, Reves). LB members soliciting external "investments" while using LB Credentials may already be triggering securities violations independent of this ToS clause; the clause exists to make LB's institutional non-tolerance explicit and to give LB the contractual hook to revoke credentials before regulators arrive.

3. **First Amendment / free expression.** X.Y.3 deliberately preserves substantial space for members to discuss LB publicly, journalistically, and biographically. The clause prohibits specific *transactional uses* of credentials, not speech about LB membership generally.

4. **Anti-MLM language consistency.** The clause's structure intentionally aligns with LB's structural rule (per memory: *"Attribution is ONE LEVEL ONLY (not MLM)"*) — credentials don't cascade through external networks; they exist within the platform jurisdiction.

5. **Architectural anchor for clause text.** The phrase *"a good name is rather to be chosen than great riches"* (Proverbs 22:1; Founder voice keystone #41 ratified B124) is the architectural backing. Counsel may rephrase or omit; the principle holds whether or not the Scriptural anchor is stated in the legal text.

6. **Member onboarding surfaces.** The plain-language explainer at first-login should reference X.Y.4 verbatim or near-verbatim — members need to understand WHY before they accept the clause, not just be presented the legal text. Acceptance flow should require an active opt-in, not pre-checked consent.

---

## REFERENCES

- SEC affinity fraud guidance: https://www.sec.gov/investor/pubs/affinity.htm
- NASAA affinity fraud documentation: https://www.nasaa.org/investor-education/affinity-fraud/
- Pawn red-team report: `BISHOP_DROPZONE/00_FOUNDER_REVIEW/PAWN_REPORT_EXPLOIT_VECTORS_LB_B119.md` § C.1
- LB structural rule (one-level attribution): MEMORY.md / project_ip_load_balancing_v2.md

---

*Bishop scaffold draft B124. Counsel review and Founder finalization required before publication.*

— Bishop B124
