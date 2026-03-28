import { AppProviders } from "./AppProviders";
import { AppShell } from "./AppShell";
import { AppRouter } from "./AppRouter";
import { GlobalWildfireRun } from "./components/GlobalWildfireRun";
import { ScrollToTop } from "./components/ScrollToTop";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { DenkenMenu } from "./components/builder/DenkenMenu";
import { LarkSidePanel } from "./components/builder/LarkSidePanel";
import { XRayOverlay } from "./components/builder/XRayOverlay";
import { CoinFlipAnimation } from "./components/xray/CoinFlipAnimation";
import { CrowsNestOverlay } from "./components/crows-nest/CrowsNestOverlay";
import { BeaconBiteNudge } from "./components/BeaconBiteNudge";

const App = () => (
  <AppProviders>
    <AppShell>
      <GlobalWildfireRun />
      <ScrollToTop />
      <ErrorBoundary>
        <AppRouter />
      </ErrorBoundary>
    </AppShell>
    <DenkenMenu />
    <BeaconBiteNudge />
    <CrowsNestOverlay />
    <LarkSidePanel />
    <XRayOverlay />
    <CoinFlipAnimation />
  </AppProviders>
);

export default App;
