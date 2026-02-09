import { detectPortal } from "./portalDetector";

/**
 * Dynamically loads the correct PWA manifest based on the current portal
 */
export function loadPortalManifest() {
  const portal = detectPortal();
  const manifestMap: Record<string, string> = {
    marketplace: '/manifest-marketplace.json',
    business: '/manifest-business.json',
    nonprofit: '/manifest-nonprofit.json',
    network: '/manifest-network.json'
  };

  const manifestPath = manifestMap[portal] || '/manifest.json';
  
  // Update or create manifest link
  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    document.head.appendChild(manifestLink);
  }
  
  manifestLink.href = manifestPath;
  
  // Update theme color based on portal
  const themeColorMap: Record<string, string> = {
    marketplace: '#4F46E5', // Indigo
    business: '#059669',    // Emerald
    nonprofit: '#DC2626',   // Red
    network: '#0284C7'      // Sky
  };
  
  const themeColor = themeColorMap[portal] || '#4F46E5';
  let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  
  metaThemeColor.content = themeColor;
}
