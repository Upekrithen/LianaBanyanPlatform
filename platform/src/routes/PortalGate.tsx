import { detectPortal, getPortalUrl } from "@/utils/portalDetector";
import type { PortalType } from "@/utils/portalDetector";
import { useLocation } from "react-router-dom";

interface PortalGateProps {
  /** Portals that may render these children. Omit to allow all. */
  allowed?: PortalType[];
  children: React.ReactNode;
}

/**
 * Fine-grained portal gate for individual routes or sections.
 * If the current portal is not in the `allowed` list, renders a
 * friendly redirect message pointing the user to the correct domain.
 *
 * Marketplace is always allowed (it serves the full route tree).
 * If `allowed` is omitted, all portals pass through.
 */
export function PortalGate({ allowed, children }: PortalGateProps) {
  const portal = detectPortal();
  const location = useLocation();

  if (!allowed || portal === "marketplace" || allowed.includes(portal)) {
    return <>{children}</>;
  }

  const targetPortal = allowed[0] ?? "marketplace";
  const targetUrl = getPortalUrl(targetPortal, location.pathname);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h2 className="text-2xl font-bold">Different Portal</h2>
        <p className="text-muted-foreground">
          This page lives on a different Liana Banyan portal.
        </p>
        <a
          href={targetUrl}
          className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
        >
          Go to {targetPortal === "marketplace" ? "lianabanyan.com" : targetPortal}
        </a>
        <p className="text-xs text-muted-foreground/60">
          You'll be redirected to the same page on the correct portal.
        </p>
      </div>
    </div>
  );
}
