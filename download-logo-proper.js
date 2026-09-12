const https = require('https');
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const file = fs.createWriteStream("public/images/Finethy-Logo-1.png");
https.get("https://candorfs.com/wp-content/uploads/2025/10/Finethy-Logo-1.png", function(response) {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on("finish", () => {
      file.close();
      console.log("Download complete");
    });
  } else {
    console.error("Failed to download, status code: " + response.statusCode);
  }
}).on('error', function(err) {
  fs.unlink("public/images/Finethy-Logo-1.png", () => {});
  console.error("Error: ", err.message);
});
