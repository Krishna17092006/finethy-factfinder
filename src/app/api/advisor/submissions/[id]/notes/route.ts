import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Note content required' }, { status: 400 });
  }

  const note = await prisma.advisorNote.create({
    data: {
      submissionId: id,
      content: content.trim(),
    },
  });

  return NextResponse.json({ note });
}
