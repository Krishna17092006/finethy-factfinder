import { AnalysisResult, HealthMetricResult } from "./types";
import { formatRupees, formatRupeesShort, calculateAge, cleanString } from "./utils";

export function generateObservation(metric: HealthMetricResult, submission: any): string | null {
  const v = metric.value;
  const isSingle = submission.maritalStatus === "Single" && (submission.totalDependents === 0 || !submission.totalDependents);
  if (v === null || v === undefined) return null;

  switch (metric.key) {
    case "emergencyFundRatio":
      if (metric.status === "RED") {
        return `Emergency fund covers barely ${v.toFixed(1)} months. If income stops, this ${isSingle ? "client" : "household"} faces immediate cash flow stress.`;
      } else if (metric.status === "YELLOW") {
        return `Emergency fund is at ${v.toFixed(1)} months. Getting this closer to 6 months provides better peace of mind.`;
      }
      break;
    
    case "savingsRate":
      if (metric.status === "RED") {
        return `Savings rate is only ${v.toFixed(1)}%. Expenses and obligations are eating most of the income. Finding areas to trim is crucial.`;
      } else if (metric.status === "YELLOW") {
        return `Savings rate is ${v.toFixed(1)}% — below the 20% gold standard. Look for ways to boost this slightly.`;
      }
      break;

    case "emiToIncomeRatio":
      if (metric.status === "RED") {
        return `EMI burden is ${v.toFixed(1)}% of income — above the safe 40% ceiling. Any income disruption puts the household at severe risk.`;
      } else if (metric.status === "YELLOW") {
        return `EMI burden is ${v.toFixed(1)}%. While manageable, it leaves less room for wealth creation.`;
      }
      break;

    case "debtToAssetsRatio":
      if (metric.status === "RED") {
        return `Debt makes up ${v.toFixed(1)}% of total assets, indicating high leverage. Reducing debt should be a priority over aggressive investing.`;
      } else if (metric.status === "YELLOW") {
        return `Debt-to-assets is ${v.toFixed(1)}%. Keep an eye on borrowing costs relative to asset growth.`;
      }
      break;

    case "lifeCoverAdequacy":
      if (metric.status === "RED") {
        return v === 0 
          ? `No term insurance despite having dependents — this is the most urgent gap.`
          : `Term cover is only ${v.toFixed(0)}% of the ideal amount. ${isSingle ? "The client" : "Family"} is exposed to significant financial risk in case of tragedy.`;
      } else if (metric.status === "YELLOW") {
        return `Term cover is ${v.toFixed(0)}% of ideal. Consider increasing cover if liabilities grow.`;
      }
      break;

    case "healthCoverAdequacy":
      if (metric.status === "RED") {
        return v === 0
          ? `No health insurance. A single hospitalization could wipe out savings.`
          : `Health cover is only ${v.toFixed(0)}% of benchmark. Very vulnerable to medical inflation.`;
      } else if (metric.status === "YELLOW") {
        if (submission.healthInsuranceType === "Only employer-provided") {
          return `Relying solely on employer health cover is risky. A job change or loss leaves the ${isSingle ? "client" : "family"} uninsured. Need a personal base policy.`;
        }
        return `Health cover is ${v.toFixed(0)}% of benchmark. Consider a super top-up policy.`;
      }
      break;

    case "liquidityRatio":
      if (metric.status === "RED") {
        if (v > 50) return `Liquidity ratio is ${v.toFixed(0)}%. Too much money is sleeping in the bank or FDs instead of growing.`;
        return `Liquidity ratio is only ${v.toFixed(0)}%. Assets are too locked up to handle sudden large expenses.`;
      } else if (metric.status === "YELLOW") {
        if (v > 30) return `Liquidity ratio is ${v.toFixed(0)}%, slightly higher than ideal. Could deploy some cash into growth assets.`;
        return `Liquidity ratio is ${v.toFixed(0)}%, slightly low. Make sure emergency needs are fully covered.`;
      }
      break;

    case "realEstateConcentration":
      if (metric.status === "RED") {
        return `Portfolio is ${v.toFixed(0)}% real estate. This high concentration risk makes the portfolio highly illiquid.`;
      } else if (metric.status === "YELLOW") {
        return `Real estate makes up ${v.toFixed(0)}% of assets. Future investments should ideally be in financial assets to balance this.`;
      }
      break;

    case "equityExposureVsAge":
      if (metric.status === "RED") {
        if (v > 0) return `Equity exposure is significantly higher (>30% off) than typical age-based heuristics. The portfolio carries high short-term volatility risk.`;
        return `Equity exposure is significantly lower (>30% off) than typical age-based heuristics, exposing the portfolio to long-term inflation risk.`;
      } else if (metric.status === "YELLOW") {
        if (v > 0) return `Equity allocation deviates somewhat from typical age-based heuristics (aggressive).`;
        return `Equity allocation deviates somewhat from typical age-based heuristics (conservative).`;
      }
      break;

    case "retirementReadiness":
      if (metric.status === "RED") {
        return `Currently on track for roughly ${v.toFixed(0)}% of estimated retirement needs. Current savings trajectory shows a significant gap toward the target corpus.`;
      } else if (metric.status === "YELLOW") {
        return `On track for roughly ${v.toFixed(0)}% of estimated retirement needs. Current trajectory is slightly below the target corpus.`;
      }
      break;

    case "insuranceAsInvestmentLeak":
      if (metric.status === "RED") {
        return `${v.toFixed(1)}% of savings capacity is going into traditional/endowment policies. This is a significant leak into low-yield products.`;
      } else if (metric.status === "YELLOW") {
        return `${v.toFixed(1)}% of savings is locked in traditional policies. Ensure term insurance is adequate before buying more of these.`;
      }
      break;

    case "creditCardRevolvingDebt":
      if (metric.status === "RED") {
        return `Revolving credit card balance is critically high (>= 1 month income). At ~40% p.a. interest, this must be cleared immediately.`;
      } else if (metric.status === "YELLOW") {
        return `Carrying a credit card balance. Clear this completely before investing further.`;
      }
      break;
  }
  return null;
}

export function generateAdvisorBrief(submission: any, analysis: AnalysisResult): string {
  const name = cleanString(submission.fullName) || "Client";
  const age = calculateAge(submission.dateOfBirth);
  const ageStr = age ? `, ${age},` : "";
  
  // Fix "a other"
  let occType = submission.occupationType ? submission.occupationType.toLowerCase() : "";
  if (occType === "other") occType = "works in an unlisted field";
  else if (occType) occType = `a ${occType} professional`;
  else occType = "a client";
  
  const occ = occType ? ` ${occType}` : "";
  
  let familyStr = "";
  if (submission.maritalStatus === "Married") {
    const spouse = submission.spouseOccupation ? submission.spouseOccupation.toLowerCase() : "spouse";
    const kids = submission.childrenCount ? ` and ${submission.childrenCount} children` : "";
    familyStr = ` with ${spouse}${kids}`;
  } else if (submission.maritalStatus) {
    familyStr = ` (${submission.maritalStatus.toLowerCase()})`;
  }

  // Dependent parent check
  const hasParents = submission.dependentTypes && submission.dependentTypes.includes("Parents");
  if (hasParents) {
    familyStr += `, supporting a parent`;
  }

  // 1. Intro
  let brief = `${name}${ageStr}${occ}${familyStr}. `;

  // 2. Income/Savings
  const inc = analysis.annualIncome;
  const surplus = analysis.monthlySurplus;
  const srMetric = analysis.metrics.find(m => m.key === "savingsRate");
  const sr = srMetric?.value || 0;
  
  if (inc > 0) {
    if (surplus < 0) {
      brief += `Income is ${formatRupeesShort(inc)} against expenses of ${formatRupeesShort((submission.monthlyExpenses || 0) * 12)}, resulting in a monthly deficit. `;
    } else if (sr >= 30) {
      brief += `Strong income (${formatRupeesShort(inc)}) with an excellent savings rate of ${sr.toFixed(0)}%. `;
    } else if (sr >= 10) {
      brief += `Income is ${formatRupeesShort(inc)}, maintaining a savings rate of ${sr.toFixed(0)}%. `;
    } else {
      brief += `Income is ${formatRupeesShort(inc)}, but the savings rate is only ${sr.toFixed(0)}% — expenses or EMIs are eating the surplus. `;
    }
  } else {
    brief += `Income details pending. `;
  }

  // 3 & 4. Priorities
  const redFlags = analysis.metrics.filter(m => m.status === "RED");
  const yellowFlags = analysis.metrics.filter(m => m.status === "YELLOW");
  const priorities: string[] = [];
  
  // Process all RED flags first, then YELLOW
  const allFlags = [...redFlags, ...yellowFlags];
  for (const flag of allFlags) {
    if (flag.key === "creditCardRevolvingDebt") priorities.push("Clear expensive credit card debt immediately");
    else if (flag.key === "lifeCoverAdequacy") priorities.push("Secure adequate term life cover");
    else if (flag.key === "emergencyFundRatio") priorities.push("Build emergency fund to safe levels");
    else if (flag.key === "emiToIncomeRatio") priorities.push("Address high EMI burden (restructure/prepay)");
    else if (flag.key === "healthCoverAdequacy") priorities.push("Upgrade health insurance coverage");
    else if (flag.key === "savingsRate") priorities.push("Optimize expenses to boost savings rate");
    else if (flag.key === "realEstateConcentration") priorities.push("Diversify away from real estate into financial assets");
    else if (flag.key === "insuranceAsInvestmentLeak") priorities.push("Review traditional policies for potential surrender/paid-up");
    else if (flag.key === "liquidityRatio" && flag.value! > 50) priorities.push("Deploy idle bank funds into growth assets");
    else if (flag.key === "liquidityRatio" && flag.value! < 10) priorities.push("Ensure emergency liquidity is accessible");
  }

  // Add top goal
  if (analysis.topGoal) {
    priorities.push(`Start planning for top goal: ${analysis.topGoal}`);
  }

  if (priorities.length > 0) {
    // deduplicate just in case
    const uniquePriorities = [...new Set(priorities)];
    brief += `Priorities for the meeting: ` + uniquePriorities.map((p, i) => `(${i+1}) ${p}`).join(", ") + ". ";
  }

  // 5. Past bad experience
  if (submission.pastBadExperience) {
    brief += `\n\nNote: Client mentioned a bad past experience: "${submission.pastBadExperience}" — be ready to address trust concerns.`;
  }

  return brief;
}

export function generateQuestions(submission: any, analysis: AnalysisResult): string[] {
  const q: string[] = [];
  const redFlags = analysis.metrics.filter(m => m.status === "RED");
  const yellowFlags = analysis.metrics.filter(m => m.status === "YELLOW");

  // Specific flag checks
  if (redFlags.some(m => m.key === "lifeCoverAdequacy") || yellowFlags.some(m => m.key === "lifeCoverAdequacy")) {
    q.push("What is your current term cover? Any group life cover from employer? Have you reviewed your cover since your income grew?");
  }
  if (redFlags.some(m => m.key === "liquidityRatio") || yellowFlags.some(m => m.key === "liquidityRatio")) {
    q.push("Are your liquid assets accessible within 48 hours, or are most FDs locked in? Would you consider a liquid fund for the emergency corpus?");
  }
  if (redFlags.some(m => m.key === "healthCoverAdequacy") || yellowFlags.some(m => m.key === "healthCoverAdequacy")) {
    q.push("Is the employer cover portable if you change jobs? Have you considered a super top-up policy?");
  }
  if (redFlags.some(m => m.key === "creditCardRevolvingDebt") || yellowFlags.some(m => m.key === "creditCardRevolvingDebt")) {
    q.push(`Is the ${submission.creditCardOutstanding ? "Rs. " + (submission.creditCardOutstanding/100000).toFixed(1) + "L" : "credit card"} revolving balance on one card or multiple? What is the current interest rate?`);
  }
  if (redFlags.some(m => m.key === "realEstateConcentration")) {
    q.push("Is the property self-occupied or an investment? Any intention to liquidate?");
  }
  if (redFlags.some(m => m.key === "emiToIncomeRatio")) {
    q.push("Which loan carries the highest interest rate? Any prepayment penalty?");
  }
  if (redFlags.some(m => m.key === "emergencyFundRatio")) {
    q.push("Do you have any undisclosed cash or liquid assets to cover immediate emergencies?");
  }

  // Goals tension
  if (submission.goalsList && submission.goalsList.length > 1) {
    const hasEducation = submission.goalsList.some((g: any) => g.name.toLowerCase().includes('education'));
    const hasRetirement = submission.goalsList.some((g: any) => g.name.toLowerCase().includes('retirement'));
    if (hasEducation && hasRetirement) {
      q.push("How would you prioritise between children's education and retirement if you had to choose? Is there flexibility on the education target amount or year?");
    }
  }

  // Q15 check
  if (submission.riskQ15 && submission.riskQ15.toLowerCase().includes('ulip')) {
    q.push("Given your experience with the ULIP, are you open to term insurance specifically, or does the hesitation extend to all insurance products?");
  }

  if (submission.hasMutualFunds && !submission.mfEquityPercent) {
    q.push("What is the equity/debt split of your existing mutual fund portfolio?");
  }
  
  return q;
}
