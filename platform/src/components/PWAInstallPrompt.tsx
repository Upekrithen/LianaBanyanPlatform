import { usePWA } from "@/hooks/usePWA";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { useState } from "react";
import { detectPortal } from "@/utils/portalDetector";

const portalContent = {
  marketplace: {
    title: "Install Marketplace",
    description: "Browse projects, vote on products, and track your portfolio",
    features: [
      "✓ Discover new projects",
      "✓ Vote on production levels",
      "✓ Track investments offline",
      "✓ Get update notifications"
    ]
  },
  business: {
    title: "Install Business Portal",
    description: "Manage positions, contracts, and business operations on the go",
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
    features: [
      "✓ Monitor production schedules",
      "✓ Manage API credentials",
      "✓ Track supply chain status",
      "✓ Secure offline access"
    ]
  }
};

export function PWAInstallPrompt() {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  const portal = detectPortal();
  const content = portalContent[portal];

  if (!isInstallable || dismissed) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-full max-w-sm md:w-96 mx-4 md:mx-0 z-50 shadow-lg animate-in slide-in-from-bottom-5">
      <CardHeader className="relative pb-3">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 md:h-6 md:w-6 touch-manipulation"
          onClick={() => setDismissed(true)}
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
        <CardTitle className="flex items-center gap-2 text-lg pr-8">
          <Download className="h-5 w-5 flex-shrink-0" />
          {content.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {content.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="text-sm text-muted-foreground space-y-1.5">
          {content.features.map((feature, idx) => (
            <p key={idx}>{feature}</p>
          ))}
        </div>
        <Button 
          onClick={installApp} 
          className="w-full h-11 md:h-10 touch-manipulation text-base md:text-sm"
        >
          Install Now
        </Button>
      </CardContent>
    </Card>
  );
}
