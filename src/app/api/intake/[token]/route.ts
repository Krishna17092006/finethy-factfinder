import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeIntakePayload } from "@/lib/intake-schema";
import { loadIntake } from "@/lib/intake-access";
import { clientIp, rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ token: string }> };

/** Returns the client's own draft (only the fields they can see/edit). */
export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params;
  const result = await loadIntake(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ submission: result.clientView, status: result.submission.status });
}

/** Autosave. Only allow-listed fields are written; the form stays editable until submitted. */
export async function PUT(request: NextRequest, { params }: Params) {
  const { token } = await params;
  if (!rateLimit(`save:${clientIp(request.headers)}`, 240, 60_000).ok) {
    return NextResponse.json({ error: "Too many saves, slow down" }, { status: 429 });
  }

  const result = await loadIntake(token);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  if (result.submission.status !== "draft") {
    return NextResponse.json({ error: "This form has already been submitted" }, { status: 409 });
  }

  const body = await request.json().catch(() => null);
  const { data, rejected } = sanitizeIntakePayload(body);
  delete data.consentGiven; // consent is only recorded on submit

  await prisma.submission.update({ where: { id: result.submission.id }, data });
  return NextResponse.json({ success: true, rejected });
}
