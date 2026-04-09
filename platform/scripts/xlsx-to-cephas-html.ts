import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { homedir } from "node:os";
import xlsx from "xlsx";

type CliOptions = {
  input?: string;
  outputSlug?: string;
  title?: string;
  description?: string;
  tags?: string[];
};

const PLATFORM_ROOT = path.resolve(import.meta.dirname, "..");
const REPO_ROOT = path.resolve(PLATFORM_ROOT, "..");
const CEPHAS_CONTENT_OPS_DIR = path.resolve(REPO_ROOT, "Cephas", "cephas-hugo", "content", "ops");
const DEFAULT_WORKBOOK = "PAWN_B45_CAMPAIGN1_OPS_WORKBOOK.xlsx";

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const workbookPath = await resolveWorkbookPath(options.input);
  const workbookStat = await stat(workbookPath);

  const workbook = xlsx.readFile(workbookPath, {
    cellDates: true,
    raw: false,
  });

  const sourceFilename = path.basename(workbookPath);
  const outputSlug = options.outputSlug ?? slugify(sourceFilename.replace(/\.xlsx$/i, ""));
  const outputTitle = options.title ?? humanizeWorkbookTitle(sourceFilename);
  const description =
    options.description ??
    "Public operations workbook export generated from Excel source of truth.";
  const tags = options.tags && options.tags.length > 0
    ? options.tags
    : ["ops", "documentation-as-democracy", "xlsx-export"];
  const workbookMtime = workbookStat.mtime.toISOString();
  const outputFile = path.resolve(CEPHAS_CONTENT_OPS_DIR, `${outputSlug}.md`);

  const sections = workbook.SheetNames.map((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
      defval: "",
    });

    return renderSheetSection(sheetName, rows);
  });

  const frontmatter = [
    "---",
    `title: "${escapeFrontmatterString(outputTitle)}"`,
    `description: "${escapeFrontmatterString(description)}"`,
    `date: ${workbookMtime}`,
    `last_synced_from: "${escapeFrontmatterString(`${sourceFilename} @ ${workbookMtime}`)}"`,
    `tags: [${tags.map((tag) => `"${escapeFrontmatterString(tag)}"`).join(", ")}]`,
    "---",
    "",
  ].join("\n");

  const intro = [
    "## Source of Truth",
    "",
    `This page is auto-generated from \`${sourceFilename}\` and is intended for transparent public operations review.`,
    "",
    "---",
    "",
  ].join("\n");

  const disclaimer = [
    "",
    "---",
    "",
    "## Documentation as Democracy Disclaimer",
    "",
    "Excel remains the editable source of truth. This HTML export exists for public visibility, linkability, and auditability.",
    "If workbook content changes, re-run the export pipeline to republish this page.",
    "",
  ].join("\n");

  const body = `${frontmatter}${intro}${sections.join("\n\n")}${disclaimer}`;

  await mkdir(CEPHAS_CONTENT_OPS_DIR, { recursive: true });
  await writeFile(outputFile, body, "utf8");

  console.log(`Workbook: ${workbookPath}`);
  console.log(`Sheets exported: ${workbook.SheetNames.length}`);
  console.log(`Output: ${outputFile}`);
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--input") {
      options.input = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--slug") {
      options.outputSlug = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--title") {
      options.title = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--description") {
      options.description = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--tags") {
      options.tags = (argv[i + 1] ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      i += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      printHelpAndExit();
    }
  }
  return options;
}

function printHelpAndExit() {
  console.log("Usage:");
  console.log("  node --experimental-strip-types scripts/xlsx-to-cephas-html.ts [options]");
  console.log("");
  console.log("Options:");
  console.log("  --input <path>        Workbook path (.xlsx)");
  console.log("  --slug <value>        Output slug under Cephas /content/ops/");
  console.log("  --title <value>       Frontmatter title override");
  console.log("  --description <value> Frontmatter description override");
  console.log("  --tags <csv>          Frontmatter tags override");
  process.exit(0);
}

async function resolveWorkbookPath(inputArg?: string) {
  const candidates = inputArg
    ? [path.resolve(process.cwd(), inputArg)]
    : [
        path.resolve(process.cwd(), DEFAULT_WORKBOOK),
        path.resolve(REPO_ROOT, DEFAULT_WORKBOOK),
        path.resolve(REPO_ROOT, "ops_workbooks", DEFAULT_WORKBOOK),
        path.resolve(PLATFORM_ROOT, "ops_workbooks", DEFAULT_WORKBOOK),
        path.resolve(homedir(), "Downloads", DEFAULT_WORKBOOK),
      ];

  for (const candidate of candidates) {
    try {
      const meta = await stat(candidate);
      if (meta.isFile()) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }

  throw new Error(
    `Workbook not found. Looked for ${DEFAULT_WORKBOOK} in: ${candidates.join(", ")}`,
  );
}

function renderSheetSection(
  sheetName: string,
  rawRows: Array<Array<string | number | boolean | Date | null>>,
) {
  const rows = normalizeRows(rawRows);
  const sectionHeader = `## ${escapeMarkdownHeading(sheetName)}`;

  if (rows.length === 0) {
    return `${sectionHeader}\n\n<p><em>No rows found in this tab.</em></p>`;
  }

  const width = Math.max(...rows.map((row) => row.length), 1);
  const [headerRow, ...bodyRows] = rows;
  const normalizedHeader = ensureWidth(headerRow, width);
  const normalizedBody = bodyRows.map((row) => ensureWidth(row, width));

  const table = [
    '<div class="ops-table-wrap">',
    '<table class="ops-table">',
    "<thead>",
    "<tr>",
    ...normalizedHeader.map((cell) => `<th>${escapeHtml(cell)}</th>`),
    "</tr>",
    "</thead>",
    "<tbody>",
    ...normalizedBody.map((row, rowIndex) => {
      const cells = row
        .map((cell, cellIndex) => {
          const scope = cellIndex === 0 ? ' scope="row"' : "";
          return `<td${scope}>${escapeHtml(cell)}</td>`;
        })
        .join("");
      return `<tr data-row="${rowIndex + 1}">${cells}</tr>`;
    }),
    "</tbody>",
    "</table>",
    "</div>",
  ].join("\n");

  return `${sectionHeader}\n\n${table}`;
}

function normalizeRows(rows: Array<Array<string | number | boolean | Date | null>>) {
  const trimmedRows = rows
    .map((row) => trimTrailingEmptyCells(row.map((cell) => stringifyCell(cell))))
    .filter((row) => row.some((cell) => cell.length > 0));

  return trimmedRows;
}

function stringifyCell(cell: string | number | boolean | Date | null) {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return cell.toISOString();
  return String(cell).trim();
}

function trimTrailingEmptyCells(row: string[]) {
  const copy = [...row];
  while (copy.length > 0 && copy[copy.length - 1] === "") {
    copy.pop();
  }
  return copy;
}

function ensureWidth(row: string[], width: number) {
  const copy = [...row];
  while (copy.length < width) {
    copy.push("");
  }
  return copy.slice(0, width);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeFrontmatterString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeMarkdownHeading(value: string) {
  return value.replace(/#/g, "\\#").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.xlsx$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function humanizeWorkbookTitle(filename: string) {
  const stem = filename.replace(/\.xlsx$/i, "");
  return stem
    .split(/[_-]+/g)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`))
    .join(" ")
    .replace(/\bOps\b/g, "Ops");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
