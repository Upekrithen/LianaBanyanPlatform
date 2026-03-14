/**
 * CREATOR PITCH PAGE — Multi-path onboarding for creators
 * Route: /join/creator (ExplorerRoute, public)
 * Red Carpet: ?ref=USERNAME, ?type=maker|food|art|music|business
 */

import { useSearchParams } from "react-router-dom";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Palette,
  Utensils,
  Music,
  Lightbulb,
  ArrowRight,
  Award,
  Percent,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";
import { WeNeedYouCard } from "@/components/cue-cards/WeNeedYouCard";

const CREATOR_PATHS = [
  {
    id: "physical",
    label: "Physical Products",
    description: "3D prints, gadgets, handmade goods",
    icon: Package,
    link: "/marketplace",
    linkLabel: "Mall / Marketplace",
    offer: "No platform extraction. List once, sell anywhere. IP guidance and pre-orders.",
    typeParam: "maker",
  },
  {
    id: "art",
    label: "Art & Design",
    description: "Prints, digital art, illustrations",
    icon: Palette,
    link: "/marketplace",
    linkLabel: "Cost+20 pricing",
    offer: "Cost+20% margin. You set the price; we never take more. Medallion tiers and pre-orders.",
    typeParam: "art",
  },
  {
    id: "food",
    label: "Food",
    description: "Recipes, meal kits, baked goods",
    icon: Utensils,
    link: "/initiatives/lets-make-dinner",
    linkLabel: "Let's Make Dinner",
    offer: "Neighbors feeding neighbors. Chefs keep 83.3%. Dynamic pricing, recipe reviews, Influencer path.",
    typeParam: "food",
  },
  {
    id: "music",
    label: "Music & Content",
    description: "Songs, videos, courses",
    icon: Music,
    link: "/initiatives/jukebox",
    linkLabel: "JukeBox",
    offer: "Fair music licensing. One Take Wonders. Artists keep 83.3%. No middleman extraction.",
    typeParam: "music",
  },
  {
    id: "business",
    label: "Business Ideas",
    description: "Services, inventions, startups",
    icon: Lightbulb,
    link: "/initiatives/bread",
    linkLabel: "Let's Make Bread",
    offer: "Business incubator. Start with $5. Keep 83.3%. Cooperative manufacturing support.",
    typeParam: "business",
  },
] as const;

export default function CreatorPitchPage() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const typeParam = searchParams.get("type");
  const { openOnboard } = useSeamlessOnboard();

  const preselectedId = typeParam && CREATOR_PATHS.some((p) => p.typeParam === typeParam)
    ? CREATOR_PATHS.find((p) => p.typeParam === typeParam)?.id
    : null;

  return (
    <div className="min-h-screen bg-background" data-xray-id="creator-pitch-page">
      <div className="container max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Hero */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            Your craft deserves a cooperative home.
          </h1>
          {ref && (
            <p className="text-lg text-muted-foreground">
              <span className="font-medium text-foreground">{ref}</span> thinks you&apos;d be great here.
            </p>
          )}
        </header>

        {/* What do you create? */}
        <section>
          <h2 className="text-xl font-semibold mb-4">What do you create?</h2>
          <div className="grid gap-4 sm:grid-cols-1">
            {CREATOR_PATHS.map((path) => {
              const Icon = path.icon;
              const isPreselected = preselectedId === path.id;
              return (
                <Card
                  key={path.id}
                  className={`cursor-pointer transition-colors hover:border-primary/50 ${isPreselected ? "border-primary ring-2 ring-primary/20" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{path.label}</CardTitle>
                        <CardDescription>{path.description}</CardDescription>
                      </div>
                      {isPreselected && (
                        <Badge variant="secondary">Suggested</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{path.offer}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={path.link}>
                          {path.linkLabel}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          openOnboard({
                            reason: `join as ${path.typeParam} creator`,
                            actionLabel: "Join as a Creator",
                            membershipIncluded: true,
                          })
                        }
                      >
                        Join as a Creator
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Medallion tiers
                      </span>
                      <span className="flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        Cost+20
                      </span>
                      <span>Influencer path</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Know a creator? */}
        <section className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Know a creator? Invite them.
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Share a cue card. When they join, you earn rewards. No platform extraction — we reward referrals.
          </p>
          <InviteCreatorCard />
        </section>

        {/* We Need You — Crew Call */}
        <section className="pt-6 border-t">
          <WeNeedYouCard />
        </section>
      </div>
    </div>
  );
}
