const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\krish\\.gemini\\antigravity\\brain\\bd3e87d7-6a4c-4f66-9394-e4394bd5848b\\.system_generated\\steps\\3908\\content.md', 'utf-8');
const cheerio = require('cheerio');
const $ = cheerio.load(html);
const text = $('body').text();
const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
// Print the last 50 lines where the footer usually is
console.log(lines.slice(-50).join('\n'));
