import { describe, it, expect } from 'vitest';
import { runAnalysis } from '../lib/analysis';

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

  it('Real estate concentration counts investment property only (the home is excluded)', () => {
    // Only asset is the home: debt-to-assets is high, but there is no investment-property concentration.
    const homeOnly = runAnalysis({ ownHouseValue: 10000000, bankSavingsFDValue: 1148272, homeLoanOutstanding: 10000000 });
    expect(homeOnly.metrics.find(m => m.key === 'debtToAssetsRatio')!.value).toBeCloseTo(89.7, 1);
    expect(homeOnly.metrics.find(m => m.key === 'realEstateConcentration')!.value).toBe(0);

    // 1Cr home + 20L bank + 30L plot; 60L debt -> debt/assets 40%, investment RE 20%
    const mixed = runAnalysis({
      ownHouseValue: 10000000,
      bankSavingsFDValue: 2000000,
      investmentPropertyValue: 3000000,
      homeLoanOutstanding: 5000000,
      personalLoanOutstanding: 1000000,
    });
    expect(mixed.metrics.find(m => m.key === 'debtToAssetsRatio')!.value).toBe(40);
    expect(mixed.metrics.find(m => m.key === 'realEstateConcentration')!.value).toBe(20);
  });

  it('counts EPF + PPF + NPS in net worth', () => {
    const res = runAnalysis({ hasRetirementAccounts: true, epfValue: 100000, ppfValue: 600000, npsValue: 500000 });
    expect(res.totalAssets).toBe(1200000);
    expect(res.assetBreakdown.find(a => a.category.startsWith('Retirement'))!.value).toBe(1200000);
  });

  it('uses one emergency-fund number for the health table and the risk engine', () => {
    const res = runAnalysis({ bankSavingsFDValue: 300000, cashAtHandValue: 200000, monthlyExpenses: 100000, grossAnnualIncome: 2400000 });
    const ef = res.metrics.find(m => m.key === 'emergencyFundRatio')!;
    expect(ef.value).toBe(3); // bank + FDs / expenses
    expect(res.riskProfile!.capacityConstraint).not.toMatch(/insufficient emergency/i);
  });

  it('stamps the engine version', () => {
    expect(runAnalysis({}).analysisVersion).toBeGreaterThanOrEqual(2);
  });
});
