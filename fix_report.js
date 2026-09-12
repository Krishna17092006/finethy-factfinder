const fs = require('fs');

let content = fs.readFileSync('src/lib/report.ts', 'utf8');

// Import cleanString
content = content.replace('import { formatRupees, formatRupeesShort, calculateAge } from "./utils";', 'import { formatRupees, formatRupeesShort, calculateAge, cleanString } from "./utils";');

// Fix observation terminology
// household -> family/client
content = content.replace('this household faces immediate cash flow stress.', 'this ${isSingle ? "client" : "household"} faces immediate cash flow stress.');
content = content.replace('The household', 'The ${isSingle ? "client" : "household"}');
// But wait, generateObservation doesn't have isSingle defined. Let's fix generateObservation to define it.
const obsTarget = `export function generateObservation(metric: HealthMetricResult, submission: any): string | null {
  const v = metric.value;`;

const obsReplacement = `export function generateObservation(metric: HealthMetricResult, submission: any): string | null {
  const v = metric.value;
  const isSingle = submission.maritalStatus === "Single" && (submission.totalDependents === 0 || !submission.totalDependents);`;
  
content = content.replace(obsTarget, obsReplacement);

// Fix specific strings
content = content.replace('this household faces immediate cash flow stress.', 'this ${isSingle ? "client" : "household"} faces immediate cash flow stress.`');
// Wait, the original strings use backticks but they don't have interpolation for household. Let's replace the whole string.
content = content.replace(
  '`Emergency fund covers barely ${v.toFixed(1)} months. If income stops, this household faces immediate cash flow stress.`',
  '`Emergency fund covers barely ${v.toFixed(1)} months. If income stops, this ${isSingle ? "client" : "household"} faces immediate cash flow stress.`'
);

content = content.replace(
  '`Term cover is only ${v.toFixed(0)}% of the ideal amount. Family is exposed to significant financial risk in case of tragedy.`',
  '`Term cover is only ${v.toFixed(0)}% of the ideal amount. ${isSingle ? "The client" : "Family"} is exposed to significant financial risk in case of tragedy.`'
);

content = content.replace(
  '`No term insurance despite having dependents — this is the most urgent gap.`',
  '`No term insurance despite having dependents — this is the most urgent gap.`' // unchanged, single with dependents = family
);

content = content.replace(
  '`Relying solely on employer health cover is risky. A job change or loss leaves the family uninsured. Need a personal base policy.`',
  '`Relying solely on employer health cover is risky. A job change or loss leaves the ${isSingle ? "client" : "family"} uninsured. Need a personal base policy.`'
);

// Fix generateAdvisorBrief
const briefTarget = `export function generateAdvisorBrief(submission: any, analysis: AnalysisResult): string {
  const name = submission.fullName || "Client";
  const age = calculateAge(submission.dateOfBirth);
  const ageStr = age ? \`, \${age},\` : "";
  const occ = submission.occupationType ? \` \${submission.occupationType.toLowerCase()}\` : " client";`;

const briefReplacement = `export function generateAdvisorBrief(submission: any, analysis: AnalysisResult): string {
  const name = cleanString(submission.fullName) || "Client";
  const age = calculateAge(submission.dateOfBirth);
  const ageStr = age ? \`, \${age},\` : "";
  const occ = submission.occupationType ? \` a \${submission.occupationType.toLowerCase()} professional\` : " a client";`;

content = content.replace(briefTarget, briefReplacement);

const healthRedPriority = `  const hlthRed = redFlags.find(m => m.key === "healthCoverAdequacy");
  if (hlthRed) priorities.push("Upgrade health insurance coverage");`;

const healthPriorityReplacement = `  const hlthRed = redFlags.find(m => m.key === "healthCoverAdequacy");
  const hlthYellow = yellowFlags.find(m => m.key === "healthCoverAdequacy");
  if (hlthRed || hlthYellow) priorities.push("Upgrade health insurance coverage");`;

content = content.replace(healthRedPriority, healthPriorityReplacement);

// Add generateQuestions at the end
const generateQuestionsCode = `
export function generateQuestions(submission: any, analysis: AnalysisResult): string[] {
  const q: string[] = [];
  const redFlags = analysis.metrics.filter(m => m.status === "RED");
  const yellowFlags = analysis.metrics.filter(m => m.status === "YELLOW");

  if (redFlags.some(m => m.key === "realEstateConcentration")) {
    q.push("Is the property self-occupied or an investment? Any intention to liquidate?");
  }
  if (redFlags.some(m => m.key === "emiToIncomeRatio")) {
    q.push("Which loan carries the highest interest rate? Any prepayment penalty?");
  }
  if (!analysis.topGoal) {
    q.push("What prompted this consultation? (No goals recorded)");
  }
  if (redFlags.some(m => m.key === "emergencyFundRatio")) {
    q.push("Do you have any undisclosed cash or liquid assets to cover immediate emergencies?");
  }
  if (redFlags.some(m => m.key === "creditCardRevolvingDebt")) {
    q.push("What is the current interest rate on the credit card debt?");
  }
  if (redFlags.some(m => m.key === "lifeCoverAdequacy")) {
    q.push("Are there any group life insurance policies from your employer?");
  }
  
  if (submission.hasMutualFunds && !submission.mfEquityPercent) {
    q.push("What is the equity/debt split of your existing mutual fund portfolio?");
  }
  
  return q;
}
`;

content += generateQuestionsCode;

fs.writeFileSync('src/lib/report.ts', content);
console.log('Fixed report.ts narrative and questions');
