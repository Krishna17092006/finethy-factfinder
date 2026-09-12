import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const link = await prisma.intakeLink.findUnique({
    where: { token },
    include: { submission: true },
  });

  if (!link || !link.submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  if (link.submission.status === 'submitted') {
    return NextResponse.json({ error: 'Already submitted' }, { status: 400 });
  }

  // Save any final data from the body
  const { currentStep, ...finalData } = body;
  
  // Sanitize payload to avoid PrismaValidationError
  delete finalData.id;
  delete finalData.linkId;
  delete finalData.createdAt;
  delete finalData.updatedAt;
  delete finalData.hasOwnHouse_temp;
  delete finalData.riskQ3_neutral;

  // Validate required fields
  const name = finalData.fullName || link.submission.fullName;
  const mobile = finalData.mobile || link.submission.mobile;
  const consent = finalData.consentGiven ?? link.submission.consentGiven;

  if (!name || !mobile) {
    return NextResponse.json(
      { error: 'Name and mobile number are required' },
      { status: 400 }
    );
  }

  if (!consent) {
    return NextResponse.json(
      { error: 'Please provide your consent to proceed' },
      { status: 400 }
    );
  }

  // Update and mark as submitted
  const submission = await prisma.submission.update({
    where: { id: link.submission.id },
    data: {
      ...finalData,
      status: 'submitted',
      submittedAt: new Date(),
      currentStep: 8,
    },
  });

  // Run analysis
  let analysisJson = null;
  try {
    const { runAnalysis } = await import('@/lib/analysis');
    const analysis = runAnalysis(submission);
    analysisJson = JSON.stringify(analysis);

    await prisma.submission.update({
      where: { id: submission.id },
      data: { analysisJson },
    });

    // Try to send email
    try {
      const { sendFactFinderEmail } = await import('@/lib/email');
      const today = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      const { generatePdfBuffer } = await import('@/lib/pdf');
      const pdfBuffer = await generatePdfBuffer(submission, analysis);

      await sendFactFinderEmail({
        clientName: submission.fullName || 'Unknown Client',
        redCount: analysis.redCount,
        yellowCount: analysis.yellowCount,
        pdfBuffer,
        date: today,
      });
    } catch (emailError) {
      console.error('Email send failed (non-blocking):', emailError);
    }
  } catch (analysisError) {
    console.error('Analysis failed (non-blocking):', analysisError);
  }

  return NextResponse.json({
    success: true,
    message: 'Thank you! Your details have been sent to our team.',
    submissionId: submission.id,
  });
}
