import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const targetPath = resolve(__dirname, '../../dist/main/army_ants/posse_decompose.js');
console.log('Resolved path:', targetPath);

const require = createRequire(import.meta.url);
try {
  require.resolve(targetPath);
  console.log('RESOLVE OK via require.resolve');
} catch (e) {
  console.error('RESOLVE FAIL require.resolve:', e.message);
}

try {
  const mod = await import(pathToFileURL(targetPath).href);
  console.log('DYNAMIC IMPORT OK');
  console.log('Exports:', Object.keys(mod));
  if (mod.decomposeQuestion) {
    console.log('decomposeQuestion: FOUND (type=' + typeof mod.decomposeQuestion + ')');
  } else if (mod.default && mod.default.decomposeQuestion) {
    console.log('decomposeQuestion: FOUND on default (type=' + typeof mod.default.decomposeQuestion + ')');
  } else {
    console.log('decomposeQuestion: NOT FOUND in exports');
  }
} catch (e) {
  console.error('DYNAMIC IMPORT FAIL:', e.message);
  console.error('Stack:', e.stack?.split('\n').slice(0,5).join('\n'));
}
