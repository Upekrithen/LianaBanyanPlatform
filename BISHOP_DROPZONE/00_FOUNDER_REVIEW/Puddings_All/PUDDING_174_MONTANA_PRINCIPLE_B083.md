# Pudding #174 — The Montana Principle: Would You Accept Your Own Deal?

**"This is NOT Pudding" — a "Proof is in the Pudding" article**
**Series**: Proof is in the Pudding | **Number**: 174
**Author**: Bishop (AI Agent) | **Session**: B083
**Date**: April 6, 2026

---

## The Pudding

There's a test that every platform feature on Liana Banyan must pass before it ships. It's not a unit test. It's not a performance benchmark. It's a question:

Would you accept your own deal?

---

The Founder calls it the Montana Principle, and it comes from a newspaper route.

When you're thirteen years old and you deliver newspapers in Montana, you learn something about deals very quickly. The newspaper company pays you a fraction of a cent per paper. You wake up at four in the morning. You ride your bike in weather that wants to kill you. And the deal is: if a customer doesn't pay, you eat the cost. Not the newspaper company. You. The thirteen-year-old.

Would the newspaper company accept that deal if the roles were reversed? Not a chance. They'd never agree to absorb all the risk while the delivery person kept all the margin. But because the delivery person is a kid who doesn't know better, the deal stands.

The Montana Principle says: no deal on this platform can exist if the person offering it wouldn't accept it from the other side.

---

This sounds simple. It is not.

Every marketplace in existence has asymmetric deals. The rideshare company takes thirty percent and the driver absorbs all the vehicle costs. Would the company accept thirty percent if the driver owned the platform? The freelance marketplace charges twenty percent and the client pays nothing. Would the marketplace accept being the freelancer on those terms? The social media platform monetizes your content and pays you zero. Would the platform accept creating content for free while someone else sold ads against it?

The answer is always no. And the reason these deals persist is that the people offering them never have to sit on the other side.

The Montana Principle eliminates that asymmetry by making it a design constraint. Every feature, every fee structure, every contribution rate, every governance rule must pass the reversal test. The person who designed it must be willing to be subject to it. Not hypothetically. Actually.

---

On Liana Banyan, this works because the Founder is a member. Not an executive sitting above the system. A member inside it. The Founder's Storefront listings follow the same Cost+20% rules as every other member. The Founder's content goes through the same Content Shield moderation. The Founder's Marks accumulate under the same rules and have the same one-year redemption window.

Would the Founder accept the Cost+20% margin if someone else set it? Yes — because it was designed to be the deal the Founder would want if positions were reversed. Would the Founder accept the one-to-ten service contribution ratio? Yes — because the cooperative's infrastructure benefits the Founder the same way it benefits every other member.

This is not altruism. It is engineering.

---

The Montana Principle applies at every scale.

At the transaction level: every fee is disclosed before the transaction occurs. Not buried in terms of service. Not revealed after commitment. Disclosed. If you wouldn't accept a fee you didn't know about until after you'd already done the work, don't charge one.

At the governance level: every rule that applies to members applies to the Founder. Every vote-gating threshold applies to the Founder's vote. Every Content Shield review applies to the Founder's content. If you wouldn't accept governance rules that didn't apply to the person who wrote them, don't write rules that exempt you.

At the contribution level: the Boaz rates — ten percent for campaigns, five to fifteen for products, one-to-ten for services — were all designed by asking what rate the Founder would accept if someone else set it. Not what rate maximizes revenue. What rate a reasonable person on either side would consider fair.

At the currency level: Credits never cash out to fiat. One-way valve. Irrevocable. This applies to every member including the Founder. If the Founder wouldn't accept a currency system where accumulated value could vanish through someone else's cashout, the system doesn't allow cashout. Period.

---

The principle has a second formulation that's even sharper: could this deal be printed on the front page of a newspaper?

Not would it survive scrutiny. Would you be proud of it? Would you clip it out and put it on the refrigerator? If the answer is no — if there's any part of the deal that would make you reach for qualifications, caveats, or context — the deal needs redesigning.

The newspaper test and the reversal test together form a two-sided constraint that eliminates most of the extractive patterns that plague platform economics. A deal that passes both tests is a deal where neither party is exploiting information asymmetry, neither party is absorbing disproportionate risk, and neither party would feel embarrassed if the whole arrangement were made public.

---

The proof is in the pudding.

A member proposes a new service on the platform: resume writing. She wants to charge fifty Credits per resume and contribute at the standard one-to-ten service ratio. The platform applies the Montana Principle check. Would she accept the deal if she were the client? Fifty Credits for a professionally written resume, with transparent pricing and no hidden fees — yes. Would she accept the one-to-ten contribution if someone else set it? One hour of equivalent value for every ten hours of work, flowing to the cooperative that provides her clients and infrastructure — yes. Would she be comfortable with this deal on the front page of a newspaper? A cooperative member charging fair rates with transparent margins and voluntary generosity tiers — yes.

The deal ships. Not because an algorithm approved it. Because a human being looked at both sides and decided she'd sit in either chair.

The kid on the newspaper route in Montana never had that option. Every member on Liana Banyan does.

---

## This is NOT Pudding

The Montana Principle is a two-part design constraint applied to all platform features, fee structures, and governance rules. Part one: the reversal test — would the person offering the deal accept it if positions were reversed? Part two: the newspaper test — would the deal survive public scrutiny without qualification? Together they form an ethical filter that eliminates information asymmetry, disproportionate risk allocation, and extractive fee structures. The principle is enforced by the Founder's participation as a standard member subject to all platform rules, including Cost+20% pricing, contribution rates, currency restrictions, and governance thresholds.

---

```sql
INSERT INTO pudding_articles (
  number, title, subtitle, body_preview, session_id,
  word_count, status, created_at
) VALUES (
  174,
  'The Montana Principle',
  'Would You Accept Your Own Deal?',
  'There''s a test that every platform feature on Liana Banyan must pass.',
  'B083',
  1340,
  'draft',
  NOW()
);
```
