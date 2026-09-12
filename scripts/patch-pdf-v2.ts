import fs from 'fs';

let content = fs.readFileSync('pdf_edit_fixed.ts', 'utf-8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}

// 1. Remove Q1-Q14 table but KEEP the riskGapInsight and Q15!
const toReplace = `                <Text style={styles.riskGapInsight}>
                  Allocation is set to the lower of the two. {analysis.riskProfile.gapInsight}
                </Text>
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
                  <Text style={styles.qnaAnswer}>Score {submission[\`riskQ\${qNum}\`]} selected</Text>
                  <Text style={styles.qnaScore}>{submission[\`riskQ\${qNum}\`]}</Text>
                </View>
              ))}
            </View>`;

const replacement = `                <Text style={styles.riskGapInsight}>
                  Allocation is set to the lower of the two. {analysis.riskProfile.gapInsight}
                </Text>
              </View>`;

content = content.replace(toReplace, replacement);

// 2. Add imports
if (!content.includes('import { PieChart }')) {
    content = content.replace("import { CFPSheet } from './CFPSheet';", "import { CFPSheet } from './CFPSheet';\nimport { PieChart } from './PieChart';");
}

// 3. Replace Assets & Liabilities section (from <View style={styles.section} break> with ASSETS & LIABILITIES to </View>)
const assetSectionStart = content.indexOf('{/* ASSETS & LIABILITIES */}');
const goalSectionStart = content.indexOf('{/* GOALS */}');

if (assetSectionStart !== -1 && goalSectionStart !== -1) {
    const newAssetsLiabilities = `{/* ASSETS & LIABILITIES */}
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

        `;
    content = content.substring(0, assetSectionStart) + newAssetsLiabilities + content.substring(goalSectionStart);
}

// 4. Notes Page
// We need <Line> import if we use it, or just use View with borderBottom.
const notesPage = `
      {/* NOTES PAGE */}
      <Page size="A4" style={styles.page} wrap>
        <Text style={[styles.title, { fontSize: 18 }]}>{cleanPdfText("Meeting Notes")}</Text>
        <Text style={styles.subtitle}>{cleanPdfText(fullName)} | {cleanPdfText(date)}</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginTop: 15, marginBottom: 15 }}>
          {cleanPdfText("Use this page to capture key discussion points, decisions, and follow-up actions from the meeting.")}
        </Text>
        
        <View style={{ flex: 1, marginTop: 10 }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <View key={i} style={{ height: '10mm', borderBottomWidth: 1, borderBottomColor: '#e0e0e0', width: '100%' }} />
          ))}
        </View>

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text>{cleanPdfText("FINETHY LLP — AMFI-registered Mutual Fund Distributor, ARN-28883, EUIN E045709")}</Text>
          <Text>{cleanPdfText("#56, 4th Floor, Sumukha Plaza, Puttanna Rd, Basavanagudi, Bengaluru 560004 | +91-89040 56464 | clientsupport@candorfs.com")}</Text>
          <Text style={{ marginTop: 4,  marginBottom: 4 }}>{cleanPdfText("Mutual Fund investments are subject to market risks. Read all scheme related documents carefully.")}</Text>
          <Text render={({ pageNumber, totalPages }) => (\`Page \${pageNumber} of \${totalPages}\`)} />
        </View>
      </Page>
    </Document>
`;

content = content.replace("</Document>", notesPage);

// 5. Replace wrap={false} with wrap for robustness (should already be done in previous step but just in case)
content = content.replace(/wrap=\{false\}/g, "wrap");

fs.writeFileSync('src/components/report/FactFinderPDF.tsx', content, 'utf-8');
console.log('PDF patched successfully!');
