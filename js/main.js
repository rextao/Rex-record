const parse = require('csv-parse');

const csv = require('./csv');


csv.readFileAsync('./../billtemp/100023557368_205725527657.csv', 'gbk').then((data) => {
  parse(data, (err, output) => {
    console.log(output);
  });
}).catch((err) => {
  console.log(err);
});
