import { RISK_QUESTIONS, RISK_STEPS } from "@/config/questions";
import { isValidMobile } from "@/lib/validators";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormData = Record<string, any>;

export interface StepDef {
  id: string;
  title: string;
  /** True once the client has actually answered this step (drives the ✓ in the step bar). */
  isComplete: (d: FormData) => boolean;
}

const answered = (v: unknown) => v !== null && v !== undefined && v !== "";
const allAnswered = (d: FormData, keys: string[]) => keys.every((k) => answered(d[k]));

export const ASSET_TOGGLES = [
  "hasBankSavingsFD",
  "hasMutualFunds",
  "hasStocks",
  "hasRetirementAccounts",
  "hasInvestmentProperty",
  "hasGold",
  "hasOtherAssets",
] as const;

export const LOAN_TOGGLES = ["hasHomeLoan", "hasCarLoan", "hasPersonalLoan", "hasCreditCardDebt", "hasOtherLoans"] as const;

const riskKeys = (i: number) => RISK_STEPS[i].keys;

export const STEPS: StepDef[] = [
  {
    id: "personal",
    title: "You and your family",
    isComplete: (d) => answered(d.fullName) && isValidMobile(d.mobile) && answered(d.maritalStatus),
  },
  {
    id: "income",
    title: "Income and expenses",
    isComplete: (d) => answered(d.occupationType) && answered(d.grossAnnualIncome) && answered(d.monthlyExpenses),
  },
  {
    id: "assets",
    title: "What you own",
    isComplete: (d) => allAnswered(d, [...ASSET_TOGGLES]) && answered(d.ownHouseStatus),
  },
  { id: "liabilities", title: "What you owe", isComplete: (d) => allAnswered(d, [...LOAN_TOGGLES]) },
  {
    id: "insurance",
    title: "Insurance",
    isComplete: (d) =>
      answered(d.hasTermInsurance) && answered(d.healthInsuranceType) && answered(d.hasTraditionalInsurance),
  },
  {
    id: "goals",
    title: "Your goals",
    isComplete: (d) => {
      try {
        return JSON.parse(d.selectedGoals || "[]").length > 0;
      } catch {
        return false;
      }
    },
  },
  { id: "risk1", title: "How you think about money", isComplete: (d) => allAnswered(d, riskKeys(0)) },
  { id: "risk2", title: "How you think about money (2 of 3)", isComplete: (d) => allAnswered(d, riskKeys(1)) },
  { id: "risk3", title: "How you think about money (3 of 3)", isComplete: (d) => allAnswered(d, riskKeys(2)) },
  { id: "wrapup", title: "Wrap-up", isComplete: (d) => d.consentGiven === true },
];

export const TOTAL_RISK_QUESTIONS = RISK_QUESTIONS.length;
