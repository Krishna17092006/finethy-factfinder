import * as fs from 'fs';
const file = 'src/components/report/FactFinderPDF.tsx';
let txt = fs.readFileSync(file, 'utf-8');

// Remove LetterheadTemplate definition
const lhDefStart = txt.indexOf('const LetterheadTemplate = () =>');
if (lhDefStart !== -1) {
  const lhDefEnd = txt.indexOf('  const sortedMetrics', lhDefStart);
  if (lhDefEnd !== -1) {
    txt = txt.substring(0, lhDefStart) + txt.substring(lhDefEnd);
  }
}

// Remove <LetterheadTemplate /> tags
txt = txt.replace(/<LetterheadTemplate \/>\s*/g, '');

// Restore page numbers if we want them at the bottom. The Letterhead footer takes up space.
// Let's add a simple page number text to the bottom.
// We will replace `<Document>` start and its contents to ensure page numbers are at the bottom.
const pageNumberRender = `<Text style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#ffffff' }} render={({ pageNumber, totalPages }) => (\`Page \${pageNumber} of \${totalPages}\`)} fixed />`;

txt = txt.replace(/<\/Page>/g, `  ${pageNumberRender}\n      </Page>`);
// Note: we might have added page number twice if we do this globally without checking.
// Let's just do a blanket regex to clean any old page numbers and insert fresh ones.
txt = txt.replace(/<Text style=\{\{\s*position: 'absolute',\s*bottom: \d+[^}]+\}\}\s*render=\{[^}]+\}\s*fixed \/>\s*/g, '');
// Re-insert exactly before </Page>
txt = txt.replace(/<\/Page>/g, `  ${pageNumberRender}\n      </Page>`);

fs.writeFileSync(file, txt);
console.log("Cleaned FactFinderPDF.tsx");
