import React from 'react';
import { FinethyLogo, FinethyFooter } from '@/components/brand/finethy-logo';
import { CheckCircle2, Download } from 'lucide-react';
import { prisma } from '@/lib/db';

export default async function SuccessPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = await params;
  const link = await prisma.intakeLink.findUnique({
    where: { token: resolvedParams.token },
    include: { submission: true }
  });

  const submissionId = link?.submission?.id;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-brand-blue border-b border-brand-blue-dark py-4 px-6 shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <FinethyLogo className="h-10 bg-white p-2 rounded" />
        </div>
      </header>

      <main className="flex-1 py-16 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-brand-border p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-brand-health-green-bg rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-brand-health-green" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-brand-darkText mb-3">
              Thank You!
            </h1>
            <p className="text-brand-bodyText leading-relaxed">
              Your details have been securely sent. We will review them before your meeting.
            </p>
          </div>

          {submissionId && (
            <div className="pt-4 border-t border-brand-border">
              <p className="text-sm text-brand-darkText font-medium mb-4">
                Demo Mode: Download your generated PDF report below.
              </p>
              <a 
                href={`/api/advisor/submissions/${submissionId}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full rounded-md bg-brand-orange text-white h-12 px-6 font-medium hover:bg-brand-blue transition-colors shadow-md"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF Report
              </a>
            </div>
          )}

          {!submissionId && (
            <div className="pt-4 border-t border-brand-border">
              <p className="text-sm text-brand-muted">
                You can now safely close this window.
              </p>
            </div>
          )}
        </div>
      </main>

      <div className="mt-auto">
        <FinethyFooter className="w-full" />
      </div>
    </div>
  );
}
