import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  
  const link = await prisma.intakeLink.findUnique({
    where: { token },
    include: { submission: true },
  });

  if (!link) {
    return NextResponse.json({ error: 'Invalid or expired link' }, { status: 404 });
  }

  // If no submission exists, create a draft
  let submission = link.submission;
  if (!submission) {
    submission = await prisma.submission.create({
      data: {
        linkId: link.id,
        status: 'draft',
        fullName: link.clientName || null,
        mobile: link.clientPhone || null,
      },
    });
  }

  return NextResponse.json({
    submission,
    clientName: link.clientName,
    clientPhone: link.clientPhone,
  });
}

export async function PUT(
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

  // Don't allow editing already-submitted forms
  if (link.submission.status === 'submitted') {
    return NextResponse.json({ error: 'Form already submitted' }, { status: 400 });
  }

  // Extract currentStep and data fields
  const { currentStep, ...data } = body;
  
  // Sanitize payload to avoid PrismaValidationError
  delete data.id;
  delete data.linkId;
  delete data.createdAt;
  delete data.updatedAt;
  delete data.hasOwnHouse_temp;
  delete data.riskQ3_neutral;
  delete data.analysisJson;

  const updated = await prisma.submission.update({
    where: { id: link.submission.id },
    data: {
      ...data,
      currentStep: currentStep ?? link.submission.currentStep,
    },
  });

  return NextResponse.json({ success: true, submission: updated });
}
