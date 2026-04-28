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
// TourBanner removed from global layout B093 — now only shows on HEOHO card
// import { TourBanner } from "./components/wildfire/TourBanner";
import { TourCompletionModal } from "./components/wildfire/TourCompletionModal";
import { SummonFloatingAlert } from "./components/museum/DMSummonPanel";

const HomeScreen = lazy(() => import("./pages/museum/HomeScreen"));
const HelmPage = lazy(() => import("./pages/museum/HelmPage"));
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
const CatapultDashboard = lazy(() => import("./pages/museum/CatapultDashboard"));
const MissionBriefingsPage = lazy(() => import("./pages/museum/MissionBriefingsPage"));
const DeckCardStudio = lazy(() => import("./pages/DeckCardStudio"));
const PrintStudioPage = lazy(() => import("./pages/museum/PrintStudioPage"));
const PrintApprovalPage = lazy(() => import("./pages/museum/PrintApprovalPage"));
const ProducerSignupPage = lazy(() => import("./pages/museum/ProducerSignupPage"));
const ProducerBoardPage = lazy(() => import("./pages/museum/ProducerBoardPage"));
const Cast = lazy(() => import("./pages/museum/Cast"));
const FounderStory = lazy(() => import("./pages/museum/FounderStory"));
const BriefDirectoryPage = lazy(() => import("./pages/openwater/BriefDirectoryPage"));
const PublishBriefPage = lazy(() => import("./pages/openwater/PublishBriefPage"));
const PatronDirectoryPage = lazy(() => import("./pages/openwater/PatronDirectoryPage"));
const MyEngagementsPage = lazy(() => import("./pages/openwater/MyEngagementsPage"));
const MySaaPage = lazy(() => import("./pages/openwater/MySaaPage"));

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
                <Route path="/helm" element={<HelmPage />} />
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
                <Route path="/cast" element={<Cast />} />
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
                {/* Catapult Power + Mission Briefings (K391/K392) */}
                <Route path="/catapult" element={<CatapultDashboard />} />
                <Route path="/briefings" element={<MissionBriefingsPage />} />
                <Route path="/hexisle/:island" element={<IslandCard />} />
                <Route path="/hexisle/:island/:district" element={<DistrictCard />} />
                {/* Deck Card Studio (K394) */}
                <Route path="/studio" element={<DeckCardStudio />} />
                {/* Print Pipeline (K396) */}
                <Route path="/print-studio" element={<PrintStudioPage />} />
                <Route path="/print-approval" element={<PrintApprovalPage />} />
                {/* Producer Onboarding (K397) */}
                <Route path="/become-a-producer" element={<ProducerSignupPage />} />
                <Route path="/producer-board" element={<ProducerBoardPage />} />
                {/* Founder's Story — Anecdote Mapping (K404) */}
                <Route path="/founder/story" element={<FounderStory />} />
                {/* Open Water — Growth-Stage Advisory (K404-OW) */}
                <Route path="/openwater/briefs" element={<BriefDirectoryPage />} />
                <Route path="/openwater/publish" element={<PublishBriefPage />} />
                <Route path="/openwater/patrons" element={<PatronDirectoryPage />} />
                <Route path="/openwater/my-engagements" element={<MyEngagementsPage />} />
                <Route path="/openwater/my-saa" element={<MySaaPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            {/* TourBanner moved to HEOHOCardFront — only shows on the Deck Card, not globally */}
            <TourCompletionModal />
            <SummonFloatingAlert />
            {/* K534 — LB Frame back-link: low-opacity ghost link so immersive design stays intact */}
            <a
              href="https://lianabanyan.com"
              title="Go to LB Frame (lianabanyan.com)"
              style={{
                position: 'fixed',
                bottom: '1.25rem',
                right: '1.25rem',
                zIndex: 9998,
                display: 'flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.4rem 0.85rem',
                background: 'rgba(10, 25, 47, 0.55)',
                border: '1px solid rgba(200, 169, 81, 0.25)',
                borderRadius: '9999px',
                color: 'rgba(200, 169, 81, 0.55)',
                fontSize: '0.72rem',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 500,
                letterSpacing: '0.03em',
                textDecoration: 'none',
                opacity: 0.6,
                backdropFilter: 'blur(4px)',
                transition: 'opacity 0.2s, color 0.2s, border-color 0.2s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(200, 169, 81, 1)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200, 169, 81, 0.6)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.6';
                (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(200, 169, 81, 0.55)';
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(200, 169, 81, 0.25)';
              }}
            >
              ← LB Frame
            </a>
            </ArchipelagoTourProvider>
            </XRayProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default MuseumApp;
