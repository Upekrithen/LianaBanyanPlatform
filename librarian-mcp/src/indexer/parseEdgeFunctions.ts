import { readFileSync, existsSync } from "fs";
import { glob } from "glob";
import { basename, dirname } from "path";
import type { FunctionIndex, EdgeFunctionEntry } from "../types.js";

function detectAuth(code: string): EdgeFunctionEntry["authPattern"] {
  if (code.includes("stripe-signature") || code.includes("webhook") || code.includes("svix-id")) return "webhook";
  if (code.includes("service_role")) return "service_role";
  if (code.includes("getUser") || code.includes("auth.uid")) return "authenticated";
  if (code.includes("anon")) return "anon";
  return "unknown";
}

function detectPurpose(name: string, code: string): string {
  const lines = code.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") && !trimmed.includes("http") && !trimmed.includes("import") && !trimmed.includes("deno")) {
      const comment = trimmed.replace(/^\/\/\s*/, "");
      if (comment.length > 10 && comment.length < 200) return comment;
    }
    if (trimmed.startsWith("import") || trimmed.startsWith("export") || trimmed === "") continue;
    break;
  }

  const patterns: [RegExp, string][] = [
    [/create.*checkout/i, "Creates Stripe checkout session"],
    [/verify.*payment/i, "Verifies payment webhook"],
    [/process.*vote/i, "Processes voting logic"],
    [/send.*email|send.*reminder/i, "Sends email notifications"],
    [/social.*post|medium.*publish/i, "Publishes to social media"],
    [/webhook/i, "Handles incoming webhooks"],
    [/calendar/i, "Calendar integration"],
    [/family/i, "Family system operations"],
    [/guild/i, "Guild system operations"],
    [/vault/i, "Vault security operations"],
    [/admin/i, "Admin operations"],
    [/api-/i, "Public API endpoint"],
    [/serve-xml/i, "Serves XML data"],
    [/sync/i, "Data synchronization"],
    [/mint/i, "Minting digital assets"],
    [/ipfs/i, "IPFS pinning operations"],
    [/gift/i, "Gift system operations"],
    [/payout|connect/i, "Payout/Connect operations"],
    [/fund/i, "Funding operations"],
    [/lb-card|card/i, "LB Card operations"],
    [/printful/i, "Printful integration"],
    [/moneypenny/i, "MoneyPenny AI assistant"],
    [/dispatch/i, "Dispatch executor"],
    [/memory/i, "Memory scoring"],
    [/aggregate/i, "Order aggregation"],
  ];

  for (const [regex, desc] of patterns) {
    if (regex.test(name)) return desc;
  }
  return `Edge function: ${name}`;
}

function extractTables(code: string): string[] {
  const tables = new Set<string>();
  const matches = code.matchAll(/\.from\(["'](\w+)["']\)/g);
  for (const m of matches) tables.add(m[1]);
  const rpcMatches = code.matchAll(/\.rpc\(["'](\w+)["']/g);
  for (const m of rpcMatches) tables.add(`rpc:${m[1]}`);
  return [...tables];
}

function extractExternalApis(code: string): string[] {
  const apis = new Set<string>();
  if (code.includes("api.stripe.com") || code.includes("new Stripe") || code.includes("stripe.com")) apis.add("stripe");
  if (code.includes("mercury.com") || code.includes("mercury")) apis.add("mercury");
  if (code.includes("printful.com") || code.includes("printful")) apis.add("printful");
  if (code.includes("googleapis.com") || code.includes("google")) apis.add("google");
  if (code.includes("notion.so") || code.includes("notion")) apis.add("notion");
  if (code.includes("medium.com") || code.includes("@medium")) apis.add("medium");
  if (code.includes("graph.facebook") || code.includes("tiktok") || code.includes("twitter")) apis.add("social_media");
  if (code.includes("kickstarter")) apis.add("kickstarter");
  if (code.includes("pinata") || code.includes("ipfs")) apis.add("ipfs");
  if (code.includes("resend.com") || code.includes("Resend")) apis.add("resend");
  return [...apis];
}

function extractFeatureFlags(code: string): string[] {
  const flags = new Set<string>();
  const matches = code.matchAll(/feature_flags['"]?\)[\s\S]*?\.eq\(['"]flag_name['"],\s*['"]([^'"]+)['"]\)/g);
  for (const m of matches) flags.add(m[1]);
  const simpleMatches = code.matchAll(/flag_name.*?['"](\w+)['"]/g);
  for (const m of simpleMatches) flags.add(m[1]);
  return [...flags];
}

function extractSharedImports(code: string): string[] {
  const imports = new Set<string>();
  const matches = code.matchAll(/from\s+["']\.\.?\/_shared\/([^"']+)["']/g);
  for (const m of matches) imports.add(m[1].replace(/\.ts$/, ""));
  return [...imports];
}

export async function parseEdgeFunctions(workspaceRoot: string): Promise<FunctionIndex> {
  const funcDir = `${workspaceRoot}/platform/supabase/functions`;
  const indexFiles = await glob(`${funcDir.replace(/\\/g, "/")}/*/index.ts`, { absolute: true });
  const functions: Record<string, EdgeFunctionEntry> = {};

  const sharedDir = `${funcDir}/_shared`;
  const sharedModules: string[] = [];
  if (existsSync(sharedDir)) {
    const sharedFiles = await glob(`${sharedDir.replace(/\\/g, "/")}/*.ts`, { absolute: true });
    sharedModules.push(...sharedFiles.map(f => basename(f, ".ts")));
  }

  for (const file of indexFiles) {
    const funcName = basename(dirname(file));
    if (funcName === "_shared") continue;

    const code = readFileSync(file, "utf-8");

    const httpMethods: string[] = [];
    if (code.includes("GET")) httpMethods.push("GET");
    if (code.includes("POST")) httpMethods.push("POST");
    if (code.includes("PUT") || code.includes("PATCH")) httpMethods.push("PUT");
    if (code.includes("DELETE")) httpMethods.push("DELETE");
    if (httpMethods.length === 0) httpMethods.push("POST");

    functions[funcName] = {
      name: funcName,
      path: file.replace(/\\/g, "/").replace(workspaceRoot.replace(/\\/g, "/"), ""),
      purpose: detectPurpose(funcName, code),
      authPattern: detectAuth(code),
      httpMethods,
      tablesUsed: extractTables(code),
      externalApis: extractExternalApis(code),
      featureFlagDeps: extractFeatureFlags(code),
      sharedImports: extractSharedImports(code),
    };
  }

  return {
    functions,
    count: Object.keys(functions).length,
    sharedModules,
  };
}
