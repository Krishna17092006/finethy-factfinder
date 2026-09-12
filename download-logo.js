const https = require('https');
const fs = require('fs');

https.get('https://candorfs.com/wp-content/uploads/2025/10/Finethy-Logo-1.png', { rejectUnauthorized: false }, (res) => {
  res.pipe(fs.createWriteStream('public/images/Finethy-Logo-1.png'));
});
