import { FocusShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { useMembership } from "@/hooks/useMembership";
import { useNavigate } from "react-router-dom";
import { useTourTarget } from "@/hooks/useTourTarget";
import {
  CreatorEconomicsExample,
  MembershipCapabilities,
  MembershipFAQ,
} from "@/components/v2/membership";

export default function MembershipPage() {
  const navigate = useNavigate();
  const { data: membership } = useMembership();
  const tourAnchor = useTourTarget("membership");
  const isActive = membership?.status === "active";

  const handleJoin = () => {
    if (isActive) {
      navigate("/dashboard/membership");
      return;
    }
    navigate("/join");
  };

  return (
    <FocusShell
      xrayBase="membership"
      seo={{
        title: "Membership | Liana Banyan",
        description: "One offer, one price, one promise for platform participation.",
      }}
      hero={
        <>
          {!isActive ? (
            <StickyMobileCTA
              primary={{ label: "Join for $5/year", onClick: handleJoin }}
              secondary={{ label: "Preview membership terms.", href: "/terms/membership" }}
            />
          ) : null}
          <div {...tourAnchor}>
            <Hero
              variant="focus"
              eyebrow="Membership for builders, creators, and operators."
              headline="Join the platform for $5 a year."
              body="Become a member of Liana Banyan CORPORATION and move from watching to participating across commerce, creation, and cooperative tools."
              primaryCTA={{
                label: isActive ? "Go to your membership dashboard." : "Join for $5/year.",
                onClick: handleJoin,
              }}
              secondaryCTA={{ label: "Preview membership terms.", href: "/terms/membership" }}
              proofStrip={[
                "$5/year membership",
                "83.3% creator keeps",
                "No demographic data required",
                "Founder terms aligned.",
              ]}
            />
          </div>
        </>
      }
    >
      <div data-xray-id="membership-page" className="space-y-10 pb-16">
        <MembershipCapabilities />

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">Why $5 matters</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Membership is designed as a single, low-friction decision with structural legitimacy. One
            offer, one price, and one promise keeps the page focused on participation instead of
            shopping between plans.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The bylaw protects continuity across time, so members are entering a stable operating
            covenant rather than a temporary promotion.
          </p>
        </section>

        <CreatorEconomicsExample />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Terms and trust</h2>
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Membership is plain-language and structural: Liana Banyan CORPORATION, founder terms
              aligned economics, and a stable governance bylaw.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Trust anchor: the annual membership bylaw remains <span className="font-medium text-foreground">$5/year</span>.
            </p>
            <div className="mt-4">
              <Button variant="outline" asChild>
                <a href="/terms/membership">Read membership terms</a>
              </Button>
            </div>
          </div>
        </section>

        <MembershipFAQ />

        {!isActive ? (
          <section className="rounded-xl border bg-muted/20 p-6 text-center">
            <h3 className="text-xl font-semibold tracking-tight">Ready to participate?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              One offer, one price, one promise.
            </p>
            <div className="mt-4 flex justify-center">
              <Button size="lg" onClick={handleJoin}>
                Join for $5/year.
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </FocusShell>
  );
}
