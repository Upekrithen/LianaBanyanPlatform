import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { resolve, basename } from "path";
const TRANSCRIPTS_DIR = "C:/Users/Administrator/.cursor/projects/c-Users-Administrator-Documents-LianaBanyanPlatform/agent-transcripts";
function parseJsonlFile(filePath) {
    try {
        const raw = readFileSync(filePath, "utf-8");
        const lines = raw.split("\n").filter(l => l.trim());
        let userMessages = 0;
        let assistantMessages = 0;
        const topics = new Set();
        const tools = new Set();
        const files = new Set();
        let firstUserMessage = "";
        let lastAssistantSummary = "";
        for (const line of lines) {
            try {
                const event = JSON.parse(line);
                if (event.role === "user" || event.type === "user") {
                    userMessages++;
                    const text = event.content || event.text || event.message || "";
                    if (typeof text === "string") {
                        if (!firstUserMessage && text.length > 10)
                            firstUserMessage = text.slice(0, 300);
                        const topicKeywords = [
                            "migration", "deploy", "stripe", "supabase", "letter",
                            "patent", "innovation", "housing", "ghost", "hex",
                            "treasure", "card", "membership", "calendar", "beacon",
                            "crew", "guild", "payout", "social", "political",
                            "onboarding", "audit", "build", "fix", "create",
                        ];
                        const lower = text.toLowerCase();
                        for (const kw of topicKeywords) {
                            if (lower.includes(kw))
                                topics.add(kw);
                        }
                    }
                }
                if (event.role === "assistant" || event.type === "assistant") {
                    assistantMessages++;
                    const text = event.content || event.text || event.message || "";
                    if (typeof text === "string" && text.length > 20) {
                        lastAssistantSummary = text.slice(0, 300);
                    }
                }
                if (event.tool || event.toolName || event.name) {
                    const toolName = event.tool || event.toolName || event.name;
                    if (typeof toolName === "string")
                        tools.add(toolName);
                }
                const textContent = JSON.stringify(event);
                const fileMatches = textContent.matchAll(/(?:platform\/src\/[^\s"]+\.tsx?|supabase\/[^\s"]+\.(?:ts|sql))/g);
                for (const m of fileMatches)
                    files.add(m[0]);
            }
            catch {
                continue;
            }
        }
        const totalMessages = userMessages + assistantMessages;
        if (totalMessages < 2)
            return null;
        const id = basename(filePath, ".jsonl");
        const stat = statSync(filePath);
        return {
            id,
            path: filePath.replace(/\\/g, "/"),
            messageCount: totalMessages,
            userMessages,
            assistantMessages,
            summary: firstUserMessage || lastAssistantSummary || `Session ${id.slice(0, 8)}`,
            topicsDiscussed: [...topics].slice(0, 20),
            toolsUsed: [...tools].slice(0, 30),
            filesModified: [...files].slice(0, 50),
            estimatedDate: stat.mtime.toISOString().split("T")[0],
        };
    }
    catch {
        return null;
    }
}
export async function parseTranscripts(transcriptsDir) {
    const dir = transcriptsDir || TRANSCRIPTS_DIR;
    const transcripts = {};
    let totalMessages = 0;
    if (!existsSync(dir)) {
        return { transcripts, count: 0, totalMessages: 0 };
    }
    const sessionDirs = readdirSync(dir).filter(name => {
        const fullPath = resolve(dir, name);
        return statSync(fullPath).isDirectory();
    });
    for (const sessionDir of sessionDirs) {
        const jsonlPath = resolve(dir, sessionDir, `${sessionDir}.jsonl`);
        if (!existsSync(jsonlPath))
            continue;
        const entry = parseJsonlFile(jsonlPath);
        if (entry) {
            transcripts[entry.id] = entry;
            totalMessages += entry.messageCount;
        }
    }
    return {
        transcripts,
        count: Object.keys(transcripts).length,
        totalMessages,
    };
}
//# sourceMappingURL=parseTranscripts.js.map
