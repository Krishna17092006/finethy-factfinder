/**
 * Health Range Thresholds — FINETHY Fact-Finder
 * 
 * These define the GREEN / YELLOW / RED boundaries for each financial health metric.
 * The advisor can tune these via the dashboard settings page (DB-overridable).
 * 
 * Convention:
 * - "green" = healthy / normal range
 * - "yellow" = caution / needs attention  
 * - "red" = critical / urgent action needed
 */

export type HealthStatus = "GREEN" | "YELLOW" | "RED" | "INFO";

export interface HealthRange {
  key: string;
  name: string;
  description: string;
  unit: string; // "%", "months", "ratio", "₹", "info"
  // For ratio/percentage metrics — boundaries between statuses
  greenMin?: number;
  greenMax?: number;
  yellowMin?: number;
  yellowMax?: number;
  redMin?: number;
  redMax?: number;
  // Whether higher is better or lower is better
  higherIsBetter?: boolean;
  // Display tooltip for the client-facing report
  tooltip: string;
}

export const DEFAULT_HEALTH_RANGES: Record<string, HealthRange> = {
  emergencyFundRatio: {
    key: "emergencyFundRatio",
    name: "Emergency Fund",
    description: "Bank savings and FDs as months of expenses",
    unit: "months",
    greenMin: 6,
    yellowMin: 3,
    yellowMax: 6,
    redMax: 3,
    higherIsBetter: true,
    tooltip: "How many months can you sustain expenses if income stops? 6+ months is ideal.",
  },
  savingsRate: {
    key: "savingsRate",
    name: "Savings Rate",
    description: "Monthly savings as % of monthly income",
    unit: "%",
    greenMin: 20,
    yellowMin: 10,
    yellowMax: 20,
    redMax: 10,
    higherIsBetter: true,
    tooltip: "What portion of income are you saving? 20%+ is the gold standard.",
  },
  emiToIncomeRatio: {
    key: "emiToIncomeRatio",
    name: "EMI Burden",
    description: "Total EMIs as % of monthly income",
    unit: "%",
    greenMax: 30,
    yellowMin: 30,
    yellowMax: 40,
    redMin: 40,
    higherIsBetter: false,
    tooltip: "How much of your income goes to loan repayments? Under 30% is comfortable.",
  },
  debtToAssetsRatio: {
    key: "debtToAssetsRatio",
    name: "Debt-to-Assets",
    description: "Total liabilities as % of total assets",
    unit: "%",
    greenMax: 30,
    yellowMin: 30,
    yellowMax: 50,
    redMin: 50,
    higherIsBetter: false,
    tooltip: "What portion of your assets is financed by debt? Under 30% is healthy.",
  },
  lifeCoverAdequacy: {
    key: "lifeCoverAdequacy",
    name: "Life Cover Adequacy",
    description: "Term cover as % of ideal cover (10× income + loans)",
    unit: "%",
    greenMin: 100,
    yellowMin: 50,
    yellowMax: 100,
    redMax: 50,
    higherIsBetter: true,
    tooltip: "Does your term insurance cover your family adequately? 10× annual income + outstanding loans is the benchmark.",
  },
  healthCoverAdequacy: {
    key: "healthCoverAdequacy",
    name: "Health Cover Adequacy",
    description: "Family health cover as % of benchmark",
    unit: "%",
    greenMin: 100,
    yellowMin: 50,
    yellowMax: 100,
    redMax: 50,
    higherIsBetter: true,
    tooltip: "Is your health insurance enough for a major hospitalization? ₹10L base + ₹3L per family member is our benchmark.",
  },
  liquidityRatio: {
    key: "liquidityRatio",
    name: "Liquidity Ratio",
    description: "Liquid assets as % of net worth",
    unit: "%",
    greenMin: 10,
    greenMax: 30,
    yellowMin: 5,    // too low side
    yellowMax: 50,   // too high side
    redMax: 5,       // critically low
    redMin: 50,      // money sleeping
    higherIsBetter: undefined, // balanced is best
    tooltip: "Is your money too locked up or too idle? 10-30% in liquid assets is balanced.",
  },
  realEstateConcentration: {
    key: "realEstateConcentration",
    name: "Real Estate Concentration",
    description: "Real estate as % of total assets",
    unit: "%",
    greenMax: 50,
    yellowMin: 50,
    yellowMax: 70,
    redMin: 70,
    higherIsBetter: false,
    tooltip: "Is too much of your wealth locked in property? Under 50% gives better diversification.",
  },
  equityExposureVsAge: {
    key: "equityExposureVsAge",
    name: "Equity Exposure vs Age",
    description: "Actual equity % vs (100 − age) heuristic",
    unit: "%",
    greenMin: -15,  // deviation from ideal
    greenMax: 15,
    yellowMin: -30,
    yellowMax: 30,
    redMin: -100,  // >30% deviation
    redMax: 100,
    higherIsBetter: undefined, // balanced
    tooltip: "Is your equity allocation appropriate for your age? (100 − age)% in equity is a rough guide.",
  },
  retirementReadiness: {
    key: "retirementReadiness",
    name: "Retirement Readiness",
    description: "On track to accumulate the needed retirement corpus",
    unit: "%",
    greenMin: 80,
    yellowMin: 50,
    yellowMax: 80,
    redMax: 50,
    higherIsBetter: true,
    tooltip: "Are you saving enough for retirement? This is a rough projection based on current trajectory.",
  },
  insuranceAsInvestmentLeak: {
    key: "insuranceAsInvestmentLeak",
    name: "Insurance-as-Investment Leak",
    description: "Traditional/ULIP premiums vs savings capacity",
    unit: "%",
    greenMax: 5,
    yellowMin: 5,
    yellowMax: 10,
    redMin: 10,
    higherIsBetter: false,
    tooltip: "Are significant premiums going into low-yield insurance products instead of real investments?",
  },
  creditCardRevolvingDebt: {
    key: "creditCardRevolvingDebt",
    name: "Credit Card Revolving Debt",
    description: "Outstanding CC balance vs monthly income",
    unit: "ratio",
    greenMax: 0,
    yellowMin: 0,
    yellowMax: 1,  // < 1 month income
    redMin: 1,     // >= 1 month income
    higherIsBetter: false,
    tooltip: "Credit card debt is the most expensive debt (~40% p.a.). Any revolving balance needs immediate attention.",
  },
};

// Health cover benchmark config
export const HEALTH_COVER_CONFIG = {
  metroBaseAmount: 1000000,     // ₹10L base for metro city
  perMemberAdditional: 300000,  // ₹3L per additional family member
};

// Retirement projection assumptions
export const RETIREMENT_CONFIG = {
  inflationRate: 0.06,          // 6% annual inflation
  expectedReturnRate: 0.10,     // 10% expected return on investments  
  corpusMultiple: 25,           // 25× annual expenses at retirement
  withdrawalRate: 0.04,         // 4% safe withdrawal rate
};
