import { readFileSync } from "fs";
import { resolve, basename } from "path";
import { glob } from "glob";
import type { ComponentIndex, ComponentEntry } from "../types.js";

function parseFile(filePath: string, type: ComponentEntry["type"]): ComponentEntry {
  const code = readFileSync(filePath, "utf-8");
  const name = basename(filePath).replace(/\.\w+$/, "");

  const exports = new Set<string>();
  const exportMatches = code.matchAll(/export\s+(?:default\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g);
  for (const m of exportMatches) exports.add(m[1]);
  const defaultExport = code.match(/export\s+default\s+(\w+)/);
  if (defaultExport) exports.add(defaultExport[1]);

  const imports = new Set<string>();
  const importMatches = code.matchAll(/from\s+["']([^"']+)["']/g);
  for (const m of importMatches) imports.add(m[1]);

  const supabaseQueries = new Set<string>();
  const fromMatches = code.matchAll(/\.from\(["'](\w+)["']\)/g);
  for (const m of fromMatches) supabaseQueries.add(m[1]);
  const invokeMatches = code.matchAll(/functions\.invoke\(["']([^"']+)["']/g);
  for (const m of invokeMatches) supabaseQueries.add(`fn:${m[1]}`);

  let propsInterface: string | undefined;
  const propsMatch = code.match(/(?:interface|type)\s+(\w*Props\w*)\s*[={]/);
  if (propsMatch) propsInterface = propsMatch[1];

  return {
    name,
    path: filePath.replace(/\\/g, "/"),
    type,
    exports: [...exports],
    imports: [...imports],
    supabaseQueries: [...supabaseQueries],
    propsInterface,
    wordCount: code.split(/\s+/).filter(Boolean).length,
  };
}

export async function parseComponents(workspaceRoot: string): Promise<ComponentIndex> {
  const srcDir = resolve(workspaceRoot, "platform", "src");
  const normalizedSrc = srcDir.replace(/\\/g, "/");

  const componentFiles = await glob(`${normalizedSrc}/components/**/*.tsx`, { absolute: true });
  const hookFiles = await glob(`${normalizedSrc}/hooks/**/*.ts`, { absolute: true });
  const libFiles = await glob(`${normalizedSrc}/lib/**/*.ts`, { absolute: true });

  const components: Record<string, ComponentEntry> = {};
  const hooks: Record<string, ComponentEntry> = {};
  const libs: Record<string, ComponentEntry> = {};

  for (const file of componentFiles) {
    const entry = parseFile(file, "component");
    const relPath = file.replace(/\\/g, "/").replace(normalizedSrc + "/", "");
    components[relPath] = entry;
  }

  for (const file of hookFiles) {
    const entry = parseFile(file, "hook");
    hooks[entry.name] = entry;
  }

  for (const file of libFiles) {
    const entry = parseFile(file, "lib");
    libs[entry.name] = entry;
  }

  return {
    components,
    hooks,
    libs,
    count: Object.keys(components).length + Object.keys(hooks).length + Object.keys(libs).length,
  };
}
