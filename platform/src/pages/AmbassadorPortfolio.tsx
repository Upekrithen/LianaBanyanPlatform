/**
 * AMBASSADOR PORTFOLIO — Public page at /ambassador/portfolio/:ambassadorId (V2).
 * Verified stats, specializations, social links, testimonials, REQUEST ONBOARDING CTA.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbassadorLevelBadge } from "@/components/ambassador/AmbassadorLevelBadge";
import { AmbassadorPortfolioStats } from "@/components/ambassador/AmbassadorPortfolioStats";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { supabase } from "@/integrations/supabase/client";

const FOCUS_LABELS: Record<string, string> = {
  dinner: "Let's Make Dinner",
  groceries: "Let's Get Groceries",
  hexisle: "HexIsle & Builds",
};

interface AmbassadorRow {
  id: string;
  display_name: string;
  ambassador_number: number | null;
  generation: number;
  city: string | null;
  level: number;
  level_title: string | null;
  slots_filled: number;
  total_downstream: number | null;
  crew_success_rate: number | null;
  avg_onboarding_minutes: number | null;
  focus_areas: string[] | null;
  created_at: string;
}

interface TestimonialRow {
  id: string;
  recruit_display_name: string;
  testimonial_text: string;
  rating: number | null;
}

interface SocialLinkRow {
  platform: string;
  handle: string;
  url: string | null;
  follower_count: number | null;
}

export default function AmbassadorPortfolio() {
  const { ambassadorId } = useParams<{ ambassadorId: string }>();
  const navigate = useNavigate();
  const [ambassador, setAmbassador] = useState<AmbassadorRow | null>(null);
  const [testimonials, setTestimonials] = useState<TestimonialRow[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLinkRow[]>([]);
  const [membersOnboarded, setMembersOnboarded] = useState(0);
  const [ambassadorsTrained, setAmbassadorsTrained] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ambassadorId) return;
    (async () => {
      const { data: amb } = await supabase
        .from("ambassadors")
        .select("id, display_name, ambassador_number, generation, city, level, level_title, slots_filled, total_downstream, crew_success_rate, avg_onboarding_minutes, focus_areas, created_at")
        .eq("id", ambassadorId)
        .single();
      setAmbassador(amb ?? null);
      if (!amb?.id) {
        setLoading(false);
        return;
      }
      const { count: completedCount } = await supabase
        .from("ambassador_recruits")
        .select("id", { count: "exact", head: true })
        .eq("ambassador_id", amb.id)
        .eq("status", "completed");
      setMembersOnboarded(completedCount ?? 0);
      const { count: trainedCount } = await supabase
        .from("ambassadors")
        .select("id", { count: "exact", head: true })
        .eq("parent_ambassador_id", amb.id);
      setAmbassadorsTrained(trainedCount ?? 0);
      const { data: testimonialData } = await supabase
        .from("ambassador_testimonials")
        .select("id, recruit_display_name, testimonial_text, rating")
        .eq("ambassador_id", amb.id)
        .eq("is_public", true);
      setTestimonials((testimonialData ?? []) as TestimonialRow[]);
      const { data: linkData } = await supabase
        .from("ambassador_social_links")
        .select("platform, handle, url, follower_count")
        .eq("ambassador_id", amb.id);
      setSocialLinks((linkData ?? []) as SocialLinkRow[]);
    })().finally(() => setLoading(false));
  }, [ambassadorId]);

  if (loading) {
    return (
      <PortalPageLayout maxWidth="sm" xrayId="ambassador-portfolio">
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-muted-foreground">Loading…</p>
        </div>
      </PortalPageLayout>
    );
  }

  if (!ambassador) {
    return (
      <PortalPageLayout maxWidth="sm" xrayId="ambassador-portfolio">
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-muted-foreground">Ambassador not found.</p>
          <Button variant="outline" onClick={() => navigate("/portal")}>Portal</Button>
        </div>
      </PortalPageLayout>
    );
  }

  const focusLabels = (ambassador.focus_areas ?? []).map((f) => FOCUS_LABELS[f] ?? f);
  const activeSince = ambassador.created_at
    ? new Date(ambassador.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <PortalPageLayout maxWidth="sm" xrayId="ambassador-portfolio">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-green-500/20 text-green-600 dark:text-green-400 text-xl font-semibold">
              {ambassador.display_name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{ambassador.display_name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <AmbassadorLevelBadge level={ambassador.level} levelTitle={ambassador.level_title} />
              <span className="text-sm text-muted-foreground">
                Ambassador #{ambassador.ambassador_number ?? "—"} | Generation {ambassador.generation}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {ambassador.city ?? ""} | Active since {activeSince}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AmbassadorPortfolioStats
            membersOnboarded={membersOnboarded}
            ambassadorsTrained={ambassadorsTrained}
            downstreamMembers={ambassador.total_downstream ?? 0}
            crewSuccessRate={ambassador.crew_success_rate}
            avgOnboardingMinutes={ambassador.avg_onboarding_minutes}
          />
          <Card className="border-2 border-border">
            <CardContent className="pt-4">
              <p className="text-sm font-semibold mb-2">Specializations</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {focusLabels.length > 0 ? focusLabels.map((l) => <li key={l}>● {l}</li>) : <li>General</li>}
              </ul>
              {socialLinks.length > 0 && (
                <>
                  <p className="text-sm font-semibold mt-3 mb-2">Connected</p>
                  <ul className="space-y-1 text-sm">
                    {socialLinks.map((link) => (
                      <li key={link.platform}>
                        {link.url ? (
                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            {link.platform} {link.follower_count != null && `(${link.follower_count >= 1000 ? (link.follower_count / 1000).toFixed(1) + "K" : link.follower_count})`}
                          </a>
                        ) : (
                          <span>{link.platform} {link.follower_count != null && `(${link.follower_count})`}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {testimonials.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Testimonials</h2>
            <ul className="space-y-3">
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="pt-4">
                    <p className="text-sm italic">&quot;{t.testimonial_text}&quot;</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      — {t.recruit_display_name}
                      {t.rating != null && ` ${"★".repeat(t.rating)}`}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </ul>
          </div>
        )}

        <Card className="border-2 border-border">
          <CardContent className="pt-4">
            <p className="text-sm font-semibold mb-2">My business model (powered by Contingency Operators)</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/pathway")} data-xray-id="ambassador-co-link">
              See what an Ambassador may earn →
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/30">
          <CardContent className="pt-6 pb-6">
            <p className="text-sm mb-3">Want {ambassador.display_name} as your Ambassador?</p>
            <Button
              onClick={() => navigate("/auth", { state: { redirect: `/ambassador/walkthrough?ambassador=${ambassador.id}` } })}
              data-xray-id="ambassador-request-onboarding-btn"
            >
              Request onboarding →
            </Button>
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
