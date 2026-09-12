const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:\\Users\\krish\\.gemini\\antigravity\\brain\\bd3e87d7-6a4c-4f66-9394-e4394bd5848b\\.system_generated\\steps\\3908\\content.md', 'utf-8');
const $ = cheerio.load(html);
const logos = [];
$('img').each((i, el) => {
  const src = $(el).attr('src');
  if (src && src.toLowerCase().includes('logo')) {
    logos.push(src);
  }
});
console.log(logos);
