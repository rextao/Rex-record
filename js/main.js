const parse = require('./parse');
const { Compare } = require('./compare');
const { Process } = require('./process');

const { Parser } = parse;

const parseData = Parser.init();
// data为解析了账本后数据,实际的csv数据
parseData.then((data) => {
  // arr为账单起始与结束时间，[startTime, endTime]
  const timearr = Parser.getBillDate(data);
  // 初始化process，将timearr进行一些内部转换
  const process = new Process(timearr);
  // 移动billtemp下的文件到billoriginal文件夹下
  // process.moveTempToOriginal();
  // 账单比较
  const compare = new Compare(data);
  compare.init();
}).catch(err => console.log(err));
