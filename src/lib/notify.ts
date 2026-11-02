import "server-only";
import type { AnalysisResult } from "./types";
import { sendFactFinderEmail, emailDeliveryConfigured } from "./email";
import { generatePdfBuffer } from "./pdf";

/** Builds the PDF and emails it to the advisor inbox. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendReportEmail(submission: any, analysis: AnalysisResult) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
  const pdfBuffer = await generatePdfBuffer(submission, analysis);
  const result = await sendFactFinderEmail({
    clientName: submission.fullName || "Unknown Client",
    redCount: analysis.redCount || 0,
    yellowCount: analysis.yellowCount || 0,
    pdfBuffer,
    date,
  });
  return { ...result, delivered: emailDeliveryConfigured() };
}
