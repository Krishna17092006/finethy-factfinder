import { 
  HealthMetricResult, 
  AnalysisResult, 
  AssetBreakdownItem, 
  LiabilityBreakdownItem 
} from "./types";
import { 
  DEFAULT_HEALTH_RANGES, 
  HEALTH_COVER_CONFIG, 
  RETIREMENT_CONFIG,
  HealthStatus
} from "@/config/healthRanges";
import { formatIndianNumber, formatRupees, formatPercent, calculateAge } from "./utils";
import { generateObservation, generateAdvisorBrief, generateQuestions } from "./report";
import { calculateRiskProfile } from "./risk";

// Helper functions for assets
function calculateTotalAssets(sub: any): number {
  return (
    (sub.bankSavingsFDValue || 0) +
    (sub.mutualFundsValue || 0) +
    (sub.stocksValue || 0) +
    (sub.retirementAccountsValue || 0) +
    (sub.investmentPropertyValue || 0) +
    (sub.ownHouseValue || 0) +
    (sub.goldValue || 0) +
    (sub.otherAssetsValue || 0) +
    (sub.cashAtHandValue || 0)
  );
}

function calculateTotalLiabilities(sub: any): number {
  return (
    (sub.homeLoanOutstanding || 0) +
    (sub.carLoanOutstanding || 0) +
    (sub.personalLoanOutstanding || 0) +
    (sub.creditCardOutstanding || 0) +
    (sub.otherLoansOutstanding || 0)
  );
}

function calculateLiquidAssets(sub: any): number {
  const equityPercent = sub.mfEquityPercent !== null && sub.mfEquityPercent !== undefined ? sub.mfEquityPercent : 100;
  const mfDebtValue = sub.mutualFundsValue ? sub.mutualFundsValue * (1 - (equityPercent / 100)) : 0;
  return (sub.bankSavingsFDValue || 0) + (sub.cashAtHandValue || 0) + mfDebtValue;
}

function calculateEquityAssets(sub: any): number {
  const equityPercent = sub.mfEquityPercent !== null && sub.mfEquityPercent !== undefined ? sub.mfEquityPercent : 100;
  const mfEquityValue = sub.mutualFundsValue ? sub.mutualFundsValue * (equityPercent / 100) : 0;
  return (sub.stocksValue || 0) + (sub.otherAssetsValue || 0) + mfEquityValue;
}

function calculateRealEstateAssets(sub: any): number {
  return (sub.investmentPropertyValue || 0) + (sub.ownHouseValue || 0);
}

function getFamilyMemberCount(sub: any): number {
  let count = 1; // Self
  if (sub.maritalStatus === "Married") {
    count += 1; // Spouse
  }
  count += (sub.childrenCount || 0);
  return count;
}

import { deriveData } from "./derive";

import { runSanityCheck } from "./sanity";

export function runAnalysis(rawSubmission: any): AnalysisResult {
  const submission = deriveData(rawSubmission);
  const metrics: HealthMetricResult[] = [];
  
  const totalAssets = calculateTotalAssets(submission);
  const totalLiabilities = calculateTotalLiabilities(submission);
  const netWorth = totalAssets - totalLiabilities;
  const liquidAssets = calculateLiquidAssets(submission);
  const equityAssets = calculateEquityAssets(submission);
  const realEstateAssets = calculateRealEstateAssets(submission);
  
  // Use household income as the basis for calculations
  const annualIncome = submission.householdAnnualIncome || 0;
  const monthlyIncome = annualIncome / 12;
  const monthlyExpenses = submission.monthlyExpenses || 0;
  
  // If the user's computed savings rate is missing, fallback to 0
  const monthlySavings = submission.householdMonthlySurplus || 0;
  const totalMonthlyEMIs = submission.totalMonthlyEMIs || 0;
  const monthlySurplus = submission.householdMonthlySurplus || 0;

  // Run Sanity Layer
  const sanityFlags = runSanityCheck(submission, { 
    totalAssets, 
    totalLiabilities, 
    incomeBasis: annualIncome 
  });

  let dependentsCount = 0;
  if (submission.totalDependents !== undefined && submission.totalDependents !== null) {
    dependentsCount = submission.totalDependents;
  } else {
    if (submission.maritalStatus === "Married" && !submission.spouseEarning) {
      dependentsCount += 1;
    }
    dependentsCount += (submission.childrenCount || 0);
    
    if (submission.dependentTypes) {
      try {
        const types = JSON.parse(submission.dependentTypes);
        if (Array.isArray(types)) dependentsCount += types.length;
      } catch (e) {}
    }
  }

  // 1. Net worth
  metrics.push({
    key: "netWorth",
    name: "Net Worth",
    description: "Total assets minus total liabilities",
    value: netWorth,
    displayValue: formatRupees(netWorth),
    healthyRange: "Positive",
    status: "INFO",
    observation: null,
    tooltip: "Your total wealth after paying off all debts.",
  });

  // 2. Emergency fund ratio
  if (monthlyExpenses > 0) {
    const efMonths = liquidAssets / monthlyExpenses;
    const efRange = DEFAULT_HEALTH_RANGES["emergencyFundRatio"];
    let status: HealthStatus = "RED";
    if (efMonths >= efRange.greenMin!) status = "GREEN";
    else if (efMonths >= efRange.yellowMin!) status = "YELLOW";
    
    metrics.push({
      key: "emergencyFundRatio",
      name: efRange.name,
      description: efRange.description,
      value: efMonths,
      displayValue: `${efMonths.toFixed(1)} months`,
      healthyRange: `at least ${efRange.greenMin} months`,
      status,
      observation: null,
      tooltip: efRange.tooltip,
    });
  }

  // 3. Savings rate
  if (monthlyIncome > 0) {
    const savingsRate = (monthlySavings / monthlyIncome) * 100;
    const srRange = DEFAULT_HEALTH_RANGES["savingsRate"];
    let status: HealthStatus = "RED";
    if (savingsRate >= srRange.greenMin!) status = "GREEN";
    else if (savingsRate >= srRange.yellowMin!) status = "YELLOW";
    
    metrics.push({
      key: "savingsRate",
      name: srRange.name,
      description: srRange.description,
      value: savingsRate,
      displayValue: `${savingsRate.toFixed(1)}%`,
      healthyRange: `at least ${srRange.greenMin}%`,
      status,
      observation: null,
      tooltip: srRange.tooltip,
    });
  }

  // 4. EMI-to-income ratio
  if (monthlyIncome > 0) {
    const emiRatio = (totalMonthlyEMIs / monthlyIncome) * 100;
    const emiRange = DEFAULT_HEALTH_RANGES["emiToIncomeRatio"];
    let status: HealthStatus = "GREEN";
    if (emiRatio >= emiRange.redMin!) status = "RED";
    else if (emiRatio > emiRange.greenMax!) status = "YELLOW";
    let emiStatus: HealthStatus = "GREEN";
    if (emiRatio >= emiRange.redMin!) emiStatus = "RED";
    else if (emiRatio > emiRange.greenMax!) emiStatus = "YELLOW";
    
    metrics.push({
      key: "emiToIncomeRatio",
      name: emiRange.name,
      description: emiRange.description,
      value: emiRatio,
      displayValue: formatPercent(emiRatio),
      healthyRange: `under ${DEFAULT_HEALTH_RANGES.emiToIncomeRatio.greenMax}%`,
      status: emiStatus,
      isEstimated: true,
      observation: null,
      tooltip: "Total monthly EMIs divided by gross monthly income."
    });
  }

  // 5. Debt-to-assets ratio
  if (totalAssets > 0) {
    const debtRatio = (totalLiabilities / totalAssets) * 100;
    const debtRange = DEFAULT_HEALTH_RANGES["debtToAssetsRatio"];
    let status: HealthStatus = "GREEN";
    if (debtRatio >= debtRange.redMin!) status = "RED";
    else if (debtRatio > debtRange.greenMax!) status = "YELLOW";
    
    metrics.push({
      key: "debtToAssetsRatio",
      name: debtRange.name,
      description: debtRange.description,
      value: debtRatio,
      displayValue: `${debtRatio.toFixed(1)}%`,
      healthyRange: `under ${debtRange.greenMax}%`,
      status,
      observation: null,
      tooltip: debtRange.tooltip,
    });
  }

  // 6. Life cover adequacy (only if dependents exist)
  if (dependentsCount > 0) {
    const idealCover = (10 * (submission.grossAnnualIncome || 0)) + totalLiabilities;
    if (idealCover > 0) {
      const actualCover = submission.termInsuranceCover || 0;
      const lifeCoverRatio = (actualCover / idealCover) * 100;
      const lifeRange = DEFAULT_HEALTH_RANGES["lifeCoverAdequacy"];
      
      let status: HealthStatus = "RED";
      let observation: string | null = null;
      
      if (submission.hasTermInsurance === false) {
        status = "RED";
        observation = "Client explicitly noted they have no pure term cover. With dependents relying on this income, this is a critical vulnerability.";
      } else if (submission.hasTermInsurance === null && actualCover === 0) {
        status = "YELLOW";
        observation = "Term insurance details were skipped. Must confirm if adequate cover exists.";
      } else {
        if (lifeCoverRatio >= lifeRange.greenMin!) status = "GREEN";
        else if (lifeCoverRatio >= lifeRange.yellowMin!) status = "YELLOW";
        
        if (status !== "GREEN") {
          observation = `Term cover is only ${lifeCoverRatio.toFixed(0)}% of the recommended ₹${(idealCover/100000).toFixed(1)}L benchmark.`;
        }
      }
      
      metrics.push({
        key: "lifeCoverAdequacy",
        name: lifeRange.name,
        description: lifeRange.description,
        value: lifeCoverRatio,
        displayValue: `${lifeCoverRatio.toFixed(1)}%`,
        healthyRange: `at least ${lifeRange.greenMin}%`,
        status,
        observation,
        tooltip: lifeRange.tooltip,
      });
    }
  }

  // 7. Health cover adequacy
  const familyCount = getFamilyMemberCount(submission);
  const healthBenchmark = HEALTH_COVER_CONFIG.metroBaseAmount + (familyCount > 1 ? (familyCount - 1) * HEALTH_COVER_CONFIG.perMemberAdditional : 0);
  const actualHealthCover = submission.healthInsuranceCover || 0;
  const healthCoverRatio = (actualHealthCover / healthBenchmark) * 100;
  const healthRange = DEFAULT_HEALTH_RANGES["healthCoverAdequacy"];
  let healthStatus: HealthStatus = "RED";
  if (healthCoverRatio >= healthRange.greenMin!) {
    healthStatus = submission.healthInsuranceType === "Only employer-provided" ? "YELLOW" : "GREEN";
  } else if (healthCoverRatio >= healthRange.yellowMin!) {
    healthStatus = "YELLOW";
  }
  
  metrics.push({
    key: "healthCoverAdequacy",
    name: healthRange.name,
    description: healthRange.description,
    value: healthCoverRatio,
    displayValue: `${healthCoverRatio.toFixed(1)}%`,
    healthyRange: `at least ${healthRange.greenMin}%`,
    status: healthStatus,
    observation: null,
    tooltip: healthRange.tooltip,
  });

  // 8. Liquidity ratio
  if (netWorth > 0) {
    const liquidityRatio = (liquidAssets / netWorth) * 100;
    const liqRange = DEFAULT_HEALTH_RANGES["liquidityRatio"];
    let status: HealthStatus = "RED";
    if (liquidityRatio >= liqRange.greenMin! && liquidityRatio <= liqRange.greenMax!) status = "GREEN";
    else if (liquidityRatio >= liqRange.yellowMin! && liquidityRatio <= liqRange.yellowMax!) status = "YELLOW";
    
    metrics.push({
      key: "liquidityRatio",
      name: liqRange.name,
      description: liqRange.description,
      value: liquidityRatio,
      displayValue: `${liquidityRatio.toFixed(1)}%`,
      healthyRange: `${liqRange.greenMin}-${liqRange.greenMax}%`,
      status,
      observation: null,
      tooltip: liqRange.tooltip,
    });
  }

  // 9. Real estate concentration
  if (totalAssets > 0) {
    const exPrimaryRE = realEstateAssets - (submission.ownHouseValue || 0);
    const reRatio = (exPrimaryRE / totalAssets) * 100;
    const reRange = DEFAULT_HEALTH_RANGES["realEstateConcentration"];
    let status: HealthStatus = "GREEN";
    if (reRatio > reRange.redMin!) status = "RED";
    else if (reRatio > reRange.greenMax!) status = "YELLOW";
    
    metrics.push({
      key: "realEstateConcentration",
      name: "Real estate (ex-primary)",
      description: "Concentration in investment real estate",
      value: reRatio,
      displayValue: `${reRatio.toFixed(1)}%`,
      healthyRange: `under ${reRange.greenMax}%`,
      status,
      observation: null,
      tooltip: reRange.tooltip,
    });
  }

  // 10. Equity exposure vs age
  const age = calculateAge(submission.dateOfBirth);
  if (age !== null) {
    const investibleAssets = liquidAssets + equityAssets + (submission.retirementAccountsValue || 0) + (submission.goldValue || 0);
    if (investibleAssets > 0) {
      const equityRatio = (equityAssets / investibleAssets) * 100;
      const idealEquity = Math.max(0, 100 - age);
      const diff = equityRatio - idealEquity;
      const eqRange = DEFAULT_HEALTH_RANGES["equityExposureVsAge"];
      
      let status: HealthStatus = "GREEN";
      if (diff > eqRange.yellowMax! || diff < eqRange.yellowMin!) status = "RED";
      else if (diff > eqRange.greenMax! || diff < eqRange.greenMin!) status = "YELLOW";
      
      metrics.push({
        key: "equityExposureVsAge",
        name: eqRange.name,
        description: eqRange.description,
        value: diff,
        displayValue: `${equityRatio.toFixed(1)}% (Ideal: ~${idealEquity}%)`,
        healthyRange: `+/-${eqRange.greenMax}% from ideal`,
        status,
        observation: null,
        tooltip: eqRange.tooltip,
      });
    }
  }

  // 11. Retirement readiness
  if (age !== null && submission.retirementAge && submission.retirementAge > age) {
    const yearsToRetire = submission.retirementAge - age;
    const annualExpenses = monthlyExpenses * 12;
    const inflatedExpenses = annualExpenses * Math.pow(1 + RETIREMENT_CONFIG.inflationRate, yearsToRetire);
    const targetCorpus = inflatedExpenses * RETIREMENT_CONFIG.corpusMultiple;
    
    const currentRetirementAssets = (submission.retirementAccountsValue || 0) + equityAssets; // Rough estimate of what's for retirement
    const fvCurrentAssets = currentRetirementAssets * Math.pow(1 + RETIREMENT_CONFIG.expectedReturnRate, yearsToRetire);
    
    // Assume 30% of monthly savings goes to retirement
    const annualRetirementSavings = monthlySavings * 12 * 0.3;
    const r = RETIREMENT_CONFIG.expectedReturnRate;
    const n = yearsToRetire;
    const fvSavings = annualRetirementSavings * (Math.pow(1 + r, n) - 1) / r;
    
    const projectedCorpus = fvCurrentAssets + fvSavings;
    const readinessRatio = (projectedCorpus / targetCorpus) * 100;
    
    const retRange = DEFAULT_HEALTH_RANGES["retirementReadiness"];
    let status: HealthStatus = "RED";
    if (readinessRatio >= retRange.greenMin!) status = "GREEN";
    else if (readinessRatio >= retRange.yellowMin!) status = "YELLOW";
    
    metrics.push({
      key: "retirementReadiness",
      name: retRange.name,
      description: retRange.description,
      value: readinessRatio,
      displayValue: `${readinessRatio.toFixed(1)}% on track`,
      healthyRange: `at least ${retRange.greenMin}%`,
      status,
      observation: null,
      tooltip: retRange.tooltip,
    });
  }

  // 12. Insurance-as-investment leak
  if (monthlySavings > 0 && submission.traditionalInsurancePremium) {
    const insuranceLeak = (submission.traditionalInsurancePremium / (monthlySavings * 12)) * 100;
    const leakRange = DEFAULT_HEALTH_RANGES["insuranceAsInvestmentLeak"];
    let status: HealthStatus = "GREEN";
    if (insuranceLeak > leakRange.redMin!) status = "RED";
    else if (insuranceLeak > leakRange.greenMax!) status = "YELLOW";
    
    metrics.push({
      key: "insuranceAsInvestmentLeak",
      name: leakRange.name,
      description: leakRange.description,
      value: insuranceLeak,
      displayValue: `${insuranceLeak.toFixed(1)}%`,
      healthyRange: `under ${leakRange.greenMax}%`,
      status,
      observation: null,
      tooltip: leakRange.tooltip,
    });
  }

  // 13. Credit card revolving debt
  if (monthlyIncome > 0 && submission.creditCardOutstanding) {
    const ccRatio = submission.creditCardOutstanding / monthlyIncome;
    const ccRange = DEFAULT_HEALTH_RANGES["creditCardRevolvingDebt"];
    let status: HealthStatus = "RED";
    if (ccRatio <= ccRange.greenMax!) status = "GREEN";
    else if (ccRatio < ccRange.redMin!) status = "YELLOW";
    
    metrics.push({
      key: "creditCardRevolvingDebt",
      name: ccRange.name,
      description: ccRange.description,
      value: ccRatio,
      displayValue: formatRupees(submission.creditCardOutstanding),
      healthyRange: "None",
      status,
      observation: null,
      tooltip: ccRange.tooltip,
    });
  } else if (!submission.creditCardOutstanding || submission.creditCardOutstanding === 0) {
    metrics.push({
      key: "creditCardRevolvingDebt",
      name: DEFAULT_HEALTH_RANGES["creditCardRevolvingDebt"].name,
      description: DEFAULT_HEALTH_RANGES["creditCardRevolvingDebt"].description,
      value: 0,
      displayValue: "Rs. 0",
      healthyRange: "Rs. 0",
      status: "GREEN",
      observation: null,
      tooltip: DEFAULT_HEALTH_RANGES["creditCardRevolvingDebt"].tooltip,
    });
  }

  // Generate observations for all metrics
  for (const m of metrics) {
    if (m.status === "RED" || m.status === "YELLOW") {
      m.observation = generateObservation(m, submission);
    }
  }

  // Counts
  const redCount = metrics.filter((m) => m.status === "RED").length;
  const yellowCount = metrics.filter((m) => m.status === "YELLOW").length;
  const greenCount = metrics.filter((m) => m.status === "GREEN").length;

  const observations = metrics
    .map(m => m.observation)
    .filter((obs): obs is string => obs !== null);

  // Asset breakdown
  const assetBreakdown: AssetBreakdownItem[] = [];
  if (totalAssets > 0) {
    const addAsset = (cat: string, val: number, col: string) => {
      if (val > 0) assetBreakdown.push({ category: cat, value: val, percentage: (val/totalAssets)*100, color: col });
    };
    addAsset("Bank & FDs", submission.bankSavingsFDValue || 0, "#00bbee");
    addAsset("Mutual Funds", submission.mutualFundsValue || 0, "#2f5aa8");
    addAsset("Stocks", submission.stocksValue || 0, "#6366f1");
    addAsset("Retirement (EPF/PPF)", submission.retirementAccountsValue || 0, "#10b981");
    addAsset("Real Estate (Investment)", submission.investmentPropertyValue || 0, "#f59e0b");
    addAsset("Real Estate (Primary)", submission.ownHouseValue || 0, "#d97706");
    addAsset("Gold", submission.goldValue || 0, "#eab308");
    addAsset("Other", submission.otherAssetsValue || 0, "#9ca3af");
    addAsset("Cash", submission.cashAtHandValue || 0, "#64748b");
  }

  // Liability breakdown
  const liabilityBreakdown: LiabilityBreakdownItem[] = [];
  if (totalLiabilities > 0) {
    const addLiab = (cat: string, val: number, emi: number, col: string) => {
      if (val > 0) liabilityBreakdown.push({ category: cat, outstanding: val, emi, percentage: (val/totalLiabilities)*100, color: col });
    };
    addLiab("Home Loan", submission.homeLoanOutstanding || 0, submission.homeLoanEMI || 0, "#0ea5e9");
    addLiab("Car Loan", submission.carLoanOutstanding || 0, submission.carLoanEMI || 0, "#8b5cf6");
    addLiab("Personal Loan", submission.personalLoanOutstanding || 0, submission.personalLoanEMI || 0, "#f43f5e");
    addLiab("Credit Card", submission.creditCardOutstanding || 0, 0, "#dc2626");
    addLiab("Other Loans", submission.otherLoansOutstanding || 0, submission.otherLoansEMI || 0, "#94a3b8");
  }

  let topGoal = null;
  try {
    if (submission.goalsList && submission.goalsList.length > 0) {
      topGoal = submission.goalsList[0].name;
    }
  } catch(e) {}

  const result: AnalysisResult = {
    netWorth,
    totalAssets,
    totalLiabilities,
    annualIncome,
    monthlyIncome,
    monthlySurplus,
    totalDependents: dependentsCount,
    topGoal,
    metrics,
    redCount,
    yellowCount,
    greenCount,
    observations,
    questionsToRaise: [], // filled in next step
    advisorBrief: "", // filled in next step
    assetBreakdown,
    liabilityBreakdown,
    riskProfile: calculateRiskProfile(submission, metrics),
    sanityFlags,
  };

  result.advisorBrief = generateAdvisorBrief(submission, result);
  result.questionsToRaise = generateQuestions(submission, result);

  return result;
}
