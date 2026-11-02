import "server-only";
import type { Submission } from "@prisma/client";
import { prisma } from "./db";
import { INTAKE_FIELDS } from "./intake-schema";

type LoadResult =
  | { ok: true; submission: Submission; clientView: Record<string, unknown> }
  | { ok: false; status: number; error: string };

/** Only the fields a client is allowed to see about their own form. */
export function toClientView(sub: Submission): Record<string, unknown> {
  const view: Record<string, unknown> = { status: sub.status };
  for (const key of Object.keys(INTAKE_FIELDS)) {
    view[key] = (sub as unknown as Record<string, unknown>)[key] ?? null;
  }
  return view;
}

/**
 * Looks up an intake by its link token, creating the draft on first visit
 * (links created before drafts were made up-front). Enforces link expiry.
 */
export async function loadIntake(token: string): Promise<LoadResult> {
  if (!token || token.length > 64) return { ok: false, status: 404, error: "This link is not valid." };

  const link = await prisma.intakeLink.findUnique({ where: { token }, include: { submission: true } });
  if (!link) return { ok: false, status: 404, error: "This link is not valid." };

  let submission = link.submission;
  if (link.expiresAt && link.expiresAt.getTime() < Date.now() && (!submission || submission.status === "draft")) {
    return { ok: false, status: 410, error: "This link has expired. Please ask your advisor for a new one." };
  }

  if (!submission) {
    submission = await prisma.submission.create({
      data: {
        linkId: link.id,
        status: "draft",
        currentStep: -1,
        childrenCount: null,
        fullName: link.clientName || null,
        mobile: link.clientPhone || null,
      },
    });
  }

  return { ok: true, submission, clientView: toClientView(submission) };
}
