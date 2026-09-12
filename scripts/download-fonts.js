const https = require('https');
const fs = require('fs');

const dl = (url, dest) => {
  const file = fs.createWriteStream(dest);
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      https.get(response.headers.location, (res) => {
        res.pipe(file);
      });
    } else {
      response.pipe(file);
    }
  });
};

dl('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSans/NotoSans-Regular.ttf', 'public/fonts/NotoSans-Regular.ttf');
dl('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSans/NotoSans-Bold.ttf', 'public/fonts/NotoSans-Bold.ttf');
console.log('Downloading real TTF fonts...');
