import { existsSync, readdirSync } from "fs";
import { resolve, relative } from "path";
import { glob } from "glob";
const V2_DOMAINS = [
    "admin", "beacon", "calendar", "captain", "commerce", "content",
    "currency", "defense", "financial", "gaming", "governance", "guild",
    "helm", "housing", "initiatives", "manufacturing", "membership",
    "onboarding", "outreach", "political", "reputation", "social", "vehicle",
];
// Map v2 domain names to v1 domain names where they differ
const V2_TO_V1_MAP = {
    commerce: ["storefront"],
    social: ["social_media"],
    gaming: ["hex_isle", "ghost_world"],
    reputation: ["adapt"],
    currency: ["lb_card", "financial"],
    admin: ["notifications"],
    captain: [],
    helm: [],
    content: [],
    outreach: [],
    manufacturing: ["design_battle"],
    defense: [],
    initiatives: [],
};
function countFilesInDir(dir, ext) {
    if (!existsSync(dir))
        return 0;
    try {
        const entries = readdirSync(dir, { recursive: true });
        if (!ext)
            return entries.length;
        return entries.filter(e => String(e).endsWith(ext)).length;
    }
    catch {
        return 0;
    }
}
export async function parseV2(workspaceRoot, v1Domains) {
    const v2Root = resolve(workspaceRoot, "platform-v2");
    const domainsDir = resolve(v2Root, "src", "domains");
    const domains = {};
    // Check if v2 scaffold exists
    if (!existsSync(domainsDir)) {
        return {
            domains: {},
            v2AppFiles: [],
            v2SharedComponents: 0,
            v2TotalFiles: 0,
            overallProgress: "v2 scaffold not found",
            timestamp: new Date().toISOString(),
        };
    }
    // Known audit sessions from Knight domain audit (B055)
    const AUDIT_SESSIONS = {
        membership: "K204-audit",
        financial: "K204-audit",
        onboarding: "K204-audit",
    };
    for (const domain of V2_DOMAINS) {
        const domainDir = resolve(domainsDir, domain);
        const v2Pages = countFilesInDir(resolve(domainDir, "pages"), ".tsx");
        const v2Components = countFilesInDir(resolve(domainDir, "components"), ".tsx");
        const v2Hooks = countFilesInDir(resolve(domainDir, "hooks"), ".ts");
        const v2Libs = countFilesInDir(resolve(domainDir, "lib"), ".ts");
        // Count v1 assets for this domain
        let v1Tables = 0;
        let v1Pages = 0;
        let v1Functions = 0;
        if (v1Domains) {
            // Direct mapping (same name)
            const v1Domain = v1Domains.domains[domain];
            if (v1Domain) {
                v1Tables += v1Domain.tables.length;
                v1Pages += v1Domain.pages.length;
                v1Functions += v1Domain.edgeFunctions.length;
            }
            // Also check mapped v1 domains
            const mappedV1 = V2_TO_V1_MAP[domain];
            if (mappedV1) {
                for (const v1Name of mappedV1) {
                    const mapped = v1Domains.domains[v1Name];
                    if (mapped) {
                        v1Tables += mapped.tables.length;
                        v1Pages += mapped.pages.length;
                        v1Functions += mapped.edgeFunctions.length;
                    }
                }
            }
        }
        let auditStatus = "not_started";
        if (AUDIT_SESSIONS[domain])
            auditStatus = "audited";
        if (v2Pages > 0 || v2Components > 0)
            auditStatus = "migrated";
        domains[domain] = {
            domain,
            v1Tables,
            v1Pages,
            v1Functions,
            v2Pages,
            v2Components,
            v2Hooks,
            v2Libs,
            auditStatus,
            auditSession: AUDIT_SESSIONS[domain],
        };
    }
    // Count app-level files
    const appDir = resolve(v2Root, "src", "app");
    const appFiles = [];
    if (existsSync(appDir)) {
        const files = await glob(`${appDir.replace(/\\/g, "/")}/**/*.{ts,tsx}`, { absolute: true });
        for (const f of files) {
            appFiles.push(relative(v2Root, f).replace(/\\/g, "/"));
        }
    }
    // Count shared components
    const sharedDir = resolve(v2Root, "src", "components");
    const sharedCount = existsSync(sharedDir) ? countFilesInDir(sharedDir, ".tsx") : 0;
    // Count total files (excluding node_modules and dist)
    const allFiles = await glob(`${v2Root.replace(/\\/g, "/")}/src/**/*.{ts,tsx}`, {
        absolute: true,
    });
    const audited = Object.values(domains).filter(d => d.auditStatus !== "not_started").length;
    const migrated = Object.values(domains).filter(d => d.auditStatus === "migrated" || d.auditStatus === "verified").length;
    return {
        domains,
        v2AppFiles: appFiles,
        v2SharedComponents: sharedCount,
        v2TotalFiles: allFiles.length,
        overallProgress: `${audited}/23 audited, ${migrated}/23 migrated, ${allFiles.length} total v2 files`,
        timestamp: new Date().toISOString(),
    };
}
//# sourceMappingURL=parseV2.js.map
