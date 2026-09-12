import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      link: true,
      advisorNotes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!submission) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.status === 'reviewed') updateData.reviewedAt = new Date();

  const submission = await prisma.submission.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ submission });
}
