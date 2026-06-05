/**
 * InitiativeCueCard — Wave 6 Phase S
 * ===================================
 * Printable / shareable summary card for a Sweet Sixteen initiative.
 * Renders as an inline card on initiative pages and can be exported.
 */
import { type InitiativeCueCardData } from "@/data/initiativeWalkthroughs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Share2, Printer } from "lucide-react";

interface InitiativeCueCardProps {
  card: InitiativeCueCardData;
  compact?: boolean;
}

export function InitiativeCueCard({ card, compact = false }: InitiativeCueCardProps) {
  const handlePrint = () => window.print();

  const handleShare = async () => {
    const url = `${window.location.origin}${card.onboardingRoute}`;
    if (navigator.share) {
      await navigator.share({ title: card.name, text: card.tagline, url });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  if (compact) {
    return (
      <div className={`rounded-xl border-2 bg-gradient-to-br ${card.color} p-4 space-y-2`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{card.emoji}</span>
          <div>
            <p className="font-bold text-sm">{card.name}</p>
            <p className="text-xs text-muted-foreground">{card.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="font-mono font-bold text-lg">{card.quickStat}</span>
          <span className="text-muted-foreground">{card.quickStatLabel}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br ${card.color} p-6 space-y-4`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{card.emoji}</span>
          <div>
            <h3 className="text-xl font-bold">{card.name}</h3>
            <p className="text-sm text-muted-foreground">{card.tagline}</p>
          </div>
        </div>
        <Badge variant="outline" className="shrink-0 text-xs">Cue Card</Badge>
      </div>

      {/* Key Stat */}
      <div className="flex items-baseline gap-2 py-2 border-t border-b border-border/40">
        <span className="font-mono font-black text-3xl">{card.quickStat}</span>
        <span className="text-sm text-muted-foreground">{card.quickStatLabel}</span>
      </div>

      {/* Bullet Points */}
      <ul className="space-y-2">
        {card.bulletPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <Button size="sm" asChild className="flex-1">
          <a href={card.onboardingRoute}>{card.onboardingCta} →</a>
        </Button>
        <Button size="sm" variant="outline" onClick={handleShare} aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={handlePrint} aria-label="Print">
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
