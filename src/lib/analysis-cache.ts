import "server-only";
import { prisma } from "./db";
import { runAnalysis, ANALYSIS_VERSION } from "./analysis";
import type { AnalysisResult } from "./types";

/**
 * Returns the analysis for a submission, recomputing it when the stored copy
 * is missing, corrupt or produced by an older engine version. Recomputed
 * results are written back without touching `updatedAt`, so viewing a report
 * never reorders the advisor dashboard.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getAnalysis(submission: any): Promise<AnalysisResult> {
  if (submission.analysisJson) {
    try {
      const cached = JSON.parse(submission.analysisJson) as AnalysisResult;
      if (cached?.analysisVersion === ANALYSIS_VERSION) return cached;
    } catch {
      // fall through and recompute
    }
  }

  const fresh = runAnalysis(submission);
  if (submission.id && submission.status && submission.status !== "draft") {
    const json = JSON.stringify(fresh);
    await prisma.$executeRaw`UPDATE "Submission" SET "analysisJson" = ${json} WHERE "id" = ${submission.id}`;
  }
  return fresh;
}
