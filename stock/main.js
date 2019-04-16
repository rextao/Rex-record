const file = require('./../js/file');
const tools = require('./../js/tools');

function printOutResult(obj) {
  let str = '';
  Object.values(obj).forEach((item) => {
    for (let i = 0; i < item.length; i += 1) {
      str += `${item[i].join()}\n`;
    }
    str += '\n';
  });
  file.writeStr(`${new Date().getTime()}.csv`, str);
}

async function readStockFile() {
  const result = {};
  const content = await file.readFileAsync('./广发操盘手-历史成交.csv');
  const arr = tools.stringToTable(content, row => row.split(','), '\r\n');
  // content第一行为title信息
  for (let i = 1; i < arr.length; i += 1) {
    const row = arr[i];
    const date = row[0].replace(/["\t]/g, ''); // 成交日期
    const name = row[2].replace(/"/g, ''); // 证券名称
    const type = row[5].replace(/"/g, ''); // 业务名称
    const num = +row[7].replace(/"/g, ''); // 成交数量
    const price = +row[8].replace(/"/g, '');// 成交价格
    let Allprice = +row[9].replace(/"/g, '');// 成交价格
    let tax = 0;// 交易费用
    if (type !== '申购配号' && type !== '股息入账') {
      if (!result[name]) {
        result[name] = [];
      }
      // 过户费费率
      if (Math.abs(num) / 1000 < 1) {
        tax += 1;
      } else {
        tax += +(Math.abs(num) / 1000).toFixed(3);
      }
      // 券商佣金比率
      const tempTax = +(0.001 * price * Math.abs(num)).toFixed(3);
      if (tempTax < 5) {
        tax += 5;
      } else {
        tax += tempTax;
      }
      // 印花税税率
      if (type === '证券卖出') {
        tax += +(0.001 * price * Math.abs(num)).toFixed(3);
      } else {
        Allprice = -Allprice;// 买入记为负
      }
      const newrow = [date, name, type, num, price, Allprice, -tax];
      result[name].push(newrow);
    }
  }
  printOutResult(result);
}

readStockFile();
