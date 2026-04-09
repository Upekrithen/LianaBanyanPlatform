/**
 * BetaBanner — Preview notice shown ONLY on landing/welcome pages.
 * Two actions: "Show Me How" (links to guided tour/feedback) + close button.
 * Once dismissed, stays dismissed (localStorage).
 */

import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function BetaBanner() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem("lb_beta_dismissed") === "1"
  );

  const landingPaths = ["/", "/welcome", "/cold-start"];
  const isLandingPage = landingPaths.includes(location.pathname);

  if (dismissed || !isLandingPage) return null;

  const dismiss = () => {
    localStorage.setItem("lb_beta_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-center text-sm text-amber-800 flex items-center justify-center gap-3 relative">
      <span>
        <strong>FEEDBACK REQUESTED</strong> — You're exploring a live alpha preview. We need YOUR feedback.
      </span>
      <button
        onClick={() => {
          dismiss();
          window.dispatchEvent(new Event('lb-guided-tour-open'));
        }}
        className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
      >
        Show Me How
      </button>
      <button
        onClick={dismiss}
        className="text-amber-500 hover:text-amber-700 p-1"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
