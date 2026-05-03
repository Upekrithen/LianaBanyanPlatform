"""
Knight 1 of 8 — Bushel 1 The Reckoning — PUDDINGs Shard Synthesis Engine
TITAN BP018 | synthesis_class=reckoning_bishop_finding | cohort_class=federation_member

Reads all PUDDING files from BISHOP_DROPZONE/05_Puddings/ (canonical source),
produces per-Pudding synthesis entries, writes to:
  ~/.claude/state/reckoning/knight_1_puddings.synthesis.jsonl

Run: python the_shadow/scripts/synthesize_puddings_knight1.py
"""

import json
import re
import hashlib
import os
import sys
from pathlib import Path
from datetime import datetime, timezone

WORKSPACE = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform")
PUDDINGS_DIR = WORKSPACE / "BISHOP_DROPZONE" / "05_Puddings"
LEDGER_PATH = Path(r"C:\Users\Administrator\.claude\state\reckoning\knight_1_puddings.synthesis.jsonl")

STATS_PATH = Path(r"C:\Users\Administrator\.claude\state\reckoning\knight_1_stats.json")

SESSION_ID = "K_BUSHEL1_RECKONING_KNIGHT1"
TS_START = datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Extraction helpers
# ---------------------------------------------------------------------------

def extract_pudding_number(filename: str) -> int | None:
    """Extract primary integer from PUDDING_NNN_ or PUDDING_NN_ filename."""
    m = re.match(r"PUDDING_0*(\d+)_", filename)
    if m:
        return int(m.group(1))
    # Handle PUDDING_23_ (no leading zero padding)
    m = re.match(r"PUDDING_(\d+)[_.]", filename)
    if m:
        return int(m.group(1))
    return None


def extract_title(content: str) -> str:
    """First H1 heading."""
    for line in content.splitlines():
        line = line.strip()
        if line.startswith("# "):
            return line[2:].strip()
    # Fallback: first non-empty line
    for line in content.splitlines():
        if line.strip():
            return line.strip()
    return "UNKNOWN"


def extract_session(content: str, filename: str) -> str:
    """Extract Bishop session ID (e.g., B072)."""
    # From filename
    m = re.search(r"_(B\d+)\.md$", filename, re.IGNORECASE)
    if m:
        return m.group(1).upper()
    # From content metadata
    m = re.search(r"\*\*Session\*\*:\s*(B\d+|K\d+)", content, re.IGNORECASE)
    if m:
        return m.group(1).upper()
    m = re.search(r"Session:\s*(B\d+|K\d+)", content)
    if m:
        return m.group(1).upper()
    m = re.search(r"Bishop\s+(B\d+)", content)
    if m:
        return m.group(1).upper()
    return "UNKNOWN"


def extract_innovations(content: str) -> list[str]:
    """Extract innovation numbers and names."""
    innovations = []
    # Pattern: #NNN (InnovationName) or Innovation #NNN
    for m in re.finditer(r"#(\d{3,4})\s+\(([^)]+)\)", content):
        innovations.append(f"#{m.group(1)} {m.group(2)}")
    if not innovations:
        # Pattern: Innovations Referenced: #2139, #2140
        m = re.search(r"Innovations?\s+Referenced[:\s]+([^\n]+)", content)
        if m:
            refs = re.findall(r"#(\d+)", m.group(1))
            innovations = [f"#{r}" for r in refs]
    if not innovations:
        # Any #NNNN pattern in first 500 chars (header area)
        refs = re.findall(r"#(\d{3,4})", content[:500])
        innovations = [f"#{r}" for r in refs[:6]]
    return innovations[:8]  # cap at 8


def extract_founder_voice_quotes(content: str) -> list[str]:
    """Extract italicized quotes or quoted strings as Founder voice."""
    quotes = []
    # Bold italics or italics: **"..."** or *"..."*
    for m in re.finditer(r'\*\*"([^"]{10,200})"\*\*', content):
        quotes.append(m.group(1))
    for m in re.finditer(r'\*"([^"]{10,200})"\*', content):
        quotes.append(m.group(1))
    # Standalone "..." lines (Founder voice in Puddings often appears as standalone quoted)
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith('"') and stripped.endswith('"') and len(stripped) > 20:
            inner = stripped[1:-1].strip()
            if inner not in quotes:
                quotes.append(inner)
    # Bold standalone lines (Founder voice statements)
    for m in re.finditer(r'\*\*([A-Z][^*\n]{15,120})\*\*', content):
        text = m.group(1).strip()
        if text not in quotes and not text.startswith("Series") and not text.startswith("Number"):
            quotes.append(text)
    return quotes[:5]


def extract_cross_references(content: str, filename: str) -> list[str]:
    """Extract markdown links, Pudding references, and paper references."""
    refs = []
    # Markdown links
    for m in re.finditer(r'\[([^\]]+)\]\(([^)]+)\)', content):
        label = m.group(1)
        href = m.group(2)
        if not href.startswith("http") or "lianabanyan" in href:
            refs.append(f"{label} ({href})")
    # "Pudding #NNN" references
    for m in re.finditer(r'Pudding\s+#?(\d+)', content, re.IGNORECASE):
        ref = f"Pudding #{m.group(1)}"
        if ref not in refs:
            refs.append(ref)
    # "Paper #NNN" references
    for m in re.finditer(r'Paper\s+#?(\d+)', content, re.IGNORECASE):
        ref = f"Paper #{m.group(1)}"
        if ref not in refs:
            refs.append(ref)
    return refs[:8]


def derive_canonical_topic(title: str, content: str, pudding_num: int) -> str:
    """
    Derive the primary canonical topic from title + content signals.
    Maps to Liana Banyan domain primitives.
    """
    title_lower = title.lower()
    content_lower = content[:2000].lower()

    # Domain keyword → topic mapping (ordered by specificity)
    domain_map = [
        (["rideshare", "hood uber", "route"], "Rideshare Routes — cooperative transportation vs extractive platforms"),
        (["defense klaus", "safety ledger", "panic button"], "Defense Klaus — personal safety infrastructure for platform workers"),
        (["earn-down", "earn down", "vehicle ownership"], "Earn-Down — path to asset ownership through work"),
        (["five dollar", "$5", "membership", "five-dollar"], "Five-Dollar Membership — anti-extractive access economics"),
        (["83.3", "83.3%", "creator keep", "keeps 83"], "83.3% Creator Keep — constitutional revenue allocation"),
        (["cost+20", "cost plus 20", "platform margin"], "Cost+20% Platform Margin — cooperative pricing model"),
        (["patent", "crown jewel", "ip ledger", "provisional"], "Patent Architecture — cooperative IP and innovation ledger"),
        (["skipping stone", "reading beacon", "deck card", "cue card"], "Skipping Stones — layered content navigation system"),
        (["waterwheel", "water wheel"], "Waterwheel — value recirculation mechanism"),
        (["one-way valve", "one way valve", "credits never"], "One-Way Valve — anti-extraction currency mechanics"),
        (["marks", "effort currency", "ratchet"], "Marks — effort-differential currency with one-way ratchet"),
        (["guild", "guilds"], "Harper Guild — creator cooperative structures"),
        (["captain", "captains"], "Captains — platform operational leadership tier"),
        (["adapt score", "adapt"], "ADAPT Score — capability-based governance over demographics"),
        (["crown", "crowns", "crowns model"], "The Crowns — named domain expert leadership seats"),
        (["hexisle", "hex isle"], "HexIsle — cooperative gaming environment"),
        (["wildfire", "wildfire run"], "WildFire Run — rapid onboarding and expansion protocol"),
        (["librarian", "moneypenny", "romulator"], "Librarian / Romulator — AI context persistence system"),
        (["family table", "the family table"], "The Family Table — cooperative food sharing initiative"),
        (["msa", "member savings", "savings account"], "MSA — Member Savings Account cooperative finance"),
        (["solidarity stack"], "Solidarity Stack — layered mutual support architecture"),
        (["boaz principle", "gleaning"], "Boaz Principle — structured surplus sharing and gleaning"),
        (["hundred", "100"], "The Hundred — platform scale and membership economics"),
        (["switzerland rule"], "Switzerland Rule — platform political neutrality doctrine"),
        (["round table"], "Round Table — cooperative decision-making architecture"),
        (["cooperative purchasing", "cooperative purchas"], "Cooperative Purchasing — group buying power mechanics"),
        (["ghost world", "ghost"], "Ghost World — off-grid economic community integration"),
        (["pioneer node"], "Pioneer Node — first-mover community seeding mechanics"),
        (["beacon", "reading beacon"], "Reading Beacon — engagement tracking and content proof"),
        (["the loop"], "The Loop — feedback and reinvestment cycle"),
        (["blood sweat and tears", "bst"], "Blood, Sweat & Tears — platform origin narrative series"),
        (["tooth", "dental"], "The Tooth — healthcare access in cooperative model"),
        (["spice must flow", "spice"], "The Spice Must Flow — content supply chain mechanics"),
        (["lighthouse ladder"], "Lighthouse Ladder — platform onboarding progression"),
        (["invisible temperament"], "Invisible Temperament — behavioral economics of trust"),
        (["portable reputation"], "Portable Reputation — cross-platform member credential"),
        (["patent bag", "patent bags"], "Patent Bags — innovation collection and filing infrastructure"),
        (["locked folder", "locked folders"], "Locked Folders — sovereign data zones within platform"),
        (["cleanest family"], "Cleanest Family — ethical competitive advantage framework"),
        (["strategic pivot"], "Strategic Pivot — platform direction correction mechanics"),
        (["load bearing fable", "fable"], "Load-Bearing Fables — canonical narrative infrastructure"),
        (["seven duplicate", "duplicate"], "Seven Duplicates — version control and canonical resolution"),
        (["all the things she said"], "All The Things She Said — comprehensive platform feature inventory"),
        (["there is no spoon"], "There Is No Spoon — platform abstraction and mental model"),
        (["seven version", "versions for a cfo"], "Seven Versions — multi-audience communication framework"),
        (["three ways to be canonical"], "Three Ways to Be Canonical — truth-level taxonomy"),
        (["two fork", "synthesis"], "Two Forks — fork/merge architecture for parallel threads"),
        (["why 033", ".033"], "Why .033 Shows Up Everywhere — the Cost+20% math constant"),
        (["two pudding system"], "Two Pudding Systems — dual-track content architecture"),
        (["prov 12", "proverbs"], "Why Prov 12 Stays Open — foundation for ongoing IP filing"),
        (["backer election"], "Backer Election — cooperative investor participation model"),
        (["battery dispatch"], "Battery Dispatch — energy cooperative and storage economics"),
        (["captain system"], "Captain System — operational execution tier"),
        (["cold start hub"], "Cold Start Hub — community launch with zero existing members"),
        (["harper bounty"], "Harper Bounty — creator incentive and bounty mechanics"),
        (["guest marks wallet", "marks wallet"], "Marks Wallet — effort currency storage and spend"),
        (["we need what you are good at"], "We Need What You Are Good At — talent discovery and matching"),
        (["lb card", "liana banyan card"], "LB Card — cooperative commerce membership credential"),
        (["marks payback"], "Marks Payback — retroactive effort compensation"),
        (["moneypenny the receptionist", "moneypenny"], "MoneyPenny the Receptionist — AI context management avatar"),
        (["pathfinder journal"], "Pathfinder Journal — member progress and discovery tracking"),
        (["roommate accountability", "roommate contract"], "Roommate Accountability — shared-living governance protocol"),
        (["you're in charge", "youre in charge"], "You're In Charge Of You — member sovereignty principle"),
        (["closet belongs", "worker's closet"], "Closet Belongs to the Worker — worker asset sovereignty"),
        (["permanent shock", "permanent architecture"], "Permanent Shock Permanent Architecture — crisis-proof platform design"),
        (["two shell", "two shells"], "Two Shells — dual-environment platform architecture"),
        (["xray", "x-ray"], "The X-Ray — transparency and diagnostic layer"),
        (["intent field"], "Intent Field — declared-purpose governance mechanism"),
        (["warm room"], "Warm Room — trust-building onboarding environment"),
        (["four judge", "four judges"], "Four Judges — multi-stakeholder adjudication framework"),
        (["seven thread"], "Seven Threads — platform narrative coherence architecture"),
        (["ratchet"], "The Ratchet — one-way value accumulation mechanics"),
        (["castle ready on day one"], "Castle Ready On Day One — zero-delay member activation"),
        (["board game lobby"], "Board Game Lobby — HexIsle cooperative gaming governance"),
        (["red queen"], "The Red Queen — platform evolution and adaptation imperative"),
        (["portal door", "portal doors"], "Portal Doors — multi-surface platform access architecture"),
        (["flywheel"], "The Flywheel — compounding growth mechanics"),
        (["labyrinth"], "The Labyrinth — complex system navigation design"),
        (["project seed"], "Project Seed — platform initialization and early growth"),
        (["build your kingdom"], "Build Your Kingdom — member ownership and sovereign space"),
        (["scaas", "service cooperative"], "SCaaS — Service Cooperative as a Service model"),
        (["compensation slider"], "Compensation Slider — worker-controlled pay distribution"),
        (["chronicle keeper"], "Chronicle Keeper — platform history and session record system"),
        (["leave the corner", "corners"], "Leave the Corners — cooperative surplus/gleaning obligation"),
        (["campaign to novel"], "From Campaign to Novel — long-arc content creation economics"),
        (["montana principle"], "Montana Principle — rural and underserved market inclusion"),
        (["birthright"], "The Birthright — member inherent entitlements at signup"),
        (["daily maze", "mazes"], "Daily Mazes — gamified engagement and reward mechanics"),
        (["your island your rules"], "Your Island, Your Rules — member-sovereign space governance"),
        (["twenty percent rule", "20% rule"], "Twenty Percent Rule — platform surplus reinvestment"),
        (["drink cookbook"], "The Drink Cookbook — content creation templates for creators"),
        (["wave pricing"], "Wave Pricing — surge demand management without extraction"),
        (["bandwagon"], "Bandwagon — viral network growth and social proof mechanics"),
        (["shop that fixed my son"], "The Shop That Fixed My Son's Car — hyperlocal service discovery"),
        (["triple double", "lottery ticket monkey"], "Triple Double & Lottery Ticket Monkeys — probability literacy"),
        (["going first", "opt-in", "founder first"], "Going First — founder-led adoption and opt-in mechanics"),
        (["thirteenth patent", "13th patent"], "Thirteenth Patent — IP portfolio milestone and filing narrative"),
        (["my strawberries", "strawberr"], "My Strawberries — labor value and worker equity narrative"),
        (["glass door"], "The Glass Door — platform transparency and accountability"),
        (["one-way door", "one way door"], "One-Way Door — irreversible commitment architecture"),
        (["proof is running"], "The Proof Is Running — live system as validation evidence"),
        (["one session"], "One Session — minimum viable participation threshold"),
        (["mush index"], "The Mush Index — content quality scoring system"),
        (["inuka", "speak on command"], "Inuka — on-demand expertise activation model"),
        (["living pyramid of roots"], "Living Pyramid of Roots — organizational depth and foundation"),
        (["they do what ip does"], "They Do What IP Does — worker-as-innovation contributor model"),
        (["plowing", "quiet discipline"], "Plowing the Quiet Discipline — consistent platform stewardship"),
        (["forty three percent", "43%"], "Forty-Three Percent — statistical proof of market gap"),
        (["ref staff read", "read don't rewrite"], "Ref Staff Read Don't Rewrite — canonical preservation doctrine"),
        (["shape it or someone else"], "Shape It Or Someone Else Will — proactive platform governance"),
        (["pantheon"], "The Pantheon — hall of recognized platform contributors"),
        (["cathedral effect"], "The Cathedral Effect — substrate accumulation and permanence"),
        (["brick wall", "not canaries"], "Brick Walls Not Canaries — platform resilience over fragility"),
        (["authoritative ai first"], "Authoritative AI First Demonstration — AI as evidence not theory"),
        (["content command center"], "Content Command Center — creator publishing infrastructure"),
        (["three currencies", "three currency", "wallet"], "Three Currencies Wallet — Credits/Marks/Joules system"),
        (["billion row", "billion rows"], "A Billion Rows and Five Dollars — cooperative data economics"),
        (["metadata only"], "Metadata-Only Advantage — privacy-preserving platform architecture"),
        (["design democracy", "vote before the build"], "Design Democracy — member vote before platform build"),
        (["one hundred factories", "100 factories"], "One Hundred Factories — distributed cooperative node model"),
        (["acknowledgment stamp"], "Acknowledgment Stamp — proof-of-engagement credential"),
        (["bridge"], "The Bridge — cross-system integration architecture"),
        (["treasure map"], "Treasure Map — platform discovery and navigation guide"),
        (["star chamber"], "Star Chamber — elevated governance decision forum"),
        (["cue card"], "Cue Card — shareable micro-content and identity card"),
        (["substitution"], "The Substitution — platform alternative to extractive incumbents"),
        (["red carpet"], "The Red Carpet — member VIP onboarding and welcome experience"),
        (["counter vote"], "The Counter Vote — dissent and minority opinion integration"),
        (["four dollar", "$4"], "Four Dollar Question — threshold economics of cooperative value"),
        (["harvest and the share", "harvest"], "The Harvest and the Share — cooperative surplus distribution"),
        (["math on the label"], "The Math on the Label — radical transparency in platform economics"),
        (["opening gambit"], "The Opening Gambit — platform launch strategy and first move"),
        (["twenty five dashboard", "25 dashboards"], "Twenty-Five Dashboards — unified multi-initiative interface"),
        (["screw press"], "The Screw Press Revolution — platform as infrastructure multiplier"),
        (["city under the city"], "City Under the City — parallel cooperative economy vision"),
        (["affordability", "status symbol"], "Making Affordability a Status Symbol — prestige inversion"),
        (["no effort is wasted"], "No Effort Is Wasted — cumulative contribution accounting"),
        (["coverage map"], "The Coverage Map — geographic and demographic reach visualization"),
        (["canister"], "The Canister — self-contained initiative packaging model"),
        (["waterwheel"], "Waterwheel — value recirculation in cooperative commerce"),
        (["dispatcher", "dispatch"], "The Dispatch — task routing and worker assignment system"),
        (["storefront"], "The Storefront — creator commerce surface and display"),
        (["tribe"], "The Tribe — primary community identity group"),
        (["subscription channel"], "Subscription Channel — recurring revenue cooperative model"),
        (["medallion"], "The Medallion — earned status and recognition credential"),
        (["lemon lot"], "The Lemon Lot — vehicle marketplace and quality assurance"),
        (["coalition"], "The Coalition — multi-initiative collaborative alignment"),
        (["guided tour"], "The Guided Tour — new member orientation and discovery"),
        (["vacation network"], "The Vacation Network — cooperative travel and hospitality"),
        (["one way valve", "one-way valve"], "One-Way Valve — Credits-to-fiat extraction prevention"),
        (["ip ledger", "innovation ledger"], "IP Ledger — innovation tracking and attribution system"),
        (["twenty three domain", "23 domain"], "Twenty-Three Domains — platform scope and initiative coverage"),
        (["hexisle", "hex isle", "beacon"], "HexIsle / The Beacon — cooperative gaming and signaling"),
        (["hundred"], "The Hundred — hundred-member cooperative community milestone"),
        (["five dollars as promise", "five dollar as promise"], "Five Dollars as Promise — membership as covenant not fee"),
        (["fingertip", "fingertips system"], "Fingertips System — on-demand platform access mechanics"),
        (["blizzard"], "The Blizzard — crisis-scale cooperative mutual aid"),
        (["play with these numbers"], "Play With These Numbers — cooperative economics sandbox"),
        (["what the attic knows"], "What the Attic Knows — institutional memory and knowledge depth"),
        (["missing claims"], "The Missing Claims — IP gaps and filing opportunity map"),
        (["seven duplicate"], "Seven Duplicates — version reconciliation and canon resolution"),
    ]

    for keywords, topic in domain_map:
        if any(kw in title_lower or kw in content_lower for kw in keywords):
            return topic

    # Fallback: use title words
    return f"Platform concept: {title}"


def derive_definition(title: str, content: str) -> str:
    """Extract or derive a concise definition from the first few paragraphs."""
    # Skip metadata lines and H1
    lines = content.splitlines()
    body_lines = []
    in_header = True
    for line in lines:
        stripped = line.strip()
        if in_header:
            if stripped.startswith("#") or stripped.startswith("**") or stripped.startswith("---") or not stripped:
                continue
            else:
                in_header = False
        if stripped and not stripped.startswith("```") and not stripped.startswith("|"):
            body_lines.append(stripped)
        if len(body_lines) >= 3:
            break

    definition = " ".join(body_lines)
    # Truncate to ~200 chars
    if len(definition) > 250:
        definition = definition[:247] + "..."
    return definition or f"Canonical Liana Banyan concept: {title}"


def derive_skipping_stones(content: str, title: str) -> dict:
    """Derive three-tier Skipping Stones layers from content."""
    # Check if content has explicit Skipping Stones format
    if "## At a Glance" in content or "## More Details" in content:
        at_a_glance = re.search(r"## At a Glance\s*\n(.*?)(?=\n##|\Z)", content, re.DOTALL)
        more_details = re.search(r"## More Details\s*\n(.*?)(?=\n##|\Z)", content, re.DOTALL)
        in_depth = re.search(r"## In Depth\s*\n(.*?)(?=\n##|\Z)", content, re.DOTALL)
        return {
            "at_a_glance": at_a_glance.group(1).strip()[:200] if at_a_glance else f"A Liana Banyan platform primitive: {title}.",
            "more_details": more_details.group(1).strip()[:400] if more_details else derive_definition(title, content),
            "in_depth": in_depth.group(1).strip()[:600] if in_depth else content[400:1000].strip()
        }

    # Derive from content structure
    paragraphs = [p.strip() for p in re.split(r'\n\n+', content) if p.strip() and not p.strip().startswith("#") and not p.strip().startswith("```") and not p.strip().startswith("|") and len(p.strip()) > 30]

    at_a_glance = paragraphs[0][:200] if paragraphs else f"A Liana Banyan cooperative commerce primitive: {title}."
    more_details = " ".join(p[:150] for p in paragraphs[1:3])[:400] if len(paragraphs) > 1 else at_a_glance
    in_depth = " ".join(p[:200] for p in paragraphs[3:6])[:600] if len(paragraphs) > 3 else more_details

    return {
        "at_a_glance": at_a_glance,
        "more_details": more_details,
        "in_depth": in_depth
    }


def derive_stratum(pudding_num: int, title: str, content: str, innovations: list) -> str:
    """
    Assign stratum recommendation based on:
    - How foundational the concept is
    - Whether it has innovation references
    - Content depth
    """
    title_lower = title.lower()
    content_lower = content.lower()

    # Bedrock: core economic/constitutional architecture
    bedrock_keywords = ["83.3", "cost+20", "one-way valve", "creator keep", "constitutional",
                        "five dollar membership", "earn-down", "marks ratchet", "three currencies",
                        "golden key", "help each other", "sweet sixteen", "adapt score"]
    if any(kw in title_lower or kw in content_lower for kw in bedrock_keywords):
        return "bedrock"

    # Granite: core platform primitives with strong innovation backing
    granite_keywords = ["patent", "rideshare routes", "defense klaus", "skipping stones",
                        "reading beacon", "romulator", "librarian", "waterwheel", "guild",
                        "boaz principle", "cooperative", "ip ledger"]
    if any(kw in title_lower or kw in content_lower for kw in granite_keywords) and len(innovations) >= 2:
        return "granite"

    # Limestone: established mid-tier concepts
    if len(innovations) >= 2 or pudding_num <= 80:
        return "limestone"

    # Sandstone: developed concepts
    if len(innovations) >= 1 or pudding_num <= 140:
        return "sandstone"

    # Sediment: newer concepts (B083+, B096+, B100+, B123+)
    if pudding_num >= 182:
        return "sediment"

    # Soil: mid-development
    return "soil"


def derive_composing_primitives(content: str, title: str) -> list[str]:
    """Extract composing primitives from content."""
    primitives = []
    # Named platform systems
    system_map = {
        "Credits": "Three-Gear Currency System",
        "Marks": "Three-Gear Currency System",
        "Joules": "Three-Gear Currency System",
        "ADAPT Score": "ADAPT Score Governance",
        "Crowns": "The 300 Model",
        "Captains": "The 300 Model",
        "Cost+20": "Cost+20% Platform Margin",
        "83.3%": "Creator Keep Constitution",
        "Earn-Down": "Earn-Down Ownership Protocol",
        "Defense Klaus": "Defense Klaus Safety Infrastructure",
        "Rideshare Routes": "Rideshare Routes Initiative",
        "One-Way Valve": "One-Way Valve (Credits)",
        "Reading Beacon": "Reading Beacon Engagement System",
        "Skipping Stones": "Skipping Stones Navigation",
        "Cue Card": "Cue Card Identity System",
        "HexIsle": "HexIsle Cooperative Gaming",
        "WildFire": "WildFire Expansion Protocol",
        "Romulator": "Romulator 9000 Context Persistence",
        "MoneyPenny": "MoneyPenny / Librarian AI",
        "Waterwheel": "Waterwheel Value Recirculation",
        "Boaz Principle": "Boaz Principle / Gleaning",
        "Rally Group": "Rally Group Initiative",
        "Harper Guild": "Harper Guild Initiative",
        "Family Table": "The Family Table Initiative",
        "MSA": "Member Savings Account (MSA)",
        "VSL": "VSL Initiative",
        "Brass Tacks": "Brass Tacks Initiative",
        "Didasko": "Didasko Academic Initiative",
    }
    for keyword, primitive in system_map.items():
        if keyword.lower() in content.lower() or keyword.lower() in title.lower():
            if primitive not in primitives:
                primitives.append(primitive)
    return primitives[:6]


def compute_content_hash(content: str) -> str:
    """SHA-256 of content bytes as deterministic HMAC placeholder."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def derive_chronos(pudding_num: int, session: str) -> str:
    """Deterministic chronos from pudding number and session."""
    seed = f"BUSHEL1_RECKONING_KNIGHT1_{pudding_num}_{session}"
    return hashlib.sha256(seed.encode()).hexdigest()[:16]


def synthesize_pudding(filepath: Path) -> dict:
    """Full synthesis for a single PUDDING file."""
    content = filepath.read_text(encoding="utf-8", errors="replace")
    filename = filepath.name
    pudding_num = extract_pudding_number(filename)
    title = extract_title(content)
    session = extract_session(content, filename)
    innovations = extract_innovations(content)
    quotes = extract_founder_voice_quotes(content)
    cross_refs = extract_cross_references(content, filename)
    canonical_topic = derive_canonical_topic(title, content, pudding_num or 0)
    definition = derive_definition(title, content)
    skipping_stones = derive_skipping_stones(content, title)
    composing_primitives = derive_composing_primitives(content, title)
    stratum = derive_stratum(pudding_num or 999, title, content, innovations)
    content_hash = compute_content_hash(content)
    chronos = derive_chronos(pudding_num or 0, session)
    word_count = len(content.split())

    return {
        "synthesis_class": "reckoning_bishop_finding",
        "knight_session_index": 1,
        "shard_category": "puddings",
        "source_file": str(filepath),
        "pudding_number": pudding_num,
        "filename": filename,
        "title": title,
        "session": session,
        "canonical_topic": canonical_topic,
        "definition": definition,
        "composing_primitives": composing_primitives,
        "founder_voice_quotes": quotes,
        "cross_references": cross_refs,
        "skipping_stones_layers": skipping_stones,
        "wading_diving_in_layer": content[:800].strip() if len(content) > 800 else content.strip(),
        "ratification_chronology": f"Pudding #{pudding_num} | Session: {session} | Reckoning: K_BUSHEL1_KNIGHT1 BP018",
        "empirical_receipts": innovations,
        "stratum_recommendation": stratum,
        "word_count": word_count,
        "cohort_class": "federation_member",
        "ts": datetime.now(timezone.utc).isoformat(),
        "hmac": f"sha256:{content_hash}",
        "chronos": chronos,
        "vendor_api_spend_usd": 0.0,
        "counterfactual_cost_estimate_usd": round(word_count * 0.000015, 6),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print(f"[KNIGHT-1] Bushel 1 Reckoning — PUDDINGs Shard Synthesis")
    print(f"[KNIGHT-1] Source: {PUDDINGS_DIR}")
    print(f"[KNIGHT-1] Ledger: {LEDGER_PATH}")
    print(f"[KNIGHT-1] Start: {TS_START}")
    print()

    # Discover all PUDDING files
    all_files = sorted(
        [f for f in PUDDINGS_DIR.iterdir()
         if f.is_file() and re.match(r"PUDDING_\d+", f.name)],
        key=lambda f: (extract_pudding_number(f.name) or 9999, f.name)
    )

    print(f"[KNIGHT-1] Discovered {len(all_files)} PUDDING files in 05_Puddings/")

    # Check existing ledger entries
    existing_files = set()
    if LEDGER_PATH.exists():
        with LEDGER_PATH.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    try:
                        entry = json.loads(line)
                        existing_files.add(entry.get("filename", ""))
                    except json.JSONDecodeError:
                        pass
        print(f"[KNIGHT-1] Existing ledger entries: {len(existing_files)} (will skip duplicates)")
    else:
        LEDGER_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Process in batches of 20
    BATCH_SIZE = 20
    entries_written = 0
    entries_skipped = 0
    errors = []

    with LEDGER_PATH.open("a", encoding="utf-8") as ledger:
        for batch_start in range(0, len(all_files), BATCH_SIZE):
            batch = all_files[batch_start:batch_start + BATCH_SIZE]
            batch_num = (batch_start // BATCH_SIZE) + 1
            total_batches = (len(all_files) + BATCH_SIZE - 1) // BATCH_SIZE
            print(f"[KNIGHT-1] Batch {batch_num}/{total_batches} — files {batch_start+1}–{batch_start+len(batch)}")

            for filepath in batch:
                if filepath.name in existing_files:
                    entries_skipped += 1
                    continue
                try:
                    entry = synthesize_pudding(filepath)
                    ledger.write(json.dumps(entry, ensure_ascii=False) + "\n")
                    ledger.flush()
                    entries_written += 1
                    pudding_num = entry.get("pudding_number", "?")
                    title = entry.get("title", "?")[:50]
                    stratum = entry.get("stratum_recommendation", "?")
                    print(f"  [+] #{pudding_num:>3} {title:<50} [{stratum}]")
                except Exception as e:
                    errors.append((filepath.name, str(e)))
                    print(f"  [!] ERROR {filepath.name}: {e}", file=sys.stderr)

    ts_end = datetime.now(timezone.utc).isoformat()
    print()
    print(f"[KNIGHT-1] COMPLETE")
    print(f"[KNIGHT-1] Entries written:  {entries_written}")
    print(f"[KNIGHT-1] Entries skipped:  {entries_skipped}")
    print(f"[KNIGHT-1] Errors:           {len(errors)}")
    print(f"[KNIGHT-1] End: {ts_end}")

    if errors:
        print("[KNIGHT-1] Error list:")
        for fname, err in errors:
            print(f"  {fname}: {err}")

    # Write stats
    stats = {
        "session": SESSION_ID,
        "ts_start": TS_START,
        "ts_end": ts_end,
        "files_discovered": len(all_files),
        "entries_written": entries_written,
        "entries_skipped": entries_skipped,
        "errors": errors,
        "ledger_path": str(LEDGER_PATH),
    }
    STATS_PATH.write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print(f"[KNIGHT-1] Stats written to: {STATS_PATH}")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
