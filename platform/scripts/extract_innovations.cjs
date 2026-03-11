const fs = require('fs');
const path = require('path');

const innovationsDir = path.join(__dirname, '../../Cephas/cephas-hugo/content/innovations');
const outputFile = path.join(__dirname, '../docs/audit/innovations_001_130.json');

function walkDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath, fileList);
        } else if (filePath.endsWith('.md')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function parseFrontmatter(content) {
    content = content.replace(/^\uFEFF/, '').trim();
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) return null;
    
    const frontmatterStr = match[1];
    const data = {};
    
    frontmatterStr.split(/\r?\n/).forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx > -1) {
            const key = line.slice(0, colonIdx).trim();
            let value = line.slice(colonIdx + 1).trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            data[key] = value;
        }
    });
    
    return data;
}

function extractCoreClaimFromFrontmatter(content) {
    let body = content.replace(/^\uFEFF/, '').trim();
    body = body.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n*/, '');
    
    const flipblockMatch = body.match(/{{<\s*flipblock[^>]*>}}([\s\S]*?){{<\s*\/flipblock\s*>}}/);
    if (flipblockMatch) {
        return flipblockMatch[1].trim();
    }
    
    const paragraphs = body.split(/\r?\n\r?\n/).filter(p => p.trim().length > 0 && !p.startsWith('|') && !p.startsWith('{{<') && !p.startsWith('#'));
    return paragraphs.slice(0, 2).join('\n').trim();
}

function main() {
    const allFiles = walkDir(innovationsDir);
    console.log(`Found ${allFiles.length} markdown files.`);
    const extracted = new Map();
    
    for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(path.join(__dirname, '../..'), file).replace(/\\/g, '/');
        
        // Strategy 1: Parse ### N. TITLE format
        const regex = /^###\s+(\d+)\.\s+([^\r\n]+)([\s\S]*?)(?=^###\s+\d+\.|\Z)/gm;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const num = parseInt(match[1], 10);
            const title = match[2].trim();
            const body = match[3].trim();
            
            if (num >= 1 && num <= 130) {
                const paragraphs = body.split(/\r?\n\r?\n/).filter(p => p.trim().length > 0);
                const coreClaim = paragraphs.slice(0, 2).join('\n').trim();
                const codeMatch = body.match(/`([^`]+\.tsx?)`/g);
                const codeComponents = codeMatch ? [...new Set(codeMatch.map(c => c.replace(/`/g, '')))] : [];
                
                if (!extracted.has(num)) {
                    extracted.set(num, {
                        innovation_number: num,
                        title: title,
                        core_claim: coreClaim,
                        related_code_components: codeComponents,
                        source_file: relativePath
                    });
                }
            }
        }
        
        // Strategy 2: Parse Frontmatter
        const frontmatter = parseFrontmatter(content);
        if (frontmatter) {
            let num = null;
            if (frontmatter.innovation_number) {
                num = parseInt(frontmatter.innovation_number, 10);
            } else {
                const titleMatch = frontmatter.title ? frontmatter.title.match(/Innovation #(\d+)/i) : null;
                const fileMatch = path.basename(file).match(/^(\d{3})-/);
                if (titleMatch) num = parseInt(titleMatch[1], 10);
                else if (fileMatch) num = parseInt(fileMatch[1], 10);
            }
            
            if (num !== null && !isNaN(num) && num >= 1 && num <= 130) {
                const claim = extractCoreClaimFromFrontmatter(content);
                const codeMatch = content.match(/`([^`]+\.tsx?)`/g);
                const codeComponents = codeMatch ? [...new Set(codeMatch.map(c => c.replace(/`/g, '')))] : [];
                
                if (!extracted.has(num)) {
                    extracted.set(num, {
                        innovation_number: num,
                        title: frontmatter.title || `Innovation #${num}`,
                        core_claim: claim,
                        related_code_components: codeComponents,
                        source_file: relativePath
                    });
                }
            }
        }
    }
    
    const results = Array.from(extracted.values()).sort((a, b) => a.innovation_number - b.innovation_number);
    
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
    console.log(`Extracted ${results.length} innovations to ${outputFile}`);
}

main();