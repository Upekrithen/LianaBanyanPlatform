/**
 * HEXISLE OVERWORLD PAGE
 * ======================
 * Page wrapper for the 2D Mario World-style overworld.
 * Route: /hexisle/overworld
 *
 * Wraps all required context providers around the overworld canvas
 * and HUD overlay components.
 *
 * Provider stack:
 *   OverworldNavigationProvider → PipePortalProvider → CanalAccessProvider
 *     → OverworldCanvas + OverworldHUD + OverworldMinimap
 *       + OverworldPipeTransit + OverworldGondola + ViewPhaseSwitcher
 */

import { OverworldNavigationProvider } from "@/contexts/OverworldNavigationContext";
import { PipePortalProvider } from "@/contexts/PipePortalContext";
import { CanalAccessProvider } from "@/contexts/CanalAccessContext";
import { OverworldCanvas } from "@/components/hexisle/overworld/OverworldCanvas";
import { OverworldHUD } from "@/components/hexisle/overworld/OverworldHUD";
import { OverworldMinimap } from "@/components/hexisle/overworld/OverworldMinimap";
import { OverworldPipeTransit } from "@/components/hexisle/overworld/OverworldPipeTransit";
import { OverworldGondola } from "@/components/hexisle/overworld/OverworldGondola";
import { ViewPhaseSwitcher } from "@/components/hexisle/ViewPhaseSwitcher";
import { PortalPageLayout } from '@/components/PortalPageLayout';

export default function HexIsleOverworld() {
  return (
    <PortalPageLayout>
    <OverworldNavigationProvider>
      <PipePortalProvider>
        <CanalAccessProvider>
          <div className="relative w-full h-screen bg-[#0a1628] overflow-hidden">
            {/* Canvas: full-screen hex grid renderer */}
            <OverworldCanvas />

            {/* HUD: navigation controls, location info */}
            <OverworldHUD />

            {/* Minimap: island chain overview */}
            <OverworldMinimap />

            {/* Pipe transit: full-screen animation on pipe entry */}
            <OverworldPipeTransit />

            {/* Gondola: canal quarter info when in canal area */}
            <OverworldGondola />

            {/* View Phase Switcher (Portals / 2D / 3D) */}
            <ViewPhaseSwitcher />
          </div>
        </CanalAccessProvider>
      </PipePortalProvider>
    </OverworldNavigationProvider>
    </PortalPageLayout>
  );
}
