/**
 * 52-CARD TREASURE MAP GAME
 * ==========================
 * Ghost World onboarding game. Anonymous users explore the platform
 * by finding hidden "cards" on different pages. Each card reveals
 * a piece of the Liana Banyan story and awards ghost feathers.
 *
 * The 52 cards map to a standard deck:
 * - 4 suits (Hearts=Food, Diamonds=Finance, Clubs=Safety, Spades=Learning)
 * - 13 ranks per suit (A,2-10,J,Q,K)
 * - Each card has a location hint and rewards ghost feathers
 * - Find all 52 to unlock the Royal Flush achievement
 *
 * No login required — uses localStorage for ghost persistence.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Map, Ghost, Sparkles, Trophy, Heart, Diamond,
  Spade, Club, Lock, Unlock, Search, Star, Feather,
  ArrowRight, Eye, Gift, Crown,
} from "lucide-react";
import { toast } from "sonner";

// ─── TYPES ───

interface TreasureCard {
  id: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  rank: string;
  rankValue: number;
  name: string;
  description: string;
  hint: string;
  pageRoute: string;
  featherReward: number;
  secretCode: string;
  storyFragment: string;
}

interface GameState {
  foundCards: string[];
  totalFeathers: number;
  startedAt: string;
  lastFoundAt: string | null;
}

// ─── SUIT CONFIG ───

const SUITS = {
  hearts: { name: "Hearts", icon: Heart, color: "text-red-500", bg: "bg-red-500/10", theme: "Food & Home" },
  diamonds: { name: "Diamonds", icon: Diamond, color: "text-blue-500", bg: "bg-blue-500/10", theme: "Finance & Work" },
  clubs: { name: "Clubs", icon: Club, color: "text-green-500", bg: "bg-green-500/10", theme: "Health & Safety" },
  spades: { name: "Spades", icon: Spade, color: "text-purple-500", bg: "bg-purple-500/10", theme: "Creative & Learning" },
} as const;

const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// ─── THE 52 CARDS ───

function generateDeck(): TreasureCard[] {
  const cards: TreasureCard[] = [];

  const suitData: Record<string, { routes: string[]; stories: string[]; descriptions: string[] }> = {
    hearts: {
      routes: ["/", "/initiatives/lets-make-dinner", "/initiatives/lets-get-groceries", "/initiatives/lets-go-shopping",
               "/initiatives/household-concierge", "/initiatives/the-family-table", "/ghost", "/golden-key",
               "/matchtrade", "/help-wanted", "/RedCarpet", "/hofund", "/herald"],
      stories: [
        "Neighbors feeding neighbors — the oldest form of community.",
        "Volume purchasing power turns $100 into $130 worth of groceries.",
        "When you shop together, the savings multiply.",
        "Home management shouldn't require wealth.",
        "Do The Swoop — intergenerational storytelling at every table.",
        "The Family Table connects grandparents to grandchildren.",
        "Ghost World: explore freely, decide later.",
        "The Golden Key: Help each other help ourselves.",
        "Trade skills, not money. MARKS for MARKS.",
        "Every community has helpers. Help Wanted finds them.",
        "The Red Carpet welcomes everyone equally.",
        "Hofund controls where your QR routes.",
        "Don't break the chain — the Herald rewards consistency.",
      ],
      descriptions: [
        "Find the landing page heart", "Visit the dinner table", "Check the grocery aisle",
        "Browse the shopping initiative", "Explore home concierge", "Sit at the family table",
        "Wander Ghost World", "Seek the Golden Key", "Trade at MatchTrade",
        "Browse Help Wanted", "Walk the Red Carpet", "Turn the Hofund dial",
        "Read the Herald's message",
      ],
    },
    diamonds: {
      routes: ["/portfolio", "/dashboard", "/guilds", "/withdraw",
               "/initiatives/vsl", "/initiatives/lets-make-bread", "/initiatives/brass-tacks",
               "/peer-contracts", "/sponsor", "/deck", "/medallions",
               "/fly-on-the-wall", "/governance"],
      stories: [
        "Your portfolio grows with every contribution.",
        "The dashboard shows what matters: your impact.",
        "Guilds are where skills meet purpose.",
        "Withdrawals are transparent. Every penny tracked.",
        "Village Savings & Loans — $50 emergency microloans.",
        "Cooperative manufacturing. 95% cost reduction.",
        "Brass Tacks: every medallion tells a story.",
        "Peer contracts: trust, verified.",
        "Johnny Appleseed plants seeds of membership.",
        "Collect cards. Each one is a piece of the story.",
        "Medallions earned, not purchased.",
        "Fly on the Wall: nothing is hidden.",
        "The 300 govern. 100 AI. 100 Human. 100 Mixed.",
      ],
      descriptions: [
        "Check your portfolio", "Visit the dashboard", "Explore the guilds",
        "Find the withdrawal page", "Visit VSL", "Enter the factory",
        "Polish the brass tacks", "Review peer contracts", "Meet Johnny Appleseed",
        "Flip through the deck", "Earn a medallion", "Be a fly on the wall",
        "Enter the governance hall",
      ],
    },
    clubs: {
      routes: ["/initiatives/tatiana-schlossburg-health-accords", "/initiatives/msa", "/initiatives/defense-klaus",
               "/initiatives/rally-group", "/durins-door", "/the-helm",
               "/beacons", "/hexisle", "/transparency",
               "/tribes", "/initiatives", "/star-chamber",
               "/the-300"],
      stories: [
        "Affordable prescriptions — because health isn't a luxury.",
        "Medical Savings Accounts share risk and reward.",
        "For Someone You Love — Defense Klaus protects.",
        "When disaster strikes, Rally Group moves.",
        "Speak friend and enter. 9 doors. 50+ passwords.",
        "The Helm: beacons light the way.",
        "Drop a beacon. Someone will follow.",
        "HexIsle: build your cooperative city.",
        "Transparency isn't optional. It's constitutional.",
        "Tribes connect cultures across borders.",
        "16 initiatives. One ecosystem.",
        "Star Chamber: dual AI verification.",
        "The 300: AI-Human hybrid governance.",
      ],
      descriptions: [
        "Find Health Accords", "Open MSA", "Activate Defense Klaus",
        "Rally the group", "Open Durin's Door", "Command The Helm",
        "Drop a beacon", "Explore HexIsle", "Read the transparency report",
        "Join a tribe", "Browse all initiatives", "Enter the Star Chamber",
        "Take your seat in The 300",
      ],
    },
    spades: {
      routes: ["/initiatives/jukebox", "/initiatives/didasko", "/initiatives/international",
               "/initiatives/harper-guild", "/business-plan", "/production-queue",
               "/docs/video-scripts", "/ip/register", "/crowdfunding",
               "/asset-library", "/prototyping", "/positions/browse",
               "/themes"],
      stories: [
        "Artists keep 83.3%. Constitutionally locked.",
        "BOUNTY K-12: education as cooperative enterprise.",
        "International: borders don't stop cooperation.",
        "Harper Guild: HR ethics for everyone.",
        "Plan your business. The platform does the math.",
        "Production queue: 3/5 days platform, 2/5 days personal.",
        "Video scripts that tell our story.",
        "Register your IP. Protect your innovation.",
        "Crowdfunding, but cooperative.",
        "The asset library: shared resources.",
        "Prototyping contracts: build first, pay fair.",
        "Browse positions. Find your role.",
        "Themes: make it yours.",
      ],
      descriptions: [
        "Play the JukeBox", "Open the textbook", "Cross the border",
        "Meet Harper Guild", "Write a business plan", "Check the queue",
        "Watch the scripts", "Register your IP", "Fund the future",
        "Browse the library", "Prototype something", "Find a position",
        "Theme your experience",
      ],
    },
  };

  const suitKeys = Object.keys(suitData) as Array<keyof typeof suitData>;
  suitKeys.forEach((suit) => {
    RANKS.forEach((rank, i) => {
      const data = suitData[suit];
      cards.push({
        id: `${suit}-${rank}`,
        suit: suit as TreasureCard["suit"],
        rank,
        rankValue: i + 1,
        name: `${rank} of ${SUITS[suit as keyof typeof SUITS].name}`,
        description: data.descriptions[i],
        hint: `Visit ${data.routes[i]} to find this card.`,
        pageRoute: data.routes[i],
        featherReward: rank === "A" ? 10 : rank === "K" ? 8 : rank === "Q" ? 6 : rank === "J" ? 5 : i + 1,
        secretCode: `LB-${suit.toUpperCase()}-${rank}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        storyFragment: data.stories[i],
      });
    });
  });

  return cards;
}

const DECK = generateDeck();

// ─── LOCAL STORAGE HELPERS ───

const STORAGE_KEY = "lb_treasure_map_game";

function loadGameState(): GameState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { foundCards: [], totalFeathers: 0, startedAt: new Date().toISOString(), lastFoundAt: null };
}

function saveGameState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── MAIN COMPONENT ───

export default function TreasureMapGame() {
  const navigate = useNavigate();
  const { openOnboard } = useSeamlessOnboard();
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [redeemCode, setRedeemCode] = useState("");
  const [selectedSuit, setSelectedSuit] = useState<string | null>(null);

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  const foundSet = new Set(gameState.foundCards);
  const progress = (foundSet.size / 52) * 100;

  const redeemCard = () => {
    const code = redeemCode.trim().toUpperCase();
    if (!code) return;

    const card = DECK.find((c) => c.secretCode === code);
    if (!card) {
      toast.error("Invalid code. Keep exploring!");
      setRedeemCode("");
      return;
    }

    if (foundSet.has(card.id)) {
      toast.info("You already found this card!");
      setRedeemCode("");
      return;
    }

    const newState: GameState = {
      ...gameState,
      foundCards: [...gameState.foundCards, card.id],
      totalFeathers: gameState.totalFeathers + card.featherReward,
      lastFoundAt: new Date().toISOString(),
    };

    setGameState(newState);
    setRedeemCode("");
    toast.success(
      `Found the ${card.name}! +${card.featherReward} feathers. "${card.storyFragment}"`
    );

    // Check for suit completion
    const suitCards = DECK.filter((c) => c.suit === card.suit);
    const suitFound = suitCards.filter((c) => newState.foundCards.includes(c.id));
    if (suitFound.length === 13) {
      toast.success(`Royal Flush: ${SUITS[card.suit].name} complete! Bonus: +25 feathers`);
      setGameState((prev) => ({
        ...prev,
        totalFeathers: prev.totalFeathers + 25,
      }));
    }

    // Check for full deck
    if (newState.foundCards.length === 52) {
      toast.success("ALL 52 CARDS FOUND! You've completed the Treasure Map! +100 feathers");
      setGameState((prev) => ({
        ...prev,
        totalFeathers: prev.totalFeathers + 100,
      }));
    }
  };

  const displayCards = selectedSuit
    ? DECK.filter((c) => c.suit === selectedSuit)
    : DECK;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Map className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">52-Card Treasure Map</h1>
          <p className="text-muted-foreground">
            Explore the platform. Find cards. Piece together the story. No login required.
          </p>
        </div>
      </div>

      {/* Progress */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="py-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{foundSet.size}</div>
              <div className="text-sm text-muted-foreground">/ 52 Cards Found</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-500 flex items-center justify-center gap-1">
                <Feather className="w-6 h-6" />
                {gameState.totalFeathers}
              </div>
              <div className="text-sm text-muted-foreground">Ghost Feathers</div>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between text-sm mb-2">
                <span>{progress.toFixed(0)}% Complete</span>
                <span>{52 - foundSet.size} remaining</span>
              </div>
              <Progress value={progress} className="h-4" />
              {foundSet.size === 52 && (
                <Badge className="mt-2 bg-amber-500/10 text-amber-600">
                  <Trophy className="w-3 h-3 mr-1" />
                  DECK COMPLETE!
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Redeem Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Found a Card?
          </CardTitle>
          <CardDescription>
            Enter the secret code you found while exploring a page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter card code (e.g., LB-HEARTS-A-X1Y2)"
              className="font-mono"
              onKeyDown={(e) => e.key === "Enter" && redeemCard()}
            />
            <Button onClick={redeemCard} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Redeem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suit Filter */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant={selectedSuit === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedSuit(null)}
        >
          All Suits ({foundSet.size}/52)
        </Button>
        {(Object.keys(SUITS) as Array<keyof typeof SUITS>).map((suit) => {
          const config = SUITS[suit];
          const Icon = config.icon;
          const suitFound = DECK.filter((c) => c.suit === suit && foundSet.has(c.id)).length;
          return (
            <Button
              key={suit}
              variant={selectedSuit === suit ? "default" : "outline"}
              size="sm"
              className="gap-1"
              onClick={() => setSelectedSuit(suit === selectedSuit ? null : suit)}
            >
              <Icon className={`w-4 h-4 ${config.color}`} />
              {config.name} ({suitFound}/13)
            </Button>
          );
        })}
      </div>

      {/* Suit Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.entries(SUITS) as Array<[keyof typeof SUITS, typeof SUITS[keyof typeof SUITS]]>).map(([suit, config]) => {
          const Icon = config.icon;
          const suitFound = DECK.filter((c) => c.suit === suit && foundSet.has(c.id)).length;
          return (
            <Card key={suit} className={suitFound === 13 ? "border-primary/30" : ""}>
              <CardContent className="pt-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-1 ${config.color}`} />
                <p className="font-medium">{config.name}</p>
                <p className="text-xs text-muted-foreground">{config.theme}</p>
                <Progress value={(suitFound / 13) * 100} className="h-1 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{suitFound}/13</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-13 gap-2">
        {displayCards.map((card) => {
          const found = foundSet.has(card.id);
          const suitConfig = SUITS[card.suit];
          const Icon = suitConfig.icon;

          return (
            <div
              key={card.id}
              className={`relative aspect-[2.5/3.5] rounded-lg border-2 flex flex-col items-center justify-center text-center p-1 transition-all duration-300 ${
                found
                  ? `${suitConfig.bg} border-current cursor-pointer hover:scale-105`
                  : "bg-muted/30 border-border/50 opacity-60"
              }`}
              title={found ? `${card.name}: ${card.storyFragment}` : card.hint}
              onClick={() => {
                if (found) {
                  toast.info(`${card.name}: "${card.storyFragment}"`);
                } else {
                  navigate(card.pageRoute);
                }
              }}
            >
              {found ? (
                <>
                  <Icon className={`w-4 h-4 ${suitConfig.color}`} />
                  <span className="text-xs font-bold mt-0.5">{card.rank}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/50 mt-0.5">{card.rank}</span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Story Fragments (from found cards) */}
      {gameState.foundCards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Story Fragments Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gameState.foundCards.slice(-10).reverse().map((cardId) => {
                const card = DECK.find((c) => c.id === cardId);
                if (!card) return null;
                const Icon = SUITS[card.suit].icon;
                return (
                  <div key={cardId} className="flex items-start gap-2 p-2 rounded bg-muted/50 text-sm">
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${SUITS[card.suit].color}`} />
                    <div>
                      <span className="font-medium">{card.name}:</span>{" "}
                      <span className="text-muted-foreground italic">"{card.storyFragment}"</span>
                    </div>
                  </div>
                );
              })}
              {gameState.foundCards.length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  ...and {gameState.foundCards.length - 10} more fragments
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
        <CardContent className="py-6 text-center space-y-3">
          <Ghost className="w-12 h-12 mx-auto text-green-500" />
          <h3 className="text-xl font-bold">Ready to join?</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your ghost feathers convert to real MARKS when you create an account.
            {gameState.totalFeathers > 0 && ` You have ${gameState.totalFeathers} feathers waiting.`}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => openOnboard({ reason: "play treasure map games", actionLabel: "Join", membershipIncluded: true })} className="gap-2">
              <Star className="w-4 h-4" />
              Join for $5/year
            </Button>
            <Button variant="outline" onClick={() => navigate("/ghost")} className="gap-2">
              <Ghost className="w-4 h-4" />
              Keep Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
