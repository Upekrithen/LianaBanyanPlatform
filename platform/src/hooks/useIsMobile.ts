/**
 * useIsMobile — Clean media-query-based mobile detection.
 *
 * Uses matchMedia (not user-agent sniffing) for reliability.
 * Breakpoint at 768px matches Tailwind's md: breakpoint.
 */

import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    // Set initial value from media query (more reliable than innerWidth)
    setIsMobile(mql.matches);

    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}
