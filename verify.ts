import { generateMockSubmission } from './src/lib/mockData';
import { runAnalysis } from './src/lib/analysis';

const s = generateMockSubmission();
const a = runAnalysis(s);

console.log('Age:', 2026 - parseInt(s.dateOfBirth.split('-')[0]));
console.log('Dependents:', s.totalDependents);
console.log('Net worth:', a.netWorth);
console.log('Surplus:', a.monthlySurplus);
console.log('EF:', a.metrics.find(m => m.key === 'emergencyFundRatio')?.status);
console.log('Savings rate:', a.metrics.find(m => m.key === 'savingsRate')?.status);
console.log('EMI:', a.metrics.find(m => m.key === 'emiToIncomeRatio')?.status);
console.log('Equity:', a.metrics.find(m => m.key === 'equityExposureVsAge')?.status, a.metrics.find(m => m.key === 'equityExposureVsAge')?.value);
console.log('Life:', a.metrics.find(m => m.key === 'lifeCoverAdequacy')?.status);
console.log('Liquidity:', a.metrics.find(m => m.key === 'liquidityRatio')?.status);
console.log('Capacity:', a.riskProfile.capacityScore);
console.log('Final risk:', a.riskProfile.finalScore);
console.log('Constraint:', a.riskProfile.capacityConstraint);
console.log('Red:', a.redCount, 'Yellow:', a.yellowCount);
