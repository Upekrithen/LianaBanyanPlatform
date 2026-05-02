/**
 * CueCardExpiringWarning — Non-blocking notification overlay (KN103/BP016)
 * Fires when vesting state is "expiring_warning" (within 24h of expiry).
 * Per feedback_no_human_characters.md: uses LB animal/insect mascot — no human figures.
 * Fluid access stays active during the 24h grace window.
 */

import React, { useState } from "react";

export interface CueCardExpiringWarningProps {
  hoursUntilExpiry: number;
  /** Called when user dismisses the warning */
  onDismiss?: () => void;
  /** Called when user navigates to send a new Cue Card */
  onSendCueCard?: () => void;
  /** Called when user navigates to join the Federation */
  onJoinFederation?: () => void;
}

export function CueCardExpiringWarning({
  hoursUntilExpiry,
  onDismiss,
  onSendCueCard,
  onJoinFederation,
}: CueCardExpiringWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const hoursDisplay = Math.max(0, Math.floor(hoursUntilExpiry));

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-amber-50 border border-amber-300 rounded-lg shadow-lg p-4 flex gap-3"
    >
      {/* Mascot: firefly SVG (LB insect motif) */}
      <div className="flex-shrink-0 mt-0.5 text-amber-500 text-2xl" aria-hidden="true">
        ✦
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-800">
          Fluid Librarian Expiring in {hoursDisplay}h
        </p>
        <p className="text-xs text-amber-700 mt-1">
          Your Pied Piper fluid librarian access expires soon.
          Send another Cue Card to re-up for 7 days, or join the Federation for permanent fluid access.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={onSendCueCard}
            className="text-xs px-3 py-1.5 rounded bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
          >
            Send Cue Card
          </button>
          <button
            onClick={onJoinFederation}
            className="text-xs px-3 py-1.5 rounded bg-white border border-amber-400 text-amber-800 font-medium hover:bg-amber-50 transition-colors"
          >
            Join Federation
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

export default CueCardExpiringWarning;
