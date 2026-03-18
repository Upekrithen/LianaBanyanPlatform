const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'Cephas/cephas-hugo/content/innovations');

const specificMappings = {
    '001-tab-system.md': ['platform/src/pages/GhostWorld.tsx', 'platform/src/pages/Withdraw.tsx'],
    '002-position-funding.md': ['platform/src/pages/MedallionViewer.tsx', 'platform/src/pages/ProjectView.tsx'],
    '003-medallion-cascade.md': ['platform/src/pages/MedallionViewer.tsx'],
    '009-boaz-principle.md': ['platform/src/components/CostPlusBadge.tsx'],
    '010-hexisle.md': ['platform/src/pages/GhostWorld.tsx', 'platform/src/pages/HexIsleProjects.tsx'],
    'innovation-52.md': ['platform/src/pages/GhostWorld.tsx', 'platform/src/pages/HexIsleProjects.tsx', 'platform/src/pages/TreasureMapGame.tsx']
};

const defaultLinks = [
    'platform/src/App.tsx',
    'platform/supabase/migrations/20260212200000_complete_innovation_registry.sql'
];

function walkDir(currentDir, fileList = []) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const filePath = path.join(currentDir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath, fileList);
        } else if (filePath.endsWith('.md') && !file.startsWith('_index')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

const allFiles = walkDir(dir);
let injectedCount = 0;

for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes('## ?? Architecture Beacon')) {
        let links = specificMappings[fileName] || defaultLinks;
        
        let beaconText = '\n\n---\n\n## ?? Architecture Beacon\n\n*For Academics, Press, and the Curious: This innovation is directly linked to the following working codebase implementations. Follow the beacons to map your own path through the Yggdrasil architecture.*\n\n**Implemented in:**\n';
        
        links.forEach(link => {
            beaconText += '- ' + link + '\n';
        });

        fs.writeFileSync(filePath, content + beaconText, 'utf8');
        injectedCount++;
    }
}

console.log('Injected beacons into ' + injectedCount + ' files.');
