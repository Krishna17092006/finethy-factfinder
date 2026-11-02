import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { ADVISOR_STATUSES } from "@/lib/status";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { link: true, advisorNotes: { orderBy: { createdAt: "desc" } } },
  });
  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ submission });
}

const Patch = z.object({ status: z.enum(ADVISOR_STATUSES) });

/** Advisor workflow: submitted → reviewed → met (and back, if needed). */
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = Patch.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const current = await prisma.submission.findUnique({ where: { id }, select: { status: true } });
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (current.status === "draft") {
    return NextResponse.json({ error: "The client has not submitted this form yet" }, { status: 409 });
  }

  const submission = await prisma.submission.update({
    where: { id },
    data: {
      status: parsed.data.status,
      ...(parsed.data.status === "reviewed" ? { reviewedAt: new Date() } : {}),
    },
    select: { id: true, status: true, reviewedAt: true },
  });
  return NextResponse.json({ submission });
}

/**
 * Delete an intake that was never submitted (cleans up abandoned links).
 * Submitted client records cannot be deleted from the app.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const sub = await prisma.submission.findUnique({ where: { id }, select: { status: true, linkId: true } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sub.status !== "draft") {
    return NextResponse.json({ error: "Submitted intakes cannot be deleted" }, { status: 409 });
  }
  await prisma.$transaction([
    prisma.advisorNote.deleteMany({ where: { submissionId: id } }),
    prisma.submission.delete({ where: { id } }),
    prisma.intakeLink.delete({ where: { id: sub.linkId } }),
  ]);
  return NextResponse.json({ success: true });
}
