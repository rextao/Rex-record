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

function indexOfFromArr(arr, str) {
  return arr.filter(item => str.indexOf(item));
}
exports.replaceT = replaceT;
exports.stringToTable = stringToTable;
exports.indexOfFromArr = indexOfFromArr;
