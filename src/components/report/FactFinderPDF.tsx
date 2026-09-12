import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Link, Font, Svg, Line } from '@react-pdf/renderer';
import { AnalysisResult } from '@/lib/types';
import { CFPSheet } from './CFPSheet';
import { PieChart } from './PieChart';
import { formatRupees, formatRupeesShort, cleanString, calculateAge, cleanPdfText } from '@/lib/utils';

if (typeof window !== 'undefined') {
  Font.register({
    family: 'NotoSans',
    fonts: [
      { src: '/fonts/NotoSans-Regular.ttf' },
      { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 'bold' }
    ]
  });
}

const styles = StyleSheet.create({
  page: {
    paddingLeft: 40,
    paddingRight: 40,
    paddingTop: 130,
    paddingBottom: 110,
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: '#334155',
  },

  lhHeader: { position: 'absolute', top: 0, left: 0, right: 0 },
  lhHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 25, paddingHorizontal: 40, paddingBottom: 15 },
  lhLogo: { width: 160, height: 'auto' },
  lhAddressContainer: { alignItems: 'flex-start' },
  lhAddress: { fontSize: 9, color: '#2f5aa8', lineHeight: 1.4 },
  lhBorderBlue: { height: 4, backgroundColor: '#2f5aa8' },
  lhBorderOrange: { height: 2, backgroundColor: '#f08a0c' },
  lhFooter: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  lhFooterBorder: { height: 3, backgroundColor: '#f08a0c' },
  lhFooterContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2f5aa8', paddingVertical: 10, paddingHorizontal: 40 },
  lhFooterText: { color: '#ffffff', fontSize: 9 },
  lhWatermark: { position: 'absolute', top: '35%', left: '25%', width: '50%', opacity: 0.05, zIndex: -1 },
  reportTitleBox: { marginBottom: 20 },

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

  // ── Snapshot Banner (refined) ──────────────────────────────────────────────
  snapshotBox: {
    flexDirection: 'row',
    backgroundColor: '#eef2fa',
    borderRadius: 4,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2f5aa8',
  },
  snapshotItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  snapshotItemGoal: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  snapshotDivider: {
    width: 1,
    backgroundColor: '#c5d3eb',
    marginVertical: 8,
  },
  snapshotLabel: {
    fontSize: 7,
    color: '#8099bf',
    marginBottom: 4,
  },
  snapshotValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a3461',
  },
  // ──────────────────────────────────────────────────────────────────────────

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

  let goalsList = submission.goalsList || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.reportTitleBox}>
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
        </View>

        {/* SNAPSHOT — refined banner */}
        <View style={styles.snapshotBox}>
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>NET WORTH</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.netWorth)}</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>ANNUAL INCOME</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.annualIncome)}</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>MONTHLY SURPLUS</Text>
            <Text style={styles.snapshotValue}>{formatRupeesShort(analysis.monthlySurplus)}</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItem}>
            <Text style={styles.snapshotLabel}>DEPENDENTS</Text>
            <Text style={styles.snapshotValue}>{analysis.totalDependents}</Text>
          </View>
          <View style={styles.snapshotDivider} />
          <View style={styles.snapshotItemGoal}>
            <Text style={styles.snapshotLabel}>TOP GOAL</Text>
            <Text style={[styles.snapshotValue, { textAlign: 'center', fontSize: 11 }]}>
              {analysis.topGoal || 'None specified'}
            </Text>
          </View>
        </View>

        {/* CLIENT DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT DETAILS</Text>
          <View style={styles.row}>
            <View style={styles.col3}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{fullName || '-'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Age</Text>
              <Text style={styles.value}>{age ? `${age} years` : 'Not provided'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>Occupation</Text>
              <Text style={styles.value}>{submission.occupationType || '-'}</Text>
            </View>
            <View style={styles.col3}>
              <Text style={styles.label}>City</Text>
              <Text style={styles.value}>{city || '-'}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col6}>
              <Text style={styles.label}>Mobile</Text>
              <Text style={styles.value}>{submission.mobile || '-'}</Text>
            </View>
            <View style={styles.col6}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{submission.email || '-'}</Text>
            </View>
          </View>
        </View>

        {/* FAMILY BOX */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAMILY &amp; DEPENDENTS</Text>
          {isSingle ? (
            <Text style={styles.value}>Single, no dependents.</Text>
          ) : (
            <View style={styles.row}>
              <View style={styles.col4}>
                <Text style={styles.label}>Marital Status</Text>
                <Text style={styles.value}>{submission.maritalStatus || '-'}</Text>
              </View>
              <View style={styles.col4}>
                <Text style={styles.label}>Spouse</Text>
                <Text style={styles.value}>
                  {submission.maritalStatus !== 'Married' ? 'Not applicable' :
                    [submission.spouseName, submission.spouseOccupation].filter(Boolean).join(', ') ||
                    (submission.spouseEarning ? 'Name not provided, earning' : 'Not specified')}
                </Text>
              </View>
              <View style={styles.col4}>
                <Text style={styles.label}>Children &amp; Others</Text>
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
          <Text style={styles.briefText}>{cleanPdfText(analysis.advisorBrief)}</Text>
        </View>

        {/* QUESTIONS TO RAISE */}
        {analysis.questionsToRaise && analysis.questionsToRaise.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>QUESTIONS TO RAISE IN MEETING</Text>
            {analysis.questionsToRaise.map((q, i) => (
              <View key={i} style={styles.questionBox}>
                <Text style={styles.questionText}>- {cleanPdfText(q)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* RISK APPETITE */}
        {analysis.riskProfile && (
          <View style={styles.section} wrap>
            <Text style={styles.sectionTitle}>RISK APPETITE &amp; TOLERANCE</Text>

            <View style={styles.riskSpectrumContainer}>
              <Text style={styles.riskSpectrumTitle}>Risk Profile: {analysis.riskProfile.finalScore} - {
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

            {submission.riskQ15 && (
              <View style={styles.qnaCallout} wrap>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#b45309', marginBottom: 4 }}>Client Note (Q15):</Text>
                <Text style={{ fontSize: 10, color: '#334155' }}>&quot;{cleanPdfText(submission.riskQ15)}&quot;</Text>
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
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>*est. denotes a derived or estimated value based on midpoints or heuristics.</Text>
        </View>

        {/* OBSERVATIONS / DISCREPANCIES */}
        {analysis.observations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AREAS NEEDING ATTENTION</Text>
            {analysis.observations.map((obs, i) => (
              <View key={i} style={styles.alertBox}>
                  <Text style={styles.alertText}>- {cleanPdfText(obs)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ASSETS & LIABILITIES */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>{cleanPdfText("ASSETS & LIABILITIES")}</Text>

          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <View style={{ width: '48%' }}>
              <PieChart
                title="Asset Composition"
                data={analysis.assetBreakdown}
                defaultColor="#6b7280"
                colors={{
                  "Bank & FDs": "#00bbee",
                  "Bank & FD": "#00bbee",
                  "Mutual Funds": "#2f5aa8",
                  "Stocks": "#7c3aed",
                  "Retirement (EPF/PPF/NPS)": "#059669",
                  "Retirement": "#059669",
                  "Real Estate - Investment": "#f08a0c",
                  "Investment Property": "#f08a0c",
                  "Real Estate - Primary": "#dc2626",
                  "Primary House": "#dc2626",
                  "Gold": "#eab308"
                }}
              />
            </View>
            <View style={{ width: '48%' }}>
              <PieChart
                title="Liability Composition"
                data={analysis.liabilityBreakdown.map(l => ({ category: l.category, value: l.outstanding }))}
                defaultColor="#6b7280"
                colors={{
                  "Home Loan": "#1e40af",
                  "Car Loan": "#0891b2",
                  "Personal Loan": "#d97706",
                  "Credit Card": "#dc2626",
                  "Education Loan": "#7c3aed"
                }}
              />
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
                  <Text style={{ width: '25%' }}>
                    {g.name.toLowerCase().includes('retirement') && (!g.targetAmount || g.targetAmount === 0)
                      ? "Corpus (See CFP)"
                      : formatRupees(g.targetAmount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.value}>No goals recorded - establish objectives in the meeting.</Text>
          )}
        </View>

        <Text style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#ffffff' }} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
      </Page>

      <Page size="A4" style={styles.page} wrap>
        <CFPSheet submission={submission} analysis={analysis} />
        <Text style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#ffffff' }} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
      </Page>

      {/* NOTES PAGE */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={[styles.title, { fontSize: 18 }]}>{cleanPdfText("Meeting Notes")}</Text>
        <Text style={styles.subtitle}>{cleanPdfText(fullName)} | {cleanPdfText(date)}</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 15, marginBottom: 15 }}>
          {cleanPdfText("Use this page to capture key discussion points, decisions, and follow-up actions from the meeting.")}
        </Text>

        <View style={{ flex: 1, marginTop: 20 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <View key={i} style={{ borderBottom: '0.5pt solid #e0e0e0', marginBottom: 24, marginHorizontal: 10 }} />
          ))}
        </View>

        <Text style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: '#ffffff' }} render={({ pageNumber, totalPages }) => (`Page ${pageNumber} of ${totalPages}`)} fixed />
      </Page>
    </Document>


  );
};
