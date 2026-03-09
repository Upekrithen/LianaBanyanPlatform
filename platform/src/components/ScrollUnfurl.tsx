/**
 * SCROLL UNFURL — Parchment Reveal Animation Component
 * =====================================================
 * Creates the effect of an ancient scroll unfurling to reveal content.
 * Used for dramatic reveals, announcements, and important information.
 *
 * Features:
 * - Realistic scroll texture and shadows
 * - Smooth unfurl animation with easing
 * - Content fade-in as scroll opens
 * - Multiple variants (royal, ancient, compact)
 * - Auto-open on mount or trigger-based
 */

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import "./ScrollUnfurl.css";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ScrollUnfurlProps {
  children: React.ReactNode;
  variant?: "default" | "royal" | "ancient" | "compact";
  autoOpen?: boolean;
  autoOpenDelay?: number;
  isOpen?: boolean;
  onOpenComplete?: () => void;
  onCloseComplete?: () => void;
  shimmer?: boolean;
  pulse?: boolean;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ScrollUnfurl({
  children,
  variant = "default",
  autoOpen = false,
  autoOpenDelay = 500,
  isOpen: controlledOpen,
  onOpenComplete,
  onCloseComplete,
  shimmer = false,
  pulse = false,
  className,
}: ScrollUnfurlProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    if (autoOpen && !isControlled) {
      timeoutRef.current = setTimeout(() => {
        setInternalOpen(true);
      }, autoOpenDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoOpen, autoOpenDelay, isControlled]);

  useEffect(() => {
    if (isOpen && onOpenComplete) {
      const timer = setTimeout(onOpenComplete, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onOpenComplete]);

  useEffect(() => {
    if (!isOpen && isClosing && onCloseComplete) {
      const timer = setTimeout(() => {
        setIsClosing(false);
        onCloseComplete();
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isClosing, onCloseComplete]);

  const handleClose = () => {
    if (!isControlled) {
      setIsClosing(true);
      setInternalOpen(false);
    }
  };

  const variantClass = variant !== "default" ? `scroll-unfurl--${variant}` : "";

  return (
    <div
      className={cn(
        "scroll-unfurl",
        variantClass,
        isOpen && "scroll-unfurl--open",
        isClosing && "scroll-unfurl--closing",
        shimmer && "scroll-unfurl--shimmer",
        pulse && "scroll-unfurl--pulse",
        className
      )}
    >
      {/* Top rod */}
      <div className="scroll-unfurl__rod scroll-unfurl__rod--top" />

      {/* Scroll body */}
      <div className="scroll-unfurl__body">
        <div className="scroll-unfurl__content">{children}</div>
      </div>

      {/* Bottom rod */}
      <div className="scroll-unfurl__rod scroll-unfurl__rod--bottom" />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL ANNOUNCEMENT — Pre-styled scroll for announcements
// ═══════════════════════════════════════════════════════════════════════════════

interface ScrollAnnouncementProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "default" | "royal" | "ancient";
  autoOpen?: boolean;
}

export function ScrollAnnouncement({
  title,
  subtitle,
  children,
  variant = "royal",
  autoOpen = true,
}: ScrollAnnouncementProps) {
  return (
    <ScrollUnfurl variant={variant} autoOpen={autoOpen} pulse>
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold tracking-wide">{title}</h2>
        {subtitle && (
          <p className="text-sm uppercase tracking-widest opacity-70">{subtitle}</p>
        )}
        <div className="border-t border-current/20 pt-4">{children}</div>
      </div>
    </ScrollUnfurl>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL REVEAL — Triggered reveal for important content
// ═══════════════════════════════════════════════════════════════════════════════

interface ScrollRevealProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "royal" | "ancient" | "compact";
}

export function ScrollReveal({
  trigger,
  children,
  variant = "default",
}: ScrollRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      <ScrollUnfurl variant={variant} isOpen={isOpen}>
        {children}
      </ScrollUnfurl>
    </div>
  );
}

export default ScrollUnfurl;
