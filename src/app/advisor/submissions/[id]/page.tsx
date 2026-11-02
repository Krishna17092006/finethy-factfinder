import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { AdvisorHeader } from "@/components/advisor/AdvisorHeader";
import { NotesPanel, ReportActions, StatusControl } from "@/components/advisor/ReportControls";
import {
  AttentionList,
  Breakdown,
  ClientAnswers,
  MetricsTable,
  Panel,
  RiskProfileView,
  SanityAlerts,
  Snapshot,
} from "@/components/advisor/ReportSections";
import { prisma } from "@/lib/db";
import { getAnalysis } from "@/lib/analysis-cache";
import { deriveData } from "@/lib/derive";
import { emailDeliveryConfigured } from "@/lib/email";
import { calculateAge } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = await prisma.submission.findUnique({ where: { id }, select: { fullName: true } });
  return { title: s?.fullName ? `${s.fullName}: report` : "Client report", robots: { index: false, follow: false } };
}

export default async function SubmissionReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { advisorNotes: { orderBy: { createdAt: "desc" } } },
  });
  if (!submission || submission.status === "draft") notFound();

  const analysis = await getAnalysis(submission);
  const derived = deriveData(submission);
  const age = calculateAge(submission.dateOfBirth);
  const minutes = submission.activeTimeSeconds ? Math.max(1, Math.round(submission.activeTimeSeconds / 60)) : null;
  const subtitle = [
    age !== null ? `${age} years` : null,
    submission.city ? capitalize(submission.city) : null,
    submission.occupationType === "Other" ? submission.occupationOther : submission.occupationType,
  ].filter(Boolean);

  return (
    <>
      <AdvisorHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Link href="/advisor" className="inline-flex items-center gap-1 rounded-md text-[15px] font-medium text-brand-blue hover:underline">
          <ChevronLeft className="h-4 w-4" aria-hidden /> All client intakes
        </Link>

        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-wide text-3xl font-bold capitalize tracking-tight sm:text-4xl">{submission.fullName || "Unnamed client"}</h1>
            <p className="mt-1 text-brand-mutedText">
              {subtitle.join(", ")}
              {subtitle.length ? <br /> : null}
              Submitted{" "}
              {submission.submittedAt?.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) ?? "date unknown"}
              {minutes ? `, took about ${minutes} min` : ""}
            </p>
          </div>
          <ReportActions id={submission.id} emailConfigured={emailDeliveryConfigured()} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0 space-y-6">
            <SanityAlerts flags={analysis.sanityFlags ?? []} />
            <Snapshot analysis={analysis} />

            <Panel title="Advisor brief" id="brief">
              <p className="whitespace-pre-wrap leading-relaxed text-brand-darkText">{analysis.advisorBrief.replace(/Rs\. /g, "₹")}</p>
            </Panel>

            <Panel title={`Needs attention (${analysis.redCount} red, ${analysis.yellowCount} yellow)`} id="attention">
              <AttentionList metrics={analysis.metrics} />
            </Panel>

            {analysis.questionsToRaise.length ? (
              <Panel title="Questions to raise in the meeting" id="questions">
                <ol className="list-decimal space-y-2 pl-5 marker:font-semibold marker:text-brand-mutedText">
                  {analysis.questionsToRaise.map((q, i) => (
                    <li key={i} className="pl-1 leading-relaxed text-brand-darkText">
                      {q.replace(/Rs\. /g, "₹")}
                    </li>
                  ))}
                </ol>
              </Panel>
            ) : null}

            <Panel title="Financial health check" id="health">
              <MetricsTable metrics={analysis.metrics} />
            </Panel>

            {analysis.riskProfile ? (
              <Panel title="Risk profile" id="risk">
                <RiskProfileView profile={analysis.riskProfile} />
              </Panel>
            ) : null}

            <Panel title="Where the money is" id="money">
              <Breakdown analysis={analysis} />
            </Panel>

            <Panel title="Everything the client told us" id="answers">
              <ClientAnswers sub={derived} />
            </Panel>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-brand-border bg-white p-5">
              <StatusControl id={submission.id} status={submission.status} />
              {submission.reviewedAt ? (
                <p className="mt-2 text-sm text-brand-mutedText">
                  Reviewed {submission.reviewedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              ) : null}
              <dl className="mt-4 space-y-2 border-t border-brand-border pt-4 text-[15px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-brand-mutedText">Mobile</dt>
                  <dd>
                    {submission.mobile ? (
                      <a className="tabular font-medium text-brand-blue hover:underline" href={`tel:+91${submission.mobile}`}>
                        {submission.mobile}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-brand-mutedText">Email</dt>
                  <dd className="truncate">
                    {submission.email ? (
                      <a className="font-medium text-brand-blue hover:underline" href={`mailto:${submission.email}`}>
                        {submission.email}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <NotesPanel
              id={submission.id}
              notes={submission.advisorNotes.map((n) => ({ id: n.id, content: n.content, createdAt: n.createdAt.toISOString() }))}
            />
          </aside>
        </div>
      </main>
    </>
  );
}

function capitalize(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}
