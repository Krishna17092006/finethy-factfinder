import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function main() {
  const generatedPath = path.join(process.cwd(), 'Suresh_Venkatesan_Report.pdf');
  const letterheadPath = path.join(process.cwd(), 'public', 'Finethy - Letterhead.pdf');
  const outputPath = path.join(process.cwd(), 'Overlay_Test.pdf');

  const generatedBytes = fs.readFileSync(generatedPath);
  const letterheadBytes = fs.readFileSync(letterheadPath);

  const generatedDoc = await PDFDocument.load(generatedBytes);
  const letterheadDoc = await PDFDocument.load(letterheadBytes);

  const mergedDoc = await PDFDocument.create();

  // Embed the letterhead
  const [embeddedLetterhead] = await mergedDoc.embedPdf(letterheadDoc, [0]);
  
  // Embed all generated pages
  const generatedPageIndices = generatedDoc.getPages().map((_, i) => i);
  const embeddedGeneratedPages = await mergedDoc.embedPdf(generatedDoc, generatedPageIndices);

  for (const embeddedPage of embeddedGeneratedPages) {
    // Create a new blank page in the final doc
    const page = mergedDoc.addPage([embeddedPage.width, embeddedPage.height]);

    // 1. Draw letterhead (background)
    page.drawPage(embeddedLetterhead, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });

    // 2. Draw generated content (foreground)
    page.drawPage(embeddedPage, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
  }

  const mergedBytes = await mergedDoc.save();
  fs.writeFileSync(outputPath, mergedBytes);
  console.log('Test overlay successful:', outputPath);
}

main().catch(console.error);
