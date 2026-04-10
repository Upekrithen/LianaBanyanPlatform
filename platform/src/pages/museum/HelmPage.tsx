/**
 * HelmPage — Your personal card dashboard.
 * ==========================================
 * Innovation #2236 (Crown Jewel #209). B093.
 *
 * Desktop: Grid of card frames surrounding the HEOHO hero card (TV Screens).
 * Mobile: Shuffleable deck — swipe through cards one at a time.
 * Theater: One card fills the full display.
 *
 * This is the HELM — your control panel. Distinct from HomeScreen (/)
 * which is a clean single-card landing page.
 *
 * Route: /helm
 */
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";
import { HelmCardDashboard } from "@/components/museum/HelmCardDashboard";

const HelmPage = () => {
  return (
    <MuseumShell>
      <HelmCardDashboard
        heroContent={
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
            <HEOHOCardFront />
          </div>
        }
        keepTier={1}
      />
    </MuseumShell>
  );
};

export default HelmPage;
