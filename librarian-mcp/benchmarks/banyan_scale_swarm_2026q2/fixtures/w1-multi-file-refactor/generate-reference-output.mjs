#!/usr/bin/env node
// generate-reference-output.mjs
// Generates the ESM reference output for W1 by performing CJS→ESM transformation
// on the source files. Run once to produce the ground-truth reference.
// Usage: node generate-reference-output.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, 'src');
const refDir = join(__dirname, 'reference_output');

function transformCJSToESM(source, filePath) {
  let out = source;

  // 1. Convert require() calls to import statements
  // require('../types/user.types') → import { ... } from '../types/user.types.js'
  // We handle the case where the entire module is imported
  out = out.replace(
    /const\s+(\{[^}]+\})\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/g,
    (_, imports, mod) => `import ${imports} from '${addJsExt(mod)}';`
  );
  out = out.replace(
    /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)\s*;?/g,
    (_, name, mod) => `import * as ${name} from '${addJsExt(mod)}';`
  );

  // 2. Convert module.exports = { ... } to named exports
  out = out.replace(
    /module\.exports\s*=\s*\{([^}]+)\}\s*;?/g,
    (_, body) => {
      const names = body.split(',').map(s => s.trim()).filter(Boolean);
      return names.map(n => `export { ${n} };`).join('\n');
    }
  );
  out = out.replace(/module\.exports\.(\w+)\s*=/g, 'export const $1 =');
  out = out.replace(/exports\.(\w+)\s*=/g, 'export const $1 =');

  // 3. Add .js extension to relative imports that already use import syntax
  out = out.replace(
    /from\s+['"](\.[^'"]+)['"]/g,
    (_, mod) => `from '${addJsExt(mod)}'`
  );
  out = out.replace(
    /import\s+['"](\.[^'"]+)['"]/g,
    (_, mod) => `import '${addJsExt(mod)}'`
  );

  return out;
}

function addJsExt(mod) {
  if (mod.startsWith('.') && !mod.endsWith('.js') && !mod.endsWith('.mjs') && !mod.endsWith('.json')) {
    return mod + '.js';
  }
  return mod;
}

function processDir(srcPath, refPath) {
  mkdirSync(refPath, { recursive: true });
  for (const entry of readdirSync(srcPath)) {
    const s = join(srcPath, entry);
    const d = join(refPath, entry);
    const stat = statSync(s);
    if (stat.isDirectory()) {
      processDir(s, d);
    } else if (entry.endsWith('.ts')) {
      const source = readFileSync(s, 'utf8');
      const transformed = transformCJSToESM(source, s);
      writeFileSync(d, transformed, 'utf8');
      console.log(`  → ${relative(__dirname, d)}`);
    }
  }
}

console.log('Generating W1 reference output (CJS→ESM transform)...');
processDir(srcDir, refDir);
console.log('Done. Reference output written to reference_output/');
