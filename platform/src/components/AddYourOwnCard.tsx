/**
 * ADD YOUR OWN CARD — Universal Participatory Marketplace Pattern
 * ================================================================
 * 
 * CRITICAL DESIGN PRINCIPLE:
 * This card should ALWAYS be the FIRST card in any collection.
 * It establishes that this is a participatory marketplace, not just a catalog.
 * 
 * Usage:
 * - Recipe collections: "Add Your Recipe"
 * - Product listings: "Design Your Own"
 * - Character galleries: "Create Your Character"
 * - Terrain tiles: "Design Your Terrain"
 * - Any marketplace category
 * 
 * The message: "This is what's available, but YOU can add to it."
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Upload, ChevronRight, Coins } from "lucide-react";

interface AddYourOwnCardProps {
  /** Main title, e.g., "Design Your Own" or "Add Your Recipe" */
  title: string;
  /** Short tagline, e.g., "Your creation, your royalties" */
  tagline: string;
  /** Front description */
  description: string;
  /** Back of card detailed explanation */
  backDetails: string;
  /** Bullet points for the back */
  specs?: string[];
  /** Features to show on front */
  features?: string[];
  /** CTA button text */
  ctaText: string;
  /** Where the CTA navigates to */
  ctaLink: string;
  /** Category badge text (optional) */
  categoryBadge?: string;
  /** Custom icon (defaults to Plus) */
  icon?: React.ElementType;
  /** Card height (defaults to 380px) */
  height?: string;
  /** Whether to show the royalty percentage */
  showRoyalty?: boolean;
  /** Custom royalty text (defaults to "83.3% royalties") */
  royaltyText?: string;
}

export function AddYourOwnCard({
  title,
  tagline,
  description,
  backDetails,
  specs,
  features,
  ctaText,
  ctaLink,
  categoryBadge,
  icon: Icon = Plus,
  height = "380px",
  showRoyalty = true,
  royaltyText = "Earn 83.3% of every sale",
}: AddYourOwnCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="perspective-1000 cursor-pointer"
      style={{ height }}
      onClick={() => setIsFlipped(!isFlipped)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped); }}}
      role="button"
      tabIndex={0}
      aria-label="Flip card to see details"
    >
      <div 
        className={`relative w-full h-full transition-transform duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <Card 
          className="absolute w-full h-full backface-hidden border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 add-your-own-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-lg bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="w-3 h-3 mr-1" />
                Your Design Here
              </Badge>
            </div>
            <CardTitle className="text-lg mt-3 flex items-center gap-2">
              {title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-primary/80">
              {tagline}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">{description}</p>
            
            {features && features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {features.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                ))}
              </div>
            )}
            
            {showRoyalty && (
              <div className="flex items-center gap-2 text-sm text-primary font-medium pt-2">
                <Coins className="h-4 w-4" />
                {royaltyText}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground text-right pt-2">
              tap to learn more →
            </p>
          </CardContent>
        </Card>

        {/* BACK */}
        <Card 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                {title}
              </CardTitle>
              {categoryBadge && (
                <Badge variant="outline" className="text-xs">{categoryBadge}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{backDetails}</p>
            
            {specs && specs.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">What you get:</p>
                <ul className="text-xs space-y-1">
                  {specs.map((spec, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="pt-2 space-y-2">
              <Button 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(ctaLink);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {ctaText}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                IP protected via verified timestamp
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * USAGE EXAMPLES:
 * 
 * Recipe Collection:
 * <AddYourOwnCard
 *   title="Add Your Recipe"
 *   tagline="Share your culinary creation"
 *   description="Upload your recipe to Let's Make Dinner. If the community loves it, earn 83.3% every time someone orders."
 *   backDetails="Submit your recipe with photos and instructions. Community votes determine what gets featured. Your IP is timestamped on the verified ledger."
 *   specs={["Photo + instructions", "Community voting", "IP protection", "83.3% per order"]}
 *   features={["Any cuisine", "Any skill level"]}
 *   ctaText="Submit Recipe"
 *   ctaLink="/lets-make-dinner/submit"
 *   categoryBadge="Let's Make Dinner"
 * />
 * 
 * Product Design:
 * <AddYourOwnCard
 *   title="Design Your Own"
 *   tagline="Your product, your royalties"
 *   description="Upload CAD, sketch, or description. We'll manufacture it through the Factory pipeline."
 *   backDetails="Submit your design and the community votes. If approved, we prototype, manufacture, and sell — you keep 83.3%."
 *   specs={["CAD or sketch accepted", "Factory pipeline", "Distributed manufacturing"]}
 *   features={["Any category", "Any scale"]}
 *   ctaText="Start Designing"
 *   ctaLink="/factory"
 * />
 */

export default AddYourOwnCard;
