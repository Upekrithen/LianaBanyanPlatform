/**
 * Batch migration script: wraps pages in PortalPageLayout
 * Usage: node migrate-batch.js
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'src', 'pages');
const PPL_IMPORT = "import { PortalPageLayout } from '@/components/PortalPageLayout';";

const FILES = [
  'ReputationProfile.tsx',
  'ReviewerApplication.tsx',
  'ReviewerDashboard.tsx',
  'ReviewQueueItemPage.tsx',
  'RoleManagement.tsx',
  'RunANode.tsx',
  'SampleDataXML.tsx',
  'SanAntonioLanding.tsx',
  'ScrollForgePage.tsx',
  'ServiceNodeRegistration.tsx',
  'SideQuests.tsx',
  'Simulator.tsx',
  'SpotlightManager.tsx',
  'SponsorSuccess.tsx',
  'StewardApply.tsx',
  'StewardLegalDashboard.tsx',
  'StoreFrontAggregation.tsx',
  'SubdomainManager.tsx',
  'SwoopAdminPage.tsx',
  'SwoopPage.tsx',
];

let successCount = 0;
let skipCount = 0;
const errors = [];

for (const file of FILES) {
  const filePath = path.join(PAGES_DIR, file);
  if (!fs.existsSync(filePath)) {
    errors.push(`${file}: FILE NOT FOUND`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Already migrated?
  if (content.includes('<PortalPageLayout') && content.includes('</PortalPageLayout>')) {
    console.log(`SKIP (already migrated): ${file}`);
    skipCount++;
    continue;
  }

  // Step 1: Handle import
  if (content.includes("import '@/styles/landing.css'") || content.includes('import "@/styles/landing.css"')) {
    content = content.replace(/import ['"]@\/styles\/landing\.css['"];?\n?/, PPL_IMPORT + '\n');
  } else if (!content.includes('PortalPageLayout')) {
    // Add import after last import line
    const lines = content.split('\n');
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].match(/^import\s/)) {
        lastImportIdx = i;
      }
      // Also catch multi-line imports that end with a line starting with } from
      if (lines[i].match(/^\s*\}\s*from\s+['"]/) && lastImportIdx >= 0) {
        lastImportIdx = i;
      }
    }
    if (lastImportIdx >= 0) {
      lines.splice(lastImportIdx + 1, 0, PPL_IMPORT);
      content = lines.join('\n');
    } else {
      errors.push(`${file}: Could not find import location`);
      continue;
    }
  }

  // Step 2: Find the return statement and its outer div
  // Strategy: find `return (` then the first `<div` after it
  const returnMatch = content.match(/return\s*\(\s*\n(\s*)/);
  if (!returnMatch) {
    errors.push(`${file}: Could not find return statement`);
    continue;
  }

  const returnIdx = content.indexOf(returnMatch[0]);
  const afterReturn = content.substring(returnIdx + returnMatch[0].length - returnMatch[1].length);
  
  // Find the opening div tag (first JSX element after return)
  const divOpenMatch = afterReturn.match(/^(\s*)<div\b[^>]*>/);
  if (!divOpenMatch) {
    errors.push(`${file}: Outer element is not a div — needs manual migration`);
    continue;
  }

  const indent = divOpenMatch[1];
  const fullDivTag = divOpenMatch[0];
  
  // Replace the opening div with PortalPageLayout
  const divTagStart = content.indexOf(fullDivTag, returnIdx);
  content = content.substring(0, divTagStart) + indent + '<PortalPageLayout>' + content.substring(divTagStart + fullDivTag.length);

  // Step 3: Find the matching closing </div> 
  // We need to find the CORRECT closing div that matches our replaced opening
  // Strategy: from the end, find the closing pattern `);\n}` and work backwards
  const lines = content.split('\n');
  
  // Find the line with the function's closing `);` 
  // Walk backwards from end to find `  );` pattern
  let closingDivLine = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim();
    if (trimmed === ');') {
      // The closing div should be just above this, or a few lines above if there's a dialog
      // Walk upwards to find the </div> that closes our PortalPageLayout level
      for (let j = i - 1; j >= 0; j--) {
        const t = lines[j].trim();
        if (t === '</div>' || t.endsWith('</div>')) {
          // Check indent - it should match our opening indent
          const lineIndent = lines[j].match(/^(\s*)/)[1];
          if (lineIndent === indent || lineIndent.length <= indent.length + 2) {
            closingDivLine = j;
            break;
          }
        }
      }
      break;
    }
  }

  if (closingDivLine === -1) {
    errors.push(`${file}: Could not find matching closing </div>`);
    continue;
  }

  // Replace the closing </div> with </PortalPageLayout>
  lines[closingDivLine] = lines[closingDivLine].replace('</div>', '</PortalPageLayout>');
  content = lines.join('\n');

  // Remove landing-footer if present (PortalPageLayout has its own)
  content = content.replace(/\s*\{\/\*\s*Footer\s*\*\/\}\s*\n\s*<footer className="landing-footer">\s*\n\s*<p>.*?<\/p>\s*\n\s*<\/footer>\s*\n/g, '\n');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`OK: ${file}`);
  successCount++;
}

console.log(`\n--- Results ---`);
console.log(`Success: ${successCount}`);
console.log(`Skipped: ${skipCount}`);
if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  errors.forEach(e => console.log(`  - ${e}`));
}
