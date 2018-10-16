const parse = require('./parse');
const { Compare } = require('./compare');
const { Process } = require('./process');

const { Parser } = parse;

const parseData = Parser.init();
// data为解析了账本后数据,实际的csv数据
parseData.then((data) => {
  // *********获取文件夹名，移动文件****************************
  const process = new Process();
  process.init(data);
  // ******************账单比较*******************
  const compare = new Compare(data);
  // 进行了账单比较，
  compare.init();
  // 将解析后的数据写入billparse目录,process.billname为写入文件的文件名
  Process.writeAlltoBillParse(compare.parseallstr, process.billname);
}).catch(err => console.log(err));
