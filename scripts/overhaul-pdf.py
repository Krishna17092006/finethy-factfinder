import re

with open('src/components/report/FactFinderPDF.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace wrap={false} with wrap
content = content.replace('wrap={false}', 'wrap')

# 2. Add imports
if "import { CFPSheet }" not in content:
    content = content.replace("import { cleanString, calculateAge", "import { cleanPdfText, cleanString, calculateAge")
    content = content.replace("import { AnalysisResult } from '@/lib/types';", "import { AnalysisResult } from '@/lib/types';\nimport { CFPSheet } from './CFPSheet';")

# 3. Fix ligatures in static text
content = content.replace(">Financial Planning Fact-Finder<", ">{cleanPdfText(\"Financial Planning Fact-Finder\")}<")
content = content.replace(">CLIENT PROFILE<", ">{cleanPdfText(\"CLIENT PROFILE\")}<")
content = content.replace(">FINANCIAL HEALTH DASHBOARD<", ">{cleanPdfText(\"FINANCIAL HEALTH DASHBOARD\")}<")
content = content.replace(">identified<", ">{cleanPdfText(\"identified\")}<")

# 4. Add CFPSheet at the end of Document
if "<CFPSheet" not in content:
    cfp_page = """
      <Page size="A4" style={styles.page} wrap>
        <CFPSheet submission={submission} analysis={analysis} />
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} fixed />
      </Page>
    </Document>
"""
    content = content.replace("</Document>", cfp_page)

with open('src/components/report/FactFinderPDF.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("PDF overhaul complete!")
