const config = require('./config');
const tools = require('./tools');

const { billOrder, bill } = config.filename;

/**
 * 根据config.filename.billOrder的文件顺序
 * 主要用于，file.getFilesAsync获取某个文件夹下文件名，
 * 按照要求排序，便于后面解析
 * @param files   包含文件名的数组
 * @returns {Array} 排序后的数组
 */
function orderBillFiles(files) {
  const result = [];
  files.forEach((file) => {
    billOrder.forEach((item, index) => {
      if (file.indexOf(bill[item]) !== -1) {
        result[index] = file;
        billOrder.splice(index, 1);
      }
    });
  });
  return result;
}

const convertor = {
  apliy(str) {
    tools.stringToTable(str);
  },
  cgb(str) {
    tools.stringToTable(str, /(?<![0-9]),/g);
  },
};
// 将账单数据选择一部分出来，便于对比
function extractAlipayBill(data) {
  for (let i = 4; i < data.length; i += 1) {
    let row = data[i];
    console.log(row);
  }
}
function extractcgbBill(data = []) {
  const table = [];
  for (let i = 0; i < data.length; i += 1) {
    const row = data[i];
    const newrow = [];
    // tools.replaceT将row[0]中的\t与两边空格去掉
    console.log(row[3]);
    // newrow.push(tools.replaceT(row[0]));// 交易日
    // newrow.push(tools.replaceT(row[3]));// 入账金额
    // newrow.push(tools.replaceT(row[1]));// 交易摘要
    table.push(newrow);
  }
  return table;
}

exports.orderBillFiles = orderBillFiles;
exports.extractAlipayBill = extractAlipayBill;
exports.extractcgbBill = extractcgbBill;
exports.convertor = convertor;
