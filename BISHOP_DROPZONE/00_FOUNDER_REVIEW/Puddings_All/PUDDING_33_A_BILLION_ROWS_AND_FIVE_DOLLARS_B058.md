# Pudding #33: A Billion Rows and Five Dollars
## How a $5/Year Cooperative Plans for Planet-Scale Data

---

### At a Glance (~50 words)
At one million members, Liana Banyan's ledger tables will hold over five billion rows per year. The platform stores only metadata — no photos, no video, no large files — so the cost of storing a billion transactions is measured in gigabytes, not terabytes. Planning for that scale starts now.

---

### More Info (~300 words)

Every platform that handles money needs a ledger. Every Mark earned, every Credit spent, every attribution chain event, every ADAPT score measurement — it all gets recorded. At a thousand members, that's five and a half million rows per year. At a million members, five and a half billion.

Most platforms solve this by throwing money at the problem. Bigger servers. More replicas. Managed services that charge by the row. The bill scales with the data, and the data scales with the users, and eventually you're spending more on infrastructure than you earn from membership.

The cooperative can't do that. Membership is $5/year. The margin is Cost+20%. Every dollar of infrastructure cost reduces what creators keep. So the ledger architecture has to be efficient from day one — not because efficiency is a nice goal, but because waste violates the economic model.

The solution is time-based partitioning. Every ledger table is split into monthly partitions. New data writes to the current month. Old months can be detached, archived, and eventually moved to cheaper storage — all without touching the application code. A member querying their last 30 days of transactions never touches data from two years ago.

The key insight: the cooperative stores only metadata. A photo-hosting platform at one million users might need petabytes of storage. Liana Banyan's entire ledger at one million users — every Mark, every Credit, every attribution event, every feedback pin — fits in about 11 terabytes per year, raw. With a two-year hot window and a cheap archive for everything older, the active database stays under a terabyte.

That's the metadata-only advantage. It doesn't make scaling free. It makes scaling affordable at $5/year.

---

### Full Detail

The IP Ledger is the cooperative's nervous system. Six tables track everything that moves:

**shadow_marks_ledger** — Every Mark allocation, spend, conversion, and expiration. The highest-volume table. At scale, this is where billions of rows live.

**cue_card_attribution** — Every attribution chain event. When a member's Cue Card brings someone to the platform, the chain is recorded here. One level only — never second-degree.

**xray_feedback** — Every feedback pin, every quality report, every UX signal. The data that feeds the ADAPT score system.

**adapt_scores** — Time-series metrics per node, per system, per measurement period. The rolling 7-day scores that affect Crew Call ranking and Captain level progression.

**local_sop / sop_adaptations** — Standard operating procedures and their local adaptations. When a Montana node modifies the delivery routing SOP for rural roads, that change is tracked here.

**innovation_log** — The formal record of every innovation in the platform, from Crown Jewels to micro-adaptations.

**The partitioning strategy**

Each high-volume table is split into monthly partitions using PostgreSQL's native declarative partitioning. The primary key is composite: (event_date, id), where event_date is the partition key and id is a per-partition sequence. This means:

- Writes go to the current month's partition only
- Reads for recent data scan only recent partitions
- Old partitions can be detached as a unit — no row-by-row deletion
- Indexes are per-partition, so they stay small and fast

A cron job runs monthly to create the next month's partition automatically. The cooperative never runs out of runway.

**The three-tier archive**

Not all data needs to be instantly accessible. The architecture splits storage into three tiers:

*Hot tier (Supabase primary database)*: The last 2-3 years of data. This is what members see in their Wallet, their ADAPT dashboard, their transaction history. Fast, RLS-protected, optimized for member experience.

*Warm tier (archive database)*: Years 3-7. Detailed data that's needed for audits, disputes, and long-range analytics, but not for day-to-day member UX. Stored in a cheaper PostgreSQL instance.

*Cold tier (object storage)*: Beyond 7 years. Compressed exports in Parquet or JSON format, stored in S3 or Supabase Storage. Retrieved only for exceptional circumstances — regulatory requests, historical research.

When data moves from hot to warm, a rollup summary stays behind. A member's lifetime totals are always available — they're computed from the rollup table plus current hot data. The archive is invisible to the member experience.

**The cost math**

At a thousand members, the entire ledger fits within Supabase's included 8 GB on the $25/month Pro plan. At ten thousand members, the hot window is about 220 GB on disk — well within Pro plus modest overage fees. At a hundred thousand members, you're into enterprise territory, but the archive strategy keeps the hot database manageable.

The critical number: with a two-year hot window, the active database for ten thousand members costs roughly the same as a single month of a mid-tier corporate database license. The metadata-only architecture means the cooperative's data grows linearly with transactions, not exponentially with media uploads.

**Why this matters for $5/year**

Every architectural decision in the ledger traces back to the same question: does this keep membership at $5/year and creator payouts at 83.3%? Time-based partitioning: yes — it minimizes storage costs and makes archival automatic. Three-tier storage: yes — it pushes old data to the cheapest available storage. Metadata-only: yes — it means the cooperative never hosts user-uploaded media, keeping storage costs orders of magnitude below platforms that do.

A billion rows sounds like a big-company problem. It is. The difference is that this cooperative planned for it at session 58, when the biggest table had fewer rows than this article has words.

---

*Pudding #33 — Bishop B058*
*SEC-safe. No securities language.*
*Content Pipeline stage: ARTICLE*
*FOR THE KEEP!*
