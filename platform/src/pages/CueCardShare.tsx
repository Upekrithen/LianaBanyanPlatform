/**
 * Cue Card Share — shareable card with front/back, QR, copy link, SMS, download
 * Route: /cue-cards/:cardType (dinner | grocery | ambassador | hexisle)
 */

import { useState, useCallback } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Copy, MessageCircle, Download } from "lucide-react";

interface CardContent {
  frontTitle: string;
  frontSub: string;
  backCopy: string;
}

const CARD_CONTENT: Record<string, CardContent> = {
  // --- CORE ROLES ---
  dinner: {
    frontTitle: "Turn one recipe into rent money.",
    frontSub: "San Antonio's neighbor-to-neighbor dinner crews.",
    backCopy: "$15–$20/order, feeds 2–4 • Texas cottage-food law • 12-person Crews • Everyone gets a first customer",
  },
  grocery: {
    frontTitle: "Got a car? Turn errands into income.",
    frontSub: "Join a 12-person grocery Crew in San Antonio.",
    backCopy: "Short, local routes • Back one member, they back yours • Works alongside dinner Crews",
  },
  ambassador: {
    frontTitle: "Get Famous. Become a Liana Banyan Ambassador.",
    frontSub: "Earn rewards tied to our patent portfolio.",
    backCopy: "Guide 10 new members • Earn Marks by tier • Level up: Torch Bearer → Lamplighter → Beacon Master",
  },
  hexisle: {
    frontTitle: "Build the Game. Own the Story.",
    frontSub: "HexIsle: A tabletop game built by its community.",
    backCopy: "Transparent Cost+20% pricing • Pre-order funded • Public build journal • 27-piece hexel system",
  },
  influencer: {
    frontTitle: "Become an Influencer.",
    frontSub: "Pretend this is a Seed.",
    backCopy: "Find a business worth knowing • Seed their story into the platform • Earn Seeder credentials + Marks • Build your reputation as a scout • No door-knocking required — do it all online",
  },
  presenter: {
    frontTitle: "Become an Ambassador.",
    frontSub: "Be a Presenter.",
    backCopy: "Pick up a prepped business package • Deliver the card in person • Both you and the Seeder earn rewards • Convert to Steward for ongoing value • Your ten directs start here",
  },
  contracts: {
    frontTitle: "Work on Your Terms.",
    frontSub: "Get contracts, get paid.",
    backCopy: "Creator keeps 83.3% • Set your own rates • Transparent Cost+20% platform margin • No bidding wars • Real contracts with real people • Your art, your rules",
  },
  maker: {
    frontTitle: "Make Dreams Happen.",
    frontSub: "Prototype, Design, Produce.",
    backCopy: "3D print for the platform • Join the Prototyper Guild • Factory Node operator path • From desktop printer to production line • Canister System + SLS + injection molding",
  },
  revolution: {
    frontTitle: "Join the Revolution.",
    frontSub: "Plant Businesses for Work.",
    backCopy: "10 business seed cards, each loaded • Hand them to people who'll do the work • Split, spend, or invest • Build your local economy one card at a time • You're the first domino",
  },

  // --- COMMERCE & MARKETPLACE ---
  steward: {
    frontTitle: "Become a Steward.",
    frontSub: "Manage ten. Grow together.",
    backCopy: "Manage up to 10 direct businesses • Earn from their success • Concentric Circles model • Pledge your Marks • Real responsibility, real reward",
  },
  "back-a-project": {
    frontTitle: "Back a Project.",
    frontSub: "Pre-order what you believe in.",
    backCopy: "Threshold-funded production • Your money held by Stripe until the goal is met • If it doesn't fund, you get it back • Creator keeps 83.3% • You helped build something real",
  },
  "starter-kit": {
    frontTitle: "Get the Starter Kit.",
    frontSub: "$5/year. Unlock everything.",
    backCopy: "$5/year membership • 100 free Marks for first members • Full Cue Card Deck • Ghost browsing with half-life • Access to every initiative • No ads, ever",
  },
  marketplace: {
    frontTitle: "Browse the Marketplace.",
    frontSub: "Discover what people are building.",
    backCopy: "Real products by real people • Transparent pricing (Cost+20%) • Pre-order funded production • Support creators directly • 83.3% goes to the maker",
  },
  sponsor: {
    frontTitle: "Sponsor Something Real.",
    frontSub: "Your name on work that matters.",
    backCopy: "60/10/20/10 cascade model • Cloth Pouches (Forever Stamp value) • 5K Sponsor Badge • $10M cap with reset • Not charity — investment in community",
  },

  // --- SWEET SIXTEEN INITIATIVES ---
  "defense-klaus": {
    frontTitle: "For Someone You Love.",
    frontSub: "Defense Klaus — Protection that works.",
    backCopy: "Health accords • MSA plans • Housing solutions • Medication access • Built by the community, for the community • No corporate middlemen",
  },
  "rally-group": {
    frontTitle: "Rally Together.",
    frontSub: "Strength in numbers.",
    backCopy: "Group purchasing power • Negotiate as one • Community-backed deals • Share the savings • Crown: Kimberly A. Williams",
  },
  "harper-guild": {
    frontTitle: "Join Harper Guild.",
    frontSub: "Writers. Editors. Storytellers.",
    backCopy: "Content that matters • Fair pay for words • Community editing • Build your portfolio • Published through the platform",
  },
  jukebox: {
    frontTitle: "Drop a Track.",
    frontSub: "JukeBox — Music on your terms.",
    backCopy: "Keep 83.3% of every stream • No algorithms deciding your fate • Community-curated playlists • Direct fan connection • Real music, real money",
  },
  didasko: {
    frontTitle: "Teach What You Know.",
    frontSub: "Didasko — Academic excellence.",
    backCopy: "Create courses • Share expertise • Earn from knowledge • Peer-reviewed quality • Education without the institution",
  },
  "political-expedition": {
    frontTitle: "Power to the People.",
    frontSub: "Your voice. Your representatives.",
    backCopy: "Find your reps • Track their votes • Coordinate with neighbors • Non-partisan civic engagement • Democracy needs participants, not spectators",
  },
  "brass-tacks": {
    frontTitle: "Get Down to Brass Tacks.",
    frontSub: "Real talk. Real numbers.",
    backCopy: "Transparent economics • No hidden fees • See where every dollar goes • Community-audited books • Trust is built on truth",
  },
  bread: {
    frontTitle: "Let's Make Bread.",
    frontSub: "From flour to freedom.",
    backCopy: "Cottage bakery network • Neighbor-to-neighbor • Texas cottage law • Start with what you have • Fresh bread, real income",
  },
  shopping: {
    frontTitle: "Let's Go Shopping.",
    frontSub: "Buy local. Buy smart.",
    backCopy: "Community storefronts • Support your neighbors • Group deals • Crown: Mary Beth Laughton • Real retail, real community",
  },
  vsl: {
    frontTitle: "Build Real Wealth.",
    frontSub: "VSL — Financial services for all.",
    backCopy: "Community credit union model • Crown: Cathie Mahon • Member-owned financial tools • Loans that make sense • Your money works for you",
  },

  // --- PRODUCTION & MANUFACTURING ---
  "factory-node": {
    frontTitle: "Start a Factory.",
    frontSub: "Desktop to production line.",
    backCopy: "Level 1: Desktop 3D printer • Level 2: Injection molder ($13,500) • Level 3: SLS production • 1/3 co-op funded • 8-day payback on entry level",
  },
  "canister-system": {
    frontTitle: "The Canister System.",
    frontSub: "Injection molding for everyone.",
    backCopy: "Stackable canister bodies • Twist-lock engagement • Interchangeable cavity inserts • Works with desktop presses • 1,979 innovations and counting",
  },
  "design-battle": {
    frontTitle: "Enter the Arena.",
    frontSub: "Design battles with real stakes.",
    backCopy: "Submit your design • Community votes with Marks • Winner gets produced • Real products, real money • Your creativity has value",
  },

  // --- SOCIAL & COMMUNITY ---
  "join-a-crew": {
    frontTitle: "Join a Crew.",
    frontSub: "12 people. One mission.",
    backCopy: "12-person crews • Back each other • Shared success • Real accountability • Everyone gets a first customer",
  },
  "join-a-guild": {
    frontTitle: "Join a Guild.",
    frontSub: "Find your people.",
    backCopy: "Skill-based communities • Shared resources • Group contracts • Collective bargaining • Stronger together",
  },
  "join-a-tribe": {
    frontTitle: "Join a Tribe.",
    frontSub: "Location-based community.",
    backCopy: "Your neighborhood • Local deals • Shared logistics • Community events • Neighbors helping neighbors",
  },
  "treasure-hunt": {
    frontTitle: "Go on a Treasure Hunt.",
    frontSub: "Follow the map. Find the gold.",
    backCopy: "Step-by-step guides • Cold start your business • Wildfire runs • Mini-business plans • Every step earns XP",
  },
  "golden-key": {
    frontTitle: "Find a Golden Key.",
    frontSub: "Unlock hidden content.",
    backCopy: "Complete quests • Answer challenges • Unlock gated content • Earn rare rewards • The platform rewards the curious",
  },
  "beacon-run": {
    frontTitle: "Start a Beacon Run.",
    frontSub: "Light the way for others.",
    backCopy: "Drop beacons on things worth sharing • Others follow your trail • Earn XP for each follower • Build your reputation as a guide • Your taste becomes your brand",
  },

  // --- FAMILY & HOME ---
  "family-table": {
    frontTitle: "Set the Family Table.",
    frontSub: "Cook together. Eat together.",
    backCopy: "Group cooking sessions • Shared recipes • Meal planning • Family pods • The table is where it all starts",
  },
  "cottage-kitchen": {
    frontTitle: "Open a Cottage Kitchen.",
    frontSub: "Texas cottage food law.",
    backCopy: "Cook from home, sell to neighbors • No commercial kitchen needed • Texas cottage law compliant • Start with one recipe • Your kitchen, your business",
  },

  // --- PLATFORM META ---
  "ghost-world": {
    frontTitle: "Explore Ghost World.",
    frontSub: "Browse free. Join when ready.",
    backCopy: "See everything before you commit • Half-life on free Marks • Seamless join when you're ready • No pressure, no tricks • The platform sells itself",
  },
  "xray-goggles": {
    frontTitle: "Put on the X-Ray Goggles.",
    frontSub: "See how everything works.",
    backCopy: "Toggle X-Ray mode • See the code behind the curtain • Submit feedback on any element • Draw on the screen • Help build the platform you use",
  },
  "five-dollars": {
    frontTitle: "$5 a Year.",
    frontSub: "That's it. No upsells.",
    backCopy: "$5/year membership • Full platform access • 100 free Marks • No ads ever • 1,979 patented innovations • Creator keeps 83.3% • Help each other help ourselves",
  },
  "wildfire-run": {
    frontTitle: "Start a Wildfire Run.",
    frontSub: "Share fast. Earn fast.",
    backCopy: "Time-limited sharing bursts • Bonus Marks for speed • Leaderboard bragging rights • Community-amplified reach • Your network is your net worth",
  },
  "no-ads": {
    frontTitle: "No Ads. Ever.",
    frontSub: "We mean it.",
    backCopy: "Zero advertising • Zero data selling • Cost+20% transparent margin • Platform funded by members • Your attention is yours to keep",
  },

  // --- CLASSIC / FOUNDER CUE CARDS ---
  "not-a-job": {
    frontTitle: "Not a Job.",
    frontSub: "A Way Out.",
    backCopy: "Bounties, not bosses • You choose what to work on • Build your portfolio as you go • Credits become real income • No schedule, no permission needed",
  },
  "angry": {
    frontTitle: "Angry? Start a Business.",
    frontSub: "Channel it.",
    backCopy: "Anger comes from frustration • Frustration from a lack of control • Control comes from ownership • Ownership starts at $5/year • Turn rage into revenue",
  },
  "golden-key-card": {
    frontTitle: "The Golden Key.",
    frontSub: "Help each other help ourselves.",
    backCopy: "83.3% to creators, constitutionally locked • Cost+20% forever • 1,979 innovations • No VC, no extraction • $5/year membership • The economics cannot change",
  },
  "cardboard-boots": {
    frontTitle: "Cardboard Boots.",
    frontSub: "I don't want your money. I want your rolodex.",
    backCopy: "An open letter to the people who can open doors • Three references • That's the ask • Not charity — reputation lending • Read it on Cephas",
  },
  "play-and-stage": {
    frontTitle: "You Have a Play.",
    frontSub: "I Have a Stage.",
    backCopy: "Your product, your pricing, your customers • We provide the infrastructure • Cost+20% transparent margin • Payment processing, trust, marketing • 83.3% is yours",
  },
  "the-300": {
    frontTitle: "The 300.",
    frontSub: "We're identifying 300 leaders.",
    backCopy: "Not politicians — builders, teachers, healers, makers • Governance with hard-coded size limits • Community-owned platform of millions • Apply to lead",
  },
  "i-dont-want-your-money": {
    frontTitle: "I Don't Want Your $.",
    frontSub: "I want your success.",
    backCopy: "This platform exists so YOU succeed • 83.3% to creators • No extraction • No hidden fees • We make money when you make money • Help each other help ourselves",
  },
  "get-famous": {
    frontTitle: "Get Famous. Make Money. Do Good.",
    frontSub: "Back projects with your service units.",
    backCopy: "Six-tier referral system • Pioneer → Vanguard → Pathfinder → Trailblazer → Legend → Founder's Circle • Each tier unlocks more earning power • Your reputation is your currency",
  },
  "constitutional": {
    frontTitle: "Constitutionally Locked.",
    frontSub: "The economics can't change.",
    backCopy: "Cost+20% margin locked by DNA Lock • 83.3% to creators, forever • No vote can change it • No CEO can override it • No investor can demand it • This is architecture, not policy",
  },
};

const INVITE_TEXT: Record<string, string> = Object.fromEntries(
  Object.entries(CARD_CONTENT).map(([key, c]) => [
    key,
    `${c.frontTitle} ${c.frontSub} https://lianabanyan.com/cue-cards/${key}`,
  ])
);

export default function CueCardShare() {
  const { cardType } = useParams<{ cardType: string }>();
  const type = (cardType && cardType in CARD_CONTENT) ? cardType : "five-dollars";
  const content = CARD_CONTENT[type];

  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://lianabanyan.com";
  const cardUrl = `${baseUrl}/cue-cards/${type}`;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cardUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cardUrl]);

  const handleShareText = useCallback(() => {
    const text = encodeURIComponent(INVITE_TEXT[type]);
    window.open(`sms:?body=${text}`, "_blank");
  }, [type]);

  const handleDownload = useCallback(async () => {
    const width = Math.round(3.375 * 300);
    const height = Math.round(2.125 * 300);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // QR on the right half
    try {
      const qrDataUrl = await QRCode.toDataURL(cardUrl, { width: 280, margin: 0 });
      const qrImg = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImg.onload = () => {
          ctx.drawImage(qrImg, width - 340, (height - 280) / 2, 280, 280);
          resolve();
        };
        qrImg.onerror = reject;
        qrImg.src = qrDataUrl;
      });
    } catch {
      // ignore
    }

    // Back copy text on the left
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 32px system-ui, sans-serif";
    ctx.textAlign = "left";
    const lines = content.backCopy.split(" • ");
    const lineHeight = 44;
    const leftMargin = 40;
    let y = height / 2 - (lines.length * lineHeight) / 2 + lineHeight / 2;
    for (const line of lines) {
      ctx.fillText(line, leftMargin, y);
      y += lineHeight;
    }

    const link = document.createElement("a");
    link.download = `liana-banyan-cue-card-${type}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [cardUrl, type, content.backCopy]);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="cue-card-share">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] w-full max-w-md mx-auto space-y-6">
        {/* Card preview — CR80 aspect ratio 3.375:2.125 */}
        <div
          className="relative w-full mx-auto cursor-pointer select-none"
          style={{ aspectRatio: "3.375 / 2.125", maxWidth: "337.5px", perspective: "800px" }}
          onClick={() => setIsFlipped((f) => !f)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsFlipped((f) => !f);
            }
          }}
        >
          <div
            className="absolute inset-0 rounded-xl bg-white shadow-xl border border-slate-200 transition-transform duration-300"
            style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-xl flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-50 to-white border border-slate-200"
              style={{ backfaceVisibility: "hidden" }}
            >
              <h2 className="text-lg font-bold text-slate-800 leading-tight">{content.frontTitle}</h2>
              <p className="text-sm text-slate-600 mt-2">{content.frontSub}</p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 rounded-xl flex flex-row items-center justify-between p-4 bg-white border border-slate-200"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-xs text-slate-700 leading-snug flex-1 pr-2">{content.backCopy}</p>
              <div className="flex-shrink-0 w-20 h-20">
                <QRCodeSVG value={cardUrl} size={80} level="M" />
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-slate-500">Click card to flip</p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-1" />
            {copied ? "Copied!" : "Copy link"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareText}>
            <MessageCircle className="w-4 h-4 mr-1" />
            Share via text
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" />
            Download for printing
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
