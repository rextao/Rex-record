const iconv = require('iconv-lite');
const fs = require('fs');

function readFileAsync(path, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(iconv.decode(data, encoding));
      }
    });
  });
}
module.exports.readFileAsync = readFileAsync;
