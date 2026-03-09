/**
 * SCROLL FORGE PAGE
 * =================
 * Full page wrapper for the Scroll Forge component.
 * Convert Treasure Map Scrolls into Deck Cards.
 */

import { ScrollForge } from "@/components/ScrollForge";

export default function ScrollForgePage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <ScrollForge />
    </div>
  );
}
