const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('C:\\Users\\krish\\.gemini\\antigravity\\brain\\bd3e87d7-6a4c-4f66-9394-e4394bd5848b\\.system_generated\\steps\\3908\\content.md', 'utf-8');
const $ = cheerio.load(html);
const imgs = [];
$('img').each((i, el) => {
  const src = $(el).attr('src');
  if (src && !src.includes('data:image')) {
    imgs.push(src);
  }
});
console.log(Array.from(new Set(imgs)).join('\n'));
