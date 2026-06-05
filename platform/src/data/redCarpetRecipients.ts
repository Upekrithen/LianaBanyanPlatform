/**
 * RED CARPET RECIPIENT REGISTRY
 * =============================
 * Maps email domains and known addresses to personalized walkthrough content.
 * 71 recipients across 9 categories from the Master Match List.
 *
 * When a letter recipient enters their work email at /RedCarpet,
 * this registry identifies them and serves personalized content.
 *
 * IMPORTANT: This is NOT authentication. It's recognition.
 * Anyone can still see general content; recognized recipients see THEIR content.
 *
 * K202 (B053): Added findRecipientByEmailAsync — queries red_carpet_access
 * table first, falls back to static array if DB unavailable.
 */

import { supabase } from "@/integrations/supabase/client";

export type RecipientCategory =
  | "crown"
  | "high-value"
  | "journalist"
  | "academic"
  | "thought-leader"
  | "outreach"
  | "blessing"
  | "media-pitch"
  | "professional"
  | "family";

export interface RecipientInitiative {
  name: string;
  tagline: string;
  description: string;
}

export interface Recipient {
  id: string;
  name: string;
  /** One-line bio */
  bio: string;
  /** What we want them for — their specific role/purpose */
  purpose: string;
  /** The personalized "why you" message */
  whyYou: string;
  /** Category from the Master Match List */
  category: RecipientCategory;
  /** Display label for category */
  categoryLabel: string;
  /** Crown role title, if applicable */
  crownTitle?: string;
  /** Matched initiative, if applicable */
  initiative?: RecipientInitiative;
  /** Email domains that identify this recipient (lowercase) */
  emailDomains: string[];
  /** Specific known email addresses (lowercase) */
  knownEmails?: string[];
  /** Flag from Opening Gambit (AA, AB, AC, BA, BB, BC, T, H) */
  launchFlag: string;
  /** Icon/emoji for display */
  icon: string;
  /** Optional cover note shown after email recognition, before walkthrough */
  coverNote?: string;
  /** Optional CTA link paired with cover note */
  coverNoteCta?: { label: string; href: string };
}

// ─────────────────────────────────────────────────────────
// INITIATIVES REFERENCE
// ─────────────────────────────────────────────────────────

const INITIATIVES: Record<string, RecipientInitiative> = {
  CEO: {
    name: "Liana Banyan Corporation",
    tagline: "Member-owned. Community-governed. Cost + 20% locked forever.",
    description:
      "A cooperative commerce platform where creators keep 83.3% of every transaction, economics are locked by constitutional DNA, and the CEO role is designed as a professional, accountable seat from day one.",
  },
  LETS_MAKE_DINNER: {
    name: "Let's Make Dinner",
    tagline: "Neighbors feeding neighbors",
    description:
      "Home cooks share meals with their community through a cooperative platform. No algorithms deciding who eats — just people cooking for people, with 83.3% of every dollar going to the cook.",
  },
  LETS_GET_GROCERIES: {
    name: "Let's Get Groceries",
    tagline: "Community provisioning at scale",
    description:
      "Cooperative grocery sourcing that connects communities directly to producers. Bulk buying power without bulk corporate extraction.",
  },
  LETS_GO_SHOPPING: {
    name: "Let's Go Shopping",
    tagline: "Ethical retail, cooperative scale",
    description:
      "A retail marketplace where every merchant keeps 83.3% and the platform margin is constitutionally locked at Cost+20%. Shopping that builds community wealth.",
  },
  DIDASKO: {
    name: "Didasko",
    tagline: "Education without extraction",
    description:
      "Academic resources, tutoring, and curriculum delivered cooperatively. Teachers and content creators keep 83.3%. Knowledge shared, not gatekept.",
  },
  VSL: {
    name: "VSL (Voucher Short Loans)",
    tagline: "Community lending meets cooperative economics",
    description:
      "Peer-to-peer lending circles powered by the three-gear currency system. Community members support each other with transparent, non-extractive terms.",
  },
  JUKEBOX: {
    name: "JukeBox",
    tagline: "Music rights returned to artists",
    description:
      "A music platform where artists keep 83.3% of every stream, sale, and license. No opaque algorithms. No payola. Just musicians earning what they create.",
  },
  DEFENSE_KLAUS: {
    name: "Defense Klaus",
    tagline: "For someone you love",
    description:
      "Domestic violence protection through cooperative infrastructure. Safety planning, emergency resources, and community shields — funded by the platform, not extracted from survivors.",
  },
  RALLY_GROUP: {
    name: "Rally Group",
    tagline: "Community crisis response",
    description:
      "Disaster and emergency mutual aid coordinated through cooperative infrastructure. When crisis hits, the community rallies — and the platform handles logistics.",
  },
  MSA: {
    name: "MSA (Mutual Savings Account)",
    tagline: "Banking for the unbankable",
    description:
      "Community treasury and savings infrastructure built on cooperative principles. Financial tools designed for people traditional banking ignores.",
  },
  LIFELINE: {
    name: "Tatiana Schlossburg Health Accords",
    tagline: "Medicine at cost, not at markup",
    description:
      "Medication access through cooperative buying power. Cost+20% applied to pharmaceuticals means members pay what drugs actually cost, plus a transparent margin.",
  },
  LETS_MAKE_BREAD: {
    name: "Let's Make Bread",
    tagline: "The Maker Movement, cooperatively",
    description:
      "Distributed manufacturing where makers keep 83.3%. From 3D printing to woodworking, artisans sell through a platform that can never extract more than Cost+20%.",
  },
  HARPER_GUILD: {
    name: "Harper Guild",
    tagline: "Trust architecture for communities",
    description:
      "Trained community facilitators (Harpers) who help resolve conflicts, onboard new members, and maintain the cooperative culture. Trust as infrastructure.",
  },
  POWER_TO_THE_PEOPLE: {
    name: "Power to the People",
    tagline: "Not Left, Not Right — Forward Together",
    description:
      "Civic engagement, voter education, and community organizing tools funded sustainably by cooperative commerce. Two Door-Openers (left and right) prove this is not partisan. Two Builders (culture and action) make the infrastructure real.",
  },
  HOME_LOGISTICS: {
    name: "Household Concierge",
    tagline: "Home logistics, cooperatively",
    description:
      "Home organization and maintenance services through cooperative infrastructure. Service providers keep 83.3% and members get transparent pricing.",
  },
  INTERNATIONAL: {
    name: "International",
    tagline: "Cooperative economics without borders",
    description:
      "The Liana Banyan model adapted for international markets with PPP adjustment. The same DNA Lock, the same 83.3%, calibrated for local purchasing power.",
  },
};

// ─────────────────────────────────────────────────────────
// THE REGISTRY — 71 RECIPIENTS
// ─────────────────────────────────────────────────────────

export const RECIPIENTS: Recipient[] = [
  // ═══════════════════════════════════════════════════════
  // CATEGORY 1: CROWN LETTERS (17)
  // ═══════════════════════════════════════════════════════
  {
    id: "michael-seibel",
    name: "Michael Seibel",
    bio: "Former CEO of Y Combinator, launched Twitch",
    purpose: "CEO of Liana Banyan Corporation",
    whyYou:
      "You've spent your career finding founders who see what others miss. This platform was built by an engineer over 37 years — not a pitch deck founder. It has {{innovationCount}} documented innovations — 99% utility patents, not design — protected by 2,473 formal claims across {{provisionalApps}} provisional applications. Eight definite with 9 more from the first 130 survived a deep dive with no prior art found. Economics constitutionally locked against extraction. The CEO seat was designed for a professional, not the founder's ego. You're the one we built it for.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Chief Executive Officer",
    initiative: INITIATIVES.CEO,
    emailDomains: ["ycombinator.com", "yc.com"],
    launchFlag: "AA",
    icon: "👑",
    coverNote: `### Welcome, Michael.\n\nYou're reading this because you opened a letter from a stranger who wants you to run a company you've never heard of. That takes either curiosity or patience. I'm grateful for both.\n\nBefore the walkthrough shows you the platform, I want you to read the business plan. Not a pitch deck — a business plan. It has three levels.\n\n**Level 1** is the story. Six steps. Feed people. Make things. Serve each other. Build businesses. Organize. Belong. Read it in 10 minutes. You'll understand what we built and why.\n\n**Level 2** is the machinery. Every mechanism has an innovation number. Every number maps to a formal Acknowledgment & Assignment in our records. You'll see how each system works — Cue Cards, Treasure Maps, the Captain System, the three-currency economy, the ADAPT Score. This is where the innovations live.\n\n**Level 3** is the reasoning. Why this design and not another. What was tried and rejected. What the patent protects. What makes each mechanism novel. This is where a CEO does due diligence.\n\nRead as deep as you want. Every claim is verifiable. The math is published. Scrutiny is invited.\n\nThen walk through the platform. See the production systems. See the Crown Jewels. See the seat that's waiting.\n\nThe letter explains what we're asking. The business plan explains what we built. The Red Carpet shows you it's real.`,
    coverNoteCta: { label: "Read the Business Plan →", href: "/business-plan" },
  },
  {
    id: "sal-khan",
    name: "Sal Khan",
    bio: "Founded Khan Academy, revolutionized free education",
    purpose: "Crown: Chancellor of Didasko (Academic/BOUNTY K-12)",
    whyYou:
      "You proved education can be free and excellent. Didasko is the next step: a cooperative platform where educators keep 83.3% of every transaction and curriculum is shared, not gatekept. You didn't just build a school — you built a philosophy. We're building the infrastructure to scale it.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Chancellor",
    initiative: INITIATIVES.DIDASKO,
    emailDomains: ["khanacademy.org"],
    launchFlag: "AB",
    icon: "👑",
  },
  {
    id: "maneet-chauhan",
    name: "Maneet Chauhan",
    bio: "Celebrity chef, James Beard nominee, restaurant empire builder",
    purpose: "Crown: Grand Chef of Let's Make Dinner",
    whyYou:
      "You've built restaurants, competed on national television, and championed Nashville's food culture. Let's Make Dinner is neighbors feeding neighbors — home cooks sharing meals through a cooperative platform where 83.3% of every dollar goes to the cook. You understand that food is community. We need you to lead it.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Grand Chef",
    initiative: INITIATIVES.LETS_MAKE_DINNER,
    emailDomains: ["maneetchauhan.com", "chauhan.com"],
    launchFlag: "BA",
    icon: "👑",
  },
  {
    id: "mary-beth-laughton",
    name: "Mary Beth Laughton",
    bio: "Former SVP at REI, scaled ethical retail operations",
    purpose: "Crown: Merchant Mentor of Let's Go Shopping",
    whyYou:
      "You scaled ethical retail at REI to billions. Let's Go Shopping is a marketplace where every merchant keeps 83.3% and the platform margin is constitutionally locked. You proved commerce can have values. We're building the infrastructure that makes those values permanent.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Merchant Mentor",
    initiative: INITIATIVES.LETS_GO_SHOPPING,
    emailDomains: ["rei.com", "rei.coop"],
    launchFlag: "BB",
    icon: "👑",
  },
  {
    id: "cathie-mahon",
    name: "Cathie Mahon",
    bio: "CEO of Inclusiv, national credit union network leader",
    purpose: "Crown: Lender Mentor of VSL",
    whyYou:
      "You lead a network of credit unions serving 50 million people. VSL is peer-to-peer lending powered by cooperative economics — the credit union model taken to its logical conclusion. Community members back each other with transparent, non-extractive terms. Your expertise makes this real.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Lender Mentor",
    initiative: INITIATIVES.VSL,
    emailDomains: ["inclusiv.org"],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "kimberly-williams",
    name: "Kimberly A. Williams",
    bio: "Emergency management leader, disaster response expert",
    purpose: "Crown: Responder General of Rally Group",
    whyYou:
      "When disaster strikes, you're the one who coordinates the response. Rally Group is community crisis response through cooperative infrastructure — mutual aid with real logistics. We need someone who knows what 'boots on the ground' actually means.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Responder General",
    initiative: INITIATIVES.RALLY_GROUP,
    emailDomains: [],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "taylor-swift",
    name: "Taylor Swift",
    bio: "Artist who fought for creator rights, masters battle icon",
    purpose: "Crown: Maestro Mentor of JukeBox",
    whyYou:
      "You fought for your masters when the industry said artists don't control their work. You re-recorded entire albums to prove a point. JukeBox is a music platform where artists keep 83.3% of every stream, sale, and license — and that number is constitutionally locked. No one can ever change it. You fought for creator rights. We built it into the DNA.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Maestro Mentor",
    initiative: INITIATIVES.JUKEBOX,
    emailDomains: ["taylorswift.com", "13management.com"],
    launchFlag: "BC",
    icon: "👑",
  },
  {
    id: "jose-andres",
    name: "José Andrés",
    bio: "Chef who founded World Central Kitchen, fed millions in disasters",
    purpose: "Crown: Provisioner of Let's Get Groceries",
    whyYou:
      "You've fed millions in the worst moments of their lives. Let's Get Groceries is cooperative provisioning at scale — connecting communities directly to producers. You know that feeding people isn't charity; it's infrastructure. We need the Provisioner who understands that.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Provisioner",
    initiative: INITIATIVES.LETS_GET_GROCERIES,
    emailDomains: ["wck.org", "thinkfoodgroup.com"],
    launchFlag: "BB",
    icon: "👑",
  },
  {
    id: "dale-dougherty",
    name: "Dale Dougherty",
    bio: "Founded Make Magazine, godfather of the Maker Movement",
    purpose: "Crown: Industry Chancellor of Let's Make Bread",
    whyYou:
      "You didn't just start a magazine — you started a movement. Makers worldwide build because you showed them they could. Let's Make Bread is distributed manufacturing where makers keep 83.3%. From 3D printing to woodworking, artisans sell through a platform that can never extract more than Cost+20%. You built the movement. We built the marketplace.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Industry Chancellor",
    initiative: INITIATIVES.LETS_MAKE_BREAD,
    emailDomains: ["make.co", "makermedia.com", "makezine.com"],
    launchFlag: "BA",
    icon: "👑",
  },
  {
    id: "ruth-glenn",
    name: "Ruth Glenn",
    bio: "Led NCADV, national voice for domestic violence survivors",
    purpose: "Crown: First Shield of Defense Klaus",
    whyYou:
      "You've spent your career protecting people from the ones who should love them most. Defense Klaus is domestic violence protection through cooperative infrastructure — safety planning, emergency resources, and community shields. 'For Someone You Love' isn't a tagline. It's a promise. You're the one who makes it real.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "First Shield",
    initiative: INITIATIVES.DEFENSE_KLAUS,
    emailDomains: ["ncadv.org"],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "alex-oshmyansky",
    name: "Alex Oshmyansky",
    bio: "Founded Mark Cuban Cost Plus Drugs, slashed medication prices",
    purpose: "Crown: Apothecary of Tatiana Schlossburg Health Accords",
    whyYou:
      "You proved medications don't have to cost what they cost. Cost Plus Drugs showed the world what transparent pricing looks like. The Tatiana Schlossburg Health Accords apply that same principle — Cost+20% — through a cooperative platform where the margin is constitutionally locked. You built the proof of concept. We built the permanent infrastructure.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Apothecary",
    initiative: INITIATIVES.LIFELINE,
    emailDomains: ["costplusdrugs.com", "markcubancostplusdrugs.com"],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "jessica-jackley",
    name: "Jessica Jackley",
    bio: "Co-founded Kiva, pioneered peer-to-peer microloans",
    purpose: "Crown: Lender Mentor of VSL (backup)",
    whyYou:
      "You co-founded Kiva and proved that regular people will lend to strangers when the platform is transparent. VSL is peer-to-peer lending with cooperative economics — the model you pioneered, with constitutional protections against extraction built into the DNA.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Lender Mentor",
    initiative: INITIATIVES.VSL,
    emailDomains: ["kiva.org"],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "robert-kaiser",
    name: "Robert Kaiser",
    bio: "UK-based defense/safety leader",
    purpose: "Crown: First Shield UK (international)",
    whyYou:
      "Defense Klaus needs international reach. The UK model will prove that cooperative protection works across borders and legal systems. You're the international expansion of a promise: for someone you love.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "First Shield UK",
    initiative: INITIATIVES.DEFENSE_KLAUS,
    emailDomains: [],
    launchFlag: "T",
    icon: "👑",
  },
  {
    id: "marie-kondo",
    name: "Marie Kondo",
    bio: "Home organization icon, 'spark joy' methodology worldwide",
    purpose: "Crown: Steward Mentor of Home Logistics",
    whyYou:
      "You taught the world that organizing your home is organizing your life. Household Concierge is home logistics through cooperative infrastructure — service providers keep 83.3% and members get transparent pricing. Joy isn't just a feeling; it's a system. We need the Steward who understands that.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Steward Mentor",
    initiative: INITIATIVES.HOME_LOGISTICS,
    emailDomains: ["konmari.com"],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "sallie-krawcheck",
    name: "Sallie Krawcheck",
    bio: "Former Wall Street exec, founded Ellevest for women's finance",
    purpose: "Crown: Treasury Mentor of MSA",
    whyYou:
      "You left Wall Street to build financial tools for the people Wall Street ignores. MSA is community treasury infrastructure built on cooperative principles. You understand that banking can serve people instead of extracting from them. We need the Treasury Mentor who proved it.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Treasury Mentor",
    initiative: INITIATIVES.MSA,
    emailDomains: ["ellevest.com"],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "brene-brown",
    name: "Brené Brown",
    bio: "Researcher on vulnerability and trust, 'Daring Greatly' author",
    purpose: "Crown: Harper Prime of Harper Guild",
    whyYou:
      "You've spent decades researching what makes communities trust each other. Harper Guild trains community facilitators who resolve conflicts, onboard new members, and maintain cooperative culture. Trust isn't soft — it's infrastructure. You're the researcher who proved it. We need the Harper Prime who lives it.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Harper Prime",
    initiative: INITIATIVES.HARPER_GUILD,
    emailDomains: ["brenebrown.com"],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "muhammad-yunus",
    name: "Muhammad Yunus",
    bio: "Nobel laureate, founded Grameen Bank, global microfinance pioneer",
    purpose: "Crown: Commerce Secretary (International)",
    whyYou:
      "You won the Nobel Prize for proving that poor people are creditworthy. Grameen Bank changed the world. The International initiative takes cooperative economics global with PPP adjustment — the same DNA Lock, the same 83.3%, calibrated for local purchasing power. You built the proof. We built the scale.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Commerce Secretary",
    initiative: INITIATIVES.INTERNATIONAL,
    emailDomains: ["grameen.com", "yunuscentre.org"],
    launchFlag: "H",
    icon: "👑",
  },

  // ── Political Expedition: 4 Crown holders ──
  {
    id: "alexandria-ocasio-cortez",
    name: "Alexandria Ocasio-Cortez",
    bio: "U.S. Representative, civic engagement champion, cooperative economics advocate",
    purpose: "Crown: Door-Opener (Left) — Power to the People",
    whyYou:
      "You bartended. You organized. You ran. You won. The cooperative encodes into an operating agreement what you've been arguing for in legislation — every member earns governance rights through contribution. Initiative #15 needs a leader who understands that civic participation and economic participation are the same fight.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Door-Opener (Left)",
    initiative: INITIATIVES.POWER_TO_THE_PEOPLE,
    emailDomains: ["ocasiocortez.com", "mail.house.gov"],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "arnold-schwarzenegger",
    name: "Arnold Schwarzenegger",
    bio: "Former Governor, actor, advocate for bipartisan civic engagement",
    purpose: "Crown: Door-Opener (Right) — Power to the People",
    whyYou:
      "You told graduates there is no such thing as a self-made man, then listed every person who helped you. Two Door-Opening Crowns — left and right — prove cooperative economics is not partisan. If both doors open, people on every side of the aisle walk through the same entrance into the same cooperative.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Door-Opener (Right)",
    initiative: INITIATIVES.POWER_TO_THE_PEOPLE,
    emailDomains: ["schwarzenegger.com"],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "keanu-reeves",
    name: "Keanu Reeves",
    bio: "Actor, quiet philanthropist, universally respected for genuine humility",
    purpose: "Crown: Builder (Culture) — Power to the People",
    whyYou:
      "You gave your Matrix earnings to the special effects and costume design crews. You ride the subway. You gave up your seat. The Builder Crown (Culture) demonstrates that civic participation and mutual generosity are the same impulse. You already live the way this platform asks people to live.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Builder (Culture)",
    initiative: INITIATIVES.POWER_TO_THE_PEOPLE,
    emailDomains: [],
    launchFlag: "H",
    icon: "👑",
  },
  {
    id: "sandra-bullock",
    name: "Sandra Bullock",
    bio: "Academy Award winner, quiet disaster relief builder, community infrastructure advocate",
    purpose: "Crown: Builder (Action) — Power to the People",
    whyYou:
      "After Katrina, you gave a million dollars. After the tsunami, a million. After Harvey, a million. After the wildfires, a million. And in between, you built the actual infrastructure of recovery most people never see. The Builder Crown (Action) is the operational seat — infrastructure, logistics, the unsexy machinery of sustained civic engagement.",
    category: "crown",
    categoryLabel: "Crown Leadership",
    crownTitle: "Builder (Action)",
    initiative: INITIATIVES.POWER_TO_THE_PEOPLE,
    emailDomains: [],
    launchFlag: "H",
    icon: "👑",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 2: HIGH-VALUE PERSONAL (2)
  // ═══════════════════════════════════════════════════════
  {
    id: "mackenzie-scott",
    name: "MacKenzie Scott",
    bio: "Philanthropist, gave away $17B+ with no strings attached",
    purpose: "Major funder — believes in giving without control",
    whyYou:
      "You give without strings. You trust organizations to know what they need. This platform was built with half a family's emergency savings and a prayer for potatoes at the end of a hoe handle. We don't want your money — we want your rolodex. Three references from people who understand cooperative economics. That's it.",
    category: "high-value",
    categoryLabel: "Strategic Partnership",
    emailDomains: ["losthorsepress.org", "yielding.com"],
    launchFlag: "AA",
    icon: "💎",
  },
  {
    id: "warren-buffett",
    name: "Warren Buffett",
    bio: "Oracle of Omaha, value-focused contributor, cooperative economics thinker",
    purpose: "Contribution philosophy alignment, credibility anchor",
    whyYou:
      "You've spent sixty years proving that value-focused backing beats speculation. This platform's economics are designed the same way — predictable service value, transparent margins, constitutional guardrails against extraction. Cost+20% isn't a policy; it's a DNA Lock. The economics can't degrade because they're structurally locked.",
    category: "high-value",
    categoryLabel: "Strategic Partnership",
    emailDomains: ["berkshirehathaway.com"],
    launchFlag: "T",
    icon: "💎",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 3: JOURNALIST & MEDIA (7)
  // ═══════════════════════════════════════════════════════
  {
    id: "casey-newton",
    name: "Casey Newton",
    bio: "Writes Platformer newsletter, top tech platform critic",
    purpose: "Coverage — he covers exactly what we're disrupting",
    whyYou:
      "You write about platform power every day. What happens when a platform constitutionally locks its margin at Cost+20%, gives creators 83.3%, and makes the economics impossible to change? That's not a thought experiment. We built it. Backed by {{innovationCount}} innovations and 2,473 formal claims across {{provisionalApps}} provisional applications — 8 definite with 9 more from the first 130 survived a deep dive with no prior art.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: ["platformer.news"],
    launchFlag: "AB",
    icon: "📰",
  },
  {
    id: "cory-doctorow",
    name: "Cory Doctorow",
    bio: "Coined 'enshittification,' novelist, digital rights champion",
    purpose: "Coverage — his thesis IS our business model",
    whyYou:
      "You named the disease. We built the cure. 'Enshittification' describes what happens when platforms extract from users to please backers. This platform has a DNA Lock — constitutional economics that literally cannot change. Cost+20%. 83.3% to creators. Locked. Forever. You coined the word for what we're fighting. Come see what happens when someone actually fixes it.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: ["craphound.com", "pluralistic.net"],
    launchFlag: "AB",
    icon: "📰",
  },
  {
    id: "molly-white",
    name: "Molly White",
    bio: "Runs 'Web3 Is Going Great,' skeptic of tech grift",
    purpose: "Coverage — we're the real thing she's been looking for",
    whyYou:
      "You've spent years proving that 'decentralized' platforms are usually centralized grift. We're not crypto. We're not blockchain. We're a cooperative with constitutional economics, 8 utility patents with no prior art, and a DNA Lock that prevents the founder from changing the deal. Come be skeptical. We built this for skeptics.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: ["mollywhite.net"],
    launchFlag: "AC",
    icon: "📰",
  },
  {
    id: "tim-ingham",
    name: "Tim Ingham",
    bio: "Founded Music Business Worldwide, music industry analyst",
    purpose: "Coverage — JukeBox directly addresses his reporting",
    whyYou:
      "You report on an industry where artists get fractions of pennies per stream. JukeBox gives artists 83.3% of every transaction — streams, sales, licenses — with that number constitutionally locked. You've documented the problem for years. Here's the infrastructure that fixes it.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: ["musicbusinessworldwide.com"],
    launchFlag: "BA",
    icon: "📰",
  },
  {
    id: "paris-marx",
    name: "Paris Marx",
    bio: "Hosts 'Tech Won't Save Us' podcast, tech labor critic",
    purpose: "Coverage — our cooperative model answers his critique",
    whyYou:
      "Your whole thesis is that tech platforms exploit workers. What happens when the tech platform is a cooperative where workers keep 83.3%, governance is limited to 300 members with rotation, and the economics are constitutionally locked? Tech won't save us — but cooperative tech might.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: [],
    launchFlag: "BB",
    icon: "📰",
  },
  {
    id: "ed-zitron",
    name: "Ed Zitron",
    bio: "Writes 'Better Offline,' corporate tech accountability",
    purpose: "Coverage — platform accountability is his beat",
    whyYou:
      "You hold tech companies accountable when they break promises. We built a platform where the promises are constitutionally locked — DNA Lock, Cost+20%, 83.3% to creators. These aren't policies that a board can override. They're structural. Come see what accountability looks like when it's engineered, not promised.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: ["ezpr.com"],
    launchFlag: "BB",
    icon: "📰",
  },
  {
    id: "brian-merchant",
    name: "Brian Merchant",
    bio: "Author of 'Blood in the Machine,' tech labor historian",
    purpose: "Coverage — cooperative labor is his historical thesis",
    whyYou:
      "You wrote the history of workers fighting machines. This is the machine that fights for workers. Cooperative economics, constitutional protections, 83.3% to creators. The Luddites weren't against technology — they were against technology that extracted from labor. So are we.",
    category: "journalist",
    categoryLabel: "Press & Media",
    emailDomains: [],
    launchFlag: "BA",
    icon: "📰",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 4: ACADEMICS (8)
  // ═══════════════════════════════════════════════════════
  {
    id: "trebor-scholz",
    name: "Trebor Scholz",
    bio: "The New School — coined 'platform cooperativism'",
    purpose: "Academic ally — literally named what we're building",
    whyYou:
      "You coined 'platform cooperativism.' We built it. {{innovationCount}} innovations — 99% utility patents — protected by 2,473 formal claims across {{provisionalApps}} provisional applications. Eight definite with 9 more from the first 130 survived a deep dive with no prior art. This isn't a theory anymore — it's a cooperative with 16 charitable initiatives and a patent portfolio worth $630K declared — $116M pessimist's floor.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["newschool.edu"],
    launchFlag: "AC",
    icon: "🎓",
  },
  {
    id: "nathan-schneider",
    name: "Nathan Schneider",
    bio: "CU Boulder — writes about cooperative governance models",
    purpose: "Academic ally — cooperative governance scholar",
    whyYou:
      "You study how cooperatives govern themselves. We built The 300 Framework — hard-coded organization size limits with defined overflow mechanics, a Steward/Red Queen dual governance model, and a DNA Lock that makes constitutional economics immutable. Your research, our infrastructure.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["colorado.edu"],
    launchFlag: "AC",
    icon: "🎓",
  },
  {
    id: "erik-brynjolfsson",
    name: "Erik Brynjolfsson",
    bio: "Stanford — studies technology's impact on economy/labor",
    purpose: "Academic ally — AI + labor economics authority",
    whyYou:
      "You study what happens when technology reshapes labor markets. We built a platform where the AI serves the cooperative — context management, innovation extraction, agent coordination — but the economics are locked in favor of humans. 83.3% to creators. Constitutional. Permanent.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["stanford.edu"],
    launchFlag: "BA",
    icon: "🎓",
  },
  {
    id: "juliet-schor",
    name: "Juliet Schor",
    bio: "Boston College — sharing economy & overwork researcher",
    purpose: "Academic ally — proves gig economy fails workers",
    whyYou:
      "Your research proved the sharing economy exploits workers. We built the cooperative alternative: transparent pricing, constitutional margins, 83.3% to providers. This isn't the sharing economy rebranded — it's the sharing economy redesigned with structural protections.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["bc.edu"],
    launchFlag: "BB",
    icon: "🎓",
  },
  {
    id: "yochai-benkler",
    name: "Yochai Benkler",
    bio: "Harvard Law — peer production & commons theory",
    purpose: "Academic ally — his theory of commons IS our platform",
    whyYou:
      "You theorized peer production and the networked commons. We built the commercial infrastructure for it — a platform where commons-based production meets constitutional economics. Your theory. Our implementation. {{innovationCount}} innovations — 2,473 formal claims across {{provisionalApps}} provisional applications — proving it works.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["law.harvard.edu", "harvard.edu"],
    launchFlag: "BB",
    icon: "🎓",
  },
  {
    id: "arun-sundararajan",
    name: "Arun Sundararajan",
    bio: "NYU Stern — sharing economy & platform economics",
    purpose: "Academic ally — platform business model expert",
    whyYou:
      "You wrote the book on platform business models. Here's one that breaks every rule: Cost+20% constitutional margin, 83.3% to creators, DNA Lock against extraction, 8 utility patents with no prior art. The business model that shouldn't work — but does.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["stern.nyu.edu", "nyu.edu"],
    launchFlag: "BC",
    icon: "🎓",
  },
  {
    id: "daron-acemoglu",
    name: "Daron Acemoglu",
    bio: "MIT — Nobel laureate, 'Why Nations Fail,' institutional economics",
    purpose: "Academic credibility — institutional design authority",
    whyYou:
      "You won the Nobel Prize for proving that institutions determine prosperity. We built a digital institution with constitutional economics — DNA Lock, The 300 Framework, Steward/Red Queen governance — designed so the institution cannot extract from its members. Your research. Our architecture.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["mit.edu"],
    launchFlag: "BC",
    icon: "🎓",
  },
  {
    id: "mariana-mazzucato",
    name: "Mariana Mazzucato",
    bio: "UCL — 'The Entrepreneurial State,' mission-oriented economics",
    purpose: "Academic ally — public value creation framework",
    whyYou:
      "You argue that the state creates value, not just the market. This platform creates public value through cooperative commerce — 16 charitable initiatives funded by constitutional 20% margins. Mission-oriented economics, implemented.",
    category: "academic",
    categoryLabel: "Academic Partnership",
    emailDomains: ["ucl.ac.uk"],
    launchFlag: "H",
    icon: "🎓",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 5: THOUGHT LEADERS (3)
  // ═══════════════════════════════════════════════════════
  {
    id: "esther-perel",
    name: "Esther Perel",
    bio: "Therapist, relationship/trust expert, top podcast host",
    purpose: "Amplifier — trust & community resonance",
    whyYou:
      "You understand that trust is built through vulnerability and accountability. This platform's entire architecture is a trust machine — transparent economics, constitutional protections, Harper Guild facilitators. The relationships between members are the product. Your work explains why it works.",
    category: "thought-leader",
    categoryLabel: "Thought Leadership",
    emailDomains: ["estherperel.com"],
    launchFlag: "BC",
    icon: "🧠",
  },
  {
    id: "simon-sinek",
    name: "Simon Sinek",
    bio: "'Start With Why' author, purpose-driven leadership icon",
    purpose: "Amplifier — our 'why' is his entire framework",
    whyYou:
      "You taught the world to start with why. Our why: help each other help ourselves. The Golden Key. Every decision — Cost+20%, 83.3% to creators, DNA Lock, The 300 — flows from that single principle. Your framework. Our proof that it scales.",
    category: "thought-leader",
    categoryLabel: "Thought Leadership",
    emailDomains: ["simonsinek.com", "optimismpress.com"],
    launchFlag: "BA",
    icon: "🧠",
  },
  {
    id: "seth-godin",
    name: "Seth Godin",
    bio: "Marketing legend, 'Tribes' author, permission marketing",
    purpose: "Amplifier — cooperative tribes is his thesis applied",
    whyYou:
      "You wrote about tribes before platforms existed. Now platforms have tribes — but they extract from them. We built a platform where the tribe owns the economics: 83.3% to creators, constitutional margins, governance limited to 300 members with overflow mechanics. Your thesis, cooperatively implemented.",
    category: "thought-leader",
    categoryLabel: "Thought Leadership",
    emailDomains: ["sethgodin.com", "squidoo.com"],
    launchFlag: "BB",
    icon: "🧠",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 6: OUTREACH (14)
  // ═══════════════════════════════════════════════════════
  {
    id: "anand-giridharadas",
    name: "Anand Giridharadas",
    bio: "'Winners Take All' author, philanthropy critic",
    purpose: "Narrative ally — our model answers his critique",
    whyYou:
      "You wrote that the elite 'change the world' in ways that preserve their power. This platform is the structural answer: cooperative economics that cannot be captured, constitutional margins that cannot be extracted, and governance that rotates by design. Not winners taking all — everyone keeping 83.3%.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["anand.ly"],
    launchFlag: "AB",
    icon: "📢",
  },
  {
    id: "hank-green",
    name: "Hank Green",
    bio: "Creator economy advocate, built creator-first platforms",
    purpose: "Ally — creator economics pioneer",
    whyYou:
      "You've built platforms that put creators first. We took it further: 83.3% to creators, constitutionally locked. No future board, no future CEO, no future backer can ever change that number. You advocate for creators. We engineered the guarantee.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["complexly.com", "dftba.com"],
    launchFlag: "BA",
    icon: "📢",
  },
  {
    id: "li-jin",
    name: "Li Jin",
    bio: "Atelier Ventures, passion economy & creator participation",
    purpose: "Sponsor/ally — creator-driven platform thesis",
    whyYou:
      "You back the passion economy and creator participation. This is a platform where creators genuinely control their economics — 83.3% constitutionally locked, three-gear currency, Joules with platform benefit rights. Your sponsorship thesis, our infrastructure.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["atelierventures.co", "atelier.com"],
    launchFlag: "BA",
    icon: "📢",
  },
  {
    id: "craig-newmark",
    name: "Craig Newmark",
    bio: "Founded Craigslist, now philanthropist for trustworthy info",
    purpose: "Funder/ally — community platform pioneer",
    whyYou:
      "You built the original community platform — simple, useful, not extractive. Then you watched every platform after yours become extractive. We built the one that can't. Constitutional economics, DNA Lock, 83.3% to users. Craigslist values, with structural guarantees.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["craigslist.org", "craignewmarkphilanthropies.org"],
    launchFlag: "BB",
    icon: "📢",
  },
  {
    id: "douglas-rushkoff",
    name: "Douglas Rushkoff",
    bio: "'Throwing Rocks at the Google Bus,' cooperative economics writer",
    purpose: "Narrative ally — cooperative digital economics",
    whyYou:
      "You argued that the digital economy should serve people, not extract from them. We built the platform that does: cooperative commerce with constitutional margins, 83.3% to creators, and a DNA Lock that prevents extraction. Your book. Our platform.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["rushkoff.com"],
    launchFlag: "BB",
    icon: "📢",
  },
  {
    id: "ai-jen-poo",
    name: "Ai-jen Poo",
    bio: "National Domestic Workers Alliance leader",
    purpose: "Labor ally — domestic worker cooperative champion",
    whyYou:
      "You fight for domestic workers who are invisible to the economy. Household Concierge puts those workers on a cooperative platform where they keep 83.3% — with transparent pricing, no algorithmic wage theft, and constitutional protections. Visibility through infrastructure.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["domesticworkers.org"],
    launchFlag: "BC",
    icon: "📢",
  },
  {
    id: "majora-carter",
    name: "Majora Carter",
    bio: "Urban revitalization, community self-determination",
    purpose: "Ally — grassroots cooperative economics in action",
    whyYou:
      "You've spent decades proving that communities can revitalize themselves without being displaced by the revitalization. Cooperative commerce with constitutional margins is the economic infrastructure for that vision. Your communities. Our platform.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["majoracarter.com"],
    launchFlag: "BC",
    icon: "📢",
  },
  {
    id: "howard-marks",
    name: "Howard Marks",
    bio: "Oaktree Capital, writes contribution memos on value",
    purpose: "Backer framing — value contribution alignment",
    whyYou:
      "Your memos are legendary because you think about risk differently. This platform's economics are designed to eliminate the biggest risk in tech: extraction creep. Cost+20% is constitutionally locked. The margin can't grow. The extraction can't start. Predictable service value, by design.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["oaktreecapital.com"],
    launchFlag: "T",
    icon: "📢",
  },
  {
    id: "kara-swisher",
    name: "Kara Swisher",
    bio: "Top tech journalist, podcast host, industry access",
    purpose: "Media — she opens doors to everyone",
    whyYou:
      "You've interviewed every tech CEO alive and asked the questions they don't want to answer. Here's a platform that answers them all before you ask: transparent margins, constitutional economics, 83.3% to creators, DNA Lock against extraction. The interview writes itself.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["karaswisher.com", "vox.com"],
    launchFlag: "T",
    icon: "📢",
  },
  {
    id: "ezra-klein",
    name: "Ezra Klein",
    bio: "NYT opinion, policy deep-dives, massive audience",
    purpose: "Media — policy framing for cooperative commerce",
    whyYou:
      "You make policy understandable. Cooperative commerce with constitutional economics is a policy story waiting to be told — what happens when a platform is structurally prevented from extracting? 83.3% to creators, Cost+20% locked, 16 charitable initiatives funded by the margin. The policy implication is enormous.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["nytimes.com"],
    launchFlag: "T",
    icon: "📢",
  },
  {
    id: "melinda-french-gates",
    name: "Melinda French Gates",
    bio: "Philanthropist, Pivotal Ventures, economic empowerment focus",
    purpose: "Major funder — women's economic empowerment",
    whyYou:
      "You fund women's economic empowerment. This platform gives women entrepreneurs 83.3% of every transaction — constitutionally locked. From Let's Make Dinner to Harper Guild to MSA, women lead the initiatives. The economics guarantee their earnings can never be extracted.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["pivotalventures.org", "gatesfoundation.org"],
    launchFlag: "H",
    icon: "📢",
  },
  {
    id: "shoshana-zuboff",
    name: "Shoshana Zuboff",
    bio: "Harvard, 'Surveillance Capitalism' author",
    purpose: "Academic/ally — her critique, our answer",
    whyYou:
      "You diagnosed surveillance capitalism. We built the antidote: zero-PII policy, no behavioral data extraction, no attention economy. The platform makes money through transparent margins, not surveillance. Your diagnosis. Our prescription.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["hbs.edu"],
    launchFlag: "H",
    icon: "📢",
  },
  {
    id: "kate-raworth",
    name: "Kate Raworth",
    bio: "'Doughnut Economics' author, regenerative economics",
    purpose: "Academic/ally — her economic model maps to ours",
    whyYou:
      "You drew the doughnut — the safe space between social foundation and ecological ceiling. This platform operates inside it: constitutional margins prevent overshoot, cooperative economics ensure the social foundation, and the DNA Lock keeps it there permanently.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["kateraworth.com"],
    launchFlag: "H",
    icon: "📢",
  },
  {
    id: "nilay-patel",
    name: "Nilay Patel",
    bio: "Editor-in-Chief of The Verge, platform policy voice",
    purpose: "Media — platform accountability coverage",
    whyYou:
      "You've covered every platform's rise and every platform's betrayal. Here's one built so the betrayal is architecturally impossible. Constitutional economics, DNA Lock, 83.3% to creators. The Verge has covered the problem for a decade. Here's the story where someone actually fixed it.",
    category: "outreach",
    categoryLabel: "Strategic Outreach",
    emailDomains: ["theverge.com", "voxmedia.com"],
    launchFlag: "H",
    icon: "📢",
  },

  // ═══════════════════════════════════════════════════════
  // CATEGORY 7: BLESSING LETTERS (3)
  // ═══════════════════════════════════════════════════════
  {
    id: "dolly-parton",
    name: "Dolly Parton",
    bio: "Country legend, Imagination Library, beloved universally",
    purpose: "Blessing — cultural credibility, heartland trust",
    whyYou:
      "You gave away 200 million books because every child deserves to read. This platform gives creators 83.3% because every person's work has value. You don't need to run anything — just know we're building this with the same spirit you've lived your whole life.",
    category: "blessing",
    categoryLabel: "Cultural Blessing",
    emailDomains: ["dollywood.com", "dollyparton.com"],
    launchFlag: "BC",
    icon: "🎵",
  },
  {
    id: "jimmy-kimmel",
    name: "Jimmy Kimmel",
    bio: "Late night host, healthcare advocacy, broad audience",
    purpose: "Blessing — mainstream visibility, healthcare angle",
    whyYou:
      "You stood on national television and cried about healthcare because your son nearly died. The Tatiana Schlossburg Health Accords give members access to medicine at Cost+20% — transparent, cooperative, constitutional. You don't need to run it. Just know it exists because people like you spoke up.",
    category: "blessing",
    categoryLabel: "Cultural Blessing",
    emailDomains: ["abc.com"],
    launchFlag: "T",
    icon: "🎵",
  },
  {
    id: "pitbull",
    name: "Pitbull",
    bio: "Mr. Worldwide, charter school founder, hustle embodied",
    purpose: "Blessing — multicultural reach, entrepreneurship",
    whyYou:
      "You built charter schools because education should be accessible. You built a brand because hustle should be rewarded. This platform gives entrepreneurs 83.3% and funds 16 charitable initiatives including education. Mr. Worldwide, meet a platform built for the world.",
    category: "blessing",
    categoryLabel: "Cultural Blessing",
    emailDomains: ["pitbullmusic.com", "mrworldwide.com"],
    launchFlag: "T",
    icon: "🎵",
  },
  // ═══════════════════════════════════════════════════════
  // FAMILY / CUE CARD RECIPIENTS
  // ═══════════════════════════════════════════════════════
  {
    id: "amarissa-jones",
    name: "Amarissa Jones",
    bio: "LB's first paid Influencer",
    purpose: "Content Creator / Influencer / Pearl Diver / TasteMaker",
    whyYou:
      "You're creative, you're fast, and you already know how to make content people watch. $5,500 worth of work across 9 categories — pick what you want, skip what you don't. Your phone is your office.",
    category: "family",
    categoryLabel: "Family / Pioneer",
    emailDomains: [],
    knownEmails: ["amarissa.vigil.111@gmail.com"],
    launchFlag: "F",
    icon: "🎬",
  },
  {
    id: "diana-jones",
    name: "Diana Jones",
    bio: "Photographer + Pearl Diver",
    purpose: "Business Photographer / Resource Intelligence Scout",
    whyYou:
      "You already see what others miss. You already know which thrift store has 50% off on Tuesdays. Now it counts. Now it earns Marks.",
    category: "family",
    categoryLabel: "Family / Pioneer",
    emailDomains: ["houseviridis.com"],
    knownEmails: ["vigilfenix@gmail.com", "diana@houseviridis.com"],
    launchFlag: "F",
    icon: "📸",
  },
  {
    id: "alford-hunter",
    name: "Alford Hunter",
    bio: "Godfather — Charitable Steward & Platform Explorer",
    purpose: "Guided Tour → Charitable Focus → Self-Funding Model",
    whyYou:
      "You've always seen what I was trying to do. Now you can see it. Over two decades of building — live software, filed patents, a cooperative about to launch.",
    category: "family",
    categoryLabel: "Family / Pioneer",
    emailDomains: [],
    knownEmails: ["bachelorsalad@gmail.com"],
    launchFlag: "F",
    icon: "🌳",
  },
];

// ═══════════════════════════════════════════════════════
// PRESS OUTLET REGISTRY
// ═══════════════════════════════════════════════════════

export interface PressOutlet {
  id: string;
  name: string;
  tagline: string;
  angle: string;
  launchFlag: string;
}

export const PRESS_OUTLETS: PressOutlet[] = [
  { id: "hackernews", name: "Hacker News", tagline: "Show HN: A cooperative commerce platform with constitutionally locked economics", angle: "Builder community — stress-test the model, read the patents, fork the philosophy", launchFlag: "AA" },
  { id: "producthunt", name: "Product Hunt", tagline: "Liana Banyan — Cooperative commerce where creators keep 83.3%", angle: "Product launch — see the economics, try the platform, join for $5/year", launchFlag: "AA" },
  { id: "techcrunch", name: "TechCrunch", tagline: "Startup disrupts platform economics with constitutional margins", angle: "Startup launch story — {{innovationCount}} innovations, 2,473 claims across {{provisionalApps}} provisional applications, $5/year membership", launchFlag: "AB" },
  { id: "theverge", name: "The Verge", tagline: "The platform that constitutionally locked its margins against extraction", angle: "Platform policy — what happens when enshittification is architecturally impossible?", launchFlag: "AB" },
  { id: "arstechnica", name: "Ars Technica", tagline: "Inside the 1,200-innovation patent portfolio of a cooperative commerce platform", angle: "Deep tech dive — patent architecture, DNA Lock, three-gear currency system", launchFlag: "AC" },
  { id: "shareable", name: "Shareable", tagline: "A cooperative platform with 16 charitable initiatives funded by commerce", angle: "Cooperative economy — this is your audience, this is your story", launchFlag: "BA" },
  { id: "yesmagazine", name: "Yes! Magazine", tagline: "How constitutional economics prevent platform extraction", angle: "Solutions journalism — cooperative commerce that actually works", launchFlag: "BA" },
  { id: "ssir", name: "Stanford Social Innovation Review", tagline: "Constitutional economics and cooperative platform governance", angle: "Social enterprise scholarship — academic rigor, real implementation", launchFlag: "BB" },
  { id: "statnews", name: "STAT News", tagline: "Tatiana Schlossburg Health Accords: Medicine at Cost+20%, cooperatively", angle: "Healthcare vertical — medication access through cooperative buying power", launchFlag: "BC" },
  { id: "kaiserhealthnews", name: "Kaiser Health News", tagline: "Cooperative platform tackles medication affordability with transparent pricing", angle: "Healthcare policy — Cost+20% applied to pharmaceuticals", launchFlag: "BC" },
  { id: "nerdwallet", name: "NerdWallet", tagline: "How a $5/year membership saves families money through cooperative commerce", angle: "Consumer savings — real numbers, real families, real impact", launchFlag: "T" },
  { id: "investopedia", name: "Investopedia", tagline: "Understanding cooperative economics: the Cost+20% model explained", angle: "Financial literacy — how constitutional margins create predictable service value", launchFlag: "T" },
  { id: "wsj", name: "Wall Street Journal", tagline: "From 1,200 innovations to 8 patents: inside a cooperative commerce portfolio", angle: "Business feature — patent portfolio, cooperative economics, value contribution alignment", launchFlag: "T" },
];

// ═══════════════════════════════════════════════════════
// FAMILY TEST ENTRIES (Wave 0)
// ═══════════════════════════════════════════════════════

RECIPIENTS.push({
  id: "jones-family",
  name: "Jones Family",
  bio: "The Founder's family — first testers, first believers",
  purpose: "Family testing and feedback",
  whyYou:
    "Welcome home. Dad built this for us. All 16 initiatives, all the tools, all the economics — this is what 37 years of work looks like. Help me test it. Break it. Tell me what you think.",
  category: "family",
  categoryLabel: "Family",
  emailDomains: ["family"],
  launchFlag: "F",
  icon: "🏠",
});

/**
 * Find a press outlet by slug.
 */
export function findPressOutlet(slug: string): PressOutlet | null {
  return PRESS_OUTLETS.find((o) => o.id === slug.toLowerCase()) || null;
}

// ─────────────────────────────────────────────────────────
// LOOKUP FUNCTIONS
// ─────────────────────────────────────────────────────────

/**
 * Find a recipient by email address.
 * First checks exact email matches, then domain matches.
 */
export function findRecipientByEmail(email: string): Recipient | null {
  const normalizedEmail = email.toLowerCase().trim();
  const domain = normalizedEmail.split("@")[1];

  if (!domain) return null;

  // Check exact email matches first
  const exactMatch = RECIPIENTS.find((r) =>
    r.knownEmails?.includes(normalizedEmail)
  );
  if (exactMatch) return exactMatch;

  // Check domain matches
  const domainMatch = RECIPIENTS.find((r) =>
    r.emailDomains.includes(domain)
  );
  if (domainMatch) return domainMatch;

  return null;
}

/**
 * Get recognized domains for a recipient (for display hints).
 * Returns formatted domain list like "@newschool.edu, @berkman.harvard.edu"
 */
export function getRecipientDomainHints(recipient: Recipient): string {
  if (!recipient.emailDomains || recipient.emailDomains.length === 0) {
    return "";
  }
  return recipient.emailDomains.map((d) => `@${d}`).join(", ");
}

/**
 * Find a recipient by name (fuzzy match for domain hint lookup).
 * Used when we want to show domain hints based on URL slug or partial match.
 */
export function findRecipientByName(name: string): Recipient | null {
  const normalizedName = name.toLowerCase().trim();
  return RECIPIENTS.find((r) =>
    r.name.toLowerCase().includes(normalizedName) ||
    r.id.toLowerCase() === normalizedName
  ) || null;
}

/**
 * Wave 1 slug alias map: underscore slugs (letter scaffold convention) → hyphenated registry IDs.
 * Enables /red-carpet/buffett_w to resolve to the warren-buffett registry entry.
 * Source: platform/src/data/red_carpet_recipients/index.ts (Wave 1 canonical registry)
 */
const WAVE1_SLUG_ALIASES: Record<string, string> = {
  buffett_w: "warren-buffett",
  doctorow_c: "cory-doctorow",
  schneider_n: "nathan-schneider",
  brynjolfsson_e: "erik-brynjolfsson",
  khan_s: "sal-khan",
  scott_m: "mackenzie-scott",
  scholz_t: "trebor-scholz",
  benkler_y: "yochai-benkler",
  marks_h: "howard-marks",
  raworth_k: "kate-raworth",
  perel_e: "esther-perel",
  godin_s: "seth-godin",
  rushkoff_d: "douglas-rushkoff",
  newmark_c: "craig-newmark",
  white_m: "molly-white",
  green_h: "hank-green",
  poo_aj: "ai-jen-poo",
  carter_m: "majora-carter",
  parton_d: "dolly-parton",
  acemoglu_d: "daron-acemoglu",
  mazzucato_m: "mariana-mazzucato",
  giridharadas_a: "anand-giridharadas",
  klein_e: "ezra-klein",
  patel_n: "nilay-patel",
  sinek_s: "simon-sinek",
  pitbull: "pitbull",
  ocasiocortez_a: "alexandria-ocasio-cortez",
};

/**
 * Find a recipient by their URL slug (id field).
 * Also resolves Wave 1 underscore slugs (e.g. buffett_w → warren-buffett).
 */
export function findRecipientBySlug(slug: string): Recipient | null {
  const normalized = slug.toLowerCase();
  const resolvedId = WAVE1_SLUG_ALIASES[normalized] ?? normalized;
  return RECIPIENTS.find((r) => r.id === resolvedId) || null;
}

/**
 * Get all recipients by category.
 */
export function getRecipientsByCategory(
  category: RecipientCategory
): Recipient[] {
  return RECIPIENTS.filter((r) => r.category === category);
}

// ─────────────────────────────────────────────────────────
// DATABASE-FIRST LOOKUP (K202 — B053)
// ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  crown: "Crown Leadership",
  "high-value": "Strategic Partnership",
  journalist: "Press & Media",
  academic: "Academic Partnership",
  "thought-leader": "Thought Leadership",
  outreach: "Strategic Outreach",
  blessing: "Cultural Blessing",
  "media-pitch": "Media Pitch",
  professional: "Professional",
  family: "Family / Pioneer",
};

const CATEGORY_ICONS: Record<string, string> = {
  crown: "👑",
  "high-value": "💎",
  journalist: "📰",
  academic: "🎓",
  "thought-leader": "🧠",
  outreach: "📢",
  blessing: "🎵",
  family: "🏠",
};

/**
 * Maps a red_carpet_registry DB row to the Recipient interface.
 */
function mapDbRowToRecipient(row: Record<string, unknown>): Recipient {
  const cat = ((row.categories as string[])?.[0] || "outreach") as RecipientCategory;
  return {
    id: row.slug as string,
    name: row.name as string,
    bio: (row.bio as string) || "",
    purpose: (row.purpose as string) || "",
    whyYou: (row.why_you as string) || "",
    category: cat,
    categoryLabel: (row.category_label as string) || CATEGORY_LABELS[cat] || "Outreach",
    crownTitle: (row.title as string) || undefined,
    emailDomains: (row.email_domains as string[]) || [],
    knownEmails: (row.known_emails as string[]) || [],
    launchFlag: (row.launch_flag as string) || "DB",
    icon: (row.icon as string) || CATEGORY_ICONS[cat] || "🎪",
    initiative: undefined,
    coverNote: (row.cover_note as string) || (row.walkthrough_config as Record<string, unknown>)?.coverNote as string | undefined,
  };
}

/**
 * Database-first recipient lookup by email.
 * Queries red_carpet_registry table first, falls back to static array if DB unavailable.
 */
export async function findRecipientByEmailAsync(email: string): Promise<Recipient | null> {
  const normalized = email.toLowerCase().trim();
  const domain = normalized.split("@")[1];
  if (!domain) return null;

  try {
    // 1. Try exact email match in DB
    const { data: exactMatch } = await supabase
      .from("red_carpet_registry")
      .select("*")
      .filter("known_emails", "cs", `{${normalized}}`)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (exactMatch) return mapDbRowToRecipient(exactMatch);

    // 2. Try domain match in DB
    const { data: domainMatch } = await supabase
      .from("red_carpet_registry")
      .select("*")
      .filter("email_domains", "cs", `{${domain}}`)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (domainMatch) return mapDbRowToRecipient(domainMatch);

    // 3. Fallback to static array
    return findRecipientByEmail(normalized);
  } catch {
    // DB unavailable — use static fallback
    return findRecipientByEmail(normalized);
  }
}

/**
 * Database-first recipient lookup by slug.
 */
export async function findRecipientBySlugAsync(slug: string): Promise<Recipient | null> {
  const normalized = slug.toLowerCase().trim();
  try {
    const { data } = await supabase
      .from("red_carpet_registry")
      .select("*")
      .eq("slug", normalized)
      .eq("is_active", true)
      .maybeSingle();

    if (data) return mapDbRowToRecipient(data);
    return findRecipientBySlug(normalized);
  } catch {
    return findRecipientBySlug(normalized);
  }
}

/**
 * Get the platform stats for display.
 */
export const PLATFORM_STATS = {
  innovations: "{{innovationCount}}",
  formalClaims: 2473,
  filedApplications: 11,
  crownJewels: 228,
  plannedFilings: 11,
  productionSystems: 35,
  possibleMore: 9,
  patentQueries: 130,
  priorArtPatentsReviewed: "330+",
  portfolioValue: "$630K declared — $116M floor",
  creatorKeeps: "83.3%",
  platformMargin: "Cost + 20%",
  membership: "$5/year",
  initiatives: 16,
  innovationsSurvivingDeepDive: 8,
  zeroPriorArt: 8,
  founderYearsDeveloping: 37,
};
