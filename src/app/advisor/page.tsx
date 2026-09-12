import React from 'react';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FinethyHeader } from '@/components/brand/FinethyHeader';
import { formatDistanceToNow } from 'date-fns';
import { FileText, Plus, Search, ExternalLink } from 'lucide-react';

export default async function AdvisorDashboard() {
  const submissions = await prisma.submission.findMany({
    include: { link: true },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col font-sans">
      <FinethyHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-darkText">Welcome to the Advisor Dashboard.</h1>
            <p className="text-brand-mutedText mt-1">Here is a quick overview of your client intakes.</p>
          </div>
          
          <Link 
            href="/intake"
            className="inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-5 py-2.5 rounded-md font-medium text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Generate New Link
          </Link>
        </div>

        {submissions.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-brand-darkText mb-2">No intakes yet</h3>
            <p className="text-brand-bodyText max-w-sm mb-6">
              You haven&apos;t generated any fact-finder links yet. Click below to start your first client intake.
            </p>
            <Link 
              href="/intake"
              className="inline-flex items-center gap-2 bg-brand-orange hover:bg-[#d97700] text-white px-6 py-3 rounded-md font-medium text-sm transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Generate First Link
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
            <div className="p-4 border-b border-brand-border flex justify-between items-center bg-slate-50/50">
              <h2 className="font-semibold text-brand-darkText">Recent Intakes</h2>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-cyan bg-white"
                  disabled
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-brand-mutedText font-medium border-b border-brand-border">
                  <tr>
                    <th className="px-6 py-4">Client Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Last Updated</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-brand-darkText">
                          {sub.fullName || sub.link.clientName || 'Unnamed Client'}
                        </div>
                        <div className="text-brand-mutedText text-xs mt-1">
                          {sub.mobile || sub.link.clientPhone || 'No phone'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {sub.status === 'submitted' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-brand-health-green-bg text-brand-health-green border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-health-green"></span>
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-brand-bodyText text-xs">
                        {formatDistanceToNow(sub.updatedAt, { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={sub.status === 'submitted' ? `/submissions/${sub.id}` : `/intake/${sub.link.token}`}
                          className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-brand-blue bg-brand-blue-light hover:bg-brand-blue hover:text-white rounded-md transition-colors"
                        >
                          {sub.status === 'submitted' ? 'View Report' : 'Open Link'} <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
