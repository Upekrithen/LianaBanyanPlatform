# Guild Re-Entry Economic Model

**Status:** Implemented
**Date:** 2025-01-15
**Architecture:** Natural Barriers > Artificial Restrictions

## Core Principle

Use natural economic disincentives instead of artificial controls to manage guild membership stability while preserving user freedom.

## The Natural Barrier System

### What Happens When You Leave

When a member leaves a guild:
- **Existing stake is RETAINED** - converted to credits at current value
- **Guild benefits STOP** - no more profit sharing, reputation bonuses, or access
- **Skill levels REMAIN** - HexIsle progress and experience are permanent
- **Contracts IN PROGRESS** continue with existing terms

### Re-Entry Cost Structure

To rejoin a guild at the same tier/class:

```
Re-Entry Cost = (Total Stake for Level) - (Existing Stake from Previous Membership)
Payment Terms:
  - 33.3% upfront (due immediately)
  - 66.7% from future profits (auto-deducted from contract earnings)
```

**Example:**
- Left Journeyman Class 4 (had paid $500 total)
- Want to rejoin Journeyman Class 4 (requires $500 total)
- Re-entry cost: $0 (already paid)
- But lost time without guild benefits!

**Example 2:**
- Left Journeyman Class 4 ($500 paid)
- Guild evolved, now requires $750 for same level
- Re-entry cost: $250 difference
  - Pay $83.33 upfront
  - $166.67 from future earnings

### Why This Works

1. **Freedom with Consequence** - Can leave anytime, but costly to return
2. **Anti-Gaming** - Prevents flip-flopping between lone wolf and guild benefits
3. **Value Alignment** - Higher stakes = higher commitment = better guild quality
4. **Investment Protection** - Don't lose previous investment, just access to benefits
5. **Progressive Penalty** - Higher tiers = more painful to leave and return

### LB Benefits from Re-Entry

- **Immediate Cash Flow** - 33% upfront payment
- **Risk Mitigation** - Deferred payment reduces churn manipulation
- **Member Quality** - Natural selection of committed members
- **Administrative Compensation** - Covers cost of processing membership changes

## Implementation Details

### Database Schema

```sql
-- user_guild_progression table additions
ALTER TABLE user_guild_progression ADD COLUMN:
  - previous_stake_paid NUMERIC (stake from prior membership if rejoining)
  - reentry_debt NUMERIC (remaining balance owed from rejoining)
  - reentry_terms JSONB (payment schedule for deferred amount)
```

### UI Communication Requirements

When user attempts to leave guild, show:
- What you keep (stake as credits, skills, completed contracts)
- What you lose (profit sharing, reputation bonuses, guild access)
- Re-entry cost estimate (if stakes have changed)

When user attempts to rejoin, show:
- Current re-entry cost breakdown
- Payment terms (33% now, 67% later)
- Projected timeline to pay off deferred amount

## Philosophical Alignment

This model embodies LB's core principle: **Trust through transparency, not control through restriction.**

We don't artificially prevent people from changing their minds. We make the costs and benefits crystal clear, then let members make informed decisions.

The system naturally selects for:
- Thoughtful decision-making
- Long-term commitment
- Authentic engagement
- Member quality over quantity

---

**Related Documentation:**
- Guild Progression System
- Stake Payment Structure
- Member Reputation Economics
