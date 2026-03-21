/**
 * Fix PortalPageLayout tag mismatches caused by the migration script
 * replacing the wrong div in files with multiple return statements.
 * 
 * Pattern: early return gets <PortalPageLayout> open + </div> close (wrong)
 *          main return gets <div> open + </PortalPageLayout> close (wrong)
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'src', 'pages');
let fixes = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.tsx')) {
      checkFile(fullPath, entry.name);
    }
  }
}

function checkFile(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('PortalPageLayout')) return;
  
  const openCount = (content.match(/<PortalPageLayout/g) || []).length;
  const closeCount = (content.match(/<\/PortalPageLayout>/g) || []).length;
  
  if (openCount !== closeCount) {
    console.log(`TAG COUNT MISMATCH: ${name} — ${openCount} opens, ${closeCount} closes`);
    return;
  }
  
  // Check for structural issues: <PortalPageLayout> followed by </div> in the same return block
  const lines = content.split('\n');
  const returnBlocks = [];
  let depth = 0;
  let inReturn = false;
  let returnStart = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    
    // Skip lines inside template literals
    // Simple heuristic: if we're inside a const = ` ... ` block, skip
    
    if (trimmed.match(/return\s*\(/)) {
      inReturn = true;
      returnStart = i;
    }
    
    if (inReturn && trimmed === ');') {
      returnBlocks.push({ start: returnStart, end: i });
      inReturn = false;
    }
  }
  
  let modified = false;
  let newContent = content;
  
  for (const block of returnBlocks) {
    const blockLines = lines.slice(block.start, block.end + 1);
    const blockStr = blockLines.join('\n');
    
    // Check for mismatch: <PortalPageLayout> open + </div> close
    const hasOpen = blockStr.includes('<PortalPageLayout>') || blockStr.includes('<PortalPageLayout ');
    const hasClose = blockStr.includes('</PortalPageLayout>');
    
    if (hasOpen && !hasClose) {
      // This block opens PortalPageLayout but closes with </div>
      // Find the last </div> in the block and check if it should be </PortalPageLayout>
      for (let i = block.end; i >= block.start; i--) {
        if (lines[i].trim() === '</div>' || lines[i].includes('</div>')) {
          // Check if this is at the right indent level
          const openLine = lines.slice(block.start, block.end + 1).findIndex(
            l => l.includes('<PortalPageLayout')
          ) + block.start;
          const openIndent = lines[openLine].match(/^(\s*)/)[1].length;
          const closeIndent = lines[i].match(/^(\s*)/)[1].length;
          
          if (Math.abs(openIndent - closeIndent) <= 2) {
            console.log(`  FIX ${name}:${i+1}: </div> → </PortalPageLayout> (early return)`);
            lines[i] = lines[i].replace('</div>', '</PortalPageLayout>');
            modified = true;
            break;
          }
        }
      }
    }
    
    if (!hasOpen && hasClose) {
      // This block closes PortalPageLayout but opens with <div>
      // Find the first <div> in the block and replace with <PortalPageLayout>
      for (let i = block.start; i <= block.end; i++) {
        const match = lines[i].match(/^(\s*)<div\b[^>]*>/);
        if (match) {
          const closeLine = lines.slice(block.start, block.end + 1).findIndex(
            l => l.includes('</PortalPageLayout>')
          ) + block.start;
          const closeIndent = lines[closeLine].match(/^(\s*)/)[1].length;
          const openIndent = match[1].length;
          
          if (Math.abs(openIndent - closeIndent) <= 2) {
            console.log(`  FIX ${name}:${i+1}: <div...> → <PortalPageLayout> (main return)`);
            lines[i] = match[1] + '<PortalPageLayout>';
            modified = true;
            break;
          }
        }
      }
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    fixes++;
  }
}

scanDir(PAGES_DIR);
console.log(`\nTotal files fixed: ${fixes}`);
