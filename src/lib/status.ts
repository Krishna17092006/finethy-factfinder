/** Submission lifecycle. */
export const SUBMISSION_STATUSES = ["draft", "submitted", "reviewed", "met"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

/** Statuses an advisor can set (a client moves draft → submitted). */
export const ADVISOR_STATUSES = ["submitted", "reviewed", "met"] as const;

export const STATUS_LABEL: Record<string, string> = {
  draft: "In progress",
  submitted: "New",
  reviewed: "Reviewed",
  met: "Meeting done",
};
