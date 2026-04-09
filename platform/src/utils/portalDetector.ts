/**
 * Portal Detection Utility
 * Determines which portal to load based on hostname, including subdomains.
 *
 * Architecture:
 * - Each root domain maps to a portal app (HexIsleApp, DSSApp, etc.)
 * - Subdomains (e.g., encyclopedia.hexisle.com) route to the SAME portal app,
 *   which handles subdomain detection internally for the right view.
 * - Wildcard subdomains: with Cloudflare DNS, *.hexisle.com and *.the2ndsecond.com
 *   resolve to the same hosting site. The SPA detects the subdomain and routes accordingly.
 *   New subdomains = one line of code. Zero DNS changes.
 *
 * Domain → Portal mapping:
 * - lianabanyan.com / localhost:5173 → Marketplace Portal (public discovery)
 * - lianabanyan.biz / localhost:5174 → Business Portal (HR, operations)
 * - lianabanyan.org / localhost:5175 → Non-Profit Portal (financial services)
 * - lianabanyan.net / localhost:5176 → Business Network Portal (B2B)
 * - the2ndsecond.com / localhost:5177 → DSS Portal (Maker, Prototyper Guild)
 * - hexisle.com / localhost:5178 → HexIsle Portal (7-island simulator)
 * - upekrithen.lianabanyan.com / localhost:5179 → Upekrithen Portal (MoneyPenny admin, founder-only)
 * - museum.lianabanyan.com / localhost:5180 → Museum Portal (new visitor 3-door experience)
 * - *.hexisle.com → HexIsle Portal (subdomain-routed views)
 * - *.the2ndsecond.com → DSS Portal (subdomain-routed views)
 */

export type PortalType = 'marketplace' | 'business' | 'nonprofit' | 'network' | 'dss' | 'hexisle' | 'upekrithen' | 'museum';

/**
 * Extracts the root domain from a hostname
 * e.g., "encyclopedia.hexisle.com" → "hexisle.com"
 *       "hexisle.com" → "hexisle.com"
 *       "localhost" → "localhost"
 */
const getRootDomain = (hostname: string): string => {
  const parts = hostname.split('.');
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
};

/**
 * Detects the current portal based on hostname (subdomain-aware)
 */
export const detectPortal = (): PortalType => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const path = window.location.pathname;
  const rootDomain = getRootDomain(hostname);

  // Route-based detection (works in dev/preview without separate domains)
  if (isBusinessRoute(path)) return 'business';
  if (isNonprofitRoute(path)) return 'nonprofit';
  if (isNetworkRoute(path)) return 'network';

  // Museum portal — clean 3-door new visitor experience
  if (hostname === 'museum.lianabanyan.com' || hostname === 'lianabanyan-museum.web.app' || port === '5180') {
    return 'museum';
  }

  // Upekrithen portal — founder-only MoneyPenny admin
  if (rootDomain === 'upekrithen.lianabanyan.com' || hostname === 'upekrithen.lianabanyan.com' || hostname === 'upekrithen.com' || hostname === 'www.upekrithen.com' || hostname === 'lianabanyan-upekrithen.web.app' || port === '5179') {
    return 'upekrithen';
  }

  // HexIsle portal — hexisle.com, hexisle.lianabanyan.com, AND all subdomains
  if (rootDomain === 'hexisle.com' || hostname === 'hexislo.com' || hostname === 'hexisle.lianabanyan.com' || port === '5178') {
    return 'hexisle';
  }

  // DSS portal — the2ndsecond.com AND all subdomains (*.the2ndsecond.com)
  if (rootDomain === 'the2ndsecond.com' || port === '5177') {
    return 'dss';
  }

  // Non-profit portal (.org) - Fund admin, loans, member benefits
  if (rootDomain === 'lianabanyan.org' || port === '5175') {
    return 'nonprofit';
  }

  // Business network portal (.net) - B2B production, contracts, XML lockbox
  if (rootDomain === 'lianabanyan.net' || port === '5176') {
    return 'network';
  }

  // Business portal (.biz) - HR, positions, project management
  if (rootDomain === 'lianabanyan.biz' || port === '5174') {
    return 'business';
  }

  // Default to marketplace (.com) - Public discovery & contributions
  return 'marketplace';
};

/**
 * Gets the base URL for the current portal
 */
export const getPortalBaseUrl = (): string => {
  const portal = detectPortal();
  
  if (import.meta.env.DEV) {
    const portMap = {
      marketplace: 'http://localhost:5173',
      business: 'http://localhost:5174',
      nonprofit: 'http://localhost:5175',
      network: 'http://localhost:5176',
      dss: 'http://localhost:5177',
      hexisle: 'http://localhost:5178',
      upekrithen: 'http://localhost:5179',
      museum: 'http://localhost:5180'
    };
    return portMap[portal];
  }

  const domainMap = {
    marketplace: 'https://lianabanyan.com',
    business: 'https://lianabanyan.biz',
    nonprofit: 'https://lianabanyan.org',
    network: 'https://lianabanyan.net',
    dss: 'https://the2ndsecond.com',
    hexisle: 'https://hexisle.com',
    upekrithen: 'https://upekrithen.lianabanyan.com',
    museum: 'https://museum.lianabanyan.com'
  };
  return domainMap[portal];
};

/**
 * Gets the URL for a specific portal
 */
export const getPortalUrl = (portal: PortalType, path: string = '/'): string => {
  if (import.meta.env.DEV) {
    const portMap = {
      marketplace: '5173',
      business: '5174',
      nonprofit: '5175',
      network: '5176',
      dss: '5177',
      hexisle: '5178',
      upekrithen: '5179',
      museum: '5180'
    };
    return `http://localhost:${portMap[portal]}${path}`;
  }

  const domainMap = {
    marketplace: 'lianabanyan.com',
    business: 'lianabanyan.biz',
    nonprofit: 'lianabanyan.org',
    network: 'lianabanyan.net',
    dss: 'the2ndsecond.com',
    hexisle: 'hexisle.com',
    upekrithen: 'upekrithen.lianabanyan.com',
    museum: 'museum.lianabanyan.com'
  };
  return `https://${domainMap[portal]}${path}`;
};

/**
 * Checks if a route belongs to the business portal (.biz)
 */
export const isBusinessRoute = (path: string): boolean => {
  const businessRoutes = [
    '/positions',
    '/applications',
    '/manage-positions',
    '/admin-project',
    '/task-list',
    '/tasks',  // Support both /tasks and /task-list
    '/task-log',
    '/subdomain-manager',
    '/client-api-manager',
    '/credential-management',
    '/member-resources',
    '/themes',
    '/create-project',
    '/workshop',
    '/campaign-production',
    '/briefcase'
  ];
  return businessRoutes.some(route => path.startsWith(route));
};

/**
 * Checks if a route belongs to the non-profit portal (.org)
 */
export const isNonprofitRoute = (path: string): boolean => {
  const nonprofitRoutes = [
    '/funding-pool',
    '/loan-admin',
    '/gas-tracking',
    '/member-benefits',
    '/msa-plans',
    '/eoi-vesting'
  ];
  return nonprofitRoutes.some(route => path.startsWith(route));
};

/**
 * Checks if a route belongs to the business network portal (.net)
 */
export const isNetworkRoute = (path: string): boolean => {
  const networkRoutes = [
    '/production-schedules',
    '/b2b-contracts',
    '/supply-chain',
    '/manifests',
    '/industry-pricing',
    '/xml-lockbox',
    '/client-api-manager',
    '/credential-management'
  ];
  return networkRoutes.some(route => path.startsWith(route));
};

/**
 * Checks if a route belongs to the marketplace portal
 */
export const isMarketplaceRoute = (path: string): boolean => {
  const marketplaceRoutes = [
    '/marketplace',
    '/projects',
    '/project',
    '/product',
    '/portfolio',
    '/blockchain-explorer',
    '/contribution-explainer',
    '/medallion-viewer',
    '/industry-pricing'
  ];
  
  return marketplaceRoutes.some(route => path.startsWith(route));
};
