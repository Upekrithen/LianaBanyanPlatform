/**
 * Museum Frozen Snapshot -- Configuration and Build Plan
 * ======================================================
 * Wave 28 (Phase epsilon -- Launch): museum.lianabanyan.com
 *
 * The frozen snapshot is a read-only historical record of the cooperative.
 * It is served from the Firebase Hosting site: lianabanyan-museum-frozen
 * Custom domain: museum.lianabanyan.com (HELD -- Founder DNS activation required)
 *
 * What the snapshot contains:
 *   - The MuseumPage (/museum) -- Rope of History, milestones, Founder bio, genesis
 *   - No live platform features (no login, no transactions, no member data)
 *   - No Supabase calls
 *   - No auth flow
 *   - Static HTML + CSS + minimal JS
 *
 * What the snapshot does NOT contain:
 *   - Member dashboards
 *   - Wallet / EARN / HOLD / REDEEM flows
 *   - Admin panels
 *   - Any personally identifiable data
 *   - Any Stripe / payment flows
 *
 * Build strategy:
 *   The museum snapshot is built from the platform's Vite build with
 *   VITE_MUSEUM_FROZEN=true set in the environment. This flag:
 *     1. Causes the MuseumApp.tsx entry point to render only the frozen museum pages
 *     2. Strips all live-platform imports from the bundle
 *     3. Disables auth and Supabase initialization
 *     4. Injects the MUSEUM_FROZEN_BANNER component
 *
 * Firebase Hosting target: museum-frozen -> lianabanyan-museum-frozen
 * Deploy command (Founder, after DNS activation):
 *   cd platform && firebase deploy --only hosting:museum-frozen
 *
 * BP073 Wave 28 -- Knight
 */

// ---- Frozen snapshot manifest ------------------------------------------

export const MUSEUM_SNAPSHOT_MANIFEST = {
  version: "wave-28-2026-06-03",
  frozenAt: "2026-06-03T00:00:00Z",
  frozenBy: "Wave 28 (BP073 Phase epsilon)",
  firebaseSite: "lianabanyan-museum-frozen",
  firebaseTarget: "museum-frozen",
  customDomain: "museum.lianabanyan.com",
  customDomainStatus: "HELD -- Founder DNS activation required",
  routes: [
    { path: "/", description: "Museum home (Rope of History, milestones, Founder bio)" },
    { path: "/history", description: "Alias for museum home" },
    { path: "/rope-of-history", description: "Alias for museum home" },
  ],
  excludedFeatures: [
    "member authentication",
    "wallet / EARN / HOLD / REDEEM",
    "Supabase queries",
    "admin panels",
    "Stripe / payment flows",
    "member profile data",
  ],
  sslStatus: "HELD -- provisioned automatically by Firebase after DNS activation",
} as const;

// ---- Subdomain routing config ------------------------------------------

export const MUSEUM_SUBDOMAIN_ROUTING = {
  hostname: "museum.lianabanyan.com",
  firebaseProject: "lianabanyan-403dc",
  firebaseSite: "lianabanyan-museum-frozen",
  firebaseTarget: "museum-frozen",
  /**
   * portalDetector.ts reads window.location.hostname to select the portal.
   * museum.lianabanyan.com maps to the "museum" portal, which loads MuseumApp.tsx.
   * In frozen snapshot mode (VITE_MUSEUM_FROZEN=true), MuseumApp renders
   * only the static history routes.
   */
  portalKey: "museum",
  frozen: true,
  readOnly: true,
} as const;

// ---- Firebase Hosting config for museum-frozen -------------------------

/**
 * Add this block to platform/firebase.json under "hosting" array
 * to register the museum-frozen deploy target.
 *
 * The "museum" target already exists in firebase.json (live museum portal).
 * This is the SEPARATE frozen target for the historical snapshot.
 */
export const FIREBASE_MUSEUM_FROZEN_HOSTING_BLOCK = {
  target: "museum-frozen",
  public: "dist",
  ignore: ["firebase.json", "**/.*", "**/node_modules/**"],
  rewrites: [
    { source: "/history", destination: "/index.html" },
    { source: "/rope-of-history", destination: "/index.html" },
    { source: "**", destination: "/index.html" },
  ],
  headers: [
    {
      source: "**",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Museum-Frozen", value: "wave-28-2026-06-03" },
        { key: "X-Robots-Tag", value: "index, follow" },
        { key: "Cache-Control", value: "public, max-age=86400" },
      ],
    },
    {
      source: "index.html",
      headers: [
        { key: "Content-Type", value: "text/html; charset=UTF-8" },
        { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
      ],
    },
    {
      source: "**/*.@(js|mjs)",
      headers: [
        { key: "Content-Type", value: "application/javascript; charset=UTF-8" },
        { key: "Cache-Control", value: "max-age=31536000" },
      ],
    },
    {
      source: "**/*.css",
      headers: [
        { key: "Content-Type", value: "text/css; charset=UTF-8" },
        { key: "Cache-Control", value: "max-age=31536000" },
      ],
    },
  ],
} as const;

// ---- .firebaserc target registration -----------------------------------

/**
 * Add this to Cephas/cephas-hugo/.firebaserc (or platform/.firebaserc)
 * under targets.lianabanyan-403dc.hosting:
 *   "museum-frozen": ["lianabanyan-museum-frozen"]
 *
 * This is already registered in Cephas/cephas-hugo/.firebaserc per MUSEUM_DNS_PREP_BP071.md.
 * For platform-level deploys, add to platform/.firebaserc if it exists.
 */
export const FIREBASERC_MUSEUM_FROZEN_TARGET = {
  project: "lianabanyan-403dc",
  targetKey: "museum-frozen",
  sites: ["lianabanyan-museum-frozen"],
} as const;

// ---- Snapshot build script (Founder runbook) ---------------------------

/**
 * To build and deploy the frozen snapshot:
 *
 *   # 1. Build with frozen flag
 *   cd platform
 *   VITE_MUSEUM_FROZEN=true npx vite build --outDir dist-museum-frozen
 *
 *   # 2. Deploy to museum-frozen target
 *   firebase deploy --only hosting:museum-frozen --project lianabanyan-403dc
 *
 *   # 3. After DNS activation, verify at:
 *   #    https://museum.lianabanyan.com
 *
 * FOUNDER: DNS activation is required before the custom domain resolves.
 * See dns-staging.config.ts and MUSEUM_DNS_PREP_BP071.md for registrar steps.
 */
export const SNAPSHOT_BUILD_RUNBOOK = [
  "1. Ensure Firebase CLI is installed: npm install -g firebase-tools",
  "2. Log in: firebase login",
  "3. Build snapshot: VITE_MUSEUM_FROZEN=true npx vite build --outDir dist-museum-frozen",
  "4. Deploy: firebase deploy --only hosting:museum-frozen --project lianabanyan-403dc",
  "5. Verify at lianabanyan-museum-frozen.web.app before DNS activation",
  "6. FOUNDER: Activate DNS (see MUSEUM_DNS_PREP_BP071.md and dns-staging.config.ts)",
  "7. After DNS propagates: verify at https://museum.lianabanyan.com",
] as const;
