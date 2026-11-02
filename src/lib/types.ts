/**
 * FINETHY Fact-Finder — Type Definitions
 *
 * Shared types used across the application for form data,
 * analysis results, and report generation.
 */

import type { HealthStatus } from "@/config/healthRanges";

// ============================================
// Form / Submission types
// ============================================

export interface ChildDetail {
  name: string;
  age: number;
  stage: "Not in school" | "School" | "College" | "Working";
}

export interface OtherIncomeSource {
  type: "Rent" | "Interest & dividends" | "Business or side income" | "Pension";
  amount: number;
}

export interface GoalDetail {
  type: string;
  targetYear: number;
  targetAmount: number;
}

// ============================================
// Analysis Engine types
// ============================================

export interface HealthMetricResult {
  key: string;
  name: string;
  description: string;
  value: number | null;
  displayValue: string;
  healthyRange: string;
  status: HealthStatus;
  isEstimated?: boolean;
  observation: string | null;
  tooltip: string;
}

export interface AnalysisResult {
  /** Engine version that produced this result (see ANALYSIS_VERSION). */
  analysisVersion?: number;

  // Snapshot
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  annualIncome: number;
  monthlyIncome: number;
  monthlySurplus: number;
  totalDependents: number;
  topGoal: string | null;

  // Computed metrics (the blood report)
  metrics: HealthMetricResult[];

  // Summary counts
  redCount: number;
  yellowCount: number;
  greenCount: number;

  // Auto-generated observations
  observations: string[];
  questionsToRaise: string[];

  // Auto-generated brief for advisor
  advisorBrief: string;

  // Asset composition breakdown
  assetBreakdown: AssetBreakdownItem[];
  liabilityBreakdown: LiabilityBreakdownItem[];
  riskProfile?: RiskProfileResult;
  
  // Sanity layer flags
  sanityFlags?: import("./sanity").SanityFlag[];
}

export interface AssetBreakdownItem {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

export interface LiabilityBreakdownItem {
  category: string;
  outstanding: number;
  emi: number;
  percentage: number;
  color: string;
}

// ============================================
// Intake form step definitions
// ============================================

export const INTAKE_SECTIONS = [
  { id: "personal", label: "Personal & Family", icon: "👤", shortLabel: "A" },
  { id: "income", label: "Income & Expenses", icon: "💰", shortLabel: "B" },
  { id: "assets", label: "What You Own", icon: "🏠", shortLabel: "C" },
  { id: "liabilities", label: "What You Owe", icon: "📋", shortLabel: "D" },
  { id: "insurance", label: "Insurance & Protection", icon: "🛡️", shortLabel: "E" },
  { id: "goals", label: "Goals & Priorities", icon: "🎯", shortLabel: "F" },
  { id: "risk1", label: "Risk Tolerance (1/3)", icon: "📈", shortLabel: "G1" },
  { id: "risk2", label: "Risk Tolerance (2/3)", icon: "📈", shortLabel: "G2" },
  { id: "risk3", label: "Risk Tolerance (3/3)", icon: "📈", shortLabel: "G3" },
  { id: "wrapup", label: "Wrap Up", icon: "✅", shortLabel: "H" },
] as const;

export type IntakeSectionId = (typeof INTAKE_SECTIONS)[number]["id"];

// ============================================
// Goal types
// ============================================

export const GOAL_TYPES = [
  "Retirement planning",
  "Children's education",
  "Children's marriage",
  "Buying a house",
  "Wealth creation",
  "Tax planning",
  "Managing existing investments better",
  "Regular income after retirement",
  "Just getting started",
  "Other",
] as const;

export type GoalType = (typeof GOAL_TYPES)[number];

// ============================================
// MCQ option constants
// ============================================

export const MARITAL_STATUS_OPTIONS = [
  "Single",
  "Married",
  "Widowed",
  "Divorced",
] as const;

export const CHILD_STAGE_OPTIONS = [
  "Not in school",
  "School",
  "College",
  "Working",
] as const;

export const DEPENDENT_TYPE_OPTIONS = [
  "Parents",
  "In-laws",
  "Siblings",
  "None",
] as const;

export const OCCUPATION_TYPES = [
  "Salaried–Private",
  "Salaried–Government",
  "Business owner",
  "Professional practice",
  "Retired",
  "Homemaker",
  "Other",
] as const;

export const YEARS_IN_CURRENT_OPTIONS = [
  "<2",
  "2–5",
  "5–10",
  "10+",
] as const;

export const INCOME_RANGE_CHIPS = [
  { label: "< ₹5L", value: 500000 },
  { label: "₹5–10L", value: 750000 },
  { label: "₹10–25L", value: 1750000 },
  { label: "₹25–50L", value: 3750000 },
  { label: "₹50L–1Cr", value: 7500000 },
  { label: "₹1Cr+", value: 15000000 },
] as const;

export const OTHER_INCOME_TYPES = [
  "Rent",
  "Interest & dividends",
  "Business or side income",
  "Pension",
  "None",
] as const;

export const HOUSE_STATUS_OPTIONS = [
  "Own–fully paid",
  "Own–on loan",
  "Renting",
  "Family home",
] as const;

export const LOAN_YEARS_OPTIONS = [
  "<2",
  "2–5",
  "5–10",
  "10–20",
  "20+",
] as const;

export const HEALTH_INSURANCE_TYPES = [
  "Only employer-provided",
  "Personal policy",
  "Both",
  "None",
] as const;

export const EMERGENCY_FUND_OPTIONS = [
  "<1 month",
  "1–3 months",
  "3–6 months",
  "6+ months",
  "Not sure",
] as const;

export const INVESTMENT_EXPERIENCE_OPTIONS = [
  "FDs only",
  "Mutual funds",
  "Stocks",
  "Real estate",
  "Gold",
  "Insurance policies as investment",
  "Crypto",
  "Nothing yet",
] as const;



export const ADDITIONAL_COVER_OPTIONS = [
  "Personal accident cover",
  "Critical illness cover",
  "Home insurance",
  "None of these",
] as const;

export interface RiskProfileResult {
  capacityScore: number;
  toleranceScore: number;
  finalScore: number;
  capacityConstraint: string;
  consistencyWarning: string | null;
  gapInsight: string;
}
