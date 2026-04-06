const https = require('https');
const fs = require('fs');

async function fetchSubsetTTF(family, dest) {
  const text = encodeURIComponent('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&|!?,. ');
  const url = https://fonts.googleapis.com/css2?family= + family + :wght@700&text= + text;
  
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534.57.2 (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2' }
    }, (res) => {
      let css = '';
      res.on('data', chunk => css += chunk);
      res.on('end', () => {
        const urlMatch = css.match(/url\((https:\/\/[^)]+\.ttf)\)/);
        if(urlMatch) {
          https.get(urlMatch[1], (res2) => {
            const file = fs.createWriteStream(dest);
            res2.pipe(file);
            file.on('finish', () => resolve());
          });
          console.log('Success matched:', urlMatch[1]);
        } else {
          console.log('Failed format CSS:', css);
          resolve();
        }
      });
    }).on('error', reject);
  });
}

fetchSubsetTTF('Playfair+Display', 'public/fonts/PlayfairSubset.ttf').then(()=>console.log('done'));
