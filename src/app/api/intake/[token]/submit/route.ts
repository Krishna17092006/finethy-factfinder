import { NextRequest, NextResponse, after } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeIntakePayload, submissionProblem } from "@/lib/intake-schema";
import { loadIntake } from "@/lib/intake-access";
import { runAnalysis } from "@/lib/analysis";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!rateLimit(`submit:${clientIp(request.headers)}`, 20, 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts, please wait a minute" }, { status: 429 });
  }

  const result = await loadIntake(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  if (result.submission.status !== "draft") {
    // Idempotent: a double-tap on Submit should still land on the thank-you page.
    return NextResponse.json({ success: true, alreadySubmitted: true });
  }

  const body = await request.json().catch(() => null);
  const { data } = sanitizeIntakePayload(body);
  const merged = { ...result.submission, ...data };

  const problem = submissionProblem(merged);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  // Analysis is computed before saving so the record is never "submitted" without it.
  const analysis = runAnalysis(merged);

  const submission = await prisma.submission.update({
    where: { id: result.submission.id },
    data: {
      ...data,
      consentGiven: true,
      status: "submitted",
      submittedAt: new Date(),
      currentStep: 9,
      analysisJson: JSON.stringify(analysis),
    },
  });

  // Build the PDF and email the advisor after the client already has their answer.
  after(async () => {
    try {
      const { sendReportEmail } = await import("@/lib/notify");
      await sendReportEmail(submission, analysis);
    } catch (error) {
      console.error("Advisor email failed (submission is saved):", error);
    }
  });

  return NextResponse.json({ success: true });
}
