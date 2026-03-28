/**
 * PortalDeckCard — 3D Flipping Navigation Card
 * Front: icon + title. Hover (desktop) or tap (mobile) flips to back.
 * Back: description + "Visit →" link that navigates to destination.
 */

import { useState, useCallback } from "react";
import { ArrowRight } from "lucide-react";

export interface PortalDeckCardConfig {
  icon: string;
  title: string;
  description: string;
  href: string;
  openNewTab?: boolean;
  accentColor?: string;
  /** Optional image URL for the front face (replaces emoji) */
  frontImage?: string;
  /** Optional image URL for the back face (replaces description text) */
  backImage?: string;
  /** Optional subtitle displayed below title on front */
  subtitle?: string;
}

interface PortalDeckCardProps {
  card: PortalDeckCardConfig;
  accentColor?: string;
}

export function PortalDeckCard({ card, accentColor }: PortalDeckCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [tapped, setTapped] = useState(false);
  const accent = card.accentColor || accentColor || "rgb(251 191 36)";

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const isTouchDevice = window.matchMedia("(hover: none)").matches;
      if (isTouchDevice) {
        if (!tapped) {
          e.preventDefault();
          setTapped(true);
          setFlipped(true);
        }
        // second tap: allow navigation via the anchor
      }
    },
    [tapped]
  );

  const handleMouseLeave = useCallback(() => {
    setFlipped(false);
    setTapped(false);
  }, []);

  return (
    <div
      className="portal-deck-card group"
      style={{ perspective: "1000px" }}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`portal-deck-card-inner relative w-full transition-transform duration-[400ms] ease-in-out`}
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          aspectRatio: "4 / 3",
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-card shadow-lg backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
          }}
        >
          {card.frontImage ? (
            <>
              <img
                src={card.frontImage}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="relative mt-auto pb-3 text-center">
                <h3 className="text-lg font-semibold text-white tracking-tight drop-shadow-md">
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-xs text-white/70 mt-0.5">{card.subtitle}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <span className="text-4xl mb-3" role="img" aria-label={card.title}>
                {card.icon}
              </span>
              <h3 className="text-lg font-semibold text-foreground tracking-tight">
                {card.title}
              </h3>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
              )}
            </>
          )}
          <div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl opacity-60"
            style={{ backgroundColor: accent }}
          />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 bg-card shadow-lg px-5 text-center backface-hidden overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderColor: `color-mix(in srgb, ${accent} 50%, transparent)`,
          }}
        >
          {card.backImage ? (
            <>
              <img
                src={card.backImage}
                alt={`${card.title} — back`}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative mt-auto pb-3">
                <a
                  href={card.href}
                  target={card.openNewTab !== false ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80 bg-black/50 px-3 py-1.5 rounded-full"
                  style={{ color: accent }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Visit <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {card.description}
              </p>
              <a
                href={card.href}
                target={card.openNewTab !== false ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: accent }}
                onClick={(e) => e.stopPropagation()}
              >
                Visit <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      <style>{`
        .portal-deck-card { cursor: pointer; }
        @media (hover: hover) {
          .portal-deck-card:hover .portal-deck-card-inner {
            transform: rotateY(180deg) !important;
          }
        }
      `}</style>
    </div>
  );
}
