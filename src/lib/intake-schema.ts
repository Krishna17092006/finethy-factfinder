import { z } from "zod";
import { isValidMobile } from "./validators";

/**
 * Allow-list of fields a CLIENT may write through the public intake API.
 *
 * Anything not listed here (status, submittedAt, analysisJson, linkId, notes,
 * relations, ...) is dropped. Invalid values are dropped individually instead
 * of failing the whole save, so one odd value never loses a client's progress.
 */

const MAX_MONEY = 1e13; // ₹10 lakh crore: far beyond any real household

const text = (max: number) => z.string().trim().max(max).nullable();
const money = z.number().finite().min(0).max(MAX_MONEY).nullable();
const int = (min: number, max: number) => z.number().int().min(min).max(max).nullable();
const bool = z.boolean().nullable();
const jsonText = z
  .string()
  .max(10_000)
  .nullable()
  .refine((v) => {
    if (v === null || v === "") return true;
    try {
      JSON.parse(v);
      return true;
    } catch {
      return false;
    }
  }, "Must be valid JSON");

const dob = z
  .string()
  .trim()
  .nullable()
  .refine((v) => v === null || v === "" || /^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/.test(v), "Use DD/MM/YYYY");

export const INTAKE_FIELDS = {
  // Section A: personal & family
  fullName: text(120),
  dateOfBirth: dob,
  mobile: z
    .string()
    .trim()
    .max(15)
    .regex(/^[0-9]*$/, "Digits only")
    .nullable(),
  email: text(160),
  city: text(80),
  maritalStatus: text(30),
  spouseName: text(120),
  spouseDob: dob,
  spouseOccupation: text(80),
  spouseEarning: bool,
  spouseIncome: money,
  childrenCount: int(0, 20),
  childrenDetails: jsonText,
  dependentTypes: jsonText,
  totalDependents: int(0, 30),
  occupationType: text(60),
  occupationOther: text(80),
  employerName: text(120),
  yearsInCurrent: text(20),

  // Section B: income & expenses
  grossAnnualIncome: money,
  otherIncomeSources: jsonText,
  monthlyExpenses: money,
  totalMonthlyEMIs: money,
  monthlySavings: money,

  // Section C: assets
  hasBankSavingsFD: bool,
  bankSavingsFDValue: money,
  hasMutualFunds: bool,
  mutualFundsValue: money,
  mfEquityPercent: int(0, 100),
  hasStocks: bool,
  stocksValue: money,
  hasRetirementAccounts: bool,
  retirementAccountsValue: money,
  epfValue: money,
  ppfValue: money,
  npsValue: money,
  hasInvestmentProperty: bool,
  investmentPropertyValue: money,
  investmentPropertyRent: bool,
  ownHouseStatus: text(40),
  ownHouseValue: money,
  hasGold: bool,
  goldValue: money,
  hasOtherAssets: bool,
  otherAssetsValue: money,
  otherAssetsDescription: text(200),
  hasCashAtHand: bool,
  cashAtHandValue: money,

  // Section D: liabilities
  hasHomeLoan: bool,
  homeLoanOutstanding: money,
  homeLoanEMI: money,
  homeLoanYearsLeft: text(20),
  hasCarLoan: bool,
  carLoanOutstanding: money,
  carLoanEMI: money,
  carLoanYearsLeft: text(20),
  hasPersonalLoan: bool,
  personalLoanOutstanding: money,
  personalLoanEMI: money,
  personalLoanYearsLeft: text(20),
  hasCreditCardDebt: bool,
  creditCardOutstanding: money,
  hasOtherLoans: bool,
  otherLoansOutstanding: money,
  otherLoansEMI: money,
  otherLoansYearsLeft: text(20),
  otherLoansDescription: text(200),

  // Section E: insurance
  hasTermInsurance: bool,
  termInsuranceCover: money,
  hasTraditionalInsurance: bool,
  traditionalInsuranceCover: money,
  traditionalInsurancePremium: money,
  healthInsuranceType: text(40),
  healthInsuranceCover: money,
  hasAccidentCover: bool,
  hasCriticalIllness: bool,
  hasHomeInsurance: bool,
  emergencyFundMonths: text(20),

  // Section F: goals
  selectedGoals: jsonText,
  goalDetails: jsonText,
  goalPriorityOrder: jsonText,
  retirementAge: int(18, 100),

  // Section G: risk
  investmentExperience: jsonText,
  riskQ1: int(1, 5),
  riskQ2: int(1, 5),
  riskQ3: int(1, 5),
  riskQ4: int(1, 5),
  riskQ5: int(1, 5),
  riskQ6: int(1, 5),
  riskQ7: int(1, 5),
  riskQ8: int(1, 5),
  riskQ9: int(1, 5),
  riskQ10: int(1, 5),
  riskQ11: int(1, 5),
  riskQ12: int(1, 5),
  riskQ13: int(1, 5),
  riskQ14: int(1, 5),
  riskQ15: text(2000),
  riskQ3NoHistory: bool,

  // Section H: wrap-up
  meetingTopics: text(2000),
  consentGiven: z.boolean(),

  // Progress bookkeeping
  currentStep: int(-1, 9),
  activeTimeSeconds: int(0, 60 * 60 * 24 * 7),
} satisfies Record<string, z.ZodTypeAny>;

export type IntakeField = keyof typeof INTAKE_FIELDS;

export interface SanitizeResult {
  data: Record<string, unknown>;
  rejected: string[];
}

/** Keep only allow-listed, valid fields. Unknown keys are ignored silently. */
export function sanitizeIntakePayload(body: unknown): SanitizeResult {
  const data: Record<string, unknown> = {};
  const rejected: string[] = [];
  if (!body || typeof body !== "object" || Array.isArray(body)) return { data, rejected };

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!Object.prototype.hasOwnProperty.call(INTAKE_FIELDS, key)) continue;
    if (value === undefined) continue;
    const schema = INTAKE_FIELDS[key as IntakeField];
    const parsed = schema.safeParse(value);
    if (parsed.success) data[key] = parsed.data;
    else rejected.push(key);
  }

  // Legacy client flag name for Q3 "I wasn't investing then"
  const legacy = (body as Record<string, unknown>).riskQ3_neutral;
  if (!("riskQ3NoHistory" in data) && typeof legacy === "boolean") data.riskQ3NoHistory = legacy;

  return { data, rejected };
}

export { isValidMobile } from "./validators";

/** Required before a client can submit. Returns a user-facing message or null. */
export function submissionProblem(merged: Record<string, unknown>): string | null {
  const name = typeof merged.fullName === "string" ? merged.fullName.trim() : "";
  if (name.length < 2) return "Please enter your full name (step 1).";
  if (!isValidMobile(merged.mobile)) return "Please enter a valid 10-digit mobile number (step 1).";
  if (merged.consentGiven !== true) return "Please tick the consent box to submit.";
  return null;
}
