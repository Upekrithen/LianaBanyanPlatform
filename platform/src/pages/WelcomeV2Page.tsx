import { FocusShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import {
  HowItWorks3Step,
  PathwayMapVisual,
  WhyPeopleStay,
} from "@/components/v2/welcome";
import { Button } from "@/components/ui/button";
import { useTourTarget } from "@/hooks/useTourTarget";
import { Flame } from "lucide-react";

export default function WelcomeV2Page() {
  const tourAnchor = useTourTarget("welcome");

  return (
    <FocusShell
      xrayBase="welcome"
      seo={{
        title: "Welcome | Liana Banyan",
        description: "Start where you want to build.",
      }}
      hero={
        <>
          <StickyMobileCTA primary={{ label: "Explore the pathways", href: "/cold-start" }} />
          <div {...tourAnchor}>
            <Hero
              variant="focus"
              eyebrow="A working platform, not a brochure."
              headline="Start where you want to build."
              body="Explore a cooperative platform for commerce, creation, production, and local coordination—then choose your path when you're ready."
              primaryCTA={{ label: "Explore the pathways", href: "/cold-start" }}
              secondaryCTA={{ label: "Browse as a guest", href: "/ghost-browse" }}
              joinCTA={{ label: "Join Liana Banyan \u2014 $5/year. Be the first one on your block.", href: "/join" }}
              proofStrip={[
                "6 starting pathways",
                "$5/year membership",
                "See before you join",
                "No demographic intake",
              ]}
            />
          </div>
        </>
      }
    >
      <div className="space-y-10">
        <PathwayMapVisual />

        <HowItWorks3Step />

        <WhyPeopleStay />

        <section className="rounded-2xl border bg-card p-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Start with one path</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Choose a practical entry point today. Expand to additional pathways as you build momentum.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="/cold-start">Explore the pathways</a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="/ghost-browse">Browse as a guest</a>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/10 p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h2 className="text-2xl font-semibold tracking-tight text-orange-800 dark:text-orange-200">Try WildFire Tour</h2>
          </div>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            See the platform live — subscriptions, crews, storefronts — all populated with demo data. No account needed.
          </p>
          <div className="mt-5">
            <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
              <a href="/wildfire-tour"><Flame className="h-4 w-4 mr-2" />Start WildFire Tour</a>
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">New member orientation</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Guided Tour is the flyover. Alcove Hallway is the deep-learning sequence. Start with either and continue with the other.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" variant="outline">
              <a href="/tour">Take the Guided Tour</a>
            </Button>
            <Button asChild size="lg">
              <a href="/learn">Enter the Alcove Hallway</a>
            </Button>
          </div>
        </section>
      </div>
    </FocusShell>
  );
}
