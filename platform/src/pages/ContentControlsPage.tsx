/**
 * CONTENT CONTROLS PAGE
 * =====================
 * Route: /content-controls
 *
 * Combines the Shirley Temple Policy vertical rating display
 * with the Imgur-inspired horizontal topic filtering.
 * Also includes the 60/30/10 Progressive Disclosure guide.
 *
 * This is a settings page — ProtectedRoute required.
 */

import ContentControlsPanel from "@/components/ContentControlsPanel";
import { DisclosureGuidePanel } from "@/components/ProgressiveDisclosureGuide";
import { Separator } from "@/components/ui/separator";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ContentControlsPage() {
  return (
    <PortalPageLayout maxWidth="md" xrayId="content-controls">
      <div className="space-y-8 pb-12">
        {/* Topic-based content filtering (horizontal layer) */}
        <ContentControlsPanel />

        <div className="container mx-auto max-w-3xl">
          <Separator className="my-2" />
        </div>

        {/* Progressive Disclosure (60/30/10 learning guide) */}
        <div className="container mx-auto max-w-3xl">
          <DisclosureGuidePanel />
        </div>
      </div>
    </PortalPageLayout>
  );
}
