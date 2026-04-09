/**
 * Museum Home Screen — Single card lobby.
 * The HEOHO card front IS the entire home experience.
 * All card-back content lives in submarine door routes (/enter, /watch, etc.).
 * NO nav bar. NO hamburger. Just the card + LRH FAB + Cephas FAB.
 */
import { MuseumShell } from "@/components/museum/MuseumShell";
import { HEOHOCardFront } from "@/components/museum/HEOHOCardFront";

const HomeScreen = () => {
  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 pb-24 max-w-md mx-auto">
        <HEOHOCardFront />
      </div>
    </MuseumShell>
  );
};

export default HomeScreen;
