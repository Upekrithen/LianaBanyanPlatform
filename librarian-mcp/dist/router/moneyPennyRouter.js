/**
 * MoneyPenny Smart Router -- the intelligence layer of the Librarian.
 * Converts a natural-language task description into a compact, budget-capped
 * context package that orients an AI agent in 1 tool call instead of 5-6.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "fs";
import { resolve } from "path";
import { truncateToWords, compactTable, countWords, } from "./budgets.js";
import { loadCanonicalFlat } from "../predicates/canonical_value_matches.js";
// ─── Keyword Extraction ─────────────────────────────────────────
const STOP_WORDS = new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "up", "about", "into", "through", "during",
    "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "shall", "can", "need", "must", "it", "its", "this", "that", "these",
    "those", "i", "me", "my", "we", "our", "you", "your", "they", "them",
    "their", "what", "which", "who", "when", "where", "how", "not", "no",
    "all", "each", "every", "both", "few", "more", "most", "other", "some",
    "such", "only", "own", "same", "so", "than", "too", "very", "just",
    "build", "create", "make", "add", "implement", "fix", "update", "change",
    "new", "page", "component", "feature", "function", "table",
]);
export function extractKeywords(task) {
    const words = task
        .toLowerCase()
        .replace(/[^a-z0-9\s-_]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    const bigrams = [];
    for (let i = 0; i < words.length - 1; i++) {
        bigrams.push(`${words[i]}_${words[i + 1]}`);
        bigrams.push(`${words[i]}-${words[i + 1]}`);
    }
    return [...new Set([...words, ...bigrams])];
}
export function scoreDomains(keywords, domains) {
    const scores = {};
    for (const [domainName, domain] of Object.entries(domains.domains)) {
        let score = 0;
        const domainLower = domainName.toLowerCase().replace(/_/g, " ");
        const domainTokens = domainLower.split(/[\s_-]+/);
        for (const kw of keywords) {
            if (domainLower.includes(kw) || domainTokens.some(t => t === kw)) {
                score += 5;
            }
            for (const t of domain.tables) {
                if (t.toLowerCase().includes(kw))
                    score += 2;
            }
            for (const f of domain.edgeFunctions) {
                if (f.toLowerCase().includes(kw))
                    score += 2;
            }
            for (const p of domain.pages) {
                if (p.toLowerCase().includes(kw))
                    score += 1;
            }
        }
        if (score > 0)
            scores[domainName] = score;
    }
    return Object.entries(scores)
        .map(([name, score]) => ({ name, score }))
        .sort((a, b) => b.score - a.score);
}
// ─── brief_me ───────────────────────────────────────────────────
export function buildBriefing(task, overview, schemas, functions, pages, concepts, domains, context, dropzones, transcripts, rules) {
    const keywords = extractKeywords(task);
    const lower = task.toLowerCase();
    // 1. Domain matching
    const scored = domains ? scoreDomains(keywords, domains) : [];
    const topDomains = scored.slice(0, 2);
    const matchedDomains = topDomains.map(sd => {
        const domain = domains.domains[sd.name];
        const tables = domain.tables.map(t => {
            const table = schemas?.tables[t];
            return compactTable(t, table?.columns.length || 0);
        });
        const funcs = domain.edgeFunctions.slice(0, 5).map(f => {
            const fn = functions?.functions[f];
            return { name: f, purpose: fn?.purpose || "unknown" };
        });
        const pageList = domain.pages.slice(0, 5).map(p => {
            const pg = pages?.pages[p];
            return { name: p, route: pg?.route || "?" };
        });
        return {
            name: sd.name,
            tables,
            functions: funcs,
            pages: pageList,
            featureFlags: domain.featureFlags.slice(0, 5),
        };
    });
    // 2. Concept matching
    const relevantConcepts = [];
    if (concepts) {
        const matchedSlugs = new Set();
        for (const kw of keywords) {
            const byKw = concepts.byKeyword[kw];
            if (byKw) {
                for (const slug of byKw.slice(0, 3))
                    matchedSlugs.add(slug);
            }
        }
        for (const slug of [...matchedSlugs].slice(0, 5)) {
            const c = concepts.concepts[slug];
            if (c) {
                relevantConcepts.push({
                    title: c.title,
                    slug,
                    summary: truncateToWords(c.summary, 20),
                });
            }
        }
    }
    // 3. Applicable rules
    const applicableRules = [];
    const alwaysInclude = ["creator-keeps", "cost-plus-20", "not-a-security", "membership-cost"];
    for (const rule of rules) {
        if (alwaysInclude.includes(rule.id)) {
            applicableRules.push({ id: rule.id, rule: rule.rule, severity: rule.severity });
            continue;
        }
        const ruleWords = rule.rule.toLowerCase();
        if (keywords.some(kw => ruleWords.includes(kw)) ||
            (lower.includes("ui") && rule.id === "wildfire-tour-data") ||
            (lower.includes("deploy") && (rule.id === "firebase-hosting-main" || rule.id === "powershell-syntax")) ||
            (lower.includes("letter") && rule.id === "letter-sync") ||
            (lower.includes("cephas") && rule.id === "letter-sync")) {
            applicableRules.push({ id: rule.id, rule: rule.rule, severity: rule.severity });
        }
    }
    // 4. Past work
    const pastWork = [];
    if (context) {
        for (const session of context.sessions.slice(-10)) {
            if (keywords.some(kw => session.summary.toLowerCase().includes(kw))) {
                pastWork.push({
                    source: "session",
                    id: session.id,
                    summary: truncateToWords(session.summary, 20),
                });
            }
        }
    }
    if (dropzones) {
        for (const entry of Object.values(dropzones.entries)) {
            if (keywords.some(kw => entry.title.toLowerCase().includes(kw) ||
                entry.tags.some(t => t.includes(kw)))) {
                pastWork.push({
                    source: `dropzone:${entry.agent}`,
                    id: entry.filename,
                    summary: truncateToWords(entry.title, 15),
                });
                if (pastWork.length >= 8)
                    break;
            }
        }
    }
    if (transcripts) {
        for (const t of Object.values(transcripts.transcripts)) {
            if (keywords.some(kw => t.summary.toLowerCase().includes(kw) ||
                t.topicsDiscussed.some(tp => tp.includes(kw)))) {
                pastWork.push({
                    source: "transcript",
                    id: t.id.slice(0, 8),
                    summary: truncateToWords(t.summary, 15),
                });
                if (pastWork.length >= 12)
                    break;
            }
        }
    }
    // 5. Canonical reminders — read from YAML source of truth
    let canonicalReminders = {
        creatorKeeps: "83.3%",
        platformMargin: "Cost + 20%",
        membershipCost: "$5/year",
        innovationCount: overview?.innovationCount || 1938,
        initiativeCount: 16,
    };
    try {
        const flat = loadCanonicalFlat();
        canonicalReminders = {
            creatorKeeps: `${flat["economics.creator_keeps_percentage"]}%`,
            platformMargin: String(flat["economics.platform_margin"]),
            membershipCost: `$${flat["economics.membership_cost_usd_per_year"]}/year`,
            innovationCount: flat["stats.innovation_count"] ?? canonicalReminders.innovationCount,
            initiativeCount: 16,
        };
    }
    catch { /* YAML not available, use fallback */ }
    const pkg = {
        task,
        matchedDomains,
        relevantConcepts,
        applicableRules,
        pastWork: pastWork.slice(0, 8),
        canonicalReminders,
        wordCount: 0,
    };
    const text = JSON.stringify(pkg);
    pkg.wordCount = countWords(text);
    return pkg;
}
// ─── moneypenny_checklist ───────────────────────────────────────
export function buildChecklist(task, schemas, functions, context, concepts, domains, dropzones, rules) {
    const lower = task.toLowerCase();
    const keywords = extractKeywords(task);
    // Consistency check
    const violations = [];
    const warnings = [];
    for (const rule of rules) {
        switch (rule.id) {
            case "creator-keeps":
                if (lower.includes("83%") && !lower.includes("83.3%"))
                    violations.push({ rule: rule.rule, issue: "Use 83.3%, not 83%." });
                break;
            case "cost-plus-20":
                if ((lower.includes("cost") && lower.includes("25%")) || lower.includes("cost+25"))
                    violations.push({ rule: rule.rule, issue: "Platform margin is Cost+20%, not 25%." });
                break;
            case "not-a-security":
                if (/\b(equity|shares?|dividend|roi)\b/.test(lower) && !lower.includes("not"))
                    violations.push({ rule: rule.rule, issue: "SEC-unsafe language detected." });
                if (/\binvest(ment|or|ing)?\b/.test(lower) && !lower.includes("not invest"))
                    warnings.push({ rule: rule.rule, issue: "'invest' may trigger SEC concerns. Use 'back'/'support'/'contribute'." });
                break;
            case "no-passive-income":
                if (lower.includes("passive income") || lower.includes("will earn"))
                    violations.push({ rule: rule.rule, issue: "Never promise passive income." });
                break;
            case "wildfire-tour-data":
                if ((lower.includes("mock") || lower.includes("demo")) && lower.includes("default"))
                    warnings.push({ rule: rule.rule, issue: "Mock data only in WildFire Tour mode." });
                break;
            case "membership-cost":
                if (lower.includes("membership") && /\$\d/.test(lower) && !lower.includes("$5"))
                    violations.push({ rule: rule.rule, issue: "Membership is $5/year (Structural Bylaw)." });
                break;
            case "privacy-no-demographics":
                if (/\b(race|gender|age|religion|ethnicity)\b/.test(lower) && lower.includes("collect"))
                    violations.push({ rule: rule.rule, issue: "Structural Privacy Bylaw prohibits demographic data." });
                break;
        }
    }
    // Prerequisites
    const prerequisites = [];
    const scored = domains ? scoreDomains(keywords, domains) : [];
    if (scored.length > 0 && domains && schemas) {
        const topDomain = domains.domains[scored[0].name];
        if (topDomain) {
            const missingTables = topDomain.tables.filter(t => !schemas.tables[t]);
            if (missingTables.length > 0) {
                prerequisites.push(`Tables not yet created: ${missingTables.join(", ")}`);
            }
            for (const fn of topDomain.edgeFunctions.slice(0, 3)) {
                if (!functions?.functions[fn]) {
                    prerequisites.push(`Edge function not yet indexed: ${fn}`);
                }
            }
        }
    }
    // Related sessions
    const relatedSessions = [];
    if (context) {
        for (const session of context.sessions.slice(-15)) {
            if (keywords.some(kw => session.summary.toLowerCase().includes(kw))) {
                relatedSessions.push({
                    id: session.id,
                    summary: truncateToWords(session.summary, 15),
                });
            }
        }
    }
    // Reminders
    const reminders = [
        "Creator keeps 83.3% | Platform margin: Cost+20% | Membership: $5/year",
    ];
    if (lower.includes("ui") || lower.includes("page") || lower.includes("component")) {
        reminders.push("WildFire Tour: mock data ONLY in tour mode, real users see empty/zero state.");
    }
    if (lower.includes("letter") || lower.includes("cephas")) {
        reminders.push("Letter Sync: any letter update in LAUNCH_DOCUMENTS_MASTER must mirror to Cephas.");
    }
    if (lower.includes("deploy") || lower.includes("firebase")) {
        reminders.push("Deploy: lianabanyan.com uses hosting:main (NOT hosting:dotcom). PowerShell uses ';' not '&&'.");
    }
    if (lower.includes("migration") || lower.includes("table") || lower.includes("schema")) {
        reminders.push("Query database state before writing SQL fixes. Run: SELECT column_name FROM information_schema.columns WHERE table_name = 'x';");
    }
    return {
        task,
        consistencyStatus: violations.length > 0 ? "VIOLATIONS FOUND" : "CONSISTENT",
        violations,
        warnings,
        prerequisites,
        relatedSessions: relatedSessions.slice(0, 5),
        reminders,
    };
}
// ─── moneypenny_debrief ─────────────────────────────────────────
export function buildDebrief(sessionId, summary, filesChanged, migrationsCreated, functionsCreated, pagesCreated, pendingWork, indexDir, overview, rules) {
    // Log session
    const sessionsPath = resolve(indexDir, "sessions.json");
    let sessions = [];
    if (existsSync(sessionsPath)) {
        sessions = JSON.parse(readFileSync(sessionsPath, "utf-8"));
    }
    sessions.push({
        id: sessionId,
        date: new Date().toISOString().split("T")[0],
        summary,
        filesChanged,
        migrationsCreated,
        functionsCreated,
        pagesCreated,
        pendingWork,
    });
    if (!existsSync(indexDir))
        mkdirSync(indexDir, { recursive: true });
    writeFileSync(sessionsPath, JSON.stringify(sessions, null, 2), "utf-8");
    // Update overview.json by merging — preserve index counts from last rebuild,
    // only update session tracking fields. Canonical numbers come from YAML, not session context.
    const overviewPath = resolve(indexDir, "overview.json");
    const canonicalDrifts = [];
    if (existsSync(overviewPath)) {
        const current = JSON.parse(readFileSync(overviewPath, "utf-8"));
        current.lastSession = sessionId;
        current.pendingWork = pendingWork;
        current.timestamp = new Date().toISOString();
        // K406 fix: reconcile canonical numbers from YAML source of truth
        try {
            const flat = loadCanonicalFlat();
            const mapping = [
                ["innovationCount", "stats.innovation_count"],
                ["crownJewelCount", "stats.crown_jewels"],
                ["formalClaimsCount", "stats.formal_claims_approximate"],
                ["provisionalApps", "stats.patent_provisionals_filed"],
            ];
            for (const [ovKey, yamlKey] of mapping) {
                const yamlVal = flat[yamlKey];
                if (yamlVal !== undefined && current[ovKey] !== yamlVal) {
                    canonicalDrifts.push(`${ovKey}: overview had ${current[ovKey]}, YAML says ${yamlVal} — corrected`);
                    current[ovKey] = yamlVal;
                }
            }
        }
        catch {
            canonicalDrifts.push("canonical_values.yaml not readable — canonical numbers NOT reconciled");
        }
        writeFileSync(overviewPath, JSON.stringify(current, null, 2), "utf-8");
        if (overview) {
            overview.lastSession = sessionId;
            overview.pendingWork = pendingWork;
            overview.timestamp = current.timestamp;
        }
    }
    else if (overview) {
        overview.lastSession = sessionId;
        overview.pendingWork = pendingWork;
        overview.timestamp = new Date().toISOString();
        writeFileSync(overviewPath, JSON.stringify(overview, null, 2), "utf-8");
    }
    // Quick consistency check on summary
    const lower = summary.toLowerCase();
    let consistencyCheck = "CONSISTENT";
    if (lower.includes("83%") && !lower.includes("83.3%"))
        consistencyCheck = "WARNING: Use 83.3%, not 83%";
    if (/\b(equity|shares|dividend)\b/.test(lower))
        consistencyCheck = "WARNING: SEC-unsafe language in summary";
    // Sync reminders
    const syncReminders = [];
    // Surface canonical drift corrections from YAML reconciliation
    for (const drift of canonicalDrifts) {
        syncReminders.push(`Canonical reconciliation: ${drift}`);
    }
    const touchesCephas = filesChanged.some(f => f.toLowerCase().includes("cephas"));
    const touchesLetters = filesChanged.some(f => f.toLowerCase().includes("letter"));
    if (touchesCephas || touchesLetters) {
        syncReminders.push("Letter Sync: ensure LAUNCH_DOCUMENTS_MASTER and Cephas letters are in sync.");
    }
    if (migrationsCreated.length > 0) {
        syncReminders.push(`Run 'cd platform; npx supabase db push' to apply ${migrationsCreated.length} new migration(s).`);
    }
    if (functionsCreated.length > 0) {
        syncReminders.push(`Deploy new edge functions: cd platform; npx supabase functions deploy ${functionsCreated.join(" ")}`);
    }
    // Handoff notes
    const handoffNotes = [
        `Session ${sessionId} completed ${new Date().toISOString().split("T")[0]}`,
        `Files changed: ${filesChanged.length}`,
        `Migrations: ${migrationsCreated.length}`,
        `Functions: ${functionsCreated.length}`,
        `Pages: ${pagesCreated.length}`,
    ];
    if (pendingWork.length > 0) {
        handoffNotes.push(`Pending: ${pendingWork.join("; ")}`);
    }
    return {
        sessionId,
        summary,
        logged: true,
        consistencyCheck,
        syncReminders,
        handoffNotes,
    };
}
//# sourceMappingURL=moneyPennyRouter.js.map
