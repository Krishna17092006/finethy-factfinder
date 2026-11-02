import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isDisposableBlank } from "@/lib/dashboard";

/** Removes blank, unnamed forms nobody ever started (see isDisposableBlank). */
export async function POST() {
  const drafts = await prisma.submission.findMany({ where: { status: "draft" }, include: { link: true } });
  const blanks = drafts.filter((d) => isDisposableBlank(d));
  if (!blanks.length) return NextResponse.json({ removed: 0 });

  await prisma.$transaction([
    prisma.advisorNote.deleteMany({ where: { submissionId: { in: blanks.map((b) => b.id) } } }),
    prisma.submission.deleteMany({ where: { id: { in: blanks.map((b) => b.id) } } }),
    prisma.intakeLink.deleteMany({ where: { id: { in: blanks.map((b) => b.linkId) } } }),
  ]);
  return NextResponse.json({ removed: blanks.length });
}
