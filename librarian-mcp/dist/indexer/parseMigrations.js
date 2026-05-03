import { readFileSync } from "fs";
import { glob } from "glob";
import { basename } from "path";
function parseColumns(body) {
    const cols = [];
    const lines = body.split("\n");
    for (const raw of lines) {
        const line = raw.trim();
        if (!line || line.startsWith("--") || line.startsWith("CONSTRAINT")
            || line.startsWith("UNIQUE") || line.startsWith("PRIMARY")
            || line.startsWith("CHECK") || line.startsWith("FOREIGN")
            || line === ")" || line === ");")
            continue;
        const match = line.match(/^(\w+)\s+([\w\[\]()]+(?:\(\d+\))?)/);
        if (!match)
            continue;
        const [, name, type] = match;
        if (["CREATE", "ALTER", "DROP", "INSERT", "UPDATE", "DELETE", "ENABLE", "GRANT", "REVOKE", "IF", "ON", "SET", "WITH"].includes(name.toUpperCase()))
            continue;
        cols.push({
            name,
            type: type.toUpperCase(),
            nullable: !line.toUpperCase().includes("NOT NULL"),
            default: line.match(/DEFAULT\s+(.+?)(?:,|\s+CHECK|\s+REFERENCES|\s*$)/i)?.[1]?.trim(),
            references: line.match(/REFERENCES\s+([\w.]+)/i)?.[1],
        });
    }
    return cols;
}
export async function parseMigrations(workspaceRoot) {
    const migrationDir = `${workspaceRoot}/platform/supabase/migrations`;
    const files = await glob(`${migrationDir.replace(/\\/g, "/")}/*.sql`, { absolute: true });
    files.sort();
    const tables = {};
    const enums = {};
    const featureFlags = {};
    for (const file of files) {
        const sql = readFileSync(file, "utf-8");
        const migName = basename(file);
        const createMatches = sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\);/gi);
        for (const m of createMatches) {
            const tableName = m[1];
            const body = m[2];
            const columns = parseColumns(body);
            const fkMatches = [...body.matchAll(/REFERENCES\s+([\w.]+)/gi)].map(f => f[1]);
            const pkMatch = body.match(/PRIMARY\s+KEY\s*\(([^)]+)\)/i);
            const pk = pkMatch ? pkMatch[1].trim() : columns.find(c => body.includes(`${c.name}`) && body.includes("PRIMARY KEY"))?.name;
            if (!tables[tableName]) {
                tables[tableName] = {
                    name: tableName,
                    columns,
                    primaryKey: pk,
                    foreignKeys: fkMatches,
                    indexes: [],
                    rlsPolicies: [],
                    originMigration: migName,
                    alterMigrations: [],
                };
            }
            else {
                tables[tableName].alterMigrations.push(migName);
                for (const col of columns) {
                    if (!tables[tableName].columns.find(c => c.name === col.name)) {
                        tables[tableName].columns.push(col);
                    }
                }
            }
        }
        const alterMatches = sql.matchAll(/ALTER\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)\s+ADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+([\w\[\]()]+)/gi);
        for (const m of alterMatches) {
            const [, tableName, colName, colType] = m;
            if (tables[tableName]) {
                if (!tables[tableName].columns.find(c => c.name === colName)) {
                    tables[tableName].columns.push({ name: colName, type: colType.toUpperCase(), nullable: true });
                }
                if (!tables[tableName].alterMigrations.includes(migName)) {
                    tables[tableName].alterMigrations.push(migName);
                }
            }
        }
        const indexMatches = sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+ON\s+(\w+)/gi);
        for (const m of indexMatches) {
            const [, idxName, tableName] = m;
            if (tables[tableName]) {
                tables[tableName].indexes.push(idxName);
            }
        }
        const rlsMatches = sql.matchAll(/CREATE\s+POLICY\s+"([^"]+)"\s+ON\s+(\w+)/gi);
        for (const m of rlsMatches) {
            const [, policyName, tableName] = m;
            if (tables[tableName]) {
                tables[tableName].rlsPolicies.push(policyName);
            }
        }
        const enumMatches = sql.matchAll(/CREATE\s+TYPE\s+(\w+)\s+AS\s+ENUM\s*\(([^)]+)\)/gi);
        for (const m of enumMatches) {
            const [, name, values] = m;
            enums[name] = values.split(",").map(v => v.trim().replace(/'/g, ""));
        }
        const flagInserts = sql.matchAll(/INSERT\s+INTO\s+feature_flags\s*\([^)]*\)\s*VALUES\s*\(([^)]+)\)/gi);
        for (const m of flagInserts) {
            const vals = m[1].split(",").map(v => v.trim().replace(/'/g, ""));
            if (vals.length >= 3) {
                featureFlags[vals[0]] = { value: vals[2], notes: vals[3] || undefined };
            }
        }
        const flagUpserts = sql.matchAll(/INSERT\s+INTO\s+feature_flags\s*\([^)]*\)\s*VALUES\s*\(([^)]+)\)\s*ON\s+CONFLICT/gi);
        for (const m of flagUpserts) {
            const vals = m[1].split(",").map(v => v.trim().replace(/'/g, ""));
            if (vals.length >= 3) {
                featureFlags[vals[0]] = { value: vals[2], notes: vals[3] || undefined };
            }
        }
    }
    return {
        tables,
        enums,
        featureFlags,
        migrationCount: files.length,
        lastMigration: basename(files[files.length - 1] || ""),
    };
}
//# sourceMappingURL=parseMigrations.js.map
