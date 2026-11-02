import type { IntakeLink, Submission } from "@prisma/client";

export type Category = "new" | "reviewed" | "met" | "in_progress" | "not_started";

/** Fields that only change once the client actually starts answering. */
const ACTIVITY_FIELDS = [
  "dateOfBirth",
  "maritalStatus",
  "city",
  "email",
  "occupationType",
  "grossAnnualIncome",
  "monthlyExpenses",
  "hasBankSavingsFD",
  "hasHomeLoan",
  "hasTermInsurance",
  "selectedGoals",
  "riskQ1",
] as const;

export function hasClientActivity(sub: Submission): boolean {
  if ((sub.activeTimeSeconds ?? 0) > 0) return true;
  if ((sub.currentStep ?? 0) > 0) return true;
  return ACTIVITY_FIELDS.some((k) => {
    const v = (sub as unknown as Record<string, unknown>)[k];
    return v !== null && v !== undefined && v !== "";
  });
}

export function categorize(sub: Submission): Category {
  if (sub.status === "submitted") return "new";
  if (sub.status === "reviewed") return "reviewed";
  if (sub.status === "met") return "met";
  return hasClientActivity(sub) ? "in_progress" : "not_started";
}

/**
 * Blank forms that are safe to remove: never touched, not addressed to a
 * named client by an advisor, and older than an hour (so nobody is on the
 * welcome screen right now).
 */
export function isDisposableBlank(sub: Submission & { link: IntakeLink }, now = Date.now()): boolean {
  if (sub.status !== "draft" || hasClientActivity(sub)) return false;
  const unnamed = !sub.link.clientName || sub.link.clientName === "Open Client";
  return unnamed && now - sub.createdAt.getTime() > 60 * 60 * 1000;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  new: "New",
  reviewed: "Reviewed",
  met: "Meeting done",
  in_progress: "In progress",
  not_started: "Not opened yet",
};
