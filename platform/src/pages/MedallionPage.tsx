/**
 * MedallionPage — /medallion/:variant
 * =====================================
 * Submarine Doors routing per B089 Deck Card architecture.
 * Each variant renders the LibrarianMedallion at full size.
 * Unknown variants fall back to the gallery.
 *
 * Routes:
 *   /medallion/canon
 *   /medallion/platform-rules
 *   /medallion/project-rules
 *   /medallion/cathedral
 *   /medallion/pied-piper
 *   /medallion/ai-tuning
 *   /medallion/furnace
 *   /medallion (no variant → gallery)
 *
 * Tags: KN053 / KN054 / KN055 (Pod T, BP005)
 */

import { useParams, Link } from "react-router-dom";
import {
  LibrarianMedallion,
  LibrarianMedallionGallery,
  type LibrarianMedallionVariant,
} from "@/components/LibrarianMedallion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen } from "lucide-react";

const VALID_VARIANTS = new Set<LibrarianMedallionVariant>([
  "canon",
  "platform-rules",
  "project-rules",
  "cathedral",
  "pied-piper",
  "ai-tuning",
  "furnace",
  "symbiote",
  "ultravision",
  "liana-banyan",
]);

function isValidVariant(v: string | undefined): v is LibrarianMedallionVariant {
  return !!v && VALID_VARIANTS.has(v as LibrarianMedallionVariant);
}

export default function MedallionPage() {
  const { variant } = useParams<{ variant?: string }>();
  const resolvedVariant = isValidVariant(variant) ? variant : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold text-sm">The Librarian</span>
            {resolvedVariant && (
              <>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {resolvedVariant.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {resolvedVariant ? (
          /* Single variant — full-size Medallion */
          <div className="flex flex-col items-center gap-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Librarian Medallion
              </h1>
              <p className="text-sm text-muted-foreground max-w-md">
                Scan the QR to visit{" "}
                <a
                  href={`https://Librarian.LianaBanyan.com/medallion/${resolvedVariant}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Librarian.LianaBanyan.com/medallion/{resolvedVariant}
                </a>
                . Flip the card to explore the 5-stage LB Frame funnel.
              </p>
            </div>

            <LibrarianMedallion
              variant={resolvedVariant}
              chainWalkerEnabled={resolvedVariant === "furnace"}
            />

            <div className="flex gap-3 flex-wrap justify-center">
              <Link to="/medallion">
                <Button variant="outline" size="sm">
                  View All Medallions
                </Button>
              </Link>
              <a
                href={`https://Librarian.the2ndSecond.com/medallion/${resolvedVariant}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm">
                  Open Librarian Page →
                </Button>
              </a>
            </div>
          </div>
        ) : (
          /* Gallery — all 10 variants (+ open-set) */
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Librarian Medallion Gallery
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                All Medallions are Librarian variants. One brand — many doors.
                Cathedral, Pied Piper, Furnace, Canon, Platform Rules, Project
                Rules, AI Tuning, Symbiote, UltraVision, and Liana Banyan are
                all versions of the same Librarian identity. Click any card to
                flip and explore. Extended via{" "}
                <span className="font-mono text-xs">librarian_medallion_variants.yaml</span>.
              </p>
            </div>

            <LibrarianMedallionGallery />

            <div className="text-center text-xs text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
              Solo substrate: AGPL v3 free — full-version, full-featured, no
              gating. Federation Library (cross-member Stone Tablets + Eblets +
              personality chips): ONE OF US opt-in — $5/year, identical for all
              members. The substrate is open; the community is opt-in. Both are
              real; neither is artificial.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
