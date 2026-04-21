/**
 * DISCOVER PAGE — Progressive Disclosure Entry Point
 * =====================================================
 * When users click from the landing page, they arrive HERE —
 * not at the full app page. This shows chalk-outline discovery
 * cards that animate in and reveal what's available.
 *
 * Routes: /discover/:area
 * Areas: work, build, learn, sponsor, governance, initiatives
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, Ghost, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { DeckCardFrame } from "@/components/DeckCardFrame";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useDiscovery } from "@/hooks/useDiscovery";

/**
 * MIRROR CONNECTION MAP
 * =====================
 * Mirrors connect pages in a triangular pattern for Spotlight Ranger exploration.
 *
 * Level 2 (Primary paths: work, build, sponsor):
 *   work.leftMirror → build.rightMirror
 *   work.rightMirror → sponsor.leftMirror
 *   build.leftMirror → sponsor.rightMirror
 *   (Creates a triangle: work ↔ build ↔ sponsor ↔ work)
 *
 * Level 3 (Secondary paths: learn, governance, initiatives):
 *   Same triangle pattern PLUS a non-interactive loop preview (5→7 and back)
 *   showing the full world without allowing interaction.
 */
const MIRROR_CONNECTIONS: Record<string, { left: string; right: string; loopPreview?: string[] }> = {
  // Level 1: GET Triangle (consumer-facing)
  food: { left: '/discover/groceries', right: '/discover/shopping' },
  groceries: { left: '/discover/shopping', right: '/discover/food' },
  shopping: { left: '/discover/food', right: '/discover/groceries' },
  // Level 2: GIVE Triangle (contributor-facing)
  work: { left: '/discover/build', right: '/discover/sponsor' },
  build: { left: '/discover/sponsor', right: '/discover/work' },
  sponsor: { left: '/discover/work', right: '/discover/build' },
  // Level 3: Secondary Triangle + Loop Preview
  learn: { left: '/discover/governance', right: '/discover/initiatives', loopPreview: ['/discover/sponsor', '/discover/work', '/discover/build'] },
  governance: { left: '/discover/initiatives', right: '/discover/learn', loopPreview: ['/discover/work', '/discover/sponsor', '/discover/build'] },
  initiatives: { left: '/discover/learn', right: '/discover/governance', loopPreview: ['/discover/build', '/discover/work', '/discover/sponsor'] },
};

// Path metadata for mirror labels
const PATH_LABELS: Record<string, { emoji: string; name: string }> = {
  // GET paths (consumer-facing)
  food: { emoji: '🍽️', name: "Let's Make Dinner" },
  groceries: { emoji: '🛒', name: "Let's Get Groceries" },
  shopping: { emoji: '🛍️', name: "Let's Go Shopping" },
  // GIVE paths (contributor-facing)
  work: { emoji: '💼', name: 'Get a Job' },
  build: { emoji: '🏰', name: 'Build a Business' },
  sponsor: { emoji: '🌱', name: 'Plant Seeds' },
  learn: { emoji: '📚', name: 'Learn a Skill' },
  governance: { emoji: '🏛️', name: 'Governance' },
  initiatives: { emoji: '💖', name: 'Sweet Sixteen' },
};

// Spotlight Ranger Explainer content per path
const SPOTLIGHT_CONTENT: Record<string, { title: string; bullets: string[]; tip: string }> = {
  work: {
    title: "Welcome to Get a Job",
    bullets: [
      "Browse real opportunities across all 16 initiatives",
      "You keep 83.3% of every dollar charged — locked in the bylaws forever",
      "Tap any card to flip it and see where it leads",
      "Start as a Ghost to explore, or join for $5/year to unlock everything",
    ],
    tip: "The dashed outlines are 'chalk lines' — they'll fill in as you explore each path.",
  },
  build: {
    title: "Welcome to Build a Business",
    bullets: [
      "Launch your own Keep — your business on our infrastructure",
      "We handle payments, disputes, and verification",
      "$5 gets you started. The same backbone, your unique style.",
    ],
    tip: "Ghost World lets you explore everything before committing.",
  },
  learn: {
    title: "Welcome to Learn a Skill",
    bullets: [
      "Didasko courses pay you to learn with the BOUNTY system",
      "Join a Guild to apprentice under masters in your field",
      "Golden Keys are puzzles that unlock rewards when solved",
    ],
    tip: "Education as cooperative enterprise — you grow, we all grow.",
  },
  sponsor: {
    title: "Welcome to Plant Seeds",
    bullets: [
      "Be a Johnny Appleseed — sponsor $5 memberships for others",
      "Fund initiatives you believe in and watch your impact grow",
      "Sponsors can earn fractional patent participation as a thank-you",
    ],
    tip: "Every seed you plant changes someone's trajectory.",
  },
  governance: {
    title: "Welcome to Governance",
    bullets: [
      "The 300: 100 AI, 100 Human, 100 Mixed — transparent voting",
      "Petitions are member-proposed and signature-driven",
      "Fly on the Wall gives you real-time transparency into decisions",
    ],
    tip: "This is the most transparent governance model ever built for a platform.",
  },
  initiatives: {
    title: "Welcome to The Sweet Sixteen",
    bullets: [
      "16 initiatives spanning food, health, safety, music, education, and more",
      "All funded by commerce, not donations",
      "Creators/Workers keep 83.3% — locked forever in constitutional bylaws",
    ],
    tip: "Each initiative is interconnected — success in one feeds the others.",
  },
  // GET paths (consumer-facing) — Level 1 Triangle
  food: {
    title: "Welcome to Let's Make Dinner",
    bullets: [
      "Order home-cooked meals from community chefs in your area",
      "Ingredients auto-aggregate with neighbors for volume discounts",
      "2+ households + $25 minimum → delivery job created automatically",
      "Chefs keep 83.3% of every meal sold — locked in bylaws forever",
    ],
    tip: "Every meal order seeds the grocery list. Cold start solved.",
  },
  groceries: {
    title: "Welcome to Let's Get Groceries",
    bullets: [
      "Add items to your shopping list — system finds neighbors with similar needs",
      "When threshold met (2+ households, $25+), a delivery job is created",
      "Volume discounts: 5+ orders = 5% off, 10+ = 10%, 20+ = 15%, 40+ = 20%",
      "Self-fulfill anytime or let a worker handle it — your choice",
    ],
    tip: "The more who join, the more everyone saves. Aggregation is the magic.",
  },
  shopping: {
    title: "Welcome to Let's Go Shopping",
    bullets: [
      "Shop for anything at Cost + 20% — no hidden markups",
      "Manufacturing store: 3D printing, desktop extruders, custom goods",
      "Deliveries aggregate for maximum efficiency",
      "Workers keep 83.3% of delivery fees — same fair terms everywhere",
    ],
    tip: "Platform cost means YOU keep more. Same backbone, endless possibilities.",
  },
  // Sub-explainers for specific initiative features
  aggregation: {
    title: "How Demand Aggregation Works",
    bullets: [
      "1. You order a meal or add items to your shopping list",
      "2. System finds neighbors with similar needs in your timeframe",
      "3. When threshold met (2+ households, $25+), delivery job posts",
      "4. Confirm your address or opt-out to shop yourself",
      "5. Worker shops the combined list, delivers to all",
    ],
    tip: "One order creates downstream demand. The more who join, the more everyone saves.",
  },
  tasteTester: {
    title: "Taste Tester Rewards",
    bullets: [
      "Be among the first 5,000 to order a new recipe → earn Marks + Reputation",
      "Earlier = more rewards: First 100 get 5 Marks, 101-500 get 3, etc.",
      "When 10+ recipes you tested hit 5K orders → Master Taster status",
      "Master Tasters: All accumulated Marks convert to Credits!",
    ],
    tip: "Early adopters get rewarded. Find hidden gems before they go viral.",
  },
  icing: {
    title: "The Icing Pool",
    bullets: [
      "Recipes with 5,000+ orders are 'vetted' — makers earn Icing",
      "Icing = 20% of LB's margin on VOLUME INCREASES",
      "Distributed monthly to makers proportionally",
      "Bonus on top of the 83.3% — reward for popular dishes",
    ],
    tip: "Create something people love, keep earning as it grows.",
  },
};

interface DiscoveryPath {
  title: string;
  subtitle: string;
  description: string;
  cards: Array<{
    name: string;
    icon: string;
    hint: string;
    route: string;
  }>;
}

const PATHS: Record<string, DiscoveryPath> = {
  // GET paths (consumer-facing) — Level 1 Triangle
  food: {
    title: "Let's Make Dinner",
    subtitle: "Home-cooked meals. Community chefs.",
    description: "Order meals from neighbors who love to cook. Every order auto-aggregates ingredient demand with nearby households for volume discounts. Chefs keep 83.3%.",
    cards: [
      { name: "Order a Meal", icon: "🍽️", hint: "Browse chefs in your area", route: "/initiatives/lets-make-dinner" },
      { name: "The Pantry", icon: "📚", hint: "Recipe repository", route: "/initiatives/the-pantry" },
      { name: "Taste Tester", icon: "🧑‍🍳", hint: "Early adopter rewards", route: "/initiatives/taste-tester" },
    ],
  },
  groceries: {
    title: "Let's Get Groceries",
    subtitle: "Aggregate orders. Volume discounts.",
    description: "Add items to your list. System finds neighbors with similar needs. When 2+ households hit $25, a delivery job is created. The more who join, the more everyone saves.",
    cards: [
      { name: "Join Aggregation", icon: "🛒", hint: "Find local orders to join", route: "/initiatives/lets-get-groceries" },
      { name: "How It Works", icon: "📊", hint: "Demand aggregation explained", route: "/discover/aggregation" },
      { name: "Delivery Jobs", icon: "🚗", hint: "Shop for neighbors, keep 83.3%", route: "/help-wanted" },
    ],
  },
  shopping: {
    title: "Let's Go Shopping",
    subtitle: "Cost + 20%. No hidden markups.",
    description: "Shop for anything at platform cost. Manufacturing store for 3D printing and custom goods. Deliveries aggregate for maximum efficiency. Workers keep 83.3%.",
    cards: [
      { name: "Browse Products", icon: "🛍️", hint: "Everything at cost + 20%", route: "/initiatives/lets-go-shopping" },
      { name: "Manufacturing", icon: "🏭", hint: "3D printing, custom goods", route: "/manufacturing" },
      { name: "Track Orders", icon: "📦", hint: "See your deliveries", route: "/dashboard" },
    ],
  },
  // GIVE paths (contributor-facing) — Level 2 Triangle
  work: {
    title: "Get a Job",
    subtitle: "Real work. Fair pay. Keep 83.3%.",
    description: "Browse opportunities across all 16 initiatives AND MEMBER'S PROJECTS. From meal delivery to manufacturing, from tutoring to crisis response. 83.3% paid to the ones who do the work. Locked forever.",
    cards: [
      { name: "Help Wanted", icon: "📋", hint: "Browse bounties and open positions", route: "/help-wanted" },
      { name: "Let's Make Dinner", icon: "🍽️", hint: "Meal delivery and community kitchens", route: "/initiatives/lets-make-dinner" },
      { name: "MatchTrade", icon: "🤝", hint: "Trade skills, not money", route: "/matchtrade" },
    ],
  },
  build: {
    title: "Build a Business",
    subtitle: "Your castle. Your rules. $5 to start.",
    description: "Launch your Keep — your own business on the platform. We handle payments, disputes, verification, and infrastructure. You focus on what you do best. Same backbone, your unique style.",
    cards: [
      { name: "Ghost World", icon: "👻", hint: "Explore everything first, no commitment", route: "/ghost" },
      { name: "Manufacturing", icon: "🏭", hint: "3D printing, desktop extruders", route: "/manufacturing" },
      { name: "Hofund Studio", icon: "📡", hint: "Your QR identity and cue cards", route: "/hofund" },
    ],
  },
  // Level 3: Secondary paths
  learn: {
    title: "Learn a Skill",
    subtitle: "Earn while you learn.",
    description: "Didasko courses, Guild apprenticeships, bounty-based learning. The platform pays you to get better at what you do. Education as cooperative enterprise.",
    cards: [
      { name: "Didasko", icon: "📚", hint: "BOUNTY K-12 curriculum", route: "/initiatives/didasko" }, { name: "Hard Knocks", icon: "??", hint: "Consensus & Tutorials", route: "/hard-knocks" },
      { name: "Guilds", icon: "🏛️", hint: "Join a guild, learn from masters", route: "/guilds" },
      { name: "Golden Keys", icon: "🔑", hint: "Solve puzzles, earn rewards", route: "/golden-key" },
    ],
  },
  sponsor: {
    title: "Plant Seeds",
    subtitle: "Every $5 changes a life.",
    description: "Become a Johnny Appleseed. Sponsor memberships for people who need a start. Fund initiatives you believe in. Own a piece of a patent in return. Watch your forest grow.",
    cards: [
      { name: "Johnny Appleseed", icon: "🌱", hint: "Sponsor memberships", route: "/sponsor" },
      { name: "Sweet Sixteen", icon: "💖", hint: "16 charitable initiatives", route: "/initiatives" },
      { name: "Herald Program", icon: "📯", hint: "Share and grow your multiplier", route: "/herald" },
    ],
  },
  governance: {
    title: "Governance",
    subtitle: "The 300. Your vote matters.",
    description: "100 AI, 100 Human, 100 Mixed. Proposals, voting, constitutional bylaws. This is the most transparent governance model ever built for a platform.",
    cards: [
      { name: "The 300", icon: "🏛️", hint: "AI-Human hybrid governance", route: "/governance" },
      { name: "Petitions", icon: "📝", hint: "Member-proposed, signature-driven", route: "/petitions" },
      { name: "Fly on the Wall", icon: "👁️", hint: "Real-time transparency", route: "/fly-on-the-wall" },
    ],
  },
  initiatives: {
    title: "The Sweet Sixteen",
    subtitle: "16 initiatives. One ecosystem.",
    description: "Food, health, safety, finance, music, education, manufacturing — every initiative funded by commerce, not donations. Creators/Workers keep 83.3%.",
    cards: [
      { name: "All Initiatives", icon: "💖", hint: "Browse all 16", route: "/initiatives" },
      { name: "Food Ecosystem", icon: "🍽️", hint: "Meals, groceries, aggregation", route: "/initiatives/lets-make-dinner" },
      { name: "The Pantry", icon: "📚", hint: "Recipe repository, earn from sharing", route: "/initiatives/the-pantry" },
      { name: "Taste Tester", icon: "🧑‍🍳", hint: "Early adopter rewards", route: "/initiatives/taste-tester" },
      { name: "Defense Klaus", icon: "🛡️", hint: "For someone you love", route: "/initiatives/defense-klaus" },
      { name: "JukeBox", icon: "🎵", hint: "Fair music licensing", route: "/initiatives/jukebox" },
    ],
  },
};

export default function Discover() {
  const { area } = useParams<{ area: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { discoverCard } = useDiscovery();
  const [revealedCards, setRevealedCards] = useState<number>(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [showSpotlight, setShowSpotlight] = useState<boolean>(false);
  const [spotlightDismissed, setSpotlightDismissed] = useState<boolean>(false);
  const [showLoopPreview, setShowLoopPreview] = useState<boolean>(false);
  const [loopPreviewIndex, setLoopPreviewIndex] = useState<number>(0);

  const currentArea = area || "work";
  const path = PATHS[currentArea] || PATHS.work;
  const spotlight = SPOTLIGHT_CONTENT[currentArea] || SPOTLIGHT_CONTENT.work;
  const mirrorConnections = MIRROR_CONNECTIONS[currentArea] || MIRROR_CONNECTIONS.work;

  // Extract destination areas from mirror paths
  const leftDestArea = mirrorConnections.left.split('/').pop() || 'work';
  const rightDestArea = mirrorConnections.right.split('/').pop() || 'build';
  const leftLabel = PATH_LABELS[leftDestArea] || { emoji: '🪞', name: 'Explore' };
  const rightLabel = PATH_LABELS[rightDestArea] || { emoji: '🪞', name: 'Explore' };

  // Check if user has seen this spotlight THIS SESSION
  // Uses sessionStorage so it resets each browser session
  useEffect(() => {
    const seenKey = `spotlight_session_${currentArea}`;
    const hasSeenThisSession = sessionStorage.getItem(seenKey);
    if (!hasSeenThisSession && !spotlightDismissed) {
      // Delay spotlight to let page render first
      const timer = setTimeout(() => setShowSpotlight(true), 800);
      return () => clearTimeout(timer);
    }
  }, [currentArea, spotlightDismissed]);

  const dismissSpotlight = (rememberForever: boolean) => {
    setShowSpotlight(false);
    setSpotlightDismissed(true);
    // Always mark as seen for this session
    sessionStorage.setItem(`spotlight_session_${currentArea}`, "true");
    // Optionally remember forever (localStorage)
    if (rememberForever) {
      localStorage.setItem(`spotlight_never_${currentArea}`, "true");
    }
  };

  // Check if user has permanently disabled spotlight for this page
  useEffect(() => {
    const neverShow = localStorage.getItem(`spotlight_never_${currentArea}`);
    if (neverShow) {
      setSpotlightDismissed(true);
    }
  }, [currentArea]);

  // Animate cards in one at a time
  useEffect(() => {
    setRevealedCards(0);
    setFlippedCards(new Set());
    setSpotlightDismissed(false);
    const timers: NodeJS.Timeout[] = [];
    path.cards.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedCards(i + 1), 600 + i * 800));
    });
    return () => timers.forEach(clearTimeout);
  }, [area]);

  const toggleFlip = (idx: number) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" backButton>
        {/* Header with Connected Mirrors */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-4">
            {/* Left Mirror — connects to another path */}
            <button
              onClick={() => navigate(mirrorConnections.left)}
              className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform"
              title={`🪞 Travel to ${leftLabel.name}`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span className="text-3xl">🪞</span>
              <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity whitespace-nowrap">
                → {leftLabel.emoji} {leftLabel.name}
              </span>
            </button>

            <span>{path.title}</span>

            {/* Right Mirror — connects to another path */}
            <button
              onClick={() => navigate(mirrorConnections.right)}
              className="group flex flex-col items-center gap-1 hover:scale-110 transition-transform"
              title={`🪞 Travel to ${rightLabel.name}`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <span className="text-3xl">🪞</span>
              <span className="text-xs opacity-0 group-hover:opacity-70 transition-opacity whitespace-nowrap">
                → {rightLabel.emoji} {rightLabel.name}
              </span>
            </button>
          </h1>

          {/* Spotlight Ranger trigger */}
          <button
            onClick={() => setShowSpotlight(true)}
            className="text-sm text-muted-foreground/70 hover:text-foreground/80 transition-colors mt-1"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            🔦 Spotlight Ranger Explainer
          </button>

          <p className="text-xl text-foreground/80 mb-4 mt-2">{path.subtitle}</p>
          <p className="text-muted-foreground max-w-2xl mx-auto">{path.description}</p>

          {/* Loop Preview button for Level 3 paths */}
          {mirrorConnections.loopPreview && (
            <button
              onClick={() => setShowLoopPreview(true)}
              className="mt-4 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            >
              🌐 Preview the Full World
            </button>
          )}
        </div>

        {/* Chalk-Outline Discovery Cards with 4-Point Lock Frames */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {path.cards.map((card, i) => {
            const isRevealed = i < revealedCards;
            const cardId = `discover-${currentArea}-${card.name.toLowerCase().replace(/\s+/g, '-')}`;

            return (
              <div
                key={card.name}
                style={{
                  opacity: isRevealed ? 1 : 0,
                  transition: "opacity 0.5s ease",
                  animation: isRevealed ? "chalkReveal 1s ease-out forwards" : "none",
                }}
              >
                {isRevealed ? (
                  <DeckCardFrame
                    cardId={cardId}
                    cardType="location"
                    title={card.name}
                    description={card.hint}
                    icon={card.icon}
                    destinationRoute={card.route}
                    unlockCost={{ type: 'free', amount: 0 }}
                    isChalkOutline={false}
                    onCollect={() => {
                      const slug = card.name.toLowerCase().replace(/\s+/g, '-');
                      discoverCard(slug, currentArea);
                    }}
                  />
                ) : (
                  /* Chalk outline placeholder before reveal */
                  <div
                    className="rounded-xl flex flex-col items-center justify-center text-center p-6 aspect-[3/4]"
                    style={{
                      border: "2px dashed rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <span className="text-4xl mb-3 opacity-30">?</span>
                    <p className="text-sm text-muted-foreground/40">Revealing...</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* +1 Chalk Outline — the Rule of 3+1 */}
          <div style={{
            opacity: revealedCards >= path.cards.length ? 1 : 0,
            transition: "opacity 0.5s ease 0.5s",
          }}>
            <DeckCardFrame
              cardId={`discover-${currentArea}-more`}
              cardType="quest"
              title="More to discover..."
              description="Use 🪞 mirrors to explore"
              icon="+"
              isChalkOutline={true}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground/70 text-sm">Ready to dive deeper?</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              size="lg"
              className="bg-muted hover:bg-muted/80 border border-border gap-2"
              onClick={() => navigate("/ghost")}
            >
              <Ghost className="w-5 h-5" /> Explore as Ghost
            </Button>
            <Button
              size="lg"
              className="bg-muted hover:bg-muted/80 border border-border gap-2"
              onClick={() => openOnboard({ reason: "join the community", actionLabel: "Join", membershipIncluded: true })}
            >
              <UserPlus className="w-5 h-5" /> Join for $5/year
            </Button>
          </div>
        </div>

      {/* Loop Preview Modal — Non-interactive world tour */}
      {showLoopPreview && mirrorConnections.loopPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={() => setShowLoopPreview(false)}
        >
          <div
            className="relative max-w-4xl mx-4 p-8 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%)',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              animation: 'spotlightFadeIn 0.4s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLoopPreview(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-5xl">🌐</span>
              <h2 className="text-2xl font-bold mt-3">The Liana Banyan World</h2>
              <p className="text-sm text-muted-foreground mt-1">A preview of the interconnected ecosystem (view only)</p>
            </div>

            {/* Animated path loop visualization */}
            <div className="flex items-center justify-center gap-4 flex-wrap mb-6">
              {/* Current path */}
              <div
                className="px-4 py-3 rounded-xl text-center"
                style={{ background: 'rgba(168, 85, 247, 0.3)', border: '2px solid rgba(168, 85, 247, 0.5)' }}
              >
                <span className="text-2xl">{PATH_LABELS[currentArea]?.emoji || '📍'}</span>
                <p className="text-sm font-medium mt-1">{PATH_LABELS[currentArea]?.name || 'You Are Here'}</p>
                <p className="text-xs text-muted-foreground/70">Current</p>
              </div>

              <span className="text-2xl opacity-50">→</span>

              {/* Loop through preview paths */}
              {mirrorConnections.loopPreview.map((loopPath, i) => {
                const loopArea = loopPath.split('/').pop() || '';
                const label = PATH_LABELS[loopArea] || { emoji: '❓', name: 'Unknown' };
                return (
                  <div key={i} className="flex items-center gap-4">
                    <div
                      className="px-4 py-3 rounded-xl text-center opacity-60"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '2px dashed rgba(255,255,255,0.2)',
                        animation: `pulse ${2 + i * 0.3}s ease-in-out infinite`
                      }}
                    >
                      <span className="text-2xl">{label.emoji}</span>
                      <p className="text-sm font-medium mt-1">{label.name}</p>
                      <p className="text-xs text-muted-foreground/50">Preview</p>
                    </div>
                    {i < mirrorConnections.loopPreview!.length - 1 && (
                      <span className="text-2xl opacity-30">→</span>
                    )}
                  </div>
                );
              })}

              <span className="text-2xl opacity-50">→</span>

              {/* Back to current */}
              <div
                className="px-4 py-3 rounded-xl text-center"
                style={{ background: 'rgba(52, 211, 153, 0.2)', border: '2px solid rgba(52, 211, 153, 0.4)' }}
              >
                <span className="text-2xl">🔄</span>
                <p className="text-sm font-medium mt-1">Back Here</p>
                <p className="text-xs text-muted-foreground/70">Loop Complete</p>
              </div>
            </div>

            <div
              className="p-4 rounded-lg text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.2)' }}
            >
              <p className="text-sm text-foreground/70">
                <strong>🔒 This is a preview only.</strong> Use the mirrors (🪞) on each page to travel between worlds.
                <br />
                <span className="text-muted-foreground/70">Each path connects to others — explore to discover the full ecosystem.</span>
              </p>
            </div>

            <div className="text-center mt-4">
              <Button
                onClick={() => setShowLoopPreview(false)}
                className="bg-muted hover:bg-muted/80 border border-border"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spotlight Ranger Explainer Modal */}
      {showSpotlight && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => dismissSpotlight(false)}
        >
          <div
            className="relative max-w-lg mx-4 p-6 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              animation: 'spotlightFadeIn 0.4s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => dismissSpotlight(false)}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <span className="text-4xl">🔦</span>
              <h2 className="text-2xl font-bold mt-2">{spotlight.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">Spotlight Ranger Explainer</p>
            </div>

            {/* Bullet points */}
            <ul className="space-y-3 mb-4">
              {spotlight.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">✦</span>
                  <span className="text-foreground/90">{bullet}</span>
                </li>
              ))}
            </ul>

            {/* Tip box */}
            <div
              className="p-3 rounded-lg mb-4"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px dashed rgba(255,255,255,0.3)' }}
            >
              <p className="text-sm text-foreground/80">
                <strong>💡 Tip:</strong> {spotlight.tip}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                size="sm"
                className="bg-muted/80 hover:bg-muted border border-border"
                onClick={() => dismissSpotlight(false)}
              >
                Got it (show next session)
              </Button>
              <Button
                size="sm"
                className="bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-400/50"
                onClick={() => dismissSpotlight(true)}
              >
                Never show for this page
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground/50 mt-3">
              Click 🔦 Spotlight Ranger anytime to see this again
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes chalkReveal {
          0% { clip-path: inset(0 100% 100% 0); border-color: rgba(255,255,255,0); }
          25% { clip-path: inset(0 0 100% 0); border-color: rgba(255,255,255,0.15); }
          50% { clip-path: inset(0 0 0 0); border-color: rgba(255,255,255,0.25); }
          100% { clip-path: inset(0 0 0 0); border-color: rgba(255,255,255,0.35); box-shadow: 0 0 10px rgba(255,255,255,0.08); }
        }
        @keyframes spotlightFadeIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </PortalPageLayout>
  );
}
