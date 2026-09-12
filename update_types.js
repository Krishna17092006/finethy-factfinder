const fs = require('fs');

let typesContent = fs.readFileSync('src/lib/types.ts', 'utf8');

// 1. Remove old section G options
const oldOptions = `export const RISK_REACTION_OPTIONS = [
  { value: "Buy more", label: "Buy more — it's on sale!" },
  { value: "Hold calmly", label: "Hold calmly — markets recover" },
  { value: "Hold anxious", label: "Hold, but very anxious about it" },
  { value: "Sell some", label: "Sell some to reduce risk" },
  { value: "Sell everything", label: "Sell everything — too stressful" },
] as const;

export const INVESTMENT_PRIORITY_OPTIONS = [
  {
    value: "Protecting",
    label: "Protecting money — safety first",
  },
  {
    value: "Balance",
    label: "Balance of safety and growth",
  },
  {
    value: "Maximum growth",
    label: "Maximum growth — I can handle swings",
  },
] as const;`;

typesContent = typesContent.replace(oldOptions, '');

// 2. Update INTAKE_SECTIONS
const oldSections = `export const INTAKE_SECTIONS = [
  { id: "personal", label: "Personal Details", icon: "👤" },
  { id: "income", label: "Income & Savings", icon: "💰" },
  { id: "assets", label: "Assets", icon: "🏠" },
  { id: "liabilities", label: "Loans & Liabilities", icon: "💳" },
  { id: "insurance", label: "Protection", icon: "🛡️" },
  { id: "goals", label: "Goals & Timeline", icon: "🎯" },
  { id: "experience", label: "Temperament", icon: "🧠" },
  { id: "wrapup", label: "Final Steps", icon: "✅" },
] as const;`;

const newSections = `export const INTAKE_SECTIONS = [
  { id: "personal", label: "Personal Details", icon: "👤" },
  { id: "income", label: "Income & Savings", icon: "💰" },
  { id: "assets", label: "Assets", icon: "🏠" },
  { id: "liabilities", label: "Loans & Liabilities", icon: "💳" },
  { id: "insurance", label: "Protection", icon: "🛡️" },
  { id: "goals", label: "Goals & Timeline", icon: "🎯" },
  { id: "experience", label: "Investment Experience", icon: "📊" },
  { id: "risk1", label: "Reaction to Loss", icon: "📉" },
  { id: "risk2", label: "Trade-offs", icon: "⚖️" },
  { id: "risk3", label: "Habits & Knowledge", icon: "🧠" },
  { id: "wrapup", label: "Final Steps", icon: "✅" },
] as const;`;

typesContent = typesContent.replace(oldSections, newSections);

// Let's add RiskProfileResult type
typesContent += `
export interface RiskProfileResult {
  capacityScore: number;
  toleranceScore: number;
  finalScore: number;
  capacityConstraint: string;
  consistencyWarning: string | null;
  gapInsight: string;
}
`;

fs.writeFileSync('src/lib/types.ts', typesContent);
console.log('types.ts updated');
