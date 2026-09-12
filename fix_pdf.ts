import * as fs from 'fs';
const file = 'src/components/report/FactFinderPDF.tsx';
let txt = fs.readFileSync(file, 'utf-8');

const startIdx = txt.indexOf('const sortedMetrics = [...analysis.metrics].sort((a, b) => {');
const endIdx = txt.indexOf('<View style={styles.snapshotItem}>', startIdx);
if (startIdx !== -1 && endIdx !== -1) {
    const fix = `const sortedMetrics = [...analysis.metrics].sort((a, b) => {
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
        <LetterheadTemplate />
        
        <View style={styles.reportTitleBox}>
          <View>
            <Text style={styles.confidential}>CONFIDENTIAL - For Internal Advisory Preparation</Text>
            <Text style={styles.title}>Client Financial Health Report</Text>
            <Text style={styles.subtitle}>Prepared: {date} {timeTaken ? \`| Form time: \${timeTaken}\` : ''}</Text>
            
            <View style={styles.flagChipContainer}>
              <Text style={[styles.flagChip, styles.redBg, styles.redText]}>{analysis.redCount} RED</Text>
              <Text style={[styles.flagChip, styles.yellowBg, styles.yellowText]}>{analysis.yellowCount} YELLOW</Text>
              <Text style={[styles.flagChip, styles.greenBg, styles.greenText]}>{analysis.greenCount} GREEN</Text>
            </View>
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
          `;
    txt = txt.substring(0, startIdx) + fix + txt.substring(endIdx);
    fs.writeFileSync(file, txt);
    console.log("Restored perfectly using indexOf");
} else {
    console.log("Could not find boundaries");
}
