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
};
export function countWords(text) {
    return text.split(/\s+/).filter(Boolean).length;
}
export function truncateToWords(text, maxWords) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords)
        return text;
    return words.slice(0, maxWords).join(" ") + "...";
}
export function truncateList(items, max, formatter) {
    const shown = items.slice(0, max);
    const lines = shown.map(formatter);
    if (items.length > max) {
        lines.push(`... and ${items.length - max} more`);
    }
    return lines.join("\n");
}
export function budgetEnforce(text, maxWords) {
    const current = countWords(text);
    if (current <= maxWords)
        return text;
    const lines = text.split("\n");
    const result = [];
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
export function compactTable(name, columnCount) {
    return `${name} (${columnCount} cols)`;
}
export function compactFunction(name, purpose) {
    return `${name}: ${truncateToWords(purpose, 12)}`;
}
export function compactPage(name, route) {
    return `${route} -> ${name}`;
}
export function compactConcept(title, summary) {
    return `${title}: ${truncateToWords(summary, 20)}`;
}
//# sourceMappingURL=budgets.js.map
