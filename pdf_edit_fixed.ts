import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link, Font } from '@react-pdf/renderer';
import { AnalysisResult } from '@/lib/types';
import { CFPSheet } from './CFPSheet';
import { formatRupees, formatRupeesShort, cleanString, calculateAge } from '@/lib/utils';



const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: '#334155',
    paddingBottom: 60, // Space for footer
  },
  riskSpectrumContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
  },
  riskSpectrumTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
  },
  riskBarTrack: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    flexDirection: 'row',
    position: 'relative',
    marginTop: 15,
    marginBottom: 10,
  },
  riskBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 6,
    backgroundColor: '#0f172a',
  },
  riskMarker: {
    position: 'absolute',
    top: -6,
    width: 2,
    height: 24,
    backgroundColor: '#000000',
  },
  riskLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  riskSecondaryContainer: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  riskSecondaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  riskSecondaryLabel: {
    fontSize: 10,
    color: '#334155',
    fontWeight: 'bold',
  },
  riskSecondaryTrack: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginBottom: 6,
  },
  riskSecondaryFill: {
    height: '100%',
    backgroundColor: '#94a3b8',
    borderRadius: 4,
  },
  riskGapInsight: {
    marginTop: 10,
    fontSize: 10,
    color: '#0f172a',
    
  },
  qnaTable: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  qnaRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 6,
  },
  qnaRowAlt: {
    backgroundColor: '#f8fafc',
  },
  qnaQuestion: {
    width: '60%',
    fontSize: 9,
    color: '#334155',
    paddingRight: 10,
  },
  qnaAnswer: {
    width: '30%',
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  qnaScore: {
    width: '10%',
    fontSize: 9,
    textAlign: 'center',
    color: '#64748b',
  },
  qnaCallout: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderBottomColor: '#2f5aa8',
    paddingBottom: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2f5aa8',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
  },
  confidential: {
    fontSize: 8,
    color: '#ef4444',
    
    marginBottom: 4,
  },
  logo: {
    height: 35,
    width: 'auto',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e3d73',
    backgroundColor: '#f8fafc',
    padding: 6,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f08a0c',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  col3: { width: '25%', paddingRight: 5 },
  col4: { width: '33.33%', paddingRight: 5 },
  col6: { width: '50%', paddingRight: 5 },
  col12: { width: '100%' },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  snapshotBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#e8eef8',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  snapshotItem: {
    alignItems: 'center',
  },
  snapshotLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  snapshotValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  flagChipContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  flagChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
  },
  healthTable: {
    width: '100%',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    alignItems: 'center',
  },
  tableColMetric: { width: '40%', paddingRight: 5 },
  tableColValue: { width: '20%' },
  tableColRange: { width: '25%' },
  tableColStatus: { width: '15%', flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  greenBg: { backgroundColor: '#f0fdf4' },
  yellowBg: { backgroundColor: '#fefce8' },
  redBg: { backgroundColor: '#fef2f2' },
  greenText: { color: '#22c55e' },
  yellowText: { color: '#eab308' },
  redText: { color: '#ef4444' },
  infoBg: { backgroundColor: '#e0f7fc' },
  infoText: { color: '#00bbee' },
  alertBox: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
    marginBottom: 6,
  },
  questionBox: {
    padding: 8,
    backgroundColor: '#fefce8',
    borderLeftWidth: 3,
    borderLeftColor: '#eab308',
    marginBottom: 6,
  },
  alertText: {
    fontSize: 10,
    color: '#ef4444',
  },
  questionText: {
    fontSize: 10,
    color: '#b45309',
  },
  briefText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 1.5,
  },
  estMarker: {
    fontSize: 7,
    color: '#64748b',
    verticalAlign: 'super',
  },
  barContainer: {
    flexDirection: 'row',
    height: 12,
    width: '100%',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 8,
    backgroundColor: '#e2e8f0',
  },
  barSegment: {
    height: '100%',
  },
  temperamentBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    borderRadius: 4,
  }
});

interface FactFinderPDFProps {
  submission: any;
  analysis: AnalysisResult;
  date: string;
}

export const FactFinderPDF = ({ submission, analysis, date }: FactFinderPDFProps) => {
  const sortedMetrics = [...analysis.metrics].sort((a, b) => {
    const score = { RED: 3, YELLOW: 2, GREEN: 1, INFO: 0 };
    return score[b.status] - score[a.status];
  });

  const age = calculateAge(submission.dateOfBirth);
  const fullName = cleanString(submission.fullName);
  const city = cleanString(submission.city);
  
  const isSingle = submission.maritalStatus === 'Single' && (submission.totalDependents === 0 || !submission.totalDependents);
  
  let timeTaken = '';
  if (submission.activeTimeSeconds) {
    timeTaken = Math.round(submission.activeTimeSeconds / 60) + ' min';
  } else if (submission.createdAt && submission.submittedAt) {
    const ms = new Date(submission.submittedAt).getTime() - new Date(submission.createdAt).getTime();
    timeTaken = Math.round(ms / 60000) + ' min';
  }

  let goalsList = [];
  try {
    if (submission.goalDetails) goalsList = JSON.parse(submission.goalPriorityOrder || "[]").map((g: string) => ({ name: g, ...JSON.parse(submission.goalDetails)[g] }));
  } catch(e) {}

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.confidential}>CONFIDENTIAL - For Internal Advisory Preparation</Text>
            <Text style={styles.title}>Client Financial Health Report</Text>
            <Text style={styles.subtitle}>Prepared: {date} {timeTaken ? `| Form time: ${timeTaken}` : ''}</Text>
            
            <View style={styles.flagChipContainer}>
              <Text style={[styles.flagChip, styles.redBg, styles.redText]}>{analysis.redCount} RED</Text>
              <Text style={[styles.flagChip, styles.yellowBg, styles.yellowText]}>{analysis.yellowCount} YELLOW</Text>
              <Text style={[styles.flagChip, styles.greenBg, styles.greenText]}>{analysis.greenCount} GREEN</Text>
            </View>
          </View>
          <View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={styles.logo} src="https://candorfs.com/wp-content/uploads/2025/10/Finethy-Logo-1.png" />
          </View>
        </View>

        {/* SNAPSHOT */}
        <View style={styles.snapshotBox}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>NET WORTH</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.netWorth)}</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>ANNUAL INCOME</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.annualIncome)}</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>MONTHLY SURPLUS</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.monthlySurplus)}</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>DEPENDENTS</Text>
            <Text style={styles.snapshotValue}>{analysis.totalDependents}</Text>
          </View>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>TOP GOAL</Text>
            <Text style={styles.snapshotValue}>{analysis.topGoal || 'None specified'}</Text>
          </View>
        </View>

        {/* CLIENT DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT DETAILS</Text>
          <View style={styles.row}>
            <View style={styles.col3}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{fullName || 'â€”'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{age ? `${age} years` : 'â€”'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Occupation</Text>
              <Text style={styles.value}>{submission.occupationType || 'â€”'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>{city || 'â€”'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col6}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>{submission.mobile || 'â€”'}</Text>
            </View>
            <View style={styles.col6}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{submission.email || 'â€”'}</Text>
            </View>
          </View>
        </View>

        {/* FAMILY BOX */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAMILY & DEPENDENTS</Text>
          {isSingle ? (
            <Text style={styles.value}>Single, no dependents.</Text>
          ) : (
            <View style={styles.row}>
              <View style={styles.col4}>
                <Text style={styles.label}>Marital Status</Text>
                <Text style={styles.value}>{submission.maritalStatus || 'â€”'}</Text>
              </View>
              <View style={styles.col4}>
                <Text style={styles.label}>Spouse</Text>
                <Text style={styles.value}>{submission.spouseOccupation ? submission.spouseOccupation : (submission.maritalStatus === 'Married' ? 'Not specified' : 'â€”')}</Text>
              </View>
              <View style={styles.col4}>
                <Text style={styles.label}>Children & Others</Text>
                <Text style={styles.value}>
                  {submission.childrenCount ? `${submission.childrenCount} children` : ''}
                  {submission.childrenCount && submission.dependentTypes !== "[]" ? ', ' : ''}
                  {submission.dependentTypes !== "[]" ? JSON.parse(submission.dependentTypes || "[]").join(', ') : (!submission.childrenCount ? 'None' : '')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* HOW TO APPROACH */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HOW TO APPROACH THIS CLIENT</Text>
          <Text style={styles.briefText}>{analysis.advisorBrief}</Text>
        </View>

        {/* QUESTIONS TO RAISE */}
        {analysis.questionsToRaise && analysis.questionsToRaise.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUESTIONS TO RAISE IN MEETING</Text>
            {analysis.questionsToRaise.map((q, i) => (
              <View key={i} style={styles.questionBox}>
                <Text style={styles.questionText}>â€¢ {q}</Text>
              </View>
            ))}
          </View>
        )}

        {/* RISK APPETITE */}
        {analysis.riskProfile && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>RISK APPETITE & TOLERANCE</Text>
            
            <View style={styles.riskSpectrumContainer}>
              <Text style={styles.riskSpectrumTitle}>Risk Profile: {analysis.riskProfile.finalScore} â€” {
                analysis.riskProfile.finalScore < 20 ? "Conservative" :
                analysis.riskProfile.finalScore < 40 ? "Moderately Conservative" :
                analysis.riskProfile.finalScore < 60 ? "Balanced" :
                analysis.riskProfile.finalScore < 80 ? "Moderately Aggressive" : "Aggressive"
              }</Text>
              
              <Text style={{ fontSize: 9, color: '#334155', marginBottom: 15 }}>
                {analysis.riskProfile.finalScore}% toward the aggressive end of the spectrum, {100 - analysis.riskProfile.finalScore}% toward the conservative end.
              </Text>

              {/* Primary Bar */}
              <View style={styles.riskBarTrack}>
                <View style={[styles.riskBarFill, { width: `${analysis.riskProfile.finalScore}%` }]} />
                <View style={[styles.riskMarker, { left: `${analysis.riskProfile.finalScore}%` }]} />
              </View>
              
              <View style={styles.riskLabels}>
                <Text>Conservative</Text>
                <Text>Mod. Cons.</Text>
                <Text>Balanced</Text>
                <Text>Mod. Aggr.</Text>
                <Text>Aggressive</Text>
              </View>

              {/* Secondary Bars */}
              <View style={styles.riskSecondaryContainer}>
                <View style={styles.riskSecondaryRow}>
                  <Text style={styles.riskSecondaryLabel}>Ability to take risk (Capacity): {analysis.riskProfile.capacityScore}</Text>
                </View>
                <View style={styles.riskSecondaryTrack}>
                  <View style={[styles.riskSecondaryFill, { width: `${analysis.riskProfile.capacityScore}%` }]} />
                </View>
                <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 10 }}>{analysis.riskProfile.capacityConstraint}</Text>

                <View style={styles.riskSecondaryRow}>
                  <Text style={styles.riskSecondaryLabel}>Willingness to take risk (Tolerance): {analysis.riskProfile.toleranceScore}</Text>
                </View>
                <View style={styles.riskSecondaryTrack}>
                  <View style={[styles.riskSecondaryFill, { width: `${analysis.riskProfile.toleranceScore}%` }]} />
                </View>

                {analysis.riskProfile.consistencyWarning && (
                  <Text style={[styles.riskGapInsight, { color: '#ef4444' }]}>
                    Note: {analysis.riskProfile.consistencyWarning}
                  </Text>
                )}
                
                <Text style={styles.riskGapInsight}>
                  Allocation is set to the lower of the two. {analysis.riskProfile.gapInsight}
                </Text>
              </View>
            </View>

            {/* QnA Table for Reference */}
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10 }}>Questionnaire Reference</Text>
            <View style={styles.qnaTable}>
              <View style={[styles.qnaRow, { backgroundColor: '#e2e8f0' }]}>
                <Text style={[styles.qnaQuestion, { fontWeight: 'bold' }]}>Question</Text>
                <Text style={[styles.qnaAnswer, { fontWeight: 'bold' }]}>Client&apos;s Answer</Text>
                <Text style={[styles.qnaScore, { fontWeight: 'bold' }]}>Score</Text>
              </View>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((qNum, i) => (
                <View key={qNum} style={[styles.qnaRow, i % 2 === 1 ? styles.qnaRowAlt : {}]}>
                  <Text style={styles.qnaQuestion}>Q{qNum}</Text>
                  <Text style={styles.qnaAnswer}>Score {submission[`riskQ${qNum}`]} selected</Text>
                  <Text style={styles.qnaScore}>{submission[`riskQ${qNum}`]}</Text>
                </View>
              ))}
            </View>

            {submission.riskQ15 && (
              <View style={styles.qnaCallout} wrap>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#b45309', marginBottom: 4 }}>Client Note (Q15):</Text>
                <Text style={{ fontSize: 10, color: '#334155',  }}>&quot;{cleanString(submission.riskQ15)}&quot;</Text>
              </View>
            )}

          </View>
        )}

        {/* HEALTH METRICS */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>HEALTH METRICS (THE BLOOD REPORT)</Text>
          <View style={styles.healthTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableColMetric}>Metric</Text>
              <Text style={styles.tableColValue}>Client&apos;s Value</Text>
              <Text style={styles.tableColRange}>Healthy Range</Text>
              <Text style={styles.tableColStatus}>Status</Text>
            </View>
            
            {sortedMetrics.map((m, i) => {
              const bgStyle = m.status === 'RED' ? styles.redBg : m.status === 'YELLOW' ? styles.yellowBg : m.status === 'GREEN' ? styles.greenBg : {};
              const textStyle = m.status === 'RED' ? styles.redText : m.status === 'YELLOW' ? styles.yellowText : m.status === 'GREEN' ? styles.greenText : styles.infoText;
              const marker = m.status === 'RED' ? '[!]' : m.status === 'YELLOW' ? '[~]' : m.status === 'GREEN' ? '[ok]' : '';
              
              return (
                <View key={i} style={[styles.tableRow, bgStyle]}>
                  <Text style={styles.tableColMetric}>{m.name}</Text>
                  <Text style={[styles.tableColValue, { fontWeight: 'bold' }]}>
                    {m.displayValue} {m.isEstimated ? <Text style={styles.estMarker}>*est.</Text> : ''}
                  </Text>
                  <Text style={styles.tableColRange}>{m.healthyRange}</Text>
                  <View style={styles.tableColStatus}>
                    <Text style={[textStyle, { fontWeight: 'bold' }]}>{marker} {m.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <Text style={{ fontSize: 7, color: '#94a3b8',  }}>*est. denotes a derived or estimated value based on midpoints or heuristics.</Text>
        </View>

        {/* OBSERVATIONS / DISCREPANCIES */}
        {analysis.observations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AREAS NEEDING ATTENTION</Text>
            {analysis.observations.map((obs, i) => (
              <View key={i} style={styles.alertBox}>
                <Text style={styles.alertText}>â€¢ {obs}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ASSETS & LIABILITIES */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>ASSETS & LIABILITIES</Text>
          
          <View style={styles.row}>
            {/* Assets Column */}
            <View style={styles.col6}>
              <Text style={[styles.label, { fontWeight: 'bold', marginBottom: 4 }]}>Total Assets: {formatRupees(analysis.totalAssets)}</Text>
              {analysis.assetBreakdown.map((a, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, color: a.color }}>{a.category}</Text>
                  <Text style={{ fontSize: 9 }}>{formatRupees(a.value)} ({a.percentage.toFixed(1)}%)</Text>
                </View>
              ))}
              
              {/* Asset Bar Chart */}
              {analysis.assetBreakdown.length > 0 && (
                <View style={styles.barContainer}>
                  {analysis.assetBreakdown.map((a, i) => (
                    <View key={i} style={[styles.barSegment, { width: `${a.percentage}%`, backgroundColor: a.color }]} />
                  ))}
                </View>
              )}
            </View>

            {/* Liabilities Column */}
            <View style={styles.col6}>
              <Text style={[styles.label, { fontWeight: 'bold', marginBottom: 4 }]}>Total Liabilities: {formatRupees(analysis.totalLiabilities)}</Text>
              {analysis.liabilityBreakdown.map((l, i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 9, color: l.color }}>{l.category}</Text>
                  <Text style={{ fontSize: 9 }}>{formatRupees(l.outstanding)} (EMI: {formatRupeesShort(l.emi)})</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* GOALS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FINANCIAL GOALS</Text>
          {goalsList.length > 0 ? (
            <View style={styles.healthTable}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '10%' }}>Priority</Text>
                <Text style={{ width: '40%' }}>Goal</Text>
                <Text style={{ width: '25%' }}>Target Year</Text>
                <Text style={{ width: '25%' }}>Amount</Text>
              </View>
              {goalsList.map((g: any, i: number) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={{ width: '10%', fontWeight: 'bold' }}>#{i+1}</Text>
                  <Text style={{ width: '40%', fontWeight: 'bold' }}>{g.name}</Text>
                  <Text style={{ width: '25%' }}>{g.targetYear} ({g.targetYear - new Date().getFullYear()} yrs)</Text>
                  <Text style={{ width: '25%' }}>{formatRupees(g.targetAmount)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>No goals recorded â€” establish objectives in the meeting.</Text>
          )}
        </View>



        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>FINETHY LLP â€” AMFI-registered Mutual Fund Distributor, ARN-28883, EUIN E045709</Text>
          <Text>#56, 4th Floor, Sumukha Plaza, Puttanna Rd, Basavanagudi, Bengaluru 560004 | +91-89040 56464 | clientsupport@candorfs.com</Text>
          <Text style={{ marginTop: 4,  marginBottom: 4 }}>&quot;Mutual Fund investments are subject to market risks. Read all scheme related documents carefully.&quot;</Text>
          <Text render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} />
        </View>
      </Page>
    
      <Page size="A4" style={styles.page} wrap>
        <CFPSheet submission={submission} analysis={analysis} />
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>

  );
};
