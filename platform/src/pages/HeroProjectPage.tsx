/**
 * HERO PROJECT PAGE — Tribute Pages for DOERS
 * =============================================
 * "A true selfless act always sparks another."
 *
 * This page serves as a tribute/bio page for Crown candidates and
 * community heroes — DOERS who inspire the platform. Uses the same
 * template pattern as InitiativePage and ProjectView for consistency.
 *
 * Each Hero has:
 *   - Bio / Story section (who they are, what they did)
 *   - Impact metrics (pizzas delivered, meals funded, etc.)
 *   - Connected Initiatives (Daisy Chain — which Sweet Sixteen initiatives they touch)
 *   - Crown Offer status (pending, accepted, or open invitation)
 *   - Payment plugs (how to support them directly)
 *   - "Spark Chain" — who they inspired and who inspired them
 *
 * Route: /heroes/:slug
 *
 * The Hero/Champion Project connects to each Initiative via Daisy Chain,
 * similar to how HexIsle connects to Peasant/Farmer/Warrior/King/Warhorse/Palm Tree.
 */

import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Star, Heart, ExternalLink, Award,
  Sparkles, Users, MapPin, Calendar, Link2, Zap,
} from "lucide-react";
import { PaymentPlugsBadge } from "@/components/PaymentPlugsBadge";
import { CreditSymbol } from "@/components/CreditSymbol";

// ============================================================================
// HERO REGISTRY — Crown Candidates & Community Heroes
// ============================================================================

interface HeroConfig {
  slug: string;
  name: string;
  title: string;
  handle?: string;
  platform?: string; // e.g., "Imgur", "YouTube", "Twitter"
  location: string;
  image?: string; // URL to photo/avatar
  tagline: string;
  story: string[]; // Paragraphs of their story
  crownOffer: {
    initiative: string;
    initiativeSlug: string;
    initiativeNumber: number;
    crownTitle: string;
    status: "pending" | "accepted" | "declined" | "open";
  };
  impactMetrics: { label: string; value: string; icon: string }[];
  connectedInitiatives: { slug: string; name: string; connection: string }[];
  sparkChain: {
    inspiredBy?: string; // Who inspired this hero
    inspires: string[]; // Who this hero inspires
    sparkQuote: string; // Their spark statement
  };
  links: { label: string; url: string }[];
  discoveryDate?: string;
  discoveryStory?: string;
  userId?: string; // If they become a platform member
}

const HERO_REGISTRY: Record<string, HeroConfig> = {
  "mike-puckett": {
    slug: "mike-puckett",
    name: "Mike Puckett",
    title: "The Free Pizza Dude",
    handle: "@thefreepizzaguy",
    platform: "Imgur",
    location: "Nashville, TN",
    tagline: "Nearly 4,000 pizzas. An Imgur account. A PayPal link. Proof that infrastructure follows heart.",
    story: [
      "Mike Puckett was homeless for four years. When he got back on his feet, he didn't build a wall — he built a table.",
      "Every Friday, he puts out a call on Imgur. Pizza Angels from around the world answer it. Nearly 4,000 pizzas delivered. More than 100 grocery runs. A car starter for a stranger. Nashville's Community Hero of the Week.",
      "His entire infrastructure? An Imgur account and a PayPal link.",
      "He once said he wanted to send people food they could 'really enjoy and remember, not just food shelf kind of food.' That line matters. Because it's not just about calories — it's about dignity.",
      "Mike built a decentralized meal fund with nothing but willpower and a PayPal link. The Founder was browsing Imgur on March 6, 2026 at 1842 hours — literally in the middle of building the platform's charitable initiatives — when he saw Mike's post. Good chi recognizes good chi.",
      "A true selfless act always sparks another. Mike is the spark.",
    ],
    crownOffer: {
      initiative: "Rally Group",
      initiativeSlug: "rally-group",
      initiativeNumber: 9,
      crownTitle: "Captain of the Swoop",
      status: "pending",
    },
    impactMetrics: [
      { label: "Pizzas Delivered", value: "~4,000", icon: "🍕" },
      { label: "Grocery Runs", value: "100+", icon: "🛒" },
      { label: "Imgur Upvotes", value: "7M+", icon: "⬆️" },
      { label: "Years Giving Back", value: "3+", icon: "❤️" },
    ],
    connectedInitiatives: [
      { slug: "rally-group", name: "Rally Group", connection: "Crown Candidate — community response model" },
      { slug: "lets-make-dinner", name: "Let's Make Dinner", connection: "Pizza Angel Pipeline — cold start model for the entire food initiative" },
      { slug: "lets-get-groceries", name: "Let's Get Groceries", connection: "100+ grocery runs prove the cooperative provisioning model" },
      { slug: "household-concierge", name: "Household Concierge", connection: "Mutual aid without bureaucracy — the Butler principle applied to food" },
    ],
    sparkChain: {
      inspires: ["Every Pizza Angel worldwide", "The LMD Cold Start Pipeline", "Anonymous Volume Aggregation dignity model"],
      sparkQuote: "A true selfless act always sparks another. HE is the spark.",
    },
    links: [
      { label: "PayPal", url: "https://paypal.me/TheFreePizzaDude" },
      { label: "Ko-fi", url: "https://ko-fi.com/thefreepizzadude" },
      { label: "Imgur", url: "https://imgur.com/user/thefreepizzaguy" },
    ],
    discoveryDate: "March 6, 2026 at 1842 hours",
    discoveryStory: "Founder was browsing Imgur — literally building the charitable initiatives for platform launch — when Mike's post appeared. Good chi.",
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function HeroProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const hero = slug ? HERO_REGISTRY[slug] : null;

  if (!hero) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Hero Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This hero page doesn't exist yet. But every city has heroes waiting to be recognized.
            </p>
            <Button onClick={() => navigate("/heroes")}>Browse Heroes</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const crownStatusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/30",
    accepted: "bg-green-500/10 text-green-500 border-green-500/30",
    declined: "bg-muted text-muted-foreground border-muted",
    open: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Hero Header */}
      <Card className="border-2 bg-gradient-to-r from-amber-500/5 to-orange-500/10 border-amber-500/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  HERO PROJECT
                </Badge>
                <Badge variant="outline" className={crownStatusColors[hero.crownOffer.status]}>
                  <Star className="w-3 h-3 mr-1" />
                  Crown {hero.crownOffer.status === "accepted" ? "Holder" : "Candidate"} — {hero.crownOffer.initiative}
                </Badge>
              </div>
              <CardTitle className="text-3xl">{hero.name}</CardTitle>
              <CardDescription className="text-lg mt-1">
                "{hero.title}"
                {hero.handle && (
                  <span className="text-muted-foreground"> — {hero.handle} on {hero.platform}</span>
                )}
              </CardDescription>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {hero.location}
                </span>
                {hero.discoveryDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Discovered: {hero.discoveryDate}
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-foreground/80 mt-3 italic">"{hero.tagline}"</p>
        </CardHeader>
      </Card>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {hero.impactMetrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-1">{metric.icon}</div>
              <div className="text-xl font-bold">{metric.value}</div>
              <div className="text-xs text-muted-foreground">{metric.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="story">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="story">Story</TabsTrigger>
          <TabsTrigger value="connections">Daisy Chain</TabsTrigger>
          <TabsTrigger value="spark">Spark Chain</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* Story Tab */}
        <TabsContent value="story">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                {hero.name}'s Story
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              {hero.story.map((paragraph, i) => (
                <p key={i} className="text-foreground/80 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ))}

              {hero.discoveryStory && (
                <>
                  <Separator className="my-6" />
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      How We Found {hero.name}
                    </h4>
                    <p className="text-sm text-foreground/70">{hero.discoveryStory}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Daisy Chain Tab — Connected Initiatives */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Daisy Chain — Connected Initiatives
              </CardTitle>
              <CardDescription>
                How {hero.name}'s work connects to the Sweet Sixteen initiatives.
                Each connection is a thread in the larger tapestry.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hero.connectedInitiatives.map((initiative, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => navigate(`/initiatives/${initiative.slug}`)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{initiative.name}</div>
                    <div className="text-sm text-muted-foreground">{initiative.connection}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spark Chain Tab */}
        <TabsContent value="spark">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Spark Chain
              </CardTitle>
              <CardDescription>
                "A true selfless act always sparks another."
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Spark Quote */}
              <div className="bg-gradient-to-r from-amber-500/5 to-orange-500/10 rounded-lg p-6 border border-amber-500/20 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-amber-500" />
                <blockquote className="text-lg italic text-foreground/80">
                  "{hero.sparkChain.sparkQuote}"
                </blockquote>
              </div>

              {/* Inspired By */}
              {hero.sparkChain.inspiredBy && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                    Inspired By
                  </h4>
                  <p className="text-foreground/80">{hero.sparkChain.inspiredBy}</p>
                </div>
              )}

              {/* Inspires */}
              <div>
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                  Sparks Lit
                </h4>
                <ul className="space-y-2">
                  {hero.sparkChain.inspires.map((spark, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-foreground/80">{spark}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Support {hero.name}
              </CardTitle>
              <CardDescription>
                Direct support links — 100% goes to {hero.name}, the platform takes nothing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hero.links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </a>
              ))}

              {hero.userId && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Platform Payment Rails</h4>
                    <PaymentPlugsBadge userId={hero.userId} variant="buttons" />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
