import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

const NewNote = z.object({ content: z.string().trim().min(1, "Note cannot be empty").max(5000) });

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const parsed = NewNote.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid note" }, { status: 400 });
  }
  const exists = await prisma.submission.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const note = await prisma.advisorNote.create({ data: { submissionId: id, content: parsed.data.content } });
  return NextResponse.json({ note });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const noteId = request.nextUrl.searchParams.get("noteId");
  if (!noteId) return NextResponse.json({ error: "noteId required" }, { status: 400 });
  const result = await prisma.advisorNote.deleteMany({ where: { id: noteId, submissionId: id } });
  if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
