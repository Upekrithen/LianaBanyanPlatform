import { useState } from "react";
import { FocusShell } from "@/components/shells";
import { Hero, InformativeLock, StickyMobileCTA } from "@/components/v2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useIsMobile } from "@/hooks/use-mobile";
import { LockedActionBottomSheet, PreviewModeBanner } from "@/components/v2/ghost";

type LockedSurface = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
};

const ACTION_SURFACES: LockedSurface[] = [
  {
    id: "contact-creator",
    title: "Marketplace preview",
    description:
      "Browse product cards, inspect fulfillment notes, and compare public details in read-only mode.",
    actionLabel: "Contact creator",
  },
  {
    id: "claim-item",
    title: "Pathway workspace preview",
    description:
      "Review pathway steps, public milestones, and contribution context before entering active workflows.",
    actionLabel: "Claim item",
  },
  {
    id: "purchase-item",
    title: "Cephas and publication preview",
    description:
      "Read publication snippets and editorial summaries while staying in observer mode.",
    actionLabel: "Publish and purchase",
  },
];

export default function GhostBrowseV2Page() {
  const isMobile = useIsMobile();
  const tourAnchor = useTourTarget("ghost-browse");
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const openPreviewSection = () => {
    const section = document.getElementById("ghost-preview-surfaces");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLockedAction = (actionLabel: string) => {
    if (isMobile) {
      setActiveAction(actionLabel);
      return;
    }
    window.location.hash = "membership-explanation";
  };

  return (
    <FocusShell
      xrayBase="ghost-browse"
      seo={{
        title: "Ghost Browse | Liana Banyan",
        description: "Preview mode for open browsing with informative action thresholds.",
      }}
      hero={
        <>
          <StickyMobileCTA primary={{ label: "Join for $5/year", href: "/membership" }} />
          <div {...tourAnchor}>
            <Hero
              variant="focus"
              eyebrow="Preview mode"
              headline="Look around before you join"
              body="Browse the platform, inspect pathways, and see how participation works. Join when you're ready to do more than observe."
              primaryCTA={{ label: "Join for $5/year", href: "/membership" }}
              secondaryCTA={{ label: "Continue browsing", onClick: openPreviewSection }}
              proofStrip={[
                "Open preview access",
                "Participation requires membership",
                "$5/year",
                "No demographic intake",
              ]}
            />
          </div>
        </>
      }
    >
      <PreviewModeBanner />

      <div className="space-y-10 pb-16">
        <section id="ghost-preview-surfaces" className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Public content surfaces</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            This preview keeps content visible and readable. Interactive commitments stay behind
            membership thresholds so you can evaluate first, then participate when ready.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Marketplace previews</CardTitle>
                <CardDescription>
                  Product summaries, pricing context, and creator pages are visible in preview mode.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Read-only product cards and publicly listed fulfillment context.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pathway cards</CardTitle>
                <CardDescription>
                  Inspect pathway scaffolding, role context, and initiative descriptions.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Shared maps, cards, and public lifecycle notes are available to inspect.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cephas snippets</CardTitle>
                <CardDescription>
                  Publication excerpts and linked context can be read without an account wall.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Reading is open; action pathways remain informative and membership-based.
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Soft-locked action thresholds</h2>
          <div className="space-y-5">
            {ACTION_SURFACES.map((surface) => (
              <article key={surface.id} className="rounded-xl border bg-card p-5">
                <h3 className="text-lg font-semibold">{surface.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{surface.description}</p>
                <div className="mt-4">
                  <Button variant="outline" onClick={() => handleLockedAction(surface.actionLabel)}>
                    {surface.actionLabel}
                  </Button>
                </div>
                <div className="mt-4">
                  <InformativeLock action="respond, launch, and transact" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="membership-explanation" className="rounded-xl border bg-muted/30 p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Membership explanation</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Membership is where action begins: contact, claims, purchase commitments, publication
            actions, and active join workflows align under one $5/year bylaw.
          </p>
          <div className="mt-4">
            <Button asChild>
              <a href="/membership">Join for $5/year</a>
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Ready to move beyond preview?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue browsing as long as you want, then join when you are ready to participate.
          </p>
          <div className="mt-4">
            <Button asChild size="lg">
              <a href="/membership">Join for $5/year</a>
            </Button>
          </div>
        </section>
      </div>

      <LockedActionBottomSheet
        open={Boolean(activeAction)}
        actionLabel={activeAction}
        onOpenChange={(open) => {
          if (!open) setActiveAction(null);
        }}
      />
    </FocusShell>
  );
}
