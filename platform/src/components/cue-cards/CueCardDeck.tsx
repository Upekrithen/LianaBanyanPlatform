/**
 * Cue Card Deck — $5/year Viral Cue Card Deck. Browsable collection of all cue cards.
 * Share a Card → generates link with ?ref=USERNAME.
 * Includes action cards + auto-generated letter cue cards.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Share2, CreditCard, Wrench, Heart, Award, UserPlus, TrendingUp, Mail,
  ChevronDown, ChevronUp, Sparkles, Megaphone, FileSignature, Hammer,
  Flame, ShoppingBag, Shield, Music, GraduationCap, Vote, Coins,
  Wheat, Store, Landmark, Factory, Hexagon, Swords, Users, MapPin,
  Map, Key, Navigation, UtensilsCrossed, ChefHat, Ghost, Glasses,
  DollarSign, Zap, Ban, Package, Sprout,
} from "lucide-react";
import { LETTER_CUE_CARDS } from "@/data/letterCueCards";

const DECK_CARDS = [
  // Core roles
  { id: "invite-creator", title: "Invite a Creator", icon: UserPlus, href: "/join/creator", description: "Invite creators to the platform. Earn referral rewards." },
  { id: "become-steward", title: "Become a Steward", icon: Award, href: "/cue-cards/steward", description: "Manage ten. Grow together. Concentric Circles." },
  { id: "get-famous", title: "Get Famous", icon: TrendingUp, href: "/guilds/hub?tab=bandwagon", description: "Back projects. Put your service units where your mouth is." },
  { id: "idont-want-your-money", title: "I Don't Want Your $", icon: Heart, href: "/", description: "I want your success." },
  { id: "we-need-you", title: "We Need You", icon: Wrench, href: "/crew-call", description: "Do what you're already good at. Join the crew." },
  { id: "become-influencer", title: "Become an Influencer", icon: Sparkles, href: "/cue-cards/influencer", description: "Pretend this is a Seed. Find businesses, build your reputation." },
  { id: "become-presenter", title: "Become an Ambassador", icon: Megaphone, href: "/cue-cards/presenter", description: "Be a Presenter. Deliver the card, earn the reward." },
  { id: "work-on-your-terms", title: "Work on Your Terms", icon: FileSignature, href: "/cue-cards/contracts", description: "Get contracts, get paid. Keep 83.3%. Your art, your rules." },
  { id: "make-dreams-happen", title: "Make Dreams Happen", icon: Hammer, href: "/cue-cards/maker", description: "Prototype, Design, Produce. From desktop to factory." },
  { id: "join-the-revolution", title: "Join the Revolution", icon: Sprout, href: "/cue-cards/revolution", description: "Plant Businesses for Work. Hand out seed cards." },

  // Commerce & marketplace
  { id: "back-a-project", title: "Back a Project", icon: Coins, href: "/cue-cards/back-a-project", description: "Pre-order what you believe in. Threshold-funded." },
  { id: "starter-kit", title: "Get the Starter Kit", icon: CreditCard, href: "/cue-cards/starter-kit", description: "$5/year. Unlock everything. 100 free Marks." },
  { id: "browse-marketplace", title: "Browse the Marketplace", icon: Store, href: "/cue-cards/marketplace", description: "Discover what people are building. Cost+20%." },
  { id: "sponsor-something", title: "Sponsor Something Real", icon: Landmark, href: "/cue-cards/sponsor", description: "Your name on work that matters. 60/10/20/10 cascade." },

  // Sweet Sixteen initiatives
  { id: "dinner", title: "Let's Make Dinner", icon: UtensilsCrossed, href: "/cue-cards/dinner", description: "Turn one recipe into rent money." },
  { id: "grocery", title: "Let's Get Groceries", icon: ShoppingBag, href: "/cue-cards/grocery", description: "Got a car? Turn errands into income." },
  { id: "defense-klaus", title: "For Someone You Love", icon: Shield, href: "/cue-cards/defense-klaus", description: "Defense Klaus. Protection that works." },
  { id: "rally-group", title: "Rally Together", icon: Users, href: "/cue-cards/rally-group", description: "Group purchasing power. Negotiate as one." },
  { id: "harper-guild", title: "Join Harper Guild", icon: GraduationCap, href: "/cue-cards/harper-guild", description: "Writers. Editors. Storytellers." },
  { id: "jukebox", title: "Drop a Track", icon: Music, href: "/cue-cards/jukebox", description: "JukeBox. Keep 83.3% of every stream." },
  { id: "didasko", title: "Teach What You Know", icon: GraduationCap, href: "/cue-cards/didasko", description: "Didasko. Academic excellence for all." },
  { id: "political-expedition", title: "Power to the People", icon: Vote, href: "/cue-cards/political-expedition", description: "Your voice. Your representatives." },
  { id: "brass-tacks", title: "Brass Tacks", icon: DollarSign, href: "/cue-cards/brass-tacks", description: "Real talk. Real numbers. Transparent." },
  { id: "bread", title: "Let's Make Bread", icon: Wheat, href: "/cue-cards/bread", description: "Cottage bakery. Flour to freedom." },
  { id: "shopping", title: "Let's Go Shopping", icon: ShoppingBag, href: "/cue-cards/shopping", description: "Buy local. Buy smart. Community storefronts." },
  { id: "vsl", title: "Build Real Wealth", icon: Landmark, href: "/cue-cards/vsl", description: "VSL. Financial services for all." },

  // Production & manufacturing
  { id: "factory-node", title: "Start a Factory", icon: Factory, href: "/cue-cards/factory-node", description: "Desktop to production line. 1/3 co-op funded." },
  { id: "canister-system", title: "The Canister System", icon: Package, href: "/cue-cards/canister-system", description: "Injection molding for everyone." },
  { id: "design-battle", title: "Enter the Arena", icon: Swords, href: "/cue-cards/design-battle", description: "Design battles. Real stakes. Winner gets produced." },

  // Social & community
  { id: "join-a-crew", title: "Join a Crew", icon: Users, href: "/cue-cards/join-a-crew", description: "12 people. One mission. Back each other." },
  { id: "join-a-guild", title: "Join a Guild", icon: Users, href: "/cue-cards/join-a-guild", description: "Skill-based communities. Shared resources." },
  { id: "join-a-tribe", title: "Join a Tribe", icon: MapPin, href: "/cue-cards/join-a-tribe", description: "Location-based community. Neighbors helping neighbors." },
  { id: "treasure-hunt", title: "Go Treasure Hunting", icon: Map, href: "/cue-cards/treasure-hunt", description: "Follow the map. Cold start your business." },
  { id: "golden-key", title: "Find a Golden Key", icon: Key, href: "/cue-cards/golden-key", description: "Unlock hidden content. Earn rare rewards." },
  { id: "beacon-run", title: "Start a Beacon Run", icon: Navigation, href: "/cue-cards/beacon-run", description: "Light the way. Others follow your trail." },

  // Family & home
  { id: "family-table", title: "Set the Family Table", icon: UtensilsCrossed, href: "/cue-cards/family-table", description: "Cook together. Eat together." },
  { id: "cottage-kitchen", title: "Open a Cottage Kitchen", icon: ChefHat, href: "/cue-cards/cottage-kitchen", description: "Cook from home, sell to neighbors." },

  // Platform meta
  { id: "ghost-world", title: "Explore Ghost World", icon: Ghost, href: "/cue-cards/ghost-world", description: "Browse free. Join when ready." },
  { id: "xray-goggles", title: "X-Ray Goggles", icon: Glasses, href: "/cue-cards/xray-goggles", description: "See how everything works. Help us build." },
  { id: "five-dollars", title: "$5 a Year", icon: DollarSign, href: "/cue-cards/five-dollars", description: "That's it. No upsells. 1,979 innovations." },
  { id: "wildfire-run", title: "Start a Wildfire Run", icon: Flame, href: "/cue-cards/wildfire-run", description: "Share fast. Earn fast. Time-limited bursts." },
  { id: "no-ads", title: "No Ads. Ever.", icon: Ban, href: "/cue-cards/no-ads", description: "We mean it. Zero advertising. Zero data selling." },
  { id: "hexisle-game", title: "HexIsle", icon: Hexagon, href: "/cue-cards/hexisle", description: "Build the Game. Own the Story. 27-piece hexel." },
  { id: "ambassador-card", title: "Become an Ambassador", icon: Zap, href: "/cue-cards/ambassador", description: "Earn rewards tied to our patent portfolio." },
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  'crown-letter': 'Crown Letters',
  'crown-initiative': 'Crown Initiative',
  'circle-1-investors': 'Circle 1: Investors',
  'circle-2-media': 'Circle 2: Media',
  'circle-3-academics': 'Circle 3: Academics',
  'blessing': 'Blessings',
};

export function CueCardDeck() {
  const { user } = useAuth();
  const [sharedId, setSharedId] = useState<string | null>(null);

  const refName = (user as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name ?? "member";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const getShareUrl = (cardId: string) => {
    const path = cardId === "invite-creator" ? "/join/creator" : cardId === "we-need-you" ? "/crew-call" : "/";
    const sharerId = user?.id ? `&sharer=${user.id}` : "";
    return `https://lianabanyan.com${path}?ref=${encodeURIComponent(refName)}${sharerId}`;
  };

  const doShare = async (url: string, title: string, cardId: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        setSharedId(cardId);
        setTimeout(() => setSharedId(null), 2000);
        return;
      } catch { /* user cancelled — fall through to clipboard */ }
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setSharedId(cardId);
      setTimeout(() => setSharedId(null), 2000);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleShare = (cardId: string) => {
    const url = getShareUrl(cardId);
    const card = DECK_CARDS.find(c => c.id === cardId);
    doShare(url, card?.label || "Liana Banyan", cardId);
  };

  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [showLetters, setShowLetters] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const filteredLetters = letterFilter === "all"
    ? LETTER_CUE_CARDS
    : LETTER_CUE_CARDS.filter(c => c.category === letterFilter);

  const handleShareLetter = (card: typeof LETTER_CUE_CARDS[number]) => {
    const sharerId = user?.id ? `&sharer=${user.id}` : "";
    const url = `https://lianabanyan.com/RedCarpet?cue=${card.id}&ref=${encodeURIComponent(refName)}${sharerId}`;
    doShare(url, card.title, card.id);
  };

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-8" data-xray-id="cue-card-deck">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Viral Cue Card Deck</h1>
        <p className="text-muted-foreground">
          Share the message. $5/year in Credits for full deck access.
        </p>
        <Button asChild className="gap-2 mt-4">
          <Link to="/membership">
            <CreditCard className="w-4 h-4" />
            Get Your Deck — 5 Credits/year
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {DECK_CARDS.map(({ id, title, icon: Icon, href, description }) => (
          <Card key={id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary" />
                  {title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(id)}
                  className="gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  {sharedId === id ? "Copied!" : "Share"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground min-h-[2.5rem]">{description}</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to={href}>View</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Letter Outreach Cards */}
      <div className="border-t pt-8" data-xray-id="letter-cue-cards">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowLetters(!showLetters)}
        >
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Letter Outreach Cards</h2>
            <span className="text-sm text-muted-foreground">({LETTER_CUE_CARDS.length} cards)</span>
          </div>
          {showLetters ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {showLetters && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={letterFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setLetterFilter("all")}
              >
                All ({LETTER_CUE_CARDS.length})
              </Button>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const count = LETTER_CUE_CARDS.filter(c => c.category === key).length;
                if (count === 0) return null;
                return (
                  <Button
                    key={key}
                    variant={letterFilter === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLetterFilter(key)}
                  >
                    {label} ({count})
                  </Button>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLetters.map((card) => (
                <Card
                  key={card.id}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => toggleFlip(card.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{card.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleShareLetter(card); }}
                        className="gap-1 shrink-0"
                      >
                        <Share2 className="w-3 h-3" />
                        {sharedId === card.id ? "Copied!" : "Share"}
                      </Button>
                    </div>
                    <span className="text-xs text-muted-foreground">{card.subtitle}</span>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto">
                      {flippedCards.has(card.id) ? card.back : card.front}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      {flippedCards.has(card.id) ? "Click to see front" : "Click to flip"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
