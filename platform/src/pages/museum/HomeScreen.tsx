/**
 * Museum Home Screen — Clean single-card lobby.
 * ==============================================
 * The HEOHO card front IS the entire home experience.
 * NO dashboard controls, NO mode toggles, NO category filters.
 * Just the card + LRH FAB + Cephas FAB.
 *
 * The full dashboard (TV Screens / Theater / Deck) lives at /helm.
 * Landing page = invitation. Helm = control panel. Two different jobs.
 *
 * TourBanner shows here (on the Deck Card page) but NOT globally.
 * B093: Reverted from HelmCardDashboard to clean layout.
 */
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";
import { TourBanner } from "@/components/wildfire/TourBanner";

const HomeScreen = () => {
  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 pb-24 max-w-md mx-auto">
        <HEOHOCardFront />
      </div>
      <TourBanner />
    </MuseumShell>
  );
};

export default HomeScreen;
