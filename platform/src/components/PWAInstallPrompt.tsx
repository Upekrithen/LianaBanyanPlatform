import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X, Ghost } from "lucide-react";
import { useState, useEffect } from "react";
import { detectPortal } from "@/utils/portalDetector";

const DISMISS_KEY = "pwa_install_dismissed_until";
const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const portalContent = {
  marketplace: {
    title: "Install Liana Banyan",
    description: "Browse initiatives, discover opportunities, and track your progress",
    ghostBonus: "for 500 Ghost Credits",
    features: [
      "✓ Explore all 16 initiatives",
      "✓ Find jobs and bounties",
      "✓ Track your portfolio offline",
      "✓ Get update notifications"
    ]
  },
  business: {
    title: "Install Business Portal",
    description: "Manage positions, contracts, and business operations on the go",
    ghostBonus: "for 500 Ghost Credits",
    features: [
      "✓ Apply for positions offline",
      "✓ Track contract status",
      "✓ Manage your applications",
      "✓ Instant notifications"
    ]
  },
  nonprofit: {
    title: "Install Non-Profit Portal",
    description: "Access fund management and member benefits anywhere",
    ghostBonus: "for 500 Ghost Credits",
    features: [
      "✓ Track funding pool status",
      "✓ Manage member benefits",
      "✓ Review loan applications",
      "✓ Offline access to data"
    ]
  },
  network: {
    title: "Install Network Portal",
    description: "B2B operations and API management on the go",
    ghostBonus: "for 500 Ghost Credits",
    features: [
      "✓ Monitor production schedules",
      "✓ Manage API credentials",
      "✓ Track supply chain status",
      "✓ Secure offline access"
    ]
  }
};

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
  const [initiallyDismissed, setInitiallyDismissed] = useState(true);
  const portal = detectPortal();
  const content = portalContent[portal];

  useEffect(() => {
    // Check if user previously dismissed and it hasn't expired
    const shouldHide = isDismissedUntilExpired();
    setInitiallyDismissed(shouldHide);
  }, []);

  const handleDismiss = () => {
    setDismissedUntil();
    setDismissed(true);
  };

  if (!isInstallable || dismissed || initiallyDismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm md:w-96 mx-4 md:mx-0 z-50 shadow-lg animate-in slide-in-from-bottom-5">
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
          <Download className="h-5 w-5 flex-shrink-0" />
          {content.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {content.description}{" "}
          <span className="inline-flex items-center gap-1 text-primary font-medium">
            <Ghost className="h-3.5 w-3.5" />
            {content.ghostBonus}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="text-sm text-muted-foreground space-y-1.5">
          {content.features.map((feature, idx) => (
            <p key={idx}>{feature}</p>
          ))}
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={installApp} 
            className="flex-1 h-11 md:h-10 touch-manipulation text-base md:text-sm"
          >
            Install Now
          </Button>
          <Button 
            variant="outline"
            onClick={handleDismiss} 
            className="flex-1 h-11 md:h-10 touch-manipulation text-base md:text-sm"
          >
            Ask Me Later
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground">
          Won't ask again for 24 hours
        </p>
      </CardContent>
    </Card>
  );
}
