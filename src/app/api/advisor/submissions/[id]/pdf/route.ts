import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAnalysis } from "@/lib/analysis-cache";
import { pdfFileName } from "@/lib/pdf-name";

export const runtime = "nodejs";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (submission.status === "draft") {
    return NextResponse.json({ error: "The client has not submitted this form yet" }, { status: 409 });
  }

  try {
    const analysis = await getAnalysis(submission);
    const { generatePdfBuffer } = await import("@/lib/pdf");
    const pdf = await generatePdfBuffer(submission, analysis);
    const inline = request.nextUrl.searchParams.get("inline") === "1";

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${pdfFileName(submission.fullName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
