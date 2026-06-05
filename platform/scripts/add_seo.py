import os, re

pages_dir = r"C:\Users\Administrator\Documents\LianaBanyanPlatform\platform\src\pages"

seo_data = {
    "LetsMakeDinnerPage": ("Let's Make Dinner | Liana Banyan", "Find home-cooked meals from neighbors in your area. Chefs keep 83.3% of every meal. Ethical local food, built on cooperation.", "https://lianabanyan.com/initiatives/lets-make-dinner"),
    "LetsMakeBreadPage": ("Let's Make Bread | Liana Banyan", "Cooperative artisan bread baking circles. Share recipes, coordinate baking runs, and sell locally with 83.3% kept by the baker.", "https://lianabanyan.com/initiatives/lets-make-bread"),
    "FamilyTablePage": ("The Family Table | Liana Banyan", "Share meals and cooking sessions with your community. Potluck coordination, ingredient pooling, and Marks for hosting.", "https://lianabanyan.com/initiatives/family-table"),
    "RallyGroupPage": ("Rally Group | Liana Banyan", "Organize cooperative group actions in your community. No ads, no algorithms -- just neighbors coordinating.", "https://lianabanyan.com/initiatives/rally-group"),
    "JukeboxInitiative": ("Jukebox | Liana Banyan", "A community music platform where artists keep 83.3%. Discover, share, and support local musicians cooperatively.", "https://lianabanyan.com/initiatives/jukebox"),
    "HarperGuildPage": ("Harper Guild | Liana Banyan", "A cooperative guild for writers and storytellers. Publish, share, and earn with 83.3% going to the creator.", "https://lianabanyan.com/initiatives/harper-guild"),
    "VSLPage": ("VSL | Liana Banyan", "The Liana Banyan community media and video-sharing layer. Creators keep 83.3% -- no ad revenue splits.", "https://lianabanyan.com/initiatives/vsl"),
    "DidaskoPage": ("Didasko | Liana Banyan", "Cooperative learning and tutoring marketplace. Educators keep 83.3%. Community-governed education, not EdTech extraction.", "https://lianabanyan.com/initiatives/didasko"),
    "PowerToThePeoplePage": ("Power to the People | Liana Banyan", "Community-owned energy coordination and Battery Dispatch network. Cooperative power for neighborhoods.", "https://lianabanyan.com/initiatives/power-to-the-people"),
    "BrassTacksPage": ("Brass Tacks | Liana Banyan", "Cooperative legal documents, contracts, and resources for community businesses. Plain-language, member-governed.", "https://lianabanyan.com/initiatives/brass-tacks"),
    "LetsGoShoppingPage": ("Let's Go Shopping | Liana Banyan", "Community-coordinated group buying and local shopping trips. Reduce costs and emissions through cooperative purchasing.", "https://lianabanyan.com/initiatives/lets-go-shopping"),
    "LetsGetGroceriesPage": ("Let's Get Groceries | Liana Banyan", "Cooperative grocery coordination for neighborhoods. Coordinate bulk buys, split orders, and support local farms.", "https://lianabanyan.com/initiatives/lets-get-groceries"),
    "HouseholdConciergePage": ("Household Concierge | Liana Banyan", "Neighbor-to-neighbor household task coordination. No gig economy extraction -- providers keep 83.3%.", "https://lianabanyan.com/initiatives/household-concierge"),
    "HealthAccordsPage": ("Health Accords | Liana Banyan", "Community health coordination and mutual aid. Cooperative health resources, medication access, and care coordination.", "https://lianabanyan.com/initiatives/health-accords"),
    "HearthInitiativePage": ("Hearth Initiative | Liana Banyan", "Community warmth and home energy mutual aid. Cooperative winter preparedness and household support.", "https://lianabanyan.com/initiatives/hearth"),
    "CottageLawPage": ("Cottage Law | Liana Banyan", "Know your cottage food and small-business rights. Community-curated legal guides for home-based food producers.", "https://lianabanyan.com/initiatives/cottage-law"),
    "SpinoutsIndexPage": ("Spinouts | Liana Banyan", "Cooperative spinout companies seeded from Liana Banyan initiatives. Community-owned businesses growing from the platform.", "https://lianabanyan.com/spinouts"),
    "DefenseKlausSpinoutPage": ("Defense Klaus | Liana Banyan Spinout", "Community defense and neighborhood safety cooperative spinout from the Liana Banyan platform.", "https://lianabanyan.com/spinouts/defense-klaus"),
    "BatteryDispatchSpinoutPage": ("Battery Dispatch | Liana Banyan Spinout", "Community energy storage and dispatch cooperative. A spinout from the Power to the People initiative.", "https://lianabanyan.com/spinouts/battery-dispatch"),
    "StandInTheGapSpinoutPage": ("Stand in the Gap | Liana Banyan Spinout", "Community mutual aid and gap-filling cooperative spinout. Neighbors supporting neighbors cooperatively.", "https://lianabanyan.com/spinouts/stand-in-the-gap"),
    "MnemosyneCSpinoutPage": ("Mnemosyne-C | Liana Banyan Spinout", "Cooperative knowledge archiving and community memory system. A spinout from the Liana Banyan platform.", "https://lianabanyan.com/spinouts/mnemosyne-c"),
    "HarperGuildSpinoutPage": ("Harper Guild Spinout | Liana Banyan", "The Harper Guild as a standalone cooperative company. Writers, storytellers, and creators building a member-owned publishing house.", "https://lianabanyan.com/spinouts/harper-guild"),
    "AnchorSpinoutPage": ("Anchor | Liana Banyan Spinout", "Community anchoring and place-based cooperative services. A spinout seeded by the Liana Banyan platform.", "https://lianabanyan.com/spinouts/anchor"),
    "CaiBonfirePage": ("CAI Bonfire | Liana Banyan Spinout", "Cooperative AI governance and community-owned intelligence tools. A Liana Banyan spinout for ethical AI deployment.", "https://lianabanyan.com/spinouts/cai-bonfire"),
    "MapAndCompassPage": ("Map and Compass | Liana Banyan Spinout", "Community navigation and local knowledge cooperative. A spinout focused on place-based community intelligence.", "https://lianabanyan.com/spinouts/map-and-compass"),
    "GovernanceAuditPage": ("Governance Audit | Liana Banyan", "Immutable, public log of all governance actions on the Liana Banyan platform. Votes, appeals, elections, and ratifications.", "https://lianabanyan.com/governance/audit"),
    "GovernanceStarChamberPage": ("Star Chamber | Liana Banyan Governance", "Senior governance review body for Liana Banyan. Appeals, deep reviews, and platform-wide policy decisions.", "https://lianabanyan.com/governance/star-chamber"),
    "GovernancePedestalPage": ("Governance Pedestal | Liana Banyan", "Community pedestal governance and innovation recognition. Vote on and recognize the best cooperative innovations.", "https://lianabanyan.com/governance/pedestal"),
    "BountyFeedPage": ("Bounty Feed | Liana Banyan", "Live feed of community bounties and cooperative tasks. Earn Marks by completing bounties for your community.", "https://lianabanyan.com/bounty-feed"),
    "SubstitutionExplainerPage": ("Substitution Explainer | Liana Banyan", "How cooperative substitution works on Liana Banyan. Understand demand aggregation and substitution protecting member pricing.", "https://lianabanyan.com/substitution-explainer"),
    "BanyanMetricPage": ("Banyan Metric | Liana Banyan", "The community health score for Liana Banyan. Track cooperative vitality, member engagement, and platform sustainability.", "https://lianabanyan.com/banyan-metric"),
    "ThermometerPage": ("Thermometer | Liana Banyan", "Platform launch progress thermometer. Track the Liana Banyan cooperative path to full community funding and launch.", "https://lianabanyan.com/thermometer"),
    "MSAPage": ("Mutual Service Agreement | Liana Banyan", "The Liana Banyan Mutual Service Agreement. Cooperative member obligations and platform service terms in plain language.", "https://lianabanyan.com/msa"),
}

import_line = 'import { usePageSEO } from "@/hooks/usePageSEO";\n'
done = 0
skipped = 0

for page_name, (title, desc, canonical) in seo_data.items():
    fp = os.path.join(pages_dir, page_name + ".tsx")
    if not os.path.exists(fp):
        print(f"SKIP (not found): {page_name}")
        skipped += 1
        continue

    with open(fp, "r", encoding="utf-8") as f:
        lines = f.readlines()

    content = "".join(lines)
    if "usePageSEO" in content:
        print(f"SKIP (exists): {page_name}")
        skipped += 1
        continue

    # Find last import line index
    last_import_idx = -1
    for i, line in enumerate(lines):
        if line.startswith("import "):
            last_import_idx = i

    if last_import_idx == -1:
        print(f"SKIP (no imports): {page_name}")
        skipped += 1
        continue

    # Find export default function line
    fn_name = None
    fn_line_idx = -1
    for i, line in enumerate(lines):
        m = re.match(r"^export default function (\w+)", line)
        if m:
            fn_name = m.group(1)
            fn_line_idx = i
            break

    if fn_name is None:
        print(f"SKIP (no default fn): {page_name}")
        skipped += 1
        continue

    # Build hook call
    hook = f'  usePageSEO({{\n    title: "{title}",\n    description: "{desc}",\n    canonical: "{canonical}",\n  }});\n'

    # Insert import after last import
    lines.insert(last_import_idx + 1, import_line)

    # Recalculate fn_line_idx after insertion
    if fn_line_idx > last_import_idx:
        fn_line_idx += 1

    # Find opening brace of function and insert hook after it
    inserted = False
    for i in range(fn_line_idx, min(fn_line_idx + 5, len(lines))):
        if lines[i].rstrip().endswith("{"):
            lines.insert(i + 1, hook)
            inserted = True
            break

    if not inserted:
        print(f"SKIP (no open brace): {page_name}")
        skipped += 1
        continue

    with open(fp, "w", encoding="utf-8") as f:
        f.writelines(lines)

    print(f"DONE: {page_name}")
    done += 1

print(f"\nTotal: {done} done, {skipped} skipped")
