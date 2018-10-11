const file = require('./file');
const config = require('./config');

const { folder } = config;
const billtemp = `./../${folder.billtemp}`;
file.getFilesAsync(billtemp)
  .then(files => Promise.all([
    file.readFileAsync(billtemp + files[0], 'gbk'),
    file.readFileAsync(billtemp + files[1], 'gbk'),
  ]))
  .then((data) => {
    console.log(data[0].length);
  })
  .catch(err => console.log(err));
