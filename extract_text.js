const fs = require('fs');
const html = fs.readFileSync('C:\\Users\\krish\\.gemini\\antigravity\\brain\\bd3e87d7-6a4c-4f66-9394-e4394bd5848b\\.system_generated\\steps\\3908\\content.md', 'utf-8');
// Remove script and style tags
let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
// Remove HTML tags
const text = clean.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
// Find anything looking like an address or phone
const matches = text.match(/.{0,50}(Bengaluru|Contact|Email|Phone|\+91|\d{10}|mail@).{0,50}/gi);
console.log(matches ? matches.join('\n') : "No matches found");
