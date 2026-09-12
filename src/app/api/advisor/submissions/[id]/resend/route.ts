import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
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
    const { sendFactFinderEmail } = await import('@/lib/email');

    const analysis = submission.analysisJson
      ? JSON.parse(submission.analysisJson)
      : runAnalysis(submission);

    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    const { generatePdfBuffer } = await import('@/lib/pdf');
    const pdfBuffer = await generatePdfBuffer(submission, analysis);

    const result = await sendFactFinderEmail({
      clientName: submission.fullName || 'Unknown Client',
      redCount: analysis.redCount || 0,
      yellowCount: analysis.yellowCount || 0,
      pdfBuffer,
      date: today,
    });

    return NextResponse.json({ success: result.success, messageId: result.messageId });
  } catch (error) {
    console.error('Resend failed:', error);
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 }
    );
  }
}
