import { AppProviders } from "./AppProviders";
import { AppShell } from "./AppShell";
import { AppRouter } from "./AppRouter";
import { GlobalWildfireRun } from "./components/GlobalWildfireRun";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { MascotMenu } from "./components/builder/MascotMenu";
import { LarkSidePanel } from "./components/builder/LarkSidePanel";
import { XRayOverlay } from "./components/builder/XRayOverlay";
import { CoinFlipAnimation } from "./components/xray/CoinFlipAnimation";
import { CrowsNestOverlay } from "./components/crows-nest/CrowsNestOverlay";
import { BeaconBiteNudge } from "./components/BeaconBiteNudge";
import { GuidedTourOverlay } from "./components/v2/guided-tour";
import { TourModeOverlay } from "./components/wildfire/TourModeOverlay";
import { LRHPageGreeter } from "./components/builder/LRHPageGreeter";
// XRayFeedbackToggle removed — functionality merged into MascotMenu + NotesOverlay (B052)

const App = () => (
  <AppProviders>
    <AppShell>
      <GlobalWildfireRun />
      <ScrollToTop />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </AppShell>
    <TourModeOverlay />
    <MascotMenu />
    <LRHPageGreeter />
    <GuidedTourOverlay />
    <BeaconBiteNudge />
    <CrowsNestOverlay />
    <LarkSidePanel />
    <ErrorBoundary><XRayOverlay /></ErrorBoundary>
    {/* XRayFeedbackToggle removed — merged into MascotMenu + NotesOverlay */}
    <CoinFlipAnimation />
  </AppProviders>
);

export default App;
