const fs = require('fs');
const file = 'platform/src/pages/Discover.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\{ name: "Hard Knocks", icon: ".*?", hint: "Consensus & Tutorials", route: "\/hard-knocks" \},/, '{ name: "Hard Knocks", icon: "??", hint: "Consensus & Tutorials", route: "/hard-knocks" },');
fs.writeFileSync(file, content, 'utf8');
