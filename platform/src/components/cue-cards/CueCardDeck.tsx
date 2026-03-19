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
import { Share2, CreditCard, Wrench, Heart, Award, UserPlus, TrendingUp, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { LETTER_CUE_CARDS } from "@/data/letterCueCards";

const DECK_CARDS = [
  { id: "invite-creator", title: "Invite a Creator", icon: UserPlus, href: "/join/creator", description: "Invite creators to the platform. Earn referral rewards." },
  { id: "become-steward", title: "Become a Steward", icon: Award, href: "/steward/apply", description: "Manage campaigns. Pledge your Marks. The oven's already hot." },
  { id: "get-famous", title: "Get Famous", icon: TrendingUp, href: "/guilds/hub?tab=bandwagon", description: "Back projects. Put your service units where your mouth is." },
  { id: "idont-want-your-money", title: "I Don't Want Your $", icon: Heart, href: "/", description: "I want your success." },
  { id: "we-need-you", title: "We Need You", icon: Wrench, href: "/crew-call", description: "Do what you're already good at. Join the crew." },
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
    return `${baseUrl}${path}?ref=${encodeURIComponent(refName)}`;
  };

  const handleShare = (cardId: string) => {
    const url = getShareUrl(cardId);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      setSharedId(cardId);
      setTimeout(() => setSharedId(null), 2000);
    } else {
      window.open(url, "_blank");
    }
  };

  const [letterFilter, setLetterFilter] = useState<string>("all");
  const [showLetters, setShowLetters] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const filteredLetters = letterFilter === "all"
    ? LETTER_CUE_CARDS
    : LETTER_CUE_CARDS.filter(c => c.category === letterFilter);

  const handleShareLetter = (card: typeof LETTER_CUE_CARDS[number]) => {
    const url = `${baseUrl}/cue/${card.id}?ref=${encodeURIComponent(refName)}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      setSharedId(card.id);
      setTimeout(() => setSharedId(null), 2000);
    }
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
