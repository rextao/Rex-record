const parse = require('./parse');
const { Process } = require('./compare');

const { Parser } = parse;

const parseData = Parser.init();
// data为解析了账本后数据
parseData.then((data) => {
  Parser.getBillDate(data);
  const process = new Process(data);
  process.init();
});
