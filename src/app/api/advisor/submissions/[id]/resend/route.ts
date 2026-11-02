import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAnalysis } from "@/lib/analysis-cache";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!rateLimit(`resend:${id}`, 3, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Already resent recently. Try again in a few minutes." }, { status: 429 });
  }

  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.status === "draft") {
    return NextResponse.json({ error: "The client has not submitted this form yet" }, { status: 409 });
  }

  try {
    const analysis = await getAnalysis(submission);
    const { sendReportEmail } = await import("@/lib/notify");
    const result = await sendReportEmail(submission, analysis);
    if (!result.success) {
      return NextResponse.json({ error: result.error || "Email could not be sent" }, { status: 502 });
    }
    return NextResponse.json({ success: true, delivered: result.delivered, messageId: result.messageId });
  } catch (error) {
    console.error("Resend failed:", error);
    return NextResponse.json({ error: "Failed to resend email" }, { status: 500 });
  }
}
