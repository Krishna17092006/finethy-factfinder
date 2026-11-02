import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { AnalysisResult } from '@/lib/types';
import { ASSUMPTIONS } from '@/config/assumptions';
import { formatRupees } from '@/lib/utils';
import { cleanPdfText } from '@/lib/utils';

const styles = StyleSheet.create({
  pageHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 6,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 5,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    backgroundColor: '#f1f5f9',
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  label: {
    fontSize: 9,
    color: '#475569',
    width: '60%',
  },
  value: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
    width: '40%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#94a3b8',
    backgroundColor: '#f8fafc',
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  text: {
    fontSize: 9,
    color: '#475569',
    marginBottom: 2,
    lineHeight: 1.4,
  },
  gapText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  surplusText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  th: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334155',
  },
  td: {
    fontSize: 8,
    color: '#475569',
  },
  assumptionsBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  }
});

// Helper for compound interest
function calculateFV(pv: number, rate: number, years: number) {
  return pv * Math.pow(1 + (rate / 100), years);
}

function calculateSIP(fv: number, annualRate: number, years: number) {
  if (years <= 0 || fv <= 0) return 0;
  const r = (annualRate / 100) / 12;
  const n = years * 12;
  // FV = P * ((1+r)^n - 1) / r * (1+r)  -- Assuming SIP at beginning of month
  // P = FV * r / (((1+r)^n - 1) * (1+r))
  return fv * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
}

function calculateRetirementCorpus(annualExpense: number, realReturn: number, yearsInRetirement: number) {
  const r = realReturn / 100;
  // PV of Annuity = PMT * (1 - (1+r)^-n) / r
  return annualExpense * (1 - Math.pow(1 + r, -yearsInRetirement)) / r;
}

export function CFPSheet({ submission, analysis }: { submission: any, analysis: AnalysisResult }) {
  // 1. Cash-flow statement
  const income = analysis.annualIncome / 12;
  const expenses = submission.monthlyExpenses || 0;
  const emi = submission.totalMonthlyEMIs || 0;
  const surplus = income - expenses - emi;

  // 2. Emergency Fund Working
  const liquid = (submission.bankSavingsFDValue || 0) + (submission.cashAtHandValue || 0);
  const efTarget = expenses * ASSUMPTIONS.EMERGENCY_FUND_MONTHS;
  const efGap = efTarget - liquid;

  // 3. Life Cover Working (HLV - Human Life Value)
  const selfIncome = submission.grossAnnualIncome || 0;
  const hlvTarget = (selfIncome * ASSUMPTIONS.LIFE_COVER_INCOME_MULTIPLIER) + analysis.totalLiabilities;
  const existingLifeCover = submission.termInsuranceCover || 0;
  const lifeGap = hlvTarget - existingLifeCover;

  // 4. Health Cover Working
  const familyCount = 1 + (submission.maritalStatus === 'Married' ? 1 : 0) + (submission.childrenCount || 0) + ((submission.dependentTypes && submission.dependentTypes.includes("Parents")) ? 1 : 0);
  const healthTarget = ASSUMPTIONS.HEALTH_COVER_BASE + (Math.max(0, familyCount - 1) * ASSUMPTIONS.HEALTH_COVER_PER_DEPENDENT);
  const existingHealthCover = submission.healthInsuranceCover || 0;
  const healthGap = healthTarget - existingHealthCover;

  // 5. Debt Avalanche
  // Sort liabilities by assumed interest rate (descending)
  const sortedLiabilities = [...analysis.liabilityBreakdown].map(l => {
    let rate = 12; // default
    const c = l.category.toLowerCase();
    if (c.includes('credit card')) rate = ASSUMPTIONS.RATES.CREDIT_CARD;
    else if (c.includes('personal')) rate = ASSUMPTIONS.RATES.PERSONAL_LOAN;
    else if (c.includes('education')) rate = ASSUMPTIONS.RATES.EDUCATION_LOAN;
    else if (c.includes('car')) rate = ASSUMPTIONS.RATES.CAR_LOAN;
    else if (c.includes('home')) rate = ASSUMPTIONS.RATES.HOME_LOAN;
    return { ...l, rate };
  }).sort((a, b) => b.rate - a.rate);

  // 6. Goals
  const goals: any[] = submission.goalsList || [];
  const currentYear = new Date().getFullYear();

  return (
    <View wrap>
      <Text style={styles.pageHeading}>{cleanPdfText("Prepared Calculations (CFP Reference)")}</Text>
      
      {/* 1. Cash Flow */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("1. Cash-Flow Statement (Monthly)")}</Text>
        <View style={styles.row}><Text style={styles.label}>Household Income</Text><Text style={styles.value}>{formatRupees(income)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Living Expenses</Text><Text style={styles.value}>- {formatRupees(expenses)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Debt Obligations (EMI)</Text><Text style={styles.value}>- {formatRupees(emi)}</Text></View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Monthly Investible Surplus</Text>
          <Text style={styles.totalValue}>{formatRupees(surplus)}</Text>
        </View>
      </View>

      {/* 2. Emergency Fund */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("2. Emergency Fund")}</Text>
        <View style={styles.row}><Text style={styles.label}>Target ({ASSUMPTIONS.EMERGENCY_FUND_MONTHS}x Expenses)</Text><Text style={styles.value}>{formatRupees(efTarget)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Current Liquid Assets</Text><Text style={styles.value}>{formatRupees(liquid)}</Text></View>
        {efGap > 0 ? (
          <Text style={styles.gapText}>Gap: {formatRupees(efGap)} (Funding Required)</Text>
        ) : (
          <Text style={styles.surplusText}>Fully Funded (Surplus: {formatRupees(Math.abs(efGap))})</Text>
        )}
      </View>

      {/* 3. Life Cover */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("3. Life Insurance Adequacy")}</Text>
        <View style={styles.row}><Text style={styles.label}>Income Replacement ({ASSUMPTIONS.LIFE_COVER_INCOME_MULTIPLIER}x Income)</Text><Text style={styles.value}>{formatRupees(selfIncome * ASSUMPTIONS.LIFE_COVER_INCOME_MULTIPLIER)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Outstanding Liabilities</Text><Text style={styles.value}>{formatRupees(analysis.totalLiabilities)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Human Life Value (HLV) Target</Text><Text style={styles.totalValue}>{formatRupees(hlvTarget)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Existing Life Cover</Text><Text style={styles.value}>{formatRupees(existingLifeCover)}</Text></View>
        {lifeGap > 0 ? (
          <Text style={styles.gapText}>Gap: {formatRupees(lifeGap)} additional cover needed</Text>
        ) : (
          <Text style={styles.surplusText}>Adequately Covered</Text>
        )}
      </View>

      {/* 4. Health Cover */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("4. Health Insurance")}</Text>
        <View style={styles.row}><Text style={styles.label}>Family Size</Text><Text style={styles.value}>{familyCount} members</Text></View>
        <View style={styles.row}><Text style={styles.label}>Benchmark Target</Text><Text style={styles.value}>{formatRupees(healthTarget)}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Existing Cover</Text><Text style={styles.value}>{formatRupees(existingHealthCover)}</Text></View>
        {healthGap > 0 ? (
          <Text style={styles.gapText}>Gap: {formatRupees(healthGap)}</Text>
        ) : (
          <Text style={styles.surplusText}>Adequately Covered</Text>
        )}
      </View>

      {/* 5. Debt Avalanche */}
      {sortedLiabilities.length > 0 && (
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("5. Debt Clearance Priority (Avalanche Method)")}</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '40%' }]}>Loan Type</Text>
            <Text style={[styles.th, { width: '30%', textAlign: 'right' }]}>Outstanding</Text>
            <Text style={[styles.th, { width: '30%', textAlign: 'right' }]}>Est. Interest</Text>
          </View>
          {sortedLiabilities.map((l, i) => (
            <View key={i} style={[styles.row, { paddingHorizontal: 4 }]}>
              <Text style={[styles.td, { width: '40%', fontWeight: i === 0 ? 'bold' : 'normal', color: i===0 && l.rate >= 20 ? '#dc2626' : '#475569' }]}>{cleanPdfText(l.category)}</Text>
              <Text style={[styles.td, { width: '30%', textAlign: 'right' }]}>{formatRupees(l.outstanding)}</Text>
              <Text style={[styles.td, { width: '30%', textAlign: 'right' }]}>~{l.rate}% p.a.</Text>
            </View>
          ))}
          {sortedLiabilities[0].rate >= 20 && (
             <Text style={styles.gapText}>Priority 1: Clear {cleanPdfText(sortedLiabilities[0].category)} immediately to stop {sortedLiabilities[0].rate}% compounding.</Text>
          )}
        </View>
      )}

      {/* 6. Goals Funding */}
      {goals.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} minPresenceAhead={70}>{cleanPdfText("6. Future Goals Projection")}</Text>
          {(() => {
            let totalSip = 0;
            let retirementSip = 0;
            let educationSip = 0;

            const goalNodes = goals.map((g, i) => {
              const years = g.targetYear - currentYear;
              if (years <= 0) return null;
              
              if (g.name.toLowerCase().includes('retirement')) {
                const retExpense = (submission.grossAnnualIncome || 0) * 0.8;
                const futureRetExpense = calculateFV(retExpense, ASSUMPTIONS.INFLATION_RATE, years);
                const corpus = calculateRetirementCorpus(futureRetExpense, 5, 20);
                const sip = calculateSIP(corpus, 10, years);
                totalSip += sip;
                retirementSip += sip;
                
                return (
                  <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                    <Text style={styles.totalLabel}>{cleanPdfText(g.name)} (in {years} years)</Text>
                    <View style={styles.row}><Text style={styles.label}>Retirement Corpus Required</Text><Text style={styles.value}>{formatRupees(corpus)}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Est. Monthly SIP (at 10% return)</Text><Text style={styles.value}>{formatRupees(sip)}</Text></View>
                  </View>
                );
              }
              
              if (!g.targetAmount) return null;
              const futureCost = calculateFV(g.targetAmount, ASSUMPTIONS.EDUCATION_INFLATION_RATE, years);
              const sip = calculateSIP(futureCost, 10, years);
              totalSip += sip;
              if (g.name.toLowerCase().includes('education')) educationSip += sip;
              
              return (
                <View key={i} style={{ marginBottom: 6 }} wrap={false}>
                  <Text style={styles.totalLabel}>{cleanPdfText(g.name)} (in {years} years)</Text>
                  <View style={styles.row}><Text style={styles.label}>Future Cost (at {ASSUMPTIONS.EDUCATION_INFLATION_RATE}% inflation)</Text><Text style={styles.value}>{formatRupees(futureCost)}</Text></View>
                  <View style={styles.row}><Text style={styles.label}>Est. Monthly SIP (at 10% return)</Text><Text style={styles.value}>{formatRupees(sip)}</Text></View>
                </View>
              );
            });

            return (
              <>
                {goalNodes}
                <View style={[styles.assumptionsBox, { marginTop: 10, backgroundColor: '#fefce8', borderColor: '#eab308' }]}>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#854d0e', marginBottom: 4 }]}>Goal Feasibility Check</Text>
                  <Text style={[styles.text, { color: '#854d0e' }]}>Total required for all goals: {formatRupees(totalSip)}/month vs available surplus {formatRupees(surplus)}/month.</Text>
                  <Text style={[styles.text, { color: '#854d0e' }]}>Remaining after goal SIPs: {formatRupees(surplus - totalSip)}/month.</Text>
                  {totalSip > surplus && (
                    <Text style={[styles.text, { color: '#dc2626', fontWeight: 'bold', marginTop: 4 }]}>
                      Note: Retirement SIP of {formatRupees(retirementSip)} cannot run simultaneously with Education SIPs at current surplus - prioritisation needed in the meeting.
                    </Text>
                  )}
                </View>
              </>
            );
          })()}
        </View>
      )}

      {/* 7. Assumptions */}
      <View style={styles.assumptionsBox} wrap={false}>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>{cleanPdfText("Assumptions used: ")}</Text>
          {cleanPdfText(`general inflation ${ASSUMPTIONS.INFLATION_RATE}% p.a.; education inflation ${ASSUMPTIONS.EDUCATION_INFLATION_RATE}% p.a.; pre-retirement return ${ASSUMPTIONS.RETIREMENT_RETURN_RATE}% p.a.; life cover ${ASSUMPTIONS.LIFE_COVER_INCOME_MULTIPLIER}x gross annual income + liabilities.`)}
        </Text>
      </View>

    </View>
  );
}
