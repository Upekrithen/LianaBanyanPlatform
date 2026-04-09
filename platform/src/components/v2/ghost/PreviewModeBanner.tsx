import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SESSION_KEY = "ghost-browse-preview-banner-dismissed";

export function PreviewModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setDismissed(window.sessionStorage.getItem(SESSION_KEY) === "true");
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "true");
    }
  };

  if (dismissed) return null;

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium">
          <Eye className="h-3.5 w-3.5" />
          <span>Preview mode</span>
        </div>
        <p className="hidden text-xs text-muted-foreground sm:block">
          You can inspect content now. Membership is only required at action thresholds.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-muted-foreground"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Dismiss preview mode banner</span>
        </Button>
      </div>
    </div>
  );
}
