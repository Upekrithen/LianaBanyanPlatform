/**
 * BountyPosterPage -- Scope 26: Public-facing page for the Bounty Poster Generator.
 * Route: /bounty-poster-generator
 *
 * "Bounty Poster for Artists to make Bounty Posters."
 * 5 classes: Translation / Design / Development / Content / Research.
 */

import { BountyPosterGenerator } from "@/components/bounties/BountyPosterGenerator";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function BountyPosterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="border-b bg-gradient-to-br from-purple-50 to-amber-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-6 w-6 text-amber-500" />
            <Badge variant="outline">Help Wanted</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-3">Bounty Poster Generator</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-2">
            Create a structured Bounty Poster to commission work from the cooperative.
            Every poster is Ebletted (SID assigned), written to the IP Ledger, and
            stamped with the Brand Stamp.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Five poster classes: Translation (Marks), Design, Development, Content, and
            Research (all Credits). IP terms are pre-set per class. Cost+20% is the
            compensation floor.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <BountyPosterGenerator />
      </div>
    </div>
  );
}
