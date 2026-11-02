import { calculateAge } from "./utils";
import type { RiskProfileResult } from "./types";

/**
 * Risk profiling engine.
 *
 * Tolerance (willingness) comes from the 14 scored questions, weighted so that
 * past behaviour counts more than hypotheticals. Capacity (ability) comes from
 * hard facts only: age, horizon, income stability, emergency fund, savings
 * capacity and obligations. Health metrics such as life cover are NOT capacity
 * inputs.
 *
 * Golden rule: final score = MIN(capacity, tolerance).
 *
 * Expects a submission that has already been through `deriveData`.
 */

function normalize(score: number, maxScore: number): number {
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateRiskProfile(submission: any): RiskProfileResult {
  // ---------------------------------------------------------------
  // 1. TOLERANCE
  // ---------------------------------------------------------------
  const q = (n: number): number => {
    const v = submission[`riskQ${n}`];
    return typeof v === "number" && v >= 1 && v <= 5 ? v : 3;
  };
  const [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13, q14] = Array.from({ length: 14 }, (_, i) => q(i + 1));

  // Q3 "I wasn't investing then" scores a neutral 3; its weight moves to Q1/Q2.
  const noHistory = q3 === 3 && (submission.riskQ3NoHistory ?? submission.riskQ3_neutral) === true;
  const [w1, w2, w3] = noHistory ? [3.0, 3.0, 0] : [2.0, 2.0, 2.0];

  const weight15 = [q4, q6, q8, q14];
  const weight10 = [q5, q7, q9, q10, q11, q12, q13];

  let weighted = q1 * w1 + q2 * w2 + q3 * w3;
  weight15.forEach((v) => (weighted += v * 1.5));
  weight10.forEach((v) => (weighted += v * 1.0));

  const maxPossible = 5 * (w1 + w2 + w3) + weight15.length * 5 * 1.5 + weight10.length * 5;
  // Spec: normalise(Σ(score × weight) ÷ Σ(5 × weight)) × 100. All-1 answers give 20.
  const toleranceScore = normalize(weighted, maxPossible);

  // ---------------------------------------------------------------
  // 2. CAPACITY: the tightest constraint wins
  // ---------------------------------------------------------------
  let capacityScore = 100;
  let capacityConstraint = "No significant constraints.";
  const track = (score: number, reason: string) => {
    if (score < capacityScore) {
      capacityScore = score;
      capacityConstraint = reason;
    }
  };

  // Age
  const age = calculateAge(submission.dateOfBirth) ?? 35;
  if (age > 65) track(20, "Limited by age and reduced time horizon for recovery.");
  else if (age > 55) track(40, "Approaching retirement restricts equity exposure.");
  else if (age > 45) track(60, "Mid-career horizon moderates capacity.");
  else track(90, "Young age provides a long runway to absorb volatility.");

  // Horizon: longest goal with a real target year
  const thisYear = new Date().getFullYear();
  const years: number[] = Array.isArray(submission.goalsList)
    ? submission.goalsList
        .map((g: { targetYear?: unknown }) => g?.targetYear)
        .filter((y: unknown): y is number => typeof y === "number" && Number.isFinite(y))
    : [];
  if (years.length > 0) {
    const maxHorizon = Math.max(...years) - thisYear;
    if (maxHorizon <= 3) track(20, "Very short time horizon limits risk capacity.");
    else if (maxHorizon <= 7) track(50, "Medium time horizon moderates capacity.");
    else track(85, "Long time horizon provides high capacity.");
  }

  // Income stability
  const occupation: string = submission.occupationType || "";
  if (occupation.includes("Business") || occupation.includes("Self-Employed")) {
    track(50, "Variable business income moderates risk capacity.");
  } else if (occupation.includes("Salaried")) {
    track(85, "Stable salaried income supports capacity.");
  }

  // Emergency fund: the same derived ratio the health table shows
  const efRatio = submission.emergencyFundRatio;
  if (efRatio === undefined || efRatio === null) track(40, "Limited by uncertain emergency reserves.");
  else if (efRatio < 1) track(15, "Critically limited by lack of emergency fund.");
  else if (efRatio < 3) track(35, "Limited by insufficient emergency reserves.");
  else if (efRatio < 6) track(60, "Moderate emergency fund provides adequate capacity.");
  else track(85, "Strong emergency reserves provide high capacity.");

  // Savings capacity and EMI burden: household income, exactly as the health
  // table computes them (savings rate / EMI burden rows), so the capacity
  // constraint text can never contradict the table.
  const income = submission.householdAnnualIncome || submission.grossAnnualIncome || 0;
  const expenses = submission.monthlyExpenses || 0;
  const emi = submission.totalMonthlyEMIs || 0;
  if (income > 0) {
    const monthly = income / 12;
    const savingsRate = ((monthly - expenses - emi) / monthly) * 100;
    if (savingsRate < 10) track(20, "Low savings rate limits ability to absorb shocks.");
    else if (savingsRate < 20) track(50, "Moderate savings rate provides average capacity.");
    else track(85, "Strong savings rate provides high capacity.");

    const emiRatio = (emi / monthly) * 100;
    if (emiRatio > 50) track(20, "Severely restricted by very high EMI burden.");
    else if (emiRatio > 40) track(40, "Restricted by high debt obligations.");
    else if (emiRatio > 30) track(60, "Moderate debt load slightly limits capacity.");
    else track(85, "Low debt burden supports high capacity.");
  }

  // Dependents
  const dependents = submission.totalDependents || 0;
  if (dependents > 3) track(40, "High number of financial dependents reduces capacity.");
  else if (dependents > 1) track(60, "Financial obligations to dependents moderate capacity.");
  else track(85, "Few dependents supports higher capacity.");

  // ---------------------------------------------------------------
  // 3. FINAL SCORE
  // ---------------------------------------------------------------
  const finalScore = Math.min(capacityScore, toleranceScore);

  // ---------------------------------------------------------------
  // 4. CONSISTENCY CHECK
  // ---------------------------------------------------------------
  let consistencyWarning: string | null = null;
  if (q1 <= 2 && q2 >= 4) {
    consistencyWarning =
      "Answers show some internal inconsistency - stated comfort with high volatility does not match stated reactions to loss. Treat the tolerance score as indicative and probe verbally.";
  } else if (q12 >= 4 && q14 <= 2) {
    consistencyWarning =
      "Answers show some internal inconsistency - claimed market understanding does not align with stated reactions to normal portfolio drawdowns. Treat the tolerance score as indicative and probe verbally.";
  }

  // ---------------------------------------------------------------
  // 5. GAP INSIGHT
  // ---------------------------------------------------------------
  let gapInsight = "Willingness and ability are aligned.";
  if (toleranceScore - capacityScore > 15) {
    gapInsight = `Willing to take more risk than the current financial position supports. The constraint is: ${capacityConstraint} Worth addressing before increasing equity exposure.`;
  } else if (capacityScore - toleranceScore > 15) {
    gapInsight =
      "Financially able to take more risk than they are currently comfortable with. Likely to benefit from education and a gradual increase rather than an immediate one.";
  }

  return { capacityScore, toleranceScore, finalScore, capacityConstraint, consistencyWarning, gapInsight };
}

/** Band names used across the web report and the PDF. */
export function riskBand(score: number): string {
  if (score < 20) return "Conservative";
  if (score < 40) return "Moderately Conservative";
  if (score < 60) return "Balanced";
  if (score < 80) return "Moderately Aggressive";
  return "Aggressive";
}
