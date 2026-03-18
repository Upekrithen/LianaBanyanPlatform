const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'Cephas', 'cephas-hugo', 'content');
const outputFile = path.join(__dirname, 'platform', 'src', 'data', 'cephasIndex.json');

function parseFrontmatter(content) {
  // Strip BOM if present
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  const match = content.match(/---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  
  const frontmatter = match[1];
  const data = {};
  
  const lines = frontmatter.split(/\r?\n/);
  let currentKey = null;
  let currentArray = [];
  let inArray = false;

  for (const line of lines) {
    if (line.trim().startsWith('- ') && inArray) {
      currentArray.push(line.replace('- ', '').replace(/["']/g, '').trim());
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();
      
      if (val === '' || val === '[') {
        inArray = true;
        currentKey = key;
        currentArray = [];
      } else if (val.startsWith('[') && val.endsWith(']')) {
        const arrStr = val.slice(1, -1);
        data[key] = arrStr.split(',').map(s => s.replace(/["']/g, '').trim()).filter(Boolean);
      } else {
        inArray = false;
        data[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }
  
  if (inArray && currentKey) {
    data[currentKey] = currentArray;
  }
  
  return data;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkDir(filePath, fileList);
    } else if (filePath.endsWith('.md') && !file.startsWith('_index')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = walkDir(contentDir);
const index = [];

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const meta = parseFrontmatter(content);
  
  if (meta.draft === 'true' || meta.draft === true) continue;
  if (!meta.title) {
    // console.log('Skipping (no title):', file);
    continue;
  }

  const relativePath = path.relative(contentDir, file);
  const parts = relativePath.split(path.sep);
  const rootFolder = parts[0];
  
  let category = 'Document';
  if (rootFolder === 'academic') category = 'Academic Paper';
  else if (rootFolder === 'articles') category = 'Article';
  else if (rootFolder === 'innovations') category = 'Innovation';
  else if (rootFolder === 'letters') category = 'Letter';
  else if (rootFolder === 'initiatives') category = 'Initiative';
  else if (rootFolder === 'under-the-hood') category = 'Architecture';
  else if (rootFolder === 'founder') category = 'Founder';
  
  const urlPath = relativePath.replace(/\\/g, '/').replace(/\.md$/, '/');
  const url = 'https://cephas.lianabanyan.com/' + urlPath;

  index.push({
    id: relativePath.replace(/[^a-zA-Z0-9]/g, '-'),
    title: meta.title,
    category: category,
    description: meta.description || '',
    url: url,
    tags: meta.tags || []
  });
}

const dataDir = path.dirname(outputFile);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

fs.writeFileSync(outputFile, JSON.stringify(index, null, 2));
console.log('Indexed ' + index.length + ' files to ' + outputFile);
