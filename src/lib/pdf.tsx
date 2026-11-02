import React from 'react';
import { renderToBuffer, Font } from '@react-pdf/renderer';
import { FactFinderPDF } from '@/components/report/FactFinderPDF';
import { AnalysisResult } from '@/lib/types';
import { deriveData } from '@/lib/derive';
import path from 'path';

import fs from 'fs';

let fontsRegistered = false;

export async function generatePdfBuffer(submission: any, analysis: AnalysisResult): Promise<Buffer> {
  if (!fontsRegistered) {
    try {
      const regularPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf');
      const boldPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Bold.ttf');

      Font.register({
        family: 'NotoSans',
        // No italic TTF ships with the app; map italic to the upright faces so any
        // italic style (e.g. "No liabilities recorded") renders instead of crashing.
        fonts: [
          { src: regularPath, fontWeight: 'normal', fontStyle: 'normal' },
          { src: boldPath, fontWeight: 'bold', fontStyle: 'normal' },
          { src: regularPath, fontWeight: 'normal', fontStyle: 'italic' },
          { src: boldPath, fontWeight: 'bold', fontStyle: 'italic' }
        ]
      });
      fontsRegistered = true;
    } catch (e) {
      console.warn("Failed to register local fonts for PDF", e);
    }
  }

  const today = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'
  });
  
  const derivedSub = { ...submission, ...deriveData(submission) };
  
  const pdfStream = await renderToBuffer(
    <FactFinderPDF submission={derivedSub} analysis={analysis} date={today} />
  );
  
  try {
    const { PDFDocument } = await import('pdf-lib');
    // The letterhead carries the firm's PAN/GSTIN, so it lives outside Git and outside
    // public/ (never served on the website). Override with LETTERHEAD_PDF if needed.
    const letterheadPath = [
      process.env.LETTERHEAD_PDF,
      path.join(process.cwd(), 'private', 'letterhead.pdf'),
      path.join(process.cwd(), 'public', 'Finethy - Letterhead.pdf'), // older installs
    ].find((p): p is string => !!p && fs.existsSync(p)) ?? '';
    
    if (fs.existsSync(letterheadPath)) {
      const generatedDoc = await PDFDocument.load(pdfStream);
      const letterheadDoc = await PDFDocument.load(fs.readFileSync(letterheadPath));
      const mergedDoc = await PDFDocument.create();

      const [embeddedLetterhead] = await mergedDoc.embedPdf(letterheadDoc, [0]);
      const generatedPageIndices = generatedDoc.getPages().map((_, i) => i);
      const embeddedGeneratedPages = await mergedDoc.embedPdf(generatedDoc, generatedPageIndices);

      for (const embeddedPage of embeddedGeneratedPages) {
        const page = mergedDoc.addPage([embeddedPage.width, embeddedPage.height]);
        page.drawPage(embeddedLetterhead, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
        page.drawPage(embeddedPage, { x: 0, y: 0, width: page.getWidth(), height: page.getHeight() });
      }

      const mergedBytes = await mergedDoc.save();
      return Buffer.from(mergedBytes);
    }
  } catch (error) {
    console.error("Failed to overlay letterhead:", error);
  }

  return pdfStream;
}
