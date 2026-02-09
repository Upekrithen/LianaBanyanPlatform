import { createRoot } from "react-dom/client";
import { Web3Provider } from "./components/Web3Provider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { detectPortal } from "./utils/portalDetector";
import { loadPortalManifest } from "./utils/manifestLoader";
import MarketplaceApp from "./App.tsx";
import BusinessApp from "./BusinessApp.tsx";
import NonprofitApp from "./NonprofitApp.tsx";
import NetworkApp from "./NetworkApp.tsx";
import "./i18n/config";
import "./index.css";

// Load the correct PWA manifest for this portal
loadPortalManifest();

// Detect which portal to load based on hostname
const portal = detectPortal();
const AppMap = {
  marketplace: MarketplaceApp,
  business: BusinessApp,
  nonprofit: NonprofitApp,
  network: NetworkApp,
};
const AppComponent = AppMap[portal];

console.log(`🚀 Loading ${portal} portal...`);

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <Web3Provider>
      <AppComponent />
    </Web3Provider>
  </ThemeProvider>
);
