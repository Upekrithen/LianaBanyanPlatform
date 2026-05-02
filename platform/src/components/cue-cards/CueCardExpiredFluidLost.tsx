/**
 * CueCardExpiredFluidLost — First-session-open notification post-expiry (KN103/BP016)
 * Surfaces on the first session open after Pied Piper vesting expires.
 * Informs the member their fluid librarian access has reverted to brittle.
 * Per feedback_no_human_characters.md: uses LB animal/insect mascot — no human figures.
 * No data loss; AGPL substrate-baseline access preserved.
 */

import React, { useState } from "react";

export interface CueCardExpiredFluidLostProps {
  /** Called when user dismisses the notification */
  onDismiss?: () => void;
  /** Called when user navigates to send a new Cue Card */
  onSendCueCard?: () => void;
  /** Called when user navigates to join the Federation */
  onJoinFederation?: () => void;
}

export function CueCardExpiredFluidLost({
  onDismiss,
  onSendCueCard,
  onJoinFederation,
}: CueCardExpiredFluidLostProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    onDismiss?.();
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Fluid Librarian Access Expired"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 pointer-events-none"
    >
      <div className="pointer-events-auto w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-2xl p-6 space-y-4">
        {/* Mascot: lone wolf moth motif */}
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🌑</span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Fluid Librarian Access Expired
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lone Wolf mode is now active
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-700">
          Your Pied Piper fluid librarian access has expired. Your librarian is now in{" "}
          <span className="font-semibold text-amber-700">Brittle</span> mode —
          content reflects your last rebuild snapshot.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
          <p className="font-medium text-gray-700">Your options:</p>
          <p>• <strong>Send another Cue Card</strong> — re-activate fluid access for 7 more days.</p>
          <p>• <strong>Join the Federation</strong> — $5/year for permanent fluid access, Federation Scribe trade, and full cooperative membership.</p>
          <p className="text-gray-500 pt-1">Your data and AGPL substrate-baseline access are unchanged.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSendCueCard}
            className="flex-1 text-sm px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            Send a Cue Card
          </button>
          <button
            onClick={onJoinFederation}
            className="flex-1 text-sm px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Join Federation
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Dismiss — I'll re-up later
        </button>
      </div>
    </div>
  );
}

export default CueCardExpiredFluidLost;
