import { readFileSync } from "fs";
import { glob } from "glob";
import { basename } from "path";
import type { PageIndex, PageEntry } from "../types.js";

interface RouteInfo {
  path: string;
  component: string;
  isProtected: boolean;
  isPaidMember: boolean;
  isLazy: boolean;
}

function parseAppRoutes(workspaceRoot: string): RouteInfo[] {
  const appPath = `${workspaceRoot}/platform/src/App.tsx`;
  const code = readFileSync(appPath, "utf-8");
  const routes: RouteInfo[] = [];

  const lazyImports = new Set<string>();
  const lazyMatches = code.matchAll(/const\s+(\w+)\s*=\s*lazy\s*\(/g);
  for (const m of lazyMatches) lazyImports.add(m[1]);

  const routeMatches = code.matchAll(
    /<Route\s+path="([^"]+)"\s+element=\{([^}]+(?:\{[^}]*\})*[^}]*)\}/g
  );

  for (const m of routeMatches) {
    const routePath = m[1];
    const elementStr = m[2];

    const componentMatch = elementStr.match(/<(\w+)/);
    if (!componentMatch) continue;

    let component = componentMatch[1];
    if (["Navigate", "ProtectedRoute", "PaidMemberRoute", "ExplorerRoute", "Suspense"].includes(component)) {
      const innerMatch = elementStr.match(/<(?:ProtectedRoute|PaidMemberRoute|ExplorerRoute|Suspense[^>]*)>\s*(?:<Suspense[^>]*>)?\s*<(\w+)/);
      if (innerMatch) component = innerMatch[1];
    }

    if (component === "Navigate") continue;

    routes.push({
      path: routePath,
      component,
      isProtected: elementStr.includes("ProtectedRoute"),
      isPaidMember: elementStr.includes("PaidMemberRoute"),
      isLazy: lazyImports.has(component) || elementStr.includes("Suspense"),
    });
  }
  return routes;
}

function analyzePageFile(filePath: string): {
  supabaseQueries: string[];
  edgeFunctionCalls: string[];
  featureFlagDeps: string[];
  imports: string[];
} {
  const code = readFileSync(filePath, "utf-8");

  const supabaseQueries = new Set<string>();
  const fromMatches = code.matchAll(/\.from\(["'](\w+)["']\)/g);
  for (const m of fromMatches) supabaseQueries.add(m[1]);

  const edgeFunctionCalls = new Set<string>();
  const invokeMatches = code.matchAll(/functions\.invoke\(["']([^"']+)["']/g);
  for (const m of invokeMatches) edgeFunctionCalls.add(m[1]);
  const fnMatches = code.matchAll(/supabase\.functions\.invoke(?:<[^>]+>)?\(["']([^"']+)["']/g);
  for (const m of fnMatches) edgeFunctionCalls.add(m[1]);

  const featureFlagDeps = new Set<string>();
  const flagMatches = code.matchAll(/feature_flags['"]?\)[\s\S]{0,100}?['"](\w+)['"]/g);
  for (const m of flagMatches) featureFlagDeps.add(m[1]);
  const flagMatches2 = code.matchAll(/flag_name.*?['"](\w+)['"]/g);
  for (const m of flagMatches2) featureFlagDeps.add(m[1]);

  const imports = new Set<string>();
  const importMatches = code.matchAll(/from\s+["'](@\/[^"']+|\.\.?\/[^"']+)["']/g);
  for (const m of importMatches) imports.add(m[1]);

  return {
    supabaseQueries: [...supabaseQueries],
    edgeFunctionCalls: [...edgeFunctionCalls],
    featureFlagDeps: [...featureFlagDeps],
    imports: [...imports],
  };
}

export async function parsePages(workspaceRoot: string): Promise<PageIndex> {
  const pageFiles = await glob(`${workspaceRoot.replace(/\\/g, "/")}/platform/src/pages/**/*.tsx`, { absolute: true });
  const routeInfos = parseAppRoutes(workspaceRoot);

  const routeMap = new Map<string, RouteInfo>();
  for (const r of routeInfos) {
    routeMap.set(r.component, r);
  }

  const pages: Record<string, PageEntry> = {};
  const routes: Record<string, string> = {};

  for (const file of pageFiles) {
    const name = basename(file, ".tsx");
    const analysis = analyzePageFile(file);
    const routeInfo = routeMap.get(name);

    const entry: PageEntry = {
      name,
      path: file.replace(/\\/g, "/").replace(workspaceRoot.replace(/\\/g, "/"), ""),
      route: routeInfo?.path || "unmapped",
      isLazy: routeInfo?.isLazy ?? false,
      isProtected: routeInfo?.isProtected ?? false,
      isPaidMember: routeInfo?.isPaidMember ?? false,
      ...analysis,
    };

    pages[name] = entry;
    if (routeInfo) {
      routes[routeInfo.path] = name;
    }
  }

  return {
    pages,
    routes,
    count: Object.keys(pages).length,
  };
}
