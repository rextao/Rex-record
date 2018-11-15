const { Parser } = require('./parse');
const { Compare } = require('./compare');
const { Process } = require('./process');

const parseData = Parser.init();
// data为解析了账本后数据,实际的csv数据
parseData.then((data) => {
  // ******************账单比较*******************
  const compare = new Compare(data);
  // // 进行了账单比较，
  compare.init();
  // // *********获取文件夹名，移动文件****************************
  const process = new Process();
  process.init(data);
  // 将解析后的全部数据写入billparse目录
  process.writeAlltoBillParse(compare.compareallstr);
  process.writeComparedtoSui(compare.compared);
}).catch(err => console.log(err));
