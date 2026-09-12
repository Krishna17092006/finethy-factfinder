const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Replace old fields in Section G
const oldSection = `  // ========================================
  // SECTION G: Investment Experience
  // ========================================
  investmentExperience   String?  // JSON array of types invested in
  riskReaction           String?  // Buy more | Hold calmly | Hold anxious | Sell some | Sell everything
  volatilityComfort      String?  // Added for UX refactor
  investmentPriority     String?  // Protecting | Balance | Maximum growth
  pastBadExperience      String?  // optional free text`;

const newSection = `  // ========================================
  // SECTION G: Risk Tolerance
  // ========================================
  investmentExperience   String?  // JSON array of types invested in
  riskQ1                 Int?
  riskQ2                 Int?
  riskQ3                 Int?
  riskQ4                 Int?
  riskQ5                 Int?
  riskQ6                 Int?
  riskQ7                 Int?
  riskQ8                 Int?
  riskQ9                 Int?
  riskQ10                Int?
  riskQ11                Int?
  riskQ12                Int?
  riskQ13                Int?
  riskQ14                Int?
  riskQ15                String?  // optional free text for past experience`;

schema = schema.replace(oldSection, newSection);

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated successfully.');
