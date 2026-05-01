import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Web3Provider } from "./components/Web3Provider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { detectPortal } from "./utils/portalDetector";
import { loadPortalManifest } from "./utils/manifestLoader";
import MarketplaceApp from "./App.tsx";
import BusinessApp from "./BusinessApp.tsx";
import NonprofitApp from "./NonprofitApp.tsx";
import NetworkApp from "./NetworkApp.tsx";
import DSSApp from "./DSSApp.tsx";
import HexIsleApp from "./HexIsleApp.tsx";
import UpekrithenApp from "./UpekrithenApp.tsx";
import MuseumApp from "./MuseumApp.tsx";
import LibrarianRedirectPage from "./pages/LibrarianRedirectPage.tsx";
import { consumeAuthRelay } from "./utils/crossDomainAuth";
import "./i18n"; // Full react-i18next with 58-language HttpBackend (Option B)
import "./index.css";

// Consume cross-domain auth relay before anything renders
consumeAuthRelay();

// Load the correct PWA manifest + branding for this portal
loadPortalManifest();

// KN064: librarian.lianabanyan.com → lightweight download-detail redirect page
// (keeps it out of the Marketplace app entirely; pure redirect + detail)
if (window.location.hostname === 'librarian.lianabanyan.com') {
  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <BrowserRouter>
        <LibrarianRedirectPage />
      </BrowserRouter>
    </ThemeProvider>
  );
} else {
  // Detect which portal to load based on hostname
  const portal = detectPortal();
  const AppMap = {
    marketplace: MarketplaceApp,
    business: BusinessApp,
    nonprofit: NonprofitApp,
    network: NetworkApp,
    dss: DSSApp,
    hexisle: HexIsleApp,
    upekrithen: UpekrithenApp,
    museum: MuseumApp,
  };
  const AppComponent = AppMap[portal];

  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <Web3Provider>
        <AppComponent />
      </Web3Provider>
    </ThemeProvider>
  );
}
