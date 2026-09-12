import { calculateAge } from "./utils";

export interface DerivedField<T> {
  value: T;
  source: "derived" | "reported";
  discrepancy?: string;
}

export function deriveData(sub: any): any {
  const derived = { ...sub };

  // Helper to attach derived field metadata (flat structure for Prisma compatibility)
  const setDerived = (key: string, value: any, source: "derived" | "reported", discrepancy?: string) => {
    derived[key] = value;
    derived[`${key}_source`] = source;
    if (discrepancy) derived[`${key}_discrepancy`] = discrepancy;
  };

  // 1. Total Monthly EMIs
  let calculatedEMIs = 0;
  calculatedEMIs += (sub.homeLoanEMI || 0);
  calculatedEMIs += (sub.carLoanEMI || 0);
  calculatedEMIs += (sub.personalLoanEMI || 0);
  calculatedEMIs += (sub.otherLoansEMI || 0);
  
  if (calculatedEMIs > 0) {
    if (sub.totalMonthlyEMIs && sub.totalMonthlyEMIs !== calculatedEMIs) {
      setDerived("totalMonthlyEMIs", calculatedEMIs, "derived", `Reported EMI was ₹${sub.totalMonthlyEMIs}, but loan details sum to ₹${calculatedEMIs}. Using derived sum.`);
    } else {
      setDerived("totalMonthlyEMIs", calculatedEMIs, "derived");
    }
  } else if (sub.totalMonthlyEMIs) {
    setDerived("totalMonthlyEMIs", sub.totalMonthlyEMIs, "reported");
  } else {
    setDerived("totalMonthlyEMIs", 0, "derived");
  }

  // 2. Emergency Fund Ratio (Float)
  // Prompt explicitly states: (bank savings + FDs) / monthly expenses
  const liquid = (sub.bankSavingsFDValue || 0);
  const expenses = sub.monthlyExpenses || 0;
  
  if (expenses > 0) {
    const ratio = liquid / expenses;
    setDerived("emergencyFundRatio", ratio, "derived");
    
    // Also set the label for backward compatibility if needed, but we'll use ratio
    let label = "";
    if (ratio < 1) label = "<1 month";
    else if (ratio >= 1 && ratio <= 3) label = "1–3 months";
    else if (ratio > 3 && ratio <= 6) label = "3–6 months";
    else label = "6+ months";
    
    setDerived("emergencyFundMonths", label, "derived");
    derived._computedEmergencyMonths = ratio;
  } else {
    setDerived("emergencyFundMonths", "Not sure", "derived");
    derived._computedEmergencyMonths = 0;
  }

  // 3. Total Dependents
  let dependentsCount = 0;
  if (sub.maritalStatus === 'Married' && !sub.spouseEarning) dependentsCount += 1;
  dependentsCount += (sub.childrenCount || 0);
  
  if (sub.dependentTypes) {
    try {
      const types = JSON.parse(sub.dependentTypes);
      if (Array.isArray(types)) dependentsCount += types.length;
    } catch (e) {}
  }
  
  if (sub.totalDependents === undefined || sub.totalDependents === null) {
    setDerived("totalDependents", dependentsCount, "derived");
  } else if (sub.totalDependents !== dependentsCount) {
    setDerived("totalDependents", dependentsCount, "derived", `Client reported ${sub.totalDependents} dependents, but family details imply ${dependentsCount}.`);
  } else {
    setDerived("totalDependents", sub.totalDependents, "reported");
  }

  // 4. Investment Experience
  const exp: string[] = [];
  if ((sub.mutualFundsValue || 0) > 0) exp.push("Mutual Funds");
  if ((sub.stocksValue || 0) > 0) exp.push("Direct Equity");
  if ((sub.investmentPropertyValue || 0) > 0) exp.push("Real Estate");
  if ((sub.goldValue || 0) > 0) exp.push("Gold");
  if ((sub.traditionalInsurancePremium || 0) > 0) exp.push("Traditional/ULIP policies");
  if ((sub.bankSavingsFDValue || 0) > 0 && exp.length === 0) exp.push("FDs / Bank Savings only");
  
  if (exp.length > 0) {
    setDerived("investmentExperience", JSON.stringify(exp), "derived");
  }

  // 5. Retirement Target Year
  if (sub.dateOfBirth && sub.retirementAge) {
    const birthYear = new Date(sub.dateOfBirth).getFullYear();
    setDerived("retirementTargetYear", birthYear + sub.retirementAge, "derived");
  }

  // Normalize goals
  let normalizedGoals: any[] = [];
  if (sub.goalDetails) {
    try {
      const details = JSON.parse(sub.goalDetails);
      if (Array.isArray(details)) {
        normalizedGoals = details.map((g: any) => ({
          name: g.type || g.name,
          targetYear: g.targetYear,
          targetAmount: g.targetAmount || 0
        }));
      } else {
        const order = sub.goalPriorityOrder ? JSON.parse(sub.goalPriorityOrder) : Object.keys(details);
        normalizedGoals = order.map((g: string) => ({
          name: g,
          targetYear: details[g]?.targetYear,
          targetAmount: details[g]?.targetAmount || 0
        }));
      }
    } catch (e) {}
  }
  setDerived("goalsList", normalizedGoals, "derived");

  // 6. Own House Status (from Loan)
  if (sub.hasHomeLoan && (sub.homeLoanOutstanding || 0) > 0) {
    setDerived("ownHouseStatus", "Own-on-loan", "derived");
  } else if (sub.ownHouseValue > 0) {
    setDerived("ownHouseStatus", "Own-fully-paid", "derived");
  }

  // 7. Monthly Surplus
  const monthlyIncome = (sub.grossAnnualIncome || 0) / 12;
  const surplus = monthlyIncome - expenses - (calculatedEMIs > 0 ? calculatedEMIs : (sub.totalMonthlyEMIs || 0));
  setDerived("derivedMonthlySurplus", surplus, "derived");

  // 4. Household Income & Surplus
  const selfIncome = sub.grossAnnualIncome || 0;
  const spouseIncome = (sub.maritalStatus === "Married" && sub.spouseEarning) ? (sub.spouseIncome || 0) : 0;
  
  let otherIncomeSum = 0;
  if (sub.otherIncomeSources) {
    try {
      const sources = typeof sub.otherIncomeSources === 'string' ? JSON.parse(sub.otherIncomeSources) : sub.otherIncomeSources;
      if (Array.isArray(sources)) {
        sources.forEach((src: any) => {
          if (src.amount) otherIncomeSum += Number(src.amount);
        });
      }
    } catch (e) {}
  }
  
  const totalAnnualHouseholdIncome = selfIncome + spouseIncome + otherIncomeSum;
  setDerived("householdAnnualIncome", totalAnnualHouseholdIncome, "derived");
  
  const emi = derived.totalMonthlyEMIs || 0;
  const hhExpenses = derived.monthlyExpenses || 0;
  
  // Calculate surplus based on household income
  const householdSurplus = (totalAnnualHouseholdIncome / 12) - hhExpenses - emi;
  setDerived("householdMonthlySurplus", householdSurplus, "derived");
  
  // Also calculate savings rate here so it can be based on household income
  if (totalAnnualHouseholdIncome > 0) {
    const savingsRate = (householdSurplus / (totalAnnualHouseholdIncome / 12)) * 100;
    setDerived("calculatedSavingsRate", savingsRate, "derived");
  }

  return derived;
}
