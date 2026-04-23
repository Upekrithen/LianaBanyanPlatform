# Pudding #34: The Metadata-Only Advantage
## Why We Don't Host Your Photos

---

### At a Glance (~50 words)
Liana Banyan never stores user-uploaded images, videos, or large files. Instead, it stores metadata — URLs, timestamps, tags, attribution chains. This means the cooperative's database grows by kilobytes per transaction, not megabytes. At scale, that's the difference between a $25/month database and a $25,000/month one.

---

### More Info (~300 words)

Instagram stores your photos. YouTube stores your videos. Dropbox stores your files. Their storage bills are measured in petabytes and their infrastructure teams number in the hundreds.

Liana Banyan stores none of that. When a member's Bounty Photography assignment produces photos for a local business, those photos are posted to the photographer's own social media accounts. The platform records only the metadata: the URL where the photo lives, the timestamp, the business it covers, the photographer's attribution, and the bounty payment record. Each metadata entry is roughly one kilobyte.

This is not a limitation. It's a deliberate architectural choice with three consequences:

First, **storage costs stay trivial**. At one million members generating five billion ledger entries per year, the total raw data is about 5.5 terabytes — roughly the size of a single external hard drive. A photo-hosting platform at the same scale would need hundreds of petabytes.

Second, **the cooperative never becomes a custodian of user content**. No DMCA takedown requests for hosted images. No content moderation of uploaded media. No liability for user-generated visual content. The member owns their photos on their social media; the cooperative owns only the record that the photo exists and who gets paid for it.

Third, **the economic model works at any scale**. When a platform hosts media, infrastructure costs grow faster than revenue because storage is a fixed cost per byte regardless of how much revenue that byte generates. When a platform hosts only metadata, infrastructure costs grow proportionally to transaction volume — which is exactly what generates revenue through Cost+20%.

The metadata-only architecture isn't clever engineering. It's economic alignment. The cooperative's costs scale with its revenue because the only data it stores is the data that represents revenue.

---

### Full Detail

The metadata-only principle applies across the entire platform:

**Bounty Photography (#2100)**: Photographers post to Instagram, TikTok, Google Business Photos. The platform stores: photo URL, photographer member ID, business ID, timestamp, bounty amount, ADAPT feedback. Total per photo: ~1 KB.

**Storefronts**: Product images link to external hosts (Etsy, Shopify, or the creator's own hosting). The platform stores: image URL, product ID, storefront ID, alt text, display order. Total per image: ~500 bytes.

**Cue Cards**: The Cue Card itself is a lightweight HTML template rendered on demand. No image storage — the member's avatar is pulled from their profile, which links to an external URL or uses a generated initial.

**Dispatch (Social Media)**: Posts are composed in the platform and dispatched to 12 platforms via their APIs. The platform stores the post text, dispatch metadata, and platform-specific post IDs for tracking. The actual media (images, videos) is uploaded directly to the social platform, not stored on Liana Banyan's servers.

**HexIsle**: Game assets (hex tiles, structures, terrain) are served from a CDN, not from the database. The database stores only game state: which tiles are claimed, what structures exist, resource levels. Pure metadata.

**The cost comparison**

Consider two platforms at 100,000 members:

Platform A hosts user photos. Average member uploads 50 photos/year at 3 MB each. Annual storage: 100,000 × 50 × 3 MB = 15 TB of images alone. At cloud storage rates of roughly $0.02/GB/month, that's about $3,600/year just for photo storage — before any compute, CDN, or backup costs.

Platform B (Liana Banyan) stores only metadata. Same 100,000 members generating 550 million ledger entries/year. Annual storage: ~550 GB of metadata. At the same rate, that's about $132/year for ledger storage.

That's a 27x cost difference. And it compounds every year, because photos accumulate but metadata can be archived and rolled up.

**Why this works for a cooperative**

A venture-backed platform can absorb $3,600/year in storage costs because it plans to charge users — through ads, premium tiers, or data sales — far more than the storage costs. The storage is a loss leader for attention capture.

A cooperative at $5/year membership and Cost+20% margins cannot absorb those costs. The metadata-only architecture keeps infrastructure costs proportional to transaction volume, which keeps the Cost+20% margin honest, which keeps creator payouts at 83.3%.

Every architectural decision in the cooperative answers the same question: can this work at $5/year? Metadata-only storage answers yes. Photo hosting answers no. The architecture follows the economics.

---

*Pudding #34 — Bishop B058*
*SEC-safe. No securities language.*
*Content Pipeline stage: ARTICLE*
*FOR THE KEEP!*
