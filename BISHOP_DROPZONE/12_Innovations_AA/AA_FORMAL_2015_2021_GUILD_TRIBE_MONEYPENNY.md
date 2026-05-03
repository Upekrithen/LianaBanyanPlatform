---
name: Guild and Tribe Formation with MoneyPenny Gatekeeper
description: Six cold start pathways including guild (professional) and tribe (personal community) formation with collective treasury, visual identity, benefit cascade, and governance, plus MoneyPenny as an AI receptionist performing four-tier triage for inbound communications.
type: aa_formal
innovation_id: "2015-2021"
ratification_session: B035
prov_filing_status: filed
prov_filing_target: 14
crown_jewel_class: false
wrasseTriggers:
  - guild tribe formation six cold start pathways
  - moneypenny gatekeeper ai receptionist
  - guild treasury tribe formation wizard
  - six pathways six production levels
  - inbound contact screening cooperative
  - guild tribe benefit cascade production system
  - aa formal 2015-2021
  - cooperative professional personal community formation
canon_eblet_pointer: null
cooperative_defensive_patent_pledge_2260_umbrella: true
---

# A&A FORMAL — Innovations #2015-#2021
## Guild + Tribe Formation + MoneyPenny Gatekeeper
**Bishop Session:** 035 | **Date:** March 27, 2026 | **Knight:** K133 (Guild/Tribe)
**Status:** K133 DEPLOYED | MoneyPenny Gatekeeper: DESIGN COMPLETE

---

### Innovation #2015 — Guild Formation (5th Cold Start Pathway)
**Type:** Production System
**Category:** Onboarding — Professional Association

**Description:**
The fifth cold start pathway. Professional associations with shared treasury, visual identity, benefit cascade, and governance structure. A Guild is a professional community — plumbers, designers, bakers, developers — who band together for collective benefit.

Formation wizard (5 steps): Define → Banner → Recruit → Fund → Contest

Guilds have: slug-based URLs, icon/mascot/colors, treasury (Credits + reserve %), spending thresholds, activation requirements (minimum members), and design contest capability.

**Architecture (K133):**
- Guild columns: slug, icon_url, mascot_url, color_primary/secondary, theme_css, treasury_credits, treasury_reserve_pct, spending_threshold, activated_at
- `/guilds/create` — GuildFormationWizard (5-step protected route)
- `/guilds/:slug` — GuildDetail (banner, members, treasury, contests tabs)
- `/guilds/hub` — GuildHub (browse/search)
- Hooks: useGuilds, useGuild, useMyGuilds, useGuildMembers, useCreateGuild, useJoinGuild, useLeaveGuild

**Cooperative Significance:**
Guilds are how cooperatives scale professional identity. Instead of individual freelancers competing, Guild members collaborate — sharing resources, negotiating collectively, building shared reputation. The 5th pathway means a plumber doesn't need to start a business to enter the cooperative economy; they join a Guild.

**Key Rule:** MANY Guilds per member. Guild = professional. Not exclusive.

---

### Innovation #2016 — Guild Treasury
**Type:** Feature
**Category:** Financial Infrastructure — Collective Fund

**Description:**
Each Guild maintains a collective Marks pool funded by member contributions and earned through Guild activities. Treasury has a reserve percentage (minimum balance that can't be spent) and a spending threshold (votes required for expenditures above a certain amount).

**Architecture (K133):**
- group_treasury_transactions table: group_type, group_id, user_id, amount, type (contribution/withdrawal/reward/contest_prize), note, approved_by
- useTreasury hook: balance queries, contribution, spend requests
- Reserve enforcement: spending blocked if it would reduce balance below reserve %

**Connected Innovations:** #2015 (Guild Formation), #2018 (Guild Benefit Cascade)

---

### Innovation #2017 — Guild Visual Identity Stack
**Type:** Feature
**Category:** Visual Identity — Professional Branding

**Description:**
Guild banner, colors, typography, overlay preferences — all community-governed through the design contest system (#2014). Each Guild has a complete visual identity that renders on Guild pages, member profiles (Guild badge), and Guild-context interactions.

**Architecture (K133):**
- Guild columns: color_primary, color_secondary, theme_css, icon_url, mascot_url
- GuildDetail renders banner with gradient from primary/secondary colors
- Members display Guild badges on their Helm profiles

**Connected Innovations:** #2014 (Guild Banner Contests), #2013 (Tiered Theme Governance)

---

### Innovation #2018 — Guild Benefit Cascade
**Type:** Feature
**Category:** Membership — Tiered Benefits

**Description:**
Guild membership unlocks tiered benefits that cascade as the Guild grows:
- **5 members:** Group negotiating power (cooperative purchasing)
- **10 members:** Guild directory listing + search priority
- **25 members:** Treasury activation + design contests
- **50 members:** Reduced platform fees for Guild transactions
- **100 members:** Guild-exclusive marketplace section

**Cooperative Significance:**
Benefits cascade with collective size, not individual spending. This rewards RECRUITMENT and COMMUNITY BUILDING rather than personal consumption. A Guild of 100 plumbers has genuine market power that no individual plumber could achieve alone.

**Connected Innovations:** #2015 (Guild Formation), #2016 (Guild Treasury)

---

### Innovation #2019 — Tribe Mirror
**Type:** Architecture
**Category:** Community Structure — Personal Communities

**Description:**
Tribes mirror Guild structure but for personal/community contexts. Where Guilds are professional (plumbers, bakers, developers), Tribes are personal (families, neighborhoods, hobby groups, faith communities). The technical architecture is shared — treasury, visual identity, formation wizards, membership — but the context is different.

Family-type Tribes connect to the Family Table system (#1980), enabling shared meal planning, cookbook access, and scheduled orders for the household.

**Architecture (K133):**
- Tribes made independent (dropped guild_id NOT NULL requirement)
- Tribe columns: slug, tribe_type (family/neighborhood/hobby/faith/social/other), elder_id, banner_url, colors, treasury, family_table_id
- Tribe types determine which features are emphasized (family → Family Table, neighborhood → local campaigns, hobby → design contests)

**Connected Innovations:** #2020 (Tribe Formation), #1980 (Family Table Cookbook)

---

### Innovation #2020 — Tribe Formation (6th Cold Start Pathway)
**Type:** Production System
**Category:** Onboarding — Personal Community

**Description:**
The sixth and final cold start pathway. **Six pathways = six Production Levels.** A Tribe is a personal community — family, neighbors, interest group — who share resources, plan together, and support each other through the cooperative infrastructure.

Formation wizard (5 steps): Name → Invite → Table → Seed → Banner

**Architecture (K133):**
- `/tribes/create` — TribeFormationWizard (5-step protected route)
- `/tribes/:slug` — TribeDetail (banner, members, Family Table badge for family-type)
- Cold Start Hub updated with purple (Guild) and gold (Tribe) pathway cards

**Cooperative Significance:**
The Tribe pathway completes the cold start system. Now every type of human relationship has an entry point: professional work (Food/Manufacturing/Service/Local Business), professional association (Guild), and personal community (Tribe). The cooperative platform mirrors the full spectrum of human economic and social life.

**Key Rule:** MANY Tribes per member. Tribe = personal. Not exclusive.

---

### Innovation #2021 — MoneyPenny Gatekeeper
**Type:** Feature (Production System enhancement)
**Category:** Communication Infrastructure — AI Receptionist

**Description:**
MoneyPenny acts as a 4-tier AI receptionist for inbound contact screening. When someone not on the Founder's (or any Captain's) invite list wants to make contact, MoneyPenny intercepts, evaluates, and routes:

**Tier 1 — Known Contacts (Invite List):**
Route directly. No delay. MoneyPenny adds context notes ("Last conversation: March 15, re: partnership").

**Tier 2 — Recognized Names/Organizations:**
Priority flag + context summary. MoneyPenny researches the contact: "Robert Herjavec, Shark Tank investor, Herjavec Group CEO. Relevance: expressed interest in cooperative tech. Routing to Founder with PRIORITY tag."

**Tier 3 — Unknown but Relevant:**
Hold + assess + summarize. MoneyPenny reads the inbound message, determines relevance to current priorities, drafts a context brief, and queues for review. Response to sender: "Thank you for reaching out. Your message has been received and will be reviewed. You'll hear back within 48 hours."

**Tier 4 — Spam/Irrelevant:**
Polite decline, no routing. "Thank you for your interest. Unfortunately, we're unable to accommodate your request at this time."

**Architecture:**
- Inbound channels: email (moneypenny@lianabanyan.com), SMS (existing Twilio), Cephas contact form
- Classification: AI analysis of sender identity + message content + platform context
- Routing: priority queue with context notes attached
- Captain extension: any Captain can enable MoneyPenny gatekeeper for their own inbound contacts

**Cooperative Significance:**
MoneyPenny as gatekeeper is the original executive assistant vision made real. Every Captain — not just the Founder — gets an AI receptionist. This is a cooperative benefit that scales: as the platform grows, every leader gets the same communication infrastructure that Fortune 500 executives pay six figures for.

**FOUNDER NOTE:** Robert Herjavec was considered for Upekrithen LLC ONLY. Liana Banyan does NOT take VC. Ever. This is recorded in project_herjavec_upekrithen.md.

**Connected Innovations:** MoneyPenny SMS system, Star Chamber, #1963 (Captain System)

---

**Innovation Count after #2021:** 2,021
**Crown Jewels total:** 137
**Production Systems:** 27 LIVE
