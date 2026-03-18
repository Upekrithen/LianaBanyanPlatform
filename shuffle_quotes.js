const fs = require('fs');

const filePath = 'platform/src/components/RotatingQuotes.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('const QUOTES: Quote[] = [');
const endIdx = content.indexOf('];\r\n\r\ninterface RotatingQuotesProps');
const endIdxAlt = content.indexOf('];\n\ninterface RotatingQuotesProps');

const finalEndIdx = endIdx !== -1 ? endIdx : endIdxAlt;

if (startIdx === -1 || finalEndIdx === -1) {
  console.error('Could not find QUOTES array, start:', startIdx, 'end:', finalEndIdx);
  process.exit(1);
}

let arrayContent = content.substring(startIdx, finalEndIdx + 2);

arrayContent = arrayContent.replace(
  /author:\s*"John Donne"/g,
  'author: "Jon Bon Jov... John Donne"'
);

// Split by '  },'
let parts = arrayContent.split('  },');
let lastPart = parts.pop(); // The final '];'

let elements = [];
for (let i = 0; i < parts.length; i++) {
  elements.push(parts[i] + '  },');
}

// Ensure the first element includes the array declaration
const first3 = elements.slice(0, 3);
const rest = elements.slice(3);

for (let i = rest.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [rest[i], rest[j]] = [rest[j], rest[i]];
}

const newArrayContent = first3.concat(rest).join('') + lastPart;
const newContent = content.substring(0, startIdx) + newArrayContent + content.substring(finalEndIdx + 2);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Quotes shuffled and updated.');
