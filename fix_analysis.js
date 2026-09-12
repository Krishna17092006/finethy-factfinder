const fs = require('fs');

let content = fs.readFileSync('src/lib/analysis.ts', 'utf8');

// Replace symbols in healthyRange
content = content.replace(/`≥\$\{/g, '`at least ${');
content = content.replace(/`< \$\{/g, '`under ${');
content = content.replace(/`<\$\{/g, '`under ${');
content = content.replace(/`±\$\{/g, '`+/-${');
content = content.replace(/"₹0"/g, '"Rs. 0"');

// Fix liquidity ratio logic
const oldLiquidityLogic = `    let status: HealthStatus = "GREEN";
    if (liquidityRatio > liqRange.redMin! || liquidityRatio < liqRange.redMax!) status = "RED";
    else if (liquidityRatio > liqRange.yellowMax! || liquidityRatio < liqRange.yellowMin!) status = "YELLOW";`;

const newLiquidityLogic = `    let status: HealthStatus = "RED";
    if (liquidityRatio >= liqRange.greenMin! && liquidityRatio <= liqRange.greenMax!) status = "GREEN";
    else if (liquidityRatio >= liqRange.yellowMin! && liquidityRatio <= liqRange.yellowMax!) status = "YELLOW";`;

content = content.replace(oldLiquidityLogic, newLiquidityLogic);

// Add Questions to Raise generation
// We can append it to the AnalysisResult object. Wait, AnalysisResult type needs to be updated.
// Let's first save these fixes to analysis.ts
fs.writeFileSync('src/lib/analysis.ts', content);
console.log('Fixed analysis.ts symbols and liquidity ratio.');
