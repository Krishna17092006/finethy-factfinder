import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "./db";

/** 16 random bytes → 22-char URL-safe token (128 bits; unguessable). */
export function newToken(): string {
  return randomBytes(16).toString("base64url");
}

/** Creates a link and its empty draft submission in one transaction. */
export async function createIntakeLink(opts: { clientName?: string | null; clientPhone?: string | null } = {}) {
  return prisma.$transaction(async (tx) => {
    const link = await tx.intakeLink.create({
      data: { token: newToken(), clientName: opts.clientName ?? null, clientPhone: opts.clientPhone ?? null },
    });
    await tx.submission.create({
      data: {
        linkId: link.id,
        status: "draft",
        currentStep: -1,
        childrenCount: null, // unanswered (the column defaults to 0)
        fullName: opts.clientName ?? null,
        mobile: opts.clientPhone ?? null,
      },
    });
    return link;
  });
}

export function appBaseUrl(request?: Request): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  if (request) return new URL(request.url).origin;
  return "http://localhost:3000";
}

export function intakeUrl(token: string, request?: Request): string {
  return `${appBaseUrl(request)}/intake/${token}`;
}

export function whatsappShareUrl(url: string, phone: string | null, name: string | null): string {
  const first = name?.trim().split(/\s+/)[0];
  const greeting = first ? `Namaste ${first}!` : "Namaste!";
  const text = `${greeting} To make the most of our meeting, please fill in this short form (about 10 minutes). Approximate answers are fine: ${url} — FINETHY`;
  const to = phone ? (phone.length === 10 ? `91${phone}` : phone) : "";
  return `https://wa.me/${to}?text=${encodeURIComponent(text)}`;
}
