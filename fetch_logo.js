const https = require('https');
https.get('https://finethy.co/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const cheerio = require('cheerio');
    const $ = cheerio.load(data);
    const logos = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src');
      if (src && src.toLowerCase().includes('logo')) {
        logos.push(src);
      }
    });
    console.log(logos);
  });
}).on('error', err => console.log('Error: ', err.message));
