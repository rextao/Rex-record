const file = require('./file');
const config = require('./config');
const parse = require('./parse');

const { folder } = config;
const { convertor } = parse;
// ???????为何获取不到billOrder值
const { filename } = config;
const billtemp = `./../${folder.billtemp}`;

/**
 * 将读取的csv数据（string类型）转换为table
 * @param files
 * @returns {Array}
 */
function filesToArr(files) {
  const result = [];
  // 根据config.filename.billOrder获取对应实际账单名
  parse.orderBillFiles(files).forEach((item, index) => {
    // 获取每个文件的实际数据，String类型
    const outputstr = file.readFileAsync(billtemp + item, 'gbk');
    // 目前文件顺序与billOrder一致
    const billtype = filename.billOrder[index];
    // 利用不同类型账单对应的convertor对数据进行转换
    const converData = convertor[billtype](outputstr);
    // push到result，是为了返回给Promise.all使用
    result.push(converData);
  });
  return result;
}
file.getFilesAsync(billtemp)
  // files：返回billtemp下全部文件名
  .then((files) => {
    const result = filesToArr(files);
    return Promise.all(result);
  })
  // data数据顺序，为config.filename.billOrder
  .then((data) => {
    console.log(data[1].length);
  })
  .catch(err => console.log(err));
