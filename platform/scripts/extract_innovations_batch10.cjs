const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '../docs/audit/innovations_601_1560.json');
const migrationsDir = path.join(__dirname, '../../platform/supabase/migrations');

function main() {
    const extracted = new Map();
    
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));
    
    for (const file of files) {
        const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        // Regex 1: 6 values (innovation_number, title, description, category, patent_bag, status)
        const regex6 = /\(\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*\)/g;
        
        // Regex 2: 5 values (innovation_number, title, description, category, session_tag)
        const regex5 = /\(\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*\)/g;
        
        let match;
        while ((match = regex6.exec(content)) !== null) {
            const num = parseInt(match[1], 10);
            if (num >= 601 && num <= 1560) {
                if (!extracted.has(num)) {
                    extracted.set(num, {
                        innovation_number: num,
                        title: match[2].replace(/''/g, "'"),
                        core_claim: match[3].replace(/''/g, "'"),
                        category: match[4].replace(/''/g, "'"),
                        patent_bag: match[5].replace(/''/g, "'"),
                        status: match[6].replace(/''/g, "'"),
                        source_file: file
                    });
                }
            }
        }
        
        while ((match = regex5.exec(content)) !== null) {
            const num = parseInt(match[1], 10);
            if (num >= 601 && num <= 1560) {
                if (!extracted.has(num)) {
                    extracted.set(num, {
                        innovation_number: num,
                        title: match[2].replace(/''/g, "'"),
                        core_claim: match[3].replace(/''/g, "'"),
                        category: match[4].replace(/''/g, "'"),
                        patent_bag: match[5].replace(/''/g, "'"), // session_tag
                        status: 'documented',
                        source_file: file
                    });
                }
            }
        }
    }
    
    const threshingFile = path.join(__dirname, '../../BISHOP_DROPZONE/THRESHING_SESSION_8J.md');
    if (fs.existsSync(threshingFile)) {
        const threshingContent = fs.readFileSync(threshingFile, 'utf-8');
        const regex = /### Innovation #(\d+):\s*([^\r\n]+)[\s\S]*?\*\*Core Mechanic:\*\*\s*([^\r\n]+)/g;
        let match;
        while ((match = regex.exec(threshingContent)) !== null) {
            const num = parseInt(match[1], 10);
            if (num >= 601 && num <= 1560 && !extracted.has(num)) {
                extracted.set(num, {
                    innovation_number: num,
                    title: match[2].trim(),
                    core_claim: match[3].trim(),
                    category: "Recent Threshing",
                    patent_bag: "Pending",
                    status: "draft",
                    source_file: "THRESHING_SESSION_8J.md"
                });
            }
        }
    }
    
    const results = Array.from(extracted.values()).sort((a, b) => a.innovation_number - b.innovation_number);
    
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Extracted ${results.length} innovations (601-1560) to ${outputFile}`);
}

main();