import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { runAnalysis } from '../src/lib/analysis';
import { generatePdfBuffer } from '../src/lib/pdf';

const prisma = new PrismaClient();

async function main() {
  const token = 'test-token-suresh-3';
  const link = await prisma.intakeLink.findUnique({
    where: { token },
    include: { submission: true }
  });

  if (!link || !link.submission) {
    console.error("Submission not found!");
    return;
  }

  console.log('Running analysis...');
  const analysis = runAnalysis(link.submission);

  console.log('Generating PDF...');
  const pdfBuffer = await generatePdfBuffer(link.submission, analysis);

  const outputPath = path.join(process.cwd(), 'Suresh_Venkatesan_Report.pdf');
  fs.writeFileSync(outputPath, pdfBuffer);
  
  console.log(`PDF saved to ${outputPath}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
