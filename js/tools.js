// 工具函数
function replaceT(str) {
  return str.replace('/\t/g').trim();
}

/**
 * 将字符串转换为table(2维数组)
 * @param data           读取的csv文件，一般为字符串
 * @param colSeparator    一行数据采用，或空格等作为分隔符，区分不同列
 * @param rowSeparator   多行数据，一般是换行符区分不同行
 */
function stringToTable(data, colSeparator = ',', rowSeparator = '\n') {
  const table = [];
  const temp = data.split(rowSeparator);
  temp.forEach((item) => {
    const row = item.split(colSeparator);
    table.push(row);
  });
  return table;
}
exports.replaceT = replaceT;
exports.stringToTable = stringToTable;
