import { detectPortal, type PortalType } from "./portalDetector";

interface PortalBranding {
  title: string;
  manifest: string;
  themeColor: string;
}

const PORTAL_BRANDING: Record<PortalType, PortalBranding> = {
  marketplace: { title: 'Liana Banyan — Help Each Other Help Ourselves', manifest: '/manifest-marketplace.json', themeColor: '#4F46E5' },
  business:    { title: 'Liana Banyan Business', manifest: '/manifest-business.json', themeColor: '#059669' },
  nonprofit:   { title: 'Liana Banyan Foundation', manifest: '/manifest-nonprofit.json', themeColor: '#DC2626' },
  network:     { title: 'Liana Banyan Network', manifest: '/manifest-network.json', themeColor: '#0284C7' },
  dss:         { title: 'The 2nd Second — Decentralized Factory', manifest: '/manifest-dss.json', themeColor: '#EA580C' },
  hexisle:     { title: 'HexIsle — Build & Explore', manifest: '/manifest-hexisle.json', themeColor: '#7C3AED' },
  upekrithen:  { title: 'Upekrithen — Command Center', manifest: '/manifest-upekrithen.json', themeColor: '#1E293B' },
  museum:      { title: 'Liana Banyan — The Museum', manifest: '/manifest-marketplace.json', themeColor: '#0F172A' },
};

/**
 * Sets document title, PWA manifest, and theme-color for the active portal.
 */
export function loadPortalManifest() {
  const portal = detectPortal();
  const branding = PORTAL_BRANDING[portal];

  document.title = branding.title;

  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    document.head.appendChild(manifestLink);
  }
  manifestLink.href = branding.manifest;

  let metaThemeColor = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    document.head.appendChild(metaThemeColor);
  }
  metaThemeColor.content = branding.themeColor;
}
