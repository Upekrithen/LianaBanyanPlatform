/**
 * HelmPage — Your personal card dashboard.
 * ==========================================
 * Innovation #2236 (Crown Jewel #209). B093.
 * + Innovation #2235 Triple Double Motivation Panel. K403 / B096.
 *
 * Desktop: Grid of card frames surrounding the HEOHO hero card (TV Screens).
 * Mobile: Shuffleable deck — swipe through cards one at a time.
 * Theater: One card fills the full display.
 *
 * Triple Double panel sits above the card dashboard — the daily ritual
 * and ladder that drives member motivation.
 *
 * Route: /helm
 */
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";
import { HelmCardDashboard } from "@/components/museum/HelmCardDashboard";
import { TripleDoublePanel } from "@/components/museum/TripleDoublePanel";

const HelmPage = () => {
  return (
    <MuseumShell>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <TripleDoublePanel />
      </div>
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
