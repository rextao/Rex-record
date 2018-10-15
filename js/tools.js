const moment = require('moment');
// 工具函数
function replaceT(str = '') {
  return str.replace('/\t/g').trim();
}
/**
 * 将字符串转换为table(2维数组)
 * @param data           读取的csv文件，一般为字符串
 * @param rowSplitFunc    rowSplitFunc,传入每一行的元素(str)，以及index;返回值为每行解析的数据
 * @param rowSeparator   多行数据，一般是换行符区分不同行
 */
function stringToTable(data, rowSplitFunc, rowSeparator = '\n') {
  const table = [];
  const temp = data.split(rowSeparator);
  temp.forEach((row, index) => {
    // !避免空行
    if (row !== '') {
      const rowArr = rowSplitFunc(row, index);
      table.push(rowArr);
    }
  });
  return table;
}

// 时间控制函数
const date = {
  /**
   * 比较时间是否一致，moment封装
   * http://momentjs.com/docs/#/query/is-same/
   * @param t1
   * @param t2
   * @param unitoftime  可以判断年月日是否一致
   * @return {boolean}
   */
  isSame(t1, t2, unitoftime) {
    return moment(t1).isSame(t2, unitoftime);
  },

  subtract(t1, num, unitoftime) {
    return moment(t1).subtract(num, unitoftime);
  },
};

exports.replaceT = replaceT;
exports.stringToTable = stringToTable;
exports.date = date;
