import { describe, it, expect } from "vitest";
import { PDFDocument } from "pdf-lib";
import { generatePdfBuffer } from "../lib/pdf";
import { runAnalysis } from "../lib/analysis";
import { SURESH } from "./fixtures/suresh";

async function pages(sub: Record<string, unknown>) {
  const buf = await generatePdfBuffer(sub, runAnalysis(sub));
  expect(buf.subarray(0, 4).toString()).toBe("%PDF");
  return (await PDFDocument.load(buf)).getPageCount();
}

describe("PDF report", () => {
  it("renders the case study on 8 pages (no near-empty overflow pages)", async () => {
    expect(await pages(SURESH)).toBe(8);
  }, 60_000);

  it("renders for a client with no loans (italic 'No liabilities recorded' used to crash it)", async () => {
    const n = await pages({
      fullName: "Debt Free",
      mobile: "9845012345",
      grossAnnualIncome: 1200000,
      monthlyExpenses: 40000,
      bankSavingsFDValue: 500000,
      consentGiven: true,
    });
    expect(n).toBeGreaterThanOrEqual(6);
  }, 60_000);

  it("renders for a nearly empty submission", async () => {
    expect(await pages({ fullName: "Minimal", mobile: "9845012345" })).toBeGreaterThanOrEqual(5);
  }, 60_000);
});
