const { Parser } = require('./parse');
const { Compare } = require('./compare');
const { Process } = require('./process');
const { appendFile } = require('./file');

const parseData = Parser.init();
// data为解析了账本后数据,实际的csv数据
parseData.then((data) => {
  // ******************账单比较*******************
  const compare = new Compare(data);
  // // 进行了账单比较，
  compare.init();
  // // *********获取文件夹名，移动文件****************************
  // const process = new Process();
  // process.init(data);
  // // 将解析后的全部数据写入billparse目录
  // process.writeAlltoBillParse(compare.compareallstr);
  // // 将解析成功数据，写入billQuan文件夹下，文件名为process.billname
  // process.writeComparedtoQuan(compare.getCompared());
}).catch(err => console.log(err));
