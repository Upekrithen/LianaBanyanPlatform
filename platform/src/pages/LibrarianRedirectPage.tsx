/**
 * LibrarianRedirectPage — Librarian.LianaBanyan.com
 * ===================================================
 * Download-detail page that lives on Librarian.LianaBanyan.com.
 *
 * Per BP005 federation canon:
 *   Librarian.LianaBanyan.com = download-detail-page
 *   → redirects to Librarian.the2ndSecond.com for the full Librarian Page.
 *
 * This page:
 *   - Shows a concise install + download detail (AGPL v3 framing)
 *   - Provides a prominent link/redirect to Librarian.the2ndSecond.com
 *   - For /medallion/:variant paths, deep-links to the same variant on the2ndSecond
 *   - Auto-redirects after 5s with countdown (Marked Exception: user can cancel)
 *
 * Tags: KN064 / BP005 (Pod Y Bean 2 Librarian Page Deployment)
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ExternalLink, ArrowRight, X } from "lucide-react";

const THE2ND_BASE = "https://Librarian.the2ndSecond.com";

/**
 * Builds the target URL on the2ndSecond, preserving /medallion/:variant path.
 */
function buildRedirectTarget(pathname: string): string {
  return `${THE2ND_BASE}${pathname}`;
}

export default function LibrarianRedirectPage() {
  const location = useLocation();
  const target = buildRedirectTarget(location.pathname);

  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (countdown <= 0) {
      window.location.replace(target);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, cancelled, target]);

  return (
    <div
      className="min-h-screen bg-background flex flex-col items-center justify-center px-4"
      data-testid="librarian-redirect-page"
    >
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">The Librarian</h1>
            <p className="text-xs text-muted-foreground">
              Librarian.LianaBanyan.com
            </p>
          </div>
          <Badge variant="outline" className="text-[10px]">AGPL v3 Free</Badge>
        </div>

        {/* Redirect notice */}
        {!cancelled ? (
          <div
            className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3"
            data-testid="redirect-countdown-box"
          >
            <p className="text-sm text-muted-foreground">
              The Librarian Page lives at{" "}
              <span className="font-semibold text-foreground font-mono">
                Librarian.the2ndSecond.com
              </span>
              . Redirecting in…
            </p>
            <p
              className="text-5xl font-bold text-primary"
              data-testid="redirect-countdown"
            >
              {countdown}
            </p>
            <div className="flex gap-2 justify-center">
              <a
                href={target}
                rel="noopener noreferrer"
                data-testid="redirect-go-now"
              >
                <Button size="sm">
                  <ArrowRight className="w-3 h-3 mr-1.5" />
                  Go Now
                </Button>
              </a>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCancelled(true)}
                data-testid="redirect-cancel"
              >
                <X className="w-3 h-3 mr-1.5" />
                Stay Here
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl border border-border/60 p-5 space-y-3"
            data-testid="redirect-cancelled-box"
          >
            <p className="text-sm text-muted-foreground">
              Redirect cancelled. Click below to visit the full Librarian Page.
            </p>
            <a
              href={target}
              rel="noopener noreferrer"
              data-testid="redirect-manual-link"
            >
              <Button>
                <ExternalLink className="w-3 h-3 mr-1.5" />
                Open Librarian.the2ndSecond.com
              </Button>
            </a>
          </div>
        )}

        {/* Install shortcut */}
        <div className="text-xs text-muted-foreground/60 space-y-2">
          <p className="font-mono bg-muted rounded px-2 py-1 inline-block">
            pip install librarian-mcp
          </p>
          <p>
            AGPL v3 · Full-version · No gating · No signup required
          </p>
        </div>
      </div>
    </div>
  );
}
