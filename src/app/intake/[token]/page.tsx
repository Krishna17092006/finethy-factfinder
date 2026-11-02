import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { MessagePage } from "@/components/site/MessagePage";
import { loadIntake } from "@/lib/intake-access";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your fact-finder",
  robots: { index: false, follow: false },
};

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await loadIntake(token);

  if (!result.ok) {
    return (
      <MessagePage
        title={result.status === 410 ? "This link has expired" : "We couldn't find this form"}
        body={
          result.status === 410
            ? "Links stay open for a limited time. Ask your FINETHY advisor to send you a new one."
            : "Check that you opened the full link from your message. If it still doesn't work, ask your FINETHY advisor for a new link."
        }
      />
    );
  }

  if (result.submission.status !== "draft") redirect(`/intake/${token}/success`);

  return <IntakeForm token={token} initial={result.clientView} />;
}
