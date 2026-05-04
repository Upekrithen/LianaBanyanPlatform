---
title: "LB Elves Guild"
description: "Red/Blue Team Competition — Friendly-Cohort Variant. Bushel 25 seed stub. Full competition scoreboard and per-team IP Ledger stamping land in Bushel 27."
date: 2026-05-03
bushel: "Bushel 25 seed → Bushel 27 full surface (BP022)"
status: "seed-operational"
platform_route: "/helm/lb-elves"
guild_class: "cross-cutting"
tags: ["lb-elves-guild", "red-team", "blue-team", "ip-ledger", "marks", "guild", "competition"]
---

# LB Elves Guild

The LB Elves Guild is a **friendly-cohort variant** of the Red/Blue Team competition framework. Members choose a team at enrollment and earn Marks + IP Ledger stamps for every verified find (Red Team) or harden (Blue Team).

## Bushel 25 Seed Status

This Bushel 25 delivery seeds the LB Elves Guild infrastructure:

- `lb_elves_guild_membership` table — enrollment, team assignment, rank tracking
- `red_blue_competition_event` table — schema stub for event tracking
- `/helm/lb-elves` — enrollment surface (this page's platform route)
- Cross-Guild enrollment gate (Code Breakers Corps + LB Elves Guild co-enrollment)

**Full competition scoreboard and per-team IP Ledger stamping arrive in Bushel 27.**

## Two Teams

**Red Team — Finders**
Offense class. Find security vulnerabilities, surface undocumented platform gaps, identify canon drift before it compounds. Each verified find earns Marks + an `ip_ledger_stamp` with `stamp_class = red_blue_find`.

**Blue Team — Defenders**
Defense class. Harden the platform against each Red Team find — author canonical defenses, close vulnerabilities, extend the defense-canonical-list. Each verified harden earns Marks + an `ip_ledger_stamp` with `stamp_class = red_blue_harden`.

## Cross-Guild Composition

Members enrolled in LB Elves Guild may also enroll in **Code Breakers Corps** (Standing Security Bounties, `/helm/code-breakers`). Guild federation canon: Guilds compose, they do not exclude.

## What Arrives in Bushel 27

- Full Red/Blue Team competition scoreboard (live event tracking)
- Per-team-event IP Ledger stamping (find class + harden class)
- Team scoring metrics + cumulative leaderboard
- Cross-team find/harden event composition
- Marks payout per event type (scaled by severity class)

---

*Bushel 25 seed stub · Full surface in Bushel 27 · BP022 · LB Orchestra Librarian umbrella*
*Composes with: Bushel 25 (Code Breakers Corps seed) · Public IP Ledger canon (BP016) · Red/Blue Team competition canon (BP021)*
