const fs = require('fs');

let content = fs.readFileSync('src/components/intake/SectionComponents.tsx', 'utf8');

// 1. Remove SkipLink definition
content = content.replace(/const SkipLink =.*?;\n\n/s, '');

// 2. Remove all SkipLink usages
content = content.replace(/<SkipLink[^>]*\/>\n?/g, '');

// 3. Fix Date of Birth format to automatically add slashes
const dobTarget = `onChange={e => {
            let val = e.target.value.replace(/[^0-9/]/g, '');
            updateData({ dateOfBirth: val });
          }}`;

const dobReplacement = `onChange={e => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
            if (val.length > 5) val = val.substring(0, 5) + '/' + val.substring(5);
            if (val.length > 10) val = val.substring(0, 10);
            updateData({ dateOfBirth: val });
          }}`;

content = content.replace(dobTarget, dobReplacement);

fs.writeFileSync('src/components/intake/SectionComponents.tsx', content);
console.log('Fixed SectionComponents.tsx');
