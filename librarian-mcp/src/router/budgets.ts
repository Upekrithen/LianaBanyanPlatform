/**
 * Response budget enforcement for MoneyPenny routing layer.
 * Controls output size to minimize AI context window consumption.
 */

export const BUDGETS = {
  briefMe: 800,
  checklist: 400,
  debrief: 250,
  listDefault: 20,
  searchDefault: 15,
  architectureBrief: 150,
} as const;

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ") + "...";
}

export function truncateList<T>(
  items: T[],
  max: number,
  formatter: (item: T) => string,
): string {
  const shown = items.slice(0, max);
  const lines = shown.map(formatter);
  if (items.length > max) {
    lines.push(`... and ${items.length - max} more`);
  }
  return lines.join("\n");
}

export function budgetEnforce(text: string, maxWords: number): string {
  const current = countWords(text);
  if (current <= maxWords) return text;

  const lines = text.split("\n");
  const result: string[] = [];
  let words = 0;

  for (const line of lines) {
    const lineWords = countWords(line);
    if (words + lineWords > maxWords) {
      result.push("... [truncated for context budget]");
      break;
    }
    result.push(line);
    words += lineWords;
  }

  return result.join("\n");
}

export function compactTable(name: string, columnCount: number): string {
  return `${name} (${columnCount} cols)`;
}

export function compactFunction(name: string, purpose: string): string {
  return `${name}: ${truncateToWords(purpose, 12)}`;
}

export function compactPage(name: string, route: string): string {
  return `${route} -> ${name}`;
}

export function compactConcept(title: string, summary: string): string {
  return `${title}: ${truncateToWords(summary, 20)}`;
}
