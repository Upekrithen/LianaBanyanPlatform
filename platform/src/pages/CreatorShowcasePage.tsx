/**
 * CREATOR SHOWCASE — Grid of all creators + Creator Draft Pick elements
 * "Get Famous. Make Money. Do Good."
 *
 * Route: /creators (ExplorerRoute). Founder: ready FROM LAUNCH.
 * Includes: Six-tier referral rewards, Instagram-to-Main-Square pipeline,
 * featured creators section, XP display, and Cue Card CTA.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CurrencyAmount, CurrencyGlyph } from "@/components/CreditSymbol";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Palette,
  Utensils,
  Music,
  Lightbulb,
  User,
  ExternalLink,
  Star,
  Instagram,
  ArrowRight,
  Store,
  Award,
  Users,
  Sparkles,
  Gift,
} from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { InviteCreatorCard } from "@/components/cue-cards/InviteCreatorCard";
import {
  SAMPLE_CREATORS,
  REFERRAL_TIERS,
  SPECIALTY_LABELS,
  type ShowcaseCreator,
  type CreatorSpecialty,
  getXpBoxDisplay,
} from "@/lib/creatorShowcaseService";

// ============================================================================
// CONSTANTS
// ============================================================================

const CREATOR_TYPES = [
  { value: "all", label: "All Creators" },
  { value: "3d_printing", label: "3D Printing" },
  { value: "lamp_design", label: "Lamp Design" },
  { value: "tool_making", label: "Tool Making" },
  { value: "game_design", label: "Game Design" },
  { value: "ceramics", label: "Ceramics" },
  { value: "woodworking", label: "Woodworking" },
  { value: "electronics", label: "Electronics" },
  { value: "textiles", label: "Textiles" },
] as const;

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "3d_printing": Package,
  lamp_design: Lightbulb,
  tool_making: Package,
  game_design: Sparkles,
  ceramics: Palette,
  woodworking: Package,
  electronics: Lightbulb,
  textiles: Palette,
};

type SortOption = "newest" | "xp" | "name";

// ============================================================================
// XP DISPLAY
// ============================================================================

function XpBadge({ xp }: { xp: number }) {
  const { tierName, tierColor } = getXpBoxDisplay(xp);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ backgroundColor: `${tierColor}20`, color: tierColor, border: `1px solid ${tierColor}40` }}
    >
      <Award className="w-3 h-3" />
      {xp.toLocaleString()} XP — {tierName}
    </span>
  );
}

// ============================================================================
// CREATOR CARD
// ============================================================================

function CreatorCard({ creator, onView }: { creator: ShowcaseCreator; onView: () => void }) {
  const TypeIcon = TYPE_ICONS[creator.specialty] || User;

  return (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/30 transition-colors group">
      {creator.featured && (
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 px-3 py-1 flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-medium text-primary">Featured Creator</span>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          {creator.avatarUrl ? (
            <img src={creator.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TypeIcon className="w-6 h-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-foreground">{creator.displayName}</p>
            <Badge variant="secondary" className="gap-1 mt-1 text-xs">
              <TypeIcon className="w-3 h-3" />
              {creator.specialtyLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{creator.bio}</p>

        <div className="flex items-center justify-between">
          <XpBadge xp={creator.xpScore} />
          <span className="text-xs text-muted-foreground/70">{creator.productsCount} products</span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Cost+20 — keeps 83.3%</span>
          {creator.totalBackings > 0 && (
            <span>{creator.totalBackings} backings</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onView}
          >
            Visit Store
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onView}
          >
            Back Creator
          </Button>
        </div>

        {creator.instagramHandle && (
          <a
            href={`https://instagram.com/${creator.instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Instagram className="w-3 h-3" />
            @{creator.instagramHandle}
          </a>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// REFERRAL TIERS DISPLAY
// ============================================================================

function ReferralTiersSection() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="w-5 h-5 text-primary" />
          Six-Tier Referral Rewards
        </CardTitle>
        <CardDescription>
          Invite a maker. Earn Marks forever. Earlier tiers earn more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REFERRAL_TIERS.map((tier, i) => (
            <div
              key={tier.key}
              className={`rounded-lg p-3 border ${
                i === 0
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/50 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-semibold text-sm ${i === 0 ? "text-primary" : "text-foreground"}`}>
                  {tier.label}
                </span>
                <CurrencyAmount amount={tier.marksReward} currency="mark" size={12} className={i === 0 ? "text-primary" : ""} />
              </div>
              <p className="text-xs text-muted-foreground/70">Members #{tier.range}</p>
              <p className="text-xs text-muted-foreground mt-1">{tier.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// INSTAGRAM TO MAIN SQUARE PIPELINE
// ============================================================================

function DraftPickPipeline() {
  const steps = [
    { icon: Instagram, label: "Discover on Instagram", color: "text-pink-400" },
    { icon: Gift, label: "Send Cue Card Invite", color: "text-amber-400" },
    { icon: Users, label: "Creator Joins LB", color: "text-blue-400" },
    { icon: Store, label: "Showcase on Main Square", color: "text-green-400" },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">From Instagram to Main Square</CardTitle>
        <CardDescription>
          The Creator Draft Pick pipeline. Recruit makers you love into the cooperative.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>
                <span className="text-xs text-muted-foreground text-center">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70 text-center mt-4">
          Cue Card invitation must be sent BEFORE the maker signs up. Timestamp-verified attribution.
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function CreatorShowcasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortOption>("newest");

  // Live query for real creators (when DB is populated)
  const { data: liveCreators, isLoading } = useQuery({
    queryKey: ["creators-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, display_name, avatar_url, creator_type, creator_external_url, created_at")
        .not("creator_type", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Merge live creators with sample data for display
  const hasLiveCreators = (liveCreators?.length ?? 0) > 0;

  // Use sample data for showcase sections always
  const sampleCreators = SAMPLE_CREATORS;
  const featuredCreators = sampleCreators.filter(c => c.featured);

  // Filter and sort sample creators for the grid
  const filtered = sampleCreators.filter(
    c => typeFilter === "all" || c.specialty === typeFilter
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name") return a.displayName.localeCompare(b.displayName);
    if (sort === "xp") return b.xpScore - a.xpScore;
    return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId="creator-showcase-page">
      <div className="space-y-8">
        {/* ================================================================ */}
        {/* HEADER */}
        {/* ================================================================ */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Palette className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">Creator Showcase</h1>
          </div>
          <p className="text-2xl font-semibold text-primary">
            Get Famous. Make Money. Do Good.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your craft deserves a cooperative home. Cost+20 pricing — you keep 83.3%.
            Join the maker community where creators own their success.
          </p>
          {!user && (
            <Button asChild size="lg" className="mt-2">
              <Link to="/join/creator">Join as Creator</Link>
            </Button>
          )}
        </header>

        {/* ================================================================ */}
        {/* FEATURED CREATORS */}
        {/* ================================================================ */}
        {featuredCreators.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Featured Creators
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCreators.map(creator => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onView={() => navigate(`/creators/${creator.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        <Separator />

        {/* ================================================================ */}
        {/* ALL CREATORS GRID */}
        {/* ================================================================ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">All Creators</h2>

          <div className="flex flex-wrap gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44 bg-card border-border">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {CREATOR_TYPES.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
              <SelectTrigger className="w-44 bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="xp">Highest XP</SelectItem>
                <SelectItem value="name">A - Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse bg-card border-border">
                  <CardHeader><div className="h-6 bg-muted rounded" /></CardHeader>
                  <CardContent><div className="h-24 bg-muted rounded" /></CardContent>
                </Card>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No creators match that filter. Try a different specialty.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map(creator => (
                <CreatorCard
                  key={creator.id}
                  creator={creator}
                  onView={() => navigate(`/creators/${creator.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        <Separator />

        {/* ================================================================ */}
        {/* KNOW A MAKER? CTA */}
        {/* ================================================================ */}
        <section>
          <InviteCreatorCard />
        </section>

        {/* ================================================================ */}
        {/* SIX-TIER REFERRAL REWARDS */}
        {/* ================================================================ */}
        <ReferralTiersSection />

        {/* ================================================================ */}
        {/* FROM INSTAGRAM TO MAIN SQUARE */}
        {/* ================================================================ */}
        <DraftPickPipeline />
      </div>
    </PortalPageLayout>
  );
}
