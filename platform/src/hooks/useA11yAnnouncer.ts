/**
 * useA11yAnnouncer -- Wave 16 / AAA accessibility
 * =================================================
 * Provides a programmatic way to announce dynamic content changes to
 * screen readers via the platform-wide #lb-sr-announcer aria-live region.
 *
 * Usage:
 *   const { announce } = useA11yAnnouncer();
 *   announce("Marks balance updated: 42 units");
 *   announce("Vote cast successfully for Proposal #3", "assertive");
 *
 * The announcer element (#lb-sr-announcer) is rendered by AppShell with
 * role="status" aria-live="polite". This hook drives it imperatively
 * without needing a shared state layer.
 *
 * SC 4.1.3 Status Messages -- live regions for dynamic UI feedback.
 * BP073-W16 / AAA
 */

import { useCallback, useRef } from "react";

type AriaLivePoliteness = "polite" | "assertive";

function announceToRegion(message: string, politeness: AriaLivePoliteness) {
  const el = document.getElementById("lb-sr-announcer");
  if (!el) return;

  // Temporarily switch politeness if assertive needed
  if (politeness === "assertive") {
    el.setAttribute("aria-live", "assertive");
  }

  // Clear then set forces a11y tree to re-announce even identical text
  el.textContent = "";
  requestAnimationFrame(() => {
    el.textContent = message;
    // Restore polite after assertive announcement
    if (politeness === "assertive") {
      setTimeout(() => {
        el.setAttribute("aria-live", "polite");
      }, 1000);
    }
  });
}

export function useA11yAnnouncer() {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  /**
   * Announce a message to screen readers.
   * @param message - The message string to announce
   * @param politeness - "polite" (default) or "assertive" (interrupts current speech)
   * @param delay - Debounce delay in ms (default 150ms, prevents rapid-fire announcements)
   */
  const announce = useCallback(
    (
      message: string,
      politeness: AriaLivePoliteness = "polite",
      delay = 150,
    ) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        announceToRegion(message, politeness);
      }, delay);
    },
    [],
  );

  return { announce };
}
