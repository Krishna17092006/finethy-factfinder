import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createIntakeLink, intakeUrl, whatsappShareUrl } from "@/lib/links";

const NewLink = z.object({
  clientName: z.string().trim().max(120).optional().nullable(),
  clientPhone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+\s-]*$/, "Phone can only contain digits")
    .optional()
    .nullable(),
});

export async function POST(request: NextRequest) {
  const parsed = NewLink.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }
  const clientName = parsed.data.clientName || null;
  const clientPhone = parsed.data.clientPhone?.replace(/[^0-9]/g, "") || null;

  const link = await createIntakeLink({ clientName, clientPhone });
  const url = intakeUrl(link.token, request);

  return NextResponse.json({
    success: true,
    link: { ...link, url, whatsappUrl: whatsappShareUrl(url, clientPhone, clientName) },
  });
}

export async function GET() {
  const links = await prisma.intakeLink.findMany({
    include: { submission: { select: { id: true, status: true, fullName: true, submittedAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ links });
}
