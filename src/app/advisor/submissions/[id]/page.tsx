import React from 'react';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Mail } from 'lucide-react';
import Link from 'next/link';
import { RiskSpectrumBar } from '@/components/report/RiskSpectrumBar';
export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { advisorNotes: { orderBy: { createdAt: 'desc' } } }
  });

  if (!submission) return notFound();

  let analysis: any = null;
  if (submission.analysisJson) {
    try {
      analysis = JSON.parse(submission.analysisJson);
    } catch (e) {}
  }

  // If somehow it's submitted but no analysis, we could run it on the fly, 
  // but let's assume the API already saved it.
  if (!analysis) {
    return <div className="p-12 text-center text-red-500">Analysis data missing for this submission.</div>;
  }

  const sortedMetrics = [...analysis.metrics].sort((a: any, b: any) => {
    const score = { RED: 3, YELLOW: 2, GREEN: 1, INFO: 0 };
    return score[b.status as keyof typeof score] - score[a.status as keyof typeof score];
  });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 pb-20 print:p-0 print:space-y-4 print:pb-0 bg-[#f8f9fa] min-h-screen print:bg-white font-sans">
      <div className="flex items-center justify-between mb-8 print:mb-4">
        <div className="flex items-center gap-4">
          <Link href="/advisor" className="print:hidden">
            <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-brand-darkText">{submission.fullName || 'Unknown Client'}</h1>
            <p className="text-brand-mutedText">Submitted {new Date(submission.submittedAt!).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-3 print:hidden">
          <a href={`/api/advisor/submissions/${id}/pdf`} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-2 shadow-sm border-brand-border">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </a>
          <Button variant="outline" className="gap-2 shadow-sm border-brand-border" onClick={() => {
            fetch(`/api/advisor/submissions/${id}/resend`, { method: 'POST' })
              .then(() => alert('Resend triggered!'))
          }}>
            <Mail className="w-4 h-4" /> Resend Email
          </Button>
        </div>
      </div>

      {/* Snapshot Banner — horizontal, refined */}
      <div className="flex items-stretch rounded-lg border-l-4 border-[#2f5aa8] bg-[#eef2fa] overflow-hidden shadow-sm">
        <div className="flex flex-1 items-center justify-center flex-col py-4 px-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8099bf] mb-1">Net Worth</p>
          <p className="text-[15px] font-bold text-[#1a3461]">₹{(analysis.netWorth / 10000000).toFixed(1)}Cr</p>
        </div>
        <div className="w-px bg-[#c5d3eb] my-3" />
        <div className="flex flex-1 items-center justify-center flex-col py-4 px-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8099bf] mb-1">Annual Income</p>
          <p className="text-[15px] font-bold text-[#1a3461]">₹{(analysis.annualIncome / 100000).toFixed(1)}L</p>
        </div>
        <div className="w-px bg-[#c5d3eb] my-3" />
        <div className="flex flex-1 items-center justify-center flex-col py-4 px-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8099bf] mb-1">Monthly Surplus</p>
          <p className="text-[15px] font-bold text-[#1a3461]">₹{(analysis.monthlySurplus / 100000).toFixed(1)}L</p>
        </div>
        <div className="w-px bg-[#c5d3eb] my-3" />
        <div className="flex flex-1 items-center justify-center flex-col py-4 px-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8099bf] mb-1">Dependents</p>
          <p className="text-[15px] font-bold text-[#1a3461]">{analysis.totalDependents}</p>
        </div>
        <div className="w-px bg-[#c5d3eb] my-3" />
        <div className="flex flex-[2] items-center justify-center flex-col py-4 px-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8099bf] mb-1">Top Goal</p>
          <p className="text-[14px] font-bold text-[#1a3461] text-center">{analysis.topGoal || 'None specified'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 print:gap-4">
        <Card className="shadow-sm border-brand-border print:shadow-none print:border-gray-200">
          <CardHeader className="bg-slate-50 border-b border-brand-border print:bg-transparent">
            <CardTitle className="text-brand-darkText">Advisor Brief</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-brand-darkText whitespace-pre-wrap leading-relaxed text-sm">
              {analysis.advisorBrief}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Profile */}
      {analysis.riskProfile && (
        <Card className="shadow-sm border-brand-border print:shadow-none print:border-gray-200">
          <CardHeader className="bg-slate-50 border-b border-brand-border print:bg-transparent">
            <CardTitle className="text-brand-darkText">Risk Appetite & Tolerance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RiskSpectrumBar profile={analysis.riskProfile} />
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-brand-border print:shadow-none print:border-gray-200">
        <CardHeader className="bg-slate-50 border-b border-brand-border print:bg-transparent">
          <CardTitle className="text-brand-darkText">Health Metrics (Blood Report)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-brand-mutedText uppercase text-[10px] font-bold tracking-wider print:bg-transparent print:border-b print:border-gray-300">
                <tr>
                  <th className="px-6 py-3">Metric</th>
                  <th className="px-6 py-3">Value</th>
                  <th className="px-6 py-3">Healthy Range</th>
                  <th className="px-6 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border print:divide-gray-200">
                {sortedMetrics.map((m: any) => (
                  <tr key={m.key} className={
                    m.status === 'RED' ? 'bg-[#fef2f2] print:bg-transparent' : 
                    m.status === 'YELLOW' ? 'bg-[#fffbeb] print:bg-transparent' : 
                    m.status === 'GREEN' ? 'bg-[#f0fdf4] print:bg-transparent' : 'print:bg-transparent'
                  }>
                    <td className="px-6 py-4 font-medium text-brand-darkText">
                      {m.name}
                      {m.isEstimated && <sup className="ml-1 text-[10px] text-brand-mutedText">est.</sup>}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-darkText">{m.displayValue}</td>
                    <td className="px-6 py-4 text-brand-bodyText text-xs">{m.healthyRange}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        m.status === 'RED' ? 'bg-red-100 text-red-700 border-red-200 print:border-red-500' :
                        m.status === 'YELLOW' ? 'bg-amber-100 text-amber-700 border-amber-200 print:border-amber-500' :
                        m.status === 'GREEN' ? 'bg-green-100 text-[#22c55e] border-green-200 print:border-green-500' :
                        'bg-blue-100 text-brand-blue border-blue-200 print:border-blue-500'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-50 border-t border-brand-border text-xs text-brand-mutedText print:bg-transparent print:border-none print:pt-2">
            * Figures marked <sup className="mx-0.5 text-[10px]">est.</sup> are derived from client-reported ranges or computed automatically.
          </div>
        </CardContent>
      </Card>

      {analysis.observations.length > 0 && (
        <Card className="border-red-200 shadow-sm print:shadow-none print:border-red-500 print:break-inside-avoid">
          <CardHeader className="bg-red-50/50 border-b border-red-100 print:bg-transparent">
            <CardTitle className="text-red-800">Areas Needing Attention</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {analysis.observations.map((obs: string, i: number) => (
                <li key={i} className="flex gap-3 text-brand-darkText text-sm">
                  <span className="text-red-500 font-bold">•</span> {obs}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
