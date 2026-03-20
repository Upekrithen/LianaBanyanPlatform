/**
 * Cue Card Deck Page — Route: /cue-cards (or /membership /benefits)
 * $5/year Viral Cue Card Deck — browsable collection.
 */

import { CueCardDeck } from "@/components/cue-cards/CueCardDeck";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function CueCardDeckPage() {
  return (
    <PortalPageLayout maxWidth="lg" xrayId="cue-card-deck">
      <CueCardDeck />
    </PortalPageLayout>
  );
}
