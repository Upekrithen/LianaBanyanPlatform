// K522.5: Insert "The To Blave Technique" anecdote into Supabase
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env vars
const sdsPath = join(__dirname, '../../Asteroid-ProofVault/LockBox/SDS.env');
const vars = {};
readFileSync(sdsPath, 'utf8').split('\n').forEach(l => {
  const m = l.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.+)$/);
  if (m) vars[m[1]] = m[2];
});

const SUPABASE_URL = 'https://ruuxzilgmuwddcofqecc.supabase.co';
const SERVICE_KEY = vars['SUPABASE_SERVICE_ROLE_KEY'];
const FOUNDER_ID  = '86380080-9d6e-41f3-b67f-27d39e6dc6f1';

const body_markdown = `**Smart/Poor Economic Wisdom (Filed B127, April 2026)**

*(In Princess Bride, "To Blave" means "to bluff" -- per Miracle Max. The To Blave Technique is the strategic bluff against market pricing logic: appear to pay less, get strategically equivalent or superior value through tier-selection, timing, or substrate-amplification.)*

### The Father's Used-Car Lesson

> "My Father taught me, through him doing it, that as a poor person you are better off to buy a used car. He loves to tell the story about how he got the cheapest used car in town. It was $200 and it was filled with water that bred mosquitoes in the back seat. So he took it back and got the SECOND cheapest car. It was NOT filled with water, and he could prove that anytime because he could see the road through the floor as he was driving.
>
> So I learned, to get a **MOSTLY dead** car (Princess Bride quote). If the car is MOSTLY dead, it can be brought back to life. So I buy used $5K to $8K cars that are about 8-12 years old, in pretty good shape. If I had the money, I would up it to 2-3 year old cars, since the real margin loss is driving off the lot for new cars.
>
> The point here is, often, the best deal is the one that is **two levels above cheapest**."

### The 7/10 Computer Rule

> "Like with computers, which I clearly value more than cars, **I always buy a 7/10**. Even when I bought and assembled the parts for myself -- it's 7/10 on parts -- because the newest and the brightest will be half that price in six months when the new one, and the one after that, drop.
>
> So then I wait a LITTLE longer, and then buy for **Cyber Monday** -- the Monday after Black Friday, because now the suppliers are left with what didn't sell. Black Friday means the day of the year most businesses move to the Black (meaning profit) from the Red (meaning debt on unsold assets). Every dollar sold after Black Friday is a dollar made, which means they have incentive to empty the warehouse.
>
> Follow me for more **Smart/Poor tips**."

### The Walking-For-Miles Principle

> "**1-2 levels above bare dirt free access is the way to go.** Sandals are WAY better than barefoot when you walk for miles, even if they aren't shoes or boots. Trust me."

### Why "To Blave" -- The Strategic Bluff

The Technique is structurally the bluff against the market's pricing logic:

- The market says: *cheapest = compromise; most expensive = best.*
- The To Blave Technique says: *cheapest is structurally compromised (mosquito water); most expensive depreciates fastest off the lot. The 7/10 is the equilibrium where structural margin meets pricing efficiency. You "bluff" the market by appearing to pay less than peer-pressure says you should, while actually getting strategically equivalent or superior value.*

### Empirical Validation: The K521 70B-Trails-8B Finding (B127, April 2026)

The principle generalizes from cars and computers to AI inference:

| Test | Model | Cathedral Lift |
|---|---|---|
| K511 (B126) | Llama 3.1 **8B** local CPU | **+80pp** |
| K521 (B127) | Llama 3.3 **70B** Together AI cloud | **+68pp** |

**The 70B trails the 8B by 12pp on the same corpus.** Bigger model does NOT guarantee bigger benefit. In substrate-amplified inference, the cheaper tier (8B) IS the 7/10. The 70B is the 10/10 that depreciates fastest off the lot. **The To Blave Technique applies to AI vendor-tier selection: pick the model two levels above bare-dirt free, pair with our cooperative substrate, get superior outcomes at fraction of premium-tier cost.**

This is also why the Five Dollar Stack works: $5/year cooperative membership + $5 vendor-starter (cheap-tier model) is the To Blave equivalent. Two levels above bare dirt. The structural margin is in the substrate, not the parameter count.

### Connection to Cardboard Boots

The Cardboard Boots paper warns against frugality at the wrong layer (Father's $200 mosquito car = bare-dirt-free, structurally compromised). The To Blave Technique is the constructive companion: how to be Smart/Poor without being Dumb/Poor.

- **Bare dirt (cheapest)**: Mosquito car. Free Groq tier with 6K TPM cap. Structurally compromised; you pay later.
- **One level up**: Second-cheapest car (could see road through floor, but no mosquitoes). Functional but rough.
- **Two levels up (the 7/10 / Sandals tier)**: 8-12 year used car, $5K-$8K. AI 8B model with substrate. Sandals for the long walk. **This is the To Blave sweet spot.**
- **Top tier (10/10)**: New car off the lot. Premium-tier 70B+ model. Loses value/relative-benefit immediately. Only worth it if the marginal premium is structurally necessary.

### Key Lesson

**Two levels above bare dirt is the way to go.** Mostly dead, not all dead -- mostly dead can be brought back. The market has Cyber Mondays; the cooperative has the Five Dollar Stack. **Bluff the pricing logic, not the value.**

*"Sandals are way better than barefoot when you walk for miles, even if they aren't shoes or boots."*

---

*Filed B127, K522.5. Liana Banyan Platform. Smart/Poor Canon.*`;

const payload = {
  author_id:         FOUNDER_ID,
  title:             "The 'To Blave' Technique",
  body_markdown,
  privacy_level:     'public',
  when_it_happened:  '2026-04-27',
  where_it_happened: 'Smart/Poor Canon — Founder Wisdom (B127)',
};

console.log('Inserting "The To Blave Technique" into Supabase anecdotes...');

const res = await fetch(`${SUPABASE_URL}/rest/v1/anecdotes`, {
  method: 'POST',
  headers: {
    'apikey':        SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=representation',
  },
  body: JSON.stringify(payload),
});

const data = await res.json();

if (Array.isArray(data) && data[0]) {
  console.log('INSERT OK:', JSON.stringify({ id: data[0].id, title: data[0].title, when: data[0].when_it_happened }));
} else {
  console.error('INSERT FAILED:', JSON.stringify(data).substring(0, 400));
  process.exit(1);
}

// Verify
console.log('\nVerifying...');
const verify = await fetch(
  `${SUPABASE_URL}/rest/v1/anecdotes?select=id,title,when_it_happened&order=id`,
  { headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Accept': 'application/json' } }
);
const rows = await verify.json();
console.log(`Total anecdotes now: ${rows.length}`);
rows.forEach(r => console.log(`  ${r.id}|${r.title}|${r.when_it_happened}`));
