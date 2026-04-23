import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, statSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";

export interface FingerprintRecord {
  timestamp: string;
  elapsedMs: number;
  mode: "full" | "incremental";
  treeHash: string;
  fileCount: number;
  fileMtimes: Record<string, number>;
}

export interface FreshnessReport {
  status: "FRESH" | "DRIFT" | "UNKNOWN";
  lastBuild: string | null;
  lastBuildMode: string | null;
  ageMs: number | null;
  changedFiles: string[];
  newFiles: string[];
  deletedFiles: string[];
  totalDrift: number;
}

const SCAN_DIRS = [
  "BISHOP_DROPZONE",
  "KNIGHT_DROPZONE",
  "ROOK_DROPZONE",
  "PAWN_DROPZONE",
  "CONTEXT_MANAGEMENT",
  "Cephas/cephas-hugo/content",
  "platform/supabase/migrations",
  "platform/supabase/functions",
  "platform/src/pages",
  "platform/src/components",
  "platform/src/hooks",
  "platform/src/lib",
];

const SCAN_EXTENSIONS = new Set([
  ".md", ".ts", ".tsx", ".sql", ".yaml", ".yml", ".json", ".css",
  ".docx", ".rtf",
]);

async function collectFileMtimes(workspaceRoot: string): Promise<Record<string, number>> {
  const mtimes: Record<string, number> = {};
  for (const dir of SCAN_DIRS) {
    const absDir = resolve(workspaceRoot, dir).replace(/\\/g, "/");
    if (!existsSync(absDir)) continue;
    const files = await glob(`${absDir}/**/*`, { absolute: true, nodir: true });
    for (const file of files) {
      const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
      if (!SCAN_EXTENSIONS.has(ext)) continue;
      try {
        const stat = statSync(file);
        const relPath = file.replace(/\\/g, "/").replace(workspaceRoot.replace(/\\/g, "/") + "/", "");
        mtimes[relPath] = stat.mtimeMs;
      } catch { /* skip inaccessible files */ }
    }
  }
  return mtimes;
}

function computeTreeHash(mtimes: Record<string, number>): string {
  const sorted = Object.entries(mtimes).sort(([a], [b]) => a.localeCompare(b));
  const hash = createHash("sha256");
  for (const [path, mtime] of sorted) {
    hash.update(`${path}:${mtime}\n`);
  }
  return hash.digest("hex").slice(0, 16);
}

export async function writeFingerprint(
  indexDir: string,
  workspaceRoot: string,
  elapsedMs: number,
  mode: "full" | "incremental",
): Promise<FingerprintRecord> {
  const mtimes = await collectFileMtimes(workspaceRoot);
  const record: FingerprintRecord = {
    timestamp: new Date().toISOString(),
    elapsedMs,
    mode,
    treeHash: computeTreeHash(mtimes),
    fileCount: Object.keys(mtimes).length,
    fileMtimes: mtimes,
  };
  writeFileSync(
    resolve(indexDir, "last_build_fingerprint.json"),
    JSON.stringify(record, null, 2),
    "utf-8",
  );
  return record;
}

export async function checkFreshness(
  indexDir: string,
  workspaceRoot: string,
): Promise<FreshnessReport> {
  const fpPath = resolve(indexDir, "last_build_fingerprint.json");
  if (!existsSync(fpPath)) {
    return {
      status: "UNKNOWN",
      lastBuild: null,
      lastBuildMode: null,
      ageMs: null,
      changedFiles: [],
      newFiles: [],
      deletedFiles: [],
      totalDrift: 0,
    };
  }

  let prev: FingerprintRecord;
  try {
    prev = JSON.parse(readFileSync(fpPath, "utf-8"));
  } catch {
    return {
      status: "UNKNOWN",
      lastBuild: null,
      lastBuildMode: null,
      ageMs: null,
      changedFiles: [],
      newFiles: [],
      deletedFiles: [],
      totalDrift: 0,
    };
  }

  const currentMtimes = await collectFileMtimes(workspaceRoot);
  const currentHash = computeTreeHash(currentMtimes);
  const ageMs = Date.now() - new Date(prev.timestamp).getTime();

  if (currentHash === prev.treeHash) {
    return {
      status: "FRESH",
      lastBuild: prev.timestamp,
      lastBuildMode: prev.mode,
      ageMs,
      changedFiles: [],
      newFiles: [],
      deletedFiles: [],
      totalDrift: 0,
    };
  }

  const changedFiles: string[] = [];
  const newFiles: string[] = [];
  const deletedFiles: string[] = [];

  const prevFiles = new Set(Object.keys(prev.fileMtimes));
  const currentFiles = new Set(Object.keys(currentMtimes));

  for (const f of currentFiles) {
    if (!prevFiles.has(f)) {
      newFiles.push(f);
    } else if (currentMtimes[f] !== prev.fileMtimes[f]) {
      changedFiles.push(f);
    }
  }
  for (const f of prevFiles) {
    if (!currentFiles.has(f)) {
      deletedFiles.push(f);
    }
  }

  return {
    status: "DRIFT",
    lastBuild: prev.timestamp,
    lastBuildMode: prev.mode,
    ageMs,
    changedFiles,
    newFiles,
    deletedFiles,
    totalDrift: changedFiles.length + newFiles.length + deletedFiles.length,
  };
}

export function getChangedDropzoneFiles(
  report: FreshnessReport,
): string[] {
  const dropzonePrefixes = ["BISHOP_DROPZONE/", "KNIGHT_DROPZONE/", "ROOK_DROPZONE/", "PAWN_DROPZONE/"];
  const all = [...report.changedFiles, ...report.newFiles];
  return all.filter(f => dropzonePrefixes.some(p => f.startsWith(p)));
}
