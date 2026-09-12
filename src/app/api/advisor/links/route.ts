import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clientName, clientPhone } = body;

  const token = nanoid(12);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const link = await prisma.intakeLink.create({
    data: {
      token,
      clientName: clientName || null,
      clientPhone: clientPhone || null,
    },
  });

  const fullUrl = `${appUrl}/intake/${token}`;

  return NextResponse.json({
    success: true,
    link: {
      ...link,
      url: fullUrl,
      whatsappUrl: `https://wa.me/${clientPhone ? clientPhone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(`Namaste! To make the most of our meeting, please fill this short form (10–15 min): ${fullUrl} — FINETHY`)}`,
    },
  });
}

export async function GET() {
  const links = await prisma.intakeLink.findMany({
    include: {
      submission: {
        select: {
          id: true,
          status: true,
          fullName: true,
          submittedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ links });
}
