import React from 'react';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { IntakeForm } from '@/components/intake/IntakeForm';
import { FinethyHeader } from '@/components/brand/FinethyHeader';

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const link = await prisma.intakeLink.findUnique({
    where: { token },
    include: { submission: true }
  });

  if (!link) return notFound();

  let submission = link.submission;
  
  if (!submission) {
    submission = await prisma.submission.create({
      data: {
        linkId: link.id,
        status: 'draft',
        fullName: link.clientName || null,
        mobile: link.clientPhone || null,
      }
    });
  }

  return (
    <div className="min-h-screen bg-brand-page flex flex-col font-sans">
      <FinethyHeader />

      <main className="flex-1 py-8 px-4 sm:px-6 flex items-center justify-center">
        <IntakeForm token={token} initialData={submission} />
      </main>
    </div>
  );
}
