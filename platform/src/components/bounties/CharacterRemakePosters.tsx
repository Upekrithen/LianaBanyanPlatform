/**
 * CharacterRemakePosters -- Scope 29: CHARACTER_REMAKE bounties.
 * Staged posters for the 4 placeholder-art characters.
 *
 * Characters with placeholder art (from mascots.ts):
 *   - Sheepdog (dog) -- domain: trust
 *   - Scout Mouse (mouse) -- domain: discovery
 *   - Ghost Cat (catsp) -- domain: ghost (special)
 *   - The Skeptic (hogtemp) -- domain: critic (special)
 *
 * GATED on Founder license terms -- these posters are STAGED (not live).
 * Display only. The "Post to Help Wanted" action is gated behind Founder approval.
 *
 * Art style guidelines per mascots.ts:
 *   - PFP format (Profile Picture): 16 animals x 3 variants
 *   - Variant 1 = default (monochrome)
 *   - Variant 2 = active/talking (realistic)
 *   - Variant 3 = X-Ray (rainbow gradient)
 *   - All characters wear goggles
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lock, Palette, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// =========================================================================
// CHARACTER REMAKE POSTER DATA
// =========================================================================
interface CharacterRemakePoster {
  mascotId: string;
  characterName: string;
  domain: string;
  artStatus: "placeholder";
  posterTitle: string;
  artBrief: string[];
  referenceFiles: string[];
  deliverables: string[];
  compensationCredits: number;
  ipOwnership: "poster";
  stagedOnly: true;
  gateNote: string;
}

const CHARACTER_REMAKE_POSTERS: CharacterRemakePoster[] = [
  {
    mascotId: "dog",
    characterName: "Sheepdog",
    domain: "Trust and Safety",
    artStatus: "placeholder",
    posterTitle: "CHARACTER_REMAKE: Sheepdog (Trust Domain)",
    artBrief: [
      "The Sheepdog is the Trust and Safety specialist. Watchful, loyal, always one eye open.",
      "Visual feel: Border Collie or Australian Shepherd type. Alert posture. Protective energy without being aggressive.",
      "Three variants required: (1) default -- monochrome, calm, watchful. (2) hover/talking -- realistic, engaged, one eye looking directly at the viewer. (3) X-Ray -- rainbow gradient on the character, goggles illuminated.",
      "Must wear goggles (matching the existing PFP character set -- see /characters/pfp/PFPOwl1.png for reference). Goggles are the unifying visual signature.",
      "Format: PNG at 512x512px, transparent background. Deliver all three variants.",
      "Character carries a sense of quiet protection -- not aggression, not alarm. The Sheepdog guards without threatening.",
    ],
    referenceFiles: [
      "/characters/pfp/PFPOwl1.png (default variant reference)",
      "/characters/pfp/PFPOwl2.png (talking variant reference)",
      "/characters/pfp/PFPOwl3.png (X-Ray variant reference)",
      "/images/mascots/_reference/character-roster.png (full cast reference)",
    ],
    deliverables: [
      "Sheepdog_default.png (512x512, transparent, monochrome)",
      "Sheepdog_hover.png (512x512, transparent, realistic/talking)",
      "Sheepdog_xray.png (512x512, transparent, rainbow gradient + goggles lit)",
      "source_file (SVG or layered PSD/Procreate)",
    ],
    compensationCredits: 600,
    ipOwnership: "poster",
    stagedOnly: true,
    gateNote:
      "STAGED -- pending Founder license terms approval. Art style must match existing PFP set (son's art). Do not post or claim until gate is open.",
  },
  {
    mascotId: "mouse",
    characterName: "Scout Mouse",
    domain: "Discovery",
    artStatus: "placeholder",
    posterTitle: "CHARACTER_REMAKE: Scout Mouse (Discovery Domain)",
    artBrief: [
      "Scout Mouse is the Discovery specialist. Small, fast, has been everywhere twice.",
      "Visual feel: Field mouse or house mouse. Energetic, curious, always in motion. Binoculars optional (she's already everywhere, she doesn't need to look from a distance).",
      "Three variants required: (1) default -- monochrome, alert, on the move. (2) hover/talking -- realistic, pointing in a direction, enthusiastic. (3) X-Ray -- rainbow gradient on the character, goggles illuminated.",
      "Must wear goggles (matching the existing PFP character set). Small size conveyed through posture and implied scale, not explicit comparison.",
      "Format: PNG at 512x512px, transparent background. Deliver all three variants.",
    ],
    referenceFiles: [
      "/characters/pfp/PFPOwl1.png (default variant reference)",
      "/characters/pfp/PFPOwl2.png (talking variant reference)",
      "/characters/pfp/PFPOwl3.png (X-Ray variant reference)",
      "/images/mascots/_reference/character-roster.png (full cast reference)",
    ],
    deliverables: [
      "ScoutMouse_default.png (512x512, transparent, monochrome)",
      "ScoutMouse_hover.png (512x512, transparent, realistic/talking)",
      "ScoutMouse_xray.png (512x512, transparent, rainbow gradient + goggles lit)",
      "source_file (SVG or layered PSD/Procreate)",
    ],
    compensationCredits: 600,
    ipOwnership: "poster",
    stagedOnly: true,
    gateNote:
      "STAGED -- pending Founder license terms approval. Art style must match existing PFP set (son's art). Do not post or claim until gate is open.",
  },
  {
    mascotId: "catsp",
    characterName: "Ghost Cat",
    domain: "Ghost World (Special)",
    artStatus: "placeholder",
    posterTitle: "CHARACTER_REMAKE: Ghost Cat (Ghost World Special)",
    artBrief: [
      "Ghost Cat is the special character for Ghost World (un-membered browsing state). Translucent, soft-spoken, only visible when you're browsing without a membership.",
      "Visual feel: Translucent or semi-transparent cat. Soft, ethereal. Not spooky -- welcoming, gentle. She's the guide in the liminal space.",
      "Three variants required: (1) default -- monochrome with translucency effect. (2) hover/talking -- slight color warmth, more solid, engaged. (3) X-Ray -- rainbow gradient, goggles lit, more visible/real (as if seeing her true form).",
      "Must wear goggles. The translucency can be achieved through line-weight and opacity techniques in the illustration.",
      "Format: PNG at 512x512px, transparent background. Deliver all three variants.",
    ],
    referenceFiles: [
      "/characters/pfp/PFPOwl1.png (default variant reference)",
      "/characters/pfp/PFPOwl2.png (talking variant reference)",
      "/characters/pfp/PFPOwl3.png (X-Ray variant reference)",
      "/images/mascots/_reference/character-roster.png (full cast reference)",
    ],
    deliverables: [
      "GhostCat_default.png (512x512, transparent bg, translucent effect)",
      "GhostCat_hover.png (512x512, transparent bg, warmer/more visible)",
      "GhostCat_xray.png (512x512, transparent bg, rainbow gradient + goggles lit)",
      "source_file (SVG or layered PSD/Procreate)",
    ],
    compensationCredits: 700,
    ipOwnership: "poster",
    stagedOnly: true,
    gateNote:
      "STAGED -- pending Founder license terms approval. Ghost Cat has a unique visual challenge (translucency). May require extended timeline. Do not post or claim until gate is open.",
  },
  {
    mascotId: "hogtemp",
    characterName: "The Skeptic",
    domain: "Critic (Special)",
    artStatus: "placeholder",
    posterTitle: "CHARACTER_REMAKE: The Skeptic (Devil's Advocate Special)",
    artBrief: [
      "The Skeptic is the rare devil's advocate character. Never mean. Always honest. Shows up to make the counter-argument so the platform stays intellectually honest.",
      "Visual feel: This character has no confirmed species yet -- the brief notes a TBD species pending a dedicated sketch. The artist may propose a species appropriate to the contrarian-but-friendly archetype. Suggestions: porcupine (defensive spines, not threatening), raven (clever, perceptive), or other non-threatening contrarian animal.",
      "Three variants required: (1) default -- monochrome, thoughtful expression, skeptical-but-warm. (2) hover/talking -- raising a hand or paw, presenting an argument. (3) X-Ray -- rainbow gradient, goggles lit.",
      "Must wear goggles. Expression should read as curious/questioning, not aggressive or cynical.",
      "Format: PNG at 512x512px, transparent background. Deliver all three variants.",
      "The species choice should be proposed with a rationale and can be discussed before final art.",
    ],
    referenceFiles: [
      "/characters/pfp/PFPOwl1.png (default variant reference)",
      "/characters/pfp/PFPOwl2.png (talking variant reference)",
      "/characters/pfp/PFPOwl3.png (X-Ray variant reference)",
      "/images/mascots/_reference/character-roster.png (full cast reference)",
    ],
    deliverables: [
      "Skeptic_default.png (512x512, transparent, monochrome + species rationale doc)",
      "Skeptic_hover.png (512x512, transparent, realistic/arguing)",
      "Skeptic_xray.png (512x512, transparent, rainbow gradient + goggles lit)",
      "source_file (SVG or layered PSD/Procreate)",
    ],
    compensationCredits: 700,
    ipOwnership: "poster",
    stagedOnly: true,
    gateNote:
      "STAGED -- pending Founder license terms approval AND species selection confirmation. The Skeptic's animal species is still TBD. Propose your species with the application. Do not post or claim until gate is open.",
  },
];

// =========================================================================
// STAGED POSTER CARD
// =========================================================================
function StagedPosterCard({ poster }: { poster: CharacterRemakePoster }) {
  return (
    <Card
      className="flex flex-col border-2 border-dashed border-amber-200 bg-amber-50/30"
      data-xray-id={`character-remake-poster-${poster.mascotId}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-purple-600" />
              <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                CHARACTER_REMAKE
              </Badge>
              <Badge
                variant="outline"
                className="text-xs border-amber-300 text-amber-700 bg-amber-50"
              >
                <Lock className="h-3 w-3 mr-1" />
                STAGED
              </Badge>
            </div>
            <CardTitle className="text-base leading-tight">{poster.posterTitle}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Domain: {poster.domain} -- Art status: placeholder
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold">{poster.compensationCredits} Credits</p>
            <p className="text-xs text-muted-foreground">upon acceptance</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Gate notice */}
        <div className="flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-lg p-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">{poster.gateNote}</p>
        </div>

        {/* Art brief */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Art Brief
          </p>
          <ul className="flex flex-col gap-1.5">
            {poster.artBrief.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground text-xs shrink-0 mt-0.5">-</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Deliverables */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Deliverables
          </p>
          <ul className="flex flex-col gap-1">
            {poster.deliverables.map((d, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="text-muted-foreground shrink-0">-</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* IP terms */}
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">IP ownership:</span> Liana Banyan Platform
          retains IP post-delivery. Artist receives full credit in the mascots registry and Brand
          Stamp.
        </div>

        {/* Gated CTA */}
        <Button className="w-full" disabled variant="outline">
          <Lock className="h-4 w-4 mr-2" />
          Gated -- awaiting Founder license approval
        </Button>
      </CardContent>
    </Card>
  );
}

// =========================================================================
// EXPORT
// =========================================================================

export { CHARACTER_REMAKE_POSTERS, StagedPosterCard };
export type { CharacterRemakePoster };

export function CharacterRemakePostersPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-purple-50 to-amber-50">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-6 w-6 text-purple-600" />
            <Badge variant="outline" className="border-purple-200 text-purple-700">
              CHARACTER_REMAKE
            </Badge>
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              <Lock className="h-3 w-3 mr-1" />
              STAGED
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-3">Character Remake Bounties</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-2">
            Four platform characters currently use placeholder art. These bounties commission
            final PFP-style art to match the existing character set.
          </p>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            These posters are STAGED -- awaiting Founder license terms approval before going live.
            Art must match the existing PFP set visual style.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          {CHARACTER_REMAKE_POSTERS.map((poster) => (
            <StagedPosterCard key={poster.mascotId} poster={poster} />
          ))}
        </div>
      </div>
    </div>
  );
}
