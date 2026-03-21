/**
 * SCROLL FORGE PAGE
 * =================
 * Full page wrapper for the Scroll Forge component.
 * Convert Treasure Map Scrolls into Deck Cards.
 */

import { ScrollForge } from "@/components/ScrollForge";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function ScrollForgePage() {
  return (
    <PortalPageLayout>
      <ScrollForge />
    </PortalPageLayout>
  );
}
