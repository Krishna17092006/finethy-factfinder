import { describe, it, expect } from "vitest";
import { runAnalysis } from "../lib/analysis";
import { SURESH } from "./fixtures/suresh";

/**
 * Regression lock on the owner-approved Suresh Venkatesan case study.
 * If any of these change, the maths changed: confirm with the owner before
 * updating the expected values (and bump ANALYSIS_VERSION).
 */
describe("Case study: Suresh Venkatesan", () => {
  const a = runAnalysis(SURESH);
  const metric = (key: string) => a.metrics.find((m) => m.key === key)!;

  it("net worth is ₹2,55,20,000", () => {
    expect(a.netWorth).toBe(25_520_000);
  });

  it("monthly household surplus is ₹1,72,000", () => {
    expect(a.monthlySurplus).toBe(172_000);
  });

  it("flags exactly 2 red and 2 yellow", () => {
    expect([a.redCount, a.yellowCount]).toEqual([2, 2]);
    expect(metric("lifeCoverAdequacy").status).toBe("RED");
    expect(metric("liquidityRatio").status).toBe("RED");
    expect(metric("healthCoverAdequacy").status).toBe("YELLOW");
    expect(metric("creditCardRevolvingDebt").status).toBe("YELLOW");
  });

  it("equity exposure is ~56.7% and green against the ~57% ideal", () => {
    expect(metric("equityExposureVsAge").displayValue).toMatch(/^56\.7%/);
    expect(metric("equityExposureVsAge").status).toBe("GREEN");
  });

  it("risk capacity lands in the expected 55–65 band and agrees with the health table", () => {
    const r = a.riskProfile!;
    expect(r.capacityScore).toBeGreaterThanOrEqual(55);
    expect(r.capacityScore).toBeLessThanOrEqual(65);
    expect(r.finalScore).toBe(Math.min(r.capacityScore, r.toleranceScore));
    // Savings rate is green in the table, so it must not be the capacity constraint
    expect(metric("savingsRate").status).toBe("GREEN");
    expect(r.capacityConstraint).not.toMatch(/savings rate/i);
  });

  it("keeps all three goals in the case study's priority order", () => {
    expect(a.topGoal).toBe("Children's education (Daughter)");
  });

  it("raises the questions the advisor expects", () => {
    const qs = a.questionsToRaise.join(" ");
    expect(qs).toMatch(/term cover/i);
    expect(qs).toMatch(/credit card|revolving/i);
    expect(qs).toMatch(/ULIP/);
    expect(qs).toMatch(/education and retirement/i);
  });

  it("quotes the client's own words in the advisor brief", () => {
    expect(a.advisorBrief).toContain("ULIP in 2011");
    expect(a.advisorBrief).toContain("daughter's education");
  });
});
