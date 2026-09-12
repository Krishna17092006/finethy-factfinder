import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const submissions = await prisma.submission.findMany({
    where: { status: { not: 'draft' } },
    include: {
      link: true,
    },
    orderBy: { submittedAt: 'desc' },
  });

  const result = submissions.map((sub) => {
    let redCount = 0;
    let yellowCount = 0;
    if (sub.analysisJson) {
      try {
        const analysis = JSON.parse(sub.analysisJson);
        redCount = analysis.redCount || 0;
        yellowCount = analysis.yellowCount || 0;
      } catch {}
    }
    return {
      id: sub.id,
      fullName: sub.fullName,
      mobile: sub.mobile,
      city: sub.city,
      status: sub.status,
      submittedAt: sub.submittedAt,
      redCount,
      yellowCount,
    };
  });

  return NextResponse.json({ submissions: result });
}
