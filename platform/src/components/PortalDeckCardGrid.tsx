/**
 * PortalDeckCardGrid — Responsive grid for portal landing pages.
 * Desktop: 3-col, Tablet: 2-col, Mobile: 1-col.
 * Supports 6, 7, or any number of deck cards.
 */

import { PortalDeckCard, type PortalDeckCardConfig } from "./PortalDeckCard";

interface PortalDeckCardGridProps {
  cards: PortalDeckCardConfig[];
  accentColor?: string;
}

export function PortalDeckCardGrid({ cards, accentColor }: PortalDeckCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
      {cards.map((card, i) => (
        <PortalDeckCard key={i} card={card} accentColor={accentColor} />
      ))}
    </div>
  );
}
