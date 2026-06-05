/**
 * PlatformFooter — Global footer for Liana Banyan Platform
 * =========================================================
 * Legal requirement: copyright, privacy, terms, contact.
 * Also: suggestion box trigger, developer info, motto.
 *
 * Appears on ALL pages (clean + authenticated shells).
 * Pages needing no footer (e.g., full-screen games) can
 * conditionally hide it via the `hideFooter` prop.
 *
 * SEC-safe: No speculative-finance or ownership-claim language.
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MessageSquarePlus, ExternalLink, Code2, Heart, Shield } from "lucide-react";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { useCanonicalStats } from '@/hooks/useCanonicalStats';

// Pages where footer is hidden (immersive experiences)
const HIDE_FOOTER_ROUTES = [
  "/",
  "/hexisle-game",
  "/treasure-map-game",
  "/52-cards",
  "/card-hunt",
  "/golden-key",
  "/durins-door",
  "/door",
];

export function PlatformFooter() {
  const location = useLocation();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const canonical = useCanonicalStats();

  // Hide on immersive routes
  const shouldHide = HIDE_FOOTER_ROUTES.some(r =>
    location.pathname === r || location.pathname.startsWith(r + "/")
  );
  if (shouldHide) return null;

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="w-full border-t bg-card/80 backdrop-blur-sm mt-auto">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Column 1: Brand + Motto */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm tracking-wide uppercase text-foreground">
                Liana Banyan
              </h3>
              <p className="text-sm text-muted-foreground italic">
                "Help each other, Help ourselves."
              </p>
              <p className="text-xs text-muted-foreground">
                Liana Banyan Corporation
              </p>
            </div>

            {/* Column 2: Platform */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm tracking-wide uppercase text-foreground">
                Platform
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/economics" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Economic Model
                  </Link>
                </li>
                <li>
                  <Link to="/patent-portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Patent Portfolio
                  </Link>
                </li>
                <li>
                  <Link to="/fly-on-the-wall" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Transparency Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/crows-nest" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    The Crow's Nest
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm tracking-wide uppercase text-foreground">
                Legal
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <a
                    href="/cephas"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 py-2 touch-manipulation"
                  >
                    Cephas Archive
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <Link to="/governance" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Governance (The 300)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Community */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm tracking-wide uppercase text-foreground">
                Community
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/help-wanted" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Help Wanted (Bounties)
                  </Link>
                </li>
                <li>
                  <Link to="/arena" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Design Arena
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 py-2 touch-manipulation"
                  >
                    <MessageSquarePlus className="h-3.5 w-3.5" />
                    Suggestion Box
                  </button>
                </li>
                <li>
                  <Link to="/developers" className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 py-2 touch-manipulation">
                    <Code2 className="h-3.5 w-3.5" />
                    Developers
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-2 touch-manipulation">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t mt-8 pt-6 flex flex-col items-center gap-3 text-center sm:text-left sm:flex-row sm:justify-between sm:gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground max-w-full">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="break-words">{canonical.patentClaims.toLocaleString()} patent claims · {canonical.innovationCount.toLocaleString()} innovations</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Service sponsorship, not securities
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>&copy; {currentYear} Liana Banyan Corporation</span>
              <Heart className="h-3 w-3 text-red-400 shrink-0" />
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback Dialog */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
