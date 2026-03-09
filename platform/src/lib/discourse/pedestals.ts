/**
 * PEDESTALS -- Public Content Display Feeds with Community Funding
 * =================================================================
 * Spec: MUFFLED_RULE_AND_PHASE_MIMICTRUNKS.md, Sections 5, 7
 *
 * A Pedestal is a publicly available Deck Card display feed of curated
 * content from external publications (newsletters, newspapers, etc.).
 *
 * Key architectural constraints:
 *
 *   - Max 5,000 Credits from any single person to any single Pedestal
 *   - Requires 20,000 Credits total funding to become Public
 *   - ALL transactions recorded in the Immutable Ledger (Pedestal section)
 *   - Funding sources are fully auditable (same transparency as Coverage donations)
 *   - Members can subscribe privately OR sponsor a Public Pedestal
 */

// ── Constants ──────────────────────────────────────────────────────────────

/** Maximum Credits any single member can contribute to a single Pedestal */
export const MAX_CONTRIBUTION_PER_PERSON = 5_000;

/** Total funding required for a Pedestal to become Public */
export const PUBLIC_THRESHOLD = 20_000;

/** Minimum number of funders required to reach public threshold at max contribution */
export const MIN_FUNDERS_AT_MAX = Math.ceil(PUBLIC_THRESHOLD / MAX_CONTRIBUTION_PER_PERSON); // 4

/** Minimum contribution amount (in Credits) */
export const MIN_CONTRIBUTION = 1;

// ── Newsletter Integration Constants (R-001 Integration) ─────────────────
//
// Per Rook research R-001: Ghost (or Newspack/WordPress) is the recommended
// integration platform for newsletter/newspaper subscriptions.
//
// Ghost provides:
//   - Robust Content API and Admin API
//   - Webhooks for member events (signup, subscription)
//   - Open-source, self-hostable (aligns with co-op ethos)
//   - Code injection for custom tracking scripts
//
// Integration approach:
//   - LB members subscribe to Ghost-hosted publications via Pedestals
//   - Custom tracking script injected into Ghost theme reports reading
//     progress (scroll depth, time-on-page) back to Coverage Minutes system
//   - Ghost webhooks notify LB of new content availability
//
// Substack is NOT viable (no public API, brittle scraping only).

/** Supported newsletter platform integrations */
export const SUPPORTED_NEWSLETTER_PLATFORMS = [
  "ghost",
  "newspack",
] as const;

export type NewsletterPlatform = typeof SUPPORTED_NEWSLETTER_PLATFORMS[number];

// ── Types ──────────────────────────────────────────────────────────────────

export type PedestalStatus =
  | "private"     // below PUBLIC_THRESHOLD, only visible to funders
  | "public"      // meets PUBLIC_THRESHOLD, visible to all
  | "suspended"   // temporarily suspended (e.g., content review)
  | "archived";   // permanently archived

export type SubscriptionSource =
  | "newsletter"
  | "newspaper"
  | "cephas_article_feed"
  | "member_publication_feed"
  | "external_rss";

export type ContributionType =
  | "initial"     // first contribution from this member
  | "additional"  // subsequent contribution (under cap)
  | "recurring";  // automatic periodic contribution

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface Pedestal {
  id: string;
  name: string;
  description: string;
  curatorMemberId: string;          // who created/manages the Pedestal
  status: PedestalStatus;
  isPublic: boolean;                // derived from totalFunding >= PUBLIC_THRESHOLD
  totalFunding: number;             // sum of all contributions (Credits)
  funderCount: number;              // number of unique contributors
  subscriptionFeeds: SubscriptionFeed[];
  ledgerSectionId: string;          // Pedestal section of Immutable Ledger
  createdAt: string;
  updatedAt: string;
  publicSince?: string;             // when it crossed the 20K threshold
}

export interface SubscriptionFeed {
  id: string;
  pedestalId: string;
  source: SubscriptionSource;
  sourceName: string;               // e.g., "The Atlantic", "Morning Brew"
  sourceUrl?: string;
  isActive: boolean;
  addedAt: string;
  addedByMemberId: string;
  contentCount: number;             // articles/pieces available
  lastContentAt?: string;           // most recent content timestamp
}

export interface PedestalContribution {
  id: string;
  pedestalId: string;
  memberId: string;
  amount: number;                   // Credits (max 5K per person per pedestal)
  contributionType: ContributionType;
  timestamp: string;
  ledgerEntryId: string;            // recorded in Immutable Ledger
  /** Running total for this member to this pedestal after this contribution */
  memberTotalAfter: number;
}

export interface PedestalFunderSummary {
  pedestalId: string;
  memberId: string;
  totalContributed: number;         // across all contributions
  remainingCapacity: number;        // MAX_CONTRIBUTION_PER_PERSON - totalContributed
  contributionCount: number;        // how many times they've contributed
  firstContributionAt: string;
  lastContributionAt: string;
}

export interface PrivatePortfolioSubscription {
  id: string;
  memberId: string;
  source: SubscriptionSource;
  sourceName: string;
  sourceUrl?: string;
  isActive: boolean;
  subscribedAt: string;
  /** Coverage Minutes earned from reading this subscription */
  coverageMinutesEarned: number;
  /** Private — details not visible to other members */
  isPrivate: true;
}

// ── Newsletter Integration Types (R-001 Integration) ─────────────────────

/**
 * Ghost CMS webhook event types that LB listens for.
 * Ghost fires these when content or member state changes.
 */
export type GhostWebhookEvent =
  | "post.published"           // new article available
  | "post.updated"             // existing article updated
  | "post.deleted"             // article removed
  | "member.added"             // new subscriber
  | "member.deleted"           // subscriber removed
  | "member.updated";          // subscriber info changed

/**
 * Configuration for a Ghost CMS integration.
 * Each Pedestal can connect to one or more Ghost instances.
 */
export interface GhostIntegration {
  /** Integration ID */
  id: string;
  /** Which Pedestal this integration belongs to */
  pedestalId: string;
  /** Ghost instance URL (e.g., https://news.example.com) */
  ghostUrl: string;
  /** Ghost Content API key (read-only, safe to store) */
  contentApiKey: string;
  /** Ghost Admin API key (for webhook management -- stored in Supabase vault) */
  adminApiKeyRef: string;
  /** Whether the integration is active */
  isActive: boolean;
  /** Webhook secret for validating incoming webhooks */
  webhookSecret: string;
  /** Last successful sync timestamp */
  lastSyncAt?: string;
  /** Total posts synced */
  postsSynced: number;
  /** Custom tracking script ID (injected into Ghost theme for reading metrics) */
  trackingScriptId: string;
  /** Connected at */
  connectedAt: string;
}

/**
 * Reading tracking event sent from the custom Ghost theme script
 * back to the LB Coverage Minutes system. This is how we measure
 * actual reading engagement on Ghost-hosted publications.
 */
export interface GhostReadingTrackingEvent {
  /** Event ID */
  id: string;
  /** Ghost post slug */
  postSlug: string;
  /** Ghost post title */
  postTitle: string;
  /** Ghost instance URL */
  ghostUrl: string;
  /** LB member ID (from auth cookie) */
  memberId: string;
  /** Scroll depth percentage (0-100) */
  scrollDepthPercent: number;
  /** Time spent on page (seconds) */
  timeOnPageSeconds: number;
  /** Estimated word count of the post */
  wordCount: number;
  /** Whether the member reached the end of the article */
  reachedEnd: boolean;
  /** Timestamp of the reading event */
  timestamp: string;
  /** Pedestal ID (for linking to the right subscription feed) */
  pedestalId: string;
  /** Integration ID */
  integrationId: string;
}

/**
 * Newspack (WordPress) integration — similar to Ghost but via WP REST API.
 * Uses the WordPress REST API for content and custom endpoints for tracking.
 */
export interface NewspackIntegration {
  /** Integration ID */
  id: string;
  /** Which Pedestal this integration belongs to */
  pedestalId: string;
  /** WordPress site URL */
  siteUrl: string;
  /** WP REST API application password ref (stored in Supabase vault) */
  appPasswordRef: string;
  /** Whether the integration is active */
  isActive: boolean;
  /** Newspack specific: reader revenue integration enabled */
  readerRevenueEnabled: boolean;
  /** Last successful sync timestamp */
  lastSyncAt?: string;
  /** Total posts synced */
  postsSynced: number;
  /** Connected at */
  connectedAt: string;
}

/**
 * Union type for all newsletter integrations.
 */
export type NewsletterIntegration = GhostIntegration | NewspackIntegration;

// ── Ghost CMS Self-Hosted Deployment (R-008 Integration) ─────────────────
//
// Per Rook research R-008: Self-host Ghost via Docker on Railway or Fly.io.
//
// Why Self-Hosted over Ghost Pro:
//   - Ghost Pro's strict Content Security Policies (CSP) block complex
//     external tracking scripts (Golden Key mechanic needs heavy JS injection)
//   - Ghost Pro's closed routing makes seamless Supabase auth sync difficult
//   - Self-hosted allows custom middleware (Node.js proxy) for JWT bridge
//   - Cost: ~$5-20/mo self-hosted vs $25-100+/mo Ghost Pro
//   - Full control over CORS, Nginx headers, and custom endpoints
//
// Auth Bridge Architecture:
//   1. User logs into LB (Supabase) → gets Supabase JWT
//   2. User navigates to Cephas/Ghost site
//   3. Custom middleware intercepts session, validates Supabase JWT
//   4. Middleware creates Ghost member session (bypasses Ghost magic-link)
//   5. User reads seamlessly; Golden Key tracking script fires to LB Edge Function
//
// Ghost native analytics only track "Email Opened" and "Link Clicked".
// All reading metrics (scroll depth, time-on-page, engagement) come from
// our injected Golden Key tracking script → LB Edge Function.

/** Supported Ghost deployment modes */
export const GHOST_DEPLOYMENT_MODES = [
  "self_hosted_railway",
  "self_hosted_flyio",
  "self_hosted_docker",
  "ghost_pro",
] as const;

export type GhostDeploymentMode = typeof GHOST_DEPLOYMENT_MODES[number];

/** Default deployment mode (self-hosted recommended by R-008) */
export const DEFAULT_GHOST_DEPLOYMENT: GhostDeploymentMode = "self_hosted_railway";

/**
 * Ghost self-hosted deployment configuration.
 * Manages the Docker container, reverse proxy, and JWT auth bridge.
 */
export interface GhostDeploymentConfig {
  /** Config ID */
  id: string;
  /** Which Pedestal or set of Pedestals this deployment serves */
  pedestalIds: string[];
  /** Deployment mode */
  deploymentMode: GhostDeploymentMode;
  /** Ghost instance URL (e.g., https://cephas.lianabanyan.com) */
  ghostUrl: string;
  /** Docker image version (e.g., "ghost:5-alpine") */
  dockerImage: string;
  /** Database type (MySQL recommended by Ghost) */
  databaseType: "mysql" | "sqlite";
  /** Hosting region */
  region: string;
  /** Monthly cost estimate (Credits) */
  monthlyCostEstimate: number;
  /** Whether the JWT auth bridge is active */
  jwtBridgeEnabled: boolean;
  /** Supabase JWT secret reference (for validating LB auth tokens) */
  supabaseJwtSecretRef: string;
  /** Golden Key tracking script ID (injected into Ghost theme) */
  goldenKeyScriptId: string;
  /** Custom CORS origins (LB domains allowed to call Ghost API) */
  corsOrigins: string[];
  /** Whether the deployment is healthy */
  isHealthy: boolean;
  /** Last health check timestamp */
  lastHealthCheckAt?: string;
  /** Created at */
  createdAt: string;
  /** Updated at */
  updatedAt: string;
}

/**
 * JWT Auth Bridge configuration for seamless Supabase → Ghost SSO.
 * Runs as a sidecar middleware in the Docker deployment.
 */
export interface GhostJWTBridge {
  /** Bridge ID */
  id: string;
  /** Deployment config ID */
  deploymentConfigId: string;
  /** Supabase project URL for JWT validation */
  supabaseUrl: string;
  /** JWT audience claim to validate */
  jwtAudience: string;
  /** Whether to auto-create Ghost members for new LB users */
  autoCreateMembers: boolean;
  /** Member sync interval (ms) — how often to reconcile Ghost ↔ Supabase members */
  syncIntervalMs: number;
  /** Last successful sync timestamp */
  lastSyncAt?: string;
  /** Total members synced */
  membersSynced: number;
  /** Whether the bridge is active */
  isActive: boolean;
}

/**
 * Create a default Ghost deployment configuration.
 * Self-hosted on Railway with JWT bridge enabled.
 */
export function createGhostDeploymentConfig(
  ghostUrl: string,
  pedestalIds: string[],
  region: string = "us-east-1",
): GhostDeploymentConfig {
  const now = new Date().toISOString();
  return {
    id: `ghost-deploy-${Date.now()}`,
    pedestalIds,
    deploymentMode: DEFAULT_GHOST_DEPLOYMENT,
    ghostUrl,
    dockerImage: "ghost:5-alpine",
    databaseType: "mysql",
    region,
    monthlyCostEstimate: 15, // Railway ~$5 compute + $10 managed MySQL
    jwtBridgeEnabled: true,
    supabaseJwtSecretRef: "vault:supabase-jwt-secret",
    goldenKeyScriptId: `gk-script-${Date.now()}`,
    corsOrigins: ["https://lianabanyan.com", "https://app.lianabanyan.com"],
    isHealthy: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Determine if a GhostReadingTrackingEvent represents genuine reading
 * engagement sufficient to earn Coverage Minutes.
 * Works in conjunction with the anti-abuse detection in coverageMinutes.ts.
 */
export function isGenuineReading(event: GhostReadingTrackingEvent): {
  genuine: boolean;
  reason?: string;
} {
  // Must have spent at least 10 seconds on the page
  if (event.timeOnPageSeconds < 10) {
    return { genuine: false, reason: "Insufficient time on page." };
  }

  // Must have scrolled at least 25% of the article
  if (event.scrollDepthPercent < 25) {
    return { genuine: false, reason: "Insufficient scroll depth." };
  }

  // WPM sanity check (same as bot detection in coverageMinutes.ts)
  const readingMinutes = event.timeOnPageSeconds / 60;
  if (readingMinutes > 0) {
    const estimatedWordsRead = event.wordCount * (event.scrollDepthPercent / 100);
    const wpm = estimatedWordsRead / readingMinutes;
    if (wpm > 1000) {
      return { genuine: false, reason: `Implausible reading speed: ${Math.round(wpm)} WPM.` };
    }
  }

  return { genuine: true };
}

// ── Co-op Media Partner Catalog (P-001 Integration) ─────────────────────
//
// Per Pawn discovery P-001: 12+ cooperative, reader-owned, and community-funded
// media organizations identified as integration candidates for Pedestal
// subscription feeds. These are NOT Substack-style platforms — they are
// member-governed institutions closer to LB's Guild model.
//
// Integration paths: syndication, co-branded newsletters, membership-sync,
// or Phase MimicTrunk media guilds.

export type CoopMediaRegion = "us" | "uk" | "eu" | "canada" | "global";
export type CoopMediaModel = "reader_owned" | "worker_owned" | "multi_stakeholder" | "incubator";

export interface CoopMediaPartner {
  /** Partner ID */
  id: string;
  /** Organization name */
  name: string;
  /** Country/region */
  region: CoopMediaRegion;
  /** Ownership model */
  model: CoopMediaModel;
  /** Short description */
  description: string;
  /** Website URL */
  url: string;
  /** Whether integration has been established */
  isIntegrated: boolean;
  /** Integration type (if integrated) */
  integrationType?: "ghost" | "newspack" | "rss" | "api" | "manual";
  /** Approximate member/subscriber count */
  memberCount?: number;
  /** Whether they use democratic governance (1 member = 1 vote) */
  democraticGovernance: boolean;
}

/**
 * Known co-op media partners for Pedestal integration.
 * Curated from Pawn P-001 research. Each is a real organization
 * with cooperative ownership and reader/community governance.
 */
export const COOP_MEDIA_CATALOG: CoopMediaPartner[] = [
  {
    id: "coop-bristol-cable",
    name: "The Bristol Cable",
    region: "uk",
    model: "reader_owned",
    description: "Member-owned local news co-op in Bristol; investigative and community reporting",
    url: "https://thebristolcable.org",
    isIntegrated: false,
    memberCount: 2700,
    democraticGovernance: true,
  },
  {
    id: "coop-the-meteor",
    name: "The Meteor",
    region: "uk",
    model: "reader_owned",
    description: "Manchester-based radical community news co-op; housing, climate justice, refugee issues",
    url: "https://themeteor.org",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-cooperative-press",
    name: "Co-op News / Co-operative Press",
    region: "uk",
    model: "worker_owned",
    description: "150-year-old co-op-owned media outlet covering the co-operative movement",
    url: "https://thenews.coop",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-devil-strip",
    name: "The Devil Strip",
    region: "us",
    model: "reader_owned",
    description: "First US community news site to convert to reader cooperative ownership; Akron, Ohio",
    url: "https://thedevilstrip.com",
    isIntegrated: false,
    memberCount: 1000,
    democraticGovernance: true,
  },
  {
    id: "coop-banyan-project",
    name: "Banyan Project",
    region: "us",
    model: "incubator",
    description: "Nonprofit incubator creating digital community news co-op blueprints; 40+ communities",
    url: "https://banyanproject.com",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-mendocino-voice",
    name: "The Mendocino Voice",
    region: "us",
    model: "reader_owned",
    description: "California local online news converting to co-op ownership; member revenue core",
    url: "https://mendovoice.com",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-bloc-by-block",
    name: "Bloc by Block News",
    region: "us",
    model: "reader_owned",
    description: "Maryland statewide news co-op via mobile app; grassroots membership institution",
    url: "https://blocbyblock.news",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-taz",
    name: "taz, die tageszeitung",
    region: "eu",
    model: "reader_owned",
    description: "German national newspaper owned by a large reader cooperative",
    url: "https://taz.de",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-woz",
    name: "WOZ Die Wochenzeitung",
    region: "eu",
    model: "multi_stakeholder",
    description: "Swiss weekly newspaper owned by a cooperative of readers and workers",
    url: "https://woz.ch",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-nb-media",
    name: "NB Media Co-op",
    region: "canada",
    model: "multi_stakeholder",
    description: "Canadian grassroots independent publication; community-driven local content",
    url: "https://nbmediacoop.org",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-il-manifesto",
    name: "il manifesto",
    region: "eu",
    model: "worker_owned",
    description: "Italian daily with cooperative ownership and strong reader-funding tradition",
    url: "https://ilmanifesto.it",
    isIntegrated: false,
    democraticGovernance: true,
  },
  {
    id: "coop-la-jornada",
    name: "La Jornada",
    region: "global",
    model: "reader_owned",
    description: "Mexican national newspaper with reader-ownership and cooperative characteristics",
    url: "https://jornada.com.mx",
    isIntegrated: false,
    democraticGovernance: true,
  },
];

/**
 * Get co-op media partners by region.
 */
export function getCoopPartnersByRegion(region: CoopMediaRegion): CoopMediaPartner[] {
  return COOP_MEDIA_CATALOG.filter(p => p.region === region);
}

/**
 * Get co-op media partners that have been integrated with LB.
 */
export function getIntegratedCoopPartners(): CoopMediaPartner[] {
  return COOP_MEDIA_CATALOG.filter(p => p.isIntegrated);
}

// ── Pedestal Management Functions ──────────────────────────────────────────

/**
 * Create a new Pedestal.
 * Starts as private; becomes public when funding reaches PUBLIC_THRESHOLD.
 */
export function createPedestal(
  name: string,
  description: string,
  curatorMemberId: string,
): Pedestal {
  const now = new Date().toISOString();

  return {
    id: `ped-${Date.now()}`,
    name,
    description,
    curatorMemberId,
    status: "private",
    isPublic: false,
    totalFunding: 0,
    funderCount: 0,
    subscriptionFeeds: [],
    ledgerSectionId: `ledger-ped-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validate whether a member can contribute to a Pedestal.
 * Checks: amount > 0, within per-person cap, pedestal not archived/suspended.
 */
export function canContribute(
  pedestal: Pedestal,
  memberId: string,
  amount: number,
  existingTotal: number,
): { allowed: boolean; reason?: string; maxAllowed?: number } {
  if (amount < MIN_CONTRIBUTION) {
    return {
      allowed: false,
      reason: `Minimum contribution is ${MIN_CONTRIBUTION} Credit.`,
    };
  }

  if (pedestal.status === "archived") {
    return {
      allowed: false,
      reason: "This Pedestal has been archived and no longer accepts contributions.",
    };
  }

  if (pedestal.status === "suspended") {
    return {
      allowed: false,
      reason: "This Pedestal is temporarily suspended. Contributions are paused.",
    };
  }

  const remaining = MAX_CONTRIBUTION_PER_PERSON - existingTotal;

  if (remaining <= 0) {
    return {
      allowed: false,
      reason: `You have already contributed the maximum of ${MAX_CONTRIBUTION_PER_PERSON.toLocaleString()} Credits to this Pedestal.`,
      maxAllowed: 0,
    };
  }

  if (amount > remaining) {
    return {
      allowed: false,
      reason: `You can contribute at most ${remaining.toLocaleString()} more Credits to this Pedestal (${existingTotal.toLocaleString()} already contributed, cap is ${MAX_CONTRIBUTION_PER_PERSON.toLocaleString()}).`,
      maxAllowed: remaining,
    };
  }

  return { allowed: true, maxAllowed: remaining };
}

/**
 * Process a contribution and check if the Pedestal should become public.
 * Returns whether the Pedestal status changed.
 */
export function processContribution(
  pedestal: Pedestal,
  amount: number,
  isNewFunder: boolean,
): { becamePublic: boolean; newTotal: number } {
  const previousTotal = pedestal.totalFunding;
  const newTotal = previousTotal + amount;

  pedestal.totalFunding = newTotal;
  pedestal.updatedAt = new Date().toISOString();

  if (isNewFunder) {
    pedestal.funderCount += 1;
  }

  // Check if we just crossed the public threshold
  const becamePublic = previousTotal < PUBLIC_THRESHOLD && newTotal >= PUBLIC_THRESHOLD;

  if (becamePublic) {
    pedestal.isPublic = true;
    pedestal.status = "public";
    pedestal.publicSince = new Date().toISOString();
  }

  return { becamePublic, newTotal };
}

/**
 * Check if a Pedestal is eligible to become public.
 */
export function checkPublicEligibility(pedestal: Pedestal): {
  isEligible: boolean;
  currentFunding: number;
  remainingToPublic: number;
  funderCount: number;
  minFundersNeeded: number;
} {
  const remaining = Math.max(0, PUBLIC_THRESHOLD - pedestal.totalFunding);

  return {
    isEligible: pedestal.totalFunding >= PUBLIC_THRESHOLD,
    currentFunding: pedestal.totalFunding,
    remainingToPublic: remaining,
    funderCount: pedestal.funderCount,
    minFundersNeeded: MIN_FUNDERS_AT_MAX,
  };
}

/**
 * Get a funding summary for display.
 */
export function getFundingSummary(pedestal: Pedestal): {
  name: string;
  status: PedestalStatus;
  totalFunding: number;
  percentToPublic: number;
  funderCount: number;
  feedCount: number;
  isPublic: boolean;
} {
  return {
    name: pedestal.name,
    status: pedestal.status,
    totalFunding: pedestal.totalFunding,
    percentToPublic: Math.min(100, Math.round((pedestal.totalFunding / PUBLIC_THRESHOLD) * 100)),
    funderCount: pedestal.funderCount,
    feedCount: pedestal.subscriptionFeeds.filter(f => f.isActive).length,
    isPublic: pedestal.isPublic,
  };
}

/**
 * Create a private portfolio subscription (not linked to any Pedestal).
 */
export function createPrivateSubscription(
  memberId: string,
  source: SubscriptionSource,
  sourceName: string,
  sourceUrl?: string,
): PrivatePortfolioSubscription {
  return {
    id: `pvt-sub-${memberId}-${Date.now()}`,
    memberId,
    source,
    sourceName,
    sourceUrl,
    isActive: true,
    subscribedAt: new Date().toISOString(),
    coverageMinutesEarned: 0,
    isPrivate: true,
  };
}

/**
 * Add a subscription feed to a Pedestal.
 */
export function addSubscriptionFeed(
  pedestal: Pedestal,
  source: SubscriptionSource,
  sourceName: string,
  addedByMemberId: string,
  sourceUrl?: string,
): SubscriptionFeed {
  const feed: SubscriptionFeed = {
    id: `feed-${pedestal.id}-${Date.now()}`,
    pedestalId: pedestal.id,
    source,
    sourceName,
    sourceUrl,
    isActive: true,
    addedAt: new Date().toISOString(),
    addedByMemberId,
    contentCount: 0,
  };

  pedestal.subscriptionFeeds.push(feed);
  pedestal.updatedAt = new Date().toISOString();

  return feed;
}
