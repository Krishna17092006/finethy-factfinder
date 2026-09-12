import { describe, it, expect } from 'vitest';
import { runAnalysis } from '../lib/analysis';
import { deriveData } from '../lib/derive';

describe('Analysis Engine', () => {
  it('Liquidity Ratio bounds - exactly at 10% is GREEN, 8.7% is YELLOW', () => {
    // 10L liquid, 100L net worth = 10%
    const subAt10 = {
      bankSavingsFDValue: 1000000,
      investmentPropertyValue: 9000000 // total assets 100L, net worth 100L
    };
    const resAt10 = runAnalysis(subAt10);
    const liqAt10 = resAt10.metrics.find(m => m.key === 'liquidityRatio')!;
    expect(liqAt10.value).toBe(10);
    expect(liqAt10.status).toBe('GREEN');

    // 8.7% liquidity
    const subAt8 = {
      bankSavingsFDValue: 870000,
      investmentPropertyValue: 9130000 // total assets 100L
    };
    const resAt8 = runAnalysis(subAt8);
    const liqAt8 = resAt8.metrics.find(m => m.key === 'liquidityRatio')!;
    expect(liqAt8.value).toBeCloseTo(8.7, 1);
    expect(liqAt8.status).toBe('YELLOW');
  });

  it('Debt-to-Assets and Real Estate Concentration return identical values ONLY when mathematically equivalent', () => {
    // Case 1: Sole asset is house, sole debt is home loan. Both should be 89.7%
    const subIdentical = {
      ownHouseValue: 10000000,
      bankSavingsFDValue: 1148272,
      homeLoanOutstanding: 10000000,
    };
    const resIdentical = runAnalysis(subIdentical);
    const debtIdentical = resIdentical.metrics.find(m => m.key === 'debtToAssetsRatio')!;
    const reIdentical = resIdentical.metrics.find(m => m.key === 'realEstateConcentration')!;
    expect(debtIdentical.value).toBeCloseTo(89.7, 1);
    expect(reIdentical.value).toBeCloseTo(89.7, 1);
    expect(debtIdentical.value).toEqual(reIdentical.value);

    // Case 2: User has other assets and other debts. They MUST diverge.
    const subDiverge = {
      ownHouseValue: 10000000, // 1Cr
      homeLoanOutstanding: 5000000, // 50L
      bankSavingsFDValue: 2000000, // 20L
      personalLoanOutstanding: 1000000, // 10L
    };
    // Total Assets = 1.2Cr. Total Debt = 60L. RE Assets = 1Cr.
    // Debt-to-Assets = 60/120 = 50%. RE = 100/120 = 83.33%
    const resDiverge = runAnalysis(subDiverge);
    const debtDiverge = resDiverge.metrics.find(m => m.key === 'debtToAssetsRatio')!;
    const reDiverge = resDiverge.metrics.find(m => m.key === 'realEstateConcentration')!;
    expect(debtDiverge.value).toBe(50);
    expect(reDiverge.value).toBeCloseTo(83.3, 1);
    expect(debtDiverge.value).not.toEqual(reDiverge.value);
  });
});
