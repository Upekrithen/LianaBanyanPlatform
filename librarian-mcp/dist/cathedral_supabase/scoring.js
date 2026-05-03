export function scoreScribeAgainstThemes(scribe, themes) {
    const primaryMatches = new Set();
    const adjacentMatches = new Set();
    const primaryHaystack = scribe.keywords.map((k) => k.toLowerCase());
    const primaryFieldLower = scribe.primary_field.toLowerCase();
    const adjacentHaystack = (scribe.adjacents || []).map((a) => (a.field || "").toLowerCase());
    for (const themeRaw of themes) {
        const theme = (themeRaw || "").toLowerCase().trim();
        if (!theme)
            continue;
        const hitsPrimary = primaryHaystack.some((kw) => kw && (theme.includes(kw) || kw.includes(theme))) ||
            primaryFieldLower.includes(theme);
        if (hitsPrimary) {
            primaryMatches.add(themeRaw);
            continue;
        }
        const hitsAdjacent = adjacentHaystack.some((field) => field && (field.includes(theme) || theme.includes(field)));
        if (hitsAdjacent)
            adjacentMatches.add(themeRaw);
    }
    const score = primaryMatches.size * 1.0 + adjacentMatches.size * 0.5;
    return {
        score,
        primaryMatches: Array.from(primaryMatches),
        adjacentMatches: Array.from(adjacentMatches),
    };
}
//# sourceMappingURL=scoring.js.map
