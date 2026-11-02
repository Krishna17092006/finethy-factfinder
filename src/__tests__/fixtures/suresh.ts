/**
 * Suresh Venkatesan: owner-approved case study (fictional client).
 * Mirrors prisma/seed-casestudy.js. The expected values in
 * case-study.test.ts were signed off on the generated PDF.
 */
export const SURESH = {
  status: "submitted",
  fullName: "suresh venkatesan",
  mobile: "9845012345",
  email: "suresh.v@gmail.com",
  dateOfBirth: "22/08/1982",
  city: "bengaluru",
  maritalStatus: "Married",
  spouseEarning: true,
  spouseIncome: 900000,
  childrenCount: 2,
  childrenDetails: JSON.stringify([
    { name: "Daughter", age: 14, stage: "School" },
    { name: "Son", age: 10, stage: "School" },
  ]),
  dependentTypes: JSON.stringify(["Parents"]),
  totalDependents: 3,

  occupationType: "Salaried–Private",
  grossAnnualIncome: 3600000,
  otherIncomeSources: JSON.stringify([
    { type: "Rent", amount: 360000 },
    { type: "Interest & dividends", amount: 120000 },
  ]),
  monthlyExpenses: 160000,

  bankSavingsFDValue: 1200000,
  mutualFundsValue: 4800000,
  stocksValue: 1500000,
  retirementAccountsValue: 3200000,
  investmentPropertyValue: 8500000,
  ownHouseValue: 12000000,
  goldValue: 800000,
  otherAssetsValue: 500000,

  homeLoanOutstanding: 5500000,
  homeLoanEMI: 52000,
  carLoanOutstanding: 600000,
  carLoanEMI: 14000,
  personalLoanOutstanding: 300000,
  personalLoanEMI: 9500,
  creditCardOutstanding: 180000,
  otherLoansOutstanding: 400000,
  otherLoansEMI: 7500,
  totalMonthlyEMIs: 83000,

  hasTermInsurance: true,
  termInsuranceCover: 10000000,
  hasTraditionalInsurance: true,
  traditionalInsuranceCover: 1000000,
  traditionalInsurancePremium: 85000,
  healthInsuranceCover: 1500000,

  selectedGoals: JSON.stringify(["Children's education", "Retirement planning"]),
  goalDetails: JSON.stringify([
    { type: "Children's education (Daughter)", targetYear: 2030, targetAmount: 4000000 },
    { type: "Children's education (Son)", targetYear: 2034, targetAmount: 4000000 },
    { type: "Retirement planning", targetYear: 2040, targetAmount: 0 },
  ]),

  riskQ1: 4,
  riskQ2: 3,
  riskQ3: 4,
  riskQ4: 3,
  riskQ5: 4,
  riskQ6: 3,
  riskQ7: 3,
  riskQ8: 3,
  riskQ9: 4,
  riskQ10: 3,
  riskQ11: 4,
  riskQ12: 4,
  riskQ13: 4,
  riskQ14: 4,
  riskQ15:
    "I invested in an ULIP in 2011 on a bank manager's advice and lost money after charges. I'm careful about insurance-linked products since then.",

  meetingTopics: "Want to plan my daughter's education without disturbing retirement savings.",
  consentGiven: true,
  activeTimeSeconds: 660,
  currentStep: 8,
};
