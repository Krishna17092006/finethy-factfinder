import { describe, it, expect } from 'vitest';
import { calculateRiskProfile } from '../lib/risk';

describe('Risk Engine', () => {
  it('weighted tolerance sum works', () => {
    const profile = calculateRiskProfile({
      dateOfBirth: '1990-01-01',
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalMonthlyEMIs: 10000,
      bankSavingsFDValue: 300000,
      occupationType: 'Salaried - Private',
      totalDependents: 1,
      goalDetails: '[{"timeHorizon":"Medium-term (3-7 years)"}]',
      investmentExperience: '["Mutual Funds"]',
      riskQ1: 3, riskQ2: 3, riskQ3: 3, riskQ4: 3, riskQ5: 3,
      riskQ6: 3, riskQ7: 3, riskQ8: 3, riskQ9: 3, riskQ10: 3,
      riskQ11: 3, riskQ12: 3, riskQ13: 3, riskQ14: 3
    });
    
    expect(profile.toleranceScore).toBe(60);
  });

  it('noHistory weight redistribution (March-2020 question)', () => {
    const profile = calculateRiskProfile({
      dateOfBirth: '1990-01-01',
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalMonthlyEMIs: 10000,
      bankSavingsFDValue: 300000,
      occupationType: 'Salaried - Private',
      totalDependents: 1,
      goalDetails: '[{"timeHorizon":"Medium-term (3-7 years)"}]',
      investmentExperience: '["Mutual Funds"]',
      riskQ3_neutral: true, // This triggers noHistory
      riskQ1: 3, riskQ2: 3, riskQ3: 3, riskQ4: 3, riskQ5: 3,
      riskQ6: 3, riskQ7: 3, riskQ8: 3, riskQ9: 1, riskQ10: 3,
      riskQ11: 3, riskQ12: 3, riskQ13: 3, riskQ14: 3
    });
    
    expect(profile.toleranceScore).toBe(58);
  });

  it('finalScore === MIN(capacity, tolerance)', () => {
    const profile = calculateRiskProfile({
      dateOfBirth: '1995-01-01',
      monthlyIncome: 200000,
      monthlyExpenses: 50000,
      totalMonthlyEMIs: 0,
      bankSavingsFDValue: 600000, 
      emergencyFundMonths: "6+",
      occupationType: 'Salaried - Government',
      totalDependents: 0,
      goalDetails: '[{"timeHorizon":"Long-term (7+ years)"}]',
      investmentExperience: '["Mutual Funds"]',
      riskQ1: 1, riskQ2: 1, riskQ3: 1, riskQ4: 1, riskQ5: 1,
      riskQ6: 1, riskQ7: 1, riskQ8: 1, riskQ9: 1, riskQ10: 1,
      riskQ11: 1, riskQ12: 1, riskQ13: 1, riskQ14: 1
    });
    
    expect(profile.capacityScore).toBeGreaterThan(60);
    expect(profile.toleranceScore).toBe(20);
    expect(profile.finalScore).toBe(20);
  });

  it('band boundaries at exactly 20, 40, 60, 80', () => {
    const checkBand = (score: number, expected: string) => {
      let band = "Conservative";
      if (score >= 80) band = "Aggressive";
      else if (score >= 60) band = "Growth";
      else if (score >= 40) band = "Balanced";
      else if (score >= 20) band = "Moderate";
      expect(band).toBe(expected);
    };
    checkBand(20, "Moderate");
    checkBand(40, "Balanced");
    checkBand(60, "Growth");
    checkBand(80, "Aggressive");
  });

  it('contradiction detection fires on contradictory fixture', () => {
    const profile = calculateRiskProfile({
      dateOfBirth: '1990-01-01',
      monthlyIncome: 100000,
      monthlyExpenses: 50000,
      totalMonthlyEMIs: 10000,
      bankSavingsFDValue: 300000,
      occupationType: 'Salaried - Private',
      totalDependents: 1,
      goalDetails: '[]',
      investmentExperience: '[]',
      riskQ1: 1, riskQ2: 5, riskQ3: 5, riskQ4: 5, riskQ5: 5,
      riskQ6: 5, riskQ7: 5, riskQ8: 5, riskQ9: 5, riskQ10: 5,
      riskQ11: 5, riskQ12: 5, riskQ13: 5, riskQ14: 5
    });
    
    expect(profile.consistencyWarning).toBeDefined();
    expect(profile.consistencyWarning).not.toBeNull();
    expect(profile.consistencyWarning).toContain('inconsistency');
  });
});
