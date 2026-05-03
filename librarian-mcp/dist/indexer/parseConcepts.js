import { readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import matter from "gray-matter";
// Index ALL Cephas sections, not just architectural ones
const ALL_SECTIONS = true;
function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
}
function extractSummary(content) {
    const lines = content.split("\n");
    const paragraphs = [];
    let inParagraph = false;
    let current = "";
    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || trimmed.startsWith("|") || trimmed.startsWith("```")
            || trimmed.startsWith(">") || trimmed.startsWith("---")) {
            if (current.length > 30)
                paragraphs.push(current.trim());
            current = "";
            inParagraph = false;
            continue;
        }
        if (trimmed === "") {
            if (current.length > 30)
                paragraphs.push(current.trim());
            current = "";
            inParagraph = false;
            continue;
        }
        current += " " + trimmed;
        inParagraph = true;
    }
    if (current.length > 30)
        paragraphs.push(current.trim());
    const best = paragraphs
        .filter(p => p.length > 40 && !p.startsWith("```") && !p.startsWith("|"))
        .slice(0, 3)
        .join(" ");
    return best.slice(0, 600) || paragraphs[0]?.slice(0, 600) || "No summary available.";
}
function extractKeywords(title, content, tags) {
    const keywords = new Set(tags.map(t => t.toLowerCase()));
    const titleWords = title.toLowerCase().split(/\s+/);
    for (const w of titleWords) {
        if (w.length > 3 && !["the", "and", "for", "with", "from", "that", "this", "have", "been"].includes(w)) {
            keywords.add(w);
        }
    }
    const platformTerms = [
        "joules", "credits", "marks", "backed marks", "ghost credits",
        "cost+20", "cost plus 20", "83.3%", "creator keeps",
        "medallion", "crown", "crown jewel", "initiative",
        "guild", "crew", "family", "tribe", "node",
        "three-gear", "three gear", "currency",
        "hex isle", "hexisle", "ghost world",
        "treasure map", "beacon", "wildfire",
        "structural bylaw", "swiss standard", "switzerland rule",
        "hivi", "deterministic", "patronage",
        "nine pillars", "fourteen projects", "sweet sixteen",
        "tab system", "position funding", "star chamber",
        "castle", "helm", "keep", "ghost",
        "bifrost", "observatory", "yggdrasil",
        "patron", "sponsor", "membership",
        "ip", "patent", "innovation", "provisional",
        "defense klaus", "rally group", "msa",
        "mimictrunk", "trust ladder",
        "joule tier", "pouch", "cloth and bag",
        "sec-safe", "not a security", "not equity",
        "self-funding", "cooperative", "pre-order",
        "cost breakdown", "transparent pricing",
        "harper", "auditor", "verification",
        "medallion cascade", "liana banyan",
    ];
    const lower = content.toLowerCase();
    for (const term of platformTerms) {
        if (lower.includes(term)) {
            keywords.add(term);
        }
    }
    return [...keywords].slice(0, 40);
}
function extractRelatedConcepts(content) {
    const related = new Set();
    const linkMatches = content.matchAll(/\[([^\]]{4,80})\]\(\/(?:under-the-hood|architecture|sacred-texts|how-it-works|academics)\/[^)]+\)/g);
    for (const m of linkMatches) {
        related.add(m[1]);
    }
    const seeAlsoMatches = content.matchAll(/\*\*(?:See|See also|Related)\*\*:?\s*\[([^\]]+)\]/gi);
    for (const m of seeAlsoMatches) {
        const ref = m[1].trim();
        if (ref.length > 3 && ref.length < 100)
            related.add(ref);
    }
    const relatedSection = content.match(/##\s*Related\s*(?:Systems?|Concepts?)?\s*\n([\s\S]*?)(?=\n##|\n$)/i);
    if (relatedSection) {
        const items = relatedSection[1].matchAll(/[-*]\s*(?:\*\*)?([^*\n]+)/g);
        for (const m of items) {
            const item = m[1].trim().replace(/\(.*?\)/g, "").trim();
            if (item.length > 2 && item.length < 80)
                related.add(item);
        }
    }
    return [...related].slice(0, 20);
}
export async function parseConcepts(workspaceRoot) {
    const contentDir = resolve(workspaceRoot, "Cephas", "cephas-hugo", "content");
    const concepts = {};
    const byKeyword = {};
    const byCategory = {};
    let totalWords = 0;
    const normalizedContentDir = contentDir.replace(/\\/g, "/");
    const allFiles = await glob(`${normalizedContentDir}/**/*.md`, { absolute: true });
    for (const file of allFiles) {
        const raw = readFileSync(file, "utf-8");
        const { data: fm, content } = matter(raw);
        if (fm.title?.includes("_index") || file.endsWith("_index.md"))
            continue;
        const normalizedFile = file.replace(/\\/g, "/");
        const relPath = normalizedFile.replace(normalizedContentDir + "/", "");
        const parts = relPath.split("/");
        const section = parts.length > 1 ? parts[0] : "root";
        const title = fm.title || file.split(/[\\/]/).pop()?.replace(".md", "") || "Unknown";
        const slug = slugify(title);
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        totalWords += wordCount;
        const tags = Array.isArray(fm.tags) ? fm.tags : [];
        const keywords = extractKeywords(title, content, tags);
        const summary = extractSummary(content);
        const relatedConcepts = extractRelatedConcepts(content);
        const category = fm.category || section;
        const entry = {
            slug,
            title,
            section,
            category,
            description: fm.description,
            tags,
            keywords,
            summary,
            filePath: relPath,
            wordCount,
            relatedConcepts,
            status: fm.status,
            ipLedgerEntry: fm.ip_ledger_entry,
        };
        concepts[slug] = entry;
        if (!byCategory[category])
            byCategory[category] = [];
        byCategory[category].push(slug);
        for (const kw of keywords) {
            if (!byKeyword[kw])
                byKeyword[kw] = [];
            if (!byKeyword[kw].includes(slug))
                byKeyword[kw].push(slug);
        }
    }
    return {
        concepts,
        byKeyword,
        byCategory,
        count: Object.keys(concepts).length,
        totalWords,
    };
}
//# sourceMappingURL=parseConcepts.js.map
