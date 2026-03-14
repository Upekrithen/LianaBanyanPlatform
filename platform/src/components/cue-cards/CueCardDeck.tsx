/**
 * Cue Card Deck — $5/year Viral Cue Card Deck. Browsable collection of all cue cards.
 * Share a Card → generates link with ?ref=USERNAME.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, CreditCard, Wrench, Heart, Award, UserPlus, TrendingUp } from "lucide-react";

const DECK_CARDS = [
  { id: "invite-creator", title: "Invite a Creator", icon: UserPlus, href: "/join/creator", description: "Invite creators to the platform. Earn referral rewards." },
  { id: "become-steward", title: "Become a Steward", icon: Award, href: "/steward/apply", description: "Manage campaigns. Pledge your Marks. The oven's already hot." },
  { id: "get-famous", title: "Get Famous", icon: TrendingUp, href: "/guilds/hub?tab=bandwagon", description: "Back projects. Put your service units where your mouth is." },
  { id: "idont-want-your-money", title: "I Don't Want Your $", icon: Heart, href: "/", description: "I want your success." },
  { id: "we-need-you", title: "We Need You", icon: Wrench, href: "/crew-call", description: "Do what you're already good at. Join the crew." },
] as const;

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
    </div>
  );
}
