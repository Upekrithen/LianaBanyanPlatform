import mammoth from "mammoth";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

type ExtractionResult = {
  sourcePath: string;
  outputPath: string;
  chars: number;
  preview: string;
  warnings: string[];
};

const PLATFORM_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PLATFORM_ROOT, "..");
const JOURNAL_ARCHIVE_DIR = path.resolve(REPO_ROOT, "Asteroid-ProofVault", "Journal_Archive");
const ARCHIVE_FALLBACK_DIR = path.resolve(REPO_ROOT, "ARCHIVE2April2026", "FoundersJournal");
const REPORT_PATH = path.resolve(REPO_ROOT, "BISHOP_DROPZONE", "JOURNAL_EXTRACTION_REPORT_B075.md");

const DOCX_TARGETS = ["Journal_10.docx", "Journal_11.docx", "Journal_12.docx", "Journal_13.docx"];
const RTF_TARGET = "FoundersJournal09.rtf";

async function main() {
  const results: ExtractionResult[] = [];

  for (const filename of DOCX_TARGETS) {
    const sourcePath = await resolveInputPath(filename);
    const outputPath = path.resolve(
      JOURNAL_ARCHIVE_DIR,
      filename.replace(/\.docx$/i, "_EXTRACTED.md"),
    );

    const conversion = await mammoth.convertToMarkdown({ path: sourcePath });
    await writeFile(outputPath, conversion.value, "utf8");

    const warnings = conversion.messages.map((message) => {
      const type = message.type?.toUpperCase?.() ?? "INFO";
      return `[${type}] ${message.message}`;
    });

    console.log(`Extracted: ${outputPath} (${conversion.value.length} chars)`);
    if (warnings.length > 0) {
      console.log(`  Warnings: ${warnings.length}`);
    }

    results.push({
      sourcePath,
      outputPath,
      chars: conversion.value.length,
      preview: conversion.value.slice(0, 500),
      warnings,
    });
  }

  const rtfSourcePath = await resolveInputPath(RTF_TARGET);
  const rtfOutputPath = path.resolve(JOURNAL_ARCHIVE_DIR, "FoundersJournal09_EXTRACTED.md");
  const rtfMarkdown = await convertRtfToMarkdownWithPandoc(rtfSourcePath);
  await writeFile(rtfOutputPath, rtfMarkdown, "utf8");
  console.log(`Extracted: ${rtfOutputPath} (${rtfMarkdown.length} chars)`);

  results.push({
    sourcePath: rtfSourcePath,
    outputPath: rtfOutputPath,
    chars: rtfMarkdown.length,
    preview: rtfMarkdown.slice(0, 500),
    warnings: [],
  });

  await writeReport(results);
  console.log(`Report: ${REPORT_PATH}`);
}

async function resolveInputPath(filename: string) {
  const candidates = [
    path.resolve(JOURNAL_ARCHIVE_DIR, filename),
    path.resolve(ARCHIVE_FALLBACK_DIR, filename),
  ];

  for (const candidate of candidates) {
    try {
      const meta = await stat(candidate);
      if (meta.isFile()) return candidate;
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(`Could not locate input file: ${filename}`);
}

async function convertRtfToMarkdownWithPandoc(sourcePath: string) {
  return await new Promise<string>((resolve, reject) => {
    const proc = spawn("pandoc", ["-f", "rtf", "-t", "gfm", sourcePath], {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    proc.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    proc.on("error", (error) => {
      reject(error);
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Pandoc exited with code ${code}: ${stderr.trim()}`));
        return;
      }
      resolve(stdout);
    });
  });
}

async function writeReport(results: ExtractionResult[]) {
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });

  const header = [
    "# Journal Extraction Report — B075",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "---",
    "",
  ];

  const sections = results.map((result) => {
    const warningLines =
      result.warnings.length > 0 ? result.warnings.map((line) => `- ${line}`) : ["- None"];
    const preview = sanitizePreview(result.preview);

    return [
      `## ${path.basename(result.outputPath)}`,
      "",
      `- Source: \`${toRepoRelative(result.sourcePath)}\``,
      `- Output: \`${toRepoRelative(result.outputPath)}\``,
      `- Character count: ${result.chars}`,
      "- Warnings:",
      ...warningLines,
      "",
      "### First 500 chars",
      "",
      "```text",
      preview,
      "```",
      "",
    ].join("\n");
  });

  await writeFile(REPORT_PATH, [...header, ...sections].join("\n"), "utf8");
}

function sanitizePreview(value: string) {
  return value.replace(/\r/g, "").replace(/\u0000/g, "").trimEnd();
}

function toRepoRelative(fullPath: string) {
  return path.relative(REPO_ROOT, fullPath).replace(/\\/g, "/");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
