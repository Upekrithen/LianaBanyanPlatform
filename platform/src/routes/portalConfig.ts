import type { PortalType } from "@/utils/portalDetector";

export type RouteGroup =
  | "public"
  | "onboarding"
  | "dashboard"
  | "production"
  | "initiatives"
  | "hexisle"
  | "social"
  | "commerce"
  | "cephas"
  | "tools"
  | "admin"
  | "captain"
  | "defense"
  | "misc";

/**
 * Route groups every portal receives regardless of config.
 * Public = auth/landing/about, Onboarding = welcome/first-steps,
 * Misc = legal pages + redirects + 404 catch-all.
 */
export const UNIVERSAL_GROUPS: RouteGroup[] = [
  "public",
  "onboarding",
  "misc",
];

/**
 * Which *additional* route groups each portal can access.
 * Marketplace gets '*' (everything). Other portals get a curated subset.
 *
 * Note: universal groups are always included — don't list them here.
 */
export const PORTAL_ROUTE_ACCESS: Record<PortalType, RouteGroup[] | "*"> = {
  marketplace: "*",
  business: [
    "dashboard",
    "production",
    "commerce",
    "social",
    "tools",
    "admin",
    "cephas",
  ],
  nonprofit: [
    "dashboard",
    "commerce",
    "social",
    "defense",
    "initiatives",
    "cephas",
  ],
  network: [
    "dashboard",
    "production",
    "commerce",
    "social",
    "tools",
    "cephas",
  ],
  dss: [
    "dashboard",
    "production",
    "tools",
    "commerce",
    "cephas",
  ],
  hexisle: [
    "dashboard",
    "hexisle",
    "social",
    "commerce",
    "cephas",
  ],
  upekrithen: [
    "dashboard",
    "admin",
    "captain",
    "tools",
    "production",
    "initiatives",
    "social",
    "commerce",
    "hexisle",
    "defense",
    "cephas",
  ],
  museum: [
    "public",
    "cephas",
  ],
};

export function isGroupAllowed(
  portal: PortalType,
  group: RouteGroup,
): boolean {
  if (UNIVERSAL_GROUPS.includes(group)) return true;
  const access = PORTAL_ROUTE_ACCESS[portal];
  return access === "*" || access.includes(group);
}
