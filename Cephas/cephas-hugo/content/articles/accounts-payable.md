---
title: Accounts Payable and Eligible Marks
date: 2026-03-28T00:00:00.000Z
author: Jonathan Jones
author_title: 'Founder & General Manager, Liana Banyan Corporation'
slug: accounts-payable
category: article
style: clean_academic
implementation_status: live
description: Effort-differential currency backs real economic value.
publication_type: article
supabase_synced: true
supabase_sync_date: '2026-04-27'
wrasseTriggers:
  - articles
  - accounts payable
  - cephas member content
  - accounts payable and eligible marks
  - article
---


<!-- Deploy to: Cephas/cephas-hugo/content/articles/accounts-payable.md -->


You built a cooperative. You created an internal currency so members can track work, fund projects, and keep value circulating inside the community instead of leaking out to Wall Street. Congratulations. Now someone at a meetup â€” or worse, someone with a law degree â€” asks the question that makes every cooperative founder's stomach drop:

*"Isn't that a security?"*

This article is about why the answer is no, how to make sure it stays no, and the surprisingly boring legal classification that protects you.

**This is not legal advice.** This article describes the legal architecture behind one cooperative's currency design. Your cooperative is not our cooperative. Talk to a securities attorney before you build anything. Seriously. We did.

---

## The Question Everyone Asks

Every cooperative that creates an internal currency hits the same wall. The SEC has broad authority to classify things as securities, and the definition of "investment contract" is wide enough to drive a truck through â€” or so it seems.

The landmark case is *SEC v. W.J. Howey Co.* from 1946. Orange groves in Florida. Investors bought plots, a management company tended them, investors got a share of the profits. The Supreme Court said: that's a security, regardless of what you call it.

The Howey test doesn't care what you name your currency. It cares what your currency does.

Since 1946, the SEC has applied Howey to everything from chinchilla farms to digital tokens. If your internal currency walks like an investment and quacks like an investment, the SEC will regulate it like an investment â€” and that means registration requirements, disclosure obligations, and accredited investor rules that will bury a $5/year membership cooperative before it starts.

So the question isn't academic. It's existential.

If your currency is classified as a security, you need to register it with the SEC or qualify for an exemption. Registration costs six figures. Most exemptions restrict you to accredited investors (people with $1M+ net worth). A cooperative built for working families cannot survive securities classification. The legal architecture isn't optional â€” it's the foundation.

---

## The Howey Test (And Why We Fail It â€” On Purpose)

The Howey test has four prongs. A transaction is an investment contract (a security) if someone:

1. Invests money
2. In a common enterprise
3. With an expectation of profits
4. Derived primarily from the efforts of others

All four must be present. We designed our currency â€” called Marks â€” to structurally defeat every single one.

**4 Howey prongs defeated**


### Prong 1: Investment of Money

Members earn Marks by working. Design a menu for a cooperative restaurant? You earn Marks. Deliver food? Marks. Photograph products for a storefront? Marks. Nobody writes a check. Nobody swipes a card. Marks emerge from the gap between work performed and compensation received â€” specifically, work on projects that haven't been funded yet.

The SEC has consistently held that "investment of money" means transferring value from the investor to the enterprise. With Marks, value flows the other direction: from the project to the worker. The member contributes labor, not capital.

You cannot buy Marks. Not with dollars, not with Credits, not with anything. There is no purchase mechanism. It doesn't exist in the code. It never will.

**Prong 1: defeated.**

### Prong 2: Common Enterprise

Common enterprise means either pooling investor funds together (horizontal commonality) or tying investor returns to the promoter's success (vertical commonality).

Every Mark has a provenance chain: this member, this project, this task, this date. Member A's Marks from Restaurant Project X are not mixed with Member B's Marks from Delivery Project Y. There is no pool. There is no commingled fund. Each Mark is an individually tracked obligation from the cooperative to one specific member for one specific piece of work.

When Marks are eventually redeemed for cash, that cash comes from the cooperative's operational budget â€” its 13.3% slice of platform transactions â€” not from other members' contributions. Nobody's Mark payout depends on somebody else's Mark balance.

**Prong 2: defeated.**

### Prong 3: Expectation of Profits

This is where most digital token projects die. Token holders expect the token to go up in value. That expectation of appreciation is an expectation of profit, and it triggers Howey.

Marks don't appreciate. One Mark always equals one dollar of labor value. When you redeem a Mark, you get compensation for work you already did â€” wages, not profits. You can also use Marks to fund your own projects (in-kind compensation) or to sponsor other members' projects (which earns you governance influence, not dividends).

Nobody has ever gotten rich holding accounts payable. That's the point.

No dividends. No interest. No capital appreciation. The value you receive is the value you put in with your own two hands, paid back when the project finds its footing.

**Prong 3: defeated.**

### Prong 4: Efforts of Others

Even if you squinted hard enough to see Prongs 1 through 3 (you can't), this one seals it. Members earn Marks through their own work. There is no passive earning. Nobody sits on a pile of Marks and watches them grow while other people sweat.

When a member uses Marks to sponsor another member's project, they earn SAA â€” Stewardship & Allocation Authority. SAA is the right to direct where cooperative resources go. It's a governance right, like a vote. The SEC has long distinguished governance rights from investment returns. One member, one vote is not a security. SAA extends that principle â€” weighting governance by demonstrated judgment rather than capital, but still governance at its core.

**Prong 4: defeated.**

**0 Howey prongs satisfied**


This isn't a close call. Marks fail all four prongs. The SEC would need to redefine "investment of money" to include labor, "common enterprise" to include individually tracked obligations, "expectation of profits" to include wages, and "efforts of others" to include doing the work yourself. That's not an enforcement action â€” that's a rewrite of 80 years of securities law.

---

## The One-Way Valve

Here is the single most important architectural decision in the entire system: cash flows in, but it never flows out.

**Cash â†’ Credits â†’ Cooperative Services**

Dollars convert to Credits (1:1). Credits circulate inside the cooperative. Credits buy goods, fund projects, compensate members. But Credits never convert back to dollars. The valve only opens one direction.

If your currency can be converted to cash, someone can argue it's an investment â€” buy low, sell high, profit. The one-way valve makes that argument structurally impossible. Credits are participation instruments: access to cooperative services, not claims on future cash flows. You can't speculate on something that has no exit ramp.

This isn't a policy. It's not a rule that some future board can vote to change. It's an architectural constraint â€” there is no function in the code that converts Credits to cash. No admin override. No emergency exception. The pathway doesn't exist, the same way your refrigerator doesn't have a "launch missiles" button.

You can't speculate on something that has no exit ramp.

---

## The Constitutional Margin Lock

The cooperative's margin is locked at {{platformMargin}}. That's constitutional â€” meaning it's embedded in the cooperative's founding documents, not in a policy manual that can be revised at the next board meeting.

**20% permanent margin cap ({{platformMargin}})**


If the cooperative itself can't generate increasing profits, the "expectation of profits" argument collapses from another angle entirely. Revenue can grow as more transactions flow through the system, but the per-transaction margin is permanently locked. There's no mechanism for the kind of unbounded profit growth that securities investors seek. Growth in volume, yes. Growth in margin, never.

The cooperative takes its 13.3% operational share (the cooperative's portion of that 20% margin) and uses it to run the platform. The rest goes to creators, stewards, and onboarders. The math is public. The cap is permanent.

---

## What Marks Actually Are

Strip away the cooperative jargon, and Marks are something every business accountant recognizes: **contingent accounts payable.**

### Standard Accounts Payable
- **Who's owed:** A vendor who delivered goods
- **What's owed:** Payment per invoice terms
- **When it's payable:** Net 30, Net 60, on delivery
- **How it's paid:** Cash, check, wire transfer

### Eligible Marks
- **Who's owed:** A member who performed work
- **What's owed:** Compensation for labor
- **When it's payable:** When the project receives funding
- **How it's paid:** Cash (LB Card), project funding (Commission), or governance authority (Sponsorship)

The cooperative incurred an obligation when the member did the work. That obligation is contingent â€” it becomes payable when the associated project gets funded. When funding arrives, the AP is settled through one of three channels.

Under UCC Article 9, eligible Marks function as **payment intangibles** â€” a right to payment not evidenced by a negotiable instrument. When a member uses their Marks to sponsor someone else's project, that's a **receivables assignment** â€” they're assigning their right to payment toward funding another project's bounties.

Receivables assignment is bread-and-butter commercial law. Subcontractors, construction firms, and consulting companies do this every day. It's governed by the Uniform Commercial Code, not the Securities Exchange Act. Boring? Absolutely. And that's the shelter.

This is the classification that protects you. Not "token." Not "coin." Not "credit" with a wink. Accounts payable. The most boring entry on a balance sheet â€” and the one that keeps the SEC out of your cooperative's business.

---

## Tax Time

Members always ask: when do I owe taxes on these things?

The answer comes from IRC Section 451, which says income is recognized when you have "constructive receipt" â€” meaning the money is available to you without substantial restriction.

No tax. The Mark represents work you did on an unfunded project. The cooperative has a contingent obligation, not a current one. There's no payment mechanism yet. You can't access the value. No constructive receipt, no taxable event.

Taxable. You've received compensation for services rendered. The cooperative reports it as 1099-NEC income, just like any independent contractor payment. Standard stuff.

Commission â€” funding your own project â€” may be reportable as in-kind compensation at fair market value. Sponsorship â€” earning governance authority â€” is a governance right, not income, and likely has no taxable event until (if ever) there's a realization event. Talk to your accountant about your specific situation.

Tax law changes. State rules vary. This is the general federal framework as of March 2026. Get a CPA who understands cooperative structures. This article is not tax advice any more than it is legal advice.

The clean version: if you take cash, you pay taxes on the cash, the same year you receive it. If you don't take cash, you probably don't owe anything yet. The cooperative handles the 1099 reporting.

---

## The Five Design Principles

If you're building a cooperative and thinking about creating your own internal currency, here are five principles that keep you on the right side of securities law. These aren't abstract theory â€” they're the structural rules baked into the Liana Banyan system.

### 1. Earn, Don't Sell

Your currency should be earned through labor. Never purchased with cash. The moment someone can buy your currency, you have an "investment of money" and Howey Prong 1 lights up.

### 2. Track Individually, Don't Pool

Every unit of currency needs provenance. Who earned it, on what project, when, for what work. If you pool currency into an undifferentiated fund, you've created horizontal commonality and Howey Prong 2 lights up.

### 3. Compensate, Don't Profit

Your currency should provide wages (cash for work done), project building (in-kind benefits), or governance rights (voting, allocation authority). It should never provide dividends, interest, or capital appreciation. If holders expect the value to go up, Howey Prong 3 lights up.

### 4. Require Effort, Not Investment

Every earning event should require the member's own labor. The moment you allow passive earning â€” "hold this currency and watch it grow" â€” Howey Prong 4 lights up.

### 5. Close the Loop

Build a one-way valve. Cash flows in, services flow out, but currency never converts back to cash. This eliminates investment characterization at the architectural level. Not by policy. Not by promise. By the absence of the function.

**The common thread:** each principle structurally defeats a Howey prong. Follow all five, and your currency isn't a close call â€” it's a clean miss. Not because you found a loophole, but because what you built genuinely isn't an investment. It's a payroll system with deferred eligibility.

---

## The Boring Classification That Saves You

The entire thesis of this article fits in one sentence: **cooperative work-credits are accounts payable, not investment contracts.**

That's it. That's the legal shelter. Not a novel theory. Not an aggressive interpretation. The most ordinary commercial classification on earth, applied to something cooperatives have been doing â€” compensating members for labor â€” for over a century.

The tools already exist. UCC Article 9 handles the receivables. IRC 451 handles the taxes. Standard AP accounting handles the books. You don't need new law. You need to recognize that the old law already covers you â€” as long as you build the architecture right.

Earn, don't sell. Track individually. Compensate, don't profit. Require effort. Close the loop.

Do those five things, and the next time someone at a meetup asks "Isn't that a security?" you can smile and say:

"No. It's accounts payable."

---

## Ready to Join?

**[Walk the Red Carpet](https://lianabanyan.com/red-carpet)**: Your cooperative membership starts here. $5/year.

---

*Jonathan Jones is the founder of Liana Banyan Cooperative and a U.S. Army National Guard veteran of no particular note. This article draws from the academic paper "Accounts Payable, Not Securities: The Legal Architecture of Eligible Marks in Cooperative Platform Economics" (Jones, 2026). The eligible Mark system is Innovation #1911, part of a portfolio of 1,935 documented innovations. This article is educational. It is not legal, tax, or financial advice. Consult qualified professionals before building anything.*

---

*Liana Banyan Corporation: What we build together, we own together.*

*FOR THE KEEP.*
