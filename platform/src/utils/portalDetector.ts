/**
 * Portal Detection Utility
 * Determines which portal (Marketplace or Business) to load based on hostname
 */

export type PortalType = 'marketplace' | 'business' | 'nonprofit' | 'network' | 'dss' | 'hexisle';

/**
 * Detects the current portal based on the hostname
 * - lianabanyan.com / localhost:5173 → Marketplace Portal (public)
 * - lianabanyan.biz / localhost:5174 → Business Portal (operations)
 * - lianabanyan.org / localhost:5175 → Non-Profit Portal (financial services)
 * - lianabanyan.net / localhost:5176 → Business Network Portal (B2B)
 */
export const detectPortal = (): PortalType => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const path = window.location.pathname;
  
  // Route-based detection (works in dev/preview without separate domains)
  if (isBusinessRoute(path)) return 'business';
  if (isNonprofitRoute(path)) return 'nonprofit';
  if (isNetworkRoute(path)) return 'network';
  
  // Non-profit portal (.org) - Fund admin, loans, member benefits
  if (hostname.includes('lianabanyan.org') || port === '5175') {
    return 'nonprofit';
  }
  
  // Business network portal (.net) - B2B production, contracts, XML lockbox
  if (hostname.includes('lianabanyan.net') || port === '5176') {
    return 'network';
  }
  
  // Business portal (.biz) - HR, positions, project management
  if (hostname.includes('lianabanyan.biz') || port === '5174') {
    return 'business';
  }
  
  // DSS portal (the2ndsecond.com)
  if (hostname.includes('the2ndsecond.com') || port === '5177') {
    return 'dss';
  }
  
  // HexIsle portal (hexisle.com)
  if (hostname.includes('hexisle.com') || port === '5178') {
    return 'hexisle';
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
      hexisle: 'http://localhost:5178'
    };
    return portMap[portal];
  }
  
  const domainMap = {
    marketplace: 'https://lianabanyan.com',
    business: 'https://lianabanyan.biz',
    nonprofit: 'https://lianabanyan.org',
    network: 'https://lianabanyan.net',
    dss: 'https://the2ndsecond.com',
    hexisle: 'https://hexisle.com'
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
      hexisle: '5178'
    };
    return `http://localhost:${portMap[portal]}${path}`;
  }
  
  const domainMap = {
    marketplace: 'lianabanyan.com',
    business: 'lianabanyan.biz',
    nonprofit: 'lianabanyan.org',
    network: 'lianabanyan.net',
    dss: 'the2ndsecond.com',
    hexisle: 'hexisle.com'
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
