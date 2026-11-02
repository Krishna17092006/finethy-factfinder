export interface SanityFlag {
  level: "WARNING" | "CRITICAL";
  message: string;
  affectedMetrics: string[]; // keys of metrics that shouldn't be trusted
}

export function runSanityCheck(derived: any, computed: { totalAssets: number, totalLiabilities: number, incomeBasis: number }): SanityFlag[] {
  const flags: SanityFlag[] = [];
  
  const income = computed.incomeBasis || 0;
  const netWorth = computed.totalAssets - computed.totalLiabilities;
  const emi = derived.totalMonthlyEMIs || 0;
  const expenses = derived.monthlyExpenses || 0;
  
  if (income > 0 && emi > 0) {
    const emiBurden = (emi / (income / 12)) * 100;
    if (emiBurden > 100) {
      flags.push({
        level: "CRITICAL",
        message: `EMIs exceed reported income — the income figure is likely entered as annual instead of monthly, or is incomplete. Verify in the meeting.`,
        affectedMetrics: ["emiToIncomeRatio", "savingsRate", "retirementReadiness"]
      });
    } else if (income < (emi * 12)) {
      flags.push({
        level: "CRITICAL",
        message: `Annual income is less than total annual EMIs. Income figure needs verification.`,
        affectedMetrics: ["emiToIncomeRatio", "savingsRate"]
      });
    }
  }

  if (income > 0 && income < 200000 && netWorth > 5000000) {
    flags.push({
      level: "WARNING",
      message: `Income appears inconsistent with asset base — possible entry error.`,
      affectedMetrics: ["savingsRate", "emiToIncomeRatio"]
    });
  }

  if (income > 0 && expenses > (income / 12) * 3) {
    flags.push({
      level: "CRITICAL",
      message: `Monthly expenses are more than 3x monthly income. Check if one was entered annually instead.`,
      affectedMetrics: ["savingsRate", "emergencyFundRatio", "retirementReadiness"]
    });
  }

  // Age Check
  if (derived._age && (derived._age < 18 || derived._age > 100)) {
    flags.push({
      level: "WARNING",
      message: `Age ${derived._age} is outside expected ranges.`,
      affectedMetrics: ["equityExposureVsAge", "retirementReadiness"]
    });
  }

  return flags;
}
