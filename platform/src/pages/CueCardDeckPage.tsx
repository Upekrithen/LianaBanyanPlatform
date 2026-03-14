/**
 * Cue Card Deck Page — Route: /cue-cards (or /membership /benefits)
 * $5/year Viral Cue Card Deck — browsable collection.
 */

import { CueCardDeck } from "@/components/cue-cards/CueCardDeck";

export default function CueCardDeckPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8" data-xray-id="cue-card-deck-page">
      <CueCardDeck />
    </div>
  );
}
