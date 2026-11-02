import { calculateAge, parseDateOfBirth } from "./utils";

/**
 * Derivation layer: the single source of truth for every computed input.
 *
 * Raw form answers go in; a copy enriched with derived values comes out.
 * The analysis engine, the risk engine, the web report and the PDF all read
 * these derived values, so they can never disagree with each other.
 *
 * Each derived field `x` also gets `x_source` ("derived" | "reported") and,
 * when the client's own answer disagrees with the maths, `x_discrepancy`.
 */

export interface DerivedField<T> {
  value: T;
  source: "derived" | "reported";
  discrepancy?: string;
}

export interface NormalizedGoal {
  name: string;
  targetYear: number | null;
  targetAmount: number;
}

const num = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

/** Dependent types the client ticked, ignoring the "None" chip. */
export function countDependentTypes(dependentTypes: unknown): number {
  const types = parseJson<unknown[]>(dependentTypes, []);
  return Array.isArray(types) ? types.filter((t) => typeof t === "string" && t !== "None").length : 0;
}

/** EPF + PPF + NPS when entered individually, otherwise the combined figure (older submissions). */
export function retirementAccountsTotal(sub: Record<string, unknown>): number {
  const parts = num(sub.epfValue) + num(sub.ppfValue) + num(sub.npsValue);
  return parts > 0 ? parts : num(sub.retirementAccountsValue);
}

/**
 * Goals in the client's priority order. `selectedGoals` holds the ranking; `goalDetails`
 * holds target year/amount (object keyed by goal, or a legacy array).
 */
export function normalizeGoals(sub: Record<string, unknown>, retirementYear: number | null): NormalizedGoal[] {
  const selected = parseJson<unknown[]>(sub.selectedGoals, []);
  const details = parseJson<unknown>(sub.goalDetails, {});
  const priority = parseJson<unknown[]>(sub.goalPriorityOrder, []);

  const toGoal = (name: string, d: { targetYear?: unknown; targetAmount?: unknown }): NormalizedGoal => {
    const year = typeof d.targetYear === "number" && Number.isFinite(d.targetYear) ? d.targetYear : null;
    return {
      name,
      targetYear: year ?? (/retire/i.test(name) ? retirementYear : null),
      targetAmount: num(d.targetAmount),
    };
  };
  const strings = (list: unknown): string[] =>
    Array.isArray(list) ? list.filter((g): g is string => typeof g === "string") : [];

  // Legacy format: an ordered array of goal objects (may split one goal per child,
  // e.g. "Children's education (Daughter)"). The array order is the priority.
  if (Array.isArray(details)) {
    const goals = (details as Array<Record<string, unknown>>)
      .map((g) => ({ name: (g?.type ?? g?.name) as unknown, g }))
      .filter((x): x is { name: string; g: Record<string, unknown> } => typeof x.name === "string")
      .map(({ name, g }) => toGoal(name, g));
    // Selected goals with no detail row still belong in the list.
    for (const name of strings(selected)) {
      if (!goals.some((goal) => goal.name.startsWith(name))) goals.push(toGoal(name, {}));
    }
    return goals;
  }

  // Current format: details keyed by goal name; `selectedGoals` holds the ranking.
  const byName = (details && typeof details === "object" ? details : {}) as Record<string, Record<string, unknown>>;
  let order = strings(selected);
  if (!order.length) order = strings(priority);
  if (!order.length) order = Object.keys(byName);
  return order.map((name) => toGoal(name, byName[name] ?? {}));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deriveData(sub: any): any {
  const derived: Record<string, unknown> = { ...sub };

  const setDerived = (key: string, value: unknown, source: "derived" | "reported", discrepancy?: string) => {
    derived[key] = value;
    derived[`${key}_source`] = source;
    if (discrepancy) derived[`${key}_discrepancy`] = discrepancy;
  };

  // 0. Age (used by the sanity layer)
  derived._age = calculateAge(sub.dateOfBirth);

  // 1. Total monthly EMIs: the loan-by-loan sum wins over the reported total
  const calculatedEMIs = num(sub.homeLoanEMI) + num(sub.carLoanEMI) + num(sub.personalLoanEMI) + num(sub.otherLoansEMI);
  if (calculatedEMIs > 0) {
    if (sub.totalMonthlyEMIs && sub.totalMonthlyEMIs !== calculatedEMIs) {
      setDerived(
        "totalMonthlyEMIs",
        calculatedEMIs,
        "derived",
        `Reported EMI was ₹${sub.totalMonthlyEMIs}, but loan details sum to ₹${calculatedEMIs}. Using derived sum.`,
      );
    } else {
      setDerived("totalMonthlyEMIs", calculatedEMIs, "derived");
    }
  } else if (sub.totalMonthlyEMIs) {
    setDerived("totalMonthlyEMIs", sub.totalMonthlyEMIs, "reported");
  } else {
    setDerived("totalMonthlyEMIs", 0, "derived");
  }

  // 2. Retirement accounts (EPF + PPF + NPS)
  setDerived("retirementAccountsValue", retirementAccountsTotal(sub), "derived");

  // 3. Emergency fund: (bank savings + FDs) / monthly expenses.
  //    Both the health table and the risk-capacity engine read THIS value.
  const liquid = num(sub.bankSavingsFDValue);
  const expenses = num(sub.monthlyExpenses);
  if (expenses > 0) {
    const ratio = liquid / expenses;
    setDerived("emergencyFundRatio", ratio, "derived");
    let label: string;
    if (ratio < 1) label = "<1 month";
    else if (ratio <= 3) label = "1–3 months";
    else if (ratio <= 6) label = "3–6 months";
    else label = "6+ months";
    setDerived("emergencyFundMonths", label, "derived");
    derived._computedEmergencyMonths = ratio;
  } else {
    derived.emergencyFundRatio = null;
    setDerived("emergencyFundMonths", "Not sure", "derived");
    derived._computedEmergencyMonths = 0;
  }

  // 4. Dependents ("None" is not a dependent)
  let dependentsCount = 0;
  if (sub.maritalStatus === "Married" && !sub.spouseEarning) dependentsCount += 1;
  dependentsCount += num(sub.childrenCount);
  dependentsCount += countDependentTypes(sub.dependentTypes);

  if (sub.totalDependents === undefined || sub.totalDependents === null) {
    setDerived("totalDependents", dependentsCount, "derived");
  } else if (sub.totalDependents !== dependentsCount) {
    setDerived(
      "totalDependents",
      dependentsCount,
      "derived",
      `Client reported ${sub.totalDependents} dependents, but family details imply ${dependentsCount}.`,
    );
  } else {
    setDerived("totalDependents", sub.totalDependents, "reported");
  }

  // 5. Investment experience inferred from what they actually hold
  const exp: string[] = [];
  if (num(sub.mutualFundsValue) > 0) exp.push("Mutual Funds");
  if (num(sub.stocksValue) > 0) exp.push("Direct Equity");
  if (num(sub.investmentPropertyValue) > 0) exp.push("Real Estate");
  if (num(sub.goldValue) > 0) exp.push("Gold");
  if (num(sub.traditionalInsurancePremium) > 0) exp.push("Traditional/ULIP policies");
  if (num(sub.bankSavingsFDValue) > 0 && exp.length === 0) exp.push("FDs / Bank Savings only");
  if (exp.length > 0) setDerived("investmentExperience", JSON.stringify(exp), "derived");

  // 6. Retirement target year (DOB is stored as DD/MM/YYYY)
  const dob = parseDateOfBirth(sub.dateOfBirth);
  let retirementYear: number | null = null;
  if (dob && typeof sub.retirementAge === "number" && sub.retirementAge > 0) {
    retirementYear = dob.getFullYear() + sub.retirementAge;
    setDerived("retirementTargetYear", retirementYear, "derived");
  }

  // 7. Goals in priority order
  setDerived("goalsList", normalizeGoals(sub, retirementYear), "derived");

  // 8. Own house status from the loan answers
  if (sub.hasHomeLoan && num(sub.homeLoanOutstanding) > 0) {
    setDerived("ownHouseStatus", "Own-on-loan", "derived");
  } else if (num(sub.ownHouseValue) > 0) {
    setDerived("ownHouseStatus", "Own-fully-paid", "derived");
  }

  // 9. Surplus (self income only)
  const emi = num(derived.totalMonthlyEMIs);
  const selfIncome = num(sub.grossAnnualIncome);
  setDerived("derivedMonthlySurplus", selfIncome / 12 - expenses - emi, "derived");

  // 10. Household income & surplus (self + earning spouse + other income)
  const spouseIncome = sub.maritalStatus === "Married" && sub.spouseEarning ? num(sub.spouseIncome) : 0;
  const sources = parseJson<unknown[]>(sub.otherIncomeSources, []);
  const otherIncomeSum = Array.isArray(sources)
    ? sources.reduce<number>((sum, s) => sum + num(Number((s as Record<string, unknown>)?.amount)), 0)
    : 0;

  const household = selfIncome + spouseIncome + otherIncomeSum;
  setDerived("householdAnnualIncome", household, "derived");
  const householdSurplus = household / 12 - expenses - emi;
  setDerived("householdMonthlySurplus", householdSurplus, "derived");
  if (household > 0) {
    setDerived("calculatedSavingsRate", (householdSurplus / (household / 12)) * 100, "derived");
  }

  return derived;
}
