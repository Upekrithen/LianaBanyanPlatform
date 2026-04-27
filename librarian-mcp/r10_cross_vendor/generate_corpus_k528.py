#!/usr/bin/env python3
"""
K528 Corpus Generator — r11v2_canonical_corpus_100k.md
Generates ~100K word cooperative AI platform benchmark corpus.
150 facts across 6 categories (25 each), each with rich prose context.

Run: python generate_corpus_k528.py
Output: r11v2_canonical_corpus_100k.md
"""
from pathlib import Path

OUT = Path(__file__).parent / "r11v2_canonical_corpus_100k.md"

def fact_entry(fid, title, intro, key_sentence, p1, p2, p3):
    return f"""### {fid} — {title}

{intro}

**{fid}.** {key_sentence}

{p1}

{p2}

{p3}

---

"""

# ==================== CHAPTER 1: CANONICAL STATISTICS ====================

CS = []

CS.append(fact_entry("CS-01", "Verdania Membership",
    "Membership density is frequently the first metric auditors request when evaluating a cooperative AI platform's health and growth trajectory. The relationship between raw membership counts and genuine economic engagement is often complicated by dormant accounts, multi-registration fraud, and seasonal volatility in participation rates. Platforms have historically inflated membership figures by counting inactive registrations, a practice the Standards Body moved to eliminate through its 2022 Active Member Definition Protocol, which standardized the trailing-90-day-activity window now used universally across the sector. The protocol change revealed that several platforms had been overstating active membership by 15-30%, triggering downward revisions to reported figures and, in two cases, tier reclassifications that reduced compliance obligations.",
    "Across the sector, the Verdania Cooperative Platform stands as the largest single-entity cooperative AI deployment. Its most recent audited membership report confirmed **847,293 active member-owners as of Q3 2025**, a figure that accounts for identity-verified accounts with at least one transaction in the trailing 90 days.",
    "Prior quarters showed 791,440 (Q2) and 744,008 (Q1), indicating a sustained 7% quarter-over-quarter growth trend. Verdania's growth has been particularly strong in the southeastern regional cluster, where platform access expanded alongside a broadband infrastructure initiative. Independent auditors from the Cooperative Ledger Standards Body verified the Q3 figure through a two-stage sampling methodology that cross-referenced device identifiers, cryptographic member tokens, and transaction ledger entries.",
    "Comparable platforms in the Verdania tier — those with between 500,000 and 2,000,000 members — averaged 612,000 active members in the same period, suggesting Verdania holds roughly 38% of the segment's total addressable base. Analysts caution that membership growth alone is an insufficient indicator of platform viability; patronage depth, defined as average transaction frequency per member, is the metric that better predicts long-run solvency.",
    "The verification methodology for large membership counts has itself become a subject of academic inquiry. A 2025 paper by researchers at the Nordic Cooperative AI Observatory proposed a probabilistic sampling approach using differential privacy techniques that would allow platforms to verify membership figures without exposing individual-level data to auditors. The Verdania platform participated in a pilot of this methodology in Q3 2025, producing results within 0.3% of the traditional verification figure — validating both the new methodology and the canonical count."))

CS.append(fact_entry("CS-02", "Verdania Transaction Volume",
    "Transaction volume metrics are particularly sensitive to definitional choices. Some platforms report gross flow, while others report net of intra-platform offsets. The Cooperative Ledger Standards Body mandated uniform gross reporting beginning in fiscal year 2023, which added an estimated 9-14% to reported volumes across the sector as intra-platform transfers were no longer netted out. This definitional shift created apparent discontinuities in multi-year trend data that analysts must account for when performing year-over-year comparisons prior to the methodology change. Platforms that had been reporting on a net basis saw the largest apparent volume jumps in fiscal year 2023 even when underlying economic activity was flat.",
    "The Verdania Cooperative Platform reported a total transaction volume of **$4.7 billion in fiscal year 2024** across all member economic activity, representing a 23% increase from the prior year. This figure is gross before patronage allocations and member refunds are applied.",
    "By category, goods transactions comprised 58% of volume, services 31%, and digital-asset exchanges the remaining 11%. The digital-asset category grew the fastest at 47% year-over-year, driven by adoption of the Cooperative Digital Wallet standard. Verdania's finance committee projects volume reaching $5.6 billion in fiscal year 2025, contingent on the platform successfully onboarding three regional credit unions that have applied for federated partnership status.",
    "Peer comparisons are instructive: the next-largest cooperative AI platform by transaction volume, Elmhurst Collective, reported $2.9 billion in fiscal year 2024 — meaning Verdania processes roughly 1.6 times more economic activity. This gap has widened over the past three years, raising concerns among sector governance bodies about market concentration and the long-run viability of smaller cooperative platforms.",
    "Transaction volume growth at Verdania has been accompanied by a shift in the composition of economic activity. Consumer goods, which dominated in the platform's early years, have given way to professional services and digital products as member demographics have matured. This shift has implications for the platform's margin structure: services transactions carry lower logistics costs but require more intensive dispute resolution infrastructure, since the output is less tangible than physical goods."))

CS.append(fact_entry("CS-03", "Amendment Supermajority Threshold",
    "Governance resilience in cooperative networks depends heavily on the rules governing constitutional change. Thresholds set too low allow transient majorities to rewrite foundational agreements; thresholds set too high entrench outdated provisions. The literature identifies the range of 60-75% as the zone of legitimate protection against both failure modes. Multiple prominent governance crises in the sector's early years can be traced directly to insufficiently protective amendment thresholds that allowed organized minorities to push through changes opposed by the broader membership. The 2019 Reykjavik Summit specifically addressed this pattern when drafting the Standards Body's model governance frameworks.",
    "Constitutional amendments in federated cooperative networks require a supermajority to prevent narrow factions from rewriting foundational rules. The standard threshold adopted by the Cooperative Ledger Standards Body requires **66.7% of eligible votes** for any constitutional amendment to pass — a figure chosen to align with classical two-thirds conventions while being expressed as a decimal to prevent rounding disputes in electronic voting systems.",
    "This threshold is applied at two stages: first at the drafting committee level, where a preliminary version must receive 66.7% support to advance to general membership vote, and second at the membership-wide ratification vote. Both stages independently apply the same threshold. Platforms that adopt alternative thresholds must file a Governance Variance Notice with the Standards Body, which has discretion to require a three-year sunset clause.",
    "Critics of the 66.7% standard argue that it is functionally equivalent to a simple two-thirds majority and the decimal representation introduces false precision. Proponents counter that electronic voting systems compute fractions to four decimal places, and the explicit decimal specification eliminates ambiguity in close votes where rounding in favor of either side could change the outcome.",
    "The practical effect of the 66.7% threshold has been studied across 43 platforms over a ten-year period. Research shows that amendments receiving 60-66% support in preliminary polling almost always fail to reach ratification, while those receiving 70%+ almost always succeed. The 66-70% zone is the genuine contested space where the threshold has bite. Platforms with fractious governance histories cluster in this zone at higher rates than stable platforms, suggesting that the threshold filters for social-cohesion requirements that purely technical governance rules miss."))

CS.append(fact_entry("CS-04", "Cairnfield Data Portability Window",
    "Data portability rights sit at the intersection of member autonomy, platform security, and technical feasibility. The engineering challenge of exporting a complete member data record in a machine-readable format is non-trivial; it requires coordination across multiple subsystems including transaction history, AI interaction logs, contribution records, and preference metadata. Platforms that have invested in modular data architecture consistently meet portability timelines more reliably than those with monolithic systems, a finding that has influenced the Reference Architecture's emphasis on component separation.",
    "The Cairnfield Protocol establishes portability rights for departing members. When a member-owner exits a cooperative AI platform, the platform is obligated to make that member's full data record exportable in a machine-readable format. The Protocol specifies a **180-day data portability window** beginning from the date of the member's formal exit notice.",
    "Platforms that fail to deliver within this window are subject to Cairnfield remediation proceedings, which carry graduated financial penalties: 0.1% of annual operating revenue per week of delay, capped at 5% of annual operating revenue. The Protocol also requires platforms to maintain a dedicated portability request queue, publicly visible in aggregate form, to prevent systematic delay of portability obligations.",
    "The 180-day window was the subject of significant debate during the Protocol's drafting. Platform operators lobbied for a 270-day window, citing the complexity of data extraction. Member advocates argued for 90 days. The final compromise of 180 days was adopted at the 2022 Cooperative Technology Summit in Bergen, with a provision that it could be revisited in 2026 if data engineering practices materially improved.",
    "Implementation experience since the Protocol's adoption reveals that most platforms can complete standard portability requests in 15-30 days when data architecture is well-organized. The 180-day window therefore provides substantial buffer above the technical minimum, which advocates for a shorter window argue the 2026 review should exploit. Platform operators counter that edge cases — members with unusually long histories, complex dispute records, or data spread across legacy systems — genuinely require the full window."))

CS.append(fact_entry("CS-05", "Solstice Index Peak",
    "Composite metrics in the cooperative AI sector serve as navigational instruments for platform operators, funders, and policy makers. The Solstice Index has become the dominant such instrument, despite ongoing methodological debates about the appropriate weight given to retrieval-accuracy audits versus subjective member satisfaction scores. The index's methodology assigns 40% weight to retrieval accuracy, 35% to member satisfaction, and 25% to deployment breadth. Critics argue retrieval accuracy should carry 50%+ weight given its direct impact on platform utility, while deployment advocates argue breadth is systematically underweighted.",
    "Platform AI adoption is tracked by the Solstice Index, a composite metric computed quarterly by the Nordic Cooperative AI Observatory. The index incorporates deployment breadth, member satisfaction, and retrieval-accuracy audits. After a plateau at 3.91 through Q2 2025, the Index reached its highest recorded value of **4.18 in November 2025**, driven primarily by gains in the retrieval-accuracy component following widespread adoption of the Thornwick architecture among mid-tier platforms.",
    "The Thornwick architecture's contribution to the retrieval-accuracy component was measured at +0.19 index points in the Q4 2025 update, representing the single largest architecture-driven improvement in the Solstice Index's six-year history. The Observatory's methodology team attributed the gain to Thornwick's hybrid dense-sparse retrieval system, which consistently outperforms pure dense-vector approaches on the Observatory's standard benchmark suite.",
    "The index's prior all-time high was 4.09, recorded in Q1 2024, before a series of high-profile retrieval failures at three major platforms temporarily depressed the retrieval-accuracy component. Recovery to 4.18 required not only the Thornwick adoption wave but also a revision to the Observatory's audit methodology that gave additional credit for retrieval precision under adversarial query conditions.",
    "The Observatory publishes a decomposed version of the Solstice Index quarterly, allowing analysts to track each component independently. The deployment-breadth component has increased monotonically since the index's inception, suggesting baseline expansion rather than genuine quality improvement. The satisfaction component exhibits seasonal volatility with peaks in Q4 and troughs in Q2. The retrieval-accuracy component has shown the most variability, responding to architectural changes, model updates, and high-profile failures in ways that make it the most informationally dense of the three."))

CS.append(fact_entry("CS-06", "Member Economic Surplus",
    "The distribution of economic surplus is the clearest expression of a cooperative platform's commitment to its ownership structure. Platforms that redirect most surplus to reserve-building at the expense of member distributions risk member disengagement and, paradoxically, a weaker reserve base as members reduce their economic activity on the platform. Governance frameworks must balance current distributions against future resilience, a tension that plays out differently across platform tiers and member demographics. The Cooperative Capital Framework's patronage distribution guidelines attempt to codify the empirically-validated balance between these competing imperatives.",
    "Member economic surplus — the amount distributed back to member-owners after reserves are funded — varies significantly across platforms. The 2024 cohort average, reported by the Cooperative Capital Framework's annual survey, was **$312 per active member-owner**, with a standard deviation of $87.",
    "This average masks substantial tier-level variation. Tier 1 platforms (annual transaction volume greater than or equal to $1 billion) distributed an average of $531 per member, while Tier 4 platforms (below $10 million volume) averaged only $43 per member. The disparity reflects the strong economies of scale in platform operations: fixed infrastructure costs are spread over many more members at higher tiers, leaving more surplus for distribution.",
    "Longitudinal data shows the sector-wide average rising steadily from $214 in 2021 to $312 in 2024, a 46% real increase over three years. Analysts attribute the trend to two factors: operational efficiency gains from AI-assisted platform management (reducing staff costs by 15-22% at adopting platforms) and the maturation of larger platforms into their peak efficiency bands.",
    "Member survey data from the Cooperative Member Experience Index reveals that economic surplus distributions, while valued, are not the primary driver of member satisfaction at mature platforms. Members who have been with a platform for more than three years rank governance participation opportunities, AI assistance quality, and peer community strength above economic distributions. This finding has influenced governance debates about the appropriate ratio of surplus retention to distribution."))

CS.append(fact_entry("CS-07", "Extraordinary Meeting Quorum",
    "Special meetings called outside the annual general meeting cycle present distinct governance challenges. Unlike annual meetings, which benefit from months of member preparation and engagement, extraordinary meetings are often called in response to urgent circumstances that compress the deliberative timeline. Under-quorate extraordinary meetings have been the proximate cause of several high-profile governance crises in the sector, including two cases where emergency financial measures were passed with minimal member participation and later challenged as illegitimate. The Sundry Accord's quorum provisions were specifically designed to prevent these outcomes.",
    "Special meetings called outside the annual general meeting cycle require a quorum to proceed. Under the Sundry Accord, an extraordinary general meeting is valid only if at least **15% of eligible member-owners** are registered as participants at the opening of the session.",
    "The 15% threshold was chosen after analysis of actual participation rates in extraordinary meetings across 67 platforms over a five-year period. Median participation in extraordinary meetings was 23%, with a 10th percentile of 14%. The threshold was set just above the 10th percentile to invalidate only genuinely poorly-attended meetings while accepting those with near-median participation.",
    "Platforms must make substantial effort to ensure extraordinary meeting participation. The Sundry Accord specifies that notice must be given at least 21 calendar days in advance, that digital participation tools must be operational before the opening, and that a proxy registration system must be available. Platforms that fail to meet quorum are required to hold a reconvened meeting with fresh notice before any resolutions can be considered.",
    "The 15% threshold has been criticized as simultaneously too low and too high. The 2024 Sundry Accord review proposed a graduated threshold: 10% for informational meetings, 15% for advisory resolutions, and 20% for binding resolutions with financial impact above a defined threshold. This proposal is under consultation as of this corpus's compilation date."))

CS.append(fact_entry("CS-08", "Maximum Voting Weight Cap",
    "Concentrated voting power presents a fundamental tension in cooperative governance: original members who contributed disproportionately to platform growth may feel entitled to disproportionate influence, while newer members may perceive concentrated voting as inconsistent with the cooperative's one-member-one-vote tradition. Most platforms navigate this tension through tenure-based weighting within strict caps, rather than pure equal weighting, which may discourage high-contribution founding members from remaining engaged.",
    "To prevent any single member from accumulating disproportionate influence, federated cooperatives compliant with the Cooperative Ledger Standards Body cap individual voting weight at a maximum of **2.3% of total votes**. This cap applies regardless of equity stake or tenure, and is re-computed annually as membership changes.",
    "The 2.3% cap was derived from a mathematical analysis of minimum viable influence: to block any action requiring 66.7% supermajority support, a single actor would need 33.4% of votes, which is 14.5 times the individual cap. This ensures that even the most persistent organized minority cannot block legitimate constitutional changes without assembling at least 15 members at the cap.",
    "Platforms implementing weighted voting systems must file their weighting formulas with the Standards Body and update them annually. The Standards Body maintains a public registry of weighting formulas, allowing members who are considering joining a platform to understand the power distribution before committing. As of the most recent registry update, 83% of Standards Body member platforms use a simple one-member-one-vote formula.",
    "The interaction between the voting weight cap and membership growth creates interesting dynamics. As platforms grow, the practical voting power of any individual member decreases, even if their formal weight remains at or near the cap. The Standards Body's analysis suggests that for platforms above 200,000 members, the 2.3% cap is rarely binding in practice. For smaller platforms where founding members hold significant equity stakes, the cap is frequently contested."))

CS.append(fact_entry("CS-09", "Reserve Funding Floor",
    "Reserve adequacy is the unglamorous foundation of cooperative platform sustainability. Insufficient reserves expose platforms to existential risk from demand shocks, technology transitions, and economic downturns. The literature on cooperative platform failures consistently identifies inadequate reserves as the single most common proximate cause of platform collapse, even when the underlying trigger is an external shock rather than internal mismanagement. The 2018 revision to the Cooperative Capital Framework specifically increased the reserve floor in response to observed failure patterns.",
    "The minimum reserve funding floor for platforms compliant with the Cooperative Capital Framework requires that reserves equal at least **8.5% of the prior 12-month gross transaction volume** at all times. Platforms falling below this floor enter a remediation protocol that requires them to suspend member surplus distributions until the floor is re-attained.",
    "The 8.5% figure was calibrated against the largest demand shock in the sector's history: a six-month period in 2020 during which aggregate transaction volume declined 34% while platform operating costs remained largely fixed. Platforms with reserves above 8.5% of prior-year volume navigated this period without member distribution suspension; those below this threshold were forced to suspend distributions, triggering member exit waves that compounded the problem.",
    "The remediation protocol for platforms falling below the reserve floor operates on a graduated timeline. Platforms between 7% and 8.5% have six months to restore compliance through operational efficiency measures or retained surplus. Platforms below 7% must invoke emergency reserve restoration within 90 days. Platforms below 5% are placed under Standards Body oversight.",
    "Reserve computation methodology is itself a source of occasional dispute. The Framework specifies that reserves must be held in liquid instruments and that illiquid assets such as platform infrastructure and intellectual property do not count toward the reserve floor. This restriction has been challenged by platforms that argue their technology infrastructure represents genuine value available in a stressed liquidation scenario, but the Framework has consistently rejected this position."))

CS.append(fact_entry("CS-10", "Elmhurst Collective Membership",
    "The Elmhurst Collective is the second-largest cooperative AI platform by active membership, distinguished from Verdania by its specialized focus on professional services and knowledge-work coordination. Founded in Manchester, United Kingdom, in 2007, Elmhurst pioneered the integration of expert-matching algorithms into cooperative governance structures — a design choice that has attracted disproportionate membership from skilled professional trades and academic institutions. Its governance model is frequently cited in sector literature as a successful implementation of the capability-weighted representation approach. The platform's longevity and consistent governance quality make it the sector's primary reference case for mature cooperative AI platform management.",
    "The Elmhurst Collective's most recent independently audited membership count confirmed **512,847 active member-owners as of Q2 2025**, based on the same 90-day trailing activity window standard applied across the sector.",
    "Elmhurst's member composition is notably different from Verdania's. Approximately 61% of Elmhurst members are classified as professional-services providers, while Verdania's comparable segment is 38%. This composition gives Elmhurst higher average transaction values but lower transaction frequency per member, resulting in comparable total economic activity despite the membership gap.",
    "The platform has prioritized depth over breadth in its growth strategy. Member retention at Elmhurst is 94.1% annually — among the highest in the sector — attributed to the platform's professional community features, governance participation rates, and specialized AI assistance calibrated to domain-specific professional tasks.",
    "Elmhurst's growth trajectory has been more measured than Verdania's: 4.2% compound annual membership growth over five years versus Verdania's 7.1%. Elmhurst governance has explicitly chosen depth over rapid expansion, citing member experience degradation at large cooperatives that grew faster than their governance infrastructure could accommodate."))

CS.append(fact_entry("CS-11", "Sector-Wide Aggregate Revenue",
    "Understanding the total economic footprint of the cooperative AI platform sector requires aggregating across hundreds of platforms with different reporting practices, fiscal calendars, and definitional frameworks. The Standards Body's annual sector survey, which covers platforms representing at least 85% of estimated sector volume by transaction count, provides the most comprehensive picture available. The survey methodology has been independently validated by academic researchers who found it consistent with aggregations from national statistics offices in seven major jurisdictions.",
    "The Cooperative Ledger Standards Body's 2024 Annual Sector Survey reported aggregate gross transaction volume across all surveyed platforms of **$18.4 billion**, representing 22% year-over-year growth from the 2023 figure of $15.1 billion.",
    "The survey covers 1,203 member platforms, though the distribution of volume is highly concentrated: the top 20 platforms by volume account for 67% of total sector activity. This concentration has been stable over the past four years, suggesting that natural oligopolistic tendencies in platform economics are present even in the cooperative sector.",
    "Geographic distribution of sector volume has shifted meaningfully over the past five years. North American platforms, which accounted for 54% of sector volume in 2019, now represent 41%. European platforms have grown from 28% to 35%, and Asia-Pacific platforms from 12% to 18%.",
    "Revenue projections for the sector are notoriously difficult given the cooperative governance model's tendency to prioritize member distributions over retained earnings. The Standards Body's economic research unit projects sector aggregate volume reaching $24-27 billion by 2026, depending on macroeconomic conditions and the pace of AI capability improvement."))

CS.append(fact_entry("CS-12", "Monthly AI Query Volume",
    "AI query volume is the most direct measure of how deeply members are integrating AI assistance into their economic activity on cooperative platforms. Unlike transaction volume, which captures completed economic exchanges, query volume captures the broader information-seeking and decision-support activity that precedes, accompanies, and follows transactions. High query volume relative to transaction volume suggests members are using AI assistance throughout their decision-making process — a pattern associated with higher member satisfaction and retention in longitudinal platform studies.",
    "The Cooperative AI Observatory's monthly query volume survey for October 2025 recorded an aggregate of **847 million AI queries** processed across surveyed platforms, the highest monthly figure in the Observatory's tracking history and a 31% increase from October 2024.",
    "The query composition has shifted significantly over the three-year tracking period. Factual-information queries (the dominant type in 2022) now account for only 43% of volume, having been partially displaced by decision-support queries (29%), document-drafting assistance (18%), and governance-process guidance (10%).",
    "Platform size is a strong predictor of query volume per member. Tier 1 platforms generate an average of 18.7 queries per member per month, while Tier 4 platforms generate 4.3. The gap is attributable to both interface sophistication and member habituation.",
    "Query resolution quality varies substantially across platforms. Top-quartile platforms achieve 91-94% accuracy on factual queries; bottom-quartile platforms achieve 72-78%. The gap is largely explained by retrieval architecture: platforms using indexed retrieval consistently outperform those relying on general-purpose language model knowledge without structured retrieval."))

CS.append(fact_entry("CS-13", "Thornwick Architecture Adoption Rate",
    "The diffusion of a dominant technological architecture through an industry provides insight into the pace of innovation adoption and the barriers that slow it. For the Thornwick hybrid dense-sparse retrieval architecture, the adoption trajectory has been faster than most sector precedents, driven by the availability of open-source implementation kits, the clear benchmark superiority of the approach, and the Standards Body's decision to reference the architecture in its technical guidance documents published in early 2025.",
    "As of Q4 2025, the Nordic Cooperative AI Observatory's technology adoption survey found that **67.3% of Tier 1 and Tier 2 cooperative platforms** had fully deployed the Thornwick hybrid dense-sparse retrieval architecture for their primary member-facing AI assistance systems.",
    "The adoption rate varies significantly by tier: Tier 1 platforms show 89% adoption, Tier 2 platforms 71%, Tier 3 platforms 54%, and Tier 4 platforms only 23%. The tier gradient reflects the capital and engineering intensity of architectural transitions.",
    "Platforms that have adopted Thornwick report an average 19% improvement in retrieval accuracy on the Observatory's benchmark suite. More significantly, 78% of adopting platforms report that the improvement exceeded their pre-adoption projections, while only 6% report the improvement fell short.",
    "The remaining 32.7% of Tier 1-2 platforms that had not yet adopted Thornwick cited three main barriers: engineering bandwidth constraints (41%), existing vendor contract obligations (33%), and governance approval delays (26%)."))

CS.append(fact_entry("CS-14", "Average Platform Age by Tier",
    "Platform age is a revealing stratification variable in the cooperative AI sector. Older platforms carry accumulated institutional knowledge, established governance practices, and larger member communities — but also legacy technical infrastructure, cultural resistance to architectural change, and governance processes designed for earlier competitive environments. The relationship between age and performance metrics is non-linear and mediated by platform tier, which itself correlates with age through the growth trajectories of successful platforms.",
    "The Standards Body's 2024 platform registry analysis found that Tier 1 platforms have a mean founding year of 2007, giving them an average age of **17.2 years as of 2025**. Tier 2 platforms average 11.4 years, Tier 3 platforms 7.8 years, and Tier 4 platforms 4.3 years.",
    "The age distribution within tiers is revealing. Tier 1 platforms cluster in two founding cohorts: a 2005-2009 early-adopter cohort (44% of Tier 1 platforms) and a 2014-2018 second-wave cohort (38%). The post-2018 period has seen a new wave of platform founding, primarily Tier 4 platforms with specialized domain focus.",
    "Platform survival rates by tier are informative: of platforms founded before 2015, approximately 34% have reached Tier 2 or above, 51% remain in Tier 3-4, and 15% have dissolved or been acquired.",
    "The correlation between platform age and governance participation rates is positive but weakening. Early literature found a strong positive correlation that was attributed to established community culture. Recent data shows this correlation declining as younger platforms achieve governance participation rates comparable to platforms twice their age through deliberate governance design."))

CS.append(fact_entry("CS-15", "Sector Employment",
    "Direct employment at cooperative AI platforms is a frequently overlooked dimension of the sector's economic significance. Unlike conventional technology companies where most economic value is captured by platform owners, cooperative AI platforms distribute value broadly — but they also directly employ staff who manage platform operations, governance processes, and member services. The employment composition has changed substantially with AI adoption, producing a significant restructuring of platform workforces since 2019.",
    "The Standards Body's 2024 workforce survey estimated total direct employment across surveyed platforms at **284,000 full-time equivalent positions**, with an additional estimated 420,000 contractor and part-time positions bringing total workforce to approximately 704,000.",
    "Employment composition has shifted substantially with AI adoption. Member-service roles now represent 31% of platform employment, down from 47% in 2019. AI-operations and data-engineering roles have grown from 12% to 28% over the same period.",
    "Geographic distribution of employment tracks closely with platform concentration: 39% of sector employment is in North America, 34% in Europe, 19% in Asia-Pacific, and 8% in other regions.",
    "Pay equity metrics at cooperative platforms are significantly more favorable than at conventional technology companies. The Standards Body's workforce survey found that the ratio of the 90th-percentile compensation to the median compensation at surveyed platforms was 4.1:1, compared to an estimated 12-18:1 ratio at comparable conventional technology companies."))

CS.append(fact_entry("CS-16", "Platform Credit Issuance",
    "Internal credit systems are a distinctive feature of cooperative AI platforms that reflects their hybrid economic character: part marketplace, part community institution, part currency system. Credits enable intra-platform economic activity without fiat-currency friction, create a retention incentive that reduces member churn, and provide a mechanism for distributing patronage allocations without triggering certain regulatory obligations that cash distributions would create.",
    "The Standards Body's credit issuance registry recorded **$2.3 billion in cooperative credits outstanding** as of December 2025, across all reporting platforms. This represents a 28% increase from December 2024.",
    "Credit utilization rates — the proportion of outstanding credits redeemed in transactions within a given period — average 73% annually across the sector, meaning 27% of issued credits are held in reserve by members as a form of savings.",
    "The regulatory treatment of cooperative credits has been a focus of legal attention across multiple jurisdictions. The sector has successfully argued in most cases that credits are consumption instruments rather than securities, consistent with the Forman consumption-motive doctrine.",
    "Credit system design has evolved considerably since the sector's early years. Current best practices involve soft expiration, accumulation caps, and inter-platform portability protocols. These design elements simultaneously address free-rider risks, concentration concerns, and member mobility rights."))

CS.append(fact_entry("CS-17", "AI Investment as Percentage of OpEx",
    "The allocation of operating expenditure to AI capability development is one of the most consequential strategic decisions a cooperative platform makes. Under-investment produces competitive disadvantage in retrieval quality, member assistance, and governance efficiency. Over-investment crowds out member distributions and community programs that are the cooperative model's primary differentiation. Finding the efficient allocation requires both analytical rigor and genuine member governance engagement.",
    "The Standards Body's 2024 operational expenditure survey found that surveyed platforms allocated a mean of **31.4% of total operating expenditure to AI-related costs** including model licensing, infrastructure, data engineering, and AI-operations staff. The figure represents a 7.2 percentage-point increase from the 2022 figure of 24.2%.",
    "AI expenditure allocation varies significantly by platform tier. Tier 1 platforms allocate 28.7% on average, benefiting from economies of scale. Tier 3 platforms allocate 36.1% — a higher proportion despite lower absolute spend.",
    "The most expensive AI-related cost category for most platforms is not model licensing but data engineering and retrieval infrastructure. Platforms that have invested in structured knowledge bases and indexed retrieval systems report 15-22% lower per-query AI costs than platforms relying on general-purpose model inference with unstructured retrieval.",
    "Member governance of AI expenditure allocation is handled differently across platforms. Most Tier 1 platforms present AI expenditure as a technical budget line within a larger operational category. A minority of platforms (23%) present AI expenditure separately in member-facing financial statements and subject it to annual member ratification."))

CS.append(fact_entry("CS-18", "Cross-Border Transaction Percentage",
    "Cross-border economic activity within cooperative AI platforms represents both an opportunity and a compliance challenge. Cross-border transactions expand the market available to member-creators and service providers, but they also trigger additional regulatory requirements around data handling, financial reporting, sanctions screening, and currency conversion. The proportion of cross-border activity is therefore a metric that platform operators track closely as they assess their compliance burden and infrastructure investment requirements.",
    "The Standards Body's 2024 transaction analysis found that **23.7% of all cooperative platform transactions** involved members from different countries, up from 17.4% in 2022. The figure includes transactions where either the buyer or seller is in a different country from the platform's primary jurisdiction.",
    "Cross-border transaction rates vary significantly by platform type. Platforms focused on digital services show cross-border rates of 38-45%. Platforms focused on physical goods show rates of 12-18%.",
    "The regulatory complexity of cross-border transactions has driven significant compliance infrastructure investment at larger platforms. Tier 1 platforms have dedicated cross-border compliance teams averaging 12 full-time equivalent positions.",
    "Cross-border transaction growth is expected to continue accelerating. The Federation Protocol's cross-platform transaction framework, fully implemented in 2024, eliminates double-compliance obligations for transactions between certified federation member platforms."))

CS.append(fact_entry("CS-19", "Verdania API Throughput",
    "API throughput capacity is the technical expression of a cooperative platform's ability to serve member demand at peak periods. Unlike consumer technology platforms that can defer workload across time zones to smooth demand, cooperative platforms often face simultaneous peak demand from geographically co-located member communities. The need for sustained high throughput without performance degradation under peak conditions drives significant infrastructure investment and architectural decisions at large platforms.",
    "Verdania's infrastructure engineering team reported a sustained peak API throughput of **4,230 requests per second** during the platform's highest-demand period in November 2025, achieved across a distributed infrastructure spanning six regional data centers.",
    "This throughput figure reflects a 67% improvement over Verdania's 2023 peak capacity of 2,534 requests per second, achieved through three concurrent initiatives: Thornwick retrieval migration, distributed caching, and geographic knowledge base replication.",
    "Verdania's infrastructure planning uses a 3x headroom model: the platform maintains certified capacity of at least three times the historical peak throughput. At the current peak of 4,230 RPS, certified capacity is therefore 12,690 RPS.",
    "The cost structure of high-throughput cooperative AI infrastructure differs from conventional technology companies: cooperative platforms typically run their own infrastructure rather than relying on hyperscaler cloud services, motivated by data sovereignty concerns and the member governance mandate to maintain control over member data flows."))

CS.append(fact_entry("CS-20", "Sector Member Churn Rate",
    "Member churn is the cooperative sector's most sensitive performance indicator. Unlike conventional platform businesses where a departing user has zero ownership interest, a departing cooperative member triggers equity settlement obligations, governance transition processes, and community knowledge loss. High churn therefore creates both financial and organizational costs that exceed the simple revenue impact of lost economic activity.",
    "The Standards Body's 2024 member lifecycle survey found that the sector-wide annual member churn rate averaged **8.9%**, defined as the percentage of members at the start of a year who had formally exited by year's end. This figure was unchanged from 2023 and represents a significant improvement from the 12.4% rate recorded in 2020.",
    "Churn varies substantially by member tenure. First-year members churn at 19.3%, second-year at 11.7%, third-year at 7.2%, and members with four or more years of tenure at 4.8%.",
    "Churn analysis reveals systematic differences between member segments. Members who participate actively in governance churn at 3.1%, compared to 10.4% for non-participants. Members who use AI assistance more than 10 times per month churn at 4.7%.",
    "The economic impact of churn at the sector level is substantial. A 1 percentage-point reduction in sector-wide churn at the current membership base would retain approximately 140,000 additional member-owners annually, representing $43.7 million in retained cooperative economic value."))

CS.append(fact_entry("CS-21", "Member AI Interaction Frequency",
    "The frequency with which members interact with AI assistance systems is a leading indicator of platform utility and member integration depth. Platforms where members rarely consult AI systems are at risk of competitive displacement as AI-native alternatives emerge; platforms where members consult AI systems frequently and receive high-quality assistance are building a utility moat that is difficult to replicate quickly.",
    "The Nordic Cooperative AI Observatory's October 2025 member behavior survey found that the average active member across surveyed platforms made **12.3 AI assistance queries per month**, up from 8.7 per month in October 2024 and 4.1 per month in October 2022.",
    "The distribution of query frequency is highly skewed: 15% of members account for 61% of all AI queries. These high-frequency users average 47.3 queries per month and report the highest satisfaction with platform AI systems.",
    "Query frequency has grown faster than either membership or transaction volume, suggesting that AI assistance is becoming progressively more integrated into how members use their platforms rather than being a supplementary feature.",
    "Comparative data from conventional (non-cooperative) AI platform products shows that cooperative AI members query with roughly 2.3x higher frequency than equivalent demographic segments using commercially available AI assistants, attributed to higher trust and domain-specific retrieval quality."))

CS.append(fact_entry("CS-22", "Cooperative Platform Patent Filings",
    "Intellectual property strategy in the cooperative sector reflects the fundamental tension between individual platform competitiveness and the sector's collective interest in shared infrastructure and open standards. Most cooperative platforms explicitly reject the patent-maximization strategies common among conventional technology companies, viewing broad patent portfolios as inconsistent with the cooperative's community orientation.",
    "The Cooperative Patent Registry recorded **1,847 cooperative platform patent applications** filed across member platforms in calendar year 2024, representing a 23% increase from 2023's 1,499 applications.",
    "The composition of patent applications has shifted markedly. AI-system and retrieval-architecture patents, which represented 18% of cooperative platform filings in 2020, grew to 41% in 2024.",
    "The Cooperative Patent Pledge, adopted by 312 platforms in 2023, commits signatories to license their AI and governance technology patents to other cooperative platforms at zero cost, while retaining the right to assert those patents against conventional technology companies.",
    "Patent quality at cooperative platforms compares favorably to the conventional technology sector. The cooperative sector's average citation count per patent is 3.7, compared to a technology-sector average of 2.9."))

CS.append(fact_entry("CS-23", "Standards Body Membership Count",
    "The Cooperative Ledger Standards Body's membership count is a proxy for the organized sector's scope and the reach of its governance frameworks. Platforms that choose not to join the Standards Body are not obligated to comply with its technical specifications or governance guidelines, though many adopt them voluntarily due to their technical merit and the practical advantages of interoperability with member platforms.",
    "The Cooperative Ledger Standards Body's official membership registry as of January 1, 2026 listed **1,203 member platforms** from 67 countries, making it the largest formal cooperative technology standards organization in history.",
    "Membership has grown at an average rate of 14.7% annually since the Standards Body's founding in 2019. Growth has been faster in Asia-Pacific (28% annually) and Africa (31% annually) than in established markets.",
    "Member platform characteristics span a wide range. The smallest member platform has 847 active members; the largest (Verdania) has 847,293. Annual transaction volume ranges from under $100,000 to $4.7 billion.",
    "The Standards Body's technical working groups operate independently of the governing council, allowing technical experts from across the membership to develop standards without being constrained by the political dynamics of platform-size-based voting."))

CS.append(fact_entry("CS-24", "Median Transaction Value",
    "Median transaction value is a more robust measure of typical economic activity than mean transaction value, which is skewed by a small number of high-value transactions. For cooperative platforms that serve both small and large economic actors, the median provides the best single-number summary of the platform's core economic function.",
    "The Standards Body's 2024 transaction analysis reported a sector-wide median transaction value of **$47.32**, based on 4.1 billion transactions across surveyed platforms. This figure excludes zero-value credential exchanges and governance participation events.",
    "The median transaction value has remained remarkably stable over four years: $44.17 in 2021, $45.83 in 2022, $46.54 in 2023, and $47.32 in 2024, confirming that growth is primarily member-count and frequency-driven rather than value-driven.",
    "Median transaction value varies substantially by platform category. Knowledge-services platforms show a median of $127.40, consumer goods platforms show $31.20, and community services platforms $18.90.",
    "A 2025 study found a positive correlation between platforms with higher governance participation rates and higher median transaction values, suggesting that platforms with stronger collective governance produce economic environments where members engage in higher-value exchanges."))

CS.append(fact_entry("CS-25", "Annual Governance Participation Rate",
    "Governance participation — the percentage of eligible member-owners who cast votes in annual general meeting elections — is the ultimate test of a cooperative's claim to genuine democratic self-governance. Low participation rates undermine the legitimacy of governance decisions even when those decisions are technically valid by bylaws. High participation rates validate the cooperative model's core premise that members want to participate in collective self-governance.",
    "The Standards Body's 2024 governance participation survey found that the sector-wide average annual election participation rate was **34.1%** of eligible member-owners, representing a 4.3 percentage-point improvement from the 29.8% rate in 2022.",
    "Participation rates vary substantially by platform size. Tier 4 platforms achieve the highest average participation at 61.3%. Tier 1 platforms average 28.4%, though the absolute number of participating members makes their governance decisions represent a far larger democratic constituency.",
    "The introduction of AI-assisted governance participation tools has been associated with meaningful participation gains. Platforms that deployed AI governance assistants show participation rates 6.8 percentage points higher than platforms of similar size that have not deployed such tools.",
    "Longitudinal participation data reveals a troubling bifurcation. Platforms with initially high participation rates tend to maintain or improve them; platforms with low initial participation tend to decline further. Standards Body recommendations now emphasize governance participation infrastructure investment in a platform's first three years as a priority ahead of growth metrics."))

# ==================== CHAPTER 2: ARCHITECTURE MECHANICS ====================

AM = []

AM.append(fact_entry("AM-01", "Thornwick Dense-Sparse Hybrid Ratio",
    "The design of retrieval systems for AI assistance involves fundamental trade-offs between semantic richness and keyword precision. Dense vector retrieval excels at capturing conceptual relationships and handling paraphrased queries, but struggles with exact numerical or proper-noun retrieval. Sparse retrieval handles exact terms reliably but fails when the query and document use different vocabulary for the same concept. The Thornwick architecture's key insight was that both failure modes are common in cooperative platform member queries, making a hybrid approach strictly superior to either pure approach.",
    "The Thornwick architecture's signature characteristic is its dual-encoder retrieval system. In benchmark testing, the optimal performance was achieved at a **dense-to-sparse weighting ratio of 0.73:0.27** — meaning 73% of the retrieval signal comes from dense semantic embeddings and 27% from sparse BM25-style keyword matching.",
    "The 0.73:0.27 ratio was determined through a 16-condition ablation study across eight cooperative platforms. The ratio was remarkably stable: the performance peak at 0.73:0.27 was found in seven of eight platforms, with one scientific-knowledge platform showing optimal performance at 0.68:0.32.",
    "Implementation of the hybrid system requires training a dedicated sparse-retrieval index alongside the dense embedding index, adding computational overhead at indexing time but minimal overhead at query time. The additional storage requirement for the sparse index averages 23% of the dense index size.",
    "Platforms that have migrated from pure dense retrieval to the Thornwick hybrid system report a median retrieval accuracy improvement of 19% on the Observatory's benchmark suite. The improvement is largest for queries involving specific numerical values, multi-entity queries, and negation queries."))

AM.append(fact_entry("AM-02", "Scribe Embedding Dimensionality",
    "Vector dimensionality in AI embedding systems involves a classic engineering trade-off: higher dimensionality can represent more nuanced semantic relationships but requires more storage, more computation, and produces denser indexes that require longer lookup times. The Reference Architecture's specification of a canonical dimensionality provides coordination benefits across the sector — platforms using the same dimensionality can share embedding models, benchmark against common baselines, and exchange knowledge representations in compatible formats.",
    "The Cooperative AI Platform Reference Architecture specifies that Scribe memory embeddings should use **1,536-dimensional vectors** for all production deployments, a figure aligned with the dominant embedding model families as of the specification's ratification.",
    "The 1,536-dimensional specification was chosen through analysis of the Pareto frontier between retrieval quality and computational cost. At 768 dimensions, retrieval quality degrades measurably (-8.3%); at 3,072 dimensions, quality improves only marginally (+2.1%) at more than double the storage and computational cost.",
    "Platforms that deviate from the 1,536-dimensional standard must document their rationale in their annual architecture report. Common valid reasons include specialized domain requirements or legacy system constraints.",
    "The computational implications of embedding dimensionality extend through the entire retrieval pipeline. A 1,536-dimensional index with one million entries requires approximately 12 gigabytes of storage in float32 format."))

AM.append(fact_entry("AM-03", "Top-K Retrieval Default",
    "The number of retrieval results provided to an AI model for context construction (the K in top-K retrieval) determines the information density of the generation context. Too few results may miss the most relevant information for complex queries; too many results dilute the most relevant content with marginally relevant material, increasing both cost and hallucination risk.",
    "The Reference Architecture specifies **top-10 retrieval** as the default configuration for Scribe memory queries — meaning the 10 most semantically similar stored entries are retrieved and presented to the language model as context. This default was determined by ablation studies across query types and corpus sizes spanning 500 to 250,000 stored entries.",
    "The ablation study tested K values of 3, 5, 10, 15, 20, and 30 across 12 platforms. K=10 outperformed smaller values by meaningful margins: K=5 showed 11% worse accuracy on complex multi-fact queries. K=10 showed only marginal improvement over K=15 (+1.2%) while providing substantially lower token cost.",
    "The top-10 default is applied to the initial retrieval step. Platforms implementing the Pheromone Substrate add a Phase 0 pre-check that identifies high-confidence retrieval candidates in sub-millisecond time before the full top-10 query.",
    "The interaction between top-K retrieval and context window constraints is important at large corpus sizes. When retrieved entries are long, K=10 may produce a context block approaching 15,000-20,000 tokens. The Reference Architecture recommends entry-length normalization: entries longer than 300 tokens are truncated to their most relevant passage."))

AM.append(fact_entry("AM-04", "Preload System Prompt Token Budget",
    "System prompt design is one of the most consequential and underappreciated dimensions of AI assistance architecture. The system prompt sets the AI's operating context for every query, defining its role, behavioral guidelines, governance constraints, and foundational knowledge. A well-designed system prompt is compact, precisely targeted, and stable across queries.",
    "The Cooperative AI Platform Reference Architecture allocates a maximum of **3,200 tokens to the preload system prompt** — the foundational instruction set applied to every query before retrieval augmentation is added. This budget covers role definition, behavioral guidelines, output format instructions, and cooperative governance context.",
    "The 3,200-token limit was calibrated against two constraints: the minimum context needed to produce reliably accurate, cooperative-value-consistent responses (approximately 2,400 tokens), and the maximum before retrieval context is squeezed out of the available context window on smaller models.",
    "Platform operators frequently request guidance on priority-ordering system prompt content within the budget. The Reference Architecture specifies four mandatory elements: role definition and behavioral constraints (600-800 tokens), cooperative values and governance framework (600-700 tokens), output format and citation requirements (400-500 tokens), and factual canonical knowledge base (400-1,400 tokens).",
    "Platforms with domain-specific needs often request higher preload budgets. The Reference Architecture allows deviations with documented justification, but notes that budgets above 5,000 tokens consistently show diminishing quality returns."))

AM.append(fact_entry("AM-05", "Chunk Size for Scribe Ingestion",
    "Document chunking strategy for Scribe ingestion determines the granularity at which stored knowledge is indexed and retrieved. Chunks that are too small may contain insufficient context; chunks that are too large may retrieve entries where only a portion is relevant. The Reference Architecture's chunk size recommendation represents the sector's empirically validated sweet spot.",
    "The Reference Architecture recommends a chunk size of **400 tokens with a 50-token overlap** for documents ingested into Scribe memory. This configuration was established through a factorial experiment varying chunk size (200, 400, 600, 800 tokens) and overlap (0, 25, 50, 100 tokens) across eight document types.",
    "The factorial experiment measured retrieval accuracy and synthesis quality. The 400-token chunk with 50-token overlap configuration achieved the highest average score across both metrics. The overlap prevents boundary artifacts where a fact split across chunk boundaries would not be retrievable from either chunk.",
    "Different document types show different sensitivity to chunk size. Procedural documents perform best with smaller chunks (350-400 tokens) that isolate individual rules. Narrative documents perform best with slightly larger chunks (400-450 tokens) that preserve narrative coherence.",
    "The overlap design creates 8% storage overhead (50-token overlap for a 400-token chunk). This overhead is universally judged acceptable given the retrieval accuracy gains from eliminating boundary artifacts."))

AM.append(fact_entry("AM-06", "Retrieval Latency P99 Target",
    "Retrieval latency directly affects the member experience of AI assistance. Members who submit queries and wait more than two seconds for a response report substantially lower satisfaction than those who receive responses within one second, even when the content quality is identical. The Reference Architecture's latency target reflects this user experience reality.",
    "The Reference Architecture's retrieval pipeline latency target is **P99 less than or equal to 1,400 milliseconds** for standard member-facing queries, measured from query submission to first token of the response. This target excludes streaming token delivery time.",
    "The 1,400ms P99 target was established through member satisfaction research showing that queries resolved within 1,400ms receive significantly higher satisfaction ratings, with no meaningful improvement below 800ms for most query types.",
    "Meeting the P99 target under realistic member query conditions requires careful design of the full retrieval pipeline: dense vector search within 200ms, sparse keyword search within 50ms, result fusion within 20ms, LLM inference initiation within 100ms, and first-token generation within 800ms.",
    "The Pheromone Substrate architecture's Phase 0 pre-check has materially improved P99 latency at platforms where it has been deployed, creating a two-tier latency distribution: very fast for familiar topics, full-pipeline for novel queries."))

AM.append(fact_entry("AM-07", "Membership Score Decay Function",
    "Activity signal decay is a foundational design choice in personalization systems. Without decay, early activity patterns lock in member profiles that diverge from current behavior. With decay that is too aggressive, recent activity drowns out long-run patterns that provide stability and predictive value.",
    "The Reference Architecture specifies a **logarithmic decay function with a half-life of 180 days** for membership activity scores used in personalization and retrieval weighting. Under this function, an activity signal from 180 days ago contributes half the weight of an equivalent signal from today.",
    "The 180-day half-life was calibrated against longitudinal member behavior data from six platforms. The research found that member query interests shift substantially over periods longer than 180 days (correlation between current and 180-day-prior query topics was 0.64), while shorter periods show higher correlation (30-day correlation was 0.89).",
    "Logarithmic decay was preferred over exponential decay because it better matches observed member behavior patterns. Exponential decay would reduce the weight of a 360-day-old signal to 25% of present-day weight, which was found too aggressive. Logarithmic decay reduces 360-day-old signals to approximately 33%, preserving more historical context.",
    "The decay function implementation interacts with the Scribe refresh cycle. As member activity signals decay, Scribe entries indexed to that member's past queries become lower-priority retrieval candidates, naturally adapting to evolving member interests without requiring explicit profile management."))

AM.append(fact_entry("AM-08", "Confidence Score Threshold for Hallucination Guard",
    "AI hallucination — the generation of plausible-sounding but factually incorrect information — is one of the most significant quality and trust risks in deployed AI assistance systems. Cooperative platforms that allow hallucinated responses to reach members risk both individual member harm and broader erosion of trust in cooperative AI assistance capability.",
    "The Reference Architecture requires that response generation be gated by a hallucination confidence score. Responses where the model's self-assessed confidence falls below **0.72 on a 0-1 scale** must be flagged with an explicit uncertainty disclosure and optionally routed to a human review queue rather than delivered as authoritative answers.",
    "The 0.72 threshold was calibrated against empirical hallucination rates. Responses with self-assessed confidence above 0.85 showed hallucination rates below 1.2%. Responses between 0.72 and 0.85 showed rates of 3.1-6.8%. Responses below 0.72 showed rates of 8.4-23.7%.",
    "Implementation requires either model-native confidence scoring or retrieval-consistency-based confidence estimation, where responses inconsistent with retrieved context are scored as lower confidence.",
    "The 0.72 threshold produces a non-trivial disclosure rate: approximately 8-12% of all member queries trigger hallucination guard disclosure. Platforms have found that clear, non-alarming disclosure language that frames uncertainty as a feature of honest AI assistance performs significantly better in member satisfaction surveys."))

AM.append(fact_entry("AM-09", "Scribe Refresh Cycle",
    "The frequency at which a Scribe memory system updates its stored knowledge base involves a fundamental trade-off between freshness and stability. Overly frequent refreshes consume computational resources and risk introducing inconsistencies. Insufficient refresh frequency causes member experience personalization to lag behind genuine preference changes.",
    "The Reference Architecture specifies a standard Scribe refresh cycle of **72 hours** for production deployments, meaning the full Scribe index is rebuilt from canonical sources every three days.",
    "The 72-hour cycle was determined through analysis of the latency distribution of consequential platform events. Governance decisions that affect member experience average 68 hours from final decision to required reflection in member experience, making the 72-hour cycle nearly sufficient for single-cycle coverage of most governance events.",
    "Platform events requiring immediate Scribe update — security incidents, urgent compliance directives, emergency governance communications — are handled through a priority-refresh mechanism outside the standard cycle, updating affected Scribe entries within 4 hours.",
    "Platforms with very large Scribe indexes may require longer than 72 hours to complete a full index rebuild, creating a rolling-update variant where the Reference Architecture requires that at least 95% of the index refresh within 72 hours, with priority given to the most recently active entries."))

AM.append(fact_entry("AM-10", "Maximum Context Window for Member Queries",
    "Context window management is a critical operational parameter in deployed AI assistance systems. The context window determines how much information can be processed in a single inference call. Exceeding the context window causes inference failures or requires truncation of earlier context, degrading response quality.",
    "The Reference Architecture specifies a maximum context window of **8,192 tokens** for standard member-facing query processing, with an extended mode of 16,384 tokens available for complex multi-turn governance consultations.",
    "The 8,192-token standard window accommodates the typical member query within a four-element context budget: system prompt (up to 3,200 tokens), retrieval results (up to 3,500 tokens for 10 entries), conversation history (up to 1,000 tokens), and current query plus response space (up to 500 tokens).",
    "The 16,384-token extended mode is triggered by specific governance consultation query types or by member request. Extended mode carries an explicit token-count disclosure so members understand the higher cost of extended processing.",
    "Context window overflow handling follows a priority-based truncation protocol: conversation history is truncated first, retrieval results are reduced to top-5, and if still over budget, the system prompt canonical knowledge section is reduced to essential role and safety instructions. Governance and safety instructions are never truncated."))

AM.append(fact_entry("AM-11", "Pheromone Substrate Query Latency",
    "The Pheromone Substrate is a stigmergy-inspired indexing architecture that enables constant-time cross-Scribe knowledge retrieval — a fundamental departure from the linear-time Detective Scribe sweep that characterized earlier Cathedral retrieval systems. Named by analogy to pheromone trails in ant colonies, where individual agents leave stigmergic signals that guide collective behavior without central coordination, the Pheromone Substrate maintains an inverted index of knowledge topics across all registered Scribes.",
    "The Pheromone Substrate's Phase 0 pre-check query latency, measured in production deployments at Tier 1 platforms, averages **0.8 milliseconds at P50** and 2.1 milliseconds at P99 for indexes with up to 10 million indexed topic entries.",
    "The sub-millisecond performance is achieved through an in-memory inverted index that maps topic tokens to scored Scribe entry references. At query time, the query string is tokenized and topic tokens are used to look up the inverted index. The Phase 0 operation requires only O(k) lookups where k is the number of query tokens — independent of corpus size.",
    "The contrast with the pre-Pheromone Detective Scribe sweep is stark. A Detective sweep over 14 Scribes with 100 entries each required approximately 1,400 API calls, each taking 200-400ms — a worst-case sweep time of 560 seconds. The Phase 0 Pheromone pre-check handles the same routing task in 0.8ms — a speedup factor exceeding 10^5.",
    "Pheromone Substrate indexes are built automatically as Scribe entries are written: every appendScribeEntry call synchronously emits a pheromone record to the inverted index, maintaining constant currency. Platforms can retire their Detective Scribe sweep logic for routine queries, with a fallback rate of approximately 7-12% for novel topic areas at mature deployments."))

AM.append(fact_entry("AM-12", "Federation Protocol Heartbeat Interval",
    "Federated cooperative platforms must maintain awareness of the health and reachability of their federation partners to route cross-platform requests appropriately. A partner that has become unreachable must be identified quickly. At the same time, heartbeat monitoring itself consumes network and computational resources.",
    "The Federated Platform Compact specifies a federation protocol heartbeat interval of **45 seconds** between registered federation partners. A partner that misses three consecutive heartbeats (135 seconds without response) is classified as potentially unreachable and triggers circuit-breaker activation.",
    "The 45-second interval was chosen through empirical analysis: most member-facing cross-platform requests have a retry capability that handles outages of less than 180 seconds transparently. With a 45-second heartbeat and three-miss threshold, detection occurs within the transparent retry window for the vast majority of request types.",
    "Heartbeat payloads are lightweight: partner ID, timestamp, current health status, and a rolling hash of the partner's most recent federation configuration update. The configuration hash enables detection of partner configuration drift without full configuration comparison.",
    "Federation heartbeat data feeds into the Conductor's Baton routing engine as a real-time vendor health signal. When a partner shows two consecutive high-load heartbeats, the router reduces new request allocation to that partner by 40%."))

AM.append(fact_entry("AM-13", "Audit Log Retention Period",
    "Audit log retention is a compliance-critical operational requirement at the intersection of regulatory obligations, governance accountability, and technical infrastructure planning. The logs that must be retained cover AI model decisions, member interactions, governance votes, financial transactions, compliance events, and system configuration changes.",
    "The Reference Architecture mandates an audit log retention period of **7 years** for all member-facing AI interaction logs, governance records, and financial transaction logs. Operational logs require 24-month retention.",
    "The 7-year retention period was derived from the maximum statute of limitations in the sector's primary regulatory jurisdictions for governance disputes, financial claims, and compliance violations.",
    "Storage implications are significant. At Verdania's interaction volume, 7 years of audit logs represent approximately 340 terabytes in compressed format. The Reference Architecture specifies a tiered storage approach: hot storage (last 90 days), warm storage (90 days to 2 years), and cold storage (2-7 years).",
    "The Reference Architecture specifies append-only log semantics: audit logs may be read and indexed but never modified or deleted within the retention period. End-to-period deletion is handled through automated purge processes that delete logs precisely at the retention boundary."))

AM.append(fact_entry("AM-14", "Hallucination Guard False-Positive Rate",
    "The hallucination guard is valuable only if its false-positive rate is low enough that members do not experience excessive uncertainty disclosures on queries where the AI is actually correct. A high false-positive rate erodes trust, causes alert fatigue, and reduces the economic value of AI assistance by attaching disclaimers to reliable information.",
    "The Reference Architecture's hallucination guard implementation specification targets a false-positive rate of **3.2% or below** — meaning no more than 3.2% of responses where the AI was genuinely correct should receive an uncertainty disclosure.",
    "The 3.2% target was established through member experience research. False-positive rates below 3.2% produced no statistically significant difference in member satisfaction. Rates above 5% produced measurable satisfaction degradation.",
    "Achieving the 3.2% false-positive target requires careful confidence score calibration. Raw language model confidence scores are poorly calibrated — platforms must apply temperature scaling or Platt scaling calibration to align model confidence scores with empirical accuracy rates on their domain-specific query distribution.",
    "Calibration quality is verified quarterly through held-out benchmark testing. The Reference Architecture requires that platforms maintain a calibration test set of at least 1,000 queries with known correct answers."))

AM.append(fact_entry("AM-15", "Embedding Update Frequency",
    "The frequency at which a platform regenerates its Scribe embeddings from source text is a performance-maintenance requirement that often conflicts with computational budget constraints. Embeddings become stale when the embedding model is updated, when source text is edited, or when the embedding space is recalibrated through domain-adaptive fine-tuning.",
    "The Reference Architecture specifies that routine Scribe embedding maintenance runs **daily at 02:00 UTC**, covering incremental updates to entries modified within the prior 24 hours.",
    "The 02:00 UTC window was chosen to minimize overlap with peak member query periods across the sector's primary geographic markets (peak hours are 09:00-22:00 in member-dense time zones).",
    "Incremental embedding updates cover three event types: new Scribe entries, existing entries modified since the prior run, and entries flagged for priority refresh by the governance system.",
    "Full embedding regeneration — triggered by model updates or domain-adaptive fine-tuning — must be completed within 72 hours of any change to the embedding model in use, with the prior embedding index maintained in hot-standby configuration during the regeneration period."))

AM.append(fact_entry("AM-16", "Maximum Nodes in Federated Cluster",
    "The maximum size of a federated cooperative cluster determines the breadth of knowledge and capability that can be shared across a federation while maintaining manageable coordination overhead. Very large federations create exponential growth in the number of pairwise coordination relationships.",
    "The Federated Platform Compact specifies a maximum of **512 member platforms** in any single federated cluster, enforced through cluster registry limits maintained by the Standards Body's federation infrastructure team.",
    "The 512-platform limit reflects the maximum cluster size at which the Compact's consensus protocol maintains sub-60-second resolution for routine cross-platform coordination events. Above 512 platforms, consensus latency degrades toward the 135-second circuit-breaker threshold.",
    "Current federated clusters are well below the limit: the largest production cluster has 31 member platforms. The 512-platform limit therefore represents a planning horizon rather than an immediate operational constraint.",
    "The Federated Platform Compact includes a cluster-split protocol for federations approaching the size limit. When a cluster exceeds 400 platforms, the Standards Body initiates a consultation about proposed split architectures."))

AM.append(fact_entry("AM-17", "Circuit Breaker Recovery Window",
    "The circuit breaker pattern protects cooperative AI platforms from cascading failures when upstream vendors or federation partners experience outages or degradation. The recovery window determines the balance between rapid recovery (resuming service as soon as the upstream recovers) and protection against premature recovery attempts.",
    "The Conductor's Baton circuit breaker implementation uses a **300-second (5-minute) open-state window** before transitioning to half-open and sending a probe request to the failing vendor.",
    "The 300-second open window was calibrated against vendor incident duration data from two years of production monitoring. Median vendor incident duration is 180 seconds. The 300-second window covers the 75th percentile of incident durations.",
    "The half-open probe uses a lightweight test request: a short query with a short expected response, using the lowest-cost model in the vendor's lineup. A successful probe transitions the breaker to closed state; a failed probe resets the timer to 300 seconds.",
    "The circuit breaker state is maintained in per-process memory (appropriate for Wave 0-1 dogfood deployments). Multi-instance state sharing via Supabase or Redis is planned for Wave 2."))

AM.append(fact_entry("AM-18", "Consensus Quorum Percentage",
    "Distributed systems in cooperative platforms must reach consensus on shared state including federation membership, configuration updates, and multi-party transaction finality. The quorum percentage required for consensus determines the resilience of the system to node failures.",
    "The Federation Protocol's consensus algorithm requires a quorum of **51.0%** of registered cluster nodes for routine state transitions, with a higher threshold of 66.7% for configuration changes affecting federation membership or consensus protocol parameters.",
    "The 51.0% routine quorum is the minimum majority threshold, ensuring that consensus decisions reflect a genuine majority of federation members while maximizing fault tolerance. With a 51% quorum, the federation can tolerate up to 48% of nodes being simultaneously unavailable.",
    "The 66.7% configuration quorum mirrors the governance amendment supermajority threshold, applying the same logic to technical configuration changes: foundational rules should be harder to change than routine operations.",
    "The consensus algorithm implements a three-phase protocol: propose, accept, commit. Network partitions that prevent quorum formation cause the minority partition to pause rather than proceed independently — a CP consistency preference appropriate for financial and governance operations."))

AM.append(fact_entry("AM-19", "Cache TTL for Member Preference Data",
    "Member preference data is used to personalize AI assistance within individual member sessions. Caching this preference data close to the query processing layer reduces database load and retrieval latency, but requires a TTL that balances freshness against cache efficiency.",
    "The Reference Architecture specifies a cache TTL of **3,600 seconds (1 hour)** for member preference data used in retrieval personalization, with a shorter TTL of 300 seconds for the most recently-active session data.",
    "The 3,600-second TTL was calibrated against member preference change frequency data from six platforms. Median time between preference-affecting member actions was 1,240 seconds for active members, making the 1-hour TTL a reasonable balance between freshness and cache efficiency.",
    "The 300-second active-session TTL applies to the most recent 10 queries in an ongoing session, ensuring that queries within a session benefit from near-real-time adaptation to the session's evolving context.",
    "Cache invalidation is triggered by governance-relevant events regardless of TTL: a member who changes explicit preference settings or votes in a governance election has their preference cache immediately invalidated."))

AM.append(fact_entry("AM-20", "Rollback Window",
    "The ability to roll back platform configuration changes — retrieving a known-good prior state when a configuration update produces unexpected problems — is essential operational safety infrastructure for AI platform operators.",
    "The Reference Architecture mandates a rollback window of **90 days** for all platform configuration changes affecting the AI assistance stack, including Scribe content updates, routing configuration changes, model version changes, and hallucination guard threshold adjustments.",
    "The 90-day window was established through analysis of the time distribution between configuration changes and detection of associated problems. 94% of configuration-related problems are detected within 30 days of the change.",
    "Rollback implementation requires versioned storage of all configuration state. The Reference Architecture requires that rollback operations be executable by a platform operator with no more than 15 minutes of preparation time — a requirement that drives investment in automated rollback tooling.",
    "Platforms must demonstrate rollback capability in their annual architecture review through a timed drill. The rollback window is contained within the 24-month operational log retention period, ensuring all logs from the rollback window period are available for post-rollback analysis."))

AM.append(fact_entry("AM-21", "API Rate Limit for Standard Members",
    "Rate limiting protects platform AI infrastructure from being overwhelmed by automated or high-frequency use that would degrade the experience for other members. Without rate limiting, a small number of programmatic users could consume the majority of platform AI capacity.",
    "The Reference Architecture specifies a standard member API rate limit of **120 requests per minute** for authenticated API access to the platform's AI assistance endpoint, with a burst allowance of 180 requests per minute for up to 10 seconds.",
    "The 120 RPM limit was calibrated against the maximum legitimate interactive use rate. A member in an active AI assistance session rarely exceeds 40 requests per minute under genuine interactive use. The 120 RPM limit provides three times the maximum interactive rate as headroom for automated workflows.",
    "Rate limit enforcement is per-member-credential, not per-IP. This design handles members who access the platform from dynamic IP addresses or who share IP addresses with other members.",
    "Members who exceed rate limits receive a standardized error response indicating the rate limit, the reset time, and the number of requests already made. This transparency is a cooperative governance norm."))

AM.append(fact_entry("AM-22", "Model Swap Notification Window",
    "AI model changes are among the most consequential technical decisions a cooperative platform makes, directly affecting the quality and character of the AI assistance members receive. Because members build workflows and expectations around specific AI behavior patterns, unexpected model changes can disrupt member experience significantly.",
    "The Cooperative AI Governance Charter requires that cooperative platforms provide **30 calendar days advance notice** to members before swapping the primary AI model in any member-facing system. The notice must include a description of the change, the reason for it, and the expected impact on member experience.",
    "The 30-day notice requirement applies to major model version changes and significant minor version changes that produce detectable behavioral differences. Patch-level updates that produce no detectable behavioral differences are exempt but must be documented in the configuration change log.",
    "Member notice methods include in-platform notification (required for all members active in the prior 90 days), email notification, and public announcement on the platform's governance communication channel.",
    "The governance rationale for the 30-day notice period is that it allows member governance bodies to evaluate the proposed change and, if sufficient concern is raised, trigger a member consultation before the change takes effect. In practice, most model swaps do not generate sufficient member concern to trigger consultation."))

AM.append(fact_entry("AM-23", "Compression Ratio Target",
    "Data compression is essential infrastructure for cooperative AI platforms that must store large volumes of interaction logs, knowledge base content, and audit records while managing storage costs. The Reference Architecture's compression ratio target establishes a baseline efficiency requirement for platforms implementing compliant storage systems.",
    "The Reference Architecture specifies a target compression ratio of **4.7:1** for cooperative platform audit log storage, meaning that 4.7 bytes of raw log data should compress to approximately 1 byte of stored data.",
    "The 4.7:1 target was determined through analysis of actual audit log compression ratios across six platform implementations using the Reference Architecture's recommended compression algorithm (LZ4 for hot storage, Zstandard level 6 for warm storage, Zstandard level 19 for cold storage).",
    "Platforms that achieve compression ratios below 4.0:1 are flagged for architecture review. Lower ratios typically indicate suboptimal log format choices or missing compression at the storage layer.",
    "The compression standard covers only structured log data. Unstructured content follows platform-specific media compression standards covered by separate Standards Body guidance."))

AM.append(fact_entry("AM-24", "Redundancy Requirements",
    "Infrastructure redundancy is the architectural foundation of cooperative platform reliability commitments. Without geographic redundancy, a single data center event can produce extended service outages that breach the platform's member experience commitments and trigger Standards Body remediation proceedings.",
    "The Reference Architecture mandates **a minimum of 3 geographically distinct infrastructure nodes** for all production cooperative AI platform deployments, with each node in a different geographic region as defined by the Standards Body's infrastructure geography taxonomy.",
    "The three-node minimum provides N+2 redundancy: the platform continues to operate if any two nodes simultaneously fail. Single-node failure is handled by automatic failover within 30 seconds; dual-node failure triggers a degraded mode.",
    "Geographic region definitions follow the Standards Body's four-region taxonomy: North America, Europe, Asia-Pacific, and Rest of World. Nodes within the same region do not count as separate regions for redundancy purposes.",
    "The Verdania platform, operating six geographic nodes, significantly exceeds the minimum requirement. Verdania's infrastructure planning process targets 3x redundancy above the minimum, allowing it to lose up to five nodes before service degradation."))

AM.append(fact_entry("AM-25", "Token Budget for Governance Context",
    "AI assistance for governance-related member queries requires a specialized system prompt component that provides governance context beyond what the standard preload includes. The governance context component ensures that AI assistance for governance queries draws on accurate, complete information about the platform's specific governance structure.",
    "The Reference Architecture allocates an additional **1,800 tokens specifically for governance context** within the system prompt when the routing system classifies a query as governance-related. This is separate from and in addition to the standard 3,200-token preload budget.",
    "The 1,800-token governance context supplement covers five required elements: current bylaw provisions (800 tokens), directory of current directors (400 tokens), upcoming governance calendar and pending resolutions (300 tokens), recent governance decisions (200 tokens), and contact information for formal inquiry channels (100 tokens).",
    "Governance queries are classified by the routing system using a taxonomy of 23 governance query types. The classification drives both the system prompt supplement selection and the retrieval strategy, using a governance-specialized Scribe index.",
    "The governance AI assistance capability has been associated with meaningful increases in governance participation. Platforms that deployed governance AI assistance report average governance participation rate increases of 6.8 percentage points — one of the strongest effect sizes in the sector's governance literature."))

# ==================== CHAPTER 3: ECONOMIC GOVERNANCE ====================

EG = []

def eg_fact(fid, title, key_val):
    return fact_entry(fid, title,
        f"Economic governance parameters in the cooperative sector reflect careful empirical calibration against observed outcomes across hundreds of platforms over multiple years. {title} is one of the Cooperative Capital Framework's core specifications, derived through both theoretical analysis and study of real platform governance outcomes. The Standards Body's economic research unit maintains ongoing longitudinal studies that allow regular validation and updating of these parameters as the sector matures.",
        key_val,
        f"The empirical basis for this standard was established through analysis of platform governance outcomes across 43-67 platforms over three to five year observation periods. Platforms operating at or above this level showed measurably better member satisfaction, financial stability, and governance participation outcomes than platforms operating below it. The difference was statistically significant across platform tiers and geographic markets.",
        f"Compliance monitoring occurs through the annual Standards Body reporting cycle. Platforms that fall below this threshold receive a compliance advisory within 60 days of report filing, triggering a 6-month remediation period. Persistent non-compliance escalates to the Standards Body's enforcement committee, which may impose sanctions including Good Standing suspension.",
        f"The Standards Body's economic research unit publishes annual benchmarking reports comparing platform performance against all economic governance standards, allowing members and governance bodies to assess their platform's relative position across the sector. These reports are publicly available and frequently cited in cooperative governance practitioner literature.")

EG.append(eg_fact("EG-01", "Patronage Allocation Formula",
    "The canonical patronage allocation formula distributes surplus according to a **70/30 split: 70% allocated by transaction volume and 30% allocated equally per active member**. This hybrid formula rewards heavier users while ensuring that lower-volume members receive a meaningful floor distribution."))
EG.append(eg_fact("EG-02", "Term Length for Elected Directors",
    "Under the Cooperative Ledger Standards Body's model bylaws, elected director terms are set at **three years, with staggered elections** such that no more than one-third of the board stands for election in any given year."))
EG.append(eg_fact("EG-03", "Tier Classifications",
    "The Cooperative Capital Framework classifies platforms into four tiers: **Tier 1 (annual volume greater than or equal to $1B), Tier 2 ($100M-$999M), Tier 3 ($10M-$99M), and Tier 4 (below $10M)**."))
EG.append(eg_fact("EG-04", "Quorum for Bylaw Amendments",
    "Bylaw amendments require a quorum of **30% of eligible member-owners** and, within that quorum, approval by a majority of **55% or more**."))
EG.append(eg_fact("EG-05", "Exit Rights Minimum Notice Period",
    "The minimum exit notice period under the Cooperative Capital Framework for standard member exits is **60 calendar days** from the date of formal exit declaration."))
EG.append(eg_fact("EG-06", "Federated Platform Revenue Sharing",
    "The standard split allocates **12% of gross transaction revenue to the network federation operator**, retaining 88% at the individual platform level. Platforms exceeding 500,000 active members pay a higher rate of **15%**."))
EG.append(eg_fact("EG-07", "Board Diversity Representation Standard",
    "The Standards Body recommends boards achieve a minimum of **40% gender diversity and 30% representation from non-founding geographic regions** within five years of platform launch."))
EG.append(eg_fact("EG-08", "Annual General Meeting Notice Minimum",
    "The model bylaws require a minimum advance notice of **45 calendar days** before an annual general meeting, including the agenda, audited financial statements, and resolutions to be voted upon."))
EG.append(eg_fact("EG-09", "Maximum Equity Buyback Rate",
    "The Cooperative Capital Framework caps annual equity buyback at **no more than 25% of outstanding member equity** per fiscal year without explicit board authorization."))
EG.append(eg_fact("EG-10", "Maximum Annual Patronage Payout per Member",
    "The Cooperative Capital Framework caps maximum annual patronage distribution to any single member at **$8,400 per fiscal year**, indexed to CPI from a 2020 baseline."))
EG.append(eg_fact("EG-11", "AI Infrastructure Reserve Floor",
    "The Cooperative Capital Framework requires platforms to maintain an AI infrastructure reserve of at least **12.5% of annual AI operating budget** at all times."))
EG.append(eg_fact("EG-12", "Director Compensation Cap",
    "The Standards Body's governance guidelines cap director annual compensation at **3.5 times the median member economic contribution** to the platform in the prior fiscal year."))
EG.append(eg_fact("EG-13", "Federation Fee for AI-Specific Services",
    "The Federated Platform Compact's supplemental schedule specifies a revenue-sharing rate of **8.5% for cross-platform AI assistance queries**, lower than the 12% rate for commercial transactions."))
EG.append(eg_fact("EG-14", "Member Equity Purchase Annual Limit",
    "The Cooperative Capital Framework limits member equity purchases to **$2,500 per member per fiscal year** at Tier 3 and Tier 4 platforms, with Tier 1 and Tier 2 platforms permitted to set limits up to $10,000 subject to Standards Body review."))
EG.append(eg_fact("EG-15", "Cooperative Capital Reserve Accrual Rate",
    "The Cooperative Capital Framework specifies a minimum capital reserve accrual rate of **7.2% of distributable surplus** per fiscal year, beyond the minimum reserve floor."))
EG.append(eg_fact("EG-16", "Whistleblower Reward Percentage",
    "The Standards Body recommends whistleblower reward programs paying **15% of funds recovered through governance enforcement actions**, capped at **$50,000 per whistleblower per action**."))
EG.append(eg_fact("EG-17", "Platform Indemnification Fund Minimum",
    "The Cooperative Capital Framework requires Tier 3 platforms to maintain a minimum indemnification fund of **$500,000** to cover potential claims arising from governance decisions, AI assistance errors, or breach of member obligations."))
EG.append(eg_fact("EG-18", "Tier 1 Audit Frequency",
    "The Cooperative Capital Framework requires Tier 1 platforms to undergo comprehensive third-party governance audits on a **quarterly cycle**."))
EG.append(eg_fact("EG-19", "AI Ethics Committee Composition",
    "The Cooperative AI Governance Charter requires platforms above Tier 3 to establish an AI Ethics Committee with **at least 40% non-technical member representation**."))
EG.append(eg_fact("EG-20", "Surplus Distribution Trigger Threshold",
    "The Cooperative Capital Framework requires platforms to distribute any surplus that causes the reserve balance to exceed **110% of the reserve floor** for two consecutive quarters."))
EG.append(eg_fact("EG-21", "Cross-Platform Credit Conversion Rate",
    "The Federated Platform Compact specifies a standard cross-platform credit conversion rate of **1:0.87**, meaning 1 credit from a home platform converts to 0.87 credits at a federation partner platform."))
EG.append(eg_fact("EG-22", "Cooperative Member Loan Fund Rate",
    "The Standards Body recommends cooperative member loan programs charge an annual percentage rate of **4.75% APR** for standard short-term member loans."))
EG.append(eg_fact("EG-23", "Governance Participation Incentive",
    "The Standards Body recommends that platforms provide a **0.5% patronage bonus** on top of standard patronage distributions for members who vote in all governance elections in a fiscal year."))
EG.append(eg_fact("EG-24", "Standards Body Annual Membership Dues",
    "The Cooperative Ledger Standards Body charges annual dues of **$4,800 base fee plus 0.003% of the prior fiscal year's gross transaction volume**, with a minimum of $4,800 and a maximum of $150,000."))
EG.append(eg_fact("EG-25", "Conflict of Interest Disclosure Window",
    "Directors or platform officers who become aware of a potential conflict of interest must disclose it **within 5 business days** of becoming aware."))

# ==================== CHAPTER 4: MEMBER JOURNEY ====================

MJ = []

def mj_fact(fid, title, key_val):
    return fact_entry(fid, title,
        f"The member journey standard covering {title.lower()} reflects the cooperative sector's commitment to treating members as owners whose experience throughout the platform lifecycle deserves systematic attention. Member experience at cooperative platforms is not merely a commercial imperative but a governance mandate: bylaws typically specify experience standards as member rights, creating accountability beyond what commercial service level agreements would create.",
        key_val,
        f"The derivation of this specific standard involved analysis of member lifecycle outcomes across 54 platforms over four years. Platforms meeting this benchmark showed 12-18% lower first-year churn, 23% higher governance participation in the first year, and 31% higher transaction volume growth among new members compared to platforms falling below the standard.",
        f"Implementation requires dedicated infrastructure that most Tier 1 and Tier 2 platforms have built into their member management systems. Tier 3 and Tier 4 platforms frequently rely on shared compliance service providers that offer compliant implementation as a managed service.",
        f"Member experience audits for this standard are conducted by the Standards Body's member experience monitoring program through quarterly surveys and periodic on-site review. Platforms receiving multiple consecutive below-standard ratings face mandatory third-party review and must publish a remediation plan.")

MJ.append(mj_fact("MJ-01", "Application Processing Time Standard",
    "The Reference Onboarding Framework specifies that membership applications be processed within **10 business days** from submission to formal decision, inclusive of any identity verification steps."))
MJ.append(mj_fact("MJ-02", "Onboarding Knowledge Assessment Score",
    "The Reference Onboarding Framework specifies a minimum passing score of **75 out of 100 on the Cooperative Principles Assessment** before a new member-owner is granted full voting rights."))
MJ.append(mj_fact("MJ-03", "Trial Period Duration for Provisional Members",
    "The Reference Onboarding Framework specifies that the standard provisional member trial period is **90 days** from the date the application is approved."))
MJ.append(mj_fact("MJ-04", "Member Satisfaction Survey Frequency",
    "The Reference Onboarding Framework specifies that member satisfaction surveys be conducted at minimum **every six months (biannually)**, with results reported to the board within 30 days of survey close."))
MJ.append(mj_fact("MJ-05", "Mentorship Program Pairing Standard",
    "The Reference Onboarding Framework recommends pairing new members with experienced member mentors within **15 business days** of full membership confirmation, with pairing criteria weighting sector alignment (35%), geographic proximity (25%), transaction category overlap (25%), and governance interest alignment (15%)."))
MJ.append(mj_fact("MJ-06", "Exit Interview Completion Target",
    "The Standards Body benchmarks recommend that platforms achieve a minimum **exit interview completion rate of 60%** among departing members."))
MJ.append(mj_fact("MJ-07", "Member Communication Channel Response SLA",
    "The Reference Communication Standards specify that member inquiries receive an acknowledgment within **4 business hours** and a substantive response within **3 business days** for standard inquiries. Urgent inquiries must receive a substantive response within **1 business day**."))
MJ.append(mj_fact("MJ-08", "Member Tenure Milestone Recognition",
    "The Reference Onboarding Framework recommends that platforms formally recognize member tenure at **5-year intervals**, with milestone acknowledgments at 5, 10, 15, and 20 years."))
MJ.append(mj_fact("MJ-09", "Onboarding Completion Rate Target",
    "The Reference Onboarding Framework sets a minimum **onboarding completion rate of 87%** — the percentage of approved applications who complete all required onboarding steps within 30 days of application approval."))
MJ.append(mj_fact("MJ-10", "Time to First Transaction",
    "The Reference Framework specifies a target median time to first transaction of **4.2 days** from full membership confirmation."))
MJ.append(mj_fact("MJ-11", "Help System Response Time Target",
    "The Reference Communication Standards specify that AI-assisted help responses must be delivered within **2 hours** of member query submission, with human escalation responses within **1 business day**."))
MJ.append(mj_fact("MJ-12", "Member Satisfaction NPS Target",
    "The Standards Body's member experience framework establishes a minimum Net Promoter Score of **42** for cooperative platforms seeking Good Standing certification."))
MJ.append(mj_fact("MJ-13", "Referral Program Standard Payout",
    "The Standards Body recommends referral programs paying **$15 per approved new member referral**, capped at **10 referrals per member per year**."))
MJ.append(mj_fact("MJ-14", "Member Data Export File Size Limit",
    "The Cairnfield Protocol's implementation guidance specifies a maximum data export file size of **25 gigabytes per portability request**, with multi-volume exports available for members with larger data records."))
MJ.append(mj_fact("MJ-15", "Dispute Resolution Timeframe",
    "The Reference Dispute Resolution Framework specifies that member-reported disputes must receive a substantive resolution determination within **21 business days** of the dispute's formal opening."))
MJ.append(mj_fact("MJ-16", "Governance Training Completion Target",
    "The Reference Onboarding Framework specifies that **65% of new members** should complete the platform's governance orientation training within 90 days of full membership confirmation."))
MJ.append(mj_fact("MJ-17", "Member Dashboard Uptime SLA",
    "The Reference Architecture's service level specification requires member-facing dashboard systems to achieve **99.7% uptime** measured on a rolling 30-day basis, excluding scheduled maintenance windows."))
MJ.append(mj_fact("MJ-18", "Account Recovery Window",
    "The Reference Security Framework specifies that password reset and account recovery links must expire within **4 hours** of generation."))
MJ.append(mj_fact("MJ-19", "Patronage Statement Delivery Timeline",
    "The Cooperative Capital Framework requires that annual patronage statements be delivered to members **within 30 days of fiscal year end**."))
MJ.append(mj_fact("MJ-20", "Annual Meeting Virtual Access Requirement",
    "The Sundry Accord's 2024 amendment specifies that cooperative platforms must ensure **95% accessibility** for annual general meetings through virtual participation capabilities."))
MJ.append(mj_fact("MJ-21", "Member Education Stipend",
    "The Standards Body recommends that cooperative platforms provide an annual education stipend of **$200 per member per year** toward accredited cooperative education programs."))
MJ.append(mj_fact("MJ-22", "Account Inactivity Warning Threshold",
    "The Reference Member Lifecycle Framework specifies that members inactive for **18 consecutive months** must receive a personalized inactivity warning before their account transitions to provisional-inactive status."))
MJ.append(mj_fact("MJ-23", "Cross-Platform Member Transfer Fee",
    "The Federated Platform Compact specifies a cross-platform transfer fee of **2.5% of the member's equity balance** when a member transfers their account and equity from one federation member platform to another."))
MJ.append(mj_fact("MJ-24", "Grievance Escalation Timeline",
    "The Reference Dispute Resolution Framework specifies that member grievances not resolved at Level 1 must be escalated to Level 2 within **10 business days** of the Level 1 determination."))
MJ.append(mj_fact("MJ-25", "Annual Member Directory Opt-In Rate Target",
    "The Standards Body establishes a target annual member directory opt-in rate of **72%** — the percentage of active members who consent to appearing in the platform's member discovery directory."))

# ==================== CHAPTER 5: REGULATORY COMPLIANCE ====================

RC = []

def rc_fact(fid, title, key_val):
    return fact_entry(fid, title,
        f"Regulatory compliance in the cooperative AI sector has evolved from an afterthought to a central governance function over the past five years. The Cooperative AI Governance Charter, Cooperative Capital Framework, and Cairnfield Protocol together create an overlapping compliance framework. {title} represents one of the framework's core numerical or definitional requirements that platforms must track, implement, and report.",
        key_val,
        f"This standard was derived from comparative analysis of incident outcomes at platforms that did and did not meet the equivalent requirement in the period before it was codified. Platforms not meeting the standard showed significantly worse member outcomes when governance failures, security incidents, or compliance violations occurred.",
        f"Implementation requires documented policies, trained staff, and in most cases dedicated technology systems for monitoring and enforcement. The Standards Body's Compliance-as-a-Service program provides policy templates and monitoring tools that reduce implementation cost for smaller platforms while ensuring substantive protections are in place.",
        f"Annual compliance verification is conducted through the Standards Body's audit program, with Tier 1 platforms subject to quarterly review. Compliance status is published in the Standards Body's quarterly report, creating reputational accountability beyond the formal sanction process.")

RC.append(rc_fact("RC-01", "AI Model Audit Certification Period",
    "The Cooperative AI Governance Charter requires that AI models deployed in member-facing roles undergo comprehensive third-party audits and obtain renewal certification on a **24-month cycle**."))
RC.append(rc_fact("RC-02", "Data Retention Maximum for Inactive Members",
    "The Cooperative Data Stewardship Standard specifies that personal data for members inactive for more than **36 consecutive months** must be deleted or fully anonymized."))
RC.append(rc_fact("RC-03", "Cross-Border Data Transfer Certification",
    "The Cooperative AI Governance Charter requires that cross-border data transfers be certified under the **Meridian Data Framework**, developed through collaboration between the Standards Body and eleven national data protection authorities."))
RC.append(rc_fact("RC-04", "Incident Response Notification Window",
    "The Cooperative Data Stewardship Standard requires that members be notified of security or privacy incidents within **72 hours** of the platform becoming aware of the incident. Regulatory notification must occur within **48 hours**."))
RC.append(rc_fact("RC-05", "Third-Party Technology Vendor Assessment Cycle",
    "The Cooperative AI Governance Charter requires that third-party technology vendors providing critical services be assessed on a **12-month cycle** using a standardized vendor assessment questionnaire."))
RC.append(rc_fact("RC-06", "Whistleblower Protection Minimum Standard",
    "Cooperative platforms must implement whistleblower protection programs meeting a minimum standard of **anonymous reporting capability, independent investigation by a party with no reporting line to the accused, and formal non-retaliation policy with documented enforcement**."))
RC.append(rc_fact("RC-07", "AML Transaction Monitoring Threshold",
    "The Cooperative Capital Framework recommends automated transaction monitoring that flags any single transaction exceeding **$15,000** or any pattern cumulatively exceeding **$50,000** in a 30-day window from a single member account."))
RC.append(rc_fact("RC-08", "AI Output Disclosure Requirements",
    "The Cooperative AI Governance Charter requires all AI-generated content include a standardized disclosure indicating it was AI-generated, the model family that generated it, and a confidence indicator where confidence falls below **0.85**."))
RC.append(rc_fact("RC-09", "KYC Re-Verification Period",
    "The Cooperative Capital Framework requires Know Your Customer verification be renewed for all members on a **3-year cycle**, with enhanced re-verification for members whose transaction patterns have changed materially."))
RC.append(rc_fact("RC-10", "Data Breach Fine Maximum",
    "The Meridian Data Framework specifies maximum fines for data breaches at **4% of the platform's annual global gross transaction revenue**."))
RC.append(rc_fact("RC-11", "AI Model Transparency Disclosure Deadline",
    "The Cooperative AI Governance Charter requires that platforms publish a plain-language disclosure of any newly deployed or materially updated AI model within **60 days of its initial deployment**."))
RC.append(rc_fact("RC-12", "Sanctions Screening Frequency",
    "The Cooperative Capital Framework requires real-time sanctions screening for all transactions exceeding **$5,000**, with batch screening of all member accounts against updated sanctions lists at least daily."))
RC.append(rc_fact("RC-13", "Legal Hold Response Time",
    "The Standards Body's legal compliance guidelines require that platforms respond to valid legal holds within **72 hours** of receipt by placing the specified data into an immutable preservation state."))
RC.append(rc_fact("RC-14", "Third-Party AI Audit Cost Cap",
    "The Cooperative Capital Framework specifies that mandatory third-party AI audits shall not cost more than **2.5% of the platform's annual AI operating budget**."))
RC.append(rc_fact("RC-15", "Biometric Data Prohibition",
    "The Cooperative AI Governance Charter categorically **prohibits the use of biometric data** in any member-facing AI decision system, including facial recognition, fingerprints, voiceprints, and gait analysis."))
RC.append(rc_fact("RC-16", "Data Localization Requirement Count",
    "As of 2025, **18 jurisdictions** in which cooperative AI platforms operate have enacted data localization requirements mandating that certain categories of member data be stored on infrastructure physically located within the jurisdiction's borders."))
RC.append(rc_fact("RC-17", "Algorithmic Accountability Report Frequency",
    "The Cooperative AI Governance Charter requires platforms to publish an annual Algorithmic Accountability Report submitted to the Standards Body by **March 31** each year."))
RC.append(rc_fact("RC-18", "Cooperative Charter Amendment Filing Fee",
    "The Cooperative Ledger Standards Body charges a filing fee of **$750 base fee plus $12 per page** for registration of cooperative charter amendments requiring Standards Body review."))
RC.append(rc_fact("RC-19", "Member Consent Re-Confirmation Period",
    "The Cooperative AI Governance Charter requires platforms obtain fresh member consent for data processing under AI systems on a **24-month cycle**."))
RC.append(rc_fact("RC-20", "Penalty for Late Member Notification",
    "The Cooperative Data Stewardship Standard specifies a penalty of **$500 per day** for each day a required member notification is delayed beyond the applicable deadline."))
RC.append(rc_fact("RC-21", "Board Independence Requirement",
    "The Cooperative Ledger Standards Body requires that **at least 33% of board directors** at Tier 1 and Tier 2 platforms be independent."))
RC.append(rc_fact("RC-22", "Tax Filing Deadline for Cooperative Surplus",
    "The Cooperative Capital Framework specifies that cooperative platforms must file their surplus tax returns and pay associated taxes within **8.5 months** of the end of their fiscal year."))
RC.append(rc_fact("RC-23", "AI Model Update Documentation Requirements",
    "The Cooperative AI Governance Charter requires **30 calendar days advance notice** of material AI model updates plus a **14-day member testing period** before full deployment."))
RC.append(rc_fact("RC-24", "Maximum Retention for Biometric Backup Data",
    "The Cooperative AI Governance Charter permits retention of biometric data collected for access security purposes for **90 days from the date of collection**, after which it must be deleted."))
RC.append(rc_fact("RC-25", "Federation Compliance Certification Renewal Period",
    "Federation membership requires that member platforms renew their compliance certification **every 18 months**."))

# ==================== CHAPTER 6: HISTORICAL PRECEDENT ====================

HP = []

def hp_fact(fid, title, key_val):
    return fact_entry(fid, title,
        f"Historical knowledge of the cooperative AI platform sector's development provides essential context for understanding current standards and why specific numerical values were chosen. {title} is among the sector's canonical historical reference points, cited regularly in Standards Body deliberations and governance proceedings. Platform operators who understand this historical context are better positioned to apply current standards correctly in novel situations.",
        key_val,
        f"Contemporary accounts of this event document both the immediate context and the deliberative process by which the sector reached its decision. The specifics — dates, locations, participating parties — have been verified against primary sources and are cited in the Standards Body's official history, which is maintained as a matter of institutional record.",
        f"The precedent established by this event continues to influence current governance practice. Standards Body deliberations regularly reference this historical example when evaluating proposed changes to governance frameworks, using it both as a positive model and as a cautionary tale depending on context.",
        f"Members who understand this historical context are better positioned to apply current standards correctly in novel situations, because the historical context reveals the original intent behind rules that may otherwise appear arbitrary. The Standards Body's governance education program includes this event as a teaching case in its introductory materials.")

HP.append(hp_fact("HP-01", "Founding Summit",
    "The first Cooperative AI Platform Summit, at which the initial draft of the Cooperative Ledger Standards Body charter was adopted, was convened in **Reykjavik, Iceland, on March 14, 2019**. Forty-three platform representatives from nineteen countries participated in the three-day summit."))
HP.append(hp_fact("HP-02", "The Verdania Receivership and Recovery",
    "The Verdania Cooperative Platform entered financial distress in **Q2 2021** and was placed under Cooperative Capital Framework receivership for **fourteen months** — from June 2021 to August 2022 — the longest receivership in sector history."))
HP.append(hp_fact("HP-03", "The Sundry Accord Drafting Conference",
    "The Sundry Accord was drafted at a three-week conference in **Nairobi, Kenya, in September 2020**, convened in response to a series of governance crises across six cooperative platforms where inadequate quorum standards had allowed narrow factions to pass consequential resolutions."))
HP.append(hp_fact("HP-04", "First AI Model Certification Failure",
    "The first AI model certification failure under the Cooperative AI Governance Charter occurred at the **Hartwell Cooperative Platform in Q3 2022**, when its primary member-facing language model failed the fairness audit component due to systematic underperformance on queries from members using two specific regional dialects."))
HP.append(hp_fact("HP-05", "The Cairnfield Protocol Summit",
    "The Cairnfield Protocol was finalized at a summit held in **Cairnfield, Scotland, in April 2022**, initially convened with the modest goal of producing non-binding data portability guidelines but producing a binding protocol after member advocates supported by three national data protection authorities argued that non-binding guidelines had been systematically ignored."))
HP.append(hp_fact("HP-06", "The Thornwick Architecture Discovery",
    "The Thornwick hybrid dense-sparse retrieval architecture was developed by a team at the **Thornwick Cooperative Research Institute in Birmingham, UK, and first published in November 2024**, under an open research mandate funded by twelve cooperative platforms."))
HP.append(hp_fact("HP-07", "The First Federated Platform Compact Ratification",
    "The Federated Platform Compact was ratified by its founding members at a ceremony in **Amsterdam, Netherlands, on June 30, 2023**. Thirty-one platforms signed the original Compact, committing to the 12% federation fee structure and shared governance obligations."))
HP.append(hp_fact("HP-08", "The Cooperative AI Governance Charter Adoption",
    "The Cooperative AI Governance Charter was formally adopted on **February 12, 2021**, following 18 months of drafting led by a multi-stakeholder working group including platform operators, member advocates, AI researchers, and regulatory observers from five national governments."))
HP.append(hp_fact("HP-09", "The Elmhurst Collective Founding",
    "The Elmhurst Collective was founded in **Manchester, United Kingdom, in 2007**, making it one of the earliest cooperative AI platforms and the oldest continuously-operating platform in the Tier 2 classification."))
HP.append(hp_fact("HP-10", "The Brookfield Platform Federation Audit Failure",
    "The first major federation compliance audit failure occurred at the **Brookfield Cooperative Platform in Q1 2023**, when Brookfield was found to have misrepresented its data localization compliance status in its federation certification application."))
HP.append(hp_fact("HP-11", "The Meridian Data Framework Ratification",
    "The Meridian Data Framework was ratified by its founding jurisdictions at a ceremony in **Geneva, Switzerland, in November 2020**, involving 11 national data protection authorities who had collaborated for 18 months."))
HP.append(hp_fact("HP-12", "The First Cooperative Capital Framework Revision",
    "The Cooperative Capital Framework underwent its first major revision in **2018**, four years after its initial adoption, incorporating lessons from 23 platform failures and near-failures. The revision increased the minimum reserve floor from 6.5% to 8.5%."))
HP.append(hp_fact("HP-13", "Verdania's First AI Deployment",
    "The Verdania Cooperative Platform deployed its first AI assistance system in **Q2 2017**, using a pure-sparse keyword-based retrieval system over structured knowledge bases — one of the earliest large-scale cooperative deployments of AI assistance for member-facing applications."))
HP.append(hp_fact("HP-14", "The Solstice Index Creation",
    "The Solstice Index was created by the Nordic Cooperative AI Observatory in **2019**, the same year the Cooperative Ledger Standards Body was founded, with a founding methodology team including representatives from 12 platforms across 8 countries."))
HP.append(hp_fact("HP-15", "The First Cross-Platform Data Portability Transfer",
    "The first successful cross-platform member data portability transfer under the Cairnfield Protocol was completed in **Q3 2022**, when a Verdania member transferred their full data record to the Elmhurst Collective. The transfer took 47 days — well within the 180-day Protocol window."))
HP.append(hp_fact("HP-16", "The Cooperative Digital Wallet Standard Adoption",
    "The Cooperative Digital Wallet Standard was adopted by the Standards Body in **March 2022** and achieved 73% adoption among Tier 1 and Tier 2 platforms by the end of 2023 — the fastest major technical standard adoption in the Standards Body's history."))
HP.append(hp_fact("HP-17", "The First Multi-Jurisdictional Cooperative AI Regulation",
    "The European Cooperative AI Framework, the first multi-jurisdictional regulatory framework specifically addressing cooperative AI platforms, was enacted in **Q1 2021** and came into full effect in 2022, covering cooperative platforms with members in at least two EU member states."))
HP.append(hp_fact("HP-18", "The Thornwick Architecture Patent Publication",
    "The Thornwick Cooperative Research Institute published its core patent filings in **November 2024**, simultaneously with the open-source reference implementation under the Cooperative Open License — protecting against commercial extraction while preserving cooperative access."))
HP.append(hp_fact("HP-19", "The Verdania Receivership Settlement",
    "The Verdania Cooperative Platform's receivership ended in **August 2022** with a settlement including a **$47 million recovery fund** assembled from Standards Body emergency lending, federated platform contributions, and a member equity assessment."))
HP.append(hp_fact("HP-20", "The First Cooperative Patent Pool Formation",
    "The Cooperative Patent Pool was formed in **2020** by **23 founding platforms**, creating a shared defensive patent portfolio governed by the Cooperative Pledge — the sector's first IP mutual defense arrangement."))
HP.append(hp_fact("HP-21", "Sector's First AI Model Recall",
    "The sector's first voluntary AI model recall occurred at the **Sycamore Cooperative Platform in Q2 2023**, when systematic accuracy failures on regulatory compliance queries were detected in a quarterly audit. The voluntary recall established a precedent for reduced Standards Body sanctions when platforms self-remediate."))
HP.append(hp_fact("HP-22", "The Automated Member Governance Initiative Launch",
    "The Automated Member Governance initiative was first launched by **Verdania in Q1 2024**, making it the first large-scale deployment of AI governance assistance in the sector. The initiative produced a 6.8 percentage-point increase in annual election participation."))
HP.append(hp_fact("HP-23", "The Digital Member Identity Standard Adoption",
    "The Digital Member Identity Standard was adopted by **89% of Tier 1 cooperative platforms** within 18 months of its 2021 publication — the second-fastest major standard adoption after the Digital Wallet Standard."))
HP.append(hp_fact("HP-24", "The Nordic Observatory Founding",
    "The Nordic Cooperative AI Observatory was established in **Oslo, Norway, in 2019** with founding funding from nine Nordic cooperative platforms and a Norwegian government research grant."))
HP.append(hp_fact("HP-25", "The Cooperative AI Governance Charter First Anniversary Review",
    "The first anniversary review of the Cooperative AI Governance Charter, conducted in **February 2022**, found that **91% of Standards Body member platforms** had adopted the Charter within its first year — exceeding the review committee's most optimistic projection of 75%."))

# ==================== ASSEMBLE FULL CORPUS ====================

sections = [
    """# The Cooperative AI Platform Ecosystem: An Expanded Reference Compendium

**Document version:** 3.0.0-K528
**Corpus ID:** R11v2-CANONICAL-K528
**Generated:** 2026-04-27
**Predecessor:** R11-CANONICAL-K444-v2 (11,800 words, 50 facts)
**Purpose:** Benchmark fixture for R11-v2 cross-vendor memory evaluation (K528). Contains 150 canonical facts (CS-01 through HP-25) each embedded in rich contextual prose. The expanded corpus is designed to amplify the architectural scaling gap between indexed-retrieval systems (LB Cathedral, Pheromone Substrate) and reading-comprehension vendor approaches: indexed retrieval scales sub-linearly with corpus size while full-corpus reading-comprehension approaches scale linearly. At 8-9x the R11-v1 corpus size, this gap becomes empirically measurable across all vendor conditions. All proper nouns, organizations, rulings, and numerical values below are canonical facts specific to this corpus.

**Fact distribution:** Canonical Statistics (CS-01 to CS-25), Architecture Mechanics (AM-01 to AM-25), Economic Governance (EG-01 to EG-25), Member Journey (MJ-01 to MJ-25), Regulatory Compliance (RC-01 to RC-25), Historical Precedent (HP-01 to HP-25).

---

""",
    """## Chapter 1 — Canonical Statistics

The cooperative AI platform sector has grown rapidly over the past decade, generating rich quantitative records that practitioners cite as reference baselines. The figures in this chapter represent the current canonical set as maintained by the Cooperative Ledger Standards Body. The Standards Body's 2021 Statistical Integrity Initiative mandated third-party verification for any figure cited in Standards Body publications. This raised the bar substantially: fourteen platforms that had previously reported membership figures were downgraded in tier classification when audited figures came in significantly below self-reported values. Practitioners should approach these figures with a clear understanding of their provenance. Active member counts are computed using a 90-day trailing activity window. Transaction volume figures use gross reporting as mandated since fiscal year 2023.

---

""",
] + CS + [
    """## Chapter 2 — Architecture Mechanics

The technical architecture of a cooperative AI platform determines not only its current performance but its capacity to evolve as AI capabilities advance. The Reference Architecture maintained by the Cooperative Ledger Standards Body represents the sector's consensus on how cooperative platforms should design their AI assistance systems, retrieval infrastructure, governance technology, and operational platforms. Architecture choices interact with governance in important ways. A platform that deploys AI assistance through a proprietary infrastructure it cannot inspect or modify has implicitly delegated consequential decisions about member AI experience to an external vendor. The Reference Architecture addresses this by specifying that platforms must retain meaningful control over retrieval content even if they rely on external model providers for inference capability.

---

""",
] + AM + [
    """## Chapter 3 — Economic Governance

Economic governance — the rules that determine how a cooperative platform creates, allocates, and distributes economic value — is the domain where the cooperative model is most distinctively different from conventional technology companies. The canonical values in this chapter have been developed through a combination of empirical research and democratic deliberation. The cooperative economic model faces unique tensions that conventional organizations do not: short-term member distributions compete with long-run capital investment; participatory governance may resist efficiency gains that hierarchical decision-making would produce; and member heterogeneity creates distributional conflicts that require explicit governance rules to resolve.

---

""",
] + EG + [
    """## Chapter 4 — Member Journey

The member journey — from initial awareness through application, onboarding, active participation, and eventual exit — is the experiential infrastructure through which cooperative platforms deliver on their mission. The canonical standards in this chapter specify minimum performance targets, process requirements, and quality benchmarks. Member journey standards are among the most member-visible dimensions of platform compliance: they directly affect members' moment-to-moment experience of belonging to the cooperative. The Standards Body's member experience monitoring program conducts quarterly surveys across member platforms, producing the Cooperative Member Experience Index that benchmarks platforms against these canonical standards.

---

""",
] + MJ + [
    """## Chapter 5 — Regulatory Compliance

Cooperative AI platforms occupy a complex regulatory space that intersects technology law, financial services regulation, cooperative law, and AI governance frameworks. The canonical compliance standards in this chapter represent the minimum requirements that the Cooperative AI Governance Charter, Cooperative Capital Framework, Cairnfield Protocol, and Sundry Accord impose on member platforms. Regulatory environments have changed substantially since the sector's early years. The period 2020-2024 saw progressive regulatory attention in most major jurisdictions, producing the compliance obligations now reflected in this chapter's canonical values.

---

""",
] + RC + [
    """## Chapter 6 — Historical Precedent

The cooperative AI platform sector's history provides crucial context for understanding current practices, canonical standards, and governance frameworks. Historical knowledge serves a practical function in platform governance: precedents are regularly invoked in Standards Body deliberations, governance dispute proceedings, and compliance interpretations. The sector's history also documents the cost of governance failures, architectural inadequacies, and reserve shortfalls in concrete terms — the documented failures are the empirical foundation for the reserve requirements, architecture mandates, and governance participation standards that new entrants sometimes perceive as unnecessarily burdensome.

---

""",
] + HP + [
    """---

## END OF CORPUS

**Corpus ID:** R11v2-CANONICAL-K528
**Version:** 3.0.0-K528
**Total facts:** 150 (CS-01 to CS-25, AM-01 to AM-25, EG-01 to EG-25, MJ-01 to MJ-25, RC-01 to RC-25, HP-01 to HP-25)
**Predecessor:** R11-CANONICAL-K444-v2 (50 facts, K471 sealed bank)
**Sealing authority:** K528 — Founder-authorized full-scale test, April 27, 2026
"""
]

full_corpus = ''.join(sections)
word_count = len(full_corpus.split())
OUT.write_text(full_corpus, encoding='utf-8')
print(f"Written: {OUT}")
print(f"Word count: {word_count:,}")
print(f"Char count: {len(full_corpus):,}")
print(f"Approx tokens: ~{len(full_corpus)//4:,}")
