import type { Metadata } from "next";
import { AdvisorHeader } from "@/components/advisor/AdvisorHeader";
import { Dashboard, type DashboardRow } from "@/components/advisor/Dashboard";
import { prisma } from "@/lib/db";
import { getAnalysis } from "@/lib/analysis-cache";
import { categorize, isDisposableBlank } from "@/lib/dashboard";
import { appBaseUrl } from "@/lib/links";
import { configuredAppUrl } from "@/lib/app-url";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client intakes", robots: { index: false, follow: false } };

export default async function AdvisorDashboardPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const submissions = await prisma.submission.findMany({
    include: { link: true },
    orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
  });

  const rows: DashboardRow[] = await Promise.all(
    submissions.map(async (s) => {
      const category = categorize(s);
      let red = 0;
      let yellow = 0;
      if (s.status !== "draft") {
        const analysis = await getAnalysis(s);
        red = analysis.redCount;
        yellow = analysis.yellowCount;
      }
      return {
        id: s.id,
        token: s.link.token,
        name: s.fullName || (s.link.clientName && s.link.clientName !== "Open Client" ? s.link.clientName : null),
        phone: (s.mobile || s.link.clientPhone || "").replace(/^0+$/, "") || null,
        fromWebsite: !s.link.clientName || s.link.clientName === "Open Client",
        city: s.city,
        category,
        currentStep: s.currentStep,
        submittedAt: s.submittedAt?.toISOString() ?? null,
        updatedAt: s.updatedAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
        red,
        yellow,
        disposable: isDisposableBlank(s),
      };
    }),
  );

  rows.sort((a, b) => (b.submittedAt ?? b.updatedAt).localeCompare(a.submittedAt ?? a.updatedAt));

  const h = await headers();
  const origin = configuredAppUrl() || `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  return (
    <>
      <AdvisorHeader />
      <Dashboard rows={rows} baseUrl={origin || appBaseUrl()} initialTab={tab} />
    </>
  );
}
