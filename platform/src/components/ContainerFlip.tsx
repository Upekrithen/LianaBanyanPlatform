/**
 * ContainerFlip — Reusable container-level 3D flip card
 * ======================================================
 * Clicking a sub-topic on the FRONT flips the ENTIRE container
 * to show deep-dive content for that specific topic on the BACK.
 *
 * Progressive depth on back:
 *   1. Quick Facts (always visible)
 *   2. "Want more?" → reveals intermediate content
 *   3. "Go Deeper" → links to Crow's Nest item or Cephas page
 *
 * Click anywhere on back or "Go Back" button to flip to front.
 * Escape key also flips back. Full keyboard/touch support.
 */

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronDown, ExternalLink } from "lucide-react";

// ── Types ──

export interface FlipTopic {
  /** Title shown on the back header */
  title: string;
  /** Lucide icon component */
  icon: React.ElementType;
  /** Always shown on back — the "Quick Facts" level */
  quickFacts: string;
  /** Revealed by "Want more?" — intermediate depth */
  intermediate?: string;
  /** "Go Deeper" navigation link */
  deepLink?: {
    label: string;
    route?: string;
    externalUrl?: string;
  };
}

export interface ContainerFlipProps {
  /** The normal front-face content (rendered as-is) */
  frontContent: React.ReactNode;
  /** Back content indexed by topic — user clicks sub-items on front to select */
  topics: FlipTopic[];
  /** Optional className for the outer container */
  className?: string;
  /** Optional: extra content shown on back below topic (e.g., a CTA button) */
  backFooter?: React.ReactNode;
}

// ── Component ──

export function ContainerFlip({
  frontContent,
  topics,
  className = "",
  backFooter,
}: ContainerFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const [showIntermediate, setShowIntermediate] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Flip to a specific topic
  const flipToTopic = useCallback((index: number) => {
    setActiveTopicIndex(index);
    setShowIntermediate(false);
    setIsFlipped(true);
  }, []);

  // Flip back to front
  const flipBack = useCallback(() => {
    setIsFlipped(false);
    setShowIntermediate(false);
    // Reset active topic after animation completes
    setTimeout(() => setActiveTopicIndex(null), 700);
  }, []);

  // Keyboard: Escape flips back
  useEffect(() => {
    if (!isFlipped) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        flipBack();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isFlipped, flipBack]);

  const activeTopic = activeTopicIndex !== null ? topics[activeTopicIndex] : null;

  const handleDeepLink = useCallback(() => {
    if (!activeTopic?.deepLink) return;
    if (activeTopic.deepLink.route) {
      navigate(activeTopic.deepLink.route);
    } else if (activeTopic.deepLink.externalUrl) {
      window.open(activeTopic.deepLink.externalUrl, "_blank", "noopener,noreferrer");
    }
  }, [activeTopic, navigate]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ perspective: "1200px" }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ═══ FRONT FACE ═══ */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            position: "relative",
            width: "100%",
            height: "100%",
          }}
        >
          {frontContent}
        </div>

        {/* ═══ BACK FACE ═══ */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "auto",
            cursor: "pointer",
          }}
          role="region"
          aria-label={activeTopic ? `Details: ${activeTopic.title} — click anywhere to go back` : "Card back"}
          onClick={flipBack}
          tabIndex={isFlipped ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flipBack();
            }
          }}
        >
          {activeTopic && (
            <div className="h-full rounded-lg border-2 bg-card shadow-md p-5 flex flex-col">
              {/* Back header */}
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 -ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    flipBack();
                  }}
                  aria-label="Go back to front"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Go Back
                </Button>
                <div className="flex items-center gap-2">
                  {activeTopic.icon && (
                    <activeTopic.icon className="h-5 w-5 text-primary" />
                  )}
                  <h3 className="font-bold text-base">{activeTopic.title}</h3>
                </div>
              </div>

              {/* Quick Facts — always visible */}
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Quick Facts
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {activeTopic.quickFacts}
                </p>
              </div>

              {/* "Want more?" progressive reveal */}
              {activeTopic.intermediate && !showIntermediate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 w-fit mb-3 text-primary hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowIntermediate(true);
                  }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Want more?
                </Button>
              )}

              {showIntermediate && activeTopic.intermediate && (
                <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Deeper Look
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeTopic.intermediate}
                  </p>
                </div>
              )}

              {/* "Go Deeper" link */}
              {activeTopic.deepLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 w-fit mt-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeepLink();
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                  {activeTopic.deepLink.label}
                </Button>
              )}

              {/* Optional footer content (e.g., CTA button) */}
              {backFooter && (
                <div className="mt-4 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  {backFooter}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper: creates an onClick handler for sub-items in frontContent
 * that triggers the container flip to a specific topic index.
 *
 * Usage in frontContent:
 *   <div onClick={createFlipTrigger(0)}>1. Get Free STLs</div>
 *   <div onClick={createFlipTrigger(1)}>2. Print & Test</div>
 *
 * Since the ContainerFlip manages state internally, we expose
 * the flipToTopic via a context or by passing it as a render prop.
 */

// ── Render-Prop Variant for more control ──

export interface ContainerFlipRenderProps {
  flipToTopic: (index: number) => void;
  isFlipped: boolean;
  activeTopicIndex: number | null;
}

export interface ContainerFlipControlledProps {
  /** Render prop for front content — receives flipToTopic trigger */
  renderFront: (props: ContainerFlipRenderProps) => React.ReactNode;
  /** Back content indexed by topic */
  topics: FlipTopic[];
  /** Optional className */
  className?: string;
  /** Optional back footer */
  backFooter?: React.ReactNode;
}

export function ContainerFlipControlled({
  renderFront,
  topics,
  className = "",
  backFooter,
}: ContainerFlipControlledProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeTopicIndex, setActiveTopicIndex] = useState<number | null>(null);
  const [showIntermediate, setShowIntermediate] = useState(false);
  const navigate = useNavigate();

  const flipToTopic = useCallback((index: number) => {
    setActiveTopicIndex(index);
    setShowIntermediate(false);
    setIsFlipped(true);
  }, []);

  const flipBack = useCallback(() => {
    setIsFlipped(false);
    setShowIntermediate(false);
    setTimeout(() => setActiveTopicIndex(null), 700);
  }, []);

  useEffect(() => {
    if (!isFlipped) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        flipBack();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isFlipped, flipBack]);

  const activeTopic = activeTopicIndex !== null ? topics[activeTopicIndex] : null;

  const handleDeepLink = useCallback(() => {
    if (!activeTopic?.deepLink) return;
    if (activeTopic.deepLink.route) {
      navigate(activeTopic.deepLink.route);
    } else if (activeTopic.deepLink.externalUrl) {
      window.open(activeTopic.deepLink.externalUrl, "_blank", "noopener,noreferrer");
    }
  }, [activeTopic, navigate]);

  const renderProps: ContainerFlipRenderProps = {
    flipToTopic,
    isFlipped,
    activeTopicIndex,
  };

  return (
    <div className={className} style={{ perspective: "1200px" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* FRONT */}
        <div style={{ backfaceVisibility: "hidden", position: "relative", width: "100%", height: "100%" }}>
          {renderFront(renderProps)}
        </div>

        {/* BACK */}
        <div
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            overflow: "auto",
            cursor: "pointer",
          }}
          role="region"
          aria-label={activeTopic ? `Details: ${activeTopic.title} — click anywhere to go back` : "Card back"}
          onClick={flipBack}
          tabIndex={isFlipped ? 0 : -1}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              flipBack();
            }
          }}
        >
          {activeTopic && (
            <div className="h-full rounded-lg border-2 bg-card shadow-md p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 -ml-2"
                  onClick={(e) => { e.stopPropagation(); flipBack(); }}
                  aria-label="Go back to front"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Go Back
                </Button>
                <div className="flex items-center gap-2">
                  {activeTopic.icon && <activeTopic.icon className="h-5 w-5 text-primary" />}
                  <h3 className="font-bold text-base">{activeTopic.title}</h3>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Quick Facts
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  {activeTopic.quickFacts}
                </p>
              </div>

              {activeTopic.intermediate && !showIntermediate && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 w-fit mb-3 text-primary hover:text-primary"
                  onClick={(e) => { e.stopPropagation(); setShowIntermediate(true); }}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Want more?
                </Button>
              )}

              {showIntermediate && activeTopic.intermediate && (
                <div className="mb-4 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Deeper Look
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activeTopic.intermediate}
                  </p>
                </div>
              )}

              {activeTopic.deepLink && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 w-fit mt-auto"
                  onClick={(e) => { e.stopPropagation(); handleDeepLink(); }}
                >
                  <ExternalLink className="h-3 w-3" />
                  {activeTopic.deepLink.label}
                </Button>
              )}

              {backFooter && (
                <div className="mt-4 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  {backFooter}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
