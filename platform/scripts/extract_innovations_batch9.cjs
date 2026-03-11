const fs = require('fs');
const path = require('path');

const sqlFile = path.join(__dirname, '../../platform/supabase/migrations/20260212200000_complete_innovation_registry.sql');
const outputFile = path.join(__dirname, '../docs/audit/innovations_131_600.json');

function main() {
    const content = fs.readFileSync(sqlFile, 'utf-8');
    
    // The format is: (1, 'Title', 'Description', 'Category', 'Bag', 'status')
    // We can use a regex to match the values inside the parentheses
    // Handle escaped quotes ''
    const regex = /\(\s*(\d+)\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*\)/g;
    
    const extracted = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
        const num = parseInt(match[1], 10);
        if (num >= 131 && num <= 600) {
            extracted.push({
                innovation_number: num,
                title: match[2].replace(/''/g, "'"),
                core_claim: match[3].replace(/''/g, "'"),
                category: match[4].replace(/''/g, "'"),
                patent_bag: match[5].replace(/''/g, "'"),
                status: match[6].replace(/''/g, "'"),
                source_file: '20260212200000_complete_innovation_registry.sql'
            });
        }
    }
    
    extracted.sort((a, b) => a.innovation_number - b.innovation_number);
    
    fs.writeFileSync(outputFile, JSON.stringify(extracted, null, 2));
    console.log(`Extracted ${extracted.length} innovations (131-600) to ${outputFile}`);
}

main();