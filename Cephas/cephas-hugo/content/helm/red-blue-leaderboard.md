---
title: "Red / Blue Team Leaderboard"
description: "Live scoreboard for the LB Elves Guild Red/Blue Team Competition. Find exploits, harden defenses, earn Marks and permanent IP Ledger stamps."
date: 2026-05-03
bushel: "Bushel 27 (BP022)"
status: "operational"
platform_route: "/helm/red-blue-leaderboard"
tags: ["lb-elves-guild", "red-team", "blue-team", "ip-ledger", "marks", "competition"]
---

# Red / Blue Team Leaderboard

The Red/Blue Team Competition is the adversarial arm of the **LB Elves Guild** — the platform's member-run quality-assurance and defensive-hardening guild.

## Two Teams, One Surface, Zero Hidden Information

**Red Team — Finders** hunt for exploits, vulnerabilities, and bypass paths in the Liana Banyan platform substrate, cryptographic primitives, and AI-agent canon layer.

**Blue Team — Defenders** harden the platform against each Red Team find — authoring canonical defenses, closing vulnerabilities, and extending the defense-canonical-list that composes with the Slow Blade defense stack.

Both teams see each other's verified wins in real time. No hidden information. Every find drives a harden opportunity; every harden drives the next find. This is the **structural trust mechanism** built into the LB Elves Guild competition.

## IP Ledger Stamps — Permanent Attribution

Every verified win generates an immutable **IP Ledger stamp** (`ip_ledger_stamp` row):

- **Red Team finds**: `stamp_class = red_team_find` — canonical artifact includes reproduction steps + subclass
- **Blue Team hardens**: `stamp_class = blue_team_harden` — canonical artifact includes before/after defense diff
- **First-finder** and **first-hardener** markers are permanent and public
- Winners may author a **Pedestal contribution decree** on the canonical artifact (Mordecai-Esther composition class)

## Marks Payout — Per Win-Class Multiplier

| Event | Subclass | Tier | Multiplier | Base Marks |
|---|---|---|---|---|
| Find | Crypto Bypass | 5 | 3.0× | 100 |
| Find | Substrate Poisoning Attempt | 5 | 3.0× | 100 |
| Find | Eblet Tamper Bypass | 5 | 3.0× | 100 |
| Find | Reminder Scribe Rule Bypass | 5 | 3.0× | 75 |
| Find | Pheromone Corner Case | 4 | 2.5× | 50 |
| Harden | Crypto Defense Canonical | 5 | 3.0× | 100 |
| Harden | Substrate Poisoning Defense | 5 | 3.0× | 100 |
| Harden | Eblet Tamper Detection | 5 | 3.0× | 100 |
| Harden | Reminder Scribe Rule Tightening | 5 | 3.0× | 75 |
| Harden | Pheromone Fast Path Correction | 4 | 2.5× | 50 |

*Multiplier values subject to Founder Fire Code lock. Current values represent scaffolded recommendations.*

## Cross-Team Transparency

The scoreboard is **dual-team-visible by default**. Red Team sees Blue Team's defenses as they land; Blue Team sees Red Team's finds as they verify. A Blue Team member can claim a "harden" event on any verified Red Team find — composing both teams on the same canonical artifact.

## Anti-Collusion Gate

Members cannot be on both teams simultaneously. Team switches are time-locked (30-day default cooldown). This is enforced at the database level (foreign key constraint on `lb_elves_guild_membership.team_assignment`).

## Live Scoreboard

Visit the live platform surface: `/helm/red-blue-leaderboard`

- `/helm/red-blue-leaderboard/red` — Red Team detail + roster
- `/helm/red-blue-leaderboard/blue` — Blue Team detail + roster
- `/helm/red-blue-leaderboard/member/:member_id` — Per-member record, IP stamps, event history

---

*Bushel 27 · BP022 · LB Orchestra Librarian umbrella · CAI ◌ NotCents composite trademark*
*Composes with: Bushel 25 (LB Elves Guild seed) · Bushel 26 (Substrate-Compounding empirical fire) · Public IP Ledger canon (BP016) · Slow Blade defense stack (BP021)*
