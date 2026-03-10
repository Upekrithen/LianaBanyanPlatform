import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, X, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { getVisitCount } from "@/lib/welcomeGateContent";

const DISMISS_KEY = "pwa_install_dismissed_until";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (not 24 hours — respect their time)
const MIN_VISITS_BEFORE_PROMPT = 4; // "third or fourth date"

function isDismissedUntilExpired(): boolean {
  const dismissedUntil = localStorage.getItem(DISMISS_KEY);
  if (!dismissedUntil) return false;

  const dismissedUntilTime = parseInt(dismissedUntil, 10);
  if (isNaN(dismissedUntilTime)) return false;

  return Date.now() < dismissedUntilTime;
}

function setDismissedUntil(): void {
  const dismissUntil = Date.now() + DISMISS_DURATION_MS;
  localStorage.setItem(DISMISS_KEY, dismissUntil.toString());
}

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Three gates: enough visits? Not dismissed? Installable?
    const visitCount = getVisitCount();
    const notDismissed = !isDismissedUntilExpired();
    const enoughVisits = visitCount >= MIN_VISITS_BEFORE_PROMPT;

    setShouldShow(notDismissed && enoughVisits);
  }, []);

  const handleDismiss = () => {
    setDismissedUntil();
    setDismissed(true);
  };

  if (!isInstallable || dismissed || !shouldShow) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm md:w-96 mx-4 md:mx-0 z-50 shadow-lg animate-in slide-in-from-bottom-5 border-green-500/20">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 md:h-6 md:w-6 touch-manipulation"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
        <CardTitle className="flex items-center gap-2 text-lg pr-8">
          <Zap className="h-5 w-5 flex-shrink-0 text-green-500" />
          Add Shortcut
        </CardTitle>
        <CardDescription className="text-sm">
          This adds a home screen shortcut so the site loads instantly.{" "}
          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
            <Shield className="h-3.5 w-3.5" />
            No data collected. No tracking. Just faster access.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="text-sm text-muted-foreground space-y-1.5">
          <p>✓ Loads instantly — no browser startup delay</p>
          <p>✓ Works offline for pages you've visited</p>
          <p>✓ Takes nothing, records nothing, just speed</p>
          <p>✓ Remove anytime from your home screen</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={installApp}
            className="flex-1 h-11 md:h-10 touch-manipulation text-base md:text-sm bg-green-600 hover:bg-green-500"
          >
            Add Shortcut
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex-1 h-11 md:h-10 touch-manipulation text-base md:text-sm"
          >
            Not Now
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground">
          Won't ask again for a week
        </p>
      </CardContent>
    </Card>
  );
}
