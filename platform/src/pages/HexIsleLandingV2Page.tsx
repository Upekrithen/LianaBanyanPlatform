import { FocusShell } from "@/components/shells";
import { StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import {
  HeroSectionHexIsle,
  CoreLoopStrip,
  CurrencyBridge,
  TerrainShowcase,
  ModesGrid,
  CoopExplainerBand,
  SpanishPortalCallout,
  EventsCarousel,
  HexIsleFooter,
} from "@/components/v2/hexisle";

export default function HexIsleLandingV2Page() {
  const tourAnchor = useTourTarget("hexisle");

  const scrollToLoop = () => {
    const target = document.getElementById("hexisle-core-loop");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <FocusShell
      xrayBase="hexisle"
      seo={{
        title: "HexIsle | Island Gate",
        description: "Public game-first landing for HexIsle.",
      }}
      hero={
        <>
          <StickyMobileCTA primary={{ label: "Enter the Island Gate", href: "/hexisle/world-map" }} />
          <div {...tourAnchor}>
            <HeroSectionHexIsle onContinue={scrollToLoop} />
          </div>
        </>
      }
      className="bg-background"
    >
      <div className="space-y-10 pb-16">
        <section id="hexisle-core-loop">
          <CoreLoopStrip />
        </section>
        <CurrencyBridge />
        <TerrainShowcase />
        <ModesGrid />
        <CoopExplainerBand />
        <SpanishPortalCallout />
        <EventsCarousel />
        <HexIsleFooter />
      </div>
    </FocusShell>
  );
}
