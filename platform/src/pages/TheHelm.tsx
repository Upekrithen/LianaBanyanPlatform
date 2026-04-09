/**
 * THE HELM — Deck Card Dashboard
 * ===============================
 * Every project, role, subscription, and activity gets a deck card.
 * Two view modes: Slideshow (default) and Grid.
 * Cards flip to reveal details — same pattern as the landing page hero card.
 */

import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useHelmCards, type HelmCard } from "@/hooks/useHelmCards";
import { Anchor, LayoutGrid, GalleryHorizontal, ChevronLeft, ChevronRight, Rocket } from "lucide-react";
import {
  cancelViewingBeacon,
  listUpcomingViewingBeacons,
  updateViewingBeacon,
} from "@/lib/viewingBeaconService";

// ─────────────────────────────────────────────────────────
// DECK CARD FRAME — flip-card with front/back faces
// ─────────────────────────────────────────────────────────

function DeckCardFrame({
  card,
  flipped,
  onFlip,
  onNavigate,
  compact,
}: {
  card: HelmCard;
  flipped: boolean;
  onFlip: () => void;
  onNavigate: (href: string) => void;
  compact?: boolean;
}) {
  const badgeColor =
    card.badge === "Active"
      ? "#38a169"
      : card.badge === "Backed"
        ? "#d69e2e"
        : "#718096";

  return (
    <div
      className="helm-card-flip"
      style={{
        perspective: "1000px",
        width: compact ? "100%" : "min(420px, 90vw)",
        margin: compact ? 0 : "0 auto",
        cursor: "pointer",
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a, button")) return;
        onFlip();
      }}
    >
      <div
        className="card-inner"
        style={{
          position: "relative",
          width: "100%",
          minHeight: compact ? "200px" : "320px",
          transition: "transform 0.6s ease",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: compact ? "1.25rem" : "2rem",
            borderRadius: "1rem",
            border: "2px solid color-mix(in srgb, #c9a227 30%, transparent)",
            background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--card) / 0.85))",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          <span style={{ fontSize: compact ? "2rem" : "3rem" }} role="img" aria-label={card.title}>
            {card.icon}
          </span>
          <h3
            style={{
              fontSize: compact ? "1rem" : "1.25rem",
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              margin: 0,
              textAlign: "center",
            }}
          >
            {card.title}
          </h3>
          {card.subtitle && (
            <p
              style={{
                fontSize: "0.85rem",
                color: "hsl(var(--muted-foreground))",
                margin: 0,
                textAlign: "center",
              }}
            >
              {card.subtitle}
            </p>
          )}
          {card.badge && (
            <span
              style={{
                display: "inline-block",
                padding: "0.2rem 0.75rem",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "#fff",
                background: badgeColor,
                borderRadius: "999px",
              }}
            >
              {card.badge}
            </span>
          )}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              marginTop: "0.5rem",
              width: "100%",
              maxWidth: "260px",
            }}
          >
            {Object.entries(card.frontData).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <span>{key}</span>
                <span style={{ fontWeight: 600, color: "hsl(var(--foreground))" }}>{val}</span>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "hsl(var(--muted-foreground) / 0.6)",
              marginTop: "auto",
              fontStyle: "italic",
            }}
          >
            Click to flip
          </p>
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "3px",
              borderRadius: "0 0 1rem 1rem",
              background: "#c9a227",
              opacity: 0.5,
            }}
          />
        </div>

        {/* ── BACK FACE ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: compact ? "1.25rem" : "2rem",
            borderRadius: "1rem",
            border: "2px solid color-mix(in srgb, #c9a227 50%, transparent)",
            background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--card) / 0.85))",
            boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          }}
        >
          <h4
            style={{
              fontSize: compact ? "0.9rem" : "1rem",
              fontWeight: 600,
              color: "hsl(var(--foreground))",
              margin: 0,
            }}
          >
            {card.icon} {card.title} — Details
          </h4>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.35rem",
              width: "100%",
              maxWidth: "280px",
            }}
          >
            {Object.entries(card.backData).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.8rem",
                  color: "hsl(var(--muted-foreground))",
                }}
              >
                <span>{key}</span>
                <span style={{ fontWeight: 600, color: "hsl(var(--foreground))" }}>{val}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
              marginTop: "0.75rem",
              justifyContent: "center",
            }}
          >
            {card.ctaLinks.map((cta) => (
              <button
                key={cta.href}
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(cta.href);
                }}
                style={{
                  padding: "0.4rem 1rem",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: "#faf5eb",
                  background: "#38a169",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  transition: "opacity 0.2s",
                }}
                onMouseOver={(e) => { e.currentTarget.style.opacity = "0.85"; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; }}
              >
                {cta.label}
              </button>
            ))}
          </div>
          <p
            style={{
              fontSize: "0.7rem",
              color: "hsl(var(--muted-foreground) / 0.6)",
              marginTop: "auto",
              fontStyle: "italic",
            }}
          >
            Click to flip back
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EMPTY STATE — no cards yet
// ─────────────────────────────────────────────────────────

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "3rem 1.5rem",
        textAlign: "center",
      }}
    >
      <Rocket size={48} style={{ color: "#c9a227" }} />
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))", margin: 0 }}>
        Your Helm awaits
      </h2>
      <p style={{ fontSize: "1rem", color: "hsl(var(--muted-foreground))", maxWidth: "400px", margin: 0 }}>
        Start your first project and your deck cards will appear here —
        every project, role, and badge gets its own card.
      </p>
      <button
        onClick={onStart}
        style={{
          padding: "0.75rem 2rem",
          fontSize: "1rem",
          fontWeight: 700,
          color: "#faf5eb",
          background: "#38a169",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          letterSpacing: "0.05em",
        }}
      >
        Start Your First Project →
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SLIDESHOW VIEW
// ─────────────────────────────────────────────────────────

function SlideshowView({
  cards,
  onNavigate,
}: {
  cards: HelmCard[];
  onNavigate: (href: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const count = cards.length;
  const card = cards[currentIndex];

  const prev = useCallback(() => {
    setFlippedId(null);
    setCurrentIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const next = useCallback(() => {
    setFlippedId(null);
    setCurrentIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setFlippedId(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0) prev();
        else next();
      }
      touchStartX.current = null;
    },
    [prev, next],
  );

  if (!card) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.5rem 0",
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Card area with prev/next arrows */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          width: "100%",
          maxWidth: "540px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={prev}
          aria-label="Previous card"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "hsl(var(--muted-foreground))",
            padding: "0.5rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
        >
          <ChevronLeft size={28} />
        </button>

        <DeckCardFrame
          card={card}
          flipped={flippedId === card.id}
          onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)}
          onNavigate={onNavigate}
        />

        <button
          onClick={next}
          aria-label="Next card"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "hsl(var(--muted-foreground))",
            padding: "0.5rem",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
        {cards.map((c, i) => (
          <button
            key={c.id}
            onClick={() => { setFlippedId(null); setCurrentIndex(i); }}
            aria-label={`Go to card ${i + 1}: ${c.title}`}
            style={{
              width: i === currentIndex ? "20px" : "8px",
              height: "8px",
              borderRadius: "999px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s ease",
              background: i === currentIndex ? "#c9a227" : "hsl(var(--muted-foreground) / 0.3)",
            }}
          />
        ))}
      </div>

      {/* Prev / Next text buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "420px",
          fontSize: "0.85rem",
        }}
      >
        <button
          onClick={prev}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "hsl(var(--muted-foreground))",
            fontWeight: 600,
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
        >
          ← Prev
        </button>
        <span style={{ color: "hsl(var(--muted-foreground) / 0.5)", fontSize: "0.75rem" }}>
          {currentIndex + 1} / {count}
        </span>
        <button
          onClick={next}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "hsl(var(--muted-foreground))",
            fontWeight: 600,
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "hsl(var(--foreground))"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GRID VIEW
// ─────────────────────────────────────────────────────────

function GridView({
  cards,
  onNavigate,
}: {
  cards: HelmCard[];
  onNavigate: (href: string) => void;
}) {
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "1.25rem",
        padding: "1.5rem 0",
      }}
    >
      {cards.map((card) => (
        <DeckCardFrame
          key={card.id}
          card={card}
          compact
          flipped={flippedId === card.id}
          onFlip={() => setFlippedId(flippedId === card.id ? null : card.id)}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// THE HELM — Main export
// ─────────────────────────────────────────────────────────

type ViewMode = "slideshow" | "grid";

export default function TheHelm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cards, loading } = useHelmCards();
  const [viewMode, setViewMode] = useState<ViewMode>("slideshow");
  const queryClient = useQueryClient();

  const { data: upcomingBeacons = [], isLoading: beaconsLoading } = useQuery({
    queryKey: ["helm-upcoming-viewing-beacons", user?.id],
    queryFn: () => listUpcomingViewingBeacons(user!.id, 7),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (beaconId: string) => cancelViewingBeacon(beaconId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["helm-upcoming-viewing-beacons", user?.id] });
    },
  });

  const snoozeMutation = useMutation({
    mutationFn: (beaconId: string) => {
      const target = upcomingBeacons.find((entry) => entry.id === beaconId);
      if (!target) throw new Error("Beacon not found");
      const next = new Date(target.scheduled_at);
      next.setMinutes(next.getMinutes() + 15);
      return updateViewingBeacon(beaconId, { scheduledAt: next.toISOString() });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["helm-upcoming-viewing-beacons", user?.id] });
    },
  });

  const handleNavigate = useCallback(
    (href: string) => {
      if (href.startsWith("http")) {
        window.open(href, "_blank", "noopener");
      } else {
        navigate(href);
      }
    },
    [navigate],
  );

  if (!user) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <Anchor size={40} style={{ color: "#c9a227" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
          Sign in to access Your Helm
        </h2>
        <button
          onClick={() => navigate("/join")}
          style={{
            padding: "0.75rem 2rem",
            fontSize: "1rem",
            fontWeight: 700,
            color: "#faf5eb",
            background: "#38a169",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Join / Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "hsl(var(--muted-foreground))", fontSize: "1rem" }}>
          Loading your deck...
        </div>
      </div>
    );
  }

  const hasCards = cards.length > 0;

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "2rem 1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Anchor size={24} style={{ color: "#c9a227" }} />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "hsl(var(--foreground))",
              margin: 0,
            }}
          >
            Your Helm
          </h1>
        </div>

        {hasCards && (
          <div
            style={{
              display: "flex",
              gap: "0.25rem",
              background: "hsl(var(--muted))",
              borderRadius: "0.5rem",
              padding: "0.2rem",
            }}
          >
            <button
              onClick={() => setViewMode("slideshow")}
              aria-label="Slideshow view"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: viewMode === "slideshow" ? 700 : 500,
                color: viewMode === "slideshow" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                background: viewMode === "slideshow" ? "hsl(var(--card))" : "transparent",
                border: "none",
                borderRadius: "0.35rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <GalleryHorizontal size={14} />
              Slideshow
            </button>
            <button
              onClick={() => setViewMode("grid")}
              aria-label="Grid view"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: viewMode === "grid" ? 700 : 500,
                color: viewMode === "grid" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                background: viewMode === "grid" ? "hsl(var(--card))" : "transparent",
                border: "none",
                borderRadius: "0.35rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <LayoutGrid size={14} />
              Grid
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {!hasCards ? (
        <EmptyState onStart={() => navigate("/crank-it")} />
      ) : viewMode === "slideshow" ? (
        <SlideshowView cards={cards} onNavigate={handleNavigate} />
      ) : (
        <GridView cards={cards} onNavigate={handleNavigate} />
      )}

      <div
        style={{
          marginTop: "1.5rem",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.75rem",
          padding: "1rem",
          background: "hsl(var(--card))",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginBottom: "0.75rem",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "hsl(var(--foreground))" }}>
            Scheduled Viewings
          </h2>
          <button
            type="button"
            onClick={() => navigate("/cephas/all-the-pudding")}
            style={{
              border: "1px solid hsl(var(--border))",
              background: "transparent",
              color: "hsl(var(--muted-foreground))",
              borderRadius: "0.5rem",
              padding: "0.35rem 0.7rem",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Add more
          </button>
        </div>

        {beaconsLoading ? (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "hsl(var(--muted-foreground))" }}>
            Loading upcoming beacons...
          </p>
        ) : upcomingBeacons.length === 0 ? (
          <p style={{ margin: 0, fontSize: "0.85rem", color: "hsl(var(--muted-foreground))" }}>
            No scheduled viewings in the next 7 days yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {upcomingBeacons.map((beacon) => (
              <div
                key={beacon.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.75rem",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.65rem",
                  padding: "0.65rem 0.75rem",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9rem",
                      color: "hsl(var(--foreground))",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {beacon.content_title}
                  </p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "hsl(var(--muted-foreground))" }}>
                    {new Date(beacon.scheduled_at).toLocaleString()}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(toBeaconViewLink(beacon.content_type, beacon.content_id, beacon.content_url))}
                    style={inlineActionButtonStyle("solid")}
                  >
                    View Now
                  </button>
                  <button
                    type="button"
                    onClick={() => snoozeMutation.mutate(beacon.id)}
                    disabled={snoozeMutation.isPending}
                    style={inlineActionButtonStyle("outline")}
                  >
                    Snooze
                  </button>
                  <button
                    type="button"
                    onClick={() => cancelMutation.mutate(beacon.id)}
                    disabled={cancelMutation.isPending}
                    style={inlineActionButtonStyle("danger")}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function toBeaconViewLink(contentType: string, contentId: string, contentUrl: string | null) {
  if (contentUrl) return contentUrl;
  if (contentType === "pudding" || contentType === "paper") return `/cephas/pudding/${contentId}`;
  return "/cephas/all-the-pudding";
}

function inlineActionButtonStyle(variant: "solid" | "outline" | "danger"): CSSProperties {
  if (variant === "solid") {
    return {
      border: "none",
      background: "#16a34a",
      color: "#fff",
      borderRadius: "0.45rem",
      padding: "0.3rem 0.55rem",
      fontSize: "0.74rem",
      cursor: "pointer",
      fontWeight: 600,
    };
  }

  if (variant === "danger") {
    return {
      border: "1px solid #b91c1c",
      background: "transparent",
      color: "#ef4444",
      borderRadius: "0.45rem",
      padding: "0.3rem 0.55rem",
      fontSize: "0.74rem",
      cursor: "pointer",
      fontWeight: 600,
    };
  }

  return {
    border: "1px solid hsl(var(--border))",
    background: "transparent",
    color: "hsl(var(--foreground))",
    borderRadius: "0.45rem",
    padding: "0.3rem 0.55rem",
    fontSize: "0.74rem",
    cursor: "pointer",
    fontWeight: 600,
  };
}
