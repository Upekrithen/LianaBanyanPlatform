/**
 * MuseumApp — Clean 3-door new visitor experience
 * ================================================
 * Portal #8: museum.lianabanyan.com / localhost:5180
 *
 * NO AppShell, NO sidebar, NO nav bar. Full-screen immersive pages.
 * Three doors: "What is this?" / "I want to build" / "I'm ready"
 * Plus: LRH mascot FAB, Cephas library basement, QR entry.
 *
 * Introduced B089.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import { XRayProvider } from "./components/museum/XRayContext";
import { ArchipelagoTourProvider } from "./contexts/ArchipelagoTourContext";
import { TourBanner } from "./components/wildfire/TourBanner";
import { TourCompletionModal } from "./components/wildfire/TourCompletionModal";
import { SummonFloatingAlert } from "./components/museum/DMSummonPanel";

const HomeScreen = lazy(() => import("./pages/museum/HomeScreen"));
const EnterDoors = lazy(() => import("./pages/museum/EnterDoors"));
const WatchFable = lazy(() => import("./pages/museum/WatchFable"));
const WhyNoAds = lazy(() => import("./pages/museum/WhyNoAds"));
const WhyNoVC = lazy(() => import("./pages/museum/WhyNoVC"));
const MirrorMirror = lazy(() => import("./pages/museum/MirrorMirror"));
const YvaineClip = lazy(() => import("./pages/museum/YvaineClip"));
const Door1Tour = lazy(() => import("./pages/museum/Door1Tour"));
const Door1GhostWorld = lazy(() => import("./pages/museum/Door1GhostWorld"));
const Door2Pathways = lazy(() => import("./pages/museum/Door2Pathways"));
const Door3Join = lazy(() => import("./pages/museum/Door3Join"));
const QREntry = lazy(() => import("./pages/museum/QREntry"));
const CephasBasement = lazy(() => import("./pages/museum/CephasBasement"));
const StewardsPage = lazy(() => import("./pages/museum/StewardsPage"));
const Archipelago = lazy(() => import("./pages/museum/Archipelago"));
const IslandCard = lazy(() => import("./pages/museum/IslandCard"));
const DistrictCard = lazy(() => import("./pages/museum/DistrictCard"));
const TreasureMapScroll = lazy(() => import("./components/museum/TreasureMapScroll"));
const TourEntry = lazy(() => import("./pages/museum/TourEntry"));
const CampaignForge = lazy(() => import("./pages/museum/CampaignForge"));
const CampaignMapEditor = lazy(() => import("./pages/museum/CampaignMapEditor"));
const WardrobeDepartment = lazy(() => import("./pages/museum/WardrobeDepartment"));
const SubmissionsPedestal = lazy(() => import("./pages/museum/SubmissionsPedestal"));

const queryClient = new QueryClient();

function MuseumLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">🌿</div>
        <p className="text-emerald-400/80 animate-pulse text-sm tracking-wide">
          Opening doors...
        </p>
      </div>
    </div>
  );
}

const MuseumApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <XRayProvider>
            <ArchipelagoTourProvider>
            <Toaster />
            <Sonner />
            <Suspense fallback={<MuseumLoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomeScreen />} />
                {/* WildFire Tour entry */}
                <Route path="/tour" element={<TourEntry />} />
                {/* Submarine doors — each card back is its own route */}
                <Route path="/enter" element={<EnterDoors />} />
                <Route path="/watch" element={<WatchFable />} />
                <Route path="/watch/:slide" element={<WatchFable />} />
                <Route path="/why-no-ads" element={<WhyNoAds />} />
                <Route path="/why-no-ads/:section" element={<WhyNoAds />} />
                <Route path="/why-no-vc" element={<WhyNoVC />} />
                <Route path="/why-no-vc/:section" element={<WhyNoVC />} />
                <Route path="/mirror" element={<MirrorMirror />} />
                <Route path="/yvaine" element={<YvaineClip />} />
                <Route path="/stewards" element={<StewardsPage />} />
                {/* Original 3-door destinations */}
                <Route path="/explore" element={<Door1Tour />} />
                <Route path="/browse" element={<Door1GhostWorld />} />
                <Route path="/build" element={<Door2Pathways />} />
                <Route path="/build/:pathway" element={<Door2Pathways />} />
                <Route path="/join" element={<Door3Join />} />
                <Route path="/welcome" element={<Door3Join />} />
                <Route path="/qr/:cardId" element={<QREntry />} />
                <Route path="/library" element={<CephasBasement />} />
                <Route path="/library/:depth" element={<CephasBasement />} />
                {/* HexIsle Archipelago — 7 islands, Deck Card tree */}
                <Route path="/hexisle" element={<Archipelago />} />
                <Route path="/hexisle/scroll" element={<TreasureMapScroll />} />
                <Route path="/hexisle/forge" element={<CampaignForge />} />
                <Route path="/hexisle/forge/:campaignId/map" element={<CampaignMapEditor />} />
                <Route path="/hexisle/wardrobe" element={<WardrobeDepartment />} />
                <Route path="/hexisle/submissions" element={<SubmissionsPedestal />} />
                <Route path="/hexisle/:island" element={<IslandCard />} />
                <Route path="/hexisle/:island/:district" element={<DistrictCard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <TourBanner />
            <TourCompletionModal />
            <SummonFloatingAlert />
            </ArchipelagoTourProvider>
            </XRayProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default MuseumApp;
