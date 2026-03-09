/**
 * SHADOW MARKS CUE CARDS
 * ======================
 * Ready-to-mint cue card content for The Pantry's Shadow Marks system.
 * For use in Hofund Studio minting.
 */

export const SHADOW_MARKS_CUE_CARDS = [
  {
    id: 'shadow-marks-intro',
    title: 'Shadow Marks',
    subtitle: 'Seeds That Grow Into Real Marks',
    front: `🌱 SHADOW MARKS

Post a recipe in an empty category
→ Earn 50 Shadow Marks

Get 10 votes → They crystallize
No votes? They wither.

lianabanyan.com/pantry`,
    back: `What is Vesting?

Think of Shadow Marks like seeds you plant.
They need sunlight (community votes) to
grow into real plants (real Marks).

Without sunlight, they wither.
But once grown, they're yours forever.

Your recipe "Water Salt" earned 50 Shadow
Marks for being a French Elegant Dinner.
If 10 people vote for it, those 50 become
50 real MARKS — permanently yours.

But if nobody votes for "Water Salt"...
well, it withers. 🥀`,
    category: 'pantry',
    tags: ['shadow-marks', 'vesting', 'recipes', 'reputation'],
  },
  {
    id: 'escape-velocity',
    title: 'Escape Velocity',
    subtitle: '100 Votes = Permanent Protection',
    front: `🚀 ESCAPE VELOCITY

Your recipe reaches 100 votes?
It earns IP Ledger protection:

• SHA-256 hash (permanent record)
• Hot Pepper 🌶️ badge
• Cannot be removed
• +50 bonus MARKS

lianabanyan.com/pantry`,
    back: `IP Ledger Protection

When your recipe hits escape velocity:

🔐 Permanent SHA-256 hash recorded
   to the IP Ledger — immutable proof
   you created this recipe

🌶️ Hot Pepper badge displayed on
   your recipe forever

🛡️ Portfolio protection means the
   platform can NEVER remove it

✍️ Your attribution rights are
   locked permanently

💰 +50 MARKS bonus on top of any
   Shadow Marks you've earned

This is intellectual property protection
through community validation.`,
    category: 'pantry',
    tags: ['escape-velocity', 'ip-ledger', 'protection', 'recipes'],
  },
  {
    id: 'makers-tasters',
    title: 'Makers & Tasters',
    subtitle: '100 Makers : 1,000 Tasters',
    front: `🍳 MAKERS & TASTERS

MAKERS post recipes.
TASTERS order, cook, and vote.

Both earn rewards.
Both build reputation.
Quality decides who thrives.

First 100 Makers: 50 Shadow Marks
First 1,000 Tasters: 5 MARKS/order

lianabanyan.com/pantry`,
    back: `The 1:10 Ratio

For the system to work, we need
more people USING recipes than
creating them.

MAKERS (Recipe Creators)
• First 100 get 50 Shadow Marks
• Earn credits per recipe use ($0.05-$0.25)
• Lifetime cap: $500 per recipe
• Escape velocity → IP protection

TASTERS (Recipe Users)
• First 1,000 get MARKS per order
• Orders 1-100: 5 MARKS each
• Orders 101-500: 3 MARKS each
• Orders 501-1000: 1 MARK each

VOTING crystallizes Maker rewards
and builds YOUR reputation too.`,
    category: 'pantry',
    tags: ['makers', 'tasters', 'early-adopter', 'rewards'],
  },
  {
    id: 'category-bounties',
    title: 'Fill the Shelves',
    subtitle: 'Empty Categories Pay More',
    front: `📚 FILL THE SHELVES

Category Bounties:

EMPTY (0 recipes): 50 Shadow Marks
SPARSE (1-4): 30 Shadow Marks
GROWING (5-9): 15 Shadow Marks
ESTABLISHED (10-19): 5 Shadow Marks
FULL (20+): Standard credits only

Be the FIRST! 🏆

lianabanyan.com/pantry`,
    back: `Fair for Everyone

When you post to an empty category,
you earn 50 Shadow Marks.

BUT SO DOES EVERYONE ELSE who posts
to that same tier!

If 3 people all fill an empty shelf,
all 3 get 50 Shadow Marks.

The bounty only drops to the next
tier when the category actually
crosses the threshold.

Example:
• French Elegant Dinners: EMPTY
• You post recipe → 50 Shadow Marks
• Friend posts recipe → 50 Shadow Marks
• Now 2 recipes → still SPARSE tier
• 3rd person posts → 30 Shadow Marks`,
    category: 'pantry',
    tags: ['bounties', 'categories', 'shadow-marks', 'fairness'],
  },
  {
    id: 'vesting-decay',
    title: 'Vesting & Decay',
    subtitle: 'Use It or Lose It',
    front: `⏳ VESTING & DECAY

Day 0: Submit recipe → Shadow Marks
Day 3: Decay starts (no votes)
Every 4 days: -20% uncrystallized

10 votes: 100% crystallized
30 days: Fully expired if unused

Good recipes grow.
Bad recipes wither.`,
    back: `The Decay Schedule

CRYSTALLIZATION
Each vote locks in a portion of your
Shadow Marks permanently.

1 vote = 10% crystallized
5 votes = 50% crystallized
10 votes = 100% crystallized (done!)

DECAY (for uncrystallized only)
Day 3: Decay begins
Day 7: 20% gone
Day 11: 40% gone
Day 15: 60% gone
Day 30: Fully expired

IMPORTANT:
Crystallized marks NEVER decay.
Only unvalidated Shadow Marks wither.

The community decides what's worth keeping.`,
    category: 'pantry',
    tags: ['vesting', 'decay', 'crystallization', 'timeline'],
  },
  {
    id: 'platform-economics',
    title: 'How Money Flows',
    subtitle: 'Cost + 20% Explained',
    front: `💰 HOW MONEY FLOWS

$15 Meal Order:
├── Chef: $12.50 (83.3%)
└── Platform: $2.50 (16.7%)

From platform's share:
├── Recipe creator: $0.05-$0.25
├── Delivery worker: 83.3% of fee
└── Operations + initiatives

Can you buy your own meal? YES.
Platform still functions.`,
    back: `The 83.3% / 16.7% Split

LB takes 16.7% ONCE per transaction.
(Cost + 20% = 120% of cost = 16.7%)

SAME whether you buy from yourself
or someone else.

RECIPE CREATOR CREDITS
Base: $0.05 per use
Popular (100 votes): up to 5x ($0.25)
Lifetime cap: $500 per recipe
After cap: Badges instead of credits

YES, YOU CAN BUY YOUR OWN MEALS
• Platform still collects its share
• Aggregation still works
• You still earn recipe credits
• No "self-dealing" concern

This is by design.`,
    category: 'pantry',
    tags: ['economics', 'pricing', 'credits', 'platform'],
  },
] as const;

export type ShadowMarksCueCard = typeof SHADOW_MARKS_CUE_CARDS[number];
