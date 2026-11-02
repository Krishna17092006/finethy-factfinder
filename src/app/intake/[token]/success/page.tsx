import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE } from "@/config/site";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await prisma.intakeLink.findUnique({
    where: { token },
    select: { submission: { select: { status: true, fullName: true } } },
  });

  // Only a submitted form gets the thank-you page.
  if (!link?.submission || link.submission.status === "draft") redirect(`/intake/${token}`);

  const firstName = link.submission.fullName?.trim().split(/\s+/)[0];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-14 sm:px-6 sm:py-20">
        <CheckCircle2 className="h-12 w-12 text-health-green" aria-hidden />
        <h1 className="mt-5 font-wide text-4xl font-bold tracking-tight sm:text-5xl">
          {firstName ? `Thank you, ${firstName}.` : "Thank you."}
        </h1>
        <p className="mt-5 text-lg leading-relaxed">
          Your answers are with the FINETHY team. Your advisor will review them before your consultation, so you can
          spend the meeting on what matters to you.
        </p>
        <p className="mt-4 leading-relaxed">
          If anything changes before then, or you remember something you left out, just tell your advisor when you
          meet. You can close this page now.
        </p>
        <p className="mt-8 text-[15px]">
          Questions? Call <a className="font-semibold text-brand-blue underline-offset-4 hover:underline" href={SITE.phoneHref}>{SITE.phoneDisplay}</a>{" "}
          or email <a className="font-semibold text-brand-blue underline-offset-4 hover:underline" href={SITE.emailHref}>{SITE.email}</a>.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
