import { readFileSync } from "fs";
import { resolve } from "path";
import { glob } from "glob";
import matter from "gray-matter";
export async function parseCephas(workspaceRoot) {
    const contentDir = resolve(workspaceRoot, "Cephas", "cephas-hugo", "content");
    const files = await glob(`${contentDir.replace(/\\/g, "/")}/**/*.md`, { absolute: true });
    const entries = {};
    const sections = {};
    for (const file of files) {
        const raw = readFileSync(file, "utf-8");
        const { data: fm, content } = matter(raw);
        const normalizedFile = file.replace(/\\/g, "/");
        const normalizedDir = contentDir.replace(/\\/g, "/");
        const relPath = normalizedFile.replace(normalizedDir, "").replace(/^\//, "");
        const parts = relPath.split("/");
        const section = parts.length > 1 ? parts[0] : "root";
        sections[section] = (sections[section] || 0) + 1;
        const wordCount = content.split(/\s+/).filter(Boolean).length;
        entries[relPath] = {
            path: relPath,
            title: fm.title || relPath,
            date: fm.date?.toString(),
            section,
            tags: Array.isArray(fm.tags) ? fm.tags : [],
            initiative: fm.initiative,
            initiativeNumber: fm.initiative_number,
            recipient: fm.recipient,
            letterType: fm.letter_type,
            description: fm.description,
            wordCount,
        };
    }
    return {
        entries,
        sections,
        count: Object.keys(entries).length,
    };
}
//# sourceMappingURL=parseCephas.js.map
