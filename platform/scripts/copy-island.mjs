import { writeFileSync, copyFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist-island');
const hugoJs = join(__dirname, '..', '..', 'Cephas', 'cephas-hugo', 'static', 'js');
const hugoCss = join(__dirname, '..', '..', 'Cephas', 'cephas-hugo', 'static', 'css');

mkdirSync(hugoJs, { recursive: true });
mkdirSync(hugoCss, { recursive: true });

const files = readdirSync(distDir);
const jsFile = files.find(f => f === 'mnemo-join.js' || (f.endsWith('.js') && f.startsWith('mnemo-join')));
const cssFile = files.find(f => f === 'mnemo-join.css' || (f.endsWith('.css') && f.startsWith('mnemo-join')));

const jsDest = 'mnemo-join.js';
const cssDest = 'mnemo-join.css';

if (jsFile) copyFileSync(join(distDir, jsFile), join(hugoJs, jsDest));
if (cssFile) copyFileSync(join(distDir, cssFile), join(hugoCss, cssDest));

const manifest = { js: jsDest, css: cssDest };
writeFileSync(join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
writeFileSync(join(__dirname, '..', '..', 'Cephas', 'cephas-hugo', 'data', 'mnemo_island.json'), JSON.stringify(manifest, null, 2));

console.log('Island copied:', manifest);
