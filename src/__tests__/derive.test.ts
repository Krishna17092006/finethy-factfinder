import { describe, it, expect } from 'vitest';
import { deriveData } from '../lib/derive';

describe('Derivation Layer', () => {
  it('derives Total Monthly EMIs and flags discrepancies', () => {
    // Exact match
    const subExact = {
      hasHomeLoan: true, homeLoanEMI: 20000,
      hasCarLoan: true, carLoanEMI: 10000,
      totalMonthlyEMIs: 30000 // Reported
    };
    const resExact = deriveData(subExact);
    expect(resExact.totalMonthlyEMIs).toBe(30000);
    expect(resExact.totalMonthlyEMIs_source).toBe('derived');
    expect(resExact.totalMonthlyEMIs_discrepancy).toBeUndefined();

    // Discrepancy
    const subBad = {
      hasHomeLoan: true, homeLoanEMI: 20000,
      hasCarLoan: true, carLoanEMI: 10000,
      totalMonthlyEMIs: 20000 // Reported incorrectly
    };
    const resBad = deriveData(subBad);
    expect(resBad.totalMonthlyEMIs).toBe(30000); // Prefers derived
    expect(resBad.totalMonthlyEMIs_source).toBe('derived');
    expect(resBad.totalMonthlyEMIs_discrepancy).toBeDefined();
  });

  it('derives Emergency Fund Months correctly', () => {
    const sub = {
      bankSavingsFDValue: 150000,
      monthlyExpenses: 50000
    };
    const res = deriveData(sub);
    // 150k / 50k = 3
    expect(res.emergencyFundMonths).toBe("1–3 months");
    expect(res.emergencyFundMonths_source).toBe('derived');
  });

  it('derives Dependent count and handles discrepancies', () => {
    const sub = {
      maritalStatus: 'Married',
      spouseEarning: false, // 1
      childrenCount: 2, // +2 = 3
      dependentTypes: '["Parents"]', // +1 = 4
      totalDependents: 2 // Client reported 2, but math says 4
    };
    const res = deriveData(sub);
    expect(res.totalDependents).toBe(4);
    expect(res.totalDependents_source).toBe('derived');
    expect(res.totalDependents_discrepancy).toBeDefined();
  });

  it('infers Investing experience from asset values', () => {
    const sub = {
      mutualFundsValue: 50000,
      stocksValue: 10000,
      goldValue: 0
    };
    const res = deriveData(sub);
    const exp = JSON.parse(res.investmentExperience);
    expect(exp).toContain("Mutual Funds");
    expect(exp).toContain("Direct Equity");
    expect(exp).not.toContain("Gold");
    expect(res.investmentExperience_source).toBe('derived');
  });

  it('calculates Retirement Target Year', () => {
    const sub = {
      dateOfBirth: '1990-05-15',
      retirementAge: 60
    };
    const res = deriveData(sub);
    expect(res.retirementTargetYear).toBe(2050);
    expect(res.retirementTargetYear_source).toBe('derived');
  });

  it('derives Monthly surplus', () => {
    const sub = {
      grossAnnualIncome: 1200000, // 100k/mo
      monthlyExpenses: 40000,
      hasHomeLoan: true,
      homeLoanEMI: 20000
    };
    const res = deriveData(sub);
    // 100k - 40k - 20k = 40k
    expect(res.derivedMonthlySurplus).toBe(40000);
    expect(res.derivedMonthlySurplus_source).toBe('derived');
  });
});
