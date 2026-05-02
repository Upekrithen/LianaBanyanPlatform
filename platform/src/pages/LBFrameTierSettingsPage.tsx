/**
 * LBFrameTierSettingsPage — KN-H5 / BP017 Three-Tier Sovereignty
 * ==============================================================
 * Route: /settings/lb-frame-tier
 * Settings page for changing LB Frame resource-config tier post-install.
 *
 * Composes LBFrameTierChange inside PortalPageLayout.
 * Access: ProtectedRoute (authenticated members only).
 *
 * data-xray-id: lb-frame-tier-settings-page
 */

import { PortalPageLayout } from "@/components/PortalPageLayout";
import { LBFrameTierChange } from "@/components/settings/LBFrameTierChange";

export default function LBFrameTierSettingsPage() {
  return (
    <PortalPageLayout>
      <div data-xray-id="lb-frame-tier-settings-page">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">LB Frame Tier Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your LB Frame resource-config tier. Tier choice is sovereign and reversible at any time.
          </p>
        </div>

        <div className="max-w-lg">
          <LBFrameTierChange />
        </div>
      </div>
    </PortalPageLayout>
  );
}
