import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Store,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
} from "lucide-react";

const PITCHES: Record<
  string,
  { headline: string; subtext: string; emoji: string }
> = {
  food_drink: {
    headline: "Cook something people love?",
    subtext:
      "From your kitchen to their table. Food trucks, home cooks, bakers — your recipes, your prices, your customers.",
    emoji: "\u{1F373}",
  },
  crafts_making: {
    headline: "Make things with your hands?",
    subtext:
      "Leather, wood, pottery, jewelry, candles — if you make it, you can sell it here. No middleman. No percentage to Amazon.",
    emoji: "\u{1FAB5}",
  },
  digital: {
    headline: "Built something useful?",
    subtext:
      "Code, templates, designs, tools — ship it here. Digital delivery, instant access, you keep 83.3% of every sale.",
    emoji: "\u{1F4BB}",
  },
  service: {
    headline: "Have a skill people need?",
    subtext:
      "Tutoring, repair, consulting, cleaning, photography — name your rate, keep your earnings.",
    emoji: "\u{1F527}",
  },
  photography: {
    headline: "Take photos worth sharing?",
    subtext:
      "Real estate, portraits, events, stock — your lens, your prices. Zero storage fees.",
    emoji: "\u{1F4F8}",
  },
  broadcast: {
    headline: "Have an audience?",
    subtext:
      "Podcast, YouTube, Twitch, Instagram — earn from your audience through cooperative commerce, not ads.",
    emoji: "\u{1F4E1}",
  },
  education: {
    headline: "Know something worth teaching?",
    subtext:
      "Language, music, math, coding — teach from your living room via Zoom. Set your rate. Keep 83.3%.",
    emoji: "\u{1F4DA}",
  },
  default: {
    headline: "Have something to offer?",
    subtext:
      "Whatever you make, grow, teach, fix, or create — there's a shelf here with your name on it.",
    emoji: "\u2728",
  },
};

const EXAMPLES: Record<
  string,
  { name: string; story: string; cta: string }
> = {
  education: {
    name: "Maria",
    story:
      'Maria teaches Spanish from her living room 3 days a week via Zoom. She charges $25/hour. On Liana Banyan, she keeps $20.83 per session. She started with 2 students from her neighborhood. Now she has 14.',
    cta: "I teach something too",
  },
  crafts_making: {
    name: "James",
    story:
      "James has 12,000 followers on Instagram where he sells custom leather wallets. Instagram takes nothing — but drives zero repeat business. On Liana Banyan, his followers become members who order directly. He keeps 83.3% and his customers come back.",
    cta: "I sell on Instagram too",
  },
  food_drink: {
    name: "Elena",
    story:
      "Elena grows tomatoes and herbs in her backyard in San Antonio. She listed her surplus on Liana Banyan for pickup. Neighbors pre-order weekly. She makes $80/week from her garden.",
    cta: "I grow things too",
  },
  service: {
    name: "David",
    story:
      "David fixes lawnmowers and small engines in his garage. He posted his rates on Liana Banyan and now has 8 regular clients within a 10-mile radius. He keeps 83.3% of every job.",
    cta: "I fix things too",
  },
  digital: {
    name: "Priya",
    story:
      "Priya builds Notion templates for freelancers. She listed 6 templates on Liana Banyan at $12 each. No platform fees except Cost+20%. She keeps $10 per template sold.",
    cta: "I build digital things too",
  },
  default: {
    name: "You",
    story:
      "Hundreds of members are already selling what they make, grow, teach, and fix. The shelf next to theirs has a sign on it. It says 'FOR RENT.'",
    cta: "I have something to offer",
  },
};

const HOW_IT_WORKS = [
  { step: "List it", detail: "Describe what you sell. Set your price." },
  {
    step: "People order",
    detail: "Pre-orders fund production. No upfront cost to you.",
  },
  {
    step: "Threshold reached",
    detail: "When enough orders come in, production starts.",
  },
  {
    step: "We handle fulfillment",
    detail:
      "Printing, shipping, packaging — or you handle it yourself.",
  },
  {
    step: "You get paid",
    detail: "83.3% of every sale, minus Cost+20%.",
  },
  {
    step: "Scale up",
    detail:
      "More orders = lower per-unit cost = more margin for you.",
  },
];

type ForRentCardProps = {
  category?: string;
  contextProduct?: string;
  variant?: "card" | "inline" | "banner";
};

export function ForRentCard({
  category,
  variant = "card",
}: ForRentCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const pitch = PITCHES[category ?? ""] ?? PITCHES.default;
  const example = EXAMPLES[category ?? ""] ?? EXAMPLES.default;

  const handleStart = () => {
    if (!user) {
      navigate("/join");
    } else {
      navigate("/tools/storefront-builder");
    }
  };

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl shrink-0">{pitch.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{pitch.headline}</p>
            <p className="text-xs text-muted-foreground">
              $5/year membership &middot; You keep 83.3%
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleStart} className="shrink-0 gap-1">
          Start Selling <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <Card className="border-dashed border-primary/30 bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="text-xs border-primary/40">
                  FOR RENT
                </Badge>
              </div>
              <h3 className="text-lg font-semibold">{pitch.headline}</h3>
              <p className="text-sm text-muted-foreground max-w-xl">
                {pitch.subtext}
              </p>
              <p className="text-xs text-muted-foreground">
                $5/year membership &middot; You keep 83.3% &middot; We handle the rest
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end shrink-0">
              <Button onClick={handleStart} className="gap-2">
                Start for $5 <ArrowRight className="w-4 h-4" />
              </Button>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                {expanded ? "Hide" : "How does it work?"}
                {expanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {expanded && (
            <div className="mt-6 space-y-6 border-t pt-6">
              <HowItWorksBlock />
              <ExampleBlock example={example} onCta={handleStart} />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Default: card variant — same visual size as a MarketplaceResultCard
  return (
    <Card className="h-full border-dashed border-primary/30 bg-primary/[0.02] flex flex-col">
      <CardContent className="flex-1 flex flex-col pt-6 space-y-3">
        <div className="aspect-[16/9] rounded-md bg-primary/5 flex items-center justify-center">
          <div className="text-center space-y-1">
            <span className="text-3xl">{pitch.emoji}</span>
            <Badge variant="outline" className="border-primary/40 text-xs">
              FOR RENT
            </Badge>
          </div>
        </div>

        <h3 className="font-semibold text-base">{pitch.headline}</h3>
        <p className="text-sm text-muted-foreground flex-1">
          {pitch.subtext}
        </p>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">$5/year membership. That's it.</p>
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" />
              Your own storefront
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" />
              You set your prices (Cost+20% floor)
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" />
              You keep 83.3% of every sale
            </p>
            <p className="flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-600" />
              No inventory risk — sell first, make second
            </p>
          </div>
        </div>

        <div className="pt-1 space-y-2">
          <Button onClick={handleStart} className="w-full gap-2">
            Start for $5 <ArrowRight className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
          >
            {expanded ? "Less" : "How does it work?"}
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {expanded && (
          <div className="space-y-4 border-t pt-4">
            <HowItWorksBlock />
            <ExampleBlock example={example} onCta={handleStart} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HowItWorksBlock() {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">How it works:</p>
      <ol className="space-y-1.5">
        {HOW_IT_WORKS.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs">
            <span className="font-medium text-primary shrink-0">{i + 1}.</span>
            <span>
              <span className="font-medium">{item.step}</span>{" "}
              <span className="text-muted-foreground">&mdash; {item.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground italic">
        The platform grows WITH you. Start with 5 orders. Scale to 5,000.
      </p>
    </div>
  );
}

function ExampleBlock({
  example,
  onCta,
}: {
  example: { name: string; story: string; cta: string };
  onCta: () => void;
}) {
  return (
    <div className="rounded-md bg-muted/40 p-3 space-y-2">
      <p className="text-xs font-medium">Does this sound like you?</p>
      <p className="text-xs text-muted-foreground italic">
        &ldquo;{example.story}&rdquo;
      </p>
      <button
        onClick={onCta}
        className="text-xs text-primary hover:underline flex items-center gap-1"
      >
        {example.cta} <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
