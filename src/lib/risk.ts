import { calculateAge } from './utils';
import { RiskProfileResult, HealthMetricResult } from './types';

// Normalizes a score to 0-100 scale
function normalize(score: number, maxScore: number): number {
  return Math.max(0, Math.min(100, Math.round((score / maxScore) * 100)));
}

export function calculateRiskProfile(submission: any, metrics?: HealthMetricResult[]): RiskProfileResult {
  // ---------------------------------------------------------
  // 1. TOLERANCE CALCULATION
  // ---------------------------------------------------------
  let toleranceScore = 0;
  
  const q1 = submission.riskQ1 || 3;
  const q2 = submission.riskQ2 || 3;
  const q3 = submission.riskQ3 || 3;
  const q4 = submission.riskQ4 || 3;
  const q5 = submission.riskQ5 || 3;
  const q6 = submission.riskQ6 || 3;
  const q7 = submission.riskQ7 || 3;
  const q8 = submission.riskQ8 || 3;
  const q9 = submission.riskQ9 || 3;
  const q10 = submission.riskQ10 || 3;
  const q11 = submission.riskQ11 || 3;
  const q12 = submission.riskQ12 || 3;
  const q13 = submission.riskQ13 || 3;
  const q14 = submission.riskQ14 || 3;

  // Q3 "noHistory" check: If Q3 is 3 but they selected "I wasn't investing then", we redistribute its weight.
  // The form sets data.riskQ3_neutral = true when that happens.
  const isNoHistory = q3 === 3 && submission.riskQ3_neutral === true;

  // Weights
  let w1 = 2.0;
  let w2 = 2.0;
  let w3 = 2.0;
  
  if (isNoHistory) {
    w1 = 3.0;
    w2 = 3.0;
    w3 = 0;
  }

  const w1_5 = [q4, q6, q8, q14];
  const w1_0 = [q5, q7, q9, q10, q11, q12, q13];

  let totalScoreWeighted = (q1 * w1) + (q2 * w2) + (q3 * w3);
  w1_5.forEach(q => totalScoreWeighted += q * 1.5);
  w1_0.forEach(q => totalScoreWeighted += q * 1.0);

  const maxPossibleScore = (5 * w1) + (5 * w2) + (5 * w3) + (w1_5.length * 5 * 1.5) + (w1_0.length * 5 * 1.0);
  
  // Actually the lowest score is 1 per question, so min is (1 * w1) + ...
  // Wait, is "normalise(Σ(score × weight) ÷ Σ(5 × weight)) × 100" scaling from 0-100 based on absolute max?
  // User spec: "toleranceScore = normalise(Σ(score × weight) ÷ Σ(5 × weight)) × 100"
  
  const rawToleranceScore = normalize(totalScoreWeighted, maxPossibleScore);
  // Re-map so that answering 1s gives 0 instead of 20? 
  // The spec didn't strictly ask for (score-1)/(4), it just said:
  // "toleranceScore = normalise(Σ(score × weight) ÷ Σ(5 × weight)) × 100"
  // So a perfect 1 everywhere yields 20/100, which is conservative. That is fine.

  // ---------------------------------------------------------
  // 2. CAPACITY CALCULATION
  // ---------------------------------------------------------
  let capacityScore = 100;
  let capacityConstraint = "No significant constraints.";
  let lowestPenalty = 100;

  const trackConstraint = (score: number, reason: string) => {
    if (score < lowestPenalty) {
      lowestPenalty = score;
      capacityScore = score;
      capacityConstraint = reason;
    }
  };

  // 1. Age
  const age = (submission.dateOfBirth ? calculateAge(submission.dateOfBirth) : 35) ?? 35;
  if (age > 65) trackConstraint(20, "Limited by age and reduced time horizon for recovery.");
  else if (age > 55) trackConstraint(40, "Approaching retirement restricts equity exposure.");
  else if (age > 45) trackConstraint(60, "Mid-career horizon moderates capacity.");
  else trackConstraint(90, "Young age provides a long runway to absorb volatility.");

  // 2. Horizon (from goalsList if available)
  if (submission.goalsList && submission.goalsList.length > 0) {
    const maxHorizon = Math.max(...submission.goalsList.map((g: any) => g.targetYear - new Date().getFullYear()));
    if (maxHorizon <= 3) trackConstraint(20, "Very short time horizon limits risk capacity.");
    else if (maxHorizon <= 7) trackConstraint(50, "Medium time horizon moderates capacity.");
    else trackConstraint(85, "Long time horizon provides high capacity.");
  }

  // 3. Income Stability
  const occupation = submission.occupationType || "";
  if (occupation.includes("Business") || occupation.includes("Self-Employed")) trackConstraint(50, "Variable business income moderates risk capacity.");
  else if (occupation.includes("Salaried")) trackConstraint(85, "Stable salaried income supports capacity.");

  // 4. Emergency Fund
  const efRatio = submission.emergencyFundRatio;
  if (efRatio === undefined || efRatio === null) trackConstraint(40, "Limited by uncertain emergency reserves.");
  else if (efRatio < 1) trackConstraint(15, "Critically limited by lack of emergency fund.");
  else if (efRatio < 3) trackConstraint(35, "Limited by insufficient emergency reserves.");
  else if (efRatio < 6) trackConstraint(60, "Moderate emergency fund provides adequate capacity.");
  else trackConstraint(85, "Strong emergency reserves provide high capacity.");

  // 5. Savings Capacity
  const income = submission.grossAnnualIncome || 0;
  const expenses = submission.monthlyExpenses || 0;
  const emi = submission.totalMonthlyEMIs || 0;
  
  if (income > 0) {
    const surplus = (income / 12) - expenses - emi;
    const savingsRate = (surplus / (income / 12)) * 100;
    
    if (savingsRate < 10) trackConstraint(20, "Low savings rate limits ability to absorb shocks.");
    else if (savingsRate < 20) trackConstraint(50, "Moderate savings rate provides average capacity.");
    else trackConstraint(85, "Strong savings rate provides high capacity.");
    
    // 6. Obligations (EMI)
    const emiRatio = (emi / (income / 12)) * 100;
    if (emiRatio > 50) trackConstraint(20, "Severely restricted by very high EMI burden.");
    else if (emiRatio > 40) trackConstraint(40, "Restricted by high debt obligations.");
    else if (emiRatio > 30) trackConstraint(60, "Moderate debt load slightly limits capacity.");
    else trackConstraint(85, "Low debt burden supports high capacity.");
  }

  // 7. Obligations (Dependents)
  const dependents = submission.totalDependents || 0;
  if (dependents > 3) trackConstraint(40, "High number of financial dependents reduces capacity.");
  else if (dependents > 1) trackConstraint(60, "Financial obligations to dependents moderate capacity.");
  else trackConstraint(85, "Few dependents supports higher capacity.");

  // ---------------------------------------------------------
  // 3. FINAL SCORE
  // ---------------------------------------------------------
  const finalScore = Math.min(capacityScore, rawToleranceScore);

  // ---------------------------------------------------------
  // 4. CONSISTENCY CHECK
  // ---------------------------------------------------------
  let consistencyWarning: string | null = null;
  // Q1 "Sell everything" (1) vs Q2 "+40%/-35%" (5)
  if (q1 <= 2 && q2 >= 4) {
    consistencyWarning = "Answers show some internal inconsistency - stated comfort with high volatility does not match stated reactions to loss. Treat the tolerance score as indicative and probe verbally.";
  }
  // Q12 claims high knowledge (5 or 4) but panics on Q14 (1 or 2)
  else if (q12 >= 4 && q14 <= 2) {
    consistencyWarning = "Answers show some internal inconsistency - claimed market understanding does not align with stated reactions to normal portfolio drawdowns. Treat the tolerance score as indicative and probe verbally.";
  }

  // ---------------------------------------------------------
  // 5. GAP INSIGHT
  // ---------------------------------------------------------
  let gapInsight = "Willingness and ability are aligned.";
  if (rawToleranceScore - capacityScore > 15) {
    gapInsight = `Willing to take more risk than the current financial position supports. The constraint is: ${capacityConstraint} Worth addressing before increasing equity exposure.`;
  } else if (capacityScore - rawToleranceScore > 15) {
    gapInsight = "Financially able to take more risk than they are currently comfortable with. Likely to benefit from education and a gradual increase rather than an immediate one.";
  }

  return {
    capacityScore,
    toleranceScore: rawToleranceScore,
    finalScore,
    capacityConstraint,
    consistencyWarning,
    gapInsight
  };
}
