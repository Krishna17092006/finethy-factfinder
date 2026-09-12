const fs = require('fs');

// We need to compile the TS files to run them, or we can just mock a test script using ts-node
const script = `
import { runAnalysis } from './src/lib/analysis';

console.log("--- RUNNING TESTS ---");

// Test 1: Liquidity Ratio Thresholds
const baseSub = {
  grossAnnualIncome: 1200000,
  monthlyExpenses: 50000,
  bankSavingsFDValue: 0,
  ownHouseValue: 0,
  hasTermInsurance: true,
  termInsuranceCover: 10000000,
  healthInsuranceCover: 500000
};

function testLiquidity(liquid, house) {
  const sub = { ...baseSub, bankSavingsFDValue: liquid, ownHouseValue: house };
  const res = runAnalysis(sub);
  const metric = res.metrics.find(m => m.key === 'liquidityRatio');
  console.log(\`Liquid: \${liquid}, House: \${house} -> Ratio: \${metric.value.toFixed(1)}% -> Status: \${metric.status}\`);
}

console.log("\\nTesting Liquidity Ratio (Ideal 10-30%):");
testLiquidity(87000, 913000); // 8.7% -> YELLOW
testLiquidity(100000, 900000); // 10.0% -> GREEN
testLiquidity(300000, 700000); // 30.0% -> GREEN
testLiquidity(310000, 690000); // 31.0% -> YELLOW
testLiquidity(500000, 500000); // 50.0% -> YELLOW
testLiquidity(510000, 490000); // 51.0% -> RED

// Test 2: Debt to Assets vs Real Estate Concentration
console.log("\\nTesting Debt vs Real Estate Bug:");
const sub2 = {
  ...baseSub,
  bankSavingsFDValue: 2000000, // 20L
  ownHouseValue: 10000000,     // 1Cr (Real Estate)
  homeLoanOutstanding: 5000000 // 50L (Debt)
};
const res2 = runAnalysis(sub2);
const debt = res2.metrics.find(m => m.key === 'debtToAssetsRatio');
const re = res2.metrics.find(m => m.key === 'realEstateConcentration');

console.log(\`Total Assets: \${res2.totalAssets}\`);
console.log(\`Debt: \${debt.value.toFixed(1)}%\`);
console.log(\`Real Estate: \${re.value.toFixed(1)}%\`);
`;

fs.writeFileSync('test_logic.ts', script);
console.log('Created test_logic.ts');
