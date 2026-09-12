const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'components', 'intake', 'SectionComponents.tsx');
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/import \{ Input \} from '@\/components\/ui\/input';/, "import { Input } from '@/components/ui/input';\nimport { LocalInput } from './LocalInput';");
c = c.replace(/<Input /g, '<LocalInput ');

// Also fix DateOfBirth parsing which was resetting caret
c = c.replace(
  /onChange=\{e => \{\s*let val = e.target.value.replace\(\/\[\^0-9\]\/g, ''\);\s*if \(val.length > 2\) val = val.substring\(0, 2\) \+ '\/' \+ val.substring\(2\);\s*if \(val.length > 5\) val = val.substring\(0, 5\) \+ '\/' \+ val.substring\(5\);\s*if \(val.length > 10\) val = val.substring\(0, 10\);\s*updateData\(\{ dateOfBirth: val \}\);\s*\}\}/g,
  `onChange={val => updateData({ dateOfBirth: val })} formatOnBlur={val => { let v = val.replace(/[^0-9]/g, ''); if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2); if (v.length > 5) v = v.substring(0, 5) + '/' + v.substring(5); return v.substring(0, 10); }}`
);

// Mobile
c = c.replace(/onChange=\{e => \{ const val = e\.target\.value\.replace\(\/\[\^0-9\]\/g, ''\); updateData\(\{ mobile: val \}\); \}\}/g, `onChange={val => updateData({ mobile: val })} filter={val => val.replace(/[^0-9]/g, '')}`);

// Normal Inputs (fullName, email, city)
c = c.replace(/onChange=\{e => updateData\(\{ ([a-zA-Z0-9_]+): e\.target\.value \}\)\}/g, `onChange={val => updateData({ $1: val })}`);

fs.writeFileSync(file, c);
console.log('done');
