import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const submissions = await prisma.submission.findMany({
    where: { status: { not: "draft" } },
    select: {
      id: true,
      fullName: true,
      mobile: true,
      city: true,
      status: true,
      submittedAt: true,
      analysisJson: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  const result = submissions.map(({ analysisJson, ...sub }) => {
    let redCount = 0;
    let yellowCount = 0;
    if (analysisJson) {
      try {
        const analysis = JSON.parse(analysisJson);
        redCount = analysis.redCount || 0;
        yellowCount = analysis.yellowCount || 0;
      } catch {
        // ignore corrupt cache; the report page recomputes it
      }
    }
    return { ...sub, redCount, yellowCount };
  });

  return NextResponse.json({ submissions: result });
}
