const fs = require('fs');
let content = fs.readFileSync('src/components/intake/SectionComponents.tsx', 'utf8');
const lines = content.split('\n');
const newLines = lines.filter(line => !line.includes('<SkipLink'));
fs.writeFileSync('src/components/intake/SectionComponents.tsx', newLines.join('\n'));
console.log('Removed SkipLink lines');
