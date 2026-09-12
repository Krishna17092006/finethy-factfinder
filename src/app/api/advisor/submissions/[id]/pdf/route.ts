import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const { runAnalysis } = await import('@/lib/analysis');
    const { generatePdfBuffer } = await import('@/lib/pdf');

    const analysis = submission.analysisJson
      ? JSON.parse(submission.analysisJson)
      : runAnalysis(submission);

    const pdfBuffer = await generatePdfBuffer(submission, analysis);
    
    // Convert Buffer to Uint8Array for the response
    const uint8Array = new Uint8Array(pdfBuffer);
    
    const safeName = submission.fullName ? submission.fullName.replace(/[^a-zA-Z0-9]/g, '_') : 'Client';
    const filename = `FINETHY_FactFinder_${safeName}.pdf`;

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF Download failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
